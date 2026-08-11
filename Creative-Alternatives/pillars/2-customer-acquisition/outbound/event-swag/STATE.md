# Event Swag Engine — working state
# 2026-08-09 WAVE 2 COMPLETE + VOLUME MAXED: campaign 3777819 now at **3,575 leads /
# 7 shows** (PackExpo 1,114 + Fabtech 429 + SEMA 661 + High Point 692 + SupplySide 355
# + ISSA 148 + Greenbuild 176), ALL 199 Ryan inboxes attached, max_leads_per_day=1000
# (camps 150, synagogues 100). Wave-2 harvest→enrich→email→upload ran via background
# agents in one evening. Key API learnings: email_finder needs explicit size= (silently
# caps at 25 without it); Smartlead full fleet = 233 inboxes via offset pagination;
# generic company names need post-enrichment filtering vs the exhibitor list (~30% junk).
# LinkedIn engine built at outbound/linkedin-engine/ (scheduled daily 8am, gated on
# Ryan: template approval + booking link confirm + one "Run now" click).
# 2026-08-08: RYAN APPROVED v3 COPY. Campaign 3777819 is ACTIVE (starts Mon Aug 10
# 9-5 ET), renamed "Swag — Trade Show Exhibitors Oct 2026". Before start, cleaned
# company_name on 686 leads (stripped LLC/Inc/Corp/Co/Ltd suffixes, title-cased
# ALL-CAPS names) via PUT-style POST /campaigns/{id}/leads/{lead_id} with
# {email, company_name} (email is required or the call 400s). name_changes.json
# in scratchpad has the full before/after. Open decisions resolved by approval:
# dealthreads sender domains confirmed, "one roof" claim stays out, incumbent-vendor
# line stays in.

## Ryan's standing instructions (verbatim intent)
1. Commit all pending work in every session. (DONE — repo clean as of fb1d7ee)
2. Do NOT pause the old campaigns (3562809, 3562314 stay as they are).
3. ALL campaigns start MONDAY 2026-08-10: Camps 3726017, Synagogues 3719973, and the
   new event-swag campaign(s).

## Harvest (DONE, committed)
- packexpo_exhibitors.csv — 2,613 (has booth + desc)
- fabtech_exhibitors.csv — 1,364
- sema_exhibitors.csv — 2,064

## Enrichment pipeline (IN PROGRESS — this is the current work)
Validated recipe: mcp ai-ark people_search with:
  companyName = comma-separated batch of exhibitor names (5 tested OK, try 25-50)
  title = "marketing,events,trade show,brand"
  companyLocation = "United States"
  size = 100
→ collect person id + name + title + company domain from each response
→ email_finder (batches ≤1000) → poll email_finder_results (409 while PENDING)
→ email under output[].address, keep found:true AND status VALID/ACCEPT_ALL
→ cross-ref context/import/_exclusion_set.json (360 names/590 domains) before upload.
CREDITS: 99,333 expire Aug 16 — enrich THIS WEEK. Owner login ryan@vantageoutbound.com.
NOTE: companyKeyword param is plan-gated (401) — do not use. companyName verified working.
Start with PACK EXPO list (biggest, earliest show), then FABTECH, then SEMA.
Save enriched output to event-swag/enriched_<show>.csv incrementally.

### Batch 1 learnings (2026-08-07, 100 rows appended to scratchpad enriched_packexpo.csv)
- 40-name batch returned totalElements=1652 — MEGA-COMPANIES FLOOD IT (3M dominated,
  incl. EMEA staff). REFINED RECIPE — add to every call:
    maxEmployees=1000, location="United States" (person-level, not just companyLocation),
    seniority="director,head,vp,c_suite,owner,founder,manager"
- Strip commas from company names before joining (commas split values).
- Working scratchpad: /private/tmp/claude-501/-Users-ryantydingco-Documents-AIOS/
  83239217-a1b8-48bf-a612-99533ca28eb2/scratchpad/event-swag/ (session-specific: COPY
  enriched CSVs to this repo folder at every milestone — scratchpad dies with session).
