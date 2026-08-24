import { createHash } from "node:crypto";

const OPEN_TASK_STATUSES = new Set(["pending", "retry", "running", "awaiting_approval"]);
const CLOSED_LEAD_STAGES = new Set(["closed_won", "closed_lost", "disqualified"]);

export function buildRevenueWatchdog(input = {}) {
  const generatedAt = iso(input.now || new Date());
  const prospects = array(input.prospects);
  const tasks = array(input.tasks);
  const leads = array(input.leads);
  const repAlerts = array(input.repAlerts);
  const crmDeliveries = array(input.crmDeliveries);
  const resolutions = new Map(array(input.decisionResolutions).map((item) => [item.id, item]));
  const automation = input.automation || {};
  const windowHours = boundedNumber(input.windowHours, 1, 168, 24);
  const windowStart = new Date(Date.parse(generatedAt) - windowHours * 3_600_000).toISOString();

  const decisions = buildDecisions({
    generatedAt,
    prospects,
    tasks,
    leads,
    repAlerts,
    crmDeliveries,
    automation,
    resolutions
  });
  const learningReview = buildLearningReview({ generatedAt, prospects, tasks });
  const integrity = buildIntegrityReview({
    generatedAt,
    prospects,
    tasks,
    leads,
    repAlerts,
    crmDeliveries,
    automation,
    dataStoreMode: input.dataStoreMode
  });
  const recentSignals = prospects.flatMap((prospect) =>
    array(prospect.signals)
      .filter((signal) => signal.occurred_at >= windowStart)
      .map((signal) => ({ ...signal, prospect_id: prospect.id, account: prospect.account?.name || prospect.account?.domain || "Unknown account" }))
  );
  const recentReplies = prospects.flatMap((prospect) =>
    array(prospect.replies)
      .filter((reply) => reply.received_at >= windowStart)
      .map((reply) => ({ ...reply, prospect_id: prospect.id, account: prospect.account?.name || prospect.account?.domain || "Unknown account" }))
  );
  const openDecisions = decisions.filter((decision) => decision.resolution_status === "open");
  const urgentDecisions = openDecisions.filter((decision) => ["critical", "high"].includes(decision.severity));
  const hotProspects = prospects.filter((prospect) => Number(prospect.fit?.score || 0) >= 75 && !prospect.suppression);
  const overdueLeads = leads.filter((lead) => leadIsOverdue(lead, generatedAt));
  const failedTasks = tasks.filter((task) => task.status === "failed");

  return {
    generated_at: generatedAt,
    window: { hours: windowHours, starts_at: windowStart },
    headline: headlineFor({ urgentDecisions, hotProspects, recentReplies, integrity }),
    metrics: {
      buying_signals: recentSignals.length,
      replies: recentReplies.length,
      positive_replies: recentReplies.filter((reply) => reply.classification?.intent === "positive").length,
      referrals: recentReplies.filter((reply) => reply.classification?.intent === "referral").length,
      hot_prospects: hotProspects.length,
      meeting_ready: prospects.filter((prospect) => ["meeting_requested", "meeting_qualified"].includes(prospect.stage)).length,
      open_decisions: openDecisions.length,
      urgent_decisions: urgentDecisions.length,
      awaiting_approval: tasks.filter((task) => task.status === "awaiting_approval").length,
      failed_tasks: failedTasks.length,
      overdue_leads: overdueLeads.length
    },
    decisions,
    recent_activity: {
      signals: recentSignals.sort(sortNewest("occurred_at")).slice(0, 20),
      replies: recentReplies.sort(sortNewest("received_at")).slice(0, 20)
    },
    learning_review: learningReview,
    integrity,
    summary_markdown: buildMarkdownSummary({
      generatedAt,
      windowHours,
      openDecisions,
      urgentDecisions,
      hotProspects,
      recentSignals,
      recentReplies,
      learningReview,
      integrity
    })
  };
}

