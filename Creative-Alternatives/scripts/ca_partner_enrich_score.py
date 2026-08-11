#!/usr/bin/env python3
"""Clean, enrich, score, tier, and personalize CA partner prospects.

Input: AI Ark named-email files from ca_partner_aiark_scale.py.
Output per lane: full scored master, Tier 1/2/3 files, disqualified rows,
and a first-launch review file. This stage does not send outreach.

The score is explainable and structural. Fresh behavioral signals can later add
`live_signal_score` and promote a lead; they never silently overwrite evidence.
"""

import argparse
import csv
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_BASE = ROOT / "outputs" / "partnerships" / "scale-3000-2026-07-17"
LEDGER = ROOT / "data" / "outbound" / "contacted.csv"
CUSTOMERS = ROOT / "outputs" / "reactivation" / "2026-07-09" / "customers_master.csv"

LANES = {
    "partner-agencies": {
        "label": "Creative agencies",
        "relevance": {
            "AGENCY_SERVICE_MODEL": r"agency|marketing|advertis|branding|public relations|digital marketing|graphic design|web design|creative studio|content studio|media agency",
            "PHYSICAL_BRAND_TRIGGER": r"experiential|activation|event|launch|packag|retail|influencer|brand experience|trade show",
            "CLIENT_PORTFOLIO": r"clients?|brands?|case stud|portfolio|companies like|organizations?",
        },
        "opener": {
            "PHYSICAL_BRAND_TRIGGER": "Saw {company} works on brand experiences, campaigns, or launches where physical merchandise can become a separate production lane.",
            "CLIENT_PORTFOLIO": "Saw {company} supports a portfolio of client brands, so I thought a behind-the-scenes merchandise desk could fit requests that fall outside the core agency work.",
            "AGENCY_SERVICE_MODEL": "Saw {company} provides agency and marketing support, so I thought there may be a useful handoff when clients ask for apparel, gifts, kits, or event merchandise.",
        },
    },
    "partner-event-agencies": {
        "label": "Event and experiential partners",
        "relevance": {
            "RECURRING_EVENT_ENGINE": r"events?|conference|meeting|experiential|activation|production|retreat|trade.?show|exhibit|festival|gala",
            "VENDOR_COORDINATION": r"vendor|venue|logistics|production|attendee|sponsor|run of show|destination management",
            "CLIENT_PORTFOLIO": r"clients?|brands?|case stud|portfolio|organizations?|corporate",
        },
        "opener": {
            "VENDOR_COORDINATION": "Saw {company} coordinates event production and logistics, so I thought taking merchandise off the run-of-show could be a natural fit.",
            "CLIENT_PORTFOLIO": "Saw {company} produces work for multiple clients, which made me think a behind-the-scenes event merchandise partner could be useful across the calendar.",
            "RECURRING_EVENT_ENGINE": "Saw {company} works across events and experiences where attendee items, staff apparel, or speaker gifts can become another deadline to manage.",
        },
    },
    "partner-people-advisors": {
        "label": "HR and People advisors",
        "relevance": {
            "EMPLOYEE_MOMENT_INFLUENCE": r"human resources|\bhr\b|people|workforce|employee|talent|recruit|leadership|benefits|culture|organization",
            "ONBOARDING_RECOGNITION_TRIGGER": r"onboard|new hire|recognition|engagement|retention|employer brand|employee experience|offsite|distributed team",
            "CLIENT_PORTFOLIO": r"clients?|companies|organizations?|advis(?:e|or|ory)|consult|placements?|search firm",
        },
        "opener": {
            "ONBOARDING_RECOGNITION_TRIGGER": "Saw {company} works around onboarding, employee experience, or recognition, so I thought there may be a practical execution fit for kits, gifts, and team merchandise.",
            "CLIENT_PORTFOLIO": "Saw {company} advises multiple organizations on People and talent work, so I thought there may be a useful handoff when clients need onboarding kits, recognition, or team merchandise.",
            "EMPLOYEE_MOMENT_INFLUENCE": "Saw {company} works across People, workforce, or talent initiatives and likely encounters the moments before a client searches for a merchandise partner.",
        },
    },
}

