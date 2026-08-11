# Cold Volume Scale Plan — 2026-07-10

> **Historical capacity plan.** The infrastructure audit remains useful, but broad send volume is not the current operating objective. The current engine selects one segment, proves account-level conversion and response capacity, and requires separate launch approval. See `../pillars/2-customer-acquisition/account-based-outbound-engine.md`.

> Ryan's mandate: reactivation/inbound = his weekend project; **the main job is new-customer revenue
> through cold, at insane volume.** This is the operating plan. Audit source: live SmartLead pull 2026-07-10.

## 1. Capacity audit (what we actually own)

**100 inboxes, ALL warmup-active, 97 at 100% reputation, 24 domains. Theoretical cap ~2,140 cold sends/day.**

| Family | Inboxes | Cap/day | Identity | Status |
|---|---|---|---|---|
| CA-brand (alternatecreativity, creativealternativesthree, imaginativechoices, innovativealternativesolution, creativealternativeexpert) | 14 | 420 | Maclaine / Ryan | Presumed carrying the 3 active Swag campaigns |
| calendargroup* ×10 domains | 48 | 960 | Ryan Tydingco | **IDLE — warmed asset from AI-consulting era** |
| vantageoutbound* ×6 domains | 29 | 580 | Ryan Tydingco | **IDLE — same** |
| restoration-homes / rhfund* | 9 | 180 | Adam Slipakoff | Old Dealthreads identity — repoint last or retire |

The bottleneck is NOT inboxes. It's (a) repointing idle inboxes to CA, and (b) lead flow.

## 2. Fresh CA fleet — buy + warm (DECISION REVISED 2026-07-11)

> **Ryan's final call (2026-07-11): vantage is IN — rotate the 29 vantageoutbound* inboxes into CA
> service.** They're already repointed (CA signature verified 2026-07-10, from_name "Ryan Tydingco",
> ryan-variant local-parts = clean identity; manifest `config/planners_fleet.json`, 29 IDs).
> **Usable fleet TODAY: 43 inboxes = 14 CA-brand + 29 vantage ≈ ~900/day ≈ 27k/mo — no purchase, no
> warmup wait.** calendargroup (48) stays OUT (Steven Laitmon local-parts); restoration/rh (9) OUT.
> **New-domain purchase DEFERRED to a data trigger:** buy the next ~30 Inframail domains (spec below)
> only when (a) replies at ~900/day are comfortably absorbed AND campaigns convert, or (b) a domain's
> health dips and needs rotating out. Revisit ~September.
> **Redirect fix (verified 2026-07-11):** the 6 vantageoutbound* domains ALREADY 301 — but to
> **dealthreads.io (stale, retired venture)**. The 5 CA-brand domains 301 correctly to
> creativealternatives.com, so this is the same Inframail per-domain redirect setting. Fix = Inframail
> dashboard → each vantageoutbound* domain → change redirect/forwarding URL → https://creativealternatives.com
> (~5 min; NOT exposed in the documented API, which covers inbox create/delete/list only — if the
> logged-in docs at testapp.inframail.io/docs show a domain-config endpoint, Claude scripts it for
> future fleets).

**The buy spec (target: +90 inboxes → ~2,000/day total with the existing 14 CA-brand):**
- **30 domains × 3 inboxes = 90 inboxes.** Never more than 3/domain (blast-radius control).
- **Naming: CA-adjacent, believable, .com only.** Patterns: `getcreativealternatives.com`,
  `creativealternativeshq.com`, `creativealtpromo.com`, `tryca[...]`, `ca-branding[...]`,
  `creativealtgear.com`, `printcreativealternatives.com` — the domain should look like it belongs to
  Creative Alternatives at a glance. No hyphens-heavy or keyword-spam names.
- **Identities:** split the fleet — half "Ryan Tydingco", half "Maclaine Scher" (matching local-parts:
  `ryan@`, `rtydingco@`, `maclaine@`, `mscher@`). Full CA signature on every inbox.
- **DNS on day 1:** SPF + DKIM + DMARC (p=none to start), custom tracking domain per domain,
  **301 redirect root → creativealternatives.com.**
