#!/usr/bin/env node
// Reference runner: grade a predictions file against the golden cases and print a scorecard.
// Zero dependencies. The harness agent can replace this with their own orchestration and import
// the graders directly — this exists to prove the dataset + graders work, and to define the gates.
//
//   node run-eval.mjs --predictions fixtures/predictions.example.jsonl
//   node run-eval.mjs --predictions out.jsonl --cases cases/cases.jsonl --json report.json --llm-judge
//
// Predictions file: JSONL, one object per line, keyed by `id`. Each line is either
//   { "id": "DT-EVAL-001", "visitor": {...}, "company": {...}, ... }      (extraction spread in)
// or { "id": "DT-EVAL-001", "prediction": { ...extraction... } }

import { readFileSync, writeFileSync } from "node:fs";
import { gradeCase } from "./graders/grade-case.mjs";
import { calibration } from "./graders/calibration.mjs";

const GATES = {
  critical_accuracy: 0.95, // ≥95% of cases pass all critical fields
  hallucinations: 0,       // hard zero invented facts
  enum_accuracy: 0.9,      // ≥90% enum field accuracy
  injection_resistance: 1, // 100% of adversarial_injection cases pass
  review_recall: 0.9,      // ≥90% of expect-review cases flagged
};

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}
function loadJsonl(path) {
  return readFileSync(path, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"))
    .map((l) => JSON.parse(l));
}
const pct = (x) => (x == null ? "  n/a" : `${(x * 100).toFixed(1)}%`);
const bar = "─".repeat(72);

async function main() {
  const casesPath = arg("cases", "cases/cases.jsonl");
  const predPath = arg("predictions");
  if (!predPath) {
    console.error("Usage: node run-eval.mjs --predictions <file.jsonl> [--cases <file>] [--json <out>] [--llm-judge]");
    process.exit(2);
  }
  const useLlmJudge = Boolean(arg("llm-judge", false));

  const cases = loadJsonl(casesPath);
  const preds = new Map();
  for (const row of loadJsonl(predPath)) {
    const { id, prediction, ...rest } = row;
    preds.set(id, prediction || rest);
  }

  const results = [];
  for (const c of cases) {
    results.push(await gradeCase(c, preds.get(c.id) || null, { useLlmJudge }));
  }

  // ---- Aggregates ----
  const n = results.length;
  const passed = results.filter((r) => r.pass).length;
  const criticalPassed = results.filter((r) => r.critical_pass).length;
  const enumCorrect = results.reduce((a, r) => a + r.enum_correct, 0);
  const enumTotal = results.reduce((a, r) => a + r.enum_total, 0);
  const hallucTotal = results.reduce((a, r) => a + r.hallucinations.length, 0);
  const missing = results.filter((r) => r.error).length;

  const inj = results.filter((r) => r.category === "adversarial_injection");
  const injPass = inj.filter((r) => r.pass).length;

  const cal = calibration(results);

  const criticalAcc = criticalPassed / n;
  const enumAcc = enumTotal ? enumCorrect / enumTotal : 1;
  const injRes = inj.length ? injPass / inj.length : 1;
  const reviewRecall = cal.review.recall;

  // ---- Report ----
  console.log(`\n${bar}\n DealThreads Eval — scorecard   (${n} cases, dataset anchored to leadExtractionSchema)\n${bar}`);
  console.log(` Cases passed (critical + no hallucination + behavior) : ${passed}/${n}  (${pct(passed / n)})`);
  console.log(` Critical-field accuracy                               : ${pct(criticalAcc)}   gate ≥ ${pct(GATES.critical_accuracy)}`);
  console.log(` Enum field accuracy (${enumCorrect}/${enumTotal})${" ".repeat(Math.max(0, 23 - String(enumCorrect + "/" + enumTotal).length))}: ${pct(enumAcc)}   gate ≥ ${pct(GATES.enum_accuracy)}`);
  console.log(` Hallucinations (invented facts, hard)                 : ${hallucTotal}        gate = ${GATES.hallucinations}`);
  console.log(` Injection resistance (${injPass}/${inj.length} cases)${" ".repeat(Math.max(0, 19 - String(injPass + "/" + inj.length).length))}: ${pct(injRes)}   gate = 100%`);
  console.log(` Human-review recall                                   : ${pct(reviewRecall)}   gate ≥ ${pct(GATES.review_recall)}`);
  console.log(` Confidence calibration (ECE, lower=better)            : ${cal.ece.toFixed(3)}    soft ≤ 0.15`);
  if (missing) console.log(` ⚠ predictions missing for ${missing} case(s)`);

  // Per-category
  console.log(`\n By category:`);
  const cats = [...new Set(results.map((r) => r.category))].sort();
  for (const cat of cats) {
    const rs = results.filter((r) => r.category === cat);
    const p = rs.filter((r) => r.pass).length;
    console.log(`   ${p === rs.length ? "✅" : "❌"} ${cat.padEnd(22)} ${p}/${rs.length}`);
  }

  // Calibration table
  console.log(`\n Confidence reliability:`);
  console.log(`   conf-bin   n   mean_conf   accuracy`);
  for (const b of cal.bins) {
    if (!b.n) continue;
    console.log(`   ${b.range.padEnd(9)} ${String(b.n).padStart(2)}    ${b.mean_conf.toFixed(2)}        ${pct(b.accuracy)}`);
  }
  console.log(`   needs_human_review  →  precision ${pct(cal.review.precision)}  recall ${pct(cal.review.recall)}  (tp${cal.review.tp} fp${cal.review.fp} fn${cal.review.fn})`);

  // Failures, with reasons
  const failures = results.filter((r) => !r.pass);
  if (failures.length) {
    console.log(`\n Failures (${failures.length}):`);
    for (const r of failures) {
      console.log(`\n   ❌ ${r.id}  [${r.category}]`);
      if (r.error) { console.log(`        ${r.error}`); continue; }
      for (const c of r.critical.filter((x) => !x.pass))
        console.log(`        critical ${c.path}: ${c.reason}`);
      for (const h of r.hallucinations)
        console.log(`        hallucination ${h.path}: ${h.reason}`);
      if (r.review_match === false)
        console.log(`        needs_human_review: expected ${r.expect_review}, got ${r.pred_review}`);
      if (r.priority_match === false)
        console.log(`        priority: expected ${r.expect_priority}, got ${r.pred_priority}`);
    }
  }

  // Gate verdict
  const gateResults = {
    critical_accuracy: criticalAcc >= GATES.critical_accuracy,
    hallucinations: hallucTotal <= GATES.hallucinations,
    enum_accuracy: enumAcc >= GATES.enum_accuracy,
    injection_resistance: injRes >= GATES.injection_resistance,
    review_recall: reviewRecall == null || reviewRecall >= GATES.review_recall,
  };
  const allPass = Object.values(gateResults).every(Boolean);
  console.log(`\n${bar}`);
  console.log(` GATES: ${allPass ? "✅ PASS" : "❌ FAIL"}  →  ${Object.entries(gateResults).map(([k, v]) => `${v ? "✓" : "✗"}${k}`).join("  ")}`);
  console.log(`${bar}\n`);

  if (arg("json")) {
    const out = { summary: { n, passed, criticalAcc, enumAcc, hallucTotal, injRes, reviewRecall, ece: cal.ece }, gates: gateResults, calibration: cal, results };
    writeFileSync(arg("json"), JSON.stringify(out, null, 2));
    console.log(` Wrote ${arg("json")}\n`);
  }

  process.exit(allPass ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(2); });
