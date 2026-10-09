# Creative Alternatives sales and order-management audit

Date: 2026-10-09. Read-only review. Nothing was changed, sent, activated or contacted.

## 0. What I could and could not inspect

| Source | Access | Notes |
|---|---|---|
| Airtable base appQagvnNoqXlUxvw | Full read | All 14 tables, 3 interfaces (20 pages), 1 form, 1 automation, external accounts. |
| QuickBooks Online | Read | Company "Creative Alternatives / Bolduc's Apparel". Pulled 63 estimates (last 180 days) and 100 invoices (Sep 9 to Oct 8). |
| Viking, Diamond, Random Vendors sheets | Read | OPEN and CLOSED tabs read in full. |
| 1999-2026 profit ledger | Partial read | The connector returns a header and sample rows only. 28,729 rows exist. Not opened for editing, not modified. |
| Gmail | Wrong mailbox | The connected Gmail account is ryan@trysci.co. ryan@, maclaine@ and kenny@creativealternatives.com are not connected. Every evidence link in Airtable points at those three mailboxes, so I could not re-verify any email claim, draft or send. |
| Smartlead, Inframail, Grokbot | Not connected | No connector or API in this session. Nothing about Reply Desk can be verified from here. |
| Local project folder (BUILD-PLAN.md, build-state.json, integration-runs, automation-setup, cost-research, maclaine-prospect-followups) | Not available | These folders are not in the aios-memory-bank repo on any branch, and the Creative-Alternatives symlink points to a repo that is not checked out here. I could not compare setup documents with live state. The audit below is based on live systems only. |

Everything below is from live reads on Oct 9 (morning, Eastern).

## 1. Plain-English assessment: working vs configured vs unverified

### Working (real data exists and reads correctly)
- The Airtable schema is sound. Projects carries owner, stage, waiting-on, next action, due date, customer in-hands date, source thread URL, communication owner, artwork contact, automation hold, and three valid formulas (Attention, Response Queue, Deadline Risk). Supplier Orders, Proofs, Shipments, Invoices, Quote Reconciliation, Communication History and Team Updates exist with sensible field notes that encode the right rules (drafts are not sends, a label is not a shipment, payment is not delivery).
- One large import ran on Oct 8 and 9: 193 projects, 142 companies, 53 contacts, 184 tasks, 76 supplier orders, 190 communication-history rows, 43 invoices, 23 pending QuickBooks estimates, 9 shipments, 5 proofs. Every project has a source thread URL. 139 have Items and Quantities filled.
- Vendor sheet coverage is complete: all 40 Viking lines, all 20 Diamond lines and the Random Vendors lines are present as Supplier Orders, with the original sheet row preserved as JSON.
- QuickBooks pending estimates reconcile: 22 pending in QuickBooks versus 23 in Airtable (one likely converted since the import).
- The two exclusions are preserved correctly: Soul Tea is Delivered with an Automation Hold ("shirts already delivered, no prospect follow-up"), AIYA is Lost with an Automation Hold ("international, outside service area"). Both evaluate to Closed in every formula.
- Interfaces exist for Ryan (Sales Desk), the team (Team Projects) and the Customer Order Desk, plus a "Quick team update" form.

### Configured or proposed, but not running
- 7 AM brief: there is exactly one automation in the base, named "DRAFT — CA 7am action briefing — setup incomplete". It is undeployed, has a 7:00 America/New_York cron trigger and zero action steps. It has never run. The four rows in Daily Action Briefs are hand-written "SETUP PREVIEW" records marked "Unsent".
- Overdue escalation: nothing exists. No automation, no view, no record.
- Email-reply updates: nothing exists. The Team Updates table has 0 records. The form exists but no inbound-email path does.
- Follow-up policy (3 business days after an actual send, 5 after the first follow-up, max two): not implemented. The Follow-up Review table has 0 records. No formula computes a due date from Last Actual Sent Date. The Stage number field exists but is unused.
- Airtable has no external accounts connected (no Gmail, no QuickBooks, no Google Sheets). "Last Synced At" fields are plain values typed by the importer, not a sync.
- The "SYSTEM: monitor checkpoint and lock" record in Daily Action Briefs describes an external Codex job with a lock, a manifest at /workspace/ca-sales-order-system/pagination-2026-10-08.json and a last pilot run at 21:15 ET on Oct 8. That job, its host and its schedule are outside anything I can see. Its own status block says Inframail and QuickBooks are "not_connected" and Smartlead/Inframail live checks are "pending". No run has written to the base since Oct 8 21:16 ET.
- Grokbot Reply Desk: nothing in Airtable references it. There is no connector, no automation and no record written by it. Treat it as not built.

