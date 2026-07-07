---
title: Runvue 3-minute walkthrough — shot-by-shot script
platform: Loom/YouTube (linked from community post)
created: 2026-06-10
author: Ryan Tydingco
status: draft — record when post is approved
---

# Pre-flight checklist (do these BEFORE hitting record)

1. Rename the "Meeting Booked — Matthew Banks (Jun 2)" deliverable to something generic (real person's name, public link).
2. Run a fresh fire drill: `cd aios-starter-kit/scripts/runvue && ../../.venv/bin/python sentinel.py --simulate` — puts a pending 🚨 incident in the queue. (Approving it on camera WILL start that campaign — tell Claude after recording and it gets re-stopped.)
3. Re-send the digest so it sits on top of your inbox: `../../.venv/bin/python generate_digest.py && ../../.venv/bin/python send_digest.py`
4. Open in tabs, in order: client portal · churn radar (`/admin/...`) · SmartLead campaigns list · Gmail (mobile in hand).
5. Browser at 110–125% zoom, dark rooms make the portal pop. Phone screen-record running for the email shot.
6. One line on a sticky note, visible to you: "I am testing whether AI agencies will pay for a portal that renews retainers."

# The script

Conversational, not read. Each row is a beat. Total ≈ 3:00.

| Time | On screen | You say (roughly) |
|---|---|---|
| 0:00 | PHONE, full frame: digest email. Thumb taps **✓ Approve**. Cut to laptop: portal confetti fires. | "That's a client approving a lead list from their inbox. One tap. The portal just threw confetti about it. Let me show you what this thing actually is." |
| 0:12 | Portal top: hero + numbers ticking up from zero, LIVE badge pulsing. | "I run cold outbound. My clients used to get a Telegram message and a folder link. Now they get this — every email, call, and meeting my engine produces, live. These are my real numbers: thirty-six thousand sends, 147 replies, 11 interested." |
| 0:32 | Click ▶ on the voice brief bar. Let YOUR cloned voice play ~8 seconds, audible. | (after it plays) "I never recorded that. It writes itself every Monday from that week's numbers and reads it in a clone of my voice. Clients get an account manager briefing without me doing account management." |
| 0:55 | Scroll to **Your AI audit** — severity pills, progress bar "1 of 6 fixed · 17%". | "The audit that sells the retainer doesn't die in a PDF. It lives here and tracks itself — every leak we found, and the live status of fixing each one. The client always knows what they're paying to fix." |
| 1:10 | Scroll through **What's next** roadmap cards. | "Next two weeks of work, already visible. This kills the 'any update?' email before it gets typed." |
| 1:18 | **Waiting on you** queue: the 🚨 incident card. Read the diagnosis line out loud. | "Now the part I like. This morning the watchdog flagged a bounce spike on this campaign — and paused it. By itself. At two in the morning, nobody awake." |
| 1:33 | Split/tab to SmartLead: campaign row shows PAUSED. Back to portal. Click **✓ Approve** on camera. Tab back to SmartLead: status flips to ACTIVE. | "Here's the campaign, paused, in SmartLead. The client clicks approve... and watch. That button doesn't update a status field. It restarts the campaign. Human in the loop on real infrastructure." |
| 2:00 | New tab: **Churn Radar**. Pan across red/amber/green rows, "$ MRR at risk" header. | "Flip side, agency-only. Every client scored for drift: portal silence, stale approvals, renewal coming up. You see the quiet quit before the cancellation email." |
| 2:15 | The green **+$1,750/mo expansion detected** counter. Open an opportunity card, click "View drafted pitch". | "And the radar has a twin that hunts in the other direction. It read my numbers overnight, found two upsells I hadn't pitched — eleven warm leads nobody's calling — and drafted the pitch email. Seventeen fifty a month, found while I slept." |
| 2:35 | Quick shot: Airtable base / terminal with sync scripts, 2 seconds each. | "Under the hood it plugs into what you already run — SmartLead, your dialer, HubSpot. Nothing migrates. Syncs twice a day." |
| 2:43 | Back to portal hero, slow scroll. | "I'm installing this for five agencies as founding pilots. A thousand setup, one-forty-nine a month, live on your stack in seven days or the setup fee comes back. Founding five vote on what gets built next." |
| 2:55 | Hold on the LIVE badge. | "Link's in the post. I'm in the comments. Go click around it — nothing's gated." |

# After recording

- Tell Claude "drill done" → the Brokerages campaign gets re-stopped and the incident card reset.
- Trim dead air, no music needed (the voice-brief clip IS the audio moment).
- Thumbnail: the radar with red+green counters visible, title "It found $1,750/mo while I slept".
- Upload, drop both links into the community post, publish. Reply to every comment in the first hour.
