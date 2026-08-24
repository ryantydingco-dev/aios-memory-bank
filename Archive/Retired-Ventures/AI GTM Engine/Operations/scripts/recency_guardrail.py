#!/usr/bin/env python3
"""Shared recency / datable-signal guardrail for the Oloxa lead engine.

Why this exists
---------------
A "why now" must never be built on stale PR. Datable signals — anniversaries,
awards, funding/closing announcements, hiring/job ads, promotions, milestones —
decay. If we cannot timestamp one, we must treat it as STALE and down-rank it,
not promote it to HIGH confidence. The policy already lived in the markdown
governance docs (Lead Scoring Rubric, Signal Taxonomy) but was enforced nowhere
in code; this module is that enforcement, shared by the generator and the
remediation pass so the rule is defined exactly once.

Key idea: a signal is "dated" only when the *sentence describing that event*
carries a date. The lead CSVs split the celebratory quote (confirmed_pain_
evidence) from the dated context (firm_intent_signals), so we test recency at the
sentence level, not the blob level. That distinguishes a genuinely dated close
("Closed ... per post 1 month ago") from an undated one leaning on aged PR
("closed £1.32M ... a busy few weeks" + a 2025 award).

Hard rule: NEVER fabricate a date. If a date cannot be sourced from the text,
the signal is UNDATED and is penalised. A human re-verifies before outreach.

Canonical spec: AI GTM Engine/Signals/Recency Guardrail.md
"""
from __future__ import annotations

import datetime as dt
import re

# ---------------------------------------------------------------------------
# 1. Which signals are time-sensitive ("datable")
# ---------------------------------------------------------------------------
# CLOSING/HIRING/MOVE are inherently events -> always need a date.
# VOLUME is datable only when the primary claim cites an event/period.
# PAIN/COMPLEXITY/SPEED_PROMISE are structural -> never recency-penalised
# (a 200-lender panel or a standing workflow pain is true whenever observed).
ALWAYS_DATABLE = {"CLOSING", "HIRING", "MOVE"}

VOLUME_EVENT = re.compile(
    r"record (?:month|quarter|year)|this (?:week|month|quarter)|just (?:funded|closed)|"
    r"\b\d+\s*(?:deals|completions)\b|£\s?\d[\d,.]*\s*(?:m|bn|million|billion)\b|"
    r"\$\s?\d[\d,.]*\s*(?:m|bn|million|billion)\b|\bago\b|Q[1-4]\s*20\d{2}",
    re.I,
)

# Sentence-level keywords that mark the primary event for each datable label.
PRIMARY_EVENT_KW = {
    "CLOSING": re.compile(r"clos\w*|fund(?:ed|ing)|completion|completed|deal done|refinanc\w*|drawn|secured|just funded", re.I),
    "HIRING": re.compile(r"hir\w*|vacanc\w*|job ad|join(?:ing)? (?:our|the) team|new role|recruit\w*|appointed|expand\w* (?:our|the)", re.I),
    "MOVE": re.compile(r"new (?:role|firm|office)|join(?:ed|ing)|appointed|promot\w*|relocat\w*|expansion|launch\w*", re.I),
    "VOLUME": re.compile(r"record (?:month|quarter|year)|\d+\s*deals|£\s?\d|\$\s?\d|funded|completions|lent", re.I),
}

# Secondary brand/PR signals (award/anniversary/milestone). Advisory: these are
# rarely the primary signal, but if cited undated they must not imply freshness.
SECONDARY_PR = re.compile(
    r"anniversar\w*|\b\d+\s*(?:st|nd|rd|th)?\s*year(?:s)?\b|two decades|\bdecade\b|"
    r"award|broker of the year|highly commended|winner|\bwon\b|milestone",
    re.I,
)

