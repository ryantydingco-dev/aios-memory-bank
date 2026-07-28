import { randomUUID } from "node:crypto";

const TERMINAL = new Set(["sent", "skipped"]);

export function notificationAdapterStatus(env = process.env) {
  const channels = {
    telegram: {
      configured: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
      destination: env.TELEGRAM_CHAT_ID ? "configured chat" : null
    },
    slack: {
      configured: Boolean(env.SLACK_WEBHOOK_URL),
      destination: env.SLACK_WEBHOOK_URL ? safeHost(env.SLACK_WEBHOOK_URL) : null
    },
    email: {
      configured: Boolean(env.REPORT_EMAIL_WEBHOOK_URL && (env.REVENUE_WATCHDOG_EMAIL_TO || env.REPORT_EMAIL_REPLY_TO)),
      destination: env.REVENUE_WATCHDOG_EMAIL_TO || env.REPORT_EMAIL_REPLY_TO || null
    }
  };
  return {
    enabled: env.REVENUE_NOTIFICATIONS_ENABLED === "true",
    timezone: env.REVENUE_WATCHDOG_TIMEZONE || "America/New_York",
    morning_brief_time: env.REVENUE_WATCHDOG_MORNING_TIME || "07:25",
    urgent_alerts: env.REVENUE_WATCHDOG_URGENT_ALERTS !== "false",
    channels,
    configured_channels: Object.entries(channels).filter(([, item]) => item.configured).map(([name]) => name)
  };
}

export function queueRevenueNotifications(existing = [], report, options = {}) {
  const now = new Date(options.now || Date.now());
  const status = options.status || notificationAdapterStatus(options.env);
  const queue = existing.map(normalizeDelivery);
  if (!status.enabled) return queue;

  const localDate = dateInZone(now, status.timezone);
  const due = localTimeReached(now, status.timezone, status.morning_brief_time);
  if (due) {
    for (const channel of status.configured_channels) {
      enqueue(queue, {
        key: `morning:${localDate}:${channel}`,
        channel,
        kind: "morning_brief",
        subject: `Revenue Watchdog — ${localDate}`,
        message: report.summary_markdown,
        payload: { generated_at: report.generated_at, metrics: report.metrics }
      }, now);
    }
  }

  if (status.urgent_alerts) {
    for (const decision of report.decisions.filter((item) => item.resolution_status === "open" && ["critical", "high"].includes(item.severity))) {
      for (const channel of status.configured_channels) {
        enqueue(queue, {
          key: `decision:${decision.id}:${channel}`,
          channel,
          kind: "urgent_decision",
          subject: `[${decision.severity.toUpperCase()}] ${decision.title}`,
          message: [
            `${decision.title}`,
            "",
            decision.why,
            "",
            `Recommendation: ${decision.recommendation}`,
            decision.due_at ? `Due: ${decision.due_at}` : null
          ].filter(Boolean).join("\n"),
          payload: { decision_id: decision.id, severity: decision.severity, entity: decision.entity }
        }, now);
      }
    }
  }

  return queue.slice(-1000);
}

export async function deliverRevenueNotifications(deliveries = [], options = {}) {
  const env = options.env || process.env;
  const fetchImpl = options.fetch || fetch;
  const now = new Date(options.now || Date.now());
  const limit = Math.max(1, Math.min(100, Number(options.limit || 25)));
  const due = deliveries
    .filter((item) => ["queued", "retry"].includes(item.status) && Date.parse(item.next_attempt_at) <= now.getTime())
    .slice(0, limit);
  const results = [];

  for (const delivery of due) {
    delivery.attempt_count += 1;
    delivery.last_attempt_at = now.toISOString();
    try {
      const result = await sendChannel(delivery, env, fetchImpl);
      delivery.status = result.skipped ? "skipped" : "sent";
      delivery.sent_at = result.skipped ? null : now.toISOString();
      delivery.provider_result = result;
      delivery.last_error = null;
    } catch (error) {
      delivery.last_error = String(error?.message || error);
      delivery.status = delivery.attempt_count >= delivery.max_attempts ? "failed" : "retry";
      delivery.next_attempt_at = new Date(now.getTime() + 60_000 * 2 ** (delivery.attempt_count - 1)).toISOString();
    }
    delivery.updated_at = now.toISOString();
    results.push({ id: delivery.id, status: delivery.status, error: delivery.last_error });
  }

  return { considered: due.length, results, deliveries };
}

