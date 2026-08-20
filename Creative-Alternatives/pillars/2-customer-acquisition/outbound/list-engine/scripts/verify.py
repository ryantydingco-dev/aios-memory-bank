#!/usr/bin/env python3
"""Phase 4 — live homepage pass. Dead/parked drop. Fetch-fail stays unverified."""
from __future__ import annotations

import argparse
import csv
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import fetch, norm_domain
from score import KEEP, KILL, write_csv

PARKED = ["domain is for sale", "buy this domain", "parked free", "coming soon"]


def verify_row(row: dict) -> dict:
    domain = norm_domain(row.get("domain", ""))
    if row.get("tier") in {"skip", "reject"}:
        return {**row, "domain": domain, "verify": "skipped", "live_why": row.get("why", "")}

    status, text = fetch(domain)
    low = text.lower()
    if status == "fail":
        return {**row, "domain": domain, "verify": "unverified", "live_why": f"fetch-fail: {text[:80]}"}
    if any(p in low for p in PARKED):
        return {**row, "domain": domain, "score": 0, "tier": "reject", "verify": "dead",
                "live_why": "parked homepage"}
    if len(low) < 80:
        return {**row, "domain": domain, "verify": "unverified",
                "live_why": "live but homepage too thin to judge (likely JS shell)"}

    kill_hits = [k for k in KILL if k in low]
    if "high school" in low:
        kill_hits = [k for k in kill_hits if k != "university"]
    keep_hits = [k for k in KEEP if k in low]
    if kill_hits and not keep_hits:
        return {**row, "domain": domain, "score": 0, "tier": "reject", "verify": "live-reject",
                "live_why": "homepage kill: " + ", ".join(kill_hits[:3])}
    if not keep_hits:
        return {**row, "domain": domain, "verify": "unverified",
                "live_why": "live but no school-buyer language on homepage"}

    score = min(int(row.get("score") or 0) + 4, 99)
    tier = "A" if score >= 76 else "B" if score >= 64 else "C"
    return {**row, "domain": domain, "score": score, "tier": tier, "verify": "live",
            "live_why": "homepage: " + ", ".join(keep_hits[:4])}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scored", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    with Path(args.scored).open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    out = []
    for i, row in enumerate(rows):
        out.append(verify_row(row))
        if i < len(rows) - 1:
            time.sleep(1.0)

    fields = ["tier", "score", "name", "domain", "source", "verify", "why", "live_why"]
    dest = Path(args.out)
    write_csv(dest, out, fields)
    kept = [r for r in out if r["tier"] in {"A", "B", "C"}]
    print(f"verified {len(out)} → {dest}")
    print(f"kept A/B/C: {len(kept)}")


if __name__ == "__main__":
    main()
