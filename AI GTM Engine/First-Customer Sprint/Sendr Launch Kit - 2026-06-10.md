# Sendr Launch Kit — record once, personalize for everyone

**Created:** 2026-06-10 · **Offer:** AR invoice recovery (Leak Check → $500 audit → $2K build, 3x-or-refund) · **Voice:** per `content-writer-output/profile/PROFILE.md` + judge-panel copy laws

The play: you record ONE ~90-second video. Sendr stamps out a personalized page per prospect where **their own website scrolls behind you** while you talk, with their name and firm in the headline. The link goes in LinkedIn DMs and post-call emails today, and into Smartlead when warmup finishes (~June 22).

---

## 1. The video script (~90 seconds — record this once)

Setup: webcam or phone, plain background, Sendr replaces what's behind you. Talk like a phone call, not a presentation. One take is fine; slightly imperfect beats polished.

> **(0:00)** Hey, Ryan here. That's your website behind me. I was on it just before I recorded this, which is sort of the point. You clearly do good work, and you invoice for it.
>
> **(0:12)** So here's my one question: how much of that invoiced work is sitting past due right now? Most firms your size have five figures stuck. Not bad debt. Clients who'd pay if someone asked the right way at the right time. But chasing it was nobody's actual job, so it sat.
>
> **(0:35)** Here's what I set up. The day an invoice goes past due, a reminder goes out in your voice. Quiet for three days, another one goes. Day seven it gets firmer. Day fourteen it flags you to make one phone call. Renewal invoices send themselves. You never write another "just following up" email.
>
> **(0:58)** I start with a free leak check. Fifteen minutes. You pull up your aging report, one click in QuickBooks or Xero, and I'll tell you roughly what's stuck and what automatic chasing would pull back. If the number's small, I'll say so and we're done. If it's big, I'll offer to fix it. That's the business model.
>
> **(1:20)** Button's right under this video. It puts fifteen minutes on my calendar. Either way, go get paid.

Recording notes:
- Do NOT say any firm name. The personalization comes from the page text and their website behind you. (Name-swap audio is a v2 upgrade for the TOP-150.)
- "That's your website behind me" only works if the Dynamic Video Background effect is on — step 2 below.
- No exclamation energy. Analyst briefing a VP.

---

## 2. Page template — build in the Sendr editor (~10 min)

Sendr templates can't be created by API, so this is a one-time manual build at app.sendr.io → Templates → New.

**Template name:** `AR Leak Check — cold page`

**Variables to define** (these exact tags — the automation script sends them):
| Tag | Fallback |
|---|---|
| `firstname` | there |
| `company` | your firm |

**Layout, top to bottom:**

