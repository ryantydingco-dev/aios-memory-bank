import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";

const mode = process.argv[2] || "status";
const productionBaseUrl = String(process.env.DEAL_THREADS_PUBLIC_URL || "https://ai-contact-form-demo-production.up.railway.app").replace(/\/+$/, "");
const appRoot = path.resolve(import.meta.dirname, "..");
const envFiles = [
  "/Users/ryantydingco/Documents/AIOS/dealthread-agents/.env",
  "/Users/ryantydingco/Documents/AIOS/dealthreads-engine/.env",
  "/Users/ryantydingco/Documents/AIOS/aios-starter-kit/.env",
  path.resolve(appRoot, "../First-Customer Sprint/14-Day Self Sprint - 2026-06-08/.env.salesfinity")
];

for (const file of envFiles) {
  if (existsSync(file)) process.loadEnvFile(file);
}
alias("HUBSPOT_TOKEN", "HUBSPOT_PRIVATE_APP_TOKEN");
alias("SENDR_API_KEY", "SENDER_AI_API_KEY");
alias("CALCOM_API_KEY", "CAL_API_KEY");

const railway = railwayVariables();
for (const key of [
  "SMARTLEAD_API_KEY",
  "SALESFINITY_API_KEY",
  "SENDR_API_KEY",
  "HUBSPOT_TOKEN",
  "CALCOM_API_KEY",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID"
]) {
  if (railway[key]) process.env[key] = railway[key];
}
const secrets = {
  smartlead: railway.SMARTLEAD_WEBHOOK_SECRET || randomSecret(),
  salesfinity: railway.SALESFINITY_WEBHOOK_SECRET || randomSecret(),
  sendr: railway.SENDR_WEBHOOK_SECRET || "",
  calcom: railway.CALCOM_WEBHOOK_SECRET || randomSecret()
};

const desiredVariables = compact({
  SMARTLEAD_API_KEY: process.env.SMARTLEAD_API_KEY,
  SMARTLEAD_WEBHOOK_ID: railway.SMARTLEAD_WEBHOOK_ID,
  SMARTLEAD_WEBHOOK_SECRET: secrets.smartlead,
  SALESFINITY_API_KEY: process.env.SALESFINITY_API_KEY,
  SALESFINITY_WEBHOOK_SECRET: secrets.salesfinity,
  SENDR_API_KEY: process.env.SENDR_API_KEY,
  SENDR_WEBHOOK_SECRET: secrets.sendr,
  HUBSPOT_TOKEN: process.env.HUBSPOT_TOKEN,
  CALCOM_API_KEY: process.env.CALCOM_API_KEY,
  CALCOM_WEBHOOK_SECRET: secrets.calcom,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  SDR_AUTOMATION_ENABLED: "true",
  SDR_ACTION_MODE: "approval",
  HUBSPOT_AUTO_SYNC: process.env.HUBSPOT_TOKEN ? "true" : "false",
  HUBSPOT_AUTO_SETUP_PROPERTIES: "false",
  REVENUE_NOTIFICATIONS_ENABLED: process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID ? "true" : "false",
  REVENUE_WATCHDOG_TIMEZONE: "America/New_York",
  REVENUE_WATCHDOG_MORNING_TIME: "07:25",
  REVENUE_WATCHDOG_URGENT_ALERTS: "true"
});

if (mode === "variables") {
  setRailwayVariables(desiredVariables);
  console.log(JSON.stringify({
    mode,
    configured: Object.keys(desiredVariables),
    missing_api_credentials: missingCredentials(),
    secrets: {
      smartlead: "configured",
      salesfinity: "configured",
      sendr: secrets.sendr ? "configured" : "waiting_for_sendr_registration",
      calcom: "configured"
    }
  }, null, 2));
  process.exit(0);
}

