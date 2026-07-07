# Olaxa → Sendr Broker Campaign , Script + Page Copy

**Built:** 2026-06-22 · **Ported from:** Oloxa engine Loom v3.4 · **Offer + Eugene proof confirmed by Ryan**

The Loom strategy, rebuilt in Sendr. You record **one** video; the **page** does the personalization.

---

## Credit-smart approach (read first)

Two tiers in Sendr:
- **Default (all 283):** ONE generic video on a **personalized page** , {firstname}/{company} in the copy, their website playing behind the video. Cheap (uses page credits, not video credits). Scales to everyone.
- **Optional upgrade (top tier only):** Sendr's voice-swapped per-prospect VIDEO (name spoken in your cloned voice). Costs a video credit each , the doc reserves these for a top ~150. Skip for v1.

So: the spoken video stays generic (no name/title/pain spoken); all per-prospect tailoring lives on the page.

---

## 1) The video script , record ONCE (~90 sec)

*Webcam corner. The page plays this over each broker's own website, so look natural and talk to one person.*

### Section 1 , Offer (~30s)
> Hey , [YOUR NAME] here. Thanks for connecting the other day, wanted to make you a quick free offer.
>
> If paperwork's eating your week, and you'd rather put that time back into closing deals , stick with me for sixty seconds.
>
> What I do is the one thing your CRM can't: the documents. Your CRM tracks the deal, but it can't read the files a client sends, name them, file them, or chase the client for what's missing. My system plugs in and does exactly that. You open the case and the documents are already filed and named, with the chase running in the background. It's the document engine your CRM is missing. Up and running in 14 days, no setup fee, so you only pay once you've actually seen it work for you.

### Section 2 , Proof (~25s)
> Quick example. This is Eugene. He's a commercial debt advisor over here in Berlin. He was burning six or seven hours per deal chasing documents. Got it set up for him in two weeks, didn't charge him for the setup, and now he's putting that time back into actually closing new deals.

### Section 3 , CTA (~20s)
> At the moment, I can only take on two more commercial finance brokers this month , that's all I can handle properly.
>
> So if you're curious how this would look for your firm specifically, grab a quick fifteen minutes right here on the page , no pressure, I'd just love to learn about your business. Cheers!

**Locked verbatim (do not paraphrase):** Section 1 paragraph 3 (the "document engine your CRM is missing" pitch) and Section 2 (Eugene). Greeting is always "Hey." No industry abbreviations spoken.

**What changed from the engine Loom (deliberate, because it's one generic take):**
- Opener drops the spoken `[NAME]`/`[TITLE]`/`[COMPANY]` , those move to the page.
- `[PAIN]`/`[OUTCOME]` generalized to "paperwork eating your week / put that time back into closing deals" , the per-prospect version lives in the page headline.
- CTA: engine's "drop me a thumbs up" → "grab fifteen minutes on the page," because the calendar is right there. (A/B-able later.)

---

## 2) The Sendr page copy (personalized per prospect)

- **Headline:** `{firstname}, here's how {company} gets its week back from deal docs.`
- **Subhead:** `90 seconds on the document engine your CRM is missing , built for commercial finance brokers.`
- **[VIDEO]** , your one-take video, `{company}` website playing behind it.
- **Body (the spoken pain/outcome, now as text):**
  > No more burning half your week chasing client documents. My system reads every file a client sends, names it, files it under the right deal, and chases the client for what's missing , in the background. You open the case and it's done. You're back to closing, not collating.
- **Proof strip:** `Eugene, a commercial debt advisor in Berlin, got 6–7 hours per deal back. Live in 14 days. No setup fee , you only pay once you've seen it work.`
- **CTA button:** `Grab 15 minutes →` (opens your booking calendar, embedded on the page)
- **Scarcity (near button):** `Taking on two more brokers this month.`

Page variables to map: `firstname` (fallback "there"), `company` (fallback "your firm"). Their website → the dynamic video background.

---

## 3) The LinkedIn cover DM (the campaign step that delivers the page)

> Hey {firstname}!! Just circling back , made you a quick 90-second video on how to get your week back from deal docs without the chase 😊 here it is: {page_url}

*(Ported from the engine's Stage I cover DM; "loom" → "video," page link instead of Loom link.)*

---

## Funnel mapping , Sendr campaign 8258

| # | Engine step | Sendr step |
|---|-------------|------------|
| 1 | Connection request | LinkedIn connect (LIVE) |
| 2 | 2-day warming | ~2-day delay |
| 3 | **Stage I , Loom** | **Stage I DM: cover message + their page** (the swap) |
| 4 | Stage I F1 (+24h) | DM: `Lemme know if you're curious {firstname}` |
| 5 | Stage I F2 (+24h, pure nudge) | DM: `Just circling back on this {firstname} ☝️` |
| 6 | Stage III Calendly | Booking happens on the page calendar (tracked in Sendr + Airtable) |

Follow-up scripts pulled from `data/voice/follow-up-script-bank-icp.md` (rotate, never repeat on the same prospect).

---

## Build order (after Ryan records the video)
1. Ryan records the ~90-sec video → uploads to Sendr.
2. Build the page template (video + copy above + calendar embed).
3. `sendr_generate_pages.py` → 283 personalized pages (name, firm, their site behind the video) → page URLs + GIFs.
4. Add Stage I DM + F1 + F2 steps to campaign 8258.
5. Engagement webhook → Airtable hot-lead alert.
