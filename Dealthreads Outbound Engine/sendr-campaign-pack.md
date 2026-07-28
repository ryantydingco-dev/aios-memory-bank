# Sendr Campaign Pack — LinkedIn (2026-07-17)

Everything below is ready to paste into Sendr's Sequencer. Nothing in this pack has been launched: both campaigns get built switched OFF and only Ryan flips them on. All copy follows the house rules: no meeting guarantees, no discount lines, contractions on, DMs under 60 words.

API reality on this seat (verified 2026-07-17): row writes to existing sheets work; sheet creation, campaign creation, column creation, and row reads are all denied (401). So the engine feeds rows automatically, and the four build steps below are UI work. One session, roughly 90 minutes.

---

## Campaign A — "Warm Wrap"

**Audience:** router-pushed positive email repliers. The engine pushes every new positive replier into the warm sheet automatically. Seed file for the sheet: `dealthreads-engine/queues/warm_wrap_sheet_seed.csv` (current positives: Luke Gendron, Angel Williams, Dane Reese, Annette Kidd; Brooke Maule and Joel Pierson excluded as documented negatives).

**Sequence steps:**

| # | Step | Timing | Content |
|---|------|--------|---------|
| 1 | Profile View | Day 0 | none |
| 2 | Connection Request | Day 0, a few hours after the visit | Note (under 300 chars): `Ryan here, the one emailing you about the hiring manager list` |
| 3 | Delay + Connection Check | Wait 1 day, then check; recheck daily up to 14 days | If never accepted: end quietly. They stay in the email thread anyway. |
| 4 | LinkedIn Message (DM 1) | Same day as accept | see below |
| 5 | Delay | 3 days | none |
| 6 | LinkedIn Message (DM 2) | Day 3 after DM 1 | see below |

**DM 1 (after accept, 47 words):**

> Good to connect, {{first_name}}. I'm the one who emailed you about the hiring manager list for {{company}}. Wanted one thread where you can actually see my face next to the work. If the sample didn't land in your inbox yet, say the word and I'll send it here.

**DM 2 (day 3, 30 words):**

> {{first_name}}, made you a short video walking through your list and how I'd work it: {{video_link}} Two minutes, no slides. If it's useful, my calendar is on the page.

**Caps:** volume is tiny (a handful of people a week), so Sendr's defaults are fine. Reply detection on: any reply stops the sequence.

---

## Campaign B — "Cold Staffing Owners"

**Audience:** the cold sheet the engine keeps topped up to 500 rows (Tier A staffing owners with LinkedIn URLs, personalization attached). Until the dedicated sheet exists in the UI, the 500 rows sit in campaign 8258's sheet tagged `cold_linkedin | {vertical}` in the Industry column; filter on that so the legacy Oloxa rows never enter this campaign.

**Sequence steps:**

| # | Step | Timing | Content |
|---|------|--------|---------|
| 1 | Profile View | Day 0 | none |
| 2 | Connection Request | Day 0, a few hours after the visit | BLANK note. No pitch in the invite. |
| 3 | Delay + Connection Check | Wait 1 day, then check; recheck daily up to 10 days | If never accepted: end quietly. |
| 4 | LinkedIn Message (DM 1) | Same day as accept | see below |
| 5 | Delay | 3 days | none |
| 6 | LinkedIn Message (DM 2) | Day 3 after DM 1 | see below |
| 7 | Delay | 4 days | none |
| 8 | LinkedIn Message (DM 3) | Day 4 after DM 2 | see below |

**DM 1 (after accept, the sample-list magnet, 49 words):**

> Thanks for connecting, {{first_name}}. Quick offer, no strings: I build lists of hiring managers actively hiring in a staffing firm's niche. Takes me about an hour, and it's yours either way. If you want one for {{company}}, tell me the niche you place in and I'll get it built.

**DM 2 (day 3, video, 36 words):**

> {{first_name}}, recorded you a short video on how the list gets built and why the timing layer matters more than the names: {{video_link}} Worth two minutes if new client outreach is on your plate this quarter.

**DM 3 (day 4 after DM 2, breakup, 46 words):**

> Last note from me, {{first_name}}. If the list isn't useful, no harm. The selection logic is the real gift: titles that own staffing decisions, 20 to 2,000 headcount, companies hiring right now. Steal it and run it yourself. If you'd rather see it running, I'm here.

