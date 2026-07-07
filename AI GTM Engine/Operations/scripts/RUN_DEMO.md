# Run the AI Contact Form — live demo

The "show me it working" demo: a real smart contact form → live buyer-profile
enrichment (company + person) → real HubSpot contact + note. Runs locally.
This is what you screen-share on a sales call.

## One command to launch

```bash
cd "/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Operations/scripts"
set -a
source /Users/ryantydingco/Documents/AIOS/aios-starter-kit/.env          # FIRECRAWL + ANTHROPIC
export HUBSPOT_TOKEN=$(grep -E '^HUBSPOT_TOKEN=' /Users/ryantydingco/Documents/AIOS/dealthread-agents/.env | cut -d= -f2-)
set +a
python3 demo_server.py
```

Then open **http://localhost:8754**

- `/`     → the smart contact form (what sits on a client's "Talk to Sales" page)
- submit  → ~30s live enrichment, then the rep dossier renders
- `/crm`  → the rep's inbox (every enriched lead, newest first)

## What happens on submit (the whole pitch, live)
1. Form posts name + work email + company website + message.
2. `buyer_profile_enricher.py` runs live: scrapes the company site, searches
   funding/size, and runs `<name> <company> LinkedIn` to identify the person.
3. The rep dossier renders: **who actually filled it out** (title, seniority,
   LinkedIn, buying role, match confidence) + the full company profile + a
   call-prep brief + an honest "what it still can't tell you" list.
4. A **real HubSpot contact is upserted** (by email) with the profile note
   attached — so the rep opens HubSpot and the dossier is already there.

## Demo tips
- Run it once before the call to warm it up; the first enrichment can be slower.
- Submit the PROSPECT'S OWN company on the call ("watch — I'll fill out your
  form as a lead"). The person block lands hardest when it's someone they know.
- Use a clearly-demo email (e.g. `name.demo@theircompany-demo.com`) so you don't
  create junk in your real HubSpot. Or point `HUBSPOT_TOKEN` at a sandbox.
- To run WITHOUT touching HubSpot: just don't export `HUBSPOT_TOKEN` — it falls
  back to "stub" mode and still renders the dossier + writes the local CRM.

## Honesty guarantees (tested)
- Fabricated/unknown person → `confidence: none`, no invented title.
- Role inbox (`info@`, `sales@`) → refuses to identify a person.
- Company fields it can't verify → marked `unknown`, never fabricated.

## Files
- `demo_server.py`            — the form + enrich + CRM/HubSpot server
- `buyer_profile_enricher.py` — the engine (company + person enrichment)
- `teardown_page.py`          — turns a saved profile JSON into the free teardown lead magnet
- `demo_leads.jsonl`          — local CRM log (every submission)

---

## HOSTED version (live, no laptop needed)

**Public URL:** https://ai-contact-form-demo-production.up.railway.app
- `/`     the form (send this to anyone, or pull it up on any call)
- `/crm`  the rep inbox

Deployed on Railway (project `ai-contact-form-demo`, id `14047de1-596e-4489-b56e-d85a0c6dfc26`,
workspace ryantydingco-dev). Source of truth = `/Users/ryantydingco/Documents/AIOS/aios-starter-kit/ai-contact-form-demo/`.

**Hosted posture (on purpose):**
- Enrichment is LIVE (company + person). HubSpot is **stubbed** — a public link must
  not carry your production CRM token. The dossier still renders fully.
- Rate-limited: 6 submissions/IP/hour, 150/day (bounds API cost on a public form).
- The host's `/crm` log is **ephemeral** — it resets on each redeploy. The local run persists.

**Redeploy after editing the code:**
```bash
cd "/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine/Operations/scripts"
cp demo_server.py buyer_profile_enricher.py /Users/ryantydingco/Documents/AIOS/aios-starter-kit/ai-contact-form-demo/
cd /Users/ryantydingco/Documents/AIOS/aios-starter-kit/ai-contact-form-demo && railway up --ci
```

**To make the hosted link push to a HubSpot SANDBOX (optional, later):**
1. HubSpot → Settings → Account Management → Sandboxes → create a *Standard* sandbox.
2. In the sandbox: Settings → Integrations → Private Apps → create app with
   `crm.objects.contacts.read/write` + `crm.objects.notes.write` scopes → copy the token.
3. `cd .../ai-contact-form-demo && railway variables --set "HUBSPOT_TOKEN=pat-xxxx" && railway up --ci`
   Now the public link pushes to the sandbox, not your real CRM.

**For the LIVE-HubSpot wow on a call:** run it locally (top of this file) — your real
token is there, contacts are created for real, and you delete the demo ones after.
