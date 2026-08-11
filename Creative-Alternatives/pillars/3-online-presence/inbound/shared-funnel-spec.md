# Shared Inbound Funnel Specification

## Purpose

Turn every inbound visitor into one of four useful outcomes:

1. Qualified sales opportunity
2. Existing-customer service or reorder request
3. Nurture or future-season lead
4. Clearly categorized non-sales inquiry

The funnel must reduce friction without hiding the information Ryan, Maclaine, and Kenny need to decide whether and how to respond.

## Offer selection

### Bulk merchandise

Visitor receives: a curated product direction, feasibility response, or request for the missing information needed to quote.

Primary action: **Get Product Ideas**

### Managed online store

Visitor receives: a store concept, assortment direction, or a fit response after the operating model is confirmed.

Primary action: **See My Store Concept**

### Gifting

Visitor receives: a curated gift direction based on recipient, quantity, budget, date, and shipping needs.

Primary action: **Build My Gift Plan**

### Event merchandise

Visitor receives: a date-safe product and timeline direction based on the event requirements.

Primary action: **Plan My Event Merch**

### Rush request

Visitor receives: a human feasibility response. The site must not automatically guarantee production.

Primary action: **Call Kenny** or **Check My Deadline**

## Form architecture

Use one underlying form schema with conditional fields by service and niche.

### Implementation choice

Use a HubSpot-hosted embedded form as the primary form inside Squarespace. The complete visible and hidden field model exceeds the Squarespace form-block recommendation of 30 fields, and HubSpot is the lead system of record. Use the native Squarespace form only as a reduced fallback with redundant storage.

The primary form must emit `inquiry_submit` only after HubSpot confirms that the submission persisted. A submit click or browser validation attempt is diagnostic, not a conversion.

### Always required

- First name
- Last name
- Work email
- Organization
- What are you planning?
- Date needed or planning horizon
- Short description
- Consent to receive a response to the inquiry

### Qualification fields

- Niche
- Service interest
- Approximate quantity or audience range
- Approximate budget range, optional until Kenny approves the ranges
- Shipping model: one location, multiple locations, individual recipients, unknown
- Organization website
- Phone, optional except rush requests

### Creative inputs

- Logo upload, optional
- Brand guidelines upload, optional
- Product categories of interest
- Existing store or current vendor URL, optional

### Hidden attribution

- `first_touch_source`
- `first_touch_medium`
- `first_touch_campaign`
- `first_touch_term`
- `first_touch_content`
- `latest_touch_source`
- `latest_touch_medium`
- `latest_touch_campaign`
- `latest_touch_term`
- `latest_touch_content`
- `landing_page`
- `referrer`
- `niche`
- `offer`
- `gclid`
- `gbraid`
- `wbraid`
- `msclkid`
- `fbclid`

Respect privacy and platform policies. Store only fields CA needs and is permitted to retain.

## Form variants

### Camp

Add:

- Camp type
- Camper/staff/parent audience
- 2027 planning vs current-season rush
- Bulk, store, or both

### Racquet club

Add:

- Squash, tennis, padel, pickleball, or multi-racquet
- Club, tournament, team, pro shop, or event
- Member count or order quantity range

### Law firm

Add:

- Recruiting, retreat, client gift, event, employee, or general program
- Office count or recipient quantity range
- Approval or brand-guideline requirements

### School

Add:

- PTA/PTO, athletics, administration, booster, or school store
- Parent-direct ordering vs bulk distribution
- School year or event date

### Corporate/event

Add:

- Employee, client, partner, conference, onboarding, recognition, or internal store
- Single-address, venue, multi-address, or individual shipping
- Number of locations or recipients

## Submission behavior

1. Validate the form in the browser.
2. Create or update the HubSpot contact.
3. Create an inbound inquiry record or deal according to the CRM design.
4. Preserve first-touch attribution and update latest-touch attribution.
5. Send an internal notification to the assigned owner.
6. Send a plain confirmation to the visitor that states what happens next without making an unapproved promise.
7. Route rush requests to phone and immediate human review.
8. Add the record to a human qualification queue.

## Human qualification

### Required status

