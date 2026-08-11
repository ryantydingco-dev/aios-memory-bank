#!/usr/bin/env python3
"""Deterministic Smartlead deliverability safety loop.

Reads Smartlead only. It never changes campaigns or accounts. State and reports
are written under outputs/loops/deliverability-safety. Stdout is intentionally
empty when there is no meaningful change so a no-agent cron job stays silent.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "outputs/loops/deliverability-safety"
API = "https://server.smartlead.ai/api/v1"


def api_get(path: str, key: str, params: dict[str, Any] | None = None) -> Any:
    query = {"api_key": key, **(params or {})}
    for attempt in range(5):
        response = requests.get(API + path, params=query, timeout=45)
        if response.status_code == 429 or response.status_code >= 500:
            time.sleep(2**attempt)
            continue
        if not response.ok:
            raise RuntimeError(f"GET {path} -> {response.status_code}: {response.text[:300]}")
        return response.json()
    raise RuntimeError(f"GET {path} retries exhausted")


def list_accounts(key: str) -> list[dict[str, Any]]:
    accounts: list[dict[str, Any]] = []
    for offset in range(0, 2000, 100):
        payload = api_get("/email-accounts/", key, {"offset": offset, "limit": 100})
        batch = payload if isinstance(payload, list) else payload.get("data") or payload.get("email_accounts") or []
        if not isinstance(batch, list):
            raise RuntimeError("Unknown Smartlead email-account response shape")
        if not batch:
            break
        accounts.extend(batch)
        if len(batch) < 100:
            break
    return accounts


def list_campaigns(key: str) -> list[dict[str, Any]]:
    payload = api_get("/campaigns/", key)
    campaigns = payload if isinstance(payload, list) else payload.get("campaigns") or payload.get("data") or []
    if not isinstance(campaigns, list):
        raise RuntimeError("Unknown Smartlead campaign response shape")
    return campaigns


def account_state(account: dict[str, Any]) -> dict[str, Any]:
    email = account.get("from_email") or account.get("email") or ""
    domain = email.rsplit("@", 1)[-1].lower() if "@" in email else "unknown"
    warm = account.get("warmup_details") or {}
    smtp = bool(account.get("is_smtp_success"))
    imap = bool(account.get("is_imap_success"))
    blocked = bool(warm.get("is_warmup_blocked"))
    return {
        "id": int(account["id"]),
        "domain_hash": hashlib.sha256(domain.encode()).hexdigest()[:12],
        "from_name": account.get("from_name") or "",
        "smtp_ok": smtp,
        "imap_ok": imap,
        "blocked": blocked,
        "healthy_connected": smtp and imap and not blocked,
        "warmup_status": warm.get("status") or "unknown",
        "reputation": warm.get("warmup_reputation"),
        "sent_today": account.get("daily_sent_count") or 0,
    }


def campaign_account_ids(campaign_id: int, key: str) -> set[int]:
    payload = api_get(f"/campaigns/{campaign_id}/email-accounts", key)
    rows = payload if isinstance(payload, list) else payload.get("email_accounts") or payload.get("data") or []
    if not isinstance(rows, list):
        raise RuntimeError(f"Unknown campaign-account response shape for {campaign_id}")
    return {int(row["id"]) for row in rows if row.get("id") is not None}


def build_report(key: str, previous: dict[str, Any] | None) -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    states = {str(s["id"]): s for s in map(account_state, list_accounts(key))}
    failed = {int(i) for i, s in states.items() if not s["healthy_connected"]}
    blocked = {int(i) for i, s in states.items() if s["blocked"]}
    previous_states = (previous or {}).get("accounts") or {}
    previous_failed = {int(i) for i, s in previous_states.items() if not s.get("healthy_connected")}
    previous_blocked = {int(i) for i, s in previous_states.items() if s.get("blocked")}

    campaigns = list_campaigns(key)
    affected = []
    monitored_statuses = {"ACTIVE", "DRAFTED", "PAUSED"}
    for campaign in campaigns:
        if campaign.get("status") not in monitored_statuses:
            continue
        campaign_id = int(campaign["id"])
        assigned = campaign_account_ids(campaign_id, key)
        failed_assigned = sorted(assigned & failed)
        if failed_assigned:
            affected.append({
                "campaign_id": campaign_id,
                "campaign_name": campaign.get("name") or "",
                "campaign_status": campaign.get("status"),
                "failed_account_ids": failed_assigned,
                "failed_account_count": len(failed_assigned),
            })

    total = len(states)
    healthy = total - len(failed)
    return {
        "generated_at": now,
        "metrics": {
            "total_accounts": total,
            "healthy_connected": healthy,
            "healthy_connected_percentage": round((healthy / total * 100) if total else 0, 2),
            "connection_or_block_failures": len(failed),
            "blocked_accounts": len(blocked),
            "monitored_campaigns": sum(c.get("status") in monitored_statuses for c in campaigns),
            "affected_campaigns": len(affected),
        },
        "changes": {
            "new_failures": sorted(failed - previous_failed),
            "recoveries": sorted(previous_failed - failed),
            "newly_blocked": sorted(blocked - previous_blocked),
            "unblocked": sorted(previous_blocked - blocked),
        },
        "affected_campaigns": affected,
        "accounts": states,
        "read_only": True,
    }


def public_summary(report: dict[str, Any], first_run: bool) -> str:
    metrics = report["metrics"]
    changes = report["changes"]
    active_affected = [c for c in report["affected_campaigns"] if c["campaign_status"] == "ACTIVE"]
    meaningful = first_run or any(changes.values()) or bool(active_affected)
    if not meaningful:
        return ""
    lines = [
        "Smartlead deliverability safety alert",
        f"Healthy connected: {metrics['healthy_connected']}/{metrics['total_accounts']} ({metrics['healthy_connected_percentage']}%)",
        f"Failures: {metrics['connection_or_block_failures']} | Blocked: {metrics['blocked_accounts']}",
    ]
    if changes["new_failures"]:
        lines.append(f"New failure account IDs: {', '.join(map(str, changes['new_failures']))}")
    if changes["recoveries"]:
        lines.append(f"Recovered account IDs: {', '.join(map(str, changes['recoveries']))}")
    if changes["newly_blocked"]:
        lines.append(f"Newly blocked account IDs: {', '.join(map(str, changes['newly_blocked']))}")
    if report["affected_campaigns"]:
        lines.append("Affected campaigns:")
        for campaign in report["affected_campaigns"]:
            lines.append(
                f"- #{campaign['campaign_id']} {campaign['campaign_name']} "
                f"[{campaign['campaign_status']}]: {campaign['failed_account_count']} failed assigned account(s)"
            )
    lines.append("No campaign or account settings were changed.")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--always-print", action="store_true")
    args = parser.parse_args()
    load_dotenv(ROOT / ".env")
    load_dotenv(Path.home() / ".hermes/.env")
    key = os.getenv("SMARTLEAD_API_KEY", "").strip()
    if not key:
        print("ERROR: SMARTLEAD_API_KEY is not configured", file=sys.stderr)
        return 2

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "runs").mkdir(exist_ok=True)
    state_path = OUT / "state.json"
    previous = None
    if state_path.exists():
        try:
            previous = json.loads(state_path.read_text())
        except json.JSONDecodeError:
            print("ERROR: prior deliverability state is invalid JSON", file=sys.stderr)
            return 2

    try:
        report = build_report(key, previous)
    except (requests.RequestException, RuntimeError, ValueError, KeyError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    serialized = json.dumps(report, indent=2) + "\n"
    (OUT / "runs" / f"{stamp}.json").write_text(serialized)
    (OUT / "latest-report.json").write_text(serialized)
    state_path.write_text(serialized)
    summary = public_summary(report, previous is None)
    if args.always_print and not summary:
        metrics = report["metrics"]
        summary = f"No meaningful change. Healthy connected: {metrics['healthy_connected']}/{metrics['total_accounts']}."
    if summary:
        print(summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
