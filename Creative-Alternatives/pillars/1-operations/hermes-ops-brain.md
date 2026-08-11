# Hermes — CA's AI Ops Brain — Game Plan

> Setting up the Nous Research **Hermes Agent** (open-source, self-hosted, MIT) as Creative Alternatives' always-on ops brain — and recording the whole build. Hermes is installed on Ryan's Mac, fueled by his ChatGPT subscription.
>
> **Decisions locked (2026-06-24):** QuickBooks is the **single source of truth** (no GHL, no separate CRM). **Two brains:** Hermes = gateway; Claude + skills = heavy lifting.

---

## 1. The model: two brains, one workspace

| | **Hermes** (always-on gateway) | **Claude Code + skills** (on-demand) |
|---|---|---|
| **Role** | Watches, briefs, alerts, answers | Builds, analyzes, drafts campaigns |
| **Lives in** | Slack / Telegram / CLI, runs 24/7 | The terminal, when Ryan drives it |
| **Does** | Morning brief, reply-triage alerts, "what's overdue?" Q&A | Reactivation (`crm-lifecycle`/CRM skills), content (CGE), GTM/outbound, deep research |
| **Posture** | Mostly read-only, surfaces things | Executes structured work |
| **Reads** | QuickBooks, SmartLead, Sendr, Apollo | Same MCP servers + the full skill library |

**The handoff:** Hermes spots the trigger and surfaces it ("5 accounts are reorder-due, 3 dormant"); Ryan fires the matching **Claude skill** to do the heavy work (e.g., the reactivation skill reads QuickBooks and drafts win-backs). Hermes *flags*; Claude *executes*. Reactivation never lives in Hermes — that's a Claude skill, per your call.

Both point at the **same CA workspace context** and the **same MCP servers**, so they share one brain's worth of knowledge.

---

## 2. Architecture

