# Sendr Dynamic Media Teardown - Personalized Video and Audio at Scale

Source: https://www.youtube.com/watch?v=-KBNooN81sM
Created: 2026-06-03

## Big idea

This video shows how Sendr makes a single recorded video/audio dynamic by replacing a spoken name like "John" with a first-name variable, then using either dynamic audio or lip sync to personalize that video for each row in a lead table.

For Ryan: this is useful for top/warm prospects, but it can easily become creepy or gimmicky if used as the first touch to cold mortgage brokers. Use it as a proof/attention layer after interest or for the highest-value accounts.

## What the video shows

1. Add a dynamic media section to a Sendr template:
   - dynamic header
   - full-screen video
2. Record or upload a video/audio.
3. In the video, say a common placeholder name like "John."
4. Use Sendr magic to transcribe the audio.
5. Select the spoken placeholder name and map it to the `first_name` variable.
6. Choose:
   - dynamic audio: changes audio only
   - lip sync: adjusts mouth movement for full-screen/person-visible videos
7. Save template.
8. Later connect the template to a table so every lead gets personalized video/audio.

## Dynamic audio vs lip sync

### Dynamic audio

Best when:

- video is mostly screen share
- Ryan is not visible close-up
- dynamic background is doing most of the personalization
- lip-sync quality does not matter

### Lip sync

Best when:

- Ryan is visible full-screen
- personalization starts with "Hey {{first_name}}"
- the face/mouth movement matters

## What this means for AIOS Quickstart

A Sendr video could say:

"Hey John — quick one. I made this for American Home Lending USA because mortgage teams usually have the same three admin leaks: missing-doc follow-ups, daily pipeline visibility, and stale borrower/realtor nudges."

Mapped variables:

- first_name
- company_name
- routine_1
- routine_2
- routine_3

But do not overdo the fake personal feel. The real personalization should be the company-specific routine plan, not just saying their name with AI lips.

## Recommended use in Ryan's stack

### Do not use for every cold lead immediately

Cold first-touch personalized lip-sync videos can feel gimmicky, and links/media can hurt deliverability.

### Use for:

- top 25 highest-fit prospects
- positive replies
- "send info" replies
- LinkedIn conversations
- page viewers who did not book
- prospects Ryan is about to call with Salesfinity

## Best workflow

1. Smartlead sends plain-text Email 1 with no link.
2. Prospect replies yes/maybe/send info OR is a top target.
3. Sendr generates personalized page/video.
4. Ryan sends:

"Made the quick version for {{company_name}} here — shows the 3 approval-only routines I’d start with."

5. Salesfinity calls same day:

"Hey {{first_name}}, Ryan here — I sent over the quick AIOS plan for {{company_name}}. Wanted to see if borrower doc follow-up, pipeline visibility, or stale realtor/borrower follow-ups are actually eating time for your team. Worth a quick 15 this week?"

## Suggested video script

Keep it short, under 30 seconds:

"Hey John — Ryan here. I put together a quick AIOS plan for American Home Lending USA.

For version one, I’d keep it simple: missing-doc follow-up drafts, a daily pipeline brief, and a stale borrower/realtor follow-up queue.

Everything stays approval-only, and no sensitive borrower files are needed.

If that’s remotely useful, we can walk through it in 15 minutes."

Variables:

- John → first_name
- American Home Lending USA → company_name

## Caution

Personalized AI lip sync is an attention tool, not a sales strategy. If the underlying offer is vague, the video just becomes a fancier way to be ignored.

Also, with mortgage brokers, avoid making the first interaction feel like an AI deepfake magic trick. These people handle regulated financial workflows. Trust matters.

## One-line lesson

Sendr dynamic media can personalize one video at scale, but for Ryan it should be used to increase trust and specificity on warm/top prospects — not as a gimmicky cold first touch to everyone.
