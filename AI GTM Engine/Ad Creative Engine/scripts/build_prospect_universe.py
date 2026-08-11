#!/usr/bin/env python3
"""Build a need-scored home-service ad-creative prospect universe.

The script starts from existing first-party/project CSV exports, resolves companies
by domain, scans public homepages for observable marketing-stack and creative
signals, and writes ranked CSVs. It does not send outreach or modify any external
system.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import csv
import datetime as dt
import html
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

import pandas as pd


ROOT = Path(__file__).resolve().parents[3]
DEFAULT_PEOPLE_SOURCE = (
    ROOT
    / "AI GTM Engine"
    / "Lead Engine"
    / "Outputs"
    / "sc_trades_ar_2026-06-08_raw_aiark.csv"
)
DEFAULT_MAPS_SOURCE = ROOT / "AI GTM Engine" / "sc-home-services-HUBSPOT-import.csv"
DEFAULT_OUTPUT_DIR = ROOT / "AI GTM Engine" / "Ad Creative Engine" / "outputs"

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36 "
    "AIOS-Market-Research/1.0"
)

VERTICALS: list[tuple[str, int, tuple[str, ...]]] = [
    ("Roofing", 25, ("roof", "shingle", "gutter")),
    ("Restoration", 25, ("restoration", "water damage", "fire damage", "mold remediation")),
    ("HVAC", 24, ("hvac", "heating", "air conditioning", "cooling", "furnace")),
    ("Windows & Doors", 23, ("window", "door replacement", "siding")),
    ("Foundation & Waterproofing", 23, ("foundation", "waterproof", "crawl space")),
    ("Remodeling", 22, ("remodel", "renovation", "kitchen", "bathroom", "home improvement")),
    ("Solar", 22, ("solar",)),
    ("Pools & Spas", 21, ("pool", "spa installation")),
    ("Flooring", 20, ("flooring", "floor covering", "hardwood floor", "tile installation")),
    ("Plumbing", 20, ("plumbing", "plumber", "drain", "sewer")),
    ("Garage Doors", 20, ("garage door",)),
    ("Landscaping & Tree", 19, ("landscape", "lawn care", "tree service", "hardscape")),
    ("Electrical", 19, ("electrician", "electrical contractor")),
    ("Painting", 18, ("painting contractor", "house painter", "commercial painting")),
    ("Pest Control", 18, ("pest control", "termite")),
    ("Fence & Deck", 18, ("fence", "fencing", "deck builder")),
    ("Cleaning & Exterior Care", 15, ("pressure washing", "soft washing", "cleaning service")),
    ("General Contractor", 17, ("general contractor", "home builder", "custom home", "construction")),
]

EXCLUSION_TERMS = (
    "wholesale distributor",
    "building supply",
    "equipment distributor",
    "manufacturer",
    "material supplier",
    "industrial supplier",
    "staffing",
    "real estate investment",
)

ROLE_WEIGHTS = (
    (("owner", "founder", "president", "chief executive", "ceo", "principal"), 4),
    (("marketing", "growth", "business development", "general manager"), 3),
    (("operations", "office manager", "branch manager"), 2),
)

CONCEPTS = {
    "Roofing": "storm-to-inspection before/after ad",
    "Restoration": "first-24-hours emergency-response ad",
    "HVAC": "no-cool-call to same-day comfort ad",
    "Windows & Doors": "energy-loss to installed-window transformation ad",
    "Foundation & Waterproofing": "visible-warning-signs inspection ad",
    "Remodeling": "project reveal with budget-and-timeline proof",
    "Solar": "utility-bill problem to consultation ad",
    "Pools & Spas": "backyard-before to finished-project reveal",
    "Flooring": "room transformation before/after ad",
    "Plumbing": "small symptom to prevented-emergency ad",
    "Garage Doors": "curb-appeal transformation ad",
    "Landscaping & Tree": "property transformation ad",
    "Electrical": "safety inspection problem/solution ad",
    "Painting": "one-room transformation ad",
    "Pest Control": "seasonal prevention problem/solution ad",
    "Fence & Deck": "yard privacy transformation ad",
    "Cleaning & Exterior Care": "high-contrast before/after ad",
    "General Contractor": "project walkthrough with proof milestones",
}


def clean(value: object) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def canonical_domain(value: str) -> str:
    raw = clean(value).lower()
    if not raw:
        return ""
    if not re.match(r"^https?://", raw):
        raw = "https://" + raw
    try:
        host = urllib.parse.urlparse(raw).netloc.lower().split("@")[-1].split(":")[0]
    except ValueError:
        return ""
    return re.sub(r"^www\.", "", host)


def canonical_url(value: str) -> str:
    domain = canonical_domain(value)
    return f"https://{domain}" if domain else ""


def classify_vertical(text: str) -> tuple[str, int]:
    lowered = text.lower()
    matches: list[tuple[int, str]] = []
    for name, score, keywords in VERTICALS:
        if any(keyword in lowered for keyword in keywords):
            matches.append((score, name))
    if not matches:
        return "", 0
    score, name = max(matches)
    return name, score


def role_score(title: str) -> int:
    lowered = title.lower()
    for terms, score in ROLE_WEIGHTS:
        if any(term in lowered for term in terms):
            return score
    return 0


def parse_employee_midpoint(value: str) -> int:
    numbers = [int(n.replace(",", "")) for n in re.findall(r"\d[\d,]*", clean(value))]
    if not numbers:
        return 0
    return round(sum(numbers[:2]) / min(2, len(numbers)))


def parse_revenue_floor(value: str) -> int:
    numbers = [int(n.replace(",", "")) for n in re.findall(r"\d[\d,]*", clean(value))]
    return numbers[0] if numbers else 0


@dataclass
class Candidate:
    domain: str
    company: str
    website: str
    city: str = ""
    state: str = ""
    vertical: str = ""
    vertical_score: int = 0
    first_name: str = ""
    last_name: str = ""
    title: str = ""
    email: str = ""
    email_status: str = ""
    phone: str = ""
    linkedin: str = ""
    employees: str = ""
    annual_revenue: str = ""
    rating: str = ""
    review_count: int = 0
    complaint_types: str = ""
    best_review_quote: str = ""
    maps_url: str = ""
    source_labels: set[str] = field(default_factory=set)
    source_urls: set[str] = field(default_factory=set)
    source_text: str = ""
    excluded_reason: str = ""
    pre_score: int = 0


def load_people_candidates(path: Path) -> dict[str, Candidate]:
    frame = pd.read_csv(path, dtype=str, keep_default_na=False)
    candidates: dict[str, Candidate] = {}
    for _, row in frame.iterrows():
        website = clean(row.get("Company Website"))
        domain = canonical_domain(website)
        if not domain:
            continue
        source_text = " ".join(
            clean(row.get(field))
            for field in (
                "Company Name",
                "Company Industry",
                "Company Product and Services",
                "Company Description",
                "Company SEO Description",
            )
        )
        vertical, vertical_points = classify_vertical(source_text)
        if not vertical:
            continue
        lowered = source_text.lower()
        excluded = next((term for term in EXCLUSION_TERMS if term in lowered), "")
        contact_title = clean(row.get("Title"))
        candidate = Candidate(
            domain=domain,
            company=clean(row.get("Company Name")) or domain,
            website=canonical_url(website),
            city=clean(row.get("City")),
            state=clean(row.get("State")),
            vertical=vertical,
            vertical_score=vertical_points,
            first_name=clean(row.get("First Name")),
            last_name=clean(row.get("Last Name")),
            title=contact_title,
            email=clean(row.get("Email Business")),
            email_status=clean(row.get("Business Status")),
            phone=clean(row.get("Mobile Phone")) or clean(row.get("Company Primary Phone")),
            linkedin=clean(row.get("LinkedIn")),
            employees=clean(row.get("Company Employee Count")),
            annual_revenue=clean(row.get("Company Annual Revenue")),
            source_text=source_text,
            excluded_reason=f"possible {excluded}" if excluded else "",
        )
        candidate.source_labels.add("AI Ark SC trades export")
        if clean(row.get("Company LinkedIn")):
            candidate.source_urls.add(clean(row.get("Company LinkedIn")))
        candidate.source_urls.add(candidate.website)
        existing = candidates.get(domain)
        if existing is None or contact_quality(candidate) > contact_quality(existing):
            candidates[domain] = candidate
    return candidates


def contact_quality(candidate: Candidate) -> int:
    return (
        role_score(candidate.title) * 4
        + (4 if candidate.email else 0)
        + (3 if candidate.phone else 0)
        + (2 if candidate.linkedin else 0)
    )


def merge_maps_candidates(candidates: dict[str, Candidate], path: Path) -> None:
    frame = pd.read_csv(path, dtype=str, keep_default_na=False)
    for _, row in frame.iterrows():
        website = clean(row.get("Website"))
        domain = canonical_domain(website)
        if not domain:
            continue
        source_text = " ".join(
            (
                clean(row.get("Company Name")),
                clean(row.get("Trade")),
                clean(row.get("Complaint Types")),
                clean(row.get("Best Quote")),
            )
        )
        vertical, vertical_points = classify_vertical(source_text)
        if not vertical:
            continue
        candidate = candidates.get(domain)
        if candidate is None:
            candidate = Candidate(
                domain=domain,
                company=clean(row.get("Company Name")) or domain,
                website=canonical_url(website),
                city=clean(row.get("City")),
                state=clean(row.get("State/Region")),
                vertical=vertical,
                vertical_score=vertical_points,
                first_name=clean(row.get("First Name")),
                last_name=clean(row.get("Last Name")),
                title="Owner / decision maker to verify",
                phone=clean(row.get("Phone Number")),
                source_text=source_text,
            )
            candidates[domain] = candidate
        else:
            candidate.vertical_score = max(candidate.vertical_score, vertical_points)
            candidate.vertical = candidate.vertical or vertical
            candidate.city = candidate.city or clean(row.get("City"))
            candidate.state = candidate.state or clean(row.get("State/Region"))
            candidate.phone = candidate.phone or clean(row.get("Phone Number"))
        candidate.rating = clean(row.get("Google Rating"))
        candidate.review_count = int(float(clean(row.get("Review Count")) or 0))
        candidate.complaint_types = clean(row.get("Complaint Types"))
        candidate.best_review_quote = clean(row.get("Best Quote"))
        candidate.maps_url = clean(row.get("Google Maps URL"))
        candidate.source_labels.add("Google Maps home-services export")
        candidate.source_urls.add(candidate.website)
        if candidate.maps_url:
            candidate.source_urls.add(candidate.maps_url)


def capacity_score(candidate: Candidate) -> int:
    score = 0
    employees = parse_employee_midpoint(candidate.employees)
    revenue = parse_revenue_floor(candidate.annual_revenue)
    if 11 <= employees <= 200:
        score += 6
    elif 2 <= employees <= 500:
        score += 3
    if revenue >= 5_000_000:
        score += 5
    elif revenue >= 1_000_000:
        score += 4
    elif revenue >= 500_000:
        score += 2
    if candidate.review_count >= 250:
        score += 5
    elif candidate.review_count >= 100:
        score += 4
    elif candidate.review_count >= 30:
        score += 2
    return min(score, 10)


def compute_pre_score(candidate: Candidate) -> int:
    score = candidate.vertical_score + capacity_score(candidate)
    score += min(role_score(candidate.title), 3)
    score += 3 if candidate.email else 0
    score += 2 if candidate.phone else 0
    score += 1 if candidate.linkedin else 0
    if candidate.excluded_reason:
        score -= 12
    return score


def fetch_homepage(candidate: Candidate, timeout: float) -> dict[str, object]:
    result: dict[str, object] = {
        "domain": candidate.domain,
        "scan_status": "unscanned",
        "final_url": candidate.website,
        "html": "",
    }
    context = ssl.create_default_context()
    for url in (candidate.website, f"http://{candidate.domain}"):
        request = urllib.request.Request(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout, context=context) as response:
                content_type = response.headers.get("Content-Type", "")
                if "text/html" not in content_type and "application/xhtml" not in content_type:
                    result["scan_status"] = f"non_html:{content_type[:40]}"
                    return result
                payload = response.read(500_000)
                encoding = response.headers.get_content_charset() or "utf-8"
                result["html"] = payload.decode(encoding, errors="replace")
                result["final_url"] = response.geturl()
                result["scan_status"] = f"ok:{getattr(response, 'status', 200)}"
                return result
        except urllib.error.HTTPError as exc:
            result["scan_status"] = f"http:{exc.code}"
        except urllib.error.URLError as exc:
            result["scan_status"] = f"url_error:{type(exc.reason).__name__}"
        except TimeoutError:
            result["scan_status"] = "timeout"
        except Exception as exc:  # defensive: preserve the rest of the scan
            result["scan_status"] = f"error:{type(exc).__name__}"
    return result


def has_any(text: str, patterns: Iterable[str]) -> bool:
    return any(pattern in text for pattern in patterns)


def analyze_html(scan: dict[str, object]) -> dict[str, object]:
    raw_html = str(scan.get("html") or "")
    lowered = raw_html.lower()
    visible = re.sub(r"<script\b[^>]*>.*?</script>", " ", lowered, flags=re.S)
    visible = re.sub(r"<style\b[^>]*>.*?</style>", " ", visible, flags=re.S)
    visible = html.unescape(re.sub(r"<[^>]+>", " ", visible))
    visible = re.sub(r"\s+", " ", visible)

    title_match = re.search(r"<title[^>]*>(.*?)</title>", raw_html, flags=re.I | re.S)
    description = ""
    for tag in re.findall(r"<meta\b[^>]{0,2000}>", raw_html[:150_000], flags=re.I):
        if not re.search(r'name\s*=\s*["\']description["\']', tag, flags=re.I):
            continue
        content_match = re.search(
            r'content\s*=\s*["\']([^"\']{0,1000})["\']',
            tag,
            flags=re.I,
        )
        if content_match:
            description = clean(html.unescape(content_match.group(1)))
            break

    years = [int(value) for value in re.findall(r"(?:©|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})", visible)]
    latest_year = max((year for year in years if 2000 <= year <= 2030), default=0)

    return {
        "scan_status": scan.get("scan_status", ""),
        "final_url": scan.get("final_url", ""),
        "site_title": clean(html.unescape(title_match.group(1))) if title_match else "",
        "meta_description": description,
        "meta_pixel": has_any(lowered, ("connect.facebook.net", "fbq(", "facebook.com/tr?")),
        "google_ads_tag": bool(re.search(r"(?:aw-\d{5,}|google_conversion|googleadservices\.com)", lowered)),
        "google_tag_manager": "googletagmanager.com" in lowered or "gtm-" in lowered,
        "tiktok_pixel": has_any(lowered, ("analytics.tiktok.com", "ttq.", "tiktok_pixel")),
        "call_tracking": has_any(
            lowered,
            ("callrail", "calltrackingmetrics", "whatconverts", "invoca", "convirza"),
        ),
        "lead_platform": next(
            (
                name
                for name in (
                    "servicetitan",
                    "housecallpro",
                    "jobber",
                    "schedule engine",
                    "podium",
                    "chiirp",
                    "birdeye",
                )
                if name in lowered
            ),
            "",
        ),
        "has_video": bool(
            re.search(
                r"(youtube\.com/(?:embed|watch)|youtu\.be/|vimeo\.com|wistia|<video\b|\.mp4\b)",
                lowered,
            )
        ),
        "has_gallery": has_any(
            visible,
            ("before and after", "before & after", "project gallery", "our projects", "our work", "gallery"),
        ),
        "has_testimonials": has_any(
            visible,
            ("testimonials", "customer reviews", "what our customers say", "client reviews"),
        ),
        "has_financing": has_any(
            visible,
            ("financing available", "financing options", "monthly payments", "pay over time", "0% financing"),
        ),
        "has_offer": has_any(
            visible,
            (
                "free estimate",
                "free inspection",
                "schedule service",
                "book online",
                "same-day",
                "same day",
                "24/7",
                "emergency service",
            ),
        ),
        "instagram_link": "instagram.com/" in lowered,
        "facebook_link": "facebook.com/" in lowered,
        "youtube_link": "youtube.com/" in lowered or "youtu.be/" in lowered,
        "latest_copyright_year": latest_year,
    }


def bool_int(value: object) -> int:
    return 1 if bool(value) else 0


def score_candidate(candidate: Candidate, signals: dict[str, object]) -> dict[str, object]:
    fit_score = candidate.vertical_score
    fit_score += capacity_score(candidate)
    fit_score = min(30, fit_score)

    demand_score = (
        12 * bool_int(signals.get("meta_pixel"))
        + 10 * bool_int(signals.get("google_ads_tag"))
        + 8 * bool_int(signals.get("call_tracking"))
        + 5 * bool_int(signals.get("tiktok_pixel"))
        + 3 * bool_int(signals.get("google_tag_manager"))
        + 3 * bool_int(signals.get("lead_platform"))
    )
    demand_score = min(30, demand_score)

    has_demand = demand_score >= 8
    creative_gap_score = 0
    if has_demand and not signals.get("has_video"):
        creative_gap_score += 12
    elif not signals.get("has_video"):
        creative_gap_score += 6
    if not signals.get("youtube_link") and not signals.get("instagram_link"):
        creative_gap_score += 4
    latest_year = int(signals.get("latest_copyright_year") or 0)
    if latest_year and latest_year <= 2024:
        creative_gap_score += 3
    if candidate.complaint_types:
        creative_gap_score += 2
    creative_gap_score = min(20, creative_gap_score)

    raw_material_score = (
        5 * bool_int(signals.get("has_gallery"))
        + 4 * bool_int(signals.get("has_testimonials"))
        + 3 * bool_int(signals.get("has_financing"))
        + 3 * bool_int(signals.get("has_offer"))
    )
    if candidate.review_count >= 100:
        raw_material_score += 3
    elif candidate.review_count >= 30:
        raw_material_score += 2
    raw_material_score = min(15, raw_material_score)

    reachability_score = (
        5 * bool_int(candidate.email)
        + 3 * bool_int(candidate.phone)
        + min(role_score(candidate.title), 2)
    )
    reachability_score = min(10, reachability_score)

    penalty = 12 if candidate.excluded_reason else 0
    if not str(signals.get("scan_status", "")).startswith("ok:"):
        penalty += 3
    total = max(
        0,
        min(
            100,
            fit_score
            + demand_score
            + creative_gap_score
            + raw_material_score
            + reachability_score
            - penalty,
        ),
    )

    if total >= 70 and has_demand and reachability_score >= 3:
        tier = "A - Layup"
    elif total >= 55:
        tier = "B - Strong"
    elif total >= 42:
        tier = "C - Verify"
    else:
        tier = "D - Nurture"

    if signals.get("meta_pixel") and not signals.get("has_video"):
        primary_signal = "Meta tracking detected; no embedded homepage video found"
    elif signals.get("google_ads_tag") and not signals.get("has_video"):
        primary_signal = "Google Ads tag detected; no embedded homepage video found"
    elif signals.get("call_tracking") and not signals.get("has_video"):
        primary_signal = "Call-tracking stack detected; no embedded homepage video found"
    elif signals.get("has_gallery") and not signals.get("has_video"):
        primary_signal = "Project/gallery proof found; no embedded homepage video found"
    elif candidate.review_count >= 100 and not signals.get("has_video"):
        primary_signal = f"{candidate.review_count} Google reviews; no embedded homepage video found"
    elif signals.get("has_financing") and not signals.get("has_video"):
        primary_signal = "Financing language found; no embedded homepage video found"
    elif has_demand:
        primary_signal = "Paid-demand technology detected; creative refresh hypothesis"
    else:
        primary_signal = "ICP fit; paid-demand need requires manual verification"

    evidence_bits: list[str] = []
    if signals.get("meta_pixel"):
        evidence_bits.append("Meta Pixel")
    if signals.get("google_ads_tag"):
        evidence_bits.append("Google Ads tag")
    if signals.get("call_tracking"):
        evidence_bits.append("call tracking")
    if signals.get("tiktok_pixel"):
        evidence_bits.append("TikTok Pixel")
    if signals.get("has_gallery"):
        evidence_bits.append("project/gallery proof")
    if signals.get("has_testimonials"):
        evidence_bits.append("testimonials")
    if signals.get("has_financing"):
        evidence_bits.append("financing")
    if signals.get("has_offer"):
        evidence_bits.append("visible service offer")
    if not signals.get("has_video"):
        evidence_bits.append("no embedded homepage video detected")

    location = ", ".join(part for part in (candidate.city, candidate.state) if part)
    if signals.get("meta_pixel") and not signals.get("has_video"):
        personalization = (
            f"I noticed {candidate.company}'s site has Meta tracking installed, "
            "but I couldn't find an embedded video on the homepage."
        )
    elif signals.get("google_ads_tag") and not signals.get("has_video"):
        personalization = (
            f"I noticed {candidate.company}'s site has a Google Ads tag installed, "
            "but I couldn't find an embedded video on the homepage."
        )
    elif signals.get("call_tracking") and not signals.get("has_video"):
        personalization = (
            f"I noticed {candidate.company} has call tracking in place, "
            "but I couldn't find an embedded video on the homepage."
        )
    elif signals.get("has_gallery") and not signals.get("has_video"):
        personalization = (
            f"I found project/gallery proof on {candidate.company}'s site that could "
            "be repackaged into short-form ad concepts."
        )
    elif candidate.review_count >= 100 and not signals.get("has_video"):
        personalization = (
            f"{candidate.company} has {candidate.review_count} Google reviews—strong "
            "proof that could be turned into short-form ad concepts."
        )
    elif signals.get("has_financing") and not signals.get("has_video"):
        personalization = (
            f"I found financing language on {candidate.company}'s site that could make "
            "a strong short-form offer angle."
        )
    else:
        suffix = f" in {location}" if location else ""
        personalization = (
            f"I was reviewing {candidate.vertical.lower()} companies{suffix} and "
            f"{candidate.company} looked like a strong fit for a creative test."
        )

    concept = CONCEPTS.get(candidate.vertical, "proof-led service ad")
    greeting = candidate.first_name if candidate.first_name and candidate.first_name.lower() != "owner" else "there"
    subject = f"{candidate.company} ad concept"
    email_one = (
        f"Hi {greeting} — {personalization} "
        f"I mapped a private 15-second {concept} for {candidate.company} using only "
        "public brand context—not for publishing, just to show the angle. "
        "We build three client-approved video ad concepts in seven days, then turn "
        "the winners into fresh variations. No filming day required. "
        "Worth sending the private sample?"
    )
    follow_up = (
        f"Quick follow-up: the sample angle is a {concept}. If it misses the mark, "
        "no problem—I won't keep chasing. Should I send it?"
    )
    call_opener = (
        f"Hi {greeting}, Ryan here. I was looking at {candidate.company}'s public "
        f"marketing and noticed: {primary_signal.lower()}. I mapped one private "
        f"{concept} as an example. Did I catch you with 30 seconds?"
    )

    meta_search = urllib.parse.quote(candidate.company)
    ad_library_url = (
        "https://www.facebook.com/ads/library/?active_status=active&ad_type=all"
        f"&country=US&q={meta_search}&search_type=keyword_unordered"
    )

    return {
        "tier": tier,
        "total_score": total,
        "fit_score": fit_score,
        "paid_demand_score": demand_score,
        "creative_gap_score": creative_gap_score,
        "proof_score": raw_material_score,
        "reachability_score": reachability_score,
        "primary_need_signal": primary_signal,
        "evidence_summary": "; ".join(evidence_bits) or "No strong homepage signal detected",
        "personalization_line": personalization,
        "sample_concept": concept,
        "subject_line": subject,
        "email_1": email_one,
        "follow_up_1": follow_up,
        "call_opener": call_opener,
        "meta_ad_library_check_url": ad_library_url,
    }


def row_from_candidate(
    candidate: Candidate,
    signals: dict[str, object],
    score: dict[str, object],
    scanned_at: str,
) -> dict[str, object]:
    source_urls = sorted(url for url in candidate.source_urls if url)
    return {
        "rank": 0,
        "tier": score["tier"],
        "total_score": score["total_score"],
        "company": candidate.company,
        "website": candidate.website,
        "final_url": signals.get("final_url", ""),
        "city": candidate.city,
        "state": candidate.state,
        "vertical": candidate.vertical,
        "first_name": candidate.first_name,
        "last_name": candidate.last_name,
        "title": candidate.title,
        "email": candidate.email,
        "email_status": candidate.email_status,
        "phone": candidate.phone,
        "linkedin": candidate.linkedin,
        "employee_range": candidate.employees,
        "annual_revenue_range": candidate.annual_revenue,
        "google_rating": candidate.rating,
        "google_review_count": candidate.review_count,
        "complaint_types": candidate.complaint_types,
        "fit_score": score["fit_score"],
        "paid_demand_score": score["paid_demand_score"],
        "creative_gap_score": score["creative_gap_score"],
        "proof_score": score["proof_score"],
        "reachability_score": score["reachability_score"],
        "meta_pixel": bool_int(signals.get("meta_pixel")),
        "google_ads_tag": bool_int(signals.get("google_ads_tag")),
        "google_tag_manager": bool_int(signals.get("google_tag_manager")),
        "tiktok_pixel": bool_int(signals.get("tiktok_pixel")),
        "call_tracking": bool_int(signals.get("call_tracking")),
        "lead_platform": signals.get("lead_platform", ""),
        "has_video": bool_int(signals.get("has_video")),
        "has_gallery": bool_int(signals.get("has_gallery")),
        "has_testimonials": bool_int(signals.get("has_testimonials")),
        "has_financing": bool_int(signals.get("has_financing")),
        "has_offer": bool_int(signals.get("has_offer")),
        "instagram_link": bool_int(signals.get("instagram_link")),
        "facebook_link": bool_int(signals.get("facebook_link")),
        "youtube_link": bool_int(signals.get("youtube_link")),
        "latest_copyright_year": signals.get("latest_copyright_year", 0),
        "primary_need_signal": score["primary_need_signal"],
        "evidence_summary": score["evidence_summary"],
        "personalization_line": score["personalization_line"],
        "sample_concept": score["sample_concept"],
        "subject_line": score["subject_line"],
        "email_1": score["email_1"],
        "follow_up_1": score["follow_up_1"],
        "call_opener": score["call_opener"],
        "meta_ad_library_check_url": score["meta_ad_library_check_url"],
        "scan_status": signals.get("scan_status", ""),
        "scanned_at": scanned_at,
        "source_labels": " | ".join(sorted(candidate.source_labels)),
        "source_urls": " | ".join(source_urls),
        "excluded_reason": candidate.excluded_reason,
    }


def write_csv(path: Path, rows: list[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        raise ValueError("no rows to write")
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def summarize(rows: list[dict[str, object]]) -> None:
    tiers: dict[str, int] = {}
    verticals: dict[str, int] = {}
    for row in rows:
        tiers[str(row["tier"])] = tiers.get(str(row["tier"]), 0) + 1
        verticals[str(row["vertical"])] = verticals.get(str(row["vertical"]), 0) + 1
    print(f"Output rows: {len(rows)}")
    print("Tiers:", ", ".join(f"{key}={value}" for key, value in sorted(tiers.items())))
    print(
        "Top verticals:",
        ", ".join(
            f"{key}={value}"
            for key, value in sorted(verticals.items(), key=lambda item: item[1], reverse=True)[:10]
        ),
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--people-source", type=Path, default=DEFAULT_PEOPLE_SOURCE)
    parser.add_argument("--maps-source", type=Path, default=DEFAULT_MAPS_SOURCE)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--limit", type=int, default=1000)
    parser.add_argument("--pool-multiplier", type=float, default=1.6)
    parser.add_argument("--workers", type=int, default=24)
    parser.add_argument("--timeout", type=float, default=8.0)
    parser.add_argument("--no-scan", action="store_true")
    args = parser.parse_args()

    candidates = load_people_candidates(args.people_source)
    merge_maps_candidates(candidates, args.maps_source)
    for candidate in candidates.values():
        candidate.pre_score = compute_pre_score(candidate)

    pool_size = min(len(candidates), max(args.limit, round(args.limit * args.pool_multiplier)))
    pool = sorted(
        candidates.values(),
        key=lambda item: (item.pre_score, contact_quality(item), item.company.lower()),
        reverse=True,
    )[:pool_size]
    print(f"Resolved {len(candidates)} eligible unique companies; scanning pool={len(pool)}")

    scanned_at = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    scans: dict[str, dict[str, object]] = {}
    if args.no_scan:
        scans = {
            candidate.domain: {
                "scan_status": "not_run",
                "final_url": candidate.website,
                "html": "",
            }
            for candidate in pool
        }
    else:
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
            futures = {
                executor.submit(fetch_homepage, candidate, args.timeout): candidate
                for candidate in pool
            }
            completed = 0
            for future in concurrent.futures.as_completed(futures):
                candidate = futures[future]
                scans[candidate.domain] = future.result()
                completed += 1
                if completed % 100 == 0 or completed == len(pool):
                    print(f"Scanned {completed}/{len(pool)}", flush=True)

    rows: list[dict[str, object]] = []
    for candidate in pool:
        signals = analyze_html(scans[candidate.domain])
        score = score_candidate(candidate, signals)
        rows.append(row_from_candidate(candidate, signals, score, scanned_at))

    rows.sort(
        key=lambda row: (
            int(row["total_score"]),
            int(row["paid_demand_score"]),
            int(row["proof_score"]),
            int(row["reachability_score"]),
            str(row["company"]).lower(),
        ),
        reverse=True,
    )
    rows = rows[: args.limit]
    for rank, row in enumerate(rows, start=1):
        row["rank"] = rank

    output_dir: Path = args.output_dir
    write_csv(output_dir / "home_service_creative_engine_1000.csv", rows)
    write_csv(output_dir / "home_service_creative_engine_top_50.csv", rows[:50])
    write_csv(
        output_dir / "home_service_creative_engine_layups.csv",
        [row for row in rows if row["tier"] == "A - Layup"] or rows[:25],
    )
    summarize(rows)
    return 0


if __name__ == "__main__":
    sys.exit(main())
