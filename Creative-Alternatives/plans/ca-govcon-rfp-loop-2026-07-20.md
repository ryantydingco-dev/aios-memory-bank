# Creative Alternatives Government-Contracting Opportunity Loop

**Source video:** GovClose, “The Only AI Tools That Make Money With Government Contracts in 2026”  
**Video:** https://www.youtube.com/watch?v=30pS9QiGjXc  
**Prepared:** 2026-07-20

## Recommendation

Treat public procurement as a **small, measurable acquisition lane**, not a new company identity and not an excuse to build proposal automation before CA is procurement-ready.

The strongest point from the video is not that Claude, ChatGPT, Gemini, or NotebookLM wins contracts. It is that AI is useful for:

- Current opportunity and spending research
- Source-grounded agency/account intelligence
- Solicitation requirement extraction
- Compliance matrices
- Proposal drafting and cross-checking
- Daily reporting

It does **not** replace procurement knowledge, relationships, registrations, pricing judgment, or human accountability.

## Why this may fit CA

Public entities explicitly purchase items CA already handles:

- Promotional products and recruiting giveaways
- Branded apparel and uniforms
- Awards, trophies, and recognition items
- Event and conference merchandise
- Employee or volunteer kits
- Recreation and athletics merchandise
- Campus, department, and program merchandise

Open solicitations are unusually strong demand signals: a buyer, requirement, budget process, and deadline already exist.

Public SAM.gov examples exist for recruiting shirts, promotional shirts/hoodies, awards/promotional items, and branded giveaways. Those examples demonstrate category presence, not that CA is currently eligible or likely to win.

## Existing CA asset

The repository already contains:

`scripts/ca_rfp.py`

It searches the SAM.gov Opportunities API for terms including:

- promotional products
- promotional items
- branded apparel
- logo apparel
- uniforms
- spirit wear
- screen printing
- embroidery
- awards and trophies
- lapel pins
- branded merchandise
- custom apparel

It writes deduplicated opportunity records with agency, title, solicitation number, NAICS, state, posted date, deadline, notice type, and source link.

### Current blocker

`SAM_API_KEY` is not configured. The script cannot run until a free SAM.gov Opportunities API key is added.

The workspace also does not currently verify CA’s:

- Active SAM.gov entity registration
- UEI
- CAGE code, if applicable
- Representations and certifications
- NAICS/PSC registration choices
- Insurance or other standard bid-document readiness
- Public-sector past performance

These must be confirmed before building a federal proposal machine.

---

# Agent loop

## Objective

Generate profitable, winnable public-sector merchandise opportunities without wasting Kenny’s quoting time.

## Primary metric

> Net collected gross profit from public-sector orders per human bid hour.

## Leading metrics

- Qualified opportunities discovered
- Opportunities passing bid/no-bid review
- Bids submitted
- Bid turnaround time
- Win rate
- Average gross profit per award
- Payment time
- Repeat or vehicle-based purchasing opportunities

Raw solicitation count is not a success metric.

## Cadence

- Opportunity scan: weekday mornings
- Qualification: same business day for deadlines under 14 days
- Market/spending review: monthly
- Loop review: monthly until enough volume exists for weekly learning

---

# Loop stages

## 1. Opportunity collector — deterministic

### Sources

1. SAM.gov Opportunities API
2. State procurement portals
3. Municipal and county procurement pages
4. School-district and university bid portals
5. Public authorities and parks/recreation systems
6. Historical awards from USAspending

### Output

Each opportunity stores:

- Solicitation/notice ID
- Buying organization
- Opportunity title
- Source URL
- Posted date
- Response deadline
- Notice type
- Set-aside status
- NAICS and PSC, when available
- Place of performance
- Product/service summary
- Estimated value, when provided
- Required vehicle or registration
- Contact information from the official source
- Attachments and amendments
- Collection timestamp

No source URL means no opportunity record.

## 2. Bid/no-bid qualification agent

Scores each opportunity against:

### Fit

- CA already supplies the requested category
- Quantity and decoration are operationally feasible
- Delivery location and deadline are achievable
- Approved suppliers can meet solicitation requirements
- No restricted product-origin or sourcing requirement is unresolved

### Economics

- Expected gross profit
- Bid-preparation time
- Sampling/mockup cost
- Shipping and fulfillment exposure
- Payment timing
- Bond, insurance, portal, or certification burden

### Competitive position

- Small-business or local preference
- Incumbent visibility
- Repeat or contract-vehicle potential
- Commodity price-only bid versus managed-service need
- Whether curation, proof management, kitting, or deadline ownership matters

### Eligibility

- Registration active
- Required representations complete
- Set-aside requirements satisfied
- Required past performance available
- No contract vehicle CA cannot access

### Decision

