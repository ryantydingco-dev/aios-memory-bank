#!/usr/bin/env python3
"""Reveal mobile numbers for the tier-1 call targets via AI Ark (PAID per hit).

Reads:  outputs/coldcalls/<date>/tier1_reveal_manifest.csv  (name, domain, ...)
Writes: outputs/coldcalls/<date>/tier1_mobiles_revealed.csv  (incremental, resumable)
        outputs/coldcalls/<date>/salesfinity_import/salesfinity_tier1_revealed.csv

Calls the ai-ark MCP HTTP endpoint directly (mobile_phone_finder, name+domain input).
Resumable: already-processed emails are skipped on re-run, so a crash or rate-limit
stop costs nothing. Use --limit for a probe batch before letting it run the full list.

AUTHORIZATION: paid reveals require Ryan's explicit go (standing rule). The full
tier-1 run (362) was authorized 2026-07-11 in-session. Do not point this script at
a new manifest without a fresh go.

Usage:
    python3 scripts/ca_mobile_reveal.py --limit 10    # probe batch
    python3 scripts/ca_mobile_reveal.py               # full manifest
"""

import argparse
import csv
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def ark_url():
    cfg = json.load(open(Path.home() / ".claude.json"))
    for name, s in cfg.get("mcpServers", {}).items():
        if name == "ai-ark":
            return s["url"]
    sys.exit("ai-ark MCP server not found in ~/.claude.json")


URL = ark_url()


def mcp_call(tool, arguments, timeout=45):
    payload = {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
               "params": {"name": tool, "arguments": arguments}}
    req = urllib.request.Request(
        URL, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json",
                 "Accept": "application/json, text/event-stream",
                 "User-Agent": "ca-aios-reveal"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        body = r.read().decode()
    # response may be SSE-framed; grab the JSON line
    for line in body.splitlines():
        line = line.removeprefix("data: ").strip()
        if line.startswith("{"):
            out = json.loads(line)
            text = out.get("result", {}).get("content", [{}])[0].get("text", "")
            return json.loads(text) if text.startswith("{") or text.startswith("[") else {"raw": text}
    return {"error": "unparseable response"}


def extract_mobile(resp):
    """Pull a usable mobile number out of whatever shape the finder returns.

    Observed shape: {"id": ..., "linkedin": ..., "data": [["+18502285060"]]}
    — phone numbers arrive as bare strings in nested arrays, so collect every
    string anywhere in the structure that looks like a phone number.
    """
    def walk(o):
        if isinstance(o, dict):
            for v in o.values():
                yield from walk(v)
        elif isinstance(o, list):
            for i in o:
                yield from walk(i)
        elif isinstance(o, str):
            yield o
    for hit in walk(resp):
        digits = re.sub(r"\D", "", hit)
        if 10 <= len(digits) <= 15 and re.fullmatch(r"[+\d\s().-]+", hit):
            return hit
    return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="max NEW reveals this run (0 = all)")
    ap.add_argument("--date", default=None, help="coldcalls output date dir (default: latest)")
    args = ap.parse_args()

    base = ROOT / "outputs" / "coldcalls"
    day = Path(args.date) if args.date else sorted(base.iterdir())[-1]
    day = base / day.name
    manifest = list(csv.DictReader(open(day / "tier1_reveal_manifest.csv")))

    out_path = day / "tier1_mobiles_revealed.csv"
    done = {}
    if out_path.exists():
        done = {r["email"]: r for r in csv.DictReader(open(out_path))}
    cols = ["name", "email", "company", "domain", "campaign", "opens", "clicks", "mobile", "status"]
    fresh = not out_path.exists()
    out_f = open(out_path, "a", newline="")
    w = csv.DictWriter(out_f, fieldnames=cols)
    if fresh:
        w.writeheader()

    todo = [m for m in manifest if m["email"] not in done]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{len(done)} already processed, {len(todo)} to reveal this run")

    hits = errors = 0
    for i, m in enumerate(todo, 1):
        try:
            resp = mcp_call("mobile_phone_finder", {
                "requestBody": json.dumps({"type": "MOBILE", "name": m["name"], "domain": m["domain"]})})
            if isinstance(resp, dict) and resp.get("error"):
                # 503 = outage, 402 = out of credits, anything else = unknown API error.
                # NEVER record an error response as no_mobile — stop and resume later.
                print(f"AI Ark error — stopping (resume later, nothing lost): {resp['error']}")
                break
            mobile = extract_mobile(resp)
            status = "found" if mobile else "no_mobile"
        except Exception as e:
            mobile, status = "", f"error:{e}"
            errors += 1
            if errors >= 5:
                print("5 consecutive-ish errors — stopping")
                break
        hits += bool(mobile)
        w.writerow({"name": m["name"], "email": m["email"], "company": m["company"],
                    "domain": m["domain"], "campaign": m["campaign"],
                    "opens": m["opens"], "clicks": m["clicks"],
                    "mobile": mobile, "status": status})
        out_f.flush()
        print(f"[{i}/{len(todo)}] {m['name']} ({m['domain']}): {status} {mobile}")
        time.sleep(1.2)  # gentle on rate limits
    out_f.close()

    # Salesfinity import for everything found so far
    found = [r for r in csv.DictReader(open(out_path)) if r["mobile"]]
    imp = day / "salesfinity_import" / "salesfinity_tier1_revealed.csv"
    with open(imp, "w", newline="") as f:
        iw = csv.DictWriter(f, fieldnames=["first_name", "last_name", "company", "phone",
                                           "email", "segment", "list", "call_note"])
        iw.writeheader()
        for r in found:
            parts = r["name"].split()
            iw.writerow({"first_name": parts[0] if parts else "", "last_name": " ".join(parts[1:]),
                         "company": r["company"], "phone": r["mobile"], "email": r["email"],
                         "segment": r["campaign"], "list": "tier1_engaged",
                         "call_note": f"HOT: {r['opens']} opens, {r['clicks']} clicks, no reply - email-reference open"})
    print(f"\nthis run: {hits} mobiles found / {len(todo)} attempted")
    print(f"total revealed so far: {len(found)} -> {imp}")


if __name__ == "__main__":
    main()