export function notificationSummary(deliveries = [], status = notificationAdapterStatus()) {
  const normalized = deliveries.map(normalizeDelivery);
  return {
    adapter: status,
    total: normalized.length,
    by_status: countBy(normalized, (item) => item.status),
    by_channel: countBy(normalized, (item) => item.channel),
    queued: normalized.filter((item) => ["queued", "retry"].includes(item.status)).length,
    failed: normalized.filter((item) => item.status === "failed").length,
    recent: normalized.slice(-20).reverse()
  };
}

async function sendChannel(delivery, env, fetchImpl) {
  if (delivery.channel === "telegram") {
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return { skipped: true, reason: "telegram_not_configured" };
    const responses = [];
    for (const message of chunks(delivery.message, 4000)) {
      responses.push(await postJson(
        fetchImpl,
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        { chat_id: env.TELEGRAM_CHAT_ID, text: message, disable_web_page_preview: true }
      ));
    }
    return { provider: "telegram", responses };
  }
  if (delivery.channel === "slack") {
    if (!env.SLACK_WEBHOOK_URL) return { skipped: true, reason: "slack_not_configured" };
    const response = await postJson(fetchImpl, env.SLACK_WEBHOOK_URL, { text: `${delivery.subject}\n\n${delivery.message}` });
    return { provider: "slack", response };
  }
  if (delivery.channel === "email") {
    const to = env.REVENUE_WATCHDOG_EMAIL_TO || env.REPORT_EMAIL_REPLY_TO;
    if (!env.REPORT_EMAIL_WEBHOOK_URL || !to) return { skipped: true, reason: "email_not_configured" };
    const response = await postJson(fetchImpl, env.REPORT_EMAIL_WEBHOOK_URL, {
      type: "deal_threads.revenue_watchdog",
      to: String(to).split(",").map((item) => item.trim()).filter(Boolean),
      from: env.REPORT_EMAIL_FROM || "reports@dealthreads.local",
      reply_to: env.REPORT_EMAIL_REPLY_TO || undefined,
      subject: delivery.subject,
      text: delivery.message,
      idempotency_key: delivery.key,
      metadata: delivery.payload
    }, env.REPORT_EMAIL_WEBHOOK_TOKEN);
    return { provider: "email_webhook", response };
  }
  throw new Error(`Unsupported notification channel: ${delivery.channel}`);
}

async function postJson(fetchImpl, url, body, token = "") {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`Notification endpoint returned HTTP ${response.status}`);
  return { http_status: response.status, body: (await response.text()).slice(0, 500) };
}

function enqueue(queue, input, now) {
  if (queue.some((item) => item.key === input.key && (TERMINAL.has(item.status) || ["queued", "retry"].includes(item.status)))) return;
  const timestamp = now.toISOString();
  queue.push(normalizeDelivery({
    id: `notice_${randomUUID()}`,
    ...input,
    status: "queued",
    attempt_count: 0,
    max_attempts: 5,
    next_attempt_at: timestamp,
    last_attempt_at: null,
    sent_at: null,
    last_error: null,
    provider_result: null,
    created_at: timestamp,
    updated_at: timestamp
  }));
}

function normalizeDelivery(item) {
  return {
    ...item,
    status: item.status || "queued",
    attempt_count: Number(item.attempt_count || 0),
    max_attempts: Number(item.max_attempts || 5),
    next_attempt_at: item.next_attempt_at || item.created_at || new Date().toISOString()
  };
}

function localTimeReached(date, timeZone, target) {
  const [targetHour, targetMinute] = String(target || "07:25").split(":").map(Number);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    }).formatToParts(date).filter((item) => item.type !== "literal").map((item) => [item.type, Number(item.value)])
  );
  return parts.hour * 60 + parts.minute >= targetHour * 60 + targetMinute;
}

function dateInZone(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function chunks(value, size) {
  const text = String(value || "");
  return Array.from({ length: Math.ceil(text.length / size) || 1 }, (_, index) => text.slice(index * size, (index + 1) * size));
}

function countBy(items, keyFn) {
  return items.reduce((result, item) => {
    const key = keyFn(item) || "unknown";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});
}

function safeHost(value) {
  try {
    return new URL(value).host;
  } catch {
    return "configured endpoint";
  }
}
