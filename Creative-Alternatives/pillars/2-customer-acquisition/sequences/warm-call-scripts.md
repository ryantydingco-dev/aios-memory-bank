# Warm call scripts — Salesfinity, Maclaine's voice

> Companion to `../salesfinity-call-motion.md`. Three scripts for the three warm lists.
> These are NOT cold calls — every person here has done business with CA. The warmth is the wedge:
> no pitch voice, no telemarketer cadence. Maclaine reconnecting with customers, that's the whole play.
> Rules carried over from all CA copy: **no discounts, no fake urgency, never fabricate past orders.**
> If the list shows spend/year, use it. If it's blank, stay generic — don't invent "that order from 2019."

Tokens: `{{first_name}}` · `{{company}}` · `{{last_order_year}}` · `{{total_spend}}` (context for Maclaine, never said aloud) · `{{call_note}}` (on-screen in Salesfinity)

**The map, not the teleprompter.** Match their energy. One ask per call. Any real conversation → drop the script and be a human who knows their business.

---

## Script 1 — Reorder rescue (`list_1_reorder_rescue.csv`)

They ordered last year. Nothing this year. Many are camps mid-season — the order window is now or already slipping.

**Open:**
> "Hi {{first_name}}, it's Maclaine over at Creative Alternatives — we did {{company}}'s gear last year. Did I catch you at an okay time?"

**The reason (one breath):**
> "I was going through our summer orders and realized we haven't done anything for {{company}} this year — wanted to make sure that's not something slipping through the cracks on our end. Is gear for this season already handled?"

### Branches
- **"We were just about to reach out" / "yeah we need stuff"** →
  > "Perfect timing then. We've still got your logo and artwork on file, so this is fast — tell me roughly what you're thinking and I'll have a mockup and pricing to you today." → capture items/quantities/date → confirm email → done.
- **"We went with someone else this year"** →
  > "Totally fair — can I ask what moved you? [listen, don't rebut] Good to know, seriously. If anything comes up mid-season — a rush, a reorder they can't turn around — we're fast and your art's on file. I'll check in before next season either way." → log the reason verbatim in the disposition note. That answer is gold.
- **"Not sure yet / budget's tight"** →
  > "No pressure at all. When do you usually have to decide by? … I'll make a note and get you a mockup a couple weeks before so you're not scrambling." → `callback-set` with the date.
- **"Who handles this now is [someone else]"** →
  > "Great — what's the best way to reach them? I'll make it easy and send over what we did last year so they're not starting cold." → new contact name/email/phone into the note.

**Voicemail:**
> "Hi {{first_name}}, it's Maclaine at Creative Alternatives — we made {{company}}'s gear last year and I realized we haven't set anything up for this season. Your logo and artwork are on file so a reorder is quick. Call me back at [callback#] or shoot me an email and I'll have a mockup to you same day. Thanks {{first_name}}."

*(No answer + voicemail → one more dial attempt 2–3 days later at a different hour, then the B2 reorder-nudge email takes over.)*

---

## Script 2 — Win-back (`list_2_winback.csv`)

Lapsed or legacy customers. The ask is small on purpose: permission to send a fresh mockup. The mockup does the selling.

**Open:**
> "Hi {{first_name}}, it's Maclaine from Creative Alternatives — we used to make gear for {{company}}. Did I catch you at an okay time for thirty seconds?"

**The reason:**
> "Honestly, I was going through our older accounts and {{company}} jumped out — it's been a while. We've added a lot since we last worked together, and I had one of our designers put together a couple of fresh pieces with your logo just to show what's possible now. Want me to send them over?"

### Branches
- **"Sure, send it"** →
  > "Great — best email for you? … It'll be there today. Anything coming up I should design around — an event, a season, new folks starting?" → `mockup-promised`, mockup out same day.
- **"We stopped ordering because [problem]"** →
  > "I appreciate you telling me straight. [acknowledge the specific thing — don't defend] A lot has changed on our end — proofs back in 24–48 hours, we warehouse and ship on demand, and you deal with one person: me. Worth a look at the mockup, zero obligation?" → log the reason verbatim.
- **"We use someone else now"** →
  > "Makes sense — most people do after a gap. I'll send the mockup anyway so you've got a comparison point next time pricing or turnaround gets annoying. Fair?"
- **"How'd you get this number?" / cold-ish reception** →
  > "You're in our books from when we made {{company}}'s gear — I'm the founder's daughter, I run our customer side now and I'm personally reconnecting with past accounts. If it's a bad fit now, no problem at all — want me to close your file?"
- **"Don't call again"** →
  > "Understood — I'll take you off our list today. Thanks for the time." → `do-not-call`, suppress everywhere, same day.

**Voicemail:**
> "Hi {{first_name}}, Maclaine at Creative Alternatives — we made gear for {{company}} a while back. We've got fresh mockups with your logo showing what we can do now, no strings. If you'd like a look I'm at [callback#], or reply to the email that's coming your way. Good to reconnect either way."

*(Win-backs with email also sit in Sequence A of `../reactivation/reactivation-referral-sequences.md` — the call and Email 1 should land the same week; either channel can carry the mockup.)*

---

## Script 3 — Phone-only (`list_3_phone_only.csv`)

No email on file. This call has TWO jobs: reconnect, and **leave with an email address.** Without one, CA loses them the moment the call ends.

**Open + reason:**
> "Hi, is this {{first_name}}? It's Maclaine at Creative Alternatives — we've done printing for {{company}} before. Quick call: I'm updating our customer files and realized we've got no email on file for you, which means you never see any of the new stuff we can do. What's the best email — and is there anything coming up for {{company}} that needs gear?"

### Branches
- **Gives email** →
  > "Perfect. I'll send over a couple of pieces our designers mocked up with logos like yours — and if anything's coming up, tell me now and I'll make it specific to {{company}}." → email into Salesfinity + master list.
- **"What is this about?"** →
  > "Nothing fancy — {{company}}'s in our books as a past customer and you're one of the few we can only reach by phone. I'd rather send you something worth looking at than keep cold-calling you. One email and I'm out of your hair."
- **Wrong person / business changed hands** →
  > "Ah, good to know — who'd handle branded gear or printing there now?" → update the record either way; `wrong-number` if truly dead.

**Voicemail:** skip a long one — phone-only contacts get a short version:
> "Hi {{first_name}}, Maclaine at Creative Alternatives — we've printed for {{company}} before and I've got something to send you but no email on file. Call or text me at [callback#]. Thanks!"

---

## After every session (10 minutes, non-negotiable)

1. Dispositions all logged in Salesfinity (taxonomy in the playbook §5).
2. Every `mockup-promised` → mockup out **today**. Log to `data/originated-ledger.csv`.
3. New emails / contact corrections → back into the master list (note them for the next `ca_call_lists.py` run).
4. Verbatim "why we left / why we stopped ordering" quotes → drop in the session note. Feed them to `prospect-interaction-analyzer` — next month's copy is written in their words.
