# TikTok Pricing Intel

## What it is
Chrome extension + local backend for TikTok Shop sellers who need pricing benchmarks across TikTok Shop, Amazon, Walmart, Shopify-style stores, Temu, and AliExpress.

Local project path:
`/Users/ryantydingco/Documents/Tik Tok PI`

IdeaBrowser project:
`Pricing intelligence extension for TikTok Shop operators`
Project ID: `0829913e-8f6e-49a7-841a-4e315ef5779a`

## Current state as of 2026-05-30
The app is surprisingly built-out technically:
- Chrome extension MVP packaged at `release/tiktok-pricing-intel-extension.zip`
- Operator release bundle at `release/tiktok-pricing-intel-mvp.zip`
- Local backend, dataset refresh, entitlements, checkout scaffolding, lead capture, analytics, admin pages, pilot flows, outreach assets, and many marketing/monetization pages
- `npm run ready` returned `ok: true` with 11 competitors, 6 sources, 14 outreach campaigns, 1 pilot cohort, and release ZIPs present

## Honest assessment
The product has too much surface area for a side project. It looks technically impressive, but commercially unfocused. The biggest risk is not whether something exists in code; it is whether a real TikTok Shop seller trusts the data enough to use it for an actual pricing decision.

The strongest wedge is not a broad "Jungle Scout for TikTok" yet. The wedge is:
"Before you run creator traffic or launch a SKU, check whether your price has room after COGS, platform fees, affiliate commission, and competitor pressure."

## Current monetization reality
The checkout page has Free, Basic ($29/mo), and Pro ($59/mo), but it currently signals checkout links are pending and captures activation intent instead of completing payment. That means the product can capture leads today, but likely cannot self-serve monetize until payment links/providers are wired.

## Best money path
Do not start with passive self-serve SaaS expectations. Start with 10-20 manually recruited beta sellers and sell a hands-on paid pilot/concierge audit.

Recommended offer:
- Free: first SKU/pricing check or first 10 checks
- Paid beta: $29/mo only after seller says the output was useful
- Concierge audit: $49-$99 one-time for 5 SKUs benchmarked manually/with the tool
- Pro later: $59/mo for alerts/bulk scans after repeated usage is proven

## Validation goal
Within 14 days, get 10 real seller conversations and 3 sellers to test with real SKUs. Success is not installs. Success is sellers saying:
- this helped me change a price
- this helped me avoid a bad product/promo
- this saved manual comp research time
- I would pay $29/mo if data stays accurate

## Next concrete actions
1. Wire a simple real payment path or remove customer-facing "checkout pending" language.
2. Create one killer demo around a real/representative SKU showing COGS, fees, affiliate commission, comp median, recommended price, and risk.
3. Recruit 10 sellers from Reddit/Facebook/TikTok Shop communities with a humble beta ask.
4. Offer to benchmark 5 SKUs for free/cheap in exchange for feedback.
5. Track whether anyone takes a pricing action from the recommendation.

## Important caution
Do not build more features until seller data quality and willingness to pay are validated. More dashboards, courses, forums, workshops, and partner pages will create false progress if no sellers trust the core price recommendation.
