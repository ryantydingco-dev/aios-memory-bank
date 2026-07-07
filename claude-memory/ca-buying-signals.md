---
name: ca-buying-signals
description: "/ca-signals buying-signal enrichment built 2026-07-07 — scores a CA lead list by buy-now intent (hiring via free ATS APIs, merger/leadership/awards via Google News RSS) and ranks hot-first. Free/owned only. Corrected signal ranking."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4f2057a5-da32-467d-af31-39ca7205edd4
---

Built 2026-07-07 as `/ca-signals` (`scripts/ca_signal_enrich.py`). The INTENT layer on top of [[ca-outbound-pipeline]]: /ca-leads = Fit axis (right firms) → /ca-signals = Intent axis (buying now) → /ca-outbound opener uses the signal. Full playbook: `Creative-Alternatives-AIOS/plans/buying-signals-playbook-2026-07-07.md` (5-angle research, 16 endpoint/cost claims verified, 0 refuted, ATS APIs live-tested).

**Corrected signal ranking for LAW (Ryan's instinct was right at #1, off in the middle):** 1) active-hiring (onboarding kits — hero, free ATS APIs) 2) **merger/rebrand** (was unranked — highest order value, on deadline; law M&A surging, e.g. Hogan Lovells+Cadwalader live 2026) 3) **new marketing/BD leader** (owns merch budget, retools vendors in 90d) 4) event sponsorship (Legalweek@Javits NYC 2026) 5) awards (Best Law Firms ~Nov) 6) new office 7) **funding = FINANCIAL segment ONLY** (law firms are partnerships, don't raise VC — was miscalibrated at #2) 8) Q4 = capacity flag not a ranker.

**Detection (all free/owned):** hiring = public ATS JSON feeds (Greenhouse `boards-api.greenhouse.io/v1/boards/{token}/jobs` — live-tested stripe→494/103 NY; Lever `api.lever.co/v0/postings/{site}?mode=json`; Ashby; SmartRecruiters; Workday `POST .../wday/cxs/.../jobs`) — fingerprint the ATS by Firecrawl-scraping /careers for host/HTML tells. merger/leader/award/office = Google News RSS `news.google.com/rss/search?q=...when:Nd` (no key; OR-terms; verified live surfacing the real Cadwalader merger). funding = SEC EDGAR Form D (needs User-Agent header). Score = Σ weight × e^(−λ·days_old); hiring half-life ~10d, merger ~90d. Bands: 31+ act-48h / 21-30 priority / 11-20 personalized / 0-10 nurture. Re-run WEEKLY.

**Tested live end-to-end:** news-scan on 3 real firms → Cadwalader ranked priority (27.2) on its live merger, quiet firms fell to nurture. Greenhouse/Lever fetchers verified (Lever hardened for bad boards). ATS-scan full path depends on a firm using a detectable ATS — many NY law firms use Workday or LinkedIn-only (fallback: cheap Apify LinkedIn-jobs ~$1/1k on the residual).

**Don't buy:** Clay Signals/Common Room/Bombora/ZoomInfo Intent/LeadMagic/Ocean — their hiring+funding+job-change triad = free ATS feeds + Google News + AI Ark's own `member_badges.hiring` (client-side filter; server-side profileBadge=hiring returns 400). Only worthwhile paid-ish add later: RB2B free tier (person-level visitor ID on CA's own site, $0).

NEXT stages (not yet built): event-sponsor Firecrawl scrape (Legalweek/ILTACON/NYSBA rosters), SEC EDGAR Form D for financial, write score+top_signal to a HubSpot property + auto re-segment SmartLead (top band → trigger campaign). Related: [[self-sourcing-leads-playbook]], [[creative-alternatives-aios]].