export function resolveRevenueDecision(existing = [], decisionId, resolution = {}, now = new Date()) {
  if (!String(decisionId || "").startsWith("decision_")) {
    const error = new Error("valid decision id is required");
    error.status = 400;
    error.code = "invalid_revenue_decision";
    throw error;
  }
  const allowed = new Set(["resolved", "dismissed", "snoozed"]);
  const status = allowed.has(resolution.status) ? resolution.status : "resolved";
  const record = {
    id: decisionId,
    status,
    actor: clean(resolution.actor) || "operator",
    note: clean(resolution.note) || null,
    resolved_at: iso(now),
    snoozed_until: status === "snoozed" && resolution.snoozed_until ? iso(resolution.snoozed_until) : null
  };
  return [...array(existing).filter((item) => item.id !== decisionId), record];
}

function buildDecisions({ generatedAt, prospects, tasks, leads, repAlerts, crmDeliveries, automation, resolutions }) {
  const candidates = [];
  const prospectsById = new Map(prospects.map((prospect) => [prospect.id, prospect]));

  for (const task of tasks) {
    const prospect = prospectsById.get(task.prospect_id);
    const account = prospect?.account?.name || prospect?.account?.domain || "Unknown account";
    if (task.status === "awaiting_approval") {
      const revenueCritical = ["reply_now", "meeting_invite", "human_reply", "meeting_handoff"].includes(task.type);
      candidates.push(decision({
        key: `task-approval:${task.id}`,
        severity: revenueCritical ? "high" : "medium",
        category: "approval",
        title: `${humanize(task.type)} ready for ${account}`,
        why: revenueCritical
          ? "A live buyer interaction is waiting on a decision; response speed directly affects conversion."
          : "The automation prepared an external action and is waiting for approval.",
        recommendation: recommendationForTask(task),
        evidence: [
          `Task ${task.id}`,
          `Due ${task.due_at}`,
          task.payload?.reason || task.payload?.reply_text || task.payload?.instruction
        ].filter(Boolean),
        source_url: "/sdr-ops",
        due_at: task.due_at,
        entity: { type: "sdr_task", id: task.id, prospect_id: task.prospect_id }
      }));
    }
    if (task.status === "failed") {
      candidates.push(decision({
        key: `task-failed:${task.id}`,
        severity: "critical",
        category: "system_failure",
        title: `${humanize(task.type)} failed for ${account}`,
        why: task.last_error || "The task exhausted its retry budget.",
        recommendation: "Inspect the adapter, repair the failure, then replay this task using the same idempotency key.",
        evidence: [`Attempts: ${task.attempt_count}/${task.max_attempts}`, task.last_error].filter(Boolean),
        source_url: "/sdr-ops",
        due_at: task.updated_at || task.due_at,
        entity: { type: "sdr_task", id: task.id, prospect_id: task.prospect_id }
      }));
    }
  }

  for (const prospect of prospects) {
    const latestReply = array(prospect.replies).at(-1);
    if (
      latestReply
      && ["positive", "question", "referral", "neutral"].includes(latestReply.classification?.intent)
      && !tasks.some((task) =>
        task.prospect_id === prospect.id
        && ["reply_now", "meeting_invite", "human_reply"].includes(task.type)
        && ["completed", "awaiting_approval", "pending", "retry"].includes(task.status)
      )
    ) {
      candidates.push(decision({
        key: `unrouted-reply:${latestReply.id}`,
        severity: "critical",
        category: "revenue_leak",
        title: `Reply from ${prospect.account?.name || "a prospect"} has no routed action`,
        why: `The reply was classified ${latestReply.classification?.intent || "unknown"} but no response task exists.`,
        recommendation: "Draft the response now and investigate why reply routing did not create a task.",
        evidence: [latestReply.text],
        source_url: "/sdr-ops",
        due_at: latestReply.received_at,
        entity: { type: "prospect", id: prospect.id, reply_id: latestReply.id }
      }));
    }
  }

  for (const lead of leads.filter((item) => leadIsOverdue(item, generatedAt))) {
    candidates.push(decision({
      key: `lead-overdue:${lead.id}`,
      severity: Number(lead.score?.icp_fit || 0) >= 70 ? "critical" : "high",
      category: "sla",
      title: `Follow-up overdue: ${lead.company?.name || lead.contact?.email || lead.id}`,
      why: `The lead SLA expired at ${lead.workflow?.due_at}.`,
      recommendation: lead.workflow?.next_action || lead.routing?.recommended_next_action || "Contact the lead and record the outcome.",
      evidence: [
        `ICP score: ${lead.score?.icp_fit ?? "unknown"}`,
        `Stage: ${lead.workflow?.stage || "new"}`,
        `Owner: ${lead.workflow?.owner_email || "unassigned"}`
      ],
      source_url: `/crm/${lead.id}`,
      due_at: lead.workflow?.due_at,
      entity: { type: "lead", id: lead.id }
    }));
  }

  for (const alert of repAlerts.filter((item) => item.status === "failed")) {
    candidates.push(decision({
      key: `rep-alert-failed:${alert.id}`,
      severity: "critical",
      category: "system_failure",
      title: "Rep alert delivery failed",
      why: alert.last_send_error || "A revenue alert was not delivered.",
      recommendation: "Repair the alert destination and retry the queued alert.",
      evidence: [`Alert ${alert.id}`, `Lead ${alert.lead_id || "unknown"}`],
      source_url: "/admin",
      due_at: alert.last_send_attempt_at || alert.queued_at,
      entity: { type: "rep_alert", id: alert.id, lead_id: alert.lead_id }
    }));
  }

  for (const delivery of crmDeliveries.filter((item) => item.status === "failed")) {
    candidates.push(decision({
      key: `crm-delivery-failed:${delivery.id}`,
      severity: "high",
      category: "system_failure",
      title: "CRM handoff failed",
      why: delivery.last_send_error || "The buyer profile did not reach the configured CRM destination.",
      recommendation: "Repair the CRM adapter and replay the handoff before the rep works the lead.",
      evidence: [`Delivery ${delivery.id}`, `Lead ${delivery.lead_id || "unknown"}`],
      source_url: "/admin",
      due_at: delivery.last_send_attempt_at || delivery.queued_at,
      entity: { type: "crm_delivery", id: delivery.id, lead_id: delivery.lead_id }
    }));
  }

  if (!automation.enabled) {
    candidates.push(decision({
      key: "automation-disabled",
      severity: "high",
      category: "configuration",
      title: "24/7 SDR automation is disabled",
      why: "Signals and events can be stored, but due tasks will not run unattended.",
      recommendation: "Enable SDR_AUTOMATION_ENABLED after the approval queue and integrations are verified.",
      evidence: [`Action mode: ${automation.action_mode || "unknown"}`],
      source_url: "/sdr-ops",
      due_at: generatedAt,
      entity: { type: "configuration", id: "sdr_automation" }
    }));
  }

  return candidates
    .map((item) => applyResolution(item, resolutions.get(item.id), generatedAt))
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || String(a.due_at || "").localeCompare(String(b.due_at || "")));
}

