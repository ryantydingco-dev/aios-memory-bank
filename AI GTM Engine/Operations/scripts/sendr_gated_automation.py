#!/usr/bin/env python3
"""Connection-gated Sendr page automation for the TOP-150 call-first lane.

Pages are generated ONLY for prospects whose LinkedIn status is 'connected' or
'replied' — never for the whole list. Tracks everything in a tracker CSV that
this script owns.

Pipeline stages (li_status): none -> invited -> connected -> dm1_sent -> replied
                             -> nudged -> leak_check_booked

Usage:
  export SENDR_API_KEY="skprod_..."

  # one-time: build the tracker from the TOP-150 list
  python3 sendr_gated_automation.py init

  # mark people as you send invites / they accept (matches name, company, or email)
  python3 sendr_gated_automation.py invited "Sean" "Bill Smith" ...
  python3 sendr_gated_automation.py connected "strike force" sean@mcg.com

  # the money command: generate pages for newly-connected, print their DM 1s
  python3 sendr_gated_automation.py run --template-id 1234

  # when someone needs the page link (they replied, or went quiet after DM 1)
  python3 sendr_gated_automation.py nudge "Sean"

  # pipeline overview / set a status manually
  python3 sendr_gated_automation.py status
  python3 sendr_gated_automation.py set "Sean" --status replied
"""

import argparse
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import date

ENGINE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE_CSV = os.path.join(ENGINE_ROOT, "Lead Engine", "Outputs",
                          "invoice_chase_TOP_150_call_first_2026-06-08.csv")
TRACKER_CSV = os.path.join(ENGINE_ROOT, "Lead Engine", "Outputs", "TOP150_tracker.csv")

API_BASE = "https://api.sendr.io"
STAGES = ["none", "invited", "connected", "dm1_sent", "replied", "nudged", "leak_check_booked"]
PAGE_ELIGIBLE = {"connected", "dm1_sent", "replied", "nudged", "leak_check_booked"}
TRACKER_COLUMNS = ["li_status", "li_invited_at", "li_connected_at",
                   "sendr_page_url", "sendr_page_preview", "last_updated"]

DM1_TEMPLATE = """Hey {first}, appreciate the connect.

Quick one — what eats more of your week: chasing clients for unpaid invoices, or getting the renewals out on time? Asking because I built something that takes both off small firms' plates and I'm trying to figure out which one actually hurts more for folks like you."""

NUDGE_TEMPLATE = """Made you something better than a deck. 90 seconds, your website's in the video: {page_url}
If the number's small, I'll tell you that too."""