AUTHORITY_RE = re.compile(r"founder|owner|president|chief executive|\bceo\b|managing director|principal|partner|executive producer|director", re.I)
PARTNER_RE = re.compile(r"partner(?:ship)?|collaborat|alliance|ecosystem|vendor network|strategic relationship", re.I)
WHITE_LABEL_RE = re.compile(r"white.?label|resell|referral|channel partner|overflow|behind the scenes|subcontract", re.I)
RECURRING_RE = re.compile(r"retainer|ongoing|full.service|end.to.end|long.term|portfolio|multiple clients|client relationships|annual|year.round", re.I)
COMPETITOR_RE = re.compile(r"promotional products?|promo products?|branded merchandise supplier|screen print|embroid|swag supplier|apparel decorator|custom apparel", re.I)
ROLE_EMAIL_RE = re.compile(r"^(info|hello|contact|sales|support|admin|office|marketing|team|inquiries|careers|jobs)@", re.I)
GENERIC_DOMAINS = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "proton.me", "protonmail.com"}
HONORIFICS = re.compile(r"^(mr|mrs|ms|miss|dr|prof)\.?\s+", re.I)
SUFFIXES = re.compile(r"(?:,\s*|\s+)(?:(?:ph\.?d\.?|mba|jd|esq\.?|cpa|shrm(?:-scp|-cp)?|sphr|phr|cmp|cmm|aia|ncarb)\.?[\s,]*)+$", re.I)

CSV_FIELDS = [
    "rank", "tier", "total_score", "partner_fit_score", "partner_readiness_score", "contactability_score",
    "live_signal_score", "intent_confidence", "primary_signal", "signal_labels", "signal_evidence", "tier_reason",
    "first_name", "last_name", "full_name", "title", "canonical_title", "company_name", "company_name_normalized",
    "company_domain", "company_website", "company_industry", "company_staff", "email", "email_quality", "linkedin_url",
    "partner_lane", "partner_subsegment", "partner_offer", "personalized_opener", "value_line", "cta_line", "recommended_next_action",
    "relationship_state", "suppression_checked", "review_status", "source",
]


def normalize_text(value):
    value = unicodedata.normalize("NFKC", str(value or ""))
    value = "".join(ch for ch in value if unicodedata.category(ch) not in {"So", "Cs"})
    return re.sub(r"\s+", " ", value).strip()


def smart_case(value):
    value = normalize_text(value)
    if value and (value.isupper() or value.islower()):
        return value.title()
    return value


def clean_first(value):
    value = HONORIFICS.sub("", normalize_text(value))
    value = SUFFIXES.sub("", value)
    value = value.split(",", 1)[0].strip()
    # Keep compound and hyphenated given names, but remove obvious credentials.
    return smart_case(value)


def clean_last(value):
    value = SUFFIXES.sub("", normalize_text(value))
    value = value.strip(" ,")
    return smart_case(value)


def clean_company(value):
    return normalize_text(value).strip("|-")


def normalized_company(value):
    value = clean_company(value).lower()
    value = re.sub(r"\b(incorporated|inc|llc|ltd|limited|corp|corporation|company|co)\b\.?", " ", value)
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def clean_domain(value):
    value = normalize_text(value).lower()
    if "://" not in value:
        value = "https://" + value
    return (urlparse(value).hostname or "").removeprefix("www.")


def clean_linkedin(value):
    value = normalize_text(value)
    if not value:
        return ""
    if not value.startswith("http"):
        value = "https://" + value.lstrip("/")
    return value.split("?", 1)[0].rstrip("/")


def canonical_title(title):
    t = normalize_text(title).lower()
    if "founder" in t and ("ceo" in t or "chief executive" in t): return "Founder/CEO"
    if "founder" in t: return "Founder"
    if "owner" in t: return "Owner"
    if "president" in t: return "President"
    if "chief executive" in t or re.search(r"\bceo\b", t): return "CEO"
    if "managing director" in t: return "Managing Director"
    if "principal" in t: return "Principal"
    if "partner" in t: return "Partner"
    if "executive producer" in t: return "Executive Producer"
    if "director" in t: return "Director"
    return smart_case(title)


