import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "..");
const artifactsDir = path.resolve(rootDir, ".artifacts", "browser-qa");
const adminUsername = process.env.ADMIN_USERNAME || "qa-admin";
const adminPassword = process.env.ADMIN_PASSWORD || "qa-secret";
const authHeader = `Basic ${Buffer.from(`${adminUsername}:${adminPassword}`).toString("base64")}`;
const chromePath =
  process.env.CHROME_PATH ||
  (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
const baseUrl = process.env.QA_BASE_URL || `http://127.0.0.1:${process.env.QA_PORT || (await freePort())}`;
const shouldStartServer = !process.env.QA_BASE_URL;

let app = null;
let appTempDir = null;
let chrome = null;
let chromeTempDir = null;

async function main() {
  try {
    await mkdir(artifactsDir, { recursive: true });
    if (shouldStartServer) {
      ({ child: app, tempDir: appTempDir } = await startApp());
    } else {
      await waitForHealth(baseUrl);
    }

    const browser = await launchChrome();
    chrome = browser.child;
    chromeTempDir = browser.userDataDir;
    const cdp = browser.cdp;

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");

    const artifacts = [];
    await setViewport(cdp, { width: 1280, height: 900, mobile: false });
    await cdp.send("Network.setExtraHTTPHeaders", { headers: { Authorization: authHeader } });
    const betaClient = await createBetaClientViaForm(cdp);
    artifacts.push(await screenshot(cdp, "beta-client-setup-form.png"));
    await sendLaunchPacketViaForm(cdp, betaClient);
    artifacts.push(await screenshot(cdp, "launch-packet-sent.png"));

    await cdp.send("Network.setExtraHTTPHeaders", { headers: {} });
    await loadClientSnippetPage(cdp, betaClient);
    await waitForEval(cdp, "Boolean(document.querySelector('deal-threads-widget')?.shadowRoot)");
    await openWidget(cdp);
    await waitForEval(
      cdp,
      "document.querySelector('deal-threads-widget').shadowRoot.querySelector('.launcher').textContent.includes('Ask BrowserQA')"
    );
    artifacts.push(await screenshot(cdp, "client-snippet-widget-open-desktop.png"));

    const crmPath = await completeWidgetConversation(cdp, betaClient);
    artifacts.push(await screenshot(cdp, "client-snippet-widget-complete-desktop.png"));

    await cdp.send("Network.setExtraHTTPHeaders", { headers: { Authorization: authHeader } });
    await navigate(cdp, `${baseUrl}${crmPath}`);
	    await waitForEval(cdp, "document.body.innerText.includes('Rep-ready brief')");
	    await waitForEval(
	      cdp,
	      "document.body.innerText.includes('Call plan') && document.body.innerText.includes('Discovery questions') && document.body.innerText.includes('Download Markdown') && document.body.innerText.includes('Rep feedback') && document.body.innerText.includes('Buyer profile') && document.body.innerText.includes('Likely buying committee') && document.body.innerText.includes('Buying triggers') && document.body.innerText.includes('Research evidence') && document.body.innerText.includes('Rep alert') && document.body.innerText.includes('CRM delivery') && document.body.innerText.includes('Sales outcome')"
	    );
    const leadId = crmPath.split("/").at(-1);
    const repBrief = await apiJson(`/api/v1/leads/${leadId}/rep-brief`);
    assert.equal(repBrief.version, "deal_threads.rep_ready_brief.v1");
    assert.equal(repBrief.lead_id, leadId);
    assert.ok(repBrief.call_plan.length >= 4);
    assert.ok(repBrief.copy_blocks.email_opener.includes("BrowserQA"));
    artifacts.push(await screenshot(cdp, "crm-detail-browser-qa.png"));
    const repFeedback = await updateRepFeedbackViaForm(cdp);
    artifacts.push(await screenshot(cdp, "rep-feedback-saved.png"));
    const researchEvidence = await addResearchEvidenceViaForm(cdp);
    artifacts.push(await screenshot(cdp, "research-evidence-added.png"));
    await cdp.send("Network.setExtraHTTPHeaders", { headers: {} });
    const publicHandoff = await verifyPublicRepHandoffPacket(cdp, betaClient, leadId);
    artifacts.push(await screenshot(cdp, "public-rep-handoff-packet.png"));
    await navigate(cdp, `${baseUrl}/buyer-confirmation-guide`);
    await waitForEval(
      cdp,
      "document.body.innerText.includes('Buyer confirmation guide') && document.body.innerText.includes('Required details') && document.body.innerText.includes('Stakeholder prework') && !document.body.innerText.includes('/crm/') && !document.body.innerText.includes('/admin')"
    );
    artifacts.push(await screenshot(cdp, "buyer-confirmation-guide.png"));
    await navigate(cdp, `${baseUrl}/stakeholder-forwarding-kit`);
    await waitForEval(
      cdp,
      "document.body.innerText.includes('Stakeholder forwarding kit') && document.body.innerText.includes('Forwarding sequence') && document.body.innerText.includes('Executive sponsor') && !document.body.innerText.includes('/crm/') && !document.body.innerText.includes('/admin')"
    );
    artifacts.push(await screenshot(cdp, "stakeholder-forwarding-kit.png"));
    await navigate(cdp, `${baseUrl}/pricing`);
    await waitForEval(
      cdp,
      "document.body.innerText.includes('Pricing and packages') && document.body.innerText.includes('Managed AI lead enrichment service') && document.body.innerText.includes('Advanced intelligence reports') && !document.body.innerText.includes('/crm/') && !document.body.innerText.includes('/admin')"
    );
    artifacts.push(await screenshot(cdp, "pricing.png"));
    await navigate(cdp, `${baseUrl}/sales-enablement`);
    await waitForEval(
      cdp,
      "document.body.innerText.includes('Sales enablement packet') && document.body.innerText.includes('Outbound email sequence') && document.body.innerText.includes('Objection responses') && !document.body.innerText.includes('/crm/') && !document.body.innerText.includes('/admin')"
    );
    artifacts.push(await screenshot(cdp, "sales-enablement.png"));
    await navigate(cdp, `${baseUrl}/compare`);
    await waitForEval(
      cdp,
      "document.body.innerText.includes('Comparison guide') && document.body.innerText.includes('Plain contact form') && document.body.innerText.includes('Paid enrichment provider') && !document.body.innerText.includes('/crm/') && !document.body.innerText.includes('/admin')"
    );
    artifacts.push(await screenshot(cdp, "comparison-guide.png"));
    await navigate(cdp, `${baseUrl}/proof-preview`);
    await waitForEval(
      cdp,
      "document.body.innerText.includes('Proof preview') && document.body.innerText.includes('Install proof') && document.body.innerText.includes('Rep usefulness') && document.body.innerText.includes('Synthetic example only') && !document.body.innerText.includes('/crm/') && !document.body.innerText.includes('/admin')"
    );
    artifacts.push(await screenshot(cdp, "proof-preview.png"));
    await cdp.send("Network.setExtraHTTPHeaders", { headers: { Authorization: authHeader } });
    await navigate(cdp, `${baseUrl}${crmPath}`);
    const repAlert = await sendRepAlertViaForm(cdp);
    artifacts.push(await screenshot(cdp, "rep-alert-sent.png"));
    const crmDelivery = await sendCrmDeliveryViaForm(cdp);
    artifacts.push(await screenshot(cdp, "crm-delivery-sent.png"));
	    await updateCrmWorkflowViaForm(cdp);
	    artifacts.push(await screenshot(cdp, "crm-workflow-updated.png"));
	    await updateSalesOutcomeViaForm(cdp);
	    artifacts.push(await screenshot(cdp, "sales-outcome-updated.png"));
	    const delivery = await queueReportDeliveryViaForm(cdp, betaClient);
    artifacts.push(await screenshot(cdp, "report-delivery-queued.png"));
    await markReportDeliverySentViaForm(cdp, delivery.id);
    artifacts.push(await screenshot(cdp, "report-delivery-sent.png"));
	    const proof = await verifyProofDashboard(cdp, betaClient);
	    artifacts.push(await screenshot(cdp, "proof-dashboard.png"));
	    const readiness = await verifyReadinessRoom(cdp);
	    artifacts.push(await screenshot(cdp, "readiness-room.png"));
	    const activation = await verifyActivationCockpit(cdp, betaClient);
	    artifacts.push(await screenshot(cdp, "real-beta-activation-cockpit.png"));
	    const trustPacket = await verifyTrustPacket(cdp);
	    artifacts.push(await screenshot(cdp, "buyer-trust-packet.png"));

    const backup = await apiJson("/api/v1/admin/state/export");
    const validation = await apiJson("/api/v1/admin/state/validate", {
      method: "POST",
      body: backup
    });
    assert.equal(validation.valid, true);
    assert.equal(validation.restore_ready, true);

    await navigate(cdp, `${baseUrl}/admin`);
    await evaluate(
      cdp,
      `(() => {
        const textarea = document.querySelector('textarea[name="backupJson"]');
        textarea.value = ${JSON.stringify(JSON.stringify(backup))};
        textarea.form.requestSubmit();
      })()`
    );
    await waitForEval(cdp, "document.body.innerText.includes('Valid backup')");
    await evaluate(cdp, "document.querySelector('form[action=\"/admin/state/validate\"]').scrollIntoView({ block: 'center' })");
    artifacts.push(await screenshot(cdp, "admin-backup-validation.png"));

    await setViewport(cdp, { width: 390, height: 844, mobile: true });
    await cdp.send("Network.setExtraHTTPHeaders", { headers: {} });
    await loadClientSnippetPage(cdp, betaClient, { mobile: true });
    await waitForEval(cdp, "Boolean(document.querySelector('deal-threads-widget')?.shadowRoot)");
    await openWidget(cdp);
    artifacts.push(await screenshot(cdp, "client-snippet-widget-open-mobile.png"));

    const summary = {
      generated_at: new Date().toISOString(),
      base_url: baseUrl,
      chrome_path: chromePath,
      beta_client_id: betaClient.id,
      lead_profile_path: crmPath,
      rep_brief_version: repBrief.version,
      rep_feedback_status: repFeedback.status,
      rep_feedback_score: repFeedback.usefulness_score,
      public_handoff_status: publicHandoff.status,
      public_handoff_markdown: publicHandoff.markdown,
      manual_crm_export_status: publicHandoff.crm_export,
      public_beta_proof_status: publicHandoff.beta_proof,
      research_evidence_id: researchEvidence.id,
      research_evidence_count: researchEvidence.count,
      rep_alert_id: repAlert.id,
      rep_alert_status: repAlert.status,
      crm_delivery_id: crmDelivery.id,
      crm_delivery_status: crmDelivery.status,
      report_delivery_id: delivery.id,
	      proof_status: proof.clients[0].proof_status,
	      readiness_status: readiness.status,
	      readiness_score: readiness.score,
	      activation_status: activation.status,
	      activation_summary: activation.summary,
	      trust_packet_status: trustPacket.status,
      trust_packet_score: trustPacket.score,
      validation: {
        valid: validation.valid,
        restore_ready: validation.restore_ready,
        incoming_counts: validation.incoming_counts,
        current_counts: validation.current_counts,
        delta: validation.delta
      },
      artifacts
    };
    const summaryPath = path.join(artifactsDir, "browser-qa-summary.json");
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

    console.log(`Browser QA passed. Artifacts written to ${artifactsDir}`);
    for (const artifact of artifacts) console.log(`- ${artifact}`);
    console.log(`- ${summaryPath}`);
  } finally {
    if (chrome) chrome.kill("SIGTERM");
    if (chrome) await once(chrome, "exit").catch(() => {});
    if (chromeTempDir) await rm(chromeTempDir, { recursive: true, force: true });
    if (app) app.kill("SIGTERM");
    if (app) await once(app, "exit").catch(() => {});
    if (appTempDir) await rm(appTempDir, { recursive: true, force: true });
  }
}

async function createBetaClientViaForm(cdp) {
  await navigate(cdp, `${baseUrl}/beta-clients`);
  await waitForEval(cdp, "document.body.innerText.includes('Add beta client')");
  await submitAndWaitForLoad(
    cdp,
    `(() => {
      const form = document.querySelector('form.beta-form');
      form.querySelector('[name="name"]').value = 'BrowserQA Pilot Team';
      form.querySelector('[name="websiteUrl"]').value = 'https://browserqa.test';
      form.querySelector('[name="ownerEmail"]').value = 'owner@browserqa.test';
      form.querySelector('[name="crm"]').value = 'hubspot';
      form.querySelector('[name="crmDestinationName"]').value = 'BrowserQA CRM handoff';
      form.querySelector('[name="crmDeliveryWebhookUrl"]').value = 'https://hooks.example.test/browserqa';
      form.querySelector('[name="crmDeliveryOwner"]').value = 'revops@browserqa.test';
      form.querySelector('[name="status"]').value = 'setup';
      form.querySelector('[name="notes"]').value = 'Created by browser QA through the operator form.';
      form.querySelector('[name="launcherText"]').value = 'Ask BrowserQA';
      form.querySelector('[name="welcomeMessage"]').value = 'BrowserQA-specific welcome from browser QA.';
      form.querySelector('[name="quickReplies"]').value = 'Fix routing, Improve lead quality';
      form.querySelector('[name="questionPlaybook"]').value = [
        'business_need | BrowserQA need | What should BrowserQA improve first? | Fix routing; Improve lead quality | required',
        'company_name_or_domain | Company | Which company should the rep research? |  | required',
        'authority | Decision role | Who owns the BrowserQA buying decision? | I own the decision; I influence the decision | optional',
        'timeline | Timeline | When should BrowserQA solve this? | This week; This month; This quarter | required',
        'budget | Budget | Is BrowserQA budget approved? | Budget approved; Budget likely; Need to build the case | optional',
        'crm | CRM | Which CRM should BrowserQA route into? | HubSpot; Salesforce; Pipedrive | required',
        'email | Work email | What BrowserQA work email should the rep use? |  | required',
        'name | Name | What name should the rep use? |  | optional'
      ].join('\\n');
      form.querySelector('[name="primaryColor"]').value = '#065f46';
      form.querySelector('[name="highPriorityOwner"]').value = 'qa-ae@browserqa.test';
      form.querySelector('[name="highPriorityAction"]').value = 'Browser QA high-priority follow-up within 10 minutes.';
      form.querySelector('[name="baselineFirstTouchMinutes"]').value = '90';
      form.querySelector('[name="baselineMeetingRate"]').value = '10';
      form.querySelector('[name="baselineOpportunityRate"]').value = '4';
      form.querySelector('[name="minimumProofLeads"]').value = '1';
      form.requestSubmit();
    })()`
  );
    await waitForEval(cdp, "document.body.innerText.includes('BrowserQA Pilot Team') && document.body.innerText.includes('Client readiness') && document.body.innerText.includes('Launch wizard') && document.body.innerText.includes('Proof baseline')");
  await evaluate(cdp, "document.querySelector('.client-card')?.scrollIntoView({ block: 'start' })");
  await sleep(120);

  const summary = await apiJson("/api/v1/beta-clients");
  const client = summary.clients.find((item) => item.name === "BrowserQA Pilot Team");
  assert.ok(client, "Browser QA beta client should be created through the operator form");
  assert.equal(client.domain, "browserqa.test");
  assert.equal(client.owner_email, "owner@browserqa.test");
  assert.equal(client.crm_delivery.destination_name, "BrowserQA CRM handoff");
  assert.equal(client.crm_delivery.webhook_url, "https://hooks.example.test/browserqa");
  assert.equal(client.widget_config.launcherText, "Ask BrowserQA");
  assert.equal(client.widget_config.questions.find((question) => question.key === "authority").prompt, "Who owns the BrowserQA buying decision?");
  assert.equal(client.readiness.ready_to_send_snippet, true);
  assert.equal(client.readiness.ready_for_live_beta, false);
  assert.equal(client.measurement_settings.baseline_minutes_to_first_contact, 90);
  assert.equal(client.measurement_settings.minimum_proof_leads, 1);
  assert.match(client.install_snippet, new RegExp(`data-beta-client-id="${client.id}"`));
  const readiness = await apiJson(`/api/v1/beta-clients/${client.id}/readiness`);
  assert.equal(readiness.readiness.ready_to_send_snippet, true);
  const wizard = await apiJson(`/api/v1/beta-clients/${client.id}/launch-wizard`);
  assert.equal(wizard.wizard.current_phase, "launch_packet");
  return client;
}

async function sendLaunchPacketViaForm(cdp, betaClient) {
  await navigate(cdp, `${baseUrl}/launch?client=${betaClient.id}`);
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Launch packet') && document.body.innerText.includes('Launch wizard') && document.body.innerText.includes('Packet delivery') && document.body.innerText.includes('Send launch packet')"
  );
  await evaluate(
    cdp,
    `document.querySelector("form[action='/launch/${betaClient.id}/send-packet']")?.scrollIntoView({ block: 'center' })`
  );
  await submitAndWaitForLoad(
    cdp,
    `(() => {
      const form = document.querySelector("form[action='/launch/${betaClient.id}/send-packet']");
      form.querySelector('[name="recipients"]').value = 'owner@browserqa.test, implementer@browserqa.test';
      form.requestSubmit();
    })()`
  );
  await waitForEval(cdp, "document.body.innerText.includes('Launch packet sent and install handoff marked.')");
  await evaluate(cdp, "document.querySelector('.status-row')?.scrollIntoView({ block: 'center' })");
  await sleep(120);

  const client = await apiJson(`/api/v1/beta-clients/${betaClient.id}`);
  assert.equal(client.launch_packet_delivery.status, "sent");
  assert.equal(client.launch_packet_delivery.sent_via, "dry_run");
  assert.deepEqual(client.launch_packet_delivery.recipients, ["owner@browserqa.test", "implementer@browserqa.test"]);
  assert.equal(client.checklist.find((item) => item.key === "install_snippet_sent").checked, true);
}

