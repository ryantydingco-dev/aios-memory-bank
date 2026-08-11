"""
vidIQ MCP CLI — call vidIQ's MCP tools from the command line.

vidIQ MCP is a remote, stateless, streamable-HTTP MCP server
(https://mcp.vidiq.com/mcp) with Bearer auth. Great for Icahn muse hunting
(vidiq_outliers, vidiq_keyword_research, vidiq_youtube_search) and for
packaging validation (vidiq_score_title, vidiq_score_thumbnail).

Reads VIDIQ_API_KEY from .env. Every number it returns is real vidIQ data.

Usage:
  python3 scripts/vidiq.py tools                      # list all tools
  python3 scripts/vidiq.py schema <tool>              # show a tool's input schema
  python3 scripts/vidiq.py call <tool> '<json args>'  # call a tool, print result
"""

import json, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV = ROOT / ".env"
URL = "https://mcp.vidiq.com/mcp"


def key():
    for line in ENV.read_text().splitlines():
        if line.startswith("VIDIQ_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise SystemExit("VIDIQ_API_KEY not found in .env")


def rpc(method, params=None, _id=1):
    payload = {"jsonrpc": "2.0", "id": _id, "method": method}
    if params is not None:
        payload["params"] = params
    req = urllib.request.Request(
        URL, data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {key()}",
                 "Content-Type": "application/json",
                 "Accept": "application/json, text/event-stream"})
    with urllib.request.urlopen(req, timeout=180) as r:
        raw = r.read().decode()
    result = None
    for line in raw.splitlines():
        line = line.strip()
        if line.startswith("data:"):
            line = line[5:].strip()
        if not line or line.startswith("event"):
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if "result" in obj or "error" in obj:
            result = obj
    return result


def main():
    if len(sys.argv) < 2:
        print(__doc__); return
    cmd = sys.argv[1]

    if cmd == "tools":
        res = rpc("tools/list", {}, _id=2)
        for t in res["result"]["tools"]:
            d = (t.get("description") or "").splitlines()[0][:100]
            print(f"- {t['name']}: {d}")

    elif cmd == "schema":
        res = rpc("tools/list", {}, _id=2)
        for t in res["result"]["tools"]:
            if t["name"] == sys.argv[2]:
                print(json.dumps(t.get("inputSchema", {}), indent=2))
                return
        print(f"tool '{sys.argv[2]}' not found")

    elif cmd == "call":
        name = sys.argv[2]
        args = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
        res = rpc("tools/call", {"name": name, "arguments": args}, _id=3)
        if res and "result" in res:
            content = res["result"].get("content", res["result"])
            if isinstance(content, list):
                for c in content:
                    print(c.get("text", json.dumps(c)) if isinstance(c, dict) else c)
            else:
                print(json.dumps(content, indent=2))
        else:
            print(json.dumps(res, indent=2))

    else:
        print(f"unknown command: {cmd}\n{__doc__}")


if __name__ == "__main__":
    main()
