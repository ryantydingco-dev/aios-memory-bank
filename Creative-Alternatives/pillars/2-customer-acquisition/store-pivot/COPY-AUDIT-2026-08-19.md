# Campaign Copy Audit — 2026-08-19 (store pivot)

Ryan's call (2026-08-19): gear all campaigns toward online stores. Trigger: inbound form
lead from Yorkville Community School asking for a year-round school merch store, and
Ryan's read that the current copy won't earn replies. This audit is the honest teardown;
the `*_store_v4.md` files in this folder are the rewrites.

## The line Ryan flagged

> "We're a 27-year, multi-million-dollar family business. The page is the whole first
> step. Not a catalog. Not a pitch deck."

Two problems, one of them a rules violation:

1. **"multi-million-dollar" is not on the approved-facts list** (approved: since 1999 /
   27 years, 2,700+ organizations, 75,000+ orders, 24-48h proofs, ~2wk production).
   Telling a cold prospect our revenue answers a question nobody asked, invites price
   anchoring ("they can afford to sharpen the pencil"), and violates the approved-facts
   rule wherever it's running.
2. **It's all about us.** Credentials-first, negation framing ("Not a catalog. Not a
   pitch deck") that argues with objections the reader never raised. Cold email earns a
   reply by naming the reader's job, not by describing the sender.

**This exact line is NOT in the vault.** Searched every sequence file. Meaning either
(a) live SmartLead copy has drifted from the repo, or (b) it's in a page/DM asset that
never got synced. Action: pull the live E1s from all active SmartLead campaigns and
diff against the vault. Law National's copy is not in the vault at all — same fix.

## What's actually wrong with the six live sequences

To be fair to the machine: the v3s are disciplined — short, plain-text, threaded,
approved-facts-only, no discounts, verified twice. The problems are structural, not
line-by-line sloppiness:

1. **Six campaigns, one template.** Every lane opens with the mockup offer, "nothing
   for you to dig up," then "We're a family print shop, 27 years in" (E1 of ALL six),
   then the identical "quick math: two weeks production" E3, then the identical "This
   is my last note" E4. Two prospects comparing inboxes see a blast. One prospect in
   two lists sees it twice.
2. **The 27-years crutch.** "Family print shop, 27 years in" appears in every E1 as the
   proof. Nobody replies because a vendor is old. The one real proof point that moves a
   buyer (Miller Johnson, closed-won) exists in exactly one lane and sits mid-paragraph.
3. **Follow-ups re-ask instead of escalate.** Our own 2026-07-14 audit found the live
   law campaigns get 47-53% opens and ~zero replies on steps 2-3 because each step
   re-asks the same question. That lesson was applied to law-recruiting only. The six
   v3s re-ask "Want me to put them together?" in E2, E3 (variant), and E4.
4. **One-shot offer, no recurrence.** Every lane sells a single order. Zero store /
   year-round / reorder angle anywhere in the engine — while the inbound form is
   pulling store requests on its own.
5. **Still-open deliverability flag:** dealthreads*/calendargroup* sender domains
   pitching CA remain the #1 delete-risk per both verifier rounds. Ryan is running it
   as a deliberate test; revisit with reply data.

## The pivot: mockups → store preview

The wedge upgrades, the muscle stays. Instead of "I'll put your logo on X and send
mockups," every lane now offers a **free preview of the prospect's own branded store**:
their logo on ~5 lane-relevant products on one live page (built with the existing
mockup + Gamma page pipeline until a real store platform is chosen). Same same-day
fulfillment, same human-in-the-loop, higher-LTV close.

## Hard gates before ANY v4 loads

1. **Store terms are still `[CONFIRM]`** with Kenny/Maclaine (model, minimums, who
   fulfills, payments). The v4 copy sells the *preview* (deliverable today) and store
   *benefits that are true of any store* (one link, no size spreadsheets, reorder
   without re-quoting). It makes NO operational promises (no "we warehouse/ship each
   order," no revenue share, no "no minimums") until terms are confirmed.
2. **verify-copy SOP applies:** two-lens verification, then Ryan, before load.
3. **Miller Johnson naming** in the legal lane is still pending Wil's OK (open loop
   since 2026-08-11). Anonymous swap is one API call if he objects.
4. **Don't hard-swap mid-flight.** Active v3 threads finish as v3; v4 loads for new
   leads / the next wave so threading and test data stay clean.

## Lanes

| Lane | Store angle | File |
|---|---|---|
| Trade Show Exhibitors | Show store: booth gear + team apparel, every show not just this one | `tradeshow_store_v4.md` |
| Q4 Corporate Gifting | Gift page: everyone picks their own size/color | `gifting_store_v4.md` |
| Law Firm Admins | Firm store: retreats + onboarding + client gifts, one page year-round | `legaladmin_store_v4.md` |
| Galas / Nonprofits | Supporter merch page: event pieces + after-the-night ordering | `gala_store_v4.md` |
| Race Season | Race store: registrant-facing merch beyond the finisher shirt | `race_store_v4.md` |
| Schools (NEW — from the Yorkville signal) | Year-round spirit-wear store | `schools_store_v1.md` |
