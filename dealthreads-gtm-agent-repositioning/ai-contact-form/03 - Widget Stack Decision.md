# Widget Stack Decision — the done-for-you build spec

> Build spec for the AI Contact Form install (IdeaBrowser #7856, Dealthreads PRIMARY offer). This is a **done-for-you managed install, not a SaaS** — we wire off-the-shelf tools to our own enrichment engine and run it as a service. The "product" is the playbook + the assembled stack, installed per client.
>
> Scope of this doc: pick the capture widget (one recommendation for v1, with reasoning), define the full stack (capture → `buyer_profile_enricher.py` → CRM), draw the v1/v2 line, list exactly what to wire for ONE pilot client, and flag the honest person-level data risk. Companion to `17 — AI Contact Form`.

---

## 0) The one-line architecture

```
[ Capture widget on client's site ]
        │  (POST on submit: name, email, company/domain, message/intent)
        ▼
[ Ingest hop ]  ──►  buyer_profile_enricher.py  (Firecrawl scrape+search → Claude → buyer profile JSON+MD)
        │                                              ~pennies/lead, ~30–90s
        ▼
[ HubSpot CRM ]  contact + company upserted, full dossier in a note/properties, rep task created
        │
        ▼
[ Rep opens the contact BEFORE the callback ]  ← the whole value
```

Async by design: **the rep gets the dossier before the callback (minutes), not inside the chat (seconds).** That dodges the latency problem and is what we sell in v1. Real-time in-chat enrichment is v2.

---

## 1) Capture-widget decision

### The three candidates (the brief's options)

| Option | What it is | Ship speed | Async-enrichment fit | Friction to sell |
|---|---|---|---|---|
| **A. Embeddable AI chat widget** (Chatbase-style) | `<script>` tag, LLM trained on client content, captures intent conversationally, exports Leads via webhook/API | Medium — bot config, prompt tuning, train on content, QA the conversation | Good — fires a Leads webhook we catch | Higher — it changes their site's front door; some buyers resist chat-only |
| **B. Custom lightweight LLM widget** | We build a small embeddable chat/form in JS + an LLM call | Slow — we're now building + maintaining UI per client = creeping toward the SaaS trap | Good (we control it) | Medium |
| **C. Smart form that enriches on submit** | Off-the-shelf form (Tally / their existing HubSpot form) → webhook on submit → enrich → CRM | **Fastest** — drop-in form or reuse the one they have; no conversation to design | **Best** — submit is a clean, single, structured trigger; inherently async | **Lowest** — it's still "a form," no behavior change to defend; we sell the *enrichment outcome*, not a chat UI |

### ✅ Recommendation for v1: **Option C — the smart form that enriches on submit.**

Reasoning, in priority order:

1. **Fastest to ship.** A form submit is one clean structured event (`name, email, company, message`). No conversation design, no bot training, no "did the chat capture the right fields" QA. We can be live on a pilot in days, not weeks. Matches the operator archetype: assemble, don't build.
2. **Async-native.** The whole v1 thesis is "rep gets the dossier before the callback." A form submit → webhook → enrich → CRM is exactly that shape, with zero latency pressure. Chat *invites* a real-time expectation we explicitly are NOT promising in v1.
3. **Lowest sell-friction + dodges the chat-resistance risk** the research flagged. `17` calls out buyer resistance to chat-only front doors. A smart form changes nothing the client has to defend internally — they keep their form, we enrich behind it. We sell the enrichment outcome, not the widget.
4. **Two flavors of C, both fast** — pick per client:
   - **C1 (lowest lift): enrich their EXISTING form.** Most ICP clients already have a HubSpot/Marketo/native form. We don't touch their site — we hang enrichment off the submission they already capture (HubSpot form-submit → our enricher → write back to the same contact). Nothing to embed.
   - **C2 (clean demo / no existing form): drop in a Tally form** (`<script>` embed, free tier, native webhook on submit, 10s timeout, signing-secret verification). Use when the client wants a new capture surface or for our own teardown/demo site.

> **Default to C1 if they have a form; C2 if they don't or want a fresh one.** Either way the back half (enricher → CRM) is identical.

### Why not chat for v1 (and when it comes back)
Chat (Option A, Chatbase-style) is the **v2 upgrade**, sold once a client is live and happy: "now let's replace the form with a conversation that also qualifies." It's the natural Drift-refugee story (they had a conversational front door). But leading with chat in v1 buys conversation-design work, latency expectations, and the one objection (chat-only resistance) we can sidestep entirely. **Don't build B (custom widget) at all yet** — maintaining bespoke UI per client is the SaaS trap `16`/`17` warn against.

---

## 2) The full stack, component by component

### Layer 1 — Capture (off-the-shelf, per §1)
- **C1:** client's existing HubSpot form. Trigger = HubSpot "form submission" automation/workflow, or polling the Forms API. No site change.
- **C2:** Tally form, `<script>` embed, **Connect to Webhooks** → our ingest URL. Free plan supports webhooks. Enable the signing secret (`Tally-Signature`, SHA256) so we verify payloads.
- Fields to capture (keep it short — every field added drops conversion): **name, work email, company name or website, one free-text "what are you looking for / timeline / team size" box.** Email + company/domain is all the enricher strictly needs; the free-text becomes `intent_signals`.

### Layer 2 — Ingest hop (the glue, ~10 lines of logic)
Its only jobs: receive the submission, extract `domain` (from website field, or parse it from the email's domain), call the enricher, hand the result to the CRM step.

- **Domain resolution:** prefer the explicit website field; else derive from the email (`jane@acme.com` → `acme.com`), skipping free-mail domains (gmail/outlook/yahoo → mark `domain_unresolved`, still create the contact, flag for the rep). The enricher is **company/domain-driven**, so a resolvable company domain is what makes the dossier good.
- **Where it runs (cheapest → most managed):**
  - **Make.com or Zapier** scenario: Webhook trigger → HTTP module that runs the enrich step → HubSpot module. Fastest to stand up, no server, visual, easy to hand-tune per client. **Recommended for v1.** (Note: Make/Zapier can't run our Python directly — either (a) wrap `buyer_profile_enricher.py` behind a tiny HTTP endpoint it calls, or (b) re-create the 2 Firecrawl calls + 1 Claude call as native HTTP modules. (a) keeps one source of truth — preferred.)
  - **Tiny serverless function** (Cloud Run / Lambda / Render) wrapping the enricher as a POST endpoint. More control, still trivial. Good once we have 2–3 clients and want one shared endpoint.
- **Critical sequencing for HubSpot:** HubSpot has **no native webhook receiver that creates a contact from an external payload** — workflows only react to records that already exist. So the ingest hop (or the HubSpot module in Make) must **create/upsert the contact via the CRM v3 API first**, then enrichment writes onto it. (Confirmed: external-webhook *enrollment* triggers exist only on Data Hub Pro/Enterprise — don't assume the client has them.)

### Layer 3 — Enrichment (OUR engine — already built, the moat)
`AI GTM Engine/Operations/scripts/buyer_profile_enricher.py` — **no changes needed for v1.**
- **Input:** `--domain` (required), optional `--name --email --form --icp`. The form's free-text box maps straight to `--form`; pass the client's ICP definition as `--icp` so the `icp_fit` verdict is scored against *their* deal profile, not a generic one.
- **Process:** Firecrawl scrape of the company site + 2 Firecrawl searches (funding/size, what-they-do) → Claude (`claude-sonnet-4-6`) assembles a strict-JSON buyer profile. ~pennies/lead, ~30–90s.
- **Output (both already produced):**
  - `--out profile.json` → structured fields for CRM properties: `company, what_they_do, company_size, funding, industry, hq, tech_stack_hints[], likely_decision_makers[], icp_fit{verdict,why}, intent_signals, rep_brief, data_gaps[]`.
  - `--md profile.md` → the human "what your form captured vs. what we built" dossier for the rep note (and the exact format the free teardown Loom walks through — same engine, same output).
- **Honesty is built in:** unsupported fields return `"unknown"`; `data_gaps[]` lists what it couldn't determine. That's a feature — it's what we tell prospects proves we don't fabricate.

### Layer 4 — CRM push (HubSpot — pattern already proven in this repo)
We already push enriched profiles to HubSpot in `hubspot_oloxa_sync.py` (private-app token, CRM v3 API, idempotent upserts, custom properties, associations, task creation). Reuse that exact pattern. Per submission:
1. **Upsert company** by `domain` → set `name, domain, numberofemployees` (from `company_size` when numeric), city/state if known.
2. **Upsert contact** by `email` → set `firstname, lastname, email`, associate to the company.
3. **Write the dossier.** Two complementary moves:
   - **A note on the contact** (`engagements`/notes API) containing `profile.md` — the rep opens the contact and reads the full brief. Lowest-config, works on any HubSpot tier, survives schema changes.
   - **Custom contact/company properties** for the structured bits (mirror the Oloxa pattern with a `dt_` prefix): `dt_buyer_profile_summary` (textarea = rep_brief), `dt_company_size`, `dt_funding`, `dt_icp_fit_verdict`, `dt_icp_fit_why`, `dt_tech_stack_hints`, `dt_decision_makers`, `dt_intent_signal`, `dt_data_gaps`, `dt_profile_source` ("AIOS buyer-profile enricher"), `dt_enriched_at`. Created idempotently via `/crm/v3/properties/{object}` (409 = already exists), same as `ensure_properties()`.
4. **Create a rep task** (`hs_task_subject` = "New inbound: {company} — {icp_fit verdict} fit — call back", body = the brief), associated to the contact, `HIGH` priority. Mirrors `create_task()`. This is what makes the rep actually open it before calling.

> Why both note + properties: the note is the readable dossier (zero schema risk); the properties make it filterable/routable later (e.g., route "strong fit" to senior reps in v2). The note alone is enough to ship v1.

### Layer 5 — Routing (v2 — DO NOT build for v1)
Chili-Piper-style assignment / round-robin / fit-based routing. v1 just creates a HIGH-priority task; the client's existing assignment handles who calls. Skip.

---

## 3) v1 vs v2 — the line

| | **v1 (ship this)** | **v2 (earn it after a paying, happy client)** |
|---|---|---|
| **Capture** | Smart form — enrich their existing form (C1) or drop-in Tally (C2) | Embeddable AI **chat** widget (Chatbase-style) — the conversational front door; the Drift-refugee upgrade |
| **Timing** | **Async** — enrich after submit, dossier in CRM before the callback (minutes) | **Real-time-ish** — enrich during/right after the chat, surface in-thread |
| **Enrichment** | `buyer_profile_enricher.py` as-is (company/domain-driven, free/cheap sources) | + a paid contact API for **person-level** data (see §5); deeper firmographics |
| **Ingest/glue** | Make/Zapier scenario, or one tiny serverless endpoint | Shared hardened endpoint, retries, logging, multi-client config |
| **CRM** | HubSpot: upsert + dossier note + properties + HIGH task | + **routing/assignment** (Chili-Piper-style), SLA timers, speed-to-lead analytics |
| **Reporting** | none (or a manual weekly "here's what we enriched") | monthly intelligence reports (ICP-gap, speed-to-lead) = the $3,500 tier; ICP campaigns = $5,000 |
| **Tenancy** | per-client manual install, hand-tuned | templated install playbook; still managed service, NOT multi-tenant SaaS |

**The discipline (`16`/`17`):** v1 is a manual-ish managed install for ONE client. Prove "form submit → dossier → rep follow-up" is genuinely useful and the client is happy/paying BEFORE templating. The moment this becomes a multi-tenant widget product, we're in the technical-founder second-startup we're avoiding.

---

## 4) Pilot client — exactly what to wire (the build checklist)

Assume one pilot (ideally a Drift-refugee / mid-market B2B that already has a "Book a demo / Request a quote" form and HubSpot).

**Pre-reqs / access to get from the client**
- [ ] HubSpot **private-app token** with scopes: `crm.objects.contacts.write`, `crm.objects.companies.write`, `crm.schemas.contacts.write`, `crm.schemas.companies.write`, `tickets`/`tasks` write (for the rep task), notes/engagements write. (Same token model as the existing Oloxa sync.)
- [ ] Their **ICP definition** in one paragraph (deal size, target industries, company-size band, who the buyer is) → becomes `--icp`.
- [ ] Which **form** to hang off (existing HubSpot form for C1) OR confirmation to drop in a Tally form (C2) and where it embeds.
- [ ] Confirm **HubSpot tier** (do they have Operations/Data Hub Pro+? affects whether we can use native webhook-enrollment vs. must upsert via API first — default to API-first, works everywhere).

**Our side — env / secrets** (flag: confirm these exist before building)
- [ ] `FIRECRAWL_API_KEY` and `ANTHROPIC_API_KEY` for the enricher. ⚠️ **Not currently present** in `aios-starter-kit/.env` (which has ANTHROPIC, OPENAI, etc. but the grep showed **no `FIRECRAWL_API_KEY`** and **no `HUBSPOT_TOKEN`**). The Oloxa sync doc sources a *different* env: `/Users/ryantydingco/Documents/AIOS/dealthread-agents/.env`. **Action: locate/confirm the Firecrawl key and a HubSpot token before wiring** — without Firecrawl the enricher returns raw-research-only; without Anthropic it skips the LLM and returns research only (it degrades gracefully but won't produce the dossier).
- [ ] `HUBSPOT_TOKEN` = the pilot client's private-app token (the enricher/sync read it from env).

**Wire-up steps (C1 path, recommended — enrich their existing HubSpot form)**
1. [ ] **Create the `dt_` custom properties** on contacts + companies (one-time): adapt `ensure_properties()` from `hubspot_oloxa_sync.py` with the `dt_` property list in §2/Layer 4. Idempotent (409 = exists).
2. [ ] **Stand up the ingest endpoint:** wrap `buyer_profile_enricher.py` behind a minimal POST endpoint (input: form fields; runs `enrich()`; returns the profile JSON). Cheapest: a tiny Render/Cloud Run service. (Or: Make scenario calling it.)
3. [ ] **Trigger on submit:** HubSpot workflow/automation on the target form → **Webhook action** (POST) to our ingest endpoint with the contact's email + company + message. (If client lacks the webhook-action tier, instead poll the Forms API every few minutes, or have Make watch the form — same result.)
4. [ ] **Resolve domain** in the hop (website field → else email domain → else `domain_unresolved`).
5. [ ] **Run enrichment**, get `profile.json` + `profile.md`.
6. [ ] **Write back to HubSpot:** upsert company (by domain) + contact (by email) + association; attach `profile.md` as a **note**; set the `dt_` properties; create a **HIGH-priority rep task**. (Reuse `upsert_company` / `upsert_contact` / `associate` / `create_task` patterns verbatim.)
7. [ ] **End-to-end test on a REAL company's public data:** submit the form as a fake lead using a real mid-market B2B's domain (e.g. fill it with a real company's website + a role email pattern). Confirm: contact+company appear, the note reads "holy shit" quality, the task fires, `icp_fit` is scored against the client's ICP, and `data_gaps` is honest.
8. [ ] **Failure handling (minimum):** if Firecrawl/Claude fails, STILL create the contact + a task that says "enrichment failed — basic lead only" so no lead is ever dropped. (The enricher already returns `{error: ...}` / raw-only objects to branch on.)
9. [ ] **Show the client the before/after** on their own next 5–10 real submissions. That IS the proof and the renewal argument.

**C2 path delta (drop-in Tally instead):** replace steps 3–4 with: embed the Tally `<script>`; Tally **Connect to Webhooks** → our endpoint; enable the signing secret and verify `Tally-Signature`; map Tally's field IDs → `name/email/company/message`. Steps 5–9 identical.

**Definition of done (v1 pilot):** a real inbound submission on the client's site results, within a few minutes and untouched by us, in a HubSpot contact whose rep opens a full buyer-profile dossier + a call-back task — and the client agrees it beats what their form gave them before.

---

## 5) ⚠️ The honest risk: person-level data is patchier than company-level

**The enricher is company/domain-driven, and that's its strength.** Firecrawl + Claude reliably build the *company* picture (what they do, size, funding signals, tech hints, likely decision-maker *roles*). That's most of the dossier and it's solid on free/cheap sources.

**Where it's thin: the specific PERSON who filled out the form.** Resolving `jane@acme.com` → "Jane Doe, VP RevOps, here's her LinkedIn / direct line / tenure" is genuinely harder and patchier on free sources. `likely_decision_makers` from the enricher is an *inference of roles to expect*, not verified contacts.

**Rules (do not violate):**
- **Do NOT promise per-person enrichment in v1 until tested.** Sell what's reliable: *"your rep opens a full **company** buyer profile + ICP-fit read + call-prep brief before the callback."* That alone clears the ROI bar and is honest.
- **Mark person-level fields `unknown — verify`** when not supported. Honest gaps are a feature (they prove we don't fabricate) — the enricher's `data_gaps[]` already does this; surface it in the dossier.
- **Test the person-level path on 10 real leads BEFORE quoting it as a feature.** Measure: of 10 real submissions, how many resolve to a correct named person + title? If it's low (expected on free sources), don't sell it raw.

**If a client needs verified person-level data, add a cheap paid contact API as a v2 line item** (budget it, don't eat it). Live options (May 2026), all pay-as-you-go-ish so they fit per-lead economics:
- **Prospeo** — ~$0.01/email enrich, ~92% match / 98% verified, free tier (75/mo). Cheapest entry; good email/identity resolution.
- **People Data Labs** — ~$0.03/person, pay-per-event, no subscription. Broad person/firmographic enrichment.
- **Apollo** — credit-based (email ≈1 credit, phone ≈8, full enrich up to 9); huge DB but watch deliverability/bounce. (Note: our prior Apollo key is dead per the enricher's own comment — would be a fresh paid account.)

Wire it as an **optional enrichment step in the ingest hop**: after the company profile is built, if the client is paying for person-level, call the contact API on the email, merge verified fields, and clearly label them as third-party-sourced vs. inferred. Keep it a toggle so the base install stays at pennies/lead.

---

## 6) TL;DR for the build

- **v1 capture = smart form, not chat.** Enrich the client's existing form (C1) or drop in Tally (C2). Fastest, async-native, lowest sell-friction, dodges chat-resistance. Chat is v2.
- **Don't build a custom widget.** Assemble off-the-shelf; the engine is the moat.
- **Stack:** form submit → ingest hop (Make/Zapier or tiny serverless) → `buyer_profile_enricher.py` (unchanged) → HubSpot v3 API (upsert + dossier note + `dt_` properties + HIGH task). HubSpot can't receive an external webhook to *create* a contact, so upsert via API first.
- **Reuse what's built:** the enricher needs no changes; the HubSpot push reuses the proven `hubspot_oloxa_sync.py` pattern verbatim.
- **Flag before building:** confirm `FIRECRAWL_API_KEY` + a `HUBSPOT_TOKEN` are actually available (not seen in `aios-starter-kit/.env`).
- **Sell company-level (reliable) in v1; test person-level on 10 real leads before promising it; add Prospeo/PDL as a paid v2 toggle if needed.**
