# Sendr Campaign 8619 — "Agencies AR Recovery — Leak Check"

**Built:** 2026-06-10 · **Status: DRAFT — awaiting Ryan's launch approval** (toggle top-right of campaign page)
**URL:** https://app.sendr.io/campaigns/8619

## Audience

151 tier-A agency owners (from `agencies_SMARTLEAD_v3_FINAL_2026-06-09.csv`, tier A only — all SMTP_VALID emails, all with LinkedIn URLs + phones). Imported via CSV with mapped columns (First name, Last name, Company name, Job title, Email address, Linkedin profile URL, Website, Phone number).

Source slice: `Lead Engine/Outputs/agencies_TIERA_sendr_2026-06-10.csv`
Wave 2 ready when wanted: 720 tier-B (same file, `tier == 'B'`).

## The sequence (all steps wired to Ryan's LinkedIn channel)

1. **Send Connection** — note: `{{firstName}} — connecting with a few agency owners I've been learning from on the back-office side. Always glad to have good people in the network.`
2. **Wait 3 days**
3. **Check Connection Request**
   - **No →** ends (option later: second check after 7 more days via Go to Step)
   - **Yes →**
4. **Send Message (DM 1, link-free per Ryan Rules):** `Hey {{firstName}}, appreciate the connect.` + the validated chasing-vs-renewals question (agency-adapted)
5. **Wait 3 days** (a reply anywhere stops the sequence — campaign-wide stop-on-reply is ON)
6. **Generate Page** — template 7376 "AR Leak Check cold page", firstName/companyName mapped, **dynamic video background = {{website}}** (their site behind Ryan's video). Outputs pageUrl + gifHtml back to the table. **Pages only generate for accepts** — Ryan's gating rule enforced by sequence position.
7. **Send Message (DM 2, the nudge):** `Made you something better than a deck. 90 seconds, your website's in the video: {{pageUrl}}` + `If the number's small, I'll tell you that too.`

## Caps & pacing

- LinkedIn channel limits (recommended maxes, set in Settings→Channels): 20 connection requests/day, 25 messages/day, 25 profile views/day, 3 connection checks/day
- 151 contacts ÷ 20/day ≈ **8 business days** of connection sends
- Sending window: Mon–Fri 9:00–17:00 **America/New_York**
- Stop on reply: ON
- Email channel (ryan@dealthreads.io, 15/day) is connected but NOT used in this sequence — cold email stays on Smartlead after warmup (~Jun 22)

## Launch checklist (Ryan)

1. ☐ Optional: swap template 7376's CTA from mailto to a real booking link
2. ☐ Flip the campaign toggle (top right) from Draft → live
3. ☐ Watch Logs tab + LinkedIn inbox daily; replies auto-stop sequences — answer them personally
4. ☐ Track stats: Contacts tab analytics (In progress / Complete / Replied)

## Build notes (for future campaigns)

- **Contacts MUST be imported via the UI CSV importer**, not the row API — the sequencer's column picker only sees CSV-imported columns. (API rows display fine but steps can't map them.)
- File inputs reject local paths via the extension; workaround = local CORS server + sync-XHR injection (async promises die in the injected JS context).
- Note/message variables use **camelCase contact properties** (`{{firstName}}`), NOT the page-template style `{{firstname}}` — mismatches show "Missing columns" warnings on nodes.
- Step outputs (pageUrl, requestId) become insertable variables in later steps via Add variables.
