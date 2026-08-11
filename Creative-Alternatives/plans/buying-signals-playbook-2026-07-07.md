# Buying-Signal Enrichment — CA Playbook
**Date:** 2026-07-07 · **Method:** 5-angle research, 41 findings, 16 load-bearing endpoint/cost/correlation claims adversarially verified (0 refuted; ATS endpoints live-tested). Built as `/ca-signals` (scripts/ca_signal_enrich.py). Companion to CA-OUTBOUND-README.md + self-sourcing-leads-playbook.

# Buying-Signal Enrichment for Creative Alternatives

The whole point: your NY law list is already the *Fit* axis (law/financial, 25–500 emp, NY-metro — pre-qualified). This enrichment computes the *Intent* axis — is this firm buying swag *right now* — and ranks the list hot-first so cold email lands in the buying window instead of at random. Trigger-timed outbound roughly doubles conversion vs a static spray (Champify's 37% vs 19% is real but is specifically about prior-buyer relationships, not generic hiring — treat "2x from a live trigger" as the directional, well-supported number, not a promise). No promo vendor does this; PPAI's own "buying signals" list is 5/6 post-contact behaviors (email opens, who talks more on the call) and only one real external trigger. That gap is your edge — you're borrowing the B2B intent playbook into a category that has no model of its own.

---

## 1. The signals that matter for swag, ranked (law/financial)

Your instinct was right at the top and miscalibrated in the middle. Here's the corrected stack rank for the **law** segment, strongest first:

1. **Active hiring / onboarding (your #1 — correct).** New hires need welcome kits. For law this has a named, budgeted, calendar-driven form: the **summer-associate welcome kit** (documented example: Sidley Austin — branded notebook, sticky notes, erasable gel pen, Hydro Flask tumbler, via Brilliant). Also lateral partners and associate classes, which run year-round. This is the hero signal — deepest, cheapest to detect, most frequent.

2. **Merger / rebrand (you weren't ranking this at all — insert at #2).** A merger or rebrand forces a reorder of *everything* with a logo on it: welcome kits, client gifts, signage, company store. Highest single-order value of any trigger, on a deadline. Law-firm M&A is surging — **47 completed mergers through Q3 2025, 59 for the full year (+18% over 2024), 16 already announced for 2026** (Fairfax Associates). Hogan Lovells + Cadwalader (announced Dec 2025, ~3,200 lawyers, largest combination in history) is one of the 2026 deals.

3. **New marketing / BD leader (a sharper version of your #5, promoted).** A new exec makes an account ~5x more likely to evaluate new vendors, and for swag the buyer who matters is the new CMO / CMSO / marketing director / BD head — they own the merch budget and re-tool vendors in their first 90 days. Don't target *any* new hire; target the person who holds the pen. Doubles as a warm opener: "congrats on the new role — most new marketing leaders re-evaluate their merch vendor early."

4. **Event / conference sponsorship (your #3 — correct, and it's the cleanest to detect).** A booth means budget and an immediate branded-giveaway need on a fixed date. Strong NY-metro alignment: Legalweek moved to the Javits Center (NYC) for 2026 (6,000+ attendees), plus ILTACON, NYSBA, firm-hosted CLEs. Exhibitor/sponsor lists are *published*, so this is the tightest "right moment" of any signal — a fixed event date is a known drop-dead order date.

5. **Awards / rankings season (better-timed than Q4 gifting).** Firms buy celebratory swag when ranked, and rankings drop on a public calendar. Correct dates: **Chambers USA ~June**, individual *Best Lawyers* list ~August, and — the one that actually triggers *firm-level* swag — **Best Law Firms in NOVEMBER** (not August; the 2026 edition released Nov 6, 2025). Best Lawyers even sells badges. Super Lawyers rolls by state.

6. **New office / relocation (your #4, slightly demoted).** Full new-location outfitting. Real but less frequent than hiring/lateral moves. Note: **Google Places has no opening-date field** — this is a *news* signal, not a Places signal. Use Places only to *confirm* a new address once news tips you off.

7. **Funding — FINANCIAL segment only (your #2 was miscalibrated).** Law/accounting firms are partnerships; they don't raise VC, so funding rarely applies to your core law ICP. Keep it *only* for financial (a PE/wealth/fund manager closing a fund → LP gifts, launch events, new branded materials). Detectable free via SEC EDGAR Form D. Weight it near-zero for the law list.

8. **Q4 gifting (your #6 — correctly last).** Everyone buys then, so it has low targeting precision. It's a *capacity-planning* wave, not a per-company "buy now" ranker. Don't rank leads by it; just staff up for it. (The commonly cited "40% of gifts in Q4 / $75–125 per gift" stats didn't check out to their source — don't lean on them.)

---

## 2. How to detect each one cheaply (owned tools first)

| Signal | Method | Cost |
|---|---|---|
| **Active hiring** | Free public ATS JSON APIs (Greenhouse/Lever/Ashby/etc.) + AI Ark `member_badges.hiring` (client-side) + Firecrawl on `/careers`. See §3. | **$0** (owned + free APIs) |
| **Merger / rebrand** | Google News RSS per firm; Firecrawl-scrape legal press | **$0** news RSS; Firecrawl per-page |
| **New marketing/BD leader** | AI Ark `people_search` `maxCurrentJobYears=1` on marketing titles (works); Firecrawl firm `/news` | **$0** (AI Ark is a list op, no per-lead credit) |
| **Event sponsorship** | Firecrawl-scrape published sponsor/exhibitor pages (Legalweek/ILTACON/NYSBA), cross-ref your list | Firecrawl per-page (owned) |
| **Awards** | Firecrawl firm `/awards` pages or ranking publishers; Google News RSS | **$0**–small |
| **New office** | Google News RSS; validate with Google Places (owned) | **$0** |
| **Funding (financial)** | SEC EDGAR Form D full-text search | **$0** |
| **Q4** | Calendar flag, not detection | — |

**The free news/funding endpoints, exact:**

- **Google News RSS** — the single best free, no-key per-firm detector, covers new-office + leadership + rebrand + award + event from one GET:
  `https://news.google.com/rss/search?q=QUERY&hl=en-US&gl=US&ceid=US:en`
  Per-firm recipe: `q="Wachtell Lipton" (relocates OR "opens office" OR "named partner" OR elects OR joins OR rebrands OR "wins award" OR sponsors) when:7d`. Terms are **AND by default — use OR explicitly**; quotes = exact phrase; `site:` and `-word` work. Caps ~100 items, no pagination. Two gotchas: `<link>` values are Google redirect URLs (decode to the publisher), and it's **not real-time** (items can be several days old — poll accordingly). Prefer `when:7d` or `before:/after:` date bounds over `when:30d` (the longer windows aren't reliably documented).

- **SEC EDGAR Form D** (funding, financial segment) — free, no key, but **requires a `User-Agent: "Name email@domain"` header or you get HTTP 403**:
  `https://efts.sec.gov/LATEST/search-index?q="TERM"&forms=D&startdt=2026-06-01&enddt=2026-07-01` → JSON with `hits.hits[]._source` (display_names, file_date, biz_states). Two modes: sweep (`forms=D` + date window to discover newly-capitalized firms) or lookup (`q="Firm Name"` to check one). Rate limit <10 req/s. PE/VC/hedge funds file Form D every fund close; law firms almost never do.

- **GDELT** (scaled news second pass for larger/press-covered firms) — `https://api.gdeltproject.org/api/v2/doc/doc?query=QUERY&mode=artlist&maxrecords=250&timespan=1w&format=json`, no key, but **hard-throttled to 1 request / 5 seconds** and media-only (misses small NY boutiques). Use Google News RSS + Firecrawl for the boutiques.

- **Firecrawl** (owned — the small-boutique catch-all): `POST https://api.firecrawl.dev/v2/scrape {"url":"https://firm.com/news","formats":["markdown"],"onlyMainContent":true}`. Or one-call search+extract: `POST /v2/search` with a JSON schema format so it returns typed `{signal_type, signal_date, summary}` — no post-parsing. Diff the newsroom page across runs (store last hash) to fire only on *new* posts. Costs Firecrawl page-credits (500 free/mo, ~$16/mo Hobby), **not per-lead data credits** — exactly your constraint.

**Dead ends — don't build these:** Bing News API (retired Aug 11, 2025). Crunchbase free API (killed 2025, now $49+/mo). OpenVC (investor-discovery DB, not a "who just raised" feed). Google Places "new office" detection (no opening-date field exists — validation only). Adzuna/USAJobs/Arbeitnow (keyword/location search only, no company filter — Adzuna's "employer" is a response field you can't query by; $0 backfill at best, can't drive per-account timing).

---

## 3. The hiring signal is the hero — free ATS-API approach

This is the buildable core. A firm's careers page runs on an ATS, and most modern ATSs expose a **public, no-auth JSON feed of every open role**. You fingerprint the ATS for free with Firecrawl (owned), hit the right free endpoint, count and diff open reqs. "Hiring 5 associates" becomes an onboarding-kit trigger at $0 per lead.

### Step 1 — Fingerprint the ATS (free, via Firecrawl on `/careers`)

**Host tells (most reliable — regex these):**
- `boards.greenhouse.io` / `job-boards.greenhouse.io` → Greenhouse
- `jobs.lever.co` → Lever
- `jobs.ashbyhq.com` → Ashby
- `jobs.smartrecruiters.com` → SmartRecruiters
- `{co}.recruitee.com` → Recruitee
- `apply.workable.com` → Workable
- `{co}.jobs.personio.de` → Personio
- `*.myworkdayjobs.com` → Workday
- `{co}.bamboohr.com` → BambooHR
- `{co}.applytojob.com` → JazzHR

**When the board is embedded on the firm's own domain, HTML/JS fingerprints (corrected):**
- Greenhouse embed → `<script src="…boards.greenhouse.io/embed/job_board/js?for={token}">` + a `#grnhse_app` div (Greenhouse hosted boards are server-rendered — **not** `__NEXT_DATA__`)
- Ashby → `__NEXT_DATA__` JSON blob + board slug
- Lever → the `api.lever.co` script / `div.lever` markup, and `window.leverJobsOptions` (**not** `window.LeverPostings` — that global doesn't exist)
- generic fallback → JSON-LD `schema.org/JobPosting` blocks

### Step 2 — Pull open roles from the free feed (all verified live, no auth, $0)

- **Greenhouse** (best): `GET https://boards-api.greenhouse.io/v1/boards/{token}/jobs` → `{jobs:[…], meta:{total:N}}`. Add `?content=true` for departments + offices per post. `meta.total` is the live open-req count — **caveat: it counts job *posts*, so a req posted to multiple locations double-counts; use `updated_at`/`first_published` to find reqs posted this week.** Verified live: stripe→494, discord→58.
- **Lever** (uniquely supports server-side filtering): `GET https://api.lever.co/v0/postings/{site}?mode=json&location=New%20York` → array of `{text(title), categories:{location,team,department,commitment}, hostedUrl}`. Filters `location/team/department/commitment/level` are **case-sensitive**, multiple values OR'd. Filter straight to NY roles per firm in one call.
- **Ashby**: `GET https://api.ashbyhq.com/posting-api/job-board/{name}?includeCompensation=true`
- **SmartRecruiters**: `GET https://api.smartrecruiters.com/v1/companies/{companyId}/postings?limit=100&offset=0` — supports `q/country/region/city/department` filters, no key
- **Workable**: `GET https://apply.workable.com/api/v1/widget/accounts/{sub}`
- **Recruitee**: `GET https://{company}.recruitee.com/api/offers` (add ~500ms delay between calls)
- **Personio**: `GET https://{company}.jobs.personio.de/xml?language=en` (XML)
- **BambooHR** (yes, it has a free per-company feed — the "no API" claim is wrong): `GET https://{company}.bamboohr.com/careers/list` + `/careers/{id}/detail`
- **JazzHR**: per-account XML feed + `https://{subdomain}.applytojob.com` boards

Reality check: these seven-ish ATSs skew tech/startup + EU and do **not** cover a "majority" of the mid-market — the space is fragmented (Workday, iCIMS, ADP, Paylocity, etc.). Traditional NY law firms in particular often run Workday or post only to LinkedIn/their own site. Two fallbacks:

- **Workday** (many larger firms): `POST https://{tenant}.wdN.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs` with body `{"appliedFacets":{},"limit":20,"offset":0,"searchText":""}` → `{total:N, jobPostings:[…]}`. It's actually a **plug-and-play $0 fetch for low-volume use** (one IP, no cookies works fine at a curated-list scale) — Akamai only trips on sustained mass-tenant scraping. Host varies wd1/wd3/wd5; 10,000-result cap, slice by location.
- **No detectable ATS** → cheap Apify LinkedIn-jobs actors: `practicaltools/linkedin-jobs` ~**$1/1,000**, `chronometrica/linkedin-jobs-scraper` ~$1.50/1,000 (pay-per-result). Query by firm name + NY. (Ignore the stale "$4.50/1k curious_coder advanced" — that actor moved to $30/mo rental.) Run **only on the residual, monthly**, to keep spend in single dollars.

### Step 3 — Snapshot-and-diff (the actual signal)

A static count is weak. The winning move is **store each firm's open-req count + per-department counts + timestamp, re-poll weekly, and score the delta**. New reqs since last run = "hiring right now / onboarding imminent." Weight roles that imply onboarding volume: an associate/paralegal *class* or an HR/office-manager/recruiting req (a firm hiring recruiters is scaling headcount). Filter `location.name` for "New York" to confirm the spike is local before you email.

Apify's `xtracto/ats-hiring-velocity` actor productizes exactly this (emits total/new/closed reqs per company across 7 ATSs) at $10/1,000 — proof the pattern works, but rolling it yourself on the free feeds above is $0 in per-lead credits.

**Bonus — AI Ark already returns hiring in-payload (owned, no per-lead credit):** every `people_search` record includes `member_badges.hiring` and per-position `date.start`. The *server-side* `profileBadge=hiring` filter returns HTTP 400 (broken over MCP, same fault class as the headcount-change metric filters) — so pull a broad slice and filter `member_badges.hiring` **client-side**. `people_search` with `maxCurrentJobYears=1` genuinely works and is your best native "new-in-role / recent hire" detector (verified: Patrick Quinn, Co-Managing Partner at Cadwalader, title start 2025-09-01).

---

## 4. Scoring — a simple buy-now score

Two axes. **Fit** = your list (already qualified). **Intent** = this score. Only High-Fit + High-Intent firms get pulled into the active SmartLead sending segment; High-Fit + Low-Intent sit in a slow nurture campaign until a signal fires; a hot signal on a firm *not* in ICP (2-person shop hiring) gets down-routed, not emailed.

**Score = Σ (weight × recency-decay) over only the still-fresh signals.** Recency is a continuous multiplier, not on/off. Standard exponential decay: `score_now = weight × e^(−λ·days_old)`, where `λ` tunes how fast it dies. A fresh small signal should beat a stale big one (100-pt signal 10 days old at λ=1/15 ≈ 51; a 60-pt signal 1 day old ≈ 56 — the fresher one wins).

**CA weight × half-life table (map your ranking to this):**

| Signal | Points | λ / half-life | Poll cadence |
|---|---|---|---|
| Active hiring / onboarding (NY req burst) | 25 | λ=1/15 (~10d) — job most actionable week 1 | **weekly** |
| Merger / rebrand | 22 | long, ~90d — big reorder lingers | weekly (news) |
| New marketing/BD leader | 12 | ~90d (first-90-days window) | weekly–monthly |
| Event sponsorship | 15 | short — decays to the event date | weekly, 6–10 wk out |
| Awards | 10 | ~30–60d around ranking drop | seasonal |
| New office | 8 | ~60d | weekly (news) |
| Funding (financial only) | 10 | ~90d | monthly |
| Q4 | flag, no points | seasonal | — |
| **RB2B site visit (own site)** | 25 | ~7d — hottest | real-time |

**Rules that prevent wasted spend (dedup / noise filter — required, not optional):**
1. **A hiring signal only counts with a posted-date inside its window AND a role implying onboarding volume** — not an evergreen `/careers` page or a single re-listed opening. (Mirrors CA's existing "datable signals need a sourced date or down-rank" guardrail.)
2. **Dedup the same underlying event** — the same funding/merger headline scraped via Firecrawl *and* Google News is one signal, not two. Don't double-inflate.
3. **Zero anything without a fresh date stamp.**

**Routing bands (cumulative score):** 0–10 = nurture; 11–20 = personalized SmartLead sequence; 21–30 = priority + signal-specific opener this week; 31+ = act within 48h. When a firm crosses into the top band, auto-move it from the nurture campaign into a "trigger" campaign with a signal-specific first line.

**Where to host the score:** you already own **HubSpot**, which has native score decay (Marketing > Lead Scoring > toggle "Decay scores"). Caveat — HubSpot decay is **linear and coarse (monthly steps, 1/3/6/12mo)**, not exponential. So the clean pattern is: **compute the decayed score in your Python cron (true exponential, short half-life on hiring) and write the final number + top signal + signal_date to a HubSpot property.** Verify the account is on the new 2025 lead-scoring tool (legacy score props were sunset).

**Cadence rule:** poll each source *faster* than its half-life or the signal dies unseen. Weekly is the default (hiring, merger, event, new-office news); funding/leadership monthly is fine; RB2B is real-time.

---

## 5. Recommended architecture for CA

Bolt onto the existing waterfall:

```
/ca-leads  →  signal-enrich (this)  →  rank  →  /ca-outbound (opener uses the signal)
```

**signal-enrich** is a scheduled Python cron:

1. For each firm on the list: Firecrawl `/careers` → regex host/HTML → route to the correct free ATS feed → store open-req count + dept + NY count + timestamp.
2. Google News RSS per firm (merger/leadership/office/award/event) → LLM-classify hits into the signal taxonomy, stamp `signal_date`.
3. SEC EDGAR Form D sweep — **financial list only**.
4. Firecrawl-scrape NY legal event sponsor pages (Legalweek/ILTACON/NYSBA), cross-ref the list.
5. AI Ark broad `people_search` (a list op, no per-lead credit) → client-side filter `member_badges.hiring` + `maxCurrentJobYears≤1` marketing/BD titles.
6. Compute `Σ weight × e^(−λ·days_old)`, dedup, write score + top-signal + date to HubSpot.
7. Re-segment SmartLead: top band → trigger campaign; the rest → nurture.
8. Spend AI Ark `email_finder`/`mobile_phone_finder` credits **only on the top-scored slice.**

**Build order — do the free, testable, highest-impact pieces first:**

- **Build first (this week, fully free, on your existing NY law list):**
  1. **ATS hiring snapshot-and-diff** (Greenhouse/Lever/Ashby/Workday feeds + Firecrawl fingerprint). This is the hero signal and the biggest lift. Prove the loop on 20 firms before scaling.
  2. **Event-sponsor scrape** (Firecrawl on Legalweek NYC + ILTACON + NYSBA rosters). Cleanest signal — hands you the firm *and* a dated deadline; instant hot leads cross-referenced to your list.
  3. **Google News RSS per firm** for merger/rebrand/leadership/office/award. One free GET per firm, covers four signals at once.

- **Layer in next:** SEC EDGAR Form D for the financial campaign; AI Ark `member_badges.hiring` + new-marketing-leader pass as confirmation/depth; HubSpot property + SmartLead re-segmentation automation; TheirStack as *optional* weekly hiring confirmation (`POST https://api.theirstack.com/v1/jobs/search`, Bearer, `company_domain_or:[…]`, 200 credits/mo free, billed per job returned — likely $0 for ~150 firms).

- **The one paid add worth wiring in:** **RB2B free tier** (~100–150 person-level website-visitor IDs/mo, US only, returns name + LinkedIn, real-time to Slack/CRM). When a firm's office manager or marketing lead lands on the CA site or a proposal page, that's hotter than any firmographic proxy — and AI Ark can't provide it. Route those individuals straight into SmartLead/HubSpot. $0.

---

## 6. What NOT to buy

You do **not** need a new data/intent tool. AI Ark already returns the raw data for your top-3 signals inside a normal search payload: `member_badges.hiring`, per-position start dates (job change / new-in-role), `funding.rounds[].announced_at`, `acquisition.contents[].announced_at`, and `aberdeen.it_spend` (budget proxy). Pull a broad firmographic slice (a cheap list op, not per-lead credits), score client-side, and burn enrichment credits only on the winners.

Skip these:

- **Clay Signals ($185–$495/mo)** — its job-change + funding + hiring triad *is* your signal stack, and AI Ark already returns all three. The only Clay-exclusive layer is web-intent, which RB2B's free tier covers for CA's own site.
- **Common Room (~$25k+/yr), Bombora Company Surge (~$25k–$100k+/yr), ZoomInfo Streaming Intent ($7.2k–$36k/yr)** — enterprise topic-surge intent. Priced for SaaS teams, and "promotional products" isn't a well-covered Bombora topic anyway. Your firmographic + hiring/event/funding signals beat generic surge for swag timing at ~1/100th the cost.
- **LeadMagic ($49/mo), Ocean.io ($79/mo)** — LeadMagic's job-change endpoint and Ocean's lookalike are exactly what AI Ark duplicates natively (`maxCurrentJobYears` + position dates; `lookalike` param on `company_search`). Redundant credit-burn. Only reason to ever touch LeadMagic: a cheaper mobile-number pool if AI Ark's coverage disappoints on a top account.
- **Koala** — shutting down in 2026 after the Cursor acquisition. Don't adopt.
- **Warmly ($700/mo)** — overkill for a solo; RB2B free covers the same visitor-ID job.

Bottom line: your ranking was right at #1 (hiring) and #6 (Q4), wrong at #2 (funding — pull it down to financial-only and insert merger/rebrand + new-marketing-leader above it). The hiring signal is buildable *today* for $0 on free public ATS APIs against the list you already own. Build that snapshot-and-diff loop plus the event-sponsor scrape first — everything else is enrichment on top.