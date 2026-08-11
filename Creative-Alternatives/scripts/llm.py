"""Tiny OpenRouter client for CA workspace scripts.

Why this exists: the workspace has $50 of OpenRouter credit to spend on real
leverage (quoting engine first). Every CA script that needs an LLM should go
through here so key handling, model choice, cost tracking, and failure behavior
stay consistent.

Design:
- Key comes from the project .env (OPENROUTER_API_KEY) or the environment.
  Never hardcoded, never printed.
- Default model is cheap-but-capable; callers can override per call.
- Every call appends a usage line to outputs/llm-usage.log so the $50 burn is
  visible and auditable (model, tokens, estimated cost, caller label).
- Fails soft: llm_complete() returns None on any error so the calling tool
  degrades to its deterministic path instead of crashing. The quoting engine
  must still produce a draft (from anchors) if the LLM layer is down.

Usage:
    from llm import llm_complete
    text = llm_complete("Summarize these comps: ...", label="quote-comps")
"""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
USAGE_LOG = ROOT / "outputs" / "llm-usage.log"

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
# Cheap, good at structured reasoning over small tables. ~$0.10/M in, $0.40/M out.
DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct"

# Approx $/token for the default model (used only for the burn log).
COST_PER_TOKEN = {"prompt": 0.10 / 1e6, "completion": 0.40 / 1e6}


def _load_key():
    key = os.environ.get("OPENROUTER_API_KEY")
    if key:
        return key
    env_path = ROOT / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line.startswith("OPENROUTER_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def _log_usage(label, model, usage, elapsed_s):
    try:
        USAGE_LOG.parent.mkdir(parents=True, exist_ok=True)
        pt = usage.get("prompt_tokens", 0)
        ct = usage.get("completion_tokens", 0)
        est = pt * COST_PER_TOKEN["prompt"] + ct * COST_PER_TOKEN["completion"]
        line = {
            "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "label": label,
            "model": model,
            "prompt_tokens": pt,
            "completion_tokens": ct,
            "est_cost_usd": round(est, 6),
            "elapsed_s": round(elapsed_s, 2),
        }
        with open(USAGE_LOG, "a") as f:
            f.write(json.dumps(line) + "\n")
    except Exception:
        pass  # logging must never break the tool


def llm_complete(prompt, label="ca-script", model=DEFAULT_MODEL, system=None,
                 temperature=0.2, max_tokens=1200, timeout=60):
    """One-shot completion. Returns the assistant text, or None on failure."""
    key = _load_key()
    if not key:
        print("[llm] no OPENROUTER_API_KEY found — skipping LLM step", file=sys.stderr)
        return None

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    t0 = time.time()
    try:
        r = requests.post(
            OPENROUTER_URL,
            headers={"Authorization": f"Bearer {key}",
                     "Content-Type": "application/json"},
            json={"model": model, "messages": messages,
                  "temperature": temperature, "max_tokens": max_tokens},
            timeout=timeout,
        )
        elapsed = time.time() - t0
        if r.status_code != 200:
            print(f"[llm] HTTP {r.status_code}: {r.text[:300]}", file=sys.stderr)
            return None
        data = r.json()
        _log_usage(label, model, data.get("usage", {}), elapsed)
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"[llm] call failed: {e}", file=sys.stderr)
        return None


if __name__ == "__main__":
    # smoke test: .venv/bin/python scripts/llm.py
    out = llm_complete("Reply with exactly: CA quoting engine LLM layer online.",
                       label="smoke-test", max_tokens=20)
    print(out or "(no response — check key/network)")
