// Field-level graders: score a predicted extraction against ground truth.
// Pure functions, no dependencies. Knows which fields are enums vs identity vs free-text,
// and enforces the "empty-sentinel" rule: when ground truth is empty/unknown, asserting a
// concrete value is a hallucination, not a near-miss.

export const ENUM_PATHS = new Set([
  "visitor.seniority", "visitor.authority_signal",
  "qualification.timeline", "qualification.budget_status", "qualification.budget_range",
  "qualification.buying_stage", "qualification.crm",
  "routing.priority_hint", "routing.route_type",
]);
export const EMAIL_PATHS = new Set(["visitor.email"]);
export const ARRAY_PATHS = new Set(["qualification.sales_stack"]);

const STOP = new Set(
  "the a an of to and or for with in on at by we our you your is are be it that this these those they them their my im i a/b about not no do does can could would like into".split(/\s+/)
);

export function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export function normalize(s) {
  if (s == null) return "";
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// "unknown" is the schema's empty sentinel; "none" is a MEANINGFUL enum value, so it is NOT empty.
export function isEmpty(v) {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  const s = String(v).trim().toLowerCase();
  return s === "" || s === "unknown";
}

export function fieldType(path) {
  if (ENUM_PATHS.has(path)) return "enum";
  if (EMAIL_PATHS.has(path)) return "email";
  if (ARRAY_PATHS.has(path)) return "array";
  if (path === "meta.needs_human_review") return "bool";
  return "text";
}

function contentTokens(s) {
  return normalize(s).split(" ").filter((t) => t.length >= 3 && !STOP.has(t));
}
function numberTokens(s) {
  return normalize(s).match(/\b\d+\b/g) || [];
}

// Fraction of `value`'s salient tokens present (as substrings) in `sourceText`.
// Numbers are factual: any number in `value` absent from the source forces grounding to 0
// (e.g. inventing "500 employees" when the visitor said 200). A number that IS present counts as a
// grounded token, so "40 employees" stays grounded even if the descriptor "employees" was never said.
export function groundedness(value, sourceText) {
  if (isEmpty(value)) return 1;
  const src = normalize(sourceText);
  const nums = numberTokens(value);
  for (const d of nums) {
    if (!new RegExp(`\\b${d}\\b`).test(src)) return 0;
  }
  const salient = [...new Set([...contentTokens(value), ...nums])];
  if (salient.length === 0) return 1; // only numbers, and they were present
  const present = salient.filter((t) => src.includes(t)).length;
  return present / salient.length;
}

export function gradeField(path, expected, predicted) {
  const type = fieldType(path);

  // Empty-sentinel: ground truth absent => prediction must be absent (else: invented fact).
  if (type !== "bool" && isEmpty(expected)) {
    const pass = isEmpty(predicted);
    return { path, type, pass, expected, predicted,
      reason: pass ? "correctly empty/unknown" : "asserted a value where ground truth is empty (hallucination)" };
  }

  if (type === "bool") {
    const pass = Boolean(expected) === Boolean(predicted);
    return { path, type, pass, expected, predicted, reason: pass ? "match" : "boolean mismatch" };
  }

  if (type === "enum") {
    const pass = normalize(expected) === normalize(predicted);
    return { path, type, pass, expected, predicted, reason: pass ? "enum match" : `expected "${expected}", got "${predicted ?? "∅"}"` };
  }

  if (type === "email") {
    const pass = normalize(expected).replace(/ /g, "") === normalize(predicted).replace(/ /g, "");
    return { path, type, pass, expected, predicted, reason: pass ? "email match" : `expected "${expected}", got "${predicted ?? "∅"}"` };
  }

  if (type === "array") {
    const e = new Set((expected || []).map(normalize));
    const p = new Set((predicted || []).map(normalize));
    let inter = 0;
    for (const x of e) if (p.has(x)) inter++;
    const prec = p.size ? inter / p.size : 1;
    const rec = e.size ? inter / e.size : 1;
    const f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 1;
    return { path, type, pass: f1 >= 0.5, expected, predicted, reason: `set F1=${f1.toFixed(2)}` };
  }

  // text: missing a required value is a fail; otherwise grounded-overlap match (tolerates paraphrase).
  if (isEmpty(predicted)) {
    return { path, type, pass: false, expected, predicted, reason: "missing — expected a grounded value" };
  }
  const score = Math.max(groundedness(predicted, expected), groundedness(expected, predicted));
  return { path, type, pass: score >= 0.4, expected, predicted, reason: `text overlap=${score.toFixed(2)}` };
}
