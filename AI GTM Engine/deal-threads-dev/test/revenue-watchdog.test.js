import assert from "node:assert/strict";
import test from "node:test";
import { buildRevenueWatchdog, resolveRevenueDecision } from "../src/revenue-watchdog.js";

const now = "2026-07-26T14:00:00.000Z";

function fixture(overrides = {}) {
  return {
    now,
    dataStoreMode: "sqlite",
    automation: {
      enabled: true,
      interval_ms: 60_000,
      action_mode: "approval",
      external_actions_automatic: false,
      last_run_at: "2026-07-26T13:59:00.000Z"
    },
    prospects: [
      {
        id: "prospect_1",
        account: { name: "Example", domain: "example.com" },
        fit: { score: 92, tier: "A" },
        stage: "meeting_requested",
        signals: [
          {
            id: "signal_1",
            type: "inbound",
            summary: "Requested a walkthrough",
            occurred_at: "2026-07-26T13:00:00.000Z"
          }
        ],
        replies: [
          {
            id: "reply_1",
            text: "Yes, send me your calendar.",
            classification: { intent: "positive", confidence: 0.9 },
            received_at: "2026-07-26T13:10:00.000Z"
          }
        ],
        meetings: [],
        suppression: null
      }
    ],
    tasks: [
      {
        id: "task_1",
        prospect_id: "prospect_1",
        type: "meeting_invite",
        status: "awaiting_approval",
        due_at: "2026-07-26T13:10:00.000Z",
        updated_at: "2026-07-26T13:10:00.000Z",
        payload: { reply_text: "Yes, send me your calendar." },
        attempt_count: 1,
        max_attempts: 5
      }
    ],
    leads: [],
    repAlerts: [],
    crmDeliveries: [],
    decisionResolutions: [],
    ...overrides
  };
}

test("watchdog surfaces the revenue pulse and approval decision", () => {
  const report = buildRevenueWatchdog(fixture());

  assert.equal(report.metrics.buying_signals, 1);
  assert.equal(report.metrics.positive_replies, 1);
  assert.equal(report.metrics.hot_prospects, 1);
  assert.equal(report.metrics.urgent_decisions, 1);
  assert.equal(report.decisions[0].category, "approval");
  assert.match(report.decisions[0].recommendation, /booking option/i);
  assert.equal(report.learning_review.grade, "A+");
  assert.equal(report.integrity.status, "warning");
});

test("watchdog detects failed delivery and overdue sales follow-up", () => {
  const report = buildRevenueWatchdog(fixture({
    tasks: [
      {
        id: "task_failed",
        prospect_id: "prospect_1",
        type: "meeting_invite",
        status: "failed",
        due_at: "2026-07-26T13:10:00.000Z",
        updated_at: "2026-07-26T13:20:00.000Z",
        attempt_count: 5,
        max_attempts: 5,
        last_error: "adapter unavailable"
      }
    ],
    leads: [
      {
        id: "lead_1",
        company: { name: "Late Lead" },
        score: { icp_fit: 85 },
        workflow: {
          stage: "new",
          due_at: "2026-07-26T12:00:00.000Z",
          next_action: "Call now",
          owner_email: "rep@example.com"
        }
      }
    ],
    repAlerts: [{ id: "alert_1", lead_id: "lead_1", status: "failed", last_send_error: "email webhook failed" }]
  }));

  assert.equal(report.metrics.failed_tasks, 1);
  assert.equal(report.metrics.overdue_leads, 1);
  assert.ok(report.decisions.some((item) => item.category === "system_failure"));
  assert.ok(report.decisions.some((item) => item.category === "sla"));
  assert.equal(report.integrity.status, "fail");
  assert.ok(report.learning_review.improvement_candidates.some((item) => item.id === "learning_task_reliability"));
});

test("opt-out leaks fail the rubric and integrity gate", () => {
  const report = buildRevenueWatchdog(fixture({
    prospects: [
      {
        id: "prospect_optout",
        account: { name: "Suppressed Co" },
        fit: { score: 80 },
        stage: "suppressed",
        suppression: { reason: "opt_out", at: "2026-07-26T13:00:00.000Z" },
        signals: [],
        replies: [
          {
            id: "reply_stop",
            text: "Unsubscribe",
            classification: { intent: "opt_out" },
            received_at: "2026-07-26T13:00:00.000Z"
          }
        ],
        meetings: []
      }
    ],
    tasks: [
      {
        id: "task_leak",
        prospect_id: "prospect_optout",
        type: "outreach_touch",
        status: "pending",
        due_at: "2026-07-27T13:00:00.000Z"
      }
    ]
  }));

  assert.equal(report.integrity.status, "fail");
  assert.equal(report.learning_review.rubric.find((item) => item.key === "opt_out_compliance").status, "fail");
  assert.ok(report.learning_review.improvement_candidates.some((item) => item.priority === "critical"));
});

test("decision resolutions remain attached to deterministic decisions", () => {
  const first = buildRevenueWatchdog(fixture());
  const decisionId = first.decisions[0].id;
  const resolutions = resolveRevenueDecision([], decisionId, {
    status: "resolved",
    actor: "ryan",
    note: "Sent booking link"
  }, now);
  const second = buildRevenueWatchdog(fixture({ decisionResolutions: resolutions }));

  assert.equal(second.decisions[0].id, decisionId);
  assert.equal(second.decisions[0].resolution_status, "resolved");
  assert.equal(second.decisions[0].resolution.note, "Sent booking link");
  assert.equal(second.metrics.open_decisions, 0);
});

test("markdown brief carries decisions, learning grade, and integrity status", () => {
  const report = buildRevenueWatchdog(fixture());
  assert.match(report.summary_markdown, /# Deal Threads Revenue Watchdog/);
  assert.match(report.summary_markdown, /What the engine learned/);
  assert.match(report.summary_markdown, /Revenue-path health/);
});
