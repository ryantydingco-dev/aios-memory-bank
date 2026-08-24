# Sendr Data Studio Teardown - Enrichment and Personalized Page Variables

Source: https://www.youtube.com/watch?v=JXZvs7ZgkBs
Created: 2026-06-03

## Big idea

This video explains Sendr's Data Studio workflow: upload/import a table, clean/enrich the rows, connect the table to a Sendr template, generate personalized pages/videos/GIF embeds for each row, then export the enriched CSV and use the personalized page fields as variables inside another outreach tool or CRM.

For Ryan: this is the missing layer between Smartlead and Sendr. Sendr does not have to replace Smartlead. It can generate personalized-page URLs/GIF embeds, then those URLs can be imported into Smartlead as custom variables.

## What the video shows

1. Build or import a lead table.
2. Open Data Studio.
3. Run cleanups:
   - first name cleanup
   - job title cleanup
   - company name cleanup
   - remove LLC-style suffixes
   - find first name from email
   - split full name
4. Optional enrichments:
   - page focus
   - personality enrichment
   - nearby meeting location
   - enrich LinkedIn profile
   - Google search query background
   - verify email through 15 providers
   - find email waterfall
   - competitor name
   - Sendr AI
5. Run personalized pages enrichment.
6. Map table columns to template variables.
7. Generate personalized pages, audio, lip-sync video, and GIF embeds.
8. Export enriched CSV.
9. Upload that CSV to the outreach tool/CRM.
10. Treat personalized page and GIF embeds as normal custom variables.

## Why this matters

This makes the layering clearer:

- Smartlead can still own email sending.
- Sendr can create personalization assets at scale.
- The Sendr-generated page URL/GIF can be mapped into Smartlead as custom fields.

This is different from the Chrome extension video, which was one-to-one manual. This Data Studio workflow supports batch personalization.

## Recommended Ryan workflow

### Conservative version

Do not use Sendr in cold Email 1.

1. Upload top 250 to Smartlead.
2. Send plain text cold email.
3. Use Sendr only after positive replies or for top 25-50 manual accounts.
4. Salesfinity calls warm prospects.

### Aggressive version

Use Sendr batch pages for a controlled test, not the whole list.

1. Take top 50 high-fit mortgage brokers.
2. Upload to Sendr Data Studio.
3. Clean company names/titles.
4. Generate personalized pages/GIFs.
5. Export Sendr-enriched CSV.
6. Import to Smartlead with custom variables:
   - sendr_page_url
   - sendr_gif_embed or gif_url
   - hyperlink_phrase
7. Run an A/B campaign:
   - A: plain text no link
   - B: plain text with Sendr page link in Email 2 only
8. Measure positive replies and meetings booked.

## Suggested Smartlead usage

Email 1 should remain no-link:

"Want me to send the 3 routines I’d set up for {{company_name}}?"

Email 2 can include Sendr link for test group:

"I made the quick version for {{company_name}} here — it shows the 3 approval-only routines I’d start with: {{sendr_page_url}}"

Or avoid naked link:

"I made a quick 3-routine version for {{company_name}}. Want me to send it over?"

Then send manually/reply with Sendr link after opt-in.

## Fit with Salesfinity

Salesfinity should call:

- positive replies
- prospects who viewed Sendr page
- prospects who opened/clicked but did not reply
- high-score leads after 2 touches

Call opener:

"Hey {{first_name}}, Ryan here — I sent over the quick 3-routine AIOS plan for {{company_name}}. I wanted to see if borrower doc follow-up, pipeline visibility, or stale realtor/borrower follow-ups are actually eating time for your team. Worth a quick 15 this week?"

## Caution

Batch personalized pages can create a false sense of progress. The metric is not pages generated. The metric is meetings booked.

Also: putting links/GIFs in cold email can hurt deliverability. Test carefully.

## One-line lesson

Sendr Data Studio can batch-generate personalized page variables that Smartlead can send, but use it as a tested proof layer — not a replacement for deliverability discipline or warm calling.
