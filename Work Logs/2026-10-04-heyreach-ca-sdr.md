# HeyReach CA SDR pass — 2026-10-04

Status: **draft for Ryan's approval. Nothing was sent, created, or changed in HeyReach.** Every call this session was a read.

## 1. Workspace check

`HEYREACH_CA_API_KEY` reaches the CA workspace. LinkedIn senders:

| ID | Sender | Sales Nav | Auth |
|---|---|---|---|
| 243906 | Maclaine "Mickey" Scher (mickeyscher@gmail.com) | Yes | Valid |
| 243832 | Kenny Scher (kenny@creativealternatives.com) | No | Valid |
| 243574 | Ryan Tydingco | Yes | Valid |

The same workspace also holds the SCI campaign on Ryan's account. Only its sequence structure was read. No SCI lead data was used for CA.

**Env fix needed:** the environment variable was saved with the key in its *name* (`HEYREACH_CA_API_KEY<key>`) and an empty value. The key's trailing `=` was taken as the separator. Re-save it as `HEYREACH_CA_API_KEY=<key ending in =>` in the environment settings.

## 2. SCI open-profile InMail setup (campaign 616837, the pattern to copy)

```
CHECK_IS_OPEN_PROFILE
├─ open  → wait 3h → INMAIL (subject + body, fallback without variables) → END
└─ closed → wait 3h → CONNECTION_REQUEST with note (withdraw after 21d)
            ├─ accepted → wait 3h → MESSAGE (same body as the InMail)
            │              └─ no reply → wait 2d → MESSAGE "should I close this, or does someone else own X? A name is enough." → END
            └─ not accepted → END
```

Settings: all exclusions ON, both lead **and** company blacklists included (`excludeFromLeadBlacklist`, `excludeFromCompanyBlacklist` = true).

Results so far (Sep 23 – Oct 4): 117 contacted, 43 InMails started, 1 reply (2.3%); connection acceptance 8% (6/74). The InMail branch is unproven on a small sample. It is mostly free reach to open profiles.

Variables: SCI uses `{{firstName}}` / `{{companyName}}`. CA uses `{FIRST_NAME}`. Both rendered correctly in sent messages (0 literal braces found).

## 3. Kenny audit

| Campaign | Status | Result |
|---|---|---|
| 595039 Racquet Apparel / New | In progress (45 in flight) | 100 requests, 15% accepted, 4/13 replied |
| 595038 Racquet Apparel / Connected | Finished | 5/23 replied |
| 577125 Free Online Store / Racquet Clubs | Paused, 123 pending | Connection request only, **no message steps**. 35 accepted connections never got a message from this campaign |
| 591534 Internal acceptance test | Finished | Test only |

### Act now (customer-facing replies are drafts for approval)

1. **Chris Post, Director of Racquets, Southward Ho CC.** Replied 9/17: *"Yes I'm the point person for that."* **No response for 17 days.** Hottest lead in the account. Draft for Kenny:
   > Thanks, Chris. Easiest next step: I'll mock up a free online store for your racquets program so members order gear directly and you hold no inventory. It can be live in about 2 days. Want me to send the mockup?
2. **Fred Shlesinger.** Replied 9/24: *"Please stop !!!"* Add him to the HeyReach lead blacklist. Also note that Kenny's campaigns have `excludeFromLeadBlacklist = false`, so the blacklist is not honored there today. Turn it on for 595039 and 577125.
3. **Josh Bates, Village Health Clubs.** Said "yes, let's take a look," got the store mockup 9/13, and has heard nothing since. Draft nudge:
   > Josh, did the store mockup land OK? Happy to swap in different items or logo treatments before you show anyone.
4. **Mark Lewis (Middlebury squash) referral, David Zhao.** Kenny gave his number 9/15. `[CONFIRM]` whether David called. If not, Kenny should reach out.

### Fix in setup

5. **Double-messaging.** Kai Husemann, Michael (Dallas CC) and Nancy Ruppert got the manual "free branded club store" pitch, then the automated Connected sequence 2–3 days later. Cause: 595038 had `excludeContactedFromSenderInOtherCampaign = false`. Copy SCI's exclusion settings on every CA campaign.
6. **List quality.** Non-buyers are in the racquet list (Nancy Ruppert, a growth exec; Alec, a hospitality exec; Max Bonte, a startup founder). Run the next upload through the Fit Review Hold list (931845) before it goes live.
7. **577125.** Either archive it, or move its accepted connections into a messaging campaign. Right now they're dead ends.
8. **No Sales Nav on Kenny,** so he can't run the open-profile InMail branch. That's one more reason the camp batch goes out from Mickey's account.

## 4. Camp-director batch from Mickey's account (draft)

### Proposed campaign: `CA | Camp Gear | Maclaine | 10-xx`

- Sender: 243906 (Maclaine, Sales Nav).
- Sequence: the SCI tree above, with copy swapped. Mickey's current connection acceptance is 6.4% (595041), so the open-profile InMail branch carries more weight here than it did for Kenny.
- Settings: all exclusions ON, lead and company blacklists ON, exclude list = Fit Review Hold | Maclaine (931846).
- Suppress existing customers: **Harbor Haven** and **Camp Arcadia** (see `claude-memory/harbor-haven-camp-arcadia.md`). Never name them in copy.

### Copy drafts (CA variable syntax)

**InMail** (open profiles). Subject: `next summer's camp shirts`
> Hi {FIRST_NAME}, Maclaine here from Creative Alternatives. We make staff and camper shirts for camps, and I'm reaching out in the off-season so next summer's gear isn't a June scramble.
>
> Who handles shirts and merch for your camp, you or someone else?
>
> If it's you, I can mock up a free online store where parents order camp gear directly, so nobody at camp is collecting orders. It can be ready in about 2 days. Reply and I'll send it.
>
> Maclaine

Fallback (no variables): the same text, starting "Hi, Maclaine here…".

**Connection note** (closed profiles):
> Hi {FIRST_NAME}, Maclaine at Creative Alternatives. We do staff and camper shirts and parent-order online stores for camps. Would be glad to connect.

**Message 1** (3h after accept): the InMail body.

**Message 2** (2d later, no reply):
> {FIRST_NAME}, should I close this out, or does someone else handle camp shirts and merch? A name is enough.

Public facts used: store ready in about 2 days (`claude-memory/school-store-economics.md`, marked safe to state publicly). No prices, client names, or volume claims.

### Lead batch: blocked on a credit approval

Vibe Prospecting search: title "camp director", prospect based in NY/NJ/CT. **190 matches.** The preview is masked. Exporting 60 rows with LinkedIn URLs costs **60 Explorium credits** (balance is sufficient).

Quality warning from the 5-row preview: 2 of 5 were wrong (a "camp director" mapped to Northwestern Mutual, and an IBM "boot camp coordinator"). The other three were an assistant director at a YMCA, a Hofstra camp director and a Scouting America camp director. Plan: export 60, keep only directors/owners/assistant directors at actual camps (day, sleepaway, YMCA/JCC, municipal), drop customers, dedupe against all CA HeyReach lists, and land about 25.

Free alternative: Mickey runs a Sales Navigator search (Camp director / Owner, NY+NJ+CT, industry Recreational Facilities) and imports it to HeyReach. The open-profile check then runs automatically.

## Context conflict to resolve

`claude-memory/creative-alternatives-aios.md` (June) says "HeyReach OUT → Sendr", and the README lists "human LinkedIn DMs" as the LinkedIn channel. HeyReach has clearly been the live CA LinkedIn tool since Aug 31. Ryan to confirm, then update those docs.
