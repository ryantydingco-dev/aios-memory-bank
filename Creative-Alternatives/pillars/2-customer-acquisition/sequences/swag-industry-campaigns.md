# Swag Campaigns — Industry-Specific Rewrites

> **Status: ✅ LIVE in SmartLead (pushed 2026-06-29).** All 9 `Swag — [Industry] (US)` drafts rebuilt from their industry up — no longer one cookie-cutter template with the name swapped.
>
> **Pushed via the SmartLead REST API** (`POST /campaigns/{id}/sequences`) because the MCP's sequence endpoints 404 (read *and* write). Re-runnable script: `scratchpad/push_swag.py` (note: hardcodes the API key — keep it out of git).
>
> **Format preserved from the originals** (per Ryan's call — keep the setup, add industry depth):
> - **Voice:** Ryan (Director of Go-To-Market, Creative Alternatives).
> - **4 emails**, delays **0 / 4 / 5 / 5**.
> - **Email 1 = A/B test:** variant **A** evergreen, variant **B** leads with `{{signal}}`.
> - **Tags:** `{{first_name}}`, `{{company_name}}`, `{{signal}}` (per-lead AI line — must be populated on every lead).
> - **Offer:** done-for-you swag/gifting (design → warehouse → ship on demand, one contact, 24–48h proofs, mockup-led CTA).
> - **Source of truth = SmartLead.** Full HTML bodies live there + in the push script.

**Campaign IDs:** Law `3562940` · Real Estate `3562939` · Medical `3565567` · Consulting `3563015` · Architecture & Eng. `3563014` · Insurance `3563013` · Agencies `3562942` · Financial `3562938` · Accounting `3562937`. *(Untouched: the two broad "Swag Handled — Corporate" drafts `3562809` / `3562314`.)*

---

## The per-industry angle (why CA, in their world)

| Industry | Their real swag need | The pain | Why CA fits |
|----------|---------------------|----------|-------------|
| **Law** | Client gifts, new-client welcome, OCI/recruiting swag, CLE/event materials, retirement & case-win pieces | Must look *premium* — cheap swag undercuts a firm's image | In-house artists = polished; 24–48h proofs hit event dates |
| **Real Estate** | Closing gifts, open-house swag, signage, agent/brokerage gear | Closing gifts drive referrals but get grabbed last-minute | Whole gifting program run for them; ship to client |
| **Medical** | Staff apparel/scrubs, patient welcome items, health-fair giveaways, referring-physician gifts | No time to source; staff morale + patient experience | Handles staff *and* patient items; reliable reorders |
| **Consulting** | Onboarding kits, client gifts, conference swag | Distributed teams = ship-to-many-addresses headache | Ships each kit anywhere, individually; premium |
| **Architecture & Eng.** | RFP leave-behinds *and* rugged site gear (hard hats, hi-vis), groundbreaking + trade-show swag | Two opposite needs, usually two vendors | "Anything on everything" — folios *and* hard hats, one contact |
| **Insurance** | Top-of-mind items (calendars, magnets), sponsorship gear, client appreciation | Staying top-of-mind = renewals; local branding | Recurring program, easy reorders |
| **Agencies** | Culture/team gear + promo they buy *for clients* | High taste bar; client promo under deadline | Quality + white-label as their behind-the-scenes shop |
| **Financial** | Client appreciation, seminar/event materials, welcome & referral gifts | HNW clients — a cheap gift does more harm than none | Tasteful, premium, consistent; family-run |
| **Accounting** | Branded folders/portfolios for deliverables, post-season thank-yous, busy-season staff kits | Seasonal spikes; deliverable presentation | Handles seasonal + folders, on the firm's timeline |

---

## Canonical example — Law (`3562940`)

**Email 1 · Variant A · subject `{{company_name}} client gifts (quick mockup)`**
Hi {{first_name}}, — Most firms juggle a few vendors for branded gear, and it still ends up looking generic, which is the last thing you want on a client gift or at a recruiting table. That's the part we take off your plate: 27 years of firm-branded work — client welcome gifts, OCI recruiting swag, retirement and case-win pieces, CLE materials — designed in-house so it looks like the firm. We design, store, and ship it, one person to call. *I put together a quick mockup of what a {{company_name}} client gift could look like. Want me to send it over?* — Ryan Tydingco, Director of GTM.

**Email 1 · Variant B · subject `{{company_name}}'s client + recruiting gifts`**
Hi {{first_name}}, — {{signal}} — Whatever the occasion (new-client welcome, OCI table, partner's retirement), the branded piece has to match the firm's reputation. Designed in-house, warehoused, shipped on demand, one point of contact. 27 years, from local firms to teams at Thermo Fisher and Trinity Health. *I mocked up a few {{company_name}} pieces — want me to send them over?*

**Email 2 · +4d · (threads, no subject)** — Follow-up on the mockup; "it stops being something you manage"; 24–48h proofs, one contact. — Ryan

**Email 3 · +5d · subject `how one firm stopped chasing swag`** — A firm we work with ran client gifts + recruiting through three vendors and missed deadlines; we pulled it into one. CTA: 15 minutes.

**Email 4 · +5d · subject `closing your file, {{first_name}}`** — Light breakup; the mockup's ready whenever.

---

## The other 8 — the differentiated headlines (full bodies live in SmartLead)

| Industry | E1-A subject | E1-B subject | E3 proof-story subject |
|----------|-------------|-------------|------------------------|
| **Real Estate** | `{{company_name}} closing gifts (quick mockup)` | `{{company_name}}'s closing + office gear` | `how one brokerage stopped scrambling for closing gifts` |
| **Medical** | `{{company_name}} — staff + patient gear (mockup)` | `{{company_name}}'s staff + patient gear` | `how one practice stopped chasing staff gear` |
| **Consulting** | `onboarding kits for {{company_name}}, shipped anywhere` | `{{company_name}}'s onboarding + client gifts` | `how one firm handled swag for a remote team` |
| **Architecture & Eng.** | `{{company_name}}: from RFP leave-behinds to branded hard hats` | `pitch materials + site gear for {{company_name}}` | `how one firm covered both pitch and site gear` |
| **Insurance** | `staying top-of-mind with {{company_name}}'s clients` | `{{company_name}}'s client + sponsorship gear` | `how one agency stayed top-of-mind without the hassle` |
| **Agencies** | `the swag shop behind {{company_name}}'s pitches` | `your behind-the-scenes promo partner` | `how one agency stopped scrambling for client promo` |
| **Financial** | `client gifts that match {{company_name}}'s clients` | `{{company_name}}'s client + event gifts` | `how one advisory firm kept client gifting consistent` |
| **Accounting** | `branded folders + tax-season thank-yous for {{company_name}}` | `{{company_name}}'s client + staff gear` | `how one firm got ahead of tax season` |

---

## Notes / open items

- **Proof stories are illustrative** (anonymous "a firm we work with…"), matching the originals' style. Name-drops (Thermo Fisher / Trinity Health) carried over from the existing copy — `[confirm or swap for real client examples]`.
- **`{{signal}}`** must be generated per lead (the AI personalization line) or variant B's opener reads blank.
- **Two "Swag Handled — Corporate" drafts** (`3562809` / `3562314`, 150 / 127 leads): **not launching** (Ryan's call, 2026-06-29) — left as-is, not reworked.
- **Spot-check** one campaign in the SmartLead UI to confirm formatting renders as expected before launch.
