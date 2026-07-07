#!/usr/bin/env python3
"""Send a message to Telegram via the Bot API (stdlib only).

Reads the message from stdin (or --text) and uses TELEGRAM_BOT_TOKEN +
TELEGRAM_CHAT_ID from the environment. Splits messages >4000 chars.
Exits non-zero on any failure so callers can detect it.

Usage:
  printf '%s' "$BRIEF" | python3 telegram_send.py
  python3 telegram_send.py --text "hello" --chat 123456
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request


def send_chunk(token, chat, text):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    body = json.dumps({
        "chat_id": chat,
        "text": text,
        "disable_web_page_preview": True,
    }).encode()
    req = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read() or b"{}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", default=None)
    ap.add_argument("--chat", default=None, help="override TELEGRAM_CHAT_ID")
    args = ap.parse_args()

    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat = (args.chat or os.environ.get("TELEGRAM_CHAT_ID", "")).strip()
    text = args.text if args.text is not None else sys.stdin.read()

    if not token or not chat:
        print("ERROR: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set", file=sys.stderr)
        sys.exit(2)
    if not text.strip():
        print("ERROR: empty message", file=sys.stderr)
        sys.exit(3)

    chunks = [text[i:i + 4000] for i in range(0, len(text), 4000)]
    ok = True
    for ch in chunks:
        try:
            resp = send_chunk(token, chat, ch)
            if not resp.get("ok"):
                print(f"Telegram API error: {resp}", file=sys.stderr)
                ok = False
        except urllib.error.HTTPError as e:
            print(f"HTTP {e.code}: {e.read().decode(errors='replace')}", file=sys.stderr)
            ok = False
        except Exception as e:  # noqa: BLE001
            print(f"send failed: {e}", file=sys.stderr)
            ok = False
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