- `BID`
- `WATCH / SOURCES SOUGHT`
- `TEAM / SUBCONTRACT`
- `NO-BID`
- `BLOCKED — REGISTRATION`
- `BLOCKED — COST OR COMPLIANCE EVIDENCE`

Every decision includes reasons and supporting source excerpts.

## 3. Agency/account research agent

For qualified opportunities only:

- Pull historical awards and recipients
- Identify incumbents
- Review award size and spending trend
- Find relevant program/procurement office
- Identify small-business specialists when publicly listed
- Review related budget or strategy documents
- Find likely primes or teaming partners

This is where the video’s source-grounded research approach is useful.

## 4. Solicitation compliance agent

Extracts every requirement into a compliance matrix:

| Requirement | Source page/section | CA response | Evidence | Owner | Status |
|---|---|---|---|---|---|

Categories include:

- Submission instructions
- Deadline and timezone
- Required forms
- Product specifications
- Approved equivalents
- Decoration/artwork
- Samples
- Packaging and labeling
- Delivery locations
- Pricing structure
- Evaluation factors
- Domestic sourcing/origin
- Insurance and certifications
- Amendments

The official solicitation and amendments remain authoritative.

## 5. Proposal builder

Builds a draft from the compliance matrix and approved source documents:

- Executive response
- Technical/product response
- Delivery and quality-control plan
- Artwork/proof workflow
- Past-performance references
- Price schedule
- Exceptions or questions
- Required attachments

The builder cannot invent product compliance, lead times, pricing, past performance, or certifications.

## 6. Independent verifier

Before human review:

- Re-read the solicitation and all amendments
- Reconcile every compliance-matrix item
- Recalculate prices and margin
- Verify delivery feasibility
- Confirm product/source claims
- Confirm required documents are present
- Check file names and portal instructions
- Identify every unresolved assumption

## 7. Human approval

Ryan/Kenny approve:

- Bid/no-bid decision
- Product selection
- Pricing and margin
- Compliance representations
- Proposal content
- Portal submission
- Any communication with a contracting officer or prime

The agent never submits a bid or representation autonomously.

## 8. Outcome and learning

Record:

- Submitted/not submitted
- Human hours
- Quote value
- Expected gross profit
- Result
- Award value and collected profit
- Win/loss reason
- Incumbent and competitor observations
- Buyer feedback
- Reorder/vehicle potential

Only repeated evidence changes the bid/no-bid weights.

---

# Data and security policy

## Approved use

- Public solicitations
- Public spending data
- Public budget and strategy documents
- CA-owned non-sensitive capability materials
- Drafting and verification using approved systems

## Human review or exclusion

- Controlled unclassified information
- Export-controlled material
- Source-selection-sensitive information
- Proprietary teaming-partner data
- Government-furnished credentials or protected portal data
- Client information lacking authorization

Do not place sensitive or restricted information into consumer AI tools. The solicitation, applicable policy, customer requirements, and approved CA security posture control—not a generic model privacy claim.

---

# Pilot scope

## Phase 0 — readiness

1. Confirm whether CA is registered in SAM.gov.
2. Confirm UEI/CAGE and representations, if applicable.
3. Choose accurate NAICS/PSC coverage using actual award and opportunity evidence.
4. Assemble a procurement-ready folder:
   - W-9
   - Capability statement
   - Insurance certificate
   - Banking/payment information handled securely
   - Supplier and sourcing evidence
   - Past-performance references
   - Standard quality/delivery narrative
5. Obtain the free SAM.gov Opportunities API key.

## Phase 1 — 30-day radar

- Scan federal opportunities daily
- Add a small set of state/local/education portals
- Collect without bidding automatically
- Manually review the first 25 plausible opportunities
- Identify the top five genuine fits
- Estimate bid hours and gross profit

## Phase 2 — three-bid experiment

Submit at most three carefully selected bids.

Success criteria:

- No missed compliance requirement
- Margin above CA floor
- Bid prepared within the time budget
- At least one useful buyer interaction, shortlist, award, or high-quality debrief

Do not scale based on solicitation volume alone.

## Phase 3 — loop decision

Scale only if:

- CA repeatedly finds category-fit solicitations
- Eligibility burden is manageable
- Bid labor is justified by expected gross profit
- Delivery/compliance requirements fit suppliers
- Public-sector payment timing is acceptable

Otherwise retain the radar as an opportunistic signal rather than a dedicated channel.

---

# Immediate next action

The code exists. The immediate gate is not another AI tool—it is confirming procurement readiness and configuring the free SAM.gov API key.

Once those are confirmed, the first live command is:

```bash
python scripts/ca_rfp.py find --days 30
```

That should remain a read-only discovery run. No outreach or bid submission follows without review.