function buildLearningReview({ generatedAt, prospects, tasks }) {
  const replies = prospects.flatMap((prospect) => array(prospect.replies).map((reply) => ({ reply, prospect })));
  const byIntent = countBy(replies, ({ reply }) => reply.classification?.intent || "unknown");
  const routedReplies = replies.filter(({ reply, prospect }) => replyHasExpectedRouting(reply, prospect, tasks));
  const optedOut = prospects.filter((prospect) => prospect.suppression?.reason === "opt_out");
  const optOutCompliant = optedOut.filter((prospect) =>
    !tasks.some((task) => task.prospect_id === prospect.id && OPEN_TASK_STATUSES.has(task.status))
  );
  const repliedProspects = prospects.filter((prospect) => array(prospect.replies).length);
  const sequencesStopped = repliedProspects.filter((prospect) =>
    !tasks.some((task) => task.prospect_id === prospect.id && task.type === "outreach_touch" && OPEN_TASK_STATUSES.has(task.status))
  );
  const failedTasks = tasks.filter((task) => task.status === "failed");
  const rubric = [
    rubricItem("reply_routing", "Replies create the correct next action", routedReplies.length, replies.length, 0.95),
    rubricItem("sequence_stop", "Sequences stop when a prospect replies", sequencesStopped.length, repliedProspects.length, 1),
    rubricItem("opt_out_compliance", "Opt-outs suppress every open action", optOutCompliant.length, optedOut.length, 1),
    rubricItem("task_reliability", "Automation tasks avoid exhausted retries", tasks.length - failedTasks.length, tasks.length, 0.98)
  ];
  const measured = rubric.filter((item) => item.measured);
  const overallScore = measured.length
    ? Math.round(measured.reduce((sum, item) => sum + item.score, 0) / measured.length)
    : 100;
  const candidates = [];
  for (const item of rubric.filter((entry) => entry.status === "fail")) {
    candidates.push({
      id: `learning_${item.key}`,
      priority: item.key === "opt_out_compliance" ? "critical" : "high",
      title: item.label,
      finding: `${item.passed}/${item.total} passed (${item.score}%).`,
      proposed_change: improvementForRubric(item.key),
      deployment_policy: "Generate a tested change for operator approval; never mutate live campaigns directly."
    });
  }
  if ((byIntent.positive || 0) > 0 && prospects.every((prospect) => !array(prospect.meetings).length)) {
    candidates.push({
      id: "learning_positive_to_meeting",
      priority: "high",
      title: "Positive replies have not produced recorded meetings",
      finding: `${byIntent.positive} positive repl${byIntent.positive === 1 ? "y" : "ies"} and zero recorded meetings.`,
      proposed_change: "Audit calendar-webhook ingestion and the meeting-invite response path before changing top-of-funnel copy.",
      deployment_policy: "Require operator review."
    });
  }
  return {
    generated_at: generatedAt,
    overall_score: overallScore,
    grade: letterGrade(overallScore),
    replies_reviewed: replies.length,
    reply_intents: byIntent,
    rubric,
    improvement_candidates: candidates
  };
}

