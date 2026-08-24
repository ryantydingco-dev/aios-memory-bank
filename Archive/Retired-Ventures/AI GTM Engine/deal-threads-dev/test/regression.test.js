import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const PORT = 5197;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ADMIN_USERNAME = "test-admin";
const ADMIN_PASSWORD = "test-secret";
const ADMIN_AUTH_HEADER = `Basic ${Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString("base64")}`;

test("Deal Threads API regression flow", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-regression-"));
  const dataFile = path.join(tmp, "state.json");
  const app = await startServer(dataFile);

  try {
    const health = await getJson("/api/v1/health");
    assert.equal(health.status, "ok");
    assert.equal(health.dataStore.mode, "json");
    assert.equal(health.dataStore.location, dataFile);
    assert.equal(health.hubSpotMode, "stubbed");
    assert.equal(health.enrichmentMode, "internal");
    assert.equal(health.reportEmailAdapter.mode, "dry_run");
    assert.equal(health.reportEmailAdapter.transmits_external_email, false);
    assert.equal(health.crmDeliveryAdapter.mode, "dry_run");
    assert.equal(health.crmDeliveryAdapter.transmits_external_crm, false);
    assert.equal(health.pilotTargetClients, 5);
    assert.equal(health.adminAuth, "enabled");
    assert.equal(health.hardening.status, "hardened");
    assert.equal(health.hardening.score, 100);
    assert.ok(health.hardening.maxRequestBodyBytes >= 1024);
    assert.equal(health.betaClients, 0);
    assert.equal(health.crmDeliveries, 0);

    const publicHome = await fetch(`${BASE_URL}/`);
    assert.equal(publicHome.status, 200);
    const publicHomeHtml = await publicHome.text();
    assert.match(publicHomeHtml, /Deal Threads/);
    assert.match(publicHomeHtml, /Start buyer profile/);
    assert.match(publicHomeHtml, /First-five beta invite/);
    assert.match(publicHomeHtml, /Request beta pilot/);
    assert.match(publicHomeHtml, /Pilot launch hub/);
    assert.match(publicHomeHtml, /View sample profile/);
    assert.match(publicHomeHtml, /Security center/);
    assert.match(publicHomeHtml, /Pilot agreement/);
    assert.match(publicHomeHtml, /Business case/);
    assert.match(publicHomeHtml, /Implementation guide/);
    assert.match(publicHomeHtml, /CRM handoff guide/);
    assert.match(publicHomeHtml, /Approval room/);
    assert.match(publicHomeHtml, /Mutual action plan/);
    assert.match(publicHomeHtml, /Confirmation guide/);
    assert.match(publicHomeHtml, /Webinar walkthrough/);
    assert.match(publicHomeHtml, /Forwarding kit/);
    assert.match(publicHomeHtml, /Pricing/);
    assert.match(publicHomeHtml, /Sales enablement/);
    assert.match(publicHomeHtml, /Compare options/);
    assert.match(publicHomeHtml, /Proof preview/);
    assert.match(publicHomeHtml, /Procurement packet/);
    assert.match(publicHomeHtml, /Built to earn the install conversation/);
    assert.match(publicHomeHtml, /crm-profile-preview\.png/);

    const publicPilotLaunch = await fetch(`${BASE_URL}/pilot-launch`);
    assert.equal(publicPilotLaunch.status, 200);
    const publicPilotLaunchHtml = await publicPilotLaunch.text();
    assert.match(publicPilotLaunchHtml, /Deal Threads pilot launch hub/);
    assert.match(publicPilotLaunchHtml, /Mid-market beta pilot/);
    assert.match(publicPilotLaunchHtml, /Webinar walkthrough/);
    assert.match(publicPilotLaunchHtml, /Request beta pilot/);
    assert.match(publicPilotLaunchHtml, /Revenue leader/);
    assert.match(publicPilotLaunchHtml, /RevOps or CRM owner/);
    assert.match(publicPilotLaunchHtml, /Website or implementation owner/);
    assert.match(publicPilotLaunchHtml, /Proof gates/);
    assert.match(publicPilotLaunchHtml, /Paid enrichment default/);
    assert.match(publicPilotLaunchHtml, /Launch readiness checklist/);
    assert.match(publicPilotLaunchHtml, /Pilot launch claim audit/);
    assert.match(publicPilotLaunchHtml, /Buyer-safe launch routing only/);
    assert.match(publicPilotLaunchHtml, /Claims live results: no/);
    assert.match(publicPilotLaunchHtml, /Claims market ready: no/);
    assert.match(publicPilotLaunchHtml, /Claims customer ROI: no/);
    assert.match(publicPilotLaunchHtml, /Claims guaranteed lift: no/);
    assert.match(publicPilotLaunchHtml, /Requires market gate before live claims: yes/);
    assert.match(publicPilotLaunchHtml, /no operator forms, CRM profiles, tenant exports/i);
    assert.doesNotMatch(publicPilotLaunchHtml, /<form/i);
    assert.doesNotMatch(publicPilotLaunchHtml, /\/crm\//);
    assert.doesNotMatch(publicPilotLaunchHtml, /\/admin/);

    const publicPilotLaunchJson = await fetch(`${BASE_URL}/api/v1/pilot-launch`);
    assert.equal(publicPilotLaunchJson.status, 200);
    const publicPilotLaunchPacket = await publicPilotLaunchJson.json();
    assert.equal(publicPilotLaunchPacket.type, "deal_threads.public_pilot_launch_hub");
    assert.ok(publicPilotLaunchPacket.stakeholder_paths.length >= 5);
    assert.ok(publicPilotLaunchPacket.launch_sequence.length >= 5);
    assert.ok(publicPilotLaunchPacket.proof_gates.length >= 6);
    assert.equal(publicPilotLaunchPacket.public_safety.read_only_get, true);
    assert.equal(publicPilotLaunchPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicPilotLaunchPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicPilotLaunchPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicPilotLaunchPacket.public_safety.transmits_external_data, false);
    assert.equal(publicPilotLaunchPacket.public_safety.sends_external_email, false);
    assert.equal(publicPilotLaunchPacket.public_safety.runs_paid_enrichment, false);
    assert.equal(publicPilotLaunchPacket.public_safety.claims_live_results, false);
    assert.equal(publicPilotLaunchPacket.launch_readiness_checklist.type, "deal_threads.public_pilot_launch_readiness_checklist.v1");
    assert.equal(publicPilotLaunchPacket.launch_readiness_checklist.public_links_only, true);
    assert.equal(publicPilotLaunchPacket.launch_readiness_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(publicPilotLaunchPacket.launch_readiness_checklist.required_public_links.includes("pilot_close_kit"));
    assert.ok(publicPilotLaunchPacket.launch_readiness_checklist.required_steps.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.type, "deal_threads.public_pilot_launch_claim_audit.v1");
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.claim_scope, "buyer_safe_launch_routing_only");
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.safety.buyer_routing_only, true);
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.safety.pilot_planning_only, true);
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.safety.uses_public_links_only, true);
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.safety.claims_live_results, false);
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicPilotLaunchPacket.pilot_launch_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicPilotLaunchPacket.pilot_launch_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicPilotLaunchPacket.pilot_launch_claim_audit.blocked_claims.some((item) => /market-ready launch clearance/i.test(item)));
    assert.equal(publicPilotLaunchPacket.public_safety.uses_public_links_only, true);
    assert.equal(publicPilotLaunchPacket.public_safety.links_to_protected_surfaces, false);
    assert.equal(publicPilotLaunchPacket.public_safety.buyer_routing_only, true);
    assert.equal(publicPilotLaunchPacket.public_safety.pilot_planning_only, true);
    assert.equal(publicPilotLaunchPacket.public_safety.claims_market_ready, false);
    assert.equal(publicPilotLaunchPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicPilotLaunchPacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicPilotLaunchPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(publicPilotLaunchPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicPilotLaunchPacket).includes("/admin"), false);

    const publicPilotLaunchMarkdown = await fetch(`${BASE_URL}/api/v1/pilot-launch?format=markdown`);
    assert.equal(publicPilotLaunchMarkdown.status, 200);
    const publicPilotLaunchMarkdownText = await publicPilotLaunchMarkdown.text();
    assert.match(publicPilotLaunchMarkdownText, /# Deal Threads Pilot Launch Hub/);
    assert.match(publicPilotLaunchMarkdownText, /Stakeholder Paths/);
    assert.match(publicPilotLaunchMarkdownText, /## Launch Readiness Checklist/);
    assert.match(publicPilotLaunchMarkdownText, /## Pilot Launch Claim Audit/);
    assert.match(publicPilotLaunchMarkdownText, /Read-only GET: yes/);
    assert.match(publicPilotLaunchMarkdownText, /Runs paid enrichment: no/);
    assert.match(publicPilotLaunchMarkdownText, /Claims market ready: no/);
    assert.match(publicPilotLaunchMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicPilotLaunchMarkdownText, /Blocked claim: Do not present the public launch hub as market-ready launch clearance/);
    assert.doesNotMatch(publicPilotLaunchMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicPilotLaunchMarkdownText, /\/admin/);

    const publicWebinar = await fetch(`${BASE_URL}/webinar`);
    assert.equal(publicWebinar.status, 200);
    const publicWebinarHtml = await publicWebinar.text();
    assert.match(publicWebinarHtml, /Deal Threads webinar walkthrough/);
    assert.match(publicWebinarHtml, /AI-powered lead enrichment webinar/);
    assert.match(publicWebinarHtml, /Who should watch/);
    assert.match(publicWebinarHtml, /Agenda/);
    assert.match(publicWebinarHtml, /Providerless strategy/);
    assert.match(publicWebinarHtml, /crm-profile-preview\.png/);
    assert.match(publicWebinarHtml, /Webinar follow-up checklist/);
    assert.match(publicWebinarHtml, /Webinar claim audit/);
    assert.match(publicWebinarHtml, /Buyer education only/);
    assert.match(publicWebinarHtml, /Claims live results: no/);
    assert.match(publicWebinarHtml, /Claims market ready: no/);
    assert.match(publicWebinarHtml, /Claims customer ROI: no/);
    assert.match(publicWebinarHtml, /Claims guaranteed lift: no/);
    assert.match(publicWebinarHtml, /Requires market gate before live claims: yes/);
    assert.match(publicWebinarHtml, /no forms, no outbound sending/i);
    assert.doesNotMatch(publicWebinarHtml, /<form/i);
    assert.doesNotMatch(publicWebinarHtml, /\/crm\//);
    assert.doesNotMatch(publicWebinarHtml, /\/admin/);

    const publicWebinarJson = await fetch(`${BASE_URL}/api/v1/webinar`);
    assert.equal(publicWebinarJson.status, 200);
    const publicWebinarPacket = await publicWebinarJson.json();
    assert.equal(publicWebinarPacket.type, "deal_threads.public_webinar_packet.v1");
    assert.equal(publicWebinarPacket.format.total_minutes, 30);
    assert.equal(publicWebinarPacket.format.default_paid_enrichment_spend_usd, 0);
    assert.ok(publicWebinarPacket.agenda.some((item) => /Providerless enrichment/i.test(item.segment)));
    assert.ok(publicWebinarPacket.follow_up_ctas.some((item) => /Request beta pilot/i.test(item.label)));
    assert.equal(publicWebinarPacket.public_safety.read_only_get, true);
    assert.equal(publicWebinarPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicWebinarPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicWebinarPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicWebinarPacket.public_safety.creates_beta_client, false);
    assert.equal(publicWebinarPacket.public_safety.sends_external_email, false);
    assert.equal(publicWebinarPacket.public_safety.transmits_external_data, false);
    assert.equal(publicWebinarPacket.public_safety.runs_paid_enrichment, false);
    assert.equal(publicWebinarPacket.public_safety.claims_live_results, false);
    assert.equal(publicWebinarPacket.webinar_follow_up_checklist.type, "deal_threads.public_webinar_follow_up_checklist.v1");
    assert.equal(publicWebinarPacket.webinar_follow_up_checklist.manual_send_only, true);
    assert.equal(publicWebinarPacket.webinar_follow_up_checklist.public_links_only, true);
    assert.equal(publicWebinarPacket.webinar_follow_up_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(publicWebinarPacket.webinar_follow_up_checklist.required_public_links.includes("first_five_beta"));
    assert.ok(publicWebinarPacket.webinar_follow_up_checklist.required_steps.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(publicWebinarPacket.webinar_claim_audit.type, "deal_threads.public_webinar_claim_audit.v1");
    assert.equal(publicWebinarPacket.webinar_claim_audit.claim_scope, "buyer_education_only");
    assert.equal(publicWebinarPacket.webinar_claim_audit.safety.buyer_education_only, true);
    assert.equal(publicWebinarPacket.webinar_claim_audit.safety.draft_follow_up_only, true);
    assert.equal(publicWebinarPacket.webinar_claim_audit.safety.uses_public_links_only, true);
    assert.equal(publicWebinarPacket.webinar_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicWebinarPacket.webinar_claim_audit.safety.claims_live_results, false);
    assert.equal(publicWebinarPacket.webinar_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicWebinarPacket.webinar_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicWebinarPacket.webinar_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicWebinarPacket.webinar_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicWebinarPacket.webinar_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicWebinarPacket.webinar_claim_audit.blocked_claims.some((item) => /live customer proof/i.test(item)));
    assert.equal(publicWebinarPacket.public_safety.draft_follow_up_only, true);
    assert.equal(publicWebinarPacket.public_safety.uses_public_links_only, true);
    assert.equal(publicWebinarPacket.public_safety.links_to_protected_surfaces, false);
    assert.equal(publicWebinarPacket.public_safety.buyer_education_only, true);
    assert.equal(publicWebinarPacket.public_safety.claims_market_ready, false);
    assert.equal(publicWebinarPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicWebinarPacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicWebinarPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(publicWebinarPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicWebinarPacket).includes("/admin"), false);

    const publicWebinarMarkdown = await fetch(`${BASE_URL}/api/v1/webinar?format=markdown`);
    assert.equal(publicWebinarMarkdown.status, 200);
    const publicWebinarMarkdownText = await publicWebinarMarkdown.text();
    assert.match(publicWebinarMarkdownText, /# Deal Threads Webinar Walkthrough/);
    assert.match(publicWebinarMarkdownText, /## Agenda/);
    assert.match(publicWebinarMarkdownText, /## Webinar Follow-Up Checklist/);
    assert.match(publicWebinarMarkdownText, /## Webinar Claim Audit/);
    assert.match(publicWebinarMarkdownText, /Runs paid enrichment: no/);
    assert.match(publicWebinarMarkdownText, /Claims live proof: no/);
    assert.match(publicWebinarMarkdownText, /Claims market ready: no/);
    assert.match(publicWebinarMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicWebinarMarkdownText, /Blocked claim: Do not present the webinar as live customer proof/);
    assert.doesNotMatch(publicWebinarMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicWebinarMarkdownText, /\/admin/);

    const publicFirstFiveBeta = await fetch(`${BASE_URL}/first-five-beta`);
    assert.equal(publicFirstFiveBeta.status, 200);
    const publicFirstFiveBetaHtml = await publicFirstFiveBeta.text();
    assert.match(publicFirstFiveBetaHtml, /Deal Threads first-five beta invite/);
    assert.match(publicFirstFiveBetaHtml, /First-five beta invite/);
    assert.match(publicFirstFiveBetaHtml, /replace one mid-market B2B contact form/i);
    assert.match(publicFirstFiveBetaHtml, /Slots remaining/);
    assert.match(publicFirstFiveBetaHtml, /Best fit/);
    assert.match(publicFirstFiveBetaHtml, /Pilot scope/);
    assert.match(publicFirstFiveBetaHtml, /Client-domain install proof/);
    assert.match(publicFirstFiveBetaHtml, /Request beta pilot/);
    assert.match(publicFirstFiveBetaHtml, /crm-profile-preview\.png/);
    assert.match(publicFirstFiveBetaHtml, /no paid enrichment/i);
    assert.match(publicFirstFiveBetaHtml, /no live-proof claims/i);
    assert.match(publicFirstFiveBetaHtml, /Cohort forwarding checklist/);
    assert.match(publicFirstFiveBetaHtml, /First-five claim audit/);
    assert.match(publicFirstFiveBetaHtml, /Beta invite only/);
    assert.match(publicFirstFiveBetaHtml, /Claims live results: no/);
    assert.match(publicFirstFiveBetaHtml, /Claims market ready: no/);
    assert.match(publicFirstFiveBetaHtml, /Claims customer ROI: no/);
    assert.match(publicFirstFiveBetaHtml, /Claims guaranteed lift: no/);
    assert.match(publicFirstFiveBetaHtml, /Requires market gate before live claims: yes/);
    assert.doesNotMatch(publicFirstFiveBetaHtml, /<form/i);
    assert.doesNotMatch(publicFirstFiveBetaHtml, /\/crm\//);
    assert.doesNotMatch(publicFirstFiveBetaHtml, /\/admin/);
    assert.doesNotMatch(publicFirstFiveBetaHtml, /\/api\/v1/);

    const publicFirstFiveBetaJson = await fetch(`${BASE_URL}/api/v1/first-five-beta`);
    assert.equal(publicFirstFiveBetaJson.status, 200);
    const publicFirstFiveBetaPacket = await publicFirstFiveBetaJson.json();
    assert.equal(publicFirstFiveBetaPacket.type, "deal_threads.public_first_five_beta_invite.v1");
    assert.equal(publicFirstFiveBetaPacket.cohort_snapshot.target_beta_clients, 5);
    assert.equal(publicFirstFiveBetaPacket.cohort_snapshot.public_account_names_exposed, false);
    assert.ok(publicFirstFiveBetaPacket.best_fit_criteria.length >= 5);
    assert.ok(publicFirstFiveBetaPacket.pilot_scope.some((item) => /Providerless enrichment/i.test(item)));
    assert.ok(publicFirstFiveBetaPacket.proof_sequence.some((item) => item.key === "client_domain_install"));
    assert.ok(publicFirstFiveBetaPacket.buyer_ctas.some((item) => /Request beta pilot/i.test(item.label)));
    assert.equal(publicFirstFiveBetaPacket.public_safety.read_only_get, true);
    assert.equal(publicFirstFiveBetaPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.reveals_target_accounts, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.creates_beta_client, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.sends_external_email, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.transmits_external_data, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.runs_paid_enrichment, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.claims_live_results, false);
    assert.equal(publicFirstFiveBetaPacket.cohort_forwarding_checklist.type, "deal_threads.public_first_five_beta_forwarding_checklist.v1");
    assert.equal(publicFirstFiveBetaPacket.cohort_forwarding_checklist.public_links_only, true);
    assert.equal(publicFirstFiveBetaPacket.cohort_forwarding_checklist.exposes_target_accounts, false);
    assert.equal(publicFirstFiveBetaPacket.cohort_forwarding_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(publicFirstFiveBetaPacket.cohort_forwarding_checklist.required_public_links.includes("pilot_close_kit"));
    assert.ok(publicFirstFiveBetaPacket.cohort_forwarding_checklist.required_steps.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.type, "deal_threads.public_first_five_beta_claim_audit.v1");
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.claim_scope, "beta_invite_only");
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.safety.beta_invite_only, true);
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.safety.pilot_planning_only, true);
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.safety.uses_public_links_only, true);
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.safety.reveals_target_accounts, false);
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.safety.claims_live_results, false);
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicFirstFiveBetaPacket.first_five_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicFirstFiveBetaPacket.first_five_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicFirstFiveBetaPacket.first_five_claim_audit.blocked_claims.some((item) => /first-five beta slots as live customer proof/i.test(item)));
    assert.equal(publicFirstFiveBetaPacket.public_safety.uses_public_links_only, true);
    assert.equal(publicFirstFiveBetaPacket.public_safety.links_to_protected_surfaces, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.beta_invite_only, true);
    assert.equal(publicFirstFiveBetaPacket.public_safety.pilot_planning_only, true);
    assert.equal(publicFirstFiveBetaPacket.public_safety.claims_market_ready, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicFirstFiveBetaPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(publicFirstFiveBetaPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicFirstFiveBetaPacket).includes("/admin"), false);

    const publicFirstFiveBetaMarkdown = await fetch(`${BASE_URL}/api/v1/first-five-beta?format=markdown`);
    assert.equal(publicFirstFiveBetaMarkdown.status, 200);
    const publicFirstFiveBetaMarkdownText = await publicFirstFiveBetaMarkdown.text();
    assert.match(publicFirstFiveBetaMarkdownText, /# Deal Threads First-Five Beta Invite/);
    assert.match(publicFirstFiveBetaMarkdownText, /## Proof Sequence/);
    assert.match(publicFirstFiveBetaMarkdownText, /Client-domain install proof/);
    assert.match(publicFirstFiveBetaMarkdownText, /## Cohort Forwarding Checklist/);
    assert.match(publicFirstFiveBetaMarkdownText, /## First-Five Claim Audit/);
    assert.match(publicFirstFiveBetaMarkdownText, /Runs paid enrichment: no/);
    assert.match(publicFirstFiveBetaMarkdownText, /Claims live proof: no/);
    assert.match(publicFirstFiveBetaMarkdownText, /Claims market ready: no/);
    assert.match(publicFirstFiveBetaMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicFirstFiveBetaMarkdownText, /Blocked claim: Do not present first-five beta slots as live customer proof/);
    assert.doesNotMatch(publicFirstFiveBetaMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicFirstFiveBetaMarkdownText, /\/admin/);

    const publicPilotAgreement = await fetch(`${BASE_URL}/pilot-agreement`);
    assert.equal(publicPilotAgreement.status, 200);
    const publicPilotAgreementHtml = await publicPilotAgreement.text();
    assert.match(publicPilotAgreementHtml, /Deal Threads pilot agreement/);
    assert.match(publicPilotAgreementHtml, /14-day private beta order packet/);
    assert.match(publicPilotAgreementHtml, /\$2,500\/month/);
    assert.match(publicPilotAgreementHtml, /Buyer responsibilities/);
    assert.match(publicPilotAgreementHtml, /Success criteria/);
    assert.match(publicPilotAgreementHtml, /No paid enrichment provider calls by default/);
    assert.match(publicPilotAgreementHtml, /Commercial review checklist/);
    assert.match(publicPilotAgreementHtml, /Agreement claim audit/);
    assert.match(publicPilotAgreementHtml, /Commercial review only/);
    assert.match(publicPilotAgreementHtml, /Captures signature: no/);
    assert.match(publicPilotAgreementHtml, /Collects payment: no/);
    assert.match(publicPilotAgreementHtml, /Binding acceptance surface: no/);
    assert.match(publicPilotAgreementHtml, /Claims live results: no/);
    assert.match(publicPilotAgreementHtml, /Claims market ready: no/);
    assert.match(publicPilotAgreementHtml, /Claims customer ROI: no/);
    assert.match(publicPilotAgreementHtml, /Claims guaranteed lift: no/);
    assert.match(publicPilotAgreementHtml, /Requires tokenized acceptance or order: yes/);
    assert.match(publicPilotAgreementHtml, /Requires market gate before live claims: yes/);
    assert.doesNotMatch(publicPilotAgreementHtml, /<form/i);
    assert.doesNotMatch(publicPilotAgreementHtml, /\/crm\//);
    assert.doesNotMatch(publicPilotAgreementHtml, /\/admin/);

    const publicPilotAgreementJson = await fetch(`${BASE_URL}/api/v1/pilot-agreement`);
    assert.equal(publicPilotAgreementJson.status, 200);
    const publicPilotAgreementPacket = await publicPilotAgreementJson.json();
    assert.equal(publicPilotAgreementPacket.type, "deal_threads.public_pilot_agreement");
    assert.equal(
      publicPilotAgreementPacket.commercial_review_checklist.type,
      "deal_threads.public_pilot_agreement_commercial_review_checklist.v1"
    );
    assert.equal(publicPilotAgreementPacket.commercial_review_checklist.captures_signature_on_public_page, false);
    assert.equal(publicPilotAgreementPacket.commercial_review_checklist.collects_payment_on_public_page, false);
    assert.equal(publicPilotAgreementPacket.commercial_review_checklist.public_links_only, true);
    assert.equal(publicPilotAgreementPacket.commercial_review_checklist.requires_buyer_owner_confirmation, true);
    assert.equal(publicPilotAgreementPacket.commercial_review_checklist.requires_tokenized_acceptance_or_order, true);
    assert.equal(publicPilotAgreementPacket.commercial_review_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(publicPilotAgreementPacket.commercial_review_checklist.required_public_links.includes("security_center"));
    assert.ok(publicPilotAgreementPacket.commercial_review_checklist.required_steps.some((item) => /tokenized pilot acceptance/i.test(item)));
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.type, "deal_threads.public_pilot_agreement_claim_audit.v1");
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.claim_scope, "commercial_review_only");
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.commercial_review_only, true);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.binding_acceptance_surface, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.captures_signature, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.collects_payment, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.charges_buyer, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.creates_beta_client, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.mutates_buyer_state, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.transmits_external_data, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.sends_email, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.uses_public_links_only, true);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.claims_live_results, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(publicPilotAgreementPacket.agreement_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicPilotAgreementPacket.agreement_claim_audit.evidence_required.some((item) => item.key === "tokenized_pilot_acceptance_or_order" && item.required));
    assert.ok(publicPilotAgreementPacket.agreement_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicPilotAgreementPacket.agreement_claim_audit.blocked_claims.some((item) => /signed order form/i.test(item)));
    assert.equal(publicPilotAgreementPacket.public_safety.read_only_get, true);
    assert.equal(publicPilotAgreementPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicPilotAgreementPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicPilotAgreementPacket.public_safety.exposes_tenant_exports, false);
    assert.equal(publicPilotAgreementPacket.public_safety.commercial_review_only, true);
    assert.equal(publicPilotAgreementPacket.public_safety.binding_acceptance_surface, false);
    assert.equal(publicPilotAgreementPacket.public_safety.captures_signature, false);
    assert.equal(publicPilotAgreementPacket.public_safety.collects_payment, false);
    assert.equal(publicPilotAgreementPacket.public_safety.charges_buyer, false);
    assert.equal(publicPilotAgreementPacket.public_safety.creates_beta_client, false);
    assert.equal(publicPilotAgreementPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicPilotAgreementPacket.public_safety.transmits_external_data, false);
    assert.equal(publicPilotAgreementPacket.public_safety.sends_email, false);
    assert.equal(publicPilotAgreementPacket.public_safety.runs_paid_lookup, false);
    assert.equal(publicPilotAgreementPacket.public_safety.uses_public_links_only, true);
    assert.equal(publicPilotAgreementPacket.public_safety.links_to_protected_surfaces, false);
    assert.equal(publicPilotAgreementPacket.public_safety.claims_live_results, false);
    assert.equal(publicPilotAgreementPacket.public_safety.claims_market_ready, false);
    assert.equal(publicPilotAgreementPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicPilotAgreementPacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicPilotAgreementPacket.public_safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(publicPilotAgreementPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(publicPilotAgreementPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicPilotAgreementPacket).includes("/admin"), false);

    const publicPilotAgreementMarkdown = await fetch(`${BASE_URL}/api/v1/pilot-agreement?format=markdown`);
    assert.equal(publicPilotAgreementMarkdown.status, 200);
    const publicPilotAgreementMarkdownText = await publicPilotAgreementMarkdown.text();
    assert.match(publicPilotAgreementMarkdownText, /# Deal Threads pilot agreement/);
    assert.match(publicPilotAgreementMarkdownText, /## Commercial Review Checklist/);
    assert.match(publicPilotAgreementMarkdownText, /## Agreement Claim Audit/);
    assert.match(publicPilotAgreementMarkdownText, /Captures signature: no/);
    assert.match(publicPilotAgreementMarkdownText, /Collects payment: no/);
    assert.match(publicPilotAgreementMarkdownText, /Claims market ready: no/);
    assert.match(publicPilotAgreementMarkdownText, /Evidence tokenized_pilot_acceptance_or_order: required/);
    assert.match(publicPilotAgreementMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicPilotAgreementMarkdownText, /Blocked claim: Do not present this public pilot agreement page as a signed order form/);
    assert.doesNotMatch(publicPilotAgreementMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicPilotAgreementMarkdownText, /\/admin/);

    const publicPilotCloseKit = await fetch(`${BASE_URL}/pilot-close-kit`);
    assert.equal(publicPilotCloseKit.status, 200);
    const publicPilotCloseKitHtml = await publicPilotCloseKit.text();
    assert.match(publicPilotCloseKitHtml, /Deal Threads pilot close kit/);
    assert.match(publicPilotCloseKitHtml, /Mid-market B2B pilot close kit/);
    assert.match(publicPilotCloseKitHtml, /Buyer forwarding checklist/);
    assert.match(publicPilotCloseKitHtml, /Close kit claim audit/);
    assert.match(publicPilotCloseKitHtml, /Pilot planning only/);
    assert.match(publicPilotCloseKitHtml, /Claims live results: no/);
    assert.match(publicPilotCloseKitHtml, /Claims market ready: no/);
    assert.match(publicPilotCloseKitHtml, /Claims guaranteed lift: no/);
    assert.match(publicPilotCloseKitHtml, /Requires market gate before live claims: yes/);
    assert.doesNotMatch(publicPilotCloseKitHtml, /<form/i);
    assert.doesNotMatch(publicPilotCloseKitHtml, /\/crm\//);
    assert.doesNotMatch(publicPilotCloseKitHtml, /\/admin/);

    const publicPilotCloseKitJson = await fetch(`${BASE_URL}/api/v1/pilot-close-kit`);
    assert.equal(publicPilotCloseKitJson.status, 200);
    const publicPilotCloseKitPacket = await publicPilotCloseKitJson.json();
    assert.equal(publicPilotCloseKitPacket.type, "deal_threads.public_pilot_close_kit");
    assert.ok(publicPilotCloseKitPacket.handoff_steps.length >= 5);
    assert.ok(publicPilotCloseKitPacket.success_criteria.length >= 4);
    assert.equal(publicPilotCloseKitPacket.buyer_forwarding_checklist.type, "deal_threads.public_pilot_close_kit_forwarding_checklist.v1");
    assert.equal(publicPilotCloseKitPacket.buyer_forwarding_checklist.public_links_only, true);
    assert.ok(publicPilotCloseKitPacket.buyer_forwarding_checklist.required_public_links.includes("pilot_agreement"));
    assert.ok(publicPilotCloseKitPacket.buyer_forwarding_checklist.required_steps.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(publicPilotCloseKitPacket.close_kit_claim_audit.type, "deal_threads.public_pilot_close_kit_claim_audit.v1");
    assert.equal(publicPilotCloseKitPacket.close_kit_claim_audit.claim_scope, "pilot_planning_only");
    assert.equal(publicPilotCloseKitPacket.close_kit_claim_audit.safety.pilot_planning_only, true);
    assert.equal(publicPilotCloseKitPacket.close_kit_claim_audit.safety.uses_public_links_only, true);
    assert.equal(publicPilotCloseKitPacket.close_kit_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicPilotCloseKitPacket.close_kit_claim_audit.safety.claims_live_results, false);
    assert.equal(publicPilotCloseKitPacket.close_kit_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicPilotCloseKitPacket.close_kit_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicPilotCloseKitPacket.close_kit_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicPilotCloseKitPacket.close_kit_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicPilotCloseKitPacket.close_kit_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicPilotCloseKitPacket.close_kit_claim_audit.blocked_claims.some((item) => /market-ready proof/i.test(item)));
    assert.equal(publicPilotCloseKitPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicPilotCloseKitPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicPilotCloseKitPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicPilotCloseKitPacket.public_safety.transmits_external_data, false);
    assert.equal(publicPilotCloseKitPacket.public_safety.claims_live_results, false);
    assert.equal(publicPilotCloseKitPacket.public_safety.claims_market_ready, false);
    assert.equal(publicPilotCloseKitPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicPilotCloseKitPacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicPilotCloseKitPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(publicPilotCloseKitPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicPilotCloseKitPacket).includes("/admin"), false);

    const publicPilotCloseKitMarkdown = await fetch(`${BASE_URL}/api/v1/pilot-close-kit?format=markdown`);
    assert.equal(publicPilotCloseKitMarkdown.status, 200);
    const publicPilotCloseKitMarkdownText = await publicPilotCloseKitMarkdown.text();
    assert.match(publicPilotCloseKitMarkdownText, /# Deal Threads Pilot Close Kit/);
    assert.match(publicPilotCloseKitMarkdownText, /## Buyer Forwarding Checklist/);
    assert.match(publicPilotCloseKitMarkdownText, /## Close Kit Claim Audit/);
    assert.match(publicPilotCloseKitMarkdownText, /Claims live results: no/);
    assert.match(publicPilotCloseKitMarkdownText, /Claims market ready: no/);
    assert.match(publicPilotCloseKitMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicPilotCloseKitMarkdownText, /Blocked claim: Do not present the public close kit as market-ready proof/);
    assert.doesNotMatch(publicPilotCloseKitMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicPilotCloseKitMarkdownText, /\/admin/);

    const publicPricing = await fetch(`${BASE_URL}/pricing`);
    assert.equal(publicPricing.status, 200);
    const publicPricingHtml = await publicPricing.text();
    assert.match(publicPricingHtml, /Deal Threads pricing/);
    assert.match(publicPricingHtml, /Pricing and packages/);
    assert.match(publicPricingHtml, /\$2,500\/mo/);
    assert.match(publicPricingHtml, /Advanced intelligence reports/);
    assert.match(publicPricingHtml, /ICP gap marketing campaigns/);
    assert.match(publicPricingHtml, /No paid enrichment provider calls by default/);
    assert.match(publicPricingHtml, /Commercial terms checklist/);
    assert.match(publicPricingHtml, /Pricing claim audit/);
    assert.match(publicPricingHtml, /Budgetary offer ladder/);
    assert.match(publicPricingHtml, /Collects payment: no/);
    assert.match(publicPricingHtml, /Claims guaranteed ROI: no/);
    assert.doesNotMatch(publicPricingHtml, /<form/i);
    assert.doesNotMatch(publicPricingHtml, /\/crm\//);
    assert.doesNotMatch(publicPricingHtml, /\/admin/);

    const publicPricingJson = await fetch(`${BASE_URL}/api/v1/pricing`);
    assert.equal(publicPricingJson.status, 200);
    const publicPricingPacket = await publicPricingJson.json();
    assert.equal(publicPricingPacket.type, "deal_threads.public_pricing");
    assert.ok(publicPricingPacket.packages.length >= 5);
    assert.equal(publicPricingPacket.commercial_terms_checklist.type, "deal_threads.public_pricing_commercial_terms_checklist.v1");
    assert.equal(publicPricingPacket.commercial_terms_checklist.collects_payment_on_public_page, false);
    assert.equal(publicPricingPacket.commercial_terms_checklist.signed_agreement_required, true);
    assert.ok(publicPricingPacket.commercial_terms_checklist.required_public_links.includes("pilot_agreement"));
    assert.ok(publicPricingPacket.commercial_terms_checklist.required_terms.some((item) => /business-case model/i.test(item)));
    assert.equal(publicPricingPacket.pricing_claim_audit.type, "deal_threads.public_pricing_claim_audit.v1");
    assert.equal(publicPricingPacket.pricing_claim_audit.claim_scope, "budgetary_offer_ladder");
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.budgetary_terms_only, true);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.binding_order_form, false);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.collects_payment, false);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.charges_buyer, false);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.claims_guaranteed_payback, false);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.claims_guaranteed_roi, false);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.claims_live_results, false);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.requires_signed_pilot_agreement, true);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.requires_explicit_paid_enrichment_approval, true);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.requires_pilot_proof_before_outcome_claims, true);
    assert.equal(publicPricingPacket.pricing_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicPricingPacket.pricing_claim_audit.evidence_required.some((item) => item.key === "signed_pilot_agreement" && item.required));
    assert.ok(publicPricingPacket.pricing_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicPricingPacket.pricing_claim_audit.blocked_claims.some((item) => /signed order form/i.test(item)));
    assert.equal(publicPricingPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicPricingPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicPricingPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicPricingPacket.public_safety.transmits_external_data, false);
    assert.equal(publicPricingPacket.public_safety.budgetary_terms_only, true);
    assert.equal(publicPricingPacket.public_safety.binding_order_form, false);
    assert.equal(publicPricingPacket.public_safety.collects_payment, false);
    assert.equal(publicPricingPacket.public_safety.charges_buyer, false);
    assert.equal(publicPricingPacket.public_safety.runs_paid_lookup, false);
    assert.equal(publicPricingPacket.public_safety.claims_guaranteed_payback, false);
    assert.equal(publicPricingPacket.public_safety.claims_guaranteed_roi, false);
    assert.equal(publicPricingPacket.public_safety.claims_live_results, false);
    assert.equal(publicPricingPacket.public_safety.claims_market_ready, false);
    assert.equal(publicPricingPacket.public_safety.requires_signed_pilot_agreement, true);
    assert.equal(publicPricingPacket.public_safety.requires_explicit_paid_enrichment_approval, true);
    assert.equal(publicPricingPacket.public_safety.requires_pilot_proof_before_outcome_claims, true);
    assert.equal(publicPricingPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(publicPricingPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicPricingPacket).includes("/admin"), false);

    const publicPricingMarkdown = await fetch(`${BASE_URL}/api/v1/pricing?format=markdown`);
    assert.equal(publicPricingMarkdown.status, 200);
    const publicPricingMarkdownText = await publicPricingMarkdown.text();
    assert.match(publicPricingMarkdownText, /# Deal Threads Pricing And Packages/);
    assert.match(publicPricingMarkdownText, /Managed AI lead enrichment service/);
    assert.match(publicPricingMarkdownText, /## Commercial Terms Checklist/);
    assert.match(publicPricingMarkdownText, /## Pricing Claim Audit/);
    assert.match(publicPricingMarkdownText, /Collects payment: no/);
    assert.match(publicPricingMarkdownText, /Claims guaranteed ROI: no/);
    assert.match(publicPricingMarkdownText, /Evidence signed_pilot_agreement: required/);
    assert.match(publicPricingMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicPricingMarkdownText, /Blocked claim: Do not present this public pricing page as a signed order form/);

    const publicSalesEnablement = await fetch(`${BASE_URL}/sales-enablement`);
    assert.equal(publicSalesEnablement.status, 200);
    const publicSalesEnablementHtml = await publicSalesEnablement.text();
    assert.match(publicSalesEnablementHtml, /Deal Threads sales enablement/);
    assert.match(publicSalesEnablementHtml, /Sales enablement packet/);
    assert.match(publicSalesEnablementHtml, /Outbound email sequence/);
    assert.match(publicSalesEnablementHtml, /Objection responses/);
    assert.match(publicSalesEnablementHtml, /Turn mid-market interest into confirmed beta installs/);
    assert.match(publicSalesEnablementHtml, /Forwarding checklist/);
    assert.match(publicSalesEnablementHtml, /Sales copy audit/);
    assert.match(publicSalesEnablementHtml, /Buyer-safe outreach draft/);
    assert.match(publicSalesEnablementHtml, /Sends email: no/);
    assert.match(publicSalesEnablementHtml, /Claims guaranteed lift: no/);
    assert.doesNotMatch(publicSalesEnablementHtml, /<form/i);
    assert.doesNotMatch(publicSalesEnablementHtml, /\/crm\//);
    assert.doesNotMatch(publicSalesEnablementHtml, /\/admin/);

    const publicSalesEnablementJson = await fetch(`${BASE_URL}/api/v1/sales-enablement`);
    assert.equal(publicSalesEnablementJson.status, 200);
    const publicSalesEnablementPacket = await publicSalesEnablementJson.json();
    assert.equal(publicSalesEnablementPacket.type, "deal_threads.public_sales_enablement");
    assert.ok(publicSalesEnablementPacket.target_segments.length >= 4);
    assert.ok(publicSalesEnablementPacket.email_sequence.length >= 4);
    assert.ok(publicSalesEnablementPacket.objection_responses.some((item) => /paid enrichment/i.test(item.objection + item.response)));
    assert.equal(publicSalesEnablementPacket.forwarding_checklist.type, "deal_threads.public_sales_enablement_forwarding_checklist.v1");
    assert.equal(publicSalesEnablementPacket.forwarding_checklist.manual_send_only, true);
    assert.equal(publicSalesEnablementPacket.forwarding_checklist.sends_from_public_page, false);
    assert.ok(publicSalesEnablementPacket.forwarding_checklist.required_public_links.includes("security_center"));
    assert.ok(publicSalesEnablementPacket.forwarding_checklist.required_steps.some((item) => /public buyer links/i.test(item)));
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.type, "deal_threads.public_sales_enablement_copy_audit.v1");
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.claim_scope, "pilot_outreach_only");
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.sends_email, false);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.automates_outreach, false);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.draft_copy_only, true);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.uses_public_links_only, true);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.claims_customer_roi, false);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.claims_live_results, false);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.claims_market_ready, false);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.requires_human_review_before_send, true);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.requires_pilot_proof_before_results_claims, true);
    assert.equal(publicSalesEnablementPacket.sales_copy_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicSalesEnablementPacket.sales_copy_audit.evidence_required.some((item) => item.key === "human_review_before_send" && item.required));
    assert.ok(publicSalesEnablementPacket.sales_copy_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicSalesEnablementPacket.sales_copy_audit.blocked_claims.some((item) => /guaranteed speed-to-lead/i.test(item)));
    assert.equal(publicSalesEnablementPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicSalesEnablementPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicSalesEnablementPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicSalesEnablementPacket.public_safety.transmits_external_data, false);
    assert.equal(publicSalesEnablementPacket.public_safety.sends_email, false);
    assert.equal(publicSalesEnablementPacket.public_safety.automates_outreach, false);
    assert.equal(publicSalesEnablementPacket.public_safety.draft_copy_only, true);
    assert.equal(publicSalesEnablementPacket.public_safety.uses_public_links_only, true);
    assert.equal(publicSalesEnablementPacket.public_safety.links_to_protected_surfaces, false);
    assert.equal(publicSalesEnablementPacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicSalesEnablementPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicSalesEnablementPacket.public_safety.claims_live_results, false);
    assert.equal(publicSalesEnablementPacket.public_safety.claims_market_ready, false);
    assert.equal(publicSalesEnablementPacket.public_safety.requires_human_review_before_send, true);
    assert.equal(publicSalesEnablementPacket.public_safety.requires_pilot_proof_before_results_claims, true);
    assert.equal(publicSalesEnablementPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(publicSalesEnablementPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicSalesEnablementPacket).includes("/admin"), false);

    const publicSalesEnablementMarkdown = await fetch(`${BASE_URL}/api/v1/sales-enablement?format=markdown`);
    assert.equal(publicSalesEnablementMarkdown.status, 200);
    const publicSalesEnablementMarkdownText = await publicSalesEnablementMarkdown.text();
    assert.match(publicSalesEnablementMarkdownText, /# Deal Threads Sales Enablement Packet/);
    assert.match(publicSalesEnablementMarkdownText, /## Objection Responses/);
    assert.match(publicSalesEnablementMarkdownText, /## Forwarding Checklist/);
    assert.match(publicSalesEnablementMarkdownText, /## Sales Copy Audit/);
    assert.match(publicSalesEnablementMarkdownText, /Sends email: no/);
    assert.match(publicSalesEnablementMarkdownText, /Claims guaranteed lift: no/);
    assert.match(publicSalesEnablementMarkdownText, /Evidence human_review_before_send: required/);
    assert.match(publicSalesEnablementMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicSalesEnablementMarkdownText, /Blocked claim: Do not claim guaranteed speed-to-lead/);

    const publicComparison = await fetch(`${BASE_URL}/compare`);
    assert.equal(publicComparison.status, 200);
    const publicComparisonHtml = await publicComparison.text();
    assert.match(publicComparisonHtml, /Deal Threads comparison guide/);
    assert.match(publicComparisonHtml, /Comparison guide/);
    assert.match(publicComparisonHtml, /Plain contact form/);
    assert.match(publicComparisonHtml, /Generic chatbot/);
    assert.match(publicComparisonHtml, /Paid enrichment provider/);
    assert.match(publicComparisonHtml, /Build it ourselves/);
    assert.match(publicComparisonHtml, /Decision fit matrix/);
    assert.match(publicComparisonHtml, /Comparison claim audit/);
    assert.match(publicComparisonHtml, /Category positioning only/);
    assert.match(publicComparisonHtml, /Claims guaranteed lift: no/);
    assert.doesNotMatch(publicComparisonHtml, /<form/i);
    assert.doesNotMatch(publicComparisonHtml, /\/crm\//);
    assert.doesNotMatch(publicComparisonHtml, /\/admin/);

    const publicComparisonJson = await fetch(`${BASE_URL}/api/v1/compare`);
    assert.equal(publicComparisonJson.status, 200);
    const publicComparisonPacket = await publicComparisonJson.json();
    assert.equal(publicComparisonPacket.type, "deal_threads.public_comparison");
    assert.ok(publicComparisonPacket.categories.length >= 6);
    assert.ok(publicComparisonPacket.categories.some((item) => /Paid enrichment provider/i.test(item.category)));
    assert.ok(publicComparisonPacket.proof_questions.some((item) => /first-touch speed/i.test(item)));
    assert.ok(publicComparisonPacket.decision_fit_matrix.length >= 6);
    assert.ok(publicComparisonPacket.decision_fit_matrix.some((item) => /Build it ourselves/i.test(item.option)));
    assert.equal(publicComparisonPacket.comparison_claim_audit.type, "deal_threads.public_comparison_claim_audit.v1");
    assert.equal(publicComparisonPacket.comparison_claim_audit.claim_scope, "category_positioning_only");
    assert.equal(publicComparisonPacket.comparison_claim_audit.safety.category_level_only, true);
    assert.equal(publicComparisonPacket.comparison_claim_audit.safety.names_specific_competitors, false);
    assert.equal(publicComparisonPacket.comparison_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicComparisonPacket.comparison_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicComparisonPacket.comparison_claim_audit.safety.claims_live_results, false);
    assert.equal(publicComparisonPacket.comparison_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicComparisonPacket.comparison_claim_audit.safety.requires_buyer_context_for_recommendation, true);
    assert.equal(publicComparisonPacket.comparison_claim_audit.safety.requires_pilot_proof_before_outcome_claims, true);
    assert.equal(publicComparisonPacket.comparison_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicComparisonPacket.comparison_claim_audit.evidence_required.some((item) => item.key === "category_only_framing" && item.required));
    assert.ok(publicComparisonPacket.comparison_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicComparisonPacket.comparison_claim_audit.blocked_claims.some((item) => /named vendor superiority/i.test(item)));
    assert.equal(publicComparisonPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicComparisonPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicComparisonPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicComparisonPacket.public_safety.transmits_external_data, false);
    assert.equal(publicComparisonPacket.public_safety.category_level_only, true);
    assert.equal(publicComparisonPacket.public_safety.names_specific_competitors, false);
    assert.equal(publicComparisonPacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicComparisonPacket.public_safety.claims_market_ready, false);
    assert.equal(publicComparisonPacket.public_safety.claims_live_results, false);
    assert.equal(publicComparisonPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicComparisonPacket.public_safety.requires_buyer_context_for_recommendation, true);
    assert.equal(publicComparisonPacket.public_safety.requires_pilot_proof_before_outcome_claims, true);
    assert.equal(publicComparisonPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(publicComparisonPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicComparisonPacket).includes("/admin"), false);

    const publicComparisonMarkdown = await fetch(`${BASE_URL}/api/v1/compare?format=markdown`);
    assert.equal(publicComparisonMarkdown.status, 200);
    const publicComparisonMarkdownText = await publicComparisonMarkdown.text();
    assert.match(publicComparisonMarkdownText, /# Deal Threads Comparison Guide/);
    assert.match(publicComparisonMarkdownText, /## Category Comparison/);
    assert.match(publicComparisonMarkdownText, /## Decision Fit Matrix/);
    assert.match(publicComparisonMarkdownText, /## Comparison Claim Audit/);
    assert.match(publicComparisonMarkdownText, /Claims guaranteed lift: no/);
    assert.match(publicComparisonMarkdownText, /Evidence category_only_framing: required/);
    assert.match(publicComparisonMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicComparisonMarkdownText, /Blocked claim: Do not claim named vendor superiority/);

    const publicProofPreview = await fetch(`${BASE_URL}/proof-preview`);
    assert.equal(publicProofPreview.status, 200);
    const publicProofPreviewHtml = await publicProofPreview.text();
    assert.match(publicProofPreviewHtml, /Deal Threads proof preview/);
    assert.match(publicProofPreviewHtml, /Proof preview/);
    assert.match(publicProofPreviewHtml, /14-day pilot proof packet/);
    assert.match(publicProofPreviewHtml, /Install proof/);
    assert.match(publicProofPreviewHtml, /Rep usefulness/);
    assert.match(publicProofPreviewHtml, /Providerless enrichment/);
    assert.match(publicProofPreviewHtml, /Synthetic example only/);
    assert.match(publicProofPreviewHtml, /Proof claim audit/);
    assert.match(publicProofPreviewHtml, /Claim scope: Synthetic template only/);
    assert.match(publicProofPreviewHtml, /Claims live results: no/);
    assert.match(publicProofPreviewHtml, /Requires market gate before live claims: yes/);
    assert.doesNotMatch(publicProofPreviewHtml, /<form/i);
    assert.doesNotMatch(publicProofPreviewHtml, /\/crm\//);
    assert.doesNotMatch(publicProofPreviewHtml, /\/admin/);

    const publicProofPreviewJson = await fetch(`${BASE_URL}/api/v1/proof-preview`);
    assert.equal(publicProofPreviewJson.status, 200);
    const publicProofPreviewPacket = await publicProofPreviewJson.json();
    assert.equal(publicProofPreviewPacket.type, "deal_threads.public_proof_preview");
    assert.equal(publicProofPreviewPacket.claim_audit.type, "deal_threads.public_proof_preview_claim_audit.v1");
    assert.equal(publicProofPreviewPacket.claim_audit.claim_scope, "synthetic_template_only");
    assert.equal(publicProofPreviewPacket.claim_audit.sample_metric_count, publicProofPreviewPacket.sample_metrics.length);
    assert.equal(publicProofPreviewPacket.claim_audit.safety.uses_synthetic_data_only, true);
    assert.equal(publicProofPreviewPacket.claim_audit.safety.claims_live_results, false);
    assert.equal(publicProofPreviewPacket.claim_audit.safety.claims_market_ready, false);
    assert.equal(publicProofPreviewPacket.claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicProofPreviewPacket.claim_audit.safety.claims_conversion_lift, false);
    assert.equal(publicProofPreviewPacket.claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicProofPreviewPacket.claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicProofPreviewPacket.claim_audit.evidence_required.some((item) => item.key === "synthetic_sample_notice" && item.required));
    assert.ok(publicProofPreviewPacket.claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicProofPreviewPacket.claim_audit.blocked_claims.some((item) => /observed customer results/i.test(item)));
    assert.ok(publicProofPreviewPacket.sample_metrics.length >= 6);
    assert.ok(publicProofPreviewPacket.interpretation_rules.some((item) => /Continue/i.test(item)));
    assert.equal(publicProofPreviewPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicProofPreviewPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicProofPreviewPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicProofPreviewPacket.public_safety.transmits_external_data, false);
    assert.equal(publicProofPreviewPacket.public_safety.claims_live_results, false);
    assert.equal(publicProofPreviewPacket.public_safety.claims_market_ready, false);
    assert.equal(publicProofPreviewPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicProofPreviewPacket.public_safety.uses_synthetic_data_only, true);
    assert.equal(publicProofPreviewPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(publicProofPreviewPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicProofPreviewPacket).includes("/admin"), false);

    const publicProofPreviewMarkdown = await fetch(`${BASE_URL}/api/v1/proof-preview?format=markdown`);
    assert.equal(publicProofPreviewMarkdown.status, 200);
    const publicProofPreviewMarkdownText = await publicProofPreviewMarkdown.text();
    assert.match(publicProofPreviewMarkdownText, /# Deal Threads Proof Preview/);
    assert.match(publicProofPreviewMarkdownText, /## Public Claim Audit/);
    assert.match(publicProofPreviewMarkdownText, /Claim scope: Synthetic template only/);
    assert.match(publicProofPreviewMarkdownText, /Claims live results: no/);
    assert.match(publicProofPreviewMarkdownText, /Claims market ready: no/);
    assert.match(publicProofPreviewMarkdownText, /Evidence synthetic_sample_notice: required/);
    assert.match(publicProofPreviewMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicProofPreviewMarkdownText, /Blocked claim: Do not present sample metrics as observed customer results/);
    assert.match(publicProofPreviewMarkdownText, /## Sample Metrics/);

    const publicImplementationGuide = await fetch(`${BASE_URL}/implementation-guide`);
    assert.equal(publicImplementationGuide.status, 200);
    const publicImplementationGuideHtml = await publicImplementationGuide.text();
    assert.match(publicImplementationGuideHtml, /Deal Threads implementation guide/);
    assert.match(publicImplementationGuideHtml, /Implementation-owner guide/);
    assert.match(publicImplementationGuideHtml, /Acceptance criteria/);
    assert.match(publicImplementationGuideHtml, /Rollback plan/);
    assert.match(publicImplementationGuideHtml, /source check/i);
    assert.match(publicImplementationGuideHtml, /no operator forms/i);
    assert.doesNotMatch(publicImplementationGuideHtml, /<form/i);
    assert.doesNotMatch(publicImplementationGuideHtml, /\/crm\//);
    assert.doesNotMatch(publicImplementationGuideHtml, /\/admin/);
    assert.doesNotMatch(publicImplementationGuideHtml, /tenant-data/);

    const publicImplementationGuideJson = await fetch(`${BASE_URL}/api/v1/implementation-guide`);
    assert.equal(publicImplementationGuideJson.status, 200);
    const publicImplementationGuidePacket = await publicImplementationGuideJson.json();
    assert.equal(publicImplementationGuidePacket.type, "deal_threads.public_implementation_guide");
    assert.equal(publicImplementationGuidePacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicImplementationGuidePacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicImplementationGuidePacket.public_safety.transmits_external_data, false);
    assert.ok(publicImplementationGuidePacket.implementation_steps?.length >= 8);
    assert.ok(publicImplementationGuidePacket.acceptance_criteria?.some((item) => /beta-attributed test profile/i.test(item)));
    assert.equal(JSON.stringify(publicImplementationGuidePacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicImplementationGuidePacket).includes("tenant-data"), false);

    const publicImplementationGuideMarkdown = await fetch(`${BASE_URL}/api/v1/implementation-guide?format=markdown`);
    assert.equal(publicImplementationGuideMarkdown.status, 200);
    const publicImplementationGuideMarkdownText = await publicImplementationGuideMarkdown.text();
    assert.match(publicImplementationGuideMarkdownText, /# Deal Threads Implementation Guide/);
    assert.match(publicImplementationGuideMarkdownText, /## Acceptance Criteria/);
    assert.doesNotMatch(publicImplementationGuideMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicImplementationGuideMarkdownText, /tenant-data/);

    const publicCrmHandoffGuide = await fetch(`${BASE_URL}/crm-handoff-guide`);
    assert.equal(publicCrmHandoffGuide.status, 200);
    const publicCrmHandoffGuideHtml = await publicCrmHandoffGuide.text();
    assert.match(publicCrmHandoffGuideHtml, /Deal Threads CRM handoff guide/);
    assert.match(publicCrmHandoffGuideHtml, /CRM-owner handoff guide/);
    assert.match(publicCrmHandoffGuideHtml, /Manual CRM export/);
    assert.match(publicCrmHandoffGuideHtml, /Synthetic webhook acceptance/);
    assert.match(publicCrmHandoffGuideHtml, /Live go gates/);
    assert.match(publicCrmHandoffGuideHtml, /no operator forms/i);
    assert.doesNotMatch(publicCrmHandoffGuideHtml, /<form/i);
    assert.doesNotMatch(publicCrmHandoffGuideHtml, /\/crm\//);
    assert.doesNotMatch(publicCrmHandoffGuideHtml, /\/admin/);
    assert.doesNotMatch(publicCrmHandoffGuideHtml, /tenant-data/);

    const publicCrmHandoffGuideJson = await fetch(`${BASE_URL}/api/v1/crm-handoff-guide`);
    assert.equal(publicCrmHandoffGuideJson.status, 200);
    const publicCrmHandoffGuidePacket = await publicCrmHandoffGuideJson.json();
    assert.equal(publicCrmHandoffGuidePacket.type, "deal_threads.public_crm_handoff_guide");
    assert.equal(publicCrmHandoffGuidePacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicCrmHandoffGuidePacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicCrmHandoffGuidePacket.public_safety.transmits_external_data, false);
    assert.ok(publicCrmHandoffGuidePacket.handoff_options?.some((item) => item.option === "Synthetic webhook test"));
    assert.ok(publicCrmHandoffGuidePacket.field_groups?.some((item) => item.group === "Rep handoff"));
    assert.equal(JSON.stringify(publicCrmHandoffGuidePacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicCrmHandoffGuidePacket).includes("tenant-data"), false);

    const publicCrmHandoffGuideMarkdown = await fetch(`${BASE_URL}/api/v1/crm-handoff-guide?format=markdown`);
    assert.equal(publicCrmHandoffGuideMarkdown.status, 200);
    const publicCrmHandoffGuideMarkdownText = await publicCrmHandoffGuideMarkdown.text();
    assert.match(publicCrmHandoffGuideMarkdownText, /# Deal Threads CRM Handoff Guide/);
    assert.match(publicCrmHandoffGuideMarkdownText, /## Synthetic Webhook Acceptance/);
    assert.doesNotMatch(publicCrmHandoffGuideMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicCrmHandoffGuideMarkdownText, /tenant-data/);

    const publicPilotApprovalRoom = await fetch(`${BASE_URL}/pilot-approval-room`);
    assert.equal(publicPilotApprovalRoom.status, 200);
    const publicPilotApprovalRoomHtml = await publicPilotApprovalRoom.text();
    assert.match(publicPilotApprovalRoomHtml, /Deal Threads pilot approval room/);
    assert.match(publicPilotApprovalRoomHtml, /Mid-market buying committee room/);
    assert.match(publicPilotApprovalRoomHtml, /Approval checklist/);
    assert.match(publicPilotApprovalRoomHtml, /Launch sequence/);
    assert.match(publicPilotApprovalRoomHtml, /Approval routing checklist/);
    assert.match(publicPilotApprovalRoomHtml, /Approval claim audit/);
    assert.match(publicPilotApprovalRoomHtml, /Buying committee routing only/);
    assert.match(publicPilotApprovalRoomHtml, /Captures signature: no/);
    assert.match(publicPilotApprovalRoomHtml, /Collects payment: no/);
    assert.match(publicPilotApprovalRoomHtml, /Binding acceptance surface: no/);
    assert.match(publicPilotApprovalRoomHtml, /Claims live results: no/);
    assert.match(publicPilotApprovalRoomHtml, /Claims market ready: no/);
    assert.match(publicPilotApprovalRoomHtml, /Claims customer ROI: no/);
    assert.match(publicPilotApprovalRoomHtml, /Claims guaranteed lift: no/);
    assert.match(publicPilotApprovalRoomHtml, /Requires tokenized acceptance or order: yes/);
    assert.match(publicPilotApprovalRoomHtml, /Requires market gate before live claims: yes/);
    assert.match(publicPilotApprovalRoomHtml, /no operator forms/i);
    assert.doesNotMatch(publicPilotApprovalRoomHtml, /<form/i);
    assert.doesNotMatch(publicPilotApprovalRoomHtml, /\/crm\//);
    assert.doesNotMatch(publicPilotApprovalRoomHtml, /\/admin/);
    assert.doesNotMatch(publicPilotApprovalRoomHtml, /tenant-data/);

    const publicPilotApprovalRoomJson = await fetch(`${BASE_URL}/api/v1/pilot-approval-room`);
    assert.equal(publicPilotApprovalRoomJson.status, 200);
    const publicPilotApprovalRoomPacket = await publicPilotApprovalRoomJson.json();
    assert.equal(publicPilotApprovalRoomPacket.type, "deal_threads.public_pilot_approval_room");
    assert.equal(publicPilotApprovalRoomPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.exposes_tenant_exports, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.transmits_external_data, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_routing_checklist.type, "deal_threads.public_pilot_approval_room_routing_checklist.v1");
    assert.equal(publicPilotApprovalRoomPacket.approval_routing_checklist.public_links_only, true);
    assert.equal(publicPilotApprovalRoomPacket.approval_routing_checklist.stakeholder_routing_only, true);
    assert.equal(publicPilotApprovalRoomPacket.approval_routing_checklist.captures_signature_on_public_page, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_routing_checklist.collects_payment_on_public_page, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_routing_checklist.requires_buyer_confirmation_before_install, true);
    assert.equal(publicPilotApprovalRoomPacket.approval_routing_checklist.requires_tokenized_acceptance_or_order, true);
    assert.equal(publicPilotApprovalRoomPacket.approval_routing_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(publicPilotApprovalRoomPacket.approval_routing_checklist.required_public_links.includes("pilot_agreement"));
    assert.ok(publicPilotApprovalRoomPacket.approval_routing_checklist.required_stakeholder_tracks.includes("Executive sponsor"));
    assert.ok(publicPilotApprovalRoomPacket.approval_routing_checklist.required_steps.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.type, "deal_threads.public_pilot_approval_room_claim_audit.v1");
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.claim_scope, "buying_committee_routing_only");
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.stakeholder_routing_only, true);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.pilot_planning_only, true);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.binding_acceptance_surface, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.captures_signature, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.collects_payment, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.charges_buyer, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.creates_beta_client, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.mutates_buyer_state, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.transmits_external_data, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.sends_email, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.uses_public_links_only, true);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.claims_live_results, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(publicPilotApprovalRoomPacket.approval_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicPilotApprovalRoomPacket.approval_claim_audit.evidence_required.some((item) => item.key === "tokenized_pilot_acceptance_or_order" && item.required));
    assert.ok(publicPilotApprovalRoomPacket.approval_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicPilotApprovalRoomPacket.approval_claim_audit.blocked_claims.some((item) => /signed order form/i.test(item)));
    assert.equal(publicPilotApprovalRoomPacket.public_safety.read_only_get, true);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.stakeholder_routing_only, true);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.pilot_planning_only, true);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.binding_acceptance_surface, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.captures_signature, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.collects_payment, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.charges_buyer, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.creates_beta_client, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.sends_email, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.runs_paid_lookup, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.uses_public_links_only, true);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.links_to_protected_surfaces, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.claims_live_results, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.claims_market_ready, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(publicPilotApprovalRoomPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicPilotApprovalRoomPacket.stakeholder_tracks?.length >= 5);
    assert.ok(publicPilotApprovalRoomPacket.approval_checklist?.some((item) => /no paid enrichment/i.test(item)));
    assert.ok(publicPilotApprovalRoomPacket.launch_sequence?.some((item) => /source-check/i.test(item)));
    assert.equal(JSON.stringify(publicPilotApprovalRoomPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicPilotApprovalRoomPacket).includes("/admin"), false);
    assert.equal(JSON.stringify(publicPilotApprovalRoomPacket).includes("tenant-data"), false);

    const publicPilotApprovalRoomMarkdown = await fetch(`${BASE_URL}/api/v1/pilot-approval-room?format=markdown`);
    assert.equal(publicPilotApprovalRoomMarkdown.status, 200);
    const publicPilotApprovalRoomMarkdownText = await publicPilotApprovalRoomMarkdown.text();
    assert.match(publicPilotApprovalRoomMarkdownText, /# Deal Threads Pilot Approval Room/);
    assert.match(publicPilotApprovalRoomMarkdownText, /## Approval Checklist/);
    assert.match(publicPilotApprovalRoomMarkdownText, /## Launch Sequence/);
    assert.match(publicPilotApprovalRoomMarkdownText, /## Approval Routing Checklist/);
    assert.match(publicPilotApprovalRoomMarkdownText, /## Approval Claim Audit/);
    assert.match(publicPilotApprovalRoomMarkdownText, /Stakeholder routing only: yes/);
    assert.match(publicPilotApprovalRoomMarkdownText, /Captures signature: no/);
    assert.match(publicPilotApprovalRoomMarkdownText, /Collects payment: no/);
    assert.match(publicPilotApprovalRoomMarkdownText, /Claims market ready: no/);
    assert.match(publicPilotApprovalRoomMarkdownText, /Evidence tokenized_pilot_acceptance_or_order: required/);
    assert.match(publicPilotApprovalRoomMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicPilotApprovalRoomMarkdownText, /Blocked claim: Do not present this public approval room as a signed order form/);
    assert.doesNotMatch(publicPilotApprovalRoomMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicPilotApprovalRoomMarkdownText, /\/admin/);
    assert.doesNotMatch(publicPilotApprovalRoomMarkdownText, /tenant-data/);

    const publicMutualActionPlan = await fetch(`${BASE_URL}/mutual-action-plan`);
    assert.equal(publicMutualActionPlan.status, 200);
    const publicMutualActionPlanHtml = await publicMutualActionPlan.text();
    assert.match(publicMutualActionPlanHtml, /Deal Threads mutual action plan/);
    assert.match(publicMutualActionPlanHtml, /14-day mutual action plan/);
    assert.match(publicMutualActionPlanHtml, /Buyer inputs/);
    assert.match(publicMutualActionPlanHtml, /Proof targets/);
    assert.match(publicMutualActionPlanHtml, /Risk controls/);
    assert.match(publicMutualActionPlanHtml, /Execution checklist/);
    assert.match(publicMutualActionPlanHtml, /MAP claim audit/);
    assert.match(publicMutualActionPlanHtml, /Pilot timeline planning only/);
    assert.match(publicMutualActionPlanHtml, /Timeline planning only: yes/);
    assert.match(publicMutualActionPlanHtml, /Captures signature: no/);
    assert.match(publicMutualActionPlanHtml, /Collects payment: no/);
    assert.match(publicMutualActionPlanHtml, /Claims completed milestones: no/);
    assert.match(publicMutualActionPlanHtml, /Claims market ready: no/);
    assert.match(publicMutualActionPlanHtml, /Claims customer ROI: no/);
    assert.match(publicMutualActionPlanHtml, /Claims guaranteed lift: no/);
    assert.match(publicMutualActionPlanHtml, /Requires tokenized acceptance or order: yes/);
    assert.match(publicMutualActionPlanHtml, /Requires market gate before live claims: yes/);
    assert.match(publicMutualActionPlanHtml, /no operator forms/i);
    assert.doesNotMatch(publicMutualActionPlanHtml, /<form/i);
    assert.doesNotMatch(publicMutualActionPlanHtml, /\/crm\//);
    assert.doesNotMatch(publicMutualActionPlanHtml, /\/admin/);
    assert.doesNotMatch(publicMutualActionPlanHtml, /tenant-data/);

    const publicMutualActionPlanJson = await fetch(`${BASE_URL}/api/v1/mutual-action-plan`);
    assert.equal(publicMutualActionPlanJson.status, 200);
    const publicMutualActionPlanPacket = await publicMutualActionPlanJson.json();
    assert.equal(publicMutualActionPlanPacket.type, "deal_threads.public_mutual_action_plan");
    assert.equal(publicMutualActionPlanPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.exposes_tenant_exports, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.transmits_external_data, false);
    assert.equal(publicMutualActionPlanPacket.execution_checklist.type, "deal_threads.public_mutual_action_plan_execution_checklist.v1");
    assert.equal(publicMutualActionPlanPacket.execution_checklist.public_links_only, true);
    assert.equal(publicMutualActionPlanPacket.execution_checklist.timeline_planning_only, true);
    assert.equal(publicMutualActionPlanPacket.execution_checklist.captures_signature_on_public_page, false);
    assert.equal(publicMutualActionPlanPacket.execution_checklist.collects_payment_on_public_page, false);
    assert.equal(publicMutualActionPlanPacket.execution_checklist.requires_buyer_confirmation_before_install, true);
    assert.equal(publicMutualActionPlanPacket.execution_checklist.requires_tokenized_acceptance_or_order, true);
    assert.equal(publicMutualActionPlanPacket.execution_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(publicMutualActionPlanPacket.execution_checklist.required_public_links.includes("pilot_approval_room"));
    assert.ok(publicMutualActionPlanPacket.execution_checklist.required_milestones.includes("Proof review"));
    assert.ok(publicMutualActionPlanPacket.execution_checklist.required_steps.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.type, "deal_threads.public_mutual_action_plan_claim_audit.v1");
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.claim_scope, "pilot_timeline_planning_only");
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.timeline_planning_only, true);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.pilot_planning_only, true);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.binding_acceptance_surface, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.captures_signature, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.collects_payment, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.charges_buyer, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.creates_beta_client, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.mutates_buyer_state, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.transmits_external_data, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.sends_email, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.uses_public_links_only, true);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.claims_live_results, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.claims_completed_milestones, false);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(publicMutualActionPlanPacket.map_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicMutualActionPlanPacket.map_claim_audit.evidence_required.some((item) => item.key === "tokenized_pilot_acceptance_or_order" && item.required));
    assert.ok(publicMutualActionPlanPacket.map_claim_audit.evidence_required.some((item) => item.key === "proof_packet_review" && item.required));
    assert.ok(publicMutualActionPlanPacket.map_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicMutualActionPlanPacket.map_claim_audit.blocked_claims.some((item) => /planned milestones are completed proof/i.test(item)));
    assert.equal(publicMutualActionPlanPacket.public_safety.read_only_get, true);
    assert.equal(publicMutualActionPlanPacket.public_safety.timeline_planning_only, true);
    assert.equal(publicMutualActionPlanPacket.public_safety.pilot_planning_only, true);
    assert.equal(publicMutualActionPlanPacket.public_safety.binding_acceptance_surface, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.captures_signature, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.collects_payment, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.charges_buyer, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.creates_beta_client, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.sends_email, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.runs_paid_lookup, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.uses_public_links_only, true);
    assert.equal(publicMutualActionPlanPacket.public_safety.links_to_protected_surfaces, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.claims_live_results, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.claims_market_ready, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.claims_completed_milestones, false);
    assert.equal(publicMutualActionPlanPacket.public_safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(publicMutualActionPlanPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicMutualActionPlanPacket.milestones?.length >= 8);
    assert.ok(publicMutualActionPlanPacket.buyer_inputs?.some((item) => /Implementation owner/i.test(item)));
    assert.ok(publicMutualActionPlanPacket.proof_targets?.some((item) => /beta-attributed buyer profiles/i.test(item)));
    assert.ok(publicMutualActionPlanPacket.risk_controls?.some((item) => /paid data calls require explicit approval/i.test(item)));
    assert.equal(JSON.stringify(publicMutualActionPlanPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicMutualActionPlanPacket).includes("/admin"), false);
    assert.equal(JSON.stringify(publicMutualActionPlanPacket).includes("tenant-data"), false);

    const publicMutualActionPlanMarkdown = await fetch(`${BASE_URL}/api/v1/mutual-action-plan?format=markdown`);
    assert.equal(publicMutualActionPlanMarkdown.status, 200);
    const publicMutualActionPlanMarkdownText = await publicMutualActionPlanMarkdown.text();
    assert.match(publicMutualActionPlanMarkdownText, /# Deal Threads Mutual Action Plan/);
    assert.match(publicMutualActionPlanMarkdownText, /## Milestones/);
    assert.match(publicMutualActionPlanMarkdownText, /## Proof Targets/);
    assert.match(publicMutualActionPlanMarkdownText, /## Execution Checklist/);
    assert.match(publicMutualActionPlanMarkdownText, /## MAP Claim Audit/);
    assert.match(publicMutualActionPlanMarkdownText, /Timeline planning only: yes/);
    assert.match(publicMutualActionPlanMarkdownText, /Captures signature: no/);
    assert.match(publicMutualActionPlanMarkdownText, /Collects payment: no/);
    assert.match(publicMutualActionPlanMarkdownText, /Claims completed milestones: no/);
    assert.match(publicMutualActionPlanMarkdownText, /Evidence proof_packet_review: required/);
    assert.match(publicMutualActionPlanMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicMutualActionPlanMarkdownText, /Blocked claim: Do not claim planned milestones are completed proof/);
    assert.doesNotMatch(publicMutualActionPlanMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicMutualActionPlanMarkdownText, /\/admin/);
    assert.doesNotMatch(publicMutualActionPlanMarkdownText, /tenant-data/);

    const publicBuyerConfirmationGuide = await fetch(`${BASE_URL}/buyer-confirmation-guide`);
    assert.equal(publicBuyerConfirmationGuide.status, 200);
    const publicBuyerConfirmationGuideHtml = await publicBuyerConfirmationGuide.text();
    assert.match(publicBuyerConfirmationGuideHtml, /Deal Threads buyer confirmation guide/);
    assert.match(publicBuyerConfirmationGuideHtml, /Gather the six details needed before the install handoff/);
    assert.match(publicBuyerConfirmationGuideHtml, /Required details/);
    assert.match(publicBuyerConfirmationGuideHtml, /Stakeholder prework/);
    assert.match(publicBuyerConfirmationGuideHtml, /Submission rules/);
    assert.match(publicBuyerConfirmationGuideHtml, /Confirmation prework checklist/);
    assert.match(publicBuyerConfirmationGuideHtml, /Guide claim audit/);
    assert.match(publicBuyerConfirmationGuideHtml, /Confirmation prework only/);
    assert.match(publicBuyerConfirmationGuideHtml, /Contains buyer-specific token: no/);
    assert.match(publicBuyerConfirmationGuideHtml, /Submits confirmation: no/);
    assert.match(publicBuyerConfirmationGuideHtml, /Creates beta client: no/);
    assert.match(publicBuyerConfirmationGuideHtml, /Sends email: no/);
    assert.match(publicBuyerConfirmationGuideHtml, /Runs paid lookup: no/);
    assert.match(publicBuyerConfirmationGuideHtml, /Claims live results: no/);
    assert.match(publicBuyerConfirmationGuideHtml, /Claims market ready: no/);
    assert.match(publicBuyerConfirmationGuideHtml, /Claims customer ROI: no/);
    assert.match(publicBuyerConfirmationGuideHtml, /Claims guaranteed lift: no/);
    assert.match(publicBuyerConfirmationGuideHtml, /Requires tokenized confirmation form: yes/);
    assert.match(publicBuyerConfirmationGuideHtml, /Requires market gate before live claims: yes/);
    assert.match(publicBuyerConfirmationGuideHtml, /no operator forms/i);
    assert.doesNotMatch(publicBuyerConfirmationGuideHtml, /<form/i);
    assert.doesNotMatch(publicBuyerConfirmationGuideHtml, /\/crm\//);
    assert.doesNotMatch(publicBuyerConfirmationGuideHtml, /\/admin/);
    assert.doesNotMatch(publicBuyerConfirmationGuideHtml, /tenant-data/);

    const publicBuyerConfirmationGuideJson = await fetch(`${BASE_URL}/api/v1/buyer-confirmation-guide`);
    assert.equal(publicBuyerConfirmationGuideJson.status, 200);
    const publicBuyerConfirmationGuidePacket = await publicBuyerConfirmationGuideJson.json();
    assert.equal(publicBuyerConfirmationGuidePacket.type, "deal_threads.public_buyer_confirmation_guide");
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.exposes_tenant_exports, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.transmits_external_data, false);
    assert.equal(publicBuyerConfirmationGuidePacket.confirmation_prework_checklist.type, "deal_threads.public_buyer_confirmation_guide_prework_checklist.v1");
    assert.equal(publicBuyerConfirmationGuidePacket.confirmation_prework_checklist.public_links_only, true);
    assert.equal(publicBuyerConfirmationGuidePacket.confirmation_prework_checklist.guide_only, true);
    assert.equal(publicBuyerConfirmationGuidePacket.confirmation_prework_checklist.contains_buyer_specific_token, false);
    assert.equal(publicBuyerConfirmationGuidePacket.confirmation_prework_checklist.submits_confirmation, false);
    assert.equal(publicBuyerConfirmationGuidePacket.confirmation_prework_checklist.requires_tokenized_confirmation_form, true);
    assert.equal(publicBuyerConfirmationGuidePacket.confirmation_prework_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(publicBuyerConfirmationGuidePacket.confirmation_prework_checklist.required_public_links.includes("stakeholder_forwarding_kit"));
    assert.ok(publicBuyerConfirmationGuidePacket.confirmation_prework_checklist.required_details.includes("Target page URL"));
    assert.ok(publicBuyerConfirmationGuidePacket.confirmation_prework_checklist.required_steps.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.type, "deal_threads.public_buyer_confirmation_guide_claim_audit.v1");
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.claim_scope, "confirmation_prework_only");
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.guide_only, true);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.confirmation_prework_only, true);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.contains_buyer_specific_token, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.submits_confirmation, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.binding_acceptance_surface, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.captures_signature, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.collects_payment, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.charges_buyer, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.creates_beta_client, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.mutates_buyer_state, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.transmits_external_data, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.sends_email, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.uses_public_links_only, true);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.claims_live_results, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.requires_tokenized_confirmation_form, true);
    assert.equal(publicBuyerConfirmationGuidePacket.guide_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicBuyerConfirmationGuidePacket.guide_claim_audit.evidence_required.some((item) => item.key === "tokenized_confirmation_form" && item.required));
    assert.ok(publicBuyerConfirmationGuidePacket.guide_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicBuyerConfirmationGuidePacket.guide_claim_audit.blocked_claims.some((item) => /tokenized confirmation form/i.test(item)));
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.read_only_get, true);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.guide_only, true);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.confirmation_prework_only, true);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.contains_buyer_specific_token, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.submits_confirmation, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.creates_beta_client, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.sends_email, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.runs_paid_lookup, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.uses_public_links_only, true);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.links_to_protected_surfaces, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.claims_live_results, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.claims_market_ready, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.claims_customer_roi, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.requires_tokenized_confirmation_form, true);
    assert.equal(publicBuyerConfirmationGuidePacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicBuyerConfirmationGuidePacket.required_details?.some((item) => /Target page URL/i.test(item.field)));
    assert.ok(publicBuyerConfirmationGuidePacket.after_confirmation?.some((item) => /install handoff/i.test(item)));
    assert.equal(JSON.stringify(publicBuyerConfirmationGuidePacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicBuyerConfirmationGuidePacket).includes("/admin"), false);
    assert.equal(JSON.stringify(publicBuyerConfirmationGuidePacket).includes("tenant-data"), false);

    const publicBuyerConfirmationGuideMarkdown = await fetch(`${BASE_URL}/api/v1/buyer-confirmation-guide?format=markdown`);
    assert.equal(publicBuyerConfirmationGuideMarkdown.status, 200);
    const publicBuyerConfirmationGuideMarkdownText = await publicBuyerConfirmationGuideMarkdown.text();
    assert.match(publicBuyerConfirmationGuideMarkdownText, /# Deal Threads Buyer Confirmation Guide/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /## Required Details/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /## After Confirmation/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /## Confirmation Prework Checklist/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /## Guide Claim Audit/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /Contains buyer-specific token: no/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /Submits confirmation: no/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /Creates beta client: no/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /Claims market ready: no/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /Evidence tokenized_confirmation_form: required/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicBuyerConfirmationGuideMarkdownText, /Blocked claim: Do not present this public buyer confirmation guide as the tokenized confirmation form/);
    assert.doesNotMatch(publicBuyerConfirmationGuideMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicBuyerConfirmationGuideMarkdownText, /\/admin/);
    assert.doesNotMatch(publicBuyerConfirmationGuideMarkdownText, /tenant-data/);

    const publicStakeholderForwardingKit = await fetch(`${BASE_URL}/stakeholder-forwarding-kit`);
    assert.equal(publicStakeholderForwardingKit.status, 200);
    const publicStakeholderForwardingKitHtml = await publicStakeholderForwardingKit.text();
    assert.match(publicStakeholderForwardingKitHtml, /Deal Threads stakeholder forwarding kit/);
    assert.match(publicStakeholderForwardingKitHtml, /Internal notes your champion can forward/);
    assert.match(publicStakeholderForwardingKitHtml, /Forwarding sequence/);
    assert.match(publicStakeholderForwardingKitHtml, /Stakeholder forwarding checklist/);
    assert.match(publicStakeholderForwardingKitHtml, /Forwarding claim audit/);
    assert.match(publicStakeholderForwardingKitHtml, /Manual stakeholder forwarding only/);
    assert.match(publicStakeholderForwardingKitHtml, /Manual forwarding only: yes/);
    assert.match(publicStakeholderForwardingKitHtml, /Draft copy only: yes/);
    assert.match(publicStakeholderForwardingKitHtml, /Contains buyer-specific token: no/);
    assert.match(publicStakeholderForwardingKitHtml, /Sends email: no/);
    assert.match(publicStakeholderForwardingKitHtml, /Submits confirmation: no/);
    assert.match(publicStakeholderForwardingKitHtml, /Creates beta client: no/);
    assert.match(publicStakeholderForwardingKitHtml, /Runs paid lookup: no/);
    assert.match(publicStakeholderForwardingKitHtml, /Claims market ready: no/);
    assert.match(publicStakeholderForwardingKitHtml, /Claims customer ROI: no/);
    assert.match(publicStakeholderForwardingKitHtml, /Claims guaranteed lift: no/);
    assert.match(publicStakeholderForwardingKitHtml, /Requires tokenized confirmation form: yes/);
    assert.match(publicStakeholderForwardingKitHtml, /Requires market gate before live claims: yes/);
    assert.match(publicStakeholderForwardingKitHtml, /Executive sponsor/);
    assert.match(publicStakeholderForwardingKitHtml, /RevOps owner/);
    assert.match(publicStakeholderForwardingKitHtml, /no operator forms/i);
    assert.doesNotMatch(publicStakeholderForwardingKitHtml, /<form/i);
    assert.doesNotMatch(publicStakeholderForwardingKitHtml, /\/crm\//);
    assert.doesNotMatch(publicStakeholderForwardingKitHtml, /\/admin/);
    assert.doesNotMatch(publicStakeholderForwardingKitHtml, /tenant-data/);

    const publicStakeholderForwardingKitJson = await fetch(`${BASE_URL}/api/v1/stakeholder-forwarding-kit`);
    assert.equal(publicStakeholderForwardingKitJson.status, 200);
    const publicStakeholderForwardingKitPacket = await publicStakeholderForwardingKitJson.json();
    assert.equal(publicStakeholderForwardingKitPacket.type, "deal_threads.public_stakeholder_forwarding_kit");
    assert.equal(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.type, "deal_threads.public_stakeholder_forwarding_kit_forwarding_checklist.v1");
    assert.equal(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.status, "manual_forwarding_review_required");
    assert.equal(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.public_links_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.manual_forwarding_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.draft_copy_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.contains_buyer_specific_token, false);
    assert.equal(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.sends_email, false);
    assert.equal(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.submits_confirmation, false);
    assert.equal(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.requires_tokenized_confirmation_form, true);
    assert.equal(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.required_public_links.includes("buyer_confirmation_guide"));
    assert.ok(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.required_stakeholder_notes.includes("CRM owner"));
    assert.ok(publicStakeholderForwardingKitPacket.stakeholder_forwarding_checklist.required_steps.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.type, "deal_threads.public_stakeholder_forwarding_kit_claim_audit.v1");
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.claim_scope, "manual_forwarding_only");
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.manual_forwarding_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.draft_copy_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.stakeholder_routing_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.contains_buyer_specific_token, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.sends_email, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.submits_confirmation, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.binding_acceptance_surface, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.captures_signature, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.collects_payment, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.charges_buyer, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.creates_beta_client, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.mutates_buyer_state, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.transmits_external_data, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.uses_public_links_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.claims_live_results, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.requires_tokenized_confirmation_form, true);
    assert.equal(publicStakeholderForwardingKitPacket.forwarding_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicStakeholderForwardingKitPacket.forwarding_claim_audit.evidence_required.some((item) => item.key === "stakeholder_forwarding_review" && item.required));
    assert.ok(publicStakeholderForwardingKitPacket.forwarding_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicStakeholderForwardingKitPacket.forwarding_claim_audit.blocked_claims.some((item) => /automated email sender/i.test(item)));
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.read_only_get, true);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.exposes_operator_forms, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.exposes_tenant_exports, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.manual_forwarding_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.draft_copy_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.stakeholder_routing_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.contains_buyer_specific_token, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.sends_email, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.submits_confirmation, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.creates_beta_client, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.mutates_buyer_state, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.transmits_external_data, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.runs_paid_lookup, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.uses_public_links_only, true);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.links_to_protected_surfaces, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.claims_live_results, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.claims_market_ready, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.claims_customer_roi, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.claims_guaranteed_lift, false);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.requires_tokenized_confirmation_form, true);
    assert.equal(publicStakeholderForwardingKitPacket.public_safety.requires_market_gate_before_live_claims, true);
    assert.ok(publicStakeholderForwardingKitPacket.templates?.length >= 6);
    assert.ok(publicStakeholderForwardingKitPacket.templates?.some((item) => /CRM owner/i.test(item.audience)));
    assert.ok(publicStakeholderForwardingKitPacket.forwarding_sequence?.some((item) => /tokenized confirmation form/i.test(item)));
    assert.equal(JSON.stringify(publicStakeholderForwardingKitPacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicStakeholderForwardingKitPacket).includes("tenant-data"), false);

    const publicStakeholderForwardingKitMarkdown = await fetch(`${BASE_URL}/api/v1/stakeholder-forwarding-kit?format=markdown`);
    assert.equal(publicStakeholderForwardingKitMarkdown.status, 200);
    const publicStakeholderForwardingKitMarkdownText = await publicStakeholderForwardingKitMarkdown.text();
    assert.match(publicStakeholderForwardingKitMarkdownText, /# Deal Threads Stakeholder Forwarding Kit/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /## Forwarding Sequence/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /### Executive sponsor/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /## Stakeholder Forwarding Checklist/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /## Forwarding Claim Audit/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /## Public Safety/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /Manual forwarding only: yes/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /Draft copy only: yes/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /Contains buyer-specific token: no/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /Sends email: no/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /Submits confirmation: no/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /Creates beta client: no/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /Claims market ready: no/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /Evidence stakeholder_forwarding_review: required/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicStakeholderForwardingKitMarkdownText, /Blocked claim: Do not present this public stakeholder forwarding kit as an automated email sender/);
    assert.doesNotMatch(publicStakeholderForwardingKitMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicStakeholderForwardingKitMarkdownText, /\/admin/);
    assert.doesNotMatch(publicStakeholderForwardingKitMarkdownText, /tenant-data/);

    const publicBusinessCase = await fetch(`${BASE_URL}/business-case`);
    assert.equal(publicBusinessCase.status, 200);
    const publicBusinessCaseHtml = await publicBusinessCase.text();
    assert.match(publicBusinessCaseHtml, /Deal Threads business case calculator/);
    assert.match(publicBusinessCaseHtml, /Mid-market buyer business case/);
    assert.match(publicBusinessCaseHtml, /Adjust assumptions/);
    assert.match(publicBusinessCaseHtml, /Pilot proof targets/);
    assert.match(publicBusinessCaseHtml, /Model sensitivity/);
    assert.match(publicBusinessCaseHtml, /ROI claim audit/);
    assert.match(publicBusinessCaseHtml, /Modeled planning only/);
    assert.match(publicBusinessCaseHtml, /Claims guaranteed ROI: no/);
    assert.match(publicBusinessCaseHtml, /no operator forms/i);
    assert.doesNotMatch(publicBusinessCaseHtml, /\/crm\//);
    assert.doesNotMatch(publicBusinessCaseHtml, /\/admin/);
    assert.doesNotMatch(publicBusinessCaseHtml, /tenant-data/);

    const publicBusinessCaseJson = await fetch(`${BASE_URL}/api/v1/business-case?monthlyLeads=80&dealValue=15000&closeLift=3`);
    assert.equal(publicBusinessCaseJson.status, 200);
    const publicBusinessCasePacket = await publicBusinessCaseJson.json();
    assert.equal(publicBusinessCasePacket.type, "deal_threads.public_business_case");
    assert.equal(publicBusinessCasePacket.assumptions.monthly_qualified_leads, 80);
    assert.equal(publicBusinessCasePacket.assumptions.average_contract_value_usd, 15000);
    assert.equal(publicBusinessCasePacket.assumptions.modeled_close_rate_lift_points, 3);
    assert.ok(publicBusinessCasePacket.results.modeled_incremental_revenue_monthly_usd > 0);
    assert.equal(publicBusinessCasePacket.public_safety.exposes_crm_profiles, false);
    assert.equal(publicBusinessCasePacket.public_safety.transmits_external_data, false);
    assert.equal(publicBusinessCasePacket.public_safety.model_only, true);
    assert.equal(publicBusinessCasePacket.public_safety.claims_guaranteed_roi, false);
    assert.equal(publicBusinessCasePacket.public_safety.claims_customer_roi, false);
    assert.equal(publicBusinessCasePacket.public_safety.claims_live_results, false);
    assert.equal(publicBusinessCasePacket.public_safety.claims_market_ready, false);
    assert.equal(publicBusinessCasePacket.public_safety.claims_conversion_lift, false);
    assert.equal(publicBusinessCasePacket.public_safety.requires_pilot_proof_before_customer_specific_roi, true);
    assert.equal(publicBusinessCasePacket.public_safety.requires_market_gate_before_customer_claims, true);
    assert.equal(publicBusinessCasePacket.model_sensitivity.type, "deal_threads.public_business_case_sensitivity.v1");
    assert.equal(typeof publicBusinessCasePacket.model_sensitivity.break_even_close_rate_lift_points, "number");
    assert.equal(publicBusinessCasePacket.roi_claim_audit.type, "deal_threads.public_business_case_roi_claim_audit.v1");
    assert.equal(publicBusinessCasePacket.roi_claim_audit.claim_scope, "modeled_planning_only");
    assert.equal(publicBusinessCasePacket.roi_claim_audit.safety.claims_guaranteed_roi, false);
    assert.equal(publicBusinessCasePacket.roi_claim_audit.safety.claims_customer_roi, false);
    assert.equal(publicBusinessCasePacket.roi_claim_audit.safety.claims_live_results, false);
    assert.equal(publicBusinessCasePacket.roi_claim_audit.safety.claims_market_ready, false);
    assert.equal(publicBusinessCasePacket.roi_claim_audit.safety.claims_conversion_lift, false);
    assert.equal(publicBusinessCasePacket.roi_claim_audit.safety.requires_pilot_proof_before_customer_specific_roi, true);
    assert.equal(publicBusinessCasePacket.roi_claim_audit.safety.requires_market_gate_before_customer_claims, true);
    assert.ok(publicBusinessCasePacket.roi_claim_audit.evidence_required.some((item) => item.key === "buyer_supplied_assumptions" && item.required));
    assert.ok(publicBusinessCasePacket.roi_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(publicBusinessCasePacket.roi_claim_audit.blocked_claims.some((item) => /guaranteed ROI/i.test(item)));
    assert.equal(JSON.stringify(publicBusinessCasePacket).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicBusinessCasePacket).includes("tenant-data"), false);

    const publicBusinessCaseMarkdown = await fetch(`${BASE_URL}/api/v1/business-case?format=markdown`);
    assert.equal(publicBusinessCaseMarkdown.status, 200);
    const publicBusinessCaseMarkdownText = await publicBusinessCaseMarkdown.text();
    assert.match(publicBusinessCaseMarkdownText, /# Deal Threads Business Case/);
    assert.match(publicBusinessCaseMarkdownText, /## Model Sensitivity/);
    assert.match(publicBusinessCaseMarkdownText, /## ROI Claim Audit/);
    assert.match(publicBusinessCaseMarkdownText, /Claims guaranteed ROI: no/);
    assert.match(publicBusinessCaseMarkdownText, /Evidence buyer_supplied_assumptions: required/);
    assert.match(publicBusinessCaseMarkdownText, /Evidence market_gate_clearance: required/);
    assert.match(publicBusinessCaseMarkdownText, /Blocked claim: Do not present modeled payback as guaranteed ROI/);
    assert.match(publicBusinessCaseMarkdownText, /## Pilot Proof Targets/);
    assert.doesNotMatch(publicBusinessCaseMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicBusinessCaseMarkdownText, /tenant-data/);

    const publicProcurementPacket = await fetch(`${BASE_URL}/procurement-packet`);
    assert.equal(publicProcurementPacket.status, 200);
    const publicProcurementHtml = await publicProcurementPacket.text();
    assert.match(publicProcurementHtml, /Deal Threads procurement packet/);
    assert.match(publicProcurementHtml, /Buyer-safe procurement packet/);
    assert.match(publicProcurementHtml, /Approval checklist/);
    assert.match(publicProcurementHtml, /Default data posture/);
    assert.match(publicProcurementHtml, /Processor modes/);
    assert.match(publicProcurementHtml, /no operator forms/i);
    assert.doesNotMatch(publicProcurementHtml, /<form/i);
    assert.doesNotMatch(publicProcurementHtml, /\/crm\//);
    assert.doesNotMatch(publicProcurementHtml, /\/admin/);
    assert.doesNotMatch(publicProcurementHtml, /tenant-data/);

    const publicProcurementJson = await fetch(`${BASE_URL}/api/v1/procurement-packet`);
    assert.equal(publicProcurementJson.status, 200);
    const publicProcurementPacketJson = await publicProcurementJson.json();
    assert.equal(publicProcurementPacketJson.type, "deal_threads.public_procurement_packet");
    assert.equal(publicProcurementPacketJson.public_safety.exposes_crm_profiles, false);
    assert.equal(publicProcurementPacketJson.public_safety.exposes_tenant_exports, false);
    assert.ok(publicProcurementPacketJson.default_posture.some((item) => /Providerless enrichment/i.test(item)));
    assert.equal(JSON.stringify(publicProcurementPacketJson).includes("/crm/"), false);
    assert.equal(JSON.stringify(publicProcurementPacketJson).includes("tenant-data"), false);

    const publicProcurementMarkdown = await fetch(`${BASE_URL}/api/v1/procurement-packet?format=markdown`);
    assert.equal(publicProcurementMarkdown.status, 200);
    const publicProcurementMarkdownText = await publicProcurementMarkdown.text();
    assert.match(publicProcurementMarkdownText, /# Deal Threads Procurement Packet/);
    assert.match(publicProcurementMarkdownText, /## Approval Checklist/);
    assert.doesNotMatch(publicProcurementMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicProcurementMarkdownText, /tenant-data/);

    const publicPilotIntake = await fetch(`${BASE_URL}/pilot-intake`);
    assert.equal(publicPilotIntake.status, 200);
    const publicPilotIntakeHtml = await publicPilotIntake.text();
    assert.match(publicPilotIntakeHtml, /Private beta request/);
    assert.match(publicPilotIntakeHtml, /Pilot intake/);
    assert.match(publicPilotIntakeHtml, /Request beta pilot/);
    assert.match(publicPilotIntakeHtml, /Protected operator pages/);
    assert.doesNotMatch(publicPilotIntakeHtml, /\/crm\//);

    const publicPreviewImage = await fetch(`${BASE_URL}/assets/crm-profile-preview.png`);
    assert.equal(publicPreviewImage.status, 200);
    assert.match(publicPreviewImage.headers.get("content-type") || "", /image\/png/);

    const publicSampleProfile = await fetch(`${BASE_URL}/sample-profile`);
    assert.equal(publicSampleProfile.status, 200);
    const publicSampleProfileHtml = await publicSampleProfile.text();
    assert.match(publicSampleProfileHtml, /Sample rep-ready buyer profile|What your rep sees before the first touch/);
    assert.match(publicSampleProfileHtml, /Real beta profiles remain protected|waiting for marked demo data/);

    const publicSecurity = await fetch(`${BASE_URL}/security`);
    assert.equal(publicSecurity.status, 200);
    const publicSecurityHtml = await publicSecurity.text();
    assert.match(publicSecurityHtml, /Public security center/);
    assert.match(publicSecurityHtml, /Data controls for a low-friction beta install/);
    assert.match(publicSecurityHtml, /Processor posture/);
    assert.match(publicSecurityHtml, /Providerless enrichment gate/);
    assert.match(publicSecurityHtml, /Install boundary/);
    assert.match(publicSecurityHtml, /explicit consent/i);
    assert.match(publicSecurityHtml, /no operator forms/i);
    assert.doesNotMatch(publicSecurityHtml, /<form/i);
    assert.doesNotMatch(publicSecurityHtml, /\/crm\//);

    const blockedAdmin = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
    assert.equal(blockedAdmin.status, 401);
    assert.equal(blockedAdmin.headers.get("www-authenticate"), 'Basic realm="Deal Threads Admin"');
    assert.equal(blockedAdmin.headers.get("x-content-type-options"), "nosniff");
    assert.equal(blockedAdmin.headers.get("x-frame-options"), "DENY");
    assert.equal(blockedAdmin.headers.get("referrer-policy"), "no-referrer");

    const blockedLeadList = await fetch(`${BASE_URL}/api/v1/leads`);
    assert.equal(blockedLeadList.status, 401);

    const blockedCsv = await fetch(`${BASE_URL}/api/v1/leads/export.csv`);
    assert.equal(blockedCsv.status, 401);

    const blockedReport = await fetch(`${BASE_URL}/api/v1/reports/beta-summary`);
    assert.equal(blockedReport.status, 401);

    const blockedReportDeliveries = await fetch(`${BASE_URL}/api/v1/reports/deliveries`);
    assert.equal(blockedReportDeliveries.status, 401);

    const blockedReportDeliverySendQueued = await fetch(`${BASE_URL}/api/v1/reports/deliveries/send-queued`, { method: "POST" });
    assert.equal(blockedReportDeliverySendQueued.status, 401);

    const blockedPilotPage = await fetch(`${BASE_URL}/pilot`);
    assert.equal(blockedPilotPage.status, 401);

    const blockedPilotSummary = await fetch(`${BASE_URL}/api/v1/pilot/summary`);
    assert.equal(blockedPilotSummary.status, 401);

    const blockedPilotSnapshots = await fetch(`${BASE_URL}/api/v1/pilot/snapshots`);
    assert.equal(blockedPilotSnapshots.status, 401);

    const blockedPilotTrends = await fetch(`${BASE_URL}/api/v1/pilot/trends`);
    assert.equal(blockedPilotTrends.status, 401);

    const blockedActivationPage = await fetch(`${BASE_URL}/activation`);
    assert.equal(blockedActivationPage.status, 401);

    const blockedActivationFollowUpsPage = await fetch(`${BASE_URL}/activation/follow-ups`);
    assert.equal(blockedActivationFollowUpsPage.status, 401);

    const blockedActivationOutboxPage = await fetch(`${BASE_URL}/activation/outbox`);
    assert.equal(blockedActivationOutboxPage.status, 401);

    const blockedActivationCloseDeskPage = await fetch(`${BASE_URL}/activation/close-desk`);
    assert.equal(blockedActivationCloseDeskPage.status, 401);

    const blockedActivationSummary = await fetch(`${BASE_URL}/api/v1/activation/real-beta`);
    assert.equal(blockedActivationSummary.status, 401);

    const blockedActivationFollowUps = await fetch(`${BASE_URL}/api/v1/activation/follow-ups`);
    assert.equal(blockedActivationFollowUps.status, 401);

    const blockedActivationOutbox = await fetch(`${BASE_URL}/api/v1/activation/outbox`);
    assert.equal(blockedActivationOutbox.status, 401);

    const blockedActivationCloseDesk = await fetch(`${BASE_URL}/api/v1/activation/close-desk`);
    assert.equal(blockedActivationCloseDesk.status, 401);

    const blockedLaunchOpsPage = await fetch(`${BASE_URL}/launch/ops`);
    assert.equal(blockedLaunchOpsPage.status, 401);

	    const blockedFirstFiveBoardPage = await fetch(`${BASE_URL}/launch/first-five-board`);
	    assert.equal(blockedFirstFiveBoardPage.status, 401);

	    const blockedFirstFiveBoard = await fetch(`${BASE_URL}/api/v1/launch/first-five-board`);
	    assert.equal(blockedFirstFiveBoard.status, 401);

	    const blockedLaunchOps = await fetch(`${BASE_URL}/api/v1/launch/ops`);
	    assert.equal(blockedLaunchOps.status, 401);

	    const blockedFirstBetaDrillPage = await fetch(`${BASE_URL}/launch/first-beta-drill`);
	    assert.equal(blockedFirstBetaDrillPage.status, 401);

	    const blockedFirstBetaDrill = await fetch(`${BASE_URL}/api/v1/launch/first-beta-drill`);
	    assert.equal(blockedFirstBetaDrill.status, 401);

	    const blockedFirstBetaExecutionPage = await fetch(`${BASE_URL}/launch/first-beta-execution`);
	    assert.equal(blockedFirstBetaExecutionPage.status, 401);

	    const blockedFirstBetaExecution = await fetch(`${BASE_URL}/api/v1/launch/first-beta-execution`);
	    assert.equal(blockedFirstBetaExecution.status, 401);

	    const blockedMarketLaunchPage = await fetch(`${BASE_URL}/launch/market-ready`);
	    assert.equal(blockedMarketLaunchPage.status, 401);

	    const blockedMarketLaunch = await fetch(`${BASE_URL}/api/v1/launch/market-ready`);
	    assert.equal(blockedMarketLaunch.status, 401);

	    const blockedRepFeedbackPage = await fetch(`${BASE_URL}/launch/rep-feedback`);
	    assert.equal(blockedRepFeedbackPage.status, 401);

	    const blockedLaunchRepFeedback = await fetch(`${BASE_URL}/api/v1/launch/rep-feedback`);
	    assert.equal(blockedLaunchRepFeedback.status, 401);

	    const blockedMarketLaunchKitPage = await fetch(`${BASE_URL}/launch/market-kit`);
	    assert.equal(blockedMarketLaunchKitPage.status, 401);

	    const blockedMarketLaunchKit = await fetch(`${BASE_URL}/api/v1/launch/market-kit`);
	    assert.equal(blockedMarketLaunchKit.status, 401);

	    const blockedLaunchProofLedgerPage = await fetch(`${BASE_URL}/launch/proof-ledger`);
	    assert.equal(blockedLaunchProofLedgerPage.status, 401);

	    const blockedLaunchProofLedger = await fetch(`${BASE_URL}/api/v1/launch/proof-ledger`);
	    assert.equal(blockedLaunchProofLedger.status, 401);

	    const blockedLaunchProofHandoffPage = await fetch(`${BASE_URL}/launch/proof-handoff`);
	    assert.equal(blockedLaunchProofHandoffPage.status, 401);

	    const blockedLaunchProofHandoff = await fetch(`${BASE_URL}/api/v1/launch/proof-handoff`);
	    assert.equal(blockedLaunchProofHandoff.status, 401);

	    const blockedLaunchInstallQueuePage = await fetch(`${BASE_URL}/launch/install-queue`);
	    assert.equal(blockedLaunchInstallQueuePage.status, 401);

	    const blockedLaunchInstallWorkbenchPage = await fetch(`${BASE_URL}/launch/install-queue/beta_00000000/workbench`);
	    assert.equal(blockedLaunchInstallWorkbenchPage.status, 401);

    const blockedLaunchInstallQueue = await fetch(`${BASE_URL}/api/v1/launch/install-queue`);
    assert.equal(blockedLaunchInstallQueue.status, 401);

    const blockedBetaInstallWorkbench = await fetch(`${BASE_URL}/api/v1/beta-clients/beta_00000000/install-workbench`);
    assert.equal(blockedBetaInstallWorkbench.status, 401);

    const blockedActivationRunbook = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/runbook`);
    assert.equal(blockedActivationRunbook.status, 401);

    const blockedActivationClosePacket = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/close-packet`);
    assert.equal(blockedActivationClosePacket.status, 401);

    const blockedActivationClosePacketSend = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/close-packet/send`, { method: "POST" });
    assert.equal(blockedActivationClosePacketSend.status, 401);

	    const blockedActivationConfirmationNudge = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/confirmation-nudge`);
	    assert.equal(blockedActivationConfirmationNudge.status, 401);

	    const blockedActivationConfirmationWorkbenchPage = await fetch(`${BASE_URL}/activation/prospects/lead_000/confirmation-workbench`);
	    assert.equal(blockedActivationConfirmationWorkbenchPage.status, 401);

		    const blockedActivationConfirmationWorkbench = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/confirmation-workbench`);
		    assert.equal(blockedActivationConfirmationWorkbench.status, 401);

		    const blockedActivationConfirmationReplyPage = await fetch(`${BASE_URL}/activation/prospects/lead_000/confirmation-reply`);
		    assert.equal(blockedActivationConfirmationReplyPage.status, 401);

		    const blockedActivationConfirmationReplyPreview = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/confirmation-reply-preview`);
		    assert.equal(blockedActivationConfirmationReplyPreview.status, 401);

		    const blockedActivationConfirmationReplyPreviewPost = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/confirmation-reply-preview`, { method: "POST" });
		    assert.equal(blockedActivationConfirmationReplyPreviewPost.status, 401);

		    const blockedActivationStakeholderHandoffPage = await fetch(`${BASE_URL}/activation/prospects/lead_000/stakeholder-handoff`);
		    assert.equal(blockedActivationStakeholderHandoffPage.status, 401);

		    const blockedActivationStakeholderHandoff = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/stakeholder-handoff`);
		    assert.equal(blockedActivationStakeholderHandoff.status, 401);

		    const blockedActivationConfirmationNudgeSend = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/confirmation-nudge/send`, { method: "POST" });
	    assert.equal(blockedActivationConfirmationNudgeSend.status, 401);

    const blockedActivationCloseWorkflow = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/close-workflow`, { method: "POST" });
    assert.equal(blockedActivationCloseWorkflow.status, 401);

    const blockedActivationKickoff = await fetch(`${BASE_URL}/api/v1/activation/prospects/lead_000/kickoff`, { method: "POST" });
    assert.equal(blockedActivationKickoff.status, 401);

    const blockedOutreachPage = await fetch(`${BASE_URL}/outreach`);
    assert.equal(blockedOutreachPage.status, 401);

    const blockedOutreachSummary = await fetch(`${BASE_URL}/api/v1/outreach/first-five`);
    assert.equal(blockedOutreachSummary.status, 401);

    const blockedProofPage = await fetch(`${BASE_URL}/proof`);
    assert.equal(blockedProofPage.status, 401);

    const blockedProofSummary = await fetch(`${BASE_URL}/api/v1/proof/summary`);
    assert.equal(blockedProofSummary.status, 401);

    const blockedProofLiveGate = await fetch(`${BASE_URL}/api/v1/proof/live-gate`);
    assert.equal(blockedProofLiveGate.status, 401);

    const blockedReadinessPage = await fetch(`${BASE_URL}/readiness`);
    assert.equal(blockedReadinessPage.status, 401);

    const blockedReadinessSummary = await fetch(`${BASE_URL}/api/v1/readiness/summary`);
    assert.equal(blockedReadinessSummary.status, 401);

    const blockedTrustPage = await fetch(`${BASE_URL}/trust`);
    assert.equal(blockedTrustPage.status, 401);

    const blockedTrustPacket = await fetch(`${BASE_URL}/api/v1/trust/packet`);
    assert.equal(blockedTrustPacket.status, 401);

    const blockedTrustHardening = await fetch(`${BASE_URL}/api/v1/trust/hardening`);
    assert.equal(blockedTrustHardening.status, 401);

    const blockedTenantExport = await fetch(`${BASE_URL}/api/v1/trust/tenant-data/export?domain=blocked.test`);
    assert.equal(blockedTenantExport.status, 401);

    const blockedTenantDelete = await fetch(`${BASE_URL}/api/v1/trust/tenant-data/delete`, { method: "POST" });
    assert.equal(blockedTenantDelete.status, 401);

    const blockedDemoScenarios = await fetch(`${BASE_URL}/api/v1/demo-scenarios`);
    assert.equal(blockedDemoScenarios.status, 401);

    const blockedDemoScenarioSeed = await fetch(`${BASE_URL}/api/v1/demo-scenarios/mid-market/seed`, { method: "POST" });
    assert.equal(blockedDemoScenarioSeed.status, 401);

    const blockedDemoScenarioClear = await fetch(`${BASE_URL}/api/v1/demo-scenarios/mid-market/clear`, { method: "POST" });
    assert.equal(blockedDemoScenarioClear.status, 401);

    const blockedEnrichment = await fetch(`${BASE_URL}/api/v1/enrichment/summary`);
    assert.equal(blockedEnrichment.status, 401);

    const blockedBuildPlan = await fetch(`${BASE_URL}/api/v1/enrichment/build-plan`);
    assert.equal(blockedBuildPlan.status, 401);

    const blockedPreflight = await fetch(`${BASE_URL}/api/v1/enrichment/preflight`, { method: "POST" });
    assert.equal(blockedPreflight.status, 401);

    const blockedPreflightPage = await fetch(`${BASE_URL}/enrichment/preflight`, { method: "POST" });
    assert.equal(blockedPreflightPage.status, 401);

    const blockedMemoryImport = await fetch(`${BASE_URL}/api/v1/enrichment/memory/import`, { method: "POST" });
    assert.equal(blockedMemoryImport.status, 401);

    const blockedBetaClients = await fetch(`${BASE_URL}/api/v1/beta-clients`);
    assert.equal(blockedBetaClients.status, 401);

    const blockedLaunch = await fetch(`${BASE_URL}/launch`);
    assert.equal(blockedLaunch.status, 401);

    const blockedLaunchSummary = await fetch(`${BASE_URL}/api/v1/launch/first-beta`);
    assert.equal(blockedLaunchSummary.status, 401);

    const blockedLaunchPacketSend = await fetch(`${BASE_URL}/api/v1/beta-clients/beta_00000000/launch-packet/send`, { method: "POST" });
    assert.equal(blockedLaunchPacketSend.status, 401);

    const blockedStateExport = await fetch(`${BASE_URL}/api/v1/admin/state/export`);
    assert.equal(blockedStateExport.status, 401);

    const blockedStateValidate = await fetch(`${BASE_URL}/api/v1/admin/state/validate`, { method: "POST" });
    assert.equal(blockedStateValidate.status, 401);

    const blockedStateRestore = await fetch(`${BASE_URL}/api/v1/admin/state/restore`, { method: "POST" });
    assert.equal(blockedStateRestore.status, 401);

    const blockedBetaReadiness = await fetch(`${BASE_URL}/api/v1/admin/beta-readiness`);
    assert.equal(blockedBetaReadiness.status, 401);

    const blockedLlmReadiness = await fetch(`${BASE_URL}/api/v1/admin/llm/readiness`);
    assert.equal(blockedLlmReadiness.status, 401);

    const blockedLlmTest = await fetch(`${BASE_URL}/api/v1/admin/llm/test`, { method: "POST" });
    assert.equal(blockedLlmTest.status, 401);

    const blockedEnrichmentReview = await fetch(`${BASE_URL}/api/v1/leads/lead_000/enrichment-review`, { method: "POST" });
    assert.equal(blockedEnrichmentReview.status, 401);

    const blockedHubSpotQueue = await fetch(`${BASE_URL}/api/v1/hubspot/sync-queue`);
    assert.equal(blockedHubSpotQueue.status, 401);

    const blockedHubSpotQueueRun = await fetch(`${BASE_URL}/api/v1/hubspot/sync-queue/run`, { method: "POST" });
    assert.equal(blockedHubSpotQueueRun.status, 401);

    const blockedRepAlerts = await fetch(`${BASE_URL}/api/v1/rep-alerts`);
    assert.equal(blockedRepAlerts.status, 401);

    const blockedRepAlertsSendQueued = await fetch(`${BASE_URL}/api/v1/rep-alerts/send-queued`, { method: "POST" });
    assert.equal(blockedRepAlertsSendQueued.status, 401);

    const blockedCrmDeliveries = await fetch(`${BASE_URL}/api/v1/crm-deliveries`);
    assert.equal(blockedCrmDeliveries.status, 401);

    const blockedCrmDeliveriesSendQueued = await fetch(`${BASE_URL}/api/v1/crm-deliveries/send-queued`, { method: "POST" });
    assert.equal(blockedCrmDeliveriesSendQueued.status, 401);

    const blockedHubSpotPreview = await fetch(`${BASE_URL}/api/v1/leads/lead_000/hubspot-preview`);
    assert.equal(blockedHubSpotPreview.status, 401);

    const blockedRepBrief = await fetch(`${BASE_URL}/api/v1/leads/lead_000/rep-brief`);
    assert.equal(blockedRepBrief.status, 401);

    const blockedProviderlessEvidencePage = await fetch(`${BASE_URL}/crm/lead_000/providerless-evidence`);
    assert.equal(blockedProviderlessEvidencePage.status, 401);

    const blockedProviderlessEvidence = await fetch(`${BASE_URL}/api/v1/leads/lead_000/providerless-evidence`);
    assert.equal(blockedProviderlessEvidence.status, 401);

    const blockedRepFeedback = await fetch(`${BASE_URL}/api/v1/leads/lead_000/rep-feedback`, { method: "POST" });
    assert.equal(blockedRepFeedback.status, 401);

    const publicConfig = await getJson("/api/v1/widgets/wid_deal_threads_demo/config");
    assert.equal(publicConfig.widgetId, "wid_deal_threads_demo");

    const invalidJson = await fetch(`${BASE_URL}/api/v1/widget-sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{"
    });
    assert.equal(invalidJson.status, 400);
    const invalidJsonPayload = await invalidJson.json();
    assert.equal(invalidJsonPayload.error, "invalid_json");

    const largeBody = await fetch(`${BASE_URL}/api/v1/widget-sessions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "x".repeat(health.hardening.maxRequestBodyBytes + 1)
    });
    assert.equal(largeBody.status, 413);
    const largeBodyPayload = await largeBody.json();
    assert.equal(largeBodyPayload.error, "payload_too_large");

    const disallowedWidgetSession = await fetch(`${BASE_URL}/api/v1/widget-sessions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://evil.example"
      },
      body: JSON.stringify({
        tenantId: "ten_deal_threads_demo",
        widgetId: "wid_deal_threads_demo",
        pageUrl: BASE_URL
      })
    });
    assert.equal(disallowedWidgetSession.status, 403);
    const disallowedWidgetSessionPayload = await disallowedWidgetSession.json();
    assert.equal(disallowedWidgetSessionPayload.error, "origin_not_allowed");

    const opaqueOriginConfig = await fetch(`${BASE_URL}/api/v1/widgets/wid_deal_threads_demo/config?pageUrl=${encodeURIComponent(BASE_URL)}`, {
      headers: { origin: "null" }
    });
    assert.equal(opaqueOriginConfig.status, 200);
    const opaqueOriginConfigPayload = await opaqueOriginConfig.json();
    assert.equal(opaqueOriginConfigPayload.widgetId, "wid_deal_threads_demo");

    const llmReadiness = await getProtectedJson("/api/v1/admin/llm/readiness");
    assert.equal(llmReadiness.mode, "heuristic");
    assert.equal(llmReadiness.api_key_configured, false);
    assert.equal(llmReadiness.live_request_available, false);
    assert.equal(llmReadiness.mutates_state, false);

    const emptyReadiness = await getProtectedJson("/api/v1/admin/beta-readiness");
    assert.equal(emptyReadiness.status, "blocked");
    assert.ok(emptyReadiness.summary.blocker >= 2);
    assert.ok(emptyReadiness.checks.some((check) => check.key === "beta_clients" && check.status === "blocker"));
    assert.ok(emptyReadiness.checks.some((check) => check.key === "test_leads" && check.status === "blocker"));
    assert.ok(emptyReadiness.checks.some((check) => check.key === "state_backup" && check.status === "pass"));

    const leadsBeforeLlmProbe = await getProtectedJson("/api/v1/leads");
    assert.equal(leadsBeforeLlmProbe.count, 0);
    const llmProbe = await postProtectedJson("/api/v1/admin/llm/test", {
      message:
        "My name is Mira Stone. I am evaluating this for LLMReady, a 160-person SaaS company using HubSpot. Demo requests are going cold because reps research manually. We want demo routing fixed this quarter and likely have $30K-$50K annually. I own the decision. mira@llmready.test"
    });
	    assert.equal(llmProbe.test_status, "heuristic_only");
	    assert.equal(llmProbe.live_request_attempted, false);
	    assert.equal(llmProbe.stores_test_leads, false);
	    assert.equal(llmProbe.extracted_profile.visitor.email, "mira@llmready.test");
	    assert.equal(llmProbe.extracted_profile.company.domain, "llmready.test");
	    assert.equal(llmProbe.extracted_profile.qualification.timeline, "this_quarter");
	    assert.equal(llmProbe.extracted_profile.qualification.budget_range, "30k_60k");
	    const leadsAfterLlmProbe = await getProtectedJson("/api/v1/leads");
	    assert.equal(leadsAfterLlmProbe.count, 0);

    const check = await getProtectedJson("/api/v1/hubspot/properties");
    assert.equal(check.mode, "stubbed");
    assert.equal(check.summary.required, 26);
    assert.equal(check.summary.missing, 26);
    assert.equal(check.properties[0].action, "would_check");

    const setup = await postProtectedJson("/api/v1/hubspot/properties/setup", {});
    assert.equal(setup.mode, "stubbed");
    assert.equal(setup.properties[0].action, "would_create");

    const configResponse = await postProtectedForm("/admin/widget", {
      tenantName: "Regression Revenue OS",
      allowedDomains: "localhost, 127.0.0.1",
      launcherText: "Start qualification",
      welcomeMessage: "Regression welcome message.",
      quickReplies: "Improve demo routing, Fix lead quality",
      requiredFields: "email, business_need, timeline, company_name_or_domain",
      primaryColor: "#0f766e",
      consentDisclosure: "Regression consent disclosure."
    });
    assert.equal(configResponse.status, 303);

    const config = await getJson("/api/v1/widgets/wid_deal_threads_demo/config");
    assert.equal(config.conversation.launcherText, "Start qualification");
    assert.equal(config.conversation.welcomeMessage, "Regression welcome message.");
    assert.equal(config.version, 2);

    await postProtectedForm("/admin/routing", {
      highPriorityOwner: "regression-ae@example.com",
      mediumPriorityOwner: "regression-sdr@example.com",
      customerSuccessOwner: "regression-cs@example.com",
      highPriorityQueue: "regression_high_priority",
      mediumPriorityQueue: "regression_medium_priority",
      lowPriorityQueue: "regression_low_priority",
      highPriorityAction: "Regression high-priority action.",
      mediumPriorityAction: "Regression medium-priority action.",
      lowPriorityAction: "Regression low-priority action."
    });

    const betaClient = await postProtectedJson("/api/v1/beta-clients", {
      name: "PilotCo Revenue Team",
      websiteUrl: "https://pilotco.test",
      ownerEmail: "pilot-owner@example.com",
      crm: "hubspot",
      status: "setup",
      notes: "Regression pilot client.",
      crmDestinationName: "PilotCo CRM webhook",
      crmDeliveryWebhookUrl: "https://hooks.example.test/deal-threads",
      crmDeliveryOwner: "revops@example.com",
      launcherText: "Ask PilotCo",
      welcomeMessage: "PilotCo custom welcome.",
      quickReplies: "Fix handoffs, Improve speed-to-lead",
      requiredFields: "email, business_need, timeline, company_name_or_domain, crm",
      questions: [
        {
          key: "business_need",
          label: "Pilot pain",
          prompt: "What revenue handoff is PilotCo trying to improve?",
          quickReplies: ["Fix handoffs", "Improve speed-to-lead"],
          required: true
        },
        { key: "company_name_or_domain", label: "Company", prompt: "Which company should we build this profile for?", required: true },
        {
          key: "authority",
          label: "Buying owner",
          prompt: "Who owns the buying decision at PilotCo?",
          quickReplies: ["I own the decision", "I influence the decision", "Researching for the team"],
          required: false
        },
        { key: "timeline", label: "Pilot timeline", prompt: "When does PilotCo want this fixed?", required: true },
        { key: "budget", label: "Budget", prompt: "Is budget already approved for this pilot?", required: false },
        { key: "crm", label: "CRM", prompt: "Which CRM should the rep handoff reference?", required: false },
        { key: "email", label: "Work email", prompt: "What work email should the rep use?", required: true },
        { key: "name", label: "Name", prompt: "What name should the rep use?", required: false }
      ],
      primaryColor: "#1d4ed8",
      highPriorityOwner: "pilot-ae@example.com",
      highPriorityAction: "PilotCo high-priority call within 10 minutes.",
      reportRecipients: "pilot-owner@example.com, revops@example.com",
      reportCadence: "weekly",
      reportPeriodDays: "14",
      nextReportDueAt: "2020-01-01T00:00:00.000Z",
      baselineFirstTouchMinutes: "120",
      baselineMeetingRate: "12",
      baselineOpportunityRate: "5",
      baselineWinRate: "18",
      baselineCycleDays: "45",
      minimumProofLeads: "1",
      targetFirstTouchMinutes: "15",
      targetMeetingRateLiftPoints: "5",
      targetOpportunityRateLiftPoints: "3",
      proofNotes: "Old contact-form baseline from pre-beta CRM report."
    });
    assert.equal(betaClient.name, "PilotCo Revenue Team");
	    assert.equal(betaClient.domain, "pilotco.test");
			    assert.match(betaClient.handoff_token, /^inst_[a-f0-9]+$/);
			    assert.match(betaClient.public_install_url, /\/install\/inst_[a-f0-9]+$/);
			    assert.match(betaClient.public_test_install_url, /\/install\/inst_[a-f0-9]+\/test$/);
			    assert.match(betaClient.public_install_status_url, /\/install\/inst_[a-f0-9]+\/status$/);
			    assert.match(betaClient.public_feedback_url, /\/feedback\/inst_[a-f0-9]+$/);
			    assert.match(betaClient.public_crm_export_url, /\/handoff\/inst_[a-f0-9]+\/crm-export\.csv$/);
			    assert.match(betaClient.public_crm_export_markdown_url, /\/handoff\/inst_[a-f0-9]+\/crm-export\.md$/);
			    assert.match(betaClient.public_crm_export_json_url, /\/handoff\/inst_[a-f0-9]+\/crm-export\.json$/);
			    assert.match(betaClient.public_beta_proof_url, /\/handoff\/inst_[a-f0-9]+\/proof\?days=14$/);
	    assert.equal(betaClient.status, "setup");
    assert.equal(betaClient.widget_config.launcherText, "Ask PilotCo");
    assert.equal(betaClient.widget_config.quickReplies[0], "Fix handoffs");
    assert.equal(betaClient.widget_config.questions.find((question) => question.key === "authority").prompt, "Who owns the buying decision at PilotCo?");
    assert.equal(betaClient.routing_overrides.highPriorityOwner, "pilot-ae@example.com");
    assert.equal(betaClient.crm_delivery.enabled, true);
    assert.equal(betaClient.crm_delivery.destination_name, "PilotCo CRM webhook");
    assert.equal(betaClient.crm_delivery.webhook_url, "https://hooks.example.test/deal-threads");
    assert.equal(betaClient.crm_delivery.owner_email, "revops@example.com");
    assert.equal(betaClient.crm_delivery.test_delivery.status, "not_sent");
    assert.deepEqual(betaClient.report_settings.recipients, ["pilot-owner@example.com", "revops@example.com"]);
    assert.equal(betaClient.report_settings.cadence, "weekly");
    assert.equal(betaClient.report_settings.period_days, 14);
    assert.equal(betaClient.report_settings.next_due_at, "2020-01-01T00:00:00.000Z");
    assert.equal(betaClient.measurement_settings.baseline_minutes_to_first_contact, 120);
    assert.equal(betaClient.measurement_settings.baseline_meeting_rate, 0.12);
    assert.equal(betaClient.measurement_settings.baseline_opportunity_rate, 0.05);
    assert.equal(betaClient.measurement_settings.baseline_win_rate, 0.18);
    assert.equal(betaClient.measurement_settings.minimum_proof_leads, 1);
    assert.equal(betaClient.effective_widget_config.conversation.welcomeMessage, "PilotCo custom welcome.");
    assert.match(betaClient.install_snippet, /data-beta-client-id="beta_[a-f0-9]+"/);
    assert.equal(betaClient.progress.completed, 2);
    assert.equal(betaClient.readiness.status, "needs_attention");
	    assert.equal(betaClient.readiness.ready_to_send_snippet, true);
		    assert.equal(betaClient.readiness.ready_for_live_beta, false);
		    assert.ok(betaClient.readiness.checks.some((check) => check.key === "launch_packet" && check.status === "warning"));
		    assert.ok(betaClient.readiness.checks.some((check) => check.key === "crm_delivery_test" && check.status === "warning"));

		    const installQueueInitial = await getProtectedJson("/api/v1/launch/install-queue");
		    assert.equal(installQueueInitial.type, "deal_threads.launch_install_queue.v1");
		    assert.equal(installQueueInitial.safety.mutates_buyer_state_on_get, false);
		    assert.equal(installQueueInitial.safety.sends_external_email_on_get, false);
		    assert.equal(installQueueInitial.safety.creates_beta_client_on_get, false);
		    assert.equal(installQueueInitial.safety.transmits_external_crm_on_get, false);
		    assert.equal(installQueueInitial.summary.real_beta_clients, 1);
		    assert.equal(installQueueInitial.summary.send_launch_packet, 1);
		    const installQueueInitialItem = installQueueInitial.queue.find((item) => item.beta_client_id === betaClient.id);
		    assert.ok(installQueueInitialItem);
		    assert.equal(installQueueInitialItem.status, "send_launch_packet");
		    assert.match(installQueueInitialItem.next_action, /launch packet/i);
		    assert.match(installQueueInitialItem.public_links.install_handoff, /\/install\/inst_[a-f0-9]+$/);
		    assert.match(installQueueInitialItem.public_links.manual_crm_export_json, /\/handoff\/inst_[a-f0-9]+\/crm-export\.json$/);
		    assert.match(installQueueInitialItem.protected_links.install_workbench, new RegExp(`/launch/install-queue/${betaClient.id}/workbench$`));
		    assert.match(installQueueInitialItem.protected_links.install_workbench_markdown, new RegExp(`/api/v1/beta-clients/${betaClient.id}/install-workbench\\?format=markdown$`));
		    assert.match(installQueueInitialItem.protected_links.launch_wizard, new RegExp(`/launch\\?client=${betaClient.id}#launch-wizard$`));
		    assert.equal(installQueueInitialItem.proof_preflight.status, "blocked");
		    assert.equal(installQueueInitialItem.proof_preflight.ready_for_first_proof_packet, false);
		    assert.equal(installQueueInitialItem.proof_preflight.ready_for_live_proof_claim, false);
		    assert.ok(installQueueInitialItem.proof_preflight.checks.some((check) => check.key === "client_domain_config_load" && check.status === "blocker"));
		    assert.ok(installQueueInitialItem.proof_preflight.market_gate_effect.some((effect) => effect.key === "live_proof_gate" && effect.status === "still_blocked"));
		    const installWorkbenchInitial = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/install-workbench`);
		    assert.equal(installWorkbenchInitial.type, "deal_threads.beta_client_install_workbench.v1");
		    assert.equal(installWorkbenchInitial.beta_client_id, betaClient.id);
		    assert.equal(installWorkbenchInitial.status, "send_launch_packet");
		    assert.equal(installWorkbenchInitial.summary.readiness_status, "needs_attention");
		    assert.equal(installWorkbenchInitial.summary.launch_packet_status, "not_sent");
		    assert.equal(installWorkbenchInitial.summary.install_handoff_status, "not_submitted");
		    assert.equal(installWorkbenchInitial.summary.client_domain_config_loads, 0);
			    assert.equal(installWorkbenchInitial.summary.beta_profiles, 0);
			    assert.equal(installWorkbenchInitial.summary.mailto_drafts, Object.keys(installWorkbenchInitial.copy_blocks).length);
			    assert.equal(installWorkbenchInitial.summary.manual_sent_records, 0);
			    assert.equal(installWorkbenchInitial.summary.paid_lookups_recommended_now, 0);
		    assert.equal(installWorkbenchInitial.safety.sends_external_email_on_get, false);
		    assert.equal(installWorkbenchInitial.safety.mutates_buyer_state_on_get, false);
		    assert.equal(installWorkbenchInitial.safety.creates_beta_client_on_get, false);
		    assert.equal(installWorkbenchInitial.safety.transmits_external_crm_on_get, false);
		    assert.equal(installWorkbenchInitial.safety.paid_provider_lookup_by_default, false);
		    assert.equal(installWorkbenchInitial.safety.live_proof_claimed, false);
			    assert.match(installWorkbenchInitial.public_links.install_handoff, /\/install\/inst_[a-f0-9]+$/);
			    assert.match(installWorkbenchInitial.public_links.manual_crm_export_json, /\/handoff\/inst_[a-f0-9]+\/crm-export\.json$/);
			    assert.match(installWorkbenchInitial.protected_links.install_workbench, new RegExp(`/launch/install-queue/${betaClient.id}/workbench$`));
			    assert.ok(Object.values(installWorkbenchInitial.copy_blocks).every((block) => block.mailto_url?.startsWith("mailto:")));
			    assert.ok(Object.values(installWorkbenchInitial.copy_blocks).every((block) => block.manual_sent_action?.method === "POST"));
			    assert.ok(Object.values(installWorkbenchInitial.copy_blocks).every((block) => block.manual_sent_action?.sends_from_server === false));
			    assert.ok(Object.values(installWorkbenchInitial.copy_blocks).every((block) => block.manual_sent_action?.preview_only_on_get === true));
			    assert.match(installWorkbenchInitial.copy_blocks.implementation_owner_note.manual_sent_action.api_url, new RegExp(`/api/v1/beta-clients/${betaClient.id}/install-workbench/implementation_owner_note/sent$`));
			    assert.match(installWorkbenchInitial.copy_blocks.implementation_owner_note.manual_sent_action.html_action, new RegExp(`/launch/install-queue/${betaClient.id}/workbench/implementation_owner_note/mark-sent$`));
			    assert.match(installWorkbenchInitial.copy_blocks.implementation_owner_note.body, /Script tag:/);
			    assert.match(installWorkbenchInitial.copy_blocks.implementation_owner_note.body, new RegExp(`data-beta-client-id="${betaClient.id}"`));
			    assert.match(installWorkbenchInitial.copy_blocks.crm_owner_note.body, /Manual CRM export CSV/);
			    assert.match(installWorkbenchInitial.copy_blocks.rep_feedback_note.body, /Feedback room/);
		    assert.ok(installWorkbenchInitial.proof_preflight.checks.some((check) => check.key === "client_domain_config_load" && check.status === "blocker"));
		    assert.ok(installWorkbenchInitial.public_status.steps.some((step) => step.key === "client_domain_config_load"));
			    const installWorkbenchMarkdown = await getProtectedText(`/api/v1/beta-clients/${betaClient.id}/install-workbench?format=markdown`);
			    assert.match(installWorkbenchMarkdown, /# Deal Threads Install Proof Workbench - PilotCo Revenue Team/);
			    assert.match(installWorkbenchMarkdown, /## Copy Blocks/);
			    assert.match(installWorkbenchMarkdown, /Mailto draft: mailto:/);
			    assert.match(installWorkbenchMarkdown, new RegExp(`Manual sent POST: .*\\/api\\/v1\\/beta-clients\\/${betaClient.id}\\/install-workbench\\/implementation_owner_note\\/sent`));
			    assert.match(installWorkbenchMarkdown, /Manual sent records: 0/);
			    assert.match(installWorkbenchMarkdown, /GET sends external email: no/);
			    assert.match(installWorkbenchMarkdown, /Paid lookup by default: no/);
			    assert.match(installWorkbenchMarkdown, /Manual record requires POST: yes/);
			    const installWorkbenchPageInitial = await getProtectedText(`/launch/install-queue/${betaClient.id}/workbench`);
			    assert.match(installWorkbenchPageInitial, /Install proof workbench/);
			    assert.match(installWorkbenchPageInitial, /Buyer-safe copy blocks/);
			    assert.match(installWorkbenchPageInitial, /Open email draft/);
			    assert.match(installWorkbenchPageInitial, /Mark manual install note sent/);
			    assert.match(installWorkbenchPageInitial, /Proof preflight/);
			    assert.match(installWorkbenchPageInitial, /No email, CRM delivery, buyer-state mutation, beta-client creation, live-proof claim, or paid enrichment runs on GET/i);
			    const installWorkbenchMarkedSent = await postProtectedJson(`/api/v1/beta-clients/${betaClient.id}/install-workbench/implementation_owner_note/sent`, {
			      recipients: "pilot-owner@example.com",
			      note: "Sent manually during regression."
			    });
			    assert.equal(installWorkbenchMarkedSent.type, "deal_threads.beta_client_install_workbench_sent.v1");
			    assert.equal(installWorkbenchMarkedSent.marked_sent, true);
			    assert.equal(installWorkbenchMarkedSent.manual_handoff.sends_from_server, false);
			    assert.equal(installWorkbenchMarkedSent.safety.transmits_external_crm, false);
			    assert.equal(installWorkbenchMarkedSent.delivery.recipients[0], "pilot-owner@example.com");
			    const installWorkbenchAfterMarkedSent = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/install-workbench`);
			    assert.equal(installWorkbenchAfterMarkedSent.summary.manual_sent_records, 1);
			    assert.equal(installWorkbenchAfterMarkedSent.copy_blocks.implementation_owner_note.delivery_audit.manual_sent_records, 1);
			    const installQueueInitialMarkdown = await getProtectedText("/api/v1/launch/install-queue?format=markdown");
		    assert.match(installQueueInitialMarkdown, /# Deal Threads Install Follow-Up Queue/);
		    assert.match(installQueueInitialMarkdown, /PilotCo Revenue Team/);
		    assert.match(installQueueInitialMarkdown, /Install workbench:/);
		    assert.match(installQueueInitialMarkdown, /Proof preflight: blocked/);
		    assert.match(installQueueInitialMarkdown, /Ready for first proof packet: no/);
		    assert.match(installQueueInitialMarkdown, /GET sends external email: no/);
		    const installQueuePageInitial = await getProtectedText("/launch/install-queue");
		    assert.match(installQueuePageInitial, /Install follow-up queue/);
		    assert.match(installQueuePageInitial, /Proof preflight/);
		    assert.match(installQueuePageInitial, /Per-client proof readiness/);
		    assert.match(installQueuePageInitial, /PilotCo Revenue Team/);
		    assert.match(installQueuePageInitial, /Send launch packet/);
		    assert.match(installQueuePageInitial, /no email sends, buyer-state mutation, beta-client creation, CRM transmission, live-proof claims, or paid enrichment runs/i);

		    const repFeedbackInitial = await getProtectedJson("/api/v1/launch/rep-feedback");
		    assert.equal(repFeedbackInitial.type, "deal_threads.launch_rep_feedback_command.v1");
		    assert.equal(repFeedbackInitial.status, "waiting_for_profiles");
		    assert.equal(repFeedbackInitial.summary.real_beta_clients, 1);
		    assert.equal(repFeedbackInitial.summary.beta_profiles, 0);
		    assert.equal(repFeedbackInitial.summary.pending_profiles, 0);
		    assert.equal(repFeedbackInitial.summary.paid_lookups_recommended_now, 0);
		    assert.equal(repFeedbackInitial.safety.read_only_get, true);
		    assert.equal(repFeedbackInitial.safety.sends_external_email_on_get, false);
		    assert.equal(repFeedbackInitial.safety.creates_profile_on_get, false);
		    assert.equal(repFeedbackInitial.safety.creates_beta_client_on_get, false);
		    assert.equal(repFeedbackInitial.safety.queues_crm_delivery_on_get, false);
		    assert.equal(repFeedbackInitial.safety.transmits_external_crm_on_get, false);
		    assert.equal(repFeedbackInitial.safety.updates_rep_feedback_on_get, false);
		    assert.equal(repFeedbackInitial.safety.paid_provider_lookup_by_default, false);
		    assert.equal(repFeedbackInitial.safety.live_proof_claimed, false);
		    assert.equal(repFeedbackInitial.clients[0].beta_client_id, betaClient.id);
		    assert.equal(repFeedbackInitial.clients[0].status, "waiting_for_profiles");
		    assert.match(repFeedbackInitial.clients[0].public_links.feedback_room, new RegExp(`/feedback/${betaClient.handoff_token}$`));
		    assert.match(repFeedbackInitial.copy_blocks.primary_rep_ask.body, /first beta buyer profile/i);
		    assert.match(repFeedbackInitial.copy_blocks.primary_rep_ask.mailto_url, /^mailto:/);
		    const repFeedbackInitialPage = await getProtectedText("/launch/rep-feedback");
		    assert.match(repFeedbackInitialPage, /Rep feedback command room/);
		    assert.match(repFeedbackInitialPage, /Copy-ready rep ask/);
		    assert.match(repFeedbackInitialPage, /Public feedback rooms/);
		    assert.match(repFeedbackInitialPage, /GET is read-only/);
		    const repFeedbackInitialMarkdown = await getProtectedText("/api/v1/launch/rep-feedback?format=markdown");
		    assert.match(repFeedbackInitialMarkdown, /# Deal Threads Rep Feedback Command/);
		    assert.match(repFeedbackInitialMarkdown, /Paid lookups recommended now: 0/);
		    assert.match(repFeedbackInitialMarkdown, /GET updates rep feedback: no/);

		    const launchOpsInitial = await getProtectedJson("/api/v1/launch/ops");
		    assert.equal(launchOpsInitial.type, "deal_threads.launch_ops.v1");
		    assert.equal(launchOpsInitial.safety.mutates_buyer_state_on_get, false);
		    assert.equal(launchOpsInitial.safety.sends_external_email_on_get, false);
		    assert.equal(launchOpsInitial.safety.creates_beta_client_on_get, false);
		    assert.equal(launchOpsInitial.safety.transmits_external_crm_on_get, false);
		    assert.equal(launchOpsInitial.summary.real_beta_clients, 1);
		    assert.equal(launchOpsInitial.summary.install_queue_items, 1);
		    assert.equal(launchOpsInitial.focus.title, "PilotCo Revenue Team");
		    assert.ok(launchOpsInitial.stages.some((stage) => stage.key === "install"));
		    const launchOpsInitialMarkdown = await getProtectedText("/api/v1/launch/ops?format=markdown");
		    assert.match(launchOpsInitialMarkdown, /# Deal Threads Launch Operations/);
		    assert.match(launchOpsInitialMarkdown, /PilotCo Revenue Team/);
		    assert.match(launchOpsInitialMarkdown, /GET sends external email: no/);
		    const launchOpsPageInitial = await getProtectedText("/launch/ops");
		    assert.match(launchOpsPageInitial, /Launch operations/);
		    assert.match(launchOpsPageInitial, /Today's focus/);
		    assert.match(launchOpsPageInitial, /First-five board/);
		    assert.match(launchOpsPageInitial, /Market gate/);
		    assert.match(launchOpsPageInitial, /No email, CRM transmission, buyer-state mutation, beta-client creation, live-proof claim, or paid enrichment runs on GET/i);

		    const firstFiveBoardInitial = await getProtectedJson("/api/v1/launch/first-five-board");
		    assert.equal(firstFiveBoardInitial.type, "deal_threads.first_five_beta_board.v1");
		    assert.equal(firstFiveBoardInitial.summary.target_client_count, firstFiveBoardInitial.slots.length);
		    assert.equal(firstFiveBoardInitial.summary.real_beta_clients, 1);
		    assert.equal(firstFiveBoardInitial.summary.paid_lookups_recommended_now, 0);
		    assert.equal(firstFiveBoardInitial.providerless_guardrail.paid_lookup_allowed_by_default, false);
		    assert.equal(firstFiveBoardInitial.providerless_guardrail.manual_approval_required, true);
		    assert.equal(firstFiveBoardInitial.providerless_guardrail.recommended_paid_lookups_now, 0);
		    assert.equal(firstFiveBoardInitial.safety.read_only_get, true);
		    assert.equal(firstFiveBoardInitial.safety.sends_external_email_on_get, false);
		    assert.equal(firstFiveBoardInitial.safety.creates_beta_client_on_get, false);
		    assert.equal(firstFiveBoardInitial.safety.marks_buyer_confirmation_complete_on_get, false);
		    assert.equal(firstFiveBoardInitial.safety.transmits_external_crm_on_get, false);
		    assert.equal(firstFiveBoardInitial.safety.paid_provider_lookup_by_default, false);
		    assert.equal(firstFiveBoardInitial.safety.bulk_send_on_get, false);
		    assert.equal(firstFiveBoardInitial.safety.live_proof_claimed, false);
		    const firstFiveClientSlot = firstFiveBoardInitial.slots.find((slot) => slot.kind === "real_beta_client");
		    assert.ok(firstFiveClientSlot, "Expected first-five board to include real beta client slot");
		    assert.equal(firstFiveClientSlot.name, "PilotCo Revenue Team");
		    assert.equal(firstFiveClientSlot.proof.beta_profiles, 0);
		    assert.match(firstFiveClientSlot.links.primary, /\/launch\/install-queue\/beta_[a-f0-9-]+\/workbench$/);
		    const firstFiveBoardInitialMarkdown = await getProtectedText("/api/v1/launch/first-five-board?format=markdown");
		    assert.match(firstFiveBoardInitialMarkdown, /# Deal Threads First-Five Beta Board/);
		    assert.match(firstFiveBoardInitialMarkdown, /Providerless Guardrail/);
		    assert.match(firstFiveBoardInitialMarkdown, /Paid lookups recommended now: 0/);
		    assert.match(firstFiveBoardInitialMarkdown, /GET sends external email: no/);
		    const firstFiveBoardPageInitial = await getProtectedText("/launch/first-five-board");
		    assert.match(firstFiveBoardPageInitial, /First-five beta board/);
		    assert.match(firstFiveBoardPageInitial, /Providerless launch guardrail/);
		    assert.match(firstFiveBoardPageInitial, /Slot 1/);
		    assert.match(firstFiveBoardPageInitial, /PilotCo Revenue Team/);
		    assert.match(firstFiveBoardPageInitial, /No email, CRM transmission, buyer-state mutation, beta-client creation, bulk send, live-proof claim, or paid enrichment runs on GET/i);

		    const marketLaunchInitial = await getProtectedJson("/api/v1/launch/market-ready");
		    assert.equal(marketLaunchInitial.type, "deal_threads.market_launch_readiness.v1");
		    assert.equal(marketLaunchInitial.market_ready, false);
		    assert.equal(marketLaunchInitial.safety.mutates_buyer_state_on_get, false);
		    assert.equal(marketLaunchInitial.safety.sends_external_email_on_get, false);
		    assert.equal(marketLaunchInitial.safety.creates_beta_client_on_get, false);
		    assert.equal(marketLaunchInitial.safety.transmits_external_crm_on_get, false);
		    assert.equal(marketLaunchInitial.safety.paid_provider_lookup_by_default, false);
		    assert.equal(marketLaunchInitial.safety.live_proof_claimed, false);
		    assert.equal(marketLaunchInitial.summary.real_beta_clients, 1);
		    assert.equal(marketLaunchInitial.summary.real_beta_leads, 0);
		    assert.equal(marketLaunchInitial.summary.blocker > 0, true);
		    assert.equal(marketLaunchInitial.readiness_estimate.counts.required_code_builds_before_first_beta, 0);
		    assert.equal(marketLaunchInitial.readiness_estimate.counts.paid_enrichment_lookups_needed_now, 0);
		    assert.ok(marketLaunchInitial.readiness_estimate.required_real_world_steps.some((step) => step.key === "client_domain_install"));
		    assert.ok(marketLaunchInitial.readiness_estimate.optional_scale_builds.some((item) => item.key === "native_crm_sync"));
		    assert.match(marketLaunchInitial.founder_timeline.short_answer, /Core build is ready for the first beta/i);
		    assert.match(marketLaunchInitial.founder_timeline.software_left, /0 required code builds/i);
		    assert.equal(marketLaunchInitial.founder_timeline.market_ready.required_real_world_steps, marketLaunchInitial.readiness_estimate.counts.required_real_world_steps);
		    assert.equal(marketLaunchInitial.founder_timeline.safety.read_only_get, true);
		    assert.equal(marketLaunchInitial.founder_timeline.safety.paid_provider_lookup_by_default, false);
		    assert.equal(marketLaunchInitial.launch_clearance_plan.engineering_status.required_code_builds_before_first_beta, 0);
		    assert.equal(marketLaunchInitial.launch_clearance_plan.engineering_status.paid_enrichment_lookups_needed_now, 0);
		    assert.ok(marketLaunchInitial.launch_clearance_plan.workstreams.some((item) => item.key === "buyer_confirmation"));
		    assert.ok(marketLaunchInitial.launch_clearance_plan.workstreams.some((item) => item.key === "client_domain_install"));
		    assert.ok(marketLaunchInitial.launch_clearance_plan.workstreams.some((item) => item.key === "live_proof_gate"));
		    assert.ok(marketLaunchInitial.launch_clearance_plan.do_not_do_yet.some((item) => item.key === "paid_enrichment_provider"));
		    assert.ok(marketLaunchInitial.launch_clearance_plan.definition_of_done.some((item) => /buyer confirmation/i.test(item)));
		    assert.equal(marketLaunchInitial.launch_clearance_plan.safety.read_only_get, true);
		    assert.equal(marketLaunchInitial.launch_clearance_plan.safety.live_proof_claimed, false);
		    assert.match(marketLaunchInitial.readiness_estimate.label, /market readiness is blocked by real buyer proof/i);
		    assert.ok(marketLaunchInitial.gates.some((gate) => gate.key === "client_domain_install" && gate.status === "blocker"));
		    assert.ok(marketLaunchInitial.gates.some((gate) => gate.key === "live_proof_gate" && gate.status === "blocker"));
		    assert.ok(marketLaunchInitial.recommended_actions.some((action) => /zero blockers/i.test(action)));
		    const marketLaunchInitialMarkdown = await getProtectedText("/api/v1/launch/market-ready?format=markdown");
		    assert.match(marketLaunchInitialMarkdown, /# Deal Threads Market Launch Readiness/);
		    assert.match(marketLaunchInitialMarkdown, /Market ready: no/);
		    assert.match(marketLaunchInitialMarkdown, /## Founder Timeline Answer/);
		    assert.match(marketLaunchInitialMarkdown, /Core build is ready for the first beta/i);
		    assert.match(marketLaunchInitialMarkdown, /Software left: 0 required code builds/i);
		    assert.match(marketLaunchInitialMarkdown, /## Readiness Estimate/);
		    assert.match(marketLaunchInitialMarkdown, /## Launch Clearance Plan/);
		    assert.match(marketLaunchInitialMarkdown, /### Can Start Now/);
		    assert.match(marketLaunchInitialMarkdown, /### Waiting On/);
		    assert.match(marketLaunchInitialMarkdown, /### Do Not Build Yet/);
		    assert.match(marketLaunchInitialMarkdown, /Required code builds before first beta: 0/);
		    assert.match(marketLaunchInitialMarkdown, /Paid enrichment lookups needed now: 0/);
		    assert.match(marketLaunchInitialMarkdown, /GET sends external email: no/);
		    const marketLaunchPageInitial = await getProtectedText("/launch/market-ready");
		    assert.match(marketLaunchPageInitial, /Market launch readiness/);
		    assert.match(marketLaunchPageInitial, /Conservative operator gate/);
		    assert.match(marketLaunchPageInitial, /Founder timeline answer/);
		    assert.match(marketLaunchPageInitial, /Core build is ready for the first beta/i);
		    assert.match(marketLaunchPageInitial, /How much is left\?/);
		    assert.match(marketLaunchPageInitial, /Code builds before beta/);
		    assert.match(marketLaunchPageInitial, /Launch clearance plan/);
		    assert.match(marketLaunchPageInitial, /Can start now/);
		    assert.match(marketLaunchPageInitial, /Waiting on/);
		    assert.match(marketLaunchPageInitial, /Do not build yet/);
		    assert.match(marketLaunchPageInitial, /Definition of done/);
		    assert.match(marketLaunchPageInitial, /Remaining proof steps/);
		    assert.match(marketLaunchPageInitial, /Optional scale builds/);
		    assert.match(marketLaunchPageInitial, /Market kit/);
		    assert.match(marketLaunchPageInitial, /Do not invite broad real traffic or claim live proof/i);
		    assert.match(marketLaunchPageInitial, /No email, CRM transmission, buyer-state mutation, beta-client creation, live-proof claim, or paid enrichment runs on GET/i);

		    const marketLaunchKitInitial = await getProtectedJson("/api/v1/launch/market-kit");
		    assert.equal(marketLaunchKitInitial.type, "deal_threads.market_launch_kit.v1");
		    assert.equal(marketLaunchKitInitial.status, "internal_beta_only");
		    assert.equal(marketLaunchKitInitial.launch_posture.market_ready, false);
		    assert.equal(marketLaunchKitInitial.launch_posture.claim_scope, "internal_beta_only");
		    assert.equal(marketLaunchKitInitial.launch_posture.claim_scope_source, "market_launch_kit_inferred");
		    assert.equal(marketLaunchKitInitial.launch_posture.required_code_builds_before_first_beta, 0);
		    assert.equal(marketLaunchKitInitial.launch_posture.paid_enrichment_lookups_needed_now, 0);
		    assert.equal(marketLaunchKitInitial.claim_scope_review.type, "deal_threads.market_launch_kit_claim_scope_review.v1");
		    assert.equal(marketLaunchKitInitial.claim_scope_review.claim_scope, "internal_beta_only");
		    assert.equal(marketLaunchKitInitial.claim_scope_review.internal_beta_only, true);
		    assert.equal(marketLaunchKitInitial.claim_scope_review.safety.claims_market_ready_on_get, false);
		    assert.equal(marketLaunchKitInitial.claim_scope_review.safety.live_proof_claimed, false);
		    assert.equal(marketLaunchKitInitial.claim_scope_review.safety.requires_zero_blockers_for_market_claim, true);
		    assert.ok(marketLaunchKitInitial.claim_scope_review.evidence_required.some((item) => item.key === "market_kit_claim_scope" && item.required));
		    assert.equal(marketLaunchKitInitial.safety.mutates_buyer_state_on_get, false);
		    assert.equal(marketLaunchKitInitial.safety.sends_external_email_on_get, false);
		    assert.equal(marketLaunchKitInitial.safety.creates_beta_client_on_get, false);
		    assert.equal(marketLaunchKitInitial.safety.transmits_external_crm_on_get, false);
		    assert.equal(marketLaunchKitInitial.safety.paid_provider_lookup_by_default, false);
		    assert.equal(marketLaunchKitInitial.safety.live_proof_claimed, false);
		    assert.equal(marketLaunchKitInitial.safety.external_claims_require_review, true);
		    assert.ok(marketLaunchKitInitial.approved_claims.some((claim) => claim.key === "providerless_default"));
		    assert.ok(marketLaunchKitInitial.disclosure_claims.some((claim) => claim.key === "early_proof_scope"));
		    assert.ok(marketLaunchKitInitial.prohibited_claims.some((claim) => /guaranteed conversion-rate/i.test(claim)));
		    assert.ok(marketLaunchKitInitial.copy_blocks.some((block) => block.key === "website_hero"));
		    assert.ok(marketLaunchKitInitial.disclosure_checklist.some((item) => item.key === "claim_scope_lock"));
		    assert.ok(marketLaunchKitInitial.disclosure_checklist.some((item) => item.key === "no_guaranteed_lift"));
		    const marketLaunchKitMarkdownInitial = await getProtectedText("/api/v1/launch/market-kit?format=markdown");
		    assert.match(marketLaunchKitMarkdownInitial, /# Deal Threads Market Launch Kit/);
		    assert.match(marketLaunchKitMarkdownInitial, /## Claim Scope Review/);
		    assert.match(marketLaunchKitMarkdownInitial, /Claim scope: Internal Beta Only/);
		    assert.match(marketLaunchKitMarkdownInitial, /GET claims market ready: no/);
		    assert.match(marketLaunchKitMarkdownInitial, /Evidence market_kit_claim_scope: required/);
		    assert.match(marketLaunchKitMarkdownInitial, /## Approved Claims/);
		    assert.match(marketLaunchKitMarkdownInitial, /## Prohibited Claims/);
		    assert.match(marketLaunchKitMarkdownInitial, /External claims require review: yes/);
		    const marketLaunchKitPageInitial = await getProtectedText("/launch/market-kit");
		    assert.match(marketLaunchKitPageInitial, /Market launch kit/);
		    assert.match(marketLaunchKitPageInitial, /Launch-safe claims/);
		    assert.match(marketLaunchKitPageInitial, /Claim scope review/);
		    assert.match(marketLaunchKitPageInitial, /Claim scope evidence/);
		    assert.match(marketLaunchKitPageInitial, /Claims needing disclosure/);
		    assert.match(marketLaunchKitPageInitial, /Copy blocks/);

		    const crmWebhookTest = await postProtectedJson(`/api/v1/beta-clients/${betaClient.id}/crm-delivery/test`, {
	      webhookUrl: "https://hooks.example.test/deal-threads",
	      note: "Dry-run synthetic CRM webhook test before buyer traffic."
	    });
	    assert.equal(crmWebhookTest.test_delivery.status, "sent");
	    assert.equal(crmWebhookTest.test_delivery.sent_via, "dry_run");
	    assert.equal(crmWebhookTest.test_delivery.destination_host, "hooks.example.test");
	    assert.equal(crmWebhookTest.crm_adapter.transmits_external_crm, false);
	    assert.equal(crmWebhookTest.payload.type, "deal_threads.crm_webhook_test");
	    assert.equal(crmWebhookTest.payload.test.no_real_buyer_data, true);
	    assert.equal(crmWebhookTest.payload.sample_profile.lead.id, "sample_lead_no_real_buyer_data");
	    assert.equal(crmWebhookTest.payload.sample_profile.enrichment.paid_provider_used, false);
	    assert.equal(crmWebhookTest.beta_client.crm_delivery.test_delivery.status, "sent");
	    assert.ok(crmWebhookTest.beta_client.readiness.checks.some((check) => check.key === "crm_delivery_test" && check.status === "pass"));

	    const publicInstallPage = await fetch(betaClient.public_install_url);
	    assert.equal(publicInstallPage.status, 200);
	    const publicInstallHtml = await publicInstallPage.text();
	    assert.match(publicInstallHtml, /Deal Threads install handoff/);
	    assert.match(publicInstallHtml, /PilotCo Revenue Team/);
	    assert.match(publicInstallHtml, /data-beta-client-id=&quot;beta_[a-f0-9]+&quot;/);
	    assert.match(publicInstallHtml, /No paid enrichment provider calls by default/);
			    assert.match(publicInstallHtml, /Rep feedback room/);
			    assert.match(publicInstallHtml, /Manual CRM export/);
			    assert.match(publicInstallHtml, /Beta proof report/);
			    assert.match(publicInstallHtml, /Hosted widget load test/);
			    assert.match(publicInstallHtml, /Public install status/);
			    assert.match(publicInstallHtml, /\/install\/inst_[a-f0-9]+\/test/);
		    assert.match(publicInstallHtml, /Submit tested URL/);
		    assert.match(publicInstallHtml, /the client's own page still needs the source check or a real config load/);
		    assert.doesNotMatch(publicInstallHtml, /\/crm\//);
		    assert.doesNotMatch(publicInstallHtml, /Operator config/);

		    const publicHostedTestPage = await fetch(betaClient.public_test_install_url);
		    assert.equal(publicHostedTestPage.status, 200);
		    const publicHostedTestHtml = await publicHostedTestPage.text();
			    assert.match(publicHostedTestHtml, /Deal Threads hosted widget load test/);
			    assert.match(publicHostedTestHtml, /Public install status/);
			    assert.match(publicHostedTestHtml, new RegExp(`data-beta-client-id="${betaClient.id}"`));
			    assert.match(publicHostedTestHtml, /data-page-url="https:\/\/pilotco\.test"/);
		    assert.match(publicHostedTestHtml, /does not replace the source check on the client's own target page/);
			    assert.doesNotMatch(publicHostedTestHtml, /\/crm\//);
			    assert.doesNotMatch(publicHostedTestHtml, /Operator config/);

			    const publicInstallStatusInitial = await fetch(betaClient.public_install_status_url);
			    assert.equal(publicInstallStatusInitial.status, 200);
			    const publicInstallStatusInitialJson = await publicInstallStatusInitial.json();
			    assert.equal(publicInstallStatusInitialJson.install_activity.config_loads, 0);
			    assert.equal(publicInstallStatusInitialJson.install_activity.hosted_config_loads, 0);
			    assert.equal(publicInstallStatusInitialJson.install_activity.client_page_config_loads, 0);
			    assert.equal(publicInstallStatusInitialJson.install_activity.session_starts, 0);
			    assert.equal(publicInstallStatusInitialJson.buyer_profiles.count, 0);
			    assert.equal(publicInstallStatusInitialJson.public_safety.exposes_crm_profiles, false);
			    assert.equal(publicInstallStatusInitialJson.links.hosted_widget_load_test, betaClient.public_test_install_url);
			    assert.equal(publicInstallStatusInitialJson.links.manual_crm_export, betaClient.public_crm_export_url);
			    assert.equal(publicInstallStatusInitialJson.links.beta_proof_report, betaClient.public_beta_proof_url);
			    assert.equal(JSON.stringify(publicInstallStatusInitialJson).includes("/crm/"), false);

			    const emptyPublicCrmExport = await fetch(betaClient.public_crm_export_url);
			    assert.equal(emptyPublicCrmExport.status, 200);
			    const emptyPublicCrmExportCsv = await emptyPublicCrmExport.text();
			    assert.match(emptyPublicCrmExportCsv, /"deal_threads_reference","created_at","contact_name"/);
			    assert.doesNotMatch(emptyPublicCrmExportCsv, /\/crm\//);
			    assert.doesNotMatch(emptyPublicCrmExportCsv, /\/api\/v1\//);

			    const emptyPublicProof = await fetch(betaClient.public_beta_proof_url);
			    assert.equal(emptyPublicProof.status, 200);
			    const emptyPublicProofHtml = await emptyPublicProof.text();
			    assert.match(emptyPublicProofHtml, /Buyer-safe beta proof report/);
			    assert.match(emptyPublicProofHtml, /Waiting for leads|Collecting buyer proof|Waiting for profile/i);
			    assert.doesNotMatch(emptyPublicProofHtml, /\/crm\//);
			    assert.doesNotMatch(emptyPublicProofHtml, /\/api\/v1\//);

	    const publicFeedbackInitial = await fetch(betaClient.public_feedback_url);
	    assert.equal(publicFeedbackInitial.status, 200);
	    const publicFeedbackInitialHtml = await publicFeedbackInitial.text();
	    assert.match(publicFeedbackInitialHtml, /Deal Threads rep feedback room/);
	    assert.match(publicFeedbackInitialHtml, /No beta buyer profiles yet/);
	    assert.doesNotMatch(publicFeedbackInitialHtml, /\/crm\//);
	    assert.doesNotMatch(publicFeedbackInitialHtml, /Operator config/);

	    const publicInstallPath = new URL(betaClient.public_install_url).pathname;
	    const wrongDomainInstallResponse = await postForm(publicInstallPath, {
	      contactName: "Pilot Implementer",
	      contactEmail: "web@pilotco.test",
	      testedPageUrl: "https://wrongco.test/demo",
	      notes: "Wrong domain should not be accepted."
	    });
	    assert.equal(wrongDomainInstallResponse.status, 400);
	    assert.match(await wrongDomainInstallResponse.text(), /Use a page on pilotco\.test/);

	    const installConfirmationResponse = await postForm(publicInstallPath, {
	      contactName: "Pilot Implementer",
	      contactEmail: "web@pilotco.test",
	      testedPageUrl: "https://app.pilotco.test/demo",
	      notes: "Installed on the demo request page in staging."
	    });
	    assert.equal(installConfirmationResponse.status, 303);
	    assert.equal(installConfirmationResponse.headers.get("location"), `${publicInstallPath}?submitted=1`);

	    const missingInstallPage = await fetch(`${BASE_URL}/install/inst_deadbeef`);
	    assert.equal(missingInstallPage.status, 404);

	    const betaClientAfterPublicInstallPage = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
	    assert.equal(betaClientAfterPublicInstallPage.install_handoff.status, "submitted");
	    assert.equal(betaClientAfterPublicInstallPage.install_handoff.tested_page_url, "https://app.pilotco.test/demo");
	    assert.equal(betaClientAfterPublicInstallPage.install_handoff.contact_email, "web@pilotco.test");
	    assert.equal(betaClientAfterPublicInstallPage.install_activity.config_loads, 0);
	    assert.equal(betaClientAfterPublicInstallPage.checklist.find((item) => item.key === "widget_installed").checked, false);

	    const betaClientReadiness = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/readiness`);
	    assert.equal(betaClientReadiness.beta_client.id, betaClient.id);
	    assert.equal(betaClientReadiness.readiness.ready_to_send_snippet, true);
	    assert.ok(betaClientReadiness.readiness.checks.some((check) => check.key === "install_handoff_response" && check.status === "pass"));
	    assert.ok(betaClientReadiness.readiness.checks.some((check) => check.key === "install_source_check" && check.status === "warning"));
	    assert.ok(betaClientReadiness.readiness.next_actions.some((action) => action.includes("launch packet")));

	    const activation = await getProtectedJson("/api/v1/activation/real-beta");
	    assert.equal(activation.summary.real_beta_clients, 1);
	    assert.equal(activation.summary.demo_clients_excluded, 0);
	    assert.equal(activation.selected_client.id, betaClient.id);
	    assert.equal(activation.real_beta_clients[0].id, betaClient.id);
	    assert.ok(activation.steps.some((step) => step.key === "real_launch_target" && step.status === "pass"));
	    assert.ok(activation.steps.some((step) => step.key === "live_proof_gate"));
	    const activationPage = await getProtectedText("/activation");
	    assert.match(activationPage, /Real beta activation/);
	    assert.match(activationPage, /Demo clients excluded/);
	    assert.match(activationPage, /PilotCo Revenue Team/);

	    const installFixture = await startInstallFixture();
	    try {
	      const fixtureUrl = `http://127.0.0.1:${installFixture.port}/demo`;
	      const verifyClient = await postProtectedJson("/api/v1/beta-clients", {
	        name: "Fixture Install Team",
	        websiteUrl: fixtureUrl,
	        ownerEmail: "owner@fixture.test",
	        crm: "hubspot",
	        status: "setup",
	        highPriorityOwner: "ae@fixture.test",
	        reportRecipients: "owner@fixture.test",
	        reportCadence: "weekly",
	        reportPeriodDays: "14",
	        minimumProofLeads: "1"
	      });
	      installFixture.setHtml(`<!doctype html><html><body><h1>Fixture install</h1><script async src="${BASE_URL}/widget.js" data-widget-id="${verifyClient.widget_id}" data-tenant-id="${verifyClient.tenant_id}" data-beta-client-id="${verifyClient.id}"></script></body></html>`);
	      const verifyInstallPath = new URL(verifyClient.public_install_url).pathname;
	      const fixtureHandoffResponse = await postForm(verifyInstallPath, {
	        contactName: "Fixture Implementer",
	        contactEmail: "web@fixture.test",
	        testedPageUrl: fixtureUrl,
	        notes: "Installed on the local fixture page."
	      });
	      assert.equal(fixtureHandoffResponse.status, 303);

	      const sourceCheck = await postProtectedJson(`/api/v1/beta-clients/${verifyClient.id}/install-verification`, {});
	      assert.equal(sourceCheck.verification.status, "passed");
	      assert.equal(sourceCheck.verification.snippet_detected, true);
	      assert.equal(sourceCheck.verification.widget_script_present, true);
	      assert.equal(sourceCheck.verification.beta_client_id_present, true);
	      assert.equal(sourceCheck.beta_client.install_handoff.verification.status, "passed");
	      assert.equal(sourceCheck.beta_client.install_activity.config_loads, 0);
	      assert.equal(sourceCheck.beta_client.checklist.find((item) => item.key === "widget_installed").checked, false);
	      assert.ok(sourceCheck.beta_client.readiness.checks.some((check) => check.key === "install_source_check" && check.status === "pass"));
	      assert.ok(sourceCheck.beta_client.readiness.checks.some((check) => check.key === "widget_install" && check.status !== "pass"));

	      const verifyClientPublicInstallPage = await fetch(verifyClient.public_install_url);
	      assert.equal(verifyClientPublicInstallPage.status, 200);
	      const verifyClientPublicHtml = await verifyClientPublicInstallPage.text();
	      assert.match(verifyClientPublicHtml, /Source check/);
	      assert.match(verifyClientPublicHtml, /Snippet detected/);

	      const verifyLaunchPage = await getProtectedText(`/launch?client=${verifyClient.id}`);
	      assert.match(verifyLaunchPage, /Run source check/);
	      assert.match(verifyLaunchPage, /Snippet detected/);

	      const verifyClientPage = await getProtectedText("/beta-clients");
	      assert.match(verifyClientPage, /Install source check/);
	      assert.match(verifyClientPage, /The tested page source contains the expected Deal Threads script tag/);

	      const fixtureDelete = await postProtectedJson("/api/v1/trust/tenant-data/delete", {
	        betaClientId: verifyClient.id,
	        applyDelete: true,
	        dryRun: false,
	        confirmation: "DELETE DEAL THREADS TENANT DATA"
	      });
	      assert.equal(fixtureDelete.applied, true);
	      assert.equal(fixtureDelete.counts.beta_clients, 1);
	      const restoreAllowedDomains = await postProtectedForm("/admin/widget", {
	        tenantName: "Regression Revenue OS",
	        allowedDomains: "localhost, 127.0.0.1, pilotco.test",
	        launcherText: "Start qualification",
	        welcomeMessage: "Regression welcome message.",
	        quickReplies: "Improve demo routing, Fix lead quality",
	        requiredFields: "email, business_need, timeline, company_name_or_domain",
	        primaryColor: "#0f766e",
	        consentDisclosure: "Regression consent disclosure."
	      });
	      assert.equal(restoreAllowedDomains.status, 303);
	    } finally {
	      await installFixture.close();
	    }

	    const initialWizard = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/launch-wizard`);
    assert.equal(initialWizard.beta_client.id, betaClient.id);
	    assert.equal(initialWizard.wizard.current_phase, "launch_packet");
	    assert.equal(initialWizard.wizard.completion.passed, 1);
	    assert.ok(initialWizard.wizard.phases.some((phase) => phase.key === "verify_install"));
	    assert.match(initialWizard.wizard.links.install_handoff, /\/install\/inst_[a-f0-9]+$/);

	    const launchPacketSend = await postProtectedJson(`/api/v1/beta-clients/${betaClient.id}/launch-packet/send`, {
	      recipients: "pilot-owner@example.com, implementer@example.com"
    });
    assert.equal(launchPacketSend.delivery.status, "sent");
    assert.equal(launchPacketSend.delivery.sent_via, "dry_run");
	    assert.deepEqual(launchPacketSend.delivery.recipients, ["pilot-owner@example.com", "implementer@example.com"]);
	    assert.equal(launchPacketSend.packet.subject, "Deal Threads beta install for PilotCo Revenue Team");
		    assert.match(launchPacketSend.packet.public_install_url, /\/install\/inst_[a-f0-9]+$/);
		    assert.match(launchPacketSend.packet.public_install_status_url, /\/install\/inst_[a-f0-9]+\/status$/);
		    assert.match(launchPacketSend.packet.public_feedback_url, /\/feedback\/inst_[a-f0-9]+$/);
		    assert.match(launchPacketSend.packet.public_crm_export_url, /\/handoff\/inst_[a-f0-9]+\/crm-export\.csv$/);
		    assert.match(launchPacketSend.packet.public_crm_export_markdown_url, /\/handoff\/inst_[a-f0-9]+\/crm-export\.md$/);
		    assert.match(launchPacketSend.packet.public_beta_proof_url, /\/handoff\/inst_[a-f0-9]+\/proof\?days=14$/);
		    assert.match(launchPacketSend.packet.markdown, /Client install handoff page/);
		    assert.match(launchPacketSend.packet.markdown, /Public install status/);
		    assert.match(launchPacketSend.packet.markdown, /Rep feedback room/);
		    assert.match(launchPacketSend.packet.markdown, /Manual CRM export CSV/);
		    assert.match(launchPacketSend.packet.markdown, /Buyer-safe beta proof report/);
		    assert.match(launchPacketSend.packet.markdown, /Runtime policy/);
		    assert.match(launchPacketSend.packet.email_body, /Domain authorization/);
		    assert.equal(launchPacketSend.packet.domain_authorization.global_allowlist_contains_client_domain, true);
		    assert.equal(launchPacketSend.packet.domain_authorization.beta_client_match_required, true);
		    assert.deepEqual(launchPacketSend.packet.domain_authorization.authorized_domains, ["pilotco.test"]);
		    assert.equal(launchPacketSend.email_adapter.transmits_external_email, false);
	    assert.equal(launchPacketSend.beta_client.checklist.find((item) => item.key === "install_snippet_sent").checked, true);

		    const installQueueAfterPacket = await getProtectedJson("/api/v1/launch/install-queue");
		    const installQueueAfterPacketItem = installQueueAfterPacket.queue.find((item) => item.beta_client_id === betaClient.id);
		    assert.ok(installQueueAfterPacketItem);
		    assert.equal(installQueueAfterPacketItem.status, "run_source_check");
		    assert.equal(installQueueAfterPacketItem.launch_packet_delivery.status, "sent");
		    assert.match(installQueueAfterPacketItem.next_action, /source check|installed page/i);

	    const snippetSent = await postProtectedJson(`/api/v1/beta-clients/${betaClient.id}/checklist`, {
      key: "install_snippet_sent",
      checked: true,
      note: "Sent to implementation owner."
    });
    assert.equal(snippetSent.status, "snippet_sent");
    assert.equal(snippetSent.checklist.find((item) => item.key === "install_snippet_sent").checked, true);

    const configAfterClient = await getJson("/api/v1/widgets/wid_deal_threads_demo/config");
    assert.ok(configAfterClient.tenant.allowedDomains.includes("pilotco.test"));

	    const addRivalAllowedDomain = await postProtectedForm("/admin/widget", {
	      tenantName: "Regression Revenue OS",
	      allowedDomains: "localhost, 127.0.0.1, pilotco.test, rivalco.test",
	      launcherText: "Start qualification",
	      welcomeMessage: "Regression welcome message.",
	      quickReplies: "Improve demo routing, Fix lead quality",
	      requiredFields: "email, business_need, timeline, company_name_or_domain",
	      primaryColor: "#0f766e",
	      consentDisclosure: "Regression consent disclosure."
	    });
	    assert.equal(addRivalAllowedDomain.status, 303);

    const betaConfig = await getJson(`/api/v1/widgets/wid_deal_threads_demo/config?betaClientId=${betaClient.id}`);
    assert.equal(betaConfig.betaClientId, betaClient.id);
    assert.equal(betaConfig.tenant.name, "PilotCo Revenue Team");
    assert.equal(betaConfig.conversation.launcherText, "Ask PilotCo");
    assert.equal(betaConfig.conversation.welcomeMessage, "PilotCo custom welcome.");
    assert.deepEqual(betaConfig.conversation.quickReplies, ["Fix handoffs", "Improve speed-to-lead"]);
    assert.equal(betaConfig.conversation.questions.find((question) => question.key === "authority").prompt, "Who owns the buying decision at PilotCo?");
    assert.deepEqual(betaConfig.conversation.requiredFields, ["email", "business_need", "timeline", "company_name_or_domain", "crm"]);
    assert.equal(betaConfig.theme.primaryColor, "#1d4ed8");

    const betaClientAfterHostedConfigLoad = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
	    assert.notEqual(betaClientAfterHostedConfigLoad.status, "installed");
	    assert.equal(betaClientAfterHostedConfigLoad.install_activity.config_loads, 1);
	    assert.equal(betaClientAfterHostedConfigLoad.install_activity.hosted_config_loads, 1);
	    assert.equal(betaClientAfterHostedConfigLoad.install_activity.client_page_config_loads, 0);
	    assert.equal(betaClientAfterHostedConfigLoad.checklist.find((item) => item.key === "widget_installed").checked, false);
	    const publicInstallStatusAfterHostedConfig = await fetch(betaClient.public_install_status_url).then((response) => response.json());
	    assert.equal(publicInstallStatusAfterHostedConfig.status, "collecting_proof");
	    assert.equal(publicInstallStatusAfterHostedConfig.install_activity.config_loads, 1);
	    assert.equal(publicInstallStatusAfterHostedConfig.install_activity.hosted_config_loads, 1);
	    assert.equal(publicInstallStatusAfterHostedConfig.install_activity.client_page_config_loads, 0);
	    assert.equal(publicInstallStatusAfterHostedConfig.install_activity.session_starts, 0);
	    assert.equal(publicInstallStatusAfterHostedConfig.buyer_profiles.count, 0);
	    assert.ok(publicInstallStatusAfterHostedConfig.steps.some((step) => step.key === "config_load" && step.status === "pass"));
	    assert.ok(publicInstallStatusAfterHostedConfig.steps.some((step) => step.key === "client_domain_config_load" && step.status === "warning"));
	    assert.equal(JSON.stringify(publicInstallStatusAfterHostedConfig).includes("/crm/"), false);
    const hostedOnlyWizard = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/launch-wizard`);
    assert.equal(hostedOnlyWizard.wizard.current_phase, "verify_install");
    assert.ok(hostedOnlyWizard.wizard.phases.find((phase) => phase.key === "verify_install").status !== "pass");

    const clientPageUrl = encodeURIComponent("https://pilotco.test/demo");
	    const wrongClientDomainResponse = await fetch(`${BASE_URL}/api/v1/widgets/wid_deal_threads_demo/config?betaClientId=${betaClient.id}&pageUrl=${encodeURIComponent("https://rivalco.test/demo")}`, {
	      headers: { origin: "https://rivalco.test" }
	    });
	    assert.equal(wrongClientDomainResponse.status, 403);
	    assert.equal((await wrongClientDomainResponse.json()).error, "origin_not_allowed");

	    const unknownBetaClientResponse = await fetch(`${BASE_URL}/api/v1/widgets/wid_deal_threads_demo/config?betaClientId=beta_missing&pageUrl=${clientPageUrl}`, {
	      headers: { origin: "https://pilotco.test" }
	    });
	    assert.equal(unknownBetaClientResponse.status, 404);
	    assert.equal((await unknownBetaClientResponse.json()).error, "beta_client_not_found");

    const betaConfigClientResponse = await fetch(`${BASE_URL}/api/v1/widgets/wid_deal_threads_demo/config?betaClientId=${betaClient.id}&pageUrl=${clientPageUrl}`, {
      headers: { origin: "https://pilotco.test" }
    });
    assert.equal(betaConfigClientResponse.status, 200);
    const betaConfigClient = await betaConfigClientResponse.json();
    assert.equal(betaConfigClient.betaClientId, betaClient.id);

    const betaClientAfterConfigLoad = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
	    assert.equal(betaClientAfterConfigLoad.status, "installed");
	    assert.equal(betaClientAfterConfigLoad.install_activity.config_loads, 2);
	    assert.equal(betaClientAfterConfigLoad.install_activity.hosted_config_loads, 1);
	    assert.equal(betaClientAfterConfigLoad.install_activity.client_page_config_loads, 1);
	    assert.equal(betaClientAfterConfigLoad.install_activity.last_load_scope, "client_site");
	    assert.equal(betaClientAfterConfigLoad.domain_authorization.status, "authorized");
	    assert.equal(betaClientAfterConfigLoad.domain_authorization.global_allowlist_contains_client_domain, true);
	    assert.equal(betaClientAfterConfigLoad.domain_authorization.beta_client_match_required, true);
	    assert.equal(betaClientAfterConfigLoad.checklist.find((item) => item.key === "widget_installed").checked, true);
	    const publicInstallStatusAfterConfig = await fetch(betaClient.public_install_status_url).then((response) => response.json());
	    assert.equal(publicInstallStatusAfterConfig.status, "collecting_proof");
	    assert.equal(publicInstallStatusAfterConfig.install_activity.config_loads, 2);
	    assert.equal(publicInstallStatusAfterConfig.install_activity.hosted_config_loads, 1);
	    assert.equal(publicInstallStatusAfterConfig.install_activity.client_page_config_loads, 1);
	    assert.equal(publicInstallStatusAfterConfig.install_activity.session_starts, 0);
	    assert.equal(publicInstallStatusAfterConfig.buyer_profiles.count, 0);
	    assert.ok(publicInstallStatusAfterConfig.steps.some((step) => step.key === "config_load" && step.status === "pass"));
	    assert.ok(publicInstallStatusAfterConfig.steps.some((step) => step.key === "client_domain_config_load" && step.status === "pass"));
	    assert.equal(JSON.stringify(publicInstallStatusAfterConfig).includes("/crm/"), false);
	    const installedWizard = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/launch-wizard`);
	    assert.equal(installedWizard.wizard.current_phase, "test_lead");
	    assert.ok(installedWizard.wizard.phases.find((phase) => phase.key === "verify_install").status === "pass");

		    const installQueueAfterClientLoad = await getProtectedJson("/api/v1/launch/install-queue");
		    const installQueueAfterClientLoadItem = installQueueAfterClientLoad.queue.find((item) => item.beta_client_id === betaClient.id);
		    assert.ok(installQueueAfterClientLoadItem);
		    assert.equal(installQueueAfterClientLoadItem.status, "create_first_profile");
		    assert.equal(installQueueAfterClientLoadItem.install_activity.client_page_config_loads, 1);
		    assert.equal(installQueueAfterClientLoadItem.proof_preflight.summary.client_domain_config_loads, 1);
		    assert.equal(installQueueAfterClientLoadItem.proof_preflight.summary.beta_profiles, 0);
		    assert.ok(installQueueAfterClientLoadItem.proof_preflight.checks.some((check) => check.key === "client_domain_config_load" && check.status === "pass"));
		    assert.equal(installQueueAfterClientLoadItem.proof_preflight.ready_for_first_proof_packet, false);
		    assert.match(installQueueAfterClientLoadItem.next_action, /Create one|test lead|attributed profile/i);

	    const lead = await createHighPriorityLead(betaClient.id);
    assert.equal(lead.contact.name, "Dana Vale");
    assert.equal(lead.source.beta_client_id, betaClient.id);
    assert.equal(lead.source.widget_config_version, betaClientAfterConfigLoad.effective_widget_config.version);
    assert.equal(lead.score.priority, "high");
    assert.equal(lead.routing.assigned_owner_email, "pilot-ae@example.com");
    assert.equal(lead.routing.queue, "regression_high_priority");
    assert.equal(lead.routing.recommended_next_action, "PilotCo high-priority call within 10 minutes.");
    assert.equal(lead.enrichment.provider, "internal_website_enrichment");
    assert.equal(lead.enrichment.cost.paid_provider_used, false);
    assert.equal(lead.enrichment.cost.estimated_usd, 0);
    assert.equal(lead.enrichment.conversion_surface.status, "not_detected");
    assert.ok(lead.enrichment.buyer_profile.icp_fit.score >= 75);
    assert.equal(lead.enrichment.buyer_profile.icp_fit.segment, "strong_mid_market_b2b_fit");
    assert.ok(lead.enrichment.buyer_profile.buying_committee.some((item) => item.role === "RevOps leader"));
    assert.ok(lead.enrichment.buyer_profile.buying_triggers.some((item) => item.category === "acute_pain"));
    assert.match(lead.enrichment.buyer_profile.opening_angle, /RegressionCo/);
    assert.ok(lead.enrichment.decision_makers.some((item) => item.title.includes("Revenue Operations")));
    assert.ok(lead.summary.enriched_facts.some((fact) => fact.startsWith("ICP fit:")));
    assert.ok(lead.summary.enriched_facts.some((fact) => fact.startsWith("Likely buying committee:")));
    assert.equal(lead.workflow.stage, "new");
    assert.equal(lead.workflow.owner_email, "pilot-ae@example.com");
    assert.ok(lead.workflow.due_at);
    assert.equal(lead.outcome.status, "unworked");
    assert.equal(lead.outcome.value, 0);
    assert.equal(lead.crm.sync_status, "stubbed");
    assert.equal(lead.crm_handoff.status, "queued");
	    assert.equal(lead.crm_handoff.destination_name, "PilotCo CRM webhook");
	    assert.equal(lead.crm_handoff.destination_host, "hooks.example.test");

	    const publicInstallStatusAfterLead = await fetch(betaClient.public_install_status_url).then((response) => response.json());
	    assert.equal(publicInstallStatusAfterLead.install_activity.config_loads, 2);
	    assert.equal(publicInstallStatusAfterLead.install_activity.hosted_config_loads, 1);
	    assert.equal(publicInstallStatusAfterLead.install_activity.client_page_config_loads, 1);
	    assert.equal(publicInstallStatusAfterLead.install_activity.session_starts, 1);
	    assert.equal(publicInstallStatusAfterLead.buyer_profiles.count, 1);
    assert.equal(publicInstallStatusAfterLead.buyer_profiles.high_priority, 1);
	    assert.ok(publicInstallStatusAfterLead.steps.some((step) => step.key === "buyer_profile" && step.status === "pass"));
	    assert.equal(publicInstallStatusAfterLead.links.manual_crm_export, betaClient.public_crm_export_url);
	    assert.equal(publicInstallStatusAfterLead.links.beta_proof_report, betaClient.public_beta_proof_url);
	    assert.equal(JSON.stringify(publicInstallStatusAfterLead).includes(lead.id), false);
	    assert.equal(JSON.stringify(publicInstallStatusAfterLead).includes("/crm/"), false);

	    const publicCrmExportCsvResponse = await fetch(betaClient.public_crm_export_url);
	    assert.equal(publicCrmExportCsvResponse.status, 200);
	    const publicCrmExportCsv = await publicCrmExportCsvResponse.text();
	    assert.match(publicCrmExportCsv, /"deal_threads_reference","created_at","contact_name"/);
	    assert.match(publicCrmExportCsv, /Dana Vale/);
	    assert.match(publicCrmExportCsv, /RegressionCo/);
	    assert.match(publicCrmExportCsv, new RegExp(`/handoff/${betaClient.handoff_token}/${lead.id}`));
	    assert.doesNotMatch(publicCrmExportCsv, /\/crm\//);
	    assert.doesNotMatch(publicCrmExportCsv, /\/api\/v1\//);

	    const publicCrmExportMarkdownResponse = await fetch(betaClient.public_crm_export_markdown_url);
	    assert.equal(publicCrmExportMarkdownResponse.status, 200);
	    const publicCrmExportMarkdown = await publicCrmExportMarkdownResponse.text();
	    assert.match(publicCrmExportMarkdown, /# Manual CRM Export/);
	    assert.match(publicCrmExportMarkdown, /CSV export/);
	    assert.match(publicCrmExportMarkdown, /Dana Vale/);
	    assert.match(publicCrmExportMarkdown, new RegExp(`/handoff/${betaClient.handoff_token}/${lead.id}`));
	    assert.doesNotMatch(publicCrmExportMarkdown, /\/crm\//);
	    assert.doesNotMatch(publicCrmExportMarkdown, /\/api\/v1\//);

	    const publicCrmExportJsonResponse = await fetch(betaClient.public_crm_export_json_url);
	    assert.equal(publicCrmExportJsonResponse.status, 200);
	    const publicCrmExportJson = await publicCrmExportJsonResponse.json();
	    assert.equal(publicCrmExportJson.type, "deal_threads.manual_crm_export");
	    assert.equal(publicCrmExportJson.summary.buyer_profiles, 1);
	    assert.equal(publicCrmExportJson.rows[0].contact_name, "Dana Vale");
	    assert.match(publicCrmExportJson.rows[0].handoff_url, new RegExp(`/handoff/${betaClient.handoff_token}/${lead.id}$`));
	    assert.equal(JSON.stringify(publicCrmExportJson).includes("/crm/"), false);
	    assert.equal(JSON.stringify(publicCrmExportJson).includes("/api/v1/"), false);

	    const publicProofAfterLeadResponse = await fetch(betaClient.public_beta_proof_url);
	    assert.equal(publicProofAfterLeadResponse.status, 200);
	    const publicProofAfterLeadHtml = await publicProofAfterLeadResponse.text();
	    assert.match(publicProofAfterLeadHtml, /Buyer-safe beta proof report/);
	    assert.match(publicProofAfterLeadHtml, /Profiles<\/span><b>1<\/b>/);
	    assert.match(publicProofAfterLeadHtml, /Providerless enrichment/);
	    assert.match(publicProofAfterLeadHtml, /No paid enrichment provider spend is included/);
	    assert.doesNotMatch(publicProofAfterLeadHtml, new RegExp(lead.id));
	    assert.doesNotMatch(publicProofAfterLeadHtml, /\/crm\//);
	    assert.doesNotMatch(publicProofAfterLeadHtml, /\/api\/v1\//);

	    const publicProofAfterLeadJsonResponse = await fetch(`${betaClient.public_beta_proof_url}&format=json`);
	    assert.equal(publicProofAfterLeadJsonResponse.status, 200);
	    const publicProofAfterLeadJson = await publicProofAfterLeadJsonResponse.json();
	    assert.equal(publicProofAfterLeadJson.type, "deal_threads.public_beta_proof_report");
	    assert.equal(publicProofAfterLeadJson.summary.buyer_profiles, 1);
	    assert.equal(publicProofAfterLeadJson.summary.paid_provider_used, false);
	    assert.equal(publicProofAfterLeadJson.public_safety.includes_lead_ids, false);
	    assert.equal(JSON.stringify(publicProofAfterLeadJson).includes(lead.id), false);
	    assert.equal(JSON.stringify(publicProofAfterLeadJson).includes("/crm/"), false);
	    assert.equal(JSON.stringify(publicProofAfterLeadJson).includes("/api/v1/"), false);

	    const crmDeliveries = await getProtectedJson("/api/v1/crm-deliveries");
	    assert.equal(crmDeliveries.count, 1);
	    assert.equal(crmDeliveries.summary.queued, 1);
    assert.equal(crmDeliveries.summary.sent, 0);
    assert.equal(crmDeliveries.crm_adapter.mode, "dry_run");
    assert.equal(crmDeliveries.crm_adapter.transmits_external_crm, false);
    assert.equal(crmDeliveries.deliveries[0].lead_id, lead.id);
	    assert.equal(crmDeliveries.deliveries[0].destination_name, "PilotCo CRM webhook");
	    assert.equal(crmDeliveries.deliveries[0].destination_host, "hooks.example.test");
	    assert.equal(crmDeliveries.deliveries[0].lead.owner_email, "pilot-ae@example.com");

		    const installQueueAfterLead = await getProtectedJson("/api/v1/launch/install-queue");
		    const installQueueAfterLeadItem = installQueueAfterLead.queue.find((item) => item.beta_client_id === betaClient.id);
		    assert.ok(installQueueAfterLeadItem);
		    assert.equal(installQueueAfterLeadItem.status, "rep_feedback_needed");
		    assert.equal(installQueueAfterLeadItem.lead_count, 1);
		    assert.equal(installQueueAfterLeadItem.crm_delivery_count, 1);
		    assert.equal(installQueueAfterLeadItem.proof_preflight.status, "proof_ready_with_warnings");
		    assert.equal(installQueueAfterLeadItem.proof_preflight.summary.client_domain_config_loads, 1);
		    assert.equal(installQueueAfterLeadItem.proof_preflight.summary.beta_profiles, 1);
		    assert.equal(installQueueAfterLeadItem.proof_preflight.summary.crm_handoffs, 1);
		    assert.ok(installQueueAfterLeadItem.proof_preflight.checks.some((check) => check.key === "first_beta_profile" && check.status === "pass"));
		    assert.ok(installQueueAfterLeadItem.proof_preflight.checks.some((check) => check.key === "crm_handoff_proof" && check.status === "warning"));
		    assert.equal(installQueueAfterLeadItem.proof_preflight.ready_for_first_proof_packet, true);
		    assert.equal(installQueueAfterLeadItem.proof_preflight.ready_for_live_proof_claim, false);
		    assert.match(installQueueAfterLeadItem.next_action, /feedback/i);

		    const profileHandoffAfterLead = await getProtectedJson(`/api/v1/launch/profile-handoff?client=${betaClient.id}&lead=${lead.id}`);
		    assert.equal(profileHandoffAfterLead.type, "deal_threads.launch_profile_handoff_bridge.v1");
		    assert.equal(profileHandoffAfterLead.status, "crm_handoff_needed");
		    assert.equal(profileHandoffAfterLead.summary.selected_beta_client_id, betaClient.id);
		    assert.equal(profileHandoffAfterLead.summary.selected_lead_id, lead.id);
		    assert.equal(profileHandoffAfterLead.summary.beta_profiles, 1);
		    assert.equal(profileHandoffAfterLead.summary.crm_delivery_records, 1);
		    assert.equal(profileHandoffAfterLead.summary.crm_handoff_sent, false);
		    assert.equal(profileHandoffAfterLead.summary.rep_feedback_reviewed, false);
		    assert.equal(profileHandoffAfterLead.summary.paid_lookups_recommended_now, 0);
		    assert.equal(profileHandoffAfterLead.current_action.key, "send_crm_handoff");
		    assert.equal(profileHandoffAfterLead.selected_profile.id, lead.id);
		    assert.equal(profileHandoffAfterLead.rep_ready_brief.version, "deal_threads.rep_ready_brief.v1");
		    assert.equal(profileHandoffAfterLead.rep_ready_brief.paid_provider_used, false);
		    assert.equal(profileHandoffAfterLead.actions.crm_delivery.method, "POST");
		    assert.equal(profileHandoffAfterLead.actions.crm_delivery.transmits_external_crm_on_post, false);
		    assert.equal(profileHandoffAfterLead.actions.rep_alert.method, "POST");
		    assert.equal(profileHandoffAfterLead.actions.rep_alert.sends_external_email_on_post, false);
		    assert.equal(profileHandoffAfterLead.actions.protected_rep_feedback.method, "POST");
		    assert.match(profileHandoffAfterLead.links.public_rep_handoff, new RegExp(`/handoff/${betaClient.handoff_token}/${lead.id}$`));
		    assert.match(profileHandoffAfterLead.links.public_feedback_room, new RegExp(`/feedback/${betaClient.handoff_token}$`));
		    assert.match(profileHandoffAfterLead.links.manual_crm_export, new RegExp(`/handoff/${betaClient.handoff_token}/crm-export\\.csv$`));
		    assert.ok(profileHandoffAfterLead.handoff_checklist.some((item) => item.key === "first_beta_profile" && item.status === "pass"));
		    assert.ok(profileHandoffAfterLead.handoff_checklist.some((item) => item.key === "crm_handoff_proof" && item.status === "warning"));
		    assert.ok(profileHandoffAfterLead.handoff_checklist.some((item) => item.key === "rep_feedback" && item.status === "blocker"));
		    assert.equal(profileHandoffAfterLead.safety.read_only_get, true);
		    assert.equal(profileHandoffAfterLead.safety.queues_crm_delivery_on_get, false);
		    assert.equal(profileHandoffAfterLead.safety.sends_rep_alert_on_get, false);
		    assert.equal(profileHandoffAfterLead.safety.updates_rep_feedback_on_get, false);
		    assert.equal(profileHandoffAfterLead.safety.transmits_external_crm_on_get, false);
		    assert.equal(profileHandoffAfterLead.safety.paid_provider_lookup_by_default, false);
		    assert.equal(profileHandoffAfterLead.safety.crm_delivery_requires_post, true);
		    assert.equal(profileHandoffAfterLead.safety.rep_alert_requires_post, true);
		    assert.equal(profileHandoffAfterLead.safety.rep_feedback_requires_post, true);
		    const profileHandoffAfterLeadPage = await getProtectedText(`/launch/profile-handoff?client=${betaClient.id}&lead=${lead.id}`);
		    assert.match(profileHandoffAfterLeadPage, /Profile handoff bridge/);
		    assert.match(profileHandoffAfterLeadPage, /Rep-ready brief/);
		    assert.match(profileHandoffAfterLeadPage, /CRM handoff/);
		    assert.match(profileHandoffAfterLeadPage, /Rep handoff/);
		    assert.match(profileHandoffAfterLeadPage, /Save protected rep feedback/);
		    assert.match(profileHandoffAfterLeadPage, /GET is read-only: no profile creation/);
		    const profileHandoffAfterLeadMarkdown = await getProtectedText(`/api/v1/launch/profile-handoff?format=markdown&client=${betaClient.id}&lead=${lead.id}`);
		    assert.match(profileHandoffAfterLeadMarkdown, /# Deal Threads Profile Handoff Bridge/);
		    assert.match(profileHandoffAfterLeadMarkdown, /CRM delivery POST:/);
		    assert.match(profileHandoffAfterLeadMarkdown, /GET queues CRM delivery: no/);

		    const marketLaunchAfterLead = await getProtectedJson("/api/v1/launch/market-ready");
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_stage, "handoff_feedback");
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.key, "send_crm_handoff");
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.packet_kind, "crm_handoff");
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.proof_focus, "crm_handoff");
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.beta_client_id, betaClient.id);
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.lead_id, lead.id);
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.primary_surface_method, "GET");
		    assert.match(marketLaunchAfterLead.launch_clearance_plan.current_action.primary_surface_url, new RegExp(`/launch/profile-handoff\\?client=${betaClient.id}&lead=${lead.id}$`));
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.operator_post_method, "POST");
		    assert.match(marketLaunchAfterLead.launch_clearance_plan.current_action.operator_post_url, new RegExp(`/crm/${lead.id}/crm-delivery/send$`));
		    assert.match(marketLaunchAfterLead.launch_clearance_plan.current_action.operator_post_api_url, new RegExp(`/api/v1/leads/${lead.id}/crm-delivery/send$`));
		    const crmHandoffMarketPreflight = marketLaunchAfterLead.launch_clearance_plan.current_action.crm_handoff_preflight;
		    assert.equal(crmHandoffMarketPreflight.type, "deal_threads.market_crm_handoff_preflight.v1");
		    assert.equal(crmHandoffMarketPreflight.status, "crm_delivery_queued");
		    assert.equal(crmHandoffMarketPreflight.ready_to_send_crm_handoff, true);
		    assert.equal(crmHandoffMarketPreflight.summary.selected_lead_id, lead.id);
		    assert.equal(crmHandoffMarketPreflight.summary.beta_profiles, 1);
		    assert.equal(crmHandoffMarketPreflight.summary.crm_delivery_records, 1);
		    assert.equal(crmHandoffMarketPreflight.summary.crm_handoff_sent, false);
		    assert.equal(crmHandoffMarketPreflight.summary.crm_deliveries_queued, 1);
		    assert.equal(crmHandoffMarketPreflight.summary.external_crm_on_post, false);
		    assert.equal(crmHandoffMarketPreflight.summary.paid_lookups_recommended_now, 0);
		    assert.equal(crmHandoffMarketPreflight.crm_delivery_surface.method, "POST");
		    assert.match(crmHandoffMarketPreflight.crm_delivery_surface.html_action, new RegExp(`/crm/${lead.id}/crm-delivery/send$`));
		    assert.match(crmHandoffMarketPreflight.crm_delivery_surface.api_url, new RegExp(`/api/v1/leads/${lead.id}/crm-delivery/send$`));
		    assert.equal(crmHandoffMarketPreflight.crm_delivery_surface.preview_only_on_get, true);
		    assert.equal(crmHandoffMarketPreflight.crm_delivery_surface.transmits_external_crm_on_post, false);
		    assert.ok(crmHandoffMarketPreflight.checks.some((check) => check.key === "first_beta_profile" && check.status === "pass"));
		    assert.ok(crmHandoffMarketPreflight.checks.some((check) => check.key === "crm_handoff_sent" && check.status === "warning"));
		    assert.ok(crmHandoffMarketPreflight.checks.some((check) => check.key === "crm_delivery_post_surface" && check.status === "pass"));
		    assert.ok(crmHandoffMarketPreflight.evidence_required.some((item) => item.key === "explicit_crm_delivery_post" && item.required));
		    assert.ok(crmHandoffMarketPreflight.evidence_required.some((item) => item.key === "crm_handoff_sent" && item.required));
		    assert.ok(crmHandoffMarketPreflight.evidence_required.some((item) => item.key === "rep_feedback_after_handoff" && !item.required));
		    assert.equal(crmHandoffMarketPreflight.safety.read_only_get, true);
		    assert.equal(crmHandoffMarketPreflight.safety.queues_crm_delivery_on_get, false);
		    assert.equal(crmHandoffMarketPreflight.safety.transmits_external_crm_on_get, false);
		    assert.equal(crmHandoffMarketPreflight.safety.crm_delivery_requires_post, true);
		    assert.equal(crmHandoffMarketPreflight.safety.operator_post_may_queue_or_send_crm_delivery, true);
		    assert.equal(crmHandoffMarketPreflight.safety.operator_post_may_transmit_external_crm, false);
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.profile_handoff_preflight.type, crmHandoffMarketPreflight.type);
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.crm_handoff_evidence_contract.length, crmHandoffMarketPreflight.evidence_required.length);
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.safety.queues_crm_delivery_on_get, false);
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.safety.crm_delivery_requires_post, true);
		    assert.equal(marketLaunchAfterLead.launch_clearance_plan.current_action.safety.operator_post_may_transmit_external_crm, false);
		    const marketLaunchAfterLeadMarkdown = await getProtectedText("/api/v1/launch/market-ready?format=markdown");
		    assert.match(marketLaunchAfterLeadMarkdown, /Current action: Send CRM handoff proof/);
		    assert.match(marketLaunchAfterLeadMarkdown, /CRM handoff preflight: crm delivery queued/i);
		    assert.match(marketLaunchAfterLeadMarkdown, /CRM handoff ready to send: yes/);
		    assert.match(marketLaunchAfterLeadMarkdown, /CRM handoff sent: no/);
		    assert.match(marketLaunchAfterLeadMarkdown, /CRM delivery requires POST: yes/);
		    assert.match(marketLaunchAfterLeadMarkdown, /CRM external CRM on POST: no/);
		    assert.match(marketLaunchAfterLeadMarkdown, /CRM handoff paid lookups recommended now: 0/);
		    assert.match(marketLaunchAfterLeadMarkdown, /#### CRM Handoff Preflight/);
		    assert.match(marketLaunchAfterLeadMarkdown, /Evidence explicit_crm_delivery_post: required/);
		    assert.match(marketLaunchAfterLeadMarkdown, /Evidence crm_handoff_sent: required/);
		    assert.match(marketLaunchAfterLeadMarkdown, /Evidence rep_feedback_after_handoff: recommended/);
		    assert.match(marketLaunchAfterLeadMarkdown, /#### CRM Handoff POST Preview/);
		    assert.match(marketLaunchAfterLeadMarkdown, /Transmits external CRM on POST: no/);
		    assert.match(marketLaunchAfterLeadMarkdown, /Preview only on GET: yes/);
		    assert.match(marketLaunchAfterLeadMarkdown, /#### CRM Handoff Sequence/);
		    assert.match(marketLaunchAfterLeadMarkdown, /#### CRM Handoff Links/);
		    const marketLaunchAfterLeadPage = await getProtectedText("/launch/market-ready");
		    assert.match(marketLaunchAfterLeadPage, /CRM handoff preflight/);
		    assert.match(marketLaunchAfterLeadPage, /CRM handoff evidence/);
		    assert.match(marketLaunchAfterLeadPage, /CRM handoff POST preview/);
		    assert.match(marketLaunchAfterLeadPage, /CRM handoff payload preview/);
		    assert.match(marketLaunchAfterLeadPage, /CRM handoff sequence/);
		    assert.match(marketLaunchAfterLeadPage, /CRM handoff links/);

		    const repFeedbackAfterLead = await getProtectedJson("/api/v1/launch/rep-feedback");
		    assert.equal(repFeedbackAfterLead.type, "deal_threads.launch_rep_feedback_command.v1");
		    assert.equal(repFeedbackAfterLead.status, "feedback_needed");
		    assert.equal(repFeedbackAfterLead.summary.real_beta_clients, 1);
		    assert.equal(repFeedbackAfterLead.summary.beta_profiles, 1);
		    assert.equal(repFeedbackAfterLead.summary.pending_profiles, 1);
		    assert.equal(repFeedbackAfterLead.summary.reviewed_profiles, 0);
		    assert.equal(repFeedbackAfterLead.summary.feedback_needed_clients, 1);
		    assert.equal(repFeedbackAfterLead.summary.paid_lookups_recommended_now, 0);
		    assert.equal(repFeedbackAfterLead.current_action.key, "send_rep_feedback_ask");
		    assert.equal(repFeedbackAfterLead.copy_blocks.primary_rep_ask.selected_lead_id, lead.id);
		    assert.match(repFeedbackAfterLead.copy_blocks.primary_rep_ask.body, new RegExp(`/handoff/${betaClient.handoff_token}/${lead.id}`));
		    assert.match(repFeedbackAfterLead.copy_blocks.primary_rep_ask.body, new RegExp(`/feedback/${betaClient.handoff_token}#${lead.id}`));
		    assert.match(repFeedbackAfterLead.copy_blocks.primary_rep_ask.mailto_url, /^mailto:/);
		    assert.equal(repFeedbackAfterLead.clients[0].pending_profiles[0].lead_id, lead.id);
		    assert.equal(repFeedbackAfterLead.clients[0].profiles[0].needs_feedback, true);
		    assert.match(repFeedbackAfterLead.clients[0].profiles[0].public_links.rep_handoff, new RegExp(`/handoff/${betaClient.handoff_token}/${lead.id}$`));
		    assert.match(repFeedbackAfterLead.clients[0].profiles[0].public_links.feedback_profile_anchor, new RegExp(`/feedback/${betaClient.handoff_token}#${lead.id}$`));
		    assert.equal(repFeedbackAfterLead.safety.read_only_get, true);
		    assert.equal(repFeedbackAfterLead.safety.updates_rep_feedback_on_get, false);
		    assert.equal(repFeedbackAfterLead.safety.sends_external_email_on_get, false);
		    assert.equal(repFeedbackAfterLead.safety.queues_crm_delivery_on_get, false);
		    assert.equal(repFeedbackAfterLead.safety.paid_provider_lookup_by_default, false);
		    const repFeedbackAfterLeadPage = await getProtectedText("/launch/rep-feedback");
		    assert.match(repFeedbackAfterLeadPage, /Rep feedback command room/);
		    assert.match(repFeedbackAfterLeadPage, /PilotCo Revenue Team/);
		    assert.match(repFeedbackAfterLeadPage, /Feedback form/);
		    assert.match(repFeedbackAfterLeadPage, /Open manual email draft/);
		    assert.match(repFeedbackAfterLeadPage, /GET is read-only/);
		    const repFeedbackAfterLeadMarkdown = await getProtectedText("/api/v1/launch/rep-feedback?format=markdown");
		    assert.match(repFeedbackAfterLeadMarkdown, /# Deal Threads Rep Feedback Command/);
		    assert.match(repFeedbackAfterLeadMarkdown, /Pending profiles: 1/);
		    assert.match(repFeedbackAfterLeadMarkdown, /Copy-Ready Rep Ask/);
		    assert.match(repFeedbackAfterLeadMarkdown, /GET updates rep feedback: no/);

	    const crmDeliveryId = crmDeliveries.deliveries[0].id;
    const crmDeliveryDetail = await getProtectedJson(`/api/v1/crm-deliveries/${crmDeliveryId}`);
    assert.equal(crmDeliveryDetail.id, crmDeliveryId);
    assert.equal(crmDeliveryDetail.payload.lead.id, lead.id);
    assert.equal(crmDeliveryDetail.payload.enrichment.paid_provider_used, false);
    assert.equal(crmDeliveryDetail.payload.rep_ready_brief.lead_id, lead.id);
    assert.equal(crmDeliveryDetail.payload.rep_ready_brief.version, "deal_threads.rep_ready_brief.v1");

    const repBrief = await getProtectedJson(`/api/v1/leads/${lead.id}/rep-brief`);
    assert.equal(repBrief.lead_id, lead.id);
    assert.equal(repBrief.version, "deal_threads.rep_ready_brief.v1");
    assert.match(repBrief.profile_url, new RegExp(`/crm/${lead.id}$`));
    assert.equal(repBrief.priority.level, "high");
    assert.equal(repBrief.owner.email, "pilot-ae@example.com");
    assert.ok(repBrief.call_plan.length >= 4);
    assert.ok(repBrief.discovery_questions.length >= 5);
    assert.match(repBrief.copy_blocks.email_opener, /RegressionCo|Dana/);

    const repBriefMarkdown = await getProtectedText(`/api/v1/leads/${lead.id}/rep-brief?format=markdown`);
    assert.match(repBriefMarkdown, /# Rep-Ready Lead Brief/);
    assert.match(repBriefMarkdown, /## Call Plan/);
    assert.match(repBriefMarkdown, /## Copy Blocks/);

    const publicFeedbackPath = new URL(betaClient.public_feedback_url).pathname;
    const publicFeedbackWithLead = await fetch(betaClient.public_feedback_url);
    assert.equal(publicFeedbackWithLead.status, 200);
    const publicFeedbackWithLeadHtml = await publicFeedbackWithLead.text();
    assert.match(publicFeedbackWithLeadHtml, /Deal Threads rep feedback room/);
    assert.match(publicFeedbackWithLeadHtml, /Dana Vale/);
    assert.match(publicFeedbackWithLeadHtml, /RegressionCo/);
    assert.match(publicFeedbackWithLeadHtml, /Save profile feedback/);
    assert.match(publicFeedbackWithLeadHtml, /Open rep handoff packet/);
    assert.match(publicFeedbackWithLeadHtml, /Download Markdown/);
    assert.match(publicFeedbackWithLeadHtml, /Download manual CRM CSV/);
    assert.match(publicFeedbackWithLeadHtml, /Open CRM import notes/);
    assert.match(publicFeedbackWithLeadHtml, /Open beta proof report/);
    assert.doesNotMatch(publicFeedbackWithLeadHtml, /\/crm\//);
    assert.doesNotMatch(publicFeedbackWithLeadHtml, /Operator config/);

    const publicHandoffPath = `/handoff/${betaClient.handoff_token}/${lead.id}`;
    const publicHandoff = await fetch(`${BASE_URL}${publicHandoffPath}`);
    assert.equal(publicHandoff.status, 200);
    const publicHandoffHtml = await publicHandoff.text();
    assert.match(publicHandoffHtml, /Rep handoff packet/);
    assert.match(publicHandoffHtml, /Dana Vale/);
    assert.match(publicHandoffHtml, /RegressionCo/);
    assert.match(publicHandoffHtml, /Call plan/);
    assert.match(publicHandoffHtml, /Discovery questions/);
    assert.match(publicHandoffHtml, /Providerless signals/);
    assert.match(publicHandoffHtml, /Score this packet after first touch/);
    assert.doesNotMatch(publicHandoffHtml, /\/crm\//);
    assert.doesNotMatch(publicHandoffHtml, /\/api\/v1\//);
    assert.doesNotMatch(publicHandoffHtml, /Operator config/);

    const publicHandoffMarkdown = await fetch(`${BASE_URL}${publicHandoffPath}?format=markdown`);
    assert.equal(publicHandoffMarkdown.status, 200);
    const publicHandoffMarkdownText = await publicHandoffMarkdown.text();
    assert.match(publicHandoffMarkdownText, /# Public Rep Handoff Packet/);
    assert.match(publicHandoffMarkdownText, /## Call Plan/);
    assert.match(publicHandoffMarkdownText, /## Copy Blocks/);
    assert.match(publicHandoffMarkdownText, /Paid provider used: no/);
    assert.doesNotMatch(publicHandoffMarkdownText, /\/crm\//);
    assert.doesNotMatch(publicHandoffMarkdownText, /\/api\/v1\//);

    const missingPublicHandoff = await fetch(`${BASE_URL}/handoff/${betaClient.handoff_token}/lead_deadbeef`);
    assert.equal(missingPublicHandoff.status, 404);
    assert.match(await missingPublicHandoff.text(), /Buyer profile not found for this beta client/);

    const missingClientLeadFeedback = await postForm(`${publicFeedbackPath}/lead_deadbeef`, {
      reviewerName: "Pilot AE",
      status: "helpful",
      usefulnessScore: "4"
    });
    assert.equal(missingClientLeadFeedback.status, 404);
    assert.match(await missingClientLeadFeedback.text(), /Buyer profile not found for this beta client/);

    const publicFeedbackSubmit = await postForm(`${publicFeedbackPath}/${lead.id}`, {
      reviewerName: "Pilot AE",
      status: "helpful",
      usefulnessScore: "4.5",
      repConfidence: "high",
      usedOnCall: "true",
      missingField_source_evidence: "true",
      missingContextNote: "Profile was useful before first touch; source evidence still needs to be clearer."
    });
    assert.equal(publicFeedbackSubmit.status, 303);
    assert.match(publicFeedbackSubmit.headers.get("location"), new RegExp(`/feedback/inst_[a-f0-9]+\\?submitted=${lead.id}#${lead.id}$`));

	    const leadAfterPublicFeedback = await getProtectedJson(`/api/v1/leads/${lead.id}`);
	    assert.equal(leadAfterPublicFeedback.rep_feedback.status, "helpful");
    assert.equal(leadAfterPublicFeedback.rep_feedback.usefulness_score, 4.5);
    assert.equal(leadAfterPublicFeedback.rep_feedback.rep_confidence, "high");
    assert.equal(leadAfterPublicFeedback.rep_feedback.used_on_call, true);
    assert.deepEqual(leadAfterPublicFeedback.rep_feedback.missing_fields, ["source_evidence"]);
	    assert.equal(leadAfterPublicFeedback.rep_feedback.reviewed_by, "customer_rep:Pilot AE");

	    const publicInstallStatusAfterFeedback = await fetch(betaClient.public_install_status_url).then((response) => response.json());
	    assert.equal(publicInstallStatusAfterFeedback.rep_feedback.reviewed_profiles, 1);
		    assert.equal(publicInstallStatusAfterFeedback.rep_feedback.helpful_profiles, 1);
		    assert.ok(publicInstallStatusAfterFeedback.steps.some((step) => step.key === "rep_feedback" && step.status === "pass"));
		    assert.equal(JSON.stringify(publicInstallStatusAfterFeedback).includes(lead.id), false);
		    assert.equal(JSON.stringify(publicInstallStatusAfterFeedback).includes("/crm/"), false);

		    const installQueueAfterFeedback = await getProtectedJson("/api/v1/launch/install-queue");
		    const installQueueAfterFeedbackItem = installQueueAfterFeedback.queue.find((item) => item.beta_client_id === betaClient.id);
		    assert.ok(installQueueAfterFeedbackItem);
		    assert.equal(installQueueAfterFeedbackItem.status, "proof_packet_due");
		    assert.equal(installQueueAfterFeedbackItem.rep_feedback.reviewed_profiles, 1);
		    assert.equal(installQueueAfterFeedbackItem.proof_preflight.summary.rep_feedback_reviews, 1);
		    assert.ok(installQueueAfterFeedbackItem.proof_preflight.checks.some((check) => check.key === "rep_feedback" && check.status === "pass"));
		    assert.equal(installQueueAfterFeedbackItem.proof_preflight.ready_for_first_proof_packet, true);
		    assert.equal(installQueueAfterFeedbackItem.proof_preflight.ready_for_live_proof_claim, false);
		    assert.match(installQueueAfterFeedbackItem.next_action, /proof|snapshot|report/i);

		    const repFeedbackAfterFeedback = await getProtectedJson("/api/v1/launch/rep-feedback");
		    assert.equal(repFeedbackAfterFeedback.status, "feedback_captured_with_gaps");
		    assert.equal(repFeedbackAfterFeedback.summary.pending_profiles, 0);
		    assert.equal(repFeedbackAfterFeedback.summary.reviewed_profiles, 1);
		    assert.equal(repFeedbackAfterFeedback.summary.helpful_profiles, 1);
		    assert.equal(repFeedbackAfterFeedback.summary.feedback_needed_clients, 0);
		    assert.equal(repFeedbackAfterFeedback.summary.paid_lookups_recommended_now, 0);
		    assert.equal(repFeedbackAfterFeedback.current_action.key, "review_missing_context");
		    assert.equal(repFeedbackAfterFeedback.clients[0].status, "feedback_captured_with_gaps");
		    assert.equal(repFeedbackAfterFeedback.clients[0].profiles[0].needs_feedback, false);
		    assert.equal(repFeedbackAfterFeedback.clients[0].profiles[0].feedback.status, "helpful");
		    assert.deepEqual(repFeedbackAfterFeedback.clients[0].profiles[0].feedback.missing_fields, ["source_evidence"]);
		    assert.equal(repFeedbackAfterFeedback.safety.paid_provider_lookup_by_default, false);
		    const repFeedbackAfterFeedbackMarkdown = await getProtectedText("/api/v1/launch/rep-feedback?format=markdown");
		    assert.match(repFeedbackAfterFeedbackMarkdown, /Status: feedback captured with gaps/i);
		    assert.match(repFeedbackAfterFeedbackMarkdown, /Missing-context profiles: 0/);
		    assert.match(repFeedbackAfterFeedbackMarkdown, /Paid lookup by default: no/);

		    const proofPacketBeforeCrmSend = await getProtectedJson(`/api/v1/launch/proof-packet?client=${betaClient.id}`);
		    assert.equal(proofPacketBeforeCrmSend.type, "deal_threads.launch_first_proof_packet_workbench.v1");
		    assert.equal(proofPacketBeforeCrmSend.status, "proof_evidence_blocked");
		    assert.equal(proofPacketBeforeCrmSend.summary.strict_evidence_ready, false);
		    assert.equal(proofPacketBeforeCrmSend.summary.rep_feedback_reviews, 1);
		    assert.equal(proofPacketBeforeCrmSend.summary.proof_packets_sent, 0);
		    assert.equal(proofPacketBeforeCrmSend.actions.queue.ready, false);
		    assert.match(proofPacketBeforeCrmSend.actions.queue.blocked_reason, /CRM handoff proof/i);
		    assert.equal(proofPacketBeforeCrmSend.safety.read_only_get, true);
		    assert.equal(proofPacketBeforeCrmSend.safety.queues_report_delivery_on_get, false);
		    assert.equal(proofPacketBeforeCrmSend.safety.marks_report_sent_on_get, false);
		    assert.equal(proofPacketBeforeCrmSend.safety.sends_external_email_on_get, false);
		    assert.equal(proofPacketBeforeCrmSend.safety.transmits_external_crm_on_get, false);
		    assert.equal(proofPacketBeforeCrmSend.safety.paid_provider_lookup_by_default, false);
		    assert.ok(proofPacketBeforeCrmSend.evidence.items.some((item) => item.key === "crm_handoff_proof" && item.status === "warning"));
		    const proofPacketPageBeforeCrmSend = await getProtectedText(`/launch/proof-packet?client=${betaClient.id}`);
		    assert.match(proofPacketPageBeforeCrmSend, /First proof packet workbench/);
		    assert.match(proofPacketPageBeforeCrmSend, /Evidence gate/);
		    assert.match(proofPacketPageBeforeCrmSend, /GET is read-only/);
		    assert.match(proofPacketPageBeforeCrmSend, /Queue action/);
		    const proofPacketMarkdownBeforeCrmSend = await getProtectedText(`/api/v1/launch/proof-packet?client=${betaClient.id}&format=markdown`);
		    assert.match(proofPacketMarkdownBeforeCrmSend, /# Deal Threads First Proof Packet Workbench/);
		    assert.match(proofPacketMarkdownBeforeCrmSend, /Strict evidence ready: no/);
		    assert.match(proofPacketMarkdownBeforeCrmSend, /GET queues report delivery: no/);

		    const publicProofAfterFeedbackResponse = await fetch(betaClient.public_beta_proof_url);
	    assert.equal(publicProofAfterFeedbackResponse.status, 200);
	    const publicProofAfterFeedbackHtml = await publicProofAfterFeedbackResponse.text();
	    assert.match(publicProofAfterFeedbackHtml, /Rep reviews<\/span><b>1<\/b>/);
	    assert.match(publicProofAfterFeedbackHtml, /Avg usefulness<\/span><b>4\.5\/5<\/b>/);
	    assert.match(publicProofAfterFeedbackHtml, /Source evidence/);
	    assert.doesNotMatch(publicProofAfterFeedbackHtml, new RegExp(lead.id));
	    assert.doesNotMatch(publicProofAfterFeedbackHtml, /\/crm\//);
	    assert.doesNotMatch(publicProofAfterFeedbackHtml, /\/api\/v1\//);

	    const publicProofMarkdownResponse = await fetch(`${betaClient.public_beta_proof_url}&format=markdown`);
	    assert.equal(publicProofMarkdownResponse.status, 200);
	    const publicProofMarkdown = await publicProofMarkdownResponse.text();
	    assert.match(publicProofMarkdown, /# Beta Proof Report/);
	    assert.match(publicProofMarkdown, /Average usefulness: 4\.5\/5/);
	    assert.match(publicProofMarkdown, /No paid enrichment provider spend is included/);
	    assert.doesNotMatch(publicProofMarkdown, new RegExp(lead.id));
	    assert.doesNotMatch(publicProofMarkdown, /\/crm\//);
	    assert.doesNotMatch(publicProofMarkdown, /\/api\/v1\//);

    const betaClientAfterPublicFeedback = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/readiness`);
    assert.ok(betaClientAfterPublicFeedback.readiness.checks.some((check) => check.key === "rep_feedback_collection" && check.status === "pass"));

    const sentCrmDelivery = await postProtectedJson(`/api/v1/leads/${lead.id}/crm-delivery/send`, {
      note: "Dry-run sent to the pilot CRM."
    });
    assert.equal(sentCrmDelivery.delivery.status, "sent");
	    assert.equal(sentCrmDelivery.delivery.sent_via, "dry_run");
	    assert.equal(sentCrmDelivery.delivery.provider_message_id, `dry_run_${crmDeliveryId}`);
	    assert.equal(sentCrmDelivery.delivery.send_attempt_count, 1);
	    assert.equal(sentCrmDelivery.crm_adapter.transmits_external_crm, false);
	    assert.equal(sentCrmDelivery.lead.crm_handoff.status, "sent");
	    const installQueueAfterCrmSend = await getProtectedJson("/api/v1/launch/install-queue");
	    const installQueueAfterCrmSendItem = installQueueAfterCrmSend.queue.find((item) => item.beta_client_id === betaClient.id);
	    assert.ok(installQueueAfterCrmSendItem);
	    assert.ok(installQueueAfterCrmSendItem.proof_preflight.checks.some((check) => check.key === "crm_handoff_proof" && check.status === "pass"));
	    assert.equal(installQueueAfterCrmSendItem.proof_preflight.ready_for_first_proof_packet, true);
	    assert.equal(installQueueAfterCrmSendItem.proof_preflight.ready_for_live_proof_claim, false);

	    const profileHandoffAfterCrmSend = await getProtectedJson(`/api/v1/launch/profile-handoff?client=${betaClient.id}&lead=${lead.id}`);
	    assert.equal(profileHandoffAfterCrmSend.status, "proof_packet_ready");
	    assert.equal(profileHandoffAfterCrmSend.summary.crm_handoff_sent, true);
	    assert.equal(profileHandoffAfterCrmSend.summary.rep_feedback_reviewed, true);
	    assert.equal(profileHandoffAfterCrmSend.current_action.key, "assemble_proof_packet");
	    assert.ok(profileHandoffAfterCrmSend.handoff_checklist.some((item) => item.key === "crm_handoff_proof" && item.status === "pass"));
	    assert.ok(profileHandoffAfterCrmSend.handoff_checklist.some((item) => item.key === "rep_feedback" && item.status === "pass"));

	    const proofPacketReady = await getProtectedJson(`/api/v1/launch/proof-packet?client=${betaClient.id}`);
	    assert.equal(proofPacketReady.type, "deal_threads.launch_first_proof_packet_workbench.v1");
	    assert.equal(proofPacketReady.status, "ready_to_queue_first_proof_packet");
	    assert.equal(proofPacketReady.summary.strict_evidence_ready, true);
	    assert.equal(proofPacketReady.summary.beta_profiles, 1);
	    assert.equal(proofPacketReady.summary.crm_handoffs, 1);
	    assert.equal(proofPacketReady.summary.rep_feedback_reviews, 1);
	    assert.equal(proofPacketReady.summary.proof_packets_queued, 0);
	    assert.equal(proofPacketReady.summary.proof_packets_sent, 0);
	    assert.equal(proofPacketReady.actions.queue.ready, true);
	    assert.match(proofPacketReady.actions.queue.api_url, new RegExp(`/api/v1/launch/proof-packet/${betaClient.id}/queue$`));
	    assert.equal(proofPacketReady.actions.queue.sends_from_server, false);
	    assert.equal(proofPacketReady.actions.queue.preview_only_on_get, true);
	    assert.ok(proofPacketReady.actions.manual_email.mailto_url.startsWith("mailto:"));
	    assert.equal(proofPacketReady.buyer_safe_packet.summary.buyer_profiles, 1);
	    assert.equal(proofPacketReady.buyer_safe_packet.public_safety.includes_lead_ids, false);
	    assert.equal(JSON.stringify(proofPacketReady.buyer_safe_packet).includes(lead.id), false);
	    const proofPacketReadyPage = await getProtectedText(`/launch/proof-packet?client=${betaClient.id}`);
	    assert.match(proofPacketReadyPage, /Queue first proof packet/);
	    assert.match(proofPacketReadyPage, /Buyer-safe packet preview/);
	    assert.match(proofPacketReadyPage, /No CRM transmission, paid lookup, or live-proof claim runs here/i);
	    const proofPacketReadyMarkdown = await getProtectedText(`/api/v1/launch/proof-packet?client=${betaClient.id}&format=markdown`);
	    assert.match(proofPacketReadyMarkdown, /Strict evidence ready: yes/);
	    assert.match(proofPacketReadyMarkdown, /Queue ready: yes/);
	    assert.match(proofPacketReadyMarkdown, /Manual email draft: mailto:/);

	    const marketLaunchAfterProofReady = await getProtectedJson("/api/v1/launch/market-ready");
	    assert.equal(marketLaunchAfterProofReady.launch_clearance_plan.current_stage, "live_proof_clearance");
	    const proofPacketMarketAction = marketLaunchAfterProofReady.launch_clearance_plan.current_action;
	    assert.equal(proofPacketMarketAction.key, "queue_first_proof_packet");
	    assert.equal(proofPacketMarketAction.packet_kind, "proof_packet");
	    assert.equal(proofPacketMarketAction.proof_focus, "live_proof_gate");
	    assert.equal(proofPacketMarketAction.beta_client_id, betaClient.id);
	    assert.equal(proofPacketMarketAction.primary_surface_method, "GET");
	    assert.match(proofPacketMarketAction.primary_surface_url, new RegExp(`/launch/proof-packet\\?client=${betaClient.id}$`));
	    assert.equal(proofPacketMarketAction.operator_post_method, "POST");
	    assert.match(proofPacketMarketAction.operator_post_url, new RegExp(`/launch/proof-packet/${betaClient.id}/queue$`));
	    assert.match(proofPacketMarketAction.operator_post_api_url, new RegExp(`/api/v1/launch/proof-packet/${betaClient.id}/queue$`));
	    const proofPacketMarketPreflight = proofPacketMarketAction.proof_packet_preflight;
	    assert.equal(proofPacketMarketPreflight.type, "deal_threads.market_first_proof_packet_preflight.v1");
	    assert.equal(proofPacketMarketPreflight.status, "ready_to_queue_first_proof_packet");
	    assert.equal(proofPacketMarketPreflight.ready_to_queue_first_proof_packet, true);
	    assert.equal(proofPacketMarketPreflight.summary.strict_evidence_ready, true);
	    assert.equal(proofPacketMarketPreflight.summary.beta_profiles, 1);
	    assert.equal(proofPacketMarketPreflight.summary.crm_handoffs, 1);
	    assert.equal(proofPacketMarketPreflight.summary.rep_feedback_reviews, 1);
	    assert.equal(proofPacketMarketPreflight.summary.proof_packets_queued, 0);
	    assert.equal(proofPacketMarketPreflight.summary.proof_packets_sent, 0);
	    assert.equal(proofPacketMarketPreflight.summary.paid_lookups_recommended_now, 0);
	    assert.equal(proofPacketMarketPreflight.queue_surface.ready, true);
	    assert.equal(proofPacketMarketPreflight.queue_surface.method, "POST");
	    assert.equal(proofPacketMarketPreflight.queue_surface.sends_from_server, false);
	    assert.equal(proofPacketMarketPreflight.queue_surface.preview_only_on_get, true);
	    assert.ok(proofPacketMarketPreflight.manual_email.mailto_url.startsWith("mailto:"));
	    assert.ok(proofPacketMarketPreflight.checks.some((check) => check.key === "explicit_queue_post" && check.status === "pass"));
	    assert.ok(proofPacketMarketPreflight.evidence_required.some((item) => item.key === "explicit_queue_post" && item.required));
	    assert.ok(proofPacketMarketPreflight.evidence_required.some((item) => item.key === "manual_sent_record" && !item.required));
	    assert.ok(proofPacketMarketPreflight.evidence_required.some((item) => item.key === "live_proof_after_packet" && !item.required));
	    assert.equal(proofPacketMarketPreflight.safety.read_only_get, true);
	    assert.equal(proofPacketMarketPreflight.safety.queues_report_delivery_on_get, false);
	    assert.equal(proofPacketMarketPreflight.safety.marks_report_sent_on_get, false);
	    assert.equal(proofPacketMarketPreflight.safety.queue_requires_post, true);
	    assert.equal(proofPacketMarketPreflight.safety.manual_sent_record_requires_post, true);
	    assert.equal(proofPacketMarketPreflight.safety.operator_post_sends_from_server, false);
	    assert.equal(proofPacketMarketAction.first_proof_packet_preflight.type, proofPacketMarketPreflight.type);
	    assert.equal(proofPacketMarketAction.proof_packet_evidence_contract.length, proofPacketMarketPreflight.evidence_required.length);
	    assert.equal(proofPacketMarketAction.safety.queues_report_delivery_on_get, false);
	    assert.equal(proofPacketMarketAction.safety.queue_requires_post, true);
	    assert.equal(proofPacketMarketAction.safety.operator_post_sends_from_server, false);
	    const marketLaunchAfterProofReadyMarkdown = await getProtectedText("/api/v1/launch/market-ready?format=markdown");
	    assert.match(marketLaunchAfterProofReadyMarkdown, /Current action: Queue first proof packet/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /First proof packet preflight: Ready To Queue First Proof Packet/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /First proof packet ready to queue: yes/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /First proof packet strict evidence ready: yes/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /First proof packet queue requires POST: yes/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /First proof packet manual sent requires POST: yes/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /First proof packet paid lookups recommended now: 0/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /#### First Proof Packet Preflight/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /Evidence explicit_queue_post: required/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /Evidence manual_sent_record: recommended/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /Evidence live_proof_after_packet: recommended/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /#### First Proof Packet Queue Preview/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /Sends from server: no/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /Preview only on GET: yes/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /#### First Proof Packet Email Preview/);
	    assert.match(marketLaunchAfterProofReadyMarkdown, /#### First Proof Packet Links/);
	    const marketLaunchAfterProofReadyPage = await getProtectedText("/launch/market-ready");
	    assert.match(marketLaunchAfterProofReadyPage, /First proof packet preflight/);
	    assert.match(marketLaunchAfterProofReadyPage, /First proof packet evidence/);
	    assert.match(marketLaunchAfterProofReadyPage, /First proof packet queue preview/);
	    assert.match(marketLaunchAfterProofReadyPage, /First proof packet email preview/);

    const crmDeliveriesAfterSend = await getProtectedJson("/api/v1/crm-deliveries");
    assert.equal(crmDeliveriesAfterSend.summary.queued, 0);
    assert.equal(crmDeliveriesAfterSend.summary.sent, 1);

    const emptyCrmQueueRun = await postProtectedJson("/api/v1/crm-deliveries/send-queued", { limit: 10 });
    assert.equal(emptyCrmQueueRun.considered, 0);
    assert.equal(emptyCrmQueueRun.sent, 0);
    assert.equal(emptyCrmQueueRun.deliveries.summary.sent, 1);

    const repAlerts = await getProtectedJson("/api/v1/rep-alerts");
    assert.equal(repAlerts.count, 1);
    assert.equal(repAlerts.summary.queued, 1);
    assert.equal(repAlerts.summary.sent, 0);
    assert.equal(repAlerts.email_adapter.mode, "dry_run");
    assert.equal(repAlerts.email_adapter.transmits_external_email, false);
    assert.equal(repAlerts.alerts[0].lead_id, lead.id);
    assert.deepEqual(repAlerts.alerts[0].recipients, ["pilot-ae@example.com"]);
    assert.equal(repAlerts.alerts[0].lead.owner_email, "pilot-ae@example.com");

    const repAlertId = repAlerts.alerts[0].id;
    const repAlertDetail = await getProtectedJson(`/api/v1/rep-alerts/${repAlertId}`);
    assert.equal(repAlertDetail.status, "queued");
    assert.equal(repAlertDetail.lead.profile_url, `/crm/${lead.id}`);

    const sentRepAlert = await postProtectedJson(`/api/v1/rep-alerts/${repAlertId}/send`, {});
    assert.equal(sentRepAlert.alert.status, "sent");
    assert.equal(sentRepAlert.alert.sent_via, "dry_run");
    assert.equal(sentRepAlert.alert.provider_message_id, `dry_run_${repAlertId}`);
    assert.equal(sentRepAlert.alert.send_attempt_count, 1);

    const repAlertsAfterSend = await getProtectedJson("/api/v1/rep-alerts");
    assert.equal(repAlertsAfterSend.summary.queued, 0);
    assert.equal(repAlertsAfterSend.summary.sent, 1);

    const hubSpotPreview = await getProtectedJson(`/api/v1/leads/${lead.id}/hubspot-preview`);
    assert.equal(hubSpotPreview.leadProfileId, lead.id);
    assert.equal(hubSpotPreview.preview.mode, "stubbed");
    assert.equal(hubSpotPreview.preview.eligible, true);
    assert.equal(hubSpotPreview.preview.dry_run, true);
    assert.equal(hubSpotPreview.preview.operations.find((operation) => operation.object_type === "contacts").properties.email, "dana@regressionco.test");
    assert.equal(hubSpotPreview.preview.operations.find((operation) => operation.object_type === "companies").properties.domain, "regressionco.test");
    assert.match(hubSpotPreview.preview.operations.find((operation) => operation.object_type === "notes").properties.hs_note_body, /Deal Threads AI Lead Profile/);

    const hubSpotQueue = await getProtectedJson("/api/v1/hubspot/sync-queue");
    assert.equal(hubSpotQueue.mode, "stubbed");
    assert.equal(hubSpotQueue.dry_run, true);
    assert.equal(hubSpotQueue.unsynced_count, 1);
    assert.equal(hubSpotQueue.eligible_count, 1);
    assert.equal(hubSpotQueue.items[0].preview_url, `/api/v1/leads/${lead.id}/hubspot-preview`);

    const hubSpotQueueRun = await postProtectedJson("/api/v1/hubspot/sync-queue/run", { limit: 10 });
    assert.equal(hubSpotQueueRun.dry_run, true);
    assert.equal(hubSpotQueueRun.would_sync, 1);
    assert.equal(hubSpotQueueRun.attempted, 0);
    assert.equal(hubSpotQueueRun.results[0].status, "would_sync");

    const launchReadiness = await getProtectedJson("/api/v1/admin/beta-readiness");
    assert.equal(launchReadiness.status, "needs_attention");
    assert.equal(launchReadiness.summary.blocker, 0);
    assert.ok(launchReadiness.summary.warning > 0);
    assert.equal(launchReadiness.cohort.beta_clients, 1);
    assert.equal(launchReadiness.cohort.beta_leads, 1);
    assert.equal(launchReadiness.cohort.rep_alerts_sent, 1);
    assert.ok(launchReadiness.checks.some((check) => check.key === "hubspot_mode" && check.status === "warning"));
    assert.ok(launchReadiness.checks.some((check) => check.key === "rep_alerts" && check.status === "pass"));
    assert.ok(launchReadiness.checks.some((check) => check.key === "generic_crm_delivery" && check.status === "pass"));
    assert.ok(launchReadiness.checks.some((check) => check.key === "state_backup" && check.status === "pass"));
    assert.ok(launchReadiness.checks.some((check) => check.key === "client_readiness" && check.status === "pass"));

    const workflowUpdate = await postProtectedJson(`/api/v1/leads/${lead.id}/workflow`, {
      stage: "contacted",
      ownerEmail: "closing-ae@example.com",
      nextAction: "Send recap and book the technical discovery call.",
      dueAt: "2020-01-01T00:00:00.000Z",
      note: "Left voicemail and sent a tailored follow-up."
    });
    assert.equal(workflowUpdate.workflow.stage, "contacted");
    assert.equal(workflowUpdate.workflow.owner_email, "closing-ae@example.com");
    assert.equal(workflowUpdate.workflow.notes[0].body, "Left voicemail and sent a tailored follow-up.");
    assert.equal(workflowUpdate.outcome.status, "contacted");
    assert.ok(workflowUpdate.outcome.first_contacted_at);
    assert.equal(workflowUpdate.changed, true);

    const invalidWorkflow = await fetch(`${BASE_URL}/api/v1/leads/${lead.id}/workflow`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: ADMIN_AUTH_HEADER
      },
      body: JSON.stringify({ stage: "maybe_later" })
    });
    assert.equal(invalidWorkflow.status, 400);

    const updatedLead = await getProtectedJson(`/api/v1/leads/${lead.id}`);
    assert.equal(updatedLead.workflow.stage, "contacted");
    assert.equal(updatedLead.workflow.activity[0].type, "workflow_update");
    assert.equal(updatedLead.workflow.due_at, "2020-01-01T00:00:00.000Z");
    assert.equal(updatedLead.outcome.status, "contacted");

    const memoryBeforeCorrection = await getProtectedJson("/api/v1/enrichment/memory");
    assert.equal(memoryBeforeCorrection.count, 1);
    assert.equal(memoryBeforeCorrection.records[0].domain, "regressionco.test");
    assert.equal(memoryBeforeCorrection.records[0].lead_count, 1);
    assert.equal(memoryBeforeCorrection.cache_hits, 0);

    const correctedMemory = await postProtectedJson(`/api/v1/leads/${lead.id}/company-memory`, {
      companyName: "RegressionCo",
      industry: "B2B SaaS",
      companySize: "101-250",
      techStack: "HubSpot, Segment",
      signals: "Manual ICP fit confirmed",
      note: "Verified during first discovery call."
    });
    assert.equal(correctedMemory.memory.domain, "regressionco.test");
    assert.equal(correctedMemory.memory.industry, "B2B SaaS");
    assert.equal(correctedMemory.memory.company_size, "101-250");
    assert.ok(correctedMemory.memory.corrected_fields.includes("industry"));
    assert.ok(correctedMemory.memory.corrected_fields.includes("company_size"));
    assert.ok(correctedMemory.memory.corrected_fields.includes("tech_stack"));
    assert.equal(correctedMemory.lead.company.industry, "B2B SaaS");
    assert.equal(correctedMemory.lead.company.employee_range, "101-250");

    const memoryDetail = await getProtectedJson("/api/v1/enrichment/memory/regressionco.test");
    assert.equal(memoryDetail.domain, "regressionco.test");
    assert.equal(memoryDetail.source, "operator_corrected_memory");
    assert.ok(memoryDetail.confidence >= 0.86);

    const leadList = await getProtectedJson("/api/v1/leads?stage=contacted&priority=high&sla=overdue&owner=closing");
    assert.equal(leadList.count, 1);
    assert.equal(leadList.leads[0].id, lead.id);
    assert.equal(leadList.leads[0].sla_status, "overdue");
    assert.equal(leadList.leads[0].outcome.status, "contacted");
    assert.equal(leadList.summary.by_stage.contacted, 1);
    assert.equal(leadList.summary.by_sla.overdue, 1);

    const leadCsv = await getProtectedText("/api/v1/leads/export.csv?stage=contacted&priority=high&sla=overdue&owner=closing");
    assert.match(leadCsv, /"lead_id","created_at","contact_name"/);
    assert.match(leadCsv, /"outcome_status","outcome_value","outcome_probability"/);
    assert.match(leadCsv, new RegExp(lead.id));
    assert.match(leadCsv, /"closing-ae@example.com"/);
    assert.match(leadCsv, /"overdue"/);

    const analytics = await getProtectedJson("/api/v1/analytics/summary");
    assert.equal(analytics.summary.total, 1);
    assert.equal(analytics.summary.by_priority.high, 1);
    assert.equal(analytics.summary.response.contacted, 1);
    assert.equal(analytics.summary.conversion.opportunities_created, 0);
    assert.equal(analytics.summary.pipeline.opportunity_value, 0);

    const linkedBetaClient = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
    assert.equal(linkedBetaClient.lead_count, 1);
    assert.equal(linkedBetaClient.status, "live");
    assert.equal(linkedBetaClient.checklist.find((item) => item.key === "widget_installed").checked, true);
    assert.equal(linkedBetaClient.checklist.find((item) => item.key === "test_lead_created").checked, true);
    assert.equal(linkedBetaClient.checklist.find((item) => item.key === "hubspot_ready").checked, true);
    assert.equal(linkedBetaClient.crm_delivery_count, 1);
    assert.equal(linkedBetaClient.latest_crm_delivery.status, "sent");
    assert.equal(linkedBetaClient.readiness.ready_for_live_beta, true);
    assert.ok(linkedBetaClient.readiness.next_actions.some((action) => action.includes("experiment hypothesis")));
    const crmProofWizard = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/launch-wizard`);
    assert.equal(crmProofWizard.wizard.current_phase, "live_ready");
    assert.equal(crmProofWizard.wizard.ready_for_live_beta, true);
    assert.equal(crmProofWizard.wizard.phases.find((phase) => phase.key === "crm_handoff").status, "pass");
    assert.match(linkedBetaClient.install_snippet, new RegExp(`data-beta-client-id="${betaClient.id}"`));

    const experiment = await postProtectedJson(`/api/v1/beta-clients/${betaClient.id}/experiments`, {
      title: "Ask budget before timeline",
      hypothesis: "If the widget asks budget earlier, reps can prioritize better-fit demo requests faster.",
      metric: "High-priority rate and first-touch speed",
      owner: "pilot-owner@example.com",
      status: "running",
      notes: "Run for the first weekly beta report."
    });
    assert.equal(experiment.experiment.title, "Ask budget before timeline");
    assert.equal(experiment.experiment.status, "running");
    assert.equal(experiment.beta_client.active_experiment_count, 1);
    assert.equal(experiment.beta_client.experiments.length, 1);

    const snapshot = await postProtectedJson(`/api/v1/beta-clients/${betaClient.id}/snapshots`, {
      days: 14,
      decision: "Iterate on budget wording",
      learnings: "One high-priority lead was captured, but follow-up is overdue."
    });
    assert.equal(snapshot.snapshot.period_days, 14);
    assert.equal(snapshot.snapshot.metrics.total_leads, 1);
    assert.equal(snapshot.snapshot.metrics.high_priority, 1);
    assert.equal(snapshot.snapshot.metrics.overdue, 1);
    assert.equal(snapshot.snapshot.decision, "Iterate on budget wording");
    assert.equal(snapshot.beta_client.outcome_snapshots.length, 1);
    assert.equal(snapshot.beta_client.latest_outcome_snapshot.id, snapshot.snapshot.id);

    const snapshotSummary = await getProtectedJson("/api/v1/pilot/snapshots");
    assert.equal(snapshotSummary.count, 1);
    assert.equal(snapshotSummary.summary.clients_with_snapshots, 1);
    assert.equal(snapshotSummary.summary.total_leads, 1);
    assert.equal(snapshotSummary.snapshots[0].id, snapshot.snapshot.id);
    assert.equal(snapshotSummary.snapshots[0].beta_client.id, betaClient.id);
    assert.equal(snapshotSummary.snapshots[0].experiments.latest.title, "Ask budget before timeline");

    const trendAfterOneSnapshot = await getProtectedJson("/api/v1/pilot/trends");
    assert.equal(trendAfterOneSnapshot.snapshot_count, 1);
    assert.equal(trendAfterOneSnapshot.comparable_clients, 0);
    assert.equal(trendAfterOneSnapshot.deltas.total_leads.delta, null);

    const snapshotCsv = await getProtectedText("/api/v1/pilot/snapshots?format=csv");
    assert.match(snapshotCsv, /"snapshot_id","beta_client_id","beta_client_name"/);
    assert.match(snapshotCsv, /"Ask budget before timeline"/);
    assert.match(snapshotCsv, /"Iterate on budget wording"/);

    const blockedClientReport = await fetch(`${BASE_URL}/api/v1/beta-clients/${betaClient.id}/report`);
    assert.equal(blockedClientReport.status, 401);

    const betaClients = await getProtectedJson("/api/v1/beta-clients");
    assert.equal(betaClients.count, 1);
    assert.equal(betaClients.summary.total_leads, 1);

    const pilotPage = await getProtectedText("/pilot");
    assert.match(pilotPage, /Pilot command center/);
    assert.match(pilotPage, /PilotCo Revenue Team/);

    const pilotBeforeReport = await getProtectedJson("/api/v1/pilot/summary");
    assert.equal(pilotBeforeReport.target_clients, 5);
    assert.equal(pilotBeforeReport.client_count, 1);
    assert.equal(pilotBeforeReport.setup_remaining, 4);
    assert.equal(pilotBeforeReport.leads.total, 1);
    assert.equal(pilotBeforeReport.leads.overdue, 1);
    assert.equal(pilotBeforeReport.health.blocked, 1);
    assert.equal(pilotBeforeReport.clients[0].id, betaClient.id);
    assert.equal(pilotBeforeReport.clients[0].risk_level, "blocked");
    assert.equal(pilotBeforeReport.clients[0].active_experiments, 1);
    assert.equal(pilotBeforeReport.clients[0].latest_outcome_snapshot.decision, "Iterate on budget wording");
    assert.ok(pilotBeforeReport.action_items.some((item) => item.action.includes("overdue")));

    const meetingBookedAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    const opportunityCreatedAt = new Date(Date.now() + 1000 * 60 * 90).toISOString();
    const meetingWorkflow = await postProtectedJson(`/api/v1/leads/${lead.id}/workflow`, {
      stage: "meeting_booked",
      ownerEmail: "closing-ae@example.com",
      nextAction: "Prepare mutual action plan after the booked meeting.",
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      outcomeStatus: "opportunity_created",
      outcomeValue: "45000",
      outcomeProbability: "40",
      meetingBookedAt,
      opportunityCreatedAt,
      note: "Meeting booked after the first beta review."
    });
    assert.equal(meetingWorkflow.workflow.stage, "meeting_booked");
    assert.equal(meetingWorkflow.outcome.status, "opportunity_created");
    assert.equal(meetingWorkflow.outcome.value, 45000);
    assert.equal(meetingWorkflow.outcome.probability, 0.4);
    assert.equal(meetingWorkflow.outcome.meeting_booked_at, meetingBookedAt);
    assert.equal(meetingWorkflow.outcome.opportunity_created_at, opportunityCreatedAt);

    const secondSnapshot = await postProtectedJson(`/api/v1/beta-clients/${betaClient.id}/snapshots`, {
      days: 14,
      decision: "Keep budget-first routing",
      learnings: "Follow-up improved and the first meeting was booked."
    });
    assert.equal(secondSnapshot.snapshot.metrics.meetings_booked, 1);
    assert.equal(secondSnapshot.snapshot.metrics.opportunities_created, 1);
    assert.equal(secondSnapshot.snapshot.metrics.opportunity_value, 45000);
    assert.equal(secondSnapshot.snapshot.metrics.expected_value, 18000);
    assert.equal(secondSnapshot.snapshot.metrics.overdue, 0);

    const trendAfterTwoSnapshots = await getProtectedJson("/api/v1/pilot/trends");
    assert.equal(trendAfterTwoSnapshots.snapshot_count, 2);
    assert.equal(trendAfterTwoSnapshots.comparable_clients, 1);
    assert.equal(trendAfterTwoSnapshots.current.metrics.meetings_booked, 1);
    assert.equal(trendAfterTwoSnapshots.current.metrics.opportunities_created, 1);
    assert.equal(trendAfterTwoSnapshots.current.metrics.opportunity_value, 45000);
    assert.equal(trendAfterTwoSnapshots.previous.metrics.meetings_booked, 0);
    assert.equal(trendAfterTwoSnapshots.previous.metrics.opportunities_created, 0);
    assert.equal(trendAfterTwoSnapshots.deltas.meetings_booked.delta, 1);
    assert.equal(trendAfterTwoSnapshots.deltas.meetings_booked.direction, "improved");
    assert.equal(trendAfterTwoSnapshots.deltas.opportunities_created.delta, 1);
    assert.equal(trendAfterTwoSnapshots.deltas.opportunity_value.delta, 45000);
    assert.equal(trendAfterTwoSnapshots.deltas.opportunity_value.direction, "improved");
    assert.equal(trendAfterTwoSnapshots.deltas.overdue.delta, -1);
    assert.equal(trendAfterTwoSnapshots.deltas.overdue.direction, "improved");

    const enrichmentSummary = await getProtectedJson("/api/v1/enrichment/summary");
    assert.equal(enrichmentSummary.provider_gate.default_mode, "internal_first");
    assert.equal(enrichmentSummary.provider_gate.paid_lookup_allowed_by_default, false);
    assert.equal(enrichmentSummary.total_profiles, 1);
    assert.equal(enrichmentSummary.memory.count, 1);
    assert.equal(enrichmentSummary.memory.corrected_records, 1);
    assert.equal(enrichmentSummary.memory.cache_hits, 0);
    assert.equal(enrichmentSummary.cost.paid_provider_spend, 0);
    assert.equal(enrichmentSummary.cost.estimated_provider_spend_if_all_paid, 0.25);
    assert.equal(enrichmentSummary.quality.buyer_profiles, 1);
    assert.equal(enrichmentSummary.quality.buying_committee_profiles, 1);
    assert.equal(enrichmentSummary.quality.buying_trigger_profiles, 1);
    assert.equal(enrichmentSummary.quality.high_priority_review_candidates, 1);
    assert.equal(enrichmentSummary.quality.reviewed_profiles, 0);
    assert.equal(enrichmentSummary.review_queue[0].review_status, "pending");
    assert.equal(enrichmentSummary.field_coverage.find((item) => item.key === "company_domain").count, 1);
    assert.equal(enrichmentSummary.field_coverage.find((item) => item.key === "buyer_profile").count, 1);
    assert.equal(enrichmentSummary.field_coverage.find((item) => item.key === "buying_committee").count, 1);
    assert.ok(enrichmentSummary.top_buying_roles.some((item) => item.value.includes("Revenue Operations")));
    assert.ok(enrichmentSummary.top_buying_triggers.some((item) => item.value.includes("Speed-to-lead")));
    assert.ok(enrichmentSummary.recommended_actions.some((action) => action.includes("paid enrichment disabled")));

    const researchNeeded = await postProtectedJson(`/api/v1/leads/${lead.id}/enrichment-review`, {
      status: "research_needed",
      note: "Need to confirm decision makers from public sources before any paid lookup."
    });
    assert.equal(researchNeeded.review.status, "research_needed");
    assert.equal(researchNeeded.review.notes[0].body, "Need to confirm decision makers from public sources before any paid lookup.");

    const enrichmentSummaryWithResearch = await getProtectedJson("/api/v1/enrichment/summary");
    assert.equal(enrichmentSummaryWithResearch.quality.high_priority_review_candidates, 1);
    assert.equal(enrichmentSummaryWithResearch.quality.research_needed_profiles, 1);
    assert.equal(enrichmentSummaryWithResearch.review_queue[0].review_status, "research_needed");
    assert.ok(enrichmentSummaryWithResearch.recommended_actions.some((action) => action.includes("manual research notes")));

    const buildPlan = await getProtectedJson("/api/v1/enrichment/build-plan");
    assert.match(buildPlan.recommendation, /Stay providerless/);
    assert.equal(buildPlan.cost_model.current_paid_spend, 0);
    assert.equal(buildPlan.cost_model.estimated_spend_if_every_profile_were_paid, 0.25);
    assert.equal(buildPlan.paid_escalation_policy.allowed_by_default, false);
    assert.equal(buildPlan.paid_escalation_policy.manual_approval_required, true);
    assert.equal(buildPlan.paid_escalation_policy.recommended_paid_lookups_now, 0);
    assert.ok(buildPlan.internal_source_stack.includes("Inferred buyer profile, buying committee, and rep opening angle"));
    assert.ok(buildPlan.internal_source_stack.includes("Public-site role and contact cues from team, about, contact, and leadership pages"));
    assert.ok(buildPlan.internal_source_stack.includes("Operator research evidence with source URLs and confidence"));
    assert.ok(buildPlan.internal_source_stack.includes("Operator-corrected company memory"));
    assert.ok(buildPlan.stages.some((stage) => stage.key === "company_memory" && stage.status === "needs_tuning"));
    assert.ok(buildPlan.stages.some((stage) => stage.key === "paid_provider_firewall" && stage.status === "healthy"));
	    assert.ok(buildPlan.quality_gates.some((gate) => gate.label === "Paid-provider spend" && gate.passed));
    assert.ok(buildPlan.quality_gates.some((gate) => gate.label === "Research evidence coverage"));
	    assert.ok(buildPlan.review_reason_breakdown.length);
	    assert.ok(buildPlan.review_reason_breakdown.every((item) => item.count > 0));

    const unsafePreflight = await postProtectedJson("/api/v1/enrichment/preflight", {
      companyName: "Private Network Target",
      website: "http://127.0.0.1/admin",
      businessNeed: "Validate providerless account preflight without paid enrichment.",
      crm: "HubSpot",
      saveMemory: true
    });
    assert.equal(unsafePreflight.type, "deal_threads.providerless_account_preflight.v1");
    assert.equal(unsafePreflight.status, "review_needed");
    assert.equal(unsafePreflight.summary.enrichment_status, "fallback");
    assert.equal(unsafePreflight.summary.provider, "internal_website_enrichment");
    assert.equal(unsafePreflight.summary.paid_provider_used, false);
    assert.equal(unsafePreflight.summary.estimated_usd, 0);
    assert.equal(unsafePreflight.company_memory.saved, false);
    assert.equal(unsafePreflight.company_memory.status, "skipped_unusable_preflight");
    assert.equal(unsafePreflight.safety.protected_operator_only, true);
    assert.equal(unsafePreflight.safety.requires_operator_post, true);
    assert.equal(unsafePreflight.safety.public_site_fetch_private_network_blocked, true);
    assert.equal(unsafePreflight.safety.sends_external_email, false);
    assert.equal(unsafePreflight.safety.transmits_external_crm, false);
    assert.equal(unsafePreflight.safety.creates_lead_profile, false);
    assert.equal(unsafePreflight.safety.creates_beta_client, false);
    assert.equal(unsafePreflight.safety.paid_provider_lookup_by_default, false);
    assert.equal(unsafePreflight.safety.paid_provider_used, false);
    assert.match(unsafePreflight.enrichment.notes.join(" "), /blocked/i);
    assert.ok(unsafePreflight.next_actions.some((item) => /Do not buy data yet/i.test(item)));

    const unsafePreflightMarkdownResponse = await fetch(`${BASE_URL}/api/v1/enrichment/preflight?format=markdown`, {
      method: "POST",
      headers: {
        authorization: ADMIN_AUTH_HEADER,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        companyName: "Private Network Target",
        website: "http://127.0.0.1/admin",
        businessNeed: "Validate providerless account preflight without paid enrichment."
      })
    });
    assert.equal(unsafePreflightMarkdownResponse.status, 200);
    const unsafePreflightMarkdown = await unsafePreflightMarkdownResponse.text();
    assert.match(unsafePreflightMarkdown, /# Providerless Account Preflight/);
    assert.match(unsafePreflightMarkdown, /Private network blocked: yes/);
    assert.match(unsafePreflightMarkdown, /Paid lookup by default: no/);

    const unsafePreflightPageResponse = await postProtectedForm("/enrichment/preflight", {
      companyName: "Private Network Target",
      website: "http://127.0.0.1/admin",
      businessNeed: "Validate providerless account preflight without paid enrichment.",
      saveMemory: "true"
    });
    assert.equal(unsafePreflightPageResponse.status, 200);
    const unsafePreflightPage = await unsafePreflightPageResponse.text();
    assert.match(unsafePreflightPage, /Providerless account preflight/);
    assert.match(unsafePreflightPage, /Paid provider used: no/);
    assert.match(unsafePreflightPage, /Company memory/);

	    const providerlessReviewQueue = await getProtectedJson("/api/v1/enrichment/review-queue");
	    assert.equal(providerlessReviewQueue.type, "deal_threads.providerless_review_queue.v1");
	    assert.equal(providerlessReviewQueue.safety.mutates_buyer_state_on_get, false);
	    assert.equal(providerlessReviewQueue.safety.sends_external_email_on_get, false);
	    assert.equal(providerlessReviewQueue.safety.transmits_external_crm_on_get, false);
	    assert.equal(providerlessReviewQueue.safety.paid_provider_lookup_by_default, false);
	    assert.equal(providerlessReviewQueue.summary.recommended_paid_lookups_now, 0);
	    assert.equal(providerlessReviewQueue.paid_firewall.allowed_by_default, false);
	    assert.equal(providerlessReviewQueue.paid_firewall.manual_approval_required, true);
	    const providerlessQueueItem = providerlessReviewQueue.items.find((item) => item.lead_id === lead.id);
	    assert.ok(providerlessQueueItem);
	    assert.equal(providerlessQueueItem.paid_lookup.recommended, false);
	    assert.ok(providerlessQueueItem.suggested_evidence.some((item) => /public|source|evidence|committee/i.test(item)));
	    assert.match(providerlessQueueItem.protected_links.crm_profile, new RegExp(`/crm/${lead.id}$`));
	    assert.match(providerlessQueueItem.protected_links.providerless_evidence, new RegExp(`/crm/${lead.id}/providerless-evidence$`));
	    assert.equal(providerlessReviewQueue.summary.high_priority_review_candidates, 1);
	    assert.ok(providerlessReviewQueue.reason_breakdown.length);
	    const providerlessReviewQueueMarkdown = await getProtectedText("/api/v1/enrichment/review-queue?format=markdown");
	    assert.match(providerlessReviewQueueMarkdown, /# Providerless Enrichment Review Queue/);
	    assert.match(providerlessReviewQueueMarkdown, /Recommended paid lookups now: 0/);
	    assert.match(providerlessReviewQueueMarkdown, /Paid lookup by default: no/);
	    const providerlessReviewQueuePage = await getProtectedText("/enrichment/review-queue");
	    assert.match(providerlessReviewQueuePage, /Providerless review queue/);
	    assert.match(providerlessReviewQueuePage, /No paid lookup is recommended by default/);
	    assert.match(providerlessReviewQueuePage, /GET is read-only: no email sends, buyer-state mutation, beta-client creation, CRM transmission, paid lookup, or live-proof claim/i);

	    const providerlessEvidence = await getProtectedJson(`/api/v1/leads/${lead.id}/providerless-evidence`);
	    assert.equal(providerlessEvidence.type, "deal_threads.providerless_lead_evidence.v1");
	    assert.equal(providerlessEvidence.lead_id, lead.id);
	    assert.equal(providerlessEvidence.summary.paid_lookup_recommended_now, 0);
	    assert.equal(providerlessEvidence.summary.research_evidence_count, 0);
	    assert.equal(providerlessEvidence.summary.conversion_surface_detected, false);
	    assert.equal(providerlessEvidence.conversion_surface.status, "not_detected");
	    assert.equal(providerlessEvidence.paid_lookup_firewall.recommended, false);
	    assert.equal(providerlessEvidence.paid_lookup_firewall.allowed_by_default, false);
	    assert.equal(providerlessEvidence.paid_lookup_firewall.manual_approval_required, true);
	    assert.equal(providerlessEvidence.safety.mutates_buyer_state_on_get, false);
	    assert.equal(providerlessEvidence.safety.sends_external_email_on_get, false);
	    assert.equal(providerlessEvidence.safety.creates_beta_client_on_get, false);
	    assert.equal(providerlessEvidence.safety.transmits_external_crm_on_get, false);
	    assert.equal(providerlessEvidence.safety.paid_provider_lookup_by_default, false);
	    assert.equal(providerlessEvidence.safety.live_proof_claimed, false);
	    assert.ok(providerlessEvidence.first_party_context.business_need);
	    assert.ok(providerlessEvidence.inferred_buyer_profile.icp_fit.score > 0);
	    assert.ok(providerlessEvidence.missing_evidence.some((item) => /evidence|source|committee|public/i.test(item)));
	    assert.match(providerlessEvidence.links.evidence_workbench, new RegExp(`/crm/${lead.id}/providerless-evidence$`));
	    assert.match(providerlessEvidence.links.evidence_markdown, new RegExp(`/api/v1/leads/${lead.id}/providerless-evidence\\?format=markdown$`));
	    assert.match(providerlessEvidence.copy_blocks.crm_note, /Paid lookup recommended now: 0/);
	    const providerlessEvidenceMarkdown = await getProtectedText(`/api/v1/leads/${lead.id}/providerless-evidence?format=markdown`);
	    assert.match(providerlessEvidenceMarkdown, /# Deal Threads Providerless Evidence Packet/);
	    assert.match(providerlessEvidenceMarkdown, /## Conversion Surface/);
	    assert.match(providerlessEvidenceMarkdown, /Paid lookup recommended now: 0/);
	    assert.match(providerlessEvidenceMarkdown, /GET sends external email: no/);
	    const providerlessEvidencePage = await getProtectedText(`/crm/${lead.id}/providerless-evidence`);
	    assert.match(providerlessEvidencePage, /Providerless evidence packet/);
	    assert.match(providerlessEvidencePage, /No email, CRM transmission, beta-client creation, paid lookup, buyer-state mutation, or live-proof claim runs on GET/);
	    assert.match(providerlessEvidencePage, /Paid lookup firewall/);
	    assert.match(providerlessEvidencePage, /Conversion surface/);
	    assert.match(providerlessEvidencePage, /Research evidence/);

	    const researchEvidence = await postProtectedJson(`/api/v1/leads/${lead.id}/research-evidence`, {
      category: "buying_committee",
      value: "VP Revenue Operations is listed as the owner of inbound routing.",
      sourceUrl: "https://pilotco.test/team",
      sourceLabel: "PilotCo leadership page",
      confidence: 88,
      note: "Public page confirms the RevOps owner before any paid lookup.",
      reusable: true,
      markReviewed: true
    });
    assert.equal(researchEvidence.leadProfileId, lead.id);
    assert.equal(researchEvidence.evidence.category, "buying_committee");
    assert.equal(researchEvidence.evidence.source_url, "https://pilotco.test/team");
    assert.equal(researchEvidence.review.status, "reviewed");
    assert.ok(researchEvidence.lead.enrichment.research_evidence.some((item) => item.value.includes("VP Revenue Operations")));
    assert.ok(
      researchEvidence.lead.enrichment.decision_makers.some((item) =>
        String(item.value || item.title || item.role || "").includes("VP Revenue Operations")
      )
    );
    assert.ok(researchEvidence.memory.research_evidence.some((item) => item.source_url === "https://pilotco.test/team"));
    assert.ok(researchEvidence.memory.corrected_fields.includes("signals"));

    const enrichmentSummaryAfterEvidence = await getProtectedJson("/api/v1/enrichment/summary");
    assert.equal(enrichmentSummaryAfterEvidence.quality.research_evidence_profiles, 1);
    assert.equal(enrichmentSummaryAfterEvidence.quality.research_evidence_count, 1);
    assert.equal(enrichmentSummaryAfterEvidence.quality.reusable_research_evidence, 1);
    assert.equal(enrichmentSummaryAfterEvidence.quality.reviewed_profiles, 1);
    assert.ok(enrichmentSummaryAfterEvidence.top_research_categories.some((item) => item.value === "Buying committee"));
    assert.ok(enrichmentSummaryAfterEvidence.research_evidence[0].value.includes("VP Revenue Operations"));
    assert.equal(enrichmentSummaryAfterEvidence.memory.research_evidence_count, 1);

    const providerlessEvidenceAfterResearch = await getProtectedJson(`/api/v1/leads/${lead.id}/providerless-evidence`);
    assert.equal(providerlessEvidenceAfterResearch.summary.research_evidence_count, 1);
    assert.equal(providerlessEvidenceAfterResearch.summary.reusable_research_evidence, 1);
    assert.equal(providerlessEvidenceAfterResearch.company_memory.status, "usable");
    assert.equal(providerlessEvidenceAfterResearch.paid_lookup_firewall.recommended_paid_lookups_now, 0);

    const reviewed = await postProtectedJson(`/api/v1/leads/${lead.id}/enrichment-review`, {
      status: "reviewed",
      note: "Manual research completed; public site and memory are enough for beta follow-up."
    });
    assert.equal(reviewed.review.status, "reviewed");
    assert.equal(reviewed.review.reviewed_by, ADMIN_USERNAME);

    const enrichmentSummaryAfterReview = await getProtectedJson("/api/v1/enrichment/summary");
    assert.equal(enrichmentSummaryAfterReview.quality.review_candidates, 0);
    assert.equal(enrichmentSummaryAfterReview.quality.high_priority_review_candidates, 0);
    assert.equal(enrichmentSummaryAfterReview.quality.reviewed_profiles, 1);

    const repFeedback = await postProtectedJson(`/api/v1/leads/${lead.id}/rep-feedback`, {
      status: "missing_context",
      usefulnessScore: 3.5,
      repConfidence: "medium",
      usedOnCall: true,
      missingFields: ["budget", "authority", "source_evidence"],
      missingContextNote: "Rep still needed budget owner and evidence source before the first call."
    });
    assert.equal(repFeedback.leadProfileId, lead.id);
    assert.equal(repFeedback.feedback.status, "missing_context");
    assert.equal(repFeedback.feedback.usefulness_score, 3.5);
    assert.equal(repFeedback.feedback.rep_confidence, "medium");
    assert.equal(repFeedback.feedback.used_on_call, true);
    assert.deepEqual(repFeedback.feedback.missing_fields, ["budget", "authority", "source_evidence"]);
    assert.equal(repFeedback.summary.reviewed_profiles, 1);
    assert.equal(repFeedback.summary.missing_context_profiles, 1);

    const invalidRepFeedback = await fetch(`${BASE_URL}/api/v1/leads/${lead.id}/rep-feedback`, {
      method: "POST",
      headers: {
        authorization: ADMIN_AUTH_HEADER,
        "content-type": "application/json"
      },
      body: JSON.stringify({ status: "almost_helpful", usefulnessScore: 7 })
    });
    assert.equal(invalidRepFeedback.status, 400);

	    const leadAfterRepFeedback = await getProtectedJson(`/api/v1/leads/${lead.id}`);
	    assert.equal(leadAfterRepFeedback.rep_feedback.status, "missing_context");
	    assert.equal(leadAfterRepFeedback.rep_feedback.history.length, 2);
	    assert.equal(leadAfterRepFeedback.workflow.activity[0].type, "rep_feedback");

    const feedbackLeadCsv = await getProtectedText("/api/v1/leads/export.csv");
    assert.match(feedbackLeadCsv, /"rep_feedback_status"/);
    assert.match(feedbackLeadCsv, /"missing_context"/);
    assert.match(feedbackLeadCsv, /"Budget; Authority; Source evidence"/);

    const buildPlanAfterRepFeedback = await getProtectedJson("/api/v1/enrichment/build-plan");
    const budgetDecision = buildPlanAfterRepFeedback.field_level_strategy.find((field) => field.key === "budget");
    const sourceEvidenceDecision = buildPlanAfterRepFeedback.field_level_strategy.find((field) => field.key === "source_evidence");
    assert.equal(budgetDecision.rep_missing_count, 1);
    assert.equal(budgetDecision.decision, "build_now");
    assert.match(budgetDecision.build_move, /budget/i);
    assert.equal(sourceEvidenceDecision.rep_missing_count, 1);
    assert.equal(sourceEvidenceDecision.decision, "add_source_evidence");
    assert.equal(sourceEvidenceDecision.evidence_count, 1);
    assert.match(sourceEvidenceDecision.paid_provider_trigger, /paid lookup/i);

    const enrichmentPage = await getProtectedText("/enrichment");
    assert.match(enrichmentPage, /Build ourselves plan/);
    assert.match(enrichmentPage, /Providerless account preflight/);
    assert.match(enrichmentPage, /Run providerless preflight/);
    assert.match(enrichmentPage, /Field build-vs-buy decisions/);
    assert.match(enrichmentPage, /Internal source stack/);
    assert.match(enrichmentPage, /Paid escalation criteria/);
    assert.match(enrichmentPage, /Build internally now/);
    assert.match(enrichmentPage, /Add source evidence/);
    assert.match(enrichmentPage, /Research evidence workspace/);
    assert.match(enrichmentPage, /VP Revenue Operations is listed/);
    assert.match(enrichmentPage, /Likely buying roles/);
    assert.match(enrichmentPage, /Buying triggers/);
    assert.match(enrichmentPage, /Reviewed/);
    assert.match(enrichmentPage, /Stay providerless/);

    const betaReport = await getProtectedJson("/api/v1/reports/beta-summary?days=14");
    assert.equal(betaReport.scope, "global");
    assert.equal(betaReport.period.days, 14);
    assert.equal(betaReport.summary.total, 1);
    assert.equal(betaReport.enrichment.estimated_paid_provider_spend, 0);
    assert.equal(betaReport.enrichment.paid_provider_used, false);
    assert.equal(betaReport.enrichment.buyer_profiles, 1);
    assert.equal(betaReport.enrichment.buying_committee_profiles, 1);
    assert.equal(betaReport.enrichment.buying_trigger_profiles, 1);
    assert.equal(betaReport.enrichment.research_evidence_profiles, 1);
    assert.equal(betaReport.enrichment.research_evidence_count, 1);
    assert.equal(betaReport.enrichment.review_queue, 0);
    assert.equal(betaReport.enrichment.reviewed_profiles, 1);
    assert.equal(betaReport.rep_feedback.reviewed_profiles, 1);
    assert.equal(betaReport.rep_feedback.missing_context_profiles, 1);
    assert.equal(betaReport.rep_feedback.helpful_profiles, 0);
    assert.equal(betaReport.rep_feedback.used_on_call_profiles, 1);
    assert.equal(betaReport.rep_feedback.average_usefulness_score, 3.5);
    assert.ok(betaReport.rep_feedback.top_missing_fields.some((item) => item.value === "Budget"));
    assert.equal(betaReport.summary.conversion.opportunities_created, 1);
    assert.equal(betaReport.summary.pipeline.opportunity_value, 45000);
    assert.equal(betaReport.summary.pipeline.expected_value, 18000);
    assert.equal(betaReport.lead_examples[0].outcome_status, "opportunity_created");
    assert.equal(betaReport.lead_examples[0].outcome_value, "45000.00");
    assert.equal(betaReport.lead_examples[0].id, lead.id);
    assert.ok(betaReport.recommended_actions.length);

    const markdownReport = await getProtectedText("/api/v1/reports/beta-summary?days=14&format=markdown");
    assert.match(markdownReport, /# Deal Threads Beta Report/);
    assert.match(markdownReport, /Total leads: 1/);
    assert.match(markdownReport, /Opportunities created: 1/);
    assert.match(markdownReport, /Pipeline value: \$45000\.00/);
    assert.match(markdownReport, /Expected value: \$18000\.00/);
    assert.match(markdownReport, /Buyer profiles: 1/);
    assert.match(markdownReport, /Buying committee profiles: 1/);
    assert.match(markdownReport, /Research evidence saved: 1/);
    assert.match(markdownReport, /Rep Feedback/);
    assert.match(markdownReport, /Missing-context profiles: 1/);
    assert.match(markdownReport, /Average usefulness score: 3\.5\/5/);
    assert.match(markdownReport, /Estimated paid-provider spend: \$0\.00/);

    const csvReport = await getProtectedText("/api/v1/reports/beta-summary?days=14&format=csv");
    assert.match(csvReport, /"section","metric","value","detail"/);
    assert.match(csvReport, /"lead_metrics","total","1",""/);
    assert.match(csvReport, /"lead_metrics","opportunities_created","1",""/);
    assert.match(csvReport, /"pipeline","opportunity_value","45000\.00",""/);
    assert.match(csvReport, /"pipeline","expected_value","18000\.00",""/);
    assert.match(csvReport, /"enrichment","buyer_profiles","1",""/);
    assert.match(csvReport, /"enrichment","research_evidence_count","1",""/);
    assert.match(csvReport, /"enrichment","estimated_paid_provider_spend","0\.00",""/);
    assert.match(csvReport, /"rep_feedback","reviewed_profiles","1",""/);
    assert.match(csvReport, /"rep_feedback","missing_context_profiles","1",""/);
    assert.match(csvReport, /"rep_feedback","average_usefulness_score","3\.5",""/);

    const clientReport = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/report?days=14`);
    assert.equal(clientReport.scope, "beta_client");
    assert.equal(clientReport.beta_client.id, betaClient.id);
    assert.equal(clientReport.beta_client.name, "PilotCo Revenue Team");
    assert.equal(clientReport.beta_client.total_leads, 1);
    assert.equal(clientReport.summary.total, 1);
    assert.equal(clientReport.summary.conversion.opportunities_created, 1);
    assert.equal(clientReport.summary.pipeline.opportunity_value, 45000);
    assert.equal(clientReport.rep_feedback.reviewed_profiles, 1);
    assert.equal(clientReport.rep_feedback.missing_context_profiles, 1);
    assert.equal(clientReport.lead_examples[0].id, lead.id);
    assert.match(clientReport.narrative, /PilotCo Revenue Team/);

    const clientMarkdownReport = await getProtectedText(`/api/v1/beta-clients/${betaClient.id}/report?days=14&format=markdown`);
    assert.match(clientMarkdownReport, /# Deal Threads Beta Report - PilotCo Revenue Team/);
    assert.match(clientMarkdownReport, /Scope: PilotCo Revenue Team/);
    assert.match(clientMarkdownReport, /Total leads: 1/);

    const clientCsvReport = await getProtectedText(`/api/v1/beta-clients/${betaClient.id}/report?days=14&format=csv`);
    assert.match(clientCsvReport, /"scope","beta_client","PilotCo Revenue Team","beta_[a-f0-9]+"/);
    assert.match(clientCsvReport, /"lead_metrics","total","1",""/);

    const proof = await getProtectedJson("/api/v1/proof/summary?days=14");
    assert.equal(proof.summary.client_count, 1);
    assert.equal(proof.summary.clients_with_baseline, 1);
    assert.equal(proof.summary.total_leads, 1);
    assert.equal(proof.summary.estimated_manual_research_hours_saved, 0.3);
    assert.equal(proof.summary.rep_feedback_reviewed, 1);
    assert.equal(proof.summary.rep_feedback_missing_context, 1);
    assert.equal(proof.summary.rep_feedback_average_usefulness_score, 3.5);
    assert.equal(proof.clients[0].beta_client.id, betaClient.id);
    assert.equal(proof.clients[0].baseline.minutes_to_first_contact, 120);
    assert.equal(proof.clients[0].current.opportunities_created, 1);
    assert.equal(proof.clients[0].current.rep_feedback.reviewed_profiles, 1);
    assert.equal(proof.clients[0].current.rep_feedback.missing_context_profiles, 1);
    assert.notEqual(proof.clients[0].proof_status, "missing_baseline");
    assert.ok(proof.clients[0].next_actions.length);

    const proofMarkdown = await getProtectedText("/api/v1/proof/summary?days=14&format=markdown");
    assert.match(proofMarkdown, /# Deal Threads Beta Proof/);
    assert.match(proofMarkdown, /PilotCo Revenue Team/);
    assert.match(proofMarkdown, /Total leads: 1/);
    assert.match(proofMarkdown, /Rep feedback reviewed: 1/);
    assert.match(proofMarkdown, /Rep feedback missing context: 1/);

	    const proofCsv = await getProtectedText("/api/v1/proof/summary?days=14&format=csv");
	    assert.match(proofCsv, /"section","metric","value","detail"/);
	    assert.match(proofCsv, /"summary","total_leads","1",""/);
	    assert.match(proofCsv, /"summary","rep_feedback_reviewed","1",""/);
	    assert.match(proofCsv, /"summary","rep_feedback_missing_context","1",""/);
	    assert.match(proofCsv, /"client","name","PilotCo Revenue Team","beta_[a-f0-9]+"/);

	    const liveGate = await getProtectedJson("/api/v1/proof/live-gate?days=14");
	    assert.equal(liveGate.live_ready, true);
	    assert.ok(["ready", "ready_with_disclosures"].includes(liveGate.status));
	    assert.equal(liveGate.summary.demo_scenario_active, false);
	    assert.equal(liveGate.summary.real_beta_clients, 1);
	    assert.equal(liveGate.summary.real_beta_leads, 1);
	    assert.equal(liveGate.summary.synthetic_leads, 0);
	    assert.equal(liveGate.proof.summary.total_leads, 1);
	    assert.ok(liveGate.actions.length);

	    const liveGateMarkdown = await getProtectedText("/api/v1/proof/live-gate?days=14&format=markdown");
	    assert.match(liveGateMarkdown, /# Deal Threads Live Proof Gate/);
	    assert.match(liveGateMarkdown, /Real beta leads: 1/);
	    assert.match(liveGateMarkdown, /Demo scenario active: no/);

	    const readiness = await getProtectedJson("/api/v1/readiness/summary?days=14");
	    assert.equal(readiness.period.days, 14);
	    assert.equal(readiness.proof.total_leads, 1);
    assert.equal(readiness.proof.opportunities_created, 1);
    assert.equal(readiness.proof.rep_feedback_reviewed, 1);
    assert.equal(readiness.proof.rep_feedback_missing_context, 1);
	    assert.equal(readiness.governance.admin_auth, "enabled");
	    assert.equal(readiness.governance.backup_restore_ready, true);
	    assert.equal(readiness.governance.paid_escalation_policy.manual_approval_required, true);
	    assert.equal(readiness.live_proof_gate.live_ready, true);
	    assert.equal(readiness.live_proof_gate.summary.real_beta_leads, 1);
	    assert.ok(readiness.checks.some((check) => check.key === "rep_feedback"));
	    assert.ok(readiness.buyer_questions.some((item) => item.question.includes("results")));

    const readinessMarkdown = await getProtectedText("/api/v1/readiness/summary?days=14&format=markdown");
	    assert.match(readinessMarkdown, /# Deal Threads Mid-Market Readiness/);
	    assert.match(readinessMarkdown, /Rep feedback reviewed: 1/);
	    assert.match(readinessMarkdown, /Paid-provider spend: \$0\.00/);
	    assert.match(readinessMarkdown, /## Live Proof Export/);

    const trustPacket = await getProtectedJson("/api/v1/trust/packet?days=14");
    assert.equal(trustPacket.runtime.admin_auth, "enabled");
    assert.equal(trustPacket.runtime.external_crm, false);
    assert.equal(trustPacket.runtime.external_email, false);
    assert.equal(trustPacket.runtime.hardening_status, "hardened");
    assert.equal(trustPacket.hardening.status, "hardened");
    assert.equal(trustPacket.hardening.score, 100);
    assert.equal(trustPacket.data_inventory.demo_scenario.active, false);
    assert.ok(trustPacket.data_categories.some((category) => category.name === "Visitor identity"));
    assert.ok(trustPacket.processors.some((processor) => processor.name === "OpenAI" && processor.sends_data === false));
    assert.ok(trustPacket.controls.some((control) => control.key === "retention_deletion" && control.status === "pass"));
    assert.ok(trustPacket.controls.some((control) => control.key === "production_hardening" && control.status === "pass"));
    assert.equal(trustPacket.data_inventory.retention_policy.default_beta_retention_days, 30);
    assert.equal(trustPacket.links.tenant_data_export, "/api/v1/trust/tenant-data/export");

    const hardening = await getProtectedJson("/api/v1/trust/hardening");
    assert.equal(hardening.status, "hardened");
    assert.equal(hardening.score, 100);
    assert.ok(hardening.checks.some((check) => check.key === "security_headers" && check.status === "pass"));
    assert.ok(hardening.checks.some((check) => check.key === "public_widget_scope" && check.status === "pass"));

    const trustMarkdown = await getProtectedText("/api/v1/trust/packet?format=markdown");
    assert.match(trustMarkdown, /# Deal Threads Buyer Trust Packet/);
    assert.match(trustMarkdown, /## Production Hardening/);
    assert.match(trustMarkdown, /Request body limit/);
    assert.match(trustMarkdown, /## Data Categories/);
    assert.match(trustMarkdown, /## Processors/);
    assert.match(trustMarkdown, /Retention and deletion/);

    const deleteClient = await postProtectedJson("/api/v1/beta-clients", {
      name: "DeleteCo Revenue Team",
      websiteUrl: "https://deleteco.test",
      ownerEmail: "owner@deleteco.test",
      crm: "hubspot",
      crmDestinationName: "DeleteCo CRM handoff",
      crmDeliveryWebhookUrl: "https://hooks.example.test/deleteco",
      crmDeliveryOwner: "revops@deleteco.test",
      status: "setup",
      notes: "Temporary client for tenant data export/delete regression.",
      launcherText: "Ask DeleteCo",
      welcomeMessage: "DeleteCo custom welcome.",
      quickReplies: "Fix routing, Improve lead quality",
      requiredFields: "email,business_need,timeline,company_name_or_domain,crm",
      highPriorityOwner: "ae@deleteco.test",
      reportRecipients: "owner@deleteco.test",
      reportCadence: "weekly",
      reportPeriodDays: "14"
    });
    const deleteLead = await createTenantDataLead(deleteClient.id);
    const tenantSummary = await getProtectedJson(`/api/v1/trust/tenant-data/summary?betaClientId=${deleteClient.id}`);
    assert.equal(tenantSummary.scope.beta_client_id, deleteClient.id);
    assert.equal(tenantSummary.counts.beta_clients, 1);
    assert.equal(tenantSummary.counts.leads, 1);
    assert.equal(tenantSummary.confirmation_phrase, "DELETE DEAL THREADS TENANT DATA");

    const tenantExport = await getProtectedJson(`/api/v1/trust/tenant-data/export?betaClientId=${deleteClient.id}`);
    assert.equal(tenantExport.schema, "deal_threads.tenant_data_export.v1");
    assert.equal(tenantExport.scope.label, "DeleteCo Revenue Team");
    assert.equal(tenantExport.counts.beta_clients, 1);
    assert.equal(tenantExport.counts.leads, 1);
    assert.equal(tenantExport.data.betaClients[0].id, deleteClient.id);
    assert.equal(tenantExport.data.leads[0].id, deleteLead.id);

    const tenantDeletePreview = await postProtectedJson("/api/v1/trust/tenant-data/delete", {
      betaClientId: deleteClient.id
    });
    assert.equal(tenantDeletePreview.applied, false);
    assert.equal(tenantDeletePreview.dry_run, true);
    assert.equal(tenantDeletePreview.counts.leads, 1);

    const tenantDeleteWrongConfirmation = await postProtectedJson("/api/v1/trust/tenant-data/delete", {
      betaClientId: deleteClient.id,
      applyDelete: true,
      dryRun: false,
      confirmation: "DELETE"
    });
    assert.equal(tenantDeleteWrongConfirmation.applied, false);
    assert.equal(tenantDeleteWrongConfirmation.requires_confirmation, true);

    const tenantDeleteApplied = await postProtectedJson("/api/v1/trust/tenant-data/delete", {
      betaClientId: deleteClient.id,
      applyDelete: true,
      dryRun: false,
      confirmation: "DELETE DEAL THREADS TENANT DATA"
    });
    assert.equal(tenantDeleteApplied.applied, true);
    assert.equal(tenantDeleteApplied.counts.beta_clients, 1);
    assert.equal(tenantDeleteApplied.counts.leads, 1);

    const deletedClientFetch = await fetch(`${BASE_URL}/api/v1/beta-clients/${deleteClient.id}`, {
      headers: { authorization: ADMIN_AUTH_HEADER }
    });
    assert.equal(deletedClientFetch.status, 404);
    const deletedLeadFetch = await fetch(`${BASE_URL}/api/v1/leads/${deleteLead.id}`, {
      headers: { authorization: ADMIN_AUTH_HEADER }
    });
    assert.equal(deletedLeadFetch.status, 404);
    const deleteMemoryFetch = await fetch(`${BASE_URL}/api/v1/enrichment/memory/deleteco.test`, {
      headers: { authorization: ADMIN_AUTH_HEADER }
    });
    assert.equal(deleteMemoryFetch.status, 404);

    const scenarioBeforeSeed = await getProtectedJson("/api/v1/demo-scenarios/mid-market");
    assert.equal(scenarioBeforeSeed.scenarios[0].active, false);
    assert.equal(scenarioBeforeSeed.scenarios[0].clients, 0);
    assert.equal(scenarioBeforeSeed.scenarios[0].leads, 0);

    const seededScenario = await postProtectedJson("/api/v1/demo-scenarios/mid-market/seed", {});
    assert.equal(seededScenario.scenario.active, true);
    assert.equal(seededScenario.scenario.clients, 3);
    assert.equal(seededScenario.scenario.leads, 6);
    assert.equal(seededScenario.scenario.crm_deliveries, 6);
    assert.equal(seededScenario.created.clients.length, 3);
    assert.equal(seededScenario.created.leads.length, 6);

	    const scenarioReadiness = await getProtectedJson("/api/v1/readiness/summary?days=14");
	    assert.equal(scenarioReadiness.demo_scenario.active, true);
	    assert.equal(scenarioReadiness.demo_scenario.clients, 3);
	    assert.equal(scenarioReadiness.demo_scenario.leads, 6);
	    assert.ok(scenarioReadiness.proof.total_leads >= 7);
	    assert.ok(scenarioReadiness.proof.opportunities_created >= 4);
	    assert.equal(scenarioReadiness.proof.paid_provider_spend, 0);
	    assert.ok(scenarioReadiness.proof.rep_feedback_reviewed >= 7);
	    assert.ok(scenarioReadiness.proof.rep_feedback_average_usefulness_score >= 4);
	    assert.equal(scenarioReadiness.live_proof_gate.live_ready, false);
	    assert.equal(scenarioReadiness.live_proof_gate.summary.demo_scenario_active, true);
	    assert.equal(scenarioReadiness.live_proof_gate.summary.real_beta_leads, 1);

	    const blockedLiveGate = await getProtectedJson("/api/v1/proof/live-gate?days=14");
	    assert.equal(blockedLiveGate.live_ready, false);
	    assert.equal(blockedLiveGate.status, "blocked");
	    assert.equal(blockedLiveGate.summary.demo_scenario_active, true);
	    assert.equal(blockedLiveGate.summary.synthetic_leads, 6);
	    assert.equal(blockedLiveGate.summary.real_beta_leads, 1);
	    assert.equal(blockedLiveGate.proof.summary.total_leads, 1);
	    assert.ok(blockedLiveGate.blockers.some((item) => /synthetic data is active/i.test(item)));

	    const scenarioActivation = await getProtectedJson("/api/v1/activation/real-beta");
	    assert.equal(scenarioActivation.summary.demo_clients_excluded, 3);
	    assert.equal(scenarioActivation.summary.real_beta_clients, 1);
	    assert.equal(scenarioActivation.summary.real_beta_leads, 1);
	    assert.equal(scenarioActivation.selected_client.id, betaClient.id);
	    assert.equal(scenarioActivation.real_beta_clients.some((client) => /Atlas Cloud|Beacon Finance|Northstar/.test(client.name)), false);
	    assert.ok(scenarioActivation.demo_scenario.active);
	    assert.equal(scenarioActivation.live_proof_gate.live_ready, false);

	    const scenarioReport = await getProtectedJson("/api/v1/reports/beta-summary?days=14");
    assert.ok(scenarioReport.summary.pipeline.opportunity_value >= 300000);
    assert.equal(scenarioReport.enrichment.paid_provider_used, false);
    assert.ok(scenarioReport.rep_feedback.reviewed_profiles >= 7);

    const scenarioList = await getProtectedJson("/api/v1/demo-scenarios");
    assert.equal(scenarioList.scenarios[0].name, "Mid-market buyer demo");
    assert.equal(scenarioList.scenarios[0].active, true);

    const clearedScenario = await postProtectedJson("/api/v1/demo-scenarios/mid-market/clear", {});
    assert.equal(clearedScenario.scenario.active, false);
    assert.equal(clearedScenario.removed.clients, 3);
    assert.equal(clearedScenario.removed.leads, 6);

	    const readinessAfterClear = await getProtectedJson("/api/v1/readiness/summary?days=14");
	    assert.equal(readinessAfterClear.demo_scenario.active, false);
	    assert.equal(readinessAfterClear.proof.total_leads, 1);
	    assert.equal(readinessAfterClear.live_proof_gate.live_ready, true);
	    assert.equal(readinessAfterClear.live_proof_gate.summary.real_beta_leads, 1);
	    const liveGateAfterClear = await getProtectedJson("/api/v1/proof/live-gate?days=14");
	    assert.equal(liveGateAfterClear.live_ready, true);
	    assert.equal(liveGateAfterClear.summary.demo_scenario_active, false);
	    assert.equal(liveGateAfterClear.summary.synthetic_leads, 0);
	    const activationAfterClear = await getProtectedJson("/api/v1/activation/real-beta");
	    assert.equal(activationAfterClear.summary.demo_clients_excluded, 0);
	    assert.equal(activationAfterClear.summary.real_beta_clients, 1);
	    assert.equal(activationAfterClear.selected_client.id, betaClient.id);
	    const clientsAfterClear = await getProtectedJson("/api/v1/beta-clients");
    assert.equal(clientsAfterClear.count, 1);
    assert.equal(clientsAfterClear.clients[0].name, "PilotCo Revenue Team");
    const memoryAfterClear = await getProtectedJson("/api/v1/enrichment/memory");
    assert.equal(memoryAfterClear.records.some((record) => record.domain === "atlascloud.example"), false);

    const dueDeliveries = await postProtectedJson("/api/v1/reports/deliveries/run-due", {});
    assert.equal(dueDeliveries.queued, 1);
    assert.equal(dueDeliveries.errors, 0);
    assert.equal(dueDeliveries.results[0].beta_client_id, betaClient.id);
    assert.equal(dueDeliveries.results[0].status, "queued");
    assert.deepEqual(dueDeliveries.results[0].recipients, ["pilot-owner@example.com", "revops@example.com"]);

    const deliveryId = dueDeliveries.results[0].id;
    const deliveryDetail = await getProtectedJson(`/api/v1/reports/deliveries/${deliveryId}`);
    assert.equal(deliveryDetail.beta_client_id, betaClient.id);
    assert.equal(deliveryDetail.summary.total_leads, 1);
    assert.equal(deliveryDetail.summary.opportunities_created, 1);
    assert.equal(deliveryDetail.summary.opportunity_value, 45000);
    assert.equal(deliveryDetail.summary.expected_value, 18000);
    assert.match(deliveryDetail.markdown, /# Deal Threads Beta Report - PilotCo Revenue Team/);
    assert.match(deliveryDetail.csv, /"lead_metrics","total","1",""/);
    assert.match(deliveryDetail.csv, /"pipeline","opportunity_value","45000\.00",""/);

    const deliverySummary = await getProtectedJson("/api/v1/reports/deliveries");
    assert.equal(deliverySummary.count, 1);
    assert.equal(deliverySummary.summary.queued, 1);
    assert.equal(deliverySummary.email_adapter.mode, "dry_run");
    assert.equal(deliverySummary.email_adapter.transmits_external_email, false);

    const sentDelivery = await postProtectedJson(`/api/v1/reports/deliveries/${deliveryId}/send`, {
      note: "Dry-run sent to the pilot owner."
    });
    assert.equal(sentDelivery.status, "sent");
    assert.equal(sentDelivery.sent_via, "dry_run");
    assert.equal(sentDelivery.provider_message_id, `dry_run_${deliveryId}`);
    assert.equal(sentDelivery.send_attempts.length, 1);
    assert.equal(sentDelivery.send_attempts[0].dry_run, true);
    assert.equal(sentDelivery.send_attempts[0].mode, "dry_run");
    assert.ok(sentDelivery.sent_at);

    const sentBetaClient = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
	    assert.equal(sentBetaClient.checklist.find((item) => item.key === "first_report_sent").checked, true);
	    assert.equal(sentBetaClient.latest_report_delivery.status, "sent");
	    assert.equal(sentBetaClient.readiness.status, "ready");
	    assert.equal(sentBetaClient.readiness.ready_to_send_snippet, true);
	    assert.equal(sentBetaClient.readiness.ready_for_live_beta, true);
	    const installQueueAfterProofPacket = await getProtectedJson("/api/v1/launch/install-queue");
	    const installQueueAfterProofPacketItem = installQueueAfterProofPacket.queue.find((item) => item.beta_client_id === betaClient.id);
	    assert.ok(installQueueAfterProofPacketItem);
	    assert.equal(installQueueAfterProofPacketItem.report_delivery_count, 1);
	    assert.equal(installQueueAfterProofPacketItem.latest_report_delivery.status, "sent");
	    assert.equal(installQueueAfterProofPacketItem.proof_preflight.status, "proof_ready");
	    assert.equal(installQueueAfterProofPacketItem.proof_preflight.summary.proof_packets_sent, 1);
	    assert.equal(installQueueAfterProofPacketItem.proof_preflight.ready_for_first_proof_packet, true);
	    assert.equal(installQueueAfterProofPacketItem.proof_preflight.ready_for_live_proof_claim, true);
	    assert.ok(installQueueAfterProofPacketItem.proof_preflight.market_gate_effect.some((effect) => effect.key === "live_proof_gate" && effect.status === "ready_to_recheck"));
	    const marketLaunchAfterProofPacketSent = await getProtectedJson("/api/v1/launch/market-ready");
	    assert.ok(["market_ready", "live_proof_clearance"].includes(marketLaunchAfterProofPacketSent.launch_clearance_plan.current_stage));
	    const liveProofMarketAction = marketLaunchAfterProofPacketSent.launch_clearance_plan.current_action;
	    assert.equal(liveProofMarketAction.packet_kind, "live_proof_clearance");
	    assert.equal(liveProofMarketAction.proof_focus, "live_proof_gate");
	    assert.equal(liveProofMarketAction.beta_client_id, betaClient.id);
	    assert.equal(liveProofMarketAction.primary_surface_method, "GET");
	    assert.match(liveProofMarketAction.primary_surface_url, new RegExp(`/api/v1/proof/live-gate\\?betaClientId=${betaClient.id}$`));
	    assert.equal(liveProofMarketAction.operator_post_method, null);
	    assert.equal(liveProofMarketAction.operator_post_url, "");
	    const liveProofMarketPreflight = liveProofMarketAction.live_proof_clearance_preflight;
	    assert.equal(liveProofMarketPreflight.type, "deal_threads.market_live_proof_clearance_preflight.v1");
	    assert.equal(liveProofMarketPreflight.summary.proof_packet_sent, true);
	    assert.equal(liveProofMarketPreflight.summary.live_ready, marketLaunchAfterProofPacketSent.live_proof_gate.live_ready);
	    assert.equal(liveProofMarketPreflight.summary.live_gate_blockers, marketLaunchAfterProofPacketSent.live_proof_gate.blockers.length);
	    assert.equal(liveProofMarketPreflight.summary.live_gate_warnings, marketLaunchAfterProofPacketSent.live_proof_gate.warnings.length);
	    assert.equal(liveProofMarketPreflight.summary.paid_lookups_recommended_now, 0);
	    assert.ok(["internal_beta_only", "launch_with_disclosures", "market_claims_allowed"].includes(liveProofMarketPreflight.claim_scope));
	    assert.equal(liveProofMarketPreflight.safety.read_only_get, true);
	    assert.equal(liveProofMarketPreflight.safety.claims_market_ready_on_get, false);
	    assert.equal(liveProofMarketPreflight.safety.live_proof_claimed, false);
	    assert.equal(liveProofMarketPreflight.safety.requires_zero_blockers_for_market_claim, true);
	    assert.equal(liveProofMarketPreflight.safety.operator_post_available, false);
	    assert.ok(liveProofMarketPreflight.checks.some((check) => check.key === "live_proof_gate_recheck"));
	    assert.ok(liveProofMarketPreflight.checks.some((check) => check.key === "claim_scope_lock"));
	    assert.ok(liveProofMarketPreflight.evidence_required.some((item) => item.key === "first_proof_packet_sent" && item.required));
	    assert.ok(liveProofMarketPreflight.evidence_required.some((item) => item.key === "zero_live_proof_blockers" && item.required));
	    assert.ok(liveProofMarketPreflight.evidence_required.some((item) => item.key === "market_kit_claim_scope" && item.required));
	    assert.equal(liveProofMarketAction.live_proof_gate_preflight.type, liveProofMarketPreflight.type);
	    assert.equal(liveProofMarketAction.live_proof_evidence_contract.length, liveProofMarketPreflight.evidence_required.length);
	    assert.equal(liveProofMarketAction.proof_packet_preflight.type, "deal_threads.market_first_proof_packet_preflight.v1");
	    assert.equal(liveProofMarketAction.proof_packet_preflight.status, "first_proof_packet_sent");
	    assert.equal(liveProofMarketAction.proof_packet_preflight.summary.proof_packets_sent, 1);
	    assert.equal(liveProofMarketAction.safety.claims_market_ready_on_get, false);
	    assert.equal(liveProofMarketAction.safety.live_proof_claimed, false);
	    assert.equal(liveProofMarketAction.safety.requires_zero_blockers_for_market_claim, true);
	    const marketLaunchAfterProofPacketSentMarkdown = await getProtectedText("/api/v1/launch/market-ready?format=markdown");
	    assert.match(marketLaunchAfterProofPacketSentMarkdown, /Live proof clearance preflight:/);
	    assert.match(marketLaunchAfterProofPacketSentMarkdown, /Live proof claim scope:/);
	    assert.match(marketLaunchAfterProofPacketSentMarkdown, /Live proof requires zero blockers: yes/);
	    assert.match(marketLaunchAfterProofPacketSentMarkdown, /Live proof GET claims market ready: no/);
	    assert.match(marketLaunchAfterProofPacketSentMarkdown, /#### Live Proof Clearance Preflight/);
	    assert.match(marketLaunchAfterProofPacketSentMarkdown, /Evidence first_proof_packet_sent: required/);
	    assert.match(marketLaunchAfterProofPacketSentMarkdown, /Evidence zero_live_proof_blockers: required/);
	    assert.match(marketLaunchAfterProofPacketSentMarkdown, /Evidence market_kit_claim_scope: required/);
	    assert.match(marketLaunchAfterProofPacketSentMarkdown, /#### Live Proof Claim Scope/);
	    assert.match(marketLaunchAfterProofPacketSentMarkdown, /#### Live Proof Clearance Links/);
	    const marketLaunchAfterProofPacketSentPage = await getProtectedText("/launch/market-ready");
	    assert.match(marketLaunchAfterProofPacketSentPage, /Live proof clearance preflight/);
	    assert.match(marketLaunchAfterProofPacketSentPage, /Live proof clearance evidence/);
	    assert.match(marketLaunchAfterProofPacketSentPage, /Live proof claim scope/);
	    assert.match(marketLaunchAfterProofPacketSentPage, /Live proof clearance links/);
	    const marketKitAfterProofPacketSent = await getProtectedJson("/api/v1/launch/market-kit");
	    assert.equal(marketKitAfterProofPacketSent.claim_scope_review.type, "deal_threads.market_launch_kit_claim_scope_review.v1");
	    assert.equal(marketKitAfterProofPacketSent.claim_scope_review.source_action_type, liveProofMarketPreflight.type);
	    assert.equal(marketKitAfterProofPacketSent.claim_scope_review.source, "live_proof_clearance_preflight");
	    assert.equal(marketKitAfterProofPacketSent.claim_scope_review.claim_scope, liveProofMarketPreflight.claim_scope);
	    assert.equal(marketKitAfterProofPacketSent.claim_scope_review.proof_packet_sent, true);
	    assert.equal(marketKitAfterProofPacketSent.claim_scope_review.live_gate_blockers, liveProofMarketPreflight.summary.live_gate_blockers);
	    assert.equal(marketKitAfterProofPacketSent.claim_scope_review.live_gate_warnings, liveProofMarketPreflight.summary.live_gate_warnings);
	    assert.equal(marketKitAfterProofPacketSent.claim_scope_review.safety.claims_market_ready_on_get, false);
	    assert.equal(marketKitAfterProofPacketSent.claim_scope_review.safety.live_proof_claimed, false);
	    assert.equal(marketKitAfterProofPacketSent.claim_scope_review.safety.requires_zero_blockers_for_market_claim, true);
	    assert.equal(marketKitAfterProofPacketSent.launch_posture.claim_scope, liveProofMarketPreflight.claim_scope);
	    assert.equal(marketKitAfterProofPacketSent.launch_posture.claim_scope_source, "live_proof_clearance_preflight");
	    assert.ok(marketKitAfterProofPacketSent.claim_scope_review.evidence_required.some((item) => item.key === "zero_live_proof_blockers" && item.required));
	    assert.ok(marketKitAfterProofPacketSent.disclosure_checklist.some((item) => item.key === "claim_scope_lock"));
	    const marketKitAfterProofPacketSentMarkdown = await getProtectedText("/api/v1/launch/market-kit?format=markdown");
	    assert.match(marketKitAfterProofPacketSentMarkdown, /## Claim Scope Review/);
	    assert.match(marketKitAfterProofPacketSentMarkdown, /Source action type: deal_threads\.market_live_proof_clearance_preflight\.v1/);
	    assert.match(marketKitAfterProofPacketSentMarkdown, /GET claims market ready: no/);
	    assert.match(marketKitAfterProofPacketSentMarkdown, /Evidence zero_live_proof_blockers: required/);
	    const marketKitAfterProofPacketSentPage = await getProtectedText("/launch/market-kit");
	    assert.match(marketKitAfterProofPacketSentPage, /Claim scope review/);
	    assert.match(marketKitAfterProofPacketSentPage, /Claim scope evidence/);
	    assert.match(marketKitAfterProofPacketSentPage, /Claim scope blocked claims/);
	    const readyWizard = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}/launch-wizard`);
    assert.equal(readyWizard.wizard.status, "ready");
    assert.equal(readyWizard.wizard.completion.percent, 100);

    const pilotAfterSend = await getProtectedJson("/api/v1/pilot/summary");
    assert.equal(pilotAfterSend.reports.sent, 1);
    assert.equal(pilotAfterSend.reports.queued, 0);
    assert.equal(pilotAfterSend.reports.email_adapter.mode, "dry_run");
    assert.equal(pilotAfterSend.clients[0].latest_report_delivery.status, "sent");
    assert.equal(pilotAfterSend.clients[0].latest_report_delivery.sent_via, "dry_run");
    assert.equal(pilotAfterSend.clients[0].latest_experiment.title, "Ask budget before timeline");
    assert.equal(pilotAfterSend.clients[0].readiness.status, "ready");
    assert.equal(pilotAfterSend.clients[0].opportunities_created, 1);
    assert.equal(pilotAfterSend.clients[0].opportunity_value, 45000);
    assert.equal(pilotAfterSend.leads.opportunities_created, 1);
    assert.equal(pilotAfterSend.leads.opportunity_value, 45000);

    const memoryLead = await createHighPriorityLead(null, {
      firstMessage:
        "I am evaluating this for RegressionCo using HubSpot. Demo requests are going cold because reps research manually. We want to fix this this quarter and likely have $30K-$50K annually."
    });
    assert.equal(memoryLead.company.domain, "regressionco.test");
    assert.equal(memoryLead.enrichment.provider, "internal_memory_cache");
    assert.equal(memoryLead.enrichment.cost.internal_requests, 0);
    assert.equal(memoryLead.enrichment.industry.value, "B2B SaaS");
    assert.equal(memoryLead.enrichment.company_size.value, "101-250");
    assert.ok(memoryLead.enrichment.memory.record_id);

    const memoryAfterHit = await getProtectedJson("/api/v1/enrichment/memory");
    assert.equal(memoryAfterHit.count, 1);
    assert.equal(memoryAfterHit.cache_hits, 1);
    assert.equal(memoryAfterHit.estimated_internal_requests_saved, 1);
    assert.equal(memoryAfterHit.records[0].lead_count, 2);

    const targetImport = await postProtectedJson("/api/v1/enrichment/memory/import", {
      csv: [
        "company_name,domain,industry,company_size,tech_stack,signals,notes",
        "Target One,targetone.test,B2B SaaS,51-200,\"HubSpot; Segment\",\"Tier 1 account; ICP fit\",Imported from account plan.",
        "Target Two,https://targettwo.test,Fintech,201-500,Salesforce,Funding signal,Imported from account plan.",
        "Broken Account,,B2B SaaS,1-10,,,"
      ].join("\n")
    });
    assert.equal(targetImport.summary.imported, 2);
    assert.equal(targetImport.summary.created, 2);
    assert.equal(targetImport.summary.errors, 1);
    assert.equal(targetImport.memory.imported_records, 2);
    assert.equal(targetImport.imported[0].domain, "targetone.test");
    assert.equal(targetImport.errors[0].row, 4);

    const targetMemory = await getProtectedJson("/api/v1/enrichment/memory/targetone.test");
    assert.equal(targetMemory.source, "target_account_import");
    assert.equal(targetMemory.industry, "B2B SaaS");
    assert.equal(targetMemory.company_size, "51-200");
    assert.ok(targetMemory.imported_fields.includes("tech_stack"));

    const firstFiveOutreach = await getProtectedJson("/api/v1/outreach/first-five");
    assert.equal(firstFiveOutreach.type, "deal_threads.first_five_outreach.v1");
    assert.equal(firstFiveOutreach.public_safety.mutates_buyer_state_on_get, false);
    assert.equal(firstFiveOutreach.public_safety.sends_external_email_on_get, false);
    assert.equal(firstFiveOutreach.public_safety.creates_beta_client_on_get, false);
    assert.equal(firstFiveOutreach.public_safety.transmits_external_crm_on_get, false);
    assert.equal(firstFiveOutreach.public_safety.paid_provider_lookup_by_default, false);
    assert.ok(firstFiveOutreach.summary.imported_target_accounts >= 2);
    assert.ok(firstFiveOutreach.summary.outreach_send_rooms_ready >= 1);
    assert.ok(firstFiveOutreach.summary.manual_mailto_drafts >= 1);
    assert.ok(firstFiveOutreach.summary.manual_sent_recorders >= 1);
    assert.ok(firstFiveOutreach.summary.activation_reply_capture_actions >= 1);
    assert.equal(firstFiveOutreach.summary.outreach_sent_records, 0);
    assert.equal(firstFiveOutreach.summary.outreach_reply_records, 0);
    assert.equal(firstFiveOutreach.summary.outreach_followups_due, 0);
    assert.equal(firstFiveOutreach.summary.paid_lookups_recommended_now, 0);
    assert.ok(firstFiveOutreach.recommended_actions.some((action) => /activation|qualified/i.test(action)));
    assert.match(firstFiveOutreach.first_account?.send_room?.manual_mailto_url || "", /^mailto:/);
    assert.equal(firstFiveOutreach.first_account?.send_room?.manual_sent_action?.method, "POST");
    assert.equal(firstFiveOutreach.first_account?.send_room?.manual_sent_action?.sends_from_server, false);
    assert.equal(firstFiveOutreach.first_account?.send_room?.activation_prospect_action?.method, "POST");
    assert.equal(firstFiveOutreach.first_account?.send_room?.activation_prospect_action?.creates_activation_prospect, true);
    assert.equal(firstFiveOutreach.first_account?.send_room?.activation_prospect_action?.creates_beta_client, false);
    assert.equal(firstFiveOutreach.first_account?.send_room?.delivery_audit?.sent_count, 0);
    assert.equal(firstFiveOutreach.first_account?.send_room?.delivery_audit?.reply_count, 0);
    assert.equal(firstFiveOutreach.first_account?.send_room?.post_send_plan?.paid_enrichment_needed_now, 0);
    const targetOneAccount = firstFiveOutreach.target_accounts.find((account) => account.domain === "targetone.test");
    assert.ok(targetOneAccount);
    assert.match(targetOneAccount.links.pilot_intake, /\/pilot-intake\?/);
    assert.match(targetOneAccount.links.pilot_intake, /companyName=Target\+One/);
    assert.match(targetOneAccount.links.pilot_intake, /websiteUrl=https%3A%2F%2Ftargetone\.test/);
    assert.match(targetOneAccount.copy.email_body, /no paid enrichment calls/i);
    assert.match(targetOneAccount.copy.email_body, /Pilot intake:/);
    assert.match(targetOneAccount.manual_mailto_url, /^mailto:/);
    assert.equal(targetOneAccount.send_room.status, "manual_outreach_ready");
    assert.match(targetOneAccount.send_room.manual_mailto_url, /^mailto:/);
    assert.equal(targetOneAccount.send_room.manual_sent_action.method, "POST");
    assert.match(targetOneAccount.send_room.manual_sent_action.api_url, /\/api\/v1\/outreach\/target-accounts\/targetone\.test\/sent$/);
    assert.match(targetOneAccount.send_room.manual_sent_action.html_action, /\/outreach\/target-accounts\/targetone\.test\/mark-sent$/);
    assert.equal(targetOneAccount.send_room.manual_sent_action.sends_from_server, false);
    assert.equal(targetOneAccount.send_room.manual_sent_action.preview_only_on_get, true);
    assert.equal(targetOneAccount.send_room.activation_prospect_action.method, "POST");
    assert.match(targetOneAccount.send_room.activation_prospect_action.api_url, /\/api\/v1\/outreach\/target-accounts\/targetone\.test\/activation-prospect$/);
    assert.match(targetOneAccount.send_room.activation_prospect_action.html_action, /\/outreach\/target-accounts\/targetone\.test\/create-activation-prospect$/);
    assert.equal(targetOneAccount.send_room.activation_prospect_action.creates_activation_prospect, true);
    assert.equal(targetOneAccount.send_room.activation_prospect_action.creates_beta_client, false);
    assert.equal(targetOneAccount.send_room.activation_prospect_action.sends_from_server, false);
    assert.equal(targetOneAccount.send_room.activation_prospect_action.transmits_external_crm, false);
    assert.equal(targetOneAccount.send_room.activation_prospect_action.paid_provider_lookup, false);
    assert.equal(targetOneAccount.send_room.activation_prospect_action.preview_only_on_get, true);
    assert.equal(targetOneAccount.send_room.delivery_audit.sent_count, 0);
    assert.equal(targetOneAccount.send_room.delivery_audit.reply_count, 0);
    assert.match(targetOneAccount.send_room.recipient_hint, /RevOps|VP Sales|revenue leader|GTM owner/i);
    assert.equal(targetOneAccount.send_room.post_send_plan.status, "ready_after_manual_outreach");
    assert.equal(targetOneAccount.send_room.post_send_plan.manual_sent_recorder.method, "POST");
    assert.equal(targetOneAccount.send_room.post_send_plan.reply_capture_action.method, "POST");
    assert.equal(targetOneAccount.send_room.post_send_plan.paid_enrichment_needed_now, 0);
    assert.ok(targetOneAccount.send_room.post_send_plan.after_send_actions.some((action) => /POST-only outreach recorder/i.test(action)));
    assert.ok(targetOneAccount.send_room.post_send_plan.after_send_actions.some((action) => /activation prospect recorder/i.test(action)));
    assert.ok(targetOneAccount.send_room.post_send_plan.after_send_actions.some((action) => /prefilled pilot-intake/i.test(action)));
    assert.equal(targetOneAccount.send_room.proof_effect.paid_enrichment_needed_now, 0);
    assert.equal(targetOneAccount.send_room.safety.sends_external_email_on_get, false);
    assert.equal(targetOneAccount.send_room.safety.paid_provider_lookup_by_default, false);
    assert.equal(targetOneAccount.send_room.safety.manual_record_requires_post, true);
    const firstFiveOutreachMarkdown = await getProtectedText("/api/v1/outreach/first-five?format=markdown");
    assert.match(firstFiveOutreachMarkdown, /# First Five Beta Outreach/);
    assert.match(firstFiveOutreachMarkdown, /Target One/);
    assert.match(firstFiveOutreachMarkdown, /Manual mailto draft: mailto:/);
    assert.match(firstFiveOutreachMarkdown, /Manual sent POST: POST .*\/api\/v1\/outreach\/target-accounts\/targetone\.test\/sent/);
    assert.match(firstFiveOutreachMarkdown, /Activation prospect POST: POST .*\/api\/v1\/outreach\/target-accounts\/targetone\.test\/activation-prospect/);
    assert.match(firstFiveOutreachMarkdown, /Outreach sent records: 0/);
    assert.match(firstFiveOutreachMarkdown, /Outreach reply records: 0/);
    assert.match(firstFiveOutreachMarkdown, /Post-send plan:/);
    assert.match(firstFiveOutreachMarkdown, /Paid lookups recommended now: 0/);
    const outreachPage = await getProtectedText("/outreach");
    assert.match(outreachPage, /First five beta outreach/);
    assert.match(outreachPage, /Target One/);
    assert.match(outreachPage, /Prefilled intake/);
    assert.match(outreachPage, /Send rooms/);
    assert.match(outreachPage, /Open email draft/);
    assert.match(outreachPage, /Record manual send/);
    assert.match(outreachPage, /Capture interested reply/);
    assert.match(outreachPage, /Create activation prospect/);
    assert.match(outreachPage, /Recorders/);
    assert.match(outreachPage, /Sent records/);
    assert.match(outreachPage, /After send/);

    const targetOneMarkedSent = await postProtectedJson("/api/v1/outreach/target-accounts/targetone.test/sent", {
      recipients: "revops@targetone.test",
      subject: targetOneAccount.copy.email_subject,
      note: "Sent manually from regression test.",
      channel: "email"
    });
    assert.equal(targetOneMarkedSent.marked_sent, true);
    assert.equal(targetOneMarkedSent.sends_from_server, false);
    assert.equal(targetOneMarkedSent.event.channel, "email");
    assert.deepEqual(targetOneMarkedSent.event.recipients, ["revops@targetone.test"]);
    assert.match(targetOneMarkedSent.event.next_check_at, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(targetOneMarkedSent.outreach_account.send_room.status, "manual_outreach_sent");
    assert.equal(targetOneMarkedSent.outreach_account.send_room.delivery_audit.sent_count, 1);
    const firstFiveOutreachAfterSent = await getProtectedJson("/api/v1/outreach/first-five");
    assert.equal(firstFiveOutreachAfterSent.summary.outreach_sent_records, 1);
    assert.ok(firstFiveOutreachAfterSent.summary.manual_sent_recorders >= 1);
    const targetOneAfterSent = firstFiveOutreachAfterSent.target_accounts.find((account) => account.domain === "targetone.test");
    assert.equal(targetOneAfterSent.send_room.status, "manual_outreach_sent");
    assert.equal(targetOneAfterSent.send_room.delivery_audit.sent_count, 1);
    assert.equal(targetOneAfterSent.send_room.delivery_audit.latest_event.note, "Sent manually from regression test.");
    assert.equal(targetOneAfterSent.send_room.delivery_audit.latest_event.sends_from_server, false);
    assert.match(targetOneAfterSent.send_room.delivery_audit.next_check_at, /^\d{4}-\d{2}-\d{2}T/);
    const targetMemoryAfterOutreach = await getProtectedJson("/api/v1/enrichment/memory/targetone.test");
    assert.equal(targetMemoryAfterOutreach.outreach_events.length, 1);
    assert.equal(targetMemoryAfterOutreach.outreach_events[0].note, "Sent manually from regression test.");
    const targetTwoManualSentForm = await postProtectedForm("/outreach/target-accounts/targettwo.test/mark-sent", {
      returnTo: "/outreach",
      recipients: "revops@targettwo.test",
      note: "Sent manually from outreach form."
    });
    assert.equal(targetTwoManualSentForm.status, 303);
    assert.match(targetTwoManualSentForm.headers.get("location") || "", /\/outreach\?outreachMarkedSent=targettwo\.test/);
    const firstFiveOutreachAfterFormSent = await getProtectedJson("/api/v1/outreach/first-five");
    assert.equal(firstFiveOutreachAfterFormSent.summary.outreach_sent_records, 2);
    assert.equal(firstFiveOutreachAfterFormSent.summary.outreach_reply_records, 0);

    const prefilledPilotIntakePage = await fetch(`${BASE_URL}/pilot-intake?companyName=Target%20One&websiteUrl=https%3A%2F%2Ftargetone.test&crm=hubspot&businessNeed=Need%20better%20routing`);
    assert.equal(prefilledPilotIntakePage.status, 200);
    const prefilledPilotIntakeHtml = await prefilledPilotIntakePage.text();
    assert.match(prefilledPilotIntakeHtml, /value="Target One"/);
    assert.match(prefilledPilotIntakeHtml, /value="https:\/\/targetone\.test"/);
    assert.match(prefilledPilotIntakeHtml, /Need better routing/);
    assert.doesNotMatch(prefilledPilotIntakeHtml, /\/crm\//);

	    const fallbackWithoutConsent = await fetch(`${BASE_URL}/api/v1/fallback-submissions`, {
	      method: "POST",
	      headers: { "content-type": "application/json" },
	      body: JSON.stringify({
	        name: "Tara Target",
	        email: "tara@targetone.test",
	        company: "Target One",
	        message: "We need lead enrichment and better HubSpot routing this quarter."
	      })
	    });
	    assert.equal(fallbackWithoutConsent.status, 400);
	    const fallbackConsentError = await fallbackWithoutConsent.json();
	    assert.equal(fallbackConsentError.error, "consent_required");

	    const seededLeadSubmission = await postJson("/api/v1/fallback-submissions", {
	      name: "Tara Target",
	      email: "tara@targetone.test",
	      company: "Target One",
	      message: "We need lead enrichment and better HubSpot routing this quarter.",
	      consentAccepted: true
	    });
	    const seededLead = await getProtectedJson(`/api/v1/leads/${seededLeadSubmission.leadProfileId}`);
	    assert.equal(seededLead.consent.accepted, true);
	    assert.equal(seededLead.enrichment.provider, "internal_memory_cache");
    assert.equal(seededLead.enrichment.cost.internal_requests, 0);
    assert.equal(seededLead.enrichment.industry.value, "B2B SaaS");
    assert.equal(seededLead.enrichment.company_size.value, "51-200");
    assert.ok(seededLead.enrichment.tech_stack.some((item) => item.value === "Segment"));

    const memoryAfterImportLead = await getProtectedJson("/api/v1/enrichment/memory");
    assert.equal(memoryAfterImportLead.count, 3);
    assert.equal(memoryAfterImportLead.imported_records, 2);
    assert.equal(memoryAfterImportLead.cache_hits, 2);

    const importedMemory = await getProtectedJson("/api/v1/enrichment/memory?segment=imported");
    assert.equal(importedMemory.count, 2);
    assert.ok(importedMemory.records.every((record) => record.imported_fields.length));

    const correctedMemoryFilter = await getProtectedJson("/api/v1/enrichment/memory?segment=corrected");
    assert.equal(correctedMemoryFilter.count, 1);
    assert.equal(correctedMemoryFilter.records[0].domain, "regressionco.test");

    const cacheHitMemory = await getProtectedJson("/api/v1/enrichment/memory?segment=cache_hit");
    assert.equal(cacheHitMemory.count, 2);
    assert.ok(cacheHitMemory.records.every((record) => record.cache_hits > 0));

    const searchedMemory = await getProtectedJson("/api/v1/enrichment/memory?q=targettwo");
    assert.equal(searchedMemory.count, 1);
    assert.equal(searchedMemory.records[0].domain, "targettwo.test");

    const importedMemoryCsv = await getProtectedText("/api/v1/enrichment/memory?segment=imported&format=csv");
    assert.match(importedMemoryCsv, /"domain","company_name","website"/);
    assert.match(importedMemoryCsv, /"targetone\.test","Target One"/);
    assert.match(importedMemoryCsv, /"targettwo\.test","Target Two"/);
    assert.doesNotMatch(importedMemoryCsv, /regressionco\.test/);

    const targetTwoActivationProspect = await postProtectedJson("/api/v1/outreach/target-accounts/targettwo.test/activation-prospect", {
      contactName: "Tony Target",
      contactEmail: "tony@targettwo.test",
      replyNote: "Tony replied that Target Two wants to test one high-intent demo page this month before buying another enrichment provider.",
      channel: "email"
    });
    assert.equal(targetTwoActivationProspect.type, "deal_threads.target_account_activation_prospect.v1");
    assert.equal(targetTwoActivationProspect.created, true);
    assert.equal(targetTwoActivationProspect.creates_activation_prospect, true);
    assert.equal(targetTwoActivationProspect.creates_beta_client, false);
    assert.equal(targetTwoActivationProspect.sends_from_server, false);
    assert.equal(targetTwoActivationProspect.transmits_external_crm, false);
    assert.equal(targetTwoActivationProspect.paid_provider_lookup, false);
    assert.equal(targetTwoActivationProspect.buyer_confirmation_complete, false);
    assert.match(targetTwoActivationProspect.lead.id, /^lead_/);
    assert.equal(targetTwoActivationProspect.activation_prospect.domain, "targettwo.test");
    assert.equal(targetTwoActivationProspect.close_workflow.status, "collecting_details");
    assert.equal(targetTwoActivationProspect.close_workflow.report_recipients.length, 0);
    assert.match(targetTwoActivationProspect.public_handoff.links.confirmation_status, /\/confirm\/pcf_[a-f0-9]+\/status$/);
    assert.equal(targetTwoActivationProspect.outreach_event.kind, "reply");
    assert.equal(targetTwoActivationProspect.outreach_event.sends_from_server, false);
    assert.equal(targetTwoActivationProspect.outreach_account.stage, "activation_prospect");
    assert.equal(targetTwoActivationProspect.outreach_account.send_room.status, "use_activation_outbox");
    assert.equal(targetTwoActivationProspect.outreach_account.send_room.activation_prospect_action, null);
    assert.equal(targetTwoActivationProspect.outreach_account.send_room.delivery_audit.sent_count, 1);
    assert.equal(targetTwoActivationProspect.outreach_account.send_room.delivery_audit.reply_count, 1);
    const targetTwoActivationLead = await getProtectedJson(`/api/v1/leads/${targetTwoActivationProspect.activation_prospect.lead_id}`);
    assert.equal(targetTwoActivationLead.source.target_account_reply, true);
    assert.equal(targetTwoActivationLead.source.target_account_domain, "targettwo.test");

    const intakeTriageAfterTargetReply = await getProtectedJson("/api/v1/activation/intake-triage");
    const targetReplyTriageItem = intakeTriageAfterTargetReply.items.find((item) => item.lead_id === targetTwoActivationProspect.activation_prospect.lead_id);
    assert.ok(targetReplyTriageItem);
    assert.equal(targetReplyTriageItem.source, "target_account_reply");
    assert.equal(targetReplyTriageItem.convertible_activation_prospect, true);
    assert.equal(targetReplyTriageItem.buyer_confirmation_complete, false);
    assert.ok(targetReplyTriageItem.missing_confirmation_details.includes("Proof recipients"));
    assert.equal(targetReplyTriageItem.paid_lookups_recommended_now, 0);

    const firstFiveAfterTargetReply = await getProtectedJson("/api/v1/outreach/first-five");
    const targetTwoAfterReply = firstFiveAfterTargetReply.target_accounts.find((account) => account.domain === "targettwo.test");
    assert.equal(firstFiveAfterTargetReply.summary.outreach_sent_records, 2);
    assert.equal(firstFiveAfterTargetReply.summary.outreach_reply_records, 1);
    assert.equal(targetTwoAfterReply.stage, "activation_prospect");
    assert.equal(targetTwoAfterReply.send_room.status, "use_activation_outbox");
    assert.equal(targetTwoAfterReply.send_room.delivery_audit.sent_count, 1);
    assert.equal(targetTwoAfterReply.send_room.delivery_audit.reply_count, 1);
    assert.equal(targetTwoAfterReply.send_room.activation_prospect_action, null);

    const stateExportResponse = await fetch(`${BASE_URL}/api/v1/admin/state/export`, {
      headers: { authorization: ADMIN_AUTH_HEADER }
    });
    assert.equal(stateExportResponse.status, 200);
    assert.match(stateExportResponse.headers.get("content-disposition"), /deal-threads-state-backup-\d{4}-\d{2}-\d{2}\.json/);
    const stateExport = await stateExportResponse.json();
    assert.equal(stateExport.app, "deal-threads-dev");
    assert.equal(stateExport.schema, "deal_threads.snapshot.v1");
    assert.equal(stateExport.data_store.mode, "json");
    assert.equal(stateExport.data_store.location, dataFile);
    assert.equal(stateExport.counts.leads, 4);
    assert.equal(stateExport.counts.beta_clients, 1);
    assert.equal(stateExport.counts.company_memory, 3);
    assert.equal(stateExport.counts.rep_alerts, stateExport.snapshot.repAlerts.length);
    assert.equal(stateExport.counts.crm_deliveries, stateExport.snapshot.crmDeliveries.length);
    assert.equal(stateExport.counts.crm_deliveries, 1);
    assert.ok(stateExport.snapshot.repAlerts.some((alert) => alert.status === "sent"));
    assert.ok(stateExport.snapshot.repAlerts.some((alert) => alert.status === "queued"));
    assert.equal(stateExport.snapshot.leads.length, 4);
    assert.equal(stateExport.snapshot.betaClients[0].id, betaClient.id);
    assert.equal(stateExport.snapshot.reportDeliveries[0].id, deliveryId);
    assert.equal(stateExport.snapshot.crmDeliveries[0].id, crmDeliveryId);
    assert.equal(stateExport.snapshot.crmDeliveries[0].status, "sent");

    const stateValidation = await postProtectedJson("/api/v1/admin/state/validate", stateExport);
    assert.equal(stateValidation.valid, true);
    assert.equal(stateValidation.restore_ready, true);
    assert.equal(stateValidation.incoming_counts.leads, 4);
    assert.equal(stateValidation.incoming_counts.beta_clients, 1);
    assert.equal(stateValidation.incoming_counts.company_memory, 3);
    assert.equal(stateValidation.incoming_counts.rep_alerts, stateExport.counts.rep_alerts);
    assert.equal(stateValidation.incoming_counts.crm_deliveries, 1);
    assert.equal(stateValidation.current_counts.leads, 4);
    assert.equal(stateValidation.current_counts.rep_alerts, stateExport.counts.rep_alerts);
    assert.equal(stateValidation.current_counts.crm_deliveries, 1);
    assert.equal(stateValidation.delta.leads, 0);
    assert.equal(stateValidation.delta.rep_alerts, 0);
    assert.equal(stateValidation.delta.crm_deliveries, 0);
    assert.deepEqual(stateValidation.errors, []);

    const restoreDryRun = await postProtectedJson("/api/v1/admin/state/restore", {
      backupJson: JSON.stringify(stateExport)
    });
    assert.equal(restoreDryRun.applied, false);
    assert.equal(restoreDryRun.dry_run, true);
    assert.equal(restoreDryRun.requires_confirmation, true);
    assert.equal(restoreDryRun.restore_ready, true);
    assert.equal(restoreDryRun.incoming_counts.leads, 4);
    assert.equal(restoreDryRun.incoming_counts.rep_alerts, stateExport.counts.rep_alerts);
    assert.equal(restoreDryRun.incoming_counts.crm_deliveries, 1);

    const restoreWrongConfirmation = await postProtectedJson("/api/v1/admin/state/restore", {
      backupJson: JSON.stringify(stateExport),
      dryRun: false,
      applyRestore: true,
      confirmation: "RESTORE"
    });
    assert.equal(restoreWrongConfirmation.applied, false);
    assert.equal(restoreWrongConfirmation.requires_confirmation, true);

    const restoreApplied = await postProtectedJson("/api/v1/admin/state/restore", {
      backupJson: JSON.stringify(stateExport),
      dryRun: false,
      applyRestore: true,
      confirmation: "RESTORE DEAL THREADS STATE"
    });
    assert.equal(restoreApplied.applied, true);
    assert.equal(restoreApplied.dry_run, false);
    assert.equal(restoreApplied.requires_confirmation, false);
    assert.equal(restoreApplied.after_counts.leads, 4);
    assert.equal(restoreApplied.after_counts.rep_alerts, stateExport.counts.rep_alerts);
    assert.equal(restoreApplied.after_counts.crm_deliveries, 1);

	    const leadsAfterRestore = await getProtectedJson("/api/v1/leads");
		    assert.equal(leadsAfterRestore.count, 4);

    const malformedValidation = await postProtectedJson("/api/v1/admin/state/validate", { backupJson: "{" });
    assert.equal(malformedValidation.valid, false);
    assert.equal(malformedValidation.restore_ready, false);
    assert.match(malformedValidation.errors[0], /Backup JSON could not be parsed/);

    const duplicateBackup = structuredClone(stateExport);
    duplicateBackup.snapshot.leads.push({ ...duplicateBackup.snapshot.leads[0] });
    const duplicateValidation = await postProtectedJson("/api/v1/admin/state/validate", duplicateBackup);
    assert.equal(duplicateValidation.valid, false);
    assert.equal(duplicateValidation.restore_ready, false);
    assert.ok(duplicateValidation.duplicate_ids.leads.includes(stateExport.snapshot.leads[0].id));
    assert.match(duplicateValidation.errors.join("\n"), /Duplicate leads/);

    const duplicateRepAlertBackup = structuredClone(stateExport);
    duplicateRepAlertBackup.snapshot.repAlerts.push({ ...duplicateRepAlertBackup.snapshot.repAlerts[0] });
    const duplicateRepAlertValidation = await postProtectedJson("/api/v1/admin/state/validate", duplicateRepAlertBackup);
    assert.equal(duplicateRepAlertValidation.valid, false);
    assert.equal(duplicateRepAlertValidation.restore_ready, false);
    assert.ok(duplicateRepAlertValidation.duplicate_ids.rep_alerts.includes(stateExport.snapshot.repAlerts[0].id));
    assert.match(duplicateRepAlertValidation.errors.join("\n"), /Duplicate rep_alerts/);

    const duplicateCrmDeliveryBackup = structuredClone(stateExport);
    duplicateCrmDeliveryBackup.snapshot.crmDeliveries.push({ ...duplicateCrmDeliveryBackup.snapshot.crmDeliveries[0] });
    const duplicateCrmDeliveryValidation = await postProtectedJson("/api/v1/admin/state/validate", duplicateCrmDeliveryBackup);
    assert.equal(duplicateCrmDeliveryValidation.valid, false);
    assert.equal(duplicateCrmDeliveryValidation.restore_ready, false);
    assert.ok(duplicateCrmDeliveryValidation.duplicate_ids.crm_deliveries.includes(crmDeliveryId));
    assert.match(duplicateCrmDeliveryValidation.errors.join("\n"), /Duplicate crm_deliveries/);

    const leadsAfterValidation = await getProtectedJson("/api/v1/leads");
    assert.equal(leadsAfterValidation.count, 4);

    await waitForPersistence(
      dataFile,
      (data) =>
        data.leads?.length === 4 &&
        data.companyMemory?.length === 3 &&
        data.reportDeliveries?.[0]?.status === "sent" &&
        data.crmDeliveries?.[0]?.status === "sent" &&
        data.repAlerts?.some((alert) => alert.status === "sent")
    );
    const persisted = JSON.parse(await readFile(dataFile, "utf8"));
    assert.equal(persisted.config.widget.conversation.launcherText, "Start qualification");
    assert.equal(persisted.config.routing.highPriorityOwner, "regression-ae@example.com");
    assert.ok(persisted.config.widget.tenant.allowedDomains.includes("pilotco.test"));
    assert.equal(persisted.betaClients.length, 1);
    assert.equal(persisted.betaClients[0].status, "live");
    assert.equal(persisted.betaClients[0].widget_config.launcherText, "Ask PilotCo");
    assert.equal(persisted.betaClients[0].routing_overrides.highPriorityOwner, "pilot-ae@example.com");
    assert.equal(persisted.betaClients[0].report_settings.last_delivery_id, deliveryId);
    assert.equal(persisted.betaClients[0].crm_delivery.last_delivery_id, crmDeliveryId);
    assert.equal(persisted.betaClients[0].crm_delivery.last_sent_at, stateExport.snapshot.crmDeliveries[0].sent_at);
    assert.equal(persisted.betaClients[0].experiments.length, 1);
    assert.equal(persisted.betaClients[0].outcome_snapshots.length, 2);
    assert.equal(persisted.betaClients[0].outcome_snapshots[0].metrics.meetings_booked, 1);
    assert.equal(persisted.betaClients[0].outcome_snapshots[0].metrics.opportunities_created, 1);
    assert.equal(persisted.betaClients[0].outcome_snapshots[0].metrics.opportunity_value, 45000);
    assert.equal(persisted.reportDeliveries.length, 1);
    assert.equal(persisted.reportDeliveries[0].status, "sent");
    assert.equal(persisted.reportDeliveries[0].sent_via, "dry_run");
    assert.equal(persisted.reportDeliveries[0].send_attempts.length, 1);
    assert.equal(persisted.crmDeliveries.length, 1);
    assert.equal(persisted.crmDeliveries[0].status, "sent");
    assert.equal(persisted.crmDeliveries[0].sent_via, "dry_run");
    assert.equal(persisted.crmDeliveries[0].send_attempts.length, 1);
    assert.equal(persisted.repAlerts.length, stateExport.counts.rep_alerts);
    const persistedSentRepAlert = persisted.repAlerts.find((alert) => alert.status === "sent");
    assert.ok(persistedSentRepAlert);
    assert.equal(persistedSentRepAlert.sent_via, "dry_run");
    assert.equal(persistedSentRepAlert.send_attempts.length, 1);
    assert.equal(persisted.leads.length, 4);
    assert.equal(persisted.leads[0].workflow.stage, "meeting_booked");
    assert.equal(persisted.leads[0].outcome.status, "opportunity_created");
    assert.equal(persisted.leads[0].outcome.value, 45000);
    assert.equal(persisted.leads[0].outcome.probability, 0.4);
    assert.equal(persisted.leads.find((item) => item.id === lead.id).crm_handoff.status, "sent");
    assert.equal(persisted.leads[0].workflow.notes.length, 2);
    assert.equal(persisted.companyMemory.length, 3);
    const persistedRegressionMemory = persisted.companyMemory.find((record) => record.domain === "regressionco.test");
    const persistedTargetMemory = persisted.companyMemory.find((record) => record.domain === "targetone.test");
    assert.ok(persistedRegressionMemory.corrected_fields.includes("industry"));
    assert.ok(persistedTargetMemory.imported_fields.includes("industry"));
    assert.equal(persisted.hubspotReadiness.summary.required, 26);
  } finally {
    app.kill("SIGTERM");
    await once(app, "exit");
    await rm(tmp, { recursive: true, force: true });
  }
});

test("market gate promotes rep feedback after CRM handoff proof", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-market-rep-feedback-"));
  const dataFile = path.join(tmp, "state.json");
  const app = await startServer(dataFile);

  try {
    const betaClient = await postProtectedJson("/api/v1/beta-clients", {
      name: "PilotCo Revenue Team",
      websiteUrl: "https://pilotco.test",
      ownerEmail: "pilot-owner@example.com",
      crm: "hubspot",
      status: "setup",
      notes: "Focused market-gate rep feedback client.",
      crmDestinationName: "PilotCo CRM webhook",
      crmDeliveryWebhookUrl: "https://hooks.example.test/deal-threads",
      crmDeliveryOwner: "revops@example.com",
      launcherText: "Ask PilotCo",
      welcomeMessage: "PilotCo custom welcome.",
      quickReplies: "Fix handoffs, Improve speed-to-lead",
      requiredFields: "email, business_need, timeline, company_name_or_domain, crm",
      questions: [
        {
          key: "business_need",
          label: "Pilot pain",
          prompt: "What revenue handoff is PilotCo trying to improve?",
          quickReplies: ["Fix handoffs", "Improve speed-to-lead"],
          required: true
        },
        { key: "company_name_or_domain", label: "Company", prompt: "Which company should we build this profile for?", required: true },
        {
          key: "authority",
          label: "Buying owner",
          prompt: "Who owns the buying decision at PilotCo?",
          quickReplies: ["I own the decision", "I influence the decision", "Researching for the team"],
          required: false
        },
        { key: "timeline", label: "Pilot timeline", prompt: "When does PilotCo want this fixed?", required: true },
        { key: "budget", label: "Budget", prompt: "Is budget already approved for this pilot?", required: false },
        { key: "crm", label: "CRM", prompt: "Which CRM should the rep handoff reference?", required: false },
        { key: "email", label: "Work email", prompt: "What work email should the rep use?", required: true },
        { key: "name", label: "Name", prompt: "What name should the rep use?", required: false }
      ],
      primaryColor: "#1d4ed8",
      highPriorityOwner: "pilot-ae@example.com",
      highPriorityAction: "PilotCo high-priority call within 10 minutes.",
      reportRecipients: "pilot-owner@example.com, revops@example.com",
      reportCadence: "weekly",
      reportPeriodDays: "14",
      minimumProofLeads: "1"
    });

    const allowPilotDomain = await postProtectedForm("/admin/widget", {
      tenantName: "Regression Revenue OS",
      allowedDomains: "localhost, 127.0.0.1, pilotco.test",
      launcherText: "Start qualification",
      welcomeMessage: "Regression welcome message.",
      quickReplies: "Improve demo routing, Fix lead quality",
      requiredFields: "email, business_need, timeline, company_name_or_domain",
      primaryColor: "#0f766e",
      consentDisclosure: "Regression consent disclosure."
    });
    assert.equal(allowPilotDomain.status, 303);

    const clientPageUrl = encodeURIComponent("https://pilotco.test/demo");
    const betaConfigClientResponse = await fetch(`${BASE_URL}/api/v1/widgets/wid_deal_threads_demo/config?betaClientId=${betaClient.id}&pageUrl=${clientPageUrl}`, {
      headers: { origin: "https://pilotco.test" }
    });
    assert.equal(betaConfigClientResponse.status, 200);
    const betaConfigClient = await betaConfigClientResponse.json();
    assert.equal(betaConfigClient.betaClientId, betaClient.id);

    const betaClientAfterConfigLoad = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
    assert.equal(betaClientAfterConfigLoad.install_activity.client_page_config_loads, 1);

    const lead = await createHighPriorityLead(betaClient.id);
    assert.equal(lead.source.beta_client_id, betaClient.id);
    assert.equal(lead.crm_handoff.status, "queued");
    assert.equal(lead.rep_feedback.status, "not_reviewed");

    const sentCrmDelivery = await postProtectedJson(`/api/v1/leads/${lead.id}/crm-delivery/send`, {
      note: "Dry-run sent to the pilot CRM before rep feedback."
    });
    assert.equal(sentCrmDelivery.delivery.status, "sent");
    assert.equal(sentCrmDelivery.crm_adapter.transmits_external_crm, false);
    assert.equal(sentCrmDelivery.lead.crm_handoff.status, "sent");

    const marketLaunchAfterCrmProof = await getProtectedJson("/api/v1/launch/market-ready");
    assert.equal(marketLaunchAfterCrmProof.launch_clearance_plan.current_stage, "handoff_feedback");
    const repFeedbackMarketAction = marketLaunchAfterCrmProof.launch_clearance_plan.current_action;
    assert.equal(repFeedbackMarketAction.key, "collect_rep_feedback");
    assert.equal(repFeedbackMarketAction.packet_kind, "rep_feedback");
    assert.equal(repFeedbackMarketAction.proof_focus, "rep_feedback");
    assert.equal(repFeedbackMarketAction.beta_client_id, betaClient.id);
    assert.equal(repFeedbackMarketAction.lead_id, lead.id);
    assert.equal(repFeedbackMarketAction.primary_surface_method, "GET");
    assert.match(repFeedbackMarketAction.primary_surface_url, new RegExp(`/launch/rep-feedback\\?client=${betaClient.id}$`));
    assert.equal(repFeedbackMarketAction.operator_post_method, "POST");
    assert.match(repFeedbackMarketAction.operator_post_url, new RegExp(`/crm/${lead.id}/rep-feedback$`));
    assert.match(repFeedbackMarketAction.operator_post_api_url, new RegExp(`/api/v1/leads/${lead.id}/rep-feedback$`));
    assert.equal(repFeedbackMarketAction.manual_handoff.sends_from_server, false);
    assert.ok(repFeedbackMarketAction.manual_handoff.url.startsWith("mailto:"));
    const repFeedbackMarketPreflight = repFeedbackMarketAction.rep_feedback_preflight;
    assert.equal(repFeedbackMarketPreflight.type, "deal_threads.market_rep_feedback_preflight.v1");
    assert.equal(repFeedbackMarketPreflight.status, "feedback_needed");
    assert.equal(repFeedbackMarketPreflight.ready_to_request_rep_feedback, true);
    assert.equal(repFeedbackMarketPreflight.summary.beta_profiles, 1);
    assert.equal(repFeedbackMarketPreflight.summary.pending_profiles, 1);
    assert.equal(repFeedbackMarketPreflight.summary.reviewed_profiles, 0);
    assert.equal(repFeedbackMarketPreflight.summary.crm_handoff_sent, true);
    assert.equal(repFeedbackMarketPreflight.summary.rep_feedback_clear, false);
    assert.equal(repFeedbackMarketPreflight.summary.paid_lookups_recommended_now, 0);
    assert.equal(repFeedbackMarketPreflight.copy_block.selected_lead_id, lead.id);
    assert.match(repFeedbackMarketPreflight.copy_block.body, new RegExp(`/handoff/${betaClient.handoff_token}/${lead.id}`));
    assert.match(repFeedbackMarketPreflight.copy_block.mailto_url, /^mailto:/);
    assert.equal(repFeedbackMarketPreflight.protected_feedback_surface.method, "POST");
    assert.equal(repFeedbackMarketPreflight.protected_feedback_surface.updates_rep_feedback, true);
    assert.equal(repFeedbackMarketPreflight.protected_feedback_surface.preview_only_on_get, true);
    assert.ok(repFeedbackMarketPreflight.checks.some((check) => check.key === "crm_handoff_sent" && check.status === "pass"));
    assert.ok(repFeedbackMarketPreflight.checks.some((check) => check.key === "rep_feedback_review" && check.status === "warning"));
    assert.ok(repFeedbackMarketPreflight.evidence_required.some((item) => item.key === "tokenized_feedback_room" && item.required));
    assert.ok(repFeedbackMarketPreflight.evidence_required.some((item) => item.key === "rep_feedback_review" && item.required));
    assert.ok(repFeedbackMarketPreflight.evidence_required.some((item) => item.key === "proof_packet_after_feedback" && !item.required));
    assert.equal(repFeedbackMarketPreflight.safety.read_only_get, true);
    assert.equal(repFeedbackMarketPreflight.safety.sends_external_email_on_get, false);
    assert.equal(repFeedbackMarketPreflight.safety.updates_rep_feedback_on_get, false);
    assert.equal(repFeedbackMarketPreflight.safety.protected_feedback_requires_post, true);
    assert.equal(repFeedbackMarketPreflight.safety.feedback_submission_requires_external_rep_or_post, true);
    assert.equal(repFeedbackMarketPreflight.safety.paid_provider_lookup_by_default, false);
    assert.equal(repFeedbackMarketAction.rep_feedback_evidence_contract.length, repFeedbackMarketPreflight.evidence_required.length);
    assert.equal(repFeedbackMarketAction.safety.updates_rep_feedback_on_get, false);
    assert.equal(repFeedbackMarketAction.safety.protected_feedback_requires_post, true);
    assert.equal(repFeedbackMarketAction.safety.operator_post_may_update_rep_feedback, true);

    const marketLaunchAfterCrmProofMarkdown = await getProtectedText("/api/v1/launch/market-ready?format=markdown");
    assert.match(marketLaunchAfterCrmProofMarkdown, /Current action: Collect rep feedback/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /Rep feedback preflight: feedback needed/i);
    assert.match(marketLaunchAfterCrmProofMarkdown, /Rep feedback ready to request: yes/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /Rep feedback pending profiles: 1/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /Rep feedback protected POST requires review: yes/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /Rep feedback paid lookups recommended now: 0/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /#### Rep Feedback Preflight/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /Evidence tokenized_feedback_room: required/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /Evidence rep_feedback_review: required/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /Evidence proof_packet_after_feedback: recommended/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /#### Rep Feedback Ask Preview/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /#### Rep Feedback POST Preview/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /Updates feedback: yes/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /Preview only on GET: yes/);
    assert.match(marketLaunchAfterCrmProofMarkdown, /#### Rep Feedback Links/);
    const marketLaunchAfterCrmProofPage = await getProtectedText("/launch/market-ready");
    assert.match(marketLaunchAfterCrmProofPage, /Rep feedback preflight/);
    assert.match(marketLaunchAfterCrmProofPage, /Rep feedback evidence/);
    assert.match(marketLaunchAfterCrmProofPage, /Rep feedback ask preview/);
    assert.match(marketLaunchAfterCrmProofPage, /Rep feedback POST preview/);
    assert.match(marketLaunchAfterCrmProofPage, /Rep feedback links/);
  } finally {
    app.kill("SIGTERM");
    await once(app, "exit");
    await rm(tmp, { recursive: true, force: true });
  }
});

test("qualified lead can become beta client launch record without polluting beta proof", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-lead-conversion-"));
  const dataFile = path.join(tmp, "state.json");
  const app = await startServer(dataFile);

  try {
    const lead = await createHighPriorityLead();
    assert.equal(lead.source?.beta_client_id || null, null);

    const blockedConversion = await fetch(`${BASE_URL}/api/v1/leads/${lead.id}/beta-client`, { method: "POST" });
    assert.equal(blockedConversion.status, 401);

	    const crmBefore = await getProtectedText(`/crm/${lead.id}`);
	    assert.match(crmBefore, /Beta client conversion/);
	    assert.match(crmBefore, /Create beta client from lead/);
	    assert.match(crmBefore, /does not count the original Deal Threads sales lead as beta traffic/);

	    const activationBeforeConversion = await getProtectedJson("/api/v1/activation/real-beta");
	    assert.equal(activationBeforeConversion.summary.real_beta_clients, 0);
	    assert.equal(activationBeforeConversion.summary.qualified_prospects, 1);
	    assert.equal(activationBeforeConversion.prospects[0].lead_id, lead.id);
		    assert.equal(activationBeforeConversion.prospects[0].domain, "regressionco.test");
		    assert.equal(activationBeforeConversion.prospects[0].runbook_url, `/api/v1/activation/prospects/${lead.id}/runbook`);
		    assert.equal(activationBeforeConversion.prospects[0].close_packet_url, `/api/v1/activation/prospects/${lead.id}/close-packet`);
		    assert.equal(activationBeforeConversion.prospects[0].confirmation_nudge_url, `/api/v1/activation/prospects/${lead.id}/confirmation-nudge`);
			    const activationPageBeforeConversion = await getProtectedText("/activation");
			    assert.match(activationPageBeforeConversion, /Real beta activation/);
			    assert.match(activationPageBeforeConversion, /Follow-ups/);
			    assert.match(activationPageBeforeConversion, /Convert to beta client/);
			    assert.match(activationPageBeforeConversion, /Activation runbook/);
			    assert.match(activationPageBeforeConversion, /Prospect close packet/);
			    assert.match(activationPageBeforeConversion, /Send close packet/);
			    assert.match(activationPageBeforeConversion, /Confirmation nudge packet/);
			    assert.match(activationPageBeforeConversion, /Send confirmation nudge/);
			    assert.match(activationPageBeforeConversion, /Kick off beta install/);
			    assert.match(activationPageBeforeConversion, /name="returnTo" value="\/activation"/);

		    const followUpsBeforeConversion = await getProtectedJson("/api/v1/activation/follow-ups");
		    assert.equal(followUpsBeforeConversion.type, "deal_threads.activation_followups.v1");
		    assert.equal(followUpsBeforeConversion.safety.mutates_buyer_state_on_get, false);
		    assert.equal(followUpsBeforeConversion.safety.sends_external_email_on_get, false);
		    assert.equal(followUpsBeforeConversion.safety.creates_beta_client_on_get, false);
		    assert.equal(followUpsBeforeConversion.safety.paid_provider_lookup_by_default, false);
		    assert.equal(followUpsBeforeConversion.summary.qualified_prospects, 1);
		    assert.equal(followUpsBeforeConversion.summary.close_packet_needed, 1);
		    assert.equal(followUpsBeforeConversion.queue[0].lead_id, lead.id);
				    assert.equal(followUpsBeforeConversion.queue[0].status, "send_close_packet");
				    assert.match(followUpsBeforeConversion.queue[0].next_action, /Send the prospect close packet/);
				    assert.match(followUpsBeforeConversion.queue[0].protected_links.confirmation_workbench, new RegExp(`/activation/prospects/${lead.id}/confirmation-workbench$`));
				    assert.match(followUpsBeforeConversion.queue[0].protected_links.stakeholder_handoff, new RegExp(`/activation/prospects/${lead.id}/stakeholder-handoff$`));
				    assert.match(followUpsBeforeConversion.queue[0].protected_links.runbook, new RegExp(`/api/v1/activation/prospects/${lead.id}/runbook$`));
				    assert.match(followUpsBeforeConversion.queue[0].public_links.buyer_confirmation, /\/confirm\/pcf_[a-f0-9]+$/);
		    const followUpsMarkdown = await getProtectedText("/api/v1/activation/follow-ups?format=markdown");
		    assert.match(followUpsMarkdown, /# Deal Threads Activation Follow-Up Queue/);
		    assert.match(followUpsMarkdown, /RegressionCo/);
		    assert.match(followUpsMarkdown, /GET sends external email: no/);
		    const followUpsPage = await getProtectedText("/activation/follow-ups");
			    assert.match(followUpsPage, /Activation follow-up queue/);
				    assert.match(followUpsPage, /RegressionCo/);
				    assert.match(followUpsPage, /Workbench/);
				    assert.match(followUpsPage, /Handoff pack/);
				    assert.match(followUpsPage, /Close desk/);
				    assert.match(followUpsPage, /Send close packet/);
			    assert.match(followUpsPage, /no email sends, buyer-state mutation, beta-client creation, live-proof claims, or paid enrichment runs/i);

		    const closeDesk = await getProtectedJson("/api/v1/activation/close-desk");
		    assert.equal(closeDesk.type, "deal_threads.activation_close_desk.v1");
			    assert.equal(closeDesk.summary.qualified_prospects, 1);
			    assert.equal(closeDesk.summary.close_packets_ready, 1);
			    assert.equal(closeDesk.summary.first_five_campaign_planned_sends, 1);
			    assert.equal(closeDesk.summary.first_five_campaign_mailto_drafts, 1);
			    assert.equal(closeDesk.summary.first_five_campaign_manual_recorders, 1);
			    assert.equal(closeDesk.summary.confirmation_chase_planned_sends, 0);
			    assert.equal(closeDesk.summary.confirmation_chase_mailto_drafts, 0);
			    assert.equal(closeDesk.summary.confirmation_chase_manual_recorders, 0);
			    assert.equal(closeDesk.summary.paid_lookups_recommended_now, 0);
		    assert.equal(closeDesk.safety.mutates_buyer_state_on_get, false);
		    assert.equal(closeDesk.safety.sends_external_email_on_get, false);
		    assert.equal(closeDesk.safety.creates_beta_client_on_get, false);
		    assert.equal(closeDesk.safety.transmits_external_crm_on_get, false);
		    assert.equal(closeDesk.safety.paid_provider_lookup_by_default, false);
		    assert.equal(closeDesk.safety.live_proof_claimed, false);
			    assert.equal(closeDesk.items[0].lead_id, lead.id);
			    assert.equal(closeDesk.items[0].recommended_packet.kind, "close_packet");
			    assert.equal(closeDesk.items[0].send_action.method, "POST");
			    assert.equal(closeDesk.items[0].manual_sent_action.method, "POST");
			    assert.equal(closeDesk.items[0].manual_sent_action.sends_from_server, false);
			    assert.match(closeDesk.items[0].manual_sent_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-workflow$`));
			    assert.match(closeDesk.items[0].recommended_packet.subject, /RegressionCo|Deal Threads beta pilot/i);
			    assert.match(closeDesk.items[0].recommended_packet.body, /buyer confirmation form/i);
			    assert.match(closeDesk.items[0].protected_links.confirmation_workbench, new RegExp(`/activation/prospects/${lead.id}/confirmation-workbench$`));
			    assert.match(closeDesk.items[0].public_links.buyer_confirmation_status, /\/confirm\/pcf_[a-f0-9]+\/status$/);
			    assert.match(closeDesk.items[0].public_links.buyer_confirmation_request_kit, /\/confirm\/pcf_[a-f0-9]+\/request-kit$/);
			    assert.equal(closeDesk.first_five_campaign.type, "deal_threads.first_five_close_packet_campaign.v1");
			    assert.equal(closeDesk.first_five_campaign.summary.planned_send_count, 1);
			    assert.equal(closeDesk.first_five_campaign.summary.reserve_prospects, 0);
			    assert.equal(closeDesk.first_five_campaign.summary.paid_lookups_recommended_now, 0);
			    assert.equal(closeDesk.first_five_campaign.safety.sends_external_email_on_get, false);
			    assert.equal(closeDesk.first_five_campaign.safety.manual_record_requires_post, true);
			    assert.equal(closeDesk.first_five_campaign.batch_items[0].lead_id, lead.id);
			    assert.match(closeDesk.first_five_campaign.batch_items[0].mailto_url, /^mailto:/);
			    assert.match(closeDesk.first_five_campaign.batch_items[0].manual_sent_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-workflow$`));
			    assert.equal(closeDesk.confirmation_chase_campaign.type, "deal_threads.buyer_confirmation_chase_campaign.v1");
			    assert.equal(closeDesk.confirmation_chase_campaign.summary.planned_send_count, 0);
			    assert.equal(closeDesk.confirmation_chase_campaign.safety.sends_external_email_on_get, false);
			    assert.equal(closeDesk.confirmation_chase_campaign.safety.manual_record_requires_post, true);
			    const closeDeskMarkdown = await getProtectedText("/api/v1/activation/close-desk?format=markdown");
			    assert.match(closeDeskMarkdown, /# Deal Threads Activation Close Desk/);
			    assert.match(closeDeskMarkdown, /## First-Five Close Packet Campaign/);
			    assert.match(closeDeskMarkdown, /## Buyer Confirmation Chase Campaign/);
			    assert.match(closeDeskMarkdown, /First-five campaign planned sends: 1/);
			    assert.match(closeDeskMarkdown, /Confirmation chase planned sends: 0/);
			    assert.match(closeDeskMarkdown, /Mailto draft: mailto:/);
			    assert.match(closeDeskMarkdown, new RegExp(`Manual sent POST: .*\\/api\\/v1\\/activation\\/prospects\\/${lead.id}\\/close-workflow`));
			    assert.match(closeDeskMarkdown, /Paid lookups recommended now: 0/);
			    assert.match(closeDeskMarkdown, /GET sends external email: no/);
			    assert.match(closeDeskMarkdown, /Manual record requires POST: yes/);
			    const closeDeskPage = await getProtectedText("/activation/close-desk");
			    assert.match(closeDeskPage, /Activation close desk/);
			    assert.match(closeDeskPage, /Batch the close packets, confirmation nudges, manual captures, and kickoffs needed to unlock the first real beta/);
			    assert.match(closeDeskPage, /First-five close packet campaign/);
			    assert.match(closeDeskPage, /Buyer confirmation chase campaign/);
			    assert.match(closeDeskPage, /Campaign sends/);
			    assert.match(closeDeskPage, /Chase sends/);
			    assert.match(closeDeskPage, /Mark manual close packet sent/);
			    assert.match(closeDeskPage, /GET is read-only: no email sends, buyer-state mutation, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/i);
		    assert.match(closeDeskPage, /RegressionCo/);
		    assert.match(closeDeskPage, /Send close packet/);

		    const firstFiveBoardBeforeConversion = await getProtectedJson("/api/v1/launch/first-five-board");
		    assert.equal(firstFiveBoardBeforeConversion.type, "deal_threads.first_five_beta_board.v1");
		    assert.equal(firstFiveBoardBeforeConversion.summary.target_client_count, firstFiveBoardBeforeConversion.slots.length);
		    assert.equal(firstFiveBoardBeforeConversion.summary.real_beta_clients, 0);
		    assert.equal(firstFiveBoardBeforeConversion.summary.activation_prospects, 1);
		    assert.equal(firstFiveBoardBeforeConversion.summary.paid_lookups_recommended_now, 0);
		    assert.equal(firstFiveBoardBeforeConversion.providerless_guardrail.paid_lookup_allowed_by_default, false);
		    assert.equal(firstFiveBoardBeforeConversion.providerless_guardrail.manual_approval_required, true);
		    assert.equal(firstFiveBoardBeforeConversion.providerless_guardrail.recommended_paid_lookups_now, 0);
		    assert.equal(firstFiveBoardBeforeConversion.safety.read_only_get, true);
		    assert.equal(firstFiveBoardBeforeConversion.safety.sends_external_email_on_get, false);
		    assert.equal(firstFiveBoardBeforeConversion.safety.creates_beta_client_on_get, false);
		    assert.equal(firstFiveBoardBeforeConversion.safety.marks_buyer_confirmation_complete_on_get, false);
		    assert.equal(firstFiveBoardBeforeConversion.safety.transmits_external_crm_on_get, false);
		    assert.equal(firstFiveBoardBeforeConversion.safety.paid_provider_lookup_by_default, false);
			    assert.equal(firstFiveBoardBeforeConversion.safety.bulk_send_on_get, false);
			    assert.equal(firstFiveBoardBeforeConversion.safety.live_proof_claimed, false);
			    assert.equal(firstFiveBoardBeforeConversion.first_open_slot.kind, "activation_prospect");
			    assert.equal(firstFiveBoardBeforeConversion.first_open_slot.source_id, lead.id);
			    assert.equal(firstFiveBoardBeforeConversion.first_open_slot.action_kit.packet_kind, "close_packet");
			    assert.match(firstFiveBoardBeforeConversion.first_open_slot.action_kit.manual_handoff.url, /^mailto:/);
			    assert.equal(firstFiveBoardBeforeConversion.first_open_slot.action_kit.manual_handoff.sends_from_server, false);
			    assert.equal(firstFiveBoardBeforeConversion.first_open_slot.action_kit.send_action.method, "POST");
			    assert.equal(firstFiveBoardBeforeConversion.first_open_slot.action_kit.manual_sent_action.method, "POST");
			    assert.match(firstFiveBoardBeforeConversion.first_open_slot.action_kit.protected_links.reply_preview, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
			    const firstFiveProspectSlot = firstFiveBoardBeforeConversion.slots.find((slot) => slot.kind === "activation_prospect");
		    assert.ok(firstFiveProspectSlot, "Expected first-five board to include activation prospect slot");
		    assert.equal(firstFiveProspectSlot.source_id, lead.id);
		    assert.equal(firstFiveProspectSlot.packet_kind, "close_packet");
		    assert.equal(firstFiveProspectSlot.action_kit.packet_kind, "close_packet");
		    assert.equal(firstFiveProspectSlot.action_kit.manual_handoff.method, "mailto");
		    assert.equal(firstFiveProspectSlot.action_kit.manual_handoff.opens_local_email_draft, true);
		    assert.equal(firstFiveProspectSlot.action_kit.manual_handoff.sends_from_server, false);
		    assert.match(firstFiveProspectSlot.action_kit.manual_handoff.url, /^mailto:/);
		    assert.equal(firstFiveProspectSlot.action_kit.send_action.method, "POST");
		    assert.equal(firstFiveProspectSlot.action_kit.manual_sent_action.method, "POST");
		    assert.equal(firstFiveProspectSlot.action_kit.manual_sent_action.sends_from_server, false);
		    assert.equal(firstFiveProspectSlot.action_kit.safety.manual_record_requires_post, true);
		    assert.equal(firstFiveProspectSlot.action_kit.safety.sends_external_email_on_get, false);
		    assert.equal(firstFiveProspectSlot.action_kit.safety.paid_provider_lookup_by_default, false);
		    assert.match(firstFiveProspectSlot.action_kit.protected_links.reply_preview, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
		    assert.match(firstFiveProspectSlot.links.primary, new RegExp(`/activation/prospects/${lead.id}/confirmation-workbench$`));
		    const firstFiveBoardMarkdownBeforeConversion = await getProtectedText("/api/v1/launch/first-five-board?format=markdown");
			    assert.match(firstFiveBoardMarkdownBeforeConversion, /# Deal Threads First-Five Beta Board/);
			    assert.match(firstFiveBoardMarkdownBeforeConversion, /RegressionCo/);
			    assert.match(firstFiveBoardMarkdownBeforeConversion, /First open action kit packet: Prospect close packet/);
			    assert.match(firstFiveBoardMarkdownBeforeConversion, /First open mailto draft: mailto:/);
			    assert.match(firstFiveBoardMarkdownBeforeConversion, /First open send POST:/);
			    assert.match(firstFiveBoardMarkdownBeforeConversion, /First open manual sent POST:/);
			    assert.match(firstFiveBoardMarkdownBeforeConversion, /First open manual record requires POST: yes/);
			    assert.match(firstFiveBoardMarkdownBeforeConversion, /Action kit packet: Prospect close packet/);
		    assert.match(firstFiveBoardMarkdownBeforeConversion, /Mailto draft: mailto:/);
		    assert.match(firstFiveBoardMarkdownBeforeConversion, /Manual sent POST:/);
		    assert.match(firstFiveBoardMarkdownBeforeConversion, /Manual record requires POST: yes/);
		    assert.match(firstFiveBoardMarkdownBeforeConversion, /Providerless Guardrail/);
		    assert.match(firstFiveBoardMarkdownBeforeConversion, /Paid lookups recommended now: 0/);
		    assert.match(firstFiveBoardMarkdownBeforeConversion, /GET sends external email: no/);
		    const firstFiveBoardPageBeforeConversion = await getProtectedText("/launch/first-five-board");
		    assert.match(firstFiveBoardPageBeforeConversion, /First-five beta board/);
			    assert.match(firstFiveBoardPageBeforeConversion, /Providerless launch guardrail/);
			    assert.match(firstFiveBoardPageBeforeConversion, /Slot 1/);
			    assert.match(firstFiveBoardPageBeforeConversion, /RegressionCo/);
			    assert.match(firstFiveBoardPageBeforeConversion, /First open action kit/);
			    assert.match(firstFiveBoardPageBeforeConversion, /Action kit/);
		    assert.match(firstFiveBoardPageBeforeConversion, /Open manual draft/);
		    assert.match(firstFiveBoardPageBeforeConversion, /Manual sent POST/);
		    assert.match(firstFiveBoardPageBeforeConversion, /Reply preview/);
		    assert.match(firstFiveBoardPageBeforeConversion, /No email, CRM transmission, buyer-state mutation, beta-client creation, bulk send, live-proof claim, or paid enrichment runs on GET/i);

		    const activationOutbox = await getProtectedJson("/api/v1/activation/outbox");
		    assert.equal(activationOutbox.type, "deal_threads.activation_outbox.v1");
		    assert.equal(activationOutbox.summary.qualified_prospects, 1);
		    assert.equal(activationOutbox.summary.sendable_items, 1);
		    assert.equal(activationOutbox.summary.close_packets_ready, 1);
		    assert.equal(activationOutbox.summary.confirmation_nudges_ready, 0);
		    assert.equal(activationOutbox.summary.manual_mailto_drafts, 1);
		    assert.equal(activationOutbox.summary.send_rooms_ready, 1);
		    assert.equal(activationOutbox.summary.manual_sent_recorders, 1);
		    assert.equal(activationOutbox.summary.paid_lookups_recommended_now, 0);
		    assert.match(activationOutbox.first_item.manual_mailto_url, /^mailto:/);
		    assert.equal(activationOutbox.first_item.send_room.status, "manual_draft_ready");
		    assert.match(activationOutbox.first_item.send_room.manual_mailto_url, /^mailto:/);
		    assert.equal(activationOutbox.first_item.send_room.manual_sent_action.method, "POST");
		    assert.equal(activationOutbox.first_item.send_room.post_send_plan.status, "ready_after_manual_send");
		    assert.match(activationOutbox.first_item.send_room.post_send_plan.watch_room, /\/launch\/confirmation-watch$/);
		    assert.match(activationOutbox.first_item.send_room.post_send_plan.reply_parser, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
		    assert.equal(activationOutbox.first_item.send_room.post_send_plan.paid_enrichment_needed_now, 0);
		    assert.ok(activationOutbox.first_item.send_room.post_send_plan.after_send_actions.some((action) => /Record manual mailbox delivery/i.test(action)));
		    assert.equal(activationOutbox.first_item.send_room.proof_effect.paid_enrichment_needed_now, 0);
		    assert.equal(activationOutbox.items[0].lead_id, lead.id);
		    assert.equal(activationOutbox.items[0].packet.kind, "close_packet");
		    assert.match(activationOutbox.items[0].packet.subject, /RegressionCo|Deal Threads beta pilot/i);
		    assert.match(activationOutbox.items[0].packet.body, /buyer confirmation form/i);
		    assert.match(activationOutbox.items[0].packet.mailto_url, /^mailto:/);
		    assert.match(activationOutbox.items[0].packet.manual_mailto_url, /^mailto:/);
		    assert.match(activationOutbox.items[0].manual_mailto_url, /^mailto:/);
		    assert.equal(activationOutbox.items[0].send_room.status, "manual_draft_ready");
		    assert.equal(activationOutbox.items[0].send_room.has_manual_mailto_draft, true);
		    assert.match(activationOutbox.items[0].send_room.manual_mailto_url, /^mailto:/);
		    assert.equal(activationOutbox.items[0].send_room.safety.read_only_get, true);
		    assert.equal(activationOutbox.items[0].send_room.safety.sends_external_email_on_get, false);
		    assert.equal(activationOutbox.items[0].send_room.safety.paid_provider_lookup_by_default, false);
		    assert.equal(activationOutbox.items[0].send_room.post_send_plan.status, "ready_after_manual_send");
		    assert.equal(activationOutbox.items[0].send_room.post_send_plan.manual_sent_recorder.method, "POST");
		    assert.match(activationOutbox.items[0].send_room.post_send_plan.watch_room, /\/launch\/confirmation-watch$/);
		    assert.match(activationOutbox.items[0].send_room.post_send_plan.reply_parser, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
		    assert.ok(activationOutbox.items[0].send_room.post_send_plan.acceptance_criteria.some((item) => /Real beta kickoff remains blocked/i.test(item)));
		    assert.equal(activationOutbox.items[0].send_room.proof_effect.paid_enrichment_needed_now, 0);
		    assert.equal(activationOutbox.items[0].manual_handoff.method, "mailto");
			    assert.equal(activationOutbox.items[0].manual_handoff.opens_local_email_draft, true);
			    assert.equal(activationOutbox.items[0].manual_handoff.sends_from_server, false);
			    assert.equal(activationOutbox.items[0].send_action.method, "POST");
			    assert.equal(activationOutbox.items[0].send_action.preview_only_on_get, true);
			    assert.match(activationOutbox.items[0].send_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-packet/send$`));
			    assert.equal(activationOutbox.items[0].manual_sent_action.method, "POST");
			    assert.equal(activationOutbox.items[0].manual_sent_action.sends_from_server, false);
			    assert.equal(activationOutbox.items[0].manual_sent_action.mutates_state, true);
			    assert.match(activationOutbox.items[0].manual_sent_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-workflow$`));
			    assert.equal(activationOutbox.safety.read_only_get, true);
		    assert.equal(activationOutbox.safety.mutates_buyer_state_on_get, false);
		    assert.equal(activationOutbox.safety.sends_external_email_on_get, false);
		    assert.equal(activationOutbox.safety.creates_beta_client_on_get, false);
		    assert.equal(activationOutbox.safety.transmits_external_crm_on_get, false);
		    assert.equal(activationOutbox.safety.paid_provider_lookup_by_default, false);
		    assert.equal(activationOutbox.safety.live_proof_claimed, false);
		    assert.equal(activationOutbox.safety.send_actions_require_post, true);
		    const activationOutboxMarkdown = await getProtectedText("/api/v1/activation/outbox?format=markdown");
		    assert.match(activationOutboxMarkdown, /# Deal Threads Activation Outbox/);
		    assert.match(activationOutboxMarkdown, /Paid lookups recommended now: 0/);
			    assert.match(activationOutboxMarkdown, /Send rooms ready: 1/);
			    assert.match(activationOutboxMarkdown, /Manual mailto drafts: 1/);
			    assert.match(activationOutboxMarkdown, /Send actions require POST: yes/);
			    assert.match(activationOutboxMarkdown, /Send room: Manual draft ready/);
			    assert.match(activationOutboxMarkdown, /Send room mailto draft: mailto:/);
			    assert.match(activationOutboxMarkdown, /Post-send plan: Ready after manual send/);
			    assert.match(activationOutboxMarkdown, /Watch room: .*\/launch\/confirmation-watch/);
			    assert.match(activationOutboxMarkdown, /Reply parser: .*\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-reply/);
			    assert.match(activationOutboxMarkdown, /Manual email draft: mailto:/);
			    assert.match(activationOutboxMarkdown, /Manual sent POST: POST .*\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/close-workflow/);
			    const activationOutboxPage = await getProtectedText("/activation/outbox");
		    assert.match(activationOutboxPage, /Activation outbox/);
		    assert.match(activationOutboxPage, /Review the buyer follow-ups that are ready to send before the first real beta can move forward/);
		    assert.match(activationOutboxPage, /GET is read-only: no email sends, buyer-state mutation, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/i);
		    assert.match(activationOutboxPage, /RegressionCo/);
			    assert.match(activationOutboxPage, /Send close packet/);
			    assert.match(activationOutboxPage, /Send rooms/);
			    assert.match(activationOutboxPage, /Manual draft ready/);
			    assert.match(activationOutboxPage, /Post-send plan/);
			    assert.match(activationOutboxPage, /After send/);
			    assert.match(activationOutboxPage, /Watch confirmation/);
			    assert.match(activationOutboxPage, /Parse buyer reply/);
			    assert.match(activationOutboxPage, /Open manual email draft/);
			    assert.match(activationOutboxPage, /Mark manual draft sent/);

		    const firstBetaDrill = await getProtectedJson("/api/v1/launch/first-beta-drill");
		    assert.equal(firstBetaDrill.type, "deal_threads.first_beta_launch_drill.v1");
		    assert.equal(firstBetaDrill.market_ready, false);
		    assert.equal(firstBetaDrill.summary.required_code_builds_before_first_beta, 0);
		    assert.equal(firstBetaDrill.summary.paid_lookups_recommended_now, 0);
		    assert.ok(firstBetaDrill.summary.required_real_world_steps >= 1);
		    assert.ok(firstBetaDrill.summary.open_steps >= 1);
		    assert.ok(firstBetaDrill.first_open_step?.next_action);
		    assert.equal(firstBetaDrill.first_open_step?.key, "send_close_packet");
		    assert.ok(firstBetaDrill.steps.some((step) => step.key === "send_close_packet"));
		    assert.ok(firstBetaDrill.steps.some((step) => step.key === "capture_buyer_confirmation"));
		    assert.ok(firstBetaDrill.steps.some((step) => step.key === "create_real_beta_client"));
		    assert.ok(firstBetaDrill.steps.some((step) => step.key === "verify_client_domain_install" && /Hosted\/test loads do not count|client domain|target page/i.test(step.acceptance_criteria)));
		    assert.ok(firstBetaDrill.steps.some((step) => step.key === "rerun_live_proof_gate"));
		    assert.equal(firstBetaDrill.safety.read_only_get, true);
		    assert.equal(firstBetaDrill.safety.sends_external_email_on_get, false);
		    assert.equal(firstBetaDrill.safety.marks_buyer_confirmation_complete_on_get, false);
		    assert.equal(firstBetaDrill.safety.creates_beta_client_on_get, false);
		    assert.equal(firstBetaDrill.safety.transmits_external_crm_on_get, false);
		    assert.equal(firstBetaDrill.safety.paid_provider_lookup_by_default, false);
		    assert.equal(firstBetaDrill.safety.live_proof_claimed, false);
		    assert.equal(firstBetaDrill.safety.operator_posts_are_previews_only, true);
		    const firstBetaDrillMarkdown = await getProtectedText("/api/v1/launch/first-beta-drill?format=markdown");
		    assert.match(firstBetaDrillMarkdown, /# Deal Threads First Beta Launch Drill/);
		    assert.match(firstBetaDrillMarkdown, /Required code builds before first beta: 0/);
		    assert.match(firstBetaDrillMarkdown, /Paid lookups recommended now: 0/);
		    assert.match(firstBetaDrillMarkdown, /Operator POSTs are previews only: yes/);
		    const firstBetaDrillPage = await getProtectedText("/launch/first-beta-drill");
		    assert.match(firstBetaDrillPage, /First beta launch drill/);
		    assert.match(firstBetaDrillPage, /Read-only rehearsal from buyer confirmation through install, first profile, CRM handoff, rep feedback, and live-proof review/);
		    assert.match(firstBetaDrillPage, /Operator POSTs shown here are previews only/);
		    assert.match(firstBetaDrillPage, /Code builds before beta/);
		    assert.match(firstBetaDrillPage, /Drill sequence/);

		    const firstBetaExecution = await getProtectedJson("/api/v1/launch/first-beta-execution");
		    assert.equal(firstBetaExecution.type, "deal_threads.first_beta_execution_packet.v1");
		    assert.equal(firstBetaExecution.status, "buyer_confirmation_action_ready");
		    assert.equal(firstBetaExecution.market_ready, false);
		    assert.equal(firstBetaExecution.summary.active_buyer_ready, true);
		    assert.equal(firstBetaExecution.summary.active_company, "RegressionCo");
		    assert.equal(firstBetaExecution.summary.active_lead_id, lead.id);
		    assert.equal(firstBetaExecution.summary.first_open_step, "send_close_packet");
		    assert.match(firstBetaExecution.summary.first_open_step_label, /close packet/i);
		    assert.match(firstBetaExecution.summary.first_open_step_next_action, /close packet|buyer confirmation/i);
		    assert.equal(firstBetaExecution.summary.required_code_builds_before_first_beta, 0);
		    assert.equal(firstBetaExecution.summary.paid_lookups_recommended_now, 0);
		    assert.ok(firstBetaExecution.summary.required_real_world_steps >= 1);
		    assert.ok(firstBetaExecution.summary.operator_post_previews >= 1);
		    assert.ok(firstBetaExecution.summary.external_owner_actions >= 1);
		    assert.ok(firstBetaExecution.active_buyer.missing_confirmation_details.includes("Target page"));
		    assert.match(firstBetaExecution.active_buyer.protected_links.reply_preview, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
		    assert.match(firstBetaExecution.active_buyer.protected_links.workbench, new RegExp(`/activation/prospects/${lead.id}/confirmation-workbench$`));
		    assert.match(firstBetaExecution.active_buyer.buyer_safe_links.confirmation_form, /\/confirm\/pcf_/);
		    assert.match(firstBetaExecution.copy_blocks.buyer_follow_up.subject, /RegressionCo|Deal Threads beta pilot/i);
			    assert.match(firstBetaExecution.copy_blocks.buyer_follow_up.body, /buyer confirmation form/i);
			    assert.match(firstBetaExecution.copy_blocks.buyer_follow_up.mailto_url, /^mailto:/);
			    assert.match(firstBetaExecution.copy_blocks.buyer_follow_up.manual_sent_api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-workflow$`));
			    assert.match(firstBetaExecution.active_buyer.manual_sent_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-workflow$`));
			    assert.ok(firstBetaExecution.operator_post_previews.some((preview) => preview.key === "mark_manual_follow_up_sent"));
			    assert.ok(firstBetaExecution.sequence.some((step) => step.key === "collect_buyer_confirmation"));
		    assert.ok(firstBetaExecution.sequence.some((step) => step.key === "apply_reviewed_confirmation"));
		    assert.ok(firstBetaExecution.sequence.some((step) => step.key === "first_real_profile"));
		    assert.ok(firstBetaExecution.sequence.some((step) => step.key === "crm_handoff_proof"));
		    assert.ok(firstBetaExecution.sequence.some((step) => step.key === "live_proof_review"));
		    assert.equal(firstBetaExecution.providerless_enrichment.status, "providerless_ready");
		    assert.equal(firstBetaExecution.providerless_enrichment.summary.recommended_paid_lookups_now, 0);
		    assert.equal(firstBetaExecution.providerless_enrichment.summary.paid_provider_calls, 0);
		    assert.equal(firstBetaExecution.providerless_enrichment.paid_firewall.allowed_by_default, false);
		    assert.equal(firstBetaExecution.providerless_enrichment.paid_firewall.manual_approval_required, true);
		    assert.ok(firstBetaExecution.providerless_enrichment.internal_source_stack.includes("Visitor-declared buying context from the chat"));
		    assert.ok(firstBetaExecution.providerless_enrichment.stages.some((stage) => stage.key === "paid_provider_firewall"));
		    assert.ok(firstBetaExecution.providerless_enrichment.quality_gates.some((gate) => gate.label === "Paid-provider spend" && gate.passed));
		    assert.match(firstBetaExecution.source_packets.providerless_build_plan, /\/api\/v1\/enrichment\/build-plan$/);
		    assert.equal(firstBetaExecution.safety.read_only_get, true);
		    assert.equal(firstBetaExecution.safety.sends_external_email_on_get, false);
		    assert.equal(firstBetaExecution.safety.marks_buyer_confirmation_complete_on_get, false);
		    assert.equal(firstBetaExecution.safety.creates_beta_client_on_get, false);
		    assert.equal(firstBetaExecution.safety.transmits_external_crm_on_get, false);
		    assert.equal(firstBetaExecution.safety.paid_provider_lookup_by_default, false);
		    assert.equal(firstBetaExecution.safety.live_proof_claimed, false);
		    assert.equal(firstBetaExecution.safety.operator_posts_are_previews_only, true);
		    const firstBetaExecutionMarkdown = await getProtectedText("/api/v1/launch/first-beta-execution?format=markdown");
		    assert.match(firstBetaExecutionMarkdown, /# Deal Threads First Beta Execution Packet/);
		    assert.match(firstBetaExecutionMarkdown, /Required code builds before first beta: 0/);
		    assert.match(firstBetaExecutionMarkdown, /Paid lookups recommended now: 0/);
			    assert.match(firstBetaExecutionMarkdown, /Operator POSTs are previews only: yes/);
			    assert.match(firstBetaExecutionMarkdown, /Manual email draft: mailto:/);
			    assert.match(firstBetaExecutionMarkdown, /Manual sent POST: .*\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/close-workflow/);
			    assert.match(firstBetaExecutionMarkdown, /Providerless Enrichment Cost Firewall/);
		    assert.match(firstBetaExecutionMarkdown, /Recommended paid lookups now: 0/);
		    assert.match(firstBetaExecutionMarkdown, /Paid lookup allowed by default: no/);
		    const firstBetaExecutionPage = await getProtectedText("/launch/first-beta-execution");
		    assert.match(firstBetaExecutionPage, /First beta execution packet/);
		    assert.match(firstBetaExecutionPage, /Current buyer action/);
		    assert.match(firstBetaExecutionPage, /Copy-ready buyer follow-up/);
		    assert.match(firstBetaExecutionPage, /GET is read-only: no email send, buyer-confirmation completion, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/);
			    assert.match(firstBetaExecutionPage, /Execution sequence/);
			    assert.match(firstBetaExecutionPage, /Open manual email draft/);
			    assert.match(firstBetaExecutionPage, /Manual sent POST/);
			    assert.match(firstBetaExecutionPage, /Providerless enrichment cost firewall/);
			    assert.match(firstBetaExecutionPage, /Open enrichment control/);

			    const firstBetaNextAction = await getProtectedJson("/api/v1/launch/next-action");
			    assert.equal(firstBetaNextAction.type, "deal_threads.first_beta_next_action.v1");
			    assert.equal(firstBetaNextAction.status, "active_buyer_follow_up_ready");
			    assert.equal(firstBetaNextAction.market_ready, false);
			    assert.equal(firstBetaNextAction.summary.active_buyer_ready, true);
			    assert.equal(firstBetaNextAction.summary.active_company, "RegressionCo");
			    assert.equal(firstBetaNextAction.summary.active_lead_id, lead.id);
			    assert.equal(firstBetaNextAction.summary.packet_kind, "close_packet");
			    assert.equal(firstBetaNextAction.summary.manual_sent_action_ready, true);
			    assert.equal(firstBetaNextAction.summary.post_send_plan_ready, true);
			    assert.equal(firstBetaNextAction.summary.post_send_next_gate, "buyer_confirmation_waiting");
			    assert.equal(firstBetaNextAction.summary.required_code_builds_before_first_beta, 0);
			    assert.equal(firstBetaNextAction.summary.paid_lookups_recommended_now, 0);
			    assert.match(firstBetaNextAction.current_follow_up.mailto_url, /^mailto:/);
			    assert.match(firstBetaNextAction.current_follow_up.send_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-packet/send$`));
			    assert.match(firstBetaNextAction.current_follow_up.manual_sent_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-workflow$`));
			    assert.equal(firstBetaNextAction.current_follow_up.manual_sent_action.sends_from_server, false);
			    assert.equal(firstBetaNextAction.current_follow_up.manual_sent_action.mutates_state, true);
			    assert.match(firstBetaNextAction.copy_block.manual_sent_api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-workflow$`));
			    assert.match(firstBetaNextAction.buyer_links.confirmation_form, /\/confirm\/pcf_/);
			    assert.match(firstBetaNextAction.protected_links.workbench, new RegExp(`/activation/prospects/${lead.id}/confirmation-workbench$`));
			    assert.equal(firstBetaNextAction.proof_focus.key, "buyer_confirmation");
			    assert.ok(firstBetaNextAction.operator_steps.some((step) => step.key === "record_manual_send" && step.status === "ready_after_manual_send"));
			    assert.ok(firstBetaNextAction.operator_steps.some((step) => step.key === "watch_buyer_confirmation"));
			    assert.ok(firstBetaNextAction.operator_post_previews.some((preview) => preview.key === "mark_manual_follow_up_sent"));
			    assert.equal(firstBetaNextAction.post_send_plan.status, "ready_after_manual_send");
			    assert.match(firstBetaNextAction.post_send_plan.watch_room, /\/launch\/confirmation-watch$/);
			    assert.match(firstBetaNextAction.post_send_plan.reply_parser, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
			    assert.match(firstBetaNextAction.post_send_plan.manual_sent_recorder.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-workflow$`));
			    assert.ok(firstBetaNextAction.post_send_plan.after_send_actions.some((action) => /Record manual mailbox delivery/i.test(action)));
			    assert.ok(firstBetaNextAction.post_send_plan.acceptance_criteria.some((item) => /Buyer confirmation captures target page/i.test(item)));
			    assert.equal(firstBetaNextAction.post_send_plan.safety.read_only_get, true);
			    assert.equal(firstBetaNextAction.post_send_plan.safety.sends_external_email_on_get, false);
			    assert.equal(firstBetaNextAction.post_send_plan.safety.creates_beta_client_on_get, false);
			    assert.equal(firstBetaNextAction.post_send_plan.safety.transmits_external_crm_on_get, false);
			    assert.equal(firstBetaNextAction.post_send_plan.safety.paid_provider_lookup_by_default, false);
			    assert.equal(firstBetaNextAction.post_send_plan.safety.live_proof_claimed, false);
			    assert.equal(firstBetaNextAction.post_send_plan.safety.manual_record_requires_post, true);
			    assert.equal(firstBetaNextAction.safety.read_only_get, true);
			    assert.equal(firstBetaNextAction.safety.sends_external_email_on_get, false);
			    assert.equal(firstBetaNextAction.safety.marks_buyer_confirmation_complete_on_get, false);
			    assert.equal(firstBetaNextAction.safety.creates_beta_client_on_get, false);
			    assert.equal(firstBetaNextAction.safety.transmits_external_crm_on_get, false);
			    assert.equal(firstBetaNextAction.safety.paid_provider_lookup_by_default, false);
			    assert.equal(firstBetaNextAction.safety.live_proof_claimed, false);
			    assert.equal(firstBetaNextAction.safety.manual_record_requires_post, true);
			    const firstBetaNextActionMarkdown = await getProtectedText("/api/v1/launch/next-action?format=markdown");
			    assert.match(firstBetaNextActionMarkdown, /# Deal Threads First Beta Next Action/);
			    assert.match(firstBetaNextActionMarkdown, /Manual email draft: mailto:/);
			    assert.match(firstBetaNextActionMarkdown, /Manual sent POST: .*\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/close-workflow/);
			    assert.match(firstBetaNextActionMarkdown, /Post-Send Plan/);
			    assert.match(firstBetaNextActionMarkdown, /After Send Actions/);
			    assert.match(firstBetaNextActionMarkdown, /Watch room: .*\/launch\/confirmation-watch/);
			    assert.match(firstBetaNextActionMarkdown, /Reply parser: .*\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-reply/);
			    assert.match(firstBetaNextActionMarkdown, /Manual record requires POST: yes/);
			    const firstBetaNextActionPage = await getProtectedText("/launch/next-action");
			    assert.match(firstBetaNextActionPage, /First beta next action/);
				    assert.match(firstBetaNextActionPage, /The shortest path from the current buyer or install action to the next proof gate/);
			    assert.match(firstBetaNextActionPage, /GET is read-only: no email send, buyer-confirmation completion, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/);
			    assert.match(firstBetaNextActionPage, /Open manual email draft/);
			    assert.match(firstBetaNextActionPage, /Mark manual draft sent/);
			    assert.match(firstBetaNextActionPage, /Post-send plan/);
			    assert.match(firstBetaNextActionPage, /Watch confirmation/);
			    assert.match(firstBetaNextActionPage, /Parse buyer reply/);
			    assert.match(firstBetaNextActionPage, /After send/);
			    assert.match(firstBetaNextActionPage, /Acceptance criteria/);
			    assert.match(firstBetaNextActionPage, /Buyer-safe links/);
			    assert.match(firstBetaNextActionPage, /Proof focus/);

			    const confirmationCommand = await getProtectedJson("/api/v1/launch/confirmation-command");
			    assert.equal(confirmationCommand.type, "deal_threads.launch_confirmation_command_center.v1");
			    assert.equal(confirmationCommand.status, "buyer_confirmation_action_ready");
			    assert.equal(confirmationCommand.market_ready, false);
			    assert.equal(confirmationCommand.summary.active_lead_id, lead.id);
			    assert.equal(confirmationCommand.summary.active_company, "RegressionCo");
			    assert.equal(confirmationCommand.summary.active_mode, "buyer_confirmation");
			    assert.equal(confirmationCommand.summary.confirmation_complete, false);
			    assert.equal(confirmationCommand.summary.required_code_builds_before_first_beta, 0);
			    assert.equal(confirmationCommand.summary.paid_lookups_recommended_now, 0);
			    assert.equal(confirmationCommand.current_action.key, "send_or_record_buyer_follow_up");
			    assert.equal(confirmationCommand.current_action.primary_surface_label, "Manual email draft");
			    assert.equal(confirmationCommand.current_action.primary_surface_method, "MAILTO");
			    assert.equal(confirmationCommand.current_action.method, "MAILTO");
			    assert.equal(confirmationCommand.current_action.operator_post_method, "POST");
			    assert.equal(confirmationCommand.current_action.manual_record_method, "POST");
			    assert.match(confirmationCommand.copy_block.mailto_url, /^mailto:/);
			    assert.match(confirmationCommand.actions.send_follow_up.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-packet/send$`));
			    assert.match(confirmationCommand.actions.manual_sent.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-workflow$`));
			    assert.equal(confirmationCommand.actions.manual_sent.sends_from_server, false);
			    assert.equal(confirmationCommand.actions.manual_sent.mutates_state, true);
			    assert.match(confirmationCommand.actions.reply_preview.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/confirmation-reply-preview$`));
			    assert.match(confirmationCommand.actions.apply_confirmation.url, new RegExp(`/api/v1/activation/prospects/${lead.id}/close-workflow$`));
			    assert.match(confirmationCommand.actions.kickoff.url, new RegExp(`/api/v1/activation/prospects/${lead.id}/kickoff$`));
			    assert.equal(confirmationCommand.actions.kickoff.enabled, false);
			    assert.ok(confirmationCommand.confirmation_runway.some((step) => step.key === "parse_reply_if_needed" && step.status === "ready_when_reply_received"));
			    assert.ok(confirmationCommand.confirmation_runway.some((step) => step.key === "apply_confirmation" && step.status === "blocked_until_reviewed"));
			    assert.equal(confirmationCommand.providerless_enrichment.paid_firewall.allowed_by_default, false);
			    assert.equal(confirmationCommand.providerless_enrichment.paid_firewall.manual_approval_required, true);
			    assert.equal(confirmationCommand.providerless_enrichment.paid_firewall.recommended_paid_lookups_now, 0);
			    assert.equal(confirmationCommand.safety.read_only_get, true);
			    assert.equal(confirmationCommand.safety.sends_external_email_on_get, false);
			    assert.equal(confirmationCommand.safety.marks_manual_send_on_get, false);
			    assert.equal(confirmationCommand.safety.marks_buyer_confirmation_complete_on_get, false);
			    assert.equal(confirmationCommand.safety.creates_beta_client_on_get, false);
			    assert.equal(confirmationCommand.safety.transmits_external_crm_on_get, false);
			    assert.equal(confirmationCommand.safety.paid_provider_lookup_by_default, false);
			    assert.equal(confirmationCommand.safety.live_proof_claimed, false);
			    assert.equal(confirmationCommand.safety.confirmation_apply_requires_post, true);
			    assert.equal(confirmationCommand.safety.kickoff_requires_post, true);
			    const confirmationCommandMarkdown = await getProtectedText("/api/v1/launch/confirmation-command?format=markdown");
			    assert.match(confirmationCommandMarkdown, /# Deal Threads Launch Confirmation Command Center/);
			    assert.match(confirmationCommandMarkdown, /Primary surface label: Manual email draft/);
			    assert.match(confirmationCommandMarkdown, /Primary surface method: MAILTO/);
			    assert.match(confirmationCommandMarkdown, /Operator POST method: POST/);
			    assert.match(confirmationCommandMarkdown, /Manual record method: POST/);
			    assert.match(confirmationCommandMarkdown, /Manual email draft: mailto:/);
			    assert.match(confirmationCommandMarkdown, /Providerless Enrichment Firewall/);
			    assert.match(confirmationCommandMarkdown, /Paid lookup allowed by default: no/);
			    assert.match(confirmationCommandMarkdown, /Confirmation apply requires POST: yes/);
			    const confirmationCommandPage = await getProtectedText("/launch/confirmation-command");
			    assert.match(confirmationCommandPage, /Launch confirmation command center/);
			    assert.match(confirmationCommandPage, /One operator room for buyer follow-up, manual delivery records, reply parsing, confirmation capture, and beta kickoff/);
			    assert.match(confirmationCommandPage, /GET is read-only: no email sends, manual sent records, buyer-confirmation completion, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/);
			    assert.match(confirmationCommandPage, /Primary surface/);
			    assert.match(confirmationCommandPage, /Manual email draft/);
			    assert.match(confirmationCommandPage, /Primary method/);
			    assert.match(confirmationCommandPage, /MAILTO/);
			    assert.match(confirmationCommandPage, /Operator POST/);
			    assert.match(confirmationCommandPage, /Open manual email draft/);
			    assert.match(confirmationCommandPage, /Mark manual draft sent/);
			    assert.match(confirmationCommandPage, /Reply parser/);
			    assert.match(confirmationCommandPage, /Providerless enrichment firewall/);

			    const confirmationWatch = await getProtectedJson("/api/v1/launch/confirmation-watch");
			    assert.equal(confirmationWatch.type, "deal_threads.launch_confirmation_watchroom.v1");
			    assert.equal(confirmationWatch.status, "close_packet_ready");
			    assert.equal(confirmationWatch.market_ready, false);
			    assert.equal(confirmationWatch.summary.active_company, "RegressionCo");
			    assert.equal(confirmationWatch.summary.active_lead_id, lead.id);
			    assert.equal(confirmationWatch.summary.active_mode, "buyer_confirmation");
			    assert.equal(confirmationWatch.summary.total_threads, 1);
			    assert.equal(confirmationWatch.summary.due_now, 1);
			    assert.equal(confirmationWatch.summary.close_packets_ready, 1);
			    assert.equal(confirmationWatch.summary.paid_lookups_recommended_now, 0);
			    assert.equal(confirmationWatch.current_focus.status, "send_close_packet");
			    assert.equal(confirmationWatch.current_focus.primary_surface_label, "Manual email draft");
			    assert.equal(confirmationWatch.current_focus.primary_surface_method, "MAILTO");
			    assert.match(confirmationWatch.current_focus.primary_surface_url, /^mailto:/);
			    assert.equal(confirmationWatch.current_focus.operator_post_method, "POST");
			    assert.equal(confirmationWatch.current_focus.manual_record_method, "POST");
			    assert.match(confirmationWatch.current_focus.primary_link, new RegExp(`/launch/confirmation-command\\?lead=${lead.id}$`));
			    const confirmationWatchLeadItem = confirmationWatch.queue.find((item) => item.lead_id === lead.id);
			    assert.ok(confirmationWatchLeadItem);
			    assert.ok(confirmationWatchLeadItem.protected_links.command_center.includes(`/launch/confirmation-command?lead=${lead.id}`));
			    assert.equal(confirmationWatchLeadItem.packet.kind, "close_packet");
			    assert.equal(confirmationWatchLeadItem.primary_surface.label, "Manual email draft");
			    assert.equal(confirmationWatchLeadItem.primary_surface.method, "MAILTO");
			    assert.match(confirmationWatchLeadItem.primary_surface.url, /^mailto:/);
			    assert.equal(confirmationWatchLeadItem.primary_surface.operator_post_method, "POST");
			    assert.equal(confirmationWatchLeadItem.primary_surface.manual_record_method, "POST");
			    assert.equal(confirmationWatchLeadItem.action.method, "MAILTO");
			    assert.equal(confirmationWatchLeadItem.action.operator_post_method, "POST");
			    assert.equal(confirmationWatch.providerless_enrichment_posture.paid_lookup_allowed_by_default, false);
			    assert.equal(confirmationWatch.providerless_enrichment_posture.manual_approval_required, true);
			    assert.equal(confirmationWatch.safety.read_only_get, true);
			    assert.equal(confirmationWatch.safety.sends_external_email_on_get, false);
			    assert.equal(confirmationWatch.safety.marks_manual_send_on_get, false);
			    assert.equal(confirmationWatch.safety.marks_buyer_confirmation_complete_on_get, false);
			    assert.equal(confirmationWatch.safety.creates_beta_client_on_get, false);
			    assert.equal(confirmationWatch.safety.transmits_external_crm_on_get, false);
			    assert.equal(confirmationWatch.safety.paid_provider_lookup_by_default, false);
			    assert.equal(confirmationWatch.safety.live_proof_claimed, false);
			    assert.equal(confirmationWatch.safety.operator_posts_are_previews_only, true);
			    assert.equal(confirmationWatch.safety.manual_record_requires_post, true);
			    const confirmationWatchMarkdown = await getProtectedText("/api/v1/launch/confirmation-watch?format=markdown");
			    assert.match(confirmationWatchMarkdown, /# Deal Threads Launch Confirmation Watchroom/);
			    assert.match(confirmationWatchMarkdown, /Primary surface: Manual email draft/);
			    assert.match(confirmationWatchMarkdown, /Primary surface method: MAILTO/);
			    assert.match(confirmationWatchMarkdown, /Operator POST method: POST/);
			    assert.match(confirmationWatchMarkdown, /Read-only GET: yes/);
			    assert.match(confirmationWatchMarkdown, /Paid lookup default: no/);
			    assert.match(confirmationWatchMarkdown, /Manual record requires POST: yes/);
			    const confirmationWatchPage = await getProtectedText("/launch/confirmation-watch");
			    assert.match(confirmationWatchPage, /Launch confirmation watchroom/);
			    assert.match(confirmationWatchPage, /Buyer-confirmation SLA room/);
			    assert.match(confirmationWatchPage, /GET is read-only: no email sends, manual sent records, buyer-confirmation completion, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/);
			    assert.match(confirmationWatchPage, /Current focus/);
			    assert.match(confirmationWatchPage, /Manual email draft/);
			    assert.match(confirmationWatchPage, /Primary method/);
			    assert.match(confirmationWatchPage, /MAILTO/);
			    assert.match(confirmationWatchPage, /Operator POST/);
			    assert.match(confirmationWatchPage, /Confirmation queue/);
			    assert.match(confirmationWatchPage, /Providerless posture/);

			    const proofLedger = await getProtectedJson("/api/v1/launch/proof-ledger");
		    assert.equal(proofLedger.type, "deal_threads.launch_proof_ledger.v1");
		    assert.equal(proofLedger.market_ready, false);
		    assert.equal(proofLedger.summary.paid_lookups_recommended_now, 0);
		    assert.ok(proofLedger.summary.blocker >= 1);
		    assert.ok(proofLedger.entries.some((entry) => entry.key === "buyer_confirmation" && entry.status === "warning"));
		    assert.ok(proofLedger.entries.some((entry) => entry.key === "real_beta_client" && entry.status === "blocker"));
		    assert.ok(proofLedger.entries.some((entry) => entry.key === "client_domain_install" && /client config|target page/i.test(entry.proof_condition)));
		    assert.equal(proofLedger.safety.sends_external_email_on_get, false);
		    assert.equal(proofLedger.safety.marks_buyer_confirmation_complete_on_get, false);
		    assert.equal(proofLedger.safety.creates_beta_client_on_get, false);
		    assert.equal(proofLedger.safety.transmits_external_crm_on_get, false);
		    assert.equal(proofLedger.safety.paid_provider_lookup_by_default, false);
		    assert.equal(proofLedger.safety.live_proof_claimed, false);
		    const proofLedgerMarkdown = await getProtectedText("/api/v1/launch/proof-ledger?format=markdown");
		    assert.match(proofLedgerMarkdown, /# Deal Threads Launch Proof Ledger/);
		    assert.match(proofLedgerMarkdown, /Paid lookups recommended now: 0/);
		    assert.match(proofLedgerMarkdown, /GET marks buyer confirmation complete: no/);
		    const proofLedgerPage = await getProtectedText("/launch/proof-ledger");
		    assert.match(proofLedgerPage, /Launch proof ledger/);
		    assert.match(proofLedgerPage, /Evidence checklist for clearing buyer confirmation, install proof, first profile, CRM handoff, rep feedback, and live-proof gates/);
		    assert.match(proofLedgerPage, /No email send, buyer-confirmation completion, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/);
		    assert.match(proofLedgerPage, /Buyer confirmation/);
		    assert.match(proofLedgerPage, /Client-domain install proof/);

		    const proofHandoff = await getProtectedJson("/api/v1/launch/proof-handoff");
		    assert.equal(proofHandoff.type, "deal_threads.launch_proof_owner_handoff.v1");
		    assert.equal(proofHandoff.market_ready, false);
		    assert.ok(proofHandoff.summary.owner_groups >= 1);
		    assert.ok(proofHandoff.summary.blocker_items >= 1);
			    assert.equal(proofHandoff.summary.paid_lookups_recommended_now, 0);
			    assert.equal(proofHandoff.summary.mailto_drafts, proofHandoff.groups.length);
			    assert.equal(proofHandoff.summary.manual_sent_records, 0);
			    assert.ok(proofHandoff.groups.some((group) => /Buyer champion|RevOps|Deal Threads operator|implementation|CRM|Sales rep/i.test(group.owner)));
			    assert.ok(proofHandoff.groups.some((group) => /Proof ledger:/i.test(group.body)));
			    assert.ok(proofHandoff.groups.every((group) => group.mailto_url?.startsWith("mailto:")));
			    assert.ok(proofHandoff.groups.every((group) => group.manual_sent_action?.method === "POST"));
			    assert.ok(proofHandoff.groups.every((group) => group.manual_sent_action?.sends_from_server === false));
			    assert.equal(proofHandoff.safety.sends_external_email_on_get, false);
		    assert.equal(proofHandoff.safety.marks_buyer_confirmation_complete_on_get, false);
		    assert.equal(proofHandoff.safety.creates_beta_client_on_get, false);
		    assert.equal(proofHandoff.safety.transmits_external_crm_on_get, false);
		    assert.equal(proofHandoff.safety.paid_provider_lookup_by_default, false);
		    assert.equal(proofHandoff.safety.live_proof_claimed, false);
		    const proofHandoffMarkdown = await getProtectedText("/api/v1/launch/proof-handoff?format=markdown");
			    assert.match(proofHandoffMarkdown, /# Deal Threads Launch Proof Owner Handoff/);
			    assert.match(proofHandoffMarkdown, /Mailto draft: mailto:/);
			    assert.match(proofHandoffMarkdown, /Manual sent POST: .*\/api\/v1\/launch\/proof-handoff\/[a-z0-9_]+\/sent/);
			    assert.match(proofHandoffMarkdown, /Manual sent records: 0/);
			    assert.match(proofHandoffMarkdown, /Paid lookups recommended now: 0/);
		    assert.match(proofHandoffMarkdown, /GET marks buyer confirmation complete: no/);
		    const proofHandoffPage = await getProtectedText("/launch/proof-handoff");
			    assert.match(proofHandoffPage, /Launch proof owner handoff/);
			    assert.match(proofHandoffPage, /Copy-ready stakeholder asks generated from the proof ledger/);
			    assert.match(proofHandoffPage, /Open email draft/);
			    assert.match(proofHandoffPage, /Mark manual handoff sent/);
			    assert.match(proofHandoffPage, /No email send, buyer-confirmation completion, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs on GET/);

			    const proofHandoffSent = await postProtectedJson(`/api/v1/launch/proof-handoff/${proofHandoff.groups[0].key}/sent`, {
			      recipients: "owner@example.com",
			      note: "Sent manually during regression."
			    });
			    assert.equal(proofHandoffSent.type, "deal_threads.launch_proof_owner_handoff_sent.v1");
			    assert.equal(proofHandoffSent.marked_sent, true);
			    assert.equal(proofHandoffSent.manual_handoff.sends_from_server, false);
			    assert.equal(proofHandoffSent.delivery.recipients[0], "owner@example.com");
			    const proofHandoffAfterSent = await getProtectedJson("/api/v1/launch/proof-handoff");
			    assert.equal(proofHandoffAfterSent.summary.manual_sent_records, 1);
			    assert.equal(proofHandoffAfterSent.market_ready, false);

		    const activationRunbook = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/runbook`);
	    assert.equal(activationRunbook.type, "deal_threads.activation_prospect_runbook");
	    assert.equal(activationRunbook.status, "close_packet_ready");
	    assert.match(activationRunbook.current_operator_action, /Send the prospect close packet/);
	    assert.ok(activationRunbook.missing_confirmation_details.includes("Target page"));
	    assert.ok(activationRunbook.steps.some((step) => step.key === "send_close_packet" && step.status === "warning"));
	    assert.ok(activationRunbook.steps.some((step) => step.key === "kickoff_beta_install" && step.status === "blocker"));
	    assert.equal(activationRunbook.safety.mutates_buyer_state_on_get, false);
		    assert.equal(activationRunbook.safety.sends_external_email_on_get, false);
		    assert.equal(activationRunbook.providerless_enrichment_posture.paid_lookup_allowed_by_default, false);
			    assert.match(activationRunbook.public_links.proof_preview, /\/proof-preview$/);
			    assert.match(activationRunbook.protected_links.confirmation_workbench, new RegExp(`/activation/prospects/${lead.id}/confirmation-workbench$`));
			    assert.match(activationRunbook.protected_links.stakeholder_handoff, new RegExp(`/activation/prospects/${lead.id}/stakeholder-handoff$`));
			    assert.match(activationRunbook.protected_links.kickoff_install, new RegExp(`/api/v1/activation/prospects/${lead.id}/kickoff$`));

	    const activationRunbookMarkdown = await getProtectedText(`/api/v1/activation/prospects/${lead.id}/runbook?format=markdown`);
	    assert.match(activationRunbookMarkdown, /# Deal Threads Activation Runbook - RegressionCo/);
	    assert.match(activationRunbookMarkdown, /## Current Operator Action/);
		    assert.match(activationRunbookMarkdown, /## Step Checklist/);
		    assert.match(activationRunbookMarkdown, /Providerless Enrichment Posture/);

		    const confirmationWorkbench = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/confirmation-workbench`);
		    assert.equal(confirmationWorkbench.type, "deal_threads.activation_confirmation_workbench.v1");
		    assert.equal(confirmationWorkbench.status, "send_close_packet");
		    assert.equal(confirmationWorkbench.summary.confirmation_complete, false);
		    assert.equal(confirmationWorkbench.summary.close_packet_sent, false);
		    assert.equal(confirmationWorkbench.summary.missing_required_details > 0, true);
		    assert.equal(confirmationWorkbench.summary.kickoff_preflight_status, "blocked");
		    assert.equal(confirmationWorkbench.kickoff_preflight.ready, false);
		    assert.ok(confirmationWorkbench.kickoff_preflight.summary.blocker > 0);
		    assert.ok(confirmationWorkbench.kickoff_preflight.checks.some((check) => check.key === "buyer_confirmation" && check.status === "blocker"));
		    assert.ok(confirmationWorkbench.kickoff_preflight.market_gate_effect.some((item) => item.key === "client_domain_install"));
		    assert.equal(confirmationWorkbench.kickoff_preflight.default_kickoff_payload.crm, "hubspot");
		    assert.equal(confirmationWorkbench.safety.mutates_buyer_state_on_get, false);
		    assert.equal(confirmationWorkbench.safety.sends_external_email_on_get, false);
		    assert.equal(confirmationWorkbench.safety.creates_beta_client_on_get, false);
		    assert.equal(confirmationWorkbench.safety.transmits_external_crm_on_get, false);
		    assert.equal(confirmationWorkbench.safety.paid_provider_lookup_by_default, false);
		    assert.equal(confirmationWorkbench.safety.live_proof_claimed, false);
		    assert.match(confirmationWorkbench.public_links.buyer_confirmation, /\/confirm\/pcf_[a-f0-9]+$/);
		    assert.match(confirmationWorkbench.public_links.buyer_confirmation_status, /\/confirm\/pcf_[a-f0-9]+\/status$/);
		    assert.match(confirmationWorkbench.public_links.buyer_confirmation_request_kit, /\/confirm\/pcf_[a-f0-9]+\/request-kit$/);
			    assert.match(confirmationWorkbench.protected_links.markdown, new RegExp(`/api/v1/activation/prospects/${lead.id}/confirmation-workbench\\?format=markdown$`));
			    assert.match(confirmationWorkbench.protected_links.stakeholder_handoff, new RegExp(`/activation/prospects/${lead.id}/stakeholder-handoff$`));
			    assert.match(confirmationWorkbench.email_draft.body, /Request kit:/);
		    assert.ok(confirmationWorkbench.request_kit.stakeholder_asks.some((ask) => ask.key === "website_owner"));
		    const confirmationWorkbenchMarkdown = await getProtectedText(`/api/v1/activation/prospects/${lead.id}/confirmation-workbench?format=markdown`);
		    assert.match(confirmationWorkbenchMarkdown, /# Deal Threads Buyer Confirmation Workbench - RegressionCo/);
		    assert.match(confirmationWorkbenchMarkdown, /## Kickoff Preflight/);
		    assert.match(confirmationWorkbenchMarkdown, /Market Gate Effect/);
		    assert.match(confirmationWorkbenchMarkdown, /GET sends external email: no/);
		    assert.match(confirmationWorkbenchMarkdown, /Request kit:/);
		    const confirmationWorkbenchPage = await getProtectedText(`/activation/prospects/${lead.id}/confirmation-workbench`);
		    assert.match(confirmationWorkbenchPage, /Buyer confirmation workbench/);
		    assert.match(confirmationWorkbenchPage, /Kickoff preflight/);
		    assert.match(confirmationWorkbenchPage, /Kickoff checklist/);
			    assert.match(confirmationWorkbenchPage, /Market gate effect/);
			    assert.match(confirmationWorkbenchPage, /Manual confirmation capture/);
			    assert.match(confirmationWorkbenchPage, /Send confirmation nudge/);
			    assert.match(confirmationWorkbenchPage, /Reply preview/);
			    assert.match(confirmationWorkbenchPage, /Parse a pasted buyer reply/);
			    assert.match(confirmationWorkbenchPage, /Handoff pack/);
			    assert.match(confirmationWorkbenchPage, /GET is read-only: no email sends, buyer-state mutation, beta-client creation, CRM transmission, live-proof claim, or paid enrichment runs here/i);

			    const buyerReply = [
			      "Confirmed for the Deal Threads beta.",
			      "Target page: https://regressionco.test/demo",
			      "Website owner: Regression Web <web@regressionco.test>",
			      "CRM owner: crm@regressionco.test",
			      "Routing owner for inbound sales: ae@regressionco.test",
			      "Proof report recipients: crm@regressionco.test, revops@regressionco.test",
			      "Old form baseline: first touch 42 minutes, meeting rate 18%, opportunity rate 7%, win rate 21%, sales cycle 47 days."
			    ].join("\n");
			    const replyPreviewPage = await getProtectedText(`/activation/prospects/${lead.id}/confirmation-reply`);
			    assert.match(replyPreviewPage, /Confirmation reply preview/);
			    assert.match(replyPreviewPage, /Paste buyer reply/);
			    assert.match(replyPreviewPage, /Preview is read-only/);
			    const replyPreviewHtmlResponse = await postProtectedForm(`/activation/prospects/${lead.id}/confirmation-reply-preview`, {
			      replyText: buyerReply
			    });
			    assert.equal(replyPreviewHtmlResponse.status, 200);
			    const replyPreviewHtml = await replyPreviewHtmlResponse.text();
				    assert.match(replyPreviewHtml, /Ready to apply/i);
				    assert.match(replyPreviewHtml, /Apply suggested confirmation/);
				    assert.match(replyPreviewHtml, /Review checklist/);
				    assert.match(replyPreviewHtml, /Reply evidence receipt/);
				    assert.match(replyPreviewHtml, /replyEvidenceReceiptJson/);
				    assert.match(replyPreviewHtml, /I reviewed the suggested payload and field evidence/);
				    assert.match(replyPreviewHtml, /web@regressionco\.test/);
			    const confirmationReplyPreview = await postProtectedJson(`/api/v1/activation/prospects/${lead.id}/confirmation-reply-preview`, {
			      replyText: buyerReply
			    });
			    assert.equal(confirmationReplyPreview.type, "deal_threads.confirmation_reply_preview.v1");
			    assert.equal(confirmationReplyPreview.status, "ready_to_apply");
			    assert.equal(confirmationReplyPreview.summary.ready_for_confirmation, true);
			    assert.equal(confirmationReplyPreview.summary.missing_required_details, 0);
			    assert.equal(confirmationReplyPreview.summary.paid_lookups_recommended_now, 0);
			    assert.equal(confirmationReplyPreview.suggested_payload.action, "confirm");
			    assert.equal(confirmationReplyPreview.suggested_payload.targetPageUrl, "https://regressionco.test/demo");
			    assert.equal(confirmationReplyPreview.suggested_payload.implementationOwnerEmail, "web@regressionco.test");
			    assert.equal(confirmationReplyPreview.suggested_payload.crmOwnerEmail, "crm@regressionco.test");
			    assert.equal(confirmationReplyPreview.suggested_payload.routingOwnerEmail, "ae@regressionco.test");
			    assert.match(confirmationReplyPreview.suggested_payload.reportRecipients, /revops@regressionco\.test/);
			    assert.equal(confirmationReplyPreview.suggested_payload.baselineFirstTouchMinutes, "42");
			    assert.equal(confirmationReplyPreview.suggested_payload.baselineMeetingRate, "18");
			    assert.equal(confirmationReplyPreview.suggested_payload.baselineOpportunityRate, "7");
				    assert.equal(confirmationReplyPreview.suggested_payload.baselineWinRate, "21");
				    assert.equal(confirmationReplyPreview.suggested_payload.baselineSalesCycleDays, "47");
				    assert.equal(confirmationReplyPreview.review_summary.checklist_status, "ready");
				    assert.equal(confirmationReplyPreview.review_summary.requires_operator_acknowledgement, true);
				    assert.equal(confirmationReplyPreview.review_summary.requires_defaulted_field_acknowledgement, false);
				    assert.equal(confirmationReplyPreview.reply_evidence_receipt.type, "deal_threads.confirmation_reply_evidence_receipt.v1");
				    assert.equal(confirmationReplyPreview.reply_evidence_receipt.source, "confirmation_reply_preview");
				    assert.equal(confirmationReplyPreview.reply_evidence_receipt.reply.character_count, buyerReply.length);
				    assert.ok(confirmationReplyPreview.reply_evidence_receipt.field_evidence_keys.includes("targetPageUrl"));
				    assert.ok(confirmationReplyPreview.reply_evidence_receipt.applied_payload_keys.includes("targetPageUrl"));
				    assert.equal(confirmationReplyPreview.reply_evidence_receipt.safety.apply_requires_post, true);
				    assert.equal(confirmationReplyPreview.reply_evidence_receipt.safety.paid_provider_lookup, false);
				    assert.ok(confirmationReplyPreview.review_checklist.some((item) => item.key === "paid_lookup_guardrail" && item.status === "pass"));
				    assert.ok(confirmationReplyPreview.apply_action.required_form_fields.includes("operatorReviewComplete"));
				    assert.ok(confirmationReplyPreview.apply_action.required_form_fields.includes("replyEvidenceReceiptJson"));
				    assert.equal(confirmationReplyPreview.apply_action.defaulted_field_acknowledgement_required, false);
				    assert.equal(confirmationReplyPreview.field_evidence.targetPageUrl.source, "buyer_reply_domain_match");
			    assert.equal(confirmationReplyPreview.field_evidence.implementationOwnerEmail.source, "buyer_reply_label_match");
			    assert.match(confirmationReplyPreview.links.workbench, new RegExp(`/activation/prospects/${lead.id}/confirmation-workbench$`));
			    assert.match(confirmationReplyPreview.links.reply_preview, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
			    assert.equal(confirmationReplyPreview.safety.preview_mutates_state, false);
			    assert.equal(confirmationReplyPreview.safety.mutates_buyer_state_on_get, false);
			    assert.equal(confirmationReplyPreview.safety.sends_external_email_on_get, false);
			    assert.equal(confirmationReplyPreview.safety.creates_beta_client_on_get, false);
			    assert.equal(confirmationReplyPreview.safety.transmits_external_crm_on_get, false);
			    assert.equal(confirmationReplyPreview.safety.paid_provider_lookup_by_default, false);
			    assert.equal(confirmationReplyPreview.safety.live_proof_claimed, false);
			    assert.equal(confirmationReplyPreview.safety.apply_requires_post, true);
			    const confirmationReplyPreviewMarkdown = await getProtectedText(
			      `/api/v1/activation/prospects/${lead.id}/confirmation-reply-preview?format=markdown&replyText=${encodeURIComponent(buyerReply)}`
			    );
				    assert.match(confirmationReplyPreviewMarkdown, /# Deal Threads Confirmation Reply Preview - RegressionCo/);
				    assert.match(confirmationReplyPreviewMarkdown, /Ready for confirmation: yes/);
				    assert.match(confirmationReplyPreviewMarkdown, /## Review Checklist/);
				    assert.match(confirmationReplyPreviewMarkdown, /## Reply Evidence Receipt/);
				    assert.match(confirmationReplyPreviewMarkdown, /Receipt apply requires POST: yes/);
				    assert.match(confirmationReplyPreviewMarkdown, /Required form fields: confirmationSource, operatorReviewComplete, replyEvidenceReceiptJson/);
				    assert.match(confirmationReplyPreviewMarkdown, /Preview mutates state: no/);
				    assert.match(confirmationReplyPreviewMarkdown, /Apply requires POST: yes/);
				    assert.match(confirmationReplyPreviewMarkdown, /Apply requires operator acknowledgement: yes/);
			    const leadAfterReplyPreview = await getProtectedJson(`/api/v1/leads/${lead.id}`);
			    assert.notEqual(leadAfterReplyPreview.beta_client_conversion.prospect_close.status, "confirmed");
			    assert.equal(Boolean(leadAfterReplyPreview.beta_client_conversion.prospect_close.buyer_confirmed_at), false);
			    assert.equal(leadAfterReplyPreview.beta_client_conversion.beta_client_id || null, null);

			    const stakeholderHandoff = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/stakeholder-handoff`);
			    assert.equal(stakeholderHandoff.type, "deal_threads.activation_stakeholder_handoff_pack.v1");
			    assert.equal(stakeholderHandoff.status, "send_close_packet");
			    assert.equal(stakeholderHandoff.summary.confirmation_complete, false);
			    assert.equal(stakeholderHandoff.summary.missing_required_details > 0, true);
			    assert.equal(stakeholderHandoff.summary.stakeholder_asks_needed > 0, true);
			    assert.equal(stakeholderHandoff.summary.paid_lookups_recommended_now, 0);
			    assert.ok(stakeholderHandoff.stakeholder_asks.some((ask) => ask.key === "website_owner"));
			    assert.match(stakeholderHandoff.buyer_safe_links.confirmation_form, /\/confirm\/pcf_[a-f0-9]+$/);
			    assert.match(stakeholderHandoff.buyer_safe_links.status_room, /\/confirm\/pcf_[a-f0-9]+\/status$/);
			    assert.match(stakeholderHandoff.buyer_safe_links.request_kit, /\/confirm\/pcf_[a-f0-9]+\/request-kit$/);
			    assert.match(stakeholderHandoff.copy_blocks.champion_note.body, /Confirmation form:/);
			    assert.match(stakeholderHandoff.copy_blocks.champion_note.body, /Status room:/);
			    assert.match(stakeholderHandoff.copy_blocks.champion_note.body, /Request kit:/);
			    assert.match(stakeholderHandoff.copy_blocks.security_procurement_note.body, /No paid enrichment lookup or live CRM write is required/);
			    assert.ok(stakeholderHandoff.handoff_sequence.some((step) => step.key === "forward_stakeholder_asks"));
			    assert.equal(stakeholderHandoff.kickoff_preflight.ready, false);
			    assert.equal(stakeholderHandoff.safety.mutates_buyer_state_on_get, false);
			    assert.equal(stakeholderHandoff.safety.sends_external_email_on_get, false);
			    assert.equal(stakeholderHandoff.safety.creates_beta_client_on_get, false);
			    assert.equal(stakeholderHandoff.safety.transmits_external_crm_on_get, false);
			    assert.equal(stakeholderHandoff.safety.paid_provider_lookup_by_default, false);
			    assert.equal(stakeholderHandoff.safety.live_proof_claimed, false);
			    const stakeholderHandoffMarkdown = await getProtectedText(`/api/v1/activation/prospects/${lead.id}/stakeholder-handoff?format=markdown`);
			    assert.match(stakeholderHandoffMarkdown, /# Deal Threads Stakeholder Handoff Pack - RegressionCo/);
			    assert.match(stakeholderHandoffMarkdown, /## Buyer-Safe Copy Blocks/);
			    assert.match(stakeholderHandoffMarkdown, /GET sends external email: no/);
			    assert.match(stakeholderHandoffMarkdown, /Paid lookup by default: no/);
			    const stakeholderHandoffPage = await getProtectedText(`/activation/prospects/${lead.id}/stakeholder-handoff`);
			    assert.match(stakeholderHandoffPage, /Stakeholder handoff pack/);
			    assert.match(stakeholderHandoffPage, /Buyer-safe copy blocks/);
			    assert.match(stakeholderHandoffPage, /Champion note/);
			    assert.match(stakeholderHandoffPage, /Security \/ procurement note/);
			    assert.match(stakeholderHandoffPage, /GET is read-only: no email sends, buyer-state mutation, beta-client creation, CRM transmission, live-proof claim, or paid enrichment runs here/i);

			    const closePacket = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/close-packet`);
	    assert.equal(closePacket.status, "prospect_close_ready");
	    assert.equal(closePacket.lead_id, lead.id);
	    assert.match(closePacket.subject, /14-day Deal Threads beta pilot/);
	    assert.match(closePacket.email_body, /Security center/);
	    assert.match(closePacket.email_body, /Pilot close kit/);
	    assert.match(closePacket.email_body, /Approval room/);
	    assert.match(closePacket.email_body, /Mutual action plan/);
	    assert.match(closePacket.email_body, /Buyer confirmation guide/);
	    assert.match(closePacket.email_body, /Stakeholder forwarding kit/);
	    assert.match(closePacket.email_body, /Pilot agreement/);
	    assert.match(closePacket.email_body, /Buyer confirmation form/);
	    assert.match(closePacket.email_body, /providerless enrichment by default/i);
	    assert.match(closePacket.public_links.security_center, /\/security$/);
	    assert.match(closePacket.public_links.pilot_close_kit, /\/pilot-close-kit$/);
	    assert.match(closePacket.public_links.pilot_approval_room, /\/pilot-approval-room$/);
	    assert.match(closePacket.public_links.mutual_action_plan, /\/mutual-action-plan$/);
	    assert.match(closePacket.public_links.buyer_confirmation_guide, /\/buyer-confirmation-guide$/);
	    assert.match(closePacket.public_links.stakeholder_forwarding_kit, /\/stakeholder-forwarding-kit$/);
	    assert.match(closePacket.public_links.pilot_agreement, /\/pilot-agreement$/);
	    assert.match(closePacket.public_links.buyer_confirmation, /\/confirm\/pcf_[a-f0-9]+$/);
	    assert.match(closePacket.public_links.buyer_confirmation_status, /\/confirm\/pcf_[a-f0-9]+\/status$/);
	    assert.match(closePacket.public_links.buyer_confirmation_approval_brief, /\/confirm\/pcf_[a-f0-9]+\/brief$/);
	    assert.match(closePacket.public_links.buyer_confirmation_request_kit, /\/confirm\/pcf_[a-f0-9]+\/request-kit$/);
	    assert.match(closePacket.public_links.sample_profile, /\/sample-profile$/);
	    assert.ok(closePacket.confirmation_checklist.some((item) => item.includes("Target page")));
	    assert.ok(closePacket.operator_next_steps.some((item) => item.includes("Convert")));

	    const closePacketMarkdown = await getProtectedText(`/api/v1/activation/prospects/${lead.id}/close-packet?format=markdown`);
	    assert.match(closePacketMarkdown, /# 14-day Deal Threads beta pilot/);
	    assert.match(closePacketMarkdown, /## Buyer Confirmation Checklist/);
	    assert.match(closePacketMarkdown, /Security center:/);
	    assert.match(closePacketMarkdown, /Approval room:/);
	    assert.match(closePacketMarkdown, /Mutual action plan:/);
	    assert.match(closePacketMarkdown, /Buyer confirmation guide:/);
	    assert.match(closePacketMarkdown, /Stakeholder forwarding kit:/);
	    assert.match(closePacketMarkdown, /Pilot agreement:/);
	    assert.match(closePacketMarkdown, /Buyer confirmation form:/);
	    assert.match(closePacketMarkdown, /Buyer confirmation status:/);
	    assert.match(closePacketMarkdown, /Buyer confirmation approval brief:/);
	    assert.match(closePacketMarkdown, /Buyer confirmation request kit:/);

	    const confirmationNudge = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/confirmation-nudge`);
	    assert.equal(confirmationNudge.status, "buyer_confirmation_nudge_ready");
	    assert.equal(confirmationNudge.lead_id, lead.id);
	    assert.match(confirmationNudge.subject, /Confirm RegressionCo Deal Threads pilot details/);
	    assert.match(confirmationNudge.email_body, /buyer confirmation form/i);
	    assert.match(confirmationNudge.email_body, /Approval brief:/);
	    assert.match(confirmationNudge.email_body, /providerless enrichment/i);
	    assert.match(confirmationNudge.email_body, /Request kit:/);
	    assert.match(confirmationNudge.email_body, /Quick reply fallback:/);
	    assert.match(confirmationNudge.email_body, /Approval: these details are approved for the 14-day pilot kickoff/);
	    assert.equal(confirmationNudge.quick_reply_template.enabled, true);
	    assert.match(confirmationNudge.quick_reply_template.body, /Target page:/);
	    assert.match(confirmationNudge.quick_reply_template.body, /Implementation owner:/);
	    assert.match(confirmationNudge.quick_reply_template.body, /Proof recipients:/);
	    assert.match(confirmationNudge.quick_reply_template.protected_reply_preview_url, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
	    assert.equal(confirmationNudge.quick_reply_template.apply_requires_operator_post, true);
	    assert.equal(confirmationNudge.quick_reply_template.runs_paid_enrichment, false);
	    assert.match(confirmationNudge.email_body, /Buyer confirmation guide/);
	    assert.match(confirmationNudge.email_body, /Stakeholder forwarding kit/);
	    assert.match(confirmationNudge.email_body, /Implementation guide/);
	    assert.match(confirmationNudge.public_links.buyer_confirmation, /\/confirm\/pcf_[a-f0-9]+$/);
	    assert.match(confirmationNudge.public_links.buyer_confirmation_status, /\/confirm\/pcf_[a-f0-9]+\/status$/);
	    assert.match(confirmationNudge.public_links.buyer_confirmation_approval_brief, /\/confirm\/pcf_[a-f0-9]+\/brief$/);
	    assert.match(confirmationNudge.public_links.buyer_confirmation_request_kit, /\/confirm\/pcf_[a-f0-9]+\/request-kit$/);
	    assert.match(confirmationNudge.public_links.buyer_confirmation_guide, /\/buyer-confirmation-guide$/);
	    assert.match(confirmationNudge.public_links.stakeholder_forwarding_kit, /\/stakeholder-forwarding-kit$/);
	    assert.match(confirmationNudge.public_links.mutual_action_plan, /\/mutual-action-plan$/);
	    assert.match(confirmationNudge.public_links.implementation_guide, /\/implementation-guide$/);
	    assert.match(confirmationNudge.public_links.crm_handoff_guide, /\/crm-handoff-guide$/);
	    assert.ok(confirmationNudge.missing_confirmation_details.includes("Target page"));
	    assert.ok(confirmationNudge.operator_next_steps.some((item) => item.includes("close packet is sent")));

	    const confirmationNudgeMarkdown = await getProtectedText(`/api/v1/activation/prospects/${lead.id}/confirmation-nudge?format=markdown`);
	    assert.match(confirmationNudgeMarkdown, /# Confirm RegressionCo Deal Threads pilot details/);
	    assert.match(confirmationNudgeMarkdown, /## Confirmation Link/);
	    assert.match(confirmationNudgeMarkdown, /## Quick Reply Fallback/);
	    assert.match(confirmationNudgeMarkdown, /Protected reply preview:/);
	    assert.match(confirmationNudgeMarkdown, /## Public Support Links/);
	    assert.match(confirmationNudgeMarkdown, /Buyer confirmation approval brief:/);
	    assert.match(confirmationNudgeMarkdown, /Buyer confirmation request kit:/);

	    const publicConfirmationPath = new URL(closePacket.public_links.buyer_confirmation).pathname;
	    const publicConfirmationStatusPath = new URL(closePacket.public_links.buyer_confirmation_status).pathname;
	    const publicConfirmationApprovalBriefPath = new URL(closePacket.public_links.buyer_confirmation_approval_brief).pathname;
	    const publicConfirmationRequestKitPath = new URL(closePacket.public_links.buyer_confirmation_request_kit).pathname;
	    const publicConfirmationApprovalBrief = await fetch(`${BASE_URL}${publicConfirmationApprovalBriefPath}`);
	    assert.equal(publicConfirmationApprovalBrief.status, 200);
	    const publicConfirmationApprovalBriefHtml = await publicConfirmationApprovalBrief.text();
	    assert.match(publicConfirmationApprovalBriefHtml, /Buyer approval brief/);
	    assert.match(publicConfirmationApprovalBriefHtml, /Decision brief/);
	    assert.match(publicConfirmationApprovalBriefHtml, /Approval options/);
	    assert.match(publicConfirmationApprovalBriefHtml, /Copy-ready approval reply/);
	    assert.match(publicConfirmationApprovalBriefHtml, /After approval/);
	    assert.match(publicConfirmationApprovalBriefHtml, /Providerless enrichment stays on by default/);
	    assert.match(publicConfirmationApprovalBriefHtml, /This tokenized approval brief is read-only/);
	    assert.doesNotMatch(publicConfirmationApprovalBriefHtml, /\/crm\//);
	    assert.doesNotMatch(publicConfirmationApprovalBriefHtml, /\/admin/);
	    assert.doesNotMatch(publicConfirmationApprovalBriefHtml, /\/api\/v1/);
	    const publicConfirmationApprovalBriefJsonResponse = await fetch(`${BASE_URL}${publicConfirmationApprovalBriefPath}?format=json`);
	    assert.equal(publicConfirmationApprovalBriefJsonResponse.status, 200);
	    const publicConfirmationApprovalBriefJson = await publicConfirmationApprovalBriefJsonResponse.json();
	    assert.equal(publicConfirmationApprovalBriefJson.type, "deal_threads.public_buyer_confirmation_approval_brief.v1");
	    assert.equal(publicConfirmationApprovalBriefJson.summary.paid_lookups_recommended_now, 0);
	    assert.equal(publicConfirmationApprovalBriefJson.public_safety.read_only_get, true);
	    assert.equal(publicConfirmationApprovalBriefJson.public_safety.exposes_operator_forms, false);
	    assert.equal(publicConfirmationApprovalBriefJson.public_safety.exposes_crm_profiles, false);
	    assert.equal(publicConfirmationApprovalBriefJson.public_safety.mutates_buyer_state, false);
	    assert.equal(publicConfirmationApprovalBriefJson.public_safety.creates_beta_client, false);
	    assert.equal(publicConfirmationApprovalBriefJson.public_safety.sends_external_email, false);
	    assert.equal(publicConfirmationApprovalBriefJson.public_safety.transmits_external_data, false);
	    assert.equal(publicConfirmationApprovalBriefJson.public_safety.runs_paid_enrichment, false);
	    assert.equal(publicConfirmationApprovalBriefJson.public_safety.claims_live_results, false);
	    assert.ok(publicConfirmationApprovalBriefJson.approval_options.some((option) => option.key === "submit_form"));
	    assert.ok(publicConfirmationApprovalBriefJson.next_proof_steps.some((step) => step.key === "create_real_beta_client"));
	    assert.equal(JSON.stringify(publicConfirmationApprovalBriefJson).includes("/crm/"), false);
	    assert.equal(JSON.stringify(publicConfirmationApprovalBriefJson).includes("/api/v1/"), false);
	    const publicConfirmationApprovalBriefMarkdown = await fetch(`${BASE_URL}${publicConfirmationApprovalBriefPath}?format=markdown`);
	    assert.equal(publicConfirmationApprovalBriefMarkdown.status, 200);
	    const publicConfirmationApprovalBriefMarkdownText = await publicConfirmationApprovalBriefMarkdown.text();
	    assert.match(publicConfirmationApprovalBriefMarkdownText, /# Deal Threads Buyer Approval Brief/);
	    assert.match(publicConfirmationApprovalBriefMarkdownText, /## Approval Reply/);
	    assert.match(publicConfirmationApprovalBriefMarkdownText, /Runs paid enrichment: no/);
	    assert.match(publicConfirmationApprovalBriefMarkdownText, /Claims live proof: no/);
	    const publicConfirmationStatus = await fetch(`${BASE_URL}${publicConfirmationStatusPath}`);
	    assert.equal(publicConfirmationStatus.status, 200);
	    const publicConfirmationStatusHtml = await publicConfirmationStatus.text();
	    assert.match(publicConfirmationStatusHtml, /Buyer confirmation status/);
	    assert.match(publicConfirmationStatusHtml, /Current status/);
	    assert.match(publicConfirmationStatusHtml, /Buying committee brief/);
	    assert.match(publicConfirmationStatusHtml, /Forwardable summary/);
	    assert.match(publicConfirmationStatusHtml, /One-minute approval shortcut/);
	    assert.match(publicConfirmationStatusHtml, /Copy-ready approval reply/);
	    assert.match(publicConfirmationStatusHtml, /Approval: these details are approved for the 14-day pilot kickoff/);
	    assert.match(publicConfirmationStatusHtml, /This shortcut is read-only/);
	    assert.match(publicConfirmationStatusHtml, /Post-approval launch preview/);
	    assert.match(publicConfirmationStatusHtml, /Launch sequence after approval/);
	    assert.match(publicConfirmationStatusHtml, /Expected beta client/);
	    assert.match(publicConfirmationStatusHtml, /Capture client-domain install proof/);
	    assert.match(publicConfirmationStatusHtml, /This preview is read-only/);
	    assert.match(publicConfirmationStatusHtml, /Finish missing details/);
	    assert.match(publicConfirmationStatusHtml, /name="action" value="confirm"/);
	    assert.match(publicConfirmationStatusHtml, /name="targetPageUrl" type="url"/);
	    assert.match(publicConfirmationStatusHtml, /name="implementationOwnerEmail" type="email"/);
	    assert.match(publicConfirmationStatusHtml, /name="crmOwnerEmail" type="email"/);
	    assert.match(publicConfirmationStatusHtml, /name="routingOwnerEmail" type="email"/);
	    assert.match(publicConfirmationStatusHtml, /name="reportRecipients" type="text"/);
	    assert.match(publicConfirmationStatusHtml, /Finish buyer confirmation/);
	    assert.match(publicConfirmationStatusHtml, /Save progress without confirming/);
	    assert.match(publicConfirmationStatusHtml, /name="action" value="save_progress" formnovalidate/);
	    assert.match(publicConfirmationStatusHtml, /Saving progress stores any details entered so far only/);
	    assert.match(publicConfirmationStatusHtml, /may send a confirmation receipt/i);
	    assert.match(publicConfirmationStatusHtml, /Providerless enrichment stays on by default/);
	    assert.match(publicConfirmationStatusHtml, /Required details/);
	    assert.match(publicConfirmationStatusHtml, /Old-form baseline quick save/);
	    assert.match(publicConfirmationStatusHtml, /name="action" value="save_progress"/);
	    assert.match(publicConfirmationStatusHtml, /name="baselineFirstTouchMinutes" type="number"/);
	    assert.match(publicConfirmationStatusHtml, /name="baselineMeetingRate" type="number"/);
	    assert.match(publicConfirmationStatusHtml, /name="baselineOpportunityRate" type="number"/);
	    assert.match(publicConfirmationStatusHtml, /name="baselineWinRate" type="number"/);
	    assert.match(publicConfirmationStatusHtml, /name="baselineSalesCycleDays" type="number"/);
	    assert.match(publicConfirmationStatusHtml, /name="baselineNotes"/);
	    assert.match(publicConfirmationStatusHtml, /Save old-form baseline progress/);
	    assert.match(publicConfirmationStatusHtml, /Stores old-form baseline progress only/);
	    assert.match(publicConfirmationStatusHtml, /Loading it does not send email, create a beta client, mutate buyer state, transmit CRM data, run paid enrichment, or claim live proof/i);
	    assert.doesNotMatch(publicConfirmationStatusHtml, /\/crm\//);
	    assert.doesNotMatch(publicConfirmationStatusHtml, /\/admin/);
	    assert.doesNotMatch(publicConfirmationStatusHtml, /\/api\/v1/);
	    const publicConfirmationStatusJsonResponse = await fetch(`${BASE_URL}${publicConfirmationStatusPath}?format=json`);
	    assert.equal(publicConfirmationStatusJsonResponse.status, 200);
	    const publicConfirmationStatusJson = await publicConfirmationStatusJsonResponse.json();
	    assert.equal(publicConfirmationStatusJson.type, "deal_threads.public_buyer_confirmation_status.v1");
	    assert.equal(publicConfirmationStatusJson.status, "details_needed");
	    assert.equal(publicConfirmationStatusJson.summary.confirmation_complete, false);
	    assert.equal(publicConfirmationStatusJson.buying_committee_brief.decision_status, "buyer_input_needed");
	    assert.match(publicConfirmationStatusJson.buying_committee_brief.primary_cta.href, /\/confirm\/pcf_[a-f0-9]+$/);
	    assert.ok(publicConfirmationStatusJson.buying_committee_brief.owner_actions.some((item) => item.owner === "CRM / RevOps owner"));
	    assert.ok(publicConfirmationStatusJson.buying_committee_brief.risk_controls.some((item) => /paid lookups remain disabled/i.test(item)));
	    assert.match(publicConfirmationStatusJson.buying_committee_brief.forwardable_summary, /Risk controls: providerless enrichment by default/);
	    assert.equal(publicConfirmationStatusJson.one_minute_approval_shortcut.status, "available");
	    assert.match(publicConfirmationStatusJson.one_minute_approval_shortcut.body, /One-minute approval shortcut for RegressionCo/);
	    assert.match(publicConfirmationStatusJson.one_minute_approval_shortcut.body, /Approval: these details are approved for the 14-day pilot kickoff/);
	    assert.match(publicConfirmationStatusJson.one_minute_approval_shortcut.body, /Target page/);
	    assert.equal(publicConfirmationStatusJson.one_minute_approval_shortcut.safety.sends_external_email, false);
	    assert.equal(publicConfirmationStatusJson.one_minute_approval_shortcut.safety.creates_beta_client, false);
	    assert.equal(publicConfirmationStatusJson.one_minute_approval_shortcut.safety.transmits_crm_data, false);
	    assert.equal(publicConfirmationStatusJson.one_minute_approval_shortcut.safety.runs_paid_enrichment, false);
	    assert.equal(publicConfirmationStatusJson.one_minute_approval_shortcut.safety.claims_live_proof, false);
	    assert.equal(publicConfirmationStatusJson.one_minute_approval_shortcut.safety.exposes_operator_actions, false);
	    assert.equal(publicConfirmationStatusJson.post_approval_launch_preview.status, "waiting_for_buyer_confirmation");
	    assert.match(publicConfirmationStatusJson.post_approval_launch_preview.headline, /Approval unlocks the real beta-client install path/);
	    assert.equal(publicConfirmationStatusJson.post_approval_launch_preview.expected_beta_client.name, "RegressionCo Revenue Team");
	    assert.equal(publicConfirmationStatusJson.post_approval_launch_preview.expected_beta_client.paid_enrichment_lookups_needed_now, 0);
	    assert.ok(publicConfirmationStatusJson.post_approval_launch_preview.launch_sequence.some((item) => item.key === "capture_client_domain_install"));
	    assert.ok(publicConfirmationStatusJson.post_approval_launch_preview.launch_sequence.some((item) => item.key === "review_live_proof_gate"));
	    assert.equal(publicConfirmationStatusJson.post_approval_launch_preview.safety.creates_beta_client, false);
	    assert.equal(publicConfirmationStatusJson.post_approval_launch_preview.safety.sends_external_email, false);
	    assert.equal(publicConfirmationStatusJson.post_approval_launch_preview.safety.transmits_crm_data, false);
	    assert.equal(publicConfirmationStatusJson.post_approval_launch_preview.safety.runs_paid_enrichment, false);
	    assert.equal(publicConfirmationStatusJson.post_approval_launch_preview.safety.claims_live_proof, false);
	    assert.equal(publicConfirmationStatusJson.post_approval_launch_preview.safety.exposes_operator_actions, false);
	    assert.equal(publicConfirmationStatusJson.post_approval_launch_preview.safety.exposes_crm_profiles, false);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.action_value, "confirm");
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.submit_label, "Finish buyer confirmation");
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.progress_save_action.action_value, "save_progress");
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.progress_save_action.submit_label, "Save progress without confirming");
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.progress_save_action.safety.sends_external_email_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.progress_save_action.safety.creates_beta_client_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.progress_save_action.safety.transmits_crm_data_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.progress_save_action.safety.paid_provider_lookup_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.progress_save_action.safety.live_proof_claimed_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.available, true);
	    assert.deepEqual(
	      publicConfirmationStatusJson.finish_confirmation_form.fields.map((field) => field.name),
	      ["targetPageUrl", "implementationOwnerName", "implementationOwnerEmail", "crmOwnerEmail", "routingOwnerEmail", "reportRecipients"]
	    );
	    assert.ok(publicConfirmationStatusJson.finish_confirmation_form.clears_missing_details.includes("Target page"));
	    assert.ok(publicConfirmationStatusJson.finish_confirmation_form.clears_missing_details.includes("Implementation owner"));
	    assert.ok(publicConfirmationStatusJson.finish_confirmation_form.clears_missing_details.includes("Proof recipients"));
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.safety.mutates_buyer_state_on_submit, true);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.safety.may_send_external_email_on_submit, true);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.safety.may_create_beta_client_on_submit, true);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.safety.creates_beta_client_requires_auto_kickoff, true);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.safety.transmits_crm_data_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.safety.paid_provider_lookup_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.finish_confirmation_form.safety.live_proof_claimed_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.baseline_quick_save_form.action_value, "save_progress");
	    assert.equal(publicConfirmationStatusJson.baseline_quick_save_form.submit_label, "Save old-form baseline progress");
	    assert.equal(publicConfirmationStatusJson.baseline_quick_save_form.safety.creates_beta_client_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.baseline_quick_save_form.safety.sends_external_email_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.baseline_quick_save_form.safety.transmits_crm_data_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.baseline_quick_save_form.safety.paid_provider_lookup_on_submit, false);
	    assert.equal(publicConfirmationStatusJson.baseline_quick_save_form.safety.live_proof_claimed_on_submit, false);
	    assert.deepEqual(
	      publicConfirmationStatusJson.baseline_quick_save_form.fields.map((field) => field.name),
	      ["baselineFirstTouchMinutes", "baselineMeetingRate", "baselineOpportunityRate", "baselineWinRate", "baselineSalesCycleDays", "baselineNotes"]
	    );
	    assert.equal(publicConfirmationStatusJson.completion_payload.type, "deal_threads.public_buyer_confirmation_completion_payload.v1");
	    assert.equal(publicConfirmationStatusJson.completion_payload.status, "missing_details");
	    assert.equal(publicConfirmationStatusJson.completion_payload.summary.missing_required_details, 3);
	    assert.equal(publicConfirmationStatusJson.completion_payload.summary.saved_required_details, 2);
	    assert.equal(publicConfirmationStatusJson.completion_payload.summary.partial_save_available, true);
	    assert.equal(publicConfirmationStatusJson.completion_payload.summary.paid_lookups_recommended_now, 0);
	    assert.match(publicConfirmationStatusJson.completion_payload.completion_reply.body, /Target contact\/demo page URL:/);
	    assert.match(publicConfirmationStatusJson.completion_payload.completion_reply.body, /Safety: this completion step does not run paid enrichment/);
	    assert.equal(publicConfirmationStatusJson.completion_payload.safety.sends_external_email_on_get, false);
	    assert.equal(publicConfirmationStatusJson.completion_payload.safety.creates_beta_client_on_get, false);
	    assert.equal(publicConfirmationStatusJson.completion_payload.safety.runs_paid_enrichment_on_get, false);
	    assert.equal(publicConfirmationStatusJson.safety.mutates_buyer_state_on_get, false);
	    assert.equal(publicConfirmationStatusJson.safety.sends_external_email_on_get, false);
	    assert.equal(publicConfirmationStatusJson.safety.creates_beta_client_on_get, false);
	    assert.equal(publicConfirmationStatusJson.safety.exposes_crm_profiles, false);
	    assert.equal(publicConfirmationStatusJson.safety.exposes_operator_actions, false);
	    assert.equal(publicConfirmationStatusJson.safety.exposes_tenant_exports, false);
	    assert.equal(publicConfirmationStatusJson.safety.transmits_external_data_on_get, false);
	    assert.equal(publicConfirmationStatusJson.safety.paid_provider_lookup_by_default, false);
	    assert.equal(JSON.stringify(publicConfirmationStatusJson).includes("/crm/"), false);
	    assert.equal(JSON.stringify(publicConfirmationStatusJson).includes("/api/v1/"), false);
	    const publicConfirmationStatusMarkdown = await fetch(`${BASE_URL}${publicConfirmationStatusPath}?format=markdown`);
	    assert.equal(publicConfirmationStatusMarkdown.status, 200);
	    const publicConfirmationStatusMarkdownText = await publicConfirmationStatusMarkdown.text();
	    assert.match(publicConfirmationStatusMarkdownText, /# Deal Threads Buyer Confirmation Status - RegressionCo/);
	    assert.match(publicConfirmationStatusMarkdownText, /## Buying Committee Brief/);
	    assert.match(publicConfirmationStatusMarkdownText, /## One-Minute Approval Shortcut/);
	    assert.match(publicConfirmationStatusMarkdownText, /Approval: these details are approved for the 14-day pilot kickoff/);
	    assert.match(publicConfirmationStatusMarkdownText, /## Buyer Completion Payload/);
	    assert.match(publicConfirmationStatusMarkdownText, /Subject: Complete RegressionCo Deal Threads pilot handoff/);
	    assert.match(publicConfirmationStatusMarkdownText, /GET runs paid enrichment: no/);
	    assert.match(publicConfirmationStatusMarkdownText, /## Post-Approval Launch Preview/);
	    assert.match(publicConfirmationStatusMarkdownText, /### Launch Sequence/);
	    assert.match(publicConfirmationStatusMarkdownText, /Capture client-domain install proof/);
	    assert.match(publicConfirmationStatusMarkdownText, /Creates beta client: no/);
	    assert.match(publicConfirmationStatusMarkdownText, /## Finish Missing Details Form/);
	    assert.match(publicConfirmationStatusMarkdownText, /Action value: confirm/);
	    assert.match(publicConfirmationStatusMarkdownText, /Progress-save action value: save_progress/);
	    assert.match(publicConfirmationStatusMarkdownText, /Progress-save submit label: Save progress without confirming/);
	    assert.match(publicConfirmationStatusMarkdownText, /Field: targetPageUrl \(url\) - Target contact\/demo page \[required\]/);
	    assert.match(publicConfirmationStatusMarkdownText, /May send external email on submit: yes/);
	    assert.match(publicConfirmationStatusMarkdownText, /Transmits CRM data on submit: no/);
	    assert.match(publicConfirmationStatusMarkdownText, /Runs paid enrichment on submit: no/);
	    assert.match(publicConfirmationStatusMarkdownText, /Progress-save creates beta client: no/);
	    assert.match(publicConfirmationStatusMarkdownText, /## Old-Form Baseline Quick Save/);
	    assert.match(publicConfirmationStatusMarkdownText, /### Risk Controls/);
	    assert.match(publicConfirmationStatusMarkdownText, /GET mutates buyer state: no/);
	    assert.doesNotMatch(publicConfirmationStatusMarkdownText, /\/crm\//);
	    assert.doesNotMatch(publicConfirmationStatusMarkdownText, /\/api\/v1/);

	    const publicConfirmationRequestKit = await fetch(`${BASE_URL}${publicConfirmationRequestKitPath}`);
	    assert.equal(publicConfirmationRequestKit.status, 200);
	    const publicConfirmationRequestKitHtml = await publicConfirmationRequestKit.text();
	    assert.match(publicConfirmationRequestKitHtml, /Buyer confirmation request kit/);
	    assert.match(publicConfirmationRequestKitHtml, /Website \/ implementation owner/);
		    assert.match(publicConfirmationRequestKitHtml, /Forwardable copy/);
		    assert.match(publicConfirmationRequestKitHtml, /Champion reply template/);
		    assert.match(publicConfirmationRequestKitHtml, /Buyer completion payload/);
		    assert.match(publicConfirmationRequestKitHtml, /Copy-ready completion reply/);
		    assert.match(publicConfirmationRequestKitHtml, /Open email draft/);
		    assert.match(publicConfirmationRequestKitHtml, /Save this stakeholder update/);
		    assert.match(publicConfirmationRequestKitHtml, /name="action" value="save_progress"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="targetPageUrl" type="url"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="implementationOwnerEmail" type="email"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="crmOwnerEmail" type="email"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="routingOwnerEmail" type="email"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="reportRecipients" type="text"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="baselineFirstTouchMinutes" type="number"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="baselineMeetingRate" type="number"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="baselineOpportunityRate" type="number"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="baselineWinRate" type="number"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="baselineSalesCycleDays" type="number"/);
		    assert.match(publicConfirmationRequestKitHtml, /name="baselineNotes"/);
		    assert.match(publicConfirmationRequestKitHtml, /Save website \/ implementation update/);
		    assert.match(publicConfirmationRequestKitHtml, /Save CRM \/ RevOps update/);
		    assert.match(publicConfirmationRequestKitHtml, /Save routing update/);
		    assert.match(publicConfirmationRequestKitHtml, /Save proof-recipient update/);
		    assert.match(publicConfirmationRequestKitHtml, /stores partial buyer-confirmation progress only/i);
		    assert.match(publicConfirmationRequestKitHtml, /Loading it does not send email, create a beta client, mutate buyer state, transmit CRM data, run paid enrichment, expose protected CRM\/operator links, or claim live proof/i);
		    assert.doesNotMatch(publicConfirmationRequestKitHtml, /\/crm\//);
		    assert.doesNotMatch(publicConfirmationRequestKitHtml, /\/admin/);
		    assert.doesNotMatch(publicConfirmationRequestKitHtml, /\/api\/v1/);
	    const publicConfirmationRequestKitJsonResponse = await fetch(`${BASE_URL}${publicConfirmationRequestKitPath}?format=json`);
	    assert.equal(publicConfirmationRequestKitJsonResponse.status, 200);
	    const publicConfirmationRequestKitJson = await publicConfirmationRequestKitJsonResponse.json();
	    assert.equal(publicConfirmationRequestKitJson.type, "deal_threads.public_buyer_confirmation_request_kit.v1");
	    assert.equal(publicConfirmationRequestKitJson.status, "stakeholder_input_needed");
	    assert.equal(publicConfirmationRequestKitJson.summary.stakeholder_asks_needed > 0, true);
	    assert.ok(publicConfirmationRequestKitJson.stakeholder_asks.some((ask) => ask.key === "website_owner"));
	    assert.ok(publicConfirmationRequestKitJson.stakeholder_asks.some((ask) => ask.key === "crm_owner"));
	    assert.ok(publicConfirmationRequestKitJson.stakeholder_asks.some((ask) => ask.key === "routing_owner"));
		    assert.ok(publicConfirmationRequestKitJson.stakeholder_asks.some((ask) => ask.key === "proof_recipients"));
		    assert.ok(publicConfirmationRequestKitJson.stakeholder_asks.some((ask) => ask.body.includes(publicConfirmationPath)));
		    assert.match(publicConfirmationRequestKitJson.champion_reply_template, /Target contact\/demo page URL:/);
		    assert.equal(publicConfirmationRequestKitJson.completion_payload.type, "deal_threads.public_buyer_confirmation_completion_payload.v1");
		    assert.equal(publicConfirmationRequestKitJson.completion_payload.summary.stakeholder_asks_needed, publicConfirmationRequestKitJson.summary.stakeholder_asks_needed);
		    assert.equal(publicConfirmationRequestKitJson.completion_payload.summary.paid_lookups_recommended_now, 0);
		    assert.match(publicConfirmationRequestKitJson.completion_payload.completion_reply.body, /Proof report recipients:/);
		    assert.equal(publicConfirmationRequestKitJson.completion_payload.safety.exposes_operator_actions, false);
		    assert.ok(publicConfirmationRequestKitJson.stakeholder_asks.every((ask) => ask.mailto_url?.startsWith("mailto:")));
		    assert.ok(publicConfirmationRequestKitJson.stakeholder_asks.every((ask) => Array.isArray(ask.recipients)));
		    const websiteStakeholderAsk = publicConfirmationRequestKitJson.stakeholder_asks.find((ask) => ask.key === "website_owner");
		    assert.equal(websiteStakeholderAsk.partial_save_form.action_value, "save_progress");
		    assert.equal(websiteStakeholderAsk.partial_save_form.submit_label, "Save website / implementation update");
		    assert.ok(websiteStakeholderAsk.partial_save_form.fields.some((field) => field.name === "targetPageUrl" && field.type === "url"));
		    assert.equal(websiteStakeholderAsk.partial_save_form.safety.creates_beta_client_on_submit, false);
		    const proofStakeholderAsk = publicConfirmationRequestKitJson.stakeholder_asks.find((ask) => ask.key === "proof_recipients");
		    assert.deepEqual(
		      proofStakeholderAsk.partial_save_form.fields.map((field) => field.name),
		      [
		        "reportRecipients",
		        "baselineFirstTouchMinutes",
		        "baselineMeetingRate",
		        "baselineOpportunityRate",
		        "baselineWinRate",
		        "baselineSalesCycleDays",
		        "baselineNotes"
		      ]
		    );
		    assert.ok(proofStakeholderAsk.partial_save_form.fields.some((field) => field.name === "baselineNotes" && field.type === "textarea"));
		    assert.equal(publicConfirmationRequestKitJson.partial_save.action_value, "save_progress");
		    assert.equal(publicConfirmationRequestKitJson.partial_save.safety.sends_external_email_on_submit, false);
		    assert.equal(publicConfirmationRequestKitJson.partial_save.safety.transmits_crm_data_on_submit, false);
		    assert.equal(publicConfirmationRequestKitJson.partial_save.safety.paid_provider_lookup_on_submit, false);
		    assert.equal(publicConfirmationRequestKitJson.safety.mutates_buyer_state_on_get, false);
		    assert.equal(publicConfirmationRequestKitJson.safety.sends_external_email_on_get, false);
		    assert.equal(publicConfirmationRequestKitJson.safety.creates_beta_client_on_get, false);
	    assert.equal(publicConfirmationRequestKitJson.safety.exposes_crm_profiles, false);
	    assert.equal(publicConfirmationRequestKitJson.safety.exposes_operator_actions, false);
	    assert.equal(publicConfirmationRequestKitJson.safety.exposes_tenant_exports, false);
	    assert.equal(publicConfirmationRequestKitJson.safety.transmits_external_data_on_get, false);
	    assert.equal(publicConfirmationRequestKitJson.safety.paid_provider_lookup_by_default, false);
	    assert.equal(JSON.stringify(publicConfirmationRequestKitJson).includes("/crm/"), false);
	    assert.equal(JSON.stringify(publicConfirmationRequestKitJson).includes("/api/v1/"), false);
	    const publicConfirmationRequestKitMarkdown = await fetch(`${BASE_URL}${publicConfirmationRequestKitPath}?format=markdown`);
	    assert.equal(publicConfirmationRequestKitMarkdown.status, 200);
	    const publicConfirmationRequestKitMarkdownText = await publicConfirmationRequestKitMarkdown.text();
	    assert.match(publicConfirmationRequestKitMarkdownText, /# Deal Threads Buyer Confirmation Request Kit - RegressionCo/);
	    assert.match(publicConfirmationRequestKitMarkdownText, /## Champion Reply Template/);
	    assert.match(publicConfirmationRequestKitMarkdownText, /## Buyer Completion Payload/);
	    assert.match(publicConfirmationRequestKitMarkdownText, /Partial save available: yes/);
	    assert.match(publicConfirmationRequestKitMarkdownText, /## Stakeholder Asks/);
	    assert.match(publicConfirmationRequestKitMarkdownText, /Mailto draft: mailto:/);
	    assert.match(publicConfirmationRequestKitMarkdownText, /GET mutates buyer state: no/);
	    assert.doesNotMatch(publicConfirmationRequestKitMarkdownText, /\/crm\//);
	    assert.doesNotMatch(publicConfirmationRequestKitMarkdownText, /\/api\/v1/);

	    const publicConfirmationPage = await fetch(`${BASE_URL}${publicConfirmationPath}`);
	    assert.equal(publicConfirmationPage.status, 200);
	    const publicConfirmationHtml = await publicConfirmationPage.text();
	    assert.match(publicConfirmationHtml, /Deal Threads pilot confirmation/);
	    assert.match(publicConfirmationHtml, /Confirm pilot handoff details/);
	    assert.match(publicConfirmationHtml, /Completion checklist/);
	    assert.match(publicConfirmationHtml, /Required details/);
	    assert.match(publicConfirmationHtml, /3 missing/);
	    assert.match(publicConfirmationHtml, /Owner actions/);
	    assert.match(publicConfirmationHtml, /Open request kit/);
	    assert.match(publicConfirmationHtml, /Record pilot acceptance/);
	    assert.match(publicConfirmationHtml, /Target contact\/demo page \*/);
	    assert.match(publicConfirmationHtml, /name="targetPageUrl" type="url" required/);
	    assert.match(publicConfirmationHtml, /name="implementationOwnerEmail" type="email" required/);
	    assert.match(publicConfirmationHtml, /name="crmOwnerEmail" type="email" required/);
	    assert.match(publicConfirmationHtml, /name="routingOwnerEmail" type="email" required/);
	    assert.match(publicConfirmationHtml, /name="reportRecipients" required/);
	    assert.match(publicConfirmationHtml, /Save progress without confirming/);
	    assert.match(publicConfirmationHtml, /formnovalidate/);
	    assert.match(publicConfirmationHtml, /Saving progress updates this tokenized buyer workflow only/);
	    assert.match(publicConfirmationHtml, /Approval room/);
	    assert.match(publicConfirmationHtml, /Mutual action plan/);
	    assert.match(publicConfirmationHtml, /Buyer confirmation guide|Confirmation guide/);
	    assert.match(publicConfirmationHtml, /Stakeholder forwarding kit|Forwarding kit/);
	    assert.match(publicConfirmationHtml, /Paid enrichment/);
	    assert.doesNotMatch(publicConfirmationHtml, /\/crm\//);
	    assert.doesNotMatch(publicConfirmationHtml, /Operator config/);

	    const closePacketSend = await postProtectedJson(`/api/v1/activation/prospects/${lead.id}/close-packet/send`, {
	      recipients: "dana@regressionco.test"
	    });
	    assert.equal(closePacketSend.close_workflow.status, "sent");
	    assert.deepEqual(closePacketSend.close_workflow.sent_to, ["dana@regressionco.test"]);
	    assert.equal(closePacketSend.close_workflow.close_packet_delivery.status, "sent");
	    assert.equal(closePacketSend.close_workflow.close_packet_delivery.sent_via, "dry_run");
	    assert.equal(closePacketSend.close_workflow.close_packet_delivery.send_attempts.length, 1);
		    assert.equal(closePacketSend.close_workflow.close_packet_delivery.provider_message_id, `dry_run_prospect_close_packet_${lead.id}`);
		    assert.equal(closePacketSend.email_adapter.transmits_external_email, false);
		    assert.match(closePacketSend.packet.markdown, /## Email Draft/);

			    const activationOutboxAfterClosePacketSend = await getProtectedJson("/api/v1/activation/outbox");
			    assert.equal(activationOutboxAfterClosePacketSend.summary.confirmation_nudges_ready, 1);
			    assert.equal(activationOutboxAfterClosePacketSend.summary.manual_mailto_drafts, 1);
			    assert.equal(activationOutboxAfterClosePacketSend.summary.send_rooms_ready, 1);
			    assert.equal(activationOutboxAfterClosePacketSend.items[0].lead_id, lead.id);
			    assert.equal(activationOutboxAfterClosePacketSend.items[0].packet.kind, "confirmation_nudge");
				    assert.match(activationOutboxAfterClosePacketSend.items[0].manual_mailto_url, /^mailto:/);
				    assert.equal(activationOutboxAfterClosePacketSend.items[0].send_room.status, "manual_draft_ready");
				    assert.equal(activationOutboxAfterClosePacketSend.items[0].send_room.buyer_safe_links.approval_brief.includes("/brief"), true);
				    assert.equal(activationOutboxAfterClosePacketSend.items[0].send_room.post_send_plan.status, "ready_after_manual_send");
				    assert.match(activationOutboxAfterClosePacketSend.items[0].send_room.post_send_plan.watch_room, /\/launch\/confirmation-watch$/);
				    assert.match(activationOutboxAfterClosePacketSend.items[0].send_room.post_send_plan.reply_parser, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
				    assert.equal(activationOutboxAfterClosePacketSend.items[0].send_room.proof_effect.paid_enrichment_needed_now, 0);
			    assert.equal(activationOutboxAfterClosePacketSend.items[0].manual_sent_action.method, "POST");
			    assert.equal(activationOutboxAfterClosePacketSend.items[0].manual_sent_action.sends_from_server, false);
			    assert.equal(activationOutboxAfterClosePacketSend.items[0].manual_sent_action.mutates_state, true);
				    assert.match(activationOutboxAfterClosePacketSend.items[0].manual_sent_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/confirmation-nudge/sent$`));
				    assert.match(activationOutboxAfterClosePacketSend.items[0].manual_sent_action.html_action, new RegExp(`/activation/prospects/${lead.id}/mark-confirmation-nudge-sent$`));
				    assert.equal(activationOutboxAfterClosePacketSend.items[0].packet.quick_reply_template.enabled, true);
				    assert.match(activationOutboxAfterClosePacketSend.items[0].packet.quick_reply_template.body, /Quick reply fallback:/);
				    assert.match(activationOutboxAfterClosePacketSend.items[0].packet.quick_reply_template.protected_reply_preview_url, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
				    const firstBetaDrillAfterClosePacketSend = await getProtectedJson("/api/v1/launch/first-beta-drill");
				    assert.equal(firstBetaDrillAfterClosePacketSend.first_open_step.key, "send_confirmation_nudge");
				    assert.match(firstBetaDrillAfterClosePacketSend.first_open_step.label, /confirmation nudge/i);
				    assert.match(firstBetaDrillAfterClosePacketSend.first_open_step.next_action, /confirmation nudge|buyer/i);
				    assert.ok(firstBetaDrillAfterClosePacketSend.steps.some((step) => step.key === "send_confirmation_nudge"));
				    const firstBetaExecutionAfterClosePacketSend = await getProtectedJson("/api/v1/launch/first-beta-execution");
				    assert.equal(firstBetaExecutionAfterClosePacketSend.summary.first_open_step, "send_confirmation_nudge");
				    assert.match(firstBetaExecutionAfterClosePacketSend.summary.first_open_step_label, /confirmation nudge/i);
				    assert.match(firstBetaExecutionAfterClosePacketSend.summary.first_open_step_next_action, /confirmation nudge|buyer/i);
				    const firstBetaExecutionAfterClosePacketSendMarkdown = await getProtectedText("/api/v1/launch/first-beta-execution?format=markdown");
				    assert.match(firstBetaExecutionAfterClosePacketSendMarkdown, /First open step: send_confirmation_nudge/);
				    assert.match(firstBetaExecutionAfterClosePacketSendMarkdown, /First open step label: .*confirmation nudge/i);
				    const nextActionAfterClosePacketSend = await getProtectedJson("/api/v1/launch/next-action");
				    assert.equal(nextActionAfterClosePacketSend.current_follow_up.packet_kind, "confirmation_nudge");
				    assert.equal(nextActionAfterClosePacketSend.quick_reply_template.enabled, true);
				    assert.match(nextActionAfterClosePacketSend.quick_reply_template.body, /Quick reply fallback:/);
				    assert.match(nextActionAfterClosePacketSend.quick_reply_template.protected_reply_preview_url, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
				    assert.equal(nextActionAfterClosePacketSend.copy_block.quick_reply_template.apply_requires_operator_post, true);
				    const nextActionAfterClosePacketSendPage = await getProtectedText("/launch/next-action");
				    assert.match(nextActionAfterClosePacketSendPage, /Quick reply fallback/);
				    const confirmationCommandAfterClosePacketSend = await getProtectedJson("/api/v1/launch/confirmation-command");
				    assert.equal(confirmationCommandAfterClosePacketSend.current_follow_up.packet_kind, "confirmation_nudge");
				    assert.equal(confirmationCommandAfterClosePacketSend.current_action.primary_surface_label, "Manual email draft");
				    assert.equal(confirmationCommandAfterClosePacketSend.current_action.primary_surface_method, "MAILTO");
				    assert.equal(confirmationCommandAfterClosePacketSend.current_action.method, "MAILTO");
				    assert.equal(confirmationCommandAfterClosePacketSend.current_action.operator_post_method, "POST");
				    assert.equal(confirmationCommandAfterClosePacketSend.current_action.manual_record_method, "POST");
				    assert.equal(confirmationCommandAfterClosePacketSend.quick_reply_template.enabled, true);
				    assert.match(confirmationCommandAfterClosePacketSend.quick_reply_template.body, /Quick reply fallback:/);
				    assert.match(confirmationCommandAfterClosePacketSend.quick_reply_template.protected_reply_preview_url, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
				    const confirmationCommandAfterClosePacketSendMarkdown = await getProtectedText("/api/v1/launch/confirmation-command?format=markdown");
				    assert.match(confirmationCommandAfterClosePacketSendMarkdown, /Primary surface label: Manual email draft/);
				    assert.match(confirmationCommandAfterClosePacketSendMarkdown, /Primary surface method: MAILTO/);
				    assert.match(confirmationCommandAfterClosePacketSendMarkdown, /Operator POST method: POST/);
				    const confirmationCommandAfterClosePacketSendPage = await getProtectedText("/launch/confirmation-command");
				    assert.match(confirmationCommandAfterClosePacketSendPage, /Manual email draft/);
					    assert.match(confirmationCommandAfterClosePacketSendPage, /Primary method/);
					    assert.match(confirmationCommandAfterClosePacketSendPage, /MAILTO/);
					    assert.match(confirmationCommandAfterClosePacketSendPage, /Quick reply fallback/);
					    const marketLaunchAfterClosePacketSend = await getProtectedJson("/api/v1/launch/market-ready");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_stage, "buyer_confirmation_chase");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.packet_kind, "confirmation_nudge");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.packet_label, "Buyer confirmation nudge");
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.missing_confirmation_details.includes("Target page"));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.quick_reply_template.enabled, true);
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.quick_reply_template.body, /Quick reply fallback:/);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.post_send_plan.status, "ready_after_manual_send");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.post_send_plan.after_send_actions.length, 5);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.post_send_plan.acceptance_criteria.length, 4);
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.post_send_plan.watch_room, /\/launch\/confirmation-watch$/);
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.post_send_plan.reply_parser, new RegExp(`/activation/prospects/${lead.id}/confirmation-reply$`));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_context.missing_count, marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.missing_confirmation_details.length);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_context.quick_reply_available, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_context.paid_enrichment_needed_now, 0);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_payload.type, "deal_threads.market_buyer_confirmation_completion_payload.v1");
					    assert.equal(
					      marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_payload.summary.missing_required_details,
					      marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.missing_confirmation_details.length
					    );
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_payload.summary.partial_save_available, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_payload.summary.paid_lookups_recommended_now, 0);
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_payload.completion_reply.body, /Target contact\/demo page URL:/);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_payload.safety.sends_external_email_on_get, false);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_payload.safety.creates_beta_client_on_get, false);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.buyer_completion_payload.safety.runs_paid_enrichment_on_get, false);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.reply_apply_preflight.type, "deal_threads.market_buyer_reply_apply_preflight.v1");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.reply_apply_preflight.status, "waiting_for_buyer_reply");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.reply_apply_preflight.summary.paid_lookups_recommended_now, 0);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.reply_apply_preflight.summary.reply_evidence_receipt_saved, false);
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.reply_apply_preflight.required_apply_fields.includes("replyEvidenceReceiptJson"));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.reply_apply_preflight.checks.some((item) => item.key === "reply_parser_available" && item.status === "pass"));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.reply_apply_preflight.safety.apply_requires_post, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.stakeholder_chase_map.type, "deal_threads.market_buyer_confirmation_chase_map.v1");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.stakeholder_chase_map.status, "stakeholder_input_needed");
					    assert.equal(
					      marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.stakeholder_chase_map.summary.missing_required_details,
					      marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.missing_confirmation_details.length
					    );
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.stakeholder_chase_map.summary.stakeholder_asks_needed >= 1);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.stakeholder_chase_map.summary.paid_lookups_recommended_now, 0);
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.stakeholder_chase_map.blocking_details.some((item) => item.key === "target_page"));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.stakeholder_chase_map.stakeholder_asks.some((item) => item.key === "website_owner" && item.status === "needed"));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.stakeholder_chase_map.stakeholder_asks.some((item) => item.key === "proof_recipients" && item.status === "needed"));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.stakeholder_chase_map.operator_sequence.some((item) => /request kit/i.test(item)));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.stakeholder_chase_map.safety.sends_external_email_on_get, false);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_preflight.type, "deal_threads.market_action_dispatch_preflight.v1");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_preflight.send_ready, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_preflight.summary.blocker, 0);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_preflight.summary.paid_lookups_recommended_now, 0);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_preflight.external_send_mode, "manual_mailto");
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_preflight.checks.some((item) => item.key === "operator_send_post_ready" && item.status === "pass"));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_preflight.checks.some((item) => item.key === "manual_sent_recorder_ready" && item.status === "pass"));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_preflight.link_inventory.some((item) => item.key === "confirmation_form" && item.status === "pass"));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_preflight.operator_sequence.some((item) => /Record manual send/i.test(item)));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.type, "deal_threads.market_manual_dispatch_packet.v1");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.copy_ready, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.recipients.length, 2);
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.subject, /Confirm RegressionCo Deal Threads pilot details/);
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.body, /Quick follow-up on the Deal Threads 14-day pilot/);
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.mailto_url, /^mailto:/);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.recording.method, "POST");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.safety.manual_record_requires_actual_send_first, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.copy_safety_audit.type, "deal_threads.market_dispatch_copy_safety_audit.v1");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.copy_safety_audit.safe_to_forward, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.copy_safety_audit.summary.protected_link_leaks, 0);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.copy_safety_audit.summary.premature_claim_flags, 0);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.copy_safety_audit.summary.paid_lookups_recommended_now, 0);
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.copy_safety_audit.summary.body_links >= 5);
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.copy_safety_audit.checks.some((item) => item.key === "body_links_buyer_safe" && item.status === "pass"));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_dispatch_packet.copy_safety_audit.checks.some((item) => item.key === "no_premature_claims" && item.status === "pass"));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.type, "deal_threads.market_dispatch_commitment_checklist.v1");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.status, "ready_to_send_then_record");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.ready_to_send, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.ready_to_record_after_send, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.actual_send_recorded, false);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.summary.manual_record_ready, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.summary.paid_lookups_recommended_now, 0);
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.checks.some((item) => item.key === "actual_send_recorded" && item.status === "warning"));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.evidence_required.some((item) => item.key === "mailbox_sent_timestamp" && item.required));
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.next_operator_move, /record it only after the mailbox send is real/i);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.dispatch_commitment_checklist.safety.no_sent_record_without_mailbox_send, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.type, "deal_threads.market_manual_send_evidence_recorder.v1");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.status, "ready_after_mailbox_send");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.ready_to_record_after_mailbox_send, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.form.method, "POST");
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.form.html_action, new RegExp(`/activation/prospects/${lead.id}/mark-confirmation-nudge-sent$`));
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.form.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/confirmation-nudge/sent$`));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.form.sends_from_server, false);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.payload_preview.returnTo, "/launch/market-ready");
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.fields.some((item) => item.name === "mailboxSentAt" && item.required));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.fields.some((item) => item.name === "senderMailbox" && item.required));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.fields.some((item) => item.name === "recipients" && item.required));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.fields.some((item) => item.name === "subjectSnapshot" && item.required));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.fields.some((item) => item.name === "messageId" && !item.required));
					    assert.ok(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.fields.some((item) => item.name === "note" && item.required));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.safety.requires_actual_mailbox_send_first, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.safety.sends_from_server_on_post, false);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_send_evidence_recorder.safety.no_sent_record_without_mailbox_send, true);
					    assert.equal(marketLaunchAfterClosePacketSend.blocker_clearance_map.type, "deal_threads.market_blocker_clearance_map.v1");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.blocker_clearance_map.summary.blockers, marketLaunchAfterClosePacketSend.summary.blocker);
					    assert.equal(marketLaunchAfterClosePacketSend.blocker_clearance_map.summary.warnings, marketLaunchAfterClosePacketSend.summary.warning);
					    assert.equal(marketLaunchAfterClosePacketSend.blocker_clearance_map.current_focus.key, "buyer_confirmation");
					    assert.equal(marketLaunchAfterClosePacketSend.blocker_clearance_map.current_focus.current_action.key, marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.key);
					    assert.match(marketLaunchAfterClosePacketSend.blocker_clearance_map.current_focus.primary_surface_url, /^mailto:/);
					    assert.equal(marketLaunchAfterClosePacketSend.blocker_clearance_map.current_focus.operator_post_method, "POST");
					    assert.equal(marketLaunchAfterClosePacketSend.blocker_clearance_map.current_focus.paid_lookup_required, false);
					    assert.ok(marketLaunchAfterClosePacketSend.blocker_clearance_map.items.some((item) => item.key === "client_domain_install"));
					    assert.ok(marketLaunchAfterClosePacketSend.blocker_clearance_map.ordered_clearance_path.some((item) => /Buyer confirmation/i.test(item)));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.primary_surface_label, "Manual email draft");
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.primary_surface_method, "MAILTO");
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.primary_surface_url, /^mailto:/);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.operator_post_method, "POST");
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.operator_post_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/confirmation-nudge/send$`));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_record_method, "POST");
					    assert.match(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.manual_record_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/confirmation-nudge/sent$`));
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.safety.read_only_get, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.safety.sends_external_email_on_get, false);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.safety.manual_record_requires_post, true);
					    assert.equal(marketLaunchAfterClosePacketSend.launch_clearance_plan.action_bundle.operator_post_url, marketLaunchAfterClosePacketSend.launch_clearance_plan.current_action.operator_post_url);
					    const marketLaunchAfterClosePacketSendMarkdown = await getProtectedText("/api/v1/launch/market-ready?format=markdown");
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /### Current Clearance Action/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Current action: Buyer confirmation nudge/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Primary surface: Manual email draft/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Primary method: MAILTO/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Operator POST method: POST/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Manual record method: POST/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Missing confirmation details: .*Target page/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Post-send plan: Ready after manual send/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Dispatch preflight: ready to send/i);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Dispatch paid lookups recommended now: 0/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Manual dispatch packet: copy ready/i);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Manual dispatch record requires actual send first: yes/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Copy safety audit: safe to forward/i);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Copy protected link leaks: 0/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Buyer completion payload: missing details/i);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Buyer Completion Payload/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Subject: Complete RegressionCo Deal Threads pilot handoff/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Buyer reply apply preflight: waiting for buyer reply/i);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Buyer reply apply requires POST: yes/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Buyer Reply Apply Preflight/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Required apply field: replyEvidenceReceiptJson/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Dispatch commitment: ready to send then record/i);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Dispatch commitment ready to send: yes/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Dispatch actual send recorded: no/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Manual send evidence recorder: ready after mailbox send/i);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Manual send evidence ready after mailbox send: yes/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Manual send evidence form method: POST/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Manual send evidence sends from server: no/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Manual Send Evidence Recorder/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Field mailboxSentAt/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Field senderMailbox/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Field recipients/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Field subjectSnapshot/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Mailbox send evidence note/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Stakeholder chase map: stakeholder input needed/i);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Stakeholder asks needed:/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Stakeholder Chase Map/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Stakeholder Chase Asks/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Website \/ implementation owner/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Proof packet recipients/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Dispatch Commitment Checklist/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Dispatch Evidence Required/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Mailbox sent timestamp/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Copy Safety Audit/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Copy Link Audit/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### After Send Actions/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Acceptance Criteria/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Dispatch Preflight Checks/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Dispatch Operator Sequence/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Manual Dispatch Packet/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /#### Quick Reply Fallback/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /### Blocker Clearance Map/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Current focus: Buyer confirmation/);
					    assert.match(marketLaunchAfterClosePacketSendMarkdown, /Paid lookups recommended now: 0/);
					    const marketLaunchAfterClosePacketSendPage = await getProtectedText("/launch/market-ready");
					    assert.match(marketLaunchAfterClosePacketSendPage, /Current clearance action/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Manual email draft/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Operator POST/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Manual sent POST/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Missing details/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Buyer completion payload/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Buyer completion reply/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Buyer reply apply preflight/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Reply apply required fields/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Stakeholder chase map/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Stakeholder chase asks/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Stakeholder chase sequence/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Website \/ implementation owner/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Dispatch commitment checklist/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Dispatch evidence required/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Mailbox sent timestamp/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /After send/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Acceptance criteria/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Dispatch preflight/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Dispatch links/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Dispatch sequence/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Manual dispatch packet/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Record only after the email actually leaves the mailbox/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Copy safety audit/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Copy link audit/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Quick reply fallback/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /Blocker clearance map/);
					    assert.match(marketLaunchAfterClosePacketSendPage, /First hard blocker/);
					    const confirmationWatchAfterClosePacketSend = await getProtectedJson("/api/v1/launch/confirmation-watch");
					    assert.equal(confirmationWatchAfterClosePacketSend.status, "chase_due");
					    assert.equal(confirmationWatchAfterClosePacketSend.current_focus.status, "nudge_due");
					    assert.equal(confirmationWatchAfterClosePacketSend.current_focus.primary_surface_label, "Manual email draft");
					    assert.equal(confirmationWatchAfterClosePacketSend.current_focus.primary_surface_method, "MAILTO");
					    assert.match(confirmationWatchAfterClosePacketSend.current_focus.primary_surface_url, /^mailto:/);
					    assert.equal(confirmationWatchAfterClosePacketSend.current_focus.operator_post_method, "POST");
					    assert.equal(confirmationWatchAfterClosePacketSend.current_focus.manual_record_method, "POST");
					    const confirmationWatchNudgeItem = confirmationWatchAfterClosePacketSend.queue.find((item) => item.lead_id === lead.id);
					    assert.ok(confirmationWatchNudgeItem);
					    assert.equal(confirmationWatchNudgeItem.packet.kind, "confirmation_nudge");
					    assert.equal(confirmationWatchNudgeItem.primary_surface.label, "Manual email draft");
					    assert.equal(confirmationWatchNudgeItem.primary_surface.method, "MAILTO");
					    assert.match(confirmationWatchNudgeItem.primary_surface.url, /^mailto:/);
					    assert.equal(confirmationWatchNudgeItem.action.method, "MAILTO");
					    assert.equal(confirmationWatchNudgeItem.action.operator_post_method, "POST");
					    assert.equal(confirmationWatchNudgeItem.action.manual_record_method, "POST");
					    const confirmationWatchAfterClosePacketSendMarkdown = await getProtectedText("/api/v1/launch/confirmation-watch?format=markdown");
					    assert.match(confirmationWatchAfterClosePacketSendMarkdown, /Primary surface: Manual email draft/);
					    assert.match(confirmationWatchAfterClosePacketSendMarkdown, /Primary surface method: MAILTO/);
					    assert.match(confirmationWatchAfterClosePacketSendMarkdown, /Operator POST method: POST/);
					    const confirmationWatchAfterClosePacketSendPage = await getProtectedText("/launch/confirmation-watch");
					    assert.match(confirmationWatchAfterClosePacketSendPage, /Manual email draft/);
					    assert.match(confirmationWatchAfterClosePacketSendPage, /Primary method/);
					    assert.match(confirmationWatchAfterClosePacketSendPage, /MAILTO/);
					    assert.match(confirmationWatchAfterClosePacketSendPage, /Operator POST/);
					    const closeDeskAfterClosePacketSend = await getProtectedJson("/api/v1/activation/close-desk");
					    assert.equal(closeDeskAfterClosePacketSend.summary.confirmation_nudges_ready, 1);
				    assert.equal(closeDeskAfterClosePacketSend.summary.confirmation_chase_planned_sends, 1);
				    assert.equal(closeDeskAfterClosePacketSend.summary.confirmation_chase_mailto_drafts, 1);
				    assert.equal(closeDeskAfterClosePacketSend.summary.confirmation_chase_manual_recorders, 1);
				    assert.equal(closeDeskAfterClosePacketSend.confirmation_chase_campaign.type, "deal_threads.buyer_confirmation_chase_campaign.v1");
				    assert.equal(closeDeskAfterClosePacketSend.confirmation_chase_campaign.status, "confirmation_chase_ready");
				    assert.equal(closeDeskAfterClosePacketSend.confirmation_chase_campaign.batch_items[0].lead_id, lead.id);
				    assert.match(closeDeskAfterClosePacketSend.confirmation_chase_campaign.batch_items[0].mailto_url, /^mailto:/);
				    assert.match(closeDeskAfterClosePacketSend.confirmation_chase_campaign.batch_items[0].manual_sent_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/confirmation-nudge/sent$`));
				    assert.equal(closeDeskAfterClosePacketSend.confirmation_chase_campaign.safety.manual_record_requires_post, true);
				    const closeDeskNudgePage = await getProtectedText("/activation/close-desk?packet=confirmation_nudge");
				    assert.match(closeDeskNudgePage, /Buyer confirmation chase campaign/);
				    assert.match(closeDeskNudgePage, /Open nudge draft/);
				    assert.match(closeDeskNudgePage, /Reply preview/);
				    const activationOutboxNudgePage = await getProtectedText("/activation/outbox?kind=confirmation_nudge");
			    assert.match(activationOutboxNudgePage, /Mark manual nudge sent/);

		    const confirmationNudgeSend = await postProtectedJson(`/api/v1/activation/prospects/${lead.id}/confirmation-nudge/send`, {
		      recipients: "dana@regressionco.test"
	    });
	    assert.equal(confirmationNudgeSend.close_workflow.status, "sent");
	    assert.equal(confirmationNudgeSend.close_workflow.confirmation_nudge_delivery.status, "sent");
	    assert.equal(confirmationNudgeSend.close_workflow.confirmation_nudge_delivery.channel, "buyer_confirmation_nudge_email");
	    assert.equal(confirmationNudgeSend.close_workflow.confirmation_nudge_delivery.sent_via, "dry_run");
	    assert.equal(confirmationNudgeSend.close_workflow.confirmation_nudge_delivery.send_attempts.length, 1);
	    assert.equal(confirmationNudgeSend.close_workflow.confirmation_nudge_delivery.provider_message_id, `dry_run_buyer_confirmation_nudge_${lead.id}`);
	    assert.equal(confirmationNudgeSend.email_adapter.transmits_external_email, false);
	    assert.match(confirmationNudgeSend.packet.markdown, /## Confirmation Link/);

		    const activationPageAfterNudge = await getProtectedText("/activation");
		    assert.match(activationPageAfterNudge, /Confirmation nudge packet/);
		    assert.match(activationPageAfterNudge, /Sent via dry_run to dana@regressionco\.test/);

		    const followUpsAfterNudge = await getProtectedJson("/api/v1/activation/follow-ups");
		    const nudgeQueueItem = followUpsAfterNudge.queue.find((item) => item.lead_id === lead.id);
		    assert.ok(nudgeQueueItem);
		    assert.equal(nudgeQueueItem.status, "waiting_on_buyer");
		    assert.equal(nudgeQueueItem.confirmation_nudge_sent, true);
			    assert.equal(nudgeQueueItem.deliveries.confirmation_nudge.status, "sent");
			    assert.match(nudgeQueueItem.next_action, /Wait for buyer confirmation|capture approved details/i);

			    const manualNudgeSent = await postProtectedJson(`/api/v1/activation/prospects/${lead.id}/confirmation-nudge/sent`, {
			      recipients: "dana@regressionco.test",
			      mailboxSentAt: "2026-06-03T16:40:00.000Z",
			      senderMailbox: "operator@regressionco.test",
			      subjectSnapshot: "Confirm RegressionCo Deal Threads pilot details",
			      messageId: "mail-regression-001",
			      note: "Sent manually from regression."
			    });
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.status, "sent");
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.channel, "buyer_confirmation_nudge_email");
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.sent_via, "manual");
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.provider_message_id, `dry_run_buyer_confirmation_nudge_${lead.id}`);
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.manual_evidence.mailbox_sent_at, "2026-06-03T16:40:00.000Z");
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.manual_evidence.sender_mailbox, "operator@regressionco.test");
			    assert.deepEqual(manualNudgeSent.close_workflow.confirmation_nudge_delivery.manual_evidence.recipient_snapshot, ["dana@regressionco.test"]);
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.manual_evidence.subject_snapshot, "Confirm RegressionCo Deal Threads pilot details");
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.manual_evidence.message_id, "mail-regression-001");
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.manual_evidence.note, "Sent manually from regression.");
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.send_attempts.length, 2);
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.send_attempts[1].mode, "manual");
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.send_attempts[1].provider, "manual");
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.send_attempts[1].dry_run, false);
			    assert.equal(manualNudgeSent.close_workflow.confirmation_nudge_delivery.send_attempts[1].manual_evidence.message_id, "mail-regression-001");
			    assert.equal(manualNudgeSent.email_adapter.transmits_external_email, false);
			    assert.equal(manualNudgeSent.manual_handoff.sends_from_server, false);
			    assert.equal(manualNudgeSent.manual_handoff.marked_sent, true);
			    assert.equal(manualNudgeSent.manual_handoff.manual_evidence.sender_mailbox, "operator@regressionco.test");

			    const closePacketSendForm = await postProtectedForm(`/activation/prospects/${lead.id}/send-close-packet`, {
	      returnTo: "/activation",
	      recipients: "dana@regressionco.test"
	    });
	    assert.equal(closePacketSendForm.status, 303);
	    assert.equal(closePacketSendForm.headers.get("location"), `/activation?prospect=${lead.id}&closePacketSent=1`);

		    const confirmationNudgeSendForm = await postProtectedForm(`/activation/prospects/${lead.id}/send-confirmation-nudge`, {
		      returnTo: "/activation",
		      recipients: "dana@regressionco.test"
		    });
		    assert.equal(confirmationNudgeSendForm.status, 303);
		    assert.equal(confirmationNudgeSendForm.headers.get("location"), `/activation?prospect=${lead.id}&confirmationNudgeSent=1`);

		    const manualNudgeSentForm = await postProtectedForm(`/activation/prospects/${lead.id}/mark-confirmation-nudge-sent`, {
		      returnTo: "/activation/outbox",
		      recipients: "dana@regressionco.test",
		      note: "Sent manually from regression form."
		    });
		    assert.equal(manualNudgeSentForm.status, 303);
		    assert.equal(manualNudgeSentForm.headers.get("location"), `/activation/outbox?prospect=${lead.id}&confirmationNudgeMarkedSent=1`);

	    const closeSentResponse = await postProtectedForm(`/activation/prospects/${lead.id}/close-workflow`, {
	      returnTo: "/activation",
	      action: "mark_sent",
	      sentTo: "dana@regressionco.test, crm@regressionco.test"
	    });
	    assert.equal(closeSentResponse.status, 303);
	    assert.equal(closeSentResponse.headers.get("location"), `/activation?prospect=${lead.id}&closeWorkflow=sent`);

	    const progressSave = await postForm(publicConfirmationPath, {
	      action: "save_progress",
	      targetPageUrl: "https://regressionco.test/demo",
	      crmOwnerEmail: "crm@regressionco.test",
	      baselineFirstTouchMinutes: "42",
	      baselineMeetingRate: "18",
	      baselineOpportunityRate: "7",
	      baselineWinRate: "21",
	      baselineSalesCycleDays: "47",
	      baselineNotes: "HubSpot old-form report"
	    });
	    assert.equal(progressSave.status, 303);
	    assert.equal(progressSave.headers.get("location"), `${publicConfirmationStatusPath}?saved=1`);
	    const progressStatusResponse = await fetch(`${BASE_URL}${publicConfirmationStatusPath}?format=json`);
	    assert.equal(progressStatusResponse.status, 200);
	    const progressStatus = await progressStatusResponse.json();
	    assert.equal(progressStatus.summary.confirmation_complete, false);
	    assert.equal(progressStatus.summary.close_workflow_status, "collecting_details");
	    assert.equal(progressStatus.summary.receipt_sent, false);
	    assert.equal(progressStatus.summary.install_handoff_ready, false);
	    assert.equal(progressStatus.summary.baseline_captured, true);
	    assert.equal(progressStatus.required_details.find((detail) => detail.key === "target_page").status, "pass");
	    assert.equal(progressStatus.required_details.find((detail) => detail.key === "crm_owner").status, "pass");
	    assert.match(progressStatus.optional_details.find((detail) => detail.key === "baseline").value, /42 first-touch minutes/);
	    assert.match(progressStatus.optional_details.find((detail) => detail.key === "baseline").value, /0\.18 meeting rate/);
	    assert.match(progressStatus.optional_details.find((detail) => detail.key === "baseline").value, /HubSpot old-form report/);
	    assert.equal(progressStatus.missing_details.includes("Implementation owner email"), true);
	    assert.equal(progressStatus.saved_progress.status, "missing_details");
	    assert.equal(progressStatus.saved_progress.saved_required_details.some((detail) => detail.label === "Target page"), true);
	    assert.equal(progressStatus.saved_progress.missing_required_details.some((detail) => detail.label === "Implementation owner"), true);
	    assert.equal(progressStatus.saved_progress.optional_saved_details.some((detail) => /HubSpot old-form report/.test(detail.value)), true);
	    assert.match(progressStatus.saved_progress.finish_confirmation_reply, /Finish RegressionCo Deal Threads pilot confirmation/);
	    assert.match(progressStatus.saved_progress.mailto_url, /^mailto:/);
	    assert.match(progressStatus.saved_progress.mailto_url, /subject=Finish\+RegressionCo\+Deal\+Threads\+pilot\+confirmation/);
	    assert.equal(progressStatus.saved_progress.safety.creates_beta_client, false);
	    const progressMarkdownResponse = await fetch(`${BASE_URL}${publicConfirmationStatusPath}?format=markdown`);
	    assert.equal(progressMarkdownResponse.status, 200);
	    const progressMarkdown = await progressMarkdownResponse.text();
	    assert.match(progressMarkdown, /## Saved Progress Plan/);
	    assert.match(progressMarkdown, /Close workflow status: collecting_details/);
	    assert.match(progressMarkdown, /Mailto draft: mailto:/);
		    assert.match(progressMarkdown, /Copy-ready finish reply/);
		    const requestKitAfterProgressSave = await fetch(`${BASE_URL}${publicConfirmationRequestKitPath}`);
		    assert.equal(requestKitAfterProgressSave.status, 200);
		    const requestKitAfterProgressSaveHtml = await requestKitAfterProgressSave.text();
		    assert.match(requestKitAfterProgressSaveHtml, /value="https:\/\/regressionco\.test\/demo"/);
		    assert.match(requestKitAfterProgressSaveHtml, /value="crm@regressionco\.test"/);
		    assert.match(requestKitAfterProgressSaveHtml, /value="42"/);
		    assert.match(requestKitAfterProgressSaveHtml, /value="0.18"/);
		    assert.match(requestKitAfterProgressSaveHtml, /HubSpot old-form report/);
		    assert.match(requestKitAfterProgressSaveHtml, /Save website \/ implementation update/);
		    const progressReceiptPage = await fetch(`${BASE_URL}${publicConfirmationStatusPath}?saved=1`);
		    assert.equal(progressReceiptPage.status, 200);
	    const progressReceiptHtml = await progressReceiptPage.text();
	    assert.match(progressReceiptHtml, /Confirmation progress saved/);
	    assert.match(progressReceiptHtml, /Saved progress plan/);
	    assert.match(progressReceiptHtml, /Still blocking kickoff/);
	    assert.match(progressReceiptHtml, /Copy-ready finish reply/);
	    assert.match(progressReceiptHtml, /Finish confirmation form/);
	    assert.match(progressReceiptHtml, /Open finish draft/);
	    assert.doesNotMatch(progressReceiptHtml, /\/crm\//);
	    const leadAfterProgressSave = await getProtectedJson(`/api/v1/leads/${lead.id}`);
	    assert.equal(leadAfterProgressSave.beta_client_conversion.prospect_close.status, "collecting_details");
	    assert.equal(Boolean(leadAfterProgressSave.beta_client_conversion.prospect_close.buyer_confirmed_at), false);
	    assert.equal(leadAfterProgressSave.beta_client_conversion.beta_client_id || null, null);
	    assert.equal(leadAfterProgressSave.beta_client_conversion.prospect_close.baseline.first_touch_minutes, 42);
	    assert.equal(leadAfterProgressSave.beta_client_conversion.prospect_close.baseline.meeting_rate, 0.18);
	    assert.equal(leadAfterProgressSave.beta_client_conversion.prospect_close.baseline.opportunity_rate, 0.07);
	    assert.equal(leadAfterProgressSave.beta_client_conversion.prospect_close.baseline.win_rate, 0.21);
	    assert.equal(leadAfterProgressSave.beta_client_conversion.prospect_close.baseline.sales_cycle_days, 47);
	    assert.equal(leadAfterProgressSave.beta_client_conversion.prospect_close.baseline.notes, "HubSpot old-form report");

	    const wrongConfirmation = await postForm(publicConfirmationPath, {
	      targetPageUrl: "https://wrongco.test/demo",
	      implementationOwnerEmail: "web@regressionco.test",
	      crmOwnerEmail: "crm@regressionco.test",
	      routingOwnerEmail: "ae@regressionco.test",
	      reportRecipients: "crm@regressionco.test, revops@regressionco.test"
	    });
	    assert.equal(wrongConfirmation.status, 400);
	    assert.match(await wrongConfirmation.text(), /Use a page on regressionco\.test/);

	    const publicConfirmation = await postForm(publicConfirmationPath, {
	      targetPageUrl: "https://regressionco.test/demo",
	      implementationOwnerName: "Regression Web",
	      implementationOwnerEmail: "web@regressionco.test",
	      crmOwnerEmail: "crm@regressionco.test",
	      routingOwnerEmail: "ae@regressionco.test",
	      reportRecipients: "crm@regressionco.test, revops@regressionco.test",
	      baselineFirstTouchMinutes: "42",
	      baselineMeetingRate: "0.18",
	      baselineOpportunityRate: "0.07",
	      baselineWinRate: "0.21",
	      baselineSalesCycleDays: "47",
	      baselineNotes: "Public buyer confirmation."
	    });
	    assert.equal(publicConfirmation.status, 303);
	    assert.equal(publicConfirmation.headers.get("location"), `${publicConfirmationPath}?submitted=1`);
	    const publicConfirmationStatusAfter = await fetch(`${BASE_URL}${publicConfirmationStatusPath}?format=json`);
	    assert.equal(publicConfirmationStatusAfter.status, 200);
	    const publicConfirmationStatusAfterJson = await publicConfirmationStatusAfter.json();
	    assert.equal(publicConfirmationStatusAfterJson.status, "confirmed_waiting_install_handoff");
	    assert.equal(publicConfirmationStatusAfterJson.summary.confirmation_complete, true);
	    assert.equal(publicConfirmationStatusAfterJson.summary.receipt_sent, true);
	    assert.equal(publicConfirmationStatusAfterJson.summary.install_handoff_ready, false);
	    const leadAfterPublicConfirmation = await getProtectedJson(`/api/v1/leads/${lead.id}`);
	    assert.equal(leadAfterPublicConfirmation.beta_client_conversion.prospect_close.status, "confirmed");
	    assert.equal(leadAfterPublicConfirmation.beta_client_conversion.prospect_close.buyer_confirmed_by, "buyer_confirmation:web@regressionco.test");
	    assert.equal(leadAfterPublicConfirmation.beta_client_conversion.prospect_close.buyer_confirmation_delivery.status, "sent");
	    assert.equal(leadAfterPublicConfirmation.beta_client_conversion.prospect_close.buyer_confirmation_delivery.channel, "buyer_confirmation_receipt_email");
	    assert.equal(leadAfterPublicConfirmation.beta_client_conversion.prospect_close.buyer_confirmation_delivery.sent_via, "dry_run");
	    assert.equal(
	      leadAfterPublicConfirmation.beta_client_conversion.prospect_close.buyer_confirmation_delivery.provider_message_id,
	      `dry_run_buyer_confirmation_${lead.id}`
	    );
	    assert.deepEqual(leadAfterPublicConfirmation.beta_client_conversion.prospect_close.buyer_confirmation_delivery.recipients, [
	      "web@regressionco.test",
	      "crm@regressionco.test",
	      "ae@regressionco.test",
	      "revops@regressionco.test"
	    ]);
	    const activationPageAfterPublicConfirmation = await getProtectedText("/activation");
	    assert.match(activationPageAfterPublicConfirmation, /Buyer confirmation receipt sent via dry_run/);

	    const closeConfirmation = await postProtectedJson(`/api/v1/activation/prospects/${lead.id}/close-workflow`, {
	      action: "confirm",
	      targetPageUrl: "https://regressionco.test/demo",
	      implementationOwnerName: "Web Ops",
	      implementationOwnerEmail: "web@regressionco.test",
	      crmOwnerEmail: "crm@regressionco.test",
	      routingOwnerEmail: "ae@regressionco.test",
	      reportRecipients: "crm@regressionco.test, revops@regressionco.test",
	      baselineFirstTouchMinutes: 42,
	      baselineMeetingRate: 0.18,
		      baselineOpportunityRate: 0.07,
		      baselineWinRate: 0.21,
		      baselineSalesCycleDays: 47,
		      baselineNotes: "Buyer supplied old-form baseline from HubSpot report.",
		      confirmationSource: "confirmation_reply_preview",
		      operatorReviewComplete: "yes",
		      defaultedRequiredFieldsAcknowledged: "yes",
		      reviewExtractedFields: 10,
		      reviewDefaultedRequiredFields: 0,
		      reviewMissingRequiredDetails: 0,
		      reviewChecklistStatus: "ready",
		      replyEvidenceReceiptJson: JSON.stringify(confirmationReplyPreview.reply_evidence_receipt),
		      operatorReviewNotes: "Reviewed parsed reply preview before applying confirmation."
		    });
	    assert.equal(closeConfirmation.close_workflow.status, "confirmed");
	    assert.equal(closeConfirmation.close_workflow.target_page_url, "https://regressionco.test/demo");
	    assert.equal(closeConfirmation.close_workflow.implementation_owner_email, "web@regressionco.test");
	    assert.equal(closeConfirmation.close_workflow.crm_owner_email, "crm@regressionco.test");
	    assert.equal(closeConfirmation.close_workflow.routing_owner_email, "ae@regressionco.test");
	    assert.deepEqual(closeConfirmation.close_workflow.report_recipients, ["crm@regressionco.test", "revops@regressionco.test"]);
		    assert.equal(closeConfirmation.close_workflow.baseline.first_touch_minutes, 42);
		    assert.equal(closeConfirmation.close_workflow.confirmation_review.source, "confirmation_reply_preview");
		    assert.equal(closeConfirmation.close_workflow.confirmation_review.operator_review_complete, true);
		    assert.equal(closeConfirmation.close_workflow.confirmation_review.defaulted_required_fields_acknowledged, true);
		    assert.equal(closeConfirmation.close_workflow.confirmation_review.extracted_fields, 10);
		    assert.equal(closeConfirmation.close_workflow.confirmation_review.defaulted_required_fields, 0);
		    assert.equal(closeConfirmation.close_workflow.confirmation_review.missing_required_details, 0);
		    assert.equal(closeConfirmation.close_workflow.confirmation_review.checklist_status, "ready");
		    assert.match(closeConfirmation.close_workflow.confirmation_review.notes, /Reviewed parsed reply preview/);
		    assert.equal(closeConfirmation.close_workflow.confirmation_review.reply_evidence_receipt.type, "deal_threads.confirmation_reply_evidence_receipt.v1");
		    assert.equal(closeConfirmation.close_workflow.confirmation_review.reply_evidence_receipt.reply.character_count, buyerReply.length);
		    assert.ok(closeConfirmation.close_workflow.confirmation_review.reply_evidence_receipt.field_evidence_keys.includes("targetPageUrl"));
		    assert.equal(closeConfirmation.close_workflow.confirmation_review.reply_evidence_receipt.safety.apply_requires_post, true);
		    assert.equal(closeConfirmation.prospect.recommended_website_url, "https://regressionco.test/demo");
	    assert.equal(closeConfirmation.prospect.owner_email, "crm@regressionco.test");
	    assert.equal(closeConfirmation.prospect.high_priority_owner, "ae@regressionco.test");

		    const activationAfterCloseConfirmation = await getProtectedJson("/api/v1/activation/real-beta");
		    assert.equal(activationAfterCloseConfirmation.prospects[0].close_workflow.status, "confirmed");
		    assert.equal(activationAfterCloseConfirmation.prospects[0].recommended_website_url, "https://regressionco.test/demo");
		    assert.equal(activationAfterCloseConfirmation.prospects[0].report_recipients, "crm@regressionco.test, revops@regressionco.test");

		    const followUpsAfterConfirmation = await getProtectedJson("/api/v1/activation/follow-ups");
		    const confirmedQueueItem = followUpsAfterConfirmation.queue.find((item) => item.lead_id === lead.id);
		    assert.ok(confirmedQueueItem);
		    assert.equal(confirmedQueueItem.status, "ready_for_kickoff");
		    assert.equal(confirmedQueueItem.buyer_confirmation_complete, true);
		    assert.equal(followUpsAfterConfirmation.summary.ready_for_kickoff, 1);
		    assert.match(confirmedQueueItem.next_action, /Kick off beta install/);

		    const confirmedRunbook = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/runbook`);
	    assert.equal(confirmedRunbook.status, "kickoff_ready");
	    assert.match(confirmedRunbook.current_operator_action, /Kick off beta install/);
	    assert.deepEqual(confirmedRunbook.missing_confirmation_details, []);
	    assert.ok(confirmedRunbook.steps.some((step) => step.key === "collect_buyer_confirmation" && step.status === "pass"));
	    assert.ok(confirmedRunbook.steps.some((step) => step.key === "kickoff_beta_install" && step.status === "warning"));

		    const confirmedWorkbench = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/confirmation-workbench`);
		    assert.equal(confirmedWorkbench.status, "ready_for_kickoff");
		    assert.equal(confirmedWorkbench.kickoff_preflight.status, "ready");
		    assert.equal(confirmedWorkbench.kickoff_preflight.ready, true);
		    assert.equal(confirmedWorkbench.kickoff_preflight.summary.blocker, 0);
		    assert.equal(confirmedWorkbench.summary.reply_evidence_receipt_saved, true);
		    assert.equal(confirmedWorkbench.kickoff_preflight.summary.reply_evidence_receipt_saved, true);
		    assert.ok(confirmedWorkbench.kickoff_preflight.checks.some((check) => check.key === "buyer_confirmation_review_receipt" && check.status === "pass"));
		    assert.equal(confirmedWorkbench.kickoff_preflight.default_kickoff_payload.websiteUrl, "https://regressionco.test/demo");
		    assert.equal(confirmedWorkbench.kickoff_preflight.default_kickoff_payload.ownerEmail, "crm@regressionco.test");
		    assert.match(confirmedWorkbench.kickoff_preflight.default_kickoff_payload.launchRecipients, /web@regressionco\.test/);
		    assert.ok(confirmedWorkbench.kickoff_preflight.after_kickoff_steps.some((step) => /client-domain widget config proof/i.test(step)));

		    const marketLaunchAfterConfirmation = await getProtectedJson("/api/v1/launch/market-ready");
		    assert.equal(marketLaunchAfterConfirmation.launch_clearance_plan.current_stage, "kickoff_real_beta");
		    assert.equal(marketLaunchAfterConfirmation.launch_clearance_plan.current_action.key, "kickoff_beta_install");
		    assert.equal(marketLaunchAfterConfirmation.launch_clearance_plan.current_action.packet_kind, "kickoff");
		    assert.match(marketLaunchAfterConfirmation.launch_clearance_plan.current_action.operator_post_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/kickoff$`));
		    const kickoffMarketPreflight = marketLaunchAfterConfirmation.launch_clearance_plan.current_action.kickoff_install_handoff_preflight;
		    assert.equal(kickoffMarketPreflight.type, "deal_threads.market_kickoff_install_handoff_preflight.v1");
		    assert.equal(kickoffMarketPreflight.status, "ready_to_kickoff");
		    assert.equal(kickoffMarketPreflight.ready_to_kickoff, true);
		    assert.equal(kickoffMarketPreflight.summary.blocker, 0);
		    assert.ok(kickoffMarketPreflight.summary.launch_recipients >= 2);
		    assert.equal(kickoffMarketPreflight.summary.reply_evidence_receipt_saved, true);
		    assert.equal(kickoffMarketPreflight.summary.paid_lookups_recommended_now, 0);
		    assert.match(kickoffMarketPreflight.kickoff_surface.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/kickoff$`));
		    assert.ok(kickoffMarketPreflight.required_post_fields.includes("launchRecipients"));
		    assert.ok(kickoffMarketPreflight.evidence_required.some((item) => item.key === "launch_packet_delivery" && item.required));
		    assert.ok(kickoffMarketPreflight.evidence_required.some((item) => item.key === "tokenized_install_handoff" && item.required));
		    assert.ok(kickoffMarketPreflight.evidence_required.some((item) => item.key === "proof_transition_receipt" && item.required));
		    assert.ok(kickoffMarketPreflight.post_result_expected_keys.includes("proof_transition"));
		    assert.ok(kickoffMarketPreflight.checks.some((check) => check.key === "buyer_confirmation_review_receipt" && check.status === "pass"));
		    assert.equal(kickoffMarketPreflight.safety.kickoff_requires_post, true);
		    assert.equal(kickoffMarketPreflight.safety.operator_post_may_create_beta_client, true);
		    assert.equal(kickoffMarketPreflight.safety.operator_post_may_send_or_dry_run_install_handoff, true);
		    assert.equal(kickoffMarketPreflight.safety.operator_post_claims_market_ready, false);
		    assert.equal(kickoffMarketPreflight.safety.operator_post_claims_live_proof, false);
		    assert.equal(marketLaunchAfterConfirmation.launch_clearance_plan.current_action.kickoff_preflight.type, kickoffMarketPreflight.type);
		    assert.equal(marketLaunchAfterConfirmation.launch_clearance_plan.current_action.install_handoff_evidence_contract.length, kickoffMarketPreflight.evidence_required.length);
		    assert.equal(marketLaunchAfterConfirmation.launch_clearance_plan.current_action.reply_apply_preflight.status, "verified_for_kickoff");
		    const marketLaunchAfterConfirmationMarkdown = await getProtectedText("/api/v1/launch/market-ready?format=markdown");
		    assert.match(marketLaunchAfterConfirmationMarkdown, /Current action: Kick off beta install/);
		    assert.match(marketLaunchAfterConfirmationMarkdown, /Kickoff install handoff preflight: ready to kickoff/i);
		    assert.match(marketLaunchAfterConfirmationMarkdown, /Kickoff ready: yes/);
		    assert.match(marketLaunchAfterConfirmationMarkdown, /Kickoff POST creates beta client: yes/);
		    assert.match(marketLaunchAfterConfirmationMarkdown, /Kickoff POST sends install handoff: yes/);
		    assert.match(marketLaunchAfterConfirmationMarkdown, /Kickoff paid lookups recommended now: 0/);
		    assert.match(marketLaunchAfterConfirmationMarkdown, /#### Kickoff Install Handoff Preflight/);
		    assert.match(marketLaunchAfterConfirmationMarkdown, /Required kickoff field: launchRecipients/);
		    assert.match(marketLaunchAfterConfirmationMarkdown, /Evidence launch_packet_delivery: required/);
		    assert.match(marketLaunchAfterConfirmationMarkdown, /Expected POST result key: proof_transition/);
		    const marketLaunchAfterConfirmationPage = await getProtectedText("/launch/market-ready");
		    assert.match(marketLaunchAfterConfirmationPage, /Kickoff install handoff preflight/);
		    assert.match(marketLaunchAfterConfirmationPage, /Kickoff required fields/);
		    assert.match(marketLaunchAfterConfirmationPage, /Kickoff evidence required/);
		    assert.match(marketLaunchAfterConfirmationPage, /Kickoff POST result keys/);
		    assert.match(marketLaunchAfterConfirmationPage, /Real beta-client id/);

	    const executionAfterConfirmation = await getProtectedJson("/api/v1/launch/first-beta-execution");
	    assert.equal(executionAfterConfirmation.status, "ready_for_kickoff");
	    assert.equal(executionAfterConfirmation.summary.active_lead_id, lead.id);
	    assert.equal(executionAfterConfirmation.summary.active_company, "RegressionCo");
	    assert.equal(executionAfterConfirmation.active_buyer.packet_kind, "kickoff");
	    assert.equal(executionAfterConfirmation.active_buyer.kickoff_action.method, "POST");
	    assert.match(executionAfterConfirmation.active_buyer.kickoff_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/kickoff$`));
	    assert.match(executionAfterConfirmation.active_buyer.protected_links.kickoff, new RegExp(`/api/v1/activation/prospects/${lead.id}/kickoff$`));
	    assert.ok(
	      executionAfterConfirmation.operator_post_previews.some(
	        (preview) => preview.key === "kickoff_install" && preview.method === "POST" && new RegExp(`/api/v1/activation/prospects/${lead.id}/kickoff$`).test(preview.url)
	      )
	    );
	    assert.ok(executionAfterConfirmation.sequence.some((step) => step.key === "send_buyer_follow_up" && step.status === "pass"));
	    assert.ok(executionAfterConfirmation.sequence.some((step) => step.key === "kickoff_after_confirmation" && step.status === "ready"));
	    assert.equal(executionAfterConfirmation.copy_blocks.buyer_follow_up, undefined);

	    const nextActionAfterConfirmation = await getProtectedJson("/api/v1/launch/next-action");
	    assert.equal(nextActionAfterConfirmation.status, "kickoff_ready");
	    assert.equal(nextActionAfterConfirmation.summary.active_lead_id, lead.id);
	    assert.equal(nextActionAfterConfirmation.summary.active_company, "RegressionCo");
	    assert.equal(nextActionAfterConfirmation.summary.packet_kind, "kickoff");
	    assert.equal(nextActionAfterConfirmation.current_follow_up.packet_kind, "kickoff");
	    assert.match(nextActionAfterConfirmation.current_follow_up.send_action.api_url, new RegExp(`/api/v1/activation/prospects/${lead.id}/kickoff$`));
	    assert.match(nextActionAfterConfirmation.current_follow_up.send_action.html_action, new RegExp(`/activation/prospects/${lead.id}/kickoff$`));
	    assert.equal(nextActionAfterConfirmation.copy_block, null);
	    assert.ok(nextActionAfterConfirmation.operator_steps.some((step) => step.key === "unlock_real_beta_kickoff" && step.status === "ready"));
	    assert.ok(nextActionAfterConfirmation.operator_post_previews.some((preview) => preview.key === "kickoff_install"));
	    const nextActionAfterConfirmationPage = await getProtectedText("/launch/next-action");
	    assert.match(nextActionAfterConfirmationPage, /Active kickoff/);
	    assert.match(nextActionAfterConfirmationPage, /Kick off beta install/);
	    assert.match(nextActionAfterConfirmationPage, /GET is read-only/);

	    const confirmationCommandAfterConfirmation = await getProtectedJson("/api/v1/launch/confirmation-command");
	    assert.equal(confirmationCommandAfterConfirmation.status, "ready_for_kickoff");
	    assert.equal(confirmationCommandAfterConfirmation.summary.active_lead_id, lead.id);
	    assert.equal(confirmationCommandAfterConfirmation.summary.active_company, "RegressionCo");
	    assert.equal(confirmationCommandAfterConfirmation.summary.active_mode, "kickoff");
	    assert.equal(confirmationCommandAfterConfirmation.summary.confirmation_complete, true);
	    assert.equal(confirmationCommandAfterConfirmation.current_action.key, "kickoff_beta_install");
	    assert.equal(confirmationCommandAfterConfirmation.actions.manual_sent, null);
	    assert.equal(confirmationCommandAfterConfirmation.copy_block, null);
	    assert.equal(confirmationCommandAfterConfirmation.actions.kickoff.enabled, true);
	    assert.match(confirmationCommandAfterConfirmation.actions.kickoff.url, new RegExp(`/api/v1/activation/prospects/${lead.id}/kickoff$`));
	    assert.ok(confirmationCommandAfterConfirmation.confirmation_runway.some((step) => step.key === "kickoff_real_beta" && step.status === "ready"));
	    const confirmationCommandAfterConfirmationPage = await getProtectedText("/launch/confirmation-command");
	    assert.match(confirmationCommandAfterConfirmationPage, /Kickoff action/);
	    assert.match(confirmationCommandAfterConfirmationPage, /Kick off beta install/);
	    assert.doesNotMatch(confirmationCommandAfterConfirmationPage, /Mark manual draft sent/);

	    const confirmationWatchAfterConfirmation = await getProtectedJson("/api/v1/launch/confirmation-watch");
	    assert.equal(confirmationWatchAfterConfirmation.status, "kickoff_ready");
	    assert.equal(confirmationWatchAfterConfirmation.summary.active_lead_id, lead.id);
	    assert.equal(confirmationWatchAfterConfirmation.summary.active_company, "RegressionCo");
	    assert.equal(confirmationWatchAfterConfirmation.summary.active_mode, "buyer_confirmation");
	    assert.equal(confirmationWatchAfterConfirmation.summary.ready_for_kickoff, 1);
		    assert.equal(confirmationWatchAfterConfirmation.summary.due_now, 1);
		    assert.equal(confirmationWatchAfterConfirmation.current_focus.status, "ready_for_kickoff");
		    assert.equal(confirmationWatchAfterConfirmation.current_focus.primary_surface_label, "Kickoff POST");
		    assert.equal(confirmationWatchAfterConfirmation.current_focus.primary_surface_method, "POST");
		    assert.equal(confirmationWatchAfterConfirmation.current_focus.operator_post_method, "POST");
		    assert.equal(confirmationWatchAfterConfirmation.current_focus.manual_record_method, null);
		    assert.match(confirmationWatchAfterConfirmation.current_focus.primary_link, new RegExp(`/launch/confirmation-command\\?lead=${lead.id}$`));
	    assert.ok(confirmationWatchAfterConfirmation.recommended_actions.some((action) => /Kick off 1 confirmed beta install/.test(action)));
	    assert.equal(confirmationWatchAfterConfirmation.safety.read_only_get, true);
	    const confirmationWatchAfterConfirmationPage = await getProtectedText("/launch/confirmation-watch");
	    assert.match(confirmationWatchAfterConfirmationPage, /Kickoff ready|Ready For Kickoff/);
	    assert.match(confirmationWatchAfterConfirmationPage, /Command/);

	    const conversion = await postProtectedJson(`/api/v1/activation/prospects/${lead.id}/kickoff`, {
	      launchRecipients: "web@regressionco.test, crm@regressionco.test",
	      notes: "Convert this qualified buyer into the first pilot client and send the install handoff."
	    });
	    assert.equal(conversion.status, "activation_kickoff_sent");
	    assert.equal(conversion.created, true);
	    assert.equal(conversion.reused_existing, false);
    assert.equal(conversion.beta_client.domain, "regressionco.test");
    assert.equal(conversion.beta_client.owner_email, "crm@regressionco.test");
    assert.equal(conversion.beta_client.website_url, "https://regressionco.test/demo");
    assert.deepEqual(conversion.beta_client.report_settings.recipients, ["crm@regressionco.test", "revops@regressionco.test"]);
    assert.equal(conversion.beta_client.routing_overrides.highPriorityOwner, "ae@regressionco.test");
    assert.equal(conversion.beta_client.source_lead_id, lead.id);
    assert.equal(conversion.beta_client.lead_count, 0);
    assert.equal(conversion.beta_client.readiness.ready_to_send_snippet, true);
	    assert.equal(conversion.launch_packet_delivery.status, "sent");
	    assert.equal(conversion.launch_packet_delivery.sent_via, "dry_run");
	    assert.deepEqual(conversion.launch_packet_delivery.recipients, ["web@regressionco.test", "crm@regressionco.test"]);
	    assert.equal(conversion.beta_client.launch_packet_delivery.status, "sent");
		    assert.equal(conversion.beta_client.checklist.find((item) => item.key === "install_snippet_sent").checked, true);
		    assert.match(conversion.public_install_url, /\/install\/inst_[a-f0-9]+$/);
		    assert.match(conversion.beta_client.public_test_install_url, /\/install\/inst_[a-f0-9]+\/test$/);
		    assert.equal(conversion.proof_transition.type, "deal_threads.activation_kickoff_proof_transition.v1");
		    assert.equal(conversion.proof_transition.status, "real_beta_client_created");
		    assert.equal(conversion.proof_transition.market_ready, false);
		    assert.equal(conversion.proof_transition.proof_gate_delta.before.real_beta_clients, 0);
		    assert.equal(conversion.proof_transition.proof_gate_delta.after.real_beta_clients, 1);
		    assert.equal(conversion.proof_transition.proof_gate_delta.after.paid_lookups_recommended_now, 0);
		    assert.ok(conversion.proof_transition.proof_gate_delta.cleared_gates.some((gate) => gate.key === "real_beta_client"));
		    assert.ok(conversion.proof_transition.proof_gate_delta.cleared_gates.some((gate) => gate.key === "install_handoff"));
		    assert.ok(conversion.proof_transition.remaining_blockers.some((gate) => gate.key === "client_domain_install"));
		    assert.ok(conversion.proof_transition.remaining_blockers.some((gate) => gate.key === "first_real_profile"));
		    assert.ok(conversion.proof_transition.next_proof_actions.some((action) => action.key === "hosted_load_test" && action.status === "ready"));
		    assert.ok(conversion.proof_transition.next_proof_actions.some((action) => action.key === "live_proof_gate" && action.status === "blocker"));
		    assert.match(conversion.proof_transition.proof_urls.install_handoff, /\/install\/inst_[a-f0-9]+$/);
		    assert.match(conversion.proof_transition.proof_urls.install_workbench, new RegExp(`/launch/install-queue/${conversion.beta_client.id}/workbench$`));
		    assert.equal(conversion.proof_transition.safety.transition_claims_market_ready, false);
		    assert.equal(conversion.proof_transition.safety.transition_claims_live_proof, false);
		    assert.equal(conversion.proof_transition.safety.paid_provider_lookup_by_default, false);
			    assert.equal(conversion.email_adapter.transmits_external_email, false);
			    assert.match(conversion.launch_packet.markdown, /Client install handoff page/);
		    assert.match(conversion.launch_packet.markdown, /Hosted widget load test/);
	    assert.match(conversion.beta_client.install_snippet, new RegExp(`data-beta-client-id="${conversion.beta_client.id}"`));
    assert.equal(conversion.launch_url, `/launch?client=${conversion.beta_client.id}`);

	    const convertedLead = await getProtectedJson(`/api/v1/leads/${lead.id}`);
	    assert.equal(convertedLead.source?.beta_client_id || null, null);
	    assert.equal(convertedLead.beta_client_conversion.beta_client_id, conversion.beta_client.id);
	    assert.equal(convertedLead.beta_client_conversion.reused_existing, false);
	    assert.equal(convertedLead.beta_client_conversion.prospect_close.status, "confirmed");

		    const nextActionAfterKickoff = await getProtectedJson("/api/v1/launch/next-action");
		    assert.equal(nextActionAfterKickoff.status, "install_proof_ready");
		    assert.equal(nextActionAfterKickoff.summary.active_beta_client_id, conversion.beta_client.id);
		    assert.equal(nextActionAfterKickoff.summary.active_company, conversion.beta_client.name);
		    assert.equal(nextActionAfterKickoff.summary.packet_kind, "install_proof");
		    assert.equal(nextActionAfterKickoff.summary.real_beta_clients, 1);
		    assert.equal(nextActionAfterKickoff.summary.manual_sent_action_ready, false);
		    assert.equal(nextActionAfterKickoff.current_install_action.beta_client_id, conversion.beta_client.id);
		    assert.equal(nextActionAfterKickoff.current_install_action.packet_kind, "install_proof");
		    assert.equal(nextActionAfterKickoff.current_install_action.action_key, "collect_install_handoff");
		    assert.equal(nextActionAfterKickoff.current_install_action.action.method, "GET");
		    assert.match(nextActionAfterKickoff.current_install_action.public_links.install_status, /\/install\/inst_[a-f0-9]+\/status$/);
		    assert.equal(nextActionAfterKickoff.current_follow_up, null);
		    assert.equal(nextActionAfterKickoff.copy_block, null);
		    assert.equal(nextActionAfterKickoff.proof_focus.key, "install_handoff");
		    assert.ok(nextActionAfterKickoff.operator_steps.some((step) => step.key === "run_install_action" && step.status === "ready"));
		    assert.ok(nextActionAfterKickoff.operator_steps.some((step) => step.key === "watch_client_domain_install" && step.status === "blocked"));
		    assert.ok(nextActionAfterKickoff.operator_steps.some((step) => step.key === "capture_first_profile" && step.status === "blocked"));
		    const nextActionAfterKickoffPage = await getProtectedText("/launch/next-action");
		    assert.match(nextActionAfterKickoffPage, /Active install proof/);
		    assert.match(nextActionAfterKickoffPage, /Install public links/);
		    assert.match(nextActionAfterKickoffPage, /Install workbench/);
		    assert.match(nextActionAfterKickoffPage, /GET is read-only/);
		    assert.doesNotMatch(nextActionAfterKickoffPage, /close-workflow/);
		    assert.doesNotMatch(nextActionAfterKickoffPage, /Mark manual draft sent/);
		    const nextActionAfterKickoffMarkdown = await getProtectedText("/api/v1/launch/next-action?format=markdown");
			    assert.match(nextActionAfterKickoffMarkdown, /## Active Install Proof/);
			    assert.match(nextActionAfterKickoffMarkdown, /Action: collect install handoff/i);

			    const marketLaunchAfterKickoff = await getProtectedJson("/api/v1/launch/market-ready");
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_stage, "client_domain_install");
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_action.key, "client_domain_install");
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_action.packet_kind, "install_proof");
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_action.proof_focus, "client_domain_install");
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_action.beta_client_id, conversion.beta_client.id);
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_action.primary_surface_method, "GET");
			    assert.match(marketLaunchAfterKickoff.launch_clearance_plan.current_action.primary_surface_url, new RegExp(`/launch/install-queue/${conversion.beta_client.id}/workbench$`));
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_action.action_key, "collect_install_handoff");
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_action.install_action.action.method, "GET");
			    const clientDomainMarketPreflight = marketLaunchAfterKickoff.launch_clearance_plan.current_action.client_domain_install_preflight;
			    assert.equal(clientDomainMarketPreflight.type, "deal_threads.market_client_domain_install_preflight.v1");
			    assert.equal(clientDomainMarketPreflight.status, "install_handoff_needed");
			    assert.equal(clientDomainMarketPreflight.ready_for_client_domain_proof, false);
			    assert.equal(clientDomainMarketPreflight.summary.client_domain_config_loads, 0);
			    assert.equal(clientDomainMarketPreflight.summary.hosted_config_loads, 0);
			    assert.equal(clientDomainMarketPreflight.summary.launch_packet_status, "sent");
			    assert.equal(clientDomainMarketPreflight.summary.paid_lookups_recommended_now, 0);
			    assert.ok(clientDomainMarketPreflight.checks.some((check) => check.key === "client_domain_config_load" && check.status === "blocker"));
			    assert.ok(clientDomainMarketPreflight.checks.some((check) => check.key === "hosted_loads_do_not_count" && check.status === "pass"));
			    assert.ok(clientDomainMarketPreflight.evidence_required.some((item) => item.key === "client_domain_config_load" && item.required));
			    assert.ok(clientDomainMarketPreflight.evidence_required.some((item) => item.key === "source_check_result" && !item.required));
			    assert.ok(clientDomainMarketPreflight.evidence_required.some((item) => item.key === "first_beta_profile_after_install" && !item.required));
			    assert.equal(clientDomainMarketPreflight.surfaces.source_check.method, "POST");
			    assert.match(clientDomainMarketPreflight.surfaces.source_check.url, new RegExp(`/api/v1/beta-clients/${conversion.beta_client.id}/install-verification$`));
			    assert.equal(clientDomainMarketPreflight.safety.read_only_get, true);
			    assert.equal(clientDomainMarketPreflight.safety.source_check_requires_post, true);
			    assert.equal(clientDomainMarketPreflight.safety.hosted_load_does_not_clear_live_install, true);
			    assert.equal(clientDomainMarketPreflight.safety.client_domain_load_requires_buyer_page, true);
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_action.install_proof_preflight.type, clientDomainMarketPreflight.type);
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_action.install_proof_evidence_contract.length, clientDomainMarketPreflight.evidence_required.length);
			    assert.equal(marketLaunchAfterKickoff.launch_clearance_plan.current_action.safety.hosted_load_does_not_clear_live_install, true);
			    assert.equal(marketLaunchAfterKickoff.blocker_clearance_map.current_focus.current_action.key, "client_domain_install");
			    assert.equal(marketLaunchAfterKickoff.blocker_clearance_map.current_focus.paid_lookup_required, false);
			    const marketLaunchAfterKickoffMarkdown = await getProtectedText("/api/v1/launch/market-ready?format=markdown");
			    assert.match(marketLaunchAfterKickoffMarkdown, /Current action: Capture client-domain install proof/);
			    assert.match(marketLaunchAfterKickoffMarkdown, /Client-domain install preflight: install handoff needed/i);
			    assert.match(marketLaunchAfterKickoffMarkdown, /Client-domain proof ready: no/);
			    assert.match(marketLaunchAfterKickoffMarkdown, /Client-domain paid lookups recommended now: 0/);
			    assert.match(marketLaunchAfterKickoffMarkdown, /#### Client-Domain Install Preflight/);
			    assert.match(marketLaunchAfterKickoffMarkdown, /#### Client-Domain Install Evidence/);
			    assert.match(marketLaunchAfterKickoffMarkdown, /Evidence client_domain_config_load: required/);
			    assert.match(marketLaunchAfterKickoffMarkdown, /Evidence source_check_result: recommended/);
			    assert.match(marketLaunchAfterKickoffMarkdown, /#### Client-Domain Install Sequence/);
			    assert.match(marketLaunchAfterKickoffMarkdown, /#### Client-Domain Install Links/);
			    const marketLaunchAfterKickoffPage = await getProtectedText("/launch/market-ready");
			    assert.match(marketLaunchAfterKickoffPage, /Client-domain install preflight/);
			    assert.match(marketLaunchAfterKickoffPage, /Client-domain install evidence/);
			    assert.match(marketLaunchAfterKickoffPage, /Client-domain install sequence/);
			    assert.match(marketLaunchAfterKickoffPage, /Client-domain install links/);
			    assert.match(marketLaunchAfterKickoffPage, /Client-domain widget config load/);
			    assert.match(marketLaunchAfterKickoffPage, /Hosted loads do not count/);

			    const confirmationCommandAfterKickoff = await getProtectedJson("/api/v1/launch/confirmation-command");
		    assert.equal(confirmationCommandAfterKickoff.status, "install_proof_active");
		    assert.equal(confirmationCommandAfterKickoff.summary.active_mode, "install_proof");
		    assert.equal(confirmationCommandAfterKickoff.summary.active_beta_client_id, conversion.beta_client.id);
		    assert.equal(confirmationCommandAfterKickoff.current_action.key, "work_install_proof");
		    assert.equal(confirmationCommandAfterKickoff.current_follow_up, null);
		    assert.equal(confirmationCommandAfterKickoff.copy_block, null);
		    assert.equal(confirmationCommandAfterKickoff.actions.manual_sent, null);
		    assert.equal(confirmationCommandAfterKickoff.safety.read_only_get, true);
		    const confirmationCommandAfterKickoffPage = await getProtectedText("/launch/confirmation-command");
		    assert.match(confirmationCommandAfterKickoffPage, /Install proof action/);
		    assert.match(confirmationCommandAfterKickoffPage, /Providerless enrichment firewall/);
		    assert.doesNotMatch(confirmationCommandAfterKickoffPage, /close-workflow|Mark manual draft sent/);

		    const confirmationWatchAfterKickoff = await getProtectedJson("/api/v1/launch/confirmation-watch");
		    assert.equal(confirmationWatchAfterKickoff.status, "install_proof_active");
		    assert.equal(confirmationWatchAfterKickoff.summary.active_mode, "install_proof");
		    assert.equal(confirmationWatchAfterKickoff.summary.active_beta_client_id, conversion.beta_client.id);
		    assert.equal(confirmationWatchAfterKickoff.summary.active_company, conversion.beta_client.name);
		    assert.equal(confirmationWatchAfterKickoff.summary.paid_lookups_recommended_now, 0);
		    assert.equal(confirmationWatchAfterKickoff.current_focus.mode, "install_proof");
		    assert.equal(confirmationWatchAfterKickoff.current_focus.beta_client_id, conversion.beta_client.id);
		    assert.match(confirmationWatchAfterKickoff.current_focus.primary_link, new RegExp(`/launch/install-queue/${conversion.beta_client.id}/workbench$`));
		    assert.ok(confirmationWatchAfterKickoff.recommended_actions.some((action) => /install proof/i.test(action)));
		    assert.equal(confirmationWatchAfterKickoff.safety.sends_external_email_on_get, false);
		    assert.equal(confirmationWatchAfterKickoff.safety.marks_manual_send_on_get, false);
		    assert.equal(confirmationWatchAfterKickoff.safety.creates_beta_client_on_get, false);
		    const confirmationWatchAfterKickoffPage = await getProtectedText("/launch/confirmation-watch");
		    assert.match(confirmationWatchAfterKickoffPage, /Launch confirmation watchroom/);
		    assert.match(confirmationWatchAfterKickoffPage, /install proof/i);
		    assert.doesNotMatch(confirmationWatchAfterKickoffPage, /Mark manual draft sent/);

		    const clientSummary = await getProtectedJson("/api/v1/beta-clients");
    assert.equal(clientSummary.count, 1);
    assert.equal(clientSummary.summary.total_leads, 0);
	    assert.equal(clientSummary.summary.ready_to_send_snippet, 1);
	    assert.equal(clientSummary.clients[0].launch_packet_delivery.status, "sent");
	    assert.ok(clientSummary.clients[0].readiness.next_actions.some((action) => action.includes("tested URL") || action.includes("installed page")));

	    const activationAfterConversion = await getProtectedJson("/api/v1/activation/real-beta");
	    assert.equal(activationAfterConversion.summary.real_beta_clients, 1);
	    assert.equal(activationAfterConversion.summary.qualified_prospects, 0);
	    assert.equal(activationAfterConversion.selected_client.id, conversion.beta_client.id);
	    assert.equal(activationAfterConversion.real_beta_clients[0].source_lead_id, lead.id);
	    assert.ok(activationAfterConversion.steps.some((step) => step.key === "real_launch_target" && step.status === "pass"));

	    const launch = await getProtectedJson(`/api/v1/launch/first-beta?client=${conversion.beta_client.id}`);
    assert.equal(launch.selected_client.id, conversion.beta_client.id);
    assert.equal(launch.steps.find((step) => step.key === "beta_client").status, "pass");
    assert.equal(launch.steps.find((step) => step.key === "test_lead").status, "blocker");

    const configUrl = `/api/v1/widgets/wid_deal_threads_demo/config?betaClientId=${conversion.beta_client.id}&pageUrl=${encodeURIComponent(
      "https://regressionco.test"
    )}`;
	    const configResponse = await fetch(`${BASE_URL}${configUrl}`, { headers: { origin: "https://regressionco.test" } });
    assert.equal(configResponse.status, 200);
    const config = await configResponse.json();
	    assert.equal(config.betaClientId, conversion.beta_client.id);

		    const installQueueAfterConvertedClientLoad = await getProtectedJson("/api/v1/launch/install-queue");
		    const convertedQueueItem = installQueueAfterConvertedClientLoad.queue.find((item) => item.beta_client_id === conversion.beta_client.id);
		    assert.ok(convertedQueueItem);
		    assert.equal(convertedQueueItem.status, "create_first_profile");
		    assert.equal(convertedQueueItem.action.key, "create_first_profile");
		    assert.equal(convertedQueueItem.install_activity.client_page_config_loads, 1);
		    assert.ok(convertedQueueItem.proof_preflight.checks.some((check) => check.key === "client_domain_config_load" && check.status === "pass"));
		    assert.ok(convertedQueueItem.proof_preflight.checks.some((check) => check.key === "first_beta_profile" && check.status === "blocker"));
			    const nextActionAfterConvertedClientLoad = await getProtectedJson("/api/v1/launch/next-action");
			    assert.equal(nextActionAfterConvertedClientLoad.status, "install_proof_ready");
			    assert.equal(nextActionAfterConvertedClientLoad.current_install_action.action_key, "create_first_profile");
			    assert.equal(nextActionAfterConvertedClientLoad.proof_focus.key, "first_real_profile");

			    const marketLaunchAfterConvertedClientLoad = await getProtectedJson("/api/v1/launch/market-ready");
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_stage, "first_profile_capture");
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.key, "create_first_profile");
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.packet_kind, "first_profile");
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.proof_focus, "first_real_profile");
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.beta_client_id, conversion.beta_client.id);
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.primary_surface_method, "GET");
			    assert.match(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.primary_surface_url, new RegExp(`/launch/first-profile\\?client=${conversion.beta_client.id}$`));
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.operator_post_method, "POST");
			    assert.match(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.operator_post_url, new RegExp(`/launch/${conversion.beta_client.id}/test-lead$`));
			    const firstProfileMarketPreflight = marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.first_profile_capture_preflight;
			    assert.equal(firstProfileMarketPreflight.type, "deal_threads.market_first_profile_capture_preflight.v1");
			    assert.equal(firstProfileMarketPreflight.status, "first_profile_needed");
			    assert.equal(firstProfileMarketPreflight.ready_to_capture_first_profile, true);
			    assert.equal(firstProfileMarketPreflight.summary.client_domain_config_loads, 1);
			    assert.equal(firstProfileMarketPreflight.summary.beta_profiles, 0);
			    assert.equal(firstProfileMarketPreflight.summary.payload_missing_fields, 0);
			    assert.equal(firstProfileMarketPreflight.summary.paid_lookups_recommended_now, 0);
			    assert.ok(firstProfileMarketPreflight.required_post_fields.includes("message"));
			    assert.match(firstProfileMarketPreflight.create_profile_surface.html_action, new RegExp(`/launch/${conversion.beta_client.id}/test-lead$`));
			    assert.equal(firstProfileMarketPreflight.create_profile_surface.method, "POST");
			    assert.equal(firstProfileMarketPreflight.create_profile_surface.creates_profile, true);
			    assert.equal(firstProfileMarketPreflight.create_profile_surface.preview_only_on_get, true);
			    assert.equal(firstProfileMarketPreflight.create_profile_surface.payload_preview.returnTo, `/launch/first-profile?client=${conversion.beta_client.id}`);
			    assert.match(firstProfileMarketPreflight.default_profile_payload.pageUrl, /regressionco\.test/);
			    assert.ok(firstProfileMarketPreflight.checks.some((check) => check.key === "client_domain_config_load" && check.status === "pass"));
			    assert.ok(firstProfileMarketPreflight.checks.some((check) => check.key === "first_beta_profile" && check.status === "blocker"));
			    assert.ok(firstProfileMarketPreflight.checks.some((check) => check.key === "explicit_profile_post_required" && check.status === "pass"));
			    assert.ok(firstProfileMarketPreflight.evidence_required.some((item) => item.key === "first_beta_profile" && item.required));
			    assert.ok(firstProfileMarketPreflight.evidence_required.some((item) => item.key === "explicit_profile_post" && item.required));
			    assert.ok(firstProfileMarketPreflight.evidence_required.some((item) => item.key === "crm_handoff_after_profile" && !item.required));
			    assert.equal(firstProfileMarketPreflight.safety.read_only_get, true);
			    assert.equal(firstProfileMarketPreflight.safety.creates_profile_on_get, false);
			    assert.equal(firstProfileMarketPreflight.safety.test_lead_creation_requires_post, true);
			    assert.equal(firstProfileMarketPreflight.safety.operator_post_may_create_profile, true);
			    assert.equal(firstProfileMarketPreflight.safety.operator_post_claims_market_ready, false);
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.first_profile_preflight.type, firstProfileMarketPreflight.type);
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.first_profile_evidence_contract.length, firstProfileMarketPreflight.evidence_required.length);
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.safety.creates_profile_on_get, false);
			    assert.equal(marketLaunchAfterConvertedClientLoad.launch_clearance_plan.current_action.safety.test_lead_creation_requires_post, true);
			    assert.equal(marketLaunchAfterConvertedClientLoad.blocker_clearance_map.current_focus.key, "first_real_profile");
			    assert.equal(marketLaunchAfterConvertedClientLoad.blocker_clearance_map.current_focus.current_action.key, "create_first_profile");
			    assert.equal(marketLaunchAfterConvertedClientLoad.blocker_clearance_map.current_focus.paid_lookup_required, false);
			    const marketLaunchAfterConvertedClientLoadMarkdown = await getProtectedText("/api/v1/launch/market-ready?format=markdown");
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /Current action: Capture first beta profile/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /First profile capture preflight: first profile needed/i);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /First profile ready to capture: yes/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /First profile POST requires review: yes/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /First profile paid lookups recommended now: 0/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /#### First Profile Capture Preflight/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /Required first-profile field: message/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /#### First Profile Evidence/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /Evidence first_beta_profile: required/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /Evidence crm_handoff_after_profile: recommended/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /#### First Profile POST Preview/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /Creates profile: yes/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /Preview only on GET: yes/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /#### First Profile Sequence/);
			    assert.match(marketLaunchAfterConvertedClientLoadMarkdown, /#### First Profile Links/);
			    const marketLaunchAfterConvertedClientLoadPage = await getProtectedText("/launch/market-ready");
			    assert.match(marketLaunchAfterConvertedClientLoadPage, /First profile capture preflight/);
			    assert.match(marketLaunchAfterConvertedClientLoadPage, /First profile required fields/);
			    assert.match(marketLaunchAfterConvertedClientLoadPage, /First profile evidence/);
			    assert.match(marketLaunchAfterConvertedClientLoadPage, /First profile POST preview/);
			    assert.match(marketLaunchAfterConvertedClientLoadPage, /First profile payload preview/);
			    assert.match(marketLaunchAfterConvertedClientLoadPage, /Create launch test lead/);

			    const firstProfileCapture = await getProtectedJson(`/api/v1/launch/first-profile?client=${conversion.beta_client.id}`);
		    assert.equal(firstProfileCapture.type, "deal_threads.launch_first_profile_capture.v1");
		    assert.equal(firstProfileCapture.status, "first_profile_needed");
		    assert.equal(firstProfileCapture.market_ready, false);
		    assert.equal(firstProfileCapture.summary.selected_beta_client_id, conversion.beta_client.id);
		    assert.equal(firstProfileCapture.summary.client_domain_config_loads, 1);
		    assert.equal(firstProfileCapture.summary.beta_profiles, 0);
		    assert.equal(firstProfileCapture.summary.crm_handoffs, 0);
		    assert.equal(firstProfileCapture.summary.rep_feedback_reviews, 0);
		    assert.equal(firstProfileCapture.summary.required_code_builds_before_first_beta, 0);
		    assert.equal(firstProfileCapture.summary.paid_lookups_recommended_now, 0);
		    assert.equal(firstProfileCapture.current_action.key, "create_first_profile");
		    assert.match(firstProfileCapture.actions.create_test_lead.html_action, new RegExp(`/launch/${conversion.beta_client.id}/test-lead$`));
		    assert.equal(firstProfileCapture.actions.create_test_lead.method, "POST");
		    assert.equal(firstProfileCapture.actions.create_test_lead.preview_only_on_get, true);
		    assert.equal(firstProfileCapture.actions.create_test_lead.creates_profile, true);
		    assert.ok(firstProfileCapture.capture_checklist.some((item) => item.key === "client_domain_config_load" && item.status === "pass"));
		    assert.ok(firstProfileCapture.capture_checklist.some((item) => item.key === "first_beta_profile" && item.status === "blocker"));
		    assert.ok(firstProfileCapture.proof_unlocks.some((item) => item.key === "first_real_profile" && item.status === "blocker"));
		    assert.equal(firstProfileCapture.safety.read_only_get, true);
		    assert.equal(firstProfileCapture.safety.creates_profile_on_get, false);
		    assert.equal(firstProfileCapture.safety.sends_external_email_on_get, false);
		    assert.equal(firstProfileCapture.safety.creates_beta_client_on_get, false);
		    assert.equal(firstProfileCapture.safety.transmits_external_crm_on_get, false);
		    assert.equal(firstProfileCapture.safety.paid_provider_lookup_by_default, false);
		    assert.equal(firstProfileCapture.safety.live_proof_claimed, false);
		    assert.equal(firstProfileCapture.safety.test_lead_creation_requires_post, true);
		    const firstProfilePage = await getProtectedText(`/launch/first-profile?client=${conversion.beta_client.id}`);
		    assert.match(firstProfilePage, /First profile capture/);
		    assert.match(firstProfilePage, /Focused proof room for creating the first beta-attributed buyer profile/);
		    assert.match(firstProfilePage, /GET is read-only: no profile creation, email send, buyer-state mutation, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/);
		    assert.match(firstProfilePage, /Create launch test lead/);
		    assert.match(firstProfilePage, /Capture checklist/);
		    const firstProfileMarkdown = await getProtectedText(`/api/v1/launch/first-profile?format=markdown&client=${conversion.beta_client.id}`);
		    assert.match(firstProfileMarkdown, /# Deal Threads First Profile Capture Room/);
		    assert.match(firstProfileMarkdown, /GET creates profile: no/);
		    assert.match(firstProfileMarkdown, /Test lead creation requires POST: yes/);

		    const profileHandoffBeforeProfile = await getProtectedJson(`/api/v1/launch/profile-handoff?client=${conversion.beta_client.id}`);
		    assert.equal(profileHandoffBeforeProfile.type, "deal_threads.launch_profile_handoff_bridge.v1");
		    assert.equal(profileHandoffBeforeProfile.status, "first_profile_needed");
		    assert.equal(profileHandoffBeforeProfile.summary.selected_beta_client_id, conversion.beta_client.id);
		    assert.equal(profileHandoffBeforeProfile.summary.beta_profiles, 0);
		    assert.equal(profileHandoffBeforeProfile.summary.paid_lookups_recommended_now, 0);
		    assert.equal(profileHandoffBeforeProfile.current_action.key, "capture_first_profile");
		    assert.equal(profileHandoffBeforeProfile.actions.crm_delivery, null);
		    assert.ok(profileHandoffBeforeProfile.handoff_checklist.some((item) => item.key === "first_beta_profile" && item.status === "blocker"));
		    assert.ok(profileHandoffBeforeProfile.handoff_checklist.some((item) => item.key === "crm_handoff_proof" && item.status === "blocker"));
		    assert.equal(profileHandoffBeforeProfile.safety.read_only_get, true);
		    assert.equal(profileHandoffBeforeProfile.safety.creates_profile_on_get, false);
		    assert.equal(profileHandoffBeforeProfile.safety.sends_external_email_on_get, false);
		    assert.equal(profileHandoffBeforeProfile.safety.sends_rep_alert_on_get, false);
		    assert.equal(profileHandoffBeforeProfile.safety.queues_crm_delivery_on_get, false);
		    assert.equal(profileHandoffBeforeProfile.safety.transmits_external_crm_on_get, false);
		    assert.equal(profileHandoffBeforeProfile.safety.updates_rep_feedback_on_get, false);
		    assert.equal(profileHandoffBeforeProfile.safety.paid_provider_lookup_by_default, false);
		    assert.equal(profileHandoffBeforeProfile.safety.live_proof_claimed, false);
		    assert.equal(profileHandoffBeforeProfile.safety.crm_delivery_requires_post, true);
		    const profileHandoffBeforeProfilePage = await getProtectedText(`/launch/profile-handoff?client=${conversion.beta_client.id}`);
		    assert.match(profileHandoffBeforeProfilePage, /Profile handoff bridge/);
		    assert.match(profileHandoffBeforeProfilePage, /GET is read-only: no profile creation/);
		    assert.match(profileHandoffBeforeProfilePage, /Handoff checklist/);
		    const profileHandoffBeforeProfileMarkdown = await getProtectedText(`/api/v1/launch/profile-handoff?format=markdown&client=${conversion.beta_client.id}`);
		    assert.match(profileHandoffBeforeProfileMarkdown, /# Deal Threads Profile Handoff Bridge/);
		    assert.match(profileHandoffBeforeProfileMarkdown, /GET queues CRM delivery: no/);
		    assert.match(profileHandoffBeforeProfileMarkdown, /CRM delivery requires POST: yes/);

		    const proofCaptureRunbook = await getProtectedJson("/api/v1/launch/proof-capture");
		    assert.equal(proofCaptureRunbook.type, "deal_threads.launch_proof_capture_runbook.v1");
		    assert.equal(proofCaptureRunbook.status, "proof_capture_in_progress");
		    assert.equal(proofCaptureRunbook.selected_beta_client.id, conversion.beta_client.id);
		    assert.equal(proofCaptureRunbook.current_phase.key, "first_real_profile");
		    assert.equal(proofCaptureRunbook.summary.beta_profiles, 0);
		    assert.equal(proofCaptureRunbook.summary.client_domain_config_loads, 1);
		    assert.equal(proofCaptureRunbook.safety.read_only_get, true);
		    assert.equal(proofCaptureRunbook.safety.creates_beta_client_on_get, false);
		    assert.equal(proofCaptureRunbook.safety.transmits_external_crm_on_get, false);
		    assert.equal(proofCaptureRunbook.safety.paid_provider_lookup_by_default, false);
		    assert.equal(proofCaptureRunbook.safety.live_proof_claimed, false);
		    assert.ok(proofCaptureRunbook.phases.some((phase) => phase.key === "client_domain_install" && phase.status === "pass"));
		    assert.ok(proofCaptureRunbook.phases.some((phase) => phase.key === "first_real_profile" && phase.status === "blocker"));
		    assert.ok(proofCaptureRunbook.phases.some((phase) => phase.key === "crm_handoff" && phase.status === "blocker"));
		    assert.ok(proofCaptureRunbook.phases.some((phase) => phase.key === "rep_feedback" && phase.status === "blocker"));
		    const proofCapturePage = await getProtectedText("/launch/proof-capture");
		    assert.match(proofCapturePage, /Proof capture runbook/);
		    assert.match(proofCapturePage, /Proof sequence/);
		    assert.match(proofCapturePage, /First real beta profile/);
		    assert.match(proofCapturePage, /GET is read-only/);
		    assert.doesNotMatch(proofCapturePage, /<form/);
		    const proofCaptureMarkdown = await getProtectedText("/api/v1/launch/proof-capture?format=markdown");
		    assert.match(proofCaptureMarkdown, /# Deal Threads Proof Capture Runbook/);
		    assert.match(proofCaptureMarkdown, /First real beta profile/);
		    assert.match(proofCaptureMarkdown, /Read-only GET: yes/);

		    const proofPacketWorkbench = await getProtectedJson("/api/v1/launch/proof-packet");
		    assert.equal(proofPacketWorkbench.type, "deal_threads.launch_first_proof_packet_workbench.v1");
		    assert.equal(proofPacketWorkbench.status, "proof_evidence_blocked");
		    assert.equal(proofPacketWorkbench.selected_beta_client.id, conversion.beta_client.id);
		    assert.equal(proofPacketWorkbench.summary.client_domain_config_loads, 1);
		    assert.equal(proofPacketWorkbench.summary.beta_profiles, 0);
		    assert.equal(proofPacketWorkbench.summary.strict_evidence_ready, false);
		    assert.equal(proofPacketWorkbench.summary.proof_packets_queued, 0);
		    assert.equal(proofPacketWorkbench.summary.proof_packets_sent, 0);
		    assert.equal(proofPacketWorkbench.actions.queue.ready, false);
		    assert.equal(proofPacketWorkbench.safety.read_only_get, true);
		    assert.equal(proofPacketWorkbench.safety.queues_report_delivery_on_get, false);
		    assert.equal(proofPacketWorkbench.safety.marks_report_sent_on_get, false);
		    assert.equal(proofPacketWorkbench.safety.sends_external_email_on_get, false);
		    assert.equal(proofPacketWorkbench.safety.transmits_external_crm_on_get, false);
		    assert.equal(proofPacketWorkbench.safety.paid_provider_lookup_by_default, false);
		    assert.ok(proofPacketWorkbench.evidence.items.some((item) => item.key === "client_domain_config_load" && item.status === "pass"));
		    assert.ok(proofPacketWorkbench.evidence.items.some((item) => item.key === "first_beta_profile" && item.status === "blocker"));
		    const proofPacketPage = await getProtectedText("/launch/proof-packet");
		    assert.match(proofPacketPage, /First proof packet workbench/);
		    assert.match(proofPacketPage, /Evidence gate/);
		    assert.match(proofPacketPage, /GET is read-only/);
		    const proofPacketMarkdown = await getProtectedText("/api/v1/launch/proof-packet?format=markdown");
		    assert.match(proofPacketMarkdown, /# Deal Threads First Proof Packet Workbench/);
		    assert.match(proofPacketMarkdown, /Strict evidence ready: no/);
		    assert.match(proofPacketMarkdown, /GET queues report delivery: no/);

	    const convertedHostedTestPath = new URL(conversion.beta_client.public_test_install_url).pathname;
	    const convertedHostedTest = await fetch(`${BASE_URL}${convertedHostedTestPath}`);
	    assert.equal(convertedHostedTest.status, 200);
	    const convertedHostedHtml = await convertedHostedTest.text();
	    assert.match(convertedHostedHtml, /Deal Threads hosted widget load test/);
	    assert.match(convertedHostedHtml, new RegExp(`data-beta-client-id="${conversion.beta_client.id}"`));
	    assert.doesNotMatch(convertedHostedHtml, /\/crm\//);
	    assert.doesNotMatch(convertedHostedHtml, /Operator config/);

    const reused = await postProtectedJson(`/api/v1/leads/${lead.id}/beta-client`, {
      ownerEmail: "pilot@regressionco.test"
    });
    assert.equal(reused.created, false);
    assert.equal(reused.reused_existing, true);
    assert.equal(reused.beta_client.id, conversion.beta_client.id);

    const crmAfter = await getProtectedText(`/crm/${lead.id}`);
    assert.match(crmAfter, /Open launch wizard/);
    assert.match(crmAfter, /Original sales lead remains separate from beta traffic/);

	    const formResponse = await postProtectedForm(`/crm/${lead.id}/beta-client`, {
	      name: "RegressionCo Revenue Team",
	      websiteUrl: "https://regressionco.test",
	      ownerEmail: "pilot@regressionco.test",
	      crm: "hubspot",
	      highPriorityOwner: "ae@regressionco.test",
	      reportRecipients: "pilot@regressionco.test, revops@regressionco.test"
	    });
	    assert.equal(formResponse.status, 303);
	    assert.equal(formResponse.headers.get("location"), `/launch?client=${conversion.beta_client.id}`);

	    const activationFormLead = await createHighPriorityLead(null, {
	      firstMessage:
	        "I am evaluating this for StickyActivation using HubSpot. Demo requests are going cold because reps research manually. We want to fix this this quarter and likely have $30K-$50K annually."
	    });
	    const activationConversionResponse = await postProtectedForm(`/crm/${activationFormLead.id}/beta-client`, {
	      returnTo: "/activation",
	      name: "StickyActivation Revenue Team",
	      websiteUrl: "https://stickyactivation.test",
	      ownerEmail: "pilot@stickyactivation.test",
	      crm: "hubspot",
	      highPriorityOwner: "ae@stickyactivation.test",
	      reportRecipients: "pilot@stickyactivation.test, revops@stickyactivation.test"
	    });
	    assert.equal(activationConversionResponse.status, 303);
	    const activationConversionLocation = activationConversionResponse.headers.get("location");
	    assert.match(activationConversionLocation, /^\/activation\?client=beta_[a-f0-9]+&converted=1$/);
	    const stickyClientId = new URL(activationConversionLocation, BASE_URL).searchParams.get("client");
	    const activationAfterStickyConversion = await getProtectedText(activationConversionLocation);
	    assert.match(activationAfterStickyConversion, /StickyActivation Revenue Team/);
	    assert.match(activationAfterStickyConversion, /name="returnTo" value="\/activation"/);

	    const activationPacketResponse = await postProtectedForm(`/launch/${stickyClientId}/send-packet`, {
	      returnTo: "/activation",
	      recipients: "pilot@stickyactivation.test, revops@stickyactivation.test"
	    });
	    assert.equal(activationPacketResponse.status, 303);
	    assert.equal(activationPacketResponse.headers.get("location"), `/activation?client=${stickyClientId}&packetSent=1`);
	  } finally {
    app.kill("SIGTERM");
    await once(app, "exit");
    await rm(tmp, { recursive: true, force: true });
  }
});

test("public pilot intake creates a protected activation prospect", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-pilot-intake-"));
  const dataFile = path.join(tmp, "state.json");
  const app = await startServer(dataFile);

  try {
    const blockedNoConsent = await fetch(`${BASE_URL}/api/v1/pilot-intake`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contactEmail: "rina@betaflow.test",
        companyName: "BetaFlow",
        websiteUrl: "https://betaflow.test",
        businessNeed: "Demo requests are getting stale while reps manually research CRM fit."
      })
    });
    assert.equal(blockedNoConsent.status, 400);
    assert.equal((await blockedNoConsent.json()).error, "consent_required");

    const intake = await postJson("/api/v1/pilot-intake", {
      contactName: "Rina Vale",
      contactEmail: "rina@betaflow.test",
      role: "VP Sales",
      companyName: "BetaFlow",
      websiteUrl: "https://betaflow.test",
      companySize: "220 employees",
      crm: "hubspot",
      targetPageUrl: "https://betaflow.test/demo",
      businessNeed: "Demo requests are getting stale while reps manually research company size, budget, timeline, and CRM fit.",
      timeline: "this_month",
      budgetStatus: "likely",
      budgetRange: "30k_60k",
      authority: "decision_owner",
      implementationOwnerEmail: "web@betaflow.test",
      crmOwnerEmail: "revops@betaflow.test",
      routingOwnerEmail: "ae@betaflow.test",
      reportRecipients: "revops@betaflow.test, ae@betaflow.test",
      baselineFirstTouchMinutes: "52",
      baselineMeetingRate: "16",
      baselineOpportunityRate: "7",
      baselineWinRate: "22",
      baselineSalesCycleDays: "48",
      consentAccepted: true
    });
    assert.equal(intake.status, "pilot_intake_created");
    assert.match(intake.leadProfileId, /^lead_[a-f0-9]+$/);
    assert.equal(intake.priority, "high");
    assert.equal(intake.close_workflow.status, "confirmed");
    assert.equal(intake.close_workflow.target_page_url, "https://betaflow.test/demo");
    assert.equal(intake.close_workflow.implementation_owner_email, "web@betaflow.test");
    assert.equal(intake.close_workflow.crm_owner_email, "revops@betaflow.test");
    assert.equal(intake.close_workflow.routing_owner_email, "ae@betaflow.test");
    assert.deepEqual(intake.close_workflow.report_recipients, ["revops@betaflow.test", "ae@betaflow.test"]);
    assert.equal(intake.close_workflow.baseline.first_touch_minutes, 52);
    assert.equal(intake.close_workflow.baseline.meeting_rate, 0.16);
    assert.equal(intake.public_handoff.status, "confirmation_status_ready");
    assert.equal(intake.public_handoff.safety.buyer_safe_public_links_only, true);
    assert.equal(intake.public_handoff.safety.exposes_crm_profiles, false);
    assert.equal(intake.public_handoff.safety.exposes_operator_actions, false);
    assert.equal(intake.public_handoff.safety.mutates_buyer_state_on_get, false);
    assert.equal(intake.public_handoff.safety.runs_paid_enrichment_on_get, false);
    assert.match(intake.public_next_action, /Review the confirmation status room/);
    assert.equal(new URL(intake.public_next_steps.confirmation_form).pathname, `/confirm/${intake.close_workflow.confirmation_token}`);
    assert.equal(new URL(intake.public_next_steps.confirmation_status).pathname, `/confirm/${intake.close_workflow.confirmation_token}/status`);
    assert.equal(new URL(intake.public_next_steps.confirmation_status_receipt).pathname, `/confirm/${intake.close_workflow.confirmation_token}/status`);
    assert.equal(new URL(intake.public_next_steps.confirmation_status_receipt).searchParams.get("intake"), "1");
    assert.equal(new URL(intake.public_next_steps.request_kit).pathname, `/confirm/${intake.close_workflow.confirmation_token}/request-kit`);
    assert.equal(JSON.stringify(intake.public_handoff).includes("/crm/"), false);
    assert.equal(JSON.stringify(intake.public_handoff).includes("/admin"), false);
    assert.equal(JSON.stringify(intake.public_handoff).includes("/api/v1"), false);
    assert.equal(intake.activation_prospect.company, "BetaFlow");
    assert.equal(intake.activation_prospect.domain, "betaflow.test");
    assert.equal(intake.activation_prospect.close_workflow_status, "confirmed");

    const lead = await getProtectedJson(`/api/v1/leads/${intake.leadProfileId}`);
    assert.equal(lead.source.pilot_intake, true);
    assert.equal(lead.consent.accepted, true);
    assert.equal(lead.contact.email, "rina@betaflow.test");
    assert.equal(lead.company.domain, "betaflow.test");
    assert.equal(lead.qualification.crm, "hubspot");
    assert.equal(lead.qualification.timeline, "this_month");
    assert.equal(lead.qualification.budget_range, "30k_60k");
    assert.equal(lead.enrichment.cost.paid_provider_used, false);

    const activation = await getProtectedJson("/api/v1/activation/real-beta");
    assert.equal(activation.summary.qualified_prospects, 1);
    assert.equal(activation.prospects[0].lead_id, intake.leadProfileId);
    assert.equal(activation.prospects[0].close_workflow.status, "confirmed");
    assert.equal(activation.prospects[0].recommended_website_url, "https://betaflow.test/demo");

    const intakeTriagePage = await fetch(`${BASE_URL}/activation/intake-triage`, {
      headers: { authorization: ADMIN_AUTH_HEADER }
    });
    assert.equal(intakeTriagePage.status, 200);
    const intakeTriageHtml = await intakeTriagePage.text();
    assert.match(intakeTriageHtml, /Activation intake triage/);
    assert.match(intakeTriageHtml, /BetaFlow/);
    assert.match(intakeTriageHtml, /Providerless posture/);
    assert.match(intakeTriageHtml, /no email sends, buyer-state mutation, beta-client creation, buyer-confirmation completion, CRM transmission, paid enrichment, or live-proof claim runs here/i);

    const intakeTriage = await getProtectedJson("/api/v1/activation/intake-triage");
    assert.equal(intakeTriage.type, "deal_threads.activation_intake_triage.v1");
    assert.equal(intakeTriage.summary.public_intake_submissions, 1);
    assert.equal(intakeTriage.summary.qualified_activation_prospects, 1);
    assert.equal(intakeTriage.summary.ready_for_kickoff, 1);
    assert.equal(intakeTriage.summary.required_code_builds_before_first_beta, 0);
    assert.equal(intakeTriage.summary.paid_lookups_recommended_now, 0);
    assert.equal(intakeTriage.safety.read_only_get, true);
    assert.equal(intakeTriage.safety.sends_external_email_on_get, false);
    assert.equal(intakeTriage.safety.creates_beta_client_on_get, false);
    assert.equal(intakeTriage.safety.marks_buyer_confirmation_complete_on_get, false);
    assert.equal(intakeTriage.safety.transmits_external_crm_on_get, false);
    assert.equal(intakeTriage.safety.runs_paid_enrichment_on_get, false);
    const betaFlowTriage = intakeTriage.items.find((item) => item.lead_id === intake.leadProfileId);
    assert.ok(betaFlowTriage, "Expected pilot intake lead in activation intake triage");
    assert.equal(betaFlowTriage.source, "public_pilot_intake");
    assert.equal(betaFlowTriage.status, "ready_for_kickoff");
    assert.equal(betaFlowTriage.convertible_activation_prospect, true);
    assert.equal(betaFlowTriage.buyer_confirmation_complete, true);
    assert.ok(betaFlowTriage.first_five_fit.score >= 70);
    assert.equal(betaFlowTriage.missing_confirmation_details.length, 0);
    assert.equal(betaFlowTriage.paid_lookups_recommended_now, 0);
    assert.match(betaFlowTriage.protected_links.crm_profile, new RegExp(`/crm/${intake.leadProfileId}`));
    assert.match(betaFlowTriage.protected_links.confirmation_workbench, new RegExp(`/activation/prospects/${intake.leadProfileId}/confirmation-workbench`));
    assert.equal(betaFlowTriage.action_packet.kind, "kickoff");
    assert.equal(betaFlowTriage.action_packet.safety.sends_external_email_on_get, false);
    assert.equal(betaFlowTriage.action_packet.safety.creates_beta_client_on_get, false);

    const intakeTriageMarkdownText = await getProtectedText("/api/v1/activation/intake-triage?format=markdown");
    assert.match(intakeTriageMarkdownText, /# Deal Threads Activation Intake Triage/);
    assert.match(intakeTriageMarkdownText, /Public intake submissions: 1/);
    assert.match(intakeTriageMarkdownText, /Paid lookups recommended now: 0/);
    assert.match(intakeTriageMarkdownText, /Read-only GET: yes/);
    assert.match(intakeTriageMarkdownText, /Runs paid enrichment on GET: no/);

    const formResponse = await postForm("/pilot-intake", {
      contactName: "Mara Ops",
      contactEmail: "mara@formflow.test",
      companyName: "FormFlow",
      websiteUrl: "https://formflow.test",
      companySize: "140 employees",
      crm: "salesforce",
      businessNeed: "Inbound forms miss budget and timeline before reps follow up.",
      timeline: "this_quarter",
      budgetStatus: "building_case",
      budgetRange: "10k_30k",
      authority: "influencer",
      consentAccepted: "on"
    });
    assert.equal(formResponse.status, 303);
    const formRedirect = formResponse.headers.get("location");
    assert.match(formRedirect, /^\/confirm\/pcf_[a-f0-9]+\/status\?intake=1$/);
    const receiptPage = await fetch(`${BASE_URL}${formRedirect}`);
    assert.equal(receiptPage.status, 200);
    const receiptHtml = await receiptPage.text();
    assert.match(receiptHtml, /Pilot request received/);
    assert.match(receiptHtml, /Buyer confirmation status/);
    assert.match(receiptHtml, /This tokenized status room is read-only/);
    assert.match(receiptHtml, /Confirmation form/);
    assert.match(receiptHtml, /Request kit/);
    assert.doesNotMatch(receiptHtml, /href="\/crm\//);
    assert.doesNotMatch(receiptHtml, /href="\/admin/);
    assert.doesNotMatch(receiptHtml, /href="\/api\/v1/);
  } finally {
    app.kill("SIGTERM");
    await once(app, "exit");
    await rm(tmp, { recursive: true, force: true });
  }
});

test("tokenized pilot acceptance records a manual billing receipt", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-pilot-acceptance-"));
  const dataFile = path.join(tmp, "state.json");
  const app = await startServer(dataFile);

  try {
    const lead = await createHighPriorityLead();
    const closePacket = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/close-packet`);
    const publicAcceptancePath = new URL(closePacket.public_links.pilot_acceptance).pathname;
    assert.match(publicAcceptancePath, /^\/confirm\/pcf_[a-f0-9]+\/acceptance$/);

    const blockedOperatorApi = await fetch(`${BASE_URL}/api/v1/activation/prospects/${lead.id}/pilot-acceptance`);
    assert.equal(blockedOperatorApi.status, 401);

    const initialAcceptancePage = await fetch(`${BASE_URL}${publicAcceptancePath}`);
    assert.equal(initialAcceptancePage.status, 200);
    const initialAcceptanceHtml = await initialAcceptancePage.text();
    assert.match(initialAcceptanceHtml, /Deal Threads pilot acceptance/);
    assert.match(initialAcceptanceHtml, /Accept pilot terms/);
    assert.match(initialAcceptanceHtml, /Payment data/);
    assert.doesNotMatch(initialAcceptanceHtml, /href="\/crm\//);
    assert.doesNotMatch(initialAcceptanceHtml, /href="\/admin/);
    assert.doesNotMatch(initialAcceptanceHtml, /href="\/api\/v1/);

    const initialAcceptanceJsonResponse = await fetch(`${BASE_URL}${publicAcceptancePath}?format=json`);
    assert.equal(initialAcceptanceJsonResponse.status, 200);
    const initialAcceptanceJson = await initialAcceptanceJsonResponse.json();
    assert.equal(initialAcceptanceJson.type, "deal_threads.public_pilot_acceptance.v1");
    assert.equal(initialAcceptanceJson.status, "needs_acceptance");
    assert.equal(initialAcceptanceJson.summary.accepted, false);
    assert.equal(initialAcceptanceJson.summary.transmits_payment_data, false);
    assert.equal(initialAcceptanceJson.summary.paid_lookups_recommended_now, 0);
    assert.equal(initialAcceptanceJson.safety.mutates_buyer_state_on_get, false);
    assert.equal(initialAcceptanceJson.safety.mutates_buyer_state_on_post, true);
    assert.equal(initialAcceptanceJson.safety.sends_external_email_on_post, false);
    assert.equal(initialAcceptanceJson.safety.creates_beta_client_on_post, false);
    assert.equal(initialAcceptanceJson.safety.transmits_payment_data, false);
    assert.equal(initialAcceptanceJson.safety.paid_provider_lookup_by_default, false);
    assert.equal(JSON.stringify(initialAcceptanceJson).includes("/crm/"), false);
    assert.equal(JSON.stringify(initialAcceptanceJson).includes("/admin"), false);

    const invalidAcceptance = await postForm(publicAcceptancePath, {
      signerName: "Dana Vale",
      signerEmail: "dana@regressionco.test"
    });
    assert.equal(invalidAcceptance.status, 400);
    assert.match(await invalidAcceptance.text(), /Accept the pilot terms/);

    const accepted = await postForm(publicAcceptancePath, {
      acceptTerms: "true",
      signerName: "Dana Vale",
      signerEmail: "dana@regressionco.test",
      signerTitle: "VP Revenue",
      billingContactName: "Riley Finance",
      billingContactEmail: "billing@regressionco.test",
      billingMethod: "manual_invoice",
      setupFeeStatus: "pending",
      invoiceNotes: "Send setup invoice after implementation owner confirms install date."
    });
    assert.equal(accepted.status, 303);
    assert.equal(accepted.headers.get("location"), `${publicAcceptancePath}?accepted=1`);

    const receiptPage = await fetch(`${BASE_URL}${accepted.headers.get("location")}`);
    assert.equal(receiptPage.status, 200);
    const receiptHtml = await receiptPage.text();
    assert.match(receiptHtml, /Pilot acceptance recorded/);
    assert.match(receiptHtml, /no payment data was transmitted/i);
    assert.match(receiptHtml, /billing@regressionco\.test/);

    const acceptedJsonResponse = await fetch(`${BASE_URL}${publicAcceptancePath}?format=json`);
    assert.equal(acceptedJsonResponse.status, 200);
    const acceptedJson = await acceptedJsonResponse.json();
    assert.equal(acceptedJson.status, "accepted");
    assert.equal(acceptedJson.summary.accepted, true);
    assert.equal(acceptedJson.summary.signer_email, "dana@regressionco.test");
    assert.equal(acceptedJson.summary.billing_contact_email, "billing@regressionco.test");
    assert.equal(acceptedJson.summary.billing_method, "manual_invoice");
    assert.equal(acceptedJson.summary.setup_fee_status, "pending");

    const protectedAcceptance = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/pilot-acceptance`);
    assert.equal(protectedAcceptance.status, "accepted");
    assert.equal(protectedAcceptance.summary.accepted, true);
    assert.equal(protectedAcceptance.summary.transmits_payment_data, false);

    const protectedAcceptanceMarkdown = await getProtectedText(`/api/v1/activation/prospects/${lead.id}/pilot-acceptance?format=markdown`);
    assert.match(protectedAcceptanceMarkdown, /# Deal Threads Pilot Acceptance/);
    assert.match(protectedAcceptanceMarkdown, /Transmits payment data: no/);

    const manualOperatorReceipt = await postProtectedJson(`/api/v1/activation/prospects/${lead.id}/pilot-acceptance`, {
      acceptTerms: true,
      signerName: "Dana Vale",
      signerEmail: "dana@regressionco.test",
      billingContactName: "Riley Finance",
      billingContactEmail: "billing@regressionco.test",
      billingMethod: "purchase_order",
      setupFeeStatus: "paid",
      purchaseOrderNumber: "PO-42"
    });
    assert.equal(manualOperatorReceipt.status, "pilot_acceptance_recorded");
    assert.equal(manualOperatorReceipt.pilot_acceptance.billing_method, "purchase_order");
    assert.equal(manualOperatorReceipt.pilot_acceptance.setup_fee_status, "paid");
    assert.equal(manualOperatorReceipt.pilot_acceptance.purchase_order_number, "PO-42");

    const acceptedLead = await getProtectedJson(`/api/v1/leads/${lead.id}`);
    assert.equal(acceptedLead.beta_client_conversion.prospect_close.pilot_acceptance.status, "accepted");
    assert.equal(acceptedLead.beta_client_conversion.prospect_close.pilot_acceptance.setup_fee_status, "paid");

    const workbench = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/confirmation-workbench`);
    assert.equal(workbench.summary.pilot_accepted, true);
    assert.equal(workbench.summary.setup_fee_status, "paid");
    assert.match(workbench.public_links.pilot_acceptance, new RegExp(`${publicAcceptancePath}$`));
    assert.match(workbench.protected_links.pilot_acceptance_api, new RegExp(`/api/v1/activation/prospects/${lead.id}/pilot-acceptance$`));

    const statusRoomResponse = await fetch(`${BASE_URL}${new URL(closePacket.public_links.buyer_confirmation_status).pathname}?format=json`);
    assert.equal(statusRoomResponse.status, 200);
    const statusRoom = await statusRoomResponse.json();
    assert.equal(statusRoom.summary.pilot_accepted, true);
    assert.equal(statusRoom.summary.setup_fee_status, "paid");
    assert.match(statusRoom.public_links.pilot_acceptance, new RegExp(`${publicAcceptancePath}$`));
  } finally {
    app.kill("SIGTERM");
    await once(app, "exit");
    await rm(tmp, { recursive: true, force: true });
  }
});

test("public buyer confirmation can auto-create the install handoff", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-auto-kickoff-"));
  const dataFile = path.join(tmp, "state.json");
  const app = await startServer(dataFile, { ACTIVATION_AUTO_KICKOFF_ON_CONFIRMATION: "true" });

  try {
    const lead = await createHighPriorityLead();
    const closePacket = await getProtectedJson(`/api/v1/activation/prospects/${lead.id}/close-packet`);
    const publicConfirmationPath = new URL(closePacket.public_links.buyer_confirmation).pathname;
    const publicConfirmationStatusPath = new URL(closePacket.public_links.buyer_confirmation_status).pathname;
    const publicConfirmationRequestKitPath = new URL(closePacket.public_links.buyer_confirmation_request_kit).pathname;
    const publicConfirmation = await postForm(publicConfirmationPath, {
      targetPageUrl: "https://regressionco.test/demo",
      implementationOwnerName: "Regression Web",
      implementationOwnerEmail: "web@regressionco.test",
      crmOwnerEmail: "crm@regressionco.test",
      routingOwnerEmail: "ae@regressionco.test",
      reportRecipients: "crm@regressionco.test, revops@regressionco.test",
      baselineFirstTouchMinutes: "42",
      baselineMeetingRate: "0.18",
      baselineOpportunityRate: "0.07",
      baselineWinRate: "0.21",
      baselineSalesCycleDays: "47",
      baselineNotes: "Auto-kickoff public buyer confirmation."
    });
    assert.equal(publicConfirmation.status, 303);
    assert.match(publicConfirmation.headers.get("location"), /^\/install\/inst_[a-f0-9]+\?confirmed=1$/);

    const installPage = await fetch(`${BASE_URL}${publicConfirmation.headers.get("location")}`);
    assert.equal(installPage.status, 200);
    const installHtml = await installPage.text();
    assert.match(installHtml, /Deal Threads install handoff/);
    assert.match(installHtml, /Pilot details confirmed/);
    assert.match(installHtml, /data-beta-client-id=&quot;beta_/);
    assert.doesNotMatch(installHtml, /\/crm\//);
    assert.doesNotMatch(installHtml, /Operator config/);

    const convertedLead = await getProtectedJson(`/api/v1/leads/${lead.id}`);
    const conversion = convertedLead.beta_client_conversion;
    assert.match(conversion.beta_client_id, /^beta_[a-f0-9-]+$/);
    assert.equal(conversion.prospect_close.status, "confirmed");
    assert.equal(conversion.prospect_close.buyer_confirmation_delivery.status, "sent");
    assert.equal(conversion.prospect_close.buyer_confirmation_delivery.sent_via, "dry_run");

    const betaClient = await getProtectedJson(`/api/v1/beta-clients/${conversion.beta_client_id}`);
    assert.equal(betaClient.domain, "regressionco.test");
    assert.equal(betaClient.website_url, "https://regressionco.test/demo");
    const publicConfirmationStatusAfterAuto = await fetch(`${BASE_URL}${publicConfirmationStatusPath}?format=json`);
    assert.equal(publicConfirmationStatusAfterAuto.status, 200);
    const publicConfirmationStatusAfterAutoJson = await publicConfirmationStatusAfterAuto.json();
    assert.equal(publicConfirmationStatusAfterAutoJson.status, "install_handoff_ready");
    assert.equal(publicConfirmationStatusAfterAutoJson.summary.confirmation_complete, true);
    assert.equal(publicConfirmationStatusAfterAutoJson.summary.install_handoff_ready, true);
    assert.match(publicConfirmationStatusAfterAutoJson.public_links.install_handoff, /\/install\/inst_[a-f0-9]+$/);
    const publicConfirmationRequestKitAfterAuto = await fetch(`${BASE_URL}${publicConfirmationRequestKitPath}?format=json`);
	    assert.equal(publicConfirmationRequestKitAfterAuto.status, 200);
	    const publicConfirmationRequestKitAfterAutoJson = await publicConfirmationRequestKitAfterAuto.json();
	    assert.equal(publicConfirmationRequestKitAfterAutoJson.status, "ready_for_confirmation_submit");
	    assert.equal(publicConfirmationRequestKitAfterAutoJson.summary.confirmation_complete, true);
	    assert.equal(publicConfirmationRequestKitAfterAutoJson.summary.install_handoff_ready, true);
    assert.equal(betaClient.owner_email, "crm@regressionco.test");
    assert.deepEqual(betaClient.report_settings.recipients, ["crm@regressionco.test", "revops@regressionco.test"]);
    assert.equal(betaClient.launch_packet_delivery.status, "sent");
    assert.equal(betaClient.launch_packet_delivery.sent_via, "dry_run");
    assert.equal(betaClient.readiness.ready_to_send_snippet, true);

    const activationAfterAutoKickoff = await getProtectedJson("/api/v1/activation/real-beta");
    assert.equal(activationAfterAutoKickoff.summary.qualified_prospects, 0);
    assert.equal(activationAfterAutoKickoff.summary.real_beta_clients, 1);
    assert.equal(activationAfterAutoKickoff.selected_client.id, conversion.beta_client_id);

    const confirmationReceipt = await fetch(`${BASE_URL}${publicConfirmationPath}?submitted=1`);
    assert.equal(confirmationReceipt.status, 200);
    const receiptHtml = await confirmationReceipt.text();
    assert.match(receiptHtml, /Client-specific install handoff is ready/);
    assert.match(receiptHtml, /\/install\/inst_[a-f0-9]+/);
  } finally {
    app.kill("SIGTERM");
    await once(app, "exit");
    await rm(tmp, { recursive: true, force: true });
  }
});

test("public install handoff can auto-run source check", async () => {
  const tmp = await mkdtemp(path.join(tmpdir(), "deal-threads-auto-source-check-"));
  const dataFile = path.join(tmp, "state.json");
  const app = await startServer(dataFile, { INSTALL_AUTO_SOURCE_CHECK_ON_HANDOFF: "true" });
  const installFixture = await startInstallFixture();

  try {
    const fixtureUrl = `http://127.0.0.1:${installFixture.port}/demo`;
    const betaClient = await postProtectedJson("/api/v1/beta-clients", {
      name: "Auto Source Check Team",
      websiteUrl: fixtureUrl,
      ownerEmail: "owner@sourcecheck.test",
      crm: "hubspot",
      status: "setup",
      highPriorityOwner: "ae@sourcecheck.test",
      reportRecipients: "owner@sourcecheck.test",
      reportCadence: "weekly",
      reportPeriodDays: "14",
      minimumProofLeads: "1"
    });
    installFixture.setHtml(`<!doctype html><html><body><h1>Auto source check</h1><script async src="${BASE_URL}/widget.js" data-widget-id="${betaClient.widget_id}" data-tenant-id="${betaClient.tenant_id}" data-beta-client-id="${betaClient.id}"></script></body></html>`);

    const publicInstallPath = new URL(betaClient.public_install_url).pathname;
    const autoCheckResponse = await postForm(publicInstallPath, {
      contactName: "Source Check Implementer",
      contactEmail: "web@sourcecheck.test",
      testedPageUrl: fixtureUrl,
      notes: "Installed on the fixture page."
    });
    assert.equal(autoCheckResponse.status, 303);
    assert.equal(autoCheckResponse.headers.get("location"), `${publicInstallPath}?submitted=1&sourceCheck=passed`);

    const updatedClient = await getProtectedJson(`/api/v1/beta-clients/${betaClient.id}`);
    assert.equal(updatedClient.install_handoff.status, "submitted");
    assert.equal(updatedClient.install_handoff.tested_page_url, fixtureUrl);
    assert.equal(updatedClient.install_handoff.verification.status, "passed");
    assert.equal(updatedClient.install_handoff.verification.checked_by, "install_handoff:web@sourcecheck.test");
    assert.equal(updatedClient.install_handoff.verification.snippet_detected, true);
    assert.equal(updatedClient.install_handoff.verification.widget_script_present, true);
    assert.equal(updatedClient.install_handoff.verification.beta_client_id_present, true);
    assert.equal(updatedClient.install_activity.config_loads, 0);
    assert.equal(updatedClient.checklist.find((item) => item.key === "widget_installed").checked, false);
    assert.ok(updatedClient.readiness.checks.some((check) => check.key === "install_source_check" && check.status === "pass"));
    assert.ok(updatedClient.readiness.checks.some((check) => check.key === "widget_install" && check.status !== "pass"));

    const publicResultPage = await fetch(`${BASE_URL}${autoCheckResponse.headers.get("location")}`);
    assert.equal(publicResultPage.status, 200);
    const publicResultHtml = await publicResultPage.text();
    assert.match(publicResultHtml, /source check found the Deal Threads snippet/);
    assert.match(publicResultHtml, /Snippet detected/);
    assert.match(publicResultHtml, /Actual install still requires a real widget config load/);
    assert.doesNotMatch(publicResultHtml, /\/crm\//);
    assert.doesNotMatch(publicResultHtml, /Operator config/);
  } finally {
    app.kill("SIGTERM");
    await once(app, "exit");
    await installFixture.close();
    await rm(tmp, { recursive: true, force: true });
  }
});

async function createHighPriorityLead(betaClientId = null, options = {}) {
  const session = await postJson("/api/v1/widget-sessions", {
    tenantId: "ten_deal_threads_demo",
    widgetId: "wid_deal_threads_demo",
    betaClientId,
    pageUrl: BASE_URL
  });
  if (betaClientId) {
    assert.equal(session.welcomeMessage, "PilotCo custom welcome.");
    assert.deepEqual(session.quickReplies, ["Fix handoffs", "Improve speed-to-lead"]);
    assert.equal(session.questionFlow.find((question) => question.key === "authority").prompt, "Who owns the buying decision at PilotCo?");
  }

  const messages = [
    options.firstMessage ||
      "I am evaluating this for RegressionCo, a 160-person SaaS company using HubSpot. Demo requests are going cold because reps research manually. We want to fix this this quarter and likely have $30K-$50K annually.",
    "I own the decision",
    "dana@regressionco.test",
    "My name is Dana Vale",
    "Yes, send it"
  ];

  let result;
  for (const [index, message] of messages.entries()) {
    result = await postJson(`/api/v1/conversations/${session.conversationId}/messages`, {
      sessionId: session.sessionId,
      message,
      consentAccepted: true
    });
    if (betaClientId && index === 0) {
      assert.equal(result.assistantMessage, "Who owns the buying decision at PilotCo?");
      assert.deepEqual(result.quickReplies, ["I own the decision", "I influence the decision", "Researching for the team"]);
    }
  }

  assert.equal(result.completionStatus, "completed");
  const blockedLead = await fetch(`${BASE_URL}/api/v1/leads/${result.leadProfileId}`);
  assert.equal(blockedLead.status, 401);

  return getProtectedJson(`/api/v1/leads/${result.leadProfileId}`);
}

async function createTenantDataLead(betaClientId) {
  const session = await postJson("/api/v1/widget-sessions", {
    tenantId: "ten_deal_threads_demo",
    widgetId: "wid_deal_threads_demo",
    betaClientId,
    pageUrl: `${BASE_URL}/deleteco`
  });
  const messages = [
    "I am evaluating this for DeleteCo, a 175-person SaaS company using HubSpot. We need demo routing and buyer-profile enrichment fixed this quarter and likely have $30K-$50K annually.",
    "I own the decision",
    "dina@deleteco.test",
    "My name is Dina Cross",
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

async function startServer(dataFile, envOverrides = {}) {
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
		      INSTALL_VERIFIER_ALLOW_PRIVATE_HOSTS: "true",
		      ACTIVATION_AUTO_KICKOFF_ON_CONFIRMATION: "false",
		      INSTALL_AUTO_SOURCE_CHECK_ON_HANDOFF: "false",
		      ADMIN_USERNAME,
	      ADMIN_PASSWORD,
	      ...envOverrides
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

async function startInstallFixture() {
  let html = "<!doctype html><html><body>No install snippet yet.</body></html>";
  const server = createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return {
    port: server.address().port,
    setHtml(nextHtml) {
      html = nextHtml;
    },
    close() {
      return new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  };
}

async function waitForPersistence(dataFile, predicate = (data) => data.leads?.length) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const data = JSON.parse(await readFile(dataFile, "utf8"));
      if (predicate(data)) return;
    } catch {
      // keep waiting
    }
    await sleep(100);
  }

  throw new Error("Timed out waiting for persistence file");
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
