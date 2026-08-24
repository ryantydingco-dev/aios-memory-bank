#!/usr/bin/env python3
"""Turn the Apify LinkedIn-posts scrape into the signal layer + final enriched CSV.

Reads the standardized base (Sway's 194) + the scraped posts JSONL, then for each
profile picks the freshest signal-bearing post (classified by keyword), and fills
real signal_date (from the post's exact timestamp), signal_timeframe, recency_tier,
primary_signal, behavioral_score (recency-PURE), opener, and confidence. Profiles
with posts but no buying-signal keyword -> NONE; profiles not scraped stay pending.
"""
from __future__ import annotations
import csv
import datetime as dt
import json
import re

import sway_schema as SS
import generate_oloxa_daily_batch as G

OLOXA = "/Users/ryantydingco/Documents/AIOS/Dealthread/managed-agents/exports/oloxa"
JSONL = f"{OLOXA}/apify/sway194_posts.jsonl"
BASE = f"{OLOXA}/sway_handoff/Oloxa_UK_SwayICP194_standardized_base_2026-06-01.csv"
ANCHOR = dt.date.today()
OUT = f"{OLOXA}/sway_handoff/Oloxa_UK_SwayICP194_enriched_{ANCHOR.isoformat()}.csv"
EXTRA = ["icp_tier", "status", "company_domain", "enrichment_status", "dedup_note"]


def slug(url):
    m = re.search(r"linkedin\.com/in/([^/?#]+)", (url or "").lower())
    return m.group(1).rstrip("/") if m else None


# Strict, priority-ordered signal patterns — NO catch-all MOVE. A post that matches
# none of these is NONE (generic activity, not a buying signal).
SIG_PATTERNS = [
    ("PAIN", re.compile(r"paperwork|chasing (?:docs|documents|clients|paper)|admin burden|bottleneck|document collection|missing (?:docs|info|documents)|back[- ]and[- ]forth|manual process", re.I)),
    ("HIRING", re.compile(r"\bwe'?re hiring\b|\bhiring\b|join (?:our|the) team|vacanc\w+|now hiring|recruit\w+|new role|growing (?:our|the) team|looking for (?:a|an)\b|join us", re.I)),
    ("CLOSING", re.compile(r"complet(?:ed|ion)|just funded|\bfunded\b|\bclosed\b|deal done|drawn down|secured (?:funding|a facility|£|\$)|refinanc\w+|completion of|delighted to (?:have )?(?:complet|fund|secur)|proud to (?:have )?(?:complet|fund|secur)|another (?:deal|completion)", re.I)),
    ("HIGH_VALUE", re.compile(r"[£$]\s?\d[\d,.]*\s*(?:m\b|million|bn|billion)", re.I)),
    ("VOLUME", re.compile(r"record (?:month|quarter|year)|busiest|\d+\s*deals|deals (?:this|last) (?:month|quarter|week)|surpassed|back[- ]to[- ]back|\bmilestone\b", re.I)),
    ("GROWTH", re.compile(r"anniversar\w*|\b\d+\s*years\b|two decades|new office|expand\w*|\blaunch\w*|\bopened\b|acquisition|merg\w+|partnership|rebrand", re.I)),
    ("SPEED_PROMISE", re.compile(r"same[- ]?day|24[- ]?hour|rapid (?:funding|turnaround)|fast (?:funding|turnaround)|quick decision", re.I)),
    ("MOVE", re.compile(r"excited to (?:join|announce.*join)|i'?ve joined|new (?:role|chapter|position) (?:at|with)|started (?:a new|at)|delighted to join|promoted to|appointed (?:as|to)|new beginnings", re.I)),
]


def classify(text):
    t = text or ""
    for label, pat in SIG_PATTERNS:
        if pat.search(t):
            return label
    return "NONE"


def tier_for(d):
    days = (ANCHOR - d).days
    return "FRESH" if days <= 30 else "RECENT" if days <= 90 else "AGING" if days <= 365 else "STALE"


def best_signal(posts):
    """Pick the freshest post that carries a buying-signal keyword."""
    best = None
    for p in posts:
        text = (p.get("text") or "").strip()
        pa = p.get("posted_at") or {}
        raw = (pa.get("date") or "")[:10]
        try:
            d = dt.date.fromisoformat(raw)
        except ValueError:
            d = None
        sig = classify(text)
        if sig != "NONE" and d:
            rel = (pa.get("relative") or "").split("•")[0].strip()
            if best is None or d > best["date"]:
                best = {"date": d, "signal": sig, "text": text, "rel": rel}
    return best


