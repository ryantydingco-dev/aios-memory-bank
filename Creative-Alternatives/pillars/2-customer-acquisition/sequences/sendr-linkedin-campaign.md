# Sendr Campaign Build — "Swag Handled" (LinkedIn, fully automated in Sendr)

> **BUILD STATE (2026-07-12):** workspace "Creative Alternatives" created; campaign
> **"Swag · Stage I — Law + Financial (Engaged)"** (id 9991) built in DRAFT: connection request
> (with note) → check-accepted → wait 2d → Stage I DM w/ {{page_link}} → +1d F1 → +1d F2.
> Settings: Mon–Fri 9–5 ET, stop-on-reply ON. Import file (2,265 leads, deduped: warm 202 +
> engaged batch2) staged at `~/Downloads/sendr_import_all.csv`.
> **Blocking, in order:** (1) Ryan connects his LinkedIn account in Sendr; (2) Ryan clicks
> Upload CSV → picks the Downloads file; (3) build the CA page template (Templates → new
> personalized landing page) + insert the native **Generate Page** step before the Stage-I DM —
> per the no-page-no-DM rule, do NOT launch until the page step is live; (4) flip Draft → Active.
> Verify merge-token names ({{firstname}}, {{company}}, {{page_link}}) against Sendr's variable
> picker after the CSV import maps columns.

> Build this entirely **inside Sendr** — Sendr is the automation engine. Same *flow* as the Oloxa setter cadence (connection → warming → Stage I video DM + page → F1/F2 → positive reply → Stage III booking → F1–F6 → booked), but configured as native Sendr sequences. No Airtable, no external tracker — Sendr runs and tracks it.