**Caps and schedule:**
- Connection requests: 20 per day. Sendr's own recommended maximum is 20 (default 15); the plan ceiling is 25 but LinkedIn's weekly cap is roughly 100 on a standard seat, so 20 x 5 days already sits at the line. Start at 20; drop to 15 if the seat ever shows warnings.
- Profile views: 25 per day (must stay at or above the invite cap so step 1 never bottlenecks step 2).
- Messages and connection checks: Sendr defaults (25 per day) are fine.
- Schedule: Monday to Friday only, 8:00 am to 5:00 pm, America/New_York.
- Reply detection on: any reply stops the sequence and lands in the Unibox.

---

## Exact UI build steps (sendr.ai app)

Source: help.sendr.ai articles "Building your first sequence", "LinkedIn actions in a sequence", "How does Sendr know when a connection request has been accepted", "Sequence schedule: days, times, and timezone". Where the docs don't name a button, the step is written generically and marked (generic).

**0. Confirm the LinkedIn seat.** Settings > Channels. You need the LinkedIn account showing connected and healthy before anything else.

**1. Create the two sheets (UI only; the API cannot create sheets on this seat).**
1. Open the Sheets area (generic: the same picker the Sequencer uses for audiences; sheets can be created by CSV import).
2. Import `dealthreads-engine/queues/linkedin_cold_sheet.csv` as a new sheet named `LinkedIn Cold — Staffing Owners`. It carries all 500 pushed rows with personalization and source columns intact.
3. Import `dealthreads-engine/queues/warm_wrap_sheet_seed.csv` as a new sheet named `Warm Wrap — Positive Repliers`.
4. Copy each new sheet's id (from the sheet URL) into `dealthreads-engine/.env`:
   - `SENDR_COLD_SHEET_ID=<cold sheet id>` (the weekly feed then tops up the dedicated sheet)
   - `SENDR_WARM_SHEET_ID=<warm sheet id>` (the router then pushes new positives there)
5. Housekeeping on the old DealThreads sheet (campaign 8258): delete the row `probe-delete-me@dealthreads.invalid` (an API probe; invalid email, no LinkedIn URL, campaign is DRAFT, so it could never message anyone).

