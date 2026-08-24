# Creative Alternatives Direct-Dial List Plan

## Outcome

Maintain a Salesfinity reservoir of **1,000 call-ready named buyers** and replace about
**500 net-new contacts per week** once Ryan is dialing at full volume. A record is not
call-ready merely because it has a phone number: it needs a qualified account, the
right person, a sourced reason to call, and a verified mobile or individual direct dial.

At 300 dial attempts per day, the weekly ceiling is 1,500 attempts. If a contact receives
about three attempts over two weeks, the steady-state list requirement is roughly 500
new contacts per week. Actual queue burn—not this estimate—sets the refill target after
the first two weeks.

## Who to call first

| Priority | Account | Primary buyer | Secondary buyer | Evidence required |
|---|---|---|---|---|
| 1 | Independent day and overnight camps | Owner/founder, executive director, camp director | Operations director; marketing/communications director | Dated registration/session/event plus a visible merchandise, store, staff-apparel, or parent-audience use case |
| 2 | Squash and racquet clubs | Owner, general manager, executive director, club manager | Membership or marketing director; racquets/squash director when they own gear | Tournament, league, member event, junior program, anniversary, or weak/missing online store |
| 3 | Youth sports clubs and academies | Owner/founder, president/executive director | Operations director or club administrator | Upcoming season, tryouts, tournament, fundraiser, expansion, or recurring family audience |
| 4 | PTA/PTO, boosters, and selected independent schools | PTA/PTO or booster president, athletic director, student-activities director | Advancement or marketing lead | Current fundraiser, spirit-wear window, event, season, orientation, or reunion |

Start with camps and racquet clubs. Prior CA outreach produced materially stronger email
responses from camps and squash than K–12, so schools remain a small controlled test
until calling outcomes prove otherwise.

Do not target counselors, coaches without purchasing authority, teachers, generic
coordinators, reception, or general administration. Use one primary person per account.
Reveal a second person only after a referral/wrong-person result or when the primary
cannot be sourced.

## Account qualification

An account must serve a recurring audience of families, members, students, athletes,
staff, alumni, or donors and show at least one current buying signal:

- 2027 registration, upcoming session, season, tournament, fundraiser, or member event;
- a new program, location, leadership appointment, rebrand, anniversary, or audience push;
- an existing store that is limited, dated, poorly presented, or burdens staff/volunteers;
- an obvious recurring merchandise need with a defensible seasonal buying window.

Weight the Northeast first. Suppress current customers, open opportunities, competitors,
duplicates, internal contacts, prior do-not-call requests, and any account Ryan excludes.

Score before spending a phone credit:

| Dimension | Points |
|---|---:|
| Account and audience fit | 25 |
| Trigger strength and timing | 25 |
| Buyer authority | 20 |
| Store/merchandise gap or operating pain | 15 |
| Source quality and freshness | 15 |

Only records scoring **75+** enter phone lookup; **85+** is Tier A. Every accepted trigger
must have a source URL and date. A personalized sentence without evidence is not a
reason to call.

## Direct-phone acquisition waterfall

Use providers sequentially, only on unresolved Tier A/B records. Do not run the entire
list through every provider.

1. **Salesfinity included credits, if present.** Check the actual account dashboard;
   Salesfinity's public pages are inconsistent about which plans include monthly
   SmartEnrich credits. Use only P1/P2 results for Boss Mode. Reject P3/HQ results.
2. **AI Ark already-owned credits.** Run a measured sample through its mobile-phone
   finder. The public help center does not disclose enough pricing detail, so calculate
   the user's real cost per valid direct number from the account ledger.
3. **LeadMagic fallback.** Its published pricing is currently the clearest low-cost
   benchmark: roughly $0.125 per successful mobile on Basic, $0.099 on Essential, or
   $0.062 on Growth, before any taxes or plan changes. Misses are not charged.
4. **Salesfinity credit packs for high-value residuals.** Published packs are $0.30 per
   found phone; convenient, but not the cheapest bulk source if LeadMagic performs well.
5. **Coverage test only:** FullEnrich and BetterContact cost about $0.55 and $0.49 per
   found phone respectively at their listed entry plans. Use them only if their extra
   coverage or verification lowers cost per qualified conversation.

Nimbler may be worth a later test, but no purchase decision should use third-party cost
claims until its current minimum plan and direct-number pricing are verified.

