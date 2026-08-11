# Install — auto-close on the Viking & Diamond sheets (~5 min each)

Same script goes in both sheets. Do Viking first, watch it work for a day, then Diamond.

## Step 0 — verify the tab layout (30 seconds, matters)
Open the sheet and look at the TABS at the bottom. This script expects OPEN and CLOSED to be
two separate tabs (one tab name containing "open", one containing "closed"). If instead it's
ONE tab with an OPEN section on top and CLOSED below, stop and tell Claude — different script.

## Step 1 — paste the script
1. Open the sheet → Extensions → Apps Script
2. Delete whatever is in the editor, paste ALL of `auto_close.gs`, hit Save (name it "CA Auto-Close")

## Step 2 — authorize + install triggers
1. Reload the spreadsheet tab — a "CA Auto-Close" menu appears next to Help
2. CA Auto-Close → "Install triggers (run once)"
3. Google will ask for authorization (it's your own script reading your own sheet) — approve
4. You should see the toast "Auto-close triggers installed."

## Step 3 — test with one row (don't skip)
1. Pick a CLOSED-worthy test: paste a fake tracking number like `1Ztest123456` into the
   Tracking cell of a junk/test row in OPEN (or add a test row: PO "test1", description "test")
2. Within a second or two the row should vanish from OPEN and appear at the bottom of CLOSED
3. Check the hidden `_auto_log` tab (right-click a tab → Show sheet if needed): the move is logged
4. Delete the test row from CLOSED

## What Kenny and the printer need to know (nothing changes for them)
- Printer types a tracking number → row closes itself. That's it.
- Messenger/pick-up jobs close when the row says Complete / Picked Up / Done.
- If a row closes by mistake: cut it from CLOSED and paste it back into OPEN — the script
  won't fight you (it only re-closes if the tracking/complete marker is still there).
- Bold formatting travels with the row (the "must ship on date" rule survives).

## Rules reference
- Tracking closes a row only if it's 8+ characters (stray "x" won't close an order)
- "Complete" alone does NOT close a UPS row — UPS rows need tracking
- Week-divider rows and anything without both a PO number and description are never touched
- Backstop sweep runs every 30 minutes in case an edit slips past the instant trigger
