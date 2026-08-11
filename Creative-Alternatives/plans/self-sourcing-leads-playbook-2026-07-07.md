# Self-Sourcing Leads Without Per-Lead Data Companies — CA Playbook
**Date:** 2026-07-07 · **Method:** 6-angle research, 45 findings, 14 load-bearing cost/legal claims adversarially verified (0 refuted). All costs are 2026 figures. Companion to CA-OUTBOUND-README.md — this is the pre-AI-Ark waterfall that should feed /ca-outbound.

# How to Scrape Leads (Emails + Phones) Without Paying Per-Lead Data Companies

## 1. The hard truth up front

Split the problem in two, because the two halves have completely different economics:

- **Emails are cheaply self-sourceable.** You can build a full NY/NJ/CT law + accounting list with names, firm domains, and verified work emails for **fractions of a cent per contact** using tools you already own. Email is a solved problem — you should almost never spend AI Ark credits on it.
- **Verified decision-maker mobiles are NOT self-sourceable, at any price, for free.** A partner's cell phone does not sit on a public page anywhere. It only exists inside compiled/community-contributed databases (AI Ark, Apollo, Cognism, Nimbler, LeadMagic). No scraper, no registry, no Google Maps trick returns it. Even the best premium providers only hit **~65–85% coverage**, and in one 2026 test only **~23% of "found" mobiles were high-propensity** (Clay). **AI Ark burning fast for few mobiles is not a defect — it's the structural reality of this data.** The only lever is paying for *fewer, better-targeted* mobile lookups.

So the whole game is: **make emails nearly free, and spend real money only on the mobiles of people who already engaged.**

---

## 2. The cheap email waterfall (mapped to what you already own)

The cost of email is **entirely in verification, not generation.** Permuting `first@`, `first.last@`, `flast@` from a name + domain is $0 with free tools (Metric Sparrow = free, ~46 formats). Detecting the *right* pattern and verifying it is where pennies go.

### The step chain

