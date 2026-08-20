#!/usr/bin/env python3
"""Orchestrate one list-engine lane. Camera-friendly summary at the end."""
from __future__ import annotations

import argparse
import csv
import subprocess
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
PY = sys.executable


def run(args: list[str]) -> None:
    print("+", " ".join(args))
    subprocess.check_call(args)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--lane", default="schools")
    ap.add_argument("--cap", type=int, default=40)
    ap.add_argument("--candidates", help="CSV with name,domain,source after the expand step")
    args = ap.parse_args()

    run_id = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    out = ROOT / "output" / args.lane / run_id
    out.mkdir(parents=True, exist_ok=True)
    seeds = ROOT / "seeds" / f"{args.lane}.json"
    if not seeds.exists():
        raise SystemExit(f"No seed file at {seeds}")

    fingerprint = out / "fingerprint.json"
    queries = out / "expand-queries.md"
    run([PY, str(HERE / "fingerprint.py"), "--seeds", str(seeds), "--out", str(fingerprint)])
    run([PY, str(HERE / "expand_queries.py"), "--fingerprint", str(fingerprint), "--out", str(queries)])

    qualified_n = 0
    scored_n = 0
    if args.candidates:
        src = Path(args.candidates)
        if not src.exists():
            raise SystemExit(f"No candidates file at {src}")
        with src.open(newline="", encoding="utf-8-sig") as f:
            rows = list(csv.DictReader(f))[: args.cap]
        capped = out / "candidates.csv"
        with capped.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["name", "domain", "source", "notes"])
            w.writeheader()
            for r in rows:
                w.writerow({k: r.get(k, "") for k in ["name", "domain", "source", "notes"]})
        scored = out / "scored.csv"
        verified = out / "qualified.csv"
        run([PY, str(HERE / "score.py"), "--candidates", str(capped), "--out", str(scored)])
        run([PY, str(HERE / "verify.py"), "--scored", str(scored), "--out", str(verified)])
        with verified.open(newline="", encoding="utf-8") as f:
            done = list(csv.DictReader(f))
        scored_n = len(done)
        qualified_n = sum(1 for r in done if r.get("tier") in {"A", "B", "C"})
        next_cmd = "Spot-check 5 domains in qualified.csv. Do not load SmartLead."
        status = "READY" if qualified_n else "NOT READY — zero kept after verify"
    else:
        next_cmd = (
            f"Fill {out}/candidates.csv (name,domain,source) from the queries, then:\n"
            f"python3 scripts/run_lane.py --lane {args.lane} --cap {args.cap} "
            f"--candidates {out}/candidates.csv"
        )
        status = "NOT READY — waiting on candidates.csv"

    summary = out / "summary.md"
    summary.write_text("\n".join([
        f"# {args.lane} list run — {run_id}",
        "",
        f"**{status}**",
        "",
        f"- cap: {args.cap} (live-demo ceiling, not full TAM)",
        f"- scored: {scored_n}",
        f"- kept A/B/C: {qualified_n}",
        "",
        "## Next",
        "",
        next_cmd,
        "",
        "This run is company-only. No emails. No SmartLead.",
        "",
    ]) + "\n")
    print()
    print(summary.read_text())
    print(f"artifacts: {out}")


if __name__ == "__main__":
    main()
