# Cold call script — phone-first, Swag Handled corporate ICP

> For `outputs/coldcalls/<date>/cold_dial_list.csv` (law · financial · accounting · real estate · agency · insurance).
> Unlike `swag-handled-coldcall-script.md` (which assumes the mockup email already landed), this one works
> **stone cold** — no prior touch needed. If the lead is in an ACTIVE SmartLead campaign (law, financial),
> use the email-reference line; otherwise skip it. Voice = Maclaine: warm, direct, zero telemarketer energy.
> Rules: never fabricate (no "we work with firms like yours" name-drops unless real), no discounts, one ask per call.

Tokens: `{{first_name}}` · `{{company}}` · `{{segment}}`

**The 30-second architecture:** permission → one-line reason tied to their world → one qualifying question → shut up.

---

## The open

> "Hi, is this {{first_name}}? Hey {{first_name}}, it's Maclaine at Creative Alternatives. Look, this is a cold call — you can hang up on me, or I can have thirty seconds and then you decide. Fair?"

*(The honesty is the pattern interrupt. Most say "go ahead." If they laugh, you've already won the call.)*

**If the lead is in an active email campaign (law / financial):**
> "I actually sent you an email this week about {{company}} — this is the follow-up nobody does."

## The reason (one breath, segment-flavored)

Core line:
> "We handle branded gear for firms start to finish — client gifts, onboarding kits, event stuff — designed, warehoused, shipped when you need it. We've done it 27 years. The reason I'm calling {{company}} specifically —"

Segment flavors (pick the line, say it like a person):
- **law** — "law firms run on relationships, and most are sending clients the same box of chocolates every December. A closing gift or a retreat kit with your name on it done right is a different thing."
- **financial / accounting** — "client gifting and new-hire kits usually land on whoever's closest to the office manager, every single time, always last-minute. We take that whole thing off someone's plate."
- **real estate** — "closing gifts are your referral engine, and most agents are winging them one at a time. We systemize it — branded, personal, shipped per closing."
- **agency** — "you make brands look good all day; your own merch and client kits are the thing nobody has time for. That's literally the thing we do."
- **insurance** — "producer swag, client renewals, event giveaways — it's always somebody's side job. We make it nobody's job."

## The question (then stop talking)

> "Quick question — who owns that at {{company}}? Is it you, or someone else's headache?"

---

## Branches

- **"That's me" / "I deal with that"** →
  > "Perfect. Here's my whole pitch: give me 15 minutes and I'll show up with a free mockup of {{company}}'s stuff — your logo, real products, real pricing. If it's not better than what you've got, you've lost 15 minutes. What's better, later this week or early next?" → book it, confirm email for the invite + mockup.
- **"We already have someone for that"** →
  > "Everybody does — usually two or three vendors they're babysitting. I'm not asking you to switch today. Let me send a mockup with {{company}}'s logo so you've got a comparison point next time turnaround or pricing annoys you. Worst case it's free art. What email should I use?" → `send-info`.
- **"What does it cost?"** →
  > "The design, mockups, and account management are free — you pay for product at competitive pricing. Honestly the thing people buy from us is not having to think about this anymore. Easiest way to see it is the 15 minutes."
- **"Not interested"** →
  > "No problem — before I go, is that 'we're covered' or 'bad timing'? [if timing] When does it get real — year-end gifts, an event, a hiring wave? I'll call back then and not before." → `callback-set` with a real date, or `not-interested` and done.
- **"How did you get my number?"** →
  > "It's my job to find the right person at firms we think we can actually help — that's you. If I've got that wrong, tell me who owns swag at {{company}} and I'll leave you alone forever."
- **Wrong person / gatekeeper** →
  > "Got it — who should I be talking to about branded gear and client gifts? … Thanks. And your name? I'll tell them you pointed me the right way." → `referred-to-right-person`, log the name.
- **"Take me off your list"** →
  > "Done — today, and you won't get our emails either. Thanks for being straight with me." → `do-not-call`, suppress in Salesfinity + SmartLead same day.

---

## Voicemails

**Pass 1:**
> "Hi {{first_name}}, Maclaine at Creative Alternatives. We do branded gear for firms — client gifts, onboarding kits, events — start to finish, 27 years at it. I'd love to send you a free mockup with {{company}}'s logo on real products. I'm at [callback#] — or if I've got the wrong person, I'd take a name. Thanks {{first_name}}."

**Pass 3 (breakup):**
> "Hi {{first_name}}, Maclaine at Creative Alternatives — last one from me, promise. If branded gear ever becomes a headache at {{company}} — gifts, kits, an event — the mockup's free and I'm at [callback#]. Otherwise, consider the file closed. Good luck with everything."

*(No voicemail on pass 2 — just the dial.)*

---

## Rules of the block

- **Don't read. Talk.** The script is a map. If they're dry, be brief. If they're chatty, be chatty.
- **One ask per call** — a booked 15 minutes or the right person's name. "Send me info" only counts if you got the email and said what's coming.
- **Log the objection verbatim** in the disposition note — the exact words. That's next month's copy.
- **3 passes max per lead** (different days, different hours), then they're spent — the email cadence keeps working them.
- **Any meeting booked → mockup ready BEFORE the meeting.** Walking in with their logo already on product is the close.
