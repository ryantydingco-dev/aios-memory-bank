import { randomUUID } from "node:crypto";

const SIGNAL_WEIGHTS = {
  inbound: 28,
  engagement: 20,
  funding: 16,
  leadership_change: 15,
  form_problem: 14,
  hiring: 12,
  expansion: 12,
  tool_change: 10,
  news: 6,
  other: 4
};

const EXTERNAL_TASK_TYPES = new Set([
  "outreach_touch",
  "reply_now",
  "meeting_invite",
  "human_reply",
  "meeting_handoff"
]);

const TERMINAL_TASK_STATUSES = new Set(["completed", "cancelled", "suppressed"]);

export function createSdrDesk(initialSnapshot = {}, options = {}) {
  const clock = options.clock || (() => new Date());
  const config = {
    minFitScore: numberInRange(options.minFitScore, 0, 100, 55),
    maxAttempts: numberInRange(options.maxAttempts, 1, 10, 5),
    baseRetryMinutes: numberInRange(options.baseRetryMinutes, 1, 1440, 5),
    touchDelaysMinutes: normalizeDelays(options.touchDelaysMinutes || [0, 2 * 24 * 60, 5 * 24 * 60])
  };
  let state = normalizeSnapshot(initialSnapshot);

  function restore(snapshot = {}) {
    state = normalizeSnapshot(snapshot);
    return status();
  }

  function snapshot() {
    return structuredClone({
      schema: "deal_threads.sdr_desk.v1",
      prospects: [...state.prospects.values()],
      tasks: [...state.tasks.values()],
      processed_events: [...state.processedEvents.values()],
      runs: state.runs,
      last_run_at: state.lastRunAt,
      last_error: state.lastError
    });
  }

  function ingestSignal(input = {}) {
    const occurredAt = iso(input.occurred_at || input.occurredAt, clock);
    const eventId = requiredString(input.event_id || input.eventId, "event_id");
    const duplicate = state.processedEvents.get(eventId);
    if (duplicate) return { deduplicated: true, event: duplicate, prospect: state.prospects.get(duplicate.prospect_id) || null };

    const accountDomain = normalizeDomain(input.account_domain || input.accountDomain || input.company?.domain);
    const accountName = clean(input.account_name || input.accountName || input.company?.name) || accountDomain;
    if (!accountDomain && !accountName) throw validationError("account_domain or account_name is required");

    const prospectId = clean(input.prospect_id || input.prospectId) || prospectKey(accountDomain || accountName, input);
    const existing = state.prospects.get(prospectId);
    const signal = {
      id: `sig_${randomUUID()}`,
      event_id: eventId,
      type: normalizeSignalType(input.signal_type || input.signalType || input.type),
      source: clean(input.source) || "unknown",
      summary: clean(input.summary || input.signal || input.description) || "Buying signal received",
      strength: numberInRange(input.strength, 0, 1, 0.6),
      source_url: clean(input.source_url || input.sourceUrl) || null,
      occurred_at: occurredAt,
      received_at: nowIso(clock)
    };
    const prospect = {
      id: prospectId,
      account: {
        name: accountName || existing?.account?.name || "Unknown account",
        domain: accountDomain || existing?.account?.domain || null,
        employee_count: positiveInteger(input.employee_count || input.employeeCount) || existing?.account?.employee_count || null,
        industry: clean(input.industry) || existing?.account?.industry || null
      },
      contact: {
        name: clean(input.contact_name || input.contactName || input.contact?.name) || existing?.contact?.name || null,
        email: normalizeEmail(input.contact_email || input.contactEmail || input.contact?.email) || existing?.contact?.email || null,
        role: clean(input.contact_role || input.contactRole || input.contact?.role) || existing?.contact?.role || null,
        linkedin_url: clean(input.linkedin_url || input.linkedinUrl || input.contact?.linkedin_url) || existing?.contact?.linkedin_url || null
      },
      stage: existing?.stage || "signal_detected",
      suppression: existing?.suppression || null,
      signals: dedupeSignals([...(existing?.signals || []), signal]),
      replies: existing?.replies || [],
      meetings: existing?.meetings || [],
      created_at: existing?.created_at || nowIso(clock),
      updated_at: nowIso(clock),
      source_lead_id: clean(input.source_lead_id || input.sourceLeadId) || existing?.source_lead_id || null,
      fit: {},
      dossier: {},
      sequence: existing?.sequence || null,
      next_action: null
    };

    prospect.fit = scoreProspect(prospect, input.fit || input);
    prospect.dossier = buildDossier(prospect, input);
    prospect.sequence = buildSequence(prospect, input.voice || {});
    prospect.next_action = nextActionForSignal(prospect, signal);
    state.prospects.set(prospect.id, prospect);

    const event = recordEvent(eventId, "signal", prospect.id, occurredAt);
    scheduleTask(prospect.id, "research_refresh", occurredAt, {
      reason: signal.summary,
      signal_id: signal.id,
      source_url: signal.source_url
    }, `${eventId}:research`);

    if (!prospect.suppression && prospect.fit.score >= config.minFitScore) {
      if (signal.type === "inbound") {
        scheduleTask(prospect.id, "reply_now", occurredAt, {
          draft: prospect.sequence.touches[0].body,
          reason: "High-intent inbound signal"
        }, `${eventId}:reply`);
      } else {
        prospect.sequence.touches.forEach((touch, index) => {
          scheduleTask(
            prospect.id,
            "outreach_touch",
            addMinutes(occurredAt, config.touchDelaysMinutes[index] ?? config.touchDelaysMinutes.at(-1)),
            { ...touch, sequence_id: prospect.sequence.id },
            `${prospect.sequence.id}:touch:${index + 1}`
          );
        });
      }
    }

    return { deduplicated: false, event, prospect: structuredClone(prospect) };
  }

  function ingestReply(input = {}) {
    const eventId = requiredString(input.event_id || input.eventId, "event_id");
    const duplicate = state.processedEvents.get(eventId);
    if (duplicate) return { deduplicated: true, event: duplicate, prospect: state.prospects.get(duplicate.prospect_id) || null };
    const prospect = findProspect(input);
    if (!prospect) throw validationError("prospect not found");

    const receivedAt = iso(input.received_at || input.receivedAt, clock);
    const text = requiredString(input.text || input.body || input.reply, "text");
    const classification = classifyReply(text);
    const reply = {
      id: `reply_${randomUUID()}`,
      event_id: eventId,
      channel: clean(input.channel) || "email",
      text,
      classification,
      received_at: receivedAt
    };
    prospect.replies.push(reply);
    prospect.updated_at = nowIso(clock);
    cancelFutureOutreach(prospect.id, `Reply received: ${classification.intent}`);

    if (classification.intent === "opt_out") {
      prospect.stage = "suppressed";
      prospect.suppression = { reason: "opt_out", at: receivedAt, source_event_id: eventId };
      suppressOpenTasks(prospect.id, "Prospect opted out");
      prospect.next_action = "No contact. Preserve suppression across every channel.";
    } else if (classification.intent === "positive") {
      prospect.stage = "meeting_requested";
      prospect.next_action = "Send a booking option and qualification context now.";
      scheduleTask(prospect.id, "meeting_invite", receivedAt, { reply_id: reply.id, reply_text: text }, `${eventId}:meeting`);
    } else if (classification.intent === "referral") {
      prospect.stage = "referred";
      prospect.next_action = "Research the referred contact and preserve this thread's context.";
      scheduleTask(prospect.id, "human_reply", receivedAt, { reply_id: reply.id, instruction: "Thank the sender and validate the referral." }, `${eventId}:referral`);
    } else if (classification.intent === "negative") {
      prospect.stage = "nurture";
      prospect.next_action = "Stop the sequence and wait for a new material signal.";
    } else if (classification.intent === "out_of_office") {
      prospect.stage = "paused";
      prospect.next_action = "Resume after the return date or in seven days if no date was parsed.";
      scheduleTask(prospect.id, "outreach_touch", addMinutes(receivedAt, 7 * 24 * 60), {
        draft: prospect.sequence.touches.at(-1).body,
        reason: "Out-of-office resume"
      }, `${eventId}:resume`);
    } else {
      prospect.stage = "reply_review";
      prospect.next_action = "Answer the question with account context; do not continue the canned sequence.";
      scheduleTask(prospect.id, "human_reply", receivedAt, { reply_id: reply.id, reply_text: text }, `${eventId}:review`);
    }

    state.prospects.set(prospect.id, prospect);
    const event = recordEvent(eventId, "reply", prospect.id, receivedAt);
    return { deduplicated: false, event, classification, prospect: structuredClone(prospect) };
  }

  function ingestMeeting(input = {}) {
    const eventId = requiredString(input.event_id || input.eventId, "event_id");
    const duplicate = state.processedEvents.get(eventId);
    if (duplicate) return { deduplicated: true, event: duplicate, prospect: state.prospects.get(duplicate.prospect_id) || null };
    const prospect = findProspect(input);
    if (!prospect) throw validationError("prospect not found");

    const meeting = qualifyMeeting(prospect, input, clock);
    prospect.meetings.push(meeting);
    prospect.stage = meeting.qualified ? "meeting_qualified" : "meeting_review";
    prospect.next_action = meeting.qualified
      ? "Route the dossier, signal history, and qualification summary to the meeting owner."
      : "Review missing qualification fields before spending seller time.";
    prospect.updated_at = nowIso(clock);
    scheduleTask(prospect.id, "meeting_handoff", meeting.starts_at || nowIso(clock), {
      meeting_id: meeting.id,
      qualification: meeting.qualification,
      dossier: prospect.dossier
    }, `${eventId}:handoff`);
    state.prospects.set(prospect.id, prospect);
    const event = recordEvent(eventId, "meeting", prospect.id, meeting.created_at);
    return { deduplicated: false, event, meeting, prospect: structuredClone(prospect) };
  }

  async function runDueTasks(executor, runOptions = {}) {
    if (typeof executor !== "function") throw new Error("runDueTasks requires an executor");
    const startedAt = nowIso(clock);
    const limit = numberInRange(runOptions.limit, 1, 100, 25);
    const due = [...state.tasks.values()]
      .filter((task) => ["pending", "retry"].includes(task.status) && Date.parse(task.due_at) <= Date.parse(startedAt))
      .sort((a, b) => a.due_at.localeCompare(b.due_at))
      .slice(0, limit);
    const run = {
      id: `run_${randomUUID()}`,
      started_at: startedAt,
      completed_at: null,
      considered: due.length,
      completed: 0,
      awaiting_approval: 0,
      retried: 0,
      failed: 0,
      results: []
    };

    for (const task of due) {
      task.status = "running";
      task.attempt_count += 1;
      task.last_attempt_at = nowIso(clock);
      try {
        const prospect = state.prospects.get(task.prospect_id);
        const result = (await executor(structuredClone(task), structuredClone(prospect))) || {};
        task.status = result.status === "awaiting_approval" ? "awaiting_approval" : "completed";
        task.completed_at = task.status === "completed" ? nowIso(clock) : null;
        task.result = result;
        task.last_error = null;
        if (task.status === "awaiting_approval") run.awaiting_approval += 1;
        else run.completed += 1;
      } catch (error) {
        task.last_error = String(error?.message || error);
        if (task.attempt_count >= task.max_attempts) {
          task.status = "failed";
          run.failed += 1;
        } else {
          task.status = "retry";
          task.due_at = addMinutes(nowIso(clock), config.baseRetryMinutes * 2 ** (task.attempt_count - 1));
          run.retried += 1;
        }
      }
      task.updated_at = nowIso(clock);
      run.results.push({ task_id: task.id, status: task.status, error: task.last_error });
    }

    run.completed_at = nowIso(clock);
    state.lastRunAt = run.completed_at;
    state.lastError = run.failed ? `${run.failed} task(s) exhausted retries` : null;
    state.runs.unshift(run);
    state.runs = state.runs.slice(0, 50);
    return structuredClone(run);
  }

  function resolveTask(taskId, resolution = {}) {
    const task = state.tasks.get(taskId);
    if (!task) throw validationError("task not found");
    if (TERMINAL_TASK_STATUSES.has(task.status)) return structuredClone(task);
    task.status = resolution.status === "cancelled" ? "cancelled" : "completed";
    task.completed_at = nowIso(clock);
    task.updated_at = task.completed_at;
    task.result = {
      mode: clean(resolution.mode) || "manual",
      note: clean(resolution.note) || "Resolved by operator",
      actor: clean(resolution.actor) || "operator"
    };
    return structuredClone(task);
  }

  function status() {
    const tasks = [...state.tasks.values()];
    const prospects = [...state.prospects.values()];
    return {
      generated_at: nowIso(clock),
      schema: "deal_threads.sdr_desk.v1",
      prospects: {
        total: prospects.length,
        hot: prospects.filter((prospect) => prospect.fit?.score >= 75 && !prospect.suppression).length,
        suppressed: prospects.filter((prospect) => prospect.suppression).length,
        meeting_ready: prospects.filter((prospect) => ["meeting_requested", "meeting_qualified"].includes(prospect.stage)).length
      },
      tasks: countBy(tasks, (task) => task.status),
      task_types: countBy(tasks.filter((task) => !TERMINAL_TASK_STATUSES.has(task.status)), (task) => task.type),
      processed_events: state.processedEvents.size,
      last_run_at: state.lastRunAt,
      last_error: state.lastError,
      recent_runs: structuredClone(state.runs.slice(0, 10))
    };
  }

  function listProspects() {
    return structuredClone([...state.prospects.values()].sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
  }

  function listTasks() {
    return structuredClone([...state.tasks.values()].sort((a, b) => a.due_at.localeCompare(b.due_at)));
  }

  function findProspect(input) {
    const explicitId = clean(input.prospect_id || input.prospectId);
    if (explicitId) return state.prospects.get(explicitId) || null;
    const domain = normalizeDomain(input.account_domain || input.accountDomain || input.company?.domain);
    const email = normalizeEmail(input.contact_email || input.contactEmail || input.contact?.email);
    return [...state.prospects.values()].find(
      (prospect) => (domain && prospect.account.domain === domain) || (email && prospect.contact.email === email)
    ) || null;
  }

  function scheduleTask(prospectId, type, dueAt, payload, idempotencyKey) {
    const existing = [...state.tasks.values()].find((task) => task.idempotency_key === idempotencyKey);
    if (existing) return existing;
    const task = {
      id: `task_${randomUUID()}`,
      idempotency_key: idempotencyKey,
      prospect_id: prospectId,
      type,
      external_action: EXTERNAL_TASK_TYPES.has(type),
      status: "pending",
      due_at: iso(dueAt, clock),
      payload: payload || {},
      attempt_count: 0,
      max_attempts: config.maxAttempts,
      last_attempt_at: null,
      completed_at: null,
      last_error: null,
      result: null,
      created_at: nowIso(clock),
      updated_at: nowIso(clock)
    };
    state.tasks.set(task.id, task);
    return task;
  }

  function cancelFutureOutreach(prospectId, reason) {
    for (const task of state.tasks.values()) {
      if (
        task.prospect_id === prospectId
        && ["outreach_touch", "reply_now", "human_reply", "meeting_invite"].includes(task.type)
        && ["pending", "retry", "awaiting_approval"].includes(task.status)
      ) {
        task.status = "cancelled";
        task.completed_at = nowIso(clock);
        task.updated_at = task.completed_at;
        task.result = { reason };
      }
    }
  }

  function suppressOpenTasks(prospectId, reason) {
    for (const task of state.tasks.values()) {
      if (task.prospect_id === prospectId && !TERMINAL_TASK_STATUSES.has(task.status) && task.status !== "failed") {
        task.status = "suppressed";
        task.completed_at = nowIso(clock);
        task.updated_at = task.completed_at;
        task.result = { reason };
      }
    }
  }

  function recordEvent(eventId, type, prospectId, occurredAt) {
    const event = { event_id: eventId, type, prospect_id: prospectId, occurred_at: occurredAt, processed_at: nowIso(clock) };
    state.processedEvents.set(eventId, event);
    return event;
  }

  return {
    restore,
    snapshot,
    status,
    listProspects,
    listTasks,
    ingestSignal,
    ingestReply,
    ingestMeeting,
    runDueTasks,
    resolveTask
  };
}

export function classifyReply(value = "") {
  const text = String(value).toLowerCase();
  if (/\b(unsubscribe|remove me|stop (?:emailing|contacting)|do not contact|opt out)\b/.test(text)) {
    return { intent: "opt_out", confidence: 0.99, sentiment: "negative" };
  }
  if (/\b(out of (?:the )?office|on (?:annual )?leave|away until|return(?:ing)? on)\b/.test(text)) {
    return { intent: "out_of_office", confidence: 0.94, sentiment: "neutral" };
  }
  if (/\b(speak|talk|contact|reach out) (?:to )?(?:my|our|the)\b|\bbetter person\b|\bloop(?:ing)? in\b/.test(text)) {
    return { intent: "referral", confidence: 0.82, sentiment: "positive" };
  }
  if (/\b(not interested|no thanks|not a priority|already have|not relevant|pass for now)\b/.test(text)) {
    return { intent: "negative", confidence: 0.93, sentiment: "negative" };
  }
  if (/\b(interested|sounds good|let'?s (?:talk|chat)|book|schedule|calendar|send (?:me )?(?:times|the link)|yes[,!. ]|happy to)\b/.test(text)) {
    return { intent: "positive", confidence: 0.9, sentiment: "positive" };
  }
  if (text.includes("?") || /\b(how|what|which|who|when|where|why|pricing|cost|details)\b/.test(text)) {
    return { intent: "question", confidence: 0.76, sentiment: "neutral" };
  }
  return { intent: "neutral", confidence: 0.5, sentiment: "neutral" };
}

function normalizeSnapshot(snapshot = {}) {
  return {
    prospects: new Map((snapshot.prospects || []).map((item) => [item.id, item])),
    tasks: new Map((snapshot.tasks || []).map((item) => [item.id, item])),
    processedEvents: new Map((snapshot.processed_events || snapshot.processedEvents || []).map((item) => [item.event_id, item])),
    runs: Array.isArray(snapshot.runs) ? snapshot.runs : [],
    lastRunAt: snapshot.last_run_at || snapshot.lastRunAt || null,
    lastError: snapshot.last_error || snapshot.lastError || null
  };
}

function scoreProspect(prospect, hints = {}) {
  let score = 15;
  const reasons = [];
  const strongestSignal = Math.max(0, ...prospect.signals.map((signal) => (SIGNAL_WEIGHTS[signal.type] || 4) * signal.strength));
  score += strongestSignal;
  if (truthy(hints.icp_match || hints.icpMatch)) {
    score += 25;
    reasons.push("Explicit ICP match");
  }
  if (truthy(hints.authority) || /founder|owner|chief|vp|vice president|head|director/i.test(prospect.contact.role || "")) {
    score += 15;
    reasons.push("Decision authority signal");
  }
  if (truthy(hints.active_need || hints.activeNeed) || prospect.signals.some((signal) => ["inbound", "form_problem"].includes(signal.type))) {
    score += 15;
    reasons.push("Active problem or inbound intent");
  }
  if (truthy(hints.near_term || hints.nearTerm) || /week|month|quarter|now|urgent/i.test(String(hints.timeline || ""))) {
    score += 10;
    reasons.push("Near-term timing");
  }
  if (prospect.account.employee_count >= 20 && prospect.account.employee_count <= 5000) {
    score += 10;
    reasons.push("Company size in operating range");
  }
  if (prospect.contact.email) score += 4;
  const finalScore = Math.round(Math.min(100, Math.max(0, score)));
  return {
    score: finalScore,
    tier: finalScore >= 75 ? "A" : finalScore >= 55 ? "B" : finalScore >= 35 ? "C" : "D",
    reasons,
    scored_at: prospect.updated_at
  };
}

function buildDossier(prospect, input = {}) {
  const sources = prospect.signals.filter((signal) => signal.source_url).map((signal) => signal.source_url);
  return {
    account_summary: `${prospect.account.name}${prospect.account.industry ? ` operates in ${prospect.account.industry}` : ""}.`,
    why_now: prospect.signals.slice(-3).map((signal) => signal.summary),
    contact_hypothesis: prospect.contact.role
      ? `${prospect.contact.name || "This contact"} is a ${prospect.contact.role} and may own or influence the problem.`
      : "Contact ownership is not yet verified.",
    evidence: prospect.signals.slice(-10),
    source_urls: [...new Set(sources)],
    facts: Array.isArray(input.facts) ? input.facts.map(clean).filter(Boolean) : [],
    unknowns: [
      !prospect.contact.role && "decision role",
      !prospect.account.employee_count && "company size",
      !prospect.contact.email && "verified contact channel"
    ].filter(Boolean),
    built_at: prospect.updated_at
  };
}

function buildSequence(prospect, voice = {}) {
  const tone = clean(voice.tone) || "direct, useful, and low-pressure";
  const proof = clean(voice.proof) || "We build the buyer context before the first sales touch";
  const cta = clean(voice.cta) || "Worth a quick look?";
  const signal = prospect.signals.at(-1)?.summary || "I noticed a possible handoff gap";
  const firstName = prospect.contact.name?.split(/\s+/)[0] || "there";
  return {
    id: `seq_${randomUUID()}`,
    voice: { tone, proof, cta },
    created_at: prospect.updated_at,
    touches: [
      {
        ordinal: 1,
        subject: `${prospect.account.name}: quick observation`,
        body: `Hi ${firstName} — ${signal}. ${proof}. ${cta}`
      },
      {
        ordinal: 2,
        subject: `Re: ${prospect.account.name}`,
        body: `The useful part isn't more lead data—it is giving the rep the why-now, fit, and next question before they respond. Want the short example?`
      },
      {
        ordinal: 3,
        subject: `Close the loop?`,
        body: `I may be off on the timing. Should I close this out, or is the buyer-handoff problem worth revisiting later?`
      }
    ]
  };
}

function nextActionForSignal(prospect, signal) {
  if (prospect.fit.score >= 75) return signal.type === "inbound" ? "Respond now with the dossier attached." : "Review the dossier and release touch one.";
  if (prospect.fit.score >= 55) return "Validate the missing dossier fields before outreach.";
  return "Hold until another material signal raises confidence.";
}

function qualifyMeeting(prospect, input, clock) {
  const qualification = {
    need: clean(input.need || input.business_need || input.businessNeed) || null,
    authority: clean(input.authority) || prospect.contact.role || null,
    timeline: clean(input.timeline) || null,
    budget: clean(input.budget || input.budget_status || input.budgetStatus) || null,
    attendees: Array.isArray(input.attendees) ? input.attendees.map(clean).filter(Boolean) : []
  };
  const completed = Object.values(qualification).filter((value) => Array.isArray(value) ? value.length : Boolean(value)).length;
  const score = Math.min(100, prospect.fit.score * 0.6 + completed * 10);
  return {
    id: `meeting_${randomUUID()}`,
    external_id: clean(input.meeting_id || input.meetingId) || null,
    starts_at: input.starts_at || input.startsAt ? iso(input.starts_at || input.startsAt, clock) : null,
    booking_url: clean(input.booking_url || input.bookingUrl) || null,
    qualification,
    score: Math.round(score),
    qualified: score >= 60 && Boolean(qualification.need || prospect.fit.score >= 75),
    created_at: nowIso(clock)
  };
}

function dedupeSignals(signals) {
  const byEvent = new Map(signals.map((signal) => [signal.event_id, signal]));
  return [...byEvent.values()].sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));
}

