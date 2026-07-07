#!/usr/bin/env node
// Enrichment eval: imports the product's REAL enrichment function and grades its honesty invariants.
// Deterministic + network-free for the no-website cases (which exercise inferIndustry / inferBuyingCommittee
// / calculateConfidence — the invention surface). No API key, no server.
//
//   node run-enrichment-eval.mjs
//
// Anchored to deal-threads-dev/src/internal-enrichment.js `enrichCompanyInternally(profile)`.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gradeEnrichment } from "./graders/enrichment-graders.mjs";
import { enrichCompanyInternally } from "../deal-threads-dev/src/internal-enrichment.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));

// Mirror of the product's emptyProfile() shape so enrichCompanyInternally gets a complete input.
function baseProfile() {
  return {
    visitor: { name: null, email: null, phone: null, role: null, seniority: "unknown", authority_signal: "unknown" },
    company: { name: null, domain: null, website: null, industry_hint: null, size_hint: null },
    qualification: {
      business_need: null, pain_point: null, product_interest: null, timeline: "unknown",
      budget_status: "unknown", budget_range: "unknown", buying_stage: "unknown", crm: "unknown",
      sales_stack: [], integration_need: null,
    },
    routing: { priority_hint: "manual_review", route_type: "manual_review", recommended_next_action: "" },
    meta: { confidence: 0.5, missing_required_fields: [], needs_human_review: false, reasoning_summary: null },
  };
}
function mergeDeep(base, over) {
  for (const [k, v] of Object.entries(over || {})) {
    base[k] = v && typeof v === "object" && !Array.isArray(v) ? mergeDeep(base[k] || {}, v) : v;
  }
  return base;
}

const cases = readFileSync(path.join(HERE, "cases", "enrichment-cases.jsonl"), "utf8")
  .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//")).map((l) => JSON.parse(l));

const bar = "─".repeat(76);
console.log(`\n${bar}\n Enrichment eval — honesty invariants (${cases.length} cases)   [internal/fallback path, network-free]\n${bar}`);

const results = [];
for (const c of cases) {
  const profile = mergeDeep(baseProfile(), c.profile || {});
  let out;
  try { out = await enrichCompanyInternally(profile); }
  catch (e) { results.push({ id: c.id, category: c.category, pass: false, checks: [{ name: "ran", pass: false, detail: e.message }], confidence: 0 }); continue; }
  const r = gradeEnrichment(c, out);
  r._actual = {
    confidence: out.confidence,
    industry: out.industry?.value,
    industry_conf: out.industry?.confidence,
    size: `${out.company_size?.value} (${out.company_size?.source})`,
    funding: (out.funding_events || []).length,
    committee: (out.buyer_profile?.buying_committee || []).map((x) => `${x.title || x.role || x.value}@${x.confidence}`),
  };
  results.push(r);
}

const passed = results.filter((r) => r.pass).length;
for (const r of results) {
  console.log(`\n ${r.pass ? "✅" : "❌"} ${r.id}  [${r.category}]`);
  if (r._actual) console.log(`    actual: conf=${r._actual.confidence} industry=${r._actual.industry}(${r._actual.industry_conf}) size=${r._actual.size} funding=${r._actual.funding} committee=[${r._actual.committee.join(", ")}]`);
  for (const ch of r.checks.filter((x) => !x.pass)) console.log(`      ✗ ${ch.name}: ${ch.detail}`);
}

console.log(`\n${bar}`);
console.log(` ENRICHMENT HONESTY: ${passed}/${cases.length} cases pass invariants`);
console.log(`${bar}\n`);
process.exit(passed === cases.length ? 0 : 1);