function buildIntegrityReview({ generatedAt, prospects, tasks, leads, repAlerts, crmDeliveries, automation, dataStoreMode }) {
  const lastRunAgeMinutes = automation.last_run_at
    ? Math.round((Date.parse(generatedAt) - Date.parse(automation.last_run_at)) / 60_000)
    : null;
  const intervalMinutes = Math.max(1, Number(automation.interval_ms || 60_000) / 60_000);
  const optOutLeaks = prospects.filter((prospect) =>
    prospect.suppression?.reason === "opt_out"
    && tasks.some((task) => task.prospect_id === prospect.id && OPEN_TASK_STATUSES.has(task.status))
  );
  const checks = [
    check("persistence", "Durable persistence", dataStoreMode === "sqlite" ? "pass" : "warning",
      dataStoreMode === "sqlite" ? "SQLite persistence is active." : "JSON persistence is active; use SQLite with a mounted volume for live clients."),
    check("worker", "24/7 worker", automation.enabled ? "pass" : "fail",
      automation.enabled ? "The SDR worker is enabled." : "The SDR worker is disabled."),
    check("worker_freshness", "Worker heartbeat",
      !automation.enabled ? "warning" : lastRunAgeMinutes !== null && lastRunAgeMinutes <= intervalMinutes * 3 ? "pass" : "fail",
      lastRunAgeMinutes === null ? "No completed worker cycle is recorded." : `Last completed cycle was ${lastRunAgeMinutes} minute(s) ago.`),
    check("task_failures", "Task retry health", tasks.some((task) => task.status === "failed") ? "fail" : "pass",
      `${tasks.filter((task) => task.status === "failed").length} task(s) exhausted retries.`),
    check("rep_alerts", "Rep alert delivery", repAlerts.some((item) => item.status === "failed") ? "fail" : "pass",
      `${repAlerts.filter((item) => item.status === "failed").length} rep alert(s) failed.`),
    check("crm_handoff", "CRM handoff delivery", crmDeliveries.some((item) => item.status === "failed") ? "fail" : "pass",
      `${crmDeliveries.filter((item) => item.status === "failed").length} CRM handoff(s) failed.`),
    check("opt_outs", "Cross-channel suppression", optOutLeaks.length ? "fail" : "pass",
      `${optOutLeaks.length} opted-out prospect(s) retain open actions.`),
    check("sales_sla", "Sales follow-up SLA", leads.some((lead) => leadIsOverdue(lead, generatedAt)) ? "warning" : "pass",
      `${leads.filter((lead) => leadIsOverdue(lead, generatedAt)).length} lead(s) are overdue.`),
    check("external_delivery", "External action delivery",
      automation.external_actions_automatic ? "pass" : "warning",
      automation.external_actions_automatic
        ? "Controlled webhook delivery is enabled."
        : "Approval mode is active; external actions require a human decision.")
  ];
  const failing = checks.filter((item) => item.status === "fail").length;
  const warnings = checks.filter((item) => item.status === "warning").length;
  return {
    generated_at: generatedAt,
    status: failing ? "fail" : warnings ? "warning" : "pass",
    failing,
    warnings,
    checks
  };
}

