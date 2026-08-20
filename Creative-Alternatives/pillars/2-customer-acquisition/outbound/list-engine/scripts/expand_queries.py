#!/usr/bin/env python3
"""Phase 2 — turn a fingerprint into the search queries an agent (or API) should run."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import load_json

GEO_DEFAULT = [
    "New York City", "Long Island", "Westchester", "New Jersey", "Connecticut",
]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fingerprint", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    fp = load_json(Path(args.fingerprint))
    fallback_ind = [
        "elementary school", "middle school", "high school", "community school",
        "academy", "charter school", "independent school", "preparatory school",
    ]
    fallback_kw = ["pta", "pto", "booster club", "spirit wear", "athletic director"]
    mined_ind = [x for x in fp.get("industries_to_sweep") or [] if x]
    mined_kw = [x for x in fp.get("keywords_to_sweep") or [] if x and "normal" not in x]
    industries = list(dict.fromkeys(mined_ind + fallback_ind))
    keywords = list(dict.fromkeys(mined_kw + fallback_kw))

    lines = [
        f"# Expand queries — {fp.get('lane', 'lane')}",
        "",
        f"ICP: {fp.get('icp', '')}",
        "",
        "Rule: if a hint showed up on ONE seed, sweep it. Do not add extra keyword",
        "narrowing on an industry query. Geo only.",
        "",
        "## Industry sweeps",
        "",
    ]
    for ind in industries:
        for geo in GEO_DEFAULT:
            lines.append(f"- {ind} {geo}")
    lines += ["", "## Keyword sweeps (all industries)", ""]
    for kw in keywords[:12]:
        lines.append(f"- \"{kw}\" school United States")
    lines += [
        "",
        "## Lookalike prompts",
        "",
        "Find K-12 schools like: " + ", ".join(s["name"] for s in fp.get("seeds", [])),
        "",
        "## Output contract",
        "",
        "Write candidates.csv with headers: name,domain,source",
        "source = web | lookalike | directory | inbound",
        "Skip anything on the suppress list. Cap at the lane --cap.",
        "",
    ]
    dest = Path(args.out)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text("\n".join(lines) + "\n")
    print(f"queries → {dest}")


if __name__ == "__main__":
    main()
