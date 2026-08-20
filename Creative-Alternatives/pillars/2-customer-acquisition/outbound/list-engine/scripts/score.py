#!/usr/bin/env python3
"""Phase 3 — rubric judge. No API. Transparent enough to read on camera."""
from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import is_suppressed, load_suppress, norm_domain

KEEP = [
    "elementary", "middle school", "high school", "academy", "preparatory",
    "prep school", "charter", "independent school", "community school",
    "day school", "friends school", "school",
    "k-12", "k12", "pta", "pto", "booster", "athletics", "spirit",
    "students", "parents", "principal",
]
KILL = [
    "university", "college of", "alumni association", "daycare",
    "day care", "preschool only", "tutoring", "test prep", "edtech",
    "promotional product", "screen print", "embroidery",
]


def hay(row: dict) -> str:
    return " ".join([
        row.get("name", ""),
        row.get("domain", ""),
        row.get("excerpt", ""),
        row.get("notes", ""),
    ]).lower()


def score_row(row: dict, suppress: dict) -> dict:
    name = row.get("name", "")
    domain = norm_domain(row.get("domain", ""))
    why_sup = is_suppressed(name, domain, suppress)
    if why_sup:
        return {**row, "domain": domain, "score": 0, "tier": "skip", "why": f"suppress:{why_sup}"}

    text = hay(row)
    kill_hits = [k for k in KILL if k in text]
    # "high school" contains neither university kill alone — but "university" in a
    # high-school name is rare. If both "high school" and "university" appear, keep.
    if "high school" in text:
        kill_hits = [k for k in kill_hits if k != "university"]
    if kill_hits:
        return {**row, "domain": domain, "score": 0, "tier": "reject", "why": "kill: " + ", ".join(kill_hits[:3])}

    keep_hits = [k for k in KEEP if k in text]
    score = min(40 + len(keep_hits) * 12, 96)
    if not keep_hits:
        return {**row, "domain": domain, "score": 10, "tier": "reject", "why": "no school-buyer language"}
    if score >= 76:
        tier = "A"
    elif score >= 64:
        tier = "B"
    else:
        tier = "C"
    return {**row, "domain": domain, "score": score, "tier": tier, "why": "keep: " + ", ".join(keep_hits[:4])}


def read_candidates(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, rows: list[dict], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(r)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    suppress = load_suppress()
    rows = [score_row(r, suppress) for r in read_candidates(Path(args.candidates))]
    rows.sort(key=lambda r: (-int(r["score"]), r.get("name", "")))
    fields = ["tier", "score", "name", "domain", "source", "why", "notes", "excerpt"]
    dest = Path(args.out)
    write_csv(dest, rows, fields)
    counts: dict[str, int] = {}
    for r in rows:
        counts[r["tier"]] = counts.get(r["tier"], 0) + 1
    print(f"scored {len(rows)} → {dest}")
    print("tiers:", dict(sorted(counts.items())))


if __name__ == "__main__":
    main()