function replyHasExpectedRouting(reply, prospect, tasks) {
  const intent = reply.classification?.intent;
  if (intent === "opt_out") {
    return Boolean(prospect.suppression) && !tasks.some((task) => task.prospect_id === prospect.id && OPEN_TASK_STATUSES.has(task.status));
  }
  if (intent === "negative") return prospect.stage === "nurture";
  if (intent === "out_of_office") return prospect.stage === "paused";
  const expected = intent === "positive" ? ["meeting_invite"] : ["human_reply", "reply_now"];
  return tasks.some((task) => task.prospect_id === prospect.id && expected.includes(task.type));
}

function rubricItem(key, label, passed, total, threshold) {
  const measured = total > 0;
  const score = measured ? Math.round((passed / total) * 100) : 100;
  return {
    key,
    label,
    passed,
    total,
    measured,
    score,
    threshold_percent: Math.round(threshold * 100),
    status: !measured || score >= threshold * 100 ? "pass" : "fail"
  };
}

function improvementForRubric(key) {
  const improvements = {
    reply_routing: "Add the failed reply examples to the classifier regression set, repair the state transition, and replay them in shadow mode.",
    sequence_stop: "Enforce sequence cancellation as an atomic part of reply ingestion and add a regression test for every channel.",
    opt_out_compliance: "Make suppression a global, cross-channel gate checked immediately before every external action.",
    task_reliability: "Group failures by adapter/error, repair the highest-volume cause, then replay with the original idempotency keys."
  };
  return improvements[key] || "Inspect the failed examples and propose the smallest test-backed correction.";
}

function decision(input) {
  return {
    id: stableId(input.key),
    severity: input.severity,
    category: input.category,
    title: input.title,
    why: input.why,
    recommendation: input.recommendation,
    evidence: array(input.evidence),
    source_url: input.source_url || "/sdr-ops",
    due_at: input.due_at || null,
    entity: input.entity || null,
    resolution_status: "open",
    resolution: null
  };
}

function applyResolution(item, resolution, generatedAt) {
  if (!resolution) return item;
  if (resolution.status === "snoozed" && resolution.snoozed_until && resolution.snoozed_until <= generatedAt) return item;
  return {
    ...item,
    resolution_status: resolution.status,
    resolution
  };
}