- **Tooling: INFRAMAIL (Ryan's existing provider — `INFRAMAIL_API_KEY` already in CA .env since 2026-05).**
  Division of labor (confirmed against their API docs 2026-07-10):
  - **Ryan (dashboard, ~30 min):** order the 30 CA-branded domains in Inframail (their flow
    auto-configures SPF/DKIM/DMARC — no manual DNS), then grab the **API variables** from
    *Subscription → View API Access* (Profile ID, Customer ID, Host Order IDs) → add to CA `.env` as
    `INFRAMAIL_PROFILE_ID`, `INFRAMAIL_CUSTOMER_ID`, `INFRAMAIL_HOST_ORDER_ID`.
    ⚠️ The .env note says the API key was pasted in chat and should be ROTATED — do that same visit.
  - **Claude (scripted):** bulk-create the 90 inboxes via the Inframail API (create/list/delete email
    accounts; 3/domain, ryan/maclaine local-parts + display names) → bulk-connect to SmartLead
    (`create_email_account` API w/ Inframail SMTP/IMAP creds) → enable warmup on all → CA signatures.
  - Note: Inframail's API does inbox ops only — domain purchase itself is dashboard-only.
  - 301 redirects root→creativealternatives.com: set in the Inframail/registrar dashboard per domain.
- **Cost ballpark:** Inframail flat-fee model (unlimited inboxes tier) + ~$300–400/yr domains — cheaper
  at 90 inboxes than per-seat providers.
- **Warmup: 2–3 weeks in SmartLead warmup before ANY cold**, then ramp each inbox 10/day → 20 over
  2 more weeks. Stagger purchases (10 domains/wk × 3 wks) so the fleet doesn't age-cluster.

**Revised ramp (warmup shifts the curve right ~3 weeks):**
| Week | Volume/day | Note |
|---|---|---|
| 0 (now) | ~400–500 | 14 CA-brand inboxes carry Financial/Law/Law-National + a SMALL planners pilot (50 leads shared onto 4-5 existing inboxes — validates the ICP while the fleet warms) |
| 1 | ~500 | Buy tranche 1 (10 domains/30 inboxes) → warmup. Buy tranche 2 wk2, tranche 3 wk3 |
| 3–4 | ~800–1,100 | Tranche 1 ramps into cold (10/day/inbox), tranche 2 warm |
| 5–6 | **~1,700–2,100** | Full 104-inbox fleet at cap — insane volume, all CA-branded |

For each calendargroup*/vantage* inbox: change `from_name` → a real CA identity (Maclaine Scher / Ryan
Tydingco, Creative Alternatives), rewrite the signature (full CA block — the SmartLead data proved bare
sigs lose), set custom tracking domain, and 301-redirect each domain's root → creativealternatives.com
(a prospect who checks the domain lands on the real site). Domain names are generic enough to carry any
B2B sender; the from_name + signature do the credibility work.
- Tag in SmartLead as they're converted: `planners`, `verticals`, `overflow` — the /ca-outbound
  `inbox_tag` selector keys off tags.
- **Ramp rule: a repointed inbox starts at 10 cold/day, +5/week to its 20-30 cap.** Reputation is warm
  but the *content pattern* changes; don't step-function it.
- restoration/rh (9): rename to CA identities in week 3 or leave as warmup ballast.

## 3. The volume math (steady state, ~4 weeks out)

- **Target: 1,500–2,000 cold emails/day ≈ 35–45k/month.** (Insane volume, achieved safely.)
- New-lead consumption at a 3-4 touch sequence: **~500–700 new leads/day ≈ 12–15k verified leads/month.**
- Expected yield at blended 0.3–0.8% positive reply (broad cold → signal-personalized): **~100–300
  positive replies/month ≈ 5–15 real conversations/day.** Every one gets the same-hour mockup SOP.
- Reply handling becomes Ryan's actual daily job at this volume — the machine generates, the human converts.

## 4. Lead flow — the real constraint (weekly production quota)

**Quota: ~3,500 verified leads/week.** Sources, in priority order (fit beats volume — camps did ~10%,
broad corporate 0.4–0.8%; blend fit-heavy):
1. **Signal/trigger engines** (openings, tradeshows, sponsors, rebrand/funding triggers) — highest fit,
   feed the HOT campaigns with the signal in the opener.
2. **Persona pulls** — event_planners ICP (new, ~50k US pool / AI Ark verified), plus the 13 DRAFTED
   vertical campaigns already in SmartLead (Manufacturing, Medical, Construction ×2, Consulting, A&E,
   Insurance, Agencies, Real Estate, Accounting, Auto Dealers, Corporate ×2) — load via the cheap
   waterfall, activate staggered (one new campaign every 2-3 days, never all at once).
3. **/ca-leads waterfall** (~$0.02/contact: Apify/ZeroBounce/Firecrawl + free registries) for bulk vertical
   lists — AI Ark credits reserved for persona precision + mobiles of engaged leads.
- **Everything verified before upload** (ZeroBounce/SmartLead verifier). List below B grade doesn't upload.

## 5. Deliverability guardrails (volume dies without these)
- ≤20/day cold per inbox (the 86-inbox default), ≤30 on the proven 14.
- Bounce watch: any campaign >3% bounces → pause, re-verify list, investigate before resuming.
- Plain text email #1, no images/links (mockup teased, shown on reply/LinkedIn — house rule).
- /spam-word-checker + /list-quality-scorecard gates on every upload (already in /ca-outbound).
- Weekly /email-deliverability-audit; monthly domain rotation review. Never touch the warm/reactivation
  pool (Maclaine's real inbox) with cold — hard firewall.
- Ramp +25%/week max on total daily volume. 4-week path: ~500 → 800 → 1,200 → 1,700/day.

## 6. Sequencing (what happens when)
- **This week:** repoint 20 calendargroup inboxes → tag `planners` → launch `/ca-outbound event_planners
  --limit 100` + activate 2 drafted vertical campaigns with waterfall lists. Volume: ~500→800/day.
- **Week 2:** repoint remaining calendargroup + vantage; activate 2 more verticals; planners LinkedIn lane
  starts (100 connects/wk). ~1,200/day.
- **Week 3-4:** full fleet live, ~1,700–2,000/day; weekly lead quota humming; kill/scale campaigns on
  reply data (fit verticals get more inboxes, dead ones get killed at 1,000 sends / 0 positives).
- **Continuous:** trade-show + trigger engines feed hot campaigns; Ryan's day = replies + mockups + calls.

## 7. What we do NOT do
- No volume from unwarmed/new domains (buy 10 more domains now for September, not for this month).
- No discount-gimmick copy at any volume (house rule).
- No skipping verification to hit quota — bounces compound, volume is a reputation loan.
- Never send cold from creativealternatives.com or Maclaine's real inbox.
