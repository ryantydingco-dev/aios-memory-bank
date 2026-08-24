# 13 — Deeper Signals for Staffing Firms (beyond funding)

> Ryan's question: "I could've found these funding companies myself. How do we get a DEEPER signal for boutique staffing firms like Melisa's?" Correct instinct — funding is a commodity signal (one search, everyone has it). This is the signal hierarchy + what's provably free, validated with live probes 2026-05-31.

---

## The reframe: funding is the WRONG signal for a staffing firm

Funding is a **leading** indicator — "they'll *probably* hire soon." But a staffing firm doesn't get paid for "probably." The signal that makes Melisa lean in is **confirmed hiring pain happening right now**:

> **Funding** = who'll hire soon (commodity, everyone sees it).
> **Aging / stacked-up / hard-to-fill open roles** = who is FAILING to hire *today* — and that's a company that takes her call, because they're already losing.

The deeper the evidence they're *struggling*, the hotter the lead. A role open 132 days isn't "they might need help" — it's "they've tried for 4 months and can't do it themselves." That's the literal moment a firm gets hired.

---

## The signal depth hierarchy (shallow → deep)

| Depth | Signal | Says | Could Ryan find it by hand? |
|---|---|---|---|
| 🟫 Shallow | **Funding round** | "will hire soon" | **Yes — 1 search.** Commodity. |
| 🟫 Shallow | Generic "we're hiring" post | "hiring something" | Yes |
| 🟨 Medium | **Open-role volume** (12 eng roles) | "hiring a lot" | Partly — tedious |
| 🟨 Medium | **New eng leader hired** (VP Eng/CTO) | "team build-out coming under them" | Sometimes (gated) |
| 🟩 **DEEP** | **Aged open roles** ("Staff Eng open 132 days") | **"they CAN'T fill it — they need a firm NOW"** | **No — needs dated data at scale** |
| 🟩 **DEEP** | **Reposted/re-opened roles** | "first attempt failed" | No — needs week-over-week memory |
| 🟩 **DEEP** | **Role-count ÷ headcount ratio** (15 reqs / 45 ppl) | "drowning, no way to self-recruit" | No — needs structured data |
| 🟩 **DEEP** | **Hard-to-fill stack markers** (Rust, niche ML, clearances) | "specialist search, brutal to source" | No — needs JD parsing |
| 🟩 **DEEP** | **No in-house recruiter** + high volume | "they have no choice but to outsource" | Hard |
| 🟪 Deepest | **Geo concentration** (roles in MI/Midwest) | "local need = your backyard" | No — needs location parsing |

The whole game: **move down this table.** The deeper the signal, the more it (a) proves real need, (b) proves real pain, (c) can't be found by hand → which is exactly why it's worth paying for.

---

## What I PROVED is free (live probes, 2026-05-31)

The deepest, most differentiated signal — **job age** — is free and computable. Greenhouse's public API exposes `first_published` separately from `updated_at`, so you can compute exactly how long each role has been open:

| Company | Eng roles | **Open ≥45 days** | Oldest |
|---|---|---|---|
| Databricks | 233 | **35** | **132 days** |
| Figma | 41 | 9 | 130 days |
| GitLab | 14 | 6 | ~130 days |

**This is the keystone.** "You've had a Staff Backend role open 132 days" is impossible to ignore *and* impossible for Ryan to find by hand (he'd manually check posting dates on hundreds of reqs). Free sources that expose dated, structured roles:
- **Greenhouse** public API — `first_published`, location, full JD (content=true). ✅ proven.
- **Lever** public API — postings + dates. ✅ (proven earlier).
- **Ashby** public API (`/posting-api/job-board/{org}`) — common at startups; ⚠️ availability per-org, verify before relying.

All free, no key. The catch: these are **per-company** APIs — you need a company list to scan (which funding/vertical lists provide). So **funding + jobs combine**: funding finds the company; job-data measures the *depth of their pain.*

---

## The new combined signal model (detector v2)

Don't replace funding — **layer pain depth on top of it.** A company's mandate score becomes:

```
FOUND (who):        funding round  OR  on a vertical list  OR  hiring exec leader
PAIN DEPTH (×):     + aged roles (days open)        ← the differentiator
                    + open-role volume
                    + role ÷ headcount ratio
                    + hard-to-fill stack markers
                    + geo match (local to the firm)
                    + reposted roles (needs weekly memory)
```

**A+ mandate = funded AND has 10+ eng roles, 5 of them open 60+ days, in a stack that's hard to source.** That's not "they raised money" — that's "they raised money and are visibly drowning." Melisa can't *not* respond to that.

### What each tier of the build costs
- **v2a (this week, free):** add job-age + volume + ratio + geo from Greenhouse/Lever to the existing detector. Decisive upgrade, all proven.
- **v2b (needs persistence):** repost/re-open detection — store weekly job snapshots, diff them. This is a genuine moat (Clay doesn't really do it) and it's exactly what the weekly loop is built for. Compounds over time.
- **v2c (harder, gated):** new-eng-leader-hired + departures/backfill — these live on LinkedIn (HTTP-999). Skip for now; revisit if a non-gated source appears.

---

## How this transforms the Melisa pitch (commodity → undeniable)

**Before (commodity funding signal — your complaint):**
> "Vivodyne raised $40M — they'll probably be hiring." *(She thinks: I could've found that. So could the 5 other firms in my inbox.)*

**After (deep hiring-pain signal — what she can't find herself):**
> "Vivodyne raised $40M *and* they've had a Senior Robotics Engineer role open 88 days, plus 9 other technical reqs against a ~40-person team, in a robotics+ML stack that's brutal to source. They're not 'about to hire' — they're stuck. That's a firm that takes your call today."

The second one is **impossible to assemble by hand** and **impossible for Melisa to ignore** — because it's her exact product (filling the role they can't). That's the signal worth paying for, and it's the difference between "neat list" and "holy shit, how did you know that."

---

## Honest limits (so we don't overclaim)
- **Job age ≠ perfect** — `first_published` resets if a company deletes+reposts (which is itself a signal, but it can under-count age). Treat "open ≥45d" as a strong floor, not exact.
- **Coverage gap** — only companies on Greenhouse/Lever/Ashby are scannable; Workday/iCIMS (more enterprise) are messier. Fine — your ICP skews startup/scale-up, which skews Greenhouse/Ashby.
- **Per-company scan** — you must know the company first; this *deepens* a list, it doesn't *discover* from scratch. Funding/vertical lists remain the discovery layer.
- **Ratio needs headcount** — rough from LinkedIn/web; treat as approximate.
- **Repost detection isn't real until we've stored a few weeks** of snapshots — it's a v2b that compounds, not instant.

---

## Recommendation
Build **detector v2a now** (job-age + volume + ratio + geo, all free + proven) and re-run Melisa's radar so each card shows not just "raised $X" but "and has these specific aged/hard reqs." That single upgrade is what answers your question — it turns the dashboard from "a list you could've made" into "intelligence you couldn't." Then v2b (repost memory) as the compounding moat via the weekly loop.

**Decision for Ryan:** build v2a into `mandate_signal_detector.py` now and regenerate Melisa's dashboard with depth — yes?
