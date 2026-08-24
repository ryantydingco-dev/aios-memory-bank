# Batch One — Send Board (2026-05-31)

> 6 SEND-tier leads, deterministically selected from `Oloxa_Battlecards_2026-05-31.csv`. Copy → send → log. **Verify Smartlead sender/domain before any email send** (open Oloxa loop). LinkedIn connect/DM are manual (no API). Drafts are pre-written; you are the human in the loop.

**Launch order:** CLOSING first (most re-verifiable), US-leaning, then the rest — so the first replies arrive fast and become real outcome data.

Logging shortcut — set once per shell:
```bash
export SC="/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Operations/scripts"
```

Tracker: `Oloxa_Outcome_Tracker.csv` (pre-seeded 6 queued rows). Each lead below has its exact log command.

---

## Ryan — 2 to send

### ⬜ Michael Bucaro — Convoy Capital · US · CLOSING
`mbucaro@convoy-cap.com` · [LinkedIn](https://www.linkedin.com/in/michael-bucaro-47806859) · owner: **Ryan**
_Why now:_ The firm is visibly scaling (new Irvine Towers office, confirmed via CoStar/LABJ) which signals rising deal volume and per-officer packaging load, so reaching out now about cutting document-intake time on the next file is well-timed - lead with the growth/throughput angle (verified) rather than the unverified just-funded deal.

**Sequence:** LinkedIn connect D0 (no pitch) -> LinkedIn DM D2 once accepted (growth/intake angle) -> Email D4 (signal -> doc implication -> 7hrs outcome, soft example CTA) -> Follow-up email 1 D8 (follow-up/back-and-forth angle) -> Call + voicemail D11 (permission-based) -> Follow-up email 2 D15 (deadline-risk angle, step up to 15-min audit CTA). SMS only if a warm mobile surfaces — don't cold-blast it.

**1. LinkedIn connect note**
```
Michael — saw Convoy's been opening up around SoCal (Irvine Towers, etc.). I work adjacent to debt origination teams on the borrower-package side, so figured I'd connect with someone doing the actual file assembly. No pitch.
```
**2. LinkedIn DM** (after accept)
```
Hey Michael — noticed Convoy's been adding offices across SoCal lately, which usually means more files moving through origination at once. The part I hear most about from loan officers in that spot is the intake grind: chasing rent rolls, estoppels, entity docs and exchange paperwork into a clean submission package while the clock's running. We've built a way to get borrower docs sorted, named and filed automatically, with the missing items flagged before they bite you on a deadline. Worth comparing notes on how you handle that today?
```
**3. Email** — subject: *borrower docs on the next file*
```
Michael — with Convoy adding offices around SoCal, I figure more deals are hitting origination at the same time.

Usually that means the borrower-doc intake gets heavier: rent rolls, leases, estoppels, entity docs, exchange paperwork — all needing to land clean and lender-ready before the deadline.

We get those uploads sorted, renamed and filed automatically, flag what's missing, and nudge the borrower for it, so you're only verifying the exceptions.

Brokers doing this tend to get back 7+ hours a deal on the package side.

Worth me sending a quick example of what the output looks like?
```
**4. Cold call opener**
```
Hey Michael, it's Ryan — we haven't spoken, this is a cold one, do you have thirty seconds? I'll be quick: I work with debt origination folks on the borrower-document side and noticed Convoy's been expanding around SoCal, so I wanted to ask how you're handling package intake as the volume picks up.
```
**Voicemail**
```
Hi Michael, it's Ryan — reaching out because Convoy's SoCal growth usually means more files in origination at once, and I help loan officers cut the borrower-doc intake time on each one. No rush, but if you want the short version, give me a ring back at [number].
```
**SMS** (warm/owner-direct only)
```
Hey Michael, it's Ryan — quick one re: borrower-doc intake as Convoy scales in SoCal. Mind if I send over a 2-line example of what we do? No call needed.
```
_Top objection:_ We already have a process / an assistant who handles document collection, so we don't need this. → Totally fair — most teams I talk to have someone on it, and they're usually good. This isn't about that person at all; it just takes the sorting, renaming, filing and the borrower chase off their plate so they're verifying exceptions instead of assembling every package from scratch. Same person, more files through, deadlines less likely to slip. Happy to show one package side-by-side and you can judge if it's worth anything.

**Log it:**
```bash
python3 "$SC/log_outcome.py" --id "mbucaro@convoy-cap.com" --sent --channel LinkedIn
# when they reply:  --replied --sentiment positive|neutral|negative [--objection TAG]
# when booked:      --meeting
```

---

### ⬜ Grant McIntyre — CFP Group · UK · CLOSING
`grant@cfpgroup.co.uk` · [LinkedIn](https://www.linkedin.com/in/grant-mcintyre-2399691ba) · owner: **Ryan**
_Why now:_ No clean this-week trigger exists: the only dated public event is the firm's £1bn milestone from end of January 2026 (~4 months stale), so a credible outreach should anchor on the live dev-finance/packaging volume rather than manufacture urgency around the milestone.

**Sequence:** LinkedIn connect D0 (no pitch) -> LinkedIn DM D3 once accepted -> email D5 (signal + example offer) -> follow_up_1 email D9 (in-house team angle) -> short call D12 with voicemail if no answer -> follow_up_2 email D16 (borrower follow-up angle). Treat LinkedIn as primary since he's an individual broker active there; keep SMS in reserve for warm/owner-mobile only, not this cold sequence.

**1. LinkedIn connect note**
```
Grant — fellow traveller in the world of whole-of-market commercial finance (and a Scotsman in Yorkshire, respect). Been following CFP's dev finance work across Yorkshire. Always keen to connect with brokers actually doing the volume rather than just talking about it.
```
**2. LinkedIn DM** (after accept)
```
Grant — saw the scale of dev finance CFP is running across Yorkshire, multi-site residential schemes are about as document-heavy as it gets. Every lender on the panel wants the land registry, solicitor DD and valuations packaged slightly differently, and that reformatting tends to land on whoever's closest to the deal. We've been helping brokers turn the borrower-docs-to-lender-ready grind into mostly exception-handling: docs sorted and filed, missing items flagged, borrower chased automatically, you just verify what's actually off. Worth comparing notes on how your packaging side handles the multi-lender reformat?
```
**3. Email** — subject: *Multi-lender packaging on dev deals*
```
Grant — CFP's dev finance pipeline across Yorkshire caught my eye, multi-site schemes carry a serious document load.

The bit that eats hours is rarely the deal itself, it's reformatting the same land registry / solicitor DD / valuation pack to each lender's spec and deadline.

We sort and file borrower docs on intake, flag what's missing, and chase the borrower automatically so the deal only surfaces when there's a genuine exception to verify.

End result is a cleaner lender-ready package with a lot less back-and-forth.

Worth me sending a quick example of what one looks like?
```
**4. Cold call opener**
```
Hi Grant, it's [Name] — I know I've caught you out of the blue, can I borrow thirty seconds and you tell me to get lost if it's not relevant? I work with commercial brokers running document-heavy dev finance, and I noticed the multi-site stuff CFP is doing across Yorkshire.
```
**Voicemail**
```
Hi Grant, [Name] here — I had a quick thought on the lender-packaging side of the dev deals CFP runs, specifically the reformatting that happens for each lender. No pitch, just worth a two-minute compare; I'll drop you a note too so you've got my details.
```
**SMS** (warm/owner-direct only)
```
Hi Grant, [Name] here — left you a quick note about cutting the document reformat on multi-lender dev deals. Happy to send a 30-second example instead if that's easier?
```
_Top objection:_ We already have a dedicated packaging function and in-house case managers, so we handle this internally. → Makes sense, and the brokers we work with usually do too. The point isn't to replace that team, it's to hand them deals that are already sorted, filed and chased so they spend their hours on exceptions, lender spec and DD rather than renaming files and nudging borrowers. It tends to make a good packaging team faster, not redundant. Worth a quick example to see where the line would sit for you?

**Log it:**
```bash
python3 "$SC/log_outcome.py" --id "grant@cfpgroup.co.uk" --sent --channel LinkedIn
# when they reply:  --replied --sentiment positive|neutral|negative [--objection TAG]
# when booked:      --meeting
```

---

## Sway — 4 to send

### ⬜ Robert Meunier — Bellevue Capital Group · US · CLOSING
`rmeunier@bellevuecapitalgroup.com` · [LinkedIn](https://www.linkedin.com/in/robmeunier) · owner: **Sway**
_Why now:_ He is visibly in a high-volume closing stretch (a 2026 close plus the recorded 6-in-6-weeks burst) AND just tried to add a junior broker to absorb load — so this week the constraint is throughput per deal, not lead flow, which is precisely when a packaging-automation pitch lands instead of bouncing.

**Sequence:** LinkedIn connect D0 (no pitch, peer angle, correctly framed as the doc-packaging side) -> LinkedIn DM D3 once accepted (multi-lender question, rung-2 example CTA) -> Email D5 (same angle as a question, lets him reply on his time) -> Call D8 mid-morning between closings, with permission opener -> Voicemail + Follow-up 1 email same day if no answer -> Follow-up 2 email D13 (re-trade/volume angle, steps up to the rung-3 15-min audit CTA). LinkedIn-first because the signal is LinkedIn-sourced and he's clearly active there; keep email/call as the warmer second wave, not the opener.

**1. LinkedIn connect note**
```
Robert — saw the Puyallup acquisition land, congrats. I work with commercial brokers on the document-packaging side of closings, and the 200+ lender shop model is exactly the setup I find interesting. Would be good to connect.
```
**2. LinkedIn DM** (after accept)
```
Robert, congrats on the Puyallup close. Genuinely curious from a peer angle — when you shop one deal across a credit union, a conventional source, and a non-recourse lender, who ends up re-formatting the same borrower docs into each lender's package by hand? That's usually the part brokers running several deals at once quietly dread. We get it close to zero: borrower uploads once, docs sort themselves, missing items get flagged. Worth me sending a quick example?
```
**3. Email** — subject: *Multi-lender doc re-packaging*
```
Robert — looks like Bellevue's had a strong close run lately (the Puyallup deal, the 21-day execution).

Quick peer question: when one deal goes out to a credit union, a conventional lender, and a non-recourse source, who ends up rebuilding the same borrower doc set into each lender's submission format?

For most brokers running several closings at once, that re-packaging is the hidden tax — and it's the part nobody really owns.

Where we help: borrower uploads once, docs get sorted and renamed, missing items flagged — so each lender gets a clean package without your team rebuilding it from scratch.

Worth me sending a quick example of what that looks like?
```
**4. Cold call opener**
```
Hi Robert, it's [Name] — I know I caught you out of the blue, can I borrow 20 seconds? I'm not selling a loan product; I work with commercial brokers on the document-packaging side of closings, and I had one specific question about how your team handles multi-lender submissions.
```
**Voicemail**
```
Robert, it's [Name] — I'm not with a lender, I work with commercial brokers on the document side of closings. Wanted to ask how you're handling the same borrower docs getting re-packaged across all those different lenders right now — give me a call back when you get a minute.
```
**SMS** (warm/owner-direct only)
```
Robert — [Name] here, I work with commercial brokers on the doc-packaging side of closings. Saw the Puyallup close, congrats. Mind if I send a quick example of cutting the multi-lender re-packaging work? No pitch.
```
_Top objection:_ My processor / team already handles document collection — we have a system that works. → Totally fair, most teams running this volume do have a rhythm. The idea isn't to take anyone's work away — it's that they only touch exceptions instead of re-sorting and re-formatting every file from scratch for each lender. Same people, a fraction of the manual handling, and packages still go out clean. Happy to show you on one of your own deal types so it's concrete, not theoretical.

**Log it:**
```bash
python3 "$SC/log_outcome.py" --id "rmeunier@bellevuecapitalgroup.com" --sent --channel LinkedIn
# when they reply:  --replied --sentiment positive|neutral|negative [--objection TAG]
# when booked:      --meeting
```

---

### ⬜ Matthew Beal — Bellevue Capital Group · US · CLOSING
`matthew@bellevuecapitalgroup.com` · [LinkedIn](https://www.linkedin.com/in/matthew-beal-2a886b33) · owner: **Sway**
_Why now:_ The closing signal is real but cooling (most recent datable activity is months old), so this week is a credible nurture/relationship touch on the back of a known busy multifamily pipeline - not a hot just-closed trigger; reach out now before the signal goes fully stale.

**Sequence:** LinkedIn connect D0 (no pitch) -> LinkedIn DM D3 once accepted -> Email D6 (repackaging angle) -> Follow-up email D11 (borrower-chase angle) -> Call + voicemail D14 -> Final follow-up email D20 (multi-lender speed angle). Slower cadence on purpose - the closing signal is cooling, so this is a relationship/nurture touch, not a hot trigger. SMS only if he replies warm or shares a mobile.

**1. LinkedIn connect note**
```
Matt - came across your profile while looking at multifamily brokers in the PNW. The ex-W&D / HUD background plus shopping mid-market deals across that many lenders is a rare combo. Always good to know people doing the packaging-heavy side of CRE well. Happy to connect.
```
**2. LinkedIn DM** (after accept)
```
Matt - the part of your setup that caught my eye: shopping mid-market multifamily across 200+ lenders means the same borrower package gets re-cut to a different underwriting checklist basically every deal. That reformatting and the follow-ups to chase the one missing doc tend to be the quiet tax on a busy pipeline. We help brokers turn borrower uploads into a clean, lender-ready package - docs sorted and renamed, missing items flagged, the borrower nudged automatically, so you're only verifying exceptions. Worth comparing notes on how you handle it now?
```
**3. Email** — subject: *Repackaging for 200+ lenders*
```
Matt - saw you run mid-market multifamily at Bellevue, shopping deals across a couple hundred lenders.

That usually means re-cutting the same borrower file to a different underwriting checklist on every deal, plus chasing whatever doc is still missing.

We take the borrower's uploads, sort and rename them, flag what's missing, and nudge the borrower automatically - so what lands on your desk is a clean, lender-ready package and you're only touching the exceptions.

Worth me sending a quick example of what that looks like on a multifamily file?
```
**4. Cold call opener**
```
Hi Matt, it's [name] - I know I'm catching you cold, can I borrow 20 seconds and you tell me if it's worth continuing? I work with multifamily brokers shopping deals across a lot of lenders, and the reason I called is the document repackaging that comes with that - the part where the same file gets reformatted for each lender's checklist.
```
**Voicemail**
```
Hi Matt, [name] with Oloxa - reaching out because you're shopping multifamily across a couple hundred lenders, and I had a specific thought on the package-reformatting side of that. No pitch, just worth a two-minute compare - my number's [number].
```
**SMS** (warm/owner-direct only)
```
Matt - [name] here, the multifamily doc-packaging tool I mentioned. Quick q on how you handle re-cutting borrower files for different lenders - worth a 2-min compare? No worries if not.
```
_Top objection:_ I've got a process and a team for this already - my assistant handles the doc collection and packaging. → Totally fair, and the goal isn't to replace that - it's to take the repetitive sorting, renaming, and missing-doc chasing off their plate so their time goes to the judgment calls and lender relationships. Your team still verifies the exceptions; they just skip the grunt assembly. Worth a quick example to see if it actually saves your assistant time, or not?

**Log it:**
```bash
python3 "$SC/log_outcome.py" --id "matthew@bellevuecapitalgroup.com" --sent --channel LinkedIn
# when they reply:  --replied --sentiment positive|neutral|negative [--objection TAG]
# when booked:      --meeting
```

---

### ⬜ Linzi Crellin — Halo Corporate Finance Limited · UK · VOLUME
`linzi@hcfl.co.uk` · [LinkedIn](https://www.linkedin.com/in/linzi-crellin-b3a1b581) · owner: **Sway**
_Why now:_ She publicly posted a fresh 2026 funding milestone (~2 weeks ago per the lead record) and Halo is riding its NACFB Cashflow Broker of the Year win, giving a current, credible reason to reach out this week.

**Sequence:** LinkedIn connect D0 (lead with the award, no pitch) -> LinkedIn DM D2 once accepted -> email D5 (signal + quick-example CTA) -> call D8 with voicemail if no answer -> follow_up_1 by email/DM D11 -> follow_up_2 D16. Lead on LinkedIn since the signal lives there and she's active; keep email as the proof-drop channel. If she engages on the milestone post, warm the DM off that instead of cold.

**1. LinkedIn connect note**
```
Saw Halo picked up NACFB Cashflow Broker of the Year — properly impressive for a working-capital shop. I work around commercial brokers running multi-lender panels, always keen to connect with people doing volume well. No pitch, just good to follow what you're building.
```
**2. LinkedIn DM** (after accept)
```
Congrats on the Cashflow Broker of the Year win — that's a serious result. I notice the thing that quietly caps cashflow brokers running a Haydock/Funding Circle/Lenkie/Capify type panel isn't deal flow, it's that every deal gets re-packaged into a different lender's format, with you chasing the same bank statements and accounts each time. We help brokers turn borrower uploads into lender-ready packages with the missing-doc chasing handled in the background, so one person can push more deals without the packaging becoming the ceiling. Worth comparing notes on how you handle re-submissions across the panel?
```
**3. Email** — subject: *Packaging across the lender panel*
```
Congrats on the NACFB Cashflow Broker of the Year win.

Running a broad working-capital panel, the bit that quietly eats the day is re-packaging the same deal into each lender's format and chasing borrowers for statements and accounts.

We take borrower uploads, sort and file them, flag what's missing, and nudge the borrower automatically — so you're just verifying exceptions instead of building each pack from scratch.

Usually means a cleaner lender-ready package and a lot fewer follow-up emails.

Worth me sending a quick example of what one looks like?
```
**4. Cold call opener**
```
Hi Linzi, it's [name] — I know I'm calling out of the blue, mind if I take twenty seconds and you tell me to get lost if it's not relevant? I saw Halo won Cashflow Broker of the Year, congrats — I work with commercial brokers on the document and packaging side of running a multi-lender panel.
```
**Voicemail**
```
Hi Linzi, it's [name] — congrats on the NACFB win, calling about the document packaging side of running a multi-lender panel and an idea for getting more deals out the door without more admin. No urgency, I'll follow up by email, but happy to chat if you ring back on [number].
```
**SMS** (warm/owner-direct only)
```
Hi Linzi — [name] here, congrats on the Cashflow Broker of the Year win. Work with commercial brokers on cutting the doc-chasing and re-packaging across lender panels — worth comparing notes? No worries if not.
```
_Top objection:_ We've already got our packaging process dialled in — we just won an award for how we run cashflow deals. → Totally fair, and the award says the process works. This isn't about fixing that — it's about who does the manual bits inside it. The sorting, filing, chasing borrowers for the missing statement, reshaping a pack for the next lender. That's still hours a deal whether your process is great or not. We just take that off the person so an award-winning process can run at higher volume without adding a head. Happy to show one example and you can tell me if it's already covered.

**Log it:**
```bash
python3 "$SC/log_outcome.py" --id "linzi@hcfl.co.uk" --sent --channel LinkedIn
# when they reply:  --replied --sentiment positive|neutral|negative [--objection TAG]
# when booked:      --meeting
```

---

### ⬜ Chris Solinski — LitFinancial · US · HIRING
`csolinski@litfinancial.com` · [LinkedIn](https://www.linkedin.com/in/chrissolinski) · owner: **Sway**
_Why now:_ A recently added processor role suggests they are scaling document-intake capacity by adding people, which opens a credible (if soft) reason to discuss lifting throughput per processor; the trigger is real but not time-sensitive this specific week.

**Sequence:** LinkedIn connect D0 -> DM D3 (after accept) -> email D6 -> follow_up_1 (email) D10 -> call + voicemail D13 -> follow_up_2 (email or LinkedIn) D18. Lead the relationship on LinkedIn since the profile is broker-side and verifiable there; keep email as the value-drop channel. Hold SMS unless a mobile surfaces through a reply or warm intro. Aging signal means no urgency framing, space touches out and let the value angles carry it.

**1. LinkedIn connect note**
```
Saw LitFinancial's been adding to the processing side. Always interested in how speed-focused UWM shops keep file assembly tight while scaling the team. Figured I'd connect, Chris.
```
**2. LinkedIn DM** (after accept)
```
Noticed you brought on processing help recently, makes sense if you're holding a 5/8-day CTC line while volume moves. The usual snag I hear from speed-positioned UWM shops is less the processor count and more the front end: borrower docs coming in messy, then re-stacking each file to whatever the outlet's spec is. We've been helping brokers get that part to lender-ready faster, so a new processor spends time on exceptions instead of sorting and chasing. Worth comparing notes on how you're handling intake right now?
```
**3. Email** — subject: *file assembly at speed*
```
Chris, saw you added processing capacity recently.

If you're keeping that 5/8-day CTC promise, the front end is usually where files stall, messy borrower uploads and re-stacking to each outlet's spec.

We help UWM brokers get docs sorted, missing items flagged, and borrower follow-ups handled automatically, so a processor lands on a lender-ready file and just works the exceptions.

Means a new hire lifts throughput instead of grinding on intake.

Worth me sending a quick example?
```
**4. Cold call opener**
```
Hey Chris, it's [name], I'll be quick, this is a cold one so feel free to cut me off. I saw LitFinancial added some processing help recently, and I work with UWM brokers on the doc-intake side of that. Mind if I take twenty seconds on why I called?
```
**Voicemail**
```
Chris, it's [name] calling about the processing side at LitFinancial, specifically how speed-focused UWM shops keep file assembly tight when they add a head. I've got a quick example worth a look, so give me a buzz at [number] or I'll try you again.
```
**SMS** (warm/owner-direct only)
```
Hey Chris, [name] here. Saw you added processing capacity recently, work with UWM brokers on getting files lender-ready faster so new hires hit exceptions not intake. Worth a quick example?
```
_Top objection:_ I just hired a processor for exactly this, so I'm covered on the doc side. → Totally fair, and that's actually the better setup for this. The idea isn't fewer people, it's that your new processor isn't spending the first hours of every file sorting uploads and re-stacking to each outlet. They land on a clean, lender-ready file and work only the exceptions, which is where the throughput per head and the 5/8-day timeline actually come from. Happy to show a before/after on one file so you can judge.

**Log it:**
```bash
python3 "$SC/log_outcome.py" --id "csolinski@litfinancial.com" --sent --channel LinkedIn
# when they reply:  --replied --sentiment positive|neutral|negative [--objection TAG]
# when booked:      --meeting
```

---
