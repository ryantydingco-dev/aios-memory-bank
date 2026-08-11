# AIOS Launch Protocol — Context, Kickoff & Blueprint Close (Kenny & Maclaine)

> **Companion to `ops-audit-interview-kit.md`, not a replacement.** That file is the detailed
> workflow-mapping script (Section 2 below) — it's already good, use it as-is. This file wraps
> it with a **Kickoff** (before) and a **Validation & Blueprint close** (after), and adds the
> **context/strategy questions** that feed the AI's ongoing understanding of the business, not
> just the automation backlog. Built from the AAA Accelerator Consulting Course (5-Step
> Assessment Methodology, the U-Shaped interview method, the Otto discovery framework) merged
> with AIOS's own ContextOS interview flow — the exact playbooks a $30-50k AI consulting
> engagement runs on, adapted to CA's scale and Kenny's posture.
>
> Purpose: by the end of this whole protocol, you have (1) real answers to fill the `[CONFIRM]`
> gaps in `context/business-info.md`, `context/people.md`, `context/strategy.md`, and
> `ops-discovery.md`, and (2) a Kenny + Maclaine who are genuinely excited about what's coming,
> not just tolerating it. Run this BEFORE you start clicking through the actual ContextOS
> install on the Mac Studio — the install goes faster and produces a sharper `CLAUDE.md` when
> you're typing in real answers instead of making them up in the moment.

---

## How the three layers fit together

```
LAYER 1 — KICKOFF (both, ~15-20 min)
   Force-focus the scope. Set expectations. Get real buy-in, not just permission.
        ↓
LAYER 2 — DEEP INTERVIEWS (separately, Maclaine then Kenny)
   Run ops-audit-interview-kit.md (the workflow walk-through — unchanged, use it as-is)
   PLUS the context/strategy questions below (NEW — these don't live in the existing kit)
        ↓
LAYER 3 — VALIDATION & BLUEPRINT CLOSE (both, ~20-30 min)
   Compare what each of them said. Present Reality 1 vs Reality 2. Get the "let's do this" moment.
        ↓
   Feed everything into context/ files → THEN install ContextOS on the Mac Studio
```

**Why this order, specifically for CA's two-person structure:** the classic U-Shaped method
says exec → frontline → back to exec. Kenny is the exec (owns relationships, judgment, the
final call on anything customer- or vendor-facing). Maclaine is the one closest to the ground
truth — she runs the systems and holds the data (per `context/people.md`, already the reason
the existing kit says to interview her first). So: **Kickoff with both → Maclaine deep-dive
first (frontline truth + the numbers) → Kenny deep-dive second (judgment, relationships, the
sacred parts) → come back together to validate and close.** This isn't a change to the existing
sequencing decision — it's the reasoning behind why it was already right.

---

## LAYER 1 — The Kickoff (both, before any deep interview)

AAA's own data: badly-run kickoffs feel like an unfocused brainstorm and nobody leaves knowing
what happens next. A well-run one — Nick Rocco's "momentum kickoff" — leaves everyone knowing
exactly what's happening, why, and what's expected of them. Keep it to 15-20 minutes.