### Unverified because of access
- Every email-derived fact in Projects and Communication History (dates, "needs our reply", "draft not sent") was written by the Oct 8 import. I could not open a single one of those threads. The data is internally consistent but has not been re-checked against the mailboxes today.
- PCNA, SanMar and S&S: no connection exists anywhere in Airtable. Whether account access was granted is not something I can see.
- Grokbot quoting assistant: no trace. Correctly treated as parked.

## 2. The five highest-impact gaps

### Gap 1: Nothing runs. The whole operating layer is a one-time snapshot.
Evidence: single undeployed automation with no actions; zero external accounts; Team Updates empty; Follow-up Review empty; no writes to the base after Oct 8 21:16 ET; the only "monitor" is a lock record describing a process on another machine.
Consequence: by Monday the base is stale. Kenny and Mickey receive nothing. Any reply a customer sent on Oct 9 is invisible unless someone re-runs the import by hand. The system currently adds work (keep Airtable current) without removing any.

### Gap 2: Due dates and the response queue are placeholders, so nobody can tell what is actually due.
Evidence: 142 of 155 dated project next actions and 142 of 184 tasks are due 2026-10-09 (import day). Only 2 of 193 projects have an Email Response Assessment; Coverage is Complete on 16 of 193; so the Response Queue formula returns "Review email thread" on 184 of 193 projects. The Attention formula says "Due today" on 142. Kenny's "My Tasks Due Today" page would show 98 tasks; Mickey's 31; Ryan's 13.
Consequence: "who owes the next response" is answered for 2 projects. A list where everything is due today is the same as no list. The 24-hour staleness rule in Response Queue guarantees the whole base flips back to "Review email thread" every morning unless a reconciliation runs daily.

### Gap 3: Deadline risk is not visible where it matters.
Evidence: four customer orders have an in-hands date already passed with no shipment record: Goodless Electric 27911 (in-hands 9/18, still on Diamond OPEN, no tracking), NYAC 27956 (9/25), Farm & Forge 27959 (10/6), Town Center 27990 (10/7, Viking sheet still "On Track"). Wildcats 27989 was due to ship 9/25 and sits on the Viking sheet flagged "NEED 10/9/26". Mustang Milestone 5K is marked Urgent with a race on Oct 24 in the notes, but Customer In-Hands Date is empty, so Deadline Risk shows only "Action due today" and no delivery warning. All 76 Supplier Orders have blank Promised Ship Date, Production Date, Acknowledgement and Phone Update Log; the supplier ship dates exist only inside the pasted JSON text.
Consequence: the one thing the business asked for (do not miss event dates) cannot be filtered, sorted or alerted on. The vendor sheets remain the only working deadline tool, and they do not flag lateness either (Goodless has been "open" for three weeks past in-hands).