if (mode === "register") {
  const health = await fetchJson(`${productionBaseUrl}/api/v1/health`);
  if (!health.ok || !health.data?.sdrIntegrations) {
    throw new Error("The production deployment does not expose the new integration receivers yet.");
  }

  const results = {};
  results.smartlead = await registerSmartLead();
  if (results.smartlead.id) {
    setRailwayVariables({ SMARTLEAD_WEBHOOK_ID: String(results.smartlead.id) });
  }
  results.salesfinity = await registerSalesfinity();
  results.sendr = await registerSendr();
  if (results.sendr.secret) {
    secrets.sendr = results.sendr.secret;
    setRailwayVariables({ SENDR_WEBHOOK_SECRET: secrets.sendr });
    delete results.sendr.secret;
  }
  results.calcom = await registerCalCom();
  results.receiver_checks = await verifyReceivers();
  console.log(JSON.stringify({
    mode,
    production_base_url: productionBaseUrl,
    results,
    missing_api_credentials: missingCredentials()
  }, null, 2));
  process.exit(0);
}

console.log(JSON.stringify({
  mode: "status",
  production_base_url: productionBaseUrl,
  credential_presence: {
    smartlead: Boolean(process.env.SMARTLEAD_API_KEY),
    salesfinity: Boolean(process.env.SALESFINITY_API_KEY),
    sendr: Boolean(process.env.SENDR_API_KEY),
    hubspot: Boolean(process.env.HUBSPOT_TOKEN),
    calcom: Boolean(process.env.CALCOM_API_KEY),
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
  },
  receiver_secret_presence: Object.fromEntries(Object.entries(secrets).map(([key, value]) => [key, Boolean(value)]))
}, null, 2));

