#!/usr/bin/env python3
"""Score Ryan's LinkedIn Connections.csv for merch buyers, then emit a daily DM queue.

Drop LinkedIn's official export here:
  inbound/Connections.csv

Run:
  python3 score_connections.py
  python3 score_connections.py --queue 10

Does not send anything. Drafts only. Ryan pastes into LinkedIn himself.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
INBOUND = HERE / "inbound"
OUTBOUND = HERE / "outbound"
RULES_PATH = HERE / "icp_rules.json"
STATE_PATH = HERE / "state.json"
DEFAULT_CSV = INBOUND / "Connections.csv"

MONTHS = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
    "apr": 4, "april": 4, "may": 5, "jun": 6, "june": 6, "jul": 7, "july": 7,
    "aug": 8, "august": 8, "sep": 9, "september": 9, "oct": 10, "october": 10,
    "nov": 11, "november": 11, "dec": 12, "december": 12,
}


def load_rules() -> dict:
    return json.loads(RULES_PATH.read_text())


def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"touched": {}}


def save_state(state: dict) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2) + "\n")


def parse_connected_on(raw: str) -> datetime | None:
    s = (raw or "").strip()
    if not s:
        return None
    # "15 Jan 2020" or "15 January 2020"
    m = re.match(r"^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$", s)
    if m:
        day, mon, year = int(m.group(1)), m.group(2).lower(), int(m.group(3))
        month = MONTHS.get(mon[:3] if len(mon) > 3 and mon[:3] in MONTHS else mon)
        if month:
            try:
                return datetime(year, month, day)
            except ValueError:
                return None
    for fmt in ("%B %d, %Y", "%b %d, %Y", "%m/%d/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def find_header_row(path: Path) -> int:
    """LinkedIn puts a Notes: block above the real CSV header."""
    with path.open(newline="", encoding="utf-8-sig") as f:
        for i, line in enumerate(f):
            if line.lower().startswith("first name"):
                return i
    raise SystemExit(f"No 'First Name' header in {path}. Is this the LinkedIn Connections export?")


def read_connections(path: Path) -> list[dict]:
    skip = find_header_row(path)
    with path.open(newline="", encoding="utf-8-sig") as f:
        for _ in range(skip):
            next(f)
        rows = list(csv.DictReader(f))
    out = []
    for r in rows:
        first = (r.get("First Name") or "").strip()
        last = (r.get("Last Name") or "").strip()
        url = (r.get("URL") or r.get("LinkedIn URL") or "").strip()
        if not first and not url:
            continue
        out.append({
            "first_name": first,
            "last_name": last,
            "url": url,
            "email": (r.get("Email Address") or "").strip(),
            "company": (r.get("Company") or "").strip(),
            "position": (r.get("Position") or "").strip(),
            "connected_on": (r.get("Connected On") or "").strip(),
        })
    return out


def hay(row: dict) -> str:
    return f"{row['position']} {row['company']}".lower()


def score_row(row: dict, rules: dict) -> dict:
    text = hay(row)
    skip_hits = [t for t in rules["skip_titles"] if t in text]
    skip_cos = [c for c in rules["skip_companies"] if c in text]
    if skip_hits or skip_cos:
        return {
            "score": 0,
            "tier": "skip",
            "lane": "skip",
            "why": "skip: " + ", ".join(skip_hits + skip_cos),
        }

    best_lane = ""
    best_pri = 0
    hits: list[str] = []
    for lane, spec in rules["lanes"].items():
        lane_hits = []
        for kw in spec.get("title", []):
            if kw.lower() in text:
                lane_hits.append(kw)
        for kw in spec.get("company", []):
            if kw.lower() in text:
                lane_hits.append(kw)
        if lane_hits and spec["priority"] > best_pri:
            best_pri = spec["priority"]
            best_lane = lane
            hits = lane_hits

    connected = parse_connected_on(row["connected_on"])
    ca_start = datetime.fromisoformat(rules["ca_start"])
    knew_ca = bool(connected and connected >= ca_start)

    if best_pri >= 85:
        tier = "A"
    elif best_pri >= 72:
        tier = "B"
    elif best_pri >= 68:
        tier = "C"
    else:
        return {
            "score": 0,
            "tier": "other",
            "lane": "",
            "why": "no merch-buyer title/company match",
            "knew_ca": knew_ca,
        }

    bonus = 8 if knew_ca else 0
    email_bonus = 5 if row["email"] else 0
    score = best_pri + bonus + email_bonus + min(len(hits) * 2, 6)
    return {
        "score": score,
        "tier": tier,
        "lane": best_lane,
        "why": f"{best_lane}: " + ", ".join(hits[:4]),
        "knew_ca": knew_ca,
    }


def draft_dm(row: dict, scored: dict) -> str:
    first = row["first_name"] or "there"
    company = row["company"] or "your org"
    lane = scored["lane"]
    rekindle = not scored.get("knew_ca", False)

    if rekindle:
        openers = {
            "camps": (
                f"Hey {first}, it's Ryan. Been a minute.\n\n"
                f"Still at {company}? Curious how this season's looking."
            ),
            "schools": (
                f"Hey {first}, it's Ryan. It's been a while.\n\n"
                f"Fall still a circus over at {company}?"
            ),
            "clubs_sports": (
                f"Hey {first}, Ryan here. Haven't talked in a bit.\n\n"
                f"How's the season going at {company}?"
            ),
            "events": (
                f"Hey {first}, it's Ryan. Been too long.\n\n"
                f"You still producing events at {company}?"
            ),
            "office_ops": (
                f"Hey {first}, Ryan here. Catching up with people I actually know instead of strangers this week.\n\n"
                f"You still holding {company} together?"
            ),
            "hr_people": (
                f"Hey {first}, it's Ryan. Been a while.\n\n"
                f"Still on the people side at {company}?"
            ),
            "marketing_swag": (
                f"Hey {first}, Ryan here. It's been a minute.\n\n"
                f"What are you working on at {company} these days?"
            ),
            "professional_firms": (
                f"Hey {first}, it's Ryan. Been a while.\n\n"
                f"How's life at {company}?"
            ),
            "org_owners": (
                f"Hey {first}, Ryan here. Catching up with people from my actual network this week.\n\n"
                f"How's {company} going?"
            ),
        }
        return openers.get(lane, f"Hey {first}, it's Ryan. Been a while.\n\nHow've you been?")

    proof = {
        "camps": (
            f"Hey {first}, still running things at {company}?\n\n"
            "We've been standing up merch stores for camps so families buy direct and the camp doesn't sit on inventory. "
            "I can mock a preview with your logo if useful. No call needed."
        ),
        "schools": (
            f"Hey {first}, saw you're still at {company}.\n\n"
            "If families are still buying random gear, I can send a store preview with your logo already on it. "
            "Free, and it doesn't commit you to anything."
        ),
        "clubs_sports": (
            f"Hey {first}, you still at {company}?\n\n"
            "I can mock a member store / team shop with your logo on a few pieces if that's ever on your plate. Same day, no call."
        ),
        "events": (
            f"Hey {first}, still producing events at {company}?\n\n"
            "Next time a client needs branded kits, I can mock their logo on a few pieces so you have something to show. Free, usually same day."
        ),
        "office_ops": (
            f"Hey {first}, you still the person who actually makes {company} run?\n\n"
            "If a retreat, client-gift run, or onboarding kit is coming up, I'll put the logo on a few pieces and send mockups. You don't have to hop on a call."
        ),
        "hr_people": (
            f"Hey {first}, still on the people side at {company}?\n\n"
            "We do onboarding kits and retreat gear. If that's on your plate I can mock a few pieces with the logo. No meeting required."
        ),
        "marketing_swag": (
            f"Hey {first}, you still owning brand/events at {company}?\n\n"
            "Tell me the next conference or gala and I'll put the logo on a few pieces. Mockups same day, no deck."
        ),
        "professional_firms": (
            f"Hey {first}, still at {company}?\n\n"
            "If a retreat or client-gift run is coming up, I can send mockups with the logo already on them. Free, no call."
        ),
        "org_owners": (
            f"Hey {first}, still running {company}?\n\n"
            "If you ever need merch that doesn't look like a trade-show afterthought, I'll mock your logo on a couple of pieces. No deck, no call."
        ),
    }
    return proof.get(lane, (
        f"Hey {first}, it's Ryan from Creative Alternatives.\n\n"
        f"If anything's coming up that needs a logo on it, I can send mockups with {company}'s brand already on them."
    ))


def write_ranked(rows: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "tier", "score", "lane", "first_name", "last_name", "company",
        "position", "url", "email", "connected_on", "knew_ca", "why", "draft",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in fields})


def write_queue(batch: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        f"# LinkedIn warm queue — {datetime.now().strftime('%Y-%m-%d')}",
        "",
        "Send these yourself. Stop on any reply. Do not pitch on the first DM if the draft is a rekindle.",
        "",
    ]
    for i, r in enumerate(batch, 1):
        lines += [
            f"## {i}. {r['first_name']} {r['last_name']}  ({r['tier']} / {r['lane']})",
            f"- {r['position']} @ {r['company']}",
            f"- {r['url']}",
            f"- why: {r['why']}",
            "",
            "```",
            r["draft"],
            "```",
            "",
        ]
    path.write_text("\n".join(lines) + "\n")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("csv", nargs="?", default=str(DEFAULT_CSV), help="LinkedIn Connections.csv")
    ap.add_argument("--queue", type=int, default=10, help="How many new DMs to draft today")
    args = ap.parse_args()

    src = Path(args.csv).expanduser()
    if not src.exists():
        INBOUND.mkdir(parents=True, exist_ok=True)
        raise SystemExit(
            f"No file at {src}.\n\n"
            "LinkedIn export (10 min):\n"
            "  Settings → Data privacy → Get a copy of your data\n"
            "  → Want something in particular → Connections\n"
            "  Drop Connections.csv at:\n"
            f"  {DEFAULT_CSV}"
        )

    rules = load_rules()
    state = load_state()
    touched = state.setdefault("touched", {})
    people = read_connections(src)

    ranked = []
    for row in people:
        s = score_row(row, rules)
        rec = {**row, **s}
        rec["knew_ca"] = "yes" if s.get("knew_ca") else "no"
        rec["draft"] = draft_dm(row, s) if s["tier"] in {"A", "B", "C"} else ""
        ranked.append(rec)

    ranked.sort(key=lambda r: (-int(r["score"]), r["last_name"], r["first_name"]))
    OUTBOUND.mkdir(parents=True, exist_ok=True)
    ranked_path = OUTBOUND / "ranked.csv"
    write_ranked(ranked, ranked_path)

    counts: dict[str, int] = {}
    for r in ranked:
        counts[r["tier"]] = counts.get(r["tier"], 0) + 1

    unused = [
        r for r in ranked
        if r["tier"] in {"A", "B", "C"} and r["url"] and r["url"] not in touched
    ]
    batch = unused[: args.queue]
    today = datetime.now().strftime("%Y-%m-%d")
    queue_path = OUTBOUND / f"queue-{today}.md"
    write_queue(batch, queue_path)

    for r in batch:
        touched[r["url"]] = {
            "date": today,
            "name": f"{r['first_name']} {r['last_name']}".strip(),
            "lane": r["lane"],
            "tier": r["tier"],
        }
    save_state(state)

    print(f"connections: {len(people)}")
    print("tiers:", dict(sorted(counts.items())))
    print(f"ranked: {ranked_path}")
    print(f"today's queue ({len(batch)}): {queue_path}")
    leftover = len(unused) - len(batch)
    print(f"still untouched A/B/C: {max(leftover, 0)}")


if __name__ == "__main__":
    main()
