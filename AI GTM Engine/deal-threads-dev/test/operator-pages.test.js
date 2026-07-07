import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const PORT = 5198;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ADMIN_USERNAME = "smoke-admin";
const ADMIN_PASSWORD = "smoke-secret";
const ADMIN_AUTH_HEADER = `Basic ${Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64")}`;

test("protected operator pages render seeded beta data", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-operator-pages-"));
  const dataFile = path.join(tmp, "state.json");
  const app = await startServer(dataFile);

  try {
    const betaClient = await postProtectedJson("/api/v1/beta-clients", {
      name: "SmokeCo Revenue Team",
      websiteUrl: "https://smokeco.test",
      ownerEmail: "owner@smokeco.test",
      crm: "hubspot",
      crmDestinationName: "SmokeCo CRM handoff",
      crmDeliveryWebhookUrl: "https://hooks.example.test/smokeco",
      crmDeliveryOwner: "revops@smokeco.test",
      status: "setup",
      notes: "Operator smoke client.",
      launcherText: "Ask SmokeCo",
      welcomeMessage: "SmokeCo custom welcome.",
      quickReplies: "Fix routing, Improve lead quality",
      requiredFields: "email, business_need, timeline, company_name_or_domain, crm",
      primaryColor: "#0f766e",
      highPriorityOwner: "ae@smokeco.test",
      highPriorityAction: "Call SmokeCo high-priority leads within 10 minutes.",
      reportRecipients: "owner@smokeco.test, revops@smokeco.test",
      reportCadence: "weekly",
      reportPeriodDays: "14",
      nextReportDueAt: "2020-01-01T00:00:00.000Z",
      baselineFirstTouchMinutes: "90",
      baselineMeetingRate: "10",
      baselineOpportunityRate: "4",
      minimumProofLeads: "1",
      proofNotes: "Baseline from old SmokeCo form."
    });

    const lead = await createHighPriorityLead(betaClient.id);
    await postProtectedJson(`/api/v1/leads/${lead.id}/company-memory`, {
      companyName: "SmokeCo",
      industry: "B2B SaaS",
      companySize: "101-250",
      techStack: "HubSpot, Segment",
      signals: "Manual ICP fit confirmed",
      note: "Confirmed for operator page smoke testing."
    });

    await postProtectedJson(`/api/v1/leads/${lead.id}/research-evidence`, {
      category: "tech_stack",
      value: "HubSpot, Segment, Clearbit",
      sourceUrl: "https://smokeco.test/security",
      sourceLabel: "SmokeCo security page",
      confidence: 86,
      note: "Public stack evidence saved before any paid lookup.",
      reusable: true
    });

    await postProtectedJson(`/api/v1/beta-clients/${betaClient.id}/experiments`, {
      title: "Budget-first opener",
      hypothesis: "Asking budget earlier should improve routing quality.",
      metric: "Meeting booked rate",
      owner: "owner@smokeco.test",
      status: "running",
      notes: "Smoke test experiment."
    });

    await postProtectedJson(`/api/v1/beta-clients/${betaClient.id}/snapshots`, {
      days: 14,
      decision: "Iterate on opener",
      learnings: "First qualified lead captured."
    });

    await postProtectedJson(`/api/v1/leads/${lead.id}/workflow`, {
      stage: "meeting_booked",
      ownerEmail: "ae@smokeco.test",
      nextAction: "Prepare discovery brief.",
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      outcomeStatus: "opportunity_created",
      outcomeValue: "42000",
      outcomeProbability: "50",
      meetingBookedAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      opportunityCreatedAt: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
      note: "Meeting booked from smoke workflow."
    });

    await postProtectedJson(`/api/v1/leads/${lead.id}/rep-feedback`, {
      status: "helpful",
      usefulnessScore: "4.5",
      repConfidence: "high",
      usedOnCall: true,
      missingFields: ["source_evidence"],
      missingContextNote: "Source evidence would make the opening note stronger."
    });

    await postProtectedJson(`/api/v1/beta-clients/${betaClient.id}/snapshots`, {
      days: 14,
      decision: "Keep budget-first opener",
      learnings: "Meeting booked after routing follow-up."
    });

    const dueDeliveries = await postProtectedJson("/api/v1/reports/deliveries/run-due", {});
    assert.equal(dueDeliveries.queued, 1);
    assert.equal(dueDeliveries.errors, 0);
    const deliveryId = dueDeliveries.results[0].id;

    await assertProtectedPage("/crm", ["Rep inbox", "SmokeCo", "Meeting booked", "Opportunity created", "$42000", "ae@smokeco.test", "Delivery"]);
    await assertProtectedPage(`/crm/${lead.id}`, [
      "Rep-ready brief",
      "Call plan",
      "Discovery questions",
      "Download Markdown",
      "Rep feedback",
      "Helpful",
      "Source evidence",
      "Rep workflow",
      "Sales outcome",
      "Opportunity created",
      "$42000",
      "Rep alert",
      "CRM delivery",
      "SmokeCo CRM handoff",
      "HubSpot sync preview",
      "Enrichment review",
      "Research evidence",
      "SmokeCo security page",
      "Company memory",
      "Buyer profile",
      "Likely buying committee",
      "Buying triggers",
      "Funding and growth",
      "Self-built signals",
      "SmokeCo"
    ]);
    await assertProtectedPage("/pilot", [
      "Pilot command center",
      "SmokeCo Revenue Team",
      "Snapshot trends",
      "Pipeline value",
      "Snapshot CSV",
      "Budget-first opener"
    ]);
    await assertProtectedPage("/proof?days=14", [
      "Beta proof",
      "SmokeCo Revenue Team",
      "Client proof scorecards",
      "Old contact-form baseline",
      "Brief feedback",
      "Research saved"
    ]);
    await assertProtectedPage("/readiness?days=14", [
      "Mid-market readiness",
      "Demo scenario",
      "Load demo scenario",
      "No synthetic data",
      "Buyer questions",
      "Providerless plan",
      "Profile quality",
      "Readiness checks",
      "Rep profile feedback"
    ]);
    await assertProtectedPage("/trust", [
      "Buyer trust packet",
      "Processing modes",
      "Data inventory",
      "Production hardening",
      "Request body limit",
      "Data categories",
      "Data flow",
      "Tenant data controls",
      "Export tenant data",
      "Processors",
      "Controls",
      "Open gaps",
      "Retention and deletion",
      "External transmission modes"
    ]);
    await assertProtectedPage(`/launch?client=${betaClient.id}`, [
      "First beta launch",
      "Launch steps",
      "Launch packet",
      "Launch wizard",
      "Current phase",
      "Client readiness",
      "Packet delivery",
      "Send launch packet",
      "SmokeCo Revenue Team",
      "Create first test lead"
    ]);
    await assertProtectedPage("/beta-clients", [
      "Beta clients",
      "SmokeCo Revenue Team",
      "Client readiness",
      "Launch wizard",
      "Current phase",
      "Ready to send",
      "Ready for live",
      "Proof baseline",
      "Proof scorecard",
      "View readiness JSON",
      "Install verification",
      "Generic CRM delivery",
      "CRM deliveries",
      "Conversation playbook",
      "Experiment loop",
      "Outcome snapshots",
      "Budget-first opener",
      "Keep budget-first opener"
    ]);
    await assertProtectedPage("/reports/beta?days=14", [
      "Beta report",
      "Executive summary",
      "Pipeline outcomes",
      "Enrichment cost control",
      "Rep feedback",
      "SmokeCo"
    ]);
    await assertProtectedPage(`/beta-clients/${betaClient.id}/report?days=14`, [
      "SmokeCo Revenue Team beta report",
      "Client scope",
      "Executive summary",
      "Pipeline outcomes",
      "Enrichment cost control"
    ]);
    await assertProtectedPage("/reports/deliveries", [
      "Report deliveries",
      "Email adapter",
      "Delivery queue",
      "SmokeCo Revenue Team"
    ]);
    await assertProtectedPage(`/reports/deliveries/${deliveryId}`, [
      "Markdown packet",
      "CSV packet",
      "SmokeCo Revenue Team",
      "Pipeline value",
      "High priority"
    ]);
    await assertProtectedPage("/enrichment", [
      "Enrichment control",
      "Build ourselves plan",
      "Internal source stack",
      "Review queue",
      "Company memory",
      "Research evidence workspace",
      "Paid escalation criteria",
      "Likely buying roles",
      "Buying triggers"
    ]);
    await assertProtectedPage("/admin", [
      "Operator config",
      "Beta launch readiness",
      "Trust packet",
      "View readiness JSON",
      "HubSpot readiness",
      "HubSpot handoff queue",
      "CRM delivery queue",
      "Rep alert queue",
      "Widget and tenant",
	      "Routing rules",
	      "Data store",
		      "Download state backup",
		      "State backup",
		      "Validate backup",
	      "Guarded restore",
	      "OpenAI extraction readiness",
	      "Run extraction probe"
		    ]);
  } finally {
    app.kill("SIGTERM");
    await once(app, "exit");
    await rm(tmp, { recursive: true, force: true });
  }
});

