# Sendr Tables and Lead Finder Teardown - CSV Upload, LinkedIn Scraping, Lead Finder, Email Enrichment

Source: https://www.youtube.com/watch?v=mvbQqihIqMA
Created: 2026-06-03

## Big idea

This video explains how Sendr creates lead tables before connecting them to templates/personalized pages. You can upload your own CSV, scrape LinkedIn post comments/reactions, or use Sendr's lead finder. Then you can enrich the table with verified emails and use only the rows with accurate emails for email outreach.

For Ryan: Sendr can be a lead-source/enrichment layer, but it should not replace AI Arc or Smartlead by default. Its most interesting use is sourcing high-intent LinkedIn reactors/commenters and enriching them into a Smartlead/Salesfinity workflow.

## What the video shows

### 1. Upload CSV

If Ryan already has a lead list, he can upload it into Sendr without using credits.

Use case:

- AI Arc mortgage broker CSV
- top 250 scored prospects
- future vertical lists

### 2. LinkedIn post comment/reaction scraping

Sendr can scrape people who commented on or reacted to a LinkedIn post.

Returned fields include:

- first name
- last name
- LinkedIn profile URL
- profile picture
- LinkedIn headline
- reaction type
- LinkedIn post URL

Use case:

- scrape people engaging with mortgage broker content
- scrape reactions/comments on loan officer tech posts
- scrape reactions/comments on AI-for-mortgage posts
- scrape people engaging with competitors/industry influencers

### 3. Sendr Lead Finder

Sendr claims a 479M B2B contact database updated every 30 days.

Filters include:

- company industry
- job title
- seniority
- location
- keywords
- skills
- profile industry
- LinkedIn profile batch
- company type
- funding
- employee count

Example in video: save 500 leads at 0.25 credits/contact = 125 credits.

### 4. Email enrichment

In Data Studio, Sendr can run find-email enrichment using company website and person data.

They claim emails are triple-verified and bounce rate can be under 1% for found emails.

Important: rows where Sendr cannot find email should be filtered out of email outreach and used for LinkedIn instead.

## What this means for Ryan's stack

### AI Arc remains the known source

Ryan already has AI Arc mortgage broker data. Use that first because it is already pulled and partially verified.

### Sendr can add net-new leads

Best Sendr lead-source use is not generic lead finder. It is high-intent LinkedIn engagement scraping.

Examples:

- people commenting on mortgage marketing posts
- people reacting to posts about borrower follow-up, loan officer productivity, CRM pain, mortgage tech
- commenters on competitors or mortgage influencer posts

That gives us a warmer reason to reach out than a blind database record.

### Smartlead still owns sending

Use Sendr's exported enriched CSV in Smartlead when emailing.

### Salesfinity calls enriched/warm prospects

Use Sendr-enriched phone/email/contact data plus intent source to prioritize calls.

## Recommended workflow

### For current mortgage campaign

1. Keep AI Arc as base list.
2. Use Hermes to score/segment.
3. Upload top 50-100 to Sendr only if creating personalized pages.
4. Export Sendr fields back into Smartlead.
5. Salesfinity calls positive replies/page viewers.

### For more leads

Use Sendr to scrape LinkedIn engagement, not just generic database search.

Potential sources:

- top mortgage broker coaches
- loan officer marketing pages
- mortgage CRM companies
- mortgage AI/automation posts
- lending industry newsletters/influencers

Process:

1. Find relevant LinkedIn post.
2. Scrape commenters/reactions in Sendr.
3. Filter by title/company fit.
4. Run email enrichment.
5. Put verified emails into Smartlead.
6. Put no-email leads into LinkedIn/manual touch queue.
7. Salesfinity calls warm/high-fit leads after enrichment.

## Caution

Generic lead finder lists are not automatically good leads. A giant database can become a giant trash cannon.

The strongest Sendr lead source is intent-based LinkedIn engagement because the outreach can say:

"Saw you engaging with a post about {{topic}}..."

But only use that if true.

Also verify any under-1% bounce claim with our own bounce data before scaling.

## One-line lesson

Sendr can create and enrich lead tables, but its best role for Ryan is finding high-intent LinkedIn-engaged prospects and feeding verified contacts into Smartlead/Salesfinity — not replacing the whole outbound system.