async function registerSmartLead() {
  if (!process.env.SMARTLEAD_API_KEY) return blocked("api_key_missing");
  const receiver = `${productionBaseUrl}/webhooks/v1/smartlead?token=${encodeURIComponent(secrets.smartlead)}`;
  const query = `api_key=${encodeURIComponent(process.env.SMARTLEAD_API_KEY)}`;
  if (railway.SMARTLEAD_WEBHOOK_ID) {
    const saved = await fetchJson(
      `https://server.smartlead.ai/api/v1/webhook/${encodeURIComponent(railway.SMARTLEAD_WEBHOOK_ID)}?${query}`
    );
    const savedWebhook = saved.data?.data || saved.data;
    if (saved.ok && sameReceiver(savedWebhook?.webhook_url, receiver)) {
      return ready("existing", savedWebhook.id || railway.SMARTLEAD_WEBHOOK_ID);
    }
  }
  const listed = await fetchJson(`https://server.smartlead.ai/api/v1/webhook?${query}`);
  const rows = array(listed.data?.data || listed.data?.webhooks || listed.data);
  const existing = rows.find((item) => sameReceiver(item.webhook_url || item.url, receiver));
  if (existing) return ready("existing", existing.id);
  const created = await fetchJson(`https://server.smartlead.ai/api/v1/webhook/create?${query}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Deal Threads Revenue Loop",
      webhook_url: receiver,
      association_type: 1,
      event_type_map: {
        EMAIL_OPEN: true,
        EMAIL_LINK_CLICK: true,
        EMAIL_REPLY: true,
        LEAD_UNSUBSCRIBED: true,
        LEAD_CATEGORY_UPDATED: true,
        UNTRACKED_REPLIES: true
      }
    })
  });
  if (!created.ok) return failed(created.status, safeApiError(created.data));
  const createdId = created.data?.id;
  return ready(
    "created",
    typeof createdId === "object" ? createdId?.id : createdId || created.data?.data?.id
  );
}

async function registerSalesfinity() {
  if (!process.env.SALESFINITY_API_KEY) return blocked("api_key_missing");
  const receiver = `${productionBaseUrl}/webhooks/v1/salesfinity?token=${encodeURIComponent(secrets.salesfinity)}`;
  const headers = { "x-api-key": process.env.SALESFINITY_API_KEY, "content-type": "application/json" };
  const listed = await fetchJson("https://client-api.salesfinity.co/v1/webhooks?limit=100", { headers });
  if (!listed.ok) {
    const authProbe = await fetchJson("https://client-api.salesfinity.co/v1/contact-lists/csv?page=1", { headers });
    if (listed.status === 401 && authProbe.ok) {
      return {
        status: "blocked",
        reason: "salesfinity_webhook_api_not_authorized",
        detail: "The API key is valid, but this Salesfinity workspace does not authorize the Webhooks API."
      };
    }
    return failed(listed.status, safeApiError(listed.data));
  }
  const rows = array(listed.data?.data);
  const existing = rows.find((item) => item.name === "Deal Threads Revenue Loop" || sameReceiver(item.url, receiver));
  const body = {
    name: "Deal Threads Revenue Loop",
    url: receiver,
    events: ["CALL_LOGGED", "CONTACT_SNOOZED"],
    dispositions: []
  };
  const response = existing
    ? await fetchJson(`https://client-api.salesfinity.co/v1/webhooks/${existing._id}`, { method: "PUT", headers, body: JSON.stringify(body) })
    : await fetchJson("https://client-api.salesfinity.co/v1/webhooks", { method: "POST", headers, body: JSON.stringify(body) });
  if (!response.ok) return failed(response.status, safeApiError(response.data));
  return ready(existing ? "updated" : "created", response.data?._id || existing?._id);
}

async function registerSendr() {
  if (!process.env.SENDR_API_KEY) return blocked("api_key_missing");
  const receiver = `${productionBaseUrl}/webhooks/v1/sendr`;
  const headers = { "x-api-key": process.env.SENDR_API_KEY, "content-type": "application/json" };
  const listed = await fetchJson("https://api.sendr.io/api/v1/webhook", { headers });
  if (!listed.ok) return failed(listed.status, safeApiError(listed.data));
  const existing = array(listed.data).find((item) => item.name === "Deal Threads Revenue Loop" || sameReceiver(item.url, receiver));
  const desiredEvents = sendrEvents();
  const needsUpdate = !existing
    || !sameReceiver(existing.url, receiver)
    || JSON.stringify([...(existing.events || [])].sort()) !== JSON.stringify([...desiredEvents].sort())
    || existing.attributes?.system !== "deal_threads";
  let response = { ok: true, data: existing };
  if (existing && needsUpdate) {
    response = await fetchJson("https://api.sendr.io/api/v1/webhook", {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        url: receiver,
        events: desiredEvents,
        attributes: { system: "deal_threads" }
      })
    });
  } else if (!existing) {
    response = await fetchJson("https://api.sendr.io/api/v1/webhook", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Deal Threads Revenue Loop",
        url: receiver,
        events: desiredEvents,
        attributes: { system: "deal_threads" }
      })
    });
  }
  if (!response.ok) return failed(response.status, safeApiError(response.data));
  let secret = response.data?.secret || existing?.secret;
  if (!secret) {
    const revealed = await fetchJson("https://api.sendr.io/api/v1/webhook/reveal-secret", {
      method: "POST",
      headers,
      body: JSON.stringify({ url: receiver })
    });
    secret = revealed.data?.secret;
  }
  if (!secret) return failed(502, "Sendr did not return the receiver secret.");
  await fetchJson("https://api.sendr.io/api/v1/webhook/enabling", {
    method: "POST",
    headers,
    body: JSON.stringify({ url: receiver, enabled: true })
  });
  return { ...ready(existing ? (needsUpdate ? "updated" : "existing") : "created"), secret };
}

async function registerCalCom() {
  if (!process.env.CALCOM_API_KEY) return blocked("api_key_missing");
  const receiver = `${productionBaseUrl}/webhooks/v1/calcom`;
  const headers = {
    authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
    "cal-api-version": "2024-08-13",
    "content-type": "application/json"
  };
  const listed = await fetchJson("https://api.cal.com/v2/webhooks", { headers });
  if (!listed.ok) return failed(listed.status, safeApiError(listed.data));
  const rows = array(listed.data?.data);
  const existing = rows.find((item) => sameReceiver(item.subscriberUrl, receiver));
  const body = {
    active: true,
    subscriberUrl: receiver,
    triggers: ["BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"],
    secret: secrets.calcom,
    version: "2021-10-20"
  };
  const response = existing
    ? await fetchJson(`https://api.cal.com/v2/webhooks/${existing.id}`, { method: "PATCH", headers, body: JSON.stringify(body) })
    : await fetchJson("https://api.cal.com/v2/webhooks", { method: "POST", headers, body: JSON.stringify(body) });
  if (!response.ok) return failed(response.status, safeApiError(response.data));
  return ready(existing ? "updated" : "created", response.data?.data?.id || existing?.id);
}

