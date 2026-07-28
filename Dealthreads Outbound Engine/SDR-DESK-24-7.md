# Deal Threads 24/7 SDR Desk

Date: 2026-07-26  
Status: implemented in `AI GTM Engine/deal-threads-dev`

## What the LinkedIn post gets right

The post describes seven jobs, not 31 magic prompts:

1. Signal Hunter — detect a reason to contact an account now.
2. ICP Scorer — rank the account/contact before spending seller time.
3. Prospect Researcher — create an evidence-backed account dossier.
4. Voice Writer — turn the dossier into credible, human outreach.
5. Sequence Builder — schedule touches and stop them when context changes.
6. Reply Classifier — interpret every response and route the next action.
7. Meeting Qualifier — screen and hand off meetings with context.

The important architectural idea is the handoff between jobs. A folder of prompts is not an autonomous SDR desk unless it has persistent state, an event clock, idempotency, retries, suppression, and health reporting.

## Cross-reference: post versus our system

| Specialist | What Deal Threads already had | Previous gap | Improvement now |
| --- | --- | --- | --- |
| Signal Hunter | Inbound widget events, public-site enrichment, conversion-surface detection, target lists, engagement/outreach plans | No normalized, idempotent signal event stream or continuous clock | `POST /api/v1/sdr-desk/signals` accepts signals from any controlled source and deduplicates by `event_id` |
| ICP Scorer | Detailed inbound ICP scoring, priority tiers, routing weights, enrichment confidence, HubSpot fields | Outbound signals and inbound leads did not share one prospect state | Signal events now create/update a persisted prospect, calculate a 0–100 fit score, and assign A–D tiers |
| Prospect Researcher | Providerless website crawl, source URLs, reusable company memory, evidence packet, rep brief | Research was strong but not attached to a continuously changing outbound prospect record | Every signal rebuilds a dossier with why-now evidence, sources, facts, and unknowns |
| Voice Writer | Rep copy blocks, call plans, outreach libraries, message drafts | No runtime voice object tied to a prospect and sequence | Each prospect receives a three-touch sequence with a stored tone, proof statement, CTA, and signal-specific opener |
| Sequence Builder | SmartLead packs, follow-up libraries, manual queues | Sequence state did not automatically stop or change when replies arrived | Persisted tasks schedule touches; replies cancel future touches; OOO pauses; opt-out suppresses every open action |
| Reply Classifier | Reply-router SOP and message library | No production classifier/state transition in the app | `POST /api/v1/sdr-desk/replies` classifies positive, negative, question, referral, OOO, opt-out, or neutral and routes the next task |
| Meeting Qualifier | Widget qualification, routing, booking stage, call scripts, CRM workflow | Calendar events were not normalized into the same loop | `POST /api/v1/sdr-desk/meetings` scores need/authority/timeline/budget context and queues a dossier handoff |

## What is better than the LinkedIn model

Deal Threads already contains capabilities the post does not mention:

- Consent and tenant/domain controls.
- Providerless enrichment with a paid-data firewall.
- Evidence confidence and rep feedback.
- CRM delivery, HubSpot readiness, and dry-run modes.
- Pilot health, proof baselines, outcome snapshots, and buyer-safe reporting.
- Persistent JSON or SQLite storage.
- Production hardening, backup/restore, and regression tests.

Those pieces should remain the commercial moat. The seven-specialist framing is useful packaging for the operating loop, not a reason to replace the current product.

## The closed loop

```text
signal webhook / inbound widget
  -> dedupe event
  -> score prospect
  -> rebuild dossier
  -> draft and schedule sequence
  -> execute internal task or controlled delivery webhook
  -> reply webhook
      -> cancel sequence
      -> suppress / nurture / answer / book
  -> meeting webhook
      -> qualify
      -> hand dossier to owner
  -> retry failures with exponential backoff
  -> persist state and expose health
```

Inbound widget leads automatically enter this loop as high-intent signals. External sources can use the same endpoints for hiring, funding, leadership change, expansion, engagement, tool-change, news, or form-problem signals.

## Safe operating modes

### Approval mode — recommended for the first live week

```env
SDR_AUTOMATION_ENABLED=true
SDR_ACTION_MODE=approval
SDR_AUTOMATION_INTERVAL_MS=60000
```

Internal research tasks complete automatically. Email/DM/meeting actions become `awaiting_approval`. This proves event flow, scoring, deduplication, and sequence cancellation without sending externally.

### Webhook mode — unattended delivery

```env
SDR_AUTOMATION_ENABLED=true
SDR_ACTION_MODE=webhook
SDR_ACTION_WEBHOOK_URL=https://your-controlled-adapter.example/sdr-actions
SDR_ACTION_WEBHOOK_TOKEN=replace-me
```

The action webhook receives a stable `Idempotency-Key` header plus the task and prospect dossier. The adapter can route:

- email actions to SmartLead or a transactional provider;
- CRM actions to HubSpot;
- meeting invites to Cal.com/Calendly;
- operator alerts to Telegram/Slack;
- LinkedIn drafts to an approval queue.

Do not automate LinkedIn browser sending. Keep LinkedIn as draft/approval because account restrictions and platform rules make unattended browser automation a fragile part of an otherwise reliable system.

## API surface

All SDR Desk endpoints use existing admin Basic Auth.

```text
GET  /api/v1/sdr-desk
POST /api/v1/sdr-desk/signals
POST /api/v1/sdr-desk/replies
POST /api/v1/sdr-desk/meetings
POST /api/v1/sdr-desk/run
POST /api/v1/sdr-desk/tasks/:taskId/resolve
GET  /api/v1/health
```

Example signal:

```json
{
  "event_id": "smartlead-engagement-123",
  "source": "smartlead",
  "signal_type": "engagement",
  "summary": "Prospect replied after viewing the sample",
  "account_domain": "example.com",
  "account_name": "Example",
  "contact_name": "Jordan Lee",
  "contact_email": "jordan@example.com",
  "contact_role": "VP Sales",
  "employee_count": 150,
  "icp_match": true,
  "active_need": true,
  "timeline": "this quarter"
}
```

Example reply:

```json
{
  "event_id": "smartlead-reply-456",
  "account_domain": "example.com",
  "channel": "email",
  "text": "Yes, send me your calendar."
}
```

Replaying either event with the same `event_id` is safe and returns `deduplicated: true`.

## Production deployment checklist

1. Run with SQLite on a mounted Railway volume.
2. Use one scheduler instance. Do not run multiple web replicas until the worker lease is moved to a shared database.
3. Run approval mode for five business days and inspect `/api/v1/sdr-desk` daily.
4. Connect SmartLead reply events, Cal.com booking events, and a controlled action adapter.
5. Verify opt-out events suppress every pending task before enabling webhook mode.
6. Enable webhook mode for email and internal alerts first.
7. Keep LinkedIn delivery manual.
8. Alert if `/api/v1/health` shows `last_error`, failed tasks, or an old `last_run_at`.

## Remaining integration work

The control plane is complete, but external credentials and webhook ownership are deployment inputs, not repository code. To become live end-to-end, connect:

- SmartLead reply/campaign webhooks;
- Cal.com booking webhooks;
- HubSpot/CRM token and properties;
- one outbound action webhook;
- one monitoring destination.

The system can run continuously without those credentials, but it will correctly stay in approval/dry-run mode rather than pretending an external action was delivered.
