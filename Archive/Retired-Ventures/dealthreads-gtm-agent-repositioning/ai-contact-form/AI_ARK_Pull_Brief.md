# AI ARK Pull Brief — Dealthreads AI Contact Form layups

> Hand this to AI ARK so the pull comes back as LAYUPS, not noise. The engine
> (`prospecting_engine.py --infile <export.csv>`) then scores, qualifies, enriches,
> and tears down whatever AI ARK returns.

## Target company filters
- **Geography:** United States only
- **Employee size:** 10–40 (hard cap ~60; this is the founder-led, no-RevOps band)
- **Type:** B2B software / vertical SaaS (sells to other businesses, sales-led)
- **Industries (beachhead):** freight & logistics tech, construction tech, field-service
  software, manufacturing software, healthcare-ops software, legal-ops software
  (operational "boring" verticals — high ACV, under-targeted by outbound)
- **Revenue/funding (if filterable):** post-seed or Series A, OR bootstrapped-profitable
  (real revenue/leads, not pre-launch). Bias toward companies that **raised in the last
  3–9 months** if that filter exists.

## Decision-maker (who to pull as the contact)
- **Titles, in priority order:** Founder / Co-Founder / CEO → then VP Sales / Head of Sales /
  Head of Growth / Head of RevOps → then Head of Marketing / Demand Gen
- Pull the founder/CEO whenever available (they're the buyer at this size)

## Fields to return (so the engine can run)
`company_name, website/domain, contact_first_name, contact_last_name, title, work_email,
linkedin_url, employee_count, city/state, industry`
- **`domain` is the critical one** — the engine ingests by domain.

## Bias toward these signals if AI ARK can filter on them
- Currently **hiring** an SDR / AE / RevOps / Demand-Gen role
- **Recently funded** (seed / Series A, last 3–9 months)
- Active on **paid ads** (running Meta/Google/LinkedIn ads)

## Exclude (these are NOT layups)
- 100+ employees / enterprise / public companies (committee, has RevOps, slow)
- Pre-revenue / pre-launch startups (can't pay, no inbound yet)
- Agencies, consultancies, generic martech (over-pitched, low fit)
- Non-US

## Then run
```
python3 prospecting_engine.py --infile aiark_export.csv --out targets
```
The engine verifies each (demo-form gate, size gate, signal score 0–4), ranks them, and
flags the HOT tier for 1:1 teardowns. Nothing is trusted blindly — every company is
re-checked against its live site.
