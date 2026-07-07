---
name: lead411-mobile-enrichment
description: "How to enrich lead lists with owner mobiles via the LEAD411 web app (web.lead411.com) in-browser, plus the critical window-focus gotcha"
metadata: 
  node_type: memory
  type: reference
  originSessionId: e14f593c-7589-4fd6-9a6e-dbefe5e23344
---

Workflow for pulling owner/direct **mobile** numbers from LEAD411 (web.lead411.com) via Claude-in-Chrome, used for the Top-50 call/text queue enrichment (see [[local-sc-outreach-sprint]]).

**CRITICAL GOTCHA — window focus:** LEAD411's top search box only accepts typed input while its Chrome window is the **front-most OS window**. If the user is reading the Claude chat, that Chrome window is backgrounded and keystrokes silently fail (input value stays empty, `document.visibilityState`='hidden', dropdown won't fire). JS workarounds do NOT help — injecting the value, firing React's onChange, and spoofing visibility all fail to trigger the search query. The only fix is the real window being foreground. To run a batch, the user must bring the Lead411 Chrome window to the front and stay off the chat for the whole burst. (This silently blocked a 50-row job after 14 rows on 2026-05-31.)

**Per-company recipe:** click search (~x832,y32) → cmd+a, Backspace → type company name → wait 3s → read suggestions via JS, disambiguate by **CSV domain** (many companies share names) → click matching suggestion (opens company tab) → JS-extract employees (a contact has a mobile if Direct Phone cell text matches `Mobile\s*Unlock To View`) → unlock only exact decision-maker or owner-level title (owner/co-owner/president/founder/CEO/principal/partner); skip non-owner staff → click that row's `.unlock-to-view-btn` (1 credit) → revealed **mobile** = number after the `phone_iphone` icon (`high_quality` icon = company line, ignore). Autocomplete component degrades after ~6 searches → reload dashboard to reset. Account had 50 reveal credits.

For the Top-50 job, resumable log + remaining list (#15–50) live at `AIOS-Memory-Bank/AI GTM Engine/Lead Engine/Outputs/lead411_enrichment_progress.md`; rebuild script at `aios-starter-kit/scripts/enrich_top50_mobiles.py`.