def classify_subsegment(lane_slug, text):
    if lane_slug == "partner-agencies":
        if re.search(r"experiential|activation|event marketing|brand experience", text, re.I): return "experiential_agency"
        if re.search(r"branding|creative agency|marketing agency|advertising agency|public relations|digital agency|graphic design|web design", text, re.I): return "creative_marketing_agency"
        if re.search(r"publisher|podcast|media network|audience", text, re.I): return "media_publisher"
        return "adjacent_creative_service"
    if lane_slug == "partner-event-agencies":
        if re.search(r"event planner|event planning|event producer|event production|experiential agency|meeting planner|conference producer|destination management", text, re.I): return "planner_producer"
        if re.search(r"exhibit|booth|display|scenic|staging|av production|audio visual", text, re.I): return "exhibit_production_vendor"
        if re.search(r"ticket|event software|event platform|registration", text, re.I): return "event_technology"
        if re.search(r"venue|catering|parking|transportation|hospitality", text, re.I): return "venue_logistics_vendor"
        return "event_adjacent_service"
    if re.search(r"benefits|peo|professional employer", text, re.I): return "benefits_peo_advisor"
    if re.search(r"recruit|staffing|executive search|talent search|placements?", text, re.I): return "recruiting_search"
    if re.search(r"human resources|people advisory|workforce|employee experience|leadership advisory|culture", text, re.I): return "people_advisory"
    return "adjacent_business_advisor"


def load_candidate_index(lane_dir):
    path = lane_dir / "candidates.json"
    if not path.exists(): return {}, {}
    rows = json.loads(path.read_text())
    return ({r.get("ai_ark_id"): r for r in rows if r.get("ai_ark_id")},
            {r.get("company_domain"): r for r in rows if r.get("company_domain")})


def load_suppressions():
    emails, domains = set(), set()
    if CUSTOMERS.exists():
        for r in csv.DictReader(open(CUSTOMERS, newline="")):
            e = (r.get("email") or "").strip().lower()
            if "@" in e:
                emails.add(e)
                d = e.rsplit("@", 1)[1]
                if d not in GENERIC_DOMAINS: domains.add(d)
    if LEDGER.exists():
        for r in csv.DictReader(open(LEDGER, newline="")):
            e = (r.get("email") or "").strip().lower()
            if "@" in e: emails.add(e)
    return emails, domains


def signal_data(text, lane):
    labels, evidence = [], []
    for label, pattern in lane["relevance"].items():
        if re.search(pattern, text, re.I):
            labels.append(label); evidence.append(label.replace("_", " ").title())
    if PARTNER_RE.search(text): labels.append("PARTNERSHIP_LANGUAGE"); evidence.append("Public partnership/collaboration language")
    if WHITE_LABEL_RE.search(text): labels.append("WHITE_LABEL_READY"); evidence.append("White-label, reseller, referral, or overflow language")
    if RECURRING_RE.search(text): labels.append("RECURRING_CLIENT_MODEL"); evidence.append("Recurring or full-service client model")
    return list(dict.fromkeys(labels)), list(dict.fromkeys(evidence))


