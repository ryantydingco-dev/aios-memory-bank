# Gala / Nonprofit Events sequence v2 — round-1 fixes applied (round 1: buyer PASS
# 7/10, rules FAIL on three borderline items). Changes: "auction item" cut (donated
# goods, not branded merch — buyer's domain catch), item list restructured with
# parentheses, fragment openers made full sentences (E3/E4), subject moved off
# {{event_name}} (length/case uncontrollable) to the always-clean month form, load
# rule extended to ALL four tokens, send-timing rule added.
# Pending round-2 verification, then Ryan.

Campaign: "Swag — Galas & Fundraising Events Oct 2026-Feb 2027"
Merge fields: {{first_name}}, {{company_name}}, {{event_name}}, {{event_month}}.
LOAD RULES: (1) leads missing ANY of the four fields get DROPPED, not defaulted;
(2) leads enter the sequence 8-12 weeks before their event date (gala_event_map.json
has the dates) — E3's window math depends on it.
Approved facts only. Plain text, no dashes. Emails 2-4 thread as replies, no subjects.

## Email 1 (day 0) — subject: for your {{event_month}} gala

Hi {{first_name}},

Before {{event_name}}, I'd like to put {{company_name}}'s logo on a few event pieces
(volunteer shirts, table gifts, sponsor thank-yous) and send you the mockups at no
cost. I'll work from the logo on your site, so there's nothing for you to dig up.

We're a family print shop, 27 years in, and we've printed for 2,700+ organizations.
Event night has enough moving pieces; the branded ones shouldn't be on the worry list.

Want to see them?

Ryan

## Email 2 (day 3) — threads

It's easier to sign off on event merch when you're looking at your own logo on it
instead of a catalog. One reply and you'll have {{company_name}}'s pieces in your
inbox before anything gets ordered. Even if a board member or volunteer usually
handles this, worth having the options in hand to forward. Want me to put them
together?

Ryan

## Email 3 (day 7) — threads

Hi {{first_name}},

Here's the quick math on {{event_name}}: production runs about two weeks, plus
shipping. With the event in {{event_month}}, that puts the comfortable order window in
the next few weeks, and proofs come back in 24 to 48 hours.

Want the mockups so you can start the clock?

Ryan

## Email 4 (day 12) — threads

Hi {{first_name}},

This is my last note before {{event_name}}. If the event pieces are covered, have a
great night, genuinely. If they're still on the list, it takes one reply and the
mockups with your logo are in your inbox. Want me to send them?

Ryan

## Reply handling
Any interest gets a mockup per the lookbook SOP. Every reply is Ryan's queue.
