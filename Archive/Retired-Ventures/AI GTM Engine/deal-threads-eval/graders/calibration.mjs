// Aggregate calibration: is the model's self-reported confidence predictive of correctness,
// and does needs_human_review fire on the cases that actually need it?
// Directly operationalizes the spec's "LLM extraction validity" diagnostic and the
// needs_human_review gate in deal-threads-dev/src/llm-extractor.js.

export function calibration(caseResults) {
  const scored = caseResults.filter((r) => !r.error);
  const N = scored.length || 1;

  // Confidence vs critical-correctness, binned. ECE = expected calibration error.
  const bins = [[0, 0.2], [0.2, 0.4], [0.4, 0.6], [0.6, 0.8], [0.8, 1.01]];
  const rows = bins.map(([lo, hi]) => {
    const inb = scored.filter((r) => r.confidence >= lo && r.confidence < hi);
    const acc = inb.length ? inb.filter((r) => r.critical_pass).length / inb.length : null;
    const conf = inb.length ? inb.reduce((a, r) => a + r.confidence, 0) / inb.length : null;
    return { range: `${lo.toFixed(1)}–${hi > 1 ? "1.0" : hi.toFixed(1)}`, n: inb.length, mean_conf: conf, accuracy: acc };
  });
  let ece = 0;
  for (const r of rows) if (r.n) ece += (r.n / N) * Math.abs(r.mean_conf - r.accuracy);

  // needs_human_review precision/recall (only over cases that assert an expectation).
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const r of scored) {
    if (r.expect_review === undefined) continue;
    const exp = r.expect_review === true;
    const got = r.pred_review === true;
    if (exp && got) tp++;
    else if (!exp && got) fp++;
    else if (exp && !got) fn++;
    else tn++;
  }
  const recall = tp + fn ? tp / (tp + fn) : null;
  const precision = tp + fp ? tp / (tp + fp) : null;

  return { ece, bins: rows, review: { tp, fp, fn, tn, precision, recall } };
}
