# Marketing Account Provisioning Runbook

Updated: 2026-07-11

This runbook reflects the authenticated Google account actually available in Chrome. It does not assume Creative Alternatives properties already exist.

## Observed account state

Authenticated Google identity: Ryan's Google account `[private identity recorded in browser; do not copy into public artifacts]`.

| Surface | Observed state | CA readiness |
|---|---|---|
| Search Console | One URL-prefix property for `https://dealthreads.io/` | CA property absent |
| Google Analytics | Welcome/provisioning screen; no Analytics account | CA account and property absent |
| Google Ads | Account selector says no Ads accounts | CA Ads account absent |
| Business Profile Manager | One unrelated duplicate restaurant listing | CA profile absent from this login |
| Squarespace | Login screen | No authenticated editor session |

## Identity decision before creation

Confirm whether Creative Alternatives should be owned by:

1. A company-controlled Google identity `[RECOMMENDED]`
2. Kenny's existing business identity
3. Ryan's personal Google identity with additional company owners added immediately

Do not build long-lived company analytics, ads, Search Console, or Business Profile ownership around a personal login without an ownership and recovery plan.

## Search Console

Recommended property sequence:

1. Add URL-prefix property `https://www.creativealternatives.com/` after confirming the canonical hostname.
2. Verify ownership with a method CA controls. Prefer a DNS TXT record for durable ownership; use an HTML tag in Squarespace only when DNS access is unavailable.
3. Add at least one second company-controlled owner.
4. Submit the live Squarespace sitemap only after the camp pages are published and canonicals are verified.
5. Inspect the commercial page and both resources individually.
6. Request indexing only after the noindex staging directive is absent from the live pages.

Creating or verifying a property changes an external account and may require DNS or site changes. Obtain action-time approval before submission.

## Google Analytics 4

Create only after ownership is decided:

- Account name: `Creative Alternatives`
- Property name: `Creative Alternatives Website`
- Reporting time zone: `United States - New York Time`
- Currency: `US Dollar (USD)`
- Web stream URL: `https://www.creativealternatives.com`
- Stream name: `Creative Alternatives Website`

Then:

1. Install through Google Tag Manager where possible.
2. Map the exact event contract in `config/ca_inbound_measurement.yaml`.
3. Do not send contact-entered PII.
4. Keep raw submit attempts diagnostic-only.
5. Mark `inquiry_submit` secondary until persistence is verified.
6. Test consent behavior before enabling persistent attribution storage.

Account creation accepts platform terms and creates an external property. Obtain action-time approval before final submission.

## Google Ads

The connected login has no Ads account. Before creation confirm:

- Legal business/customer name
- Billing country, time zone, and currency
- Account owner and backup administrator
- Billing profile and payment owner
- Approved research budget
- Approved Northeast or national geography

Create the account without launching an automated campaign where the interface permits. Import the local proposal only through Google Ads Editor, keep every entity paused, run **Check changes**, and do not post or enable until conversion tracking and budget approval pass.

Prepared files:

- `outputs/inbound/implementation/google-ads-editor-proposal.csv`
- `outputs/inbound/implementation/google-ads-negative-keywords.csv`
- `outputs/inbound/implementation/google-ads-conversion-import-plan.csv`
- `plans/camp-search-validation-sheet.csv`

## Google Business Profile

Do not add a new profile from the current login until the actual CA profile state and ownership are confirmed.

1. Ask Kenny which Google identity currently owns or manages CA's real profile.
2. Search Google Maps for the real business listing and confirm name, address/service area, phone, website, and status.
3. Request authorized ownership or manager access to the existing profile instead of creating a duplicate.
4. Use the real-world business name only.
5. Keep the business owner as owner and Ryan/agency access as manager.

The unrelated duplicate restaurant listing visible in the current account should not be edited as part of the CA project.

## Squarespace

The Chrome tab is waiting at login. After Ryan signs in:

1. Confirm the correct site and permission level.
2. Duplicate or record current pages before editing.
3. Stage the camp commercial page and two resources as disabled/unlinked pages.
4. Install the approved HubSpot embed and attribution runtime.
5. Apply metadata, canonicals, internal links, and approved assets.
6. Run desktop/mobile, form, event, and routing QA before public release.

## Required approval bundle

One short owner meeting can clear the inputs:

- Google/company ownership identity
- Squarespace login
- Existing Business Profile owner
- Store and fulfillment terms
- Free concept policy
- Response owner and SLA
- Public camp proof and image permissions
- Ads budget and geography
- Privacy and upload policy

Record dated evidence in `config/ca_inbound.yaml`; never change a launch gate from false to true based only on verbal assumption.
