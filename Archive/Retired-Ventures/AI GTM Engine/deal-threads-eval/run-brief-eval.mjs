#!/usr/bin/env node
// Rep-brief eval: self-spawn the real product, drive each golden case to a built lead, capture
// lead.rep_ready_brief, and grade faithfulness / tailoring / outbound-copy hygiene.
//
//   node run-brief-eval.mjs
//
// Network-free except the product's own enrichment; no API key needed (heuristic path).

import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gradeBrief, gradeDiscoveryTailoring } from "./graders/brief-graders.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV_ROOT = path.resolve(HERE, "..", "deal-threads-dev");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = createServer(); s.once("error", rej); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });

const cases = readFileSync(path.join(HERE, "cases", "cases.jsonl"), "utf8")
  .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//")).map((l) => JSON.parse(l));

const port = await freePort();
const base = `http://127.0.0.1:${port}`;
const tmp = await mkdtemp(path.join(tmpdir(), "dt-brief-"));
const ADMIN = { u: "eval-admin", p: "eval-secret" };
const auth = `Basic ${Buffer.from(`${ADMIN.u}:${ADMIN.p}`).toString("base64")}`;
const child = spawn(process.execPath, ["server.js"], {
  cwd: DEV_ROOT,
  env: { ...process.env, PORT: String(port), NODE_ENV: "development", DEAL_THREADS_DATA_FILE: path.join(tmp, "brief.json"), ENRICHMENT_MODE: "mock", ADMIN_USERNAME: ADMIN.u, ADMIN_PASSWORD: ADMIN.p },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = ""; child.stdout.on("data", (c) => (logs += c)); child.stderr.on("data", (c) => (logs += c));

async function api(p, opts = {}) {
  const res = await fetch(`${base}${p}`, { method: opts.method || "GET", headers: { "content-type": "application/json", origin: base, referer: `${base}/`, ...(opts.headers || {}) }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const t = await res.text(); let d; try { d = JSON.parse(t); } catch { d = t; }
  return { status: res.status, data: d };
}

async function main() {
  for (let i = 0; i < 100; i++) { if (child.exitCode !== null) { console.error(`server exited early:\n${logs}`); process.exit(2); } if ((await api("/api/v1/health").catch(() => ({ status: 0 }))).status === 200) break; await sleep(100); }

  const briefResults = [];
  const log = [];
  for (const c of cases) {
    const sess = await api("/api/v1/widget-sessions", { method: "POST", body: { pageUrl: `${base}/` } });
    if (sess.status !== 201) { log.push(`· ${c.id}: session ${sess.status}`); continue; }
    const { sessionId, conversationId } = sess.data;
    let leadId = null;
    for (const m of (c.conversation || []).filter((x) => x.sender === "visitor").map((x) => x.body)) {
      const r = await api(`/api/v1/conversations/${conversationId}/messages`, { method: "POST", body: { sessionId, message: m, consentAccepted: true } });
      if (r.status !== 200) break;
      if (r.data.completionStatus === "completed" && r.data.leadProfileId) { leadId = r.data.leadProfileId; break; }
    }
    if (!leadId) { const done = await api(`/api/v1/conversations/${conversationId}/complete`, { method: "POST", body: {} }); if (done.status === 201) leadId = done.data.leadProfileId; }
    if (!leadId) { log.push(`· ${c.id} [${c.category}]: no lead built (422) — no brief to grade`); continue; }

    const lead = (await api(`/api/v1/leads/${leadId}`, { headers: { authorization: auth } })).data;
    const briefRes = await api(`/api/v1/leads/${leadId}/rep-brief`, { headers: { authorization: auth } });
    const brief = briefRes.data?.rep_ready_brief || briefRes.data?.brief || briefRes.data;
    if (!brief || !brief.call_plan) { log.push(`✗ ${c.id}: lead built but no brief (rep-brief ${briefRes.status})`); continue; }
    const r = gradeBrief(lead, brief);
    briefResults.push(r);
    log.push(`${r.pass ? "✅" : "❌"} ${c.id.padEnd(11)} [${c.category.padEnd(20)}] ${r.checks.filter((x) => !x.pass).map((x) => x.name).join(", ") || "ok"}`);
  }

  const bar = "─".repeat(78);
  console.log(`\n${bar}\n Rep-brief eval — ${briefResults.length} briefs graded (${cases.length - briefResults.length} cases 422'd, no brief)\n${bar}`);
  console.log(log.join("\n"));
  if (briefResults.length) {
    console.log("\n Failing checks (detail):");
    for (const r of briefResults.filter((x) => !x.pass)) for (const ch of r.checks.filter((x) => !x.pass)) console.log(`   ${r.id}: ${ch.name} — ${ch.detail}`);
    const tail = gradeDiscoveryTailoring(briefResults);
    console.log(`\n Discovery-question tailoring: ${tail.tailored ? "✅" : "❌"} ${tail.detail}`);
    const passed = briefResults.filter((r) => r.pass).length;
    console.log(`\n${bar}\n BRIEF QUALITY: ${passed}/${briefResults.length} briefs pass  ·  tailoring ${tail.tailored ? "pass" : "FAIL"}\n${bar}`);
  }

  child.kill("SIGTERM");
  await Promise.race([new Promise((r) => child.once("exit", r)), sleep(2000)]);
  await rm(tmp, { recursive: true, force: true }).catch(() => {});
}
main().catch(async (e) => { console.error(e); child.kill("SIGTERM"); await rm(tmp, { recursive: true, force: true }).catch(() => {}); process.exit(1); });