async function assertProtectedPage(pathname, expectedSnippets) {
  const html = await getProtectedText(pathname);
  assert.match(html, /<!doctype html>|<html/i);
  for (const snippet of expectedSnippets) {
    assert.ok(html.includes(snippet), `Expected ${pathname} to include ${snippet}`);
  }
}

async function createHighPriorityLead(betaClientId) {
  const session = await postJson("/api/v1/widget-sessions", {
    tenantId: "ten_deal_threads_demo",
    widgetId: "wid_deal_threads_demo",
    betaClientId,
    pageUrl: BASE_URL
  });
  assert.equal(session.welcomeMessage, "SmokeCo custom welcome.");
  assert.deepEqual(session.quickReplies, ["Fix routing", "Improve lead quality"]);

  const messages = [
    "I am evaluating this for SmokeCo, a 160-person SaaS company using HubSpot. Demo requests are going cold because reps research manually. We want to fix this this quarter and likely have $30K-$50K annually.",
    "I own the decision",
    "sam@smokeco.test",
    "My name is Sam Vale",
    "Yes, send it"
  ];

  let result;
  for (const message of messages) {
    result = await postJson(`/api/v1/conversations/${session.conversationId}/messages`, {
      sessionId: session.sessionId,
      message,
      consentAccepted: true
    });
  }

  assert.equal(result.completionStatus, "completed");
  return getProtectedJson(`/api/v1/leads/${result.leadProfileId}`);
}

