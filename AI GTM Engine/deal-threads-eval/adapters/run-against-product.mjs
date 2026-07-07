#!/usr/bin/env node
// LIVE adapter: drive the REAL deal-threads-dev product through its widget API, replay each golden
// case's visitor turns, and capture the product's prediction as a leadExtractionSchema profile.
// Writes predictions.jsonl for run-eval.mjs.
//
// ROUTING FIX (2026-06-01): the product NEVER computes routing into the conversation profile —
// `routing.priority_hint`/`route_type` are frozen at "manual_review" in emptyProfile() and the real
// decision is only computed on the BUILT LEAD (server.js scoreProfile/routeLead inside buildLead).
// The previous version captured `extractedFields.routing` (always manual_review), so every live
// routing/priority grade was meaningless. This version drives each case to a built lead
// (POST /complete, or the magic-phrase auto-build) and reads the REAL routing from
// GET /api/v1/leads/:id (lead.score.priority + lead.routing.route_type), then merges it into the
// prediction. Cases that legitimately can't build a lead (missing required fields -> 422) keep
// manual_review — which is the product's real disposition for them.
//
// USAGE
//   node adapters/run-against-product.mjs                 # SELF-SPAWN an isolated, config-frozen product (recommended)
//   node adapters/run-against-product.mjs --base http://localhost:4199   # target an already-running product
//   node run-eval.mjs --predictions fixtures/predictions.live.jsonl
//
// Self-spawn boots the real server.js on an ephemeral 127.0.0.1 port with a fresh empty SQLite store
// (so default scoring weights apply — a stray config can't move the number), ENRICHMENT_MODE=mock
// (verified pure/deterministic), and known admin creds for the lead read. Pass --openai sk-... to
// grade the real heuristic+LLM hybrid; omit it for the keyless heuristic default.

import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV_ROOT = path.resolve(HERE, "..", "..", "deal-threads-dev");

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}
const flag = (name) => process.argv.includes(`--${name}`);

const EXTERNAL_BASE = arg("base", null); // when set, target an already-running product instead of spawning
const CASES = arg("cases", path.join(HERE, "..", "cases", "cases.jsonl"));
const OUT = arg("out", path.join(HERE, "..", "fixtures", "predictions.live.jsonl"));
const OPENAI_KEY = arg("openai", process.env.OPENAI_API_KEY || "");
const ENRICHMENT_MODE = arg("enrichment", "mock");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