async function loadClientSnippetPage(cdp, betaClient, options = {}) {
  const filePath = path.join(chromeTempDir, options.mobile ? "browserqa-client-snippet-mobile.html" : "browserqa-client-snippet.html");
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BrowserQA client snippet</title>
  <style>
    body { margin: 0; min-height: 100vh; background: #eef3f5; color: #102033; font: 16px/1.45 system-ui, sans-serif; }
    main { max-width: 960px; margin: 0 auto; padding: 42px 22px; }
    h1 { margin: 0 0 8px; font-size: 34px; }
    p { color: #526476; max-width: 680px; }
    pre { max-width: 100%; white-space: pre-wrap; word-break: break-word; color: #334155; }
  </style>
</head>
<body>
  <main>
    <h1>BrowserQA Pilot Team</h1>
    <p>This local fixture uses the exact beta-client script tag generated by Deal Threads.</p>
    <pre>${escapeForHtml(betaClient.install_snippet)}</pre>
  </main>
  ${betaClient.install_snippet}
</body>
</html>`;
  await writeFile(filePath, html);
  await navigate(cdp, pathToFileURL(filePath).href);
}

async function updateCrmWorkflowViaForm(cdp) {
  await evaluate(cdp, "document.querySelector('.workflow-card')?.scrollIntoView({ block: 'start' })");
  await waitForEval(cdp, "document.body.innerText.includes('Rep workflow')");
  await submitAndWaitForLoad(
    cdp,
    `(() => {
      const form = document.querySelector('form[action$="/workflow"]');
      form.querySelector('[name="stage"]').value = 'meeting_booked';
      form.querySelector('[name="ownerEmail"]').value = 'qa-ae@browserqa.test';
      form.querySelector('[name="dueAt"]').value = '2030-01-01T10:00';
      form.querySelector('[name="nextAction"]').value = 'Prepare discovery plan from browser QA.';
      form.querySelector('[name="note"]').value = 'Meeting booked through browser QA workflow form.';
      form.requestSubmit();
    })()`
  );
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Meeting booked') && document.body.innerText.includes('Meeting booked through browser QA workflow form.')"
  );
  await evaluate(cdp, "document.querySelector('.workflow-card')?.scrollIntoView({ block: 'start' })");
  await sleep(120);

  const leadPath = new URL(await evaluate(cdp, "location.href")).pathname;
  const lead = await apiJson(`/api/v1/leads/${leadPath.split('/').pop()}`);
  assert.equal(lead.workflow.stage, "meeting_booked");
  assert.equal(lead.workflow.owner_email, "qa-ae@browserqa.test");
  assert.equal(lead.workflow.notes[0].body, "Meeting booked through browser QA workflow form.");
}

async function updateRepFeedbackViaForm(cdp) {
  await evaluate(cdp, "document.querySelector('form[action$=\"/rep-feedback\"]')?.scrollIntoView({ block: 'center' })");
  await waitForEval(cdp, "Boolean(document.querySelector('form[action$=\"/rep-feedback\"]'))");
  await submitAndWaitForLoad(
    cdp,
    `(() => {
      const form = document.querySelector('form[action$="/rep-feedback"]');
      form.querySelector('[name="status"]').value = 'helpful';
      form.querySelector('[name="usefulnessScore"]').value = '4.5';
      form.querySelector('[name="repConfidence"]').value = 'high';
      form.querySelector('[name="usedOnCall"][value="true"]').checked = true;
      form.querySelector('[name="missingField_source_evidence"]').checked = true;
      form.querySelector('[name="missingContextNote"]').value = 'Browser QA rep wants source evidence visible before first touch.';
      form.requestSubmit();
    })()`
  );
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Rep feedback') && document.body.innerText.includes('Helpful') && document.body.innerText.includes('Source evidence')"
  );
  await evaluate(cdp, "document.querySelector('form[action$=\"/rep-feedback\"]')?.scrollIntoView({ block: 'center' })");
  await sleep(120);

  const leadPath = new URL(await evaluate(cdp, "location.href")).pathname;
  const lead = await apiJson(`/api/v1/leads/${leadPath.split('/').pop()}`);
  assert.equal(lead.rep_feedback.status, "helpful");
  assert.equal(lead.rep_feedback.usefulness_score, 4.5);
  assert.equal(lead.rep_feedback.rep_confidence, "high");
  assert.equal(lead.rep_feedback.used_on_call, true);
  assert.deepEqual(lead.rep_feedback.missing_fields, ["source_evidence"]);
  return lead.rep_feedback;
}

async function addResearchEvidenceViaForm(cdp) {
  await evaluate(cdp, "document.querySelector('.research-evidence-card')?.scrollIntoView({ block: 'start' })");
  await waitForEval(cdp, "Boolean(document.querySelector('form[action$=\"/research-evidence\"]'))");
  await submitAndWaitForLoad(
    cdp,
    `(() => {
      const form = document.querySelector('form[action$="/research-evidence"]');
      form.querySelector('[name="category"]').value = 'buying_committee';
      form.querySelector('[name="value"]').value = 'BrowserQA public evidence confirms RevOps owns inbound routing.';
      form.querySelector('[name="sourceUrl"]').value = 'https://browserqa.test/team';
      form.querySelector('[name="sourceLabel"]').value = 'BrowserQA team page';
      form.querySelector('[name="confidence"]').value = '87';
      form.querySelector('[name="note"]').value = 'Saved through browser QA before any paid lookup.';
      form.querySelector('[name="markReviewed"]').checked = true;
      form.requestSubmit();
    })()`
  );
  await waitForEval(
    cdp,
    "document.body.innerText.includes('BrowserQA public evidence confirms RevOps owns inbound routing.') && document.body.innerText.includes('Reusable memory')"
  );
  await evaluate(cdp, "document.querySelector('.research-evidence-card')?.scrollIntoView({ block: 'start' })");
  await sleep(120);

  const leadPath = new URL(await evaluate(cdp, "location.href")).pathname;
  const lead = await apiJson(`/api/v1/leads/${leadPath.split('/').pop()}`);
  const evidence = lead.enrichment.research_evidence.find((item) => item.value.includes("BrowserQA public evidence"));
  assert.ok(evidence, "Research evidence should be saved on the browser QA lead");
  assert.equal(lead.enrichment_review.status, "reviewed");
  return {
    id: evidence.id,
    count: lead.enrichment.research_evidence.length
  };
}

async function verifyPublicRepHandoffPacket(cdp, betaClient, leadId) {
  const feedbackPath = new URL(betaClient.public_feedback_url).pathname;
  const handoffPath = `/handoff/${betaClient.handoff_token}/${leadId}`;
  await navigate(cdp, `${baseUrl}${feedbackPath}`);
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Deal Threads rep feedback room') && document.body.innerText.includes('Open rep handoff packet') && document.body.innerText.includes('Download Markdown') && document.body.innerText.includes('Download manual CRM CSV') && document.body.innerText.includes('Open beta proof report')"
  );
  const feedbackHtml = await evaluate(cdp, "document.documentElement.outerHTML");
  assert.equal(feedbackHtml.includes("/crm/"), false);
  assert.equal(feedbackHtml.includes("/api/v1/"), false);
  assert.equal(feedbackHtml.includes("Operator config"), false);

  await navigate(cdp, `${baseUrl}${handoffPath}`);
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Rep handoff packet') && document.body.innerText.includes('Call plan') && document.body.innerText.includes('Discovery questions') && document.body.innerText.includes('Providerless signals') && document.body.innerText.includes('BrowserQA public evidence confirms RevOps owns inbound routing.')"
  );
  await evaluate(cdp, "document.querySelector('section.card.wide')?.scrollIntoView({ block: 'start' })");
  const handoffHtml = await evaluate(cdp, "document.documentElement.outerHTML");
  assert.equal(handoffHtml.includes("/crm/"), false);
  assert.equal(handoffHtml.includes("/api/v1/"), false);
  assert.equal(handoffHtml.includes("Operator config"), false);

  const markdownResponse = await fetch(`${baseUrl}${handoffPath}?format=markdown`);
  assert.equal(markdownResponse.status, 200);
  const markdown = await markdownResponse.text();
  assert.match(markdown, /# Public Rep Handoff Packet/);
  assert.match(markdown, /## Call Plan/);
  assert.match(markdown, /## Copy Blocks/);
  assert.match(markdown, /Paid provider used: no/);
  assert.equal(markdown.includes("/crm/"), false);
  assert.equal(markdown.includes("/api/v1/"), false);

  const csvResponse = await fetch(betaClient.public_crm_export_url);
  assert.equal(csvResponse.status, 200);
  const csv = await csvResponse.text();
  assert.match(csv, /"deal_threads_reference","created_at","contact_name"/);
  assert.match(csv, /BrowserQA/);
  assert.match(csv, new RegExp(`/handoff/${betaClient.handoff_token}/${leadId}`));
  assert.equal(csv.includes("/crm/"), false);
  assert.equal(csv.includes("/api/v1/"), false);

  const notesResponse = await fetch(betaClient.public_crm_export_markdown_url);
  assert.equal(notesResponse.status, 200);
  const notes = await notesResponse.text();
  assert.match(notes, /# Manual CRM Export/);
  assert.match(notes, /does not trigger live CRM sync/);
  assert.equal(notes.includes("/crm/"), false);
  assert.equal(notes.includes("/api/v1/"), false);

  await navigate(cdp, betaClient.public_beta_proof_url);
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Buyer-safe beta proof report') && document.body.innerText.includes('Rep reviews') && document.body.innerText.includes('Providerless enrichment')"
  );
  const proofHtml = await evaluate(cdp, "document.documentElement.outerHTML");
  assert.equal(proofHtml.includes("/crm/"), false);
  assert.equal(proofHtml.includes("/api/v1/"), false);
  const proofMarkdownResponse = await fetch(`${betaClient.public_beta_proof_url}&format=markdown`);
  assert.equal(proofMarkdownResponse.status, 200);
  const proofMarkdown = await proofMarkdownResponse.text();
  assert.match(proofMarkdown, /# Beta Proof Report/);
  assert.match(proofMarkdown, /Average usefulness: 4\.5\/5/);
  assert.equal(proofMarkdown.includes("/crm/"), false);
  assert.equal(proofMarkdown.includes("/api/v1/"), false);
  const proofJsonResponse = await fetch(`${betaClient.public_beta_proof_url}&format=json`);
  assert.equal(proofJsonResponse.status, 200);
  const proofJson = await proofJsonResponse.json();
  assert.equal(proofJson.type, "deal_threads.public_beta_proof_report");
  assert.equal(proofJson.summary.buyer_profiles, 1);
  assert.equal(proofJson.rep_feedback.reviewed_profiles, 1);
  assert.equal(JSON.stringify(proofJson).includes("/crm/"), false);
  assert.equal(JSON.stringify(proofJson).includes("/api/v1/"), false);
  return { status: "verified", markdown: true, crm_export: "verified", beta_proof: "verified" };
}

async function updateSalesOutcomeViaForm(cdp) {
  await evaluate(cdp, "document.querySelector('.outcome-card')?.scrollIntoView({ block: 'start' })");
  await waitForEval(cdp, "document.body.innerText.includes('Sales outcome')");
  await submitAndWaitForLoad(
    cdp,
    `(() => {
      const form = document.querySelector('.outcome-card form[action$="/workflow"]');
      form.querySelector('[name="outcomeStatus"]').value = 'opportunity_created';
      form.querySelector('[name="outcomeValue"]').value = '42000';
      form.querySelector('[name="outcomeProbability"]').value = '45';
      form.querySelector('[name="meetingBookedAt"]').value = '2030-01-01T10:30';
      form.querySelector('[name="opportunityCreatedAt"]').value = '2030-01-01T11:00';
      form.querySelector('[name="note"]').value = 'Opportunity created through browser QA outcome form.';
      form.requestSubmit();
    })()`
  );
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Opportunity created') && document.body.innerText.includes('$42000') && document.body.innerText.includes('Opportunity created through browser QA outcome form.')"
  );
  await evaluate(cdp, "document.querySelector('.outcome-card')?.scrollIntoView({ block: 'start' })");
  await sleep(120);

  const leadPath = new URL(await evaluate(cdp, "location.href")).pathname;
  const lead = await apiJson(`/api/v1/leads/${leadPath.split('/').pop()}`);
  assert.equal(lead.outcome.status, "opportunity_created");
  assert.equal(lead.outcome.value, 42000);
  assert.equal(lead.outcome.probability, 0.45);
  assert.ok(lead.outcome.meeting_booked_at);
  assert.ok(lead.outcome.opportunity_created_at);
}

async function sendRepAlertViaForm(cdp) {
  await evaluate(cdp, "document.querySelector('form[action$=\"/rep-alert/send\"]')?.scrollIntoView({ block: 'center' })");
  await waitForEval(cdp, "Boolean(document.querySelector('form[action$=\"/rep-alert/send\"]'))");
  await submitAndWaitForLoad(
    cdp,
    `(() => {
      const form = document.querySelector('form[action$="/rep-alert/send"]');
      form.querySelector('[name="recipients"]').value = 'qa-ae@browserqa.test';
      form.requestSubmit();
    })()`
  );
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Rep alert') && document.body.innerText.includes('dry_run attempt recorded')"
  );
  await evaluate(cdp, "document.querySelector('form[action$=\"/rep-alert/send\"]')?.scrollIntoView({ block: 'center' })");
  await sleep(120);

  const leadPath = new URL(await evaluate(cdp, "location.href")).pathname;
  const leadId = leadPath.split("/").pop();
  const alerts = await apiJson("/api/v1/rep-alerts");
  const alert = alerts.alerts.find((item) => item.lead_id === leadId);
  assert.ok(alert, "Rep alert should exist for the browser QA lead");
  assert.equal(alert.status, "sent");
  assert.equal(alert.sent_via, "dry_run");
  assert.deepEqual(alert.recipients, ["qa-ae@browserqa.test"]);
  assert.equal(alert.send_attempt_count, 1);
  return alert;
}

async function sendCrmDeliveryViaForm(cdp) {
  await evaluate(cdp, "document.querySelector('form[action$=\"/crm-delivery/send\"]')?.scrollIntoView({ block: 'center' })");
  await waitForEval(cdp, "Boolean(document.querySelector('form[action$=\"/crm-delivery/send\"]'))");
  await submitAndWaitForLoad(
    cdp,
    `(() => {
      const form = document.querySelector('form[action$="/crm-delivery/send"]');
      form.querySelector('[name="destinationName"]').value = 'BrowserQA CRM handoff';
      form.querySelector('[name="webhookUrl"]').value = 'https://hooks.example.test/browserqa';
      form.querySelector('[name="note"]').value = 'Dry-run CRM delivery from browser QA.';
      form.requestSubmit();
    })()`
  );
  await waitForEval(
    cdp,
    "document.body.innerText.includes('CRM delivery') && document.body.innerText.includes('dry_run attempt recorded')"
  );
  await evaluate(cdp, "document.querySelector('form[action$=\"/crm-delivery/send\"]')?.scrollIntoView({ block: 'center' })");
  await sleep(120);

  const leadPath = new URL(await evaluate(cdp, "location.href")).pathname;
  const leadId = leadPath.split("/").pop();
  const deliveries = await apiJson("/api/v1/crm-deliveries");
  const delivery = deliveries.deliveries.find((item) => item.lead_id === leadId);
  assert.ok(delivery, "CRM delivery should exist for the browser QA lead");
  assert.equal(delivery.status, "sent");
  assert.equal(delivery.sent_via, "dry_run");
  assert.equal(delivery.destination_name, "BrowserQA CRM handoff");
  assert.equal(delivery.destination_host, "hooks.example.test");
  assert.equal(delivery.send_attempt_count, 1);
  return delivery;
}

async function queueReportDeliveryViaForm(cdp, betaClient) {
  await navigate(cdp, `${baseUrl}/beta-clients`);
  await waitForEval(cdp, "document.body.innerText.includes('BrowserQA Pilot Team')");
  await evaluate(
    cdp,
    `document.querySelector("form[action='/beta-clients/${betaClient.id}/report-deliveries']")?.scrollIntoView({ block: 'center' })`
  );
  await submitAndWaitForLoad(
    cdp,
    `(() => {
      const form = document.querySelector("form[action='/beta-clients/${betaClient.id}/report-deliveries']");
      form.querySelector('[name="recipients"]').value = 'owner@browserqa.test, revops@browserqa.test';
      form.querySelector('[name="days"]').value = '14';
      form.requestSubmit();
    })()`
  );
  await waitForEval(cdp, "document.body.innerText.includes('Report delivery queued: del_')");
  const location = await evaluate(cdp, "location.href");
  const deliveryId = new URL(location).searchParams.get("deliveryQueued");
  assert.match(deliveryId || "", /^del_[a-f0-9]+$/);
  const delivery = await apiJson(`/api/v1/reports/deliveries/${deliveryId}`);
  assert.equal(delivery.beta_client_id, betaClient.id);
  assert.equal(delivery.status, "queued");
  assert.equal(delivery.summary.total_leads, 1);
  assert.equal(delivery.summary.opportunities_created, 1);
  assert.equal(delivery.summary.opportunity_value, 42000);
  assert.equal(delivery.summary.expected_value, 18900);
  await navigate(cdp, `${baseUrl}/reports/deliveries/${deliveryId}`);
  await waitForEval(cdp, "document.body.innerText.includes('Markdown packet') && document.body.innerText.includes('CSV packet') && document.body.innerText.includes('Pipeline value')");
  return delivery;
}

async function markReportDeliverySentViaForm(cdp, deliveryId) {
  await submitAndWaitForLoad(
    cdp,
    `(() => {
      const form = document.querySelector("form[action='/reports/deliveries/${deliveryId}/sent']");
      form.querySelector('[name="note"]').value = 'Marked sent through browser QA delivery form.';
      form.requestSubmit();
    })()`
  );
  await waitForEval(
    cdp,
    "document.body.innerText.includes('manual') && document.body.innerText.includes('Marked sent through browser QA delivery form.')"
  );
  const delivery = await apiJson(`/api/v1/reports/deliveries/${deliveryId}`);
  assert.equal(delivery.status, "sent");
  assert.equal(delivery.sent_via, "manual");
}

async function verifyProofDashboard(cdp, betaClient) {
  await navigate(cdp, `${baseUrl}/proof?days=14`);
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Beta proof') && document.body.innerText.includes('BrowserQA Pilot Team') && document.body.innerText.includes('Client proof scorecards') && document.body.innerText.includes('Research saved')"
  );
  const proof = await apiJson("/api/v1/proof/summary?days=14");
  assert.equal(proof.summary.client_count, 1);
  assert.equal(proof.summary.clients_with_baseline, 1);
  assert.equal(proof.summary.total_leads, 1);
  assert.equal(proof.summary.rep_feedback_reviewed, 1);
  assert.equal(proof.summary.rep_feedback_helpful, 1);
  assert.equal(proof.summary.rep_feedback_average_usefulness_score, 4.5);
  assert.equal(proof.clients[0].beta_client.id, betaClient.id);
  assert.equal(proof.clients[0].baseline.minutes_to_first_contact, 90);
  assert.equal(proof.clients[0].settings.minimum_proof_leads, 1);
  assert.equal(proof.clients[0].current.rep_feedback.reviewed_profiles, 1);
  assert.notEqual(proof.clients[0].proof_status, "missing_baseline");
  return proof;
}

async function verifyReadinessRoom(cdp) {
  await navigate(cdp, `${baseUrl}/readiness?days=14`);
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Mid-market readiness') && document.body.innerText.includes('Demo scenario') && document.body.innerText.includes('Load demo scenario') && document.body.innerText.includes('Buyer questions') && document.body.innerText.includes('Providerless plan') && document.body.innerText.includes('Profile quality') && document.body.innerText.includes('Readiness checks')"
  );
  const readiness = await apiJson("/api/v1/readiness/summary?days=14");
  assert.equal(readiness.period.days, 14);
  assert.equal(readiness.proof.total_leads, 1);
  assert.equal(readiness.proof.rep_feedback_reviewed, 1);
  assert.equal(readiness.proof.rep_feedback_helpful, 1);
  assert.equal(readiness.demo_scenario.active, false);
  assert.equal(readiness.governance.admin_auth, "enabled");
  assert.ok(readiness.checks.some((check) => check.key === "rep_feedback"));
  return readiness;
}

async function verifyActivationCockpit(cdp, betaClient) {
  await navigate(cdp, `${baseUrl}/activation`);
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Real beta activation') && document.body.innerText.includes('Demo clients excluded') && document.body.innerText.includes('Activation steps') && document.body.innerText.includes('BrowserQA Pilot Team') && document.body.innerText.includes('Live proof gate')"
  );
  const activation = await apiJson("/api/v1/activation/real-beta");
  assert.ok(["activation_in_progress", "ready_for_real_traffic"].includes(activation.status));
  assert.equal(activation.summary.real_beta_clients, 1);
  assert.equal(activation.summary.demo_clients_excluded, 0);
  assert.equal(activation.summary.real_beta_leads, 1);
  assert.equal(activation.selected_client.id, betaClient.id);
  assert.equal(activation.real_beta_clients[0].id, betaClient.id);
  assert.equal(activation.real_beta_clients.some((client) => client.demo_scenario_id), false);
  assert.ok(activation.steps.some((step) => step.key === "real_launch_target" && step.status === "pass"));
  assert.ok(activation.steps.some((step) => step.key === "real_beta_lead" && step.status === "pass"));
  assert.ok(activation.steps.some((step) => step.key === "live_proof_gate"));
  assert.equal(activation.demo_scenario.active, false);
  return activation;
}

async function verifyTrustPacket(cdp) {
  await navigate(cdp, `${baseUrl}/trust`);
  await waitForEval(
    cdp,
    "document.body.innerText.includes('Buyer trust packet') && document.body.innerText.includes('Processing modes') && document.body.innerText.includes('Production hardening') && document.body.innerText.includes('Request body limit') && document.body.innerText.includes('Data categories') && document.body.innerText.includes('Tenant data controls') && document.body.innerText.includes('Export tenant data') && document.body.innerText.includes('Data flow') && document.body.innerText.includes('Processors') && document.body.innerText.includes('Controls') && document.body.innerText.includes('Retention and deletion')"
  );
  const packet = await apiJson("/api/v1/trust/packet");
  assert.equal(packet.runtime.admin_auth, "enabled");
  assert.equal(packet.runtime.external_crm, false);
  assert.equal(packet.runtime.external_email, false);
  assert.equal(packet.runtime.hardening_status, "hardened");
  assert.equal(packet.hardening.status, "hardened");
  assert.equal(packet.data_inventory.demo_scenario.active, false);
  assert.ok(packet.controls.some((control) => control.key === "retention_deletion" && control.status === "pass"));
  assert.ok(packet.controls.some((control) => control.key === "production_hardening" && control.status === "pass"));
  assert.ok(packet.data_categories.some((category) => category.name === "Visitor identity"));
  const hardening = await apiJson("/api/v1/trust/hardening");
  assert.equal(hardening.status, "hardened");
  assert.ok(hardening.checks.some((check) => check.key === "public_widget_scope" && check.status === "pass"));
  return packet;
}

async function startApp() {
  const url = new URL(baseUrl);
  const port = url.port || "80";
  const tempDir = await mkdtemp(path.join(tmpdir(), "deal-threads-browser-qa-app-"));
  const child = spawn(process.execPath, ["server.js"], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: port,
      ADMIN_USERNAME: adminUsername,
      ADMIN_PASSWORD: adminPassword,
      DEAL_THREADS_DATA_FILE: path.join(tempDir, "state.json"),
      ENRICHMENT_MODE: "internal",
      REPORT_EMAIL_MODE: "dry_run"
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

  try {
    await waitForHealth(baseUrl, () => {
      if (child.exitCode !== null) throw new Error(`Server exited early:\n${logs}`);
    });
  } catch (error) {
    child.kill("SIGTERM");
    throw error;
  }

  return { child, tempDir };
}

async function waitForHealth(url, beforeRetry = () => {}) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    beforeRetry();
    try {
      const health = await fetch(`${url}/api/v1/health`).then((response) => response.json());
      if (health.status === "ok") return health;
    } catch {
      // keep waiting
    }
    await sleep(100);
  }
  throw new Error(`Server did not become ready at ${url}`);
}

async function launchChrome() {
  chromeTempDir = await mkdtemp(path.join(tmpdir(), "deal-threads-browser-qa-chrome-"));
  const child = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--remote-debugging-port=0",
      `--user-data-dir=${chromeTempDir}`,
      "about:blank"
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
  });

  const portFile = path.join(chromeTempDir, "DevToolsActivePort");
  let port = null;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Chrome exited early:\n${logs}`);
    try {
      const content = await readFile(portFile, "utf8");
      port = content.trim().split("\n")[0];
      if (port) break;
    } catch {
      await sleep(100);
    }
  }
  if (!port) throw new Error(`Chrome DevTools port was not created:\n${logs}`);

  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then((response) =>
    response.json()
  );
  const cdp = await CdpClient.connect(target.webSocketDebuggerUrl);
  return { child, userDataDir: chromeTempDir, cdp };
}

async function navigate(cdp, url) {
  const loaded = cdp.once("Page.loadEventFired", 15000).catch(() => null);
  await cdp.send("Page.navigate", { url });
  await loaded;
  await sleep(250);
}

async function submitAndWaitForLoad(cdp, expression) {
  const loaded = cdp.once("Page.loadEventFired", 15000).catch(() => null);
  await evaluate(cdp, expression);
  await loaded;
  await sleep(250);
}

async function openWidget(cdp) {
  await evaluate(
    cdp,
    `(() => {
      const root = document.querySelector('deal-threads-widget').shadowRoot;
      root.querySelector('.launcher').click();
    })()`
  );
  await waitForEval(
    cdp,
    `(() => {
      const root = document.querySelector('deal-threads-widget')?.shadowRoot;
      return Boolean(root?.querySelector('.panel.open') && root.querySelectorAll('.msg.assistant').length);
    })()`
  );
}

async function completeWidgetConversation(cdp, betaClient) {
  await evaluate(
    cdp,
    `(() => {
      const root = document.querySelector('deal-threads-widget').shadowRoot;
      const consent = root.querySelector('.consent input');
      consent.checked = true;
      consent.dispatchEvent(new Event('change', { bubbles: true }));
    })()`
  );

  const messages = [
    "I am evaluating this for BrowserQA Co, a 160-person SaaS company using HubSpot. Demo requests are going cold because reps research manually. We want to fix this this quarter and likely have $30K-$50K annually.",
    "I own the decision",
    "quinn@browserqa.test",
    "My name is Quinn Vale",
    "Yes, send it"
  ];

  for (const [index, message] of messages.entries()) {
    await sendWidgetMessage(cdp, message);
    if (index === 0) {
      await waitForEval(
        cdp,
        "document.querySelector('deal-threads-widget').shadowRoot.textContent.includes('Who owns the BrowserQA buying decision?')"
      );
    }
  }

  try {
    await waitForEval(
      cdp,
      `(() => {
        const root = document.querySelector('deal-threads-widget')?.shadowRoot;
        return root?.querySelector('.done')?.style.display === 'flex';
      })()`,
      10000
    );
  } catch (error) {
    const transcript = await evaluate(
      cdp,
      `(() => [...document.querySelector('deal-threads-widget').shadowRoot.querySelectorAll('.msg')]
        .map((node) => node.textContent)
        .join('\\n---\\n'))()`
    );
    throw new Error(`${error.message}\nWidget transcript:\n${transcript}`);
  }

	  const result = await evaluate(
	    cdp,
	    `(() => document.querySelector('deal-threads-widget').shadowRoot.querySelector('.done').dataset.leadProfileId)()`
	  );
	  assert.match(result, /^lead_[a-f0-9-]+$/);
	  const lead = await apiJson(`/api/v1/leads/${result}`);
	  assert.equal(lead.source.beta_client_id, betaClient.id);
	  assert.equal(lead.routing.assigned_owner_email, "qa-ae@browserqa.test");
	  assert.equal(lead.routing.recommended_next_action, "Browser QA high-priority follow-up within 10 minutes.");
	  return `/crm/${result}`;
	}

async function sendWidgetMessage(cdp, message) {
  const beforeCount = await evaluate(
    cdp,
    "document.querySelector('deal-threads-widget').shadowRoot.querySelectorAll('.msg').length"
  );
  await evaluate(
    cdp,
    `(() => {
      const root = document.querySelector('deal-threads-widget').shadowRoot;
      const textarea = root.querySelector('textarea');
      textarea.value = ${JSON.stringify(message)};
      root.querySelector('.composer').requestSubmit();
    })()`
  );
  await waitForEval(
    cdp,
    `(() => {
      const root = document.querySelector('deal-threads-widget')?.shadowRoot;
      const done = root?.querySelector('.done')?.style.display === 'flex';
      return done || (root?.querySelectorAll('.msg').length || 0) >= ${beforeCount + 2};
    })()`,
    10000
  );
  await waitForWidgetIdle(cdp);
}

async function waitForWidgetIdle(cdp) {
  await waitForEval(
    cdp,
    `(() => {
      const root = document.querySelector('deal-threads-widget')?.shadowRoot;
      return Boolean(root && !root.querySelector('.send').disabled);
    })()`,
    10000
  );
  await sleep(80);
}

async function setViewport(cdp, { width, height, mobile }) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height
  });
}

