# UTM Conventions — Creative Alternatives

**Rule:** every link to creativealternatives.com that CA controls (outbound email, LinkedIn, Instagram, GBP, future ads) carries UTM parameters. Untagged links are invisible leads. Adopted 2026-08-22 (Phase 0 of `plans/2026-08-19-online-presence-engine.md`).

All values: lowercase, hyphens instead of spaces, no dates inside values (the campaign name carries the identity; HubSpot/GA4 record the timestamps).

## The three required parameters

| Parameter | What it answers | Allowed values |
|---|---|---|
| `utm_source` | Where the click happened | `smartlead`, `linkedin`, `instagram`, `google`, `facebook`, `newsletter`, `partner` |
| `utm_medium` | Channel type | `email`, `social`, `organic`, `cpc`, `referral`, `chat` |
| `utm_campaign` | Which effort | see registry below |

Optional: `utm_content` distinguishes variants within one campaign (e.g. `v3-store-first`, `bio-link`, `post-2026-08-25`).

## Campaign registry

Add a row before inventing a new campaign name. Keep names stable — renaming breaks reporting continuity.

| Campaign | Used for |
|---|---|
| `store-pivot` | SmartLead store-first sequences (all lanes) |
| `schools` | Schools outbound + school niche page promotion |
| `camps` | Camps outbound + camp niche page promotion |
| `gbp` | Google Business Profile website + post links |
| `li-ryan` / `li-kenny` / `li-maclaine` | Each person's LinkedIn content |
| `ig-brand` | CA Instagram bio + posts |
| `ads-search-camps` / `ads-search-schools` | Reserved for gated Phase 4 Google Ads |

## Examples

SmartLead store-pivot email linking to the schools page:

```
https://www.creativealternatives.com/school-spirit-wear-stores?utm_source=smartlead&utm_medium=email&utm_campaign=store-pivot&utm_content=v3-store-first
```

Ryan LinkedIn post:

```
https://www.creativealternatives.com/?utm_source=linkedin&utm_medium=social&utm_campaign=li-ryan
```

GBP website field:

```
https://www.creativealternatives.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp
```

## What NOT to do

- No UTMs on internal links (page-to-page within the site) — it overwrites the real source.
- No PII in any parameter (no names, emails, company names of prospects).
- Don't tag links shared in 1:1 personal contexts where it would look odd if inspected; a clean link to a niche page is fine there.

## Where the data lands

- **GA4:** session source/medium/campaign, automatic once parameters are present.
- **HubSpot:** first-touch and latest-touch UTM fields on the contact (see `inbound/measurement-spec.md` for the property contract). Verify capture during the Phase 0 form test before trusting reports.
