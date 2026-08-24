# Dealthreads SEO Site Implementation — 2026-07-19

Source walkthrough: https://www.youtube.com/watch?v=Z0vZ7mWBLoA

## Decision

Apply the walkthrough's operating sequence to the existing Dealthreads Next.js site rather than rebuilding the site in Astro:

1. establish business truth
2. map buyer searches to page types
3. build one canonical page per dominant intent
4. add technical search and entity signals
5. connect conversion measurement
6. automate pre-launch checks
7. deploy only after human review

The framework is useful. The video's Lighthouse framing needs one correction: a 100 SEO score demonstrates technical readiness, not guaranteed rankings, traffic, citations, or revenue.

## Implemented locally

Repository: `/Users/ryantydingco/Documents/AIOS/dealthread-landing-live`

- Current offer and claim source: `docs/seo/business-truth.md`
- Keyword and page map: `docs/seo/keyword-architecture.csv`
- Core service page: `/outbound-sales-system`
- Commercial comparison page: `/outsourced-sdr-alternative`
- Staffing page retargeted to `staffing agency lead generation`
- Homepage aligned to Offer v2: client team works the call queue; Ryan does not promise daily dialing for every client
- Organization, Service, Person, Article, FAQ, and breadcrumb structured data
- Sitemap, robots, canonicals, metadata, and `llms.txt`
- Optional GA4 through `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- First-party conversion events mirrored into GA4 when configured
- Automated `npm run seo:audit -- http://localhost:5174` pre-launch command
- Cal.com embed changed from eager loading to intent-based loading near the booking section

## Verified

- TypeScript: pass
- Production build: pass
- SEO audit: 62 checks passed, 0 failed
- Homepage Lighthouse local production build: 100 performance, 100 accessibility, 100 best practices, 100 SEO
- Core service Lighthouse local production build: 95 performance, 100 accessibility, 100 best practices, 100 SEO
- Desktop and 390px mobile screenshots reviewed; no clipping or overlapping controls found

Scores vary by network and host. Search performance must be judged in Search Console and against qualified conversion events, not Lighthouse alone.

## Approval-gated launch sequence

1. Review the Offer v2 homepage and both new commercial pages locally.
2. Add the real GA4 measurement ID if GA4 is wanted.
3. Run a real DataForSEO, Ahrefs, or Semrush pass and replace the `Pending DataForSEO validation` fields. Do not invent search volume.
4. Approve deployment.
5. Deploy the existing repository.
6. Run the SEO audit against `https://dealthreads.io`.
7. Verify Google Search Console and submit `/sitemap.xml`.
8. Submit IndexNow only after the deployment is verified.
9. Review non-branded queries, organic sample requests, booking clicks, held meetings, and attributed pipeline every Friday.

No deployment, search-engine submission, message send, or content publication was performed during this implementation.
