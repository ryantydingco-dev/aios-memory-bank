# Teardown Loom Script

> The ~3–4 min Loom Ryan records to deliver a free **contact-form teardown** — the give-first wedge for the AI Contact Form offer (IdeaBrowser #7856; ICP/GTM/build in `17`).
> The move: don't pitch — **run the product on them**. Ryan fills out the prospect's own contact form, the enricher (`buyer_profile_enricher.py`) turns that submission into a full buyer profile, and the Loom walks the teardown page live. The teardown IS the demo. Then: "want this on your site?"
>
> **Setup before you hit record:**
> - Webcam ON, face in the corner. Screen-share the teardown page (the `--md`/HTML output of the enricher, run on THEIR domain — see `17`).
> - Have the page open *before* recording. Have their actual contact-form confirmation (the name+email+message you submitted) visible at the top, or on a second tab.
> - **One raw take.** Slightly imperfect > polished-and-fake. You're showing a peer something cool, not delivering a pitch.
> - Personalized thumbnail: write **"[Company] — buyer profile"** on a sticky note in frame at 0:00, or have the page with their name on screen. Roughly doubles open rate; instantly signals "this isn't a blast."
>
> **Voice:** operator, peer-to-peer, GTM-leader-to-GTM-leader. Specific, revenue-focused, raw. No "unlock / revolutionize / supercharge / leverage AI / transform." No real-time-in-chat promise (async only — "before the rep calls back"). No guaranteed-revenue claims.

---

## ⚠️ [PERSONALIZE PER COMPANY] — fill these in before recording (do NOT wing it)

Every `{{bracket}}` below is a real, verified field off the teardown page you generated. The whole pitch dies if one is fake or stale. Pull these straight from the enricher output for THIS prospect:

- `{{first_name}}` — the GTM leader you're sending to (VP Sales / Head of Revenue / CRO / Head of Marketing / RevOps lead / founder). Verify the spelling + that they're the right buyer.
- `{{company}}` — their company name.
- `{{what_they_do}}` — one line, in plain words.
- `{{form_url_desc}}` — which form you filled (e.g. "your Request-a-Demo form", "the Contact Sales form").
- `{{company_size}}`, `{{funding}}`, `{{industry}}`, `{{hq}}` — only the ones the profile actually returned. Skip any that came back "unknown" (don't read a blank).
- `{{decision_makers}}` — the likely decision-makers the profile surfaced. **"verify on LinkedIn" if not confirmed** — and if you're not confident, say "names I'd verify," don't assert them.
- `{{tech_stack}}` — tech-stack hints, if any.
- `{{icp_fit_verdict}}` + `{{icp_fit_why}}` — strong/medium/weak read and the one-line reason.
- `{{rep_brief}}` — the 2–3 sentence call-prep brief the engine wrote.
- `{{data_gaps}}` — the things the profile honestly **could not** determine. **This is load-bearing — the honesty beat (3:00) runs on it. If `data_gaps` is empty, force one true gap; never fake the rest of the profile to look complete.**
- `{{drift_line}}` — OPTIONAL, only if they're a Drift refugee / Qualified-priced-out (the best beachhead): a one-liner acknowledging their conversational front door is going away. Cut entirely if it doesn't apply — a wrong timing line reads as fake.
- `{{calendar_link}}` — your real booking link in the follow-up DM (not in the video).

> Honesty discipline (from the offer's hard rules): real company only, never fabricate funding/size/people, mark anything uncertain "unknown — verify," async framing only. A wrong field here destroys the entire pitch — the teardown's whole power is that it's true.

---

## THE SCRIPT (~3–4 min)

### [0:00–0:25] — Hook (face on, page NOT yet shared)

> "Hey {{first_name}} — Ryan here. This is about three minutes, and there's no pitch in it, I promise. Instead of sending you another 'can we hop on a call' message, I did something different: I went to your site and I filled out {{form_url_desc}} myself, like a real lead would. Then I ran it through a thing I built. And I want to show you the gap between what that form handed your team… and what your rep could've actually walked into the callback knowing. Let me just show you — it's more useful than me talking about it."

*Beat note: face only here. No screen yet. The hook is the contrast you're about to draw — "what your form caught" vs "what it threw away." Say "no pitch" and mean it.*

---

### [0:25–0:55] — What the form captured (start screen-share; this is the THIN part)

> *(share screen — top of the teardown page, the 'What the form gave you' block)*
>
> "Okay — so here's me as a lead. This is everything your contact form actually captured when I hit submit. A name. An email. And whatever I typed in the message box. That's it. That's what lands in your CRM, that's what your rep sees when this lead comes in. And to be clear — that's not your form being broken, that's just what every contact form on the internet does. It catches the name and throws away the buyer."

*Beat note: let it sit on the thin three lines (name / email / message) for a second. The emptiness IS the point. Don't rush off it. Don't blame them — "every form does this."*

---

### [0:55–2:20] — What the system built from that SAME submission (the meat — slow down)

> *(scroll to 'What the buyer profile adds')*
>
> "Now here's the same submission — same name, same email — after my system enriched it. This is what got built automatically, before anyone picked up the phone.
>
> So right away: it figured out who I actually am. **{{company}}** — {{what_they_do}}. Size: {{company_size}}. Based in {{hq}}, in {{industry}}. *(scroll)* It pulled funding — {{funding}} — which for a sales rep is the single most useful number on this page, because it tells you whether this is a real-budget conversation or a tire-kicker.
>
> *(scroll — tech stack, if present)* "It even pulled tech-stack hints — {{tech_stack}} — so your rep knows what they're already running before the first call.
>
> *(scroll — decision-makers)* "And it surfaced the likely decision-makers — {{decision_makers}}. So your rep isn't calling a name@gmail and hoping; they know who actually signs.
>
> *(scroll — ICP fit)* "Then it scores the lead against your ICP — this one came back **{{icp_fit_verdict}}**, and here's *why*: {{icp_fit_why}}. So the second this hits your CRM, your rep already knows if it's the {{industry}} deal worth dropping everything for, or the one that can wait.
>
> *(scroll — the rep brief)* "And this part's my favorite — it writes the rep a call-prep brief. Not data, an actual plan: *'{{rep_brief}}'* That's the thing your rep usually spends fifte, twenty minutes Googling to build themselves. It's just… already here, before they dial."

*Beat note: this is the holy-shit stretch — go slower, scroll deliberately, let each field land. Only read fields that actually returned data; skip any "unknown." The rep brief is the climax — read it like you're handing them a gift. Keep "before the callback" framing throughout (async, not real-time).*

---

### [2:20–3:00] — The honesty beat (the trust moment — do NOT skip)

> *(scroll to the 'Still unknown' / data gaps line at the bottom)*
>
> "Now — one honest thing, and this is on purpose. Scroll to the bottom here. There's a section that says what it *couldn't* figure out: {{data_gaps}}. I leave that right on the page. Because the whole point of this is your rep trusts what's in front of them — and the fastest way to blow that is to confidently make something up. So when my system doesn't know, it says it doesn't know. No guessing on funding, no inventing a title. I'd rather hand your rep a profile that's honest about its gaps than a polished one that's quietly wrong on a sales call."

*Beat note: this is the differentiator — say it plainly, no flourish. The gaps being visible is the feature. This is the "I won't pretend to know what I don't" moment; it's what separates this from a slop tool.*

---

### [3:00–3:25] — How it actually runs (the bridge to the offer)

> "And here's the part that matters: I built this one by hand to show you. But the actual thing I install runs this on *every* inbound lead, automatically — the second someone fills out your form, this profile gets built and dropped into your CRM, so your rep opens the full picture before they ever call back. Your form keeps working exactly like it does now. It just stops throwing the buyer away. {{drift_line}}"

*Beat note: keep async — "before they call back," "the second they fill out the form" → minutes, not in-chat-seconds. Reassure: their form/flow doesn't change, the enrichment rides behind it. {{drift_line}} only if they're a Drift/Qualified refugee; otherwise delete the whole sentence.*

---

### [3:25–3:50] — The ask (soft, give-first, their-idea framing)

> "So — no hard pitch, like I said. This teardown's yours either way; I'll send the page over so you can poke at it. But if you want to see what it looks like running on every lead that hits your site — before your reps are burning twenty minutes a pop researching them — that's all I'd want fifteen minutes for. Either way, {{first_name}}, hope this was genuinely useful. Talk soon."

*Beat note: the ask is to GIVE first (the page is theirs), the meeting is the smaller, optional second thing. Frame the 15 min as "see it on YOUR leads," not "hear my pitch." Exit on generosity. Put {{calendar_link}} in the DM that carries the video, NOT in the recording.*

---

**Total: ~3:30–3:50.** Send the teardown page alongside the Loom so they can click into it themselves.

---

## The recursion line (use it on the call, not in the Loom)

When they ask "so how does this actually work?" — the answer is what you just did to them:

> "Honestly? What I just did to you is the product. I filled out your form like a real lead, my system built the whole buyer profile off that one submission, and I handed it to you before we ever talked. That's the exact thing it does to every lead that hits your site — except your rep gets it, in your CRM, before the callback. If it was useful enough to get you on this call, that's it running on one lead. Now imagine it on all of them."

The proof isn't a case study — **it's the page sitting in their own inbox, built from their own form.**

---

## Pre-record checklist (do this before you hit record)

- [ ] **Generate the teardown on THEIR real domain** (`buyer_profile_enricher.py --domain {{company}} ... --md`) and read every field — confirm nothing's fake or stale.
- [ ] **Actually fill out their form** so the "what the form captured" block is real (the name/email/message you submitted).
- [ ] **Confirm `{{first_name}}` is the right buyer** (a GTM leader who feels "leads go cold / reps waste time researching") and the right channel (LinkedIn DM usually).
- [ ] **Drop any field that came back "unknown"** — never read a blank. Make sure `{{data_gaps}}` has at least one real gap for the honesty beat.
- [ ] **Decide on `{{drift_line}}`** — include only if they're a verified Drift refugee / Qualified-priced-out. Otherwise cut the sentence.
- [ ] **Open the teardown page before recording** so the screen-share is ready and clean.
- [ ] **Personalized thumbnail** — their name/company on screen or on a sticky note at 0:00.
- [ ] **One raw take.** Specific + slightly imperfect beats polished + generic.
- [ ] **`{{calendar_link}}` goes in the DM, not the video.**

## Guardrails (so nothing backfires)

- ❌ **No fabricated fields.** Every firmographic on the page must trace to the enrichment. A wrong funding number or invented title on a sales-native buyer ends the deal. The honesty beat only works if the rest is true.
- ❌ **No real-time-in-chat promise.** Async only — "before the rep calls back." Live in-chat enrichment is v2; don't sell it.
- ❌ **No guaranteed revenue / pipeline.** You're showing what their form throws away and what the system rebuilds — not promising closed deals.
- ❌ **Don't blame their form or their team.** "Every form does this" — you're handing them an upgrade, not an indictment.
- ❌ **Don't ask for the meeting before the value lands.** The teardown is the give; the 15 min is the soft, optional second ask.
- ❌ **No AI-slop verbs** (unlock / revolutionize / supercharge / leverage / transform). Operator voice only.
- ❌ **Human reviews before send.** This is a draft talk-track; Ryan approves the recording + the personalization before anything goes out.

---

*Cross-references: offer/ICP/GTM/build in `17 - AI Contact Form — ICP, GTM, and Build.md`; the engine that generates the teardown page = `AI GTM Engine/Operations/scripts/buyer_profile_enricher.py` (its `to_md()` defines the exact page sections this Loom walks). Voice/structure precedent: `12 - Melisa Loom Script` and `08 - Signal-Triggered Cold Outreach and Loom Scripts`.*
