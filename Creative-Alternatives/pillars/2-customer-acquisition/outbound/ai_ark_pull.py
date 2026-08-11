#!/usr/bin/env python3
"""
AI Ark pull — Swag Handled corporate machine, batch #1.
PROVEN 2026-06-26: search half works live (2,918 matches for the query below).

Flow:
  1) search()            POST /v1/people            -> matched profiles (NO email). Free/cheap.
  2) export_with_email() POST /v1/people/export     -> async, reveals emails. COSTS CREDITS. <=10k/batch.
     poll()              GET  /v1/people/statistics/{track_id} (or get-export-results)
  3) mobiles()           POST /v1/people/mobile-phone-finder -> mobiles for Salesfinity.

Auth: header  X-TOKEN: <AI_ARK_API_KEY>
Base: https://api.ai-ark.com/api/developer-portal

Usage:
  export AI_ARK_API_KEY=...           # (in starter-kit .env)
  python3 ai_ark_pull.py              # search only: prints count + sample (no credits)
  python3 ai_ark_pull.py --export 250 # reveal emails for the first 250 (credits)
"""
import os, sys, json, time, csv, urllib.request, urllib.error

BASE = "https://api.ai-ark.com/api/developer-portal"
KEY  = os.environ.get("AI_ARK_API_KEY")

# ---- LOCKED batch-1 query: corporate decision-makers, NY-metro, 25-500, target industries ----
TITLES     = ["office manager", "marketing manager", "operations manager",
              "director of people", "hr manager", "executive assistant"]
INDUSTRIES = ["law practice", "legal services", "accounting", "real estate",
              "marketing and advertising", "financial services"]
LOCATIONS  = ["new york", "new jersey", "connecticut"]   # company HQ; widen later
SIZE_RANGE = [{"start": 25, "end": 500}]

def _filters():
    return {
        "contact": {"experience": {"current": {"title": {"any": {"include": {"mode": "SMART", "content": TITLES}}}}}},
        "account": {
            "industry": {"any": {"include": INDUSTRIES}},
            "location": {"any": {"include": LOCATIONS}},
            "employeeSize": {"type": "RANGE", "range": SIZE_RANGE},
        },
    }

def _req(method, path, body=None, timeout=90):
    if not KEY: sys.exit("Set AI_ARK_API_KEY (it's in the starter-kit .env).")
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method,
                               headers={"X-TOKEN": KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(r, timeout=timeout) as resp:
        return json.loads(resp.read().decode())

def search(page=0, size=10):
    return _req("POST", "/v1/people", {"page": page, "size": min(size, 100), **_filters()})

def export_with_email(size):
    # async; returns a trackId. Body = filters + size (<=10000). Verify shape on first live run.
    return _req("POST", "/v1/people/export", {"size": min(size, 10000), **_filters()})

def get_export_results(track_id):
    return _req("GET", f"/v1/people/statistics/{track_id}")

def main():
    res = search(0, 5)
    total = res.get("totalElements", "?")
    print(f"MATCHES for batch-1 query: {total}")
    for p in res.get("content", [])[:5]:
        pr = p.get("profile", {})
        print(f"  • {pr.get('full_name','?'):<24} {pr.get('headline','')[:60]}")
    if len(sys.argv) > 2 and sys.argv[1] == "--export":
        n = int(sys.argv[2])
        print(f"\nExporting emails for first {n} (consumes credits)...")
        ex = export_with_email(n)
        track = ex.get("trackId") or ex.get("track_id")
        print("trackId:", track, "— poll get_export_results(track) until done, then write CSV.")
        # poll loop + CSV write to be confirmed against live export response shape on first run.

if __name__ == "__main__":
    main()