# ---------------------------------------------------------------------------
# 2. Date extraction (explicit dates and relative/period references only)
# ---------------------------------------------------------------------------
_MON = r"(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?"
_MON_NUM = {"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
            "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12}

ISO = re.compile(r"\b(20\d{2})-(\d{1,2})-(\d{1,2})\b")
DMY = re.compile(r"\b(\d{1,2})\s+" + _MON + r"\s+(20\d{2})\b", re.I)
MON_YEAR = re.compile(r"\b" + _MON + r"\s+(20\d{2})\b", re.I)
QUARTER = re.compile(r"\bQ([1-4])\s*(20\d{2})\b", re.I)
REL_AGO = re.compile(r"\b(\d+)\s*(day|week|month|year)s?\s+ago\b", re.I)
REL_WINDOW = re.compile(r"\b(?:last|past|previous|in the last|over the last|within)\s+(\d+)\s*(day|week|month|year)s?\b", re.I)
BARE_YEAR = re.compile(r"\b(20\d{2})\b")
# "this week" / "recently" / "just funded": a *claim* of freshness with no
# verifiable date. Recorded for transparency but NEVER counts as a date.
SOFT_REL = re.compile(r"\bthis (?:week|month|quarter)\b|\blast week\b|\brecent\w*|\bjust (?:funded|closed|completed)\b|few weeks|\bcurrently\b|\blately\b", re.I)

_UNIT_DAYS = {"day": 1, "week": 7, "month": 30, "year": 365}


def _mon_num(tok: str) -> int:
    return _MON_NUM[tok[:3].lower()]


def extract_dates(text: str, anchor: dt.date):
    """Return list of (date, source_phrase, precision) found in `text`.

    precision: 'exact' (ISO/DMY) · 'month' · 'quarter' · 'relative' · 'year'.
    Relative references are anchored to `anchor`. Soft references ("this week",
    "recently") are intentionally NOT returned — they are unverifiable claims.
    """
    text = text or ""
    out = []
    for m in ISO.finditer(text):
        try:
            out.append((dt.date(int(m.group(1)), int(m.group(2)), int(m.group(3))), m.group(0), "exact"))
        except ValueError:
            pass
    for m in DMY.finditer(text):
        try:
            out.append((dt.date(int(m.group(3)), _mon_num(m.group(2)), int(m.group(1))), m.group(0), "exact"))
        except ValueError:
            pass
    for m in MON_YEAR.finditer(text):
        out.append((dt.date(int(m.group(2)), _mon_num(m.group(1)), 15), f"{m.group(1)} {m.group(2)}", "month"))
    for m in QUARTER.finditer(text):
        q, y = int(m.group(1)), int(m.group(2))
        end_month = q * 3
        last_day = 31 if end_month in (3, 12) else 30
        out.append((dt.date(y, end_month, last_day), m.group(0), "quarter"))
    for m in REL_AGO.finditer(text):
        n, unit = int(m.group(1)), m.group(2).lower()
        out.append((anchor - dt.timedelta(days=n * _UNIT_DAYS[unit]), m.group(0), "relative"))
    for m in REL_WINDOW.finditer(text):
        n, unit = int(m.group(1)), m.group(2).lower()
        out.append((anchor - dt.timedelta(days=n * _UNIT_DAYS[unit]), m.group(0), "relative"))
    covered_years = {d.year for d, _, _ in out}
    for m in BARE_YEAR.finditer(text):
        y = int(m.group(1))
        if y in covered_years:
            continue
        out.append((dt.date(y, 7, 1), m.group(0), "year"))  # low precision -> capped at AGING
        covered_years.add(y)
    return out


def freshest(dates, anchor: dt.date):
    """Pick the freshest *sourceable* date, preferring non-future ones so a
    low-precision bare-year (pinned mid-year, possibly future) never beats a real
    relative date like '2 weeks ago'."""
    if not dates:
        return None
    nonneg = [t for t in dates if (anchor - t[0]).days >= 0]
    pool = nonneg or dates
    return min(pool, key=lambda t: abs((anchor - t[0]).days))


# ---------------------------------------------------------------------------
# 3. Tiers, multipliers, confidence caps
# ---------------------------------------------------------------------------
# Reconciles Lead Scoring Rubric (<30d full / 30-90d x0.7 / >90d x0.4 / undated
# treat as >90d) with Signal Taxonomy (Fresh/Recent/Stale).
TIER_MULT = {"FRESH": 1.0, "RECENT": 0.7, "AGING": 0.4, "STALE": 0.2, "UNDATED": 0.4, "N/A": 1.0}
TIER_CONF_CAP = {"FRESH": None, "RECENT": None, "AGING": "MEDIUM", "STALE": "LOW", "UNDATED": "LOW", "N/A": None}
_CONF_RANK = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}


