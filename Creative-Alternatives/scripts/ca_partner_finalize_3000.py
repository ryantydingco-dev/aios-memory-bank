#!/usr/bin/env python3
"""Build an exact, globally deduplicated 3 x 1,000 partner review universe.

A company domain is assigned to only one partner lane. Rows may be re-scored into
another lane when their stored evidence supports that lane. A small max-flow
assignment fills each lane's quota without duplicating companies.
"""

import csv
import json
from collections import defaultdict, deque
from pathlib import Path

from ca_partner_enrich_score import (
    CSV_FIELDS, LANES, DEFAULT_BASE, load_suppressions, score_row, write_csv,
)

QUOTA = 1000


def add_edge(graph, capacity, u, v, cap):
    graph[u].append(v); graph[v].append(u)
    capacity[(u, v)] = cap; capacity[(v, u)] = 0


def max_flow_assign(options):
    """Return domain -> lane using source/domain/lane/sink max flow."""
    source, sink = "__source__", "__sink__"
    graph = defaultdict(list); capacity = {}; flow = defaultdict(int)
    for domain, lanes in options.items():
        node = "d:" + domain
        add_edge(graph, capacity, source, node, 1)
        for lane in lanes:
            add_edge(graph, capacity, node, "l:" + lane, 1)
    for lane in LANES:
        add_edge(graph, capacity, "l:" + lane, sink, QUOTA)

    total = 0
    while True:
        parent: dict[str, str] = {source: source}; q = deque([source])
        while q and sink not in parent:
            u = q.popleft()
            for v in graph[u]:
                if v not in parent and flow[(u, v)] < capacity[(u, v)]:
                    parent[v] = u; q.append(v)
        if sink not in parent: break
        v = sink
        while v != source:
            u = parent[v]; flow[(u, v)] += 1; flow[(v, u)] -= 1; v = u
        total += 1
        if total == QUOTA * len(LANES): break

    assignment = {}
    for domain, lanes in options.items():
        node = "d:" + domain
        for lane in lanes:
            if flow[(node, "l:" + lane)] == 1:
                assignment[domain] = lane; break
    return total, assignment


def main():
    base = DEFAULT_BASE
    suppressed_emails, suppressed_domains = load_suppressions()
    originals = []
    for source_lane in LANES:
        originals.extend(json.loads((base / source_lane / "enriched-scored.json").read_text()))

    # For each domain and possible target lane, retain the best evidence-backed
    # contact/score. Cross-lane eligibility requires at least Tier 2.
    best = {}
    for original in originals:
        if original["tier"] == "DISQUALIFIED":
            continue
        for target_lane, lane_cfg in LANES.items():
            raw = dict(original)
            raw["partner_lane"] = target_lane.replace("-", "_")
            raw["partner_offer"] = {
                "partner-agencies": "White-Label Merch Desk",
                "partner-event-agencies": "Planner Merch Concierge",
                "partner-people-advisors": "Employee Moment Merch Partner",
            }[target_lane]
            candidate = {
                "company_name": original.get("company_name"),
                "company_domain": original.get("company_domain"),
                "company_description": original.get("summary"),
                "company_industry": original.get("company_industry"),
                "company_staff": original.get("company_staff"),
                "partner_offer": raw["partner_offer"],
            }
            rescored = score_row(raw, target_lane, lane_cfg, candidate, suppressed_emails, suppressed_domains)
            own_lane = original.get("partner_lane") == target_lane.replace("-", "_")
            # Tier 3 may remain in its evidence-supported source lane as
            # nurture/review inventory. Cross-lane reassignment requires at
            # least Tier 2 so weak rows are never used to manufacture quotas.
            if rescored["tier"] == "DISQUALIFIED" or (rescored["tier"] == "TIER_3" and not own_lane):
                continue
            domain = rescored["company_domain"]
            key = (domain, target_lane)
            old = best.get(key)
            if old is None or rescored["total_score"] > old["total_score"]:
                rescored["original_partner_lane"] = original.get("partner_lane", "")
                best[key] = rescored

    options = defaultdict(list)
    for domain, lane in best:
        options[domain].append(lane)
    total, assignment = max_flow_assign(options)
    if total != QUOTA * len(LANES):
        counts = {lane: sum(lane in lanes for lanes in options.values()) for lane in LANES}
        raise SystemExit(f"Could only assign {total}/3000 unique domains; eligible by lane: {counts}")

    rows = []
    lane_counts = defaultdict(int)
    for domain, lane in assignment.items():
        row = dict(best[(domain, lane)])
        row["assigned_partner_lane"] = lane
        rows.append(row); lane_counts[lane] += 1
    tier_order = {"TIER_1": 0, "TIER_2": 1, "TIER_3": 2}
    rows.sort(key=lambda r: (r["assigned_partner_lane"], tier_order.get(r["tier"], 9), -r["total_score"], r["company_name_normalized"]))
    for i, row in enumerate(rows, 1): row["rank"] = i

    json_path = base / "partner-master-3000-unique.json"
    json_path.write_text(json.dumps(rows, indent=2))
    extra_fields = CSV_FIELDS + ["assigned_partner_lane", "original_partner_lane"]
    with open(base / "partner-master-3000-unique.csv", "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=extra_fields, extrasaction="ignore"); w.writeheader(); w.writerows(rows)
    reports = []
    for lane in LANES:
        subset = [r for r in rows if r["assigned_partner_lane"] == lane]
        write_csv(base / lane / "final-1000-unique-review.csv", subset)
        reports.append({
            "lane": lane, "count": len(subset),
            "tier_1": sum(r["tier"] == "TIER_1" for r in subset),
            "tier_2": sum(r["tier"] == "TIER_2" for r in subset),
            "resegmented": sum(r.get("original_partner_lane") != lane.replace("-", "_") for r in subset),
        })
    report = {"total": len(rows), "unique_domains": len({r["company_domain"] for r in rows}), "unique_emails": len({r["email"] for r in rows}), "lanes": reports}
    (base / "finalize-report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
