# AR Leak Audit

## 15 Places Invoices Leak After They're Sent

This is a practical audit for businesses that already send invoices, often through QuickBooks, but still chase payment manually.

The goal is not to replace QuickBooks, replace the bookkeeper, or promise a specific recovery result.

The goal is to find where invoice follow-up becomes inconsistent after the invoice is sent.

## How to use this

For each leak point, answer:

- **Yes:** this is handled consistently
- **Partial:** this happens sometimes
- **No:** this is manual, unclear, or missing

Simple scoring:

- Yes = 2 points
- Partial = 1 point
- No = 0 points

Score:

- **24-30:** Strong follow-up system
- **16-23:** Some leakage likely
- **8-15:** Follow-up depends too much on memory and inboxes
- **0-7:** High risk of invoices slipping overdue

## The 15 leak points

### 1. Invoice sent on time

**Check:** Was the invoice sent immediately after the billing trigger?

**Why it leaks:** Every delay before sending creates a delay before payment can happen.

**Evidence to look for:** invoice date, job completion date, service date, approval date.

**Fix:** define the billing trigger and send deadline.

### 2. Correct billing contact

**Check:** Was the invoice sent to the person who actually processes payment?

**Why it leaks:** The main client contact is often not the AP contact.

**Evidence to look for:** billing email, AP contact, client contact notes, bounced emails.

**Fix:** store billing contact separately from the project/client contact.

### 3. Clean invoice details

**Check:** Does the invoice include the information the client needs to approve payment?

**Why it leaks:** Missing PO numbers, job references, dates, or descriptions create avoidable delays.

**Evidence to look for:** client payment requirements, invoice fields, dispute notes.

**Fix:** create client-specific invoice requirements.

### 4. Receipt confirmed

**Check:** Did anyone confirm the client received the invoice?

**Why it leaks:** "I never got it" is common, and sometimes true.

**Evidence to look for:** email delivery, client reply, portal confirmation, read receipt if available.

**Fix:** send a polite receipt confirmation for high-value invoices.

### 5. Payment terms visible

**Check:** Are due dates and payment terms clear in the invoice and follow-up language?

**Why it leaks:** If the due date is buried or unclear, payment timing becomes fuzzy.

**Evidence to look for:** invoice template, email copy, payment link, due date field.

**Fix:** make the due date and payment method obvious.

### 6. Pre-due reminder

**Check:** Is there a reminder before the due date?

**Why it leaks:** Waiting until an invoice is overdue means the first follow-up starts late.

**Evidence to look for:** reminders 3-5 days before due date.

**Fix:** create a pre-due reminder for open invoices above a chosen threshold.

### 7. Due-date reminder

**Check:** Is there a same-day reminder when payment is due?

**Why it leaks:** Due dates are easy for clients to miss without a nudge.

**Evidence to look for:** due-date email, task, or workflow.

**Fix:** create a friendly due-date reminder.

### 8. 3-day overdue follow-up

**Check:** Is there a 3-day overdue reminder?

**Why it leaks:** Small delays become normal when no one follows up quickly.

**Evidence to look for:** email sequence, task history, AR notes.

**Fix:** create a short, polite follow-up at 3 days overdue.

### 9. 7-day overdue follow-up

**Check:** Is there a 7-day overdue reminder with a clear ask?

**Why it leaks:** The follow-up needs to move from "checking in" to "can you confirm payment timing?"

**Evidence to look for:** reminder copy, payment timing request, owner notes.

**Fix:** ask for a specific payment date or blocker.

### 10. 14-day overdue follow-up

**Check:** Is there a 14-day overdue follow-up with escalation logic?

**Why it leaks:** Older invoices need a clearer next step.

**Evidence to look for:** escalation rules, owner visibility, client response history.

**Fix:** define who gets notified and what message goes out.

### 11. Promise-to-pay tracking

**Check:** If a client says "we will pay next week," is that promise tracked?

**Why it leaks:** Promise-to-pay dates often disappear inside email threads.