**2. Build Campaign B.** Sequencer > New sequence. Name it `Cold Staffing Owners`. Choose the sheet `LinkedIn Cold — Staffing Owners` (or, until that exists, campaign 8258's sheet filtered to Industry starting with `cold_linkedin`). Click Add step for each row of the table above, in order: Profile View, Connection Request (leave the note empty), a wait step plus a Connection Check condition (branch: connected continues, not connected ends), then the three LinkedIn Message steps with the delays between them. Paste the DMs exactly. Set the per-action daily limits and the Monday to Friday schedule in the sequence's schedule settings. Leave the sequence switched OFF.

**3. Build Campaign A.** Same flow: Sequencer > New sequence, name `Warm Wrap`, sheet `Warm Wrap — Positive Repliers`, steps per Campaign A's table, connection request WITH the note, two DMs. Defaults for limits. Leave switched OFF.

**4. Launch is a deliberate act.** Nothing in this pack or in the engine turns a sequence on. When the master video set is generated and the landing page exists, flip each sequence's switch yourself.

---

## Master video script (60 seconds, one recording serves every vertical)

Record ONE master. Sendr generates the per-contact versions. If the lipsync name-drop is enabled, the greeting becomes the prospect's name automatically; record it neutral either way.

**Script (about 150 words, reads at 60 seconds):**

> Hey, it's Ryan. I put together something for you: a list of hiring managers actively hiring in your niche right now. Not a directory. Every row passed three filters: a title that owns staffing decisions, a company size with real hiring pain and no internal recruiting bench, and your market. Then there's the timing layer. The system checks who's hiring this week, so the first call you make opens with the exact roles they can't fill. You're not asking if they're hiring. You're naming the openings. That list is yours either way, no strings attached. And if you like the logic, the whole machine gets installed in your name: your data, your domains, yours to keep whoever runs it. Everything's on this page, and my calendar is right below. Grab a time if you want the walkthrough.

**Recording notes:**
- One take. If you flub a line, restart the sentence and keep rolling; cut once at the end. Energy beats polish.
- Eye contact with the lens the whole way. The dynamic page does the personalizing; your job is to feel like a person.
- No numbers that can go stale: no prices, no dates, no pool counts, no "5 days". The page copy can carry specifics; the video should still be true in six months.
- Say "your niche" and "your market", never a specific vertical. That's what keeps one recording usable for staffing, SaaS, and whatever comes after.
- Plain background, phone-height camera, natural light from the front. Wear what you'd wear on the verdict call.

**Shot-by-shot, with where the dynamic variables land:**

| Time | On screen | Dynamic personalization |
|------|-----------|--------------------------|
| 0:00-0:05 | Ryan, eye contact, greeting | Lipsync name-drop swaps in {{first_name}} if enabled; page headline above the player already reads {{first_name}} |
| 0:05-0:20 | Still on Ryan: "list of hiring managers... three filters" | Page sub under the player names {{company}}; sample-list preview section below shows their vertical's rows |
| 0:20-0:40 | The timing layer beat | The page's list-preview section is the visual companion; no in-video overlay needed |
| 0:40-0:52 | Own-the-machine beat | none; keep it on your face |
| 0:52-1:00 | "calendar is right below" and point DOWN | The embedded calendar sits directly under the player, so the gesture lands on the real thing |

---

## Dynamic landing page template

Build once as a page template ("Building your first page template" in the help center), generate at scale from the sheet ("Generating pages at scale from a sheet"). Page sections in order:

**1. Headline:**

> {{first_name}}, your market, mapped.

**2. Sub:**

> I built a sample list of hiring managers actively hiring in {{company}}'s niche. The two minute video below shows how every row was picked and what you'd do with it.

**3. Video embed slot:** the personalized video from the master recording, front and center.

**4. What the sample list is (3 bullets):**

> - 25 to 40 hiring managers in your niche, one contact per company, emails verified before it reaches you
> - Every row passed three filters: a title that owns staffing decisions, 20 to 2,000 headcount, your market
> - A timing layer flags which companies are hiring this week, so your first call names the exact roles they can't fill

**5. Social proof one-liner:**

> This same system runs live outbound for a 25 year old promotional products distributor doing $3.2M gross: verified lead lists at about two cents a contact, and a qualified buyer reply from a major law firm inside the first 24 hours of sending.

**6. Embedded calendar:** cal.com/ryantydingco/30min ("Adding a calendar booking to your page" in the help center).

No pricing anywhere on the page. Page visit and video view tracking stay on inside Sendr; note viewers into `dealthreads-engine/data/sendr_views.json` during the daily reply block and the existing automation promotes them to the dial queue.

---

## Support email to Sendr

To: the support address in the app (or the help center messenger). Short on purpose.

> Subject: API read scopes on my current plan
>
> Hi team,
>
> Ryan Tydingco, ryan@dealthreads.io. Writes already work on my API key: I push rows into sheets via POST /api/v1/sheet/{id}/row daily and read campaign and sheet metadata without issues.
>
> Three read capabilities would let me automate my reporting: GET on sheet rows (currently returns 401 for my key), engagement events such as page visits and video views, and webhook delivery for those events. Are any of these available on my current plan, and if so, what scope do I need on my key?
>
> Thanks,
> Ryan

Side note from the probe: POST /api/v1/webhook exists and validates payloads (it asked for `name` and `url`), so webhook delivery may already be partly enabled; the email above will confirm what events it can carry.

---

## One-session build checklist (ordered, timed)

| # | Do | Time |
|---|----|------|
| 1 | Settings > Channels: confirm LinkedIn seat connected and healthy | 2 min |
| 2 | Delete probe row `probe-delete-me@dealthreads.invalid` from the old DealThreads sheet | 1 min |
| 3 | Import `queues/linkedin_cold_sheet.csv` as sheet `LinkedIn Cold — Staffing Owners` | 5 min |
| 4 | Import `queues/warm_wrap_sheet_seed.csv` as sheet `Warm Wrap — Positive Repliers` | 3 min |
| 5 | Paste both sheet ids into `dealthreads-engine/.env` (`SENDR_COLD_SHEET_ID`, `SENDR_WARM_SHEET_ID`) | 2 min |
| 6 | Build Campaign B `Cold Staffing Owners` from this pack, leave OFF | 15 min |
| 7 | Build Campaign A `Warm Wrap` from this pack, leave OFF | 10 min |
| 8 | Record the master video (one take rule), generate the personalized set | 30 min |
| 9 | Build the landing page template, generate pages from the cold sheet, drop the page link in as {{video_link}} destination | 20 min |
| 10 | Send the support email above | 2 min |
| 11 | Flip Campaign A on, then Campaign B | your call |

Total: about 90 minutes to launch-ready.
