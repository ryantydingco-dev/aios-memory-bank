# Runvue

## One-line positioning

White-label delivery dashboard / **Retention OS** for AI lead-gen agencies: a premium client portal that makes delivery visible, gives clients approval cards, and turns campaign reporting into approved action.

## Origin

- Started from Ideabrowser idea #8026: “White-label delivery dashboard for AI service agencies.”
- The idea was already saved in Ryan’s Ideabrowser account and scored strongly in the scan context: opportunity 9, pain 9, timing 8.

## 2026-06-22 adjacent idea: client delivery dashboard for no-code automation shops

- Ryan started/continued Ideabrowser work on **“Client delivery dashboard for no-code automation shops”**; compact scan surfaced idea ID `8187` with the same title.
- Initial data source in Codex was a complete Ideabrowser JSON in Downloads; the new workspace itself appeared mostly empty at the start of analysis.
- Ryan’s major pushback: building the product around **n8n / Zapier / Make** may be the wrong strategic frame because the automation market is shifting toward **Claude Code, Codex, and agentic workflows**.
- Durable reframing: if this is worth building, the wedge should likely be **client-facing delivery visibility for agentic automation work** — health/status, audit trail, approvals, proof of work, exceptions, and trust — not a platform-specific no-code dashboard.
- Treat this as Runvue-adjacent until Ryan explicitly decides whether it is a separate product, a pivot, or a sharper ICP/version of Runvue.

## Product shape

- Target customer: AI lead-gen agencies that run cold email, calling, and related outbound campaigns for clients.
- User-facing artifact: a white-label portal the agency gives to each end client.
- Desired feel: dark, premium dashboard with simple, client-readable proof of work and outcomes.
- Stated build stack from the brief: Express + EJS + Tailwind + Chart.js on Railway, with Airtable as the backend.
- Named data sources: SmartLead for cold email campaign metrics; Salesfinity for dialing/call-side delivery data.

## Core wedge

Runvue should not be “another reporting dashboard.” The strongest wedge is:

1. Sync real delivery metrics from the agency stack.
2. Convert those metrics into plain-English recommendations / approval cards.
3. Let the client approve a concrete change.
4. Push the approved change back into delivery tooling where possible.
5. Show the result in the portal so the agency can prove momentum and reduce churn risk.

For the no-code/agentic automation variant, the equivalent wedge is:

1. Show what automations/agents are running and whether they are healthy.
2. Surface exceptions, missed triggers, rate-limit failures, stale credentials, and human approvals needed.
3. Provide a client-readable audit trail of work completed and issues resolved.
4. Turn proposed workflow/agent changes into explicit client approvals.
5. Preserve trust when most work happens invisibly in the background.

## Strongest demo beat

**Approve-click-to-live SmartLead sequence update**

- Client sees an underperforming or improvable campaign/card in Runvue.
- Portal recommends a specific sequence/variant change.
- Client clicks **Approve**.
- Runvue writes the approved sequence/change into SmartLead or stages it for agency execution.
- The dashboard updates so the client can see that approval turned into work.

Subagent assessments treated this as the best demo moment because it makes the product action-oriented rather than passive reporting.

## Feasibility notes from 2026-06-10 assessments

- SmartLead appears to be the most buildable integration path and should be the first deep integration to validate.
- The SmartLead-related feature was assessed around **7/10 feasibility** and roughly **4 build days** on the stated stack, assuming endpoint behavior matches the documented/API-tested assumptions.
- Demo value for the approve-to-live SmartLead sequence beat was assessed around **8/10** for the target audience.
- ElevenLabs / phone-agent “call your dashboard” ideas are buildable and screenshot-able, but may feel less novel to AI-agency operators unless they create an undeniable live state update in the portal.

## Risks / constraints

- Validate exact SmartLead endpoints during implementation; do not rely only on secondary summaries.
- Confirm whether SmartLead provides the needed campaign stats, variant-level analytics, sequence creation/update, and pause/resume/status controls for the exact customer workflow.
- Salesfinity API availability is less certain from the reviewed context; plan for an Airtable/manual-ingest fallback if necessary.
- Multi-tenant white-label routing is real complexity. Keep MVP tenant model small and explicit.
- The product can be cloned at a workflow level by n8n/Zapier-savvy agencies, so the durable value is the packaged white-label portal, client UX, and retention narrative.
- For the automation-shop variant, avoid anchoring too hard to legacy no-code tools before validating whether Claude Code/Codex/agentic delivery teams feel the same pain and will pay.

## MVP guidance

- Start with one agency tenant and one or two demo clients.
- Use Airtable as the source of truth for clients, campaigns, metrics snapshots, recommendations, approvals, and audit log.
- Prioritize SmartLead sync + approval cards before adding extra integrations.
- Include a polished dashboard view, but make the action loop the hero.
- Avoid broad “agency OS” scope until the retention/usefulness loop is proven.

## Related open loops

- Validate SmartLead read/write endpoints in a real implementation context.
- Decide whether Salesfinity data will be API-synced, imported, or mocked for MVP demo purposes.
- Build the Airtable schema and Express/EJS views for the first portal version.
- Convert the Runvue build into Ryan’s Ideabrowser/build-in-public content pipeline.
- Decide whether the no-code/agentic automation delivery dashboard is worth building and whether it should merge into Runvue or remain separate.