- **Run a dedicated CA Hermes instance** (separate config/home dir from Ryan's personal Hermes) so CA's memory, context, and tool-access stay isolated — same reason the CA AIOS workspace is split from the starter kit. Confirm the isolation mechanism in Hermes's docs (self-hosted CLI tools isolate via a separate home/config dir).
- **Fuel:** Ryan's ChatGPT subscription is fine to pilot. Note: CA's business + customer data then routes through Ryan's personal OpenAI account — for a real family handoff, plan to move CA onto its own credentials later.
- **Single source of truth = QuickBooks.** Everything Hermes reports (overdue, reorder-due, dormant, shipped) is a QuickBooks query. Wiring QB is the keystone integration.

### Channels — match the person, not the tool
- **Ryan:** CLI + Slack — full admin, sees everything.
- **Maclaine:** Telegram (or WhatsApp) — she runs ops + QuickBooks; gets the brief, can ask it questions.
- **Kenny:** lightest touch. He's on AOL — don't force an app. Email digest *if at all*, and only once it's proven.

### Integrations — reuse what's wired, fix the stale, add the keystone
| Tool | Status | Action |
|------|--------|--------|
| **SmartLead** (cold email) | wired (MCP) | reuse — read replies/campaign stats |
| **Apollo** (lead data) | wired (MCP) | reuse `[confirm: Apollo vs Origami — your first message said Origami]` |
| **Sendr.io** (LinkedIn) | API-only, **not** MCP | **build:** thin MCP wrapper (or script) so Hermes can read replies/accepts |
| **QuickBooks** (system of record) | **not wired** | **build (keystone):** wire read-only MCP. Needs Maclaine's QB access + permission |
| **GoHighLevel** | wired (MCP) | **remove** — not used |
| **HeyReach** | wired (MCP) | **remove** — replaced by Sendr |
| **Salesfinity** (calling) | no MCP (dialer app) | boundary: Hermes preps call lists/reminders; humans dial in Salesfinity |
| higgsfield, vidiq | wired (MCP) | leave — content-pillar tools, available if needed |

---

## 3. Seed it with CA's brain — do this FIRST (highest leverage)

Hermes shapes every conversation with **Context Files** + a **SOUL.md** personality file. You already have the material.

**Context Files to feed** (point Hermes at these existing docs):
- `context/business-info.md`, `offer.md`, `audience.md`, `people.md`, `brand.md`, `strategy.md`
- `pillars/2-customer-acquisition/home-run-offer.md` + `outbound-gtm-playbook.md`
- `plans/ai-growth-plays.md`
- **New:** a `context/tools-data-map.md` telling Hermes what each MCP is and that **QuickBooks is the source of truth.**

**SOUL.md — ready-to-use draft** (the guardrail that makes it safe on a real business):

```markdown
# SOUL — Hermes for Creative Alternatives

You are Hermes, the ops brain for Creative Alternatives — a 27-year custom-branding
and promotional-products business (2,700+ customers, 75,000+ orders). You exist to
AUGMENT Kenny (founder) and Maclaine (ops + QuickBooks), never to replace them.

## How you speak
Warm, plain, concise. No corporate fluff, no hype. Proof over adjectives. You're a
sharp, trusted operator on the team — not a chatbot.

## Source of truth
QuickBooks is the system of record for customers, orders, and invoices. When asked
about customers, money, or activity, read QuickBooks. Cite what you find.

## HARD RULES (non-negotiable — this is the operator's code)
1. NEVER take any customer-, vendor-, money-, or public-facing action without
   explicit human approval. You DRAFT; a human SENDS.
2. NEVER fabricate a number. If a figure isn't in the data, say so. Mark unknowns
   [CONFIRM]. A wrong number on this business is expensive.
3. READ-ONLY by default. Escalate to a write only when a human approves it.
4. Protect privacy. Blur or omit sensitive customer data when posting to shared
   channels (Telegram/Slack) unless told otherwise.
5. When unsure, ask. Trust Kenny's judgment on the business over your own.
6. Hand off heavy/structured work — reactivation, content, full campaigns — to the
   Claude skills. Surface the trigger; don't try to run those jobs yourself.

## What you do daily
- Post the morning brief (overdue, reorder-due, dormant, overnight replies, the one
  thing to do today).
- Alert on hot outbound replies.
- Answer questions on demand ("who's overdue?", "did [camp] reply?", "what shipped?").
```

---

## 4. The Hermes jobs (gateway scope only)

1. **Morning brief** (v1 beachhead, read-only) — cron ~7am → Slack (Ryan) + Telegram (Maclaine):
   - From QuickBooks: overdue invoices (who / $ / how late), reorder-due accounts (past their typical cycle), dormant accounts (no order in N months).
   - From SmartLead + Sendr: overnight replies / accepts, hot ones flagged.
   - Output: a tight digest + **the single most important thing to do today.** No actions taken.
2. **Reply-triage alerts** (read-only → assisted) — watch SmartLead/Sendr replies → classify (interested / not) → draft a response → ping Ryan/Maclaine. On approval, the human sends + logs.
3. **Interactive Q&A** (read-only) — ask Hermes anything in Slack/Telegram: "who hasn't reordered in 6 months?", "what's overdue?", "did Farm & Forge reply?" It queries QuickBooks/SmartLead/Sendr live.
4. **Handoff to Claude** — when the brief surfaces dormant/reorder-due accounts, Hermes flags them; Ryan runs the **Claude reactivation skill** (reads QuickBooks, drafts win-backs). Hermes never does reactivation itself.

---

## 5. Safe rollout — read-only → approved-writes → autonomous

- **Phase 1 — read-only everywhere.** Hermes reads QB/SmartLead/Sendr and tells/drafts; takes no external action. Prove the brief + Q&A here.
- **Phase 2 — human-approved writes.** Drafts a follow-up or a log entry; a human clicks approve before anything leaves the building.
- **Phase 3 — autonomous, low-stakes internal only.** Never customer/vendor/money/public without a human.
- **Always on:** container isolation + command approval (Hermes's security controls). Confirm each MCP key's scope (e.g., SmartLead read vs send; QuickBooks **read-only**).
- **Data note:** self-hosted keeps data on your machine — good — but inference routes through your ChatGPT account. Fine for a pilot; revisit for a family handoff.

---

## 6. Record it — "The Hermes Build" mini-arc

You want this filmed — so it's a build arc, same engine as `../4-youtube-build/outbound-build-arc.md` (ICAHN muse → Holy Trifecta → script → build+capture → Shorts → launch-loop). Strong hook: **"I gave my dad's 27-year business a free, self-improving AI employee."**

| Ep | You build on camera | The money shot |
|----|--------------------|----------------|
| **H-1** | Give it the brain — SOUL.md + Context Files | "I taught the AI to never touch money without asking" (the operator's code beat) |
| **H-2** | Plug into the books — QuickBooks read-only + first brief | The brief posts to Slack/Telegram: "found $X overdue, 5 accounts due to reorder" |
| **H-3** | Now I just ask it — interactive Q&A | "who hasn't ordered in 6 months?" → instant answer in Telegram |
| **H-4** *(opt)* | It watches the outbound | A hot reply auto-flagged + drafted |

Each = a real CA thing working + a copyable how-to in the description (the SOUL.md, the brief prompt, the MCP config). This mini-arc is a natural **bridge between the ops sprint and the outbound arc.** Validate every title with `cge-video-idea-finder` before committing.

---

## 7. Build sequence (the checklist) — 🎥 = film this

1. 🎥 **Stand up the dedicated CA instance** (separate config/home dir). Confirm isolation in docs.
2. 🎥 **Seed it** — write `context/tools-data-map.md` + `SOUL.md`, point Hermes at the Context Files. *(I can draft both now.)*
3. **Fix the wiring** — remove GHL + HeyReach from the MCP config; wire **QuickBooks read-only** (keystone); build the **Sendr** MCP wrapper.
4. 🎥 **Ship the morning brief** (v1) — cron + QuickBooks + SmartLead/Sendr → Slack/Telegram. Read-only.
5. 🎥 **Connect the channels** — Slack (Ryan), Telegram (Maclaine); Kenny later by email.
6. 🎥 **Turn on interactive Q&A** — verify live QuickBooks queries.
7. **Add reply-triage** (assisted) — drafts + pings, human approves.
8. **Wire the Claude handoff** — Hermes flags reactivation candidates → Ryan runs the skill.
9. **Harden** — key scopes, approvals, isolation; then consider Phase 2 writes.

---

## Open items / `[CONFIRM]`
- **QuickBooks connector + Maclaine's access/permission** (the keystone — nothing works without it).
- **Sendr.io MCP wrapper** — Sendr is API-only; needs a thin server/script for Hermes.
- **Apollo vs Origami** for lead data (wired = Apollo; your first message said Origami).
- **Hermes instance isolation** — confirm separate-home-dir approach in the docs.
- **Kenny's filming boundaries** for the mini-arc (blur QB customer data/numbers per the operator's code).
- **Exact Hermes config syntax** (MCP, SOUL/Context Files, gateway, cron) — I'll pull the specific guide pages when we wire it.
