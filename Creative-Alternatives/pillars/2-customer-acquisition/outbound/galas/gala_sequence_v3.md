# Gala / Nonprofit Events sequence v3 — FINAL, Ryan approved 2026-08-11 ("do all six")
# Round-2 survivors resolved:
#  - E2 rebuilt as ONE angle (forward-to-committee) in full sentences. The rules lens
#    failed it for stacking two ideas + a fragment; the buyer lens wanted an
#    incumbent-vendor clause added. Per Ryan's recommended option the incumbent line is
#    SKIPPED here (many nonprofits have no standing print vendor) and E2 leads with the
#    forwarding angle, which the buyer called the most likely positive outcome.
#  - "genuinely" cut from E4.
#  - "at no cost" removed for consistency with the other lanes.

Campaign: to build after drain. 544 contacts in email-finding.
Merge fields: {{first_name}}, {{company_name}}, {{event_name}}, {{event_month}}.
LOAD RULES: (1) drop leads missing ANY of the four fields; (2) leads enter 8-12 weeks
before their event date (dates in gala_event_map.json); (3) normalize event_name casing.
Approved facts only. Plain text, no dashes. Emails 2-4 thread as replies.

## Email 1 (day 0) — subject: for your {{event_month}} gala

Hi {{first_name}},

Before {{event_name}}, I'd like to put {{company_name}}'s logo on a few event pieces
(volunteer shirts, table gifts, sponsor thank-yous) and send you the mockups. I'll work
from the logo on your site, so there's nothing for you to dig up.

We're a family print shop, 27 years in, and we've printed for 2,700+ organizations.
Event night has enough moving pieces; the branded ones shouldn't be on the worry list.

Want to see them?

Ryan

## Email 2 (day 3) — threads

If event merch usually lands with a board member or the volunteer committee, these are
easy to forward. One reply and you'll have {{company_name}}'s pieces in your inbox,
ready to pass along to whoever actually makes the call. Want me to put them together?

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
great night. If they're still on the list, it takes one reply and the mockups with your
logo are in your inbox. Want me to send them?

Ryan

## Reply handling
Any interest gets a mockup per the lookbook SOP. Every reply is Ryan's queue.
