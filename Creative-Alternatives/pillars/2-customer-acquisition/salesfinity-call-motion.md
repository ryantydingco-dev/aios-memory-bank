# Salesfinity cold call campaign — Creative Alternatives

> The cold calling motion. Salesfinity has been sitting unused; this turns it into a cold outbound
> channel alongside SmartLead (email) and Sendr (LinkedIn), per the stack locked in `master-gtm-strategy.md` §7.
> **This is a cold campaign.** Win-backs run as a secondary list; nothing here touches reorders.
> Scripts: `sequences/cold-call-phone-first-script.md` (cold, phone-first) ·
> `sequences/swag-handled-coldcall-script.md` (cold, as the Day-6/16 touch inside the email cadence) ·
> win-back script in `sequences/warm-call-scripts.md`.

---

## 1. The lists

| Priority | List | Count | Who | State |
|----------|------|------:|-----|-------|
| **1** | `outputs/coldcalls/<date>/call_targets_engaged.csv` (tier1) | **362** | Engaged non-repliers from the ACTIVE email campaigns: clicked or opened 3+, never replied. Rebuilt weekly by `scripts/ca_call_targets.py`. | **Needs mobile reveal** (~355; only 7 on file). Gated — see §5. The hottest list the machine produces. |
| **2** | `outputs/coldcalls/2026-07-11/cold_dial_list.csv` | **147** | Cold prospects with revealed mobiles: law 46 · financial 33 · accounting 30 · real estate 16 · agency 13 · insurance 9. | **Dial-ready today.** Merged + deduped from the two existing pulls in `outbound/`. |
| 3 | `call_targets_engaged.csv` (tier2) | 1,903 | Opened 1–2×, no reply. | Dial after tier1; reveals only if tier1 runs dry. |
| 4 | `outputs/coldcalls/2026-07-11/list_2_winback.csv` | 620 | Lapsed/legacy CA customers with phones, biggest known spend first. | Dial-ready. Filler for leftover block time. |

Full channel orchestration (how this meshes with SmartLead + Sendr, weekly rhythm, suppression rules):
`cold-outbound-orchestration.md`.

**Email overlap matters:** the law + financial mobiles largely mirror the ACTIVE SmartLead campaigns (Swag — Law, Swag — Financial). For those, the call can reference "I sent you a note" if true. Accounting/RE/agency/insurance email campaigns are still DRAFTED — those dials are pure cold. The script handles both; check the segment before the block.

## 2. Salesfinity setup (one-time)

- [ ] **Caller ID registration + spam remediation.** Register numbers, CNAM "Creative Alternatives," monitor for "Spam Likely" flags and rotate/remediate. On a cold motion this is the #1 connect-rate lever.
- [ ] **Local presence on.** NY-area numbers for the NY/NJ/CT-heavy book.
- [ ] **Mobile-swap on** (locked stack setting).
- [ ] **Import `cold_dial_list.csv`** — map Full Name / Company / Mobile / Segment; Segment drives which opener variant shows.
- [ ] **Parallel dialing at 3–4 lines.** This is cold volume — that's what the parallel dialer is for. Drop to fewer lines if the answer-to-agent lag gets awkward.
- [ ] **Recording OFF by default** — book includes CT/MA/PA (two-party consent). Record only if the line announces it.
- [ ] **Booking link in the disposition flow** so a "yes" becomes a calendar slot before hangup.

## 3. Running the campaign

- **Blocks:** 2 × 60–90 min, Tue–Thu. 10:00–11:30am and 2:00–4:00pm prospect-local.
- **Volume:** parallel dialing ≈ 60–100 dials/hour. The 147-mobile list is **one to two sessions per full pass**; plan 3 passes per number (different days/hours) before a lead is spent.
- **Expected math (cold B2B mobiles):** ~10–20% pickup across passes → ~15–30 live conversations from the list → the goal is booked 15-minute mockup walkthroughs. Track actuals from pass 1; this list is small enough to learn fast.
- **One goal per call:** a booked 15-minute slot, or the name of the person who owns swag. Nothing else counts as a win.
- **Voicemail discipline:** VM on pass 1 and pass 3 only (script has both). Never twice in a row.
- **Any interested connect → mockup out same day.** The mockup is still the wedge; the call is how it gets permission to land.

## 4. Dispositions + scoreboard

Seven dispositions, logged in Salesfinity on every dial:
`meeting-booked` · `send-info (mockup-promised)` · `referred-to-right-person` · `not-interested` · `callback-set` · `no-answer/vm` · `do-not-call`

- **Do-not-call → suppress same day**, across channels (also pause them in SmartLead).
- Weekly export of the call log → `outputs/coldcalls/logs/` and roll into `/weekly-review` under Motion 4: **dials · pickups · conversations · meetings booked — by segment.** Kill the segments that don't convert, feed the ones that do.
- Verbatim objections from every block → `prospect-interaction-analyzer` → next iteration of script + email copy.

## 5. Scaling the list (gated)

When the first 147 produce a read (after ~3 passes):

1. **Double down by segment, not across the board.** Whichever segment books meetings gets the next pull; the rest wait.
2. **AI Ark discipline (standing rules):** tier the list BEFORE revealing anything; **mobiles revealed on Tier-1 only**; a count is not proof — verify the reveal targets the exact ids with a free people_search check first. No scale reveal without Ryan's explicit go — reveals are real money.
3. **Suppress existing customers** against the QuickBooks export before any pull becomes a dial list. (8% of past campaign replies were existing customers — same trap exists on the phone, and it's worse on a call.)
4. Camps + squash lookalike dials are a valid later wave (highest-LTV ICP) — same gate, same rules.

## 6. Compliance

- B2B, business hours only. A human live on every call — parallel dialing yes, robocalls/AI voice never.
- Honor any opt-out instantly and across channels.
- No recording without announcement in two-party states (§2).

---

**Next actions:** (1) Salesfinity setup checklist (§2). (2) Import `cold_dial_list.csv`. (3) First cold block this week — law + financial first (email air-cover is live for them). (4) Read the numbers after 3 passes, then decide the scale-up pull.
