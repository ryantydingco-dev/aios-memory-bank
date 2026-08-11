"""
CA Outbound Prep — deterministic steps of the /ca-outbound pipeline.

The judgment steps (AI Ark lead pull, per-lead personalization) run inside Claude Code
via the ca-outbound skill (MCP + Task sub-agents). This script handles the mechanical,
testable parts so they're reproducible and cheap:

    crawl     enrich each lead with a company_description scraped from its website
    assemble  write an upload.ts-compatible leads.csv from personalized JSON
    variants  render a SmartLead variants.yaml from the cold-copy template + ICP config
    notify    send a Telegram message (review ping)

It never sends email and never activates a campaign. The actual SmartLead draft upload is
done by the repo's proven uploader (npx tsx .../smartlead-campaign-upload-public/scripts/upload.ts),
which is DRAFT-only by design. Ryan reviews in the SmartLead UI and clicks Start.

Usage:
    python scripts/ca_outbound_prep.py crawl    --in leads.json --out enriched.json
    python scripts/ca_outbound_prep.py assemble --in personalized.json --out campaigns/<slug>/leads.csv
    python scripts/ca_outbound_prep.py variants  --icp financial --out campaigns/<slug>/variants.yaml
    python scripts/ca_outbound_prep.py notify    --text "Draft ready for review"
    python scripts/ca_outbound_prep.py crawl --dry-run     # crawls creativealternatives.com only, no inputs needed
"""

import argparse
import csv
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

try:
    import requests
except ImportError:
    raise ImportError("Missing 'requests' — run: .venv/bin/pip install requests python-dotenv pyyaml")

# ---- upload.ts contract: these are the ONLY columns its uploader accepts ----
LEADS_CSV_COLS = [
    "email", "first_name", "last_name", "company_name",
    "company_domain", "title", "linkedin_url",
    "situation_line", "value_line", "cta_line",
]

CRAWL_PAGES = ["/", "/about", "/about-us", "/services", "/practice-areas",
               "/who-we-serve", "/team", "/careers", "/news"]
CRAWL_CAP = 4000
UA = "Mozilla/5.0 (compatible; CreativeAlternatives-Research/1.0)"


def _strip_html(html: str) -> str:
    for tag in ("script", "style", "nav", "footer", "svg", "head"):
        html = re.sub(rf"<{tag}[\s\S]*?</{tag}>", " ", html, flags=re.I)
    html = re.sub(r"<[^>]+>", " ", html)
    html = (html.replace("&nbsp;", " ").replace("&amp;", "&")
                .replace("&#39;", "'").replace("&quot;", '"'))
    return re.sub(r"\s+", " ", html).strip()[:CRAWL_CAP]


def _domain_of(lead: dict) -> str:
    d = (lead.get("company_domain") or "").strip()
    if not d and lead.get("email") and "@" in lead["email"]:
        d = lead["email"].split("@", 1)[1]
    return d.lower().replace("https://", "").replace("http://", "").split("/")[0]


def crawl_domain(domain: str, session: requests.Session) -> str:
    """Fetch a few common pages, strip to text, return a short company_description."""
    if not domain:
        return ""
    base = f"https://{domain}"
    chunks = []
    for path in CRAWL_PAGES:
        try:
            r = session.get(base + path, headers={"User-Agent": UA},
                            timeout=12, allow_redirects=True)
            if r.status_code != 200:
                continue
            text = _strip_html(r.text)
            if len(text) >= 200:
                chunks.append(text)
            if sum(len(c) for c in chunks) > CRAWL_CAP:
                break
        except requests.RequestException:
            continue
    return " ".join(chunks)[:CRAWL_CAP]


def cmd_crawl(args):
    session = requests.Session()
    if args.dry_run:
        desc = crawl_domain("creativealternatives.com", session)
        print(f"[dry-run] crawled creativealternatives.com → {len(desc)} chars")
        print(desc[:300] + ("…" if len(desc) > 300 else ""))
        return 0

    leads = json.loads(Path(args.infile).read_text())
    cache, enriched = {}, []
    for lead in leads:
        dom = _domain_of(lead)
        if dom and dom not in cache:
            cache[dom] = crawl_domain(dom, session)
            time.sleep(0.5)  # be polite
        # Prefer scraped text; fall back to the AI Ark profile summary if the site was thin.
        desc = cache.get(dom, "") or (lead.get("summary") or "")
        lead["company_domain"] = dom
        lead["company_description"] = desc
        enriched.append(lead)
    Path(args.outfile).parent.mkdir(parents=True, exist_ok=True)
    Path(args.outfile).write_text(json.dumps(enriched, indent=2))
    have = sum(1 for l in enriched if l.get("company_description"))
    print(f"crawled {len(cache)} domains → {have}/{len(enriched)} leads have a description → {args.outfile}")
    return 0