async function verifyReceivers() {
  const checks = {};
  checks.smartlead = await receiverCheck("smartlead", `${productionBaseUrl}/webhooks/v1/smartlead?token=${encodeURIComponent(secrets.smartlead)}`, {
    event_type: "CAMPAIGN_STATUS_CHANGED",
    id: "deal-threads-receiver-check"
  });
  checks.salesfinity = await receiverCheck("salesfinity", `${productionBaseUrl}/webhooks/v1/salesfinity?token=${encodeURIComponent(secrets.salesfinity)}`, {
    event: "CONTACT_SNOOZED",
    id: "deal-threads-receiver-check"
  });
  if (secrets.sendr) {
    checks.sendr = await receiverCheck("sendr", `${productionBaseUrl}/webhooks/v1/sendr`, {
      eventType: "page:pending",
      id: "deal-threads-receiver-check"
    }, { "x-webhook-secret": secrets.sendr });
  }
  const calBody = JSON.stringify({ triggerEvent: "RECEIVER_CHECK", id: "deal-threads-receiver-check" });
  const { createHmac } = await import("node:crypto");
  checks.calcom = await receiverCheck("calcom", `${productionBaseUrl}/webhooks/v1/calcom`, calBody, {
    "x-cal-signature-256": createHmac("sha256", secrets.calcom).update(calBody).digest("hex")
  }, true);
  return checks;
}

async function receiverCheck(provider, url, payload, extraHeaders = {}, raw = false) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...extraHeaders },
    body: raw ? payload : JSON.stringify(payload)
  });
  return { provider, http_status: response.status, ok: response.ok };
}

function railwayVariables() {
  const result = spawnSync("railway", ["variables", "--json"], { cwd: appRoot, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Could not read Railway variables: ${result.stderr.trim()}`);
  return JSON.parse(result.stdout);
}

function setRailwayVariables(values) {
  const pairs = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  if (!pairs.length) return;
  const result = spawnSync("railway", ["variable", "set", "--skip-deploys", ...pairs], { cwd: appRoot, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Could not set Railway variables: ${result.stderr.trim()}`);
}

async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text.slice(0, 500) };
    }
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: { message: String(error?.message || error) } };
  }
}

function sendrEvents() {
  return [
    "engagement:page_view",
    "engagement:audio_play",
    "engagement:video_play",
    "engagement:button_click",
    "engagement:video_emoji_click",
    "engagement:video_comment",
    "engagement:meeting_booked"
  ];
}

function safeApiError(data) {
  return String(data?.message || data?.error || data?.status || "Vendor request failed.").slice(0, 300);
}

function sameReceiver(left, right) {
  if (!left || !right) return false;
  try {
    const a = new URL(left);
    const b = new URL(right);
    return a.origin === b.origin && a.pathname === b.pathname;
  } catch {
    return left === right;
  }
}

function ready(action, id = null) {
  return { status: "ready", action, id: id || null };
}

function blocked(reason) {
  return { status: "blocked", reason };
}

function failed(httpStatus, error) {
  return { status: "failed", http_status: httpStatus, error };
}

function missingCredentials() {
  return [
    !process.env.SMARTLEAD_API_KEY && "SMARTLEAD_API_KEY",
    !process.env.SALESFINITY_API_KEY && "SALESFINITY_API_KEY",
    !process.env.SENDR_API_KEY && "SENDR_API_KEY",
    !process.env.CALCOM_API_KEY && "CALCOM_API_KEY"
  ].filter(Boolean);
}

function randomSecret() {
  return randomBytes(32).toString("hex");
}

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null && item !== undefined && item !== ""));
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function alias(target, source) {
  if (!process.env[target] && process.env[source]) process.env[target] = process.env[source];
}
