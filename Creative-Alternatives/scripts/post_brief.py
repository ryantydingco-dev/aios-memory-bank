"""
AIOS Client Workspace — Daily Brief Poster

Delivers the generated brief:
  1. Slack  — POST Block Kit payload to SLACK_WEBHOOK_URL
  2. Email  — SMTP mirror to BRIEF_EMAIL_TO (Kenny's inbox) via
              SMTP_USER / SMTP_APP_PASSWORD (Gmail app password)

Missing credentials = graceful skip (exit 0), same philosophy as collectors.
A real delivery failure (webhook non-200, SMTP auth error) exits 1 so the
log shows it.

Usage:
    python scripts/post_brief.py payload.json [--md brief.md] [--dry-run]
"""

import argparse
import json
import smtplib
import subprocess
import sys
from datetime import date
from email.mime.text import MIMEText
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import get_env  # noqa: E402

try:
    import requests
except ImportError:
    raise ImportError("Missing 'requests' — run: pip install requests")

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
ARCHIVE_DIR = WORKSPACE_ROOT / "outputs" / "daily-brief"


def post_slack(payload, dry_run=False, message=None):
    url = get_env("SLACK_WEBHOOK_URL", required=False)
    if not url:
        target = get_env("HERMES_SLACK_TARGET", required=False) or "slack:daily-brief"
        if dry_run:
            print("slack: DRY RUN — Hermes target {}, {} blocks".format(
                target, len(payload.get("blocks", []))))
            return "dry-run"
        message = message or payload.get("text", "")
        result = subprocess.run(
            [sys.executable, "-m", "hermes_cli.main", "--profile",
             "creative-alternatives", "send", "--to", target, message],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode != 0:
            detail = (result.stderr or result.stdout).strip()[:200]
            print("slack: FAILED via Hermes ({})".format(detail))
            return "failed"
        print("slack: OK via Hermes ({})".format(target))
        return "ok"
    if dry_run:
        print("slack: DRY RUN — payload valid, {} blocks".format(len(payload.get("blocks", []))))
        return "dry-run"
    r = requests.post(url, json=payload, timeout=15)
    if r.status_code != 200:
        print("slack: FAILED ({}) {}".format(r.status_code, r.text[:200]))
        return "failed"
    print("slack: OK")
    return "ok"


def post_email(md_text, dry_run=False):
    user = get_env("SMTP_USER", required=False)
    pwd = get_env("SMTP_APP_PASSWORD", required=False)
    to = get_env("BRIEF_EMAIL_TO", required=False)
    if not (user and pwd and to):
        print("email: SKIPPED (SMTP_USER / SMTP_APP_PASSWORD / BRIEF_EMAIL_TO not all set)")
        return "skipped"
    if dry_run:
        print("email: DRY RUN — would send {} chars to {}".format(len(md_text), to))
        return "dry-run"

    # Slack mrkdwn -> plain-ish text for email
    body = md_text.replace("*", "").replace("_", "")
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = "☀️ CA Daily Brief — {}".format(date.today().strftime("%b %-d, %Y"))
    msg["From"] = user
    msg["To"] = to

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=30) as s:
        s.login(user, pwd)
        s.sendmail(user, [to], msg.as_string())
    print("email: OK -> {}".format(to))
    return "ok"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("payload", help="Path to Block Kit JSON from generate_brief.py")
    parser.add_argument("--md", default=None,
                        help="Markdown brief for the email body (default: today's archive file)")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    payload = json.loads(Path(args.payload).read_text())

    md_path = Path(args.md) if args.md else ARCHIVE_DIR / "{}.md".format(date.today().isoformat())
    md_text = md_path.read_text() if md_path.exists() else payload.get("text", "")

    slack_result = post_slack(payload, args.dry_run, md_text)

    email_result = "failed"
    try:
        email_result = post_email(md_text, args.dry_run)
    except Exception as e:
        print("email: FAILED ({})".format(e))

    if slack_result == "failed" or email_result == "failed":
        sys.exit(1)
    if slack_result == "skipped" and email_result == "skipped":
        print("warning: no delivery channel configured — brief archived only")
    sys.exit(0)


if __name__ == "__main__":
    main()
