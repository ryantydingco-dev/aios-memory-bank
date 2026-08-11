# Mailchimp-ready email templates — drafts

> These are local copy blocks only. Do not upload or send until permission, audience
> fields, links, sender identity, claims, and final recipients are approved.

## Merge-field contract

- `*|FNAME|*` — first name, with a configured fallback
- `*|COMPANY|*` — organization name, only after the audience field is mapped
- Optional campaign fields such as prior-order description are **not** merged at scale
  until every value is verified. High-value and reorder messages should be individually
  reviewed when they cite history.
- `[REPLY ADDRESS]`, `[PLANNING LINK]`, and `[PREFERENCE LINK]` are placeholders.

Every email requires CA's approved physical-address footer, unsubscribe link, sender name,
and privacy/permission settings in Mailchimp.

---

## Template 1 — high-value engagement

**Template ID:** `MC-TPL-HIGH-VALUE-PLAN`

**Purpose:** Start a personal annual-planning conversation with a key account.

**Subject directions:**

- planning the next few *|COMPANY|* moments
- a simple merchandise plan for *|COMPANY|*
- getting ahead of *|COMPANY|*’s next events

**Preheader:** A short planning session now can prevent three last-minute scrambles later.

**Body:**

Hi *|FNAME|*,

Rather than wait for the next event, recognition moment, or gifting deadline to become
urgent, we’d like to help map the next few merchandise moments for *|COMPANY|*.

The goal is simple: keep the brand and approved details on file, work backward from the
dates, and curate a small set of useful options for each audience. That might mean
retail-quality apparel, durable drinkware, considered packaging, or a more sustainable
choice where it fits — not a giant catalog.

If you send us the next two or three dates on your calendar, we’ll turn them into a simple
plan for you to review.

**CTA button:** Plan the next few moments → `[PLANNING LINK]`

Or reply directly with the dates and audiences.

Maclaine
Creative Alternatives

**Approval checklist:** account-owner review; key-account status; relationship context;
capability; sustainability phrasing; link; sender/footer; recipient-by-recipient approval.

---

## Template 2 — reorder or event planning

**Template ID:** `MC-TPL-REORDER-EVENT`

**Purpose:** Help a known customer plan 6–10 weeks ahead of a likely reorder/event.

**Subject directions:**

- *|COMPANY|*’s next order — same direction or something fresh?
- getting ahead of *|COMPANY|*’s [event/season]
- should we pull the last *|COMPANY|* order?

**Preheader:** Reuse what worked, change what did not, and work backward from the date.

**Body:**

Hi *|FNAME|*,

We’re looking ahead to *|COMPANY|*’s next [event/season] and wanted to make the planning
easy before timing gets tight.

We can start from the last approved direction and either:

- rebuild the reorder with the known details, or
- curate two or three fresh options around the audience, use, and budget.

The recommendation will stay practical — useful everyday merchandise, the right
drinkware or apparel for the setting, and personalization or packaging only where it adds
something.

Are you planning the same type of order this time, or should we bring a few new ideas?

**CTA button:** Tell us what is coming → `[PLANNING LINK]`

Maclaine
Creative Alternatives

**Approval checklist:** past-order fact; event/date; owner; quantities/specs if referenced;
production capacity; no unapproved deadline promise; permission and suppression.

---

## Template 3 — seasonal promotional opportunity

**Template ID:** `MC-TPL-SEASONAL-OPPORTUNITY`

**Purpose:** Connect a timely planning moment to a useful, tightly curated merchandise
direction.

**Subject directions:**

- useful gear for [moment], not giveaway clutter
- a practical [fall/event/recruiting] merchandise plan
- what should people still be using after [event]?

**Preheader:** Start with the audience and the job the merchandise needs to do.

**Body:**

Hi *|FNAME|*,

If *|COMPANY|* has a [fall event / recruiting push / staff moment / trade show] ahead,
the first question is not “what can we put a logo on?”

It is: what should the item help people do, and will they still use it afterward?

Once we know the audience, date, quantity, and setting, we can narrow the field to a small
set — for example a retail-quality layer, durable drinkware, a useful bag, or a
personalized kit. If a lower-impact material or packaging choice fits, we’ll show that
beside the conventional option so you can compare.

Reply with the moment you are planning and we’ll suggest a focused direction.

**CTA button:** Plan the merchandise → `[PLANNING LINK]`

Maclaine
Creative Alternatives

**Approval checklist:** timely moment; product availability; environmental claims;
minimums; packaging/fulfillment capability; any examples; frequency cap.

---

## Template 4 — win-back

**Template ID:** `MC-TPL-WINBACK`

**Purpose:** Respectfully reopen a prior relationship and confirm whether the contact and
permission are still current.

**Subject directions:**

- still the right person at *|COMPANY|*?
- should we keep *|COMPANY|*’s old order details on file?
- checking in from Creative Alternatives

**Preheader:** A quick check on whether anything is coming up — and whether we should keep
in touch.

**Body:**

Hi *|FNAME|*,

It has been a while since we worked with *|COMPANY|*, so I wanted to check in without
assuming you need anything.

If an event, staff order, recognition moment, client gift, or reorder is coming up, we can
make the first step easy: reuse the old direction where it still fits or curate a tighter,
more current set around the audience and date.

If you are still the right person, just reply with what is coming up. If not, tell me who
owns it now — or use the preference link and we will update our records.

**CTA button:** Update preferences → `[PREFERENCE LINK]`

Maclaine
Creative Alternatives

**Approval checklist:** explicit permission basis; identity; relationship history; owner
hold; no open dispute/A/R coupling; preference link; immediate unsubscribe suppression.

---

## Plain-text fallback

Every campaign must have a plain-text version. Preserve the same single CTA and do not add
extra links or a product list. Replies route to a monitored inbox with same-business-day
ownership.

## Prohibited copy patterns

- “We have thousands of products” as the lead.
- Unsupported discounts, savings, delivery guarantees, sustainability claims, or customer
  stories.
- An inferred prior-order detail.
- False urgency or an invented cutoff date.
- “You bought X last year” unless the row was verified that day.
- More than three product directions before discovery.