- **PACK EXPO ENRICHMENT COMPLETE 2026-08-07: all 2,613 companies swept in 65 batches.
  1,646 unique contacts at 926 unique companies (deduped by person_id), saved to
  event-swag/enriched_packexpo.csv.** Next steps in order:
  1. FABTECH sweep COMPLETE 2026-08-07: 616 contacts (enriched_fabtech.csv).
     email_finder SUBMITTED in 3 jobs: ft_chunk1=2eea93ea-e0d5-4c42-9dc7-03719ed613d0,
     ft_chunk2=32967043-70cb-4f56-a45e-9c05cd92e98e, ft_chunk3=f5fb2414-6ce4-47dd-9a27-ee19b54c47a0.
     When DONE: parse (email.output[].address, VALID/ACCEPT_ALL), merge on person_id,
     exclusion cross-ref, upload to campaign 3777819 with custom_fields show_name=FABTECH,
     show_month=October. Same batches-of-100 REST upload as PACK EXPO.
  2. SEMA COMPLETE 2026-08-07: 1,035 contacts enriched, 675 emails found
     (emails_sema.csv), 668 unique leads after dedupe + exclusion cross-ref (0 hits)
     → leads_sema_final.csv → UPLOADED to campaign 3777819 (custom_fields
     show_name=SEMA, show_month=November; Smartlead accepted 661 after its own
     cross-campaign dedupe). **ENRICHMENT PIPELINE FULLY DONE — campaign 3777819
     verified at 2,204 total leads (PACK EXPO 1,114 + FABTECH 429 + SEMA 661),
     status DRAFTED. Only Ryan's copy approval gates the start.**
  3. email_finder SUBMITTED 2026-08-07 for ALL 1,646 PACK EXPO contacts in 6 jobs of ≤280
     (300-id API cap discovered). trackIds in event-swag/ef_trackids.txt:
       chunk1=2694b81e-00cc-4dcd-bbd5-80b508b5841e  chunk2=263c4f3a-19b0-4cd7-ae71-2511acabef9a
       chunk3=a2441997-cf75-4ae7-b042-b3621fbfcd50  chunk4=3a22a305-1777-4a71-9e1b-14b5273efca1
       chunk5=f5dbb414-78ff-4126-9f75-a78b26eed3b4  chunk6=44aaa80b-4d33-474a-934e-0a4611804e40
     Poll email_finder_results(trackId, size=100, page N) once state=DONE (~5-10 min).
     Parse spill files: email at content[].email or profile-level; keep VALID/ACCEPT_ALL.
     Merge with enriched_packexpo.csv on person_id → leads_packexpo.csv
  4. Exclusion-set cross-ref → build campaign 'Swag — Trade Show Exhibitors Oct 2026'
     with show-specific copy (/verify-copy first), 91 Ryan inboxes, schedule Mon Aug 10.
  NOTE: email_finder FIRST on PACK EXPO (earliest show + biggest list) so the campaign can
  launch Monday even if FABTECH/SEMA sweeps are still running — those append later.

## Smartlead launch checklist (before Monday)
- [x] Camps 3726017: **DONE + VERIFIED** — ACTIVE, schedule_start 2026-08-10T13:00Z,
      weekdays 09:00-17:00 ET. (REST worked: key is SMARTLEAD_API_KEY in CA .env;
      POST /campaigns/{id}/schedule then /status {"status":"START"}, UA Mozilla/5.0)
- [x] Synagogues 3719973: **DONE + VERIFIED** — same settings, ACTIVE, starts Monday
- NOTE: AI ARK direct REST does NOT exist at api.ai-ark.com (404 on all probes,
      AI_ARK_API_KEY in .env is for something else). Enrichment MUST go through the
      ai-ark MCP tools; large responses spill to tool-results files — parse those with
      python, batch companyName ~40-50 names/call, size=100.
- [x] NEW campaign BUILT 2026-08-07: **Smartlead 3777819**, fully loaded and DRAFTED.
      **2,204 leads — all three shows (PACK EXPO 1,114 / FABTECH 429 / SEMA 661)**,
      verified emails, exclusion-checked, v3 sequence loaded,
      all 91 Ryan inboxes attached, schedule set Mon Aug 10 9-5 ET weekdays.
      **ONLY REMAINING STEP: Ryan approves v3 copy (2 verify rounds failed, his call
      per verify-copy rule) then POST /campaigns/3777819/status {"status":"START"}.**
      (original checklist item follows)
- [ ] OLD ITEM: NEW campaign "Swag — Trade Show Exhibitors Oct 2026": create, sequence copy
      (show-specific opener naming PACK EXPO/FABTECH/SEMA; mockup wedge; no dashes;
      plain text; approved facts only; run /verify-copy before load), leads from
      enriched CSVs, email accounts = the 91 Ryan Tydingco inboxes (dealthreads*/
      calendargroup*, EXCLUDE Adam Slipakoff's 9 on restoration-homes/rhfund*),
      schedule Mon Aug 10.
- MCP quirk: smartlead_update_campaign_status 404s. Use smartlead_update_campaign_schedule
  (untested) or REST via .env key (blocked earlier by file perms — retry, perms flaky).
- Old campaigns: DO NOT PAUSE (Ryan reversed the earlier decision).

## Do-not-lose facts
- Reply SLA: same-day mockup via the lookbook SOP. All replies to the new campaign are
  Ryan's queue.
- 3%-by-300 tripwire per list; log sends/replies daily.
- Exclusion set MUST run before any lead upload (no cold email to current customers).
