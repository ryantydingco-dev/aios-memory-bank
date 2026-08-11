# Failure modes — Viking/Diamond auto-close Apps Script

## What it does
Apps Script installed inside each printer sheet (Viking + Diamond). When a row in the OPEN
tab gets a tracking number, or is Messenger/Pick Up with a completed/picked-up marker, the
row is copied to the CLOSED tab and removed from OPEN. Installable onEdit trigger for
instant moves + 30-min time sweep as backstop.

## How it breaks (most likely first)
1. **Simple onEdit can't be trusted** — 30s runtime cap, no authorization, and rapid edits
   overflow the 2-event queue. → We use an INSTALLABLE onEdit trigger plus the time sweep;
   anything the trigger misses, the sweep closes within 30 min.
2. **Paste/multi-cell edits fire weird** — pasting a block can fire the trigger twice or
   with a multi-cell range. → Trigger never trusts e.range alone; it re-evaluates full rows
   against the rules, and LockService prevents double-moves.
3. **Row deletion shifts indexes** — closing two rows top-down moves the wrong second row.
   → Sweep processes bottom-up; single-row moves re-find the row by PO# before deleting.
4. **Delete-before-append data loss** — crash between delete and append destroys the row.
   → Order is: append to CLOSED → verify write → then delete from OPEN.
5. **Tab renames / section-style sheets** — script finds tabs by name fragment (open/closed).
   Kenny renames a tab → script stops. If OPEN/CLOSED are sections of ONE tab (not tabs),
   this design doesn't apply — verify at install.
6. **False positives** — a stray character in Tracking closes a live order; "Complete" in
   Notes on a UPS row does NOT close it (tracking required for non-messenger). Tracking must
   look real: ≥8 chars. Messenger closes need method match AND completed keyword.
7. **Divider/blank rows** — week labels ("July 20-24") must never move. Rows need a PO
   number AND description to qualify.
8. **Bold-means-must-ship formatting** — moves preserve formatting (copyTo with format).

## Limits and cost
Free. Consumer-account quotas: 90 min/day total trigger runtime, 20 triggers/user/script —
this uses 2 triggers and seconds per day. No paid API. Quota exhaustion is effectively
impossible at CA volume (~dozens of edits/day).

## How we'll detect breakage
Every move is appended to a hidden `_auto_log` tab (timestamp, PO, company, rule fired).
Silent failure = tracking numbers piling up in OPEN + empty log. The daily brief reads OPEN
anyway — rows with tracking sitting in OPEN >1 day will show up as approval noise there.

## Mitigations built in
Installable trigger + 30-min sweep, LockService, append-verify-delete ordering, bottom-up
sweep, PO+description row qualification, real-tracking heuristic, keyword+method AND-rule
for messenger, `_auto_log` audit tab, onOpen menu with "Run sweep now" for manual runs.

## Post-build notes
(fill in after first week live)
