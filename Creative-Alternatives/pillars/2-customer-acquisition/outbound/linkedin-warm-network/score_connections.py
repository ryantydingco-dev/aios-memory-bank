#!/usr/bin/env python3
"""Score Ryan's LinkedIn Connections.csv for likely CA buyers, then emit a review queue.

Drop LinkedIn's official export here:
  inbound/Connections.csv

Run:
  python3 score_connections.py
  python3 score_connections.py --queue 10
  python3 score_connections.py --mark-sent LINKEDIN_URL

Does not research, draft, or send. A title match is a candidate, not permission to pitch.
"""
from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
INBOUND = HERE / "inbound"
OUTBOUND = HERE / "outbound"
RULES_PATH = HERE / "icp_rules.json"
STATE_PATH = HERE / "state.json"
DEFAULT_CSV = INBOUND / "Connections.csv"

def load_rules() -> dict:
    return json.loads(RULES_PATH.read_text())


def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"touched": {}}


def save_state(state: dict) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2) + "\n")


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
        }

    score = best_pri + min(len(hits) * 2, 6)
    return {
        "score": score,
        "tier": tier,
        "lane": best_lane,
        "why": f"{best_lane}: " + ", ".join(hits[:4]),
    }


def write_ranked(rows: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "tier", "score", "lane", "first_name", "last_name", "company",
        "position", "url", "connected_on", "why", "customer_check",
        "relationship_context", "recent_signal", "message_status",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in fields})


def write_queue(batch: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        f"# LinkedIn connection review queue: {datetime.now().strftime('%Y-%m-%d')}",
        "",
        "These are title-based candidates, not approved messages. Research and review each person before drafting.",
        "No pitch in the first message. Do not send from this file.",
        "",
    ]
    for i, r in enumerate(batch, 1):
        lines += [
            f"## {i}. {r['first_name']} {r['last_name']}  ({r['tier']} / {r['lane']})",
            f"- {r['position']} @ {r['company']}",
            f"- {r['url']}",
            f"- ICP match: {r['why']}",
            "- [ ] Confirm current role and company",
            "- [ ] Check QuickBooks / CA customer status",
            "- [ ] Add one real relationship detail",
            "- [ ] Add one recent profile, post, event, hiring, or gifting signal",
            "- [ ] Bring the context to chat for a light-edit first message",
            "",
        ]
    path.write_text("\n".join(lines) + "\n")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("csv", nargs="?", default=str(DEFAULT_CSV), help="LinkedIn Connections.csv")
    ap.add_argument("--queue", type=int, default=10, help="How many candidates to review today")
    ap.add_argument("--mark-sent", metavar="LINKEDIN_URL", help="Mark a profile sent after Ryan sends manually")
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

    if args.mark_sent:
        person = next((p for p in people if p["url"] == args.mark_sent), None)
        if not person:
            raise SystemExit("That LinkedIn URL was not found in the supplied Connections.csv")
        today = datetime.now().strftime("%Y-%m-%d")
        touched[args.mark_sent] = {
            "date": today,
            "name": f"{person['first_name']} {person['last_name']}".strip(),
        }
        save_state(state)
        print(f"marked sent: {touched[args.mark_sent]['name']} on {today}")
        return

    ranked = []
    for row in people:
        s = score_row(row, rules)
        rec = {**row, **s}
        if s["tier"] in {"A", "B", "C"}:
            rec["customer_check"] = "REQUIRED"
            rec["relationship_context"] = "NEED YOUR CONTEXT"
            rec["recent_signal"] = "RESEARCH"
            rec["message_status"] = "DO NOT DRAFT YET"
        else:
            rec["customer_check"] = ""
            rec["relationship_context"] = ""
            rec["recent_signal"] = ""
            rec["message_status"] = ""
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

    print(f"connections: {len(people)}")
    print("tiers:", dict(sorted(counts.items())))
    print(f"ranked: {ranked_path}")
    print(f"today's review queue ({len(batch)}): {queue_path}")
    leftover = len(unused) - len(batch)
    print(f"still untouched A/B/C: {max(leftover, 0)}")


if __name__ == "__main__":
    main()