**Step A — Discover firms + domains + main phone (cents per 1,000)**
- **Apify `compass/crawler-google-places`** (owned): from **$1.50/1,000 places** → name, address, website, main phone. Email is a separate add-on; the `microworlds/crawler-google-places` fork bundles website-email scraping for up to **~$3.00/1,000**.
- Cheaper alt: **OpenWeb Ninja Local Business Data API** — **~$0.00125–$0.004/business** with emails/socials inline (`extract_emails_and_contacts=true`), 500 free/mo.
- Seed the geo queries with an Apify SERP actor (**scraperlink ~$0.05/1,000 results**; avoid Apify's *official* SERP actor at ~$1.80/1,000 pages).
- Your **Google Places API** key is worth using only for its **1,000 free Enterprise (phone) lookups/month** — use a `fieldMask` so you're billed the ~$20/1,000 Enterprise SKU only on the free tier, not by accident on bulk.

**Step B — Get the named decision-maker (near-free, biggest AI Ark saver)**
Law and accounting firms publish partners/attorneys/CPAs with titles on `/team`, `/attorneys`, `/people` pages. Crawl those with **Firecrawl (owned)** using plain **scrape/crawl/map at 1 credit/page** and regex the names/titles/emails off the markdown.
- Free = 1,000 credits/mo; Hobby $16/mo = 5,000; Standard $83/mo = 100,000.
- **Do NOT turn on `/extract`** — it's a separate token-based subscription (~$89/mo) that stacks on top.
- Reality check: 1,000 credits ≈ 1,000 *pages* ≈ **~200–330 full firm-team crawls/month**, not 1,000 firms.

This is the single biggest credit saver: it converts an expensive AI Ark "find the people at this company" search into a cheap "append email to a person I already have."

**Step C — Permute + verify the email (this is the cheap engine, not AI Ark)**
1. Detect the firm's real pattern once with the **Apify `email-pattern-finder` actor** at **$0.10/domain** (50 domains = $5). It reads the site, GitHub commits, and WHOIS; claims 85–95% confidence with 5+ known name-email pairs. Community actor — validate on a test batch first.
   - **Pattern shifts with firm size, and your 25–500 ICP straddles the crossover.** `firstname@` dominates only at *1–10 employees* (~71%); by 11–50 it's ~42% with `flast@`/`first.last@` catching up; `first.last@` wins (~48%+) at 1,000+. The crossover is ~51–200 employees. Detect per-domain; don't hardcode. The top-3 formats cover ~97% of inboxes.
2. Generate the address for each contact (free), then **bulk-verify.** Cheapest verifier: **MillionVerifier** — one-time credits, never expire, and it **refunds catch-all/unknown ("Risky") results** so you don't pay for what it can't resolve:
   - 10K = **$39** (~$0.0039), 50K = $89 (~$0.0018), 100K = $149 (~$0.0015), 1M = $449 (~$0.00045).
   - Caveat: heavy abusers (~0.5% of accounts generating huge unknown/invalid volume) lose the refund.
3. Your owned **ZeroBounce** is the premium baseline but **~6–7x pricier at volume** (~$0.009/email at 5K, ~$0.0035 at 100K). Use its free 100/month for spot-checks; don't run bulk lists through it. Skip **NeverBounce** entirely — same price, no catch-all edge, and credits **expire in 12 months**, which punishes buy-in-bulk-use-slowly.

**Step D — Waterfall finders only for the gaps**
For contacts where the permuted address won't verify, hit **pay-per-result finders cheapest-first: LeadMagic → Hunter → Prospeo** (~$0.03–0.06/verified email, **no-result lookups are free**). A real 10K test landed ~85% found / ~68% verified-usable. ~20% come back catch-all — normal for firms running their own mail.

### Cost math vs AI Ark

For a **1,000-firm / ~2,500-contact** batch:

| Stage | Method | Cost |
|---|---|---|
| Firm discovery + domain + main phone | Apify Maps / OpenWeb Ninja | **~$3–5** |
| Decision-maker names | Firecrawl (owned, free tier) | **~$0** |
| Pattern detection | Apify email-pattern-finder, ~200 domains | **~$20** |
| Bulk email verification | MillionVerifier, 2,500 @ $0.0039 | **~$10** |
| Gap finders | LeadMagic→Hunter→Prospeo on ~15% residual | **~$10–20** |
| **Total for 2,500 verified emails** | | **~$45–55, i.e. ~$0.02/contact** |

That is the work AI Ark people-search credits would otherwise burn on 100% of the list. Doing email this way means **AI Ark never touches the email stage at all.**

---

## 3. Phones — what's free vs what actually costs money

**Free-ish (you already own the tools):** the business **main line**. Google Maps / Places returns one `phone` field per firm — no landline/mobile distinction, just whatever the Google Business Profile lists.
- Honest nuance: for **solo practitioners and owner-run micro-firms, that listed number is frequently the owner's own cell** (GBP allows mobile numbers). So free Maps scraping *does* get you owner-reachable numbers at the small end of your ICP.
- For **staffed multi-partner firms, the Maps number is reception/switchboard** — a gatekeeper, not the partner.

**Not free — the genuine gap:** a *specific named partner's/CFO's cell at a staffed firm.* This is the only thing worth spending enrichment credits on. Cheapest legit pay-per-result options, ordered:
- **Nimbler — $0.05 per quality US (P1/P2) number**, billed on a hit.
- **LeadMagic mobile — 5 credits (~$0.05–0.10)**, pay-per-valid.
- **Datagma (~$0.33–0.49) / Prospeo (~$0.39, 10 credits)** as deeper fallbacks.
- **AI Ark `mobile_phone_finder` — LAST**, only for the highest-value residual the cheaper tools miss.

A single vendor can't cover a niche regional ICP, which is exactly why AI Ark alone feels expensive. Waterfalling two cheap sources first lifts total mobile fill to **70–85%** vs 30–50% single-source, and each provider only bills on a hit — so premium AI Ark runs on the leftover ~15–30%, not the whole list.

**Avoid the 3¢ trap:** consumer appenders (DataZapp ~$0.03, Tracerfy ~$0.05) look 10x cheaper but they're voter/consumer/mailing files — low match on a *specific* named professional and squarely TCPA-covered consumer cells. Cheap here means low accuracy + higher legal exposure. Not for law/finance partners.

---

## 4. Free authoritative registries for YOUR verticals

These give **verified name + firm + office address + office landline for $0** — no personal email or mobile (the law forbids it in most of them). They're for *building and validating* the list so you stop paying AI Ark to discover people.

**LAW:**
- **NY Attorney Registrations** (`data.ny.gov`, dataset `eqw2-r5nb`) — **the single best free source for your NY law ICP.** 432,390 rows: name, firm ("Company Name"), full office street address, county, **business phone**. Free bulk CSV or Socrata API (`data.ny.gov/resource/eqw2-r5nb.json?$limit=50000&$offset=...`), no key needed. **No email column** → derive domain from firm, permute, verify. Filter server-side by county/city for NY-metro.
- **NJ Attorney Index** and **CT Attorney/Firm Lookup** (`lookup.jud.ct.gov/AttorneyFirm`) — thin. Name, status, county/town only; no address/phone/email, no bulk. Use them to **confirm a lead is real, licensed, and active** before you spend — not as a contact source.

**FINANCIAL:**
- **SEC Form ADV Part 1** (`adviserinfo.sec.gov/adv`) — free monthly bulk files mapping every registered investment adviser **firm → named Chief Compliance Officer** (often a principal at small RIAs) + principal-office address/phone. No individual email (Form ADV bars it) → permute + verify.
- **FINRA BrokerCheck** (`api.brokercheck.org` / `brokercheck.finra.org`) — undocumented public JSON API, no auth. Maps name → broker-dealer → branch office. **No personal email/mobile** (Rule 8312). Use to identify who's who and size a firm's roster.
- **NASBA CPAverify / `ald.nasba.org`** — free CPA + CPA-firm name, city, license status across 53 jurisdictions (not HI/NM). ~250 records/query cap, no official bulk. Best free way to enumerate + verify accounting firms; weak on contact.

All of these are bulk-scrapable on the **Apify platform you already own** if the site doesn't offer a clean export.

---

## 5. The guardrails that make this safe

**Verification is non-negotiable — it's deliverability insurance, not an expense to cut.** Since Feb 2024, Gmail/Yahoo/Microsoft enforce **spam complaints <0.3% (aim <0.1%)** plus SPF/DKIM/DMARC + one-click unsubscribe. Bounce best practice: **<3% good, <1.5% best-in-class; >2% triggers throttling, >5% causes weeks of reputation damage, >8–10% risks account suspension** — and one bad batch poisons the *entire sending domain*, not just the bad addresses. Unverified pattern guesses routinely exceed 10% hard bounce. **Every email goes through MillionVerifier/ZeroBounce before it touches SmartLead — full stop.** Route catch-all/high-score addresses to a separate warmed domain or lower daily volume so a catch-all miss can't sink your main domain (law/finance firms skew heavily to catch-all Microsoft 365).

**Scraping — legal do/don't:**
- **DO** scrape public Google Maps, public firm bios, and public registries logged-out (defensible post-*hiQ* / *Meta v. Bright Data*; not a CFAA crime). Routing through Apify/OpenWeb Ninja shifts ToS exposure to the vendor.
- **DON'T** point Apify or any automation at **LinkedIn using your own logged-in account** — that risks your personal account plus a contract claim (LinkedIn sued and killed Proxycurl in 2025; use cookieless actors for names/titles only, never as your data engine, and never as the backbone).

**CAN-SPAM (email):** no B2B exemption, but it's opt-out, not opt-in. SmartLead campaigns are compliant with a real From/domain, honest subject, a genuine **physical mailing address for Creative Alternatives**, and a **working unsubscribe honored within 10 business days.**

**TCPA (calling mobiles) — this is the real risk, not DNC:** a business owner's cell gets **residential protection**. You're fine if a **human dials manually, 8am–9pm the recipient's local time**, you **scrub the federal DNC every 31 days**, and you keep an **internal do-not-call list**. Bright-line **DON'T**: never load those cells into an **autodialer/power-dialer, ringless voicemail, AI/prerecorded voice, or SMS blast** without prior express written consent — each is a per-call/text violation ($500–$1,500 each). The scary 2024 **"one-to-one consent" rule is dead** (11th Cir. vacated Jan 2025, FCC repealed Aug 2025), so don't let old blog posts scare you off manual follow-up. CCPA/GDPR effectively don't apply to you (solo, under $25M, don't sell data, ICP isn't CA/EU).

---

## 6. Recommended setup for CA — the waterfall order

Run this exact sequence so **AI Ark only ever touches the residual gap:**

1. **List + firm domains — free registries first.** NY Attorney Registrations (bulk CSV) for NY law; Form ADV + FINRA for financial; CPAverify for accounting. Backfill non-NY law + all firmographics with **Apify Maps / OpenWeb Ninja (~$3–5/1,000)**. → *AI Ark spend: $0.*
2. **Decision-maker names — Firecrawl (owned)** on `/team` and `/attorneys` pages, 1 credit/page. → *AI Ark spend: $0.*
3. **Emails — permute + verify.** Detect pattern via Apify actor ($0.10/domain), generate, **verify with MillionVerifier (~$0.0039)**. Gaps → **LeadMagic → Hunter → Prospeo** (pay-per-result). Everything through **ZeroBounce/MillionVerifier before SmartLead.** → *AI Ark spend: $0.*
4. **Mobiles — only for engaged/high-value leads.** After a firm opens or replies, run **Nimbler ($0.05) → LeadMagic → AI Ark `mobile_phone_finder` LAST** for the residual. Phone enrichment doesn't affect deliverability, so gating it on engagement is pure savings.

**What this saves:** AI Ark goes from being your *default data engine running on 100% of rows* to a *gap-filler running on the ~15–30% of mobile lookups the cheap layers missed — and only on leads that already engaged.* Emails move to ~$0.02/contact via owned tools. Concretely, on a 500-contact batch where AI Ark misses ~40% of mobiles, backfilling at ~$0.05 (Nimbler) is **~$10, not a burned subscription** — and you've stopped spending any AI Ark credit at all on emails, names, and firmographics, which is where most of the burn was hiding.

**Bottom line:** self-source 100% of your emails for pennies, get main lines free from Maps, mine the free NY/SEC/FINRA registries for the verified backbone, and reserve every AI Ark credit for one thing only — the mobile of a decision-maker who already raised their hand.