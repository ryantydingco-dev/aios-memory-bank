#!/usr/bin/env python3
"""Canonical 'Sway handoff' schema + pure transforms.

Single source of truth for the standardized batch format, shared by
generate_oloxa_daily_batch.py (so every daily batch is born standardized) and
standardize_for_sway.py (which re-emits the older curated handoff files).

Schema spec: sway_handoff/STANDARDIZED Schema & Transform Note. Recency text
fallback reuses recency_guardrail.py.
"""
from __future__ import annotations

import datetime as dt
import re

# Standardized output column order Sway pulls from.
OUT_COLS = [
    "rank", "intent_confidence", "primary_signal_refined", "signal_date", "signal_timeframe",
    "recency_tier", "signal_date_basis", "fit_score", "behavioral_score", "total_score",
    "first_name", "last_name", "title", "company_name", "seniority", "company_size", "industry",
    "city", "state", "country", "email", "linkedin_url", "linkedin_provider_id",
    "company_website", "company_revenue",
    "confirmed_pain_evidence", "firm_intent_signals", "personalized_opener", "reasoning", "source_url",
]

# Locked value lists (agreed with Sway 2026-06-01).
CONFIDENCE_VALUES = ("HIGH", "MEDIUM_HIGH", "MEDIUM", "LOW")
SIGNAL_VALUES = ("HIRING", "CLOSING", "COMPLEXITY", "VOLUME", "GROWTH",
                 "PAIN", "HIGH_VALUE", "SPEED_PROMISE", "MOVE", "NONE")
VALID_SIGNALS = set(SIGNAL_VALUES) | {""}

# Signal-type strength (0-10) for deriving a behavioral score when none exists.
SIGNAL_STRENGTH = {
    "PAIN": 10, "HIRING": 9, "CLOSING": 8, "HIGH_VALUE": 8, "VOLUME": 7,
    "COMPLEXITY": 6, "GROWTH": 6, "SPEED_PROMISE": 5, "MOVE": 4, "NONE": 2, "": 2,
}

COUNTRY_CODE = {
    "united kingdom": "GB", "uk": "GB", "gb": "GB", "england": "GB", "scotland": "GB",
    "wales": "GB", "northern ireland": "GB", "great britain": "GB",
    "united states": "US", "usa": "US", "us": "US", "u.s.": "US", "u.s.a.": "US", "america": "US",
    "canada": "CA", "ca": "CA",
}


def country_code(name: str) -> str:
    return COUNTRY_CODE.get((name or "").strip().lower(), (name or "").strip())


def scale(v) -> int:
    """Map the source 0-12 rubric dimension to 0-50 (percent-of-max): 12->50, 10->42, 6->25."""
    try:
        return max(0, min(50, round(float(v) / 12 * 50)))
    except (TypeError, ValueError):
        return 0


# --- recency from a LinkedIn post-age phrase ------------------------------
_UNIT_DAYS = {"day": 1, "week": 7, "month": 30, "year": 365}
_AGE = re.compile(r"(\d+)\s*(day|week|month|year)s?\s+ago", re.I)


def clean_age(raw: str) -> str:
    return (raw or "").split("•")[0].strip()


def _tier(days: int) -> str:
    if days <= 30:
        return "FRESH"
    if days <= 90:
        return "RECENT"
    if days <= 365:
        return "AGING"
    return "STALE"


def recency_from_age(signal_post_age: str, anchor: dt.date):
    """LinkedIn post age -> (signal_date ISO, timeframe, tier, basis).
    Returns ('','','','') when no age phrase is present."""
    raw = clean_age(signal_post_age)
    m = _AGE.search(raw)
    if not m:
        return "", "", "", ""
    days = int(m.group(1)) * _UNIT_DAYS[m.group(2).lower()]
    d = anchor - dt.timedelta(days=days)
    tf = "this month" if days == 0 else raw
    return d.isoformat(), tf, _tier(days), "linkedin_post_age"


# --- confidence -----------------------------------------------------------
_RANK = {"HIGH": 4, "MEDIUM_HIGH": 3, "MEDIUM": 2, "LOW": 1, "": 0}


def tier_rank(c: str) -> int:
    return _RANK.get(c, 0)


def base_tier_from_total(total: int) -> str:
    """3-tier base strength from a 0-100 total, for generators with no curated tier."""
    if total >= 80:
        return "HIGH"
    if total >= 55:
        return "MEDIUM"
    return "LOW"


def refine_confidence(base: str, signal: str, recency_tier: str) -> str:
    """Refine a base tier with recency into the 4-tier list. Fresh promotes a MEDIUM
    to MEDIUM_HIGH; aging/stale caps a HIGH down; a NONE signal is always LOW."""
    cur = (base or "").strip().upper()
    if (signal or "").upper() == "NONE":
        return "LOW"
    if cur == "HIGH":
        if recency_tier in ("FRESH", "RECENT"):
            return "HIGH"
        if recency_tier == "AGING":
            return "MEDIUM_HIGH"
        return "MEDIUM"
    if cur == "MEDIUM_HIGH":
        return "MEDIUM_HIGH" if recency_tier in ("FRESH", "RECENT", "AGING") else "MEDIUM"
    if cur == "MEDIUM":
        return "MEDIUM_HIGH" if recency_tier in ("FRESH", "RECENT") else "MEDIUM"
    return "LOW"
