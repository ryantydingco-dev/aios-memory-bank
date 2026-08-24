#!/usr/bin/env python3
"""IdeaBrowser fetcher for the Video Factory.

Talks directly to Ryan's IdeaBrowser remote MCP endpoint (stdlib only, no `mcp` pkg).
Pulls ideas / trends / founder profile / deep research so the Video Factory has
real source material instead of guesses.

Usage:
    python ideabrowser-fetch.py profile
    python ideabrowser-fetch.py ideas --sort highest_opportunity --query "AI"
    python ideabrowser-fetch.py trends --sort growth --limit 15
    python ideabrowser-fetch.py research --idea 1458
    python ideabrowser-fetch.py research --idea 1458 --section go_to_market

Endpoint/key live in plugins/ideabrowser/.mcp.json (AIOS). Override with IB_MCP_URL.
"""
import argparse, json, os, sys, urllib.request, urllib.error

URL = os.environ.get("IB_MCP_URL",
    "https://www.ideabrowser.com/api/mcp/mcp?key=ib_795bb2a3fbd6603a94fcfa256f2d555518a7e8a02a4e3c19")
SESSION = {"id": None}
_id = [0]

def rpc(method, params=None, notif=False):
    _id[0] += 1
    body = {"jsonrpc": "2.0", "method": method}
    if not notif: body["id"] = _id[0]
    if params is not None: body["params"] = params
    headers = {"Content-Type": "application/json",
               "Accept": "application/json, text/event-stream",
               "MCP-Protocol-Version": "2025-06-18"}
    if SESSION["id"]: headers["Mcp-Session-Id"] = SESSION["id"]
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers=headers, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=120)
    except urllib.error.HTTPError as e:
        return {"_http_error": e.code, "_body": e.read().decode()[:500]}
    sid = resp.headers.get("Mcp-Session-Id")
    if sid: SESSION["id"] = sid
    raw = resp.read().decode()
    if "text/event-stream" in resp.headers.get("Content-Type", ""):
        out = None
        for line in raw.splitlines():
            if line.startswith("data:"):
                try: out = json.loads(line[5:].strip())
                except Exception: pass
        return out
    if notif or not raw.strip(): return None
    return json.loads(raw)

def text_of(r):
    try:
        return "\n".join(p.get("text", "") for p in r["result"]["content"] if p.get("type") == "text")
    except Exception:
        return json.dumps(r, indent=2)[:1500]

def call(name, args=None):
    return text_of(rpc("tools/call", {"name": name, "arguments": args or {}}))

def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("profile")
    i = sub.add_parser("ideas")
    i.add_argument("--sort", default="highest_opportunity")
    i.add_argument("--query", default=None)
    i.add_argument("--market", default=None)
    t = sub.add_parser("trends")
    t.add_argument("--sort", default="growth")
    t.add_argument("--query", default=None)
    t.add_argument("--limit", type=int, default=15)
    r = sub.add_parser("research")
    r.add_argument("--idea", required=True)
    r.add_argument("--section", default=None)
    a = ap.parse_args()

    rpc("initialize", {"protocolVersion": "2025-06-18", "capabilities": {},
                       "clientInfo": {"name": "video-factory", "version": "1"}})
    rpc("notifications/initialized", notif=True)

    if a.cmd == "profile":
        print(call("get_founder_profile"))
    elif a.cmd == "ideas":
        args = {"sort": a.sort}
        if a.query: args["query"] = a.query
        if a.market: args["market"] = a.market
        print(call("browse_ideas", args))
    elif a.cmd == "trends":
        args = {"sort": a.sort, "limit": a.limit}
        if a.query: args["query"] = a.query
        print(call("browse_platform_trends", args))
    elif a.cmd == "research":
        args = {"idea_id": str(a.idea)}
        if a.section: args["section"] = a.section
        print(call("get_idea_research", args))

if __name__ == "__main__":
    main()
