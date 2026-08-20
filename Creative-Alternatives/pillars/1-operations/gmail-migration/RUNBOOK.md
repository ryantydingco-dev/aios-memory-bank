# Gmail Migration Runbook — click-by-click

Written 2026-08-19, mid-signup. Plan + discovery answers:
`plans/2026-07-12-aol-to-gmail-migration.md`. Work through phases in order —
each phase says what it's blocked on.

**Standing rule until Phase 5: do NOT click anything labeled "Activate Gmail,"
"Set up Gmail," or anything that mentions MX records.** Mail keeps flowing to
the old host until the imports are done.

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
