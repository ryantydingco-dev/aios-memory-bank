# Trade-Show Exhibitor Signal — CA Playbook
**Date:** 2026-07-07 · **Method:** two parallel research agents (discovery/scraping + offer/targeting), current 2026 sources. Built as `/ca-tradeshows` (scripts/ca_tradeshow_scout.py). The broadest, highest-order-value motion CA has — any company with a booth is a bulk swag buyer on a deadline.

## Why this is CA's best motion
- **Bulk by definition:** booth giveaways ship in the hundreds/thousands. A mid-size exhibitor's swag order = **$1,500–$10,000+** (giveaways + booth-staff apparel + premium "scan-to-win" items). Overall exhibitor budget $10k–$30k; ~15% goes to marketing/promo incl. swag.
- **Hard deadline = urgency:** the show date is a drop-dead order date.
- **Mockup wedge at max strength:** a fun item themed to *that* show, shown before they ask.
- **Not niche-locked:** every industry exhibits. Huge TAM.

## Timing (the buy-now window)
- Exhibitors set show strategy ~3 months out; the swag order lands **4–10 weeks pre-show** (4–6 wks standard production, 8–10 wks custom/apparel, 90 days for zero-rush premium).
- **Ideal outreach = 8–12 weeks before the show** (strategy set, order not locked, runway for custom). 4–6 wks = "we can still hit your deadline" rush angle (worse margin). >12 wks = nurture.
- Score: peak 8–12w → priority; 4–8w → priority; <4w → rush; >16w → nurture; past → drop. (Implemented in ca_tradeshows.yaml `scoring`.)

## Who to email
**Event Marketing Manager / Field Marketing Manager** — job descriptions confirm they "order and track event giveaways" and negotiate vendors. Fallbacks: Trade Show Coordinator/Manager, Brand Manager, Demand Gen, Marketing Ops; at small exhibitors the Marketing Manager/Director or an EA. Target these titles via AI Ark people_search (company + title) or LinkedIn.

## Best shows to target (mid-size-heavy, crowded, differentiation-driven)
- **Cybersecurity — the standout:** RSA Conference (**649 exhibitors** 2026: 524 product + 64 startups + 61 services), Black Hat USA (**400+** Business Hall, Aug 3–8 2026 Las Vegas). Crowded floors → high swag creativity.
- **Health-tech:** HIMSS (~950–1,200+). **Retail:** NRF Big Show (1,000+, Jan NYC). **Fintech:** Money20/20 (~3,000 companies). 
- Skip giant-dominated CES (4,000+ but agency-locked megabooths). Regional/vertical shows convert well (real budget, thin in-house creative).
- **Repeat exhibitors** (65–80% rebook; only ~44% of first-timers re-book) = proven budgeted buyers → score them higher.

## How to find exhibitors cheaply (owned tools)
- **Pick shows:** tsnn.com Top Lists (biggest US shows, free), 10times.com (deepest, ~25k events, Cloudflare-blocked → Apify actor), eventseye.com, tradefairdates.com.
- **Scrape the exhibitor directory (the signal):**
  - **Map Your Show** powers most big US shows — one pattern: `{event}.mapyourshow.com/8_0/explore/exhibitor-gallery.cfm` → company + booth + website. JS-rendered; Firecrawl renders it. Confirmed subdomains: CES (`exhibitors.ces.tech`), NRF (`bigshow26.mapyourshow.com`), HIMSS (`himss26.`), InfoComm (`infocomm26.`), NAB (`nab26.`), NADA, MODEX, NAMM. **Verified live: 85 exhibitors off one InfoComm gallery page via Firecrawl.**
  - **RSA = RainFocus** (`path.rsaconference.com/flow/rsac/us26/exhibitors/...`, public, JSON API behind). **Black Hat** = own directory + 10times mirror. **Swapcard** (Informa shows) = public pages, scrapable.
  - **Gated/skip:** Cvent, Brella (login-gated).
- **Robust fallback:** Apify `skython/exhibitor-list-scraper` (all-in-one, ~30 platforms incl. MapYourShow/Swapcard/RainFocus, **~$5/1k, free tier 20/run**) — owned (Apify). Use for messy/paginated/gated platforms instead of maintaining per-platform scrapers.
- **What this replaces:** per-show CSV resellers ($50–$350/show: ExhibitorsData, BizProspex, etc.) and Vendelux/ZoomInfo event intel ($15k–$125k/yr).

## The mockup angle (the wedge)
Show a pre-made, show-themed mockup before they ask — "shortens sales cycles, wins more deals" by removing hesitation. Themed examples:
- **Cyber (RSA/Black Hat):** RFID-blocking sleeve, USB **data blocker** ("charge without getting compromised"), laser-engraved aluminum webcam cover, Faraday pouch — each also nods to the exhibitor's own product.
- **General:** recycled power bank (top booth-traffic driver), premium Yeti-style tumbler, branded socks ("that's brilliant"), photo phone holder.
- "Fun/memorable" = functional (daily rotation), on-theme (talking point), gated to a badge scan (doubles as lead qualification). The mockup dramatizes: "here's YOUR logo on the scan-to-win item attendees will keep — and we can still hit your booth deadline."
- Cold-open stat: ~83% of attendees are likelier to visit a booth with giveaways; ~90% remember the brand.

## Downstream (built)
`ca_tradeshow_scout run --show <key>` → `leads.json` (companies + themed opener) → `ca_lead_waterfall resolve-domains` (domain) → AI Ark people_search or harvest (event-marketing contact + email) → `/ca-outbound` (themed mockup opener; tease in email #1, show on reply/LinkedIn).

## Bottom line
Target the **mid-size repeat exhibitor** at a **crowded cyber/health/retail/fintech show**, reached **8–12 weeks out**, emailing the **Event/Field Marketing Manager**, leading with an **AI mockup of a show-themed keep-worthy item**. Exhibitor lists are public → discovery is ~free via Firecrawl (Apify actor as robust fallback). This is the highest-order-value, broadest motion in the CA stack.
