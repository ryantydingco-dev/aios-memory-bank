// Rep-brief graders — is the generated brief faithful, tailored, and safe to put in front of a rep?
// Deterministic checks against lead.rep_ready_brief (buildRepReadyBrief in server.js).

export function gradeBrief(lead, brief) {
  const checks = [];
  const add = (name, pass, detail) => checks.push({ name, pass, detail });
  const cb = brief.copy_blocks || {};
  const outbound = `${cb.email_opener || ""}  ${cb.voicemail_opener || ""}`;

  // 1) Placeholder leakage: outbound copy must never ship "Unknown visitor / Unknown company".
  const leak = /unknown (visitor|company)/i.exec(outbound);
  add("no_placeholder_in_outbound", !leak,
    leak ? `outbound copy would send "${leak[0]}" — embarrassing if a rep fires it as-is` : "clean");

  // 2) Honest hedging: when enrichment confidence is low, the brief must warn the rep.
  const conf = Number(brief.evidence?.confidence || 0);
  const flags = (brief.quality_flags || []).join(" | ");
  if (conf < 0.7)
    add("low_confidence_flagged", /confidence|verify firmographic/i.test(flags),
      `enrichment confidence ${conf} < 0.7 but no firmographic-verify quality flag (${brief.quality_flags?.length || 0} flags present)`);

  // 3) Fabricated committee must not be surfaced to the rep at high confidence.
  const roles = brief.buyer_profile?.buying_committee || [];
  const maxc = roles.length ? Math.max(...roles.map((r) => Number(r.confidence || 0))) : 0;
  add("committee_not_overconfident", maxc <= 0.6,
    `brief presents ${roles.length} buying-committee role(s) at confidence up to ${maxc} (enrichment archetypes, not identified people)`);

  // 4) Faithfulness: the call plan's stated budget label must match the lead (no invented budget).
  const planText = (brief.call_plan || []).join("  ");
  const budgetMatch = /budget is ([a-z ]+?),/i.exec(planText);
  if (budgetMatch && (lead.qualification?.budget_status === "unknown" || !lead.qualification?.budget_status)) {
    const said = budgetMatch[1].trim().toLowerCase();
    add("budget_faithful", said === "unknown" || said === "not provided",
      `call plan says "budget is ${said}" but the lead's budget_status is unknown`);
  }

  return { id: lead.id, headline: brief.headline, pass: checks.every((c) => c.pass), checks, discovery: brief.discovery_questions || [] };
}

// Cross-lead: are discovery questions tailored, or the same hardcoded set for every lead?
export function gradeDiscoveryTailoring(briefResults) {
  const sets = briefResults.map((r) => JSON.stringify(r.discovery));
  const distinct = new Set(sets);
  const tailored = distinct.size > 1;
  return {
    tailored,
    distinct: distinct.size,
    total: briefResults.length,
    detail: tailored
      ? `${distinct.size} distinct discovery-question sets across ${briefResults.length} leads`
      : `all ${briefResults.length} leads got the IDENTICAL ${briefResults[0]?.discovery.length || 0} discovery questions — not tailored to route/persona/need`,
  };
}
