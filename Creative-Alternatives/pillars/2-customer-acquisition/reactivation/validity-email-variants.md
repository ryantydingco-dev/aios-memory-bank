# Validity Email Variants — Bloom-style proof + scarcity for reactivation

> Extends `REACTIVATION-TEMPLATE.md` (same targeting, merge fields, guardrails). Adds the Bloom #6 layer:
> one proof statement + honest capacity urgency per email. Source: `reference/bloom-playbook-translation.md`
> and `../proof-statement-bank.md`.
>
> **Guardrails (unchanged from the reactivation loop):** drafts only · Maclaine/Kenny approve · personal email,
> NEVER SmartLead · Kenny reviews the segment list · honest numbers only — every claim must be VERIFIED in the
> proof bank or pulled from the recipient's real ledger history.

## When to send (seasonality = the whole play)

Camps buy **Jan–Apr** for summer. The "slots are filling" email is honest in **Feb–Mar** and dishonest in September.
Before sending, verify the capacity claim with Kenny + the seasonality query in the proof bank. If Kenny says
spring never actually fills, use Variant B (streak proof) and drop the scarcity line entirely.

## Variant A — "Season slots" (camps, reorder-due, Feb–Mar send)

**Subject:** `{{CampName}} — locking in summer production now`

```
Hi {{FirstName}},

It's Maclaine at Creative Alternatives — we made {{CampName}}'s gear
{{last_order_season}} and I wanted to reach out before the calendar gets away
from us.

Honest heads-up: our spring production schedule fills every year — camps
that get proofs approved by {{cutoff_month}} are the ones that get delivery
before opening day without rush fees. I'd hate for you to be scrambling
in May.

If you want, I can pull up exactly what you ordered last year and have a
proof with this season's dates on it back to you within 48 hours. Just
reply "same as last year" and we'll take it from there — or tell me what
you'd change.

Warmly,
Maclaine Scher
Creative Alternatives
```

Merge fields: `FirstName, CampName, last_order_season ("last summer"), cutoff_month` (Kenny sets — e.g. "mid-March").
Proof mechanic: scarcity is the proof ("fills every year" = other camps trust us). Only send if TRUE.

## Variant B — "Streak" (long-tenure accounts — the strongest email we can send)

Requires the streak query from the proof bank (`[PULL]` — needs data.db in a CA session).

**Subject:** `{{N}} seasons and counting, {{OrgName}}`

```
Hi {{FirstName}},

Maclaine at Creative Alternatives here. I was going through our records and
realized {{OrgName}} has ordered with us {{N}} seasons straight — since
{{first_year}}. That genuinely means a lot to a family business.

I didn't want season {{N+1}} to slip through the cracks, so I pulled your
{{last_year}} order — {{real_items_summary}}. If you want a repeat, reply
"run it back" and we'll have proofs to you in 48 hours with the same setup.
If you want to change things up, even easier — tell me what you're thinking.

Either way, thank you for {{N}} great years.

Warmly,
Maclaine
```

Proof mechanic: THEIR OWN streak is the validity statement. Nothing to verify externally — it's their history.
This is Bloom's "restocked 3x" turned personal.

## Variant C — "What camps like yours are ordering" (dormant/win-back, weaker relationship)

Use the existing REACTIVATION-TEMPLATE.md email, with ONE proof line inserted after the intro sentence:

> "We're deep in our 27th camp season — 7 of our 15 biggest accounts are camps that reorder every year —
> so I pulled together the {{N}} pieces camps are ordering most right now..."

One line only. Stacking proof statements reads as bragging; a single specific one reads as fact (Bloom's model:
one claim per touch, screenshot-specific).

## Test design (feeds the reactivation loop, monthly first-Monday run)

- **Experiment:** proof/scarcity variant vs. the existing warm template, same segment size, same month.
- **Judge metric (unchanged):** win-back count + win-back revenue from `sales_ledger`.
- **Prediction to log in `loops/reactivation/memory.md`:** variant beats control on reply rate; Variant B beats
  everything on close rate for 5+ year accounts.
- Record which VERIFIED statement was used per send so the proof bank learns what converts.
