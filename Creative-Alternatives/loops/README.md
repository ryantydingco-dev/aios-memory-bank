# Loops — the self-improving layer

Agent loops for Creative Alternatives, modeled on loop engineering (build → **measure against one objective metric** → **learn from what was tried** → iterate on a schedule, forever). The existing launchd jobs collect and report; loops are the layer that *learns* — every run reads its own experiment history, checks whether the last change moved the judge metric, and decides the next move.

## Anatomy of a loop

```
loops/<name>/
  LOOP.md       Charter: judge metric, cadence, allowed actions, guardrails, stop condition
  memory.md     Experiment journal — every run appends what it saw, tried, and expects
  metrics.jsonl Objective snapshots written by scripts/loop_metrics.py (the judge's scorecard)
```

A run = one cycle: `loop_metrics.py snapshot <name>` → read LOOP.md + memory.md + metric deltas → decide → produce draft-gated actions → append a memory entry → Telegram ping.

## The loops

| Loop | Cadence | Judge metric | Revenue lever |
|------|---------|--------------|---------------|
| `outbound-copy` | weekly (Mon) | positive-reply rate per active campaign | more replies → more quotes |
| `ar-chase` | weekly (Mon) | overdue A/R $ (total + 91d+) | cash collected |
| `reactivation` | monthly (1st Mon) | win-back count + win-back revenue | lapsed customers re-ordering |
| `quote-conversion` | weekly (Mon) | quotes sent → orders landed (30d) | close rate on inbound demand |
| `vendor-ops` | weekly (Mon) | past-due-not-shipped order count | on-time delivery = retention |
| `deliverability` | weekly (Mon) | bounce + open rates per campaign | protects the whole cold engine |
| `margin` | monthly (1st Mon) | gross margin % YTD vs LY | ~$25k/yr per margin point |

**Channel policy (Ryan, 2026-07-19):** SmartLead = cold email marketing ONLY. Reactivation, A/R chases, and any warm/relationship email send from personal accounts (Kenny's email, or Ryan's Gmail in Ryan's voice).

Parked (needs setup or timing):
- `seo-inbound` — needs Google Search Console API access for creativealternatives.com before it has a judge. Site work = improve the existing Squarespace site, never a rebuild.
- `partner-gp` — judge exists (`ca_partner_gp_reconcile.py` GP attribution), but arms only once partner-sourced orders start landing.
- `content` — YouTube episode performance loop (vidiq judges exist); arms when episode 1 publishes.
- `reply-conversion` — interested reply → quote → close funnel; today it's covered by reply-watcher + quote-conversion. Split out if interested volume grows past ~10/week.

## How runs happen

- **Scheduled:** `com.aios.ca-loops` (launchd, Mon 08:30) runs `scripts/ca_loop_cron.sh`, which snapshots metrics and invokes headless Claude with `/loop-run <name>` for each loop due that day.
- **Manual:** `/loop-run <name>` in any session.

## Non-negotiable guardrails (all loops)

1. **Drafts only.** Nothing that touches a customer, vendor, or money ever sends without Ryan/Kenny approval. Loops produce drafts, proposals, and pings — humans pull the trigger.
2. **One judge metric.** Each loop is scored on the metric in its charter, from `data/data.db` — not vibes.
3. **Memory is mandatory.** A run that doesn't append to memory.md didn't happen. Next run must be able to tell whether the last experiment worked.
4. **Revert is cheap.** Every change proposed must name how to undo it.
5. **Cost discipline.** One headless run per loop per cadence. No fan-outs, no paid enrichment (AI Ark reveals etc.) from inside a loop — those go through their own gated pipelines.
