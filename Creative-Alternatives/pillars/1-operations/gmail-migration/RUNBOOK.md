# Gmail Migration Runbook — click-by-click

Written 2026-08-19, mid-signup. Plan + discovery answers:
`plans/2026-07-12-aol-to-gmail-migration.md`. Work through phases in order —
each phase says what it's blocked on.

> **Last verified repository state: 2026-08-20.** Domain verification succeeded,
> `kenny@` was created, and the legacy IMAP source connected. The first import
> was not started because Kenny's legacy mailbox password was missing. MX was
> not changed. Before resuming, confirm this state in Google Admin and confirm
> where new mail currently lands.

**Standing rule until Phase 5: do NOT click anything labeled "Activate Gmail,"
"Set up Gmail," or anything that mentions MX records.** Mail keeps flowing to
the old host until the planned cutover moment.

---

## ⚡ ACCELERATED SCHEDULE (Ryan's call, 2026-08-20): team on Gmail by Monday 8/24

The original phases assumed imports finish before cutover. That's a nicety,
not a requirement — **cutover and imports are independent.** At cutover, new
mail lands in Gmail instantly; history keeps back-filling behind it; nothing
is ever lost (old mailboxes stay intact + post-cutover sweep).

| When | What |
|---|---|
| Thu 8/20 ✅ | TXT added in Squarespace (Maclaine's panel = live NS1 zone, PROVEN by dig); verification submitted to Google |
| Thu–Fri | Users/aliases confirmed; **start legacy IMAP migration** (kenny@ 35GB first); Kenny generates AOL app password |
| Sat 8/22 | Check import progress (morning); no unrelated website/analytics work during the migration |
| **Sat or Sun evening** | **MX CUTOVER** (Phase 5 below) — ~15 min + tests; imports keep running through it |
| Sun 8/23 | Gmail app on Kenny's devices, signatures, AOL funnel in kenny@'s Gmail settings |
| Mon 8/24 | Team reads/sends in Gmail. **Copier scan-to-email is broken from cutover until reconfigured Monday AM** — accepted trade-off. kenny@'s 35GB may still be back-filling for a few days: normal, harmless |

Deferred without risk: OMG CNAME list (other domains — not in this zone),
`_spf.emailcampaigns.net` mystery (its SPF include stays at cutover), old-host
decommission (60-day rule unchanged), Kenny's AOL import (runs next week after
the legacy batch).

### ⏸ PAUSED 8/20 ~1pm — waiting on Kenny's mailbox password

State as left (Admin console → Data → Data import & export → Data Import →
IMAP data import, admin.google.com/u/4/ac/migrate/imap):
- ✅ Domain VERIFIED (TXT live on NS1; zone snapshot saved)
- ✅ kenny@ user created (Kenny Scher; sign-in password: generate via Reset
  password on his user page when handing him the account)
- ✅ IMAP source connected: mail.creativealternatives.com — status "Connected"
- ✅ Step 2 row staged: kenny@ → kenny@, ONLY the IMAP password box empty
- ✅ Step 3: start date set 01/01/1998, deleted/spam excluded — CONFIRM it
  shows Jan 1 1998 on resume (Save may not have registered)
- ⬜ NOT clicked: Start import

