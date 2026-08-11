"""
CA Openings Weekly — one Monday digest across ALL trigger scouts (new openings + sponsorships).

Runs ca_openings.find for each configured vertical + ca_sponsors.find, over a region/state, diffs vs
last week, and Telegrams a combined digest of the FRESH triggers. Free (Google News + Telegram).
Supersedes the gym-only weekly. Refine/enrich/contact still happen in-session via /ca-openings.

Env (plist): VERTICALS (csv, default all), SPONSORS (1/0), REGION or STATE, DAYS.
"""

import json
import os
import subprocess
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")
import requests

PY = str(ROOT / ".venv" / "bin" / "python")
OUT = ROOT / "outputs" / "ca-outbound"
STATE = ROOT / "data" / "ca_openings_weekly_seen.json"
VERTICALS = [v.strip() for v in os.getenv("VERTICALS", "gyms,restaurants,breweries,medical,retail,salon_spa").split(",") if v.strip()]
DO_SPONSORS = os.getenv("SPONSORS", "1") == "1"
REGION = os.getenv("REGION", "").strip()
STATE_ARG = os.getenv("STATE", "SC").strip()
DAYS = os.getenv("DAYS", "14")


def _telegram(text):
    tok = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat = (os.getenv("TELEGRAM_GROUP_ID") or os.getenv("TELEGRAM_CHAT_ID") or "").strip()
    if not tok or not chat:
        print("skip telegram: creds missing", file=sys.stderr); return
    for i in range(0, len(text), 3800):  # Telegram 4096-char limit
        try:
            requests.post(f"https://api.telegram.org/bot{tok}/sendMessage",
                          json={"chat_id": chat, "text": text[i:i+3800], "parse_mode": "Markdown",
                                "disable_web_page_preview": True}, timeout=15)
        except requests.RequestException as e:
            print(f"telegram error: {e}", file=sys.stderr); return

def _scope_args():
    return (["--region", REGION] if REGION else ["--state", STATE_ARG])

def _run(script, extra):
    r = subprocess.run([PY, f"scripts/{script}", "find", "--days", DAYS] + _scope_args() + extra,
                       cwd=str(ROOT), capture_output=True, text=True)
    return r.returncode == 0

def _newest(prefix):
    runs = sorted(OUT.glob(f"{prefix}-*/openings.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    return json.loads(runs[0].read_text()) if runs else []


def main():
    scope = REGION or STATE_ARG
    seen = set(json.loads(STATE.read_text())) if STATE.exists() else set()
    sections, all_headlines, total_fresh = [], set(), 0

    jobs = [(v, "ca_openings.py", ["--vertical", v], f"openings-{v}-{scope}") for v in VERTICALS]
    if DO_SPONSORS:
        jobs.append(("sponsors", "ca_sponsors.py", [], f"sponsors-{scope}"))

    for label, script, extra, prefix in jobs:
        ok = _run(script, extra)
        cands = _newest(prefix) if ok else []
        all_headlines |= {c["headline"] for c in cands}
        fresh = [c for c in cands if c["headline"] not in seen]
        fresh.sort(key=lambda c: c.get("opening_date", ""), reverse=True)
        total_fresh += len(fresh)
        if fresh:
            lines = [f"*{label}* ({len(fresh)} new):"]
            for c in fresh[:6]:
                city = c.get("searched_city") or c.get("city", "")
                lines.append(f"  • [{city}] {c['opening_date']}  {c['headline'][:60]}")
            sections.append("\n".join(lines))

    header = f"🎯 *CA trigger digest* — {scope} — {total_fresh} new leads this week"
    msg = header + ("\n\n" + "\n\n".join(sections) if sections else "\n(nothing new in the news this week)") \
        + "\n\nRun `/ca-openings` (or `/ca-new-gyms`) to refine → enrich → draft."
    _telegram(msg)

    seen |= all_headlines
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(sorted(seen), indent=2))
    print(f"weekly: {total_fresh} fresh across {len(jobs)} scouts ({scope})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
