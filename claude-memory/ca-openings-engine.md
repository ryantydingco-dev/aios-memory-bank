---
name: ca-openings-engine
description: "/ca-openings generalized trigger-event lead-gen (built 2026-07-08) — one config-driven engine finds NEW OPENINGS across any industry (restaurants/breweries/medical/retail/salon/gyms) + a SPONSORSHIP scout, geo-scoped, weekly Telegram digest. The \"sell to moments not industries\" platform."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4f2057a5-da32-467d-af31-39ca7205edd4
---

Built 2026-07-08. Ryan's realization: "unlimited leads — every industry goes to trade shows or opens locations needing branded gear." Framed it as **trigger-event lead-gen**: sell to MOMENTS not industries; every trigger (new location, sponsorship, funding, merger, hiring, event, seasonal) = same 4-step scout (discover free via Google News → filter → enrich domain+contact → themed mockup). He said "do all of it" → I generalized rather than build 20 scripts.

**Generalized openings engine (`scripts/ca_openings.py` + `config/ca_openings.yaml`):** one engine, verticals via config = query terms + allow/block filters + mockup_theme + target_title. Seeded: **gyms, restaurants, breweries, medical, retail, salon_spa** (add more = edit yaml). `find --vertical X --state SC|--region southeast` → enrich (Places domain + Firecrawl email, reuses ca_lead_waterfall) → build (themed opener). Geo from `config/ca_gym_regions.yaml` (per-city queries). VERIFIED LIVE SC: restaurants (Haystax, Bad Ass Coffee, Twisted Copper), breweries (Ole Smoky Distillery), medical (MUSC urgent care, AdventHealth Cardiology). ca_new_gyms is now just one vertical of this (kept for back-comgment).

**Sponsorship scout (`scripts/ca_sponsors.py`):** companies that just became event/team/charity SPONSORS need booth/activation swag on a deadline — nobody targets them. Geo-scoped per-city → finds LOCAL sponsors (filters mega-corp/league deals). Output shares the openings shape → reuse ca_openings enrich/build. VERIFIED LIVE SC: HHI Windows & Doors, Mortgage Matchup, 7 Brew Coffee.

**Weekly trigger digest LIVE (`com.aios.ca-openings-weekly`, `scripts/ca_openings_weekly.py`, Mon 7:15am):** runs all verticals + sponsors for the region, diffs vs `data/ca_openings_weekly_seen.json`, Telegrams combined digest of FRESH triggers (top 6/section, 3800-char chunked). Free/no-spend. Default STATE=SC (fast); set REGION=southeast in plist to widen (~15min run). **SUPERSEDED the gym-only `com.aios.ca-new-gyms-weekly` (renamed .disabled).** Live weekly CA crons now: ca-signals-weekly (Mon 7:00), ca-openings-weekly (Mon 7:15), git-sync (20min).

**find regex = coarse first pass; Claude refines in-session** (names/cities, drop noise/out-of-state/obituaries/closures/listicles). Buyer contact via AI Ark MCP in-session (target_title per vertical: owner/GM/practice-manager). All flows end at /ca-outbound themed mockup.

**NEXT (the 3rd pattern, not built):** SEASONAL/RECURRING engine — youth sports leagues, school spirit/booster clubs, Greek life, camps — directory/registration-driven (not news), strong recurring revenue, Ryan's proven lane (camps/squash). Other untapped triggers noted: funding/IPO (partly in ca-signals), new-business-registration open data (master firehose), Chamber new-member lists. Related: [[ca-new-gyms]], [[ca-tradeshow-signal]], [[ca-buying-signals]], [[ca-outbound-pipeline]], [[creative-alternatives-aios]].
