#!/usr/bin/env python3
"""Build a 3,000-contact CA partner prospect pool through AI Ark.

Authorized by Ryan on 2026-07-17: target 1,000 named-email contacts per
partner lane. The script discovers candidates with free people_search first,
selects one decision-maker per domain, then uses paid id-scoped email_finder
batches. It never reveals mobile phones, sends outreach, or activates campaigns.

Resume-safe: candidates, selected IDs, track IDs, batch results, and cumulative
email rows are persisted after every step.
"""

import argparse
import json
import re
import time
from pathlib import Path

from ca_partner_aiark_pull import mcp_call, convert

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "outputs" / "partnerships" / "scale-3000-2026-07-17"

COMMON = {
    "companyLocation": "United States",
    "size": 100,
}

LANES = {
    "partner-agencies": {
        "partner_lane": "partner_agencies",
        "partner_offer": "White-Label Merch Desk",
        "search": {
            "companyIndustry": "advertising services,design services,digital marketing,public relations and communications services,graphic design,web design,marketing",
            "title": "founder,co-founder,owner,president,chief executive officer,managing director,principal,partner,client services director,account director",
            "seniority": "owner,founder,partner,c_suite,director",
            "minEmployees": 2,
            "maxEmployees": 200,
            "excludeTitle": "freelance,intern,student",
        },
        "title_re": r"founder|owner|president|chief executive|\bceo\b|managing director|principal|partner|client services director|account director",
        "context_re": r"brand|marketing|creative|advertis|public relations|digital|campaign|client",
    },
    "partner-event-agencies": {
        "partner_lane": "partner_event_agencies",
        "partner_offer": "Planner Merch Concierge",
        "search": {
            "companyIndustry": "events,events services",
            "title": "founder,co-founder,owner,president,chief executive officer,managing director,event producer,executive producer,director of events,conference producer,meeting planner",
            "seniority": "owner,founder,partner,c_suite,director",
            "minEmployees": 2,
            "maxEmployees": 200,
            "excludeTitle": "wedding,bridal,party,social events",
        },
        "title_re": r"founder|owner|president|chief executive|\bceo\b|managing director|executive producer|event producer|director of events|conference producer|meeting planner",
        "context_re": r"event|conference|meeting|experiential|activation|production|retreat|trade.?show|exhibit|festival|gala",
    },
    "partner-people-advisors": {
        "partner_lane": "partner_people_advisors",
        "partner_offer": "Employee Moment Merch Partner",
        "search": {
            "companyIndustry": "human resources services,staffing and recruiting,employee benefits,management consulting,business consulting and services",
            "title": "founder,co-founder,owner,president,chief executive officer,managing director,principal,partner,human resources consultant,people consultant,benefits consultant,workforce consultant",
            "seniority": "owner,founder,partner,c_suite,director",
            "minEmployees": 2,
            "maxEmployees": 500,
            "excludeTitle": "internal recruiter,talent acquisition specialist,intern",
        },
        "title_re": r"founder|owner|president|chief executive|\bceo\b|managing director|principal|partner|human resources consultant|people consultant|benefits consultant|workforce consultant",
        "context_re": r"human resources|\bhr\b|people|workforce|employee|talent|recruit|leadership|benefits|culture|organization",
    },
}

COMPETITOR_RE = re.compile(
    r"promotional products?|promo products?|branded merchandise|screen print|embroid|swag supplier|apparel decorator|custom apparel",
    re.I,
)


def domain_of(hit):
    company = hit.get("company") or {}
    link = company.get("link") or {}
    raw = (link.get("domain") or link.get("website") or "").strip().lower()
    return raw.replace("https://", "").replace("http://", "").split("/")[0].removeprefix("www.")


def text_of(hit):
    profile = hit.get("profile") or {}
    company = hit.get("company") or {}
    summary = company.get("summary") or {}
    return " ".join(
        str(x or "") for x in (
            profile.get("title"), profile.get("headline"), profile.get("summary"),
            summary.get("name"), summary.get("description"), summary.get("industry"),
            " ".join(summary.get("keywords") or []) if isinstance(summary.get("keywords"), list) else summary.get("keywords"),
        )
    )


