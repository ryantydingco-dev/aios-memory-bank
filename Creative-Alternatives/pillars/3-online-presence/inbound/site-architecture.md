# Inbound Site Architecture

## Current-state audit

The current Squarespace site has strong relationship proof, a clear personality, direct phone and email paths, a 24-48 hour proof promise, and useful service pages. It does not yet operate as an inbound acquisition system.

Observed gaps on 2026-07-10:

- Homepage title is only `Creative Alternatives`.
- Public page meta descriptions are blank.
- Sitemap includes `/home`, which canonicalizes to `/`.
- The site has no niche-specific commercial pages for camps, racquet clubs, or law firms.
- Structured data exposes a basic `WebSite` object but not a complete Organization or LocalBusiness entity.
- The public site does not demonstrate attributable niche conversion paths.
- The general contact form does not currently include logo upload, acquisition attribution, or a distinct rush path.

The root domain correctly redirects to the `www` domain. The existing site is not being replaced; this architecture extends and improves it.

## Navigation model

### Primary navigation

- **Services**
  - Bulk Merchandise
  - Managed Online Stores
  - Client & Employee Gifting
  - Event Merchandise
- **Industries**
  - Summer Camps
  - Racquet Clubs
  - Law Firms
  - Private Clubs
  - Schools
  - Corporate Teams
- **Work**
  - Projects
  - Reviews
  - Case Studies
- **Resources**
- **About**
- **Contact**

Primary header action: **Start A Project**

Persistent urgent action on mobile: **Call Kenny** using the familiar phone icon plus accessible text or tooltip where appropriate.

## URL map

### Core

| URL | Role | Primary CTA |
|---|---|---|
| `/` | Umbrella positioning, proof, service and niche routing | Start A Project |
| `/about` | Kenny and Maclaine story, expertise, operating philosophy | Talk To The Team |
| `/reviews` | Public social proof organized by buyer problem | Start A Project |
| `/work` or existing `/gallery-1` | Real finished work, filterable by niche/use case if feasible | Get Product Ideas |
| `/contact` | General inquiry and urgent paths | Send Inquiry / Call Kenny |

### Services

| URL | Role | Primary CTA |
|---|---|---|
| `/bulk-merch-orders` | One-time and recurring bulk orders | Get Product Ideas |
| `/online-stores` | Managed stores and organization-direct ordering | See My Store Concept |
| `/client-gifting` | Curated client, employee, and member gifting | Build My Gift Plan |
| `/event-merchandise` | Deadline-led event, conference, retreat, and tournament programs | Plan My Event Merch |
| `/seasonal-merch-programs` | Recurring calendars, reorders, and drops | Build My Merch Calendar |

### Wave 1 industries

| URL | Role | Primary CTA |
|---|---|---|
| `/summer-camp-merchandise` | Camp bulk, store, staff, camper, parent, and alumni use cases | Plan My 2027 Camp Merch |
| `/squash-racquet-club-merchandise` | Club kit, store, tournament, recognition, and pro-shop use cases | See My Club Collection |
| `/law-firm-branded-merchandise` | Recruiting, retreats, client gifts, events, and internal merch | Build My Firm Concept |

### Wave 2 tests

| URL | Role | Primary CTA |
|---|---|---|
| `/private-club-merchandise` | Member retail, events, staff, tournaments, and recognition | Plan My Club Merch |
| `/school-spirit-wear-stores` | Human-managed spirit wear and school ordering | Plan My School Store |
| `/corporate-merch-programs` | Right-sized company stores, onboarding, events, and gifting | Plan My Merch Program |

### Resources

Resources use stable, descriptive URLs and link to one primary commercial page.

- `/resources/camp-merchandise-planning-calendar`
- `/resources/camp-store-vs-bulk-order`
- `/resources/club-tournament-merch-checklist`
- `/resources/law-firm-merch-calendar`
- `/resources/event-merchandise-timeline`
- `/resources/company-store-buyers-guide`
- `/resources/private-club-merch-calendar`
- `/resources/human-managed-vs-self-serve-school-store`

### Case studies

