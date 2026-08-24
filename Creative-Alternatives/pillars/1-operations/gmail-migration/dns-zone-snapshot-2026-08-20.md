# DNS zone snapshot — creativealternatives.com — 2026-08-20 (pre-migration)

Captured live from the Squarespace DNS panel (account.squarespace.com →
Domains → creativealternatives.com → DNS Settings), logged in as Maclaine.

**KEY FINDING:** Maclaine's Squarespace account DOES edit the live zone.
Squarespace runs this "linked" domain's DNS on NS1 infrastructure
(dns1–4.p08.nsone.net) — the "third-party" label refers to the GoDaddy
registration, not DNS. This panel is the cutover switch.

No Order My Gear CNAMEs exist on THIS domain — the OMG store custom domains
must be separate domains entirely. Bill's CNAME list still wanted for cutover
completeness but does not gate changes here.

## Squarespace Defaults preset (website — DO NOT TOUCH)

| Type | Name | Priority | TTL | Data |
|---|---|---|---|---|
| A | @ | — | 4 hrs | 198.185.159.145 |
| A | @ | — | 4 hrs | 198.185.159.144 |
| A | @ | — | 4 hrs | 198.49.23.145 |
| A | @ | — | 4 hrs | 198.49.23.144 |
| CNAME | www | — | 4 hrs | ext-sq.squarespace.com |

## Custom records (email — this is what changes at cutover)

| Type | Name | Priority | TTL | Data |
|---|---|---|---|---|
| A | autodiscover | — | 4 hrs | 216.37.42.183 |
| MX | @ | 0 | 4 hrs | mail.creativealternatives.com. |
| TXT | @ | — | 4 hrs | v=DMARC1;p=none;rua=mailto:billwhite@convergesc.com |
| A | webmail | — | 4 hrs | 216.37.42.183 |
| A | mail | — | 4 hrs | 216.37.42.183 |
| TXT | @ | — | 4 hrs | v=spf1 +a +mx +ip4:216.37.42.247 +ip4:216.37.42.183 +include:relay.mailchannels.net +include:_spf.emailcampaigns.net ~all |

## Changes log

- 2026-08-20: adding TXT @ `google-site-verification=Ly1lZl8zVo7NrpjbmijuzMuKrizzWv2xEjK_mv4gZZ4`
  (Workspace domain verification — additive, zero mail/site impact)

## Cutover-night reference (Phase 5 of RUNBOOK.md)

- MX @ → replaced with `smtp.google.com.` priority 1
- SPF TXT → `v=spf1 include:_spf.google.com include:relay.mailchannels.net include:_spf.emailcampaigns.net ~all` (legacy includes dropped later)
- Add DKIM TXT at `google._domainkey` (generated in Admin console)
- DMARC rua → ryan@creativealternatives.com
- mail/webmail/autodiscover A-records: LEAVE during 60-day rollback window
  (webmail access to old host), remove at decommission
- Rollback = restore this file's Custom records exactly
