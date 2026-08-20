#!/usr/bin/env python3
"""Phase 1 — fetch seed homepages and mine how they actually describe themselves."""
from __future__ import annotations

import argparse
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib import ROOT, fetch, load_json, top_ngrams, write_json

JUNK_FRAG = (
    "wix", "ufont", "static", "https", "font", "palette", "color",
    "skip to", "main content", "search search", "open menu", "close menu",
)


def _junk_phrase(phrase: str) -> bool:
    if any(j in phrase for j in JUNK_FRAG):
        return True
    tokens = phrase.split()
    return all(t.isdigit() for t in tokens)


INDUSTRY_HINTS = [
    "elementary school", "middle school", "high school", "public school",
    "private school", "charter school", "independent school", "academy",
    "preparatory", "k-12", "k12", "pta", "pto", "booster", "athletics",
    "parent teacher", "community school",
]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--seeds", default=str(ROOT / "seeds" / "schools.json"))
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    spec = load_json(Path(args.seeds))
    rows = []
    hint_hits: Counter[str] = Counter()
    gram_hits: Counter[str] = Counter()

    for seed in spec["seeds"]:
        status, text = fetch(seed["domain"])
        hints = [h for h in INDUSTRY_HINTS if h in text.lower()]
        grams = top_ngrams(text, 2, 8) + top_ngrams(text, 3, 6)
        for h in hints:
            hint_hits[h] += 1
        for g, c in grams:
            gram_hits[g] += c
        rows.append({
            "name": seed["name"],
            "domain": seed["domain"],
            "why": seed.get("why", ""),
            "source": seed.get("source", ""),
            "fetch": status,
            "industry_hints": hints,
            "top_phrases": [g for g, _ in grams[:8]],
            "excerpt": text[:400],
        })

    out = {
        "lane": spec.get("lane", ""),
        "icp": spec.get("icp", ""),
        "seeds": rows,
        "industries_to_sweep": [k for k, _ in hint_hits.most_common()],
        "keywords_to_sweep": [
            k for k, _ in gram_hits.most_common(30)
            if not _junk_phrase(k)
        ][:16],
    }
    dest = Path(args.out)
    write_json(dest, out)
    print(f"fingerprinted {len(rows)} seeds → {dest}")
    print("industries:", ", ".join(out["industries_to_sweep"][:8]) or "(none on homepage)")
    print("keywords:", ", ".join(out["keywords_to_sweep"][:10]) or "(thin pages)")


if __name__ == "__main__":
    main()