1. **Headline:** `{{firstname}}, this one's about {{company}}'s unpaid invoices.`
2. **Subline:** `90 seconds. Your website is in the video, so you know it was actually made for you.`
3. **Video block:** upload your recording → enable **Dynamic Video Background** effect (the API fills in each prospect's site per page).
4. **Three lines under the video:**
   - The day an invoice goes past due, a reminder goes out in your voice. It escalates until someone pays, or it flags you to make one call.
   - The leak check is free: 15 minutes, your aging report on screen, one click in QuickBooks or Xero. I tell you what's stuck and what chasing would pull back.
   - If the number's small, I'll say so. If it's big, I'll offer to fix it. That's the business model.
5. **CTA button:** `Get My Free Leak Check` → **[BOOKING LINK — needs your calendar URL; mailto:ryan@dealthreads.io works as a stopgap]**
6. **Footer:** Ryan Tydingco · DealThreads · dealthreads.io

After saving, grab the template ID (it shows in the URL, or I can pull it via `GET /api/v1/page-template/list`).

---

## 3. Channel copy (page link drops in everywhere)

### LinkedIn DM — page nudge (replaces the old DM 4 "Loom nudge"; also works as the follow-up when they name a pain)
```
Made you something better than a deck. 90 seconds, your website's in the video: {page_url}
If the number's small, I'll tell you that too.
```

### TOP-150 post-call follow-up email (1:1 from your normal mailbox — fine to send today)
```
Subject: the 90 seconds I mentioned

FIRST, good talking just now. Here's the short version of what I described,
recorded for you. Your site's in it: {page_url}

The leak check is free: 15 minutes, your aging report on screen, one click in
QuickBooks or Xero. If the number's small, I'll say so and that's the end of it.

Want me to hold a slot this week?

— Ryan
```

### TOP-150 no-answer email (after the voicemail)
```
Subject: your unpaid invoices (90 seconds)

FIRST, tried you by phone. I help firms like COMPANY collect their own overdue
invoices without anyone doing the chasing. Recorded you 90 seconds on what that
looks like. Your website's in the video: {page_url}

If the free leak check shows a small number, I'll say so and we're done. Worth a look?

— Ryan
```

### Smartlead sequence (goes live when warmup completes, ~June 22)
Email 1 stays the validated question opener from the Outbound Pack (no link, it earned the Yogesh reply). The page enters at email 2:

```
Email 2 (+3 days)
Subject: made you this instead of a pitch

Hi FIRST — most firm owners I talk to have five figures sitting in overdue
invoices. Not bad debt. Nobody's chasing it, so it sits.

I recorded you 90 seconds on what automatic chasing would look like for COMPANY.
Your website's in the video: {sendr_page_url}

The leak check is free: 15 minutes, your aging report, one click in QuickBooks
or Xero. Want the number?

— Ryan
```
```
Email 3 (+4 days)
Subject: 3x or refund

Hi FIRST — the build is guaranteed: collect at least 3x the fee in 30 days or
full refund, and you keep the system. The free leak check tells us both whether
the money's there before anyone spends anything. If it's not, I'll say so.

Want me to run yours this week?

— Ryan
```
(Note: the old Email 3 "Reply 'audit'" CTA is retired — keyword-reply CTAs are banned per the judge-panel laws.)

---

## 4. The automation — `Operations/scripts/sendr_generate_pages.py`

Reads a lead CSV → generates one personalized page per row → writes the same CSV back with `sendr_page_url` added (Smartlead-ready as a custom field).

```bash
export SENDR_API_KEY="<key in Infrastructure/Sendr-API-Integration.md>"

# test batch of 5 from the TOP-150
python3 "Operations/scripts/sendr_generate_pages.py" \
  "Lead Engine/Outputs/invoice_chase_TOP_150_call_first_2026-06-08.csv" \
  "Lead Engine/Outputs/TOP150_with_pages.csv" \
  --template-id <NEW_TEMPLATE_ID> --limit 5
```

Resumable: re-running skips rows that already have a page. `--dry-run` previews without spending credits.

### Connection-gated automation for the TOP-150 (`sendr_gated_automation.py`)

Ryan's rule (2026-06-10): **no pages for TOP-150 prospects until they accept the LinkedIn connect.** The gated script owns `Lead Engine/Outputs/TOP150_tracker.csv` (150 prospects, statuses: none → invited → connected → dm1_sent → replied → nudged → leak_check_booked):

```bash
cd "Operations/scripts"
python3 sendr_gated_automation.py invited "Sean" "Bill"     # after sending invites
python3 sendr_gated_automation.py connected "McGillicuddy"  # when they accept
python3 sendr_gated_automation.py run --template-id <ID>    # pages ONLY for connected + prints DM 1s
python3 sendr_gated_automation.py nudge "Sean"              # page-link DM when they reply / go quiet
python3 sendr_gated_automation.py status                    # pipeline counts
```

Flow honors the Ryan Rules: DM 1 stays the link-free question opener; the page link is stashed in the tracker and only goes out at the nudge step. Telling Claude "Sean and Bill accepted" works too — it runs the commands for you.

Credit discipline: TOP-150 pages are gated by connection (a few credits/day). The ungated batch script is for the 1,000-list when the Smartlead lane goes live. Videos (250/mo) stay reserved for v2 name-swap on the hottest TOP-150 replies.

---

## 5. Today's run order

1. ☐ **Ryan:** start LinkedIn connects from the Outbound Pack right now — connection notes need no video. Mark them: `sendr_gated_automation.py invited ...`
2. ☐ **Ryan:** record the 90-second script as a Loom — **Camera-only mode** (Sendr puts their website behind you; a screen share would fight it). Paste the Loom link to Claude.
3. ☐ **Claude:** download the Loom MP4 + build the `AR Leak Check — cold page` template in the Sendr editor via Chrome (Ryan reviews + saves, drops in booking link).
4. ☐ **Daily loop:** accepts → `connected` → `run --template-id <ID>` generates their page + DM 1 → reply/quiet → `nudge` sends the page link.
5. ☐ **Ryan:** dials on the TOP-150 with the `call_opener` column; answered or not, the no-answer email (with page, once connected) goes same day.
6. ☐ **Claude:** when Smartlead warmup completes (~June 22), batch-generate pages for the 915-valid-email list via `sendr_generate_pages.py` and merge `sendr_page_url` into the sequence.

Engagement tracking: page views and video plays show per-template in Sendr (`GET /api/v1/page-template/list` metrics) and per-page in the dashboard. A watched video on the TOP-150 = call them that hour. Webhook push into Airtable is a v2 wire-up.
