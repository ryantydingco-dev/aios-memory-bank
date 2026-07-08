---
name: ca-new-gyms
description: "/ca-new-gyms engine built 2026-07-08 — finds brand-new BOUTIQUE gyms/studios opening (merch buyers on day one) via free Google News RSS; boutique-only, commercial chains filtered. Same discover→enrich→AI Ark contact→themed-mockup pattern as trade-shows."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4f2057a5-da32-467d-af31-39ca7205edd4
---

Built 2026-07-08 as `/ca-new-gyms` (`scripts/ca_new_gyms.py`). Ryan's ask: find brand-new BOUTIQUE gyms opening that need merch (staff tees, member shaker bottles, towels, grand-opening giveaways) — "more so boutique gyms, nothing commercial."

**Signal = new/opening studio, detected FREE via Google News RSS** (proven the hero source: franchise "coming soon" pages are JS-gated, not worth scraping). Pipeline mirrors [[ca-tradeshow-signal]]:
- `find` (FREE) — Google News RSS across boutique-opening queries (pilates/barre/cycle/HIIT/yoga/boxing "grand opening"/"now open" + franchise names JETSET/BODYBAR/Club Pilates/etc). Filters COMMERCIAL chains (Planet Fitness/LA Fitness/Equinox/YMCA…) + sports/entertainment noise (WWE "rumble", baseball, etc.) + franchise-cost articles. TESTED LIVE: 89 real candidates from 60d news.
- **Claude refines in-session** — the find regex is a coarse first pass (gym_name/city extraction weak, many needs_review); Claude parses headlines into clean {gym_name,city,date}, drops non-openings/international. (Demonstrated: refined to 8 clean US boutique gyms — BODYBAR Pilates NH, RushTopFish Pilates Austin, CoreHaus Pilates Liberty Hill TX, Puppies and Pilates Rehoboth Beach DE, Carrie's Pilates Houston, JETSET Pilates NV, inLIFE Wellness Prosper TX, Poise Studio Imperial Valley CA.)
- `enrich` — Places domain + Firecrawl email (reuses ca_lead_waterfall helpers). `build` → leads.json with grand-opening themed opener.
- Contact = **owner/studio manager/GM** (small shops) via AI Ark MCP in-session (same as ca_tradeshow_contacts). Buyer isn't event-marketing here — it's the owner.

**Insight:** Pilates is booming — most openings are Pilates/reformer studios. Independent (non-franchise) studios are the best fit (owner places the order, no agency). Re-run weekly.

**GEO-TARGETING ADDED 2026-07-08 (Ryan works with boutique gyms + sports centers; wants SE + NE, SC first):** `config/ca_gym_regions.yaml` maps states→cities (SC full metro list; NC/GA/FL/TN/VA + NY/NJ/CT/MA/PA/MD/RI/NH). `find --state SC` / `--region southeast|northeast` / default=SC. Per-city queries (city name required — the only reliable Google News geo-scope). Broadened GYM_TERMS to include **sports centers** (athletic club/center, martial arts/jiu-jitsu/karate/taekwondo, gymnastics, cheer, climbing/bouldering, dance studio, pickleball, tennis club, swim school) not just fitness studios. Tightened noise: bare "yoga" → "yoga studio/club/hot yoga" (killed yoga-event spam); added college/pro-sports, obituary, competition, concert, listicle filters. Output → `outputs/ca-outbound/new-gyms-<state|region>-<date>/`. TESTED LIVE on SC: 139 candidates → refined to real SC openings **Pure Pilates (Myrtle Beach), Libra Reformer Pilates (Mount Pleasant Golf Club)** + The Daily Pilates (Raleigh NC). CA's existing gym relationships Ryan named: Kingfisher, Tone, Yoga Club, + sports centers.

**Not built:** single-command chain (Claude refine is the in-session step); weekly cron. Related: [[ca-tradeshow-signal]], [[ca-buying-signals]], [[creative-alternatives-aios]].