def main():
    posts_by_slug = {}
    for line in open(JSONL):
        r = json.loads(line)
        if r.get("ok"):
            posts_by_slug[(r.get("username") or "").lower()] = r.get("posts", [])

    rows = list(csv.DictReader(open(BASE, encoding="utf-8-sig")))
    enriched = scraped_no_sig = pending = 0
    out = []
    for r in rows:
        s = slug(r.get("linkedin_url"))
        posts = posts_by_slug.get(s) if s else None
        fit = int(r.get("fit_score") or 0)

        if posts:
            b = best_signal(posts)
            if b:
                signal = b["signal"]
                sdate = b["date"].isoformat()
                tier = tier_for(b["date"])
                stf = b["rel"] or f"{(ANCHOR - b['date']).days} days ago"
                evidence = re.sub(r"\s+", " ", b["text"])[:400]
                beh = SS.scale(SS.SIGNAL_STRENGTH.get(signal, 2))
                opener = G.opener({"first_name": r.get("first_name", ""), "company_name": r.get("company_name", ""),
                                   "signal_post_quote": b["text"]}, signal)
                estatus = "signal_enriched (apify)"
                basis = "linkedin_post"
                firm = f"{signal} post {stf}"
                enriched += 1
            else:  # scraped but no buying-signal keyword in recent posts
                signal, sdate, stf, tier, basis = "NONE", "", "", "", "scraped_no_signal"
                beh = SS.scale(SS.SIGNAL_STRENGTH["NONE"])
                evidence = firm = ""
                opener = G.opener({"first_name": r.get("first_name", ""), "company_name": r.get("company_name", ""), "signal_post_quote": ""}, "NONE")
                estatus = "scraped_no_signal"
                scraped_no_sig += 1
        else:  # not scraped (dup slug / no url) -> keep prior base values
            signal = r.get("primary_signal_refined", "NONE") or "NONE"
            sdate, stf, tier = r.get("signal_date", ""), r.get("signal_timeframe", ""), r.get("recency_tier", "")
            basis = r.get("signal_date_basis", "none")
            beh = int(r.get("behavioral_score") or SS.scale(SS.SIGNAL_STRENGTH.get(signal, 2)))
            evidence = r.get("confirmed_pain_evidence", "")
            firm = r.get("firm_intent_signals", "")
            opener = r.get("personalized_opener", "")
            estatus = r.get("enrichment_status", "signal_pending")
            pending += 1

        total = fit + beh
        conf = SS.refine_confidence(SS.base_tier_from_total(total), signal, tier)
        out.append({
            "intent_confidence": conf, "primary_signal_refined": signal,
            "signal_date": sdate, "signal_timeframe": stf, "recency_tier": tier, "signal_date_basis": basis,
            "fit_score": fit, "behavioral_score": beh, "total_score": total,
            "first_name": r.get("first_name", ""), "last_name": r.get("last_name", ""),
            "title": r.get("title", ""), "company_name": r.get("company_name", ""),
            "seniority": r.get("seniority", ""), "company_size": r.get("company_size", ""),
            "industry": r.get("industry", ""), "city": r.get("city", ""), "state": r.get("state", ""),
            "country": "GB", "email": r.get("email", ""), "linkedin_url": r.get("linkedin_url", ""),
            "linkedin_provider_id": "", "company_website": r.get("company_website", ""), "company_revenue": "",
            "confirmed_pain_evidence": evidence, "firm_intent_signals": firm,
            "personalized_opener": opener, "reasoning": f"ICP {r.get('icp_tier','')}; {estatus}",
            "source_url": r.get("linkedin_url", ""),
            "icp_tier": r.get("icp_tier", ""), "status": r.get("status", ""),
            "company_domain": r.get("company_domain", ""), "enrichment_status": estatus,
            "dedup_note": r.get("dedup_note", ""),
            "_t": SS.tier_rank(conf), "_s": total,
        })

    out.sort(key=lambda x: (x["_t"], x["_s"]), reverse=True)
    for i, r in enumerate(out, 1):
        r["rank"] = i
        for k in ("_t", "_s"):
            r.pop(k, None)
    cols = ["rank"] + SS.OUT_COLS[1:] + EXTRA
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(out)

    from collections import Counter
    print(f"rows {len(out)} | signal_enriched {enriched} | scraped_no_signal {scraped_no_sig} | pending {pending}")
    print(f"signals: {dict(Counter(r['primary_signal_refined'] for r in out))}")
    print(f"confidence: {dict(Counter(r['intent_confidence'] for r in out))}")
    print(f"recency: {dict(Counter(r['recency_tier'] or 'NONE' for r in out))}")
    print(f"OUT -> {OUT}")


if __name__ == "__main__":
    main()