**Say something close to this (matches the existing kit's posture — you're not here to grade
Kenny, you're here to learn his system):**

> "I want to take everything we've talked about and actually build it — a system that runs on
> its own machine, learns how this business really works, and takes the annoying stuff off
> your plate. Before I do that, I need to understand the business the way you two understand
> it, not the way I'd guess at it. So I'm going to sit down with each of you separately, ask a
> lot of questions, and then come back together and show you what I found. Nothing changes
> about how you sell or who you are with customers — I'm mapping what happens behind the
> scenes so a computer can start carrying some of it."

**The force-focus question (AAA's scoping tool — ask it here, in the kickoff, not buried in
the deep interview):**

> "If you could wave a wand and have the computer handle ONE thing this year — the one thing
> that would actually give you real hours back — what's the first thing that comes to mind?"

This isn't the same as the existing kit's Section 4 "magic wand" question — that one surfaces
pain during the deep interview. This one, asked in the kickoff, is a **scoping tool**: it
gives you the thing to keep coming back to across both interviews, so you don't end up with a
scattered list of 20 unrelated automation ideas. Write down whatever they say — you'll check it
against what actually surfaces later.

**Also settle here, before anything else:**
- Confirm the plan: Maclaine first, then Kenny, then you come back together.
- Confirm filming/recording boundaries (Section 10 of the existing kit) — do this now, not
  mid-interview.
- Set a rough timeline: interviews this week, the Mac Studio build starts once you have the
  Friday hardware, first real output (not a demo, a real thing running) within 1-2 weeks.

---

## LAYER 2 — Deep interviews (Maclaine, then Kenny, separately)

**Run `ops-audit-interview-kit.md` as written — it's already the right tool for mapping the
order-to-cash workflow, the tool stack, and the pain points.** Don't rebuild that.

**What to add on top, per person — the ContextOS-style questions.** These build the AI's
*ongoing* understanding of the business (context, not just automation targets), and they're
genuinely not covered by the existing kit:

### With Maclaine (the operator — go first)
1. If you had to explain Creative Alternatives to someone who's never heard of it, in your own
   words, what would you say? *(Compare later to Kenny's version — the gap is informative.)*
2. What does "winning" look like for this business over the next 1-3 years — not revenue
   necessarily, just what does a great version of CA look like?
3. Of everything you touch day to day, what's the stuff that's genuinely just yours — nobody
   else knows how to do it or where it lives?
4. Where does the real, current state of the business actually live — QuickBooks, a
   spreadsheet, your head? What's the one number you'd want a computer to just tell you every
   morning without you having to go look for it?
5. What's the thing about how this business runs that would surprise an outsider?

### With Kenny (the founder — second)
1. Same opener as Maclaine's #1 — "in your own words, what does CA actually do for a
   customer" — but expect a different emphasis (relationship-first vs. systems-first). That
   difference is real signal, not noise.
2. What does winning look like for you, personally, over the next few years? *(Different from
   "what does winning look like for the business" — this is about what YOU want out of it.)*
3. What's the story of how this business actually started, and what's stayed true about it the
   whole way through?
4. Is there anything about how you run this that you've never had to explain to anyone before,
   because you're the only one who's ever needed to know it?
5. *(This overlaps the existing kit's Section 8 — use that section as written, it's already
   the right questions for do-not-automate guardrails. Don't duplicate here.)*

**Interview tactics, straight from AAA (apply to both conversations):**
- **Be a hunter, not a farmer.** Don't try to cover everything — come in with 2-3 hypotheses
  (seeded by what came up in the kickoff's force-focus answer) and go deep on those, rather
  than skimming the whole business.
- **Follow the thread.** When something sounds like real pain: walk me through it → what
  triggers that → who else is involved → what happens when it goes wrong → how often → how
  does that actually feel to deal with. Don't settle for the first, shallow answer.
- **Record everything** (audio is enough, same as the existing kit says) — an AI notetaker
  running with zero exceptions. You will miss things live that matter later.
- **Don't lead the witness.** Never "couldn't you just use AI for that?" — they don't have your
  context on what's possible. Pull out the problem; you propose the solution later, alone,
  with time to think.

---

## LAYER 3 — Validation & Blueprint close (both, together, after both interviews)

This is the moment that turns "I answered a bunch of questions" into "I'm genuinely excited
about what's coming." Don't skip it — AAA's data across 15-20 real client engagements is that
this is what converts a one-time project into a client who actively wants more.

**Step 1 — the validation loop-back (the U-shape closing):**

> "Here's what I heard from Maclaine on the ops side, and here's what I heard from you, Kenny,
> on the relationship side. [Walk through 2-3 specific things.] Does that match how you'd both
> describe it?"

Where the two answers *don't* match is often the most valuable thing in the whole process —
it's usually where something is falling through the cracks silently.

**Step 2 — Reality 1 vs. Reality 2 (built from their own words, not generic AI pitching):**

Present two simple pictures, side by side, using specifics they actually said:

- **Reality 1 — if nothing changes:** e.g., "You're still spending [X hours] a week doing
  [thing they named], reconciling QuickBooks the same way, chasing the same reorders by memory."
- **Reality 2 — with the system running:** e.g., "The computer already knows every customer's
  history, flags the ones who've gone quiet, drafts the reorder outreach for you to approve,
  and Kenny gets [X hours] a week back to do the parts only he can do."

The gap between the two is the pitch — and it's built entirely from what they told you, not
a canned AI sales pitch. This is the moment that gets the "let's do this" reaction.

**Step 3 — name what's next, concretely:**
- The Mac Studio arrives Friday.
- The AIOS gets built starting with ONE thing first — not all 27 years of files at once (see
  note below).
- Tell them what the first visible win will look like and roughly when.

---

## What this feeds into

After running all three layers, go back and actually fill in the gaps:
- Resolve the `[CONFIRM]` tags in `context/business-info.md`, `context/people.md`,
  `context/strategy.md`, `context/offer.md`.
- Fill the workflow table, tool stack, and time/pain log in `ops-discovery.md` (from the
  Layer 2 interviews, using the existing kit).
- Write the do-not-automate rules into `context/operators-code.md` (existing kit, Section 8).
- *Then* — and only then — run the actual ContextOS install on the Mac Studio. You're typing in
  real, interview-sourced answers instead of guessing during the install session itself.

**One layering note for Friday, worth saying out loud before you start:** don't try to import
27 years of files in one push. AIOS's own principle here is "layers, not leaps" — start with
ONE data source for a fast, visible win (QuickBooks is the obvious pick, since the MCP already
exists), get that running and get Kenny to see it work, *then* expand into the historical
archive as a second wave. A dead-quiet week of file-organizing with nothing to show for it is
exactly the kind of thing that tests a change-wary founder's patience instead of earning it.

---

## Pre-Friday prep checklist (none of this needs the Mac Studio)

- [ ] Read this file + skim `ops-audit-interview-kit.md` again so both are fresh.
- [ ] Send Kenny and Maclaine a heads-up about the sessions this week (don't let Friday be the
      first they hear of it) — use language close to the kickoff script above.
- [ ] Decide the ONE first data source to wire up once ContextOS is live (recommendation:
      QuickBooks — the MCP is already built).
- [ ] Confirm recording setup (phone on the table is fine, per the existing kit).
- [ ] Block real calendar time: ~20 min kickoff, ~60-90 min Maclaine, ~60-90 min Kenny, ~20-30
      min validation/blueprint close. Doesn't have to be the same day.
