# Corrected Meedro Intelligence Workflow

Created: 2026-06-28

## Bottom Line

The Meedro AI Agent was the wrong primary workflow for Ryan's use case. It returned `0 fetched | 0 analyzed` repeatedly.

The real intelligence layer is:

1. Viral Finder
2. Viral Library
3. Insights
4. Recreate With a Twist / Templatize Script
5. Bulk List for batches of known video URLs
6. Scripts for net-new script generation

## What Each Meedro Module Is Actually Good For

### Viral Finder

Best for watchlist-based competitor intelligence.

Observed value:

- Tracks accounts in the watchlist.
- Shows viral outlier videos from those accounts.
- Provides metrics:
  - views
  - likes
  - comments
  - engagement rate
  - viral multiple
  - duration
- Provides actions:
  - Video Link
  - Get Script
- Has account discovery:
  - Find Accounts
  - Search by description or exact handle
  - Add Account
  - Analyze Watchlist
  - History

Use this as the main daily/weekly intelligence dashboard.

### Viral Library

Best for broad discovery across Meedro's database.

Observed value:

- More than 500,000 viral short-form videos.
- Updated monthly.
- Search bar.
- Categories including:
  - AI & Tech
  - Business
  - Marketing & Sales
  - Digital Marketing
  - Content Marketing
  - Make Money Online
  - Tutorials
  - Education
- Each video has Insights.

The `AI & Tech` category works, but it is broader and less targeted than Viral Finder.

### Insights

This is the most important feature discovered.

Observed output:

- Topic
- Hook
- Caption
- Views
- Likes
- Comments
- Outlier Score
- Engagement %
- Account
- Niche
- Published date/time
- Full Video Script
- Script Analysis
- Buttons:
  - Copy
  - Recreate With a Twist
  - Templatize Script
  - Save Script

Example insight opened from Viral Library:

- Account: `@digital.byte_`
- Niche: AI & Tech
- Views: 29K
- Outlier Score: 1.5x
- Hook: "Every full-time job I've ever had, they shipped me a laptop. And I never questioned it because that's just how it worked."
- Structure: relatable personal anecdote -> accepted business process -> hidden operational inefficiency -> software-enabled solution.

Ryan twist:

> "Every promo order I looked at had the same problem: it lived in someone’s inbox, QuickBooks, or memory. And nobody questioned it because that’s just how the business worked."

### Bulk List

Best for batch-analyzing specific video URLs.

Observed value:

- Paste Instagram or TikTok links.
- Upload file.
- Analyze multiple videos at once.
- Meedro says:
  - 1 credit per analyzed video for insights
  - 5 credits to get the full video script breakdown

Use this after Codex/Apify/1of10/vidIQ finds specific URLs.

### Scripts

Best for generating scripts once the topic/hook is known.

Observed value:

- Input topic.
- Select hook style:
  - Outcome Gap
  - Call-Out
  - Storytime
  - Shock
  - Fear
  - Myth-Buster
  - Negative
  - Authority
  - Curiosity Gap
- Select script style:
  - Meedro Agent
  - Problem Solving
  - Myth Busting
  - Step-by-Step
  - Authentic
  - Comparison
  - Educational
  - Storytelling
- Select CTA.
- Select duration.
- Generate.

Use this for net-new scripts after the trend/intelligence phase.

## First Viral Finder Outliers From Current AI Watchlist

These came from Viral Finder using the current AI creator watchlist.