def score_row(raw, lane_slug, lane, candidate, suppressed_emails, suppressed_domains):
    first = clean_first(raw.get("first_name"))
    last = clean_last(raw.get("last_name"))
    email = normalize_text(raw.get("email")).lower().replace(" ", "")
    domain = clean_domain(raw.get("company_domain") or (email.rsplit("@",1)[1] if "@" in email else ""))
    company = clean_company(raw.get("company_name") or candidate.get("company_name"))
    title = normalize_text(raw.get("title") or candidate.get("title"))
    linkedin = clean_linkedin(raw.get("linkedin_url"))
    summary = normalize_text(raw.get("summary") or candidate.get("company_description"))
    industry = normalize_text(candidate.get("company_industry"))
    staff = candidate.get("company_staff") or ""
    text = " ".join([company, title, summary, industry])
    subsegment = classify_subsegment(lane_slug, text)
    labels, evidence = signal_data(text, lane)

    disqualifiers = []
    if COMPETITOR_RE.search(text): disqualifiers.append("direct_or_adjacent_merch_competitor")
    relevance_labels = [x for x in labels if x in lane["relevance"]]
    if not relevance_labels: disqualifiers.append("wrong_lane_or_no_relevance_evidence")
    if email in suppressed_emails: disqualifiers.append("existing_customer_or_prior_touch_email")
    if domain in suppressed_domains: disqualifiers.append("existing_customer_domain")
    if not first or not company or "@" not in email: disqualifiers.append("incomplete_contact")

    # Partner fit: 0-50
    authority = 10 if AUTHORITY_RE.search(title) else 4
    relevance = min(20, 8 * len(relevance_labels))
    try: staff_n = int(staff)
    except (ValueError, TypeError): staff_n = 0
    size_score = 6 if 2 <= staff_n <= 200 else (3 if staff_n else 2)
    client_score = 10 if "CLIENT_PORTFOLIO" in labels else (5 if re.search(r"clients?|advis|consult", text, re.I) else 0)
    named_contact = 4 if first and last else 2
    fit = min(50, authority + relevance + size_score + client_score + named_contact)
    # Event vendors can be useful reciprocal partners, but planners/producers
    # have the most direct and repeated merchandise trigger.
    if lane_slug == "partner-event-agencies" and subsegment in {"event_technology", "venue_logistics_vendor", "event_adjacent_service"}:
        fit = max(0, fit - 8)

    # Readiness: 0-30
    readiness = 0
    if "PARTNERSHIP_LANGUAGE" in labels: readiness += 10
    if "WHITE_LABEL_READY" in labels: readiness += 8
    if "RECURRING_CLIENT_MODEL" in labels: readiness += 6
    if any(x in labels for x in ("PHYSICAL_BRAND_TRIGGER", "VENDOR_COORDINATION", "ONBOARDING_RECOGNITION_TRIGGER")): readiness += 6
    readiness = min(30, readiness)

    # Contactability: 0-20
    role_email = bool(ROLE_EMAIL_RE.search(email))
    email_domain = email.rsplit("@", 1)[1] if "@" in email else ""
    contactability = (10 if email and not role_email else 3 if email else 0) + (5 if linkedin else 0) + (5 if email_domain == domain and domain else 0)
    email_quality = "named_business" if email and not role_email and email_domain == domain else "named_other_domain" if email and not role_email else "role_based" if email else "missing"

    total = fit + readiness + contactability
    live_signal_score = 0
    if disqualifiers:
        tier = "DISQUALIFIED"
        confidence = "LOW"
    elif total >= 70:
        tier = "TIER_1"
        confidence = "HIGH"
    elif total >= 50:
        tier = "TIER_2"
        confidence = "MEDIUM"
    else:
        tier = "TIER_3"
        confidence = "LOW"

    primary = next((x for x in ("WHITE_LABEL_READY", "PARTNERSHIP_LANGUAGE", "PHYSICAL_BRAND_TRIGGER", "VENDOR_COORDINATION", "ONBOARDING_RECOGNITION_TRIGGER", "RECURRING_CLIENT_MODEL", "CLIENT_PORTFOLIO") if x in labels), relevance_labels[0] if relevance_labels else "NO_VERIFIED_SIGNAL")
    opener_template = lane["opener"].get(primary)
    if not opener_template:
        opener_template = lane["opener"].get(relevance_labels[0], "Saw {company}'s work and thought there may be a useful partner fit with Creative Alternatives.") if relevance_labels else ""
    opener = opener_template.format(company=company) if opener_template else ""
    if lane_slug == "partner-event-agencies" and subsegment != "planner_producer":
        opener = f"Saw {company} already supports event clients from the {subsegment.replace('_', ' ')} side, so I thought there may be useful referral overlap when merchandise comes up."
    elif lane_slug == "partner-agencies" and subsegment == "media_publisher":
        opener = f"Saw {company} builds branded media and audiences, so I thought there may be overlap when sponsors or clients need merchandise around a campaign or live activation."
    next_action = "RESEARCH_LIVE_SIGNAL_AND_1TO1" if tier == "TIER_1" else "SMARTLEAD_PERSONALIZED" if tier == "TIER_2" else "NURTURE_OR_REVIEW" if tier == "TIER_3" else "DO_NOT_LAUNCH"
    tier_reason = "; ".join(disqualifiers) if disqualifiers else f"fit={fit}, readiness={readiness}, contactability={contactability}; live signals not yet checked"

    return {
        "rank": 0, "tier": tier, "total_score": total, "partner_fit_score": fit,
        "partner_readiness_score": readiness, "contactability_score": contactability,
        "live_signal_score": live_signal_score, "intent_confidence": confidence,
        "primary_signal": primary, "signal_labels": "|".join(labels), "signal_evidence": "|".join(evidence),
        "tier_reason": tier_reason, "first_name": first, "last_name": last,
        "full_name": " ".join(x for x in [first,last] if x), "title": title,
        "canonical_title": canonical_title(title), "company_name": company,
        "company_name_normalized": normalized_company(company), "company_domain": domain,
        "company_website": f"https://{domain}" if domain else "", "company_industry": industry,
        "company_staff": staff, "email": email, "email_quality": email_quality,
        "linkedin_url": linkedin, "partner_lane": raw.get("partner_lane") or lane_slug.replace("-","_"),
        "partner_subsegment": subsegment,
        "partner_offer": raw.get("partner_offer") or candidate.get("partner_offer") or "",
        "personalized_opener": opener,
        "value_line": "We handle product curation, quoting, proofs, production coordination, and delivery while the partner keeps the client relationship.",
        "cta_line": "Would it be useful to test the model on one real client request?",
        "recommended_next_action": next_action, "relationship_state": raw.get("relationship_state") or "cold-never",
        "suppression_checked": not any(x.startswith("existing_customer") for x in disqualifiers),
        "review_status": "human_review_required", "source": raw.get("source") or "ai_ark",
        "summary": summary, "disqualifiers": disqualifiers,
    }


