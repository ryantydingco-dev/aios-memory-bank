# Maclaine Session Run-Sheet — film 3 videos in one sitting

**Goal:** one afternoon with Maclaine → **3 videos banked** + real CA work done.
- **V1** QuickBooks reconciliation demo (payments → invoices)
- **V2** The Audit `[91]`
- **V3** Reactivation / "forgotten customers" `[85]`

Packaging: `episodes/audit-video-packaging.md` · `episodes/reactivation-video-packaging.md` · script `first-video-script.md`. Prompts: `pillars/1-operations/quickbooks-reconciliation-ai-workflow.md` (V1) + Block C below (V3).

---

## Before you sit down (15 min prep)
- [ ] **Gear:** phone/camera on a tripod for the talking parts + a screen recorder for the demos (Mac: Cmd-Shift-5, or Loom/OBS). Test audio.
- [ ] **Consent:** tell Maclaine she's on camera and the screen will be recorded. South Carolina is one-party, but get her clear OK anyway — she's family and a co-star.
- [ ] Open the two packaging docs + the QuickBooks prompt so you're not fumbling on camera.
- [ ] Pick **one representative month** for the demos (cleaner story, less to anonymize).

## The 3 data exports (pull these WITH Maclaine — it's good footage)
From QuickBooks → Reports/Lists → export CSV:
1. **Invoices** (the month) — customer, invoice #, date, amount, status → *V1*
2. **Payments / deposits** (the month) — date, amount, source/customer, reference → *V1*
3. **Customer + order history** (all customers) — customer, first order, **last order date**, # orders, **total $ spent** → *V3*

## Anonymize BEFORE anything hits the screen (operator's code)
Work on a **copy**. Swap real customer names → "Customer A/B/C" (find-replace), mask any account/bank numbers, round dollars if you want. Real data is fine to feed the AI privately — but the *recording* must be clean. Maclaine approves what's shown.

---

## On-camera running order (do it in this sequence — it's the most efficient)

### ▶ Block A — The Audit conversation (V2) · talking-head + b-roll
Walk Maclaine through the ops map, capture the leaks live. Ask, in order:
quote → order → supplier → proof/approval → fulfillment → shipping → **invoice/QuickBooks** → reorder.
For each: *who does it, what tool, how long, where it breaks.*
- **Capture (the V2 `[FILL IN]`s):** top 3 time-leaks, rough hours/week each, the #1 automation to build first.
- This conversation also *teees up* B and C — the QuickBooks pain and the "customers we never hear from again" both surface here naturally.

### ▶ Block B — QuickBooks reconciliation demo (V1) · screen-record
1. Maclaine says the line: "we spent 8 hours doing this by hand."
2. Show the 2 exports. Paste the **reconciliation prompt** (from the workflow doc) + the 2 CSVs into Claude.
3. **Hit go on camera.** React honestly to the output. **Spot-check the exceptions** — that's the 20% a human verifies.
- **Capture (the V1 `[FILL IN]`s):** the REAL AI time (vs 8 hrs), # of exceptions, and anything AI caught that a tired human would miss (a duplicate, an unpaid invoice, a mismatch).

### ▶ Block C — Reactivation demo (V3) · screen-record
Paste this with export #3 (anonymized):
```
You're my customer-reactivation assistant. Here is our customer + order history:
each row = customer (anonymized), first order date, last order date, # orders,
total $ spent. Today's date is [DATE].

Find the "forgotten" customers worth winning back:
1. Flag every customer whose LAST order is more than [9] months ago.
2. Rank them by total $ spent (biggest lost value first).
3. For the top 20, draft a short, warm win-back message (2-3 sentences) in a
   friendly small-business voice — it's been a while, no hard sell.
4. One-line summary: # dormant customers, total past $ they represent, and the
   single biggest one to call first.

Rules: only use the data given. Never invent a customer or a number. If "months
since last order" is unclear for a row, put it in a "needs review" list.
```
- **Capture (the V3 `[FILL IN]`s):** # dormant customers, the REAL **$[X]** of past value, the oldest gap, and the drafted win-back message on screen.

---

## After the session
- [ ] Drop the real numbers into each script/packaging (`[FILL IN]` / `$[X]` / `[REAL]`).
- [ ] Cut **Shorts** from the three result-reveals (the "$[X] found," the time drop, the AI catching an error).
- [ ] V3 is also **real money** — hand the ranked win-back list to Maclaine to call/email. Fastest revenue in the whole sprint.
- [ ] `youtube-launch-loop` after each upload.

## Guardrails
Anonymize before screen-share · no account/bank numbers on camera · Maclaine approves what airs · never publish a faked number — if the honest result is small, the honest result is the story.