def cmd_assemble(args):
    leads = json.loads(Path(args.infile).read_text())
    Path(args.outfile).parent.mkdir(parents=True, exist_ok=True)
    skipped = 0
    with open(args.outfile, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=LEADS_CSV_COLS, extrasaction="ignore")
        w.writeheader()
        for lead in leads:
            if not lead.get("email") or "@" not in lead["email"]:
                skipped += 1
                continue
            # Never ship a personalization field that failed generation.
            for k in ("situation_line", "value_line", "cta_line"):
                v = (lead.get(k) or "").strip()
                if "cannot be generated" in v.lower() or v.lower() == "skip":
                    lead[k] = ""
            w.writerow({c: lead.get(c, "") for c in LEADS_CSV_COLS})
    wrote = len(leads) - skipped
    print(f"wrote {wrote} leads → {args.outfile}" + (f" ({skipped} skipped: no email)" if skipped else ""))
    return 0


def cmd_variants(args):
    import yaml  # lazy import; only needed here
    cfg = yaml.safe_load((ROOT / "config" / "ca_outbound.yaml").read_text())
    icp = cfg["icps"].get(args.icp)
    if not icp:
        print(f"unknown icp '{args.icp}'. Options: {', '.join(cfg['icps'])}", file=sys.stderr)
        return 1
    sch = cfg["schedule"]
    tmpl = (ROOT / "config" / "ca_variants_template.yaml").read_text()
    rendered = (tmpl
                .replace("__CAMPAIGN_NAME__", args.name or icp["campaign_name"])
                .replace("__INBOX_TAG__", icp["inbox_tag"])
                .replace("__INBOX_COUNT__", str(icp.get("inbox_count", 20)))
                .replace("__TIMEZONE__", sch["timezone"])
                .replace("__START_HOUR__", sch["start_hour"])
                .replace("__END_HOUR__", sch["end_hour"])
                .replace("__MIN_GAP__", str(sch["min_time_btw_emails"]))
                .replace("__MAX_PER_DAY__", str(sch["max_leads_per_day"])))
    Path(args.outfile).parent.mkdir(parents=True, exist_ok=True)
    Path(args.outfile).write_text(rendered)
    print(f"rendered variants.yaml ({args.icp}, inbox tag '{icp['inbox_tag']}') → {args.outfile}")
    return 0


def cmd_notify(args):
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat = (os.getenv("TELEGRAM_GROUP_ID") or os.getenv("TELEGRAM_CHAT_ID") or "").strip()
    if not token or not chat:
        print("skip notify: TELEGRAM_BOT_TOKEN / chat id missing", file=sys.stderr)
        return 0
    try:
        r = requests.post(f"https://api.telegram.org/bot{token}/sendMessage",
                          json={"chat_id": chat, "text": args.text,
                                "parse_mode": "Markdown", "disable_web_page_preview": True},
                          timeout=15)
        print("notified" if r.ok else f"notify failed: {r.status_code} {r.text[:200]}")
    except requests.RequestException as e:
        print(f"notify error: {e}", file=sys.stderr)
    return 0


def main():
    p = argparse.ArgumentParser(description="CA outbound prep — mechanical pipeline steps (never sends).")
    sub = p.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("crawl"); c.add_argument("--in", dest="infile"); c.add_argument("--out", dest="outfile")
    c.add_argument("--dry-run", action="store_true"); c.set_defaults(func=cmd_crawl)

    a = sub.add_parser("assemble"); a.add_argument("--in", dest="infile", required=True)
    a.add_argument("--out", dest="outfile", required=True); a.set_defaults(func=cmd_assemble)

    v = sub.add_parser("variants"); v.add_argument("--icp", required=True)
    v.add_argument("--out", dest="outfile", required=True); v.add_argument("--name")
    v.set_defaults(func=cmd_variants)

    n = sub.add_parser("notify"); n.add_argument("--text", required=True); n.set_defaults(func=cmd_notify)

    args = p.parse_args()
    if args.cmd == "crawl" and not args.dry_run and (not args.infile or not args.outfile):
        p.error("crawl needs --in and --out (or --dry-run)")
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
