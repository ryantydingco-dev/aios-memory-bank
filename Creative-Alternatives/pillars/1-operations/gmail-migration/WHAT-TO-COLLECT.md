# Google Workspace Migration — what to collect before touching anything

Target: move Kenny, Maclaine, and Ryan from the current shared-host webmail to Google
Workspace on @creativealternatives.com.

## What we already know (no need to ask)
| Thing | Finding |
|---|---|
| Registrar | **GoDaddy** (domain created 1998-01-23 — 28 years old, a real deliverability asset) |
| DNS / nameservers | **Squarespace** (`connect1/connect2.squarespacedns.com`) — **MX records live here** |
| Current mail host | Shared hosting at **216.37.42.183**, `mail.creativealternatives.com`, MailChannels relay (cPanel-style) |
| SPF | `+a +mx +ip4:216.37.42.247 +ip4:216.37.42.183 +include:relay.mailchannels.net +include:_spf.emailcampaigns.net` |
| DMARC | `p=none`, reports to **billwhite@convergesc.com** ← the consultant |

## The 3 logins that actually matter
1. **Squarespace** — where MX is edited. This is the cutover switch.
2. **GoDaddy** — the master key. If Squarespace access is ever lost, DNS can be
   re-delegated from here. Get it regardless.
3. **Current mail host control panel** — needed for IMAP credentials and to keep the old
   mailboxes alive during and after cutover.

## Ask the consultant for (copy-paste list)
**Access**
- [ ] Mail host: provider name, control panel URL, admin login
- [ ] Squarespace account access (or confirmation of who holds it)
- [ ] GoDaddy account access
- [ ] IMAP settings: server hostname, port, SSL/TLS
- [ ] Per-mailbox credentials for Kenny / Maclaine / Ryan (needed for the IMAP copy)

**Inventory**
- [ ] Every address on the domain: real mailboxes, aliases, forwarders, catch-all
      (info@, sales@, orders@, accounting@, art@, quotes@ …)
- [ ] Mailbox sizes — decides Workspace tier (Starter 30GB/user vs Standard 2TB/user)
- [ ] How far back mail goes per mailbox
- [ ] Any calendars or contacts stored in the old system

**The gotchas that break print shops specifically**
- [ ] **The copier / MFP scan-to-email** — almost certainly authenticates via SMTP on
      this domain and WILL stop working at cutover. Need make/model + current SMTP config.
- [ ] Any software that sends as @creativealternatives.com: quoting/estimating tools,
      accounting (invoices), order confirmations, the Squarespace site's contact form
- [ ] **What is `_spf.emailcampaigns.net`?** Something is authorized to send as the
      domain — likely a newsletter tool. Find out what and who runs it.
- [ ] Any shared mailbox everyone reads (orders@ style) — Workspace handles these as
      Groups, not user seats, which saves money

## Decisions for Ryan
- **Tier: Business Standard ($14.40/user/mo, 2TB)** recommended over Starter ($7.20, 30GB).
  3 users ≈ **$43/mo**. Kenny's history plus art attachments will exceed 30GB.
- Keep the old host running **30-60 days minimum** after cutover. This is the rollback.

## Kenny's #1 question, answered
**He does not lose his old webmail.** Changing MX only redirects NEWLY arriving mail. The
existing mailbox and every message in it stays on the old host untouched until someone
cancels that hosting. Mail is COPIED to Google via IMAP, never moved. If anything goes
wrong we point MX back and nothing was lost.

## Order of operations (once the above is in hand)
1. Create Workspace, verify domain via a TXT record (no mail impact)
2. Create the 3 users + any Groups for shared addresses
3. **IMAP-migrate all mail while the old system is still live and receiving** — zero risk
4. Test: send/receive on one seat, verify the copier and any sending apps
5. Cut MX over on a low-volume evening (Friday PM or a weeknight)
6. Reconfigure copier + apps to Google SMTP
7. Old host stays alive 30-60 days as rollback
8. Only then tighten SPF/DKIM, and move DMARC from `p=none` toward enforcement — and
   point the DMARC reports at an address CA controls, not the consultant's

## Note: this does NOT touch the cold-email domains
The 53 Inframail domains (dealthreads*, calendargroup*, vantageoutbound*,
creativealternatives-lookalikes) are entirely separate infrastructure. Nothing here
affects them.
