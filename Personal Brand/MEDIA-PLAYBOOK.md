# LinkedIn Media Playbook

## Purpose

Use real footage and pictures to make Ryan's story tangible. The media is evidence that the work and people are real. It should not be decoration pasted onto generic copy.

The active recording setup lives in:

- `Creative-Alternatives/pillars/4-youtube-build/recording-setup-and-workflow.md`
- `claude-memory/talking-head-os.md`

This file decides what to record for LinkedIn and how it connects to the post and conversation strategy.

## Choose the format

### Talking head: conviction and interpretation

Use when the value is Ryan's opinion, story, mistake, or lesson.

Best for:

- A strong belief earned from doing the work.
- A Kenny or legacy-business story Ryan can tell with emotion.
- What Ryan changed his mind about.
- A post-mortem where the lesson matters more than the interface.

Target: one idea, usually 45 to 90 seconds. Go longer only when the story earns it.

Do not open with "Hey guys" or explain what the video will cover. Start with the strongest sentence.

Talking-head beats:

1. Cold open: tension, admission, or surprising fact.
2. Scene: what happened and who was involved.
3. Stakes: why the business cared.
4. Ryan's take: what most people misunderstand.
5. Proof or consequence.
6. One conversational closing question, if the post needs one.

### Tutorial or screen demo: proof and competence

Use when seeing the workflow is more valuable than hearing Ryan describe it.

Best for:

- Before and after workflows.
- An automation running inside the real business.
- A prompt, report, Slack message, spreadsheet, or approval queue.
- "What broke" and the exact fix.

Target: usually 60 to 150 seconds for LinkedIn. Show the outcome in the first few seconds, then explain how it works.

Tutorial beats:

1. Result first: show the useful output.
2. Old way: one sentence on the manual problem.
3. Walkthrough: only the three to five steps that matter.
4. Human gate: show what still requires judgment or approval.
5. Failure: show what broke or what the automation cannot do.
6. Buyer mirror: name the kind of workflow where this would help.

Never expose customer names, contact details, financial records, API keys, private prompts, or other sensitive data. Prepare a redacted or sample environment before recording.

### Real photo: humanity and memory

Use when one image carries the story better than a demonstration.

Best for:

- Kenny, Maclaine, the shop, a delivery, a whiteboard, an old process, or a real artifact.
- Personal coaching and fitness stories.
- Milestones, mistakes, and behind-the-scenes moments.
- Promotional products in context, not sterile catalog shots.

The caption supplies the narrative. Do not force a business lesson onto every personal picture.

### Screenshot or document: specific proof

Use when the asset itself is the interesting part: a redacted Slack output, workflow map, checklist, or result. Add annotations only when they help someone understand it quickly.

## Media is not the post

Do not paste a transcript as the LinkedIn caption. The caption should provide context and give someone a reason to watch.

Ryan's spoken take remains the source. Clean the transcript lightly, but do not rewrite it into creator-speak, add a lesson he did not make, or manufacture a sharper opinion for the hook. If the opening is weak, find the strongest sentence Ryan actually said.

Video caption structure:

1. One or two lines of tension.
2. Why Ryan recorded this.
3. One detail not obvious from the video.
4. Optional conversation question.

Example:

> We had $425K in overdue invoices and a workflow that depended on someone remembering who to chase.
>
> I recorded the system we built to put the five highest-priority accounts in front of Kenny every morning.
>
> The first version failed because I tried to automate the login instead of removing it.

## Social-selling assignment

Every media post gets one audience lane and one intended commercial destination.

- Legacy-business story: earn trust with operators. No offer required.
- Automation tutorial: create recognition of a workflow problem. Invite comparison only after engagement.
- CA story: demonstrate judgment around events, merchandise, deadlines, or fulfillment. Do not add an automation pitch.
- Personal story: build familiarity and values. Do not bolt on a business CTA unless it naturally belongs.

Never try to sell CA and automation in the same post.

## Weekly media rhythm

A sustainable starting rhythm:

- One talking-head video.
- One tutorial or screen demo.
- One real-photo story.
- One text-first post with an optional screenshot or artifact.

Batch the two videos in one recording block, but keep the delivery conversational. Capture photos and short clips while the work is happening instead of staging everything later.

## Capture loop

During the week, save:

- A sentence Kenny or a customer-safe teammate said.
- A picture of the real environment or artifact.
- A before-state screenshot.
- The useful output after the build.
- The moment something failed.
- One verified number that explains the stakes or result.

At the end of the week, each completed build should yield at least one of: a story, tutorial, screenshot, lesson, or buyer question.

## Production rules

- Record a clean master so it can be reframed for LinkedIn and other platforms.
- Talking head: eye-level camera, clean voice, readable captions, simple background.
- Tutorial: make interface text readable; use zooms or crops instead of showing an entire unreadable desktop.
- Use the Sony and RODE setup already documented. Phone footage is acceptable when immediacy makes the story better.
- Real environments beat fake studio polish for this brand.
- Remove dead air and true mistakes, but keep natural cadence and personality.
- No commercial music baked into the master.
- Polish the real footage before considering generated B-roll or effects.

## Assistant output format

When Ryan says `media post: [idea]`, return:

1. Recommended format and why.
2. Audience lane and commercial destination.
3. Cold open.
4. Bullet beat sheet, not a word-for-word script unless requested.
5. Shot or screen-capture list.
6. Privacy and fact checks.
7. LinkedIn caption with two alternate hooks.
8. The next DM only if someone engages or asks a relevant question.

When Ryan says `tutorial: [workflow]`, also return the exact result-first demo order and redaction checklist.

Beat sheets organize Ryan's existing thoughts. They do not supply opinions or talking points he has not given.
