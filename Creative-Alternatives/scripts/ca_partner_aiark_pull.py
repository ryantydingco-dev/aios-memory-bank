#!/usr/bin/env python3
"""Credit-guarded AI Ark partner pilot pull.

AUTHORIZED 2026-07-17 by Ryan for partner outreach. Initial run is capped at
15 requested records per lane and never reveals mobile phones. Outputs only
records with a named email address. Campaign creation and sending are out of
scope.
"""

import argparse
import json
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "outputs" / "partnerships" / "outreach-2026-07-17"

LANES = {
    "partner-agencies": {
        "partner_lane": "partner_agencies",
        "partner_offer": "White-Label Merch Desk",
        "filters": {
            "companyIndustry": "advertising services,design services,digital marketing,public relations and communications services,graphic design,web design",
            "title": "founder,owner,president,managing director,principal",
            "seniority": "owner,founder,partner,c_suite,director",
            "companyLocation": "New York,New Jersey,Connecticut,South Carolina,North Carolina,Georgia",
            "minEmployees": 2,
            "maxEmployees": 100,
            "excludeTitle": "freelance,intern,student",
        },
    },
    "partner-event-agencies": {
        "partner_lane": "partner_event_agencies",
        "partner_offer": "Planner Merch Concierge",
        "filters": {
            "companyIndustry": "events,events services,advertising services",
            "title": "founder,owner,president,event producer,executive producer,director of events,managing director",
            "seniority": "owner,founder,partner,c_suite,director",
            "companyLocation": "New York,New Jersey,Connecticut,South Carolina,North Carolina,Georgia",
            "minEmployees": 2,
            "maxEmployees": 100,
            "excludeTitle": "wedding,bridal,party,social events",
        },
    },
    "partner-people-advisors": {
        "partner_lane": "partner_people_advisors",
        "partner_offer": "Employee Moment Merch Partner",
        "filters": {
            "companyIndustry": "human resources services,staffing and recruiting,employee benefits,business consulting and services,management consulting",
            "title": "founder,owner,principal,partner,human resources consultant,people consultant,benefits consultant,managing director",
            "seniority": "owner,founder,partner,c_suite,director",
            "companyLocation": "New York,New Jersey,Connecticut,South Carolina,North Carolina,Georgia",
            "minEmployees": 2,
            "maxEmployees": 200,
            "excludeTitle": "internal recruiter,talent acquisition specialist,intern",
        },
    },
}


def ark_url():
    cfg = json.load(open(Path.home() / ".claude.json"))
    return cfg["mcpServers"]["ai-ark"]["url"]


