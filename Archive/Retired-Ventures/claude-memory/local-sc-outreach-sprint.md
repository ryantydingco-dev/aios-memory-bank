---
name: local-sc-outreach-sprint
description: "Ryan's local SC service-business call/text sprint — geography, postcard-first sequence, offer framing, and source files"
metadata: 
  node_type: memory
  type: project
  originSessionId: 4a05c345-53b1-4637-92fa-658cabdfc442
---

Ryan runs a **local South Carolina service-business outreach sprint** (parallel to his Oloxa B2B track). Target geography is **Chapin / Lexington / Irmo / Columbia / Prosperity / Lake Murray** (the Midlands) — coastal/Upstate leads (Myrtle Beach, Charleston, Hilton Head, Greenville, Spartanburg) are out of scope even when they score high. Best-fit industries: HVAC, plumbing, cleaning/restoration, electrical/fire-life-safety, homebuilders/construction, dental. The **door-opener** is a concrete Google Business Profile problem (review count, photos, missing business hours, or "Ask Maps" AI visibility).

**Why:** This is the local-SMB application of his productized "AI GTM Engine" offer. In his own words the offer is: *"We deploy automated systems that help you run your business more efficiently so you can focus on servicing more customers."* The Google-listing issue is just the wedge to start the conversation.

**How to apply:**
- **Postcards ARE mailed before texting/calling** (confirmed 2026-05-31) — so referencing "I sent you a postcard" in openers is honest, not fabricated. Ryan signs as himself, local in Chapin.
- **Never invent phone numbers.** Leave `owner_mobile` blank and attach an enrichment checklist (LinkedIn contact info → company team page → GBP call-and-ask → Apollo/ZoomInfo/Clay → SC SoS filing → county license). `public_phone` is the published main line for routing calls.
- Source files in `AI GTM Engine/Lead Engine/Outputs/`: `Local_Google_Calls_Sprint_Top_100_Dial_List.csv` (master, has GBP diagnostics + HOT/WARM/COOL `ask_maps_tier`) and `Manual_Text_Call_Queue_Top_50.csv` (subset of the same companies with templated openers). Treat the Top_100 as the authoritative master.
- Best-25 selection workflow lives at `aios-starter-kit/scripts/best25_workflow.mjs`: completeness sweep → rank (title/proximity/issue-concreteness/industry-fit/contact) → adversarial cut-check on all 25 → reconcile/backfill → per-lead human copy → write CSV + notes. Score logic downranks soft issues (already-strong profiles "not in Ask Maps AI") and low-fit industries (insurance, payments, staffing, coworking, trade associations, manufacturers).
- **Workflow gotcha (verified once):** when the workflow hands a pre-built long Markdown string to a "scribe" agent to Write verbatim, the scribe paraphrased ~2% of fields over a 539-line doc (2 of ~125 customer-facing fields drifted), while the short 26-line CSV scribe stayed faithful. Always diff the generated MD's shared fields against the authoritative CSV (a 20-line Python parse) and force-sync; or generate the MD deterministically from the CSV/JSON rather than via a prose scribe. Owner mobiles must stay blank — never let a copy agent populate `owner_mobile`.

Related: [[oloxa-battlecard-workflow]] [[ryan-profile]]
