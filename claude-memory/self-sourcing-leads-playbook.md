---
name: self-sourcing-leads-playbook
description: "How CA should self-source B2B emails+phones cheaply instead of burning AI Ark credits (2026-07-07 verified research). Emails ~$0.02/contact via owned tools; mobiles only via providers, gated on engagement. Full doc in CA plans."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4f2057a5-da32-467d-af31-39ca7205edd4
---

Full playbook: `Creative-Alternatives-AIOS/plans/self-sourcing-leads-playbook-2026-07-07.md` (6-angle research, 14 cost/legal claims adversarially verified, 0 refuted). Answers Ryan's "AI Ark credits burn too fast" problem.

**Core split:** emails are cheaply self-sourceable (~$0.02/verified contact); verified decision-maker MOBILES fundamentally are not — they only live in compiled provider DBs (AI Ark/Apollo/Nimbler/LeadMagic), ~65-85% coverage max. Credit burn on mobiles is structural, not a defect.

**The waterfall (AI Ark ONLY for the residual gap):**
1. LIST + domains: free registries first — **NY Attorney Registrations** (data.ny.gov `eqw2-r5nb`, 432k rows: name/firm/address/business phone, no email), **SEC Form ADV** + **FINRA BrokerCheck** + **NASBA CPAverify** for financial/accounting; backfill via Apify Maps / OpenWeb Ninja (~$3-5/1,000). AI Ark spend: $0.
2. NAMES: Firecrawl (OWNED) on /team //attorneys pages, 1 credit/page (~200-330 firm crawls/mo free tier). Don't enable /extract. AI Ark spend: $0.
3. EMAILS: detect pattern (Apify email-pattern-finder $0.10/domain — pattern shifts with firm size, CA's 25-500 straddles the crossover, detect per-domain), permute (free, Metric Sparrow), **verify with MillionVerifier ~$0.0039/email** (cheaper than owned ZeroBounce which is ~6-7x at volume + refunds catch-all). Gaps → LeadMagic→Hunter→Prospeo (pay-per-result). AI Ark spend: $0.
4. MOBILES: only after a lead engages/opens → Nimbler ($0.05/quality#) → LeadMagic → **AI Ark mobile_phone_finder LAST**. Free main lines come from Google Places (owned) — for solo/micro firms that IS often the owner's cell; for staffed firms it's reception.

**Owned tools that already cover the cheap layers:** Apify, ZeroBounce, Google Places, Firecrawl (all keys confirmed in CA .env 2026-07-07). AI Ark stops being the default engine.

**Guardrails (verified):** verification is deliverability insurance — keep bounces <2% (>5% = weeks of domain damage; one bad batch poisons the whole domain), law/finance skew catch-all (M365). Scraping public Maps/registries/bios logged-out is defensible post-hiQ/Meta-v-BrightData; NEVER point automation at LinkedIn via your own logged-in account. CAN-SPAM = opt-out + real physical address + working unsubscribe. **TCPA is the real risk on mobiles:** business-owner cells get residential protection → manual human dial only, 8am-9pm local, scrub DNC every 31 days; NEVER autodialer/ringless-VM/AI-voice/SMS-blast a scraped cell. The 2024 "one-to-one consent" rule was vacated Jan 2025 / FCC-repealed Aug 2025.

NEXT (if Ryan wants): wire this as a pre-AI-Ark waterfall stage feeding [[ca-outbound-pipeline]] (`/ca-outbound`). Related: [[creative-alternatives-aios]].
