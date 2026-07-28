import assert from "node:assert/strict";
import test from "node:test";
import {
  deliverRevenueNotifications,
  notificationAdapterStatus,
  queueRevenueNotifications
} from "../src/revenue-notifications.js";

const report = {
  generated_at: "2026-07-26T12:30:00.000Z",
  summary_markdown: "# Revenue Watchdog\n\nOne urgent decision.",
  metrics: { urgent_decisions: 1 },
  decisions: [{
    id: "decision_abc",
    title: "Reply now",
    why: "A buyer is waiting.",
    recommendation: "Send the approved response.",
    severity: "critical",
    resolution_status: "open",
    due_at: "2026-07-26T12:00:00.000Z",
    entity: { type: "sdr_task", id: "task_1" }
  }]
};

test("queues one morning brief and one urgent alert per channel idempotently", () => {
  const env = {
    REVENUE_NOTIFICATIONS_ENABLED: "true",
    REVENUE_WATCHDOG_TIMEZONE: "America/New_York",
    REVENUE_WATCHDOG_MORNING_TIME: "07:25",
    TELEGRAM_BOT_TOKEN: "token",
    TELEGRAM_CHAT_ID: "chat",
    SLACK_WEBHOOK_URL: "https://hooks.slack.test/services/abc"
  };
  const status = notificationAdapterStatus(env);
  const now = "2026-07-26T12:30:00.000Z";
  const first = queueRevenueNotifications([], report, { env, status, now });
  const second = queueRevenueNotifications(first, report, { env, status, now });

  assert.equal(first.length, 4);
  assert.equal(second.length, 4);
  assert.deepEqual(new Set(first.map((item) => item.channel)), new Set(["telegram", "slack"]));
});

test("delivers queued Slack and Telegram notifications", async () => {
  const env = {
    REVENUE_NOTIFICATIONS_ENABLED: "true",
    TELEGRAM_BOT_TOKEN: "token",
    TELEGRAM_CHAT_ID: "chat",
    SLACK_WEBHOOK_URL: "https://hooks.slack.test/services/abc"
  };
  const calls = [];
  const mockFetch = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return new Response("ok", { status: 200 });
  };
  const deliveries = [
    {
      id: "notice_1",
      key: "one",
      channel: "telegram",
      kind: "urgent_decision",
      subject: "Urgent",
      message: "Buyer waiting",
      status: "queued",
      attempt_count: 0,
      max_attempts: 5,
      next_attempt_at: "2026-07-26T12:00:00.000Z",
      created_at: "2026-07-26T12:00:00.000Z"
    },
    {
      id: "notice_2",
      key: "two",
      channel: "slack",
      kind: "urgent_decision",
      subject: "Urgent",
      message: "Buyer waiting",
      status: "queued",
      attempt_count: 0,
      max_attempts: 5,
      next_attempt_at: "2026-07-26T12:00:00.000Z",
      created_at: "2026-07-26T12:00:00.000Z"
    }
  ];
  const result = await deliverRevenueNotifications(deliveries, {
    env,
    fetch: mockFetch,
    now: "2026-07-26T12:30:00.000Z"
  });

  assert.equal(result.considered, 2);
  assert.equal(calls.length, 2);
  assert.equal(deliveries.every((item) => item.status === "sent"), true);
});
