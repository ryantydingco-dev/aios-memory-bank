"""
CA Trade-Show Contacts — the last mile: attach the event-marketing person + email to exhibitors.

AI Ark's reliable path is the MCP (its headless REST returns Unauthorized/404, bulk export needs a
webhook), so the AI Ark calls are made by Claude IN-SESSION via the ai-ark MCP — this helper only does
the deterministic parts so Claude's job is just the two MCP calls per exhibitor:

  targets  read leads.json → the credit-guarded worklist of exhibitors that still need a contact
           (top-band, no published email), deduped by domain, capped. Prints the exact AI Ark filters.
  merge    take the {domain,name,title,email} rows Claude gathered → write them back into leads.json.

Claude's in-session loop (documented in the ca-tradeshows skill):
  for each target domain:
    mcp__ai-ark__people_search(companyDomain, title="event marketing"|"field marketing", department="marketing")
      → pick the best-fit person (event/field marketing > trade show coord > brand > marketing mgr)   [FREE]
    mcp__ai-ark__email_finder(companyDomain, title=<that title>) → poll email_finder_results → email   [COSTS credits]
  then: ca_tradeshow_contacts.py merge --show <key> --contacts <collected.json>

Credit discipline: only top-band exhibitors, only email_finder on the ONE chosen contact per firm.
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "outputs" / "ca-outbound"

# The booth-swag buyer, best-fit first — Claude uses this to pick among people_search results.
TITLE_PRIORITY = [
    "event marketing", "field marketing", "trade show", "tradeshow", "events manager",
    "brand marketing", "brand manager", "demand gen", "marketing operations",
    "marketing manager", "marketing director", "head of marketing", "marketing",
]

def _read(p): return json.loads(Path(p).read_text())
def _norm(s): return re.sub(r"\s+", " ", (s or "").strip().lower())


def cmd_targets(args):
    d = OUT / f"tradeshow-{args.show}"
    leads = _read(d / "leads.json")
    hot = {b.strip() for b in args.bands.split(",")} if args.bands else None
    seen, targets = set(), []
    for l in leads:
        dom = (l.get("company_domain") or "").lower()
        if not dom or dom in seen:
            continue
        if hot and l.get("band") not in hot:
            continue
        if l.get("email") and l.get("email_status") == "published":
            continue  # already have a real email from enrich — no AI Ark needed
        seen.add(dom)
        targets.append({"company": l.get("company_name", ""), "domain": dom,
                        "band": l.get("band", ""), "buy_now_score": l.get("buy_now_score", 0),
                        "show": l.get("show", "")})
    targets.sort(key=lambda t: -t.get("buy_now_score", 0))
    if args.max:
        targets = targets[: args.max]
    (d / "contact_targets.json").write_text(json.dumps(targets, indent=2))
    print(f"targets: {len(targets)} exhibitors need a contact (top-band, no published email) → {d/'contact_targets.json'}")
    print("\nFor EACH target, run in this session (credit-guarded to the chosen contact only):")
    print("  1. mcp__ai-ark__people_search(companyDomain=<domain>, department='marketing', "
          "title='event marketing')  → FREE; pick best-fit by title priority:")
    print("     " + " > ".join(TITLE_PRIORITY[:6]) + " > …")
    print("  2. mcp__ai-ark__email_finder(companyDomain=<domain>, title=<chosen title>) → trackId; "
          "poll email_finder_results → email  [COSTS credits]")
    print("  3. collect rows [{domain, first_name, last_name, title, email}] → ca_tradeshow_contacts.py "
          f"merge --show {args.show} --contacts <file>")
    return 0


def cmd_merge(args):
    d = OUT / f"tradeshow-{args.show}"
    leads = _read(d / "leads.json")
    contacts = _read(args.contacts)
    by_dom = {}
    for c in contacts:
        dom = (c.get("domain") or "").lower()
        if dom and c.get("email"):
            by_dom[dom] = c
    filled = 0
    for l in leads:
        dom = (l.get("company_domain") or "").lower()
        c = by_dom.get(dom)
        if not c:
            continue
        # don't overwrite a real published email from enrich
        if l.get("email") and l.get("email_status") == "published":
            continue
        l["first_name"] = c.get("first_name", l.get("first_name", ""))
        l["last_name"] = c.get("last_name", l.get("last_name", ""))
        l["title"] = c.get("title", l.get("title", ""))
        l["email"] = c["email"]
        l["email_status"] = c.get("email_status", "ai-ark")
        filled += 1
    (d / "leads.json").write_text(json.dumps(leads, indent=2))
    ready = sum(1 for l in leads if l.get("email"))
    print(f"merge: wrote {filled} AI Ark contacts → {ready}/{len(leads)} leads now have an email → {d/'leads.json'}")
    print(f"→ feed to /ca-outbound (themed mockup opener). Verify emails via SmartLead's built-in verifier before send.")
    return 0


def main():
    p = argparse.ArgumentParser(description="Trade-show last mile: attach event-marketing contact + email (AI Ark MCP, in-session).")
    sub = p.add_subparsers(dest="cmd", required=True)
    t = sub.add_parser("targets"); t.add_argument("--show", required=True)
    t.add_argument("--bands", default="act-48h,priority,rush"); t.add_argument("--max", type=int, default=50)
    t.set_defaults(func=cmd_targets)
    m = sub.add_parser("merge"); m.add_argument("--show", required=True); m.add_argument("--contacts", required=True)
    m.set_defaults(func=cmd_merge)
    args = p.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
