import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

import { createDataStore } from "../src/data-store.js";

const PORT = 5201;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ADMIN_USERNAME = "sqlite-admin";
const ADMIN_PASSWORD = "sqlite-secret";
const ADMIN_AUTH_HEADER = `Basic ${Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64")}`;

test("SQLite data store saves and loads snapshots", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-sqlite-unit-"));
  const sqliteFile = path.join(tmp, "unit.sqlite");

  try {
    const store = createDataStore({ mode: "sqlite", sqlitePath: sqliteFile });
    assert.equal(await store.load(), null);

    await store.save({
      savedAt: "2026-06-01T00:00:00.000Z",
      leads: [{ id: "lead_unit" }],
      betaClients: [{ id: "beta_unit", name: "Unit Client" }]
    });

    const reloaded = createDataStore({ mode: "sqlite", sqlitePath: sqliteFile });
    const snapshot = await reloaded.load();
    assert.equal(snapshot.leads[0].id, "lead_unit");
    assert.equal(snapshot.betaClients[0].name, "Unit Client");
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
});

test("server persists beta state across restarts with SQLite store", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-sqlite-server-"));
  const sqliteFile = path.join(tmp, "server.sqlite");
  let app = await startServer(sqliteFile);

  try {
    const health = await getJson("/api/v1/health");
    assert.equal(health.status, "ok");
    assert.equal(health.dataStore.mode, "sqlite");
    assert.equal(health.dataStore.location, sqliteFile);

    const betaClient = await postProtectedJson("/api/v1/beta-clients", {
      name: "SQLiteCo Revenue Team",
      websiteUrl: "https://sqliteco.test",
      ownerEmail: "owner@sqliteco.test",
      crm: "hubspot",
      status: "setup",
      launcherText: "Ask SQLiteCo",
      welcomeMessage: "SQLiteCo custom welcome.",
      quickReplies: "Fix routing, Improve lead quality",
      highPriorityOwner: "ae@sqliteco.test",
      highPriorityAction: "Call SQLiteCo high-priority leads within 10 minutes.",
      reportRecipients: "owner@sqliteco.test",
      reportCadence: "weekly",
      reportPeriodDays: "14",
      nextReportDueAt: "2020-01-01T00:00:00.000Z"
    });

    const lead = await createHighPriorityLead(betaClient.id);
    assert.equal(lead.source.beta_client_id, betaClient.id);

    await waitFor(async () => {
      const summary = await getProtectedJson("/api/v1/beta-clients");
      return summary.count === 1 && summary.summary.total_leads === 1;
    });
    const persistedStore = createDataStore({ mode: "sqlite", sqlitePath: sqliteFile });
    await waitFor(async () => {
      const snapshot = await persistedStore.load();
      return snapshot?.betaClients?.length === 1 && snapshot?.leads?.length === 1;
    });

    app.kill("SIGTERM");
    await once(app, "exit");

    app = await startServer(sqliteFile);
    const restartedHealth = await getJson("/api/v1/health");
    assert.equal(restartedHealth.dataStore.mode, "sqlite");
    assert.equal(restartedHealth.betaClients, 1);
    assert.equal(restartedHealth.leads, 1);

    const persistedClient = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
    assert.equal(persistedClient.name, "SQLiteCo Revenue Team");
    assert.equal(persistedClient.lead_count, 1);
    assert.equal(persistedClient.routing_overrides.highPriorityOwner, "ae@sqliteco.test");

    const persistedLead = await getProtectedJson(`/api/v1/leads/${lead.id}`);
    assert.equal(persistedLead.contact.email, "selena@sqliteco.test");
    assert.equal(persistedLead.routing.assigned_owner_email, "ae@sqliteco.test");
  } finally {
    if (app.exitCode === null) {
      app.kill("SIGTERM");
      await once(app, "exit");
    }
    await rm(tmp, { recursive: true, force: true });
  }
});

async function createHighPriorityLead(betaClientId) {
  const session = await postJson("/api/v1/widget-sessions", {
    tenantId: "ten_deal_threads_demo",
    widgetId: "wid_deal_threads_demo",
    betaClientId,
    pageUrl: BASE_URL
  });
  assert.equal(session.welcomeMessage, "SQLiteCo custom welcome.");

  const messages = [
    "I am evaluating this for SQLiteCo, a 160-person SaaS company using HubSpot. Demo requests are going cold because reps research manually. We want to fix this this quarter and likely have $30K-$50K annually.",
    "I own the decision",
    "selena@sqliteco.test",
    "My name is Selena Vale",
    "Yes, send it"
  ];

  let result;
  for (const message of messages) {
    result = await postJson(`/api/v1/conversations/${session.conversationId}/messages`, {
      sessionId: session.sessionId,
      message,
      consentAccepted: true
    });
  }

  assert.equal(result.completionStatus, "completed");
  return getProtectedJson(`/api/v1/leads/${result.leadProfileId}`);
}

async function startServer(sqliteFile) {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: {
      ...process.env,
      PORT: String(PORT),
	      DEAL_THREADS_DATA_STORE: "sqlite",
	      DEAL_THREADS_SQLITE_FILE: sqliteFile,
	      ENRICHMENT_MODE: "internal",
	      OPENAI_API_KEY: "",
	      ADMIN_USERNAME,
      ADMIN_PASSWORD
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Server exited early:\n${logs}`);
    try {
      const health = await getJson("/api/v1/health");
      if (health.status === "ok") return child;
    } catch {
      await sleep(100);
    }
  }

  child.kill("SIGTERM");
  throw new Error(`Server did not become ready:\n${logs}`);
}

async function waitFor(predicate, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await sleep(50);
  }
  throw new Error("Timed out waiting for condition");
}

async function getJson(pathname) {
  const response = await fetch(`${BASE_URL}${pathname}`);
  return parseJsonResponse(response);
}

async function getProtectedJson(pathname) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    headers: { authorization: ADMIN_AUTH_HEADER }
  });
  return parseJsonResponse(response);
}

async function postJson(pathname, body) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return parseJsonResponse(response);
}

async function postProtectedJson(pathname, body) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: ADMIN_AUTH_HEADER
    },
    body: JSON.stringify(body)
  });
  return parseJsonResponse(response);
}

async function parseJsonResponse(response) {
  const payload = await response.json();
  assert.ok(response.ok, JSON.stringify(payload));
  return payload;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
