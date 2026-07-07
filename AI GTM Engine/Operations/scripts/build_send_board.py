#!/usr/bin/env python3
"""Build a copy-paste SEND BOARD for batch one from the battlecards CSV.

Deterministic (no LLM). Reads Oloxa_Battlecards_<date>.csv, selects the
SEND-action leads (same gate-then-rank classifier as the brief/facts scripts),
orders them per the launch recommendation (CLOSING first = most re-verifiable,
US-leaning), groups by owner, and writes a dated markdown board with the exact
per-channel copy + a one-line logging command per lead.

Also PRE-SEEDS the outcome tracker with one queued row per SEND lead (sent blank)
so logging is a single command later and the weekly loop can see the queue.

Usage:
  python3 build_send_board.py --outputs "<Outputs dir>" [--date YYYY-MM-DD] [--include REVIEW]
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
SIGNAL_ORDER = {"CLOSING": 0, "VOLUME": 1, "HIRING": 2, "PAIN": 3}


def u(s):
    return html.unescape(s) if isinstance(s, str) else (s or "")


def action_of(r):
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


def latest_cards(outputs, date):
    if date:
        p = os.path.join(outputs, f"Oloxa_Battlecards_{date}.csv")
        if os.path.exists(p):
            return p
    c = sorted(glob.glob(os.path.join(outputs, "Oloxa_Battlecards_*.csv")))
    return c[-1] if c else None


TRACKER_FIELDS = ["date_sent", "lead_id", "name", "company", "market", "segment",
                  "signal", "channel", "opener_variant", "sent", "replied",
                  "reply_sentiment", "objection_tag", "meeting_booked",
                  "next_action", "notes"]


def lead_id(r):
    return (r.get("email") or "").strip().lower() or \
        f"{(r.get('company') or '').strip().lower()}::{(r.get('name') or '').strip().lower()}"


def seed_tracker(outputs, leads):
    path = os.path.join(outputs, "Oloxa_Outcome_Tracker.csv")
    existing = set()
    if os.path.exists(path):
        with open(path, newline="", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                existing.add((row.get("lead_id", ""), row.get("channel", "")))
    new_rows = []
    for r in leads:
        lid = lead_id(r)
        ch = "LinkedIn"  # first-touch channel for the board; logger can add others
        if (lid, ch) in existing:
            continue
        new_rows.append({
            "date_sent": "", "lead_id": lid, "name": u(r.get("name")),
            "company": u(r.get("company")), "market": r.get("market", ""),
            "segment": r.get("market", ""), "signal": r.get("signal", ""),
            "channel": ch, "opener_variant": "", "sent": "", "replied": "",
            "reply_sentiment": "", "objection_tag": "", "meeting_booked": "",
            "next_action": "QUEUED", "notes": "seeded by build_send_board",
        })
    write_header = not os.path.exists(path) or os.path.getsize(path) == 0
    with open(path, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=TRACKER_FIELDS)
        if write_header:
            w.writeheader()
        for row in new_rows:
            w.writerow(row)
    return len(new_rows), path


def lead_block(r):
    out = []
    name, co = u(r.get("name")), u(r.get("company"))
    out.append(f"### ⬜ {name} — {co} · {r.get('market')} · {r.get('signal')}")
    out.append(f"`{u(r.get('email'))}` · [LinkedIn]({u(r.get('linkedin_url'))}) · owner: **{u(r.get('assigned_to'))}**")
    out.append(f"_Why now:_ {u(r.get('why_now'))}\n")
    seq = u(r.get("recommended_sequence"))
    if seq:
        out.append(f"**Sequence:** {seq}\n")
    out.append(f"**1. LinkedIn connect note**\n```\n{u(r.get('linkedin_connect_note'))}\n```")
    out.append(f"**2. LinkedIn DM** (after accept)\n```\n{u(r.get('linkedin_dm'))}\n```")
    out.append(f"**3. Email** — subject: *{u(r.get('email_subject'))}*\n```\n{u(r.get('email_body'))}\n```")
    out.append(f"**4. Cold call opener**\n```\n{u(r.get('cold_call_opener'))}\n```")
    out.append(f"**Voicemail**\n```\n{u(r.get('voicemail'))}\n```")
    out.append(f"**SMS** (warm/owner-direct only)\n```\n{u(r.get('sms'))}\n```")
    out.append(f"_Top objection:_ {u(r.get('top_objection'))} → {u(r.get('objection_response'))}\n")
    out.append("**Log it:**")
    out.append(f"```bash\npython3 \"$SC/log_outcome.py\" --id \"{lead_id(r)}\" --sent --channel LinkedIn\n"
               f"# when they reply:  --replied --sentiment positive|neutral|negative [--objection TAG]\n"
               f"# when booked:      --meeting\n```")
    out.append("\n---\n")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--outputs", required=True)
    ap.add_argument("--date", default=None)
    ap.add_argument("--include", default="SEND", choices=["SEND", "REVIEW", "ALL"],
                    help="which action tier to include (default SEND)")
    args = ap.parse_args()

    src = latest_cards(args.outputs, args.date)
    if not src:
        print("No battlecards CSV found."); return
    with open(src, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    tiers = {"SEND": ["SEND"], "REVIEW": ["SEND", "REVIEW"], "ALL": ["SEND", "REVIEW", "HOLD"]}[args.include]
    leads = [r for r in rows if action_of(r) in tiers]

    def sort_key(r):
        try:
            rank = int(r.get("rank") or 999)
        except ValueError:
            rank = 999
        # CLOSING first, US before UK (per launch order), then rank
        return (SIGNAL_ORDER.get(r.get("signal"), 9), 0 if r.get("market") == "US" else 1, rank)

    leads.sort(key=sort_key)

    n_seeded, tracker = seed_tracker(args.outputs, leads)

    date = args.date or "latest"
    L = [f"# Batch One — Send Board ({date})\n"]
    L.append(f"> {len(leads)} {args.include}-tier leads, deterministically selected from `{os.path.basename(src)}`. "
             "Copy → send → log. **Verify Smartlead sender/domain before any email send** (open Oloxa loop). "
             "LinkedIn connect/DM are manual (no API). Drafts are pre-written; you are the human in the loop.\n")
    L.append("**Launch order:** CLOSING first (most re-verifiable), US-leaning, then the rest — "
             "so the first replies arrive fast and become real outcome data.\n")
    L.append(f"Logging shortcut — set once per shell:\n```bash\nexport SC=\"{os.path.dirname(os.path.abspath(__file__))}\"\n```\n")
    L.append(f"Tracker: `{os.path.basename(tracker)}` (pre-seeded {n_seeded} queued rows). "
             "Each lead below has its exact log command.\n\n---\n")

    for who in ("Ryan", "Sway"):
        grp = [r for r in leads if (r.get("assigned_to") or "").strip().lower() == who.lower()]
        if not grp:
            continue
        L.append(f"## {who} — {len(grp)} to send\n")
        for r in grp:
            L.append(lead_block(r))

    other = [r for r in leads if (r.get("assigned_to") or "").strip().lower() not in ("ryan", "sway")]
    if other:
        L.append(f"## Unassigned — {len(other)}\n")
        for r in other:
            L.append(lead_block(r))

    out_path = os.path.join(args.outputs, f"Batch One Send Board - {date}.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(L))
    print(f"Wrote {out_path}\n  {len(leads)} leads ({args.include} tier) | seeded {n_seeded} tracker rows")


if __name__ == "__main__":
    main()