def candidate_score(hit, lane):
    profile = hit.get("profile") or {}
    company = hit.get("company") or {}
    summary = company.get("summary") or {}
    title = f"{profile.get('title','')} {profile.get('headline','')}"
    context = text_of(hit)
    domain = domain_of(hit)
    if not domain or COMPETITOR_RE.search(context):
        return -1
    if not re.search(lane["title_re"], title, re.I):
        return -1
    if not re.search(lane["context_re"], context, re.I):
        return -1
    score = 0
    if re.search(r"founder|owner|president|chief executive|\bceo\b|principal|partner", title, re.I):
        score += 5
    elif re.search(r"managing director|executive producer|director", title, re.I):
        score += 4
    else:
        score += 2
    staff = ((summary.get("staff") or {}).get("total") or 0)
    if 2 <= staff <= 50:
        score += 3
    elif staff <= 200:
        score += 2
    if re.search(lane["context_re"], (summary.get("description") or ""), re.I):
        score += 3
    if (hit.get("link") or {}).get("linkedin"):
        score += 1
    return score


def compact_candidate(hit, lane, score):
    profile = hit.get("profile") or {}
    company = hit.get("company") or {}
    summary = company.get("summary") or {}
    return {
        "ai_ark_id": hit.get("id") or "",
        "first_name": profile.get("first_name") or "",
        "last_name": profile.get("last_name") or "",
        "title": profile.get("title") or profile.get("headline") or "",
        "linkedin_url": (hit.get("link") or {}).get("linkedin") or "",
        "company_name": summary.get("name") or "",
        "company_domain": domain_of(hit),
        "company_description": summary.get("description") or "",
        "company_industry": summary.get("industry") or "",
        "company_staff": (summary.get("staff") or {}).get("total") or "",
        "partner_lane": lane["partner_lane"],
        "partner_offer": lane["partner_offer"],
        "fit_score": score,
        "source": "ai_ark_people_search",
    }


def discover_lane(slug, lane, target_candidates, max_pages):
    out = OUT / slug
    out.mkdir(parents=True, exist_ok=True)
    by_domain = {}
    page_reports = []
    for page in range(max_pages):
        args = {**COMMON, **lane["search"], "page": page}
        response = mcp_call("people_search", args)
        if response.get("error"):
            page_reports.append({"page": page, "error": response["error"]})
            break
        hits = response.get("content") or []
        accepted = 0
        for hit in hits:
            score = candidate_score(hit, lane)
            if score < 0:
                continue
            row = compact_candidate(hit, lane, score)
            old = by_domain.get(row["company_domain"])
            if old is None or row["fit_score"] > old["fit_score"]:
                by_domain[row["company_domain"]] = row
                accepted += 1
        page_reports.append({"page": page, "profiles": len(hits), "accepted_or_upgraded": accepted, "unique_domains": len(by_domain)})
        print(f"{slug} page {page}: profiles={len(hits)} unique_fit_domains={len(by_domain)}", flush=True)
        if len(by_domain) >= target_candidates or not hits:
            break
        time.sleep(0.35)
    rows = sorted(by_domain.values(), key=lambda r: (-r["fit_score"], r["company_domain"]))
    (out / "candidates.json").write_text(json.dumps(rows, indent=2))
    (out / "discovery-report.json").write_text(json.dumps(page_reports, indent=2))
    return rows


def convert_email_hit(hit, lane):
    row = convert(hit, lane)
    if not row:
        return None
    row["ai_ark_id"] = hit.get("id") or ""
    row["source"] = "ai_ark_email_finder"
    row["review_status"] = "machine_prequalified_human_review_required"
    return row


