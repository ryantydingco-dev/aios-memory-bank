# Plan: Email Migration — AOL + Legacy Host → Google Workspace on creativealternatives.com

**Created:** 2026-07-12
**Status:** Draft
**Request:** Move Kenny from his ~27-year-old AOL inbox to [REDACTED EMAIL] on Gmail (Google Workspace), preserving all email history, without disrupting [REDACTED EMAIL] or any customer communication.

---

## Overview

### What This Plan Accomplishes

Kenny, Maclaine (and optionally Ryan) get @creativealternatives.com mailboxes on Google Workspace. Kenny's entire AOL history is imported and searchable in Gmail. Mail still sent to his old @aol.com address flows into the new inbox automatically. Existing domain mailboxes (Maclaine's) move over without losing a message.

### Why This Matters

- Succession/modernization priority: "Kenny still runs part of the business off an AOL email he's had since 1999" — this is the single most-cited symbol of the tech debt.
- Gmail on the business domain = shared visibility, professional sender identity for outbound, Google Sheets/Drive already in use, and future AIOS integrations (email triage/automation need a real API — AOL has none worth building on).
- Every customer email lands in one place the AIOS can eventually watch.

---

## Current State

### Verified facts (DNS lookup + Ryan, 2026-07-12)

- **Email host: Always Web Hosting** (confirmed by Ryan) — mail server at `mail.creativealternatives.com` (216.37.42.183, LiteSpeed/cPanel-style shared hosting). Team reads mail via the host's webmail site — meaning **they already hold the mailbox passwords**, which is exactly what the migration tool needs.
- **The website itself is on Squarespace** (creativealternatives.com → 198.185.159.x) — website and email are on SEPARATE services; the migration touches email only, the website is unaffected.
- **MX:** `mail.creativealternatives.com` (SPF permits 216.37.42.247/.183 + relay.mailchannels.net)
- **DMARC report contact:** `[REDACTED EMAIL]` — an outside IT/web consultant (Converge SC) appears to manage the mail/DNS setup
- **Nameservers:** NS1 (`dns*.p08.nsone.net`) — DNS changes happen wherever this is administered (likely the web host or Bill White)
- **Known mailboxes:** [REDACTED EMAIL] (public contact). Kenny uses a personal @aol.com address. Unknown: any other domain mailboxes (info@, kenny@, orders@?)
- SPF also includes `_spf.emailcampaigns.net` (email-marketing sender — OutboundEngine relic?) — must be preserved or consciously dropped at cutover

### Gaps or Problems Being Addressed

- Kenny's business email is on a personal AOL account: no domain identity, no API, no shared access, single point of failure
- Domain email on a legacy web-host server: tied to hosting, no modern tooling
- Nobody on the team knows the full mailbox inventory or who controls DNS — must be discovered before anything moves

---

## Proposed Changes

### Summary of Changes

1. Discovery: inventory mailboxes + confirm DNS/hosting access (likely via Bill White)
2. Google Workspace signup on creativealternatives.com (Business Starter, ~$8/user/mo)
3. Domain verification (TXT record — no mail impact)
4. Create users; migrate Maclaine's existing mailbox and Kenny's AOL history via Google's Data Migration (IMAP)
5. MX cutover to Google (the one irreversible-feeling step — actually reversible by restoring old MX)
6. Post-cutover: AOL funnel into Gmail, send-as, signatures, website/invoice updates
7. Document everything in the workspace

### New Files to Create

| File Path | Purpose |
| --------- | ------- |
| `docs/email-setup.md` | System doc: where email lives after migration, DNS records, admin account, recovery info (no passwords) |

### Files to Modify

| File Path | Changes |
| --------- | ------- |
| `context/business-info.md` | Update contact/email facts after cutover |
| `context/people.md` | Kenny's new address; note AOL funnel |
| `HISTORY.md` | Migration entry |
| `plans/2026-07-12-slack-daily-brief.md` | After migration, switch the brief's email mirror from AOL to [REDACTED EMAIL] and to Workspace SMTP |

---

## Design Decisions

### Key Decisions Made

