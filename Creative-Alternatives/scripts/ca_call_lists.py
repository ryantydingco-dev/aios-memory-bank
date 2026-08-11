#!/usr/bin/env python3
"""Build Salesfinity-ready call lists from the reactivation master list.

Input:  outputs/reactivation/<date>/customers_master.csv  (built by ca_reactivation.py)
Output: outputs/coldcalls/<today>/
        list_2_winback.csv          - lapsed / legacy contacts with a phone on file
        list_3_phone_only.csv       - contacts reachable ONLY by phone (no email)
        summary.json

Note: this builds the SECONDARY (win-back) lists for the Salesfinity call motion.
The primary cold dial list comes from the outbound mobile pulls
(pillars/2-customer-acquisition/outbound/swag_*coldcall*.csv) - see
pillars/2-customer-acquisition/salesfinity-call-motion.md.

Phone field in QB export is messy ("Phone:212-... ext. 4 Fax:... Mobile:617-...").
We keep Mobile first, then Phone, and drop Fax. Extensions preserved in ext column.

Usage: python3 scripts/ca_call_lists.py [--source outputs/reactivation/2026-07-09]
"""

import argparse
import csv
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ORG_HINTS = re.compile(
    r"\b(camp|club|school|inc|llc|corp|co\.|company|assoc|academy|center|centre|"
    r"church|temple|ymca|jcc|university|college|group|squash|tennis|athletic|"
    r"foundation|institute|society|league|team|day\s|fitness|gym|salon|studio|"
    r"management|partners|capital|advisors|realty|properties|design|media|"
    r"services|solutions|systems|dept|department|office|the\s)\b",
    re.IGNORECASE,
)

LABEL_RE = re.compile(r"(Phone|Mobile|Fax)\s*:\s*", re.IGNORECASE)
EXT_RE = re.compile(r"ext\.?\s*(\d+)", re.IGNORECASE)


def parse_phone(raw: str):
    """Return (best_number, second_number, ext). Mobile beats Phone; Fax dropped."""
    if not raw or not raw.strip():
        return "", "", ""
    parts = {}
    ext = ""
    # split on labels, keep label -> chunk
    tokens = LABEL_RE.split(raw)
    # tokens like ['', 'Phone', '212-482-1608 ext. 549 ', 'Fax', '212-...', 'Mobile', '617-...']
    for i in range(1, len(tokens) - 1, 2):
        label = tokens[i].lower()
        chunk = tokens[i + 1]
        m = EXT_RE.search(chunk)
        if m and label == "phone":
            ext = m.group(1)
        digits = re.sub(r"[^\d]", "", EXT_RE.sub("", chunk))
        if len(digits) >= 10:
            parts.setdefault(label, digits[-10:])
    if not parts:  # unlabeled raw number
        digits = re.sub(r"[^\d]", "", raw)
        if len(digits) >= 10:
            parts["phone"] = digits[-10:]
    best = parts.get("mobile") or parts.get("phone") or ""
    second = parts.get("phone") if parts.get("mobile") else ""
    fmt = lambda d: f"({d[0:3]}) {d[3:6]}-{d[6:10]}" if d else ""
    return fmt(best), fmt(second or ""), ext


def split_name(name: str):
    """Best-effort person/org split. Returns (first, last, company)."""
    name = name.strip()
    tokens = name.split()
    if len(tokens) == 2 and not ORG_HINTS.search(name) and not any(c.isdigit() for c in name):
        return tokens[0], tokens[1], ""
    return "", "", name


OUT_COLS = [
    "first_name", "last_name", "company", "phone", "phone_2", "ext",
    "email", "last_order_year", "total_spend", "list", "call_note",
]


def make_row(r, list_name, note):
    phone, phone2, ext = parse_phone(r.get("phone", ""))
    first, last, company = split_name(r.get("name", ""))
    return {
        "first_name": first, "last_name": last, "company": company,
        "phone": phone, "phone_2": phone2, "ext": ext,
        "email": r.get("email", ""),
        "last_order_year": r.get("last_order_year", ""),
        "total_spend": r.get("total_spend", ""),
        "list": list_name, "call_note": note,
    }


def spend(r):
    try:
        return float(r.get("total_spend") or 0)
    except ValueError:
        return 0.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default=None, help="reactivation output dir to read from")
    args = ap.parse_args()

    if args.source:
        src = Path(args.source)
    else:
        base = ROOT / "outputs" / "reactivation"
        src = sorted(base.iterdir())[-1]
    master = src / "customers_master.csv"
    rows = list(csv.DictReader(open(master)))

    has_phone = [r for r in rows if parse_phone(r.get("phone", ""))[0]]

    # List 2 — win-back: lapsed (<=2024) or legacy (no QB year) reactivation contacts
    l2 = [
        r for r in has_phone
        if r.get("segment") == "reactivation"
        and r.get("last_order_year") not in ("2025", "2026")
    ]
    l2.sort(key=lambda r: (spend(r), r.get("last_order_year") or ""), reverse=True)

    # List 3 — phone-only: no email on file, phone is the only channel
    l3 = [r for r in has_phone if r.get("segment") == "phone_only"]
    l3.sort(key=spend, reverse=True)

    out_dir = ROOT / "outputs" / "coldcalls" / date.today().isoformat()
    out_dir.mkdir(parents=True, exist_ok=True)

    lists = [
        ("list_2_winback.csv", l2, "winback",
         "Lapsed/legacy customer - reconnect, offer fresh mockup"),
        ("list_3_phone_only.csv", l3, "phone_only",
         "No email on file - phone is the only channel; get email on the call"),
    ]
    summary = {"source": str(src), "total_contacts": len(rows),
               "contacts_with_dialable_phone": len(has_phone)}
    for fname, data, list_name, note in lists:
        with open(out_dir / fname, "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=OUT_COLS)
            w.writeheader()
            for r in data:
                w.writerow(make_row(r, list_name, note))
        summary[list_name] = len(data)

    with open(out_dir / "summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print(json.dumps(summary, indent=2))
    print(f"\nWritten to {out_dir}")


if __name__ == "__main__":
    main()