function normalizeSignalType(value) {
  const normalized = clean(value)?.toLowerCase().replace(/[\s-]+/g, "_") || "other";
  return SIGNAL_WEIGHTS[normalized] ? normalized : "other";
}

function prospectKey(account, input) {
  const contact = normalizeEmail(input.contact_email || input.contactEmail || input.contact?.email)
    || clean(input.linkedin_url || input.linkedinUrl || input.contact?.linkedin_url)
    || clean(input.contact_name || input.contactName || input.contact?.name)
    || "account";
  return `prospect_${slug(account)}_${slug(contact)}`;
}

function countBy(items, keyFn) {
  return items.reduce((counts, item) => {
    const key = keyFn(item) || "unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function normalizeDelays(values) {
  const normalized = values.map((value) => Math.max(0, Number(value) || 0));
  return normalized.length ? normalized : [0];
}

function normalizeDomain(value) {
  const raw = clean(value);
  if (!raw) return null;
  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return raw.replace(/^www\./, "").split("/")[0].toLowerCase();
  }
}

function normalizeEmail(value) {
  const email = clean(value)?.toLowerCase();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function requiredString(value, field) {
  const result = clean(value);
  if (!result) throw validationError(`${field} is required`);
  return result;
}

function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  error.code = "invalid_sdr_event";
  return error;
}

function clean(value) {
  if (value === null || value === undefined) return null;
  const result = String(value).trim();
  return result || null;
}

function truthy(value) {
  return value === true || ["true", "yes", "1", "active", "confirmed"].includes(String(value || "").toLowerCase());
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null;
}

function numberInRange(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function nowIso(clock) {
  return clock().toISOString();
}

function iso(value, clock) {
  if (!value) return nowIso(clock);
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw validationError(`invalid date: ${value}`);
  return date.toISOString();
}

function addMinutes(value, minutes) {
  return new Date(Date.parse(value) + minutes * 60_000).toISOString();
}

function slug(value) {
  return String(value || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "unknown";
}