## The flow we're automating
```
Connection request → [accepted] → wait 2d (warming)
  → Stage I: video DM + personalized page (the mockup)
      → +24h F1 → +24h F2 → exhausted
  → [positive reply] → exits automation → human sends booking link
      → Stage III nudges: +1h, +12h, +24h, +48h, +72h, +96h → booked
```
**Split into two Sendr sequences** because a reply must pull someone OUT of automation (you never auto-nudge a live conversation). Sequence A = the cold Stage I cadence (fully auto). Sequence B = the post-reply booking nudges (you enroll them once they've gone quiet after you sent the link).

---

## SEQUENCE A — "Swag · Stage I" (fully automated)
Enroll: the AI Ark corporate list. Sendr step-by-step (map these to Sendr's step labels — Connection Request / Message / Video Message / Delay / Condition):

| # | Sendr step | Setting | Content |
|---|-----------|---------|---------|
| 1 | **Connection Request** | Day 0 | Connection note (below) |
| 2 | **Condition: If Accepted** | wait up to 14d; if never accepted → exit | — |
| 3 | **Delay** | **2 days** (warming) | — |
| 4 | **Video Message** (+ page link) | — | Stage I video DM + `{page_link}` — **`{page_link}` must be the lead's OWN page (their logo, their mockups), built during the 2-day delay via `sendr-page-pipeline.md`. No page, no DM — snooze the lead, never link the generic CA demo.** |
| 5 | **Delay** | **24h** | — |
| 6 | **Message** | only if no reply | **Stage I F1** |
| 7 | **Delay** | **24h** | — |
| 8 | **Message** | only if no reply | **Stage I F2** |
| 9 | **End** | tag `stage1-exhausted` | — |

**The one global setting that makes this safe:** turn ON **"stop sequence on reply"** (Sendr's reply-detection). The moment anyone replies, Sendr pulls them out of Sequence A — no F1/F2 fires at a live conversation. That's the read-the-room rule, enforced automatically. Replies route to Maclaine/Ryan.

## SEQUENCE B — "Swag · Stage III Booking" (you enroll on positive reply)
After a prospect replies positively, the human replies warmly and sends the booking link. **Only if they then go quiet**, enroll them in Sequence B so Sendr handles the timed booking nudges:

| # | Sendr step | Setting | Content |
|---|-----------|---------|---------|
| 1 | **Message** | Day 0 (entry) | Booking link message |
| 2 | **Delay → Message** | **+1h** | **F1** |
| 3 | **Delay → Message** | **+12h** | **F2** |
| 4 | **Delay → Message** | **+24h** | **F3** |
| 5 | **Delay → Message** | **+48h** | **F4** |
| 6 | **Delay → Message** | **+72h** | **F5** |
| 7 | **Delay → Message** | **+96h** | **F6** |
| 8 | **End** | tag `booking-exhausted` | — |

Same "stop on reply" + stop-on-booking setting ON, so any reply or a booked call exits them immediately.

## Campaign settings (both sequences)
- **Accounts:** run on Maclaine's + Ryan's LinkedIn (two senders, double the limit, two voices).
- **Connection cap:** ≤20–25 requests/day/account. Let Sendr pace it.
- **Sending window:** weekdays only, business hours (turn off weekends in Sendr's schedule).
- **Stop on reply:** ON for both sequences (non-negotiable).
- **One automation tool per account** — Sendr only on these profiles. Don't add a second LinkedIn tool.

---

## The copy (paste into each Sendr step)
Tokens — use Sendr's merge fields: `{first}` `{company}` `{industry}` `{page_link}` `{calendar_link}`

**Step 1 — Connection request** (no pitch)
> Hi {first} — I work with a lot of {industry} teams around the area on their branded gear and swag. {company} came up and I wanted to connect.

**Step 4 — Stage I video DM** (record once, Sendr personalizes the page per lead)
> Hey {first}, thanks for connecting. Quick one — I mocked up what a branded onboarding kit for {company} could look like *(walk the mockup on screen)*. We do this for companies start to finish — design it, store it, ship it when new folks start, so it's never a last-minute scramble. Full mockup's here, no pitch: {page_link}

**Step 6 — Stage I F1**
> Hey {first}, did that {company} mockup land okay? Happy to walk you through how it'd actually run — just say the word.

**Step 8 — Stage I F2** (final)
> All good if now's not the moment, {first} — the mockup's yours whenever. Want me to just leave it with you for when a new-hire wave or event comes up?

**Sequence B Step 1 — Booking link**
> Love it. Easiest next step is 15 minutes — I'll show you the full {company} setup and exactly how it'd run. Grab whatever works: {calendar_link}

**Sequence B booking nudges**
- **F1 (+1h):** Just sent that over — link again so it's not buried: {calendar_link}
- **F2 (+12h):** Want me to pencil in a couple of times that might work for you?
- **F3 (+24h):** {first}, still keen to walk you through the {company} kit — 15 min, here whenever: {calendar_link}
- **F4 (+48h):** No rush — when's better, this week or next? I'll work around you.
- **F5 (+72h):** Keep it simple: reply with a day that works and I'll send a time.
- **F6 (+96h):** I'll stop nudging after this — if branded swag ever gets painful for {company}, the mockup and link are here: {calendar_link}. Either way, good to be connected.

**Reply handlers** (you, by hand — Sendr paused them out of automation)
- *"We already have a vendor":* Most do — usually two or three. We make it one, faster, and you stop managing it. Worth seeing the mockup either way?
- *"Not right now / busy season":* Totally get it — when's your next new-hire wave or event? I'll have it ready for then, no pressure.
- *Referral/redirect:* thank them, ask for the intro.

---

## Build checklist (in Sendr)
1. Create campaign **"Swag · Stage I"** → add the AI Ark list → build Steps 1–9 above → set delays → **turn on "stop on reply"** → connect Maclaine + Ryan accounts → set weekday window + 20–25/day cap.
2. Record the Stage I video once. `{page_link}` is filled per lead by the **generate-on-accept pipeline** (`sendr-page-pipeline.md`): each morning, newly-accepted connections get their own mockup page (their logo, 3 mockups, Gamma mini-lookbook) built inside the 2-day warming window and pasted into the lead's custom field. Tracking columns live in `../outbound/sendr-warm-audience.csv`.
3. Create campaign **"Swag · Stage III Booking"** → Steps 1–8 → stop-on-reply/booking ON → leave it idle; you enroll prospects manually when they go quiet after the booking link.
4. Launch Stage I. Replies land in your inbox → you handle the conversation → enroll into Booking only if they ghost after the link.

> Want me to drive your browser into Sendr and build these two sequences with you (paste the steps + copy in), or are you good to set it up from this spec?
</content>