To resume when Kenny sends the password: open that page, type the password
into the kenny@ row → Add → confirm Step 3 date → **Start import**. Then add
rows the same way: ryan@ → ryan@ (Ryan's old password), orders@/renie@/ikey@
→ kenny@ (temp password from Bill's 8/18 5:03 PM email).

maclaine@: BLOCKED on the conflicting-account question — she has an old
personal Google account AS maclaine@creativealternatives.com (proved twice:
signup wizard "user already exists" + only 1 user in directory). Ask her: any
real Drive/Docs work in that old account? YES → Transfer tool for unmanaged
users BEFORE creating her user. NO → create user; her old login force-renames.
Her user must exist before her 5GB import row.

### Resume checklist now

1. Confirm the Google Admin migration page still shows the staged `kenny@ → kenny@` row.
2. Confirm new mail still lands on the legacy host; do not assume the old August cutover schedule happened.
3. Get Kenny's legacy `kenny@creativealternatives.com` mailbox password.
4. Enter it, confirm the start date is January 1, 1998, and start the 35GB import.
5. Resolve Maclaine's unmanaged Google-account question before creating/importing her managed user.
6. Schedule MX cutover only after the live state and required senders are rechecked.

---

## Credentials needed on hand (never commit these)

| What | Where it comes from |
|---|---|
| kenny@ / maclaine@ / ryan@ mailbox passwords | Team already has (webmail logins) |
| orders@ / renie@ / ikey@ | Temp password — Bill's 8/18 5:03 PM email |
| DNS panel login | Maclaine ("Mickey") — Squarespace or NS1 |
| Kenny's AOL app password | Kenny generates in Phase 3 (NOT his normal password) |

---

## Phase 1 — TODAY: finish signup, users, verify domain

1. **Finish the wizard.** "Skip for now" anything optional. Skip Gmail activation.
2. **Confirm users:** [admin.google.com](https://admin.google.com) → Menu →
   **Directory → Users**. Want: `ryan@` (admin), `kenny@`, `maclaine@`. Three
   paid seats, no more. Add any missing via **Add new user**.
   - If maclaine@ already existed from the wizard → done, that's the seat.
3. **Get the verification TXT record:** the Admin console home shows a
   **"Verify domain"** task (or Account → Domains → Manage domains → Verify).
   Choose **TXT record** method. Copy the value
   (`google-site-verification=...`).
4. **Maclaine adds it** in her DNS panel: Host/Name = `@`, Type = TXT,
   Value = the string, TTL = default. Nothing else touched.
5. **Verify it took** (also proves her panel edits the live NS1 zone):
   `dig +short TXT creativealternatives.com` — the google-site-verification
   string should appear (give it up to ~1 hr). If it never appears, her login
   is Squarespace-only while the zone lives at NS1 → stop, regroup (GoDaddy
   nameserver re-delegation becomes the path; needs the OMG CNAME list first).
6. Back in Admin console → click **Verify**. Accounts go live.
7. **Parallel task while waiting:** have Kenny generate his AOL app password —
   AOL: Account Security → **Generate app password** (he types his own
   credentials; save the app password somewhere private for Phase 3).

## Phase 2 — After verification: aliases + legacy import (the 35GB clock starts)

1. **Aliases (free, no seats):** Directory → Users → click **kenny@** → User
   information → **Email aliases** → add `orders@` (matches the old
   orders@→kenny@ forwarder). Hold renie@/ikey@ until Kenny says who should
   receive them — then alias to that person.
2. **Start the legacy-host import:** Admin console → Menu → **Data → Data
   import & export → Data migration** → Email.
   - Migration source: **Other IMAP server**
   - Server: `mail.creativealternatives.com`  Port: `993`  SSL: on
   - Start date: **earliest available** (we want everything)
   - Migrate Deleted/Junk: off
   - Add users, one row each — source address + its password → destination:
     | Source | → Destination |
     |---|---|
     | kenny@ (35GB — the long pole, start first) | kenny@ |
     | maclaine@ (5GB) | maclaine@ |
     | ryan@ (1.2GB) | ryan@ |
     | orders@ (55MB, temp pw) | kenny@ |
     | renie@ (64MB, temp pw) | kenny@ (or per Kenny's call) |
     | ikey@ (74KB, temp pw) | kenny@ (or per Kenny's call) |
   - Kenny's 35GB will run **for days**. Leave it. Progress shows per-user in
     the same screen; occasional per-message errors are normal.
3. **Spot-check when each finishes:** oldest email present, folders intact.

## Phase 3 — Kenny's AOL history (after Phase 2's connection completes)

Data migration runs one source connection at a time — start this once the
legacy batch is done.

1. Same Data migration screen → new migration → **Other IMAP server**
   - Server: `imap.aol.com`  Port: `993`  SSL: on
   - Source: Kenny's @aol.com address + the **app password** from Phase 1.7
   - Destination: kenny@
2. This is 27 years of mail — also slow. Spot-check the oldest year when done.

## Phase 4 — Pre-cutover gate (all must be true)

- [ ] All imports complete + spot-checked
- [ ] **OMG CNAME list received from Bill** (waiting since 8/18 — chase ~8/21)
      and confirmed those records live in the DNS panel untouched
- [ ] Copier scan-to-email: get make/model + current SMTP config (it will break
      at cutover; plan its reconfig)
- [ ] Anything else sending as @creativealternatives.com identified
      (Squarespace contact form, QBO invoices, `_spf.emailcampaigns.net` mystery)
- [ ] Team told: "Wednesday evening email moves — read Gmail from Thursday"

## Phase 5 — MX cutover (~15 min, quiet weeknight evening)

In Maclaine's DNS panel:

1. **Delete** the old MX (`mail.creativealternatives.com`).
2. **Add** Google's MX: Host `@`, Type MX, Priority `1`, Value
   `smtp.google.com.` (Google's current single-record setup).
3. **SPF** — replace the TXT with:
   `v=spf1 include:_spf.google.com include:relay.mailchannels.net include:_spf.emailcampaigns.net ~all`
   (keep the two legacy includes until the contact form / newsletter question
   is answered; drop them later).
4. **DKIM:** Admin console → Apps → Google Workspace → Gmail →
   **Authenticate email** → Generate new record → add the TXT at
   `google._domainkey` in DNS → back in console click **Start authentication**.
5. **DMARC:** edit existing record → keep `p=none`, change
   `rua=mailto:billwhite@convergesc.com` → `rua=mailto:ryan@creativealternatives.com`.
6. **Test after ~30–60 min:** send to kenny@ + maclaine@ from an outside
   account → arrives in **Gmail**, not old webmail. In Gmail open the message →
   ⋮ → Show original → SPF/DKIM/DMARC all PASS.
7. Rollback if anything's wrong: restore the old MX record. Nothing is lost —
   old mailboxes still exist.

## Phase 6 — Post-cutover wiring (the next day)

1. **Sweep the stragglers:** re-run a Data migration pass for any mail that
   landed on the old host during propagation.
2. **AOL funnel forever:** in kenny@'s Gmail → Settings → See all settings →
   **Accounts and Import** → "Check mail from other accounts" → add the AOL
   address (app password). Optional: "Send mail as" the AOL address during
   transition.
3. **Devices:** Gmail app on Kenny's phone/iPad (Maclaine assists), signatures
   set to @creativealternatives.com.
4. **Copier:** reconfigure scan-to-email → Google SMTP relay or
   smtp.gmail.com + an app password on a real account.
5. **Update senders:** website contact page, QBO invoice sender, any templates.
6. Daily-brief email mirror → kenny@ + Workspace SMTP
   (see `plans/2026-07-12-slack-daily-brief.md`).

## Phase 7 — The 60-day tail

- Old hosting + all old mailboxes stay ALIVE 60 days minimum (rollback + sweep)
- AOL account: never cancel — it's a permanent free funnel
- After 30 quiet days: drop unused SPF includes, consider DMARC `p=quarantine`
- Write `docs/email-setup.md` (final DNS state, admin/recovery structure,
  no passwords) + HISTORY.md entry + commit

---

## Maclaine account-conflict note

If Maclaine once created a personal Google account as
maclaine@creativealternatives.com AND it holds real Drive/Docs work: run the
**Transfer tool for unmanaged users** (Admin console) BEFORE she first signs
into the new managed account — it converts her old account, data included.
If the old account holds nothing, ignore it: Google forces a rename on her
next old-account sign-in and the managed account wins the address.