def _tier_for_age(days: int, precision: str) -> str:
    if days <= 30:
        tier = "FRESH"
    elif days <= 90:
        tier = "RECENT"
    elif days <= 365:
        tier = "AGING"
    else:
        tier = "STALE"
    if precision == "year" and tier in ("FRESH", "RECENT"):
        tier = "AGING"  # a bare year can't earn fresh/recent
    return tier


def cap_confidence(confidence: str, cap):
    if not cap:
        return confidence
    return cap if _CONF_RANK.get(confidence, 2) > _CONF_RANK[cap] else confidence


def _split_sentences(text: str):
    return [s for s in re.split(r"[\n.;!?•]+|✅️?|🚀|🎉|🚨", text or "") if s.strip()]


def is_primary_datable(label: str, primary_text: str) -> bool:
    label = (label or "").upper()
    if label in ALWAYS_DATABLE:
        return True
    if label == "VOLUME":
        return bool(VOLUME_EVENT.search(primary_text or ""))
    return False  # PAIN / COMPLEXITY / SPEED_PROMISE -> structural


def _pr_flag(secondary_text: str, anchor: dt.date) -> str:
    for s in _split_sentences(secondary_text):
        if SECONDARY_PR.search(s) and not extract_dates(s, anchor):
            return ("UNDATED AWARD/ANNIVERSARY/MILESTONE in secondary signals — "
                    "state the date or don't imply it's fresh")
    return ""


def assess(label: str, primary_text: str, secondary_text: str = "", anchor: dt.date | None = None) -> dict:
    """Full guardrail assessment for one lead.

    primary_text   = opener anchor (confirmed_pain_evidence) — what the touch is built on.
    secondary_text = firm_intent_signals / supporting evidence.

    Returns: datable, primary_dated, signal_date, date_source, recency_tier,
    multiplier (applied to score), confidence_cap, action_override, flag.
    """
    anchor = anchor or dt.date.today()
    label = (label or "").upper()
    primary_text = primary_text or ""
    secondary_text = secondary_text or ""
    combined = f"{primary_text}\n{secondary_text}"
    pr_flag = _pr_flag(secondary_text, anchor)

    def result(**kw):
        base = dict(datable=False, primary_dated=True, signal_date="", date_source="",
                    recency_tier="N/A", multiplier=1.0, confidence_cap=None,
                    action_override=None, flag="")
        base.update(kw)
        base["flag"] = "; ".join(x for x in (base["flag"], pr_flag) if x)
        return base

    if not is_primary_datable(label, primary_text):
        # Structural primary signal — not recency-penalised, but still surface
        # any undated brand/PR claim sitting in the secondary signals.
        return result()

    # Dates that sit on a sentence describing the PRIMARY event.
    kw = PRIMARY_EVENT_KW.get(label)
    primary_dates = []
    for s in _split_sentences(combined):
        if kw is None or kw.search(s):
            primary_dates += extract_dates(s, anchor)

    best = freshest(primary_dates, anchor)
    if best:
        d, src, prec = best
        tier = _tier_for_age((anchor - d).days, prec)
        action, flag = None, ""
        if tier == "STALE":
            action = "WATCHLIST"
            flag = f"STALE {label}: freshest dated proof '{src}' ({tier}) — do not present as a fresh 'why now'"
        elif tier == "AGING":
            flag = f"AGING {label}: freshest dated proof '{src}' ({tier}) — soften any 'this week' framing"
        return result(datable=True, primary_dated=True, signal_date=d.isoformat(),
                      date_source=src, recency_tier=tier, multiplier=TIER_MULT[tier],
                      confidence_cap=TIER_CONF_CAP[tier], action_override=action, flag=flag)

    # Primary event has NO sourceable date -> UNDATED (treat as stale).
    overall = freshest(extract_dates(combined, anchor), anchor)
    extra = ""
    rep_date = rep_src = ""
    if overall:
        d, src, prec = overall
        rep_date, rep_src = d.isoformat(), src
        extra = (f" (freshest dated item anywhere is '{src}' → "
                 f"{_tier_for_age((anchor - d).days, prec)}, but it's not the {label} event)")
    flag = (f"PRIMARY SIGNAL UNDATED ({label}): the opener anchor has no date — "
            f"treat as stale and re-verify the trigger before outreach{extra}")
    return result(datable=True, primary_dated=False, signal_date=rep_date, date_source=rep_src,
                  recency_tier="UNDATED", multiplier=TIER_MULT["UNDATED"], confidence_cap="LOW",
                  action_override="NEEDS_RESEARCH", flag=flag)