def load_tracker():
    if not os.path.exists(TRACKER_CSV):
        sys.exit(f"Tracker not found. Run 'init' first. ({TRACKER_CSV})")
    with open(TRACKER_CSV, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return list(reader), reader.fieldnames


def save_tracker(rows, fieldnames):
    tmp = TRACKER_CSV + ".tmp"
    with open(tmp, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    os.replace(tmp, TRACKER_CSV)


def find_matches(rows, query):
    q = query.strip().lower()
    hits = []
    for r in rows:
        haystacks = [r.get("email", ""), r.get("full_name", ""), r.get("company", ""),
                     r.get("linkedin_url", "")]
        if any(q in h.lower() for h in haystacks if h):
            hits.append(r)
    return hits


def resolve_one(rows, query):
    hits = find_matches(rows, query)
    if len(hits) == 1:
        return hits[0]
    if not hits:
        print(f"  ✗ no match for '{query}'")
    else:
        names = "; ".join(f"{h['full_name']} ({h['company']})" for h in hits[:5])
        print(f"  ✗ '{query}' is ambiguous ({len(hits)} matches): {names} — be more specific")
    return None


def api_generate_page(row, template_id, api_key):
    payload = {
        "templateId": template_id,
        "variablesValues": {"firstname": row.get("first_name", "").strip(),
                            "company": row.get("company", "").strip()},
    }
    website = (row.get("website") or "").strip()
    if website:
        if not website.startswith(("http://", "https://")):
            website = "https://" + website
        payload["videoBackgroundUrl"] = website
        payload["videoBackgroundType"] = "scroll"
    req = urllib.request.Request(
        f"{API_BASE}/api/v1/enrichment/sendr-page",
        data=json.dumps(payload).encode(),
        headers={"X-API-Key": api_key, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.load(resp), None
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}: {e.read().decode(errors='replace')[:200]}"
    except urllib.error.URLError as e:
        return None, str(e)


def cmd_init(args):
    if os.path.exists(TRACKER_CSV) and not args.force:
        sys.exit(f"Tracker already exists: {TRACKER_CSV}\nUse --force to rebuild (loses statuses).")
    with open(SOURCE_CSV, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = list(reader.fieldnames) + [c for c in TRACKER_COLUMNS if c not in reader.fieldnames]
    for r in rows:
        r.setdefault("li_status", "none")
        r["li_status"] = r["li_status"] or "none"
    save_tracker(rows, fieldnames)
    print(f"Tracker built: {len(rows)} prospects -> {TRACKER_CSV}")


def mark(args, status, date_field=None):
    rows, fieldnames = load_tracker()
    today = date.today().isoformat()
    changed = 0
    for query in args.who:
        row = resolve_one(rows, query)
        if not row:
            continue
        row["li_status"] = status
        if date_field:
            row[date_field] = today
        row["last_updated"] = today
        changed += 1
        print(f"  ✓ {row['full_name']} ({row['company']}) -> {status}")
    if changed:
        save_tracker(rows, fieldnames)


def cmd_set(args):
    if args.status not in STAGES:
        sys.exit(f"status must be one of: {', '.join(STAGES)}")
    rows, fieldnames = load_tracker()
    row = resolve_one(rows, args.who)
    if not row:
        sys.exit(1)
    row["li_status"] = args.status
    row["last_updated"] = date.today().isoformat()
    save_tracker(rows, fieldnames)
    print(f"  ✓ {row['full_name']} -> {args.status}")


def cmd_status(args):
    rows, _ = load_tracker()
    counts = {}
    for r in rows:
        counts[r.get("li_status") or "none"] = counts.get(r.get("li_status") or "none", 0) + 1
    print(f"TOP-150 pipeline ({len(rows)} prospects):")
    for stage in STAGES:
        if counts.get(stage):
            print(f"  {stage:18} {counts[stage]}")
    pages = sum(1 for r in rows if r.get("sendr_page_url"))
    pending = [r for r in rows if (r.get("li_status") in PAGE_ELIGIBLE) and not r.get("sendr_page_url")]
    print(f"  {'pages generated':18} {pages}")
    if pending:
        print(f"\n{len(pending)} connected prospect(s) awaiting a page — run:  "
              f"sendr_gated_automation.py run --template-id <ID>")


def cmd_run(args):
    api_key = os.environ.get("SENDR_API_KEY")
    if not api_key and not args.dry_run:
        sys.exit("SENDR_API_KEY not set.")
    rows, fieldnames = load_tracker()
    todo = [r for r in rows if (r.get("li_status") in PAGE_ELIGIBLE) and not r.get("sendr_page_url")]
    if not todo:
        print("Nothing to do — no connected prospects without a page.")
        return
    print(f"{len(todo)} connected prospect(s) need pages.\n")
    dm_blocks = []
    for r in todo:
        label = f"{r['full_name']} ({r['company']})"
        if args.dry_run:
            print(f"  [dry-run] would generate page for {label}")
            continue
        resp, err = api_generate_page(r, args.template_id, api_key)
        if err:
            print(f"  ✗ {label}: {err}")
            continue
        r["sendr_page_url"] = resp.get("pageUrl", "")
        r["sendr_page_preview"] = resp.get("pagePreviewUrl", "")
        r["last_updated"] = date.today().isoformat()
        warnings = resp.get("warnings") or []
        print(f"  ✓ {label} -> {r['sendr_page_url']}" + (f"  ⚠ {'; '.join(warnings)}" if warnings else ""))
        if r["li_status"] == "connected":
            dm_blocks.append((r, DM1_TEMPLATE.format(first=r.get("first_name", "there"))))
        time.sleep(1.5)
    save_tracker(rows, fieldnames)
    if dm_blocks:
        print("\n" + "=" * 60)
        print("DM 1s ready to paste (no link in DM 1 — Ryan Rules).")
        print("Page links are stashed in the tracker for the nudge step.")
        print("=" * 60)
        for r, dm in dm_blocks:
            print(f"\n--- {r['full_name']} · {r['company']} · {r.get('linkedin_url','')}\n{dm}")


def cmd_nudge(args):
    rows, fieldnames = load_tracker()
    row = resolve_one(rows, args.who)
    if not row:
        sys.exit(1)
    if not row.get("sendr_page_url"):
        sys.exit(f"{row['full_name']} has no page yet — run 'run --template-id <ID>' first "
                 f"(status is '{row.get('li_status')}'; pages need connected+).")
    print(f"--- nudge DM for {row['full_name']} · {row.get('linkedin_url','')}\n")
    print(NUDGE_TEMPLATE.format(page_url=row["sendr_page_url"]))
    if not args.no_mark:
        row["li_status"] = "nudged"
        row["last_updated"] = date.today().isoformat()
        save_tracker(rows, fieldnames)


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    sp = sub.add_parser("init", help="build the tracker from the TOP-150 CSV")
    sp.add_argument("--force", action="store_true")
    sp.set_defaults(fn=cmd_init)

    for name, status, datefield in [("invited", "invited", "li_invited_at"),
                                    ("connected", "connected", "li_connected_at")]:
        sp = sub.add_parser(name, help=f"mark prospect(s) as {status}")
        sp.add_argument("who", nargs="+", help="name / company / email fragments")
        sp.set_defaults(fn=lambda a, s=status, d=datefield: mark(a, s, d))

    sp = sub.add_parser("set", help="set any status manually")
    sp.add_argument("who")
    sp.add_argument("--status", required=True, choices=STAGES)
    sp.set_defaults(fn=cmd_set)

    sp = sub.add_parser("status", help="pipeline counts")
    sp.set_defaults(fn=cmd_status)

    sp = sub.add_parser("run", help="generate pages for connected prospects + print DM 1s")
    sp.add_argument("--template-id", type=int, required=True)
    sp.add_argument("--dry-run", action="store_true")
    sp.set_defaults(fn=cmd_run)

    sp = sub.add_parser("nudge", help="print the page-link DM for one prospect")
    sp.add_argument("who")
    sp.add_argument("--no-mark", action="store_true", help="don't advance status to 'nudged'")
    sp.set_defaults(fn=cmd_nudge)

    args = p.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
