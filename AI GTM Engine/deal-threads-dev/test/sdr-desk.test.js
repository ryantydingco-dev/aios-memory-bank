import assert from "node:assert/strict";
import test from "node:test";
import { classifyReply, createSdrDesk } from "../src/sdr-desk.js";

function fixedClock() {
  return new Date("2026-07-26T12:00:00.000Z");
}

function hotSignal(overrides = {}) {
  return {
    event_id: "signal-1",
    source: "website",
    signal_type: "inbound",
    summary: "Requested help fixing slow demo follow-up",
    account_domain: "example.com",
    account_name: "Example",
    employee_count: 150,
    contact_name: "Jordan Lee",
    contact_email: "jordan@example.com",
    contact_role: "VP Sales",
    icp_match: true,
    active_need: true,
    timeline: "this quarter",
    ...overrides
  };
}

test("signal ingestion builds a scored dossier and is idempotent", () => {
  const desk = createSdrDesk({}, { clock: fixedClock });
  const first = desk.ingestSignal(hotSignal());
  const duplicate = desk.ingestSignal(hotSignal());

  assert.equal(first.deduplicated, false);
  assert.equal(duplicate.deduplicated, true);
  assert.equal(first.prospect.fit.tier, "A");
  assert.match(first.prospect.sequence.touches[0].body, /slow demo follow-up/i);
  assert.equal(desk.status().prospects.total, 1);
  assert.equal(desk.status().processed_events, 1);
  assert.equal(desk.status().tasks.pending, 2);
});

test("a positive reply cancels the sequence and creates a meeting task", () => {
  const desk = createSdrDesk({}, { clock: fixedClock });
  const signal = desk.ingestSignal(hotSignal({ signal_type: "hiring" }));
  const reply = desk.ingestReply({
    event_id: "reply-1",
    prospect_id: signal.prospect.id,
    channel: "email",
    text: "Yes, this is interesting. Send me your calendar."
  });

  assert.equal(reply.classification.intent, "positive");
  assert.equal(reply.prospect.stage, "meeting_requested");
  const tasks = desk.listTasks();
  assert.equal(tasks.filter((task) => task.type === "outreach_touch" && task.status === "cancelled").length, 3);
  assert.equal(tasks.filter((task) => task.type === "meeting_invite" && task.status === "pending").length, 1);
});

test("a new reply replaces an older unsent reply task", () => {
  const desk = createSdrDesk({}, { clock: fixedClock });
  const signal = desk.ingestSignal(hotSignal());
  desk.ingestReply({
    event_id: "reply-after-inbound",
    prospect_id: signal.prospect.id,
    text: "Yes, send me your calendar."
  });

  const tasks = desk.listTasks();
  assert.equal(tasks.filter((task) => task.type === "reply_now" && task.status === "cancelled").length, 1);
  assert.equal(tasks.filter((task) => task.type === "meeting_invite" && task.status === "pending").length, 1);
});

test("opt out suppresses every open task", () => {
  const desk = createSdrDesk({}, { clock: fixedClock });
  const signal = desk.ingestSignal(hotSignal({ signal_type: "funding" }));
  const reply = desk.ingestReply({
    event_id: "reply-stop",
    prospect_id: signal.prospect.id,
    text: "Please unsubscribe and do not contact me again."
  });

  assert.equal(reply.prospect.stage, "suppressed");
  assert.ok(reply.prospect.suppression);
  assert.equal(desk.listTasks().filter((task) => ["pending", "retry", "awaiting_approval"].includes(task.status)).length, 0);
});

test("the runner retries failures and completes internal work", async () => {
  const desk = createSdrDesk({}, { clock: fixedClock, baseRetryMinutes: 5 });
  desk.ingestSignal(hotSignal());
  let failOnce = true;

  const first = await desk.runDueTasks(async (task) => {
    if (task.type === "reply_now" && failOnce) {
      failOnce = false;
      throw new Error("temporary adapter failure");
    }
    return { status: task.external_action ? "awaiting_approval" : "completed" };
  });

  assert.equal(first.completed, 1);
  assert.equal(first.retried, 1);
  assert.equal(desk.status().tasks.retry, 1);
});

test("snapshot restore preserves event idempotency and task state", async () => {
  const desk = createSdrDesk({}, { clock: fixedClock });
  desk.ingestSignal(hotSignal());
  await desk.runDueTasks(async (task) => ({ status: task.external_action ? "awaiting_approval" : "completed" }));

  const restored = createSdrDesk(desk.snapshot(), { clock: fixedClock });
  assert.equal(restored.ingestSignal(hotSignal()).deduplicated, true);
  assert.equal(restored.status().tasks.completed, 1);
  assert.equal(restored.status().tasks.awaiting_approval, 1);
});

test("reply classifier handles opt-out, OOO, referral, positive, and questions", () => {
  assert.equal(classifyReply("Remove me from this list").intent, "opt_out");
  assert.equal(classifyReply("I am out of office until Monday").intent, "out_of_office");
  assert.equal(classifyReply("You should speak to our VP of Sales").intent, "referral");
  assert.equal(classifyReply("Sounds good, let's talk").intent, "positive");
  assert.equal(classifyReply("What does this cost?").intent, "question");
});