**Evidence to look for:** promised date, follow-up task, payment confirmation.

**Fix:** log promise-to-pay date and trigger a follow-up if payment does not arrive.

### 12. Dispute category

**Check:** Are disputed invoices categorized?

**Why it leaks:** "Unpaid" is too broad. A missing PO is different from a service dispute.

**Evidence to look for:** dispute reason, owner, next step, resolution date.

**Fix:** use simple categories:

- missing info
- pricing question
- service dispute
- client cash timing
- wrong contact
- unknown/no response

### 13. Escalation rule

**Check:** Is there a rule for when an invoice needs owner or manager attention?

**Why it leaks:** The owner often finds out late.

**Evidence to look for:** invoice amount, days overdue, client importance, dispute status.

**Fix:** create escalation rules by amount and age.

Example:

- over $5,000 and 14 days overdue
- any invoice 30 days overdue
- any disputed invoice with no owner assigned

### 14. Weekly owner report

**Check:** Does the owner get a weekly AR summary?

**Why it leaks:** Without a weekly view, aging invoices become background noise.

**Evidence to look for:** weekly report, aging summary, top overdue invoices, promised payments.

**Fix:** send one weekly report with:

- total open invoices
- invoices due this week
- invoices 1-30 days overdue
- invoices 31-60 days overdue
- invoices 61+ days overdue
- top 10 invoices needing attention

### 15. Follow-up tone and consistency

**Check:** Are reminders polite, clear, and consistent?

**Why it leaks:** Owners delay follow-up when every email has to be written from scratch.

**Evidence to look for:** email templates, tone guidelines, sequence history.

**Fix:** create approved follow-up templates for each stage.

## Quick audit worksheet

| # | Leak point | Yes / Partial / No | Evidence | Fix needed |
|---|---|---|---|---|
| 1 | Invoice sent on time |  |  |  |
| 2 | Correct billing contact |  |  |  |
| 3 | Clean invoice details |  |  |  |
| 4 | Receipt confirmed |  |  |  |
| 5 | Payment terms visible |  |  |  |
| 6 | Pre-due reminder |  |  |  |
| 7 | Due-date reminder |  |  |  |
| 8 | 3-day overdue follow-up |  |  |  |
| 9 | 7-day overdue follow-up |  |  |  |
| 10 | 14-day overdue follow-up |  |  |  |
| 11 | Promise-to-pay tracking |  |  |  |
| 12 | Dispute category |  |  |  |
| 13 | Escalation rule |  |  |  |
| 14 | Weekly owner report |  |  |  |
| 15 | Follow-up tone and consistency |  |  |  |

## What an AR Leak Audit delivers

A paid AR Leak Audit should produce:

- current-state invoice follow-up map
- score across the 15 leak points
- top 3 follow-up leaks
- recommended reminder sequence
- promise-to-pay tracking recommendation
- dispute categories
- escalation rule
- weekly owner report format
- next-step recommendation for whether an Invoice Chase Engine setup makes sense

## Sample follow-up sequence

This is a starting point, not legal or collections advice.

### Before due date

"Hi [Name], quick note that invoice [Invoice #] for [Amount] is due on [Date]. Let me know if you need anything from us to process it."

### Due date

"Hi [Name], invoice [Invoice #] is due today. Here is the payment link again for convenience: [Link]. Thanks."

### 3 days overdue

"Hi [Name], checking in on invoice [Invoice #], which was due on [Date]. Can you confirm whether this is scheduled for payment?"

### 7 days overdue

"Hi [Name], following up on invoice [Invoice #]. If there is anything blocking payment, can you point me to the right person or let me know what is needed?"

### 14 days overdue

"Hi [Name], invoice [Invoice #] is now 14 days past due. Can you confirm the expected payment date or the best contact to resolve this?"

## Prospect-facing close

If you use QuickBooks but still chase invoices manually, the leak is probably not the invoice tool.

It is probably the workflow after the invoice gets sent.

The AR Leak Audit finds the places payment follow-up becomes inconsistent and turns them into a simple follow-up map.