# Score-band -> confidence, mirrored from the generator so both stay in lockstep.
def intent_confidence(score: int) -> str:
    if score >= 45:
        return "HIGH"
    if score >= 32:
        return "MEDIUM"
    return "LOW"


if __name__ == "__main__":
    today = dt.date(2026, 5, 31)
    cases = [
        ("Bailey (undated close + 2025 PR)", "CLOSING",
         "£1.32M Funded Across 4 Sectors — a busy and rewarding few weeks securing over £1.3 million in funding.",
         "Moorgate 80+ lender panel; NACFB Asset & Leasing Finance Broker of the Year won Sep 2025; Bailey closed £1.32M across motorsport, construction, brewery, haulage in a single multi-week window; job ad 5 months ago; 10-year anniversary 2025 (incorporated 2015)"),
        ("George (dated close)", "CLOSING",
         "Funded through Development Finance. Successfully exited onto a Development Exit Bridge.",
         "Closed Sheffield 12-unit industrial development per LinkedIn post 1 month ago"),
        ("Portman 19yrs (undated milestone)", "CLOSING",
         "19 years. £1.8bn secured. Portman is officially 19.", "CLOSING,MOVE"),
        ("Linzi (2 weeks ago)", "VOLUME",
         "£9M lent to UK businesses, 243 individual deals completed.",
         "£3M+ funded in first 5 months of 2026 per her post 2 weeks ago; NACFB Cashflow Broker of Year"),
        ("Matt Wood (structural PAIN)", "PAIN",
         "An independent broker shops the same file across 20-30 lenders.",
         "200+ lender panel; Won Brokers Broker of the Year 1 year ago"),
        ("Chris (hire 2 months ago)", "HIRING",
         "We're #hiring a new Senior Mortgage Loan Processor.",
         "LitFinancial hiring processor 2 months ago"),
        ("Award only, no year", "MOVE",
         "Promotes fast commercial funding.",
         "NACFB Broker of the Year; 10-year anniversary"),
    ]
    for name, label, prim, sec in cases:
        a = assess(label, prim, sec, anchor=today)
        print(f"{name:34} {label:8} tier={a['recency_tier']:7} x{a['multiplier']} "
              f"cap={str(a['confidence_cap']):6} action={a['action_override']} date={a['signal_date'] or '-'}")
        if a["flag"]:
            print(f"    flag: {a['flag']}")
