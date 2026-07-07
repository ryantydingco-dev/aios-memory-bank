# DealThreads Inbound Machine — Workflow Suite

Last updated: 2026-06-01
Purpose: automate the highest-leverage parts of the [Deal Threads Inbound Machine Blueprint](../Deal%20Threads%20Inbound%20Machine%20Blueprint.md) so the loop runs at volume over the next 90 days instead of by hand.

**The loop these workflows feed:**

```
POV content → Dead Form Audit → form URL capture → free Dead Form Teardown
  → install call → pay-when-it-works → proof → more content
```

North star: **qualified form URLs submitted per week.** These five workflows are the machine that produces the content, the proof, the conversations, and the volume that drive that number — graded against the [Content Grader](../Content%20Grader.md), and **human-in-the-loop for anything that touches LinkedIn** (we draft; Ryan posts).

> Design note: every workflow **reads your canonical docs at runtime** (blueprint, Week 1 pack, content grader, persona, sales kit) — so as those evolve, the workflows stay current without edits.

---

## The five workflows

| # | Workflow | Drives | Input | Output |
|---|----------|--------|-------|--------|
| 1 | **content-factory** | 5 posts/wk + newsletter | `weekOf`, optional `theme` | `Outputs/Content Calendar - Week of <weekOf>.md` |
| 2 | **teardown-engine** | proof + the per-lead sales asset | `targets[]` (form URLs) or archetypes | `Outputs/Teardowns/*.md` + proof posts |
| 3 | **engagement-engine** | 50–100 ICP comments/wk | `posts[]` (pasted ICP posts) | `Outputs/Comment Queue - <day>.md` |
| 4 | **teardown-prospecting** | **volume** — form-URL asks at scale | `accounts[]` (AI Ark export) | `Outputs/Prospecting/Teardown Prospect Queue.md` |
| 5 | **weekly-review** | the learning loop | `weekOf` (+ scoreboard) | `Outputs/Weekly Inbound Review - <weekOf>.md` |

All outputs land in `AI GTM Engine/Inbound/Outputs/`.

---

## How to run (Claude Code `Workflow` tool)

Each file is a self-contained Workflow script. Run by `scriptPath` and pass `args` as real JSON. Examples (say these to Claude, or it calls the tool directly):

**1 — Content factory (weekly):**
> Run the workflow at `…/Inbound/Workflows/content-factory.js` with args `{ "weekOf": "2026-06-08", "theme": "speed-to-lead vs lead-context" }`

**2 — Teardown engine — real inbound request:**
> Run `…/Inbound/Workflows/teardown-engine.js` with args `{ "weekOf":"2026-06-08", "targets":[{ "company":"Acme", "formUrl":"https://acme.com/request-a-demo", "mode":"inbound", "crm":"HubSpot" }] }`

**2 — Teardown engine — proof content (no real form needed):**
> Run `teardown-engine.js` with no targets — it defaults to 3 anonymized archetypes.

**3 — Engagement engine (daily):** paste ICP posts you found via saved LinkedIn searches:
> Run `engagement-engine.js` with args `{ "day":"2026-06-02", "posts":[{ "author":"Jane Doe","role":"VP Sales","company":"X","text":"<paste post>","url":"…" }] }`
> (No `posts`? It returns just the day's search plan.)

**4 — Teardown prospecting (the volume engine):** feed an **AI Ark** export (not Apollo):
> Run `teardown-prospecting.js` with args `{ "weekOf":"2026-06-08", "accounts":[{ "company":"Acme","domain":"acme.com","owner":"Jane Doe","title":"Founder","linkedin":"…","email":"…" }, …] }`

**5 — Weekly review (Fri/Sun):**
> Run `weekly-review.js` with args `{ "weekOf":"2026-06-08" }`

To re-run cheaply after editing a script, use `Workflow({ scriptPath, resumeFromRunId })` — unchanged steps return cached.

> **Note (verified 2026-06-01):** the Workflow runtime delivers `args` to the script as a **JSON string**, not a parsed object. Every script here normalizes it (`parse-if-string`), so passing args as shown above works. If you write a new workflow in this folder, copy the `const IN = (typeof args === 'string') ? JSON.parse(args) : (args || {})` line — reading `args.foo` directly will silently get `undefined`.

---

## 90-day cadence

**Daily (≈15 min of review):**
- `engagement-engine` → review the comment queue, post 10–20 manually.
- Reply to anything `teardown-prospecting` surfaced a reply on; push any form URL into `teardown-engine` (inbound mode).

**Weekly:**
- Sun: `content-factory` (next week's 5 posts + newsletter).
- Mon–Fri: post one/day; comment off the engagement queue.
- 2–3×/wk: `teardown-engine` on real form URLs received (and 1 proof run for a Wednesday post).
- 1–2×/wk: `teardown-prospecting` on a fresh AI Ark batch (this is the volume lever — more form-URL asks = more teardowns = more calls).
- Fri/Sun: `weekly-review`.

**Phase targets (from the blueprint):**
- Days 1–30: 30+ audit downloads, 10+ form URLs, 3+ install calls.
- Days 31–60: 100+ subs, 20+ form URLs, 8+ teardowns, 5+ calls.
- Days 61–90: 250+ subs, 40+ form URLs, 15+ teardowns, 8+ calls → 3–5 paying / clear path to $5K MRR.

---

## Guardrails (baked into every workflow)

- **Human-in-the-loop on LinkedIn.** Workflows draft comments/DMs/posts; Ryan edits + posts. No auto-posting, no identical repeats, no links unless asked, no pitch in comments.
- **Honesty.** Teardowns/prospecting only assert form weaknesses actually fetched; archetypes are labelled as typical patterns; unknown stays unknown. Never invent outcomes or proof (mirrors the GTM brain rule).
- **8.5+ bar.** Content is graded and rewritten to ≥8.5 or flagged.
- **Email sends** still go through Smartlead with sender/domain verified first; the workflow only drafts.

## Related, already-built automation
- Outbound stack: `Operations/scripts/` (daily batch, HubSpot sync, send board) + `Operations/Next Automations To Build.md`.
- This suite is the **inbound** complement to that outbound machine.
