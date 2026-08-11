# Supplier Product APIs — pulling product lists + images for auto-proofs

**Question answered (2026-06-26):** Can we pull product lists/images from CA's suppliers via API to auto-generate pre-draft proofs / marketing assets? **Yes — all three of CA's top suppliers have APIs.** This is what makes the mockup → proof pipeline (`mockup_logo.py`) automatic instead of manual.

## The three suppliers CA already buys from

| Supplier | API type | Images? | Access |
|---|---|---|---|
| **S&S Activewear** ($327k spend) | **Modern REST, JSON/XML** — `api.ssactivewear.com` | Yes — 8 fields/color: front, back, side, direct-side, on-model front/side/back, swatch. Full image set ~1GB, updated nightly. | API key self-serve from S&S account page. Also a Data Library (Excel/XML, inventory refresh every 15 min) if real-time isn't needed. **EASIEST — start here.** |
| **SanMar** ($549k, #1 supplier) | Web Services + **PromoStandards (SOAP)** — integration guide v24.3 (Feb 2026) | Yes — `getMediaContent` at productId/style level returns flat images, color swatches, model images. | `sanmarintegrations@sanmar.com` / (800) 426-6399 x6458. Also a SanMar Data Library. |
| **alphabroder** ($177k) | **PromoStandards (SOAP)** | Yes — media content (Image/Video/Document), plus product detail, inventory, pricing. | dev.alphabroder.com. **Note: S&S has ACQUIRED alphabroder** — integrations consolidating into the S&S stack over time. |

## Two shortcuts (avoid hand-building 3 SOAP integrations)

- **SAGE API** ← check this FIRST. Aggregates **2M+ products across ALL suppliers** in one API, AND **natively generates virtual samples** ("virtual samples using clients' brand colors"). If CA has **SAGE Total Access** (ask Kenny — most established distributors do), the logo-on-product proof is a built-in feature to call, not build. ESP (ASI) is the equivalent from the other industry network.
- **PSRESTful** (`psrestful.com`) — clean REST/JSON wrapper over PromoStandards suppliers (500+, incl. SanMar + alphabroder). Skips the SOAP pain.

## How it wires into the reactivation/proof pipeline

```
S&S REST API  →  top-seller styles + colorFrontImage URLs
                      │
                      ▼
         mockup_logo.py (composite customer's EXACT logo)
                      │
                      ▼
         pre-draft proof  →  reactivation email / flyer / outbound wedge
```
Fully automatable up to the proof; human reviews before send (operator's code).

## Open actions

1. `[MACLAINE/KENNY]` Request API credentials — they hold the supplier logins. S&S API key first (self-serve, fastest).
2. `[ASK KENNY]` Does CA have a SAGE (or ESP) subscription? If yes, it may do unified catalog + virtual samples out of the box = possibly skip building our own compositor.
3. **Build-vs-buy:** our `mockup_logo.py` = free + full branding control once we have images; SAGE = native proofs but subscription. Decide after #2.
4. **Licensing:** product data/images are licensed to sell those suppliers' products — logo-on-their-tee to sell that tee is the intended use. Don't repurpose imagery into unrelated marketing.

## Sources
- S&S: https://www.ssactivewear.com/marketing/edi · https://api.ssactivewear.com/V2/Products.aspx
- SanMar: https://www.sanmar.com/resources/electronicintegration/sanmardatalibrary · Web Services Integration Guide v24.3
- alphabroder: https://services.alphabroder.com/productData · https://psrestful.com/integrated-suppliers/alphabroder/
- SAGE: https://www.sageworld.com/distributor/overview.html · PSRESTful: https://psrestful.com/
