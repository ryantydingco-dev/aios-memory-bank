# Proof Engine SOP — kill the $75 loop

> 2026-07-05. Problem: proof iteration runs CA ↔ artist ↔ customer, the artist bills ~$75 PER SESSION,
> and a typical deal takes 3–4 rounds → $225–300 of art cost + days of delay per order, eating margin
> on a 30–40% gross business. Fix: **AI does every iteration. The artist gets paid once, at the end,
> for production art only. The customer iterates on a proof page, not an email chain.**

## The rule that changes the economics

**Iteration is free. Production is paid once.**

- AI mockups (the existing pipeline from `mockup-lead-magnet-sop.md`) handle EVERY visual round —
  placement, colors, product swaps, text changes. Minutes per round, ~$0.
- The human artist is repositioned as **production-art pass**: ONE session, AFTER the customer
  approves the visual, converting the approved layout to print-ready vector/separations. $75 once.
- Cheaper still: many suppliers include **free art services** with an order — when the supplier's
  art department can produce the final files, the artist pass costs $0. Ask per order; default to
  supplier art for simple 1–2 color imprints, use our artist for complex/multi-process work.
- If a customer wants ORIGINAL custom illustration (not layout/placement), that's design work —
  quote it as a paid line item on the order. Never absorb it silently.

**Cost per deal: $225–300 → $0–75. Time per round: days → same day.** The savings are pure margin,
and the speed IS the brand promise ("see it in an hour").

## Guardrail — AI images never go to the press

AI proofs are **visual proofs**: they show the customer what they're approving. The decorator gets
real production files (vectors, PMS colors, imprint dimensions) produced in the single artist/supplier
pass and checked against the approved visual. Every proof page carries the line:
*"Visual proof — final production art will match this approved layout; colors matched to PMS on press."*
This is what prevents the industry's #2 pain (quality surprises) while we exploit #1 (speed).

## The loop

1. **Intake** (minutes): logo + product SKUs + any brand colors → generate 3 mockup options
   (existing nano-banana/destiNY pipeline — same as the lead-magnet motion).
2. **Proof page** (1 command): `python scripts/proof_page.py proofs/<client>/proof.json` → a single
   self-contained HTML file. Send it to the customer (attach or host). They see all versions,
   click **Approve** or **Request a change** per item — both open a pre-filled email back to us
   with structured feedback. No "per my last email" archaeology.
3. **Revise** (minutes): feedback → regenerate → bump `round` in the JSON → regenerate page →
   resend. Repeat as many rounds as the customer wants. It costs us nothing — say yes cheerfully.
4. **Approval → production pass** (once): approved visual + specs → supplier art dept (free) or
   our artist ($75, single session, clear brief: "match this approved layout, deliver vector +
   separations"). Artist is never in the customer loop.
5. **Archive**: each round's JSON + images stay in `proofs/<client>/` — the reorder superpower.
   Next season: "same as last year's approved v3?" is a 2-minute job, not a new art project.

## What to tell the artist

She's not losing work — she's losing the annoying part. Old: vague feedback loops, revision churn,
being the bottleneck. New: one clean brief per order with an approved visual to match, paid the same
$75 for an hour of real production work instead of round 4 of "move the logo left."

## Metrics to watch (feeds the weekly report)

- Art cost per deal (target: ≤$75, often $0)
- Proof turnaround: first mockup ≤1 hr from logo-in-hand; revision rounds same-day
- Rounds to approval (interesting, not a target — free rounds are a feature)