function recommendationForTask(task) {
  if (task.type === "reply_now") return "Review the account dossier and release or edit the drafted response immediately.";
  if (task.type === "meeting_invite") return "Send the booking option now and preserve the reply context in the meeting record.";
  if (task.type === "human_reply") return "Answer the buyer's actual question; do not restart the canned sequence.";
  if (task.type === "meeting_handoff") return "Confirm the owner received the dossier before the meeting.";
  return "Review the prepared action and resolve it.";
}

function headlineFor({ urgentDecisions, hotProspects, recentReplies, integrity }) {
  if (urgentDecisions.length) {
    return `${urgentDecisions.length} revenue-critical decision${urgentDecisions.length === 1 ? " needs" : "s need"} attention.`;
  }
  if (integrity.status === "fail") return "The revenue path has a system failure even though no buyer decision is waiting.";
  if (recentReplies.length) return `${recentReplies.length} repl${recentReplies.length === 1 ? "y" : "ies"} arrived; the queue is under control.`;
  if (hotProspects.length) return `${hotProspects.length} hot prospect${hotProspects.length === 1 ? "" : "s"} are active with no urgent leak detected.`;
  return "No urgent revenue leaks detected; keep the signal engine running.";
}

function buildMarkdownSummary({ generatedAt, windowHours, openDecisions, urgentDecisions, hotProspects, recentSignals, recentReplies, learningReview, integrity }) {
  const decisionLines = openDecisions.slice(0, 5).map((item) => `- [${item.severity.toUpperCase()}] ${item.title}: ${item.recommendation}`);
  const checkLines = integrity.checks.filter((item) => item.status !== "pass").map((item) => `- [${item.status.toUpperCase()}] ${item.label}: ${item.detail}`);
  const learningLines = learningReview.improvement_candidates.slice(0, 5).map((item) => `- ${item.title}: ${item.proposed_change}`);
  return [
    "# Deal Threads Revenue Watchdog",
    "",
    `Generated: ${generatedAt}`,
    `Window: last ${windowHours} hours`,
    "",
    "## Revenue pulse",
    "",
    `- Buying signals: ${recentSignals.length}`,
    `- Replies: ${recentReplies.length}`,
    `- Hot prospects: ${hotProspects.length}`,
    `- Open decisions: ${openDecisions.length}`,
    `- Urgent decisions: ${urgentDecisions.length}`,
    "",
    "## Decisions",
    "",
    ...(decisionLines.length ? decisionLines : ["- No open decisions."]),
    "",
    "## What the engine learned",
    "",
    `- Grade: ${learningReview.grade} (${learningReview.overall_score}/100)`,
    ...(learningLines.length ? learningLines : ["- No failing rubric items in the current sample."]),
    "",
    "## Revenue-path health",
    "",
    `- Overall: ${integrity.status.toUpperCase()}`,
    ...(checkLines.length ? checkLines : ["- Every configured check passed."])
  ].join("\n");
}

function leadIsOverdue(lead, generatedAt) {
  const stage = lead.workflow?.stage || lead.outcome?.status;
  if (CLOSED_LEAD_STAGES.has(stage)) return false;
  return Boolean(lead.workflow?.due_at && Date.parse(lead.workflow.due_at) < Date.parse(generatedAt));
}

function check(key, label, status, detail) {
  return { key, label, status, detail };
}

function stableId(value) {
  return `decision_${createHash("sha256").update(String(value)).digest("hex").slice(0, 20)}`;
}

function severityRank(value) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[value] ?? 4;
}

function letterGrade(score) {
  if (score >= 97) return "A+";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "F";
}

function humanize(value) {
  return String(value || "action").replaceAll("_", " ");
}

function countBy(items, keyFn) {
  return items.reduce((counts, item) => {
    const key = keyFn(item) || "unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function sortNewest(field) {
  return (a, b) => String(b[field] || "").localeCompare(String(a[field] || ""));
}

function boundedNumber(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

function clean(value) {
  const result = String(value ?? "").trim();
  return result || null;
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function iso(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.valueOf())) throw new Error(`Invalid date: ${value}`);
  return date.toISOString();
}