async function startServer(dataFile) {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: path.resolve(import.meta.dirname, ".."),
    env: {
      ...process.env,
      PORT: String(PORT),
      DEAL_THREADS_DATA_FILE: dataFile,
	      ENRICHMENT_MODE: "internal",
	      PAID_ENRICHMENT_LOOKUP_ESTIMATE_USD: "0.25",
	      ENRICHMENT_REVIEW_CONFIDENCE_THRESHOLD: "0.65",
	      OPENAI_API_KEY: "",
	      ADMIN_USERNAME,
      ADMIN_PASSWORD
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Server exited early:\n${logs}`);
    try {
      const health = await getJson("/api/v1/health");
      if (health.status === "ok") return child;
    } catch {
      await sleep(100);
    }
  }

  child.kill("SIGTERM");
  throw new Error(`Server did not become ready:\n${logs}`);
}

async function getJson(pathname) {
  const response = await fetch(`${BASE_URL}${pathname}`);
  return parseJsonResponse(response);
}

async function getProtectedJson(pathname) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    headers: { authorization: ADMIN_AUTH_HEADER }
  });
  return parseJsonResponse(response);
}

async function getProtectedText(pathname) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    headers: { authorization: ADMIN_AUTH_HEADER }
  });
  const payload = await response.text();
  assert.ok(response.ok, payload);
  return payload;
}

async function postJson(pathname, body) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return parseJsonResponse(response);
}

async function postProtectedJson(pathname, body) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: ADMIN_AUTH_HEADER
    },
    body: JSON.stringify(body)
  });
  return parseJsonResponse(response);
}

async function parseJsonResponse(response) {
  const payload = await response.json();
  assert.ok(response.ok, JSON.stringify(payload));
  return payload;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