def write_csv(path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        w.writeheader(); w.writerows(rows)


def process_lane(base, slug, first_launch):
    lane_dir = base / slug
    raw_path = lane_dir / "raw-ai-ark-emails.json"
    if not raw_path.exists():
        raise FileNotFoundError(raw_path)
    raw_rows = json.loads(raw_path.read_text())
    by_id, by_domain = load_candidate_index(lane_dir)
    suppressed_emails, suppressed_domains = load_suppressions()
    lane = LANES[slug]
    scored, seen_email, seen_domain = [], set(), set()
    for raw in raw_rows:
        email = normalize_text(raw.get("email")).lower()
        domain = clean_domain(raw.get("company_domain"))
        if email in seen_email or domain in seen_domain: continue
        seen_email.add(email); seen_domain.add(domain)
        candidate = by_id.get(raw.get("ai_ark_id")) or by_domain.get(domain) or {}
        scored.append(score_row(raw, slug, lane, candidate, suppressed_emails, suppressed_domains))
    order = {"TIER_1":0, "TIER_2":1, "TIER_3":2, "DISQUALIFIED":3}
    scored.sort(key=lambda r:(order[r["tier"]], -r["total_score"], r["company_name_normalized"]))
    for i,row in enumerate(scored,1): row["rank"] = i
    (lane_dir / "enriched-scored.json").write_text(json.dumps(scored, indent=2))
    write_csv(lane_dir / "master-scored.csv", scored)
    counts = {}
    for tier in order:
        subset=[r for r in scored if r["tier"]==tier]
        counts[tier]=len(subset)
        write_csv(lane_dir / f"{tier.lower().replace('_','-')}.csv", subset)
    launch=[r for r in scored if r["tier"] in {"TIER_1","TIER_2"}][:first_launch]
    write_csv(lane_dir / f"first-launch-{first_launch}-review.csv", launch)
    return {"lane":slug,"input":len(raw_rows),"scored":len(scored),**counts,"first_launch_review":len(launch)}


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--base",type=Path,default=DEFAULT_BASE)
    ap.add_argument("--lane",choices=["all",*LANES],default="all")
    ap.add_argument("--first-launch",type=int,default=100)
    args=ap.parse_args()
    selected=LANES if args.lane=="all" else {args.lane:LANES[args.lane]}
    reports=[process_lane(args.base,slug,args.first_launch) for slug in selected]
    (args.base/"enrichment-score-report.json").write_text(json.dumps(reports,indent=2))
    print(json.dumps(reports,indent=2))

if __name__=="__main__":
    main()