1. **Google Workspace (paid) over free-Gmail workarounds** — custom-domain email requires Workspace; ~$8/user/mo is the entire cost of exiting two legacy systems. Business Starter tier is sufficient (30GB/user; bump Kenny to Standard's 2TB only if his AOL archive is enormous).
2. **Google's built-in Data Migration service for both imports** — it speaks IMAP to both AOL (`imap.aol.com`, app password required) and the legacy host's server; copies, never deletes. Fallback if either IMAP misbehaves: Apple Mail/Thunderbird dual-account drag, or imapsync.
3. **Migrate history BEFORE MX cutover** — inboxes arrive pre-populated; cutover becomes a non-event. Final incremental re-run after cutover catches stragglers.
4. **AOL account stays alive indefinitely as a funnel** (Gmail "Check mail from other accounts" pulls it; optional "Send mail as" during transition). 20-year customers will use the old address forever; it costs nothing.
5. **Involve Bill White (convergesc.com) rather than working around him** — he evidently controls DNS/mail today. One email/call gets: mailbox inventory, DNS access, and a cooperative cutover instead of an archaeological dig. Kenny likely knows him.

### Alternatives Considered

- **Microsoft 365** — equivalent capability; Google chosen because the team already lives in Google Sheets/Drive and Ryan's stack is Google-centric.
- **Keep AOL, just forward** — rejected: no domain identity, no API, doesn't solve anything structural.
- **Move only Kenny, leave Maclaine on the legacy host** — impossible: MX is domain-wide; everyone moves together.

### Open Questions (need answers before implementation)

1. **Full mailbox inventory** — what @creativealternatives.com addresses exist besides maclaine@? (Ask Bill White or check the hosting control panel.)
2. **Who has the hosting/DNS logins?** Kenny? Bill White? (The NS1 DNS is unusual for a small business — likely consultant-managed.)
3. **How big is Kenny's AOL mailbox?** (AOL shows usage in settings; determines Starter vs Standard tier and migration duration.)
4. **Billing owner for Workspace** — whose card, which admin email?
5. Is `_spf.emailcampaigns.net` (email marketing) still in use, or a relic to drop?

---

## Step-by-Step Tasks

### Step 1: Discovery (no changes, ~1 day elapsed)

**Actions:**
- Contact Bill White ([REDACTED EMAIL]): explain the move to Google Workspace; request (a) list of all mailboxes on mail.creativealternatives.com, (b) how DNS is edited (NS1 login or via him), (c) any forwarders/aliases/autoresponders configured
- Kenny: check AOL mailbox size (Settings → Account Info) and generate nothing yet — just report the number
- Decide user list (kenny@, maclaine@, ryan@?) and billing owner
- Record findings in this plan; flip remaining Open Questions to answered

### Step 2: Google Workspace signup + domain verification (~30 min, zero mail impact)

**Actions:**
- workspace.google.com → Business Starter → domain: creativealternatives.com → admin account per Step 1 decision
- Verify domain via TXT record (added wherever DNS lives — Bill White or NS1 panel). TXT records don't touch mail flow.
- Create the user accounts. Do NOT change MX yet.

### Step 3: Import history (background, 1–3 days elapsed)

**Actions:**
- Kenny's AOL → kenny@: AOL Account Security → "Generate app password" (Kenny types his own credentials); Admin console → Data Migration → IMAP (imap.aol.com:993) → run full copy
- Maclaine's legacy mailbox → maclaine@: same Data Migration flow pointed at mail.creativealternatives.com (credentials from Step 1); repeat for any other discovered mailboxes
- Verify spot-checks: oldest email present, folder structure intact, counts plausible

### Step 4: MX cutover (~15 min change, schedule for a quiet evening)

**Actions:**
- Replace MX with Google's records; keep/merge SPF (`include:_spf.google.com`, retain mailchannels/emailcampaigns only per Step 1 answer #5); add Google DKIM; keep DMARC (update rua to an internal address)
- Old server keeps already-delivered mail; nothing is lost if something's misconfigured — restore old MX to roll back
- After propagation (minutes–hours): send test emails from outside (Gmail, AOL, iPhone) to kenny@ and maclaine@; confirm arrival in the new inboxes

### Step 5: Post-cutover wiring (~1 hr)

**Actions:**
- Re-run both Data Migrations once to catch mail delivered during the transition window
- Kenny's Gmail: Settings → Accounts → "Check mail from other accounts" → add the AOL account (pulls all new @aol.com mail forever); optionally "Send mail as" the AOL address for the transition period
- Set up phones/devices: Gmail app for Kenny (Maclaine assists), signature updated to [REDACTED EMAIL]
- Update the website contact page, invoice templates, and QuickBooks sender email

### Step 6: Documentation + workspace updates

**Actions:**
- Write `docs/email-setup.md` (post-migration state, DNS records as deployed, admin/recovery structure — NO passwords in the repo)
- Update context files + HISTORY.md; `/commit` + push
- Update the daily-brief email mirror to the new address and Workspace SMTP

---

## Connections & Dependencies

- **Daily-brief plan** (`plans/2026-07-12-slack-daily-brief.md`): its interim SMTP-via-Ryan's-Gmail arrangement gets upgraded to Workspace SMTP; `BRIEF_EMAIL_TO` flips from AOL to [REDACTED EMAIL]
- **Outbound/deliverability** (Pillar 2): proper SPF/DKIM/DMARC on Google improves the domain's sending reputation — but campaign sending stays on the SmartLead infrastructure, NOT the main domain
- **Future AIOS email automation** (triage, invoice-chase sends): becomes possible via Gmail API once mail lives on Workspace

---

## Validation Checklist

- [ ] All mailboxes inventoried; DNS access confirmed
- [ ] Domain verified on Workspace without touching MX
- [ ] Kenny's oldest AOL emails visible in Gmail; folder structure intact
- [ ] Maclaine's legacy mail fully imported
- [ ] Post-cutover: external test mail reaches both new inboxes; SPF/DKIM/DMARC pass (check via Gmail "show original")
- [ ] New mail to Kenny's @aol.com appears in his Gmail
- [ ] Website/signatures/invoices updated
- [ ] docs/email-setup.md written; context + HISTORY updated; committed

---

## Success Criteria

1. Kenny reads and sends all business email as [REDACTED EMAIL] from Gmail on his devices
2. Zero emails lost: 27 years of AOL history searchable in Gmail; Maclaine's history intact
3. A customer emailing either the old AOL address or the new domain address reaches Kenny in one inbox
4. The team can grant the AIOS read access to business email in a future phase (Gmail API)

---

## Notes

- **Total cost:** ~$8/user/month for Workspace; migration itself is free
- **Risk posture:** every step before Step 4 is zero-impact; Step 4 is reversible by restoring old MX records
- **Claude's role vs the humans':** Claude can drive DNS lookups, guide every screen, and verify each stage; Kenny/Maclaine type all passwords and approve the Workspace purchase (payment on file = human action)
- **Do not** cancel the AOL account or the old hosting mailboxes for at least 60 days post-cutover
