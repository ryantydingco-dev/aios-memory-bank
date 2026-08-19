# v3.7 — single source of truth. Emits vault md + SmartLead payloads.
RYAN_SIG = ["Ryan Tydingco", "Head of Sales and Marketing, Creative Alternatives", "creativealternatives.com"]
MAC_SIG  = ["Maclaine Scher", "Vice President, Creative Alternatives", "creativealternatives.com"]

# each email: list of paragraphs (strings). Signature handled separately.
COPY = {
"3812874": {"name":"AthleticDirectors","sender":"ryan","emails":[
 {"subject":"{{school_name}} store page","sig":"full","paras":[
  "Hi {{first_name}},",
  "I'd like to build {{school_name}} a spirit-wear store: every team on one link, your logo on the hoodies and tees. Parents order on the page and we print and ship each order to their house. Nobody in your office collects sizes or stores boxes.",
  "We run stores like this today for HSMSE, the High School of American Studies, and four other schools. Your program gets a flat $10 on every hoodie sold.",
  "Want me to build the {{school_name}} page?"]},
 {"subject":"","sig":"first","paras":[
  "The page runs itself. A parent picks the hoodie, pays on the page, and we handle that single order start to finish. Your staff never takes sizes, chases payments, or stores inventory in the cage. And the $10 per hoodie adds up quietly all year, it's not a one-weekend fundraiser.",
  "Worth a look?"]},
 {"subject":"","sig":"first","paras":[
  "Hi {{first_name}},",
  "Fall season is the window. A store that goes live now covers this season, then winter and spring without anyone setting up a new shop each time. If a booster already runs a page for one team, this sits next to it for everyone else.",
  "Want the {{school_name}} page while rosters are still fresh?"]},
 {"subject":"","sig":"full","paras":[
  "Hi {{first_name}},",
  "Last note from me. If spirit wear is handled at {{school_name}}, I'll leave you to the season. If it's still a pile in your office every August, one reply and I'll build the page with your logo already on the gear.",
  "Want it?"]}]},

"3787454": {"name":"Galas","sender":"ryan","emails":[
 {"subject":"merch for {{event_name}}","sig":"full","paras":[
  "Hi {{first_name}},",
  "Before {{event_name}}, two pieces earn their spot: a volunteer shirt people can find each other in, and a table gift guests take home on purpose. I'll put {{company_name}}'s logo on both and send you the mockups, pulled from the logo on your site.",
  "We've printed for 2,700+ organizations over 27 years.",
  "Want to see them?"]},
 {"subject":"","sig":"first","paras":[
  "If a board member or the volunteer chair signs off on this, the mockups turn it into a thirty second decision. They see {{company_name}}'s logo on the actual shirt and the actual gift instead of imagining it from a product page.",
  "One reply and both are in your inbox.",
  "Ryan"]},
 {"subject":"","sig":"first","paras":[
  "Hi {{first_name}},",
  "{{event_name}} is in {{event_month}}. Proofs come back in 24 to 48 hours and production runs about two weeks, so this is the window where you can see the pieces, change your mind, and still order comfortably.",
  "Want the mockups while the calendar is on your side?"]},
 {"subject":"","sig":"full","paras":[
  "Hi {{first_name}},",
  "Last note before {{event_name}}. If the branded pieces are covered, have a great night. If not, one reply and the volunteer shirt and table gift mockups are in your inbox, your logo already on them. We've shipped 75,000+ orders, and event night is what most of them were for.",
  "Want me to send them?"]}]},

"3787452": {"name":"LawFirmAdmins","sender":"ryan","emails":[
 {"subject":"quarter-zip for {{company_name}}","sig":"full","paras":[
  "Hi {{first_name}},",
  "Retreat season means someone at {{company_name}} gets handed the gear question. I'll put the firm's logo on a quarter-zip and a welcome kit (quarter-zip, notebook, tumbler) and send you mockups of both. A Michigan law firm's retreat gear is with us this fall.",
  "We've printed for teams at Thermo Fisher and Trinity Health.",
  "Want to see them?"]},
 {"subject":"","sig":"first","paras":[
  "Walking retreat gear into a partner meeting is easier when the pieces already carry {{company_name}}'s logo. Nobody squints at a catalog and imagines the embroidery. They say yes or no to the actual kit.",
  "Reply and I'll put both together this week.",
  "Ryan"]},
 {"subject":"","sig":"first","paras":[
  "Hi {{first_name}},",
  "If the retreat is this fall, the branded side is the piece that usually goes late. It sits behind rooms and food until someone asks what people walk into. Proofs take 24 to 48 hours and production about two weeks, so seeing the kit now keeps it off the panic list.",
  "Want the mockups this week?"]},
 {"subject":"","sig":"full","paras":[
  "Hi {{first_name}},",
  "Last note from me. If retreat gear is handled at {{company_name}}, all good. If it's on the someday list, one reply puts the quarter-zip and kit mockups in your inbox, logo already placed, sized list and pricing ready whenever you want them.",
  "Want me to send them?"]}]},

"3787448": {"name":"Q4Gifting","sender":"ryan","emails":[
 {"subject":"{{company_name}} gift mockups","sig":"full","paras":[
  "Hi {{first_name}},",
  "Holiday gifting at {{company_name}} usually means someone guessing what won't embarrass the company. I'll put your logo on three gift pieces at three price points and send the mockups, pulled from the logo on your site, so there's nothing to dig up.",
  "27 years in, 75,000+ orders shipped.",
  "Want the mockups?"]},
 {"subject":"","sig":"first","paras":[
  "What lands in your inbox: three mockups, your logo placed the way it prints, and a note on which piece still looks good after a year on a desk. If one is wrong, I'll swap it in the mockup. That's the point of looking early.",
  "Worth a look?",
  "Ryan"]},
 {"subject":"","sig":"first","paras":[
  "Hi {{first_name}},",
  "Picking a gift before October is the difference between a decision and a December fire drill. Art comes back as a proof within two days and pieces ship about two weeks after you approve it, so an early choice means the holidays stay quiet.",
  "Want the three while there's runway?"]},
 {"subject":"","sig":"full","paras":[
  "Hi {{first_name}},",
  "Last note from me. If gifts are sorted at {{company_name}}, enjoy the quiet December. If not, one reply and the three mockups are in your inbox: three pieces, three price points, your logo placed. We've printed for teams at Thermo Fisher and Trinity Health.",
  "Want me to send them?"]}]},

"3786125": {"name":"RaceSeason","sender":"maclaine","emails":[
 {"subject":"shirts for {{race_name}}","sig":"full","paras":[
  "Hi {{first_name}},",
  "Before you lock shirts for {{race_name}}, I'll pull the logo from your race page, put it on the finisher shirt, and send you the mockups. The finisher shirt is the one piece that can outlive the weekend, if it doesn't look like every other 5K in the county.",
  "We've shipped 75,000+ orders over 27 years.",
  "Want them?"]},
 {"subject":"","sig":"first","paras":[
  "A shirt is easier to judge with {{race_name}}'s logo on it than on a blank template. You'll see whether the placement actually holds up, which you can't tell from a catalog. I'll mock two shirt options, both with your logo.",
  "Want the two options?",
  "Maclaine"]},
 {"subject":"","sig":"first","paras":[
  "Hi {{first_name}},",
  "{{race_name}} is in {{race_month}}. A proof lands in 24 to 48 hours and shirts take about two weeks plus shipping, so the comfortable window is now. Even if last year's printer is in the mix, seeing your logo on the shirts costs one reply.",
  "Want to see them?"]},
 {"subject":"","sig":"full","paras":[
  "Hi {{first_name}},",
  "Last note before {{race_name}}. If shirts are handled, good luck on race day. If they're still open, one reply and the mockups with your race logo are in your inbox, two options, ready to judge in a minute.",
  "Want me to send them?"]}]},

"3777819": {"name":"TradeShow","sender":"ryan","emails":[
 {"subject":"tote for {{show_name}}","sig":"full","paras":[
  "Hi {{first_name}},",
  "Most giveaways at {{show_name}} die at the hotel. The tote is the one with a real shot at the flight home, so that's what I'd mock first, plus a badge holder, {{company_name}}'s logo on both, pulled from the logo on your site.",
  "We've printed for 2,700+ organizations over 27 years.",
  "Want to see {{company_name}} on both?"]},
 {"subject":"","sig":"first","paras":[
  "Booth pieces are easier to pick when {{company_name}} is already on them. You'll see whether the tote feels like your brand or like the pile every other booth hands out. If a vendor is already in the mix, looking costs nothing.",
  "Say the word and I'll send both.",
  "Ryan"]},
 {"subject":"","sig":"first","paras":[
  "Hi {{first_name}},",
  "{{show_name}} is close enough to plan the table and far enough to order on a normal schedule. Proof in two days, production about two weeks, plus freight to the venue. That math is why I'm writing now instead of three weeks before doors open.",
  "Want the mockups this week?"]},
 {"subject":"","sig":"full","paras":[
  "Hi {{first_name}},",
  "Last note before {{show_name}}. If booth pieces are covered, good luck at the show. If anything is still open, one reply and both mockups are in your inbox, your logo already placed, quantities whenever you're ready.",
  "Want me to send them?"]}]},

"3580723": {"name":"LawNational","sender":"maclaine","ab":True,"emails":[
 {"subject":"{{company_name}} retreat kit","sig":"full","variant":"A","paras":[
  "Hi {{first_name}},",
  "If {{company_name}} has a retreat this fall, the branded side usually lands on whoever reads this email. I'll mock the three pieces people actually take home, a quarter-zip, a room-drop kit, and a closing-dinner gift, with the firm's logo pulled from your site.",
  "A Michigan law firm's retreat gear is with us this fall.",
  "Want the three?"]},
 {"subject":"{{company_name}} retreat kit","sig":"full","variant":"B","paras":[
  "Hi {{first_name}},",
  "A Michigan law firm's retreat gear is with us this fall. If {{company_name}}'s retreat is on the calendar, I'll mock three pieces with your firm's logo so you see them before anyone asks: a quarter-zip, a room-drop kit, and a closing-dinner gift.",
  "We've printed for 2,700+ organizations over 27 years.",
  "Want the three?"]},
 {"subject":"","sig":"first","paras":[
  "Still on the retreat kit. The three mockups are the whole follow-up: quarter-zip, room-drop kit, closing-dinner gift, each with {{company_name}}'s logo placed the way it embroiders. You can tell me the quarter-zip is right and the kit is wrong, which is a better conversation than whether to do gifts at all.",
  "Want them?",
  "Maclaine"]},
 {"subject":"","sig":"first","paras":[
  "Hi {{first_name}},",
  "If the retreat date is locked, gear is the last thing anyone owns until a partner asks about it in a hallway. A proof comes back inside two days and production is about two weeks, so fall retreats need art moving soon.",
  "Want the three so the hallway question has an answer?"]},
 {"subject":"","sig":"full","paras":[
  "Hi {{first_name}},",
  "I'll close the loop so I'm not filling your inbox. One reply and I'll have the three in it: quarter-zip, room-drop, closing piece, your firm's logo on each. If the timing is wrong this year, no hard feelings, the offer keeps.",
  ]}]},
}
