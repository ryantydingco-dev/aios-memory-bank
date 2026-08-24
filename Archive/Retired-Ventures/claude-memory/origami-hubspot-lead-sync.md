---
name: origami-hubspot-lead-sync
description: "Lead → HubSpot sync (Salesfinity dialer + Origami tables); built 2026-06-11, runs daily 7:10am, initial sync pending Ryan's HubSpot private-app token"
metadata: 
  node_type: memory
  type: project
  originSessionId: db2cdeee-3ed4-47f0-944a-bac9cad37234
---

Ryan's dialer leads (Salesfinity CSV imports) and Origami-researched leads never reached HubSpot — nothing in the stack pushed them (HubSpot had only 38 contacts as of 2026-06-11). Built `scripts/sync_leads_to_hubspot.py` in aios-starter-kit: pulls all Salesfinity dial lists + all lead-shaped Origami tables, dedupes (3,747 raw → 2,947 unique at build time), upserts to HubSpot in two lanes (email / unique `aios_source_key` for phone-only). launchd `com.aios.lead-hubspot-sync` daily 7:10am.

**Origami** (origami.chat, key in starter-kit `.env`) is the AI lead-research tool pulling leads into tables for the Dealthreads AR-recovery motion ([[dealthreads-gtm-experiment-engine]], [[ai-contact-form-build]]): Agencies Hiring for AR/Billing, Law Firms Hiring for Billing, IT Services — QuickBooks/Xero. Salesfinity key lives in `AI GTM Engine/First-Customer Sprint/14-Day Self Sprint - 2026-06-08/.env.salesfinity`.

**Status:** LIVE. Initial sync ran 2026-06-11 (2,947 contacts in, 0 errors, verified via HubSpot search on `aios_lead_source`). Token is in starter-kit `.env` as `HUBSPOT_PRIVATE_APP_TOKEN`; daily 7:10am launchd run keeps it current.

**Why:** dialer/CRM divergence kept biting him; HubSpot is meant to be the system of record for all lead motions.
**How to apply:** new lead sources should land in HubSpot via this script's pattern (add a puller + normalizer, reuse the two-lane upsert), not via one-off CSV imports.
