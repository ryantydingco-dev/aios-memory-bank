import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const PORT = 5200;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ADMIN_USERNAME = "forms-admin";
const ADMIN_PASSWORD = "forms-secret";
const ADMIN_AUTH_HEADER = `Basic ${Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64")}`;

test("protected operator forms redirect and persist workflow changes", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-operator-forms-"));
  const dataFile = path.join(tmp, "state.json");
  const app = await startServer(dataFile);

  try {
    const blockedAdminForm = await postForm("/admin/widget", { tenantName: "Blocked" });
    assert.equal(blockedAdminForm.status, 401);

    await assertRedirect(
      await postProtectedForm("/admin/widget", {
        tenantName: "Forms Revenue OS",
        allowedDomains: "localhost, 127.0.0.1, formsco.test",
        launcherText: "Start forms flow",
        welcomeMessage: "Forms-specific welcome message.",
        quickReplies: "Fix form routing, Improve speed-to-lead",
        requiredFields: "email, business_need, timeline, company_name_or_domain, crm",
        primaryColor: "#0f766e",
        consentDisclosure: "Forms consent disclosure for routing."
      }),
      "/admin?saved=1"
    );

    const config = await getJson("/api/v1/widgets/wid_deal_threads_demo/config");
    assert.equal(config.tenant.name, "Forms Revenue OS");
    assert.equal(config.conversation.launcherText, "Start forms flow");
    assert.deepEqual(config.conversation.quickReplies, ["Fix form routing", "Improve speed-to-lead"]);

    await assertRedirect(
      await postProtectedForm("/admin/scoring", {
        companyFit: "25",
        painFit: "25",
        urgency: "20",
        budget: "15",
        authority: "10",
        integration: "5",
        highThreshold: "65",
        mediumThreshold: "35"
      }),
      "/admin?saved=1"
    );

    await assertRedirect(
      await postProtectedForm("/admin/routing", {
        highPriorityOwner: "forms-ae@example.com",
        mediumPriorityOwner: "forms-sdr@example.com",
        customerSuccessOwner: "forms-cs@example.com",
        highPriorityQueue: "forms_high_priority",
        mediumPriorityQueue: "forms_medium_priority",
        lowPriorityQueue: "forms_low_priority",
        highPriorityAction: "Forms high-priority action.",
        mediumPriorityAction: "Forms medium-priority action.",
        lowPriorityAction: "Forms low-priority action."
      }),
      "/admin?saved=1"
    );

    await assertRedirect(await postProtectedForm("/admin/hubspot/check", {}), "/admin?saved=1");
	    const adminPage = await getProtectedText("/admin");
	    assert.match(adminPage, /HubSpot readiness/);
    assert.match(adminPage, /Beta launch readiness/);
    assert.match(adminPage, /HubSpot handoff queue/);
    assert.match(adminPage, /CRM delivery queue/);
    assert.match(adminPage, /Rep alert queue/);
    assert.match(adminPage, /token_missing/);
    assert.match(adminPage, /Validate backup/);
    assert.match(adminPage, /OpenAI extraction readiness/);

	    const llmProbeResponse = await postProtectedForm("/admin/llm/test", {
	      message:
	        "My name is Faye Stone. I am evaluating this for FormsLLM, a 160-person SaaS company using HubSpot. We need demo routing fixed this quarter and likely have $30K-$50K annually. I own the decision. faye@formsllm.test"
	    });
	    const llmProbePage = await llmProbeResponse.text();
	    assert.equal(llmProbeResponse.status, 200, llmProbePage);
	    assert.match(llmProbePage, /Heuristic fallback ready/);
	    assert.match(llmProbePage, /faye@formsllm\.test|Faye Stone/);

	    const stateExportResponse = await fetch(`${BASE_URL}/api/v1/admin/state/export`, {
	      headers: { authorization: ADMIN_AUTH_HEADER }
	    });
	    assert.equal(stateExportResponse.status, 200);
	    const stateExport = await stateExportResponse.json();
	    const validBackupResponse = await postProtectedForm("/admin/state/validate", {
	      backupJson: JSON.stringify(stateExport)
	    });
	    const validBackupPage = await validBackupResponse.text();
	    assert.equal(validBackupResponse.status, 200, validBackupPage);
	    assert.match(validBackupPage, /Valid backup/);
	    assert.match(validBackupPage, /Restore ready/);

	    const dryRestoreResponse = await postProtectedForm("/admin/state/restore", {
	      backupJson: JSON.stringify(stateExport)
	    });
	    const dryRestorePage = await dryRestoreResponse.text();
	    assert.equal(dryRestoreResponse.status, 200, dryRestorePage);
	    assert.match(dryRestorePage, /State restore dry run/);
	    assert.match(dryRestorePage, /Dry-run complete/);

	    const invalidBackupResponse = await postProtectedForm("/admin/state/validate", {
	      backupJson: "{"
	    });
	    const invalidBackupPage = await invalidBackupResponse.text();
	    assert.equal(invalidBackupResponse.status, 200, invalidBackupPage);
	    assert.match(invalidBackupPage, /Backup needs review/);
	    assert.match(invalidBackupPage, /Backup JSON could not be parsed/);

	    await assertRedirect(
      await postProtectedForm("/beta-clients", {
        name: "FormsCo Revenue Team",
        websiteUrl: "https://formsco.test",
        ownerEmail: "owner@formsco.test",
        crm: "hubspot",
        crmDestinationName: "FormsCo CRM handoff",
        crmDeliveryWebhookUrl: "https://hooks.example.test/formsco",
        crmDeliveryOwner: "revops@formsco.test",
        status: "setup",
        notes: "Created through the operator form test.",
        launcherText: "Ask FormsCo",
        welcomeMessage: "FormsCo custom welcome.",
        quickReplies: "Fix handoffs, Improve lead quality",
        primaryColor: "#115e59",
        highPriorityOwner: "forms-client-ae@example.com",
        highPriorityAction: "Call FormsCo within 10 minutes."
      }),
      "/beta-clients?saved=1"
    );

    const createdClients = await getProtectedJson("/api/v1/beta-clients");
    const betaClient = createdClients.clients.find((client) => client.name === "FormsCo Revenue Team");
    assert.ok(betaClient);
    assert.equal(betaClient.domain, "formsco.test");
    const launchPage = await getProtectedText(`/launch?client=${betaClient.id}`);
    assert.match(launchPage, /First beta launch/);
    assert.match(launchPage, /Create launch test lead/);
    assert.match(launchPage, /Launch packet/);
    assert.match(launchPage, /Launch wizard/);

    await assertRedirect(
      await postProtectedForm(`/beta-clients/${betaClient.id}/update`, {
        name: "FormsCo Growth Team",
        websiteUrl: "https://formsco.test",
        ownerEmail: "growth-owner@formsco.test",
        crm: "hubspot",
        crmDeliveryEnabled: "true",
        crmDeliveryProvider: "hubspot",
        crmDestinationName: "FormsCo Growth CRM handoff",
        crmDeliveryWebhookUrl: "https://hooks.example.test/formsco-growth",
        crmDeliveryOwner: "growth-revops@formsco.test",
        crmDeliveryNotes: "Send enriched profiles into the FormsCo growth CRM test workflow.",
        status: "installed",
        notes: "Updated through the operator form test.",
        launcherText: "Ask FormsCo growth",
        welcomeMessage: "FormsCo growth welcome.",
        quickReplies: "Fix routing, Improve speed-to-lead",
        requiredFields: "email, business_need, timeline, company_name_or_domain, crm",
        questionPlaybook: [
          "business_need | Forms need | What handoff problem should FormsCo fix first? | Fix routing; Improve speed-to-lead | required",
          "company_name_or_domain | Company | Which company is this for? |  | required",
          "authority | Decision role | Who owns the FormsCo buying decision? | I own the decision; I influence the decision | optional",
          "timeline | Timeline | When should FormsCo solve this? | This week; This month; This quarter | required",
          "budget | Budget | Is budget approved for the FormsCo project? | Budget approved; Budget likely; Need to build the case | optional",
          "crm | CRM | Which CRM should FormsCo routing use? | HubSpot; Salesforce; Pipedrive | required",
          "email | Work email | What work email should the rep use? |  | required",
          "name | Name | What name should the rep use? |  | optional"
        ].join("\n"),
        primaryColor: "#0f766e",
        highPriorityOwner: "growth-ae@formsco.test",
        mediumPriorityOwner: "growth-sdr@formsco.test",
        highPriorityAction: "Call growth-qualified leads within 10 minutes.",
        mediumPriorityAction: "Research and follow up within four hours.",
        lowPriorityAction: "Add to nurture.",
        reportRecipients: "growth-owner@formsco.test, revops@formsco.test",
        reportCadence: "weekly",
        reportPeriodDays: "14",
        nextReportDueAt: "2020-01-01T00:00"
      }),
      "/beta-clients?saved=1"
    );

    const testInstallPage = await getProtectedText(`/launch/test-install?client=${betaClient.id}`);
    assert.match(testInstallPage, /Script tag loaded/);
    assert.match(testInstallPage, /data-page-url=&quot;https:\/\/formsco\.test&quot;/);

    const launchConfig = await getJson(`/api/v1/widgets/wid_deal_threads_demo/config?betaClientId=${betaClient.id}&pageUrl=https://formsco.test/launch-check`);
    assert.equal(launchConfig.betaClientId, betaClient.id);
    assert.equal(launchConfig.conversation.questions.find((question) => question.key === "authority").prompt, "Who owns the FormsCo buying decision?");
    const installedClient = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
    assert.equal(installedClient.install_activity.config_loads, 1);
    assert.equal(installedClient.widget_config.questions.find((question) => question.key === "authority").label, "Decision role");
    assert.equal(installedClient.crm_delivery.destination_name, "FormsCo Growth CRM handoff");
    assert.equal(installedClient.crm_delivery.webhook_url, "https://hooks.example.test/formsco-growth");
    assert.equal(installedClient.crm_delivery.owner_email, "growth-revops@formsco.test");
    assert.equal(installedClient.crm_delivery.test_delivery.status, "not_sent");
    assert.equal(installedClient.checklist.find((item) => item.key === "widget_installed").checked, true);
    await assertRedirect(
      await postProtectedForm(`/beta-clients/${betaClient.id}/crm-delivery/test`, {
        webhookUrl: "https://hooks.example.test/formsco-growth",
        note: "Dry-run synthetic CRM test from operator form."
      }),
      "/beta-clients?saved=1"
    );
    const crmTestedClient = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
    assert.equal(crmTestedClient.crm_delivery.test_delivery.status, "sent");
    assert.equal(crmTestedClient.crm_delivery.test_delivery.sent_via, "dry_run");
    assert.equal(crmTestedClient.crm_delivery.test_delivery.destination_host, "hooks.example.test");
    assert.ok(crmTestedClient.readiness.checks.some((check) => check.key === "crm_delivery_test" && check.status === "pass"));
    const installedWizard = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/launch-wizard`);
    assert.equal(installedWizard.wizard.current_phase, "launch_packet");
    assert.ok(installedWizard.wizard.phases.some((phase) => phase.key === "verify_install" && phase.status === "pass"));

    const launchPacket = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/launch-packet`);
	    assert.equal(launchPacket.beta_client.id, betaClient.id);
	    assert.equal(launchPacket.subject, "Deal Threads beta install for FormsCo Growth Team");
	    assert.match(launchPacket.install_snippet, new RegExp(`data-beta-client-id="${betaClient.id}"`));
	    assert.match(launchPacket.public_test_install_url, /\/install\/inst_[a-f0-9]+\/test$/);
	    assert.match(launchPacket.public_install_status_url, /\/install\/inst_[a-f0-9]+\/status$/);
	    assert.match(launchPacket.test_install_url, /\/install\/inst_[a-f0-9]+\/test$/);
	    assert.match(launchPacket.internal_test_install_url, new RegExp(`/launch/test-install\\?client=${betaClient.id}$`));
	    assert.match(launchPacket.email_body, /Hosted widget load test/);
	    assert.match(launchPacket.email_body, /Public install status/);
	    assert.match(launchPacket.email_body, /What this beta avoids by default/);
    assert.ok(launchPacket.acceptance_checks.includes("One launch test lead appears in the CRM inbox."));

    const launchPacketMarkdown = await getProtectedText(`/api/v1/beta-clients/${betaClient.id}/launch-packet?format=markdown`);
    assert.match(launchPacketMarkdown, /# Deal Threads beta install for FormsCo Growth Team/);
    assert.match(launchPacketMarkdown, /```html/);

    await assertRedirect(
      await postProtectedForm(`/launch/${betaClient.id}/send-packet`, {
        recipients: "growth-owner@formsco.test, implementer@formsco.test"
      }),
      `/launch?client=${betaClient.id}&packetSent=1`
    );
    const packetSentClient = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
    assert.equal(packetSentClient.launch_packet_delivery.status, "sent");
    assert.equal(packetSentClient.launch_packet_delivery.sent_via, "dry_run");
    assert.deepEqual(packetSentClient.launch_packet_delivery.recipients, ["growth-owner@formsco.test", "implementer@formsco.test"]);
    assert.equal(packetSentClient.launch_packet_delivery.send_attempts.length, 1);
    assert.equal(packetSentClient.checklist.find((item) => item.key === "install_snippet_sent").checked, true);
    const packetWizard = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/launch-wizard`);
    assert.equal(packetWizard.wizard.current_phase, "test_lead");

    await assertRedirect(
      await postProtectedForm(`/launch/${betaClient.id}/snippet-sent`, {
        note: "Snippet sent through form test."
      }),
      `/launch?client=${betaClient.id}&snippetSent=1`
    );

    const launchLeadResponse = await postProtectedForm(`/launch/${betaClient.id}/test-lead`, {
      contactName: "Finn Vale",
      email: "finn@formsco.test",
      companyName: "FormsCo Growth Team",
      crm: "hubspot",
      message:
        "My name is Finn Vale. I am evaluating this for FormsCo, a 160-person SaaS company using HubSpot. Demo requests are going cold because reps research manually. We want to fix this this quarter and likely have $30K-$50K annually. I own the decision. finn@formsco.test"
    });
    const launchLeadPayload = await launchLeadResponse.text();
    assert.equal(launchLeadResponse.status, 303, launchLeadPayload);
    const launchLeadLocation = launchLeadResponse.headers.get("location");
    assert.match(launchLeadLocation, new RegExp(`^/launch\\?client=${betaClient.id}&lead=lead_[a-f0-9]+$`));
    const leadId = launchLeadLocation.split("lead=").pop();
    const lead = await getProtectedJson(`/api/v1/leads/${leadId}`);
    assert.equal(lead.routing.assigned_owner_email, "growth-ae@formsco.test");
    assert.equal(lead.routing.recommended_next_action, "Call growth-qualified leads within 10 minutes.");
    assert.equal(lead.source.beta_client_id, betaClient.id);

    const leadDetailPage = await getProtectedText(`/crm/${lead.id}`);
    assert.match(leadDetailPage, /Rep alert/);
    assert.match(leadDetailPage, /CRM delivery/);
    assert.match(leadDetailPage, /Sales outcome/);
    assert.match(leadDetailPage, /Rep feedback/);
    assert.match(leadDetailPage, /Save rep feedback/);
    assert.match(leadDetailPage, /Research evidence/);
    assert.match(leadDetailPage, /Save research evidence/);
    assert.match(leadDetailPage, /Send rep alert/);
    assert.match(leadDetailPage, /Send CRM delivery/);

    await assertRedirect(
      await postProtectedForm(`/crm/${lead.id}/rep-feedback`, {
        status: "helpful",
        usefulnessScore: "4.5",
        repConfidence: "high",
        usedOnCall: "true",
        missingFields: "",
        missingField_source_evidence: "true",
        missingContextNote: "Rep wants source evidence visible before calling."
      }),
      `/crm/${lead.id}`
    );

    const leadAfterFeedback = await getProtectedJson(`/api/v1/leads/${lead.id}`);
    assert.equal(leadAfterFeedback.rep_feedback.status, "helpful");
    assert.equal(leadAfterFeedback.rep_feedback.usefulness_score, 4.5);
    assert.equal(leadAfterFeedback.rep_feedback.rep_confidence, "high");
    assert.deepEqual(leadAfterFeedback.rep_feedback.missing_fields, ["source_evidence"]);

    await assertRedirect(
      await postProtectedForm(`/crm/${lead.id}/rep-alert/send`, {
        recipients: "growth-ae@formsco.test"
      }),
      `/crm/${lead.id}`
    );

    const repAlertsAfterFormSend = await getProtectedJson("/api/v1/rep-alerts");
    const sentFormAlert = repAlertsAfterFormSend.alerts.find((alert) => alert.lead_id === lead.id);
    assert.ok(sentFormAlert);
    assert.equal(sentFormAlert.status, "sent");
    assert.equal(sentFormAlert.sent_via, "dry_run");
    assert.deepEqual(sentFormAlert.recipients, ["growth-ae@formsco.test"]);

    await assertRedirect(
      await postProtectedForm(`/crm/${lead.id}/crm-delivery/send`, {
        destinationName: "FormsCo Growth CRM handoff",
        webhookUrl: "https://hooks.example.test/formsco-growth",
        note: "Dry-run CRM delivery from operator form."
      }),
      `/crm/${lead.id}`
    );

    const crmDeliveriesAfterFormSend = await getProtectedJson("/api/v1/crm-deliveries");
    const sentFormCrmDelivery = crmDeliveriesAfterFormSend.deliveries.find((delivery) => delivery.lead_id === lead.id);
    assert.ok(sentFormCrmDelivery);
    assert.equal(sentFormCrmDelivery.status, "sent");
    assert.equal(sentFormCrmDelivery.sent_via, "dry_run");
    assert.equal(sentFormCrmDelivery.destination_name, "FormsCo Growth CRM handoff");
    assert.equal(sentFormCrmDelivery.destination_host, "hooks.example.test");

    const crmQueueRunPage = await postProtectedForm("/admin/crm-deliveries/send-queued", {
      limit: "5"
    });
    const crmQueueRunHtml = await crmQueueRunPage.text();
    assert.equal(crmQueueRunPage.status, 200, crmQueueRunHtml);
    assert.match(crmQueueRunHtml, /CRM delivery queue run/);
    assert.match(crmQueueRunHtml, /CRM delivery queue/);

    const launchSummary = await getProtectedJson(`/api/v1/launch/first-beta?client=${betaClient.id}`);
    assert.equal(launchSummary.selected_client.id, betaClient.id);
    assert.ok(launchSummary.steps.some((step) => step.key === "widget_installed" && step.status === "pass"));
    assert.ok(launchSummary.steps.some((step) => step.key === "test_lead" && step.status === "pass"));

    const queueRunPage = await postProtectedForm("/admin/hubspot/sync-queue", {
      dryRun: "true",
      limit: "5"
    });
    const queueRunHtml = await queueRunPage.text();
    assert.equal(queueRunPage.status, 200, queueRunHtml);
    assert.match(queueRunHtml, /HubSpot queue dry run/);
    assert.match(queueRunHtml, /would sync/i);

	    await assertRedirect(
      await postProtectedForm(`/crm/${lead.id}/workflow`, {
        stage: "meeting_booked",
        ownerEmail: "growth-ae@formsco.test",
        dueAt: "2030-01-01T10:00",
        nextAction: "Prepare discovery plan from form flow.",
        outcomeStatus: "opportunity_created",
        outcomeValue: "38000",
        outcomeProbability: "45",
        meetingBookedAt: "2030-01-01T10:30:00.000Z",
        opportunityCreatedAt: "2030-01-01T11:00:00.000Z",
        note: "Meeting booked through the CRM workflow form."
      }),
      `/crm/${lead.id}`
    );

    await assertRedirect(await postProtectedForm(`/crm/${lead.id}/sync`, {}), `/crm/${lead.id}`);

    await assertRedirect(
      await postProtectedForm(`/crm/${lead.id}/company-memory`, {
        companyName: "FormsCo",
        website: "https://formsco.test",
        industry: "B2B SaaS",
        companySize: "101-250",
        techStack: "HubSpot, Segment",
        signals: "Operator form correction",
        note: "Saved through the company memory form."
      }),
      `/crm/${lead.id}`
    );

    await assertRedirect(
      await postProtectedForm(`/crm/${lead.id}/research-evidence`, {
        category: "buying_trigger",
        value: "FormsCo is hiring RevOps roles connected to inbound routing.",
        sourceUrl: "https://formsco.test/careers",
        sourceLabel: "FormsCo careers page",
        confidence: "84",
        note: "Hiring signal supports urgency and rep opener.",
        reusable: "true"
      }),
      `/crm/${lead.id}`
    );

    await assertRedirect(
      await postProtectedForm(`/enrichment/reviews/${lead.id}`, {
        status: "research_needed",
        note: "Dashboard review says the missing fields need manual research."
      }),
      `/enrichment?reviewUpdated=${lead.id}`
    );

    await assertRedirect(
      await postProtectedForm(`/crm/${lead.id}/enrichment-review`, {
        status: "reviewed",
        note: "CRM review confirmed internal data is enough for follow-up."
      }),
      `/crm/${lead.id}`
    );

    const correctedLead = await getProtectedJson(`/api/v1/leads/${lead.id}`);
    assert.equal(correctedLead.workflow.stage, "meeting_booked");
    assert.equal(correctedLead.workflow.notes[0].body, "Meeting booked through the CRM workflow form.");
    assert.equal(correctedLead.outcome.status, "opportunity_created");
    assert.equal(correctedLead.outcome.value, 38000);
    assert.equal(correctedLead.outcome.probability, 0.45);
    assert.equal(correctedLead.outcome.meeting_booked_at, "2030-01-01T10:30:00.000Z");
    assert.equal(correctedLead.outcome.opportunity_created_at, "2030-01-01T11:00:00.000Z");
    assert.equal(correctedLead.enrichment_review.status, "reviewed");
    assert.equal(correctedLead.enrichment_review.notes[0].body, "CRM review confirmed internal data is enough for follow-up.");
    assert.ok(correctedLead.enrichment.research_evidence.some((item) => item.value.includes("hiring RevOps")));
    assert.ok(correctedLead.enrichment.buyer_profile.buying_triggers.some((item) => item.value.includes("hiring RevOps")));
    const formsMemory = await getProtectedJson("/api/v1/enrichment/memory/formsco.test");
    assert.equal(formsMemory.source, "operator_corrected_memory");
    assert.ok(formsMemory.corrected_fields.includes("tech_stack"));
    assert.ok(formsMemory.research_evidence.some((item) => item.source_url === "https://formsco.test/careers"));

    await assertRedirect(
      await postProtectedForm(`/beta-clients/${betaClient.id}/experiments`, {
        title: "Forms budget-first test",
        status: "running",
        owner: "growth-owner@formsco.test",
        metric: "Meeting booked rate",
        hypothesis: "Budget-first copy improves routing quality.",
        notes: "Submitted through experiment form."
      }),
      "/beta-clients?saved=1"
    );

    await assertRedirect(
      await postProtectedForm(`/beta-clients/${betaClient.id}/snapshots`, {
        days: "14",
        decision: "Keep forms workflow",
        learnings: "Forms submitted and meeting booked."
      }),
      "/beta-clients?saved=1"
    );

    const afterExperiment = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
    assert.equal(afterExperiment.name, "FormsCo Growth Team");
    assert.equal(afterExperiment.experiments[0].title, "Forms budget-first test");
    assert.equal(afterExperiment.outcome_snapshots[0].decision, "Keep forms workflow");
    assert.equal(afterExperiment.outcome_snapshots[0].metrics.opportunities_created, 1);
    assert.equal(afterExperiment.outcome_snapshots[0].metrics.opportunity_value, 38000);
    assert.equal(afterExperiment.checklist.find((item) => item.key === "install_snippet_sent").note, "Snippet sent through form test.");
    assert.equal(afterExperiment.readiness.ready_for_live_beta, true);
    assert.ok(afterExperiment.readiness.next_actions.some((action) => action.includes("first beta report")));

    const afterExperimentReadiness = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/readiness`);
    assert.equal(afterExperimentReadiness.readiness.ready_to_send_snippet, true);
    assert.equal(afterExperimentReadiness.readiness.ready_for_live_beta, true);

    await assertRedirect(
      await postProtectedForm("/enrichment/memory/import", {
        csv: [
          "company_name,domain,industry,company_size,tech_stack,signals,notes",
          "Imported Forms Account,importedforms.test,B2B SaaS,51-200,HubSpot,ICP fit,Imported through form."
        ].join("\n")
      }),
      "/enrichment?memoryImported=1&memoryErrors=0"
    );

    const importedMemory = await getProtectedJson("/api/v1/enrichment/memory/importedforms.test");
    assert.equal(importedMemory.company_name, "Imported Forms Account");
    assert.ok(importedMemory.imported_fields.includes("industry"));

    const queueResponse = await postProtectedForm(`/beta-clients/${betaClient.id}/report-deliveries`, {
      recipients: "growth-owner@formsco.test, revops@formsco.test",
      days: "14"
    });
    assert.equal(queueResponse.status, 303);
    assert.match(queueResponse.headers.get("location"), /^\/beta-clients\?deliveryQueued=del_[a-f0-9]+$/);
    const firstDeliveryId = queueResponse.headers.get("location").split("deliveryQueued=")[1];

    await assertRedirect(
      await postProtectedForm(`/reports/deliveries/${firstDeliveryId}/sent`, {
        note: "Marked sent manually through detail form."
      }),
      `/reports/deliveries/${firstDeliveryId}`
    );

    await assertRedirect(
      await postProtectedForm(`/beta-clients/${betaClient.id}/update`, {
        name: "FormsCo Growth Team",
        websiteUrl: "https://formsco.test",
        ownerEmail: "growth-owner@formsco.test",
        crm: "hubspot",
        status: "live",
        reportRecipients: "growth-owner@formsco.test, revops@formsco.test",
        reportCadence: "weekly",
        reportPeriodDays: "14",
        nextReportDueAt: "2020-01-01T00:00"
      }),
      "/beta-clients?saved=1"
    );

    await assertRedirect(await postProtectedForm("/reports/deliveries/run-due", {}), "/reports/deliveries");
    let deliverySummary = await getProtectedJson("/api/v1/reports/deliveries");
    assert.equal(deliverySummary.summary.sent, 1);
    assert.equal(deliverySummary.summary.queued, 1);

    await assertRedirect(
      await postProtectedForm("/reports/deliveries/send-queued", {
        note: "Dry-run send queued reports through form."
      }),
      "/reports/deliveries"
    );

    deliverySummary = await getProtectedJson("/api/v1/reports/deliveries");
    assert.equal(deliverySummary.summary.sent, 2);
    assert.equal(deliverySummary.summary.queued, 0);
    assert.equal(deliverySummary.email_adapter.mode, "dry_run");

    const tenantDeletePreviewPage = await postProtectedForm("/trust/tenant-data/delete", {
      betaClientId: betaClient.id
    });
    const tenantDeletePreviewHtml = await tenantDeletePreviewPage.text();
    assert.equal(tenantDeletePreviewPage.status, 200, tenantDeletePreviewHtml);
    assert.match(tenantDeletePreviewHtml, /Deletion preview/);
    assert.match(tenantDeletePreviewHtml, /DELETE DEAL THREADS TENANT DATA/);
    const formsClientAfterPreview = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
    assert.equal(formsClientAfterPreview.id, betaClient.id);

    await assertRedirect(await postProtectedForm("/readiness/demo-scenario/seed", {}), "/readiness?demoScenario=seeded");
    const seededScenario = await getProtectedJson("/api/v1/demo-scenarios/mid-market");
    assert.equal(seededScenario.scenarios[0].active, true);
    assert.equal(seededScenario.scenarios[0].clients, 3);
    assert.equal(seededScenario.scenarios[0].leads, 6);
    const readinessWithScenario = await getProtectedText("/readiness?days=14");
    assert.match(readinessWithScenario, /Synthetic data active/);
    assert.match(readinessWithScenario, /Reload demo scenario/);

    await assertRedirect(await postProtectedForm("/readiness/demo-scenario/clear", {}), "/readiness?demoScenario=cleared");
    const clearedScenario = await getProtectedJson("/api/v1/demo-scenarios/mid-market");
    assert.equal(clearedScenario.scenarios[0].active, false);
    assert.equal(clearedScenario.scenarios[0].clients, 0);
    assert.equal(clearedScenario.scenarios[0].leads, 0);
  } finally {
    app.kill("SIGTERM");
    await once(app, "exit");
    await rm(tmp, { recursive: true, force: true });
  }
});

async function createHighPriorityLead(betaClientId) {
  const session = await postJson("/api/v1/widget-sessions", {
    tenantId: "ten_deal_threads_demo",
    widgetId: "wid_deal_threads_demo",
    betaClientId,
    pageUrl: BASE_URL
  });
  assert.equal(session.welcomeMessage, "FormsCo growth welcome.");
  assert.equal(session.questionFlow.find((question) => question.key === "authority").prompt, "Who owns the FormsCo buying decision?");

  const messages = [
    "I am evaluating this for FormsCo, a 160-person SaaS company using HubSpot. Demo requests are going cold because reps research manually. We want to fix this this quarter and likely have $30K-$50K annually.",
    "I own the decision",
    "finn@formsco.test",
    "My name is Finn Vale",
    "Yes, send it"
  ];

  let result;
  for (const [index, message] of messages.entries()) {
    result = await postJson(`/api/v1/conversations/${session.conversationId}/messages`, {
      sessionId: session.sessionId,
      message,
      consentAccepted: true
    });
    if (index === 0) {
      assert.equal(result.assistantMessage, "Who owns the FormsCo buying decision?");
      assert.deepEqual(result.quickReplies, ["I own the decision", "I influence the decision"]);
    }
  }

  assert.equal(result.completionStatus, "completed");
  return getProtectedJson(`/api/v1/leads/${result.leadProfileId}`);
}

async function assertRedirect(response, expectedLocation) {
  const payload = await response.text();
  assert.equal(response.status, 303, payload);
  assert.equal(response.headers.get("location"), expectedLocation);
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

async function postForm(pathname, body) {
  return fetch(`${BASE_URL}${pathname}`, {
    method: "POST",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body)
  });
}

async function postProtectedForm(pathname, body) {
  return fetch(`${BASE_URL}${pathname}`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: ADMIN_AUTH_HEADER
    },
    body: new URLSearchParams(body)
  });
}

async function parseJsonResponse(response) {
  const payload = await response.json();
  assert.ok(response.ok, JSON.stringify(payload));
  return payload;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
