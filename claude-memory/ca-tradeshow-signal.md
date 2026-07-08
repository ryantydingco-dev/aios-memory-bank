---
name: ca-tradeshow-signal
description: "/ca-tradeshows engine built 2026-07-07 — discover companies exhibiting at upcoming trade shows (bulk booth-swag buyers on a deadline), score by buy-now window, feed /ca-outbound with a show-themed mockup opener. Ryan's chosen highest-value motion."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4f2057a5-da32-467d-af31-39ca7205edd4
---

Built 2026-07-07 as `/ca-tradeshows` (`scripts/ca_tradeshow_scout.py` + `config/ca_tradeshows.yaml`). Ryan's strategic pivot: **CA makes money on BIG BULK orders → target trade-show exhibitors** (any company with a booth = guaranteed bulk swag buyer on a hard deadline; mockup something fun themed to THAT show). Not niche-locked — broadest, highest-order-value motion. Full playbook: `Creative-Alternatives-AIOS/plans/tradeshow-signal-playbook-2026-07-07.md`.

**Signal-FIRST discovery (reverse of /ca-signals):** find companies BECAUSE they have a booth.
- Pick shows: `config/ca_tradeshows.yaml` (name/date/city/exhibitor_url/platform/mockup_theme). Best = crowded mid-size-heavy: RSA(649 exh)/Black Hat(400+) cyber, HIMSS health, NRF retail, Money20/20 fintech. Skip CES (giant-dominated).
- Scrape exhibitors: Firecrawl (owned) the public directory. **Map Your Show powers most big US shows** — one pattern `{event}.mapyourshow.com/8_0/explore/exhibitor-gallery.cfm` (CES/NRF/HIMSS/InfoComm/NAB/NADA/MODEX). **VERIFIED LIVE: 85 exhibitors off one InfoComm gallery via Firecrawl** (regex markdown links `exhibitor-details.cfm?exhid=`). RSA=RainFocus, Swapcard=Informa shows. Cvent/Brella gated=skip. Robust fallback = Apify `skython/exhibitor-list-scraper` (~$5/1k, 30 platforms, owned Apify).
- Score by buy-now window: **outreach sweet spot 8-12 wks pre-show** (order lands 4-10 wks out). peak 8-12w→priority, 4-8w→priority, <4w→rush ("we can still hit your deadline"), >16w→nurture, past→drop. Repeat exhibitors (65-80% rebook) = proven buyers.
- Output: `leads.json` (companies + top_signal_detail = themed mockup pitch) → feeds /ca-outbound. Opener: "Saw {company} is exhibiting at {show} — here's a mockup of {themed item} for the booth."

**Economics (verified):** mid-size booth swag order = $1,500-$10,000+ (bulk). Buyer = **Event Marketing Manager / Field Marketing Manager** (fallback Trade Show Coordinator / Brand / Marketing Mgr). Themed mockups: cyber→data blocker/RFID sleeve/engraved webcam cover; general→recycled power bank/premium tumbler/branded socks.

**Downstream (companies → contacts, reuses existing):** scout gives COMPANIES (no contact). Chain: ca_lead_waterfall resolve-domains (Places) → AI Ark people_search (company+event-marketing title, cheap list op) OR harvest → email → /ca-outbound themed opener.

**Pagination + enrich chain BUILT 2026-07-07 (both):** (1) extraction now merges gallery + flat exhibitor-list.cfm → **221 exhibitors on InfoComm** (2.6x the 85/page), plus `--via apify` (all-in-one actor `skython~exhibitor-list-scraper`, config `apify:` block, ~$5/1k, owned) for 100% coverage of gated/paginated platforms — Apify path built but NOT live-tested (verify actor input schema on Apify). (2) `run --show <key> --enrich` chains extract → resolve domain (Places, reuses ca_lead_waterfall._places_lookup) → published email (Firecrawl, reuses _fc_scrape/_emails_in) → score, emitting /ca-outbound-ready leads.json (company+domain+email+themed opener). TESTED LIVE: 5/5 domains resolved (aja.com etc.); 0 published person-emails on those AV vendors (contact-form companies — honest: harvest email coverage is thin for non-law; domain resolution is the credit-saver, AI Ark people_search finds the event-marketing person at the known domain). **Still not built:** show-org booth filtering ("AVIXA Lounge" noise), generic marketing@/events@ email fallback, wiring the AI Ark people_search event-marketing-contact step into the auto-chain. Config seeded with infocomm-2026 (proven template, past), blackhat-2026 (Aug 3, rush), money2020-2026 (Oct 25, sweet spot) — Ryan curates/updates show URLs as directories open. Related: [[ca-buying-signals]], [[ca-outbound-pipeline]], [[creative-alternatives-aios]].