| Rank | Creator | Date | Views | Likes | Comments | ER | Viral Multiple | Duration | URL |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `@nateherkai` | Nov 22, 2025 | 3.3M | 90K | 124K | 6.5% | 122.3x | 0:28 | https://www.instagram.com/p/DRXZJeHiAES/ |
| 2 | `@nateherkai` | Jan 11, 2026 | 2.3M | 60K | 6.6K | 2.8% | 86.9x | 0:31 | https://www.instagram.com/p/DTXqGz2Evxq/ |
| 3 | `@nathanhodgson.ai` | Feb 25, 2026 | 405K | 10K | 8.7K | 4.6% | 66.4x | 0:40 | https://www.instagram.com/p/DVMahdPDu1A/ |
| 4 | `@alliekmiller` | Mar 27, 2026 | 1.1M | 35K | 358 | 3.1% | 50.7x | 0:43 | https://www.instagram.com/p/DWZ0GspkiWV/ |
| 5 | `@nateherkai` | Apr 8, 2026 | 1.1M | 34K | 37K | 6.3% | 41.7x | 0:29 | https://www.instagram.com/p/DW4NudCk9ji/ |
| 6 | `@nateherkai` | Apr 15, 2026 | 590K | 19K | 24K | 7.3% | 21.9x | 0:48 | https://www.instagram.com/p/DXKPTUgEl9z/ |
| 7 | `@realrileybrown` | Dec 22, 2025 | 1M | 26K | 388 | 2.7% | 20.5x | 2:01 | https://www.instagram.com/p/DSjl1PrAg-x/ |
| 8 | `@nathanhodgson.ai` | Apr 28, 2026 | 79K | 2K | 2.2K | 5.4% | 13.0x | 0:50 | https://www.instagram.com/p/DXrRoXIjIIq/ |
| 9 | `@realrileybrown` | Nov 18, 2025 | 636K | 13K | 168 | 2.0% | 12.9x | 1:23 | https://www.instagram.com/p/DRNZQMljW88/ |
| 10 | `@nateherkai` | Mar 25, 2026 | 342K | 9K | 37K | 13.5% | 12.7x | 0:28 | https://www.instagram.com/p/DWUN3OjArsP/ |
| 11 | `@alliekmiller` | Apr 4, 2026 | 245K | 3.9K | 338 | 1.7% | 11.0x | 0:41 | https://www.instagram.com/p/DWtlbmiiKN7/ |
| 12 | `@realrileybrown` | Feb 17, 2026 | 538K | 12K | 263 | 2.3% | 10.9x | 1:51 | https://www.instagram.com/p/DU4adKJiV7a/ |
| 13 | `@nick_saraev` | Dec 23, 2025 | 949K | 34K | 9.9K | 4.6% | 9.5x | 0:48 | https://www.instagram.com/p/DSm-QQ_Dxh3/ |
| 14 | `@nick_saraev` | Mar 2, 2026 | 927K | 30K | 23K | 5.8% | 9.3x | 0:40 | https://www.instagram.com/p/DVYyP3KD2J5/ |
| 15 | `@nick_saraev` | Dec 26, 2025 | 880K | 28K | 14K | 4.8% | 8.8x | 0:37 | https://www.instagram.com/p/DSu3h2Fj1oM/ |

## Correct Workflow For Ryan

### Run Log - 2026-06-28

Executed the corrected workflow after discovering that the Meedro AI Agent was the wrong surface.

What worked:

- Viral Finder opened correctly.
- Current AI watchlist produced ranked viral outliers.
- Top rows included strong signals from `@nateherkai`, `@nathanhodgson.ai`, `@alliekmiller`, `@realrileybrown`, and `@nick_saraev`.
- Top 15 outlier rows were captured into this file.

What failed:

- Viral Finder `Get Script` was tested on the first two top rows.
- Each attempt changed to requesting/processing, then reverted back to `Get Script` without returning a modal, transcript, saved script, or visible error.
- Bulk List accepted the top 5 URLs and consumed 5 credits, moving from 1000 to 995.
- Bulk List then returned an overload failure: "Meedro AI is experiencing a bit of a delay" / "too many requests" / "try again later."

Decision:

- Do not keep retrying and burning credits while Meedro is overloaded.
- Use Viral Finder as the intelligence layer for ranking and URLs.
- Use local Ryan-specific script creation to maintain daily recording momentum.
- Retry Bulk List later with only the top 1-2 URLs.

Output created:

- `Content-OS/Meedro/Meedro Viral Finder Recording Batch - 2026-06-28.md`

### Daily

1. Open Viral Finder.
2. Sort by Outliers.
3. Filter/watch current AI creator watchlist.
4. Pull the top 3-5 new outliers.
5. Open Insights or Get Script for the best row.
6. Extract:
   - topic
   - hook
   - full script
   - script analysis
   - metrics
7. Rewrite into Ryan's niche:
   - 9-to-5 tech account manager
   - rebuilding a real $3M promotional products business
   - weak GTM
   - QuickBooks-only source of truth
   - no CRM discipline
   - manual follow-up and ops
8. Record one video.

### Weekly

1. Use Find Accounts to add or swap creators.
2. Use Viral Library AI & Tech, Business, Marketing & Sales, and Tutorials for broader topic discovery.
3. Use Bulk List for outside URLs from 1of10, vidIQ, Apify, or Firecrawl.
4. Build a 7-day recording queue.

## What Codex Can Automate

Codex can operate Meedro through the browser:

- Open Viral Finder.
- Read current outlier rows.
- Extract metrics and video URLs.
- Open Insights.
- Copy topic/hook/caption/full script/script analysis.
- Create Ryan-twist scripts locally.
- Save the intelligence sheet into the memory bank.
- Paste selected URLs into Bulk List.
- Generate scripts through the Scripts module.
- Maintain a weekly creator watchlist.

Codex should not rely on the AI Agent as the primary intelligence source until Meedro fixes or clarifies the `0 fetched | 0 analyzed` behavior.

## Credit Strategy

Use credits intentionally:

- Free/low-cost first: read Viral Finder rows and Viral Library Insights.
- Spend credits on:
  - full scripts for top outliers only
  - Bulk List analysis for hand-picked URLs
  - Script generation for videos Ryan will actually record

Suggested first paid batch:

- Take the top 5 Viral Finder outliers.
- Get their scripts.
- Turn them into 5 Ryan-twist videos.
- Record one today and queue four more.
