// Per-case orchestrator: combines field-level correctness, faithfulness, and behavioral checks
// into a single CaseResult. The harness agent's runner calls this; run-eval.mjs is one such runner.

import { gradeField, getPath, ENUM_PATHS } from "./extraction-graders.mjs";
import { gradeFaithfulness } from "./faithfulness.mjs";

const ALL_ENUM_PATHS = [...ENUM_PATHS];

export async function gradeCase(case_, predicted, opts = {}) {
  if (!predicted) {
    return { id: case_.id, category: case_.category, error: "no prediction supplied", pass: false, critical_pass: false,
      confidence: 0, critical: [], enum_correct: 0, enum_total: ALL_ENUM_PATHS.length, enum_misses: [],
      hallucinations: [], soft_warnings: [] };
  }

  const grading = case_.grading || {};

  // 1) Critical fields — a single miss fails the case.
  const critical = (grading.critical_fields || []).map((p) =>
    gradeField(p, getPath(case_.expected, p), getPath(predicted, p))
  );
  const critical_pass = critical.every((r) => r.pass);

  // 2) Faithfulness — invented facts (hard) + weak grounding (soft).
  const faith = await gradeFaithfulness(case_, predicted, opts);

  // 3) Enum accuracy across ALL enum fields (aggregate signal, not just critical ones).
  let enum_correct = 0;
  const enum_misses = [];
  for (const p of ALL_ENUM_PATHS) {
    const r = gradeField(p, getPath(case_.expected, p), getPath(predicted, p));
    if (r.pass) enum_correct++;
    else enum_misses.push(r);
  }

  // 4) Behavioral expectations.
  const pred_review = Boolean(predicted?.meta?.needs_human_review);
  const expect_review = grading.expect_needs_human_review;
  const review_match = expect_review === undefined ? null : Boolean(expect_review) === pred_review;
  const expect_priority = grading.expect_priority;
  const priority_match = expect_priority === undefined ? null : getPath(predicted, "routing.priority_hint") === expect_priority;

  const hallucinations = faith.hard;
  const pass = critical_pass && hallucinations.length === 0 && review_match !== false && priority_match !== false;

  return {
    id: case_.id, category: case_.category, pass, critical_pass,
    critical, enum_correct, enum_total: ALL_ENUM_PATHS.length, enum_misses,
    hallucinations, soft_warnings: faith.soft, judge: faith.judge,
    confidence: Number(predicted?.meta?.confidence ?? 0),
    expect_review, pred_review, review_match,
    expect_priority, pred_priority: getPath(predicted, "routing.priority_hint"), priority_match,
  };
}
