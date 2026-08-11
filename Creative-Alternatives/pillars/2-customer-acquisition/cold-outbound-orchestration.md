# Cold outbound orchestration — SmartLead + Sendr + Salesfinity as one engine

> How the three channels run as ONE process instead of three tools. Email (SmartLead) is the volume layer,
> LinkedIn (Sendr) is the trust layer, phone (Salesfinity) is the conversion layer — and the phone dials
> **who the other two channels heat up**, not a random list.
> Companion docs: `salesfinity-call-motion.md` (dialer ops) · `sequences/cold-call-phone-first-script.md` (script) ·
> `sequences/sendr-linkedin-campaign.md` (Sendr build) · `outbound-gtm-playbook.md` (email engine).

---

## 1. The core idea: one lead pool, three channels, signal decides who gets dialed

```
AI Ark list pull (tiered, QB-suppressed)
        │
        ▼
   SmartLead email sequence  ←— everyone starts here (Day 0)
        │
        ├── Sendr LinkedIn (parallel, auto: connect → video DM + mockup page → F1/F2)
        │
        ▼
   weekly: scripts/ca_call_targets.py reads SmartLead engagement
        │
        ├── tier1  (clicked or 3+ opens, no reply)  → reveal mobile → Salesfinity dial queue
        ├── tier2  (opened 1–2×)                    → dial after tier1 is worked
        └── tier3  (no opens)                       → email keeps working them; NO dial
        │
        ▼
   Salesfinity blocks (3 passes/lead) ──→ meeting booked → HubSpot pipeline
        │
        └── dispositions flow BACK: do-not-call → suppress in SmartLead + Sendr, same day
```

**Why signal-first dialing:** a cold dial to a stranger converts ~1–2%; a dial to someone who opened your
email 4 times this week is a different call — they already know the name. The email engine's *non-repliers
with engagement* are the phone's best list, and they cost nothing to find (we already paid to email them).

Current state (2026-07-11, from the three ACTIVE campaigns — law, law national, financial):
**4,615 callable non-repliers → 362 tier1 · 1,903 tier2 · 2,350 tier3.** Only 7 tier1/2 have mobiles on
file → **~355 tier1 mobile reveals is the next list-build action** (gated, §4).

## 2. The unified cadence (per lead, ~3 weeks)

| Day | Channel | Touch |
|----:|---------|-------|
| 0 | SmartLead | Email 1 (signal-personalized, mockup tease) |
| 1 | Sendr | Connection request (auto) |
| 3 | SmartLead | Email 2 |
| 3–5 | Sendr | If accepted: wait 2d → video DM + mockup page → F1 (+24h) → F2 (+24h) |
| 7 | SmartLead | Email 3 |
| **7+** | **Salesfinity** | **Pass 1 — only if tier1/2 by then** (VM on pass 1) |
| 10 | Salesfinity | Pass 2, different hour (no VM) |
| 12 | SmartLead | Email 4 / breakup |
| 14 | Salesfinity | Pass 3 (breakup VM) → lead is spent |

Rules that make it one system instead of three:
- **A reply ANYWHERE stops everything else.** SmartLead stop-on-reply: on. Sendr stop-on-reply: on.
  Salesfinity queue: purged of repliers at every Monday rebuild (`ca_call_targets.py` drops them automatically).
- **The call references the other channels honestly.** Tier1/2 leads got emails → "I sent you a note this
  week — this is the follow-up nobody does." LinkedIn-accepted leads → "we're connected on LinkedIn."
- **One owner per reply.** Email replies → reply-watcher pipeline → Maclaine. LinkedIn replies → Maclaine in
  Sendr inbox. Call outcomes → logged in Salesfinity at the block. Everything that becomes a real
  conversation → HubSpot, which is the only pipeline truth.
- **Do-not-call / unsubscribe anywhere = suppressed everywhere, same day.** One channel's opt-out is all
  three channels' opt-out.

## 3. The weekly operating rhythm (the actual workable process)

**Monday — build the week (~30 min, Ryan):**
1. `python3 scripts/ca_call_targets.py` → fresh tiers from live SmartLead engagement.
2. Reveal mobiles for NEW tier1s only (§4 gate). Append to the Salesfinity dial queue.
3. Purge queue: anyone who replied, unsubscribed, or hit do-not-call since last week.
4. Check SmartLead deliverability gates (bounce <3%, spam ≈0) — email health feeds everything downstream.

**Tue–Thu — execute:**
- SmartLead + Sendr run themselves (that's the point of the automation).
- 2 × 60–90 min Salesfinity blocks/day on the queue: tier1 first, then tier2, then the 147-mobile
  cold list (`cold_dial_list.csv`), then win-backs as filler. Dispositions logged per call, mockups
  promised go out same day.

**Friday — read the scoreboard (~20 min):**
- Export Salesfinity call log → `outputs/coldcalls/logs/`.
- `/weekly-review` under Motion 4, by segment × channel: sent · opens · replies (email) ·
  accepts · DM replies (LinkedIn) · dials · pickups · conversations · **meetings booked** (phone) →
  **stores/deals signed** (HubSpot).
- Verbatim objections from calls + replies → `prospect-interaction-analyzer` → copy iterations.
- Kill/scale call: segments earn more list (email) and more reveals (phone) by booking meetings, not by opens.

## 4. List building & scaling (the gates)

1. **New segments enter through email first** — never dial a segment that hasn't earned tier1s. The
   DRAFTED SmartLead campaigns (accounting 709 · real estate 726 · agencies 1,585 · insurance 213 ·
   consulting 496 …) are the pipeline of future dial lists: activate campaign → wait ~1 week → tier1s appear.
   Net-new segment lists get built with `/ca-outbound` (AI Ark pull → personalize → quality gates → DRAFT
   campaign) — the phone list is then a downstream byproduct of the same pipeline.
2. **Mobile reveals are Tier-1 only and cost-gated** (standing rule — credits are real money):
   free people_search verification that the reveal targets the exact ids BEFORE any paid run, cost
   estimate to Ryan, explicit go. No bulk reveals on tier2/tier3 — tier2 gets revealed only if it
   upgrades to tier1 or tier1 runs dry mid-week.
3. **QuickBooks suppression on every list** before it touches any channel (8% of past replies were
   existing customers — on the phone that mistake is worse).
4. **Deliverability is the tide.** If email health degrades, the whole engine's signal source dries up —
   the bounce/spam gates in `master-gtm-strategy.md` §8 protect the phone list too.

## 5. Roles

- **Ryan:** Monday build, reveals, deliverability, scoreboard, kill/scale decisions.
- **Maclaine:** the voice — dial blocks, LinkedIn replies, email replies, meetings.
- **Claude:** `ca_call_targets.py` refresh, queue hygiene, objection mining, copy iterations, this doc current.

---

**State right now:** 147 cold mobiles dial-ready (`cold_dial_list.csv`) · 362 tier1 awaiting mobile reveal
(`call_targets_engaged.csv`) · 3 email campaigns feeding the machine · Sendr sequences designed, enrollment
pending. The single blocking decision: **the ~355-mobile tier1 reveal** — cost-check then go/no-go (Ryan).
