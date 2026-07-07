# 10 — Build Our Own Signal Detector (no Clay)

> Ryan: "can we just build the signal detector ourselves? don't want to pay for Clay." **Yes.** Clay's funding/hiring signals are mostly repackaged public data — EDGAR Form D, job boards, funding news. We can pull the core ones free, and we already own a working `signal_engine.py` to extend. This doc = what's real, what's noisy, and the recommended build (validated with live probes, not assumed).

---

## What we already own (borrow before build)
- **`module-installs/lead-engine/signal_engine.py`** — a real signal-first pipeline already exists: `signal_apollo` (intent + hiring), `signal_jobs` (job-board scan), `signal_merge`, `verify`, contact discovery, ZeroBounce, scoring, SmartLead upload, Telegram. **We extend this, not start over.** A "funding signal" module + a tightened "exec-hiring" module slot into the existing merge→enrich→score flow.
- **Keys on hand:** Firecrawl, Apify, Apollo, AI Arc, Hunter, ZeroBounce, GrowthToolkit, HeyReach, Supadata. (No Crunchbase key — but we don't need one.)
- **The battlecard workflow** already turns scored signals → research cards (the Mandate Radar format).

## What I verified live (2026-05-31, real probes — not assumptions)
| Source | Reachable? | Verdict |
|---|---|---|
| **Greenhouse** public job API (`boards-api.greenhouse.io`) | ✅ 200, full JSON, **no key** | **Best free HIRING signal.** Every company on Greenhouse exposes all open roles. A posted "VP Sales/CRO" = a live mandate. |
| **Lever** public postings API | ✅ 200, no key | Same as Greenhouse, second board to cover. |
| **SEC EDGAR** Form D (`getcurrent` + EFTS) | ✅ reachable (EFTS query-shape 500'd, fixable) | **Free FUNDING signal but NOISY** — the raw feed is dominated by VC funds/SPVs as *filers*, not the operating companies you'd target. Usable only with heavy filtering. |
| **Funding news** (TechCrunch/Crunchbase News pages via web search / Firecrawl) | ✅ (used it for the `09` sample) | **Cleanest FUNDING signal in practice** — already produced 7 real cited rounds. Pull via web search + Firecrawl, structure with Claude. |

## The honest finding (why a naive scraper fails)
My live Greenhouse probe with loose keywords caught a **Compliance** "CRO" and an **"Executive Assistant to** CRO" as false "sales mandates." Lesson: **the scrape is easy; the precision is the work.** A signal detector that emits junk cards is worse than none — a wrong card disproves the engine (the whole `06`/`09` credibility thesis). So the build is 20% fetching, 80% filtering + an LLM relevance gate. That's also exactly where we beat Clay: Clay hands you raw signals; we add the judgment layer (verify + relevance + dedup) we already built for Oloxa.

---

## Recommended build — two free modules into `signal_engine.py`

### Module A — Funding-signal detector (the Mandate Radar core) ⭐ build first
**Source:** funding news (web search + Firecrawl), NOT EDGAR (too noisy for v1).
**Flow:**
1. Query funding news for the recipient firm's vertical + last 7–14 days ("[vertical] Series A/B 2026 raised").
2. Firecrawl the article → extract `{company, round, amount, date, investors, what_they_do, source_url}` with Claude (structured output).
3. **Relevance gate (LLM):** is this a US operating company that now needs revenue/GTM leadership? (kills funds, SPVs, non-US, wrong-stage.)
4. Map → the mandate (round/stage → the revenue role it forces) → research card.
**Why first:** funding is the cleanest "why now," it's what produced the real `09` sample, and it's Harry's proven #1 CTA (10/12 replies).

### Module B — Exec-hiring detector (tighten what exists) 
**Source:** Greenhouse + Lever public APIs (free, no key) over a maintained list of target/portfolio companies.
**Flow:**
1. For each company board, pull all jobs.
2. **Precise title filter** (fix the probe's false positives): require sales/revenue/GTM context AND a leadership level; **exclude** "assistant to," "compliance," "risk," non-GTM "CRO." Regex + an LLM yes/no gate on the title+description.
3. A live "VP Sales / CRO / Head of Revenue" req = a mandate → research card.
**Why second:** higher precision cost, and it needs a company list to scan (whereas funding-news is discovery-first). Great as the *enrichment/confirmation* layer on funding hits ("they raised AND they're already posting the VP Sales role" = A+ mandate).

### Deliberately deferred
- **EDGAR Form D** — free but noisy (filer ≠ target company). Revisit only if we want exhaustive coverage; not worth the filtering cost for v1.
- **Departure/expansion signals** — harder to detect cleanly free; add later.

---

## What this is NOT (honest scope)
- **Not a Clay replacement.** Clay also does waterfall contact enrichment across dozens of providers. We're replicating the *signal* half (funding + hiring), which is the part you actually need for Mandate Radar — and using Apollo/Hunter/AI Arc (already owned) for the contact half.
- **Not fully automated day 1.** v1 = a script that emits candidate signals + an LLM relevance gate; Ryan still eyeballs before a card is sent (the human-approval rule). Full unattended automation comes after the precision is proven on a few real runs.
- **Contact names still need LinkedIn verification before sending** (same rule as `09`). The detector finds the *company + mandate*; the person is verified by hand.

## Cost: ~$0 ongoing
Greenhouse/Lever free, funding news via web search, Firecrawl + Claude = pennies per run. vs Clay ~$149–800+/mo. The trade is a few hours of build + you maintain it — which is fine because **the constraint is Ryan's time, not money** (per the `06` CAC model), and this removes a recurring bill.

---

## Recommended next step (the actual build)
Build **Module A (funding detector) as a standalone script first** — `funding_signal_detector.py` — that takes a vertical + date window and emits structured mandate candidates (the `09` format), with the LLM relevance gate. Test it live on one vertical. If the output matches the hand-built `09` quality, wire it into `signal_engine.py`'s merge→score flow. Module B (Greenhouse/Lever, tightened) second.

⚠️ Before building: confirm whether the sandbox can reach the **funding-news sources via Firecrawl** specifically (web search worked for `09`; Firecrawl-of-article not yet probed here). If Firecrawl is blocked, fall back to web-search-only extraction (slower, still works).

---

## Decisions for Ryan
1. **Module A (funding) first — agree?** (My rec: yes — cleanest signal, proven by `09` + Harry.)
2. **Standalone script first, or straight into `signal_engine.py`?** (My rec: standalone, prove quality, then wire in — avoids breaking a working pipeline.)
3. **Greenhouse/Lever (Module B) — worth maintaining a target-company list for, or skip until funding alone proves the offer?** (My rec: skip for v1; funding-news is discovery-first and enough to start.)