Use customer-approved descriptive slugs:

- `/case-studies/[approved-camp-or-anonymized-description]`
- `/case-studies/[approved-club-or-anonymized-description]`
- `/case-studies/[approved-firm-or-anonymized-description]`

Each case study links to the most relevant niche and service page.

## Shared commercial-page structure

Every service and niche page follows this logic while keeping its copy and proof unique.

1. **Hero:** buyer, specific problem, outcome, and one primary action.
2. **Proof bar:** approved facts and niche-specific credibility.
3. **Situation selector:** route the buyer to bulk, store, gifting, event, or rush.
4. **Curated solutions:** organize products around jobs, audiences, and moments.
5. **How CA works:** inquiry, curation, proof, approval, production, delivery.
6. **Niche proof:** testimonial, finished work, case study, or documented experience.
7. **Decision guidance:** timeline, checklist, comparison, or FAQ.
8. **Concept offer:** explain exactly what the visitor receives after submitting.
9. **Qualification form:** short, contextual, attributable.
10. **Final direct path:** form, phone, and email.

## Internal-linking rules

- Homepage links to all service pages and Wave 1 niche pages.
- Every niche page links to the two or three relevant service pages.
- Every service page links to the industries where that service has credible proof.
- Every resource links to one commercial parent and one related resource.
- Every case study links to one niche and one service page.
- No page uses `click here` as anchor text.
- Avoid sitewide footer links to every low-priority niche; keep the hierarchy meaningful.

## Title and description patterns

### Service pages

`[Service Outcome] | Creative Alternatives`

Example: `Managed Online Stores For Branded Merchandise | Creative Alternatives`

### Niche pages

`[Niche] [Merchandise Service] | Creative Alternatives`

Example: `Summer Camp Merchandise & Online Camp Stores | Creative Alternatives`

### Resources

`[Specific Buyer Question Or Asset] | Creative Alternatives`

Meta descriptions should summarize the actual page value and CTA. Do not reuse descriptions across pages.

## Structured data plan

After business details are confirmed:

- Organization or LocalBusiness on the primary entity page.
- Service data where it accurately describes a service.
- BreadcrumbList for deeper pages.
- FAQPage only when the visible page contains genuine FAQs and current eligibility guidelines permit it.
- Article for original resources.
- Review or AggregateRating only when technically and policy compliant; do not mark up testimonials merely to seek stars.

Validate with Google's Rich Results Test and Schema Markup Validator before requesting recrawl.

## Indexing states

### Draft

- Not linked publicly.
- Not submitted for indexing.
- May contain `[CONFIRM]` notes internally.

### Review

- Claims and proof approved.
- Form and attribution tested.
- Mobile and accessibility review complete.
- No internal placeholders.

### Live, noindex

- Used for ad or stakeholder testing when organic value is not ready.
- Must have a canonical and functional conversion path.

### Live, indexable

- Unique buyer value, original proof, accurate metadata, internal links, conversion tracking, and named owner.

## Squarespace implementation sequence

1. Capture a backup or duplicate of the current page before editing.
2. Fix site title, descriptions, URL naming, navigation, and sitemap issues.
3. Add shared form and tracking behavior.
4. Build the camp page and test it end to end.
5. Create the reusable layout from the validated camp page.
6. Build racquet and law pages with unique copy and proof.
7. Add resource and case-study collections.
8. Add Wave 2 pages one at a time after evidence review.
9. Submit new URLs in Search Console and monitor indexing.

## Page QA

- Correct title, meta description, URL, canonical, and index state.
- Exactly one clear H1.
- Buyer-specific language above the fold.
- Primary CTA visible without scrolling on common mobile and desktop sizes.
- Phone and email links work.
- Form validation, success state, spam protection, and error state work.
- Hidden attribution fields persist correctly.
- GA4 and ad conversions fire once per valid action.
- HubSpot record contains niche, source, offer, page, and campaign.
- Images are real or clearly approved concepts; logos and names are accurate.
- No unapproved customer, price, margin, deadline, guarantee, or outcome claim.
- Text remains readable and controls remain usable on mobile.
