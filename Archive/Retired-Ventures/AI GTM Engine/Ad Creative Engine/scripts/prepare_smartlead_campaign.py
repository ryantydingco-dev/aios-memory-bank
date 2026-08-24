#!/usr/bin/env python3
"""Prepare a review-ready Smartlead lead file from the prospect universe."""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path


SUPPRESSED_EMAILS = {
    "ben@vistaroofinginc.com",
    "adam@willowashroofing.com",
}


def is_true(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "y"}


def clean_first_name(value: str) -> str:
    name = re.sub(r"[^A-Za-zÀ-ÖØ-öø-ÿ' -]", "", value or "").strip()
    if not name or len(name.split()) > 2 or len(name) > 24:
        return "there"
    return name.split()[0].title()


def review_count(row: dict[str, str]) -> int:
    try:
        return int(float(row.get("google_review_count") or 0))
    except ValueError:
        return 0


def proof_details(row: dict[str, str]) -> tuple[str, str]:
    gallery = is_true(row.get("has_gallery", ""))
    testimonials = is_true(row.get("has_testimonials", ""))
    financing = is_true(row.get("has_financing", ""))
    reviews = review_count(row)

    if gallery and testimonials and financing:
        return (
            "the project work, customer reviews, and financing options give you a lot of real proof to work with",
            "the real project work and customer proof",
        )
    if gallery and testimonials:
        return (
            "the project gallery and customer reviews stood out. You already have plenty of real proof to work with",
            "the project gallery and customer reviews",
        )
    if reviews >= 100:
        return (
            f"you already have more than {reviews:,} Google reviews doing a lot of the trust building",
            "the volume of real customer reviews",
        )
    if gallery:
        return (
            "the project gallery stood out. There is enough real work there to tell a better story than a typical stock ad",
            "the real project work",
        )
    if testimonials:
        return (
            "the customer stories on the site stood out. That kind of proof is usually more convincing than polished ad copy",
            "the customer stories already on the site",
        )
    if financing:
        return (
            "the financing option caught my attention because it gives homeowners a practical reason to act now",
            "the financing angle",
        )
    return (
        "the site makes the service clear, but I think the first few seconds of the ad could do more of the selling",
        "a more specific homeowner moment",
    )


def idea_for(row: dict[str, str]) -> str:
    vertical = (row.get("vertical") or "").lower()
    ideas = {
        "roof": (
            "I had an idea for a short spot that opens with a homeowner checking for damage, "
            "then uses a few real projects to move them toward an inspection."
        ),
        "hvac": (
            "I had an idea for a short spot that opens on the moment the AC quits, "
            "then moves quickly into relief and real customer proof."
        ),
        "restoration": (
            "I had an idea for a short spot built around what a homeowner should do in the "
            "first 24 hours after water or storm damage."
        ),
        "remodel": (
            "I had an idea for a short before-and-after spot that starts with the problem room, "
            "then lets the finished work do most of the selling."
        ),
        "plumb": (
            "I had an idea for a short spot that opens on the first sign of a leak, "
            "then makes the next step feel simple and immediate."
        ),
        "electric": (
            "I had an idea for a short spot that opens with a familiar electrical problem, "
            "then uses real proof to make the service call feel like the obvious next step."
        ),
        "landscap": (
            "I had an idea for a short before-and-after spot that lets one strong property "
            "transformation tell the whole story."
        ),
        "pest": (
            "I had an idea for a short spot that opens on the moment a homeowner notices the "
            "problem, then quickly shows what happens next."
        ),
        "solar": (
            "I had an idea for a short spot that starts with the homeowner's real cost question, "
            "then answers it with a simple proof-led story."
        ),
        "window": (
            "I had an idea for a short spot built around the moment a homeowner notices the "
            "draft, noise, or rising energy bill."
        ),
    }
    for keyword, idea in ideas.items():
        if keyword in vertical:
            return idea
    return (
        "I had an idea for a short spot that opens on the exact moment a homeowner realizes "
        "they need help, then uses your real work to earn the next click."
    )


def prepare(input_path: Path, output_path: Path) -> int:
    with input_path.open(newline="", encoding="utf-8-sig") as source:
        rows = list(csv.DictReader(source))

    selected: list[dict[str, str]] = []
    seen: set[str] = set()
    for row in rows:
        email = (row.get("email") or "").strip().lower()
        tier = row.get("tier") or ""
        if not tier.startswith(("A ", "B ")):
            continue
        if not email or email in SUPPRESSED_EMAILS or email in seen:
            continue
        if (row.get("excluded_reason") or "").strip():
            continue

        observation, followup_reason = proof_details(row)
        selected.append(
            {
                "email": email,
                "first_name": clean_first_name(row.get("first_name", "")),
                "last_name": (row.get("last_name") or "").strip(),
                "company_name": (row.get("company") or "").strip(),
                "website": (row.get("website") or "").strip(),
                "observation": observation,
                "idea_line": idea_for(row),
                "followup_reason": followup_reason,
                "vertical": (row.get("vertical") or "").strip(),
                "source_rank": (row.get("rank") or "").strip(),
                "tier": tier,
                "email_status": (row.get("email_status") or "").strip(),
            }
        )
        seen.add(email)

    selected.sort(key=lambda row: int(row["source_rank"]))
    if any("—" in value or "–" in value for row in selected for value in row.values()):
        raise ValueError("Output contains a dash character that is not allowed.")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as target:
        writer = csv.DictWriter(target, fieldnames=list(selected[0]))
        writer.writeheader()
        writer.writerows(selected)

    return len(selected)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    count = prepare(args.input, args.output)
    print(f"Wrote {count} Smartlead prospects to {args.output}")


if __name__ == "__main__":
    main()