def mcp_call(name, arguments, timeout=90):
    payload = {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": name, "arguments": arguments}}
    req = urllib.request.Request(
        ark_url(), data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "Accept": "application/json, text/event-stream", "User-Agent": "ca-partner-pilot"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        body = response.read().decode()
    # AI Ark usually sends one-line SSE frames, but larger email-finder
    # responses may contain a pretty-printed/multi-line JSON-RPC frame. Parse
    # complete SSE events first instead of assuming every physical line is a
    # complete JSON document.
    candidates = []
    for event in body.replace("\r\n", "\n").split("\n\n"):
        data_lines = []
        for line in event.splitlines():
            if line.startswith("data:"):
                data_lines.append(line.removeprefix("data:").lstrip())
            elif data_lines and not line.startswith(("event:", "id:", "retry:")):
                data_lines.append(line)
        if data_lines:
            candidates.append("\n".join(data_lines).strip())
    # Some responses omit SSE blank separators. Treat the entire body after
    # stripping protocol prefixes as a final candidate.
    # AI Ark also line-wraps very large JSON-RPC responses at the transport
    # layer *inside* the escaped `text` value. Those physical newlines are not
    # semantic JSON whitespace, so remove rather than preserve them.
    candidates.append("".join(
        line.removeprefix("data: ")
        for line in body.replace("\r\n", "\n").splitlines()
        if not line.startswith(("event:", "id:", "retry:"))
    ).strip())
    for candidate in candidates:
        if not candidate.startswith("{"):
            continue
        try:
            outer = json.loads(candidate)
        except json.JSONDecodeError:
            continue
        text = outer.get("result", {}).get("content", [{}])[0].get("text", "")
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"raw": text}
    return {"error": "unparseable MCP response"}


def domain_of(hit):
    company = hit.get("company") or {}
    link = company.get("link") or {}
    domain = (link.get("domain") or link.get("website") or "").lower()
    return domain.replace("https://", "").replace("http://", "").split("/")[0].removeprefix("www.")


def address_of(hit):
    output = ((hit.get("email") or {}).get("output") or [])
    for item in output:
        address = (item.get("address") or "").strip().lower()
        if "@" in address:
            return address
    return ""


def convert(hit, lane):
    profile = hit.get("profile") or {}
    company = hit.get("company") or {}
    summary = company.get("summary") or {}
    domain = domain_of(hit)
    email = address_of(hit)
    if not email or not domain:
        return None
    return {
        "email": email,
        "first_name": profile.get("first_name") or "",
        "last_name": profile.get("last_name") or "",
        "company_name": summary.get("name") or "",
        "company_domain": domain,
        "title": profile.get("title") or profile.get("headline") or "",
        "linkedin_url": (hit.get("link") or {}).get("linkedin") or "",
        "partner_lane": lane["partner_lane"],
        "partner_offer": lane["partner_offer"],
        "summary": summary.get("description") or profile.get("summary") or "",
        "relationship_state": "cold-never",
        "suppression_checked": False,
    }


def run_lane(slug, lane, limit, poll_seconds=8, max_polls=75):
    target = OUT / slug
    target.mkdir(parents=True, exist_ok=True)
    args = dict(lane["filters"])
    args["size"] = limit
    start = mcp_call("email_finder", args)
    if start.get("error"):
        return {"lane": slug, "error": start["error"], "filters": args}
    track = start.get("trackId") or start.get("track_id")
    if not track:
        return {"lane": slug, "error": f"missing trackId: {start}", "filters": args}
    # Persist immediately so a later parser/network failure never loses a
    # paid async job's recovery handle.
    (target / "track-id.txt").write_text(str(track) + "\n")
    print(f"{slug} trackId: {track}", flush=True)
    result = None
    for _ in range(max_polls):
        time.sleep(poll_seconds)
        check = mcp_call("email_finder_results", {"trackId": track, "page": 0, "size": 100})
        if check.get("error") and "in progress" in str(check["error"]).lower():
            continue
        if check.get("error"):
            return {"lane": slug, "trackId": track, "error": check["error"], "filters": args}
        result = check
        break
    if result is None:
        return {"lane": slug, "trackId": track, "error": "poll timeout", "filters": args}

    by_domain = {}
    for hit in result.get("content") or []:
        row = convert(hit, lane)
        if not row:
            continue
        by_domain.setdefault(row["company_domain"], row)
    rows = list(by_domain.values())
    (target / "raw-ai-ark.json").write_text(json.dumps(rows, indent=2))
    return {
        "lane": slug,
        "trackId": track,
        "requested": limit,
        "returned_profiles": len(result.get("content") or []),
        "named_emails_unique_domains": len(rows),
        "output": str(target / "raw-ai-ark.json"),
        "filters": args,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=15)
    parser.add_argument("--lane", choices=["all", *LANES], default="all")
    args = parser.parse_args()
    if args.limit > 15:
        raise SystemExit("Pilot hard cap is 15 per lane")
    selected = LANES.items() if args.lane == "all" else [(args.lane, LANES[args.lane])]
    reports = []
    for slug, lane in selected:
        print(f"Starting {slug}: {args.limit} requested")
        report = run_lane(slug, lane, args.limit)
        reports.append(report)
        print(json.dumps(report, indent=2))
        if report.get("error") and any(code in str(report["error"]) for code in ("402", "503")):
            break
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "ai-ark-pull-report.json").write_text(json.dumps(reports, indent=2))
    lines = ["# AI Ark Partner Pilot Pull", "", "- Run date: 2026-07-17", "- Mobile reveals: none", "- Campaigns created/sent: none", ""]
    for r in reports:
        lines += [f"## {r['lane']}", "", f"- Track ID: `{r.get('trackId', '')}`", f"- Requested: {r.get('requested', 0)}", f"- Returned profiles: {r.get('returned_profiles', 0)}", f"- Named emails on unique domains: {r.get('named_emails_unique_domains', 0)}", f"- Output: `{r.get('output', '')}`", f"- Error: {r.get('error', 'none')}", "", "Filters:", "", "```json", json.dumps(r.get("filters", {}), indent=2), "```", ""]
    (OUT / "ai-ark-pull-report.md").write_text("\n".join(lines))
    print(f"Report: {OUT / 'ai-ark-pull-report.md'}")


if __name__ == "__main__":
    main()
