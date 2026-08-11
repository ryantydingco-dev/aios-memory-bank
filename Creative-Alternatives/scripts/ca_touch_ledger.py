#!/usr/bin/env python3
"""
CA touch ledger — the suppression gate for multi-motion outbound.

With 4 motions running at once (cold verticals, planners, tradeshows, reactivation) the
failure mode isn't burning TAM — it's double-hitting the same person from two campaigns,
or cold-emailing an existing customer. This is the shared memory that prevents both.

Ledger: data/outbound/contacted.csv (append-only; gitignored dir).
Suppression sources, checked in order:
  1. existing customers  — outputs/reactivation/<latest>/customers_master.csv (QB base)
  2. touch ledger        — anyone contacted within --cooldown days (default 180 = the
                           6-12mo re-approach clock's floor)

Usage:
  # gate a lead list before upload (run INSIDE /ca-outbound, before assemble):
  python scripts/ca_touch_ledger.py check --in outputs/ca-outbound/<run>/leads.json
      → writes <run>/leads_clean.json + <run>/suppressed.json, prints counts. Nonzero
        suppression is NORMAL; a >30% suppression rate is a list-quality smell.

  # record a batch as touched (run right after a campaign upload / hand-send):
  python scripts/ca_touch_ledger.py log --in <leads_clean.json|csv> --campaign "Event Kit Partner" --motion cold

  # seed the ledger from history (SmartLead export CSVs or past run leads.json):
  python scripts/ca_touch_ledger.py seed --in <file.csv|json> --campaign "Swag — Law (US)" --motion cold

  python scripts/ca_touch_ledger.py stats
"""
import argparse
import csv
import glob
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEDGER = os.path.join(HERE, "data", "outbound", "contacted.csv")
LEDGER_COLS = ["email", "name", "company", "campaign", "motion", "first_touched", "last_touched"]


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def norm_email(e):
    return (e or "").strip().lower()


def load_ledger():
    if not os.path.exists(LEDGER):
        return {}
    out = {}
    for r in csv.DictReader(open(LEDGER, newline="")):
        out[norm_email(r["email"])] = r
    return out


def write_ledger(rows):
    os.makedirs(os.path.dirname(LEDGER), exist_ok=True)
    with open(LEDGER, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=LEDGER_COLS)
        w.writeheader()
        w.writerows(rows.values())


def latest_customers_master():
    cands = sorted(glob.glob(os.path.join(HERE, "outputs", "reactivation", "*", "customers_master.csv")))
    return cands[-1] if cands else None


def load_customer_emails():
    path = latest_customers_master()
    if not path:
        return set(), None
    emails = set()
    for r in csv.DictReader(open(path, newline="")):
        e = norm_email(r.get("email"))
        if "@" in e:
            emails.add(e)
    return emails, path


def read_leads(path):
    """Accept leads.json (list of dicts) or a CSV with an email column."""
    if path.endswith(".json"):
        data = json.load(open(path))
        return data if isinstance(data, list) else data.get("leads", [])
    rows = list(csv.DictReader(open(path, newline="")))
    return rows


def lead_email(lead):
    for k in ("email", "lead_email", "Email"):
        if lead.get(k):
            return norm_email(lead[k])
    return ""


def cmd_check(args):
    leads = read_leads(args.infile)
    ledger = load_ledger()
    customers, cm_path = load_customer_emails()
    cutoff = datetime.now(timezone.utc) - timedelta(days=args.cooldown)

    clean, suppressed = [], []
    for l in leads:
        e = lead_email(l)
        if not e:
            l["_suppress_reason"] = "no-email"
            suppressed.append(l)
            continue
        if e in customers:
            l["_suppress_reason"] = "existing-customer"
            suppressed.append(l)
            continue
        hit = ledger.get(e)
        if hit:
            try:
                last = datetime.strptime(hit["last_touched"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            except ValueError:
                last = datetime.now(timezone.utc)
            if last > cutoff:
                l["_suppress_reason"] = f"touched-{hit['last_touched']}-by-{hit['campaign']}"
                suppressed.append(l)
                continue
        clean.append(l)

    base = os.path.dirname(os.path.abspath(args.infile))
    clean_path = os.path.join(base, "leads_clean.json")
    sup_path = os.path.join(base, "suppressed.json")
    json.dump(clean, open(clean_path, "w"), indent=1)
    json.dump(suppressed, open(sup_path, "w"), indent=1)

    rate = len(suppressed) * 100 // max(len(leads), 1)
    print(f"in={len(leads)}  clean={len(clean)}  suppressed={len(suppressed)} ({rate}%)")
    print(f"customer file: {cm_path or 'NOT FOUND — customer check skipped!'}")
    print(f"→ {clean_path}")
    if rate > 30:
        print("⚠ suppression >30% — list overlaps heavily with prior touches; check list source")
    if not cm_path:
        sys.exit(2)  # refuse to bless a list without the customer check


def _upsert(ledger, leads, campaign, motion, date):
    added = updated = 0
    for l in leads:
        e = lead_email(l)
        if not e:
            continue
        name = l.get("name") or " ".join(filter(None, [l.get("first_name"), l.get("last_name")])) or l.get("lead_name", "")
        if e in ledger:
            ledger[e]["last_touched"] = date
            ledger[e]["campaign"] = campaign
            updated += 1
        else:
            ledger[e] = {"email": e, "name": name, "company": l.get("company_name") or l.get("company", ""),
                         "campaign": campaign, "motion": motion, "first_touched": date, "last_touched": date}
            added += 1
    return added, updated


def cmd_log(args):
    leads = read_leads(args.infile)
    ledger = load_ledger()
    added, updated = _upsert(ledger, leads, args.campaign, args.motion, args.date or now_iso())
    write_ledger(ledger)
    print(f"ledger: +{added} new, {updated} re-touched → {LEDGER} ({len(ledger)} total)")


def cmd_stats(args):
    ledger = load_ledger()
    from collections import Counter
    print(f"total contacts ever touched: {len(ledger)}")
    for c, n in Counter(r["campaign"] for r in ledger.values()).most_common(15):
        print(f"  {n:5}  {c}")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check")
    c.add_argument("--in", dest="infile", required=True)
    c.add_argument("--cooldown", type=int, default=180)
    for name in ("log", "seed"):
        s = sub.add_parser(name)
        s.add_argument("--in", dest="infile", required=True)
        s.add_argument("--campaign", required=True)
        s.add_argument("--motion", default="cold", choices=["cold", "warm", "tradeshow", "planners"])
        s.add_argument("--date", help="YYYY-MM-DD (seed with a historical date)")
    sub.add_parser("stats")
    a = ap.parse_args()
    {"check": cmd_check, "log": cmd_log, "seed": cmd_log, "stats": cmd_stats}[a.cmd](a)


if __name__ == "__main__":
    main()