async function screenshot(cdp, filename) {
  const target = path.join(artifactsDir, filename);
  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  await writeFile(target, Buffer.from(result.data, "base64"));
  return target;
}

async function apiJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || "GET",
    headers: {
      authorization: authHeader,
      "content-type": "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json();
  assert.ok(response.ok, JSON.stringify(payload));
  return payload;
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Evaluation failed");
  }
  return result.result.value;
}

async function waitForEval(cdp, expression, timeoutMs = 8000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const result = await evaluate(cdp, expression);
    if (result) return result;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for browser condition: ${expression}`);
}

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  server.close();
  await once(server, "close");
  return port;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeForHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener("message", (event) => this.onMessage(event.data));
    ws.addEventListener("error", (event) => {
      for (const { reject } of this.pending.values()) reject(new Error(event.message || "CDP websocket error"));
      this.pending.clear();
    });
  }

  static async connect(url) {
    if (!globalThis.WebSocket) {
      throw new Error("Browser QA requires Node.js with a global WebSocket implementation.");
    }
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    return new CdpClient(ws);
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  once(method, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.removeListener(method, handler);
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);
      const handler = (params) => {
        clearTimeout(timer);
        resolve(params);
      };
      this.addListener(method, handler);
    });
  }

  addListener(method, handler) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method).add(handler);
  }

  removeListener(method, handler) {
    this.listeners.get(method)?.delete(handler);
  }

  onMessage(data) {
    const message = JSON.parse(data);
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result || {});
      }
      return;
    }

    for (const handler of this.listeners.get(message.method) || []) {
      this.removeListener(message.method, handler);
      handler(message.params || {});
    }
  }
}

await main();