def enrich_lane(slug, lane, target_emails, max_attempts, batch_size):
    out = OUT / slug
    candidates = json.loads((out / "candidates.json").read_text())
    selected = candidates[:max_attempts]
    (out / "selected-for-email-finder.json").write_text(json.dumps(selected, indent=2))
    batches = out / "batches"
    batches.mkdir(parents=True, exist_ok=True)
    cumulative_path = out / "raw-ai-ark-emails.json"
    rows = json.loads(cumulative_path.read_text()) if cumulative_path.exists() else []
    by_domain = {r["company_domain"]: r for r in rows}
    completed_ids = {r.get("ai_ark_id") for r in rows if r.get("ai_ark_id")}

    batch_number = 0
    for start in range(0, len(selected), batch_size):
        if len(by_domain) >= target_emails:
            break
        batch = [r for r in selected[start:start + batch_size] if r["ai_ark_id"] not in completed_ids]
        if not batch:
            continue
        batch_number += 1
        prefix = batches / f"batch-{start // batch_size:03d}"
        result_path = prefix.with_suffix(".result.json")
        track_path = prefix.with_suffix(".track.txt")
        stuck_path = prefix.with_suffix(".stuck.json")
        if stuck_path.exists() and not result_path.exists():
            print(f"{slug} skipping previously marked stuck batch at {stuck_path}; paid track retained for later recovery", flush=True)
            continue
        if result_path.exists():
            result = json.loads(result_path.read_text())
        else:
            # Resume an already-paid async job when its track file exists.
            # Never submit the same ID batch again just because a prior poll
            # timed out or the process was interrupted.
            if track_path.exists():
                track = track_path.read_text().strip()
                print(f"{slug} resuming paid batch {batch_number}: track={track}", flush=True)
            else:
                ids = ",".join(r["ai_ark_id"] for r in batch)
                start_response = mcp_call("email_finder", {"id": ids, "size": len(batch)})
                if start_response.get("error"):
                    print(f"{slug} paid batch error: {start_response['error']}", flush=True)
                    break
                track = start_response.get("trackId") or start_response.get("track_id")
                if not track:
                    print(f"{slug} missing track ID: {start_response}", flush=True)
                    break
                track_path.write_text(str(track) + "\n")
                print(f"{slug} paid batch {batch_number}: {len(batch)} IDs track={track}", flush=True)
            result = None
            for _ in range(90):
                time.sleep(8)
                check = mcp_call("email_finder_results", {"trackId": track, "page": 0, "size": 100})
                if check.get("error") and "in progress" in str(check["error"]).lower():
                    continue
                if check.get("error"):
                    print(f"{slug} result error: {check['error']}", flush=True)
                    break
                result = check
                break
            if result is None:
                # Preserve the paid job for later recovery, but do not let one
                # vendor-side stuck track block every later, non-overlapping
                # candidate batch. A future recovery can fetch this track and
                # merge any additional unique emails without paying twice.
                stuck_path.write_text(json.dumps({
                    "trackId": track,
                    "candidate_ids": [r["ai_ark_id"] for r in batch],
                    "status": "track_in_progress_after_poll_budget",
                }, indent=2))
                print(f"{slug} batch did not complete; marked stuck and continuing with non-overlapping IDs: {stuck_path}", flush=True)
                continue
            result_path.write_text(json.dumps(result))
        found = 0
        for hit in result.get("content") or []:
            row = convert_email_hit(hit, lane)
            if not row:
                continue
            domain = row["company_domain"]
            if domain not in by_domain:
                by_domain[domain] = row
                found += 1
            if row.get("ai_ark_id"):
                completed_ids.add(row["ai_ark_id"])
        cumulative_path.write_text(json.dumps(list(by_domain.values()), indent=2))
        print(f"{slug} batch found={found}; cumulative unique emails={len(by_domain)}", flush=True)
    return list(by_domain.values())[:target_emails]


def write_summary(reports):
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "scale-report.json").write_text(json.dumps(reports, indent=2))
    lines = ["# AI Ark Partner Scale Report", "", "- Target: 3,000 named-email partner contacts", "- Mobile reveals: none", "- Campaigns activated: none", ""]
    for r in reports:
        lines += [f"## {r['lane']}", "", f"- Candidates on unique domains: {r.get('candidates',0)}", f"- Named emails saved: {r.get('emails',0)}", f"- Target emails: {r.get('target',0)}", ""]
    (OUT / "scale-report.md").write_text("\n".join(lines))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", choices=["discover", "enrich", "all"])
    parser.add_argument("--lane", choices=["all", *LANES], default="all")
    parser.add_argument("--target-emails", type=int, default=1000)
    parser.add_argument("--target-candidates", type=int, default=1500)
    parser.add_argument("--max-paid-attempts", type=int, default=1500)
    parser.add_argument("--batch-size", type=int, default=100)
    parser.add_argument("--max-pages", type=int, default=60)
    args = parser.parse_args()
    if args.target_emails > 1000 or args.max_paid_attempts > 1500:
        raise SystemExit("Hard cap: 1,000 output emails and 1,500 paid attempts per lane")
    chosen = LANES.items() if args.lane == "all" else [(args.lane, LANES[args.lane])]
    reports = []
    for slug, lane in chosen:
        candidates_path = OUT / slug / "candidates.json"
        if args.stage in {"discover", "all"}:
            candidates = discover_lane(slug, lane, args.target_candidates, args.max_pages)
        else:
            candidates = json.loads(candidates_path.read_text())
        emails = []
        if args.stage in {"enrich", "all"}:
            emails = enrich_lane(slug, lane, args.target_emails, args.max_paid_attempts, args.batch_size)
        reports.append({"lane": slug, "candidates": len(candidates), "emails": len(emails), "target": args.target_emails})
        write_summary(reports)
    print(json.dumps(reports, indent=2))


if __name__ == "__main__":
    main()
