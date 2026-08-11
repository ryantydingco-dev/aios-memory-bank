"""
CA New-Gyms Weekly — a Monday digest of brand-new boutique gyms / sports centers in your region.

Runs ca_new_gyms.find for a configured region (env REGION, e.g. 'southeast'; or STATE, e.g. 'SC'),
diffs against last week, and Telegrams the FRESH openings (headline + city + date). Free — just Google
News + Telegram, no spend. Refinement/enrich/contact still happen when you run the /ca-new-gyms skill.

Env (set in the launchd plist): REGION or STATE, DAYS (default 14).
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
STATE = ROOT / "data" / "ca_new_gyms_weekly_seen.json"
REGION = os.getenv("REGION", "").strip()
STATE_ARG = os.getenv("STATE", "SC").strip()
DAYS = os.getenv("DAYS", "14")


def _telegram(text):
    tok = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat = (os.getenv("TELEGRAM_GROUP_ID") or os.getenv("TELEGRAM_CHAT_ID") or "").strip()
    if not tok or not chat:
        print("skip telegram: creds missing", file=sys.stderr); return
    try:
        requests.post(f"https://api.telegram.org/bot{tok}/sendMessage",
                      json={"chat_id": chat, "text": text, "parse_mode": "Markdown",
                            "disable_web_page_preview": True}, timeout=15)
    except requests.RequestException as e:
        print(f"telegram error: {e}", file=sys.stderr)


def main():
    args = [PY, "scripts/ca_new_gyms.py", "find", "--days", DAYS]
    scope = REGION or STATE_ARG
    if REGION:
        args += ["--region", REGION]
    else:
        args += ["--state", STATE_ARG]
    r = subprocess.run(args, cwd=str(ROOT), capture_output=True, text=True)
    if r.returncode != 0:
        _telegram(f"⚠️ *CA new-gyms weekly* failed:\n`{(r.stderr or r.stdout)[-300:]}`")
        return 1
    # newest run dir for this scope
    runs = sorted(OUT.glob(f"new-gyms-{scope}-*/new_gyms.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    cands = json.loads(runs[0].read_text()) if runs else []

    seen = set(json.loads(STATE.read_text())) if STATE.exists() else set()
    fresh = [c for c in cands if c["headline"] not in seen]
    fresh.sort(key=lambda c: c.get("opening_date", ""), reverse=True)

    if not fresh:
        msg = f"🏋️ *CA new gyms* ({scope}): no new openings in the news this week ({len(cands)} scanned)."
    else:
        lines = [f"🏋️ *New boutique gyms / sports centers* — {scope} ({len(fresh)} new this week)"]
        for c in fresh[:12]:
            city = c.get("searched_city") or c.get("city", "")
            lines.append(f"• [{city}] {c['opening_date']}  {c['headline'][:70]}")
        lines.append("\nRun `/ca-new-gyms` to refine → enrich → draft (grand-opening mockup).")
        msg = "\n".join(lines)
    _telegram(msg)

    # remember everything seen so next week only shows truly-new
    seen |= {c["headline"] for c in cands}
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(sorted(seen), indent=2))
    print(f"weekly: {len(fresh)} fresh of {len(cands)} scanned ({scope})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