const loadCases = (p) =>
  readFileSync(p, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//")).map((l) => JSON.parse(l));

async function main() {
  // --- resolve a running product (spawn isolated, or target external) ---
  let base = EXTERNAL_BASE;
  let origin = EXTERNAL_BASE;
  let adminAuth = `Basic ${Buffer.from(`${arg("admin-user", "admin")}:${arg("admin-pass", "deal-threads-local")}`).toString("base64")}`;
  let child = null;
  let tmp = null;
  let provenance = { mode: "external", base, enrichment_mode: "unknown", openai_key: Boolean(OPENAI_KEY) };

  async function api(p, opts = {}) {
    let res;
    try {
      res = await fetch(`${base}${p}`, {
        method: opts.method || "GET",
        headers: { "content-type": "application/json", origin, referer: `${origin}/`, ...(opts.headers || {}) },
        body: opts.body ? JSON.stringify(opts.body) : undefined
      });
    } catch (error) {
      return { status: 0, data: null, networkError: error.message };
    }
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, data };
  }

  if (!EXTERNAL_BASE) {
    const port = await getFreePort();
    base = `http://127.0.0.1:${port}`;
    origin = base;
    const ADMIN_USERNAME = "eval-admin";
    const ADMIN_PASSWORD = "eval-secret";
    adminAuth = `Basic ${Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64")}`;
    tmp = await mkdtemp(path.join(tmpdir(), "dt-eval-live-"));
    const sqliteFile = path.join(tmp, "eval.sqlite");
    child = spawn(process.execPath, ["server.js"], {
      cwd: DEV_ROOT,
      env: {
        ...process.env,
        PORT: String(port),
        NODE_ENV: "development",
        DEAL_THREADS_DATA_STORE: "sqlite",
        DEAL_THREADS_SQLITE_FILE: sqliteFile,
        ENRICHMENT_MODE,
        OPENAI_API_KEY: OPENAI_KEY,
        ADMIN_USERNAME,
        ADMIN_PASSWORD
      },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let logs = "";
    child.stdout.on("data", (c) => (logs += c.toString()));
    child.stderr.on("data", (c) => (logs += c.toString()));
    provenance = { mode: "spawned", base, enrichment_mode: ENRICHMENT_MODE, openai_key: Boolean(OPENAI_KEY) };

    // health gate
    let health = null;
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null) {
        console.error(`✗ server.js exited early (code ${child.exitCode}):\n${logs}`);
        process.exit(2);
      }
      const r = await api("/api/v1/health");
      if (r.status === 200 && r.data?.status === "ok") {
        health = r.data;
        break;
      }
      await sleep(100);
    }
    if (!health) {
      child.kill("SIGTERM");
      console.error(`✗ spawned product not ready on ${base}:\n${logs}`);
      process.exit(2);
    }
    // config freeze: a non-empty store would silently move scoring weights -> the routing number.
    if (Number(health.betaClients || 0) !== 0 || Number(health.leads || 0) !== 0) {
      child.kill("SIGTERM");
      console.error(`✗ spawned store is not empty (${health.betaClients} clients / ${health.leads} leads). Refusing to score against non-default config.`);
      process.exit(2);
    }
    // origin-gate probe
    const probe = await api("/api/v1/widget-sessions", { method: "POST", body: { pageUrl: `${origin}/` } });
    if (probe.status === 403) {
      child.kill("SIGTERM");
      console.error(`✗ origin gate rejected ${origin}. Base must be a host in allowedDomains (default localhost/127.0.0.1).`);
      process.exit(2);
    }
  } else {
    // external: just health-check
    let up = false;
    for (let i = 0; i < 20; i++) {
      if ((await api("/api/v1/health")).status === 200) {
        up = true;
        break;
      }
      await sleep(300);
    }
    if (!up) {
      console.error(`✗ Product not reachable at ${base}. Boot it isolated first, or omit --base to self-spawn.`);
      process.exit(2);
    }
  }

  // --- replay cases ---
  const cases = loadCases(CASES);
  const preds = [];
  const log = [];
  let realRoutingCount = 0;

  for (const c of cases) {
    const sess = await api("/api/v1/widget-sessions", { method: "POST", body: { pageUrl: `${origin}/`, referrer: `${origin}/` } });
    if (sess.status !== 201) {
      log.push(`✗ ${c.id}: session ${sess.status} ${JSON.stringify(sess.data)}`);
      preds.push({ id: c.id, _error: `session_${sess.status}` });
      continue;
    }
    const { sessionId, conversationId } = sess.data;
    const visitorTurns = (c.conversation || []).filter((m) => m.sender === "visitor").map((m) => m.body);

    let extracted = null;
    let leadId = null;
    let lastStatus = null;
    for (const message of visitorTurns) {
      const r = await api(`/api/v1/conversations/${conversationId}/messages`, {
        method: "POST",
        body: { sessionId, message, consentAccepted: true }
      });
      lastStatus = r.status;
      if (r.status !== 200) break;
      if (r.data.extractedFields) extracted = r.data.extractedFields;
      if (r.data.completionStatus === "completed" && r.data.leadProfileId) {
        leadId = r.data.leadProfileId; // magic-phrase auto-build
        break;
      }
    }
    if (!extracted) {
      log.push(`✗ ${c.id}: no extractedFields (last status ${lastStatus})`);
      preds.push({ id: c.id, _error: "no_extraction" });
      continue;
    }

    // Drive to a built lead so we can read REAL routing (the fix). 422 = legitimately no lead.
    let completeStatus = leadId ? 200 : null;
    if (!leadId) {
      const done = await api(`/api/v1/conversations/${conversationId}/complete`, { method: "POST", body: {} });
      completeStatus = done.status;
      if (done.status === 201 && done.data?.leadProfileId) leadId = done.data.leadProfileId;
    }

    let routingSource = "frozen_profile (manual_review — no lead built)";
    if (leadId) {
      const leadRes = await api(`/api/v1/leads/${leadId}`, { headers: { authorization: adminAuth } });
      if (leadRes.status === 200 && leadRes.data) {
        const L = leadRes.data;
        extracted.routing = {
          ...(extracted.routing || {}),
          priority_hint: L.score?.priority ?? extracted.routing?.priority_hint ?? "manual_review",
          route_type: L.routing?.route_type ?? extracted.routing?.route_type ?? "manual_review",
          recommended_next_action: L.routing?.recommended_next_action ?? extracted.routing?.recommended_next_action ?? null
        };
        routingSource = "real_lead (score.priority + routing.route_type)";
        realRoutingCount += 1;
      } else {
        routingSource = `lead_read_failed (${leadRes.status})`;
      }
    }

    preds.push({ id: c.id, ...extracted });
    log.push(
      `✓ ${c.id.padEnd(11)} [${c.category.padEnd(22)}] complete=${String(completeStatus).padEnd(3)} ` +
        `prio=${(extracted.routing?.priority_hint || "?").padEnd(13)} ` +
        `route=${(extracted.routing?.route_type || "?").padEnd(16)} ` +
        `budget=${(extracted.qualification?.budget_range || "?").padEnd(9)} ` +
        `review=${extracted.meta?.needs_human_review} | ${routingSource}`
    );
  }

  writeFileSync(OUT, preds.map((p) => JSON.stringify(p)).join("\n") + "\n");
  console.log(log.join("\n"));
  console.log(`\nprovenance: ${JSON.stringify(provenance)}`);
  console.log(`real routing captured for ${realRoutingCount}/${cases.length} cases (rest 422'd -> manual_review, the product's real disposition)`);
  console.log(`Wrote ${preds.length} predictions → ${OUT}`);
  console.log(`Next: node run-eval.mjs --predictions ${OUT}`);

  if (child && child.exitCode === null) {
    child.kill("SIGTERM");
    await Promise.race([new Promise((r) => child.once("exit", r)), sleep(2000)]);
  }
  if (tmp) await rm(tmp, { recursive: true, force: true }).catch(() => {});
}

main().catch((error) => {
  console.error(`✗ adapter failed: ${error.message}`);
  process.exit(1);
});