### Gap 4: Identity and PO reconciliation is unfinished, which will corrupt invoice and project linking.
Evidence: QuickBooks Customers table has 0 records, so no Company is linked to QuickBooks and no Invoice is linked to a customer. PO 28064 is used for both Nicol Squash (Crown Trophy plaques, Random Vendors sheet) and Vagabond Inn (Viking 800945); QuickBooks says 28064 is Vagabond and Nicol is 28063/28065. The Mission Success Houston project is named 28038 but QuickBooks 28038 is City Squash ($293) and the Diamond sheet lists Mission Success as 28045. QuickBooks names differ from CRM names (Nicole Champions Academy = Nicol Squash; Cheryl Clapprood = Springfield Youth; Jericho Teacher's Assn = Jericho Teachers Association; Legal Services Bronx vs Legal Services of New York). Airtable holds 43 invoices; QuickBooks has roughly 100 invoices in the same window, so the import is project-linked only (Soul Tea's $2,400 invoice 27994 and Camp W's $4,950 invoice 28058 are not in Airtable).
Consequence: any automation keyed on PO or customer name will attach the wrong invoice, double-count, or miss billing entirely. Partial-shipment tracking on multi-PO jobs (Legal Services Bronx 28004a to 28004e has 3 tracking numbers on the sheet and 1 shipment in Airtable) will drift.

### Gap 5: Artwork and proof state is almost entirely outside the system.
Evidence: 5 Proof records against 76 supplier orders; the Viking sheet alone has 12 lines marked Art Approved NO and the Diamond sheet 5. Artwork Contact is filled on 1 of 193 projects. Patricia is not an Owner option, so no task can be assigned to her. The Mustang record says "Patricia receipt not established". Camp NEOC's owed reply has sat since Oct 1 behind an unsent draft.
Consequence: artwork delays (the stated pain) stay invisible. Proof approval versions are not recorded, so a wrong-item approval (Legal Services Bronx: approval was for QSB62 bags, invoice says QSB131) cannot be caught systematically.

## 3. Prioritized improvement table

Effort: S = under 2 hours, M = half a day, L = 1 to 2 days. Ongoing cost assumes existing Airtable plan, Gmail and QuickBooks. No new subscription is needed for any row.

| # | Change | Benefit | Effort | Ongoing cost | Owner | Dependency |
|---|---|---|---|---|---|---|
| 1 | Re-date the import: clear the 142 placeholder due dates, set real dates only where evidence supports one, and add a "Deadline (event / in-hands)" date to every customer order from the vendor sheets (ship and in-hands are different fields already). | Lists become usable; Deadline Risk starts working. | M | none | Ryan (Mickey confirms dates) | none |
| 2 | Fill Supplier Orders dates from the sheet JSON (Promised Ship Date, customer in-hands on the project) and create one Airtable view "Late or due in 3 days" sorted by date. | Replaces the vendor sheets as the lateness check; catches Goodless, NYAC, Town Center, Wildcats today. | S | none | Ryan | 1 |
| 3 | Deploy the 7 AM brief as a native Airtable automation (cron trigger already exists) with "Find records" per owner and "Send email" to Kenny and Mickey. Internal only; no customer content. Include only rows with a real due date on or before today, max 10, plus every deadline row within 7 days regardless of email status. | Kenny and Mickey get a short list without opening Airtable. | M | none (Airtable automation runs are included in plan) | Ryan | 1, 2 |
| 4 | Turn on "When email received" trigger on a dedicated Airtable inbound address and ask Kenny and Mickey to reply to the brief by email. Create a Team Updates record from each reply (Needs email review). | Replies from phone or desktop become review items without anyone using Airtable. Phone updates captured as reported, not as fact. | M | none | Ryan | 3 |
| 5 | Implement the follow-up policy as formulas: Follow-up 1 due = WORKDAY(Last Actual Sent Date, 3) when Waiting on = Customer and Stage < 2; Follow-up 2 due = WORKDAY(first follow-up actual send, 5); Stage 2 = human review. Populate Follow-up Review only from these, never from drafts. | Correct, auditable follow-ups; drafts can never count. | M | none | Ryan | Last Actual Sent Date must be a verified send; see gap in access |
| 6 | Remove template residue: 15 demo names from Owner, 14 demo teams from Waiting on, Planning/Execution/Review from Lifecycle Stage (after remapping the 56 "Review" projects to a real stage or to Workstream = Reconciliation). Add Patricia as an Owner. | Cleaner pick-lists; tasks can be assigned to Trish; fewer wrong clicks for Mickey. | S | none | Ryan | none |
| 7 | QuickBooks identity: populate QuickBooks Customers (name, QBO ID) and link to Companies; add a QBO alias note for the five mismatched names; resolve PO 28064 and 28038 before linking invoices. | Stops wrong-invoice links; enables partial-shipment and billing views. | M | none | Ryan (Kenny confirms PO collisions) | none |
| 8 | Add a Store Stage single-select on Projects (Products selected, Pricing set, Artwork, Build, QA, Launched, Closed) and apply it to the 20 store projects. | Store builds tracked without a new table. | S | none | Mickey via Ryan | 6 |
| 9 | Proofs discipline: one Proof record per supplier line with Art Approved NO on the sheets (17 today), Version, Sent Date, Approval Evidence link. Artwork Revisions and Awaiting Proof Approval pages already exist. | Artwork delays visible; approved version recorded exactly. | M | none | Mickey | 6 |
| 10 | Vendor knowledge capture: a Vendors table (contact, lead time, who does art, setup fee policy, freight rule, last confirmed by Kenny on date) seeded from the sheets and the Quote Reconciliation item scopes. | Reduces Kenny dependency; makes the sheet's "Trish Mock Up / Brandon Will Do / Jimmy Will Do" knowledge explicit. | L | none | Ryan drafts, Kenny confirms by email | none |
| 11 | Connect the three CA mailboxes to the Claude/Grokbot environment that does the reconciliation (or state clearly that reconciliation runs only on Ryan's machine). Add a "Last reconciliation run" record that the job must update. | Makes "is the monitor running" answerable; prevents silent failure. | S | none | Ryan | hosting decision (open question) |
| 12 | Decide Grokbot Reply Desk scope: either it writes Team Updates and Follow-up Review rows only (review items, no sends), or it is retired in favor of rows 3 to 5. | Avoids two systems claiming the same job. | S | none | Ryan | 11 |

## 4. Simple daily workflow

Ryan (10 minutes, Airtable):
1. Open "Deadlines and Missing Dates". Anything past or within 3 days with no shipment: email Kenny one question ("Did 27990 ship? Tracking?").
2. Open "Email Response Queue" filtered to Needs our reply. For each, either reply (new sourced leads) or forward the one-line ask to Mickey.
3. Open "Team Updates to Review". Confirm each against the email thread; set the project's next action and date; mark the update Confirmed or Superseded.
4. Once a week: "QuickBooks Quotes to Reconcile" and the Nurture list.

Mickey (email only):
- 7 AM email: at most 10 lines, each "Customer | what | due | reply with: done / date / blocker".
- Reply to the brief with one word or date per line. Phone updates from suppliers go in the same reply, labeled "phone".
- Any proof sent or approved: forward the email to the Airtable inbound address with the PO in the subject.

Kenny (email, phone, text):
- 7 AM email: deadline lines first ("27990 Town Center was due 10/7, status?"), then supplier questions, then customer work.
- Reply by email or text Ryan; Ryan or Mickey logs the phone note as "needs written confirmation".
- No Airtable.

## 5. Seven-day plan

Day 1 (Fri Oct 9): Act on the five late or at-risk orders by email to Kenny (Goodless 27911, NYAC 27956, Farm & Forge 27959, Town Center 27990, Wildcats 27989). Set Mustang in-hands date (race Oct 24, confirm with Mike). Clear Camp NEOC's owed reply through Mickey.
Day 2: Row 1 and 2 (re-date, fill supplier dates, create the Late view). Row 6 (clean pick-lists, add Patricia).
Day 3: Row 3 (deploy the 7 AM brief with real data; send a test to Ryan only, then to Kenny and Mickey on Day 4).
Day 4: Row 4 (inbound email to Team Updates). Walk Kenny and Mickey through replying to the brief in two sentences.
Day 5: Row 5 (follow-up formulas) and Row 8 (store stage). Decide Row 12.
Day 6: Row 7 (QuickBooks customer links, PO collisions).
Day 7: Row 9 (proof records for the 17 unapproved lines) and start Row 10 with the Viking and Diamond vendors only.

## 6. Questions I could not resolve from the evidence

1. Where does the reconciliation job run (the record says a Codex schedule and a /workspace path), and is it still scheduled? Nothing has written to Airtable since Oct 8 21:16 ET.
2. Which account owns the Airtable base and what plan is it on? "Native Airtable automation creation blocked by permissions" appears in the briefs, yet a draft automation exists.
3. Were PCNA, SanMar and S&S credentials ever handed to any tool? There is no trace in Airtable or this session.
4. Does Grokbot Reply Desk exist as a running process anywhere, and which mailboxes does it read? Nothing in the base references it.
5. PO 28064 (Nicol Squash vs Vagabond Inn) and PO 28038/28045 (Mission Success vs City Squash): which is correct?
6. Goodless Electric 27911 (in-hands Sep 18) and Wildcats 27989 (ship Sep 25): did these ship? Both still sit on the vendor OPEN tabs.
7. Has Patricia received the Mustang sponsor package, and what is the proof ETA?