The cheapest vendor is the one with the lowest **cost per verified owner-matched mobile**,
then cost per live conversation and qualified next step—not the lowest sticker price.

## 200-contact provider pilot

Build the accounts and buyers first, then obtain explicit approval for any paid reveal.
Suggested mix:

- 110 camp buyers;
- 70 squash/racquet-club buyers;
- 20 school/booster buyers as a challenger cell.

Randomly divide comparable qualified records across available Salesfinity, AI Ark, and
LeadMagic capacity. Do not send the same person to all three initially. Track:

- lookup attempts, successful finds, and dollar/credit cost;
- mobile/direct-dial share, owner-name match, and Salesfinity P1/P2 share;
- wrong-number, live-connect, and conversation rates;
- qualified next steps and opportunities by provider, segment, buyer title, trigger,
  and research tier.

After at least 50 lookups per provider or the maximum safely available sample, choose the
primary and fallback using cost per verified mobile. After calling, retain or replace
them using cost per qualified next step.

## Non-negotiable phone-quality gate

A dial-ready record must have:

- a named current employee and current decision-relevant title;
- line type `mobile` or `direct_dial`—never HQ, main, reception, toll-free, shared, or
  generic office lines;
- owner/name match or provider attribution to that individual;
- E.164 phone formatting, country, timezone, provider, and verification date;
- recent carrier/line-type validation and duplicate-phone suppression;
- Salesfinity P1 or P2 classification before Boss Mode;
- suppression and internal do-not-call review;
- a source-backed reason to call and a specific merchandise/store hypothesis.

Hold P3, unmatched, stale, uncertain, or shared numbers for re-enrichment. Never guess,
scrape restricted personal data, or label a company switchboard as a direct dial.

## Production system

1. Research accounts and buyers without phone spend.
2. Human-review all Tier A and a 10-record random sample of every Tier B batch.
3. Enrich only approved Tier A/B rows through the winning waterfall.
4. Validate phone ownership, line type, suppression, and Salesfinity quality tier.
5. Import 100-record batches and preserve `prospect_id`, source, provider, score, trigger,
   and buyer-title fields.
6. Join call outcomes back weekly. Promote segments and triggers that create qualified
   next steps; retire those that only create dials.

Build the 200-person pilot first, then reach a 1,000-contact reservoir in reviewed
100-record batches. Maintain a minimum of 400 records due for active calling and refill
about 500 weekly until observed burn rate provides a better number.

## Compliance boundary

Treat direct mobile numbers as personal data. Use them only for relevant, human-led B2B
calling, identify Creative Alternatives honestly, call during appropriate local hours,
and honor an entity-specific do-not-call request immediately. Do not use prerecorded or
AI voice, automated SMS, or unapproved personal-data scraping. Before scaling parallel
dialing to mobile numbers, have counsel confirm the Salesfinity configuration and the
applicable federal and state rules; B2B treatment is not a blanket exemption from every
calling law.

## Sources and coverage

- Salesfinity pricing and SmartEnrich documentation:
  <https://salesfinity.ai/pricing>,
  <https://support.salesfinity.ai/en/articles/10397892-smartenrich-automatic-contact-list-enhancement>,
  <https://support.salesfinity.ai/articles/4314304123-getting-started-part-2-dial-smarter-with-advanced-features-boss-mode-smartenrich-call-screeners>
- LeadMagic pricing, credit rules, and mobile-finder inputs:
  <https://leadmagic.io/pricing>, <https://leadmagic.io/docs/v1/credits>,
  <https://leadmagic.io/docs/api-reference/mobile-finder?x-leadmagic-canonical=true>
- AI Ark plan and credit documentation:
  <https://help.ai-ark.com/en/collections/2-plans-and-pricing>,
  <https://help.ai-ark.com/en/articles/92-credit-usage>
- FullEnrich and BetterContact pricing/verification:
  <https://fullenrich.com/pricing>,
  <https://help.fullenrich.com/en/articles/10329915-how-we-verify-phone-numbers>,
  <https://bettercontact.rocks/pricing/>
- FTC Telemarketing Sales Rule guidance and FCC TCPA order:
  <https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule>,
  <https://docs.fcc.gov/public/attachments/FCC-24-84A1.pdf>

Public pricing and plan terms can change. Recheck them immediately before purchase.
Do not run any credit-consuming search, export, enrichment, or personal-contact access
without Ryan's prior explicit approval.
