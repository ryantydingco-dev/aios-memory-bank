#!/usr/bin/env python3
"""Validate the active Creative Alternatives revenue operating framework.

This is local and read-only. It verifies that the small governing layer exists,
that superseded plans are labeled, and that active authority documents do not
point agents back to retired ventures.
"""

from __future__ import annotations

from pathlib import Path


CA_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = CA_ROOT.parent

REQUIRED = [
    REPO_ROOT / "README.md",
    REPO_ROOT / "00 - Command Center.md",
    REPO_ROOT / "Open Loops.md",
    REPO_ROOT / "Archive" / "README.md",
    CA_ROOT / "README.md",
    CA_ROOT / "AGENTS.md",
    CA_ROOT / "CLAUDE.md",
    CA_ROOT / "plans" / "1m-6-month-game-plan.md",
    CA_ROOT / "gtd" / "daily-power-list.md",
    CA_ROOT / "gtd" / "next-actions.md",
    CA_ROOT / "operating-system" / "README.md",
    CA_ROOT / "operating-system" / "source-of-truth-map.md",
    CA_ROOT
    / "pillars"
    / "2-customer-acquisition"
    / "revenue-operations"
    / "daily-revenue-loop.md",
    CA_ROOT / "pillars" / "4-youtube-build" / "revenue-content-loop.md",
]

AUTHORITY_DOCS = [
    REPO_ROOT / "README.md",
    REPO_ROOT / "00 - Command Center.md",
    REPO_ROOT / "Active Projects.md",
    REPO_ROOT / "Open Loops.md",
    CA_ROOT / "README.md",
    CA_ROOT / "AGENTS.md",
    CA_ROOT / "CLAUDE.md",
    CA_ROOT / "operating-system" / "README.md",
    CA_ROOT / "operating-system" / "source-of-truth-map.md",
]

RETIRED_ACTIVE_PATHS = (
    "Dealthreads Outbound Engine/",
    "AI GTM Engine/",
    "Oloxa/",
    "Content-OS/",
    "Revenue Sprints/",
)


def main() -> int:
    errors: list[str] = []

    for path in REQUIRED:
        if not path.is_file() or not path.read_text(encoding="utf-8").strip():
            errors.append(f"missing or empty required file: {path.relative_to(REPO_ROOT)}")

    master = CA_ROOT / "plans" / "1m-6-month-game-plan.md"
    if master.is_file():
        text = master.read_text(encoding="utf-8")
        for phrase in ("$1,000,000", "Feb 28, 2027", "Daily Power List", "Scoreboard"):
            if phrase.lower() not in text.lower():
                errors.append(f"master plan missing expected phrase: {phrase}")

    power_list = CA_ROOT / "gtd" / "daily-power-list.md"
    if power_list.is_file():
        text = power_list.read_text(encoding="utf-8").lower()
        for phrase in ("replies triaged", "warm first-touches", "follow-ups", "scoreboard updated"):
            if phrase not in text:
                errors.append(f"daily power list missing action: {phrase}")

    for name in ("60-day-revenue-sprint.md", "90-day-revenue-plan.md"):
        path = CA_ROOT / "plans" / name
        if path.is_file() and "superseded" not in path.read_text(encoding="utf-8").lower():
            errors.append(f"superseded plan is not labeled: plans/{name}")

    for path in AUTHORITY_DOCS:
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        for retired in RETIRED_ACTIVE_PATHS:
            if retired in text and "Archive/" not in text:
                errors.append(
                    f"active authority document points to retired path {retired}: "
                    f"{path.relative_to(REPO_ROOT)}"
                )

    if errors:
        print("Revenue operating framework validation FAILED:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Revenue operating framework validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
