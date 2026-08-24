#!/usr/bin/env python3
"""Compose the "Oloxa GTM - Today" morning brief.

Prefers a same-day battlecards CSV (Oloxa_Battlecards_<date>.csv) for an enriched,
triaged action list; otherwise falls back to the day's batch, the newest dated batch,
or the Initial batch. Prints a Telegram-ready plain-text brief to stdout.
Drafts only - it summarizes; it does not send anything.

Usage:
  python3 oloxa_daily_brief.py --date 2026-05-31 --outputs "<Outputs dir>" [--replies N]
"""
import argparse
import csv
import glob
import html
import os

REFRAME_KW = [
    "direct lender", "not a broker", "balance-sheet", "single-lender",
    "single-source", "single source", "lender-side", "residential retail",
    "off-profile", "does not apply",
]
EMOJI = {"SEND": "✅", "REVIEW": "⚠️", "HOLD": "⏸️", "": "•"}


def unesc(s):
    return html.unescape(s) if isinstance(s, str) else (s or "")


def card_action(r):
    conf = (r.get("confidence") or "").upper()
    verified = (r.get("signal_verified") or "").strip().lower() in ("true", "1", "yes", "y")
    rec = (r.get("signal_recency") or "").lower()
    flags = (r.get("red_flags") or "").lower()
    if conf == "LOW" or not verified:
        return "HOLD"
    if any(k in flags for k in REFRAME_KW):
        return "REVIEW"
    if conf == "MEDIUM" and ("unverif" in rec or rec == "older"):
        return "REVIEW"
    return "SEND"


def pick_source(outputs, date):
    cards = os.path.join(outputs, f"Oloxa_Battlecards_{date}.csv")
    if os.path.exists(cards):
        return cards, "cards"
    batch = os.path.join(outputs, f"Oloxa_Daily_Top_20_{date}.csv")
    if os.path.exists(batch) and os.path.getsize(batch) > 80:
        return batch, "batch"
    dated = [p for p in sorted(glob.glob(os.path.join(outputs, "Oloxa_Daily_Top_20_*.csv")))
             if os.path.getsize(p) > 80]
    if dated:
        return dated[-1], "batch"
    initial = os.path.join(outputs, "Oloxa_Daily_Top_20_Initial.csv")
    if os.path.exists(initial):
        return initial, "batch"
    return None, None


def rows_from(path, kind):
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    leads = []
    for r in rows:
        try:
            rank = int(r.get("rank") or 999)
        except ValueError:
            rank = 999
        if kind == "cards":
            leads.append({
                "rank": rank,
                "who": (r.get("assigned_to") or "").strip() or "Other",
                "name": unesc(r.get("name") or "").strip(),
                "company": unesc(r.get("company") or "").strip(),
                "signal": (r.get("signal") or "").strip(),
                "action": card_action(r),
            })
        else:
            name = f"{r.get('first_name','').strip()} {r.get('last_name','').strip()}".strip()
            leads.append({
                "rank": rank,
                "who": (r.get("assigned_to") or "").strip() or "Other",
                "name": name,
                "company": (r.get("company_name") or "").strip(),
                "signal": (r.get("primary_signal_refined") or "").strip(),
                "action": "",
            })
    leads.sort(key=lambda x: x["rank"])
    return leads


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True)
    ap.add_argument("--outputs", required=True)
    ap.add_argument("--replies", default="")
    args = ap.parse_args()

    src, kind = pick_source(args.outputs, args.date)
    lines = [f"Oloxa GTM - {args.date}"]
    if not src:
        lines.append("No lead batch found in Outputs. Run generate_oloxa_daily_batch.py "
                     "or restore the HOT/WARM exports.")
        print("\n".join(lines))
        return

    leads = rows_from(src, kind)
    enriched = kind == "cards"

    if enriched:
        c = {"SEND": 0, "REVIEW": 0, "HOLD": 0}
        for l in leads:
            c[l["action"]] = c.get(l["action"], 0) + 1
        lines.append(f"{EMOJI['SEND']} {c['SEND']} send  {EMOJI['REVIEW']} {c['REVIEW']} review  "
                     f"{EMOJI['HOLD']} {c['HOLD']} hold")
    else:
        lines.append(f"{len(leads)} leads queued (basic list - run battlecard workflow to enrich)")

    reps = args.replies.strip()
    lines.append(f"Hot replies: {reps if reps else '- (check Smartlead/HubSpot)'}")
    lines.append("")

    for who in ("Ryan", "Sway"):
        grp = [l for l in leads if l["who"].lower() == who.lower()]
        if not grp:
            continue
        lines.append(f"{who} ({len(grp)}):")
        for l in grp:
            tag = f" {EMOJI[l['action']]}" if l["action"] else ""
            co = f" - {l['company']}" if l["company"] else ""
            sg = f" · {l['signal']}" if l["signal"] else ""
            lines.append(f"• {l['name'] or '(no name)'}{co}{sg}{tag}")
        lines.append("")

    other = [l for l in leads if l["who"].lower() not in ("ryan", "sway")]
    if other:
        lines.append(f"Other ({len(other)}):")
        for l in other:
            lines.append(f"• {l['name']} - {l['company']} · {l['signal']}")
        lines.append("")

    lines.append("Content: 1 post (pillar rotation)  |  Comments: 5-10 ICP targets")
    if enriched:
        lines.append(f"Battlecards: Daily Outbound Battlecards - {args.date}.md  "
                     f"(drafts only - review before sending)")
    else:
        lines.append(f"Source: {os.path.basename(src)}  (drafts only - review before sending)")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
