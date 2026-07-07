// Enrichment graders — HONESTY INVARIANTS, not ground-truth match.
// The risk here is invention: confidently asserting firmographics / industry / a buying committee
// the system has no evidence for (the spec's "Do not invent enrichment facts" + Marcus Reed's
// "embarrassing, mistargeted outreach" pain). So each case asserts properties the output must hold.

export function gradeEnrichment(c, out) {
  const a = c.assert || {};
  const checks = [];
  const add = (name, pass, detail) => checks.push({ name, pass, detail });

  const indl = String(out.industry?.value ?? "").toLowerCase();
  if (a.industry_in)
    add("industry_in", a.industry_in.map((s) => s.toLowerCase()).includes(indl),
      `industry="${out.industry?.value}" — expected one of ${JSON.stringify(a.industry_in)} (case-insensitive; echoing the visitor's hint verbatim is fine)`);

  if (a.industry_not)
    add("industry_not_invented", !a.industry_not.map((s) => s.toLowerCase()).includes(indl),
      `industry="${out.industry?.value}" — must NOT invent ${JSON.stringify(a.industry_not)} without evidence`);

  if (a.max_field_confidence)
    for (const [f, thr] of Object.entries(a.max_field_confidence))
      add(`conf_${f}`, Number(out[f]?.confidence ?? 0) <= thr,
        `${f}.confidence=${out[f]?.confidence} — must be ≤ ${thr} when inferred without evidence`);

  if (a.funding_empty !== undefined)
    add("funding_grounded", ((out.funding_events || []).length === 0) === a.funding_empty,
      `funding_events length=${(out.funding_events || []).length} (must be ${a.funding_empty ? "empty — no website evidence" : "non-empty"})`);

  if (a.size_value !== undefined)
    add("size_value", out.company_size?.value === a.size_value,
      `company_size.value="${out.company_size?.value}" — expected "${a.size_value}"`);

  if (a.size_source !== undefined)
    add("size_source", out.company_size?.source === a.size_source,
      `company_size.source="${out.company_size?.source}" — expected "${a.size_source}"`);

  if (a.max_confidence !== undefined)
    add("overall_calibration", Number(out.confidence) <= a.max_confidence,
      `confidence=${out.confidence} — must be ≤ ${a.max_confidence} without firmographic evidence`);

  if (a.committee_max_confidence !== undefined) {
    const roles = out.buyer_profile?.buying_committee || [];
    const maxc = roles.length ? Math.max(...roles.map((r) => Number(r.confidence || 0))) : 0;
    add("committee_calibration", maxc <= a.committee_max_confidence,
      `top buying_committee confidence=${maxc} across ${roles.length} role(s) — must be ≤ ${a.committee_max_confidence} when firmographics are absent`);
  }

  return { id: c.id, category: c.category, pass: checks.every((x) => x.pass), checks, confidence: Number(out.confidence || 0) };
}