- `Qualified`
- `Nurture`
- `Existing Customer`
- `Vendor/Partner`
- `Job Seeker`
- `Spam`
- `No Fit`

### Qualified criteria

A lead is qualified when available evidence supports all of the following:

- Real organization or buyer
- Valid merchandise, store, gifting, or event need
- Plausible timing
- Plausible audience, quantity, or program scope
- CA can likely fulfill the request
- A useful next step exists

Do not reject a high-value lead merely because budget is unknown. Use `Nurture` when timing is future or information is incomplete.

### Lead-priority score

| Signal | Points |
|---|---:|
| Existing customer | +5 |
| Wave 1 niche | +3 |
| Clear event or need date | +2 |
| Quantity/audience supplied | +2 |
| Logo or brand assets supplied | +1 |
| Bulk plus store interest | +2 |
| Rush request within feasible range | +2 |
| Individual/single-item request | -4 |
| Job, vendor solicitation, or spam signal | -10 |

The score prioritizes review; it does not automatically send, quote, reject, or promise anything.

## Ownership and SLA

### Suggested routing

- Camps, schools, clubs, and stores: Maclaine primary; Ryan support.
- Law, corporate, events, and experiments: Ryan primary; Maclaine support.
- Rush, pricing, unusual production, and exceptions: Kenny approval.

### Response targets

- Rush: human review as soon as practical during business hours.
- Qualified active project: same business day where capacity allows.
- Future-season or nurture: useful acknowledgement followed by scheduled nurture.
- Vendor/job/spam: categorized without entering the sales pipeline.

Do not publish a response-time guarantee until owners and capacity approve it.

## Lead paths

### Qualified active project

1. Human reviews submission.
2. Request missing operational information.
3. Produce concept or curated direction if appropriate.
4. Offer call or continue by email.
5. Create quote only after required inputs and approval.
6. Record outcome and next step.

### Future-season nurture

1. Acknowledge timing.
2. Send the most relevant planning resource.
3. Set a date-based task before the buyer's planning window.
4. Add only to marketing nurture when consent permits.

### Existing customer

1. Match to QuickBooks/customer record.
2. Route to relationship owner.
3. Preserve inbound source for service analysis but do not count as a new logo.
4. Treat reorder and expansion revenue separately.

### No fit

Record reason:

- Too small/single item
- Unsupported product or fulfillment need
- Timing impossible
- Location/shipping unsupported
- Budget mismatch
- Not a buyer
- Other, with note

No-fit reasons improve page copy, FAQs, exclusions, ads, and qualification.

## Confirmation copy

### Standard

> Thanks - we have your project details. A person from Creative Alternatives will review the request and follow up with the most useful next step. If your deadline is urgent, call Kenny at 718-496-5268.

### Future-season

> Thanks - planning early gives us more room to curate the right products and timeline. We will review the details and follow up with the best next step for your season.

No automated message should claim that a quote, mockup, store, or order is accepted or guaranteed.

## Nurture framework

Nurture is seasonal and problem-based, not a generic newsletter.

- Planning reminder before buyer window
- Relevant checklist or calendar
- Approved case study
- Product direction or trend tied to the niche
- Deadline reminder
- Direct invitation to review a concept

Stop or suppress nurture after an active sales conversation unless the owner wants it to continue.

## Privacy and trust

- Publish a clear privacy policy before running ads or collecting uploads.
- State how uploaded logos and project details are used.
- Limit access to customer assets.
- Do not train external systems on customer artwork unless terms and permission allow it.
- Do not place sensitive customer information in public content.
- Respect consent and unsubscribe requirements.

## End-to-end QA scenarios

1. New camp lead from Google Ads with logo upload.
2. Future 2027 camp lead from organic search.
3. Current customer submitting a reorder request.
4. Law firm lead from LinkedIn without a logo.
5. Event planner with an urgent date.
6. School store inquiry from Google Business Profile.
7. Single-shirt consumer request.
8. Vendor solicitation.
9. Spam bot submission.
10. Form failure and retry.

For each scenario verify page attribution, CRM record, owner, status, notification, confirmation, and conversion event.
