#!/usr/bin/env python3
"""Write today's LinkedIn work list. Finder only. Does not send.

Reads the existing CA LinkedIn engine queue (9k+ show buyers with profile URLs)
and writes Personal Brand/daily-prep/YYYY-MM-DD.md: people to DM/connect,
plus comment-profile links from watchlist.json.
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
BRAND = HERE.parent
STATE = Path(
    "/Users/ryantydingco/Documents/Creative-Alternatives-AIOS/"
    "pillars/2-customer-acquisition/outbound/linkedin-engine/state.json"
)
WATCH = HERE / "watchlist.json"
OUT_DIR = BRAND / "daily-prep"
DM_N = 10
COMMENT_N = 8


def _blob(p: dict) -> str:
    return " ".join(
        str(p.get(k) or "") for k in ("title", "company", "show", "first_name", "last_name")
    ).lower()


def pick_dms(prospects: dict, watch: dict) -> list[dict]:
    title_ok = tuple(w.lower() for w in watch["buyer_title_words"])
    skip_show = tuple(s.lower() for s in watch["skip_show_words"])
    skip_co = tuple(s.lower() for s in watch["skip_company_words"])
    picked = []
    # Repliers and openers first if they ever land in state. Today they are all cold.
    for tier in ("replier", "opener", "cold"):
        for p in prospects.values():
            if p.get("state") != "TARGET":
                continue
            if (p.get("tier") or "cold") != tier:
                continue
            if not p.get("linkedin"):
                continue
            title = (p.get("title") or "").lower()
            show = (p.get("show") or "").lower()
            company = (p.get("company") or "").lower()
            if any(s in show for s in skip_show):
                continue
            if any(s in company for s in skip_co):
                continue
            if title and not any(w in title for w in title_ok):
                continue
            picked.append(p)
            if len(picked) >= DM_N:
                return picked
    return picked


def write_pack(day: str, dms: list[dict], watch: dict) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"{day}.md"
    lines = [
        f"# LinkedIn list — {day}",
        "",
        "Finder only. Open the link, send the connect or comment yourself.",
        "",
        "## DMs / connects (10)",
        "",
        "| # | Name | Title | Company | Show | LinkedIn |",
        "|---|---|---|---|---|---|",
    ]
    for i, p in enumerate(dms, 1):
        name = f"{p.get('first_name') or ''} {p.get('last_name') or ''}".strip()
        url = p.get("linkedin") or ""
        lines.append(
            f"| {i} | {name} | {p.get('title') or ''} | {p.get('company') or ''} "
            f"| {p.get('show') or ''} | {url} |"
        )
    lines += [
        "",
        "## Posts to comment on",
        "",
        "Open each profile. Comment on their newest post if it is from this week.",
        "",
    ]
    for i, row in enumerate(watch.get("comment_profiles") or [], 1):
        lines.append(f"{i}. [{row['name']}]({row['url']}) — {row.get('why', '')}")
    lines += [
        "",
        f"Need {COMMENT_N} comments total. After the watchlist, search LinkedIn posts "
        "for: company retreat, trade show booth, team offsite, employee onboarding.",
        "",
    ]
    path.write_text("\n".join(lines) + "\n")
    return path


def main() -> None:
    watch = json.loads(WATCH.read_text())
    prospects = json.loads(STATE.read_text()).get("prospects") or {}
    dms = pick_dms(prospects, watch)
    path = write_pack(date.today().isoformat(), dms, watch)
    print(f"wrote {path} ({len(dms)} DMs)")


if __name__ == "__main__":
    main()
