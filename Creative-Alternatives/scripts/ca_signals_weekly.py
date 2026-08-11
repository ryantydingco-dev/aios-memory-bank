"""
CA Signals Weekly — the "routes itself" heartbeat.

Once a week: re-scan buying signals on the newest lead list, re-score, run segmentation in DRY-RUN
(updates the spreadsheet, sends NOTHING to SmartLead), then Telegram the hot list with a
week-over-week diff so Monday morning shows exactly which firms JUST went hot.

Deliberately dry-run: detection + ranking + the spreadsheet update happen on autopilot, but the actual
send stays a human decision. To route for real, run ca_smartlead_segment.py with --apply yourself, or
flip AUTO_APPLY=1 in the launchd plist once past the review gate.

Driven by the newest outputs/ca-outbound/*/leads.json (the latest /ca-leads run). Env: SEGMENT (law|financial).
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
SEGMENT = os.getenv("SEGMENT", "law")
HOT_STATE = ROOT / "data" / "ca_signals_weekly_lasthot.json"   # emails/firms that were hot last week


def _newest_leads():
    cands = sorted(OUT.glob("*/leads.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    return cands[0] if cands else None

def _telegram(text):
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat = (os.getenv("TELEGRAM_GROUP_ID") or os.getenv("TELEGRAM_CHAT_ID") or "").strip()
    if not token or not chat:
        print("skip telegram: creds missing", file=sys.stderr); return
    try:
        requests.post(f"https://api.telegram.org/bot{token}/sendMessage",
                      json={"chat_id": chat, "text": text, "parse_mode": "Markdown",
                            "disable_web_page_preview": True}, timeout=15)
    except requests.RequestException as e:
        print(f"telegram error: {e}", file=sys.stderr)

def _run(args):
    print("+", " ".join(args))
    return subprocess.run(args, cwd=str(ROOT), capture_output=True, text=True)


def main():
    leads = _newest_leads()
    if not leads:
        _telegram("🧭 *CA weekly signals*: no lead list found yet. Run /ca-leads first.")
        return 0
    run_dir = leads.parent
    ranked = run_dir / "ranked.json"

    # 1) re-scan + re-score (free sources)
    r = _run([PY, "scripts/ca_signal_enrich.py", "run", "--in", str(leads),
              "--out", str(ranked), "--segment", SEGMENT])
    if r.returncode != 0:
        _telegram(f"⚠️ *CA weekly signals* scan failed:\n`{(r.stderr or r.stdout)[-300:]}`")
        return 1

    # 2) segmentation in DRY-RUN (updates spreadsheet, sends nothing) unless AUTO_APPLY=1
    seg_args = [PY, "scripts/ca_smartlead_segment.py", "--ranked", str(ranked),
                "--leads", str(leads), "--segment", SEGMENT]
    if os.getenv("AUTO_APPLY") == "1":
        seg_args.append("--apply")
    _run(seg_args)

    # 3) diff vs last week + Telegram the hot list
    try:
        rows = json.loads(ranked.read_text())
    except (json.JSONDecodeError, FileNotFoundError):
        rows = []
    hot = [r for r in rows if r.get("band") in ("act-48h", "priority")]
    hot.sort(key=lambda r: -r.get("buy_now_score", 0))
    hot_keys = {r["firm"] for r in hot}
    prev = set(json.loads(HOT_STATE.read_text())) if HOT_STATE.exists() else set()
    newly_hot = [r for r in hot if r["firm"] not in prev]

    if not hot:
        msg = f"🧭 *CA weekly signals* ({SEGMENT})\nNo firms in the hot bands this week. {len(rows)} scored. Spreadsheet updated."
    else:
        lines = [f"🔥 *CA weekly signals* ({SEGMENT}) — {len(hot)} hot firm(s)"]
        if newly_hot:
            lines.append(f"\n*🆕 JUST went hot ({len(newly_hot)}):*")
            for r in newly_hot[:8]:
                lines.append(f"• *{r['firm'][:38]}* — {r['top_signal']} ({r['buy_now_score']}) — {(r.get('top_signal_detail') or '')[:60]}")
        lines.append("\n*Top hot:*")
        for r in hot[:8]:
            flag = "🆕" if r["firm"] in {n['firm'] for n in newly_hot} else "•"
            lines.append(f"{flag} {r['buy_now_score']:>5} [{r['band']}] {r['firm'][:34]} — {r['top_signal']}")
        applied = os.getenv("AUTO_APPLY") == "1"
        lines.append(f"\n📊 Spreadsheet: `outputs/ca-outbound/signal-tracker.csv`")
        lines.append("✅ Auto-routed into SmartLead." if applied
                     else "▶️ Dry-run only. To route: `ca_smartlead_segment.py --apply`")
        msg = "\n".join(lines)
    _telegram(msg)

    HOT_STATE.parent.mkdir(parents=True, exist_ok=True)
    HOT_STATE.write_text(json.dumps(sorted(hot_keys), indent=2))
    print(f"weekly done: {len(hot)} hot, {len(newly_hot)} newly hot")
    return 0


if __name__ == "__main__":
    sys.exit(main())
