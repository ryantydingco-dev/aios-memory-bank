import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "..");
const artifactsDir = path.resolve(rootDir, ".artifacts", "launch-readiness");

const baseUrl = normalizeBaseUrl(process.env.LAUNCH_BASE_URL || process.env.QA_BASE_URL || "http://127.0.0.1:4173");
const adminUsername = process.env.LAUNCH_ADMIN_USERNAME || process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.LAUNCH_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "deal-threads-local";
const authHeader = `Basic ${Buffer.from(`${adminUsername}:${adminPassword}`).toString("base64")}`;
const base = new URL(baseUrl);
const isRemote = !["localhost", "127.0.0.1", "::1"].includes(base.hostname);
const expectedStoreMode = process.env.LAUNCH_EXPECT_DATA_STORE || (isRemote ? "sqlite" : null);
let runtimeWidgetId = process.env.LAUNCH_WIDGET_ID || process.env.WIDGET_ID || "wid_deal_threads_demo";

const checks = [];

async function main() {
  await mkdir(artifactsDir, { recursive: true });

  const healthRes = await check("public health endpoint", async () => {
    const res = await request("/api/v1/health");
    assert.equal(res.status, 200);
    assertHeader(res.headers, "x-content-type-options", "nosniff");
    assertHeader(res.headers, "x-frame-options", "DENY");
    assertHeader(res.headers, "referrer-policy", "no-referrer");
    const health = await parseJson(res);
    assert.equal(health.status, "ok");
    assert.equal(health.hardening?.status, "hardened");
    assert.equal(health.hardening?.score, 100);
    assert.equal(health.hardening?.summary?.blocker, 0);
    if (expectedStoreMode) assert.equal(health.dataStore?.mode, expectedStoreMode);
    return {
      data_store: health.dataStore,
      hardening: health.hardening,
      beta_clients: health.betaClients,
      leads: health.leads
    };
  });

  await check("public buyer demo room", async () => {
    const res = await request("/");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads/);
    assert.match(html, /Start buyer profile/);
    assert.match(html, /First-five beta invite/);
    assert.match(html, /Request beta pilot/);
    assert.match(html, /Pilot launch hub/);
    assert.match(html, /View sample profile/);
    assert.match(html, /Security center/);
    assert.match(html, /Pilot close kit/);
    assert.match(html, /Pilot agreement/);
    assert.match(html, /Business case/);
    assert.match(html, /Implementation guide/);
    assert.match(html, /CRM handoff guide/);
    assert.match(html, /Approval room/);
    assert.match(html, /Mutual action plan/);
    assert.match(html, /Confirmation guide/);
    assert.match(html, /Forwarding kit/);
    assert.match(html, /Pricing/);
    assert.match(html, /Sales enablement/);
    assert.match(html, /Providerless enrichment/);
    assert.match(html, /Compare options/);
    assert.match(html, /Proof preview/);
    assert.match(html, /Built to earn the install conversation/);
    assert.match(html, /crm-profile-preview\.png/);
    assert.doesNotMatch(html, /local development/i);
    return {
      contains_buyer_cta: true,
      contains_first_five_beta_invite: true,
      contains_pilot_request: true,
      contains_pilot_launch_hub: true,
      contains_product_screenshot: true,
      contains_security_center: true,
      contains_pilot_close_kit: true,
      contains_pilot_agreement: true,
      contains_business_case: true,
      contains_implementation_guide: true,
      contains_crm_handoff_guide: true,
      contains_pilot_approval_room: true,
      contains_mutual_action_plan: true,
      contains_buyer_confirmation_guide: true,
      contains_stakeholder_forwarding_kit: true,
      contains_pricing: true,
      contains_sales_enablement: true,
      contains_providerless_enrichment: true,
      contains_comparison: true,
      contains_proof_preview: true,
      local_development_copy: false
    };
  });

  await check("public pilot launch hub", async () => {
    const res = await request("/pilot-launch");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads pilot launch hub/);
    assert.match(html, /Mid-market beta pilot/);
    assert.match(html, /Request beta pilot/);
    assert.match(html, /Revenue leader/);
    assert.match(html, /RevOps or CRM owner/);
    assert.match(html, /Website or implementation owner/);
    assert.match(html, /Proof gates/);
    assert.match(html, /Paid enrichment default/);
    assert.match(html, /Launch readiness checklist/);
    assert.match(html, /Pilot launch claim audit/);
    assert.match(html, /Buyer-safe launch routing only/);
    assert.match(html, /Claims live results: no/);
    assert.match(html, /Claims market ready: no/);
    assert.match(html, /Claims customer ROI: no/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /Requires market gate before live claims: yes/);
    assert.match(html, /no operator forms, CRM profiles, tenant exports/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    const packet = await json("/api/v1/pilot-launch");
    assert.equal(packet.type, "deal_threads.public_pilot_launch_hub");
    assert.ok(packet.stakeholder_paths?.length >= 5);
    assert.ok(packet.launch_sequence?.length >= 5);
    assert.ok(packet.proof_gates?.length >= 6);
    assert.equal(packet.public_safety?.read_only_get, true);
    assert.equal(packet.public_safety?.exposes_operator_forms, false);
    assert.equal(packet.public_safety?.exposes_crm_profiles, false);
    assert.equal(packet.public_safety?.mutates_buyer_state, false);
    assert.equal(packet.public_safety?.transmits_external_data, false);
    assert.equal(packet.public_safety?.sends_external_email, false);
    assert.equal(packet.public_safety?.runs_paid_enrichment, false);
    assert.equal(packet.public_safety?.claims_live_results, false);
    assert.equal(packet.launch_readiness_checklist?.type, "deal_threads.public_pilot_launch_readiness_checklist.v1");
    assert.equal(packet.launch_readiness_checklist?.public_links_only, true);
    assert.equal(packet.launch_readiness_checklist?.requires_market_gate_before_live_claims, true);
    assert.ok(packet.launch_readiness_checklist?.required_public_links?.includes("pilot_close_kit"));
    assert.ok(packet.launch_readiness_checklist?.required_steps?.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(packet.pilot_launch_claim_audit?.type, "deal_threads.public_pilot_launch_claim_audit.v1");
    assert.equal(packet.pilot_launch_claim_audit?.claim_scope, "buyer_safe_launch_routing_only");
    assert.equal(packet.pilot_launch_claim_audit?.safety?.buyer_routing_only, true);
    assert.equal(packet.pilot_launch_claim_audit?.safety?.pilot_planning_only, true);
    assert.equal(packet.pilot_launch_claim_audit?.safety?.uses_public_links_only, true);
    assert.equal(packet.pilot_launch_claim_audit?.safety?.links_to_protected_surfaces, false);
    assert.equal(packet.pilot_launch_claim_audit?.safety?.claims_live_results, false);
    assert.equal(packet.pilot_launch_claim_audit?.safety?.claims_market_ready, false);
    assert.equal(packet.pilot_launch_claim_audit?.safety?.claims_customer_roi, false);
    assert.equal(packet.pilot_launch_claim_audit?.safety?.claims_guaranteed_lift, false);
    assert.equal(packet.pilot_launch_claim_audit?.safety?.requires_market_gate_before_live_claims, true);
    assert.ok(packet.pilot_launch_claim_audit?.evidence_required?.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.pilot_launch_claim_audit?.blocked_claims?.some((item) => /market-ready launch clearance/i.test(item)));
    assert.equal(packet.public_safety?.uses_public_links_only, true);
    assert.equal(packet.public_safety?.links_to_protected_surfaces, false);
    assert.equal(packet.public_safety?.buyer_routing_only, true);
    assert.equal(packet.public_safety?.pilot_planning_only, true);
    assert.equal(packet.public_safety?.claims_market_ready, false);
    assert.equal(packet.public_safety?.claims_customer_roi, false);
    assert.equal(packet.public_safety?.claims_guaranteed_lift, false);
    assert.equal(packet.public_safety?.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    const markdown = await request("/api/v1/pilot-launch?format=markdown");
    assert.equal(markdown.status, 200);
    const markdownText = await markdown.text();
    assert.match(markdownText, /# Deal Threads Pilot Launch Hub/);
    assert.match(markdownText, /Stakeholder Paths/);
    assert.match(markdownText, /## Launch Readiness Checklist/);
    assert.match(markdownText, /## Pilot Launch Claim Audit/);
    assert.match(markdownText, /Read-only GET: yes/);
    assert.match(markdownText, /Runs paid enrichment: no/);
    assert.match(markdownText, /Claims market ready: no/);
    assert.match(markdownText, /Evidence market_gate_clearance: required/);
    assert.match(markdownText, /Blocked claim: Do not present the public launch hub as market-ready launch clearance/);
    assert.doesNotMatch(markdownText, /\/crm\//);
    assert.doesNotMatch(markdownText, /\/admin/);
    return {
      public: true,
      stakeholder_paths: packet.stakeholder_paths.length,
      launch_steps: packet.launch_sequence.length,
      contains_claim_audit: true,
      exposes_operator_forms: false,
      runs_paid_enrichment: false
    };
  });

  await check("public first-five beta invite", async () => {
    const res = await request("/first-five-beta");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads first-five beta invite/);
    assert.match(html, /First-five beta invite/);
    assert.match(html, /replace one mid-market B2B contact form/i);
    assert.match(html, /Slots remaining/);
    assert.match(html, /Best fit/);
    assert.match(html, /Pilot scope/);
    assert.match(html, /Client-domain install proof/);
    assert.match(html, /Request beta pilot/);
    assert.match(html, /crm-profile-preview\.png/);
    assert.match(html, /no paid enrichment/i);
    assert.match(html, /no live-proof claims/i);
    assert.match(html, /Cohort forwarding checklist/);
    assert.match(html, /First-five claim audit/);
    assert.match(html, /Beta invite only/);
    assert.match(html, /Claims live results: no/);
    assert.match(html, /Claims market ready: no/);
    assert.match(html, /Claims customer ROI: no/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /Requires market gate before live claims: yes/);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    assert.doesNotMatch(html, /\/api\/v1/);
    const packet = await json("/api/v1/first-five-beta");
    assert.equal(packet.type, "deal_threads.public_first_five_beta_invite.v1");
    assert.equal(packet.cohort_snapshot?.target_beta_clients, 5);
    assert.equal(packet.cohort_snapshot?.public_account_names_exposed, false);
    assert.ok(packet.best_fit_criteria?.length >= 5);
    assert.ok(packet.pilot_scope?.some((item) => /Providerless enrichment/i.test(item)));
    assert.ok(packet.proof_sequence?.some((item) => item.key === "client_domain_install"));
    assert.ok(packet.buyer_ctas?.some((item) => /Request beta pilot/i.test(item.label)));
    assert.equal(packet.public_safety.read_only_get, true);
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.reveals_target_accounts, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.creates_beta_client, false);
    assert.equal(packet.public_safety.sends_external_email, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.runs_paid_enrichment, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.cohort_forwarding_checklist?.type, "deal_threads.public_first_five_beta_forwarding_checklist.v1");
    assert.equal(packet.cohort_forwarding_checklist?.public_links_only, true);
    assert.equal(packet.cohort_forwarding_checklist?.exposes_target_accounts, false);
    assert.equal(packet.cohort_forwarding_checklist?.requires_market_gate_before_live_claims, true);
    assert.ok(packet.cohort_forwarding_checklist?.required_public_links?.includes("pilot_close_kit"));
    assert.ok(packet.cohort_forwarding_checklist?.required_steps?.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(packet.first_five_claim_audit?.type, "deal_threads.public_first_five_beta_claim_audit.v1");
    assert.equal(packet.first_five_claim_audit?.claim_scope, "beta_invite_only");
    assert.equal(packet.first_five_claim_audit?.safety?.beta_invite_only, true);
    assert.equal(packet.first_five_claim_audit?.safety?.pilot_planning_only, true);
    assert.equal(packet.first_five_claim_audit?.safety?.uses_public_links_only, true);
    assert.equal(packet.first_five_claim_audit?.safety?.links_to_protected_surfaces, false);
    assert.equal(packet.first_five_claim_audit?.safety?.reveals_target_accounts, false);
    assert.equal(packet.first_five_claim_audit?.safety?.claims_live_results, false);
    assert.equal(packet.first_five_claim_audit?.safety?.claims_market_ready, false);
    assert.equal(packet.first_five_claim_audit?.safety?.claims_customer_roi, false);
    assert.equal(packet.first_five_claim_audit?.safety?.claims_guaranteed_lift, false);
    assert.equal(packet.first_five_claim_audit?.safety?.requires_market_gate_before_live_claims, true);
    assert.ok(packet.first_five_claim_audit?.evidence_required?.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.first_five_claim_audit?.blocked_claims?.some((item) => /first-five beta slots as live customer proof/i.test(item)));
    assert.equal(packet.public_safety.uses_public_links_only, true);
    assert.equal(packet.public_safety.links_to_protected_surfaces, false);
    assert.equal(packet.public_safety.beta_invite_only, true);
    assert.equal(packet.public_safety.pilot_planning_only, true);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.claims_guaranteed_lift, false);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    const markdown = await request("/api/v1/first-five-beta?format=markdown");
    assert.equal(markdown.status, 200);
    const markdownText = await markdown.text();
    assert.match(markdownText, /# Deal Threads First-Five Beta Invite/);
    assert.match(markdownText, /## Proof Sequence/);
    assert.match(markdownText, /Client-domain install proof/);
    assert.match(markdownText, /## Cohort Forwarding Checklist/);
    assert.match(markdownText, /## First-Five Claim Audit/);
    assert.match(markdownText, /Runs paid enrichment: no/);
    assert.match(markdownText, /Claims live proof: no/);
    assert.match(markdownText, /Claims market ready: no/);
    assert.match(markdownText, /Evidence market_gate_clearance: required/);
    assert.match(markdownText, /Blocked claim: Do not present first-five beta slots as live customer proof/);
    assert.doesNotMatch(markdownText, /\/crm\//);
    assert.doesNotMatch(markdownText, /\/admin/);
    return {
      public: true,
      target_beta_clients: packet.cohort_snapshot.target_beta_clients,
      remaining_beta_slots: packet.cohort_snapshot.remaining_beta_slots,
      proof_steps: packet.proof_sequence.length,
      contains_claim_audit: true,
      exposes_operator_forms: false,
      runs_paid_enrichment: false,
      claims_live_proof: false
    };
  });

  await check("public webinar walkthrough", async () => {
    const res = await request("/webinar");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads webinar walkthrough/);
    assert.match(html, /AI-powered lead enrichment webinar/);
    assert.match(html, /Who should watch/);
    assert.match(html, /Agenda/);
    assert.match(html, /Providerless strategy/);
    assert.match(html, /crm-profile-preview\.png/);
    assert.match(html, /Webinar follow-up checklist/);
    assert.match(html, /Webinar claim audit/);
    assert.match(html, /Buyer education only/);
    assert.match(html, /Claims live results: no/);
    assert.match(html, /Claims market ready: no/);
    assert.match(html, /Claims customer ROI: no/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /Requires market gate before live claims: yes/);
    assert.match(html, /no forms, no outbound sending/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    const packet = await json("/api/v1/webinar");
    assert.equal(packet.type, "deal_threads.public_webinar_packet.v1");
    assert.equal(packet.status, "webinar_ready");
    assert.equal(packet.format?.total_minutes, 30);
    assert.equal(packet.format?.default_paid_enrichment_spend_usd, 0);
    assert.ok(packet.agenda?.some((item) => /Providerless enrichment/i.test(item.segment)));
    assert.ok(packet.follow_up_ctas?.some((item) => /Request beta pilot/i.test(item.label)));
    assert.equal(packet.public_safety.read_only_get, true);
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.creates_beta_client, false);
    assert.equal(packet.public_safety.sends_external_email, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.runs_paid_enrichment, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.webinar_follow_up_checklist?.type, "deal_threads.public_webinar_follow_up_checklist.v1");
    assert.equal(packet.webinar_follow_up_checklist?.manual_send_only, true);
    assert.equal(packet.webinar_follow_up_checklist?.public_links_only, true);
    assert.equal(packet.webinar_follow_up_checklist?.requires_market_gate_before_live_claims, true);
    assert.ok(packet.webinar_follow_up_checklist?.required_public_links?.includes("first_five_beta"));
    assert.ok(packet.webinar_follow_up_checklist?.required_steps?.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(packet.webinar_claim_audit?.type, "deal_threads.public_webinar_claim_audit.v1");
    assert.equal(packet.webinar_claim_audit?.claim_scope, "buyer_education_only");
    assert.equal(packet.webinar_claim_audit?.safety?.buyer_education_only, true);
    assert.equal(packet.webinar_claim_audit?.safety?.draft_follow_up_only, true);
    assert.equal(packet.webinar_claim_audit?.safety?.uses_public_links_only, true);
    assert.equal(packet.webinar_claim_audit?.safety?.links_to_protected_surfaces, false);
    assert.equal(packet.webinar_claim_audit?.safety?.claims_live_results, false);
    assert.equal(packet.webinar_claim_audit?.safety?.claims_market_ready, false);
    assert.equal(packet.webinar_claim_audit?.safety?.claims_customer_roi, false);
    assert.equal(packet.webinar_claim_audit?.safety?.claims_guaranteed_lift, false);
    assert.equal(packet.webinar_claim_audit?.safety?.requires_market_gate_before_live_claims, true);
    assert.ok(packet.webinar_claim_audit?.evidence_required?.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.webinar_claim_audit?.blocked_claims?.some((item) => /live customer proof/i.test(item)));
    assert.equal(packet.public_safety.draft_follow_up_only, true);
    assert.equal(packet.public_safety.uses_public_links_only, true);
    assert.equal(packet.public_safety.links_to_protected_surfaces, false);
    assert.equal(packet.public_safety.buyer_education_only, true);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.claims_guaranteed_lift, false);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    const markdown = await request("/api/v1/webinar?format=markdown");
    assert.equal(markdown.status, 200);
    const markdownText = await markdown.text();
    assert.match(markdownText, /# Deal Threads Webinar Walkthrough/);
    assert.match(markdownText, /## Agenda/);
    assert.match(markdownText, /## Webinar Follow-Up Checklist/);
    assert.match(markdownText, /## Webinar Claim Audit/);
    assert.match(markdownText, /Runs paid enrichment: no/);
    assert.match(markdownText, /Claims live proof: no/);
    assert.match(markdownText, /Claims market ready: no/);
    assert.match(markdownText, /Evidence market_gate_clearance: required/);
    assert.match(markdownText, /Blocked claim: Do not present the webinar as live customer proof/);
    assert.doesNotMatch(markdownText, /\/crm\//);
    assert.doesNotMatch(markdownText, /\/admin/);
    return {
      public: true,
      minutes: packet.format.total_minutes,
      agenda_items: packet.agenda.length,
      contains_claim_audit: true,
      exposes_operator_forms: false,
      runs_paid_enrichment: false,
      claims_live_proof: false
    };
  });

  await check("public pricing", async () => {
    const res = await request("/pricing");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads pricing/);
    assert.match(html, /Pricing and packages/);
    assert.match(html, /\$2,500\/mo/);
    assert.match(html, /Advanced intelligence reports/);
    assert.match(html, /ICP gap marketing campaigns/);
    assert.match(html, /No paid enrichment provider calls by default/);
    assert.match(html, /Commercial terms checklist/);
    assert.match(html, /Pricing claim audit/);
    assert.match(html, /Budgetary offer ladder/);
    assert.match(html, /Collects payment: no/);
    assert.match(html, /Claims guaranteed ROI: no/);
    assert.match(html, /no forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    const packet = await json("/api/v1/pricing");
    assert.equal(packet.type, "deal_threads.public_pricing");
    assert.ok(packet.packages?.length >= 5);
    assert.equal(packet.commercial_terms_checklist?.type, "deal_threads.public_pricing_commercial_terms_checklist.v1");
    assert.equal(packet.commercial_terms_checklist?.collects_payment_on_public_page, false);
    assert.equal(packet.commercial_terms_checklist?.signed_agreement_required, true);
    assert.ok(packet.commercial_terms_checklist?.required_public_links?.includes("pilot_agreement"));
    assert.ok(packet.commercial_terms_checklist?.required_terms?.some((item) => /business-case model/i.test(item)));
    assert.equal(packet.pricing_claim_audit?.type, "deal_threads.public_pricing_claim_audit.v1");
    assert.equal(packet.pricing_claim_audit?.claim_scope, "budgetary_offer_ladder");
    assert.equal(packet.pricing_claim_audit?.safety?.budgetary_terms_only, true);
    assert.equal(packet.pricing_claim_audit?.safety?.binding_order_form, false);
    assert.equal(packet.pricing_claim_audit?.safety?.collects_payment, false);
    assert.equal(packet.pricing_claim_audit?.safety?.charges_buyer, false);
    assert.equal(packet.pricing_claim_audit?.safety?.runs_paid_lookup, false);
    assert.equal(packet.pricing_claim_audit?.safety?.claims_guaranteed_payback, false);
    assert.equal(packet.pricing_claim_audit?.safety?.claims_guaranteed_roi, false);
    assert.equal(packet.pricing_claim_audit?.safety?.claims_live_results, false);
    assert.equal(packet.pricing_claim_audit?.safety?.claims_market_ready, false);
    assert.equal(packet.pricing_claim_audit?.safety?.requires_signed_pilot_agreement, true);
    assert.equal(packet.pricing_claim_audit?.safety?.requires_explicit_paid_enrichment_approval, true);
    assert.equal(packet.pricing_claim_audit?.safety?.requires_pilot_proof_before_outcome_claims, true);
    assert.equal(packet.pricing_claim_audit?.safety?.requires_market_gate_before_live_claims, true);
    assert.ok(packet.pricing_claim_audit?.evidence_required?.some((item) => item.key === "signed_pilot_agreement" && item.required));
    assert.ok(packet.pricing_claim_audit?.evidence_required?.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.pricing_claim_audit?.blocked_claims?.some((item) => /signed order form/i.test(item)));
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.budgetary_terms_only, true);
    assert.equal(packet.public_safety.binding_order_form, false);
    assert.equal(packet.public_safety.collects_payment, false);
    assert.equal(packet.public_safety.charges_buyer, false);
    assert.equal(packet.public_safety.runs_paid_lookup, false);
    assert.equal(packet.public_safety.claims_guaranteed_payback, false);
    assert.equal(packet.public_safety.claims_guaranteed_roi, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.requires_signed_pilot_agreement, true);
    assert.equal(packet.public_safety.requires_explicit_paid_enrichment_approval, true);
    assert.equal(packet.public_safety.requires_pilot_proof_before_outcome_claims, true);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    const markdown = await request("/api/v1/pricing?format=markdown");
    assert.equal(markdown.status, 200);
    const markdownText = await markdown.text();
    assert.match(markdownText, /# Deal Threads Pricing And Packages/);
    assert.match(markdownText, /## Commercial Terms Checklist/);
    assert.match(markdownText, /## Pricing Claim Audit/);
    assert.match(markdownText, /Collects payment: no/);
    assert.match(markdownText, /Claims guaranteed ROI: no/);
    assert.match(markdownText, /Evidence signed_pilot_agreement: required/);
    assert.match(markdownText, /Evidence market_gate_clearance: required/);
    assert.match(markdownText, /Blocked claim: Do not present this public pricing page as a signed order form/);
    return {
      public: true,
      packages: packet.packages.length,
      exposes_operator_forms: false,
      transmits_external_data: false
    };
  });

  await check("public sales enablement", async () => {
    const res = await request("/sales-enablement");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads sales enablement/);
    assert.match(html, /Sales enablement packet/);
    assert.match(html, /Outbound email sequence/);
    assert.match(html, /Objection responses/);
    assert.match(html, /Turn mid-market interest into confirmed beta installs/);
    assert.match(html, /Forwarding checklist/);
    assert.match(html, /Sales copy audit/);
    assert.match(html, /Buyer-safe outreach draft/);
    assert.match(html, /Sends email: no/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /no forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    const packet = await json("/api/v1/sales-enablement");
    assert.equal(packet.type, "deal_threads.public_sales_enablement");
    assert.ok(packet.target_segments?.length >= 4);
    assert.ok(packet.email_sequence?.length >= 4);
    assert.ok(packet.objection_responses?.some((item) => /paid enrichment/i.test(`${item.objection} ${item.response}`)));
    assert.equal(packet.forwarding_checklist?.type, "deal_threads.public_sales_enablement_forwarding_checklist.v1");
    assert.equal(packet.forwarding_checklist?.manual_send_only, true);
    assert.equal(packet.forwarding_checklist?.sends_from_public_page, false);
    assert.ok(packet.forwarding_checklist?.required_public_links?.includes("security_center"));
    assert.ok(packet.forwarding_checklist?.required_steps?.some((item) => /public buyer links/i.test(item)));
    assert.equal(packet.sales_copy_audit?.type, "deal_threads.public_sales_enablement_copy_audit.v1");
    assert.equal(packet.sales_copy_audit?.claim_scope, "pilot_outreach_only");
    assert.equal(packet.sales_copy_audit?.safety?.sends_email, false);
    assert.equal(packet.sales_copy_audit?.safety?.automates_outreach, false);
    assert.equal(packet.sales_copy_audit?.safety?.draft_copy_only, true);
    assert.equal(packet.sales_copy_audit?.safety?.uses_public_links_only, true);
    assert.equal(packet.sales_copy_audit?.safety?.links_to_protected_surfaces, false);
    assert.equal(packet.sales_copy_audit?.safety?.claims_guaranteed_lift, false);
    assert.equal(packet.sales_copy_audit?.safety?.claims_customer_roi, false);
    assert.equal(packet.sales_copy_audit?.safety?.claims_live_results, false);
    assert.equal(packet.sales_copy_audit?.safety?.claims_market_ready, false);
    assert.equal(packet.sales_copy_audit?.safety?.requires_human_review_before_send, true);
    assert.equal(packet.sales_copy_audit?.safety?.requires_pilot_proof_before_results_claims, true);
    assert.equal(packet.sales_copy_audit?.safety?.requires_market_gate_before_live_claims, true);
    assert.ok(packet.sales_copy_audit?.evidence_required?.some((item) => item.key === "human_review_before_send" && item.required));
    assert.ok(packet.sales_copy_audit?.evidence_required?.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.sales_copy_audit?.blocked_claims?.some((item) => /guaranteed speed-to-lead/i.test(item)));
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.sends_email, false);
    assert.equal(packet.public_safety.automates_outreach, false);
    assert.equal(packet.public_safety.draft_copy_only, true);
    assert.equal(packet.public_safety.uses_public_links_only, true);
    assert.equal(packet.public_safety.links_to_protected_surfaces, false);
    assert.equal(packet.public_safety.claims_guaranteed_lift, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.requires_human_review_before_send, true);
    assert.equal(packet.public_safety.requires_pilot_proof_before_results_claims, true);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    const markdown = await request("/api/v1/sales-enablement?format=markdown");
    assert.equal(markdown.status, 200);
    const markdownText = await markdown.text();
    assert.match(markdownText, /# Deal Threads Sales Enablement Packet/);
    assert.match(markdownText, /## Forwarding Checklist/);
    assert.match(markdownText, /## Sales Copy Audit/);
    assert.match(markdownText, /Sends email: no/);
    assert.match(markdownText, /Claims guaranteed lift: no/);
    assert.match(markdownText, /Evidence human_review_before_send: required/);
    assert.match(markdownText, /Evidence market_gate_clearance: required/);
    assert.match(markdownText, /Blocked claim: Do not claim guaranteed speed-to-lead/);
    return {
      public: true,
      target_segments: packet.target_segments.length,
      email_steps: packet.email_sequence.length,
      exposes_operator_forms: false,
      transmits_external_data: false
    };
  });

  await check("public providerless enrichment", async () => {
    const res = await request("/providerless-enrichment");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads providerless enrichment/);
    assert.match(html, /Providerless enrichment strategy/);
    assert.match(html, /Build the buyer profile before buying the data/);
    assert.match(html, /Why not paid first/);
    assert.match(html, /Build-vs-buy rules/);
    assert.match(html, /Paid escalation policy/);
    assert.match(html, /no forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    const packet = await json("/api/v1/providerless-enrichment");
    assert.equal(packet.type, "deal_threads.public_providerless_enrichment");
    assert.equal(packet.status, "providerless_enrichment_ready");
    assert.match(packet.answer, /providerlessly first/i);
    assert.ok(packet.internal_source_stack?.includes("Visitor-declared buying context from the chat"));
    assert.ok(packet.internal_source_stack?.includes("Public-site role and contact cues from team, about, contact, and leadership pages"));
    assert.ok(packet.build_vs_buy_rules?.some((item) => /Tech stack/i.test(item.field)));
    assert.ok(packet.build_vs_buy_rules?.some((item) => /Conversion surface/i.test(item.field)));
    assert.equal(packet.paid_escalation_policy.allowed_by_default, false);
    assert.equal(packet.paid_escalation_policy.manual_approval_required, true);
    assert.equal(packet.paid_escalation_policy.recommended_paid_lookups_now, 0);
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.runs_paid_lookup, false);
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    const markdown = await request("/api/v1/providerless-enrichment?format=markdown");
    assert.equal(markdown.status, 200);
    const markdownText = await markdown.text();
    assert.match(markdownText, /# Deal Threads Providerless Enrichment/);
    assert.match(markdownText, /## Build-Vs-Buy Rules/);
    assert.match(markdownText, /Recommended paid lookups now: 0/);
    assert.doesNotMatch(markdownText, /\/crm\//);
    assert.doesNotMatch(markdownText, /\/admin/);
    return {
      public: true,
      build_vs_buy_rules: packet.build_vs_buy_rules.length,
      paid_lookups_recommended_now: packet.paid_escalation_policy.recommended_paid_lookups_now,
      transmits_external_data: false
    };
  });

  await check("public comparison guide", async () => {
    const res = await request("/compare");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads comparison guide/);
    assert.match(html, /Comparison guide/);
    assert.match(html, /Plain contact form/);
    assert.match(html, /Generic chatbot/);
    assert.match(html, /Paid enrichment provider/);
    assert.match(html, /Build it ourselves/);
    assert.match(html, /Decision fit matrix/);
    assert.match(html, /Comparison claim audit/);
    assert.match(html, /Category positioning only/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /no protected CRM profile links/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    const packet = await json("/api/v1/compare");
    assert.equal(packet.type, "deal_threads.public_comparison");
    assert.ok(packet.categories?.length >= 6);
    assert.ok(packet.categories?.some((item) => /Paid enrichment provider/i.test(item.category)));
    assert.ok(packet.proof_questions?.some((item) => /first-touch speed/i.test(item)));
    assert.ok(packet.decision_fit_matrix?.length >= 6);
    assert.ok(packet.decision_fit_matrix?.some((item) => /Build it ourselves/i.test(item.option)));
    assert.equal(packet.comparison_claim_audit?.type, "deal_threads.public_comparison_claim_audit.v1");
    assert.equal(packet.comparison_claim_audit?.claim_scope, "category_positioning_only");
    assert.equal(packet.comparison_claim_audit?.safety?.category_level_only, true);
    assert.equal(packet.comparison_claim_audit?.safety?.names_specific_competitors, false);
    assert.equal(packet.comparison_claim_audit?.safety?.claims_guaranteed_lift, false);
    assert.equal(packet.comparison_claim_audit?.safety?.claims_market_ready, false);
    assert.equal(packet.comparison_claim_audit?.safety?.claims_live_results, false);
    assert.equal(packet.comparison_claim_audit?.safety?.claims_customer_roi, false);
    assert.equal(packet.comparison_claim_audit?.safety?.requires_buyer_context_for_recommendation, true);
    assert.equal(packet.comparison_claim_audit?.safety?.requires_pilot_proof_before_outcome_claims, true);
    assert.equal(packet.comparison_claim_audit?.safety?.requires_market_gate_before_live_claims, true);
    assert.ok(packet.comparison_claim_audit?.evidence_required?.some((item) => item.key === "category_only_framing" && item.required));
    assert.ok(packet.comparison_claim_audit?.evidence_required?.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.comparison_claim_audit?.blocked_claims?.some((item) => /named vendor superiority/i.test(item)));
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.category_level_only, true);
    assert.equal(packet.public_safety.names_specific_competitors, false);
    assert.equal(packet.public_safety.claims_guaranteed_lift, false);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.requires_buyer_context_for_recommendation, true);
    assert.equal(packet.public_safety.requires_pilot_proof_before_outcome_claims, true);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    const markdown = await request("/api/v1/compare?format=markdown");
    assert.equal(markdown.status, 200);
    const markdownText = await markdown.text();
    assert.match(markdownText, /# Deal Threads Comparison Guide/);
    assert.match(markdownText, /## Decision Fit Matrix/);
    assert.match(markdownText, /## Comparison Claim Audit/);
    assert.match(markdownText, /Claims guaranteed lift: no/);
    assert.match(markdownText, /Evidence category_only_framing: required/);
    assert.match(markdownText, /Evidence market_gate_clearance: required/);
    assert.match(markdownText, /Blocked claim: Do not claim named vendor superiority/);
    return {
      public: true,
      categories: packet.categories.length,
      exposes_operator_forms: false,
      transmits_external_data: false
    };
  });

  await check("public proof preview", async () => {
    const res = await request("/proof-preview");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads proof preview/);
    assert.match(html, /Proof preview/);
    assert.match(html, /14-day pilot proof packet/);
    assert.match(html, /Install proof/);
    assert.match(html, /Rep usefulness/);
    assert.match(html, /Providerless enrichment/);
    assert.match(html, /Synthetic example only/);
    assert.match(html, /Proof claim audit/);
    assert.match(html, /Claim scope: Synthetic template only/);
    assert.match(html, /Claims live results: no/);
    assert.match(html, /Requires market gate before live claims: yes/);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    const packet = await json("/api/v1/proof-preview");
    assert.equal(packet.type, "deal_threads.public_proof_preview");
    assert.equal(packet.claim_audit?.type, "deal_threads.public_proof_preview_claim_audit.v1");
    assert.equal(packet.claim_audit?.claim_scope, "synthetic_template_only");
    assert.equal(packet.claim_audit?.sample_metric_count, packet.sample_metrics?.length);
    assert.equal(packet.claim_audit?.safety?.uses_synthetic_data_only, true);
    assert.equal(packet.claim_audit?.safety?.claims_live_results, false);
    assert.equal(packet.claim_audit?.safety?.claims_market_ready, false);
    assert.equal(packet.claim_audit?.safety?.claims_customer_roi, false);
    assert.equal(packet.claim_audit?.safety?.claims_conversion_lift, false);
    assert.equal(packet.claim_audit?.safety?.links_to_protected_surfaces, false);
    assert.equal(packet.claim_audit?.safety?.requires_market_gate_before_live_claims, true);
    assert.ok(packet.claim_audit?.evidence_required?.some((item) => item.key === "synthetic_sample_notice" && item.required));
    assert.ok(packet.claim_audit?.evidence_required?.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.claim_audit?.blocked_claims?.some((item) => /observed customer results/i.test(item)));
    assert.ok(packet.sample_metrics?.length >= 6);
    assert.ok(packet.interpretation_rules?.some((item) => /Continue/i.test(item)));
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.uses_synthetic_data_only, true);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    const markdown = await request("/api/v1/proof-preview?format=markdown");
    assert.equal(markdown.status, 200);
    const markdownText = await markdown.text();
    assert.match(markdownText, /# Deal Threads Proof Preview/);
    assert.match(markdownText, /## Public Claim Audit/);
    assert.match(markdownText, /Claim scope: Synthetic template only/);
    assert.match(markdownText, /Claims live results: no/);
    assert.match(markdownText, /Claims market ready: no/);
    assert.match(markdownText, /Evidence synthetic_sample_notice: required/);
    assert.match(markdownText, /Evidence market_gate_clearance: required/);
    assert.match(markdownText, /Blocked claim: Do not present sample metrics as observed customer results/);
    return {
      public: true,
      sample_metrics: packet.sample_metrics.length,
      claims_live_results: false,
      transmits_external_data: false
    };
  });

  await check("public pilot agreement", async () => {
    const res = await request("/pilot-agreement");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads pilot agreement/);
    assert.match(html, /14-day private beta order packet/);
    assert.match(html, /\$2,500\/month/);
    assert.match(html, /Buyer responsibilities/);
    assert.match(html, /Deal Threads responsibilities/);
    assert.match(html, /Success criteria/);
    assert.match(html, /Data and security posture/);
    assert.match(html, /No paid enrichment provider calls by default/);
    assert.match(html, /Commercial review checklist/);
    assert.match(html, /Agreement claim audit/);
    assert.match(html, /Commercial review only/);
    assert.match(html, /Captures signature: no/);
    assert.match(html, /Collects payment: no/);
    assert.match(html, /Binding acceptance surface: no/);
    assert.match(html, /Claims live results: no/);
    assert.match(html, /Claims market ready: no/);
    assert.match(html, /Claims customer ROI: no/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /Requires tokenized acceptance or order: yes/);
    assert.match(html, /Requires market gate before live claims: yes/);
    assert.match(html, /no operator forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    const packet = await json("/api/v1/pilot-agreement");
    assert.equal(packet.type, "deal_threads.public_pilot_agreement");
    assert.equal(packet.commercial_review_checklist.type, "deal_threads.public_pilot_agreement_commercial_review_checklist.v1");
    assert.equal(packet.commercial_review_checklist.captures_signature_on_public_page, false);
    assert.equal(packet.commercial_review_checklist.collects_payment_on_public_page, false);
    assert.equal(packet.commercial_review_checklist.public_links_only, true);
    assert.equal(packet.commercial_review_checklist.requires_buyer_owner_confirmation, true);
    assert.equal(packet.commercial_review_checklist.requires_tokenized_acceptance_or_order, true);
    assert.equal(packet.commercial_review_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(packet.commercial_review_checklist.required_public_links.includes("security_center"));
    assert.ok(packet.commercial_review_checklist.required_steps?.some((item) => /tokenized pilot acceptance/i.test(item)));
    assert.equal(packet.agreement_claim_audit.type, "deal_threads.public_pilot_agreement_claim_audit.v1");
    assert.equal(packet.agreement_claim_audit.claim_scope, "commercial_review_only");
    assert.equal(packet.agreement_claim_audit.safety.commercial_review_only, true);
    assert.equal(packet.agreement_claim_audit.safety.binding_acceptance_surface, false);
    assert.equal(packet.agreement_claim_audit.safety.captures_signature, false);
    assert.equal(packet.agreement_claim_audit.safety.collects_payment, false);
    assert.equal(packet.agreement_claim_audit.safety.charges_buyer, false);
    assert.equal(packet.agreement_claim_audit.safety.creates_beta_client, false);
    assert.equal(packet.agreement_claim_audit.safety.mutates_buyer_state, false);
    assert.equal(packet.agreement_claim_audit.safety.transmits_external_data, false);
    assert.equal(packet.agreement_claim_audit.safety.sends_email, false);
    assert.equal(packet.agreement_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(packet.agreement_claim_audit.safety.uses_public_links_only, true);
    assert.equal(packet.agreement_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(packet.agreement_claim_audit.safety.claims_live_results, false);
    assert.equal(packet.agreement_claim_audit.safety.claims_market_ready, false);
    assert.equal(packet.agreement_claim_audit.safety.claims_customer_roi, false);
    assert.equal(packet.agreement_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(packet.agreement_claim_audit.safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(packet.agreement_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(packet.agreement_claim_audit.evidence_required.some((item) => item.key === "tokenized_pilot_acceptance_or_order" && item.required));
    assert.ok(packet.agreement_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.agreement_claim_audit.blocked_claims.some((item) => /signed order form/i.test(item)));
    assert.equal(packet.public_safety.read_only_get, true);
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.exposes_tenant_exports, false);
    assert.equal(packet.public_safety.commercial_review_only, true);
    assert.equal(packet.public_safety.binding_acceptance_surface, false);
    assert.equal(packet.public_safety.captures_signature, false);
    assert.equal(packet.public_safety.collects_payment, false);
    assert.equal(packet.public_safety.charges_buyer, false);
    assert.equal(packet.public_safety.creates_beta_client, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.sends_email, false);
    assert.equal(packet.public_safety.runs_paid_lookup, false);
    assert.equal(packet.public_safety.uses_public_links_only, true);
    assert.equal(packet.public_safety.links_to_protected_surfaces, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.claims_guaranteed_lift, false);
    assert.equal(packet.public_safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    const markdown = await request("/api/v1/pilot-agreement?format=markdown");
    assert.equal(markdown.status, 200);
    const markdownText = await markdown.text();
    assert.match(markdownText, /# Deal Threads pilot agreement/);
    assert.match(markdownText, /## Commercial Review Checklist/);
    assert.match(markdownText, /## Agreement Claim Audit/);
    assert.match(markdownText, /Captures signature: no/);
    assert.match(markdownText, /Collects payment: no/);
    assert.match(markdownText, /Claims market ready: no/);
    assert.match(markdownText, /Evidence tokenized_pilot_acceptance_or_order: required/);
    assert.match(markdownText, /Evidence market_gate_clearance: required/);
    assert.match(markdownText, /Blocked claim: Do not present this public pilot agreement page as a signed order form/);
    assert.doesNotMatch(markdownText, /\/crm\//);
    assert.doesNotMatch(markdownText, /\/admin/);
    return {
      public: true,
      contains_terms: true,
      contains_success_criteria: true,
      exposes_operator_forms: false,
      contains_claim_audit: true
    };
  });

  await check("public implementation guide", async () => {
    const res = await request("/implementation-guide");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads implementation guide/);
    assert.match(html, /Implementation-owner guide/);
    assert.match(html, /Acceptance criteria/);
    assert.match(html, /Rollback plan/);
    assert.match(html, /source check/i);
    assert.match(html, /no operator forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    assert.doesNotMatch(html, /tenant-data/);
    const guide = await json("/api/v1/implementation-guide");
    assert.equal(guide.type, "deal_threads.public_implementation_guide");
    assert.equal(guide.public_safety.exposes_operator_forms, false);
    assert.equal(guide.public_safety.exposes_crm_profiles, false);
    assert.equal(guide.public_safety.transmits_external_data, false);
    assert.ok(guide.implementation_steps?.length >= 8);
    assert.ok(guide.acceptance_criteria?.some((item) => /beta-attributed test profile/i.test(item)));
    assert.equal(JSON.stringify(guide).includes("/crm/"), false);
    assert.equal(JSON.stringify(guide).includes("tenant-data"), false);
    const markdown = await request("/api/v1/implementation-guide?format=markdown");
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    assert.match(text, /# Deal Threads Implementation Guide/);
    assert.match(text, /## Acceptance Criteria/);
    assert.doesNotMatch(text, /\/crm\//);
    assert.doesNotMatch(text, /tenant-data/);
    return {
      public: true,
      contains_install_steps: true,
      contains_rollback_plan: true,
      exposes_operator_forms: false,
      transmits_external_data: false
    };
  });

  await check("public CRM handoff guide", async () => {
    const res = await request("/crm-handoff-guide");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads CRM handoff guide/);
    assert.match(html, /CRM-owner handoff guide/);
    assert.match(html, /Manual CRM export/);
    assert.match(html, /Synthetic webhook acceptance/);
    assert.match(html, /Live go gates/);
    assert.match(html, /no operator forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    assert.doesNotMatch(html, /tenant-data/);
    const guide = await json("/api/v1/crm-handoff-guide");
    assert.equal(guide.type, "deal_threads.public_crm_handoff_guide");
    assert.equal(guide.public_safety.exposes_operator_forms, false);
    assert.equal(guide.public_safety.exposes_crm_profiles, false);
    assert.equal(guide.public_safety.transmits_external_data, false);
    assert.ok(guide.handoff_options?.some((item) => item.option === "Synthetic webhook test"));
    assert.ok(guide.field_groups?.some((item) => item.group === "Rep handoff"));
    assert.equal(JSON.stringify(guide).includes("/crm/"), false);
    assert.equal(JSON.stringify(guide).includes("tenant-data"), false);
    const markdown = await request("/api/v1/crm-handoff-guide?format=markdown");
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    assert.match(text, /# Deal Threads CRM Handoff Guide/);
    assert.match(text, /## Synthetic Webhook Acceptance/);
    assert.doesNotMatch(text, /\/crm\//);
    assert.doesNotMatch(text, /tenant-data/);
    return {
      public: true,
      contains_synthetic_webhook_policy: true,
      exposes_operator_forms: false,
      transmits_external_data: false
    };
  });

  await check("public pilot approval room", async () => {
    const res = await request("/pilot-approval-room");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads pilot approval room/);
    assert.match(html, /Mid-market buying committee room/);
    assert.match(html, /Approval checklist/);
    assert.match(html, /Launch sequence/);
    assert.match(html, /Approval routing checklist/);
    assert.match(html, /Approval claim audit/);
    assert.match(html, /Buying committee routing only/);
    assert.match(html, /Captures signature: no/);
    assert.match(html, /Collects payment: no/);
    assert.match(html, /Binding acceptance surface: no/);
    assert.match(html, /Claims live results: no/);
    assert.match(html, /Claims market ready: no/);
    assert.match(html, /Claims customer ROI: no/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /Requires tokenized acceptance or order: yes/);
    assert.match(html, /Requires market gate before live claims: yes/);
    assert.match(html, /no operator forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    assert.doesNotMatch(html, /tenant-data/);
    const packet = await json("/api/v1/pilot-approval-room");
    assert.equal(packet.type, "deal_threads.public_pilot_approval_room");
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.exposes_tenant_exports, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.approval_routing_checklist.type, "deal_threads.public_pilot_approval_room_routing_checklist.v1");
    assert.equal(packet.approval_routing_checklist.public_links_only, true);
    assert.equal(packet.approval_routing_checklist.stakeholder_routing_only, true);
    assert.equal(packet.approval_routing_checklist.captures_signature_on_public_page, false);
    assert.equal(packet.approval_routing_checklist.collects_payment_on_public_page, false);
    assert.equal(packet.approval_routing_checklist.requires_buyer_confirmation_before_install, true);
    assert.equal(packet.approval_routing_checklist.requires_tokenized_acceptance_or_order, true);
    assert.equal(packet.approval_routing_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(packet.approval_routing_checklist.required_public_links.includes("pilot_agreement"));
    assert.ok(packet.approval_routing_checklist.required_stakeholder_tracks.includes("Executive sponsor"));
    assert.ok(packet.approval_routing_checklist.required_steps?.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(packet.approval_claim_audit.type, "deal_threads.public_pilot_approval_room_claim_audit.v1");
    assert.equal(packet.approval_claim_audit.claim_scope, "buying_committee_routing_only");
    assert.equal(packet.approval_claim_audit.safety.stakeholder_routing_only, true);
    assert.equal(packet.approval_claim_audit.safety.pilot_planning_only, true);
    assert.equal(packet.approval_claim_audit.safety.binding_acceptance_surface, false);
    assert.equal(packet.approval_claim_audit.safety.captures_signature, false);
    assert.equal(packet.approval_claim_audit.safety.collects_payment, false);
    assert.equal(packet.approval_claim_audit.safety.charges_buyer, false);
    assert.equal(packet.approval_claim_audit.safety.creates_beta_client, false);
    assert.equal(packet.approval_claim_audit.safety.mutates_buyer_state, false);
    assert.equal(packet.approval_claim_audit.safety.transmits_external_data, false);
    assert.equal(packet.approval_claim_audit.safety.sends_email, false);
    assert.equal(packet.approval_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(packet.approval_claim_audit.safety.uses_public_links_only, true);
    assert.equal(packet.approval_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(packet.approval_claim_audit.safety.claims_live_results, false);
    assert.equal(packet.approval_claim_audit.safety.claims_market_ready, false);
    assert.equal(packet.approval_claim_audit.safety.claims_customer_roi, false);
    assert.equal(packet.approval_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(packet.approval_claim_audit.safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(packet.approval_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(packet.approval_claim_audit.evidence_required.some((item) => item.key === "tokenized_pilot_acceptance_or_order" && item.required));
    assert.ok(packet.approval_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.approval_claim_audit.blocked_claims.some((item) => /signed order form/i.test(item)));
    assert.equal(packet.public_safety.read_only_get, true);
    assert.equal(packet.public_safety.stakeholder_routing_only, true);
    assert.equal(packet.public_safety.pilot_planning_only, true);
    assert.equal(packet.public_safety.binding_acceptance_surface, false);
    assert.equal(packet.public_safety.captures_signature, false);
    assert.equal(packet.public_safety.collects_payment, false);
    assert.equal(packet.public_safety.charges_buyer, false);
    assert.equal(packet.public_safety.creates_beta_client, false);
    assert.equal(packet.public_safety.sends_email, false);
    assert.equal(packet.public_safety.runs_paid_lookup, false);
    assert.equal(packet.public_safety.uses_public_links_only, true);
    assert.equal(packet.public_safety.links_to_protected_surfaces, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.claims_guaranteed_lift, false);
    assert.equal(packet.public_safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.ok(packet.stakeholder_tracks?.length >= 5);
    assert.ok(packet.approval_checklist?.some((item) => /no paid enrichment/i.test(item)));
    assert.ok(packet.launch_sequence?.some((item) => /source-check/i.test(item)));
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    assert.equal(JSON.stringify(packet).includes("tenant-data"), false);
    const markdown = await request("/api/v1/pilot-approval-room?format=markdown");
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    assert.match(text, /# Deal Threads Pilot Approval Room/);
    assert.match(text, /## Approval Checklist/);
    assert.match(text, /## Launch Sequence/);
    assert.match(text, /## Approval Routing Checklist/);
    assert.match(text, /## Approval Claim Audit/);
    assert.match(text, /Stakeholder routing only: yes/);
    assert.match(text, /Captures signature: no/);
    assert.match(text, /Collects payment: no/);
    assert.match(text, /Claims market ready: no/);
    assert.match(text, /Evidence tokenized_pilot_acceptance_or_order: required/);
    assert.match(text, /Evidence market_gate_clearance: required/);
    assert.match(text, /Blocked claim: Do not present this public approval room as a signed order form/);
    assert.doesNotMatch(text, /\/crm\//);
    assert.doesNotMatch(text, /\/admin/);
    assert.doesNotMatch(text, /tenant-data/);
    return {
      public: true,
      contains_stakeholder_tracks: true,
      contains_approval_checklist: true,
      exposes_operator_forms: false,
      transmits_external_data: false,
      contains_claim_audit: true
    };
  });

  await check("public mutual action plan", async () => {
    const res = await request("/mutual-action-plan");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads mutual action plan/);
    assert.match(html, /14-day mutual action plan/);
    assert.match(html, /Buyer inputs/);
    assert.match(html, /Proof targets/);
    assert.match(html, /Risk controls/);
    assert.match(html, /Execution checklist/);
    assert.match(html, /MAP claim audit/);
    assert.match(html, /Pilot timeline planning only/);
    assert.match(html, /Timeline planning only: yes/);
    assert.match(html, /Captures signature: no/);
    assert.match(html, /Collects payment: no/);
    assert.match(html, /Claims completed milestones: no/);
    assert.match(html, /Claims market ready: no/);
    assert.match(html, /Claims customer ROI: no/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /Requires tokenized acceptance or order: yes/);
    assert.match(html, /Requires market gate before live claims: yes/);
    assert.match(html, /no operator forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    assert.doesNotMatch(html, /tenant-data/);
    const packet = await json("/api/v1/mutual-action-plan");
    assert.equal(packet.type, "deal_threads.public_mutual_action_plan");
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.exposes_tenant_exports, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.execution_checklist.type, "deal_threads.public_mutual_action_plan_execution_checklist.v1");
    assert.equal(packet.execution_checklist.public_links_only, true);
    assert.equal(packet.execution_checklist.timeline_planning_only, true);
    assert.equal(packet.execution_checklist.captures_signature_on_public_page, false);
    assert.equal(packet.execution_checklist.collects_payment_on_public_page, false);
    assert.equal(packet.execution_checklist.requires_buyer_confirmation_before_install, true);
    assert.equal(packet.execution_checklist.requires_tokenized_acceptance_or_order, true);
    assert.equal(packet.execution_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(packet.execution_checklist.required_public_links.includes("pilot_approval_room"));
    assert.ok(packet.execution_checklist.required_milestones.includes("Proof review"));
    assert.ok(packet.execution_checklist.required_steps?.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(packet.map_claim_audit.type, "deal_threads.public_mutual_action_plan_claim_audit.v1");
    assert.equal(packet.map_claim_audit.claim_scope, "pilot_timeline_planning_only");
    assert.equal(packet.map_claim_audit.safety.timeline_planning_only, true);
    assert.equal(packet.map_claim_audit.safety.pilot_planning_only, true);
    assert.equal(packet.map_claim_audit.safety.binding_acceptance_surface, false);
    assert.equal(packet.map_claim_audit.safety.captures_signature, false);
    assert.equal(packet.map_claim_audit.safety.collects_payment, false);
    assert.equal(packet.map_claim_audit.safety.charges_buyer, false);
    assert.equal(packet.map_claim_audit.safety.creates_beta_client, false);
    assert.equal(packet.map_claim_audit.safety.mutates_buyer_state, false);
    assert.equal(packet.map_claim_audit.safety.transmits_external_data, false);
    assert.equal(packet.map_claim_audit.safety.sends_email, false);
    assert.equal(packet.map_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(packet.map_claim_audit.safety.uses_public_links_only, true);
    assert.equal(packet.map_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(packet.map_claim_audit.safety.claims_live_results, false);
    assert.equal(packet.map_claim_audit.safety.claims_market_ready, false);
    assert.equal(packet.map_claim_audit.safety.claims_customer_roi, false);
    assert.equal(packet.map_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(packet.map_claim_audit.safety.claims_completed_milestones, false);
    assert.equal(packet.map_claim_audit.safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(packet.map_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(packet.map_claim_audit.evidence_required.some((item) => item.key === "tokenized_pilot_acceptance_or_order" && item.required));
    assert.ok(packet.map_claim_audit.evidence_required.some((item) => item.key === "proof_packet_review" && item.required));
    assert.ok(packet.map_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.map_claim_audit.blocked_claims.some((item) => /planned milestones are completed proof/i.test(item)));
    assert.equal(packet.public_safety.read_only_get, true);
    assert.equal(packet.public_safety.timeline_planning_only, true);
    assert.equal(packet.public_safety.pilot_planning_only, true);
    assert.equal(packet.public_safety.binding_acceptance_surface, false);
    assert.equal(packet.public_safety.captures_signature, false);
    assert.equal(packet.public_safety.collects_payment, false);
    assert.equal(packet.public_safety.charges_buyer, false);
    assert.equal(packet.public_safety.creates_beta_client, false);
    assert.equal(packet.public_safety.sends_email, false);
    assert.equal(packet.public_safety.runs_paid_lookup, false);
    assert.equal(packet.public_safety.uses_public_links_only, true);
    assert.equal(packet.public_safety.links_to_protected_surfaces, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.claims_guaranteed_lift, false);
    assert.equal(packet.public_safety.claims_completed_milestones, false);
    assert.equal(packet.public_safety.requires_tokenized_acceptance_or_order, true);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.ok(packet.milestones?.length >= 8);
    assert.ok(packet.buyer_inputs?.some((item) => /Implementation owner/i.test(item)));
    assert.ok(packet.proof_targets?.some((item) => /beta-attributed buyer profiles/i.test(item)));
    assert.ok(packet.risk_controls?.some((item) => /paid data calls require explicit approval/i.test(item)));
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    assert.equal(JSON.stringify(packet).includes("tenant-data"), false);
    const markdown = await request("/api/v1/mutual-action-plan?format=markdown");
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    assert.match(text, /# Deal Threads Mutual Action Plan/);
    assert.match(text, /## Milestones/);
    assert.match(text, /## Proof Targets/);
    assert.match(text, /## Execution Checklist/);
    assert.match(text, /## MAP Claim Audit/);
    assert.match(text, /Timeline planning only: yes/);
    assert.match(text, /Captures signature: no/);
    assert.match(text, /Collects payment: no/);
    assert.match(text, /Claims completed milestones: no/);
    assert.match(text, /Evidence proof_packet_review: required/);
    assert.match(text, /Evidence market_gate_clearance: required/);
    assert.match(text, /Blocked claim: Do not claim planned milestones are completed proof/);
    assert.doesNotMatch(text, /\/crm\//);
    assert.doesNotMatch(text, /\/admin/);
    assert.doesNotMatch(text, /tenant-data/);
    return {
      public: true,
      contains_timeline: true,
      contains_proof_targets: true,
      exposes_operator_forms: false,
      transmits_external_data: false,
      contains_claim_audit: true
    };
  });

  await check("public buyer confirmation guide", async () => {
    const res = await request("/buyer-confirmation-guide");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads buyer confirmation guide/);
    assert.match(html, /Gather the six details needed before the install handoff/);
    assert.match(html, /Required details/);
    assert.match(html, /Stakeholder prework/);
    assert.match(html, /Submission rules/);
    assert.match(html, /Confirmation prework checklist/);
    assert.match(html, /Guide claim audit/);
    assert.match(html, /Confirmation prework only/);
    assert.match(html, /Contains buyer-specific token: no/);
    assert.match(html, /Submits confirmation: no/);
    assert.match(html, /Creates beta client: no/);
    assert.match(html, /Sends email: no/);
    assert.match(html, /Runs paid lookup: no/);
    assert.match(html, /Claims live results: no/);
    assert.match(html, /Claims market ready: no/);
    assert.match(html, /Claims customer ROI: no/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /Requires tokenized confirmation form: yes/);
    assert.match(html, /Requires market gate before live claims: yes/);
    assert.match(html, /no operator forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    assert.doesNotMatch(html, /tenant-data/);
    const guide = await json("/api/v1/buyer-confirmation-guide");
    assert.equal(guide.type, "deal_threads.public_buyer_confirmation_guide");
    assert.equal(guide.public_safety.exposes_operator_forms, false);
    assert.equal(guide.public_safety.exposes_crm_profiles, false);
    assert.equal(guide.public_safety.exposes_tenant_exports, false);
    assert.equal(guide.public_safety.mutates_buyer_state, false);
    assert.equal(guide.public_safety.transmits_external_data, false);
    assert.equal(guide.confirmation_prework_checklist.type, "deal_threads.public_buyer_confirmation_guide_prework_checklist.v1");
    assert.equal(guide.confirmation_prework_checklist.public_links_only, true);
    assert.equal(guide.confirmation_prework_checklist.guide_only, true);
    assert.equal(guide.confirmation_prework_checklist.contains_buyer_specific_token, false);
    assert.equal(guide.confirmation_prework_checklist.submits_confirmation, false);
    assert.equal(guide.confirmation_prework_checklist.requires_tokenized_confirmation_form, true);
    assert.equal(guide.confirmation_prework_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(guide.confirmation_prework_checklist.required_public_links.includes("stakeholder_forwarding_kit"));
    assert.ok(guide.confirmation_prework_checklist.required_details.includes("Target page URL"));
    assert.ok(guide.confirmation_prework_checklist.required_steps?.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(guide.guide_claim_audit.type, "deal_threads.public_buyer_confirmation_guide_claim_audit.v1");
    assert.equal(guide.guide_claim_audit.claim_scope, "confirmation_prework_only");
    assert.equal(guide.guide_claim_audit.safety.guide_only, true);
    assert.equal(guide.guide_claim_audit.safety.confirmation_prework_only, true);
    assert.equal(guide.guide_claim_audit.safety.contains_buyer_specific_token, false);
    assert.equal(guide.guide_claim_audit.safety.submits_confirmation, false);
    assert.equal(guide.guide_claim_audit.safety.binding_acceptance_surface, false);
    assert.equal(guide.guide_claim_audit.safety.captures_signature, false);
    assert.equal(guide.guide_claim_audit.safety.collects_payment, false);
    assert.equal(guide.guide_claim_audit.safety.charges_buyer, false);
    assert.equal(guide.guide_claim_audit.safety.creates_beta_client, false);
    assert.equal(guide.guide_claim_audit.safety.mutates_buyer_state, false);
    assert.equal(guide.guide_claim_audit.safety.transmits_external_data, false);
    assert.equal(guide.guide_claim_audit.safety.sends_email, false);
    assert.equal(guide.guide_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(guide.guide_claim_audit.safety.uses_public_links_only, true);
    assert.equal(guide.guide_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(guide.guide_claim_audit.safety.claims_live_results, false);
    assert.equal(guide.guide_claim_audit.safety.claims_market_ready, false);
    assert.equal(guide.guide_claim_audit.safety.claims_customer_roi, false);
    assert.equal(guide.guide_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(guide.guide_claim_audit.safety.requires_tokenized_confirmation_form, true);
    assert.equal(guide.guide_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(guide.guide_claim_audit.evidence_required.some((item) => item.key === "tokenized_confirmation_form" && item.required));
    assert.ok(guide.guide_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(guide.guide_claim_audit.blocked_claims.some((item) => /tokenized confirmation form/i.test(item)));
    assert.equal(guide.public_safety.read_only_get, true);
    assert.equal(guide.public_safety.guide_only, true);
    assert.equal(guide.public_safety.confirmation_prework_only, true);
    assert.equal(guide.public_safety.contains_buyer_specific_token, false);
    assert.equal(guide.public_safety.submits_confirmation, false);
    assert.equal(guide.public_safety.creates_beta_client, false);
    assert.equal(guide.public_safety.sends_email, false);
    assert.equal(guide.public_safety.runs_paid_lookup, false);
    assert.equal(guide.public_safety.uses_public_links_only, true);
    assert.equal(guide.public_safety.links_to_protected_surfaces, false);
    assert.equal(guide.public_safety.claims_live_results, false);
    assert.equal(guide.public_safety.claims_market_ready, false);
    assert.equal(guide.public_safety.claims_customer_roi, false);
    assert.equal(guide.public_safety.claims_guaranteed_lift, false);
    assert.equal(guide.public_safety.requires_tokenized_confirmation_form, true);
    assert.equal(guide.public_safety.requires_market_gate_before_live_claims, true);
    assert.ok(guide.required_details?.some((item) => /Target page URL/i.test(item.field)));
    assert.ok(guide.submission_rules?.some((item) => /tokenized/i.test(item)));
    assert.ok(guide.after_confirmation?.some((item) => /install handoff/i.test(item)));
    assert.equal(JSON.stringify(guide).includes("/crm/"), false);
    assert.equal(JSON.stringify(guide).includes("/admin"), false);
    assert.equal(JSON.stringify(guide).includes("tenant-data"), false);
    const markdown = await request("/api/v1/buyer-confirmation-guide?format=markdown");
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    assert.match(text, /# Deal Threads Buyer Confirmation Guide/);
    assert.match(text, /## Required Details/);
    assert.match(text, /## After Confirmation/);
    assert.match(text, /## Confirmation Prework Checklist/);
    assert.match(text, /## Guide Claim Audit/);
    assert.match(text, /Contains buyer-specific token: no/);
    assert.match(text, /Submits confirmation: no/);
    assert.match(text, /Creates beta client: no/);
    assert.match(text, /Claims market ready: no/);
    assert.match(text, /Evidence tokenized_confirmation_form: required/);
    assert.match(text, /Evidence market_gate_clearance: required/);
    assert.match(text, /Blocked claim: Do not present this public buyer confirmation guide as the tokenized confirmation form/);
    assert.doesNotMatch(text, /\/crm\//);
    assert.doesNotMatch(text, /\/admin/);
    assert.doesNotMatch(text, /tenant-data/);
    return {
      public: true,
      contains_required_details: true,
      exposes_operator_forms: false,
      mutates_buyer_state: false,
      contains_claim_audit: true
    };
  });

  await check("public stakeholder forwarding kit", async () => {
    const res = await request("/stakeholder-forwarding-kit");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads stakeholder forwarding kit/);
    assert.match(html, /Internal notes your champion can forward/);
    assert.match(html, /Forwarding sequence/);
    assert.match(html, /Stakeholder forwarding checklist/);
    assert.match(html, /Forwarding claim audit/);
    assert.match(html, /Manual stakeholder forwarding only/);
    assert.match(html, /Manual forwarding only: yes/);
    assert.match(html, /Draft copy only: yes/);
    assert.match(html, /Contains buyer-specific token: no/);
    assert.match(html, /Sends email: no/);
    assert.match(html, /Submits confirmation: no/);
    assert.match(html, /Creates beta client: no/);
    assert.match(html, /Runs paid lookup: no/);
    assert.match(html, /Claims market ready: no/);
    assert.match(html, /Claims customer ROI: no/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /Requires tokenized confirmation form: yes/);
    assert.match(html, /Requires market gate before live claims: yes/);
    assert.match(html, /Executive sponsor/);
    assert.match(html, /RevOps owner/);
    assert.match(html, /no operator forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    assert.doesNotMatch(html, /tenant-data/);
    const packet = await json("/api/v1/stakeholder-forwarding-kit");
    assert.equal(packet.type, "deal_threads.public_stakeholder_forwarding_kit");
    assert.equal(packet.stakeholder_forwarding_checklist.type, "deal_threads.public_stakeholder_forwarding_kit_forwarding_checklist.v1");
    assert.equal(packet.stakeholder_forwarding_checklist.status, "manual_forwarding_review_required");
    assert.equal(packet.stakeholder_forwarding_checklist.public_links_only, true);
    assert.equal(packet.stakeholder_forwarding_checklist.manual_forwarding_only, true);
    assert.equal(packet.stakeholder_forwarding_checklist.draft_copy_only, true);
    assert.equal(packet.stakeholder_forwarding_checklist.contains_buyer_specific_token, false);
    assert.equal(packet.stakeholder_forwarding_checklist.sends_email, false);
    assert.equal(packet.stakeholder_forwarding_checklist.submits_confirmation, false);
    assert.equal(packet.stakeholder_forwarding_checklist.requires_tokenized_confirmation_form, true);
    assert.equal(packet.stakeholder_forwarding_checklist.requires_market_gate_before_live_claims, true);
    assert.ok(packet.stakeholder_forwarding_checklist.required_public_links.includes("buyer_confirmation_guide"));
    assert.ok(packet.stakeholder_forwarding_checklist.required_stakeholder_notes.includes("CRM owner"));
    assert.ok(packet.stakeholder_forwarding_checklist.required_steps.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(packet.forwarding_claim_audit.type, "deal_threads.public_stakeholder_forwarding_kit_claim_audit.v1");
    assert.equal(packet.forwarding_claim_audit.claim_scope, "manual_forwarding_only");
    assert.equal(packet.forwarding_claim_audit.safety.manual_forwarding_only, true);
    assert.equal(packet.forwarding_claim_audit.safety.draft_copy_only, true);
    assert.equal(packet.forwarding_claim_audit.safety.stakeholder_routing_only, true);
    assert.equal(packet.forwarding_claim_audit.safety.contains_buyer_specific_token, false);
    assert.equal(packet.forwarding_claim_audit.safety.sends_email, false);
    assert.equal(packet.forwarding_claim_audit.safety.submits_confirmation, false);
    assert.equal(packet.forwarding_claim_audit.safety.binding_acceptance_surface, false);
    assert.equal(packet.forwarding_claim_audit.safety.captures_signature, false);
    assert.equal(packet.forwarding_claim_audit.safety.collects_payment, false);
    assert.equal(packet.forwarding_claim_audit.safety.charges_buyer, false);
    assert.equal(packet.forwarding_claim_audit.safety.creates_beta_client, false);
    assert.equal(packet.forwarding_claim_audit.safety.mutates_buyer_state, false);
    assert.equal(packet.forwarding_claim_audit.safety.transmits_external_data, false);
    assert.equal(packet.forwarding_claim_audit.safety.runs_paid_lookup, false);
    assert.equal(packet.forwarding_claim_audit.safety.uses_public_links_only, true);
    assert.equal(packet.forwarding_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(packet.forwarding_claim_audit.safety.claims_live_results, false);
    assert.equal(packet.forwarding_claim_audit.safety.claims_market_ready, false);
    assert.equal(packet.forwarding_claim_audit.safety.claims_customer_roi, false);
    assert.equal(packet.forwarding_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(packet.forwarding_claim_audit.safety.requires_tokenized_confirmation_form, true);
    assert.equal(packet.forwarding_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(packet.forwarding_claim_audit.evidence_required.some((item) => item.key === "stakeholder_forwarding_review" && item.required));
    assert.ok(packet.forwarding_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.forwarding_claim_audit.blocked_claims.some((item) => /automated email sender/i.test(item)));
    assert.equal(packet.public_safety.read_only_get, true);
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.exposes_tenant_exports, false);
    assert.equal(packet.public_safety.manual_forwarding_only, true);
    assert.equal(packet.public_safety.draft_copy_only, true);
    assert.equal(packet.public_safety.stakeholder_routing_only, true);
    assert.equal(packet.public_safety.contains_buyer_specific_token, false);
    assert.equal(packet.public_safety.sends_email, false);
    assert.equal(packet.public_safety.submits_confirmation, false);
    assert.equal(packet.public_safety.creates_beta_client, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.runs_paid_lookup, false);
    assert.equal(packet.public_safety.uses_public_links_only, true);
    assert.equal(packet.public_safety.links_to_protected_surfaces, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.claims_guaranteed_lift, false);
    assert.equal(packet.public_safety.requires_tokenized_confirmation_form, true);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.ok(packet.templates?.length >= 6);
    assert.ok(packet.templates?.some((item) => /CRM owner/i.test(item.audience)));
    assert.ok(packet.forwarding_sequence?.some((item) => /tokenized confirmation form/i.test(item)));
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("tenant-data"), false);
    const markdown = await request("/api/v1/stakeholder-forwarding-kit?format=markdown");
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    assert.match(text, /# Deal Threads Stakeholder Forwarding Kit/);
    assert.match(text, /## Forwarding Sequence/);
    assert.match(text, /### Executive sponsor/);
    assert.match(text, /## Stakeholder Forwarding Checklist/);
    assert.match(text, /## Forwarding Claim Audit/);
    assert.match(text, /## Public Safety/);
    assert.match(text, /Manual forwarding only: yes/);
    assert.match(text, /Draft copy only: yes/);
    assert.match(text, /Contains buyer-specific token: no/);
    assert.match(text, /Sends email: no/);
    assert.match(text, /Submits confirmation: no/);
    assert.match(text, /Creates beta client: no/);
    assert.match(text, /Claims market ready: no/);
    assert.match(text, /Evidence stakeholder_forwarding_review: required/);
    assert.match(text, /Evidence market_gate_clearance: required/);
    assert.match(text, /Blocked claim: Do not present this public stakeholder forwarding kit as an automated email sender/);
    assert.doesNotMatch(text, /\/crm\//);
    assert.doesNotMatch(text, /\/admin/);
    assert.doesNotMatch(text, /tenant-data/);
    return {
      public: true,
      contains_templates: true,
      exposes_operator_forms: false,
      mutates_buyer_state: false,
      contains_claim_audit: true
    };
  });

  await check("public business case calculator", async () => {
    const res = await request("/business-case");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads business case calculator/);
    assert.match(html, /Mid-market buyer business case/);
    assert.match(html, /Adjust assumptions/);
    assert.match(html, /Pilot proof targets/);
    assert.match(html, /Model sensitivity/);
    assert.match(html, /ROI claim audit/);
    assert.match(html, /Modeled planning only/);
    assert.match(html, /Claims guaranteed ROI: no/);
    assert.match(html, /no operator forms/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    assert.doesNotMatch(html, /tenant-data/);
    const packet = await json("/api/v1/business-case?monthlyLeads=80&dealValue=15000&closeLift=3");
    assert.equal(packet.type, "deal_threads.public_business_case");
    assert.equal(packet.assumptions.monthly_qualified_leads, 80);
    assert.equal(packet.assumptions.average_contract_value_usd, 15000);
    assert.equal(packet.assumptions.modeled_close_rate_lift_points, 3);
    assert.ok(packet.results.modeled_incremental_revenue_monthly_usd > 0);
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.model_only, true);
    assert.equal(packet.public_safety.claims_guaranteed_roi, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.claims_conversion_lift, false);
    assert.equal(packet.public_safety.requires_pilot_proof_before_customer_specific_roi, true);
    assert.equal(packet.public_safety.requires_market_gate_before_customer_claims, true);
    assert.equal(packet.model_sensitivity.type, "deal_threads.public_business_case_sensitivity.v1");
    assert.equal(typeof packet.model_sensitivity.break_even_close_rate_lift_points, "number");
    assert.equal(packet.roi_claim_audit.type, "deal_threads.public_business_case_roi_claim_audit.v1");
    assert.equal(packet.roi_claim_audit.claim_scope, "modeled_planning_only");
    assert.equal(packet.roi_claim_audit.safety.claims_guaranteed_roi, false);
    assert.equal(packet.roi_claim_audit.safety.claims_customer_roi, false);
    assert.equal(packet.roi_claim_audit.safety.claims_live_results, false);
    assert.equal(packet.roi_claim_audit.safety.claims_market_ready, false);
    assert.equal(packet.roi_claim_audit.safety.claims_conversion_lift, false);
    assert.equal(packet.roi_claim_audit.safety.requires_pilot_proof_before_customer_specific_roi, true);
    assert.equal(packet.roi_claim_audit.safety.requires_market_gate_before_customer_claims, true);
    assert.ok(packet.roi_claim_audit.evidence_required.some((item) => item.key === "buyer_supplied_assumptions" && item.required));
    assert.ok(packet.roi_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.roi_claim_audit.blocked_claims.some((item) => /guaranteed ROI/i.test(item)));
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("tenant-data"), false);
    const markdown = await request("/api/v1/business-case?format=markdown");
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    assert.match(text, /# Deal Threads Business Case/);
    assert.match(text, /## Model Sensitivity/);
    assert.match(text, /## ROI Claim Audit/);
    assert.match(text, /Claims guaranteed ROI: no/);
    assert.match(text, /Evidence buyer_supplied_assumptions: required/);
    assert.match(text, /Evidence market_gate_clearance: required/);
    assert.match(text, /Blocked claim: Do not present modeled payback as guaranteed ROI/);
    assert.match(text, /## Pilot Proof Targets/);
    assert.doesNotMatch(text, /\/crm\//);
    assert.doesNotMatch(text, /tenant-data/);
    return {
      public: true,
      contains_roi_model: true,
      exposes_operator_forms: false,
      transmits_external_data: false
    };
  });

  await check("public procurement packet", async () => {
    const res = await request("/procurement-packet");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Deal Threads procurement packet/);
    assert.match(html, /Buyer-safe procurement packet/);
    assert.match(html, /Approval checklist/);
    assert.match(html, /Default data posture/);
    assert.match(html, /Processor modes/);
    assert.match(html, /Synthetic CRM webhook tests/);
    assert.match(html, /no operator forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    assert.doesNotMatch(html, /tenant-data/);
    const packet = await json("/api/v1/procurement-packet");
    assert.equal(packet.type, "deal_threads.public_procurement_packet");
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.ok(packet.approval_checklist?.length >= 5);
    assert.ok(packet.default_posture?.some((item) => /Providerless enrichment/i.test(item)));
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("tenant-data"), false);
    const markdown = await request("/api/v1/procurement-packet?format=markdown");
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    assert.match(text, /# Deal Threads Procurement Packet/);
    assert.match(text, /## Approval Checklist/);
    assert.doesNotMatch(text, /\/crm\//);
    assert.doesNotMatch(text, /tenant-data/);
    return {
      public: true,
      contains_procurement_checklist: true,
      exposes_operator_forms: false,
      exposes_protected_exports: false
    };
  });

  await check("public pilot close kit", async () => {
    const res = await request("/pilot-close-kit");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Mid-market B2B pilot close kit/);
    assert.match(html, /Replace the contact form for one high-intent page in 14 days/);
    assert.match(html, /\$2,500\/mo/);
    assert.match(html, /\$5,000\/mo/);
    assert.match(html, /Providerless enrichment/);
    assert.match(html, /Request beta pilot/);
    assert.match(html, /Security center/);
    assert.match(html, /Pilot agreement/);
    assert.match(html, /14-day proof plan/);
    assert.match(html, /No for the first beta/);
    assert.match(html, /Real beta profiles stay protected/);
    assert.match(html, /Buyer forwarding checklist/);
    assert.match(html, /Close kit claim audit/);
    assert.match(html, /Pilot planning only/);
    assert.match(html, /Claims live results: no/);
    assert.match(html, /Claims market ready: no/);
    assert.match(html, /Claims guaranteed lift: no/);
    assert.match(html, /Requires market gate before live claims: yes/);
    assert.match(html, /no operator forms/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /\/admin/);
    const packet = await json("/api/v1/pilot-close-kit");
    assert.equal(packet.type, "deal_threads.public_pilot_close_kit");
    assert.ok(packet.handoff_steps.length >= 5);
    assert.ok(packet.success_criteria.length >= 4);
    assert.equal(packet.buyer_forwarding_checklist.type, "deal_threads.public_pilot_close_kit_forwarding_checklist.v1");
    assert.equal(packet.buyer_forwarding_checklist.public_links_only, true);
    assert.ok(packet.buyer_forwarding_checklist.required_public_links.includes("pilot_agreement"));
    assert.ok(packet.buyer_forwarding_checklist.required_steps.some((item) => /protected market-readiness gate/i.test(item)));
    assert.equal(packet.close_kit_claim_audit.type, "deal_threads.public_pilot_close_kit_claim_audit.v1");
    assert.equal(packet.close_kit_claim_audit.claim_scope, "pilot_planning_only");
    assert.equal(packet.close_kit_claim_audit.safety.pilot_planning_only, true);
    assert.equal(packet.close_kit_claim_audit.safety.uses_public_links_only, true);
    assert.equal(packet.close_kit_claim_audit.safety.links_to_protected_surfaces, false);
    assert.equal(packet.close_kit_claim_audit.safety.claims_live_results, false);
    assert.equal(packet.close_kit_claim_audit.safety.claims_market_ready, false);
    assert.equal(packet.close_kit_claim_audit.safety.claims_customer_roi, false);
    assert.equal(packet.close_kit_claim_audit.safety.claims_guaranteed_lift, false);
    assert.equal(packet.close_kit_claim_audit.safety.requires_market_gate_before_live_claims, true);
    assert.ok(packet.close_kit_claim_audit.evidence_required.some((item) => item.key === "market_gate_clearance" && item.required));
    assert.ok(packet.close_kit_claim_audit.blocked_claims.some((item) => /market-ready proof/i.test(item)));
    assert.equal(packet.public_safety.exposes_operator_forms, false);
    assert.equal(packet.public_safety.exposes_crm_profiles, false);
    assert.equal(packet.public_safety.mutates_buyer_state, false);
    assert.equal(packet.public_safety.transmits_external_data, false);
    assert.equal(packet.public_safety.claims_live_results, false);
    assert.equal(packet.public_safety.claims_market_ready, false);
    assert.equal(packet.public_safety.claims_customer_roi, false);
    assert.equal(packet.public_safety.claims_guaranteed_lift, false);
    assert.equal(packet.public_safety.requires_market_gate_before_live_claims, true);
    assert.equal(JSON.stringify(packet).includes("/crm/"), false);
    assert.equal(JSON.stringify(packet).includes("/admin"), false);
    const markdown = await request("/api/v1/pilot-close-kit?format=markdown");
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    assert.match(text, /# Deal Threads Pilot Close Kit/);
    assert.match(text, /## Buyer Forwarding Checklist/);
    assert.match(text, /## Close Kit Claim Audit/);
    assert.match(text, /Claims live results: no/);
    assert.match(text, /Claims market ready: no/);
    assert.match(text, /Evidence market_gate_clearance: required/);
    assert.match(text, /Blocked claim: Do not present the public close kit as market-ready proof/);
    assert.doesNotMatch(text, /\/crm\//);
    assert.doesNotMatch(text, /\/admin/);
    return {
      public: true,
      contains_offer: true,
      contains_proof_plan: true,
      contains_claim_audit: true,
      exposes_operator_forms: false
    };
  });

  await check("public pilot intake", async () => {
    const res = await request("/pilot-intake");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Private beta request/);
    assert.match(html, /Pilot intake/);
    assert.match(html, /Request beta pilot/);
    assert.match(html, /Protected operator pages/);
    assert.match(html, /Paid enrichment/);
    assert.match(html, /CRM sync can stay dry-run\/manual/);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /Operator login/);
    return {
      public: true,
      contains_pilot_form: true,
      exposes_crm_profile: false,
      mutates_production_state: false
    };
  });

  await check("public security center", async () => {
    const res = await request("/security");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Public security center/);
    assert.match(html, /Data controls for a low-friction beta install/);
    assert.match(html, /What data is used/);
    assert.match(html, /Processor posture/);
    assert.match(html, /Access and privacy controls/);
    assert.match(html, /Runtime hardening/);
    assert.match(html, /Providerless enrichment gate/);
    assert.match(html, /Install boundary/);
    assert.match(html, /no operator forms/i);
    assert.match(html, /no protected exports/i);
    assert.match(html, /explicit consent/i);
    assert.doesNotMatch(html, /<form/i);
    assert.doesNotMatch(html, /\/crm\//);
    assert.doesNotMatch(html, /tenant-data\/delete/);
    return {
      public: true,
      exposes_operator_forms: false,
      contains_providerless_gate: true,
      contains_processor_posture: true
    };
  });

	  await check("providerless field build decisions", async () => {
	    const page = await request("/enrichment", { auth: true });
	    assert.equal(page.status, 200);
	    const html = await page.text();
	    assert.match(html, /Build ourselves plan/);
	    assert.match(html, /Field build-vs-buy decisions/);
	    assert.match(html, /Paid-provider trigger/);
	    assert.match(html, /Review queue/);

	    const buildPlan = await json("/api/v1/enrichment/build-plan", { auth: true });
	    assert.match(buildPlan.recommendation, /Stay providerless|paid lookup/i);
	    assert.equal(buildPlan.paid_escalation_policy?.allowed_by_default, false);
	    assert.equal(buildPlan.paid_escalation_policy?.manual_approval_required, true);
	    assert.equal(buildPlan.paid_escalation_policy?.recommended_paid_lookups_now, 0);
	    assert.ok(buildPlan.internal_source_stack?.includes("Conversion-surface analysis for contact forms, demo CTAs, schedulers, and chat widgets"));
	    assert.ok(buildPlan.internal_source_stack?.includes("Public-site role and contact cues from team, about, contact, and leadership pages"));
	    assert.ok(buildPlan.field_level_strategy?.length >= 9);
	    assert.ok(buildPlan.field_level_strategy.some((field) => field.key === "budget" && field.paid_provider_trigger));
	    assert.ok(buildPlan.field_level_strategy.some((field) => field.key === "tech_stack" && field.source_path?.length));
	    const reviewQueuePage = await request("/enrichment/review-queue", { auth: true });
	    assert.equal(reviewQueuePage.status, 200);
	    const reviewQueueHtml = await reviewQueuePage.text();
	    assert.match(reviewQueueHtml, /Providerless review queue/);
	    assert.match(reviewQueueHtml, /No paid lookup is recommended by default/);
	    assert.match(reviewQueueHtml, /GET is read-only: no email sends, buyer-state mutation, beta-client creation, CRM transmission, paid lookup, or live-proof claim/i);
	    const reviewQueue = await json("/api/v1/enrichment/review-queue", { auth: true });
	    assert.equal(reviewQueue.type, "deal_threads.providerless_review_queue.v1");
	    assert.equal(reviewQueue.safety?.mutates_buyer_state_on_get, false);
	    assert.equal(reviewQueue.safety?.sends_external_email_on_get, false);
	    assert.equal(reviewQueue.safety?.transmits_external_crm_on_get, false);
	    assert.equal(reviewQueue.safety?.paid_provider_lookup_by_default, false);
	    assert.equal(reviewQueue.summary?.recommended_paid_lookups_now, 0);
	    assert.equal(reviewQueue.paid_firewall?.allowed_by_default, false);
	    assert.equal(reviewQueue.paid_firewall?.manual_approval_required, true);
	    assert.ok(Array.isArray(reviewQueue.items));
	    const reviewQueueMarkdown = await request("/api/v1/enrichment/review-queue?format=markdown", { auth: true });
	    assert.equal(reviewQueueMarkdown.status, 200);
	    const reviewQueueMarkdownText = await reviewQueueMarkdown.text();
	    assert.match(reviewQueueMarkdownText, /# Providerless Enrichment Review Queue/);
	    assert.match(reviewQueueMarkdownText, /Recommended paid lookups now: 0/);
	    return {
	      recommendation: buildPlan.recommendation,
	      fields_ranked: buildPlan.field_level_strategy.length,
	      review_candidates: reviewQueue.summary.review_candidates,
	      paid_lookups_now: buildPlan.paid_escalation_policy.recommended_paid_lookups_now
	    };
	  });

  await check("public sample profile room", async () => {
    const res = await request("/sample-profile");
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Sample rep-ready buyer profile|What your rep sees before the first touch/);
    assert.match(html, /Real beta profiles remain protected|waiting for marked demo data/);
    assert.doesNotMatch(html, /<form/i);
    return {
      read_only: true,
      exposes_operator_forms: false
    };
  });

  await check("public product screenshot asset", async () => {
    const res = await request("/assets/crm-profile-preview.png");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") || "", /image\/png/);
    const bytes = await res.arrayBuffer();
    assert.ok(bytes.byteLength > 200_000, "Expected full product screenshot asset");
    return { content_type: res.headers.get("content-type"), bytes: bytes.byteLength };
  });

  await check("operator routes require auth", async () => {
	    const targets = ["/admin", "/crm", "/crm/lead_000/providerless-evidence", "/activation", "/activation/follow-ups", "/activation/outbox", "/activation/close-desk", "/activation/prospects/lead_000/confirmation-workbench", "/activation/prospects/lead_000/confirmation-reply", "/activation/prospects/lead_000/stakeholder-handoff", "/launch/first-five-board", "/launch/ops", "/launch/first-beta-drill", "/launch/first-beta-execution", "/launch/next-action", "/launch/confirmation-command", "/launch/confirmation-watch", "/launch/first-profile", "/launch/profile-handoff", "/launch/rep-feedback", "/launch/proof-capture", "/launch/proof-packet", "/launch/market-ready", "/launch/market-kit", "/launch/proof-ledger", "/launch/proof-handoff", "/launch/install-queue", "/launch/install-queue/beta_00000000/workbench", "/outreach", "/enrichment", "/enrichment/review-queue", "/api/v1/trust/packet", "/api/v1/leads", "/api/v1/leads/lead_000/providerless-evidence", "/api/v1/activation/real-beta", "/api/v1/activation/follow-ups", "/api/v1/activation/outbox", "/api/v1/activation/close-desk", "/api/v1/activation/prospects/lead_000/confirmation-workbench", "/api/v1/activation/prospects/lead_000/confirmation-reply-preview", "/api/v1/activation/prospects/lead_000/stakeholder-handoff", "/api/v1/activation/prospects/lead_000/pilot-acceptance", "/api/v1/launch/first-five-board", "/api/v1/launch/ops", "/api/v1/launch/first-beta-drill", "/api/v1/launch/first-beta-execution", "/api/v1/launch/next-action", "/api/v1/launch/confirmation-command", "/api/v1/launch/confirmation-watch", "/api/v1/launch/first-profile", "/api/v1/launch/profile-handoff", "/api/v1/launch/rep-feedback", "/api/v1/launch/proof-capture", "/api/v1/launch/proof-packet", "/api/v1/launch/market-ready", "/api/v1/launch/market-kit", "/api/v1/launch/proof-ledger", "/api/v1/launch/proof-handoff", "/api/v1/launch/install-queue", "/api/v1/beta-clients/beta_00000000/install-workbench", "/api/v1/outreach/first-five", "/api/v1/enrichment/build-plan", "/api/v1/enrichment/review-queue"];
    const results = [];
    for (const target of targets) {
      const res = await request(target);
      assert.equal(res.status, 401, `${target} should reject unauthenticated access`);
      results.push({ target, status: res.status });
    }
    return { routes: results };
  });

  await check("protected launch surfaces load with auth", async () => {
    const targets = ["/trust", "/readiness", "/proof", "/crm", "/activation", "/activation/follow-ups", "/activation/outbox", "/activation/close-desk", "/launch/first-five-board", "/launch/ops", "/launch/first-beta-drill", "/launch/first-beta-execution", "/launch/next-action", "/launch/confirmation-command", "/launch/confirmation-watch", "/launch/first-profile", "/launch/profile-handoff", "/launch/rep-feedback", "/launch/proof-capture", "/launch/proof-packet", "/launch/market-ready", "/launch/market-kit", "/launch/proof-ledger", "/launch/proof-handoff", "/launch/install-queue", "/outreach", "/enrichment", "/enrichment/review-queue", "/admin", "/api/v1/trust/hardening", "/api/v1/activation/follow-ups", "/api/v1/activation/outbox", "/api/v1/activation/close-desk", "/api/v1/launch/first-five-board", "/api/v1/launch/ops", "/api/v1/launch/first-beta-drill", "/api/v1/launch/first-beta-execution", "/api/v1/launch/next-action", "/api/v1/launch/confirmation-command", "/api/v1/launch/confirmation-watch", "/api/v1/launch/first-profile", "/api/v1/launch/profile-handoff", "/api/v1/launch/rep-feedback", "/api/v1/launch/proof-capture", "/api/v1/launch/proof-packet", "/api/v1/launch/market-ready", "/api/v1/launch/market-kit", "/api/v1/launch/proof-ledger", "/api/v1/launch/proof-handoff", "/api/v1/launch/install-queue", "/api/v1/outreach/first-five", "/api/v1/enrichment/build-plan", "/api/v1/enrichment/review-queue"];
    const results = [];
    for (const target of targets) {
      const res = await request(target, { auth: true });
      assert.equal(res.status, 200, `${target} should load with admin auth`);
      results.push({ target, status: res.status });
    }
    return { routes: results };
  });

  await check("protected CRM lead can be converted into beta client", async () => {
    const leadList = await json("/api/v1/leads", { auth: true });
    const leadId = leadList.leads?.[0]?.id;
    assert.ok(leadId, "Expected at least one protected lead profile");

    const res = await request(`/crm/${leadId}`, { auth: true });
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Beta client conversion/);
    assert.match(html, new RegExp(`/crm/${leadId}/beta-client`));
    assert.match(html, /Create beta client from lead|Update beta client from lead/);
    assert.match(html, /does not count the original Deal Threads sales lead as beta traffic|Original sales lead remains separate from beta traffic/);
    assert.match(html, /Providerless evidence/);

    const evidencePage = await request(`/crm/${leadId}/providerless-evidence`, { auth: true });
    assert.equal(evidencePage.status, 200);
    const evidenceHtml = await evidencePage.text();
    assert.match(evidenceHtml, /Providerless evidence packet/);
    assert.match(evidenceHtml, /No email, CRM transmission, beta-client creation, paid lookup, buyer-state mutation, or live-proof claim runs on GET/);
    assert.match(evidenceHtml, /Paid lookup firewall/);
    assert.match(evidenceHtml, /Conversion surface/);

    const evidence = await json(`/api/v1/leads/${leadId}/providerless-evidence`, { auth: true });
    assert.equal(evidence.type, "deal_threads.providerless_lead_evidence.v1");
    assert.equal(evidence.lead_id, leadId);
    assert.equal(evidence.summary?.paid_lookup_recommended_now, 0);
    assert.ok(evidence.conversion_surface?.status);
    assert.equal(evidence.paid_lookup_firewall?.recommended, false);
    assert.equal(evidence.paid_lookup_firewall?.allowed_by_default, false);
    assert.equal(evidence.paid_lookup_firewall?.manual_approval_required, true);
    assert.equal(evidence.safety?.mutates_buyer_state_on_get, false);
    assert.equal(evidence.safety?.sends_external_email_on_get, false);
    assert.equal(evidence.safety?.creates_beta_client_on_get, false);
    assert.equal(evidence.safety?.transmits_external_crm_on_get, false);
    assert.equal(evidence.safety?.paid_provider_lookup_by_default, false);
    assert.equal(evidence.safety?.live_proof_claimed, false);
    const evidenceMarkdown = await request(`/api/v1/leads/${leadId}/providerless-evidence?format=markdown`, { auth: true });
    assert.equal(evidenceMarkdown.status, 200);
    const evidenceMarkdownText = await evidenceMarkdown.text();
    assert.match(evidenceMarkdownText, /# Deal Threads Providerless Evidence Packet/);
    assert.match(evidenceMarkdownText, /## Conversion Surface/);
    assert.match(evidenceMarkdownText, /Paid lookup recommended now: 0/);

    return {
      lead_id: leadId,
      conversion_panel: true,
      providerless_evidence_packet: true,
      mutates_production_state: false
    };
  });

  await check("trust hardening packet", async () => {
    const hardening = await json("/api/v1/trust/hardening", { auth: true });
    assert.equal(hardening.status, "hardened");
    assert.equal(hardening.score, 100);
    assert.equal(hardening.summary?.blocker, 0);
    assert.equal(hardening.summary?.warning, 0);
    assert.ok(hardening.checks?.some((item) => item.key === "public_widget_scope" && item.status === "pass"));
    return {
      status: hardening.status,
      score: hardening.score,
      summary: hardening.summary
    };
  });

  await check("buyer trust packet", async () => {
    const packet = await json("/api/v1/trust/packet?days=14", { auth: true });
    assert.ok(["procurement_ready", "procurement_ready_with_disclosures"].includes(packet.status));
    assert.ok(packet.score >= 90);
    assert.equal(packet.hardening?.status, "hardened");
    assert.equal(packet.summary?.blocker, 0);
    assert.ok(packet.controls?.some((item) => item.key === "production_hardening" && item.status === "pass"));
    return {
      status: packet.status,
      status_label: packet.status_label,
      score: packet.score,
      summary: packet.summary,
      open_gaps: packet.open_gaps
    };
  });

  await check("readiness room proof", async () => {
    const readiness = await json("/api/v1/readiness/summary?days=14", { auth: true });
    assert.ok(["ready", "demo_ready", "demo_ready_with_gaps", "needs_attention", "not_ready", "blocked"].includes(readiness.status));
    if (["not_ready", "blocked"].includes(readiness.status)) {
      assert.ok(
        readiness.open_gaps?.length || readiness.live_proof_gate?.blockers?.length || readiness.live_proof_gate?.warnings?.length,
        "Blocked readiness should explain remaining proof gaps or disclosure warnings"
      );
    } else {
      assert.equal(readiness.summary?.blocker, 0);
      assert.ok(readiness.score >= 75);
      assert.ok(Number(readiness.proof?.total_leads || 0) >= 1);
    }
    assert.equal(Number(readiness.proof?.paid_provider_spend || 0), 0);
    return {
      status: readiness.status,
      score: readiness.score,
      summary: readiness.summary,
      proof: readiness.proof,
      demo_scenario: readiness.demo_scenario
    };
  });

  await check("live proof export gate", async () => {
    const gate = await json("/api/v1/proof/live-gate?days=14", { auth: true });
    assert.ok(["blocked", "ready_with_disclosures", "ready"].includes(gate.status));
    assert.equal(typeof gate.live_ready, "boolean");
    assert.ok(gate.live_ready || gate.blockers.length > 0, "Blocked live proof gate should explain why export is blocked");
    if (gate.summary?.demo_scenario_active) {
      assert.equal(gate.live_ready, false);
      assert.equal(gate.status, "blocked");
      assert.ok(gate.blockers.some((item) => /synthetic data is active/i.test(item)));
    }

    const proofPage = await request("/proof", { auth: true });
    assert.equal(proofPage.status, 200);
    const html = await proofPage.text();
    assert.match(html, /Live proof export gate/);
    assert.match(html, /synthetic demo records/);

    return {
      status: gate.status,
      live_ready: gate.live_ready,
      summary: gate.summary,
      blockers: gate.blockers,
      warnings: gate.warnings
    };
  });

  await check("real beta activation cockpit", async () => {
    const page = await request("/activation", { auth: true });
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /Real beta activation/);
    assert.match(html, /Demo clients excluded/);
    assert.match(html, /Qualified prospects/);
    assert.match(html, /Activation steps/);
    assert.match(html, /Follow-ups/);

    const activation = await json("/api/v1/activation/real-beta", { auth: true });
    assert.ok(["blocked", "prospect_ready", "activation_in_progress", "ready_for_real_traffic"].includes(activation.status));
    assert.equal(typeof activation.summary?.demo_clients_excluded, "number");
    assert.equal(typeof activation.summary?.real_beta_clients, "number");
    assert.equal(activation.summary.real_beta_clients, activation.real_beta_clients?.length || 0);
    assert.equal(activation.summary.qualified_prospects, activation.prospects?.length || 0);
    assert.ok(activation.steps?.some((step) => step.key === "real_launch_target"));
    assert.ok(activation.steps?.some((step) => step.key === "live_proof_gate"));
    assert.equal(typeof activation.live_proof_gate?.live_ready, "boolean");

    const demoLikeClients = (activation.real_beta_clients || []).filter((client) => {
      const text = [client.demo_scenario_id, client.notes, client.domain, client.website_url].filter(Boolean).join(" ");
      return /mid_market_buyer_demo|mid-market demo|\.example\b/i.test(text);
    });
    assert.equal(demoLikeClients.length, 0, "Real activation cockpit should exclude synthetic demo clients");

    if (activation.demo_scenario?.active) {
      assert.ok(activation.summary.demo_clients_excluded > 0, "Active demo scenario should report excluded demo clients");
      assert.equal(activation.live_proof_gate.live_ready, false, "Live proof should remain blocked while demo scenario is active");
    }

    const followUpsPage = await request("/activation/follow-ups", { auth: true });
    assert.equal(followUpsPage.status, 200);
    const followUpsHtml = await followUpsPage.text();
	    assert.match(followUpsHtml, /Activation follow-up queue/);
	    assert.match(followUpsHtml, /Handoff pack/);
	    assert.match(followUpsHtml, /no email sends, buyer-state mutation, beta-client creation, live-proof claims, or paid enrichment runs/i);

    const followUps = await json("/api/v1/activation/follow-ups", { auth: true });
    assert.equal(followUps.type, "deal_threads.activation_followups.v1");
    assert.equal(followUps.summary.qualified_prospects, followUps.queue?.length || 0);
    assert.equal(followUps.safety?.mutates_buyer_state_on_get, false);
    assert.equal(followUps.safety?.sends_external_email_on_get, false);
    assert.equal(followUps.safety?.creates_beta_client_on_get, false);
    assert.equal(followUps.safety?.paid_provider_lookup_by_default, false);
    assert.equal(followUps.summary.real_beta_clients, activation.summary.real_beta_clients);
    const followUpsMarkdown = await request("/api/v1/activation/follow-ups?format=markdown", { auth: true });
    assert.equal(followUpsMarkdown.status, 200);
    assert.match(await followUpsMarkdown.text(), /# Deal Threads Activation Follow-Up Queue/);

    const closeDeskPage = await request("/activation/close-desk", { auth: true });
    assert.equal(closeDeskPage.status, 200);
    const closeDeskHtml = await closeDeskPage.text();
	    assert.match(closeDeskHtml, /Activation close desk/);
	    assert.match(closeDeskHtml, /First-five close packet campaign/);
	    assert.match(closeDeskHtml, /GET is read-only: no email sends, buyer-state mutation, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/i);

	    const closeDesk = await json("/api/v1/activation/close-desk", { auth: true });
	    assert.equal(closeDesk.type, "deal_threads.activation_close_desk.v1");
	    assert.equal(closeDesk.summary.qualified_prospects, closeDesk.items?.length || 0);
	    assert.equal(closeDesk.first_five_campaign?.type, "deal_threads.first_five_close_packet_campaign.v1");
	    assert.equal(closeDesk.summary.first_five_campaign_planned_sends, closeDesk.first_five_campaign?.summary?.planned_send_count);
	    assert.equal(typeof closeDesk.first_five_campaign?.summary?.manual_sent_recorders, "number");
	    assert.equal(closeDesk.first_five_campaign?.safety?.sends_external_email_on_get, false);
	    assert.equal(closeDesk.first_five_campaign?.safety?.manual_record_requires_post, true);
	    assert.equal(closeDesk.confirmation_chase_campaign?.type, "deal_threads.buyer_confirmation_chase_campaign.v1");
	    assert.equal(closeDesk.summary.confirmation_chase_planned_sends, closeDesk.confirmation_chase_campaign?.summary?.planned_send_count);
	    assert.equal(typeof closeDesk.confirmation_chase_campaign?.summary?.manual_sent_recorders, "number");
	    assert.equal(closeDesk.confirmation_chase_campaign?.safety?.sends_external_email_on_get, false);
	    assert.equal(closeDesk.confirmation_chase_campaign?.safety?.manual_record_requires_post, true);
	    assert.equal(closeDesk.summary.paid_lookups_recommended_now, 0);
    assert.equal(closeDesk.safety?.mutates_buyer_state_on_get, false);
    assert.equal(closeDesk.safety?.sends_external_email_on_get, false);
    assert.equal(closeDesk.safety?.creates_beta_client_on_get, false);
    assert.equal(closeDesk.safety?.transmits_external_crm_on_get, false);
    assert.equal(closeDesk.safety?.paid_provider_lookup_by_default, false);
    assert.equal(closeDesk.safety?.live_proof_claimed, false);
	    if (activation.prospects?.[0]?.lead_id) {
	      const closeDeskItem = closeDesk.items.find((item) => item.lead_id === activation.prospects[0].lead_id);
	      assert.ok(closeDeskItem, "Expected first activation prospect in close desk");
	      assert.ok(["close_packet", "confirmation_nudge", "manual_confirmation_capture", "kickoff"].includes(closeDeskItem.recommended_packet?.kind));
	      if (closeDeskItem.recommended_packet?.kind === "close_packet") {
	        assert.equal(closeDeskItem.manual_sent_action?.method, "POST");
	        assert.equal(closeDeskItem.manual_sent_action?.sends_from_server, false);
	      }
	      if (closeDeskItem.recommended_packet?.kind === "confirmation_nudge") {
	        assert.equal(closeDeskItem.manual_sent_action?.method, "POST");
	        assert.equal(closeDeskItem.manual_sent_action?.sends_from_server, false);
	      }
	    }
	    const closeDeskMarkdown = await request("/api/v1/activation/close-desk?format=markdown", { auth: true });
	    assert.equal(closeDeskMarkdown.status, 200);
	    const closeDeskMarkdownText = await closeDeskMarkdown.text();
	    assert.match(closeDeskMarkdownText, /# Deal Threads Activation Close Desk/);
	    assert.match(closeDeskMarkdownText, /## First-Five Close Packet Campaign/);
	    assert.match(closeDeskMarkdownText, /## Buyer Confirmation Chase Campaign/);
	    assert.match(closeDeskMarkdownText, /Manual record requires POST: yes|Manual record requires POST: no/);
	    if (/Manual record requires POST: no/.test(closeDeskMarkdownText)) {
	      assert.ok(closeDesk.items?.some((item) => item.recommended_packet?.kind === "kickoff"));
	    }

    const outboxPage = await request("/activation/outbox", { auth: true });
    assert.equal(outboxPage.status, 200);
    const outboxHtml = await outboxPage.text();
    assert.match(outboxHtml, /Activation outbox/);
    assert.match(outboxHtml, /Review the buyer follow-ups that are ready to send/);
    assert.match(outboxHtml, /GET is read-only: no email sends, buyer-state mutation, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/i);
    const outbox = await json("/api/v1/activation/outbox", { auth: true });
    assert.equal(outbox.type, "deal_threads.activation_outbox.v1");
    assert.equal(outbox.summary.paid_lookups_recommended_now, 0);
    assert.equal(outbox.safety?.read_only_get, true);
    assert.equal(outbox.safety?.mutates_buyer_state_on_get, false);
    assert.equal(outbox.safety?.sends_external_email_on_get, false);
    assert.equal(outbox.safety?.creates_beta_client_on_get, false);
    assert.equal(outbox.safety?.transmits_external_crm_on_get, false);
    assert.equal(outbox.safety?.paid_provider_lookup_by_default, false);
    assert.equal(outbox.safety?.live_proof_claimed, false);
    assert.equal(outbox.safety?.send_actions_require_post, true);
	    const sendableOutboxExpected = Boolean(closeDesk.summary.close_packets_ready || closeDesk.summary.confirmation_nudges_ready);
	    if (sendableOutboxExpected) {
	      assert.match(outboxHtml, /Open manual email draft/);
	      assert.match(outboxHtml, /Send rooms/);
	      assert.match(outboxHtml, /Manual draft ready/);
	      assert.ok(outbox.summary.sendable_items >= 1, "Expected sendable outbox items when close desk has sendable packets");
	      assert.ok(outbox.summary.manual_mailto_drafts >= 1, "Expected top-level manual mailto draft count");
	      assert.ok(outbox.summary.send_rooms_ready >= 1, "Expected top-level send room ready count");
	      assert.ok(outbox.summary.manual_sent_recorders >= 1, "Expected top-level manual sent recorder count");
	      assert.match(outbox.first_item?.manual_mailto_url || "", /^mailto:/);
	      assert.equal(outbox.first_item?.send_room?.status, "manual_draft_ready");
	      assert.match(outbox.first_item?.send_room?.manual_mailto_url || "", /^mailto:/);
	      assert.equal(outbox.first_item?.send_room?.post_send_plan?.status, "ready_after_manual_send");
	      assert.match(outbox.first_item?.send_room?.post_send_plan?.watch_room || "", /\/launch\/confirmation-watch$/);
	      assert.match(outbox.first_item?.send_room?.post_send_plan?.reply_parser || "", /\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-reply$/);
	      assert.equal(outbox.first_item?.send_room?.post_send_plan?.paid_enrichment_needed_now, 0);
	      assert.ok(outbox.items?.some((item) => ["close_packet", "confirmation_nudge"].includes(item.packet?.kind)));
	      assert.ok(outbox.items?.some((item) => item.send_action?.method === "POST" && item.send_action?.preview_only_on_get));
	      assert.ok(outbox.items?.some((item) => item.manual_sent_action?.method === "POST" && item.manual_sent_action?.sends_from_server === false));
	      assert.ok(outbox.items?.some((item) => item.manual_sent_action?.mutates_state === true && item.manual_sent_action?.preview_only_on_get === true));
	      assert.ok(outbox.items?.some((item) => /^mailto:/.test(item.packet?.mailto_url || "")));
	      assert.ok(outbox.items?.some((item) => /^mailto:/.test(item.packet?.manual_mailto_url || "")));
	      assert.ok(outbox.items?.some((item) => /^mailto:/.test(item.manual_mailto_url || "")));
	      assert.ok(outbox.items?.some((item) => item.send_room?.status === "manual_draft_ready" && /^mailto:/.test(item.send_room?.manual_mailto_url || "")));
	      assert.ok(outbox.items?.every((item) => item.send_room?.post_send_plan?.status === "ready_after_manual_send"));
	      assert.ok(outbox.items?.every((item) => /\/launch\/confirmation-watch$/.test(item.send_room?.post_send_plan?.watch_room || "")));
	      assert.ok(outbox.items?.every((item) => /\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-reply$/.test(item.send_room?.post_send_plan?.reply_parser || "")));
	      assert.ok(outbox.items?.every((item) => item.send_room?.safety?.read_only_get === true));
	      assert.ok(outbox.items?.every((item) => item.send_room?.safety?.sends_external_email_on_get === false));
	      assert.ok(outbox.items?.every((item) => item.send_room?.safety?.paid_provider_lookup_by_default === false));
	      assert.ok(outbox.items?.some((item) => item.manual_handoff?.method === "mailto" && item.manual_handoff?.sends_from_server === false));
	    } else {
	      assert.equal(outbox.summary.sendable_items, 0);
	    }
	    if (outbox.summary.confirmation_nudges_ready) {
	      const nudgeItem = outbox.items.find((item) => item.packet?.kind === "confirmation_nudge");
	      assert.match(nudgeItem?.manual_sent_action?.api_url || "", /\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-nudge\/sent$/);
	      assert.match(nudgeItem?.manual_sent_action?.html_action || "", /\/activation\/prospects\/lead_[a-f0-9-]+\/mark-confirmation-nudge-sent$/);
	      assert.equal(nudgeItem?.packet?.quick_reply_template?.enabled, true);
	      assert.match(nudgeItem?.packet?.quick_reply_template?.body || "", /Quick reply fallback:/);
	      assert.match(nudgeItem?.packet?.quick_reply_template?.protected_reply_preview_url || "", /\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-reply$/);
	      assert.match(outboxHtml, /Mark manual nudge sent/);
	      assert.match(outboxHtml, /Quick reply fallback ready/);
	    }
    const outboxMarkdown = await request("/api/v1/activation/outbox?format=markdown", { auth: true });
    assert.equal(outboxMarkdown.status, 200);
    const outboxMarkdownText = await outboxMarkdown.text();
    assert.match(outboxMarkdownText, /# Deal Threads Activation Outbox/);
	    assert.match(outboxMarkdownText, /Paid lookups recommended now: 0/);
	    assert.match(outboxMarkdownText, /Send actions require POST: yes/);
	    if (outbox.summary.confirmation_nudges_ready) {
	      assert.match(outboxMarkdownText, /Quick reply fallback: available/);
	    }
	    if (sendableOutboxExpected) {
	      assert.match(outboxMarkdownText, /Send rooms ready: [1-9]/);
	      assert.match(outboxMarkdownText, /Manual mailto drafts: [1-9]/);
	      assert.match(outboxMarkdownText, /Send room: Manual draft ready/);
	      assert.match(outboxMarkdownText, /Send room mailto draft: mailto:/);
	      assert.match(outboxMarkdownText, /Post-send plan: Ready after manual send/);
	      assert.match(outboxMarkdownText, /Watch room: .*\/launch\/confirmation-watch/);
	      assert.match(outboxMarkdownText, /Reply parser: .*\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-reply/);
	      assert.match(outboxMarkdownText, /Manual email draft: mailto:/);
	      assert.match(outboxMarkdownText, /Manual sent POST: POST .*\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\//);
	    }

    const firstFiveOutreachPage = await request("/outreach", { auth: true });
    assert.equal(firstFiveOutreachPage.status, 200);
    const firstFiveOutreachHtml = await firstFiveOutreachPage.text();
    assert.match(firstFiveOutreachHtml, /First five beta outreach/);
    assert.match(firstFiveOutreachHtml, /GET surfaces are read-only/i);
    const firstFiveOutreach = await json("/api/v1/outreach/first-five", { auth: true });
    assert.equal(firstFiveOutreach.type, "deal_threads.first_five_outreach.v1");
    assert.equal(firstFiveOutreach.public_safety?.mutates_buyer_state_on_get, false);
    assert.equal(firstFiveOutreach.public_safety?.sends_external_email_on_get, false);
    assert.equal(firstFiveOutreach.public_safety?.creates_beta_client_on_get, false);
    assert.equal(firstFiveOutreach.public_safety?.transmits_external_crm_on_get, false);
    assert.equal(firstFiveOutreach.public_safety?.paid_provider_lookup_by_default, false);
    assert.equal(firstFiveOutreach.summary?.paid_lookups_recommended_now, 0);
    assert.equal(typeof firstFiveOutreach.summary?.outreach_send_rooms_ready, "number");
    assert.equal(typeof firstFiveOutreach.summary?.manual_mailto_drafts, "number");
    assert.equal(typeof firstFiveOutreach.summary?.manual_sent_recorders, "number");
    assert.equal(typeof firstFiveOutreach.summary?.activation_reply_capture_actions, "number");
    assert.equal(typeof firstFiveOutreach.summary?.outreach_sent_records, "number");
    assert.equal(typeof firstFiveOutreach.summary?.outreach_reply_records, "number");
    assert.equal(typeof firstFiveOutreach.summary?.outreach_followups_due, "number");
    if (firstFiveOutreach.target_accounts?.length) {
      assert.match(firstFiveOutreachHtml, /Send rooms/);
      assert.match(firstFiveOutreachHtml, /Open email draft/);
      if (firstFiveOutreach.summary?.activation_reply_capture_actions > 0) {
        assert.match(firstFiveOutreachHtml, /Capture interested reply/);
        assert.match(firstFiveOutreachHtml, /Create activation prospect/);
      }
      if (firstFiveOutreach.summary?.manual_sent_recorders > 0) {
        assert.match(firstFiveOutreachHtml, /Record manual send/);
        assert.match(firstFiveOutreachHtml, /Recorders/);
      }
      assert.match(firstFiveOutreachHtml, /Sent records/);
      assert.match(firstFiveOutreachHtml, /After send/);
      const sendReadyAccount = firstFiveOutreach.target_accounts.find((account) => account.send_room?.status === "manual_outreach_ready") || firstFiveOutreach.target_accounts[0];
      assert.match(sendReadyAccount.send_room?.manual_mailto_url || "", /^mailto:/);
      if (sendReadyAccount.send_room?.manual_sent_action) {
        assert.equal(sendReadyAccount.send_room.manual_sent_action.method, "POST");
        assert.match(sendReadyAccount.send_room.manual_sent_action.api_url || "", /\/api\/v1\/outreach\/target-accounts\/.+\/sent$/);
        assert.equal(sendReadyAccount.send_room.manual_sent_action.sends_from_server, false);
        assert.equal(sendReadyAccount.send_room.manual_sent_action.preview_only_on_get, true);
        assert.equal(sendReadyAccount.send_room.safety?.manual_record_requires_post, true);
      }
      if (sendReadyAccount.send_room?.activation_prospect_action) {
        assert.equal(sendReadyAccount.send_room.activation_prospect_action.method, "POST");
        assert.match(sendReadyAccount.send_room.activation_prospect_action.api_url || "", /\/api\/v1\/outreach\/target-accounts\/.+\/activation-prospect$/);
        assert.equal(sendReadyAccount.send_room.activation_prospect_action.creates_activation_prospect, true);
        assert.equal(sendReadyAccount.send_room.activation_prospect_action.creates_beta_client, false);
        assert.equal(sendReadyAccount.send_room.activation_prospect_action.sends_from_server, false);
        assert.equal(sendReadyAccount.send_room.activation_prospect_action.transmits_external_crm, false);
        assert.equal(sendReadyAccount.send_room.activation_prospect_action.paid_provider_lookup, false);
        assert.equal(sendReadyAccount.send_room.activation_prospect_action.preview_only_on_get, true);
        assert.equal(sendReadyAccount.send_room.safety?.activation_prospect_requires_post, true);
      }
      assert.equal(typeof sendReadyAccount.send_room?.delivery_audit?.sent_count, "number");
      assert.equal(typeof sendReadyAccount.send_room?.delivery_audit?.reply_count, "number");
      assert.equal(sendReadyAccount.send_room?.post_send_plan?.status, "ready_after_manual_outreach");
      if (sendReadyAccount.send_room?.post_send_plan?.manual_sent_recorder) {
        assert.equal(sendReadyAccount.send_room.post_send_plan.manual_sent_recorder.method, "POST");
      }
      if (sendReadyAccount.send_room?.post_send_plan?.reply_capture_action) {
        assert.equal(sendReadyAccount.send_room.post_send_plan.reply_capture_action.method, "POST");
      }
      assert.equal(sendReadyAccount.send_room?.post_send_plan?.paid_enrichment_needed_now, 0);
      assert.equal(sendReadyAccount.send_room?.proof_effect?.paid_enrichment_needed_now, 0);
      assert.equal(sendReadyAccount.send_room?.safety?.sends_external_email_on_get, false);
      assert.equal(sendReadyAccount.send_room?.safety?.paid_provider_lookup_by_default, false);
    }
    const firstFiveOutreachMarkdown = await request("/api/v1/outreach/first-five?format=markdown", { auth: true });
    assert.equal(firstFiveOutreachMarkdown.status, 200);
    const firstFiveOutreachMarkdownText = await firstFiveOutreachMarkdown.text();
    assert.match(firstFiveOutreachMarkdownText, /# First Five Beta Outreach/);
    assert.match(firstFiveOutreachMarkdownText, /Paid lookups recommended now: 0/);
    if (firstFiveOutreach.target_accounts?.length) {
      assert.match(firstFiveOutreachMarkdownText, /Manual mailto draft: mailto:/);
      if (firstFiveOutreach.summary?.manual_sent_recorders > 0) {
        assert.match(firstFiveOutreachMarkdownText, /Manual sent POST:/);
      }
      if (firstFiveOutreach.summary?.activation_reply_capture_actions > 0) {
        assert.match(firstFiveOutreachMarkdownText, /Activation prospect POST:/);
      }
      assert.match(firstFiveOutreachMarkdownText, /Outreach sent records:/);
      assert.match(firstFiveOutreachMarkdownText, /Outreach reply records:/);
      assert.match(firstFiveOutreachMarkdownText, /Post-send plan:/);
    }

    const proofLedgerPage = await request("/launch/proof-ledger", { auth: true });
    assert.equal(proofLedgerPage.status, 200);
    const proofLedgerHtml = await proofLedgerPage.text();
    assert.match(proofLedgerHtml, /Launch proof ledger/);
    assert.match(proofLedgerHtml, /Evidence checklist for clearing buyer confirmation, install proof, first profile, CRM handoff, rep feedback, and live-proof gates/);
    assert.match(proofLedgerHtml, /No email send, buyer-confirmation completion, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs here/i);

    const proofLedger = await json("/api/v1/launch/proof-ledger", { auth: true });
    assert.equal(proofLedger.type, "deal_threads.launch_proof_ledger.v1");
    assert.equal(proofLedger.summary.total_items, proofLedger.entries?.length || 0);
    assert.equal(proofLedger.summary.blocker, proofLedger.entries.filter((entry) => entry.status === "blocker").length);
    assert.equal(proofLedger.summary.paid_lookups_recommended_now, 0);
    assert.equal(proofLedger.safety?.sends_external_email_on_get, false);
    assert.equal(proofLedger.safety?.marks_buyer_confirmation_complete_on_get, false);
    assert.equal(proofLedger.safety?.creates_beta_client_on_get, false);
    assert.equal(proofLedger.safety?.transmits_external_crm_on_get, false);
    assert.equal(proofLedger.safety?.paid_provider_lookup_by_default, false);
    assert.equal(proofLedger.safety?.live_proof_claimed, false);
    assert.ok(proofLedger.entries?.some((entry) => entry.key === "buyer_confirmation"));
    assert.ok(proofLedger.entries?.some((entry) => entry.key === "client_domain_install" && /Hosted\/test loads do not satisfy|Hosted\/test loads do not count|buyer.s own target page/i.test(entry.proof_condition)));
    assert.ok(proofLedger.entries?.some((entry) => entry.key === "live_proof_gate"));
    const proofLedgerMarkdown = await request("/api/v1/launch/proof-ledger?format=markdown", { auth: true });
    assert.equal(proofLedgerMarkdown.status, 200);
    const proofLedgerMarkdownText = await proofLedgerMarkdown.text();
    assert.match(proofLedgerMarkdownText, /# Deal Threads Launch Proof Ledger/);
    assert.match(proofLedgerMarkdownText, /Paid lookups recommended now: 0/);
    assert.match(proofLedgerMarkdownText, /GET marks buyer confirmation complete: no/);

    const proofHandoffPage = await request("/launch/proof-handoff", { auth: true });
    assert.equal(proofHandoffPage.status, 200);
    const proofHandoffHtml = await proofHandoffPage.text();
	    assert.match(proofHandoffHtml, /Launch proof owner handoff/);
	    assert.match(proofHandoffHtml, /Copy-ready stakeholder asks generated from the proof ledger/);
	    assert.match(proofHandoffHtml, /Open email draft/);
	    assert.match(proofHandoffHtml, /Mark manual handoff sent/);
	    assert.match(proofHandoffHtml, /No email send, buyer-confirmation completion, beta-client creation, CRM transmission, paid lookup, or live-proof claim runs on GET/i);

    const proofHandoff = await json("/api/v1/launch/proof-handoff", { auth: true });
    assert.equal(proofHandoff.type, "deal_threads.launch_proof_owner_handoff.v1");
	    assert.equal(proofHandoff.summary.open_items, proofLedger.summary.open_items);
	    assert.equal(proofHandoff.summary.paid_lookups_recommended_now, 0);
	    assert.equal(proofHandoff.summary.mailto_drafts, proofHandoff.groups?.length || 0);
	    assert.equal(typeof proofHandoff.summary.manual_sent_records, "number");
	    assert.equal(proofHandoff.safety?.sends_external_email_on_get, false);
    assert.equal(proofHandoff.safety?.marks_buyer_confirmation_complete_on_get, false);
    assert.equal(proofHandoff.safety?.creates_beta_client_on_get, false);
    assert.equal(proofHandoff.safety?.transmits_external_crm_on_get, false);
    assert.equal(proofHandoff.safety?.paid_provider_lookup_by_default, false);
    assert.equal(proofHandoff.safety?.live_proof_claimed, false);
    if (proofLedger.summary.open_items) {
	      assert.ok(proofHandoff.groups?.length >= 1, "Expected owner handoff groups for open proof items");
	      assert.ok(proofHandoff.groups.some((group) => /Proof ledger:/i.test(group.body)));
	      assert.ok(proofHandoff.groups.every((group) => group.mailto_url?.startsWith("mailto:")));
	      assert.ok(proofHandoff.groups.every((group) => group.manual_sent_action?.method === "POST"));
	      assert.ok(proofHandoff.groups.every((group) => group.manual_sent_action?.sends_from_server === false));
	      assert.ok(proofHandoff.groups.every((group) => group.manual_sent_action?.preview_only_on_get === true));
	      assert.ok(proofHandoff.groups.some((group) => group.items?.some((item) => item.key)));
	    }
    const proofHandoffMarkdown = await request("/api/v1/launch/proof-handoff?format=markdown", { auth: true });
    assert.equal(proofHandoffMarkdown.status, 200);
    const proofHandoffMarkdownText = await proofHandoffMarkdown.text();
	    assert.match(proofHandoffMarkdownText, /# Deal Threads Launch Proof Owner Handoff/);
	    assert.match(proofHandoffMarkdownText, /Mailto draft: mailto:/);
	    assert.match(proofHandoffMarkdownText, /Manual sent POST: .*\/api\/v1\/launch\/proof-handoff\/[a-z0-9_]+\/sent/);
	    assert.match(proofHandoffMarkdownText, /Paid lookups recommended now: 0/);
    assert.match(proofHandoffMarkdownText, /GET marks buyer confirmation complete: no/);

    let closePacket = null;
    let confirmationNudge = null;
    let activationRunbook = null;
    if (activation.prospects?.[0]?.lead_id) {
      assert.match(html, /name="returnTo" value="\/activation"/);
      assert.match(html, /Activation runbook/);
      assert.match(html, /Prospect close packet/);
      assert.match(html, /Send close packet/);
      assert.match(html, /Confirmation nudge packet/);
      assert.match(html, /Send confirmation nudge/);
      assert.match(html, /Kick off beta install/);
      assert.ok(["not_sent", "sent", "collecting_details", "confirmed"].includes(activation.prospects[0].close_workflow?.status));
      assert.ok(["not_sent", "sent", "failed"].includes(activation.prospects[0].close_workflow?.close_packet_delivery?.status || "not_sent"));
      assert.ok(["not_sent", "sent", "failed"].includes(activation.prospects[0].close_workflow?.confirmation_nudge_delivery?.status || "not_sent"));
      assert.ok(followUps.queue?.some((item) => item.lead_id === activation.prospects[0].lead_id));
      activationRunbook = await json(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/runbook`, { auth: true });
      assert.equal(activationRunbook.type, "deal_threads.activation_prospect_runbook");
      assert.ok(["close_packet_ready", "confirmation_needed", "awaiting_buyer_confirmation", "kickoff_ready"].includes(activationRunbook.status));
      assert.match(activationRunbook.current_operator_action || "", /close packet|confirmation|Kick off beta install/i);
      assert.ok(activationRunbook.steps?.some((step) => step.key === "send_close_packet"));
      assert.ok(activationRunbook.steps?.some((step) => step.key === "kickoff_beta_install"));
      assert.equal(activationRunbook.safety?.mutates_buyer_state_on_get, false);
      assert.equal(activationRunbook.safety?.sends_external_email_on_get, false);
      assert.equal(activationRunbook.safety?.creates_beta_client_on_get, false);
      assert.equal(activationRunbook.providerless_enrichment_posture?.paid_lookup_allowed_by_default, false);
	      assert.match(activationRunbook.public_links?.proof_preview || "", /\/proof-preview$/);
	      assert.match(activationRunbook.protected_links?.confirmation_workbench || "", /\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-workbench$/);
	      assert.match(activationRunbook.protected_links?.stakeholder_handoff || "", /\/activation\/prospects\/lead_[a-f0-9-]+\/stakeholder-handoff$/);
	      const activationRunbookMarkdown = await request(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/runbook?format=markdown`, { auth: true });
      assert.equal(activationRunbookMarkdown.status, 200);
      assert.match(await activationRunbookMarkdown.text(), /## Current Operator Action/);
      const confirmationWorkbenchPage = await request(`/activation/prospects/${activation.prospects[0].lead_id}/confirmation-workbench`, { auth: true });
      assert.equal(confirmationWorkbenchPage.status, 200);
      const confirmationWorkbenchHtml = await confirmationWorkbenchPage.text();
      assert.match(confirmationWorkbenchHtml, /Buyer confirmation workbench/);
      assert.match(confirmationWorkbenchHtml, /Kickoff preflight/);
      assert.match(confirmationWorkbenchHtml, /Kickoff checklist/);
      assert.match(confirmationWorkbenchHtml, /Manual confirmation capture/);
      assert.match(confirmationWorkbenchHtml, /Reply preview/);
      assert.match(confirmationWorkbenchHtml, /GET is read-only: no email sends, buyer-state mutation, beta-client creation, CRM transmission, live-proof claim, or paid enrichment runs here/i);
      const confirmationWorkbench = await json(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/confirmation-workbench`, { auth: true });
      assert.equal(confirmationWorkbench.type, "deal_threads.activation_confirmation_workbench.v1");
      assert.ok(["send_close_packet", "nudge_due", "overdue_confirmation", "waiting_on_buyer", "ready_for_kickoff"].includes(confirmationWorkbench.status));
      assert.ok(["blocked", "ready", "already_converted"].includes(confirmationWorkbench.kickoff_preflight?.status));
      assert.equal(confirmationWorkbench.kickoff_preflight?.summary?.launch_recipients >= 0, true);
      assert.ok(confirmationWorkbench.kickoff_preflight?.checks?.some((check) => check.key === "buyer_confirmation"));
      assert.ok(confirmationWorkbench.kickoff_preflight?.market_gate_effect?.some((item) => item.key === "client_domain_install"));
      assert.ok(confirmationWorkbench.kickoff_preflight?.after_kickoff_steps?.some((step) => /client-domain widget config proof/i.test(step)));
      assert.match(confirmationWorkbench.public_links?.buyer_confirmation || "", /\/confirm\/pcf_[a-f0-9]+$/);
      assert.match(confirmationWorkbench.public_links?.buyer_confirmation_status || "", /\/confirm\/pcf_[a-f0-9]+\/status$/);
      assert.match(confirmationWorkbench.public_links?.buyer_confirmation_request_kit || "", /\/confirm\/pcf_[a-f0-9]+\/request-kit$/);
      assert.match(confirmationWorkbench.public_links?.pilot_acceptance || "", /\/confirm\/pcf_[a-f0-9]+\/acceptance$/);
      assert.match(confirmationWorkbench.protected_links?.pilot_acceptance_api || "", /\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/pilot-acceptance$/);
      assert.equal(typeof confirmationWorkbench.summary?.pilot_accepted, "boolean");
      assert.ok(["needs_acceptance", "accepted"].includes(confirmationWorkbench.summary?.pilot_acceptance_status));
      assert.equal(confirmationWorkbench.pilot_acceptance_room?.summary?.transmits_payment_data, false);
      assert.match(confirmationWorkbench.email_draft?.body || "", /Request kit:/);
      assert.equal(confirmationWorkbench.safety?.mutates_buyer_state_on_get, false);
      assert.equal(confirmationWorkbench.safety?.sends_external_email_on_get, false);
      assert.equal(confirmationWorkbench.safety?.creates_beta_client_on_get, false);
      assert.equal(confirmationWorkbench.safety?.transmits_external_crm_on_get, false);
      assert.equal(confirmationWorkbench.safety?.paid_provider_lookup_by_default, false);
      assert.equal(confirmationWorkbench.safety?.live_proof_claimed, false);
      const confirmationWorkbenchMarkdown = await request(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/confirmation-workbench?format=markdown`, { auth: true });
      assert.equal(confirmationWorkbenchMarkdown.status, 200);
      const confirmationWorkbenchMarkdownText = await confirmationWorkbenchMarkdown.text();
      assert.match(confirmationWorkbenchMarkdownText, /# Deal Threads Buyer Confirmation Workbench/);
	      assert.match(confirmationWorkbenchMarkdownText, /## Kickoff Preflight/);
	      assert.match(confirmationWorkbenchMarkdownText, /Pilot acceptance:/);
	      assert.match(confirmationWorkbenchMarkdownText, /GET sends external email: no/);
	      const replyPreviewPage = await request(`/activation/prospects/${activation.prospects[0].lead_id}/confirmation-reply`, { auth: true });
	      assert.equal(replyPreviewPage.status, 200);
	      const replyPreviewHtml = await replyPreviewPage.text();
	      assert.match(replyPreviewHtml, /Confirmation reply preview/);
	      assert.match(replyPreviewHtml, /Preview is read-only/);
	      const buyerReply = [
	        "Confirmed for Deal Threads.",
	        "Target page: https://launchready.example.com/demo",
	        "Website owner: Web Ops <web@launchready.example.com>",
	        "CRM owner: crm@launchready.example.com",
	        "Routing owner: ae@launchready.example.com",
	        "Proof report recipients: crm@launchready.example.com, revops@launchready.example.com",
	        "Old form baseline: first touch 45 minutes, meeting rate 18%, opportunity rate 7%, win rate 21%, sales cycle 47 days."
	      ].join("\n");
	      const replyPreview = await json(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/confirmation-reply-preview`, {
	        auth: true,
	        method: "POST",
	        body: { replyText: buyerReply }
	      });
	      assert.equal(replyPreview.type, "deal_threads.confirmation_reply_preview.v1");
	      assert.equal(replyPreview.status, "ready_to_apply");
		      assert.equal(replyPreview.summary?.ready_for_confirmation, true);
		      assert.equal(replyPreview.summary?.paid_lookups_recommended_now, 0);
		      assert.equal(replyPreview.review_summary?.checklist_status, "ready");
		      assert.equal(replyPreview.review_summary?.requires_operator_acknowledgement, true);
		      assert.equal(replyPreview.reply_evidence_receipt?.type, "deal_threads.confirmation_reply_evidence_receipt.v1");
		      assert.equal(replyPreview.reply_evidence_receipt?.source, "confirmation_reply_preview");
		      assert.ok(replyPreview.reply_evidence_receipt?.field_evidence_keys?.includes("targetPageUrl"));
		      assert.ok(replyPreview.reply_evidence_receipt?.applied_payload_keys?.includes("targetPageUrl"));
		      assert.equal(replyPreview.reply_evidence_receipt?.safety?.apply_requires_post, true);
		      assert.equal(replyPreview.reply_evidence_receipt?.safety?.paid_provider_lookup, false);
		      assert.ok(replyPreview.review_checklist?.some((item) => item.key === "paid_lookup_guardrail" && item.status === "pass"));
		      assert.ok(replyPreview.apply_action?.required_form_fields?.includes("operatorReviewComplete"));
		      assert.ok(replyPreview.apply_action?.required_form_fields?.includes("replyEvidenceReceiptJson"));
		      assert.equal(replyPreview.suggested_payload?.targetPageUrl, "https://launchready.example.com/demo");
	      assert.equal(replyPreview.suggested_payload?.implementationOwnerEmail, "web@launchready.example.com");
	      assert.equal(replyPreview.suggested_payload?.crmOwnerEmail, "crm@launchready.example.com");
	      assert.equal(replyPreview.suggested_payload?.routingOwnerEmail, "ae@launchready.example.com");
	      assert.equal(replyPreview.safety?.preview_mutates_state, false);
	      assert.equal(replyPreview.safety?.apply_requires_post, true);
	      assert.equal(replyPreview.safety?.paid_provider_lookup_by_default, false);
	      const replyPreviewMarkdown = await request(
	        `/api/v1/activation/prospects/${activation.prospects[0].lead_id}/confirmation-reply-preview?format=markdown&replyText=${encodeURIComponent(buyerReply)}`,
	        { auth: true }
	      );
	      assert.equal(replyPreviewMarkdown.status, 200);
	      const replyPreviewMarkdownText = await replyPreviewMarkdown.text();
		      assert.match(replyPreviewMarkdownText, /# Deal Threads Confirmation Reply Preview/);
		      assert.match(replyPreviewMarkdownText, /## Reply Evidence Receipt/);
		      assert.match(replyPreviewMarkdownText, /Receipt apply requires POST: yes/);
		      assert.match(replyPreviewMarkdownText, /## Review Checklist/);
		      assert.match(replyPreviewMarkdownText, /Preview mutates state: no/);
		      assert.match(replyPreviewMarkdownText, /Apply requires POST: yes/);
		      assert.match(replyPreviewMarkdownText, /Apply requires operator acknowledgement: yes/);
	      const stakeholderHandoffPage = await request(`/activation/prospects/${activation.prospects[0].lead_id}/stakeholder-handoff`, { auth: true });
	      assert.equal(stakeholderHandoffPage.status, 200);
	      const stakeholderHandoffHtml = await stakeholderHandoffPage.text();
	      assert.match(stakeholderHandoffHtml, /Stakeholder handoff pack/);
	      assert.match(stakeholderHandoffHtml, /Buyer-safe copy blocks/);
	      assert.match(stakeholderHandoffHtml, /GET is read-only: no email sends, buyer-state mutation, beta-client creation, CRM transmission, live-proof claim, or paid enrichment runs here/i);
	      const stakeholderHandoff = await json(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/stakeholder-handoff`, { auth: true });
	      assert.equal(stakeholderHandoff.type, "deal_threads.activation_stakeholder_handoff_pack.v1");
	      assert.ok(["send_close_packet", "nudge_due", "overdue_confirmation", "waiting_on_buyer", "ready_for_kickoff"].includes(stakeholderHandoff.status));
	      assert.equal(stakeholderHandoff.summary?.paid_lookups_recommended_now, 0);
	      assert.ok(stakeholderHandoff.stakeholder_asks?.some((ask) => ask.key === "website_owner"));
	      assert.match(stakeholderHandoff.buyer_safe_links?.confirmation_form || "", /\/confirm\/pcf_[a-f0-9]+$/);
	      assert.match(stakeholderHandoff.buyer_safe_links?.status_room || "", /\/confirm\/pcf_[a-f0-9]+\/status$/);
	      assert.match(stakeholderHandoff.buyer_safe_links?.request_kit || "", /\/confirm\/pcf_[a-f0-9]+\/request-kit$/);
	      assert.match(stakeholderHandoff.copy_blocks?.champion_note?.body || "", /Confirmation form:/);
	      assert.match(stakeholderHandoff.copy_blocks?.security_procurement_note?.body || "", /No paid enrichment lookup or live CRM write is required/);
	      assert.equal(stakeholderHandoff.safety?.mutates_buyer_state_on_get, false);
	      assert.equal(stakeholderHandoff.safety?.sends_external_email_on_get, false);
	      assert.equal(stakeholderHandoff.safety?.creates_beta_client_on_get, false);
	      assert.equal(stakeholderHandoff.safety?.transmits_external_crm_on_get, false);
	      assert.equal(stakeholderHandoff.safety?.paid_provider_lookup_by_default, false);
	      assert.equal(stakeholderHandoff.safety?.live_proof_claimed, false);
	      const stakeholderHandoffMarkdown = await request(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/stakeholder-handoff?format=markdown`, { auth: true });
	      assert.equal(stakeholderHandoffMarkdown.status, 200);
	      const stakeholderHandoffMarkdownText = await stakeholderHandoffMarkdown.text();
	      assert.match(stakeholderHandoffMarkdownText, /# Deal Threads Stakeholder Handoff Pack/);
	      assert.match(stakeholderHandoffMarkdownText, /GET sends external email: no/);
	      closePacket = await json(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/close-packet`, { auth: true });
      assert.equal(closePacket.status, "prospect_close_ready");
      assert.match(closePacket.subject, /14-day Deal Threads beta pilot/);
      assert.match(closePacket.public_links?.pilot_close_kit || "", /\/pilot-close-kit$/);
      assert.match(closePacket.public_links?.pilot_approval_room || "", /\/pilot-approval-room$/);
      assert.match(closePacket.public_links?.mutual_action_plan || "", /\/mutual-action-plan$/);
      assert.match(closePacket.public_links?.buyer_confirmation_guide || "", /\/buyer-confirmation-guide$/);
      assert.match(closePacket.public_links?.stakeholder_forwarding_kit || "", /\/stakeholder-forwarding-kit$/);
      assert.match(closePacket.public_links?.pilot_agreement || "", /\/pilot-agreement$/);
      assert.match(closePacket.public_links?.buyer_confirmation || "", /\/confirm\/pcf_[a-f0-9]+$/);
      assert.match(closePacket.public_links?.buyer_confirmation_status || "", /\/confirm\/pcf_[a-f0-9]+\/status$/);
      assert.match(closePacket.public_links?.buyer_confirmation_approval_brief || "", /\/confirm\/pcf_[a-f0-9]+\/brief$/);
      assert.match(closePacket.public_links?.buyer_confirmation_request_kit || "", /\/confirm\/pcf_[a-f0-9]+\/request-kit$/);
      assert.match(closePacket.public_links?.pilot_acceptance || "", /\/confirm\/pcf_[a-f0-9]+\/acceptance$/);
      assert.match(closePacket.public_links?.security_center || "", /\/security$/);
      assert.match(closePacket.public_links?.sample_profile || "", /\/sample-profile$/);
      assert.match(closePacket.email_body || "", /Buyer confirmation form/);
      assert.match(closePacket.email_body || "", /Approval brief/);
	      assert.match(closePacket.email_body || "", /Buyer confirmation request kit:|Request kit:/);
      assert.match(closePacket.email_body || "", /Approval room/);
      assert.match(closePacket.email_body || "", /Mutual action plan/);
      assert.match(closePacket.email_body || "", /Buyer confirmation guide/);
      assert.match(closePacket.email_body || "", /Stakeholder forwarding kit/);
      assert.match(closePacket.email_body || "", /Pilot acceptance/);
      confirmationNudge = await json(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/confirmation-nudge`, { auth: true });
      assert.ok(["buyer_confirmation_nudge_ready", "confirmation_already_received"].includes(confirmationNudge.status));
      assert.match(confirmationNudge.subject, /Confirm .*Deal Threads pilot details/);
      assert.match(confirmationNudge.public_links?.buyer_confirmation || "", /\/confirm\/pcf_[a-f0-9]+$/);
      assert.match(confirmationNudge.public_links?.buyer_confirmation_status || "", /\/confirm\/pcf_[a-f0-9]+\/status$/);
      assert.match(confirmationNudge.public_links?.buyer_confirmation_approval_brief || "", /\/confirm\/pcf_[a-f0-9]+\/brief$/);
      assert.match(confirmationNudge.public_links?.buyer_confirmation_request_kit || "", /\/confirm\/pcf_[a-f0-9]+\/request-kit$/);
      assert.match(confirmationNudge.public_links?.pilot_acceptance || "", /\/confirm\/pcf_[a-f0-9]+\/acceptance$/);
      assert.match(confirmationNudge.public_links?.buyer_confirmation_guide || "", /\/buyer-confirmation-guide$/);
      assert.match(confirmationNudge.public_links?.stakeholder_forwarding_kit || "", /\/stakeholder-forwarding-kit$/);
      assert.match(confirmationNudge.public_links?.mutual_action_plan || "", /\/mutual-action-plan$/);
      assert.match(confirmationNudge.public_links?.implementation_guide || "", /\/implementation-guide$/);
      assert.match(confirmationNudge.public_links?.crm_handoff_guide || "", /\/crm-handoff-guide$/);
      assert.match(confirmationNudge.email_body || "", /providerless enrichment/i);
      assert.match(confirmationNudge.email_body || "", /buyer confirmation form/i);
      assert.match(confirmationNudge.email_body || "", /Approval brief:/);
      assert.match(confirmationNudge.email_body || "", /Status room/i);
      assert.match(confirmationNudge.email_body || "", /Request kit:/);
      assert.match(confirmationNudge.email_body || "", /Quick reply fallback:/);
      assert.match(confirmationNudge.email_body || "", /Approval: these details are approved for the 14-day pilot kickoff/);
      assert.equal(confirmationNudge.quick_reply_template?.enabled, true);
      assert.match(confirmationNudge.quick_reply_template?.body || "", /Target page:/);
      assert.match(confirmationNudge.quick_reply_template?.body || "", /Implementation owner:/);
      assert.match(confirmationNudge.quick_reply_template?.protected_reply_preview_url || "", /\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-reply$/);
      assert.equal(confirmationNudge.quick_reply_template?.apply_requires_operator_post, true);
      assert.equal(confirmationNudge.quick_reply_template?.runs_paid_enrichment, false);
      assert.match(confirmationNudge.email_body || "", /Buyer confirmation guide/);
      assert.match(confirmationNudge.email_body || "", /Stakeholder forwarding kit/);
      assert.match(confirmationNudge.email_body || "", /Pilot acceptance/);
      const confirmationNudgeMarkdown = await request(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/confirmation-nudge?format=markdown`, { auth: true });
      assert.equal(confirmationNudgeMarkdown.status, 200);
      const confirmationNudgeMarkdownText = await confirmationNudgeMarkdown.text();
      assert.match(confirmationNudgeMarkdownText, /## Confirmation Link/);
      assert.match(confirmationNudgeMarkdownText, /## Quick Reply Fallback/);
      assert.match(confirmationNudgeMarkdownText, /Protected reply preview:/);
      assert.match(confirmationNudgeMarkdownText, /Buyer confirmation approval brief:/);
      assert.match(confirmationNudgeMarkdownText, /Buyer confirmation request kit:/);
      const confirmationPath = new URL(closePacket.public_links.buyer_confirmation).pathname;
      const confirmationPage = await request(confirmationPath);
      assert.equal(confirmationPage.status, 200);
      const confirmationHtml = await confirmationPage.text();
      assert.match(confirmationHtml, /Deal Threads pilot confirmation/);
      assert.match(confirmationHtml, /Confirm pilot handoff details/);
      assert.match(confirmationHtml, /Approval room/);
      assert.match(confirmationHtml, /Mutual action plan/);
      assert.match(confirmationHtml, /Buyer confirmation guide|Confirmation guide/);
      assert.match(confirmationHtml, /Stakeholder forwarding kit|Forwarding kit/);
      assert.match(confirmationHtml, /Paid enrichment/);
      assert.doesNotMatch(confirmationHtml, /\/crm\//);
      assert.doesNotMatch(confirmationHtml, /Operator config/);
      const confirmationApprovalBriefPath = new URL(closePacket.public_links.buyer_confirmation_approval_brief).pathname;
      const approvalBriefPage = await request(confirmationApprovalBriefPath);
      assert.equal(approvalBriefPage.status, 200);
      const approvalBriefHtml = await approvalBriefPage.text();
      assert.match(approvalBriefHtml, /Buyer approval brief/);
      assert.match(approvalBriefHtml, /Decision brief/);
      assert.match(approvalBriefHtml, /Approval options/);
      assert.match(approvalBriefHtml, /Copy-ready approval reply/);
      assert.match(approvalBriefHtml, /After approval/);
      assert.match(approvalBriefHtml, /This tokenized approval brief is read-only/);
      assert.doesNotMatch(approvalBriefHtml, /\/crm\//);
      assert.doesNotMatch(approvalBriefHtml, /\/admin/);
      assert.doesNotMatch(approvalBriefHtml, /\/api\/v1/);
      const approvalBrief = await json(`${confirmationApprovalBriefPath}?format=json`);
      assert.equal(approvalBrief.type, "deal_threads.public_buyer_confirmation_approval_brief.v1");
      assert.equal(approvalBrief.summary?.paid_lookups_recommended_now, 0);
      assert.ok(approvalBrief.approval_options?.some((option) => option.key === "submit_form"));
      assert.ok(approvalBrief.next_proof_steps?.some((step) => step.key === "create_real_beta_client"));
      assert.equal(approvalBrief.public_safety?.read_only_get, true);
      assert.equal(approvalBrief.public_safety?.exposes_operator_forms, false);
      assert.equal(approvalBrief.public_safety?.exposes_crm_profiles, false);
      assert.equal(approvalBrief.public_safety?.mutates_buyer_state, false);
      assert.equal(approvalBrief.public_safety?.creates_beta_client, false);
      assert.equal(approvalBrief.public_safety?.sends_external_email, false);
      assert.equal(approvalBrief.public_safety?.transmits_external_data, false);
      assert.equal(approvalBrief.public_safety?.runs_paid_enrichment, false);
      assert.equal(approvalBrief.public_safety?.claims_live_results, false);
      assert.equal(JSON.stringify(approvalBrief).includes("/crm/"), false);
      assert.equal(JSON.stringify(approvalBrief).includes("/api/v1/"), false);
      const approvalBriefMarkdown = await request(`${confirmationApprovalBriefPath}?format=markdown`);
      assert.equal(approvalBriefMarkdown.status, 200);
      const approvalBriefMarkdownText = await approvalBriefMarkdown.text();
      assert.match(approvalBriefMarkdownText, /# Deal Threads Buyer Approval Brief/);
      assert.match(approvalBriefMarkdownText, /## Approval Reply/);
      assert.match(approvalBriefMarkdownText, /Runs paid enrichment: no/);
      assert.match(approvalBriefMarkdownText, /Claims live proof: no/);
      const confirmationStatusPath = new URL(closePacket.public_links.buyer_confirmation_status).pathname;
      const confirmationStatusPage = await request(confirmationStatusPath);
      assert.equal(confirmationStatusPage.status, 200);
      const confirmationStatusHtml = await confirmationStatusPage.text();
      assert.match(confirmationStatusHtml, /Buyer confirmation status/);
      assert.match(confirmationStatusHtml, /One-minute approval shortcut|confirmed waiting install handoff|Wait for Deal Threads kickoff/i);
      assert.match(confirmationStatusHtml, /Copy-ready approval reply|Buyer confirmation details are complete|confirmed details/i);
      assert.match(confirmationStatusHtml, /Approval: these details are approved for the 14-day pilot kickoff|Deal Threads can issue the install handoff/i);
      assert.match(confirmationStatusHtml, /This shortcut is read-only|Loading it does not send email/i);
      assert.match(confirmationStatusHtml, /Post-approval launch preview/);
      assert.match(confirmationStatusHtml, /Launch sequence after approval/);
      assert.match(confirmationStatusHtml, /Capture client-domain install proof/);
      assert.match(confirmationStatusHtml, /This preview is read-only/);
      assert.match(confirmationStatusHtml, /Finish missing details|Buyer confirmation details are complete|confirmed details/i);
      if (/Finish missing details/i.test(confirmationStatusHtml)) {
        assert.match(confirmationStatusHtml, /name="action" value="confirm"/);
        assert.match(confirmationStatusHtml, /name="targetPageUrl" type="url"/);
        assert.match(confirmationStatusHtml, /name="implementationOwnerEmail" type="email"/);
        assert.match(confirmationStatusHtml, /name="reportRecipients" type="text"/);
        assert.match(confirmationStatusHtml, /Finish buyer confirmation/);
        assert.match(confirmationStatusHtml, /Save progress without confirming/);
        assert.match(confirmationStatusHtml, /name="action" value="save_progress" formnovalidate/);
      }
      assert.match(confirmationStatusHtml, /Required details/);
      assert.match(confirmationStatusHtml, /Old-form baseline quick save/);
      assert.match(confirmationStatusHtml, /name="baselineFirstTouchMinutes" type="number"/);
      assert.match(confirmationStatusHtml, /name="baselineMeetingRate" type="number"/);
      assert.match(confirmationStatusHtml, /name="baselineOpportunityRate" type="number"/);
      assert.match(confirmationStatusHtml, /name="baselineWinRate" type="number"/);
      assert.match(confirmationStatusHtml, /name="baselineSalesCycleDays" type="number"/);
      assert.match(confirmationStatusHtml, /name="baselineNotes"/);
      assert.match(confirmationStatusHtml, /Save old-form baseline progress/);
      assert.match(confirmationStatusHtml, /Loading it does not send email, create a beta client, mutate buyer state, transmit CRM data, run paid enrichment, or claim live proof/i);
      assert.doesNotMatch(confirmationStatusHtml, /\/crm\//);
      assert.doesNotMatch(confirmationStatusHtml, /\/api\/v1/);
      const confirmationStatus = await json(`${confirmationStatusPath}?format=json`);
      assert.equal(confirmationStatus.type, "deal_threads.public_buyer_confirmation_status.v1");
      assert.ok(["available", "complete"].includes(confirmationStatus.one_minute_approval_shortcut?.status));
      assert.match(confirmationStatus.one_minute_approval_shortcut?.body || "", /Approval: these details are approved for the 14-day pilot kickoff/);
      assert.equal(confirmationStatus.one_minute_approval_shortcut?.safety?.sends_external_email, false);
      assert.equal(confirmationStatus.one_minute_approval_shortcut?.safety?.creates_beta_client, false);
      assert.equal(confirmationStatus.one_minute_approval_shortcut?.safety?.runs_paid_enrichment, false);
      assert.equal(confirmationStatus.one_minute_approval_shortcut?.safety?.claims_live_proof, false);
      assert.ok(["waiting_for_buyer_confirmation", "ready_for_operator_kickoff"].includes(confirmationStatus.post_approval_launch_preview?.status));
      assert.match(confirmationStatus.post_approval_launch_preview?.headline || "", /Approval unlocks the real beta-client install path|Approval is captured/i);
      assert.equal(confirmationStatus.post_approval_launch_preview?.expected_beta_client?.paid_enrichment_lookups_needed_now, 0);
      assert.ok(confirmationStatus.post_approval_launch_preview?.launch_sequence?.some((item) => item.key === "capture_client_domain_install"));
      assert.ok(confirmationStatus.post_approval_launch_preview?.launch_sequence?.some((item) => item.key === "review_live_proof_gate"));
      assert.equal(confirmationStatus.post_approval_launch_preview?.safety?.creates_beta_client, false);
      assert.equal(confirmationStatus.post_approval_launch_preview?.safety?.sends_external_email, false);
      assert.equal(confirmationStatus.post_approval_launch_preview?.safety?.transmits_crm_data, false);
      assert.equal(confirmationStatus.post_approval_launch_preview?.safety?.runs_paid_enrichment, false);
      assert.equal(confirmationStatus.post_approval_launch_preview?.safety?.claims_live_proof, false);
      assert.equal(confirmationStatus.post_approval_launch_preview?.safety?.exposes_operator_actions, false);
      assert.equal(confirmationStatus.finish_confirmation_form?.action_value, "confirm");
      assert.equal(confirmationStatus.finish_confirmation_form?.submit_label, "Finish buyer confirmation");
      assert.equal(confirmationStatus.finish_confirmation_form?.progress_save_action?.action_value, "save_progress");
      assert.equal(confirmationStatus.finish_confirmation_form?.progress_save_action?.submit_label, "Save progress without confirming");
      assert.equal(confirmationStatus.finish_confirmation_form?.progress_save_action?.safety?.sends_external_email_on_submit, false);
      assert.equal(confirmationStatus.finish_confirmation_form?.progress_save_action?.safety?.creates_beta_client_on_submit, false);
      assert.equal(confirmationStatus.finish_confirmation_form?.progress_save_action?.safety?.paid_provider_lookup_on_submit, false);
      assert.deepEqual(
        confirmationStatus.finish_confirmation_form?.fields?.map((field) => field.name),
        ["targetPageUrl", "implementationOwnerName", "implementationOwnerEmail", "crmOwnerEmail", "routingOwnerEmail", "reportRecipients"]
      );
      assert.equal(confirmationStatus.finish_confirmation_form?.safety?.mutates_buyer_state_on_submit, true);
      assert.equal(confirmationStatus.finish_confirmation_form?.safety?.may_send_external_email_on_submit, true);
      assert.equal(confirmationStatus.finish_confirmation_form?.safety?.transmits_crm_data_on_submit, false);
      assert.equal(confirmationStatus.finish_confirmation_form?.safety?.paid_provider_lookup_on_submit, false);
      assert.equal(confirmationStatus.finish_confirmation_form?.safety?.live_proof_claimed_on_submit, false);
      assert.equal(confirmationStatus.baseline_quick_save_form?.action_value, "save_progress");
      assert.equal(confirmationStatus.baseline_quick_save_form?.submit_label, "Save old-form baseline progress");
      assert.deepEqual(
        confirmationStatus.baseline_quick_save_form?.fields?.map((field) => field.name),
        ["baselineFirstTouchMinutes", "baselineMeetingRate", "baselineOpportunityRate", "baselineWinRate", "baselineSalesCycleDays", "baselineNotes"]
      );
      assert.equal(confirmationStatus.baseline_quick_save_form?.safety?.creates_beta_client_on_submit, false);
      assert.equal(confirmationStatus.baseline_quick_save_form?.safety?.paid_provider_lookup_on_submit, false);
      assert.equal(confirmationStatus.completion_payload?.type, "deal_threads.public_buyer_confirmation_completion_payload.v1");
      assert.equal(confirmationStatus.completion_payload?.summary?.missing_required_details, confirmationStatus.summary?.missing_required_details);
      assert.equal(confirmationStatus.completion_payload?.summary?.partial_save_available, true);
      assert.equal(confirmationStatus.completion_payload?.summary?.paid_lookups_recommended_now, 0);
      assert.match(confirmationStatus.completion_payload?.completion_reply?.body || "", /Target contact\/demo page URL:/);
      assert.equal(confirmationStatus.completion_payload?.safety?.sends_external_email_on_get, false);
      assert.equal(confirmationStatus.completion_payload?.safety?.creates_beta_client_on_get, false);
      assert.equal(confirmationStatus.completion_payload?.safety?.runs_paid_enrichment_on_get, false);
      assert.equal(confirmationStatus.safety?.mutates_buyer_state_on_get, false);
      assert.equal(confirmationStatus.safety?.sends_external_email_on_get, false);
      assert.equal(confirmationStatus.safety?.creates_beta_client_on_get, false);
      assert.equal(confirmationStatus.safety?.exposes_crm_profiles, false);
      assert.equal(confirmationStatus.safety?.exposes_operator_actions, false);
      assert.equal(confirmationStatus.safety?.exposes_tenant_exports, false);
      assert.equal(confirmationStatus.safety?.transmits_external_data_on_get, false);
      assert.equal(confirmationStatus.safety?.paid_provider_lookup_by_default, false);
      assert.equal(JSON.stringify(confirmationStatus).includes("/crm/"), false);
      assert.equal(JSON.stringify(confirmationStatus).includes("/api/v1/"), false);
      const confirmationStatusMarkdown = await request(`${confirmationStatusPath}?format=markdown`);
      assert.equal(confirmationStatusMarkdown.status, 200);
      const confirmationStatusMarkdownText = await confirmationStatusMarkdown.text();
      assert.match(confirmationStatusMarkdownText, /# Deal Threads Buyer Confirmation Status/);
      assert.match(confirmationStatusMarkdownText, /## One-Minute Approval Shortcut/);
      assert.match(confirmationStatusMarkdownText, /Approval: these details are approved for the 14-day pilot kickoff/);
      assert.match(confirmationStatusMarkdownText, /## Buyer Completion Payload/);
      assert.match(confirmationStatusMarkdownText, /GET runs paid enrichment: no/);
      assert.match(confirmationStatusMarkdownText, /## Post-Approval Launch Preview/);
      assert.match(confirmationStatusMarkdownText, /Capture client-domain install proof/);
      assert.match(confirmationStatusMarkdownText, /Creates beta client: no/);
      assert.match(confirmationStatusMarkdownText, /## Old-Form Baseline Quick Save/);
      assert.match(confirmationStatusMarkdownText, /GET mutates buyer state: no/);
      assert.doesNotMatch(confirmationStatusMarkdownText, /\/crm\//);
      const confirmationRequestKitPath = new URL(closePacket.public_links.buyer_confirmation_request_kit).pathname;
      const confirmationRequestKitPage = await request(confirmationRequestKitPath);
      assert.equal(confirmationRequestKitPage.status, 200);
      const confirmationRequestKitHtml = await confirmationRequestKitPage.text();
	      assert.match(confirmationRequestKitHtml, /Buyer confirmation request kit/);
	      assert.match(confirmationRequestKitHtml, /Website \/ implementation owner/);
		      assert.match(confirmationRequestKitHtml, /Forwardable copy/);
		      assert.match(confirmationRequestKitHtml, /Champion reply template/);
		      assert.match(confirmationRequestKitHtml, /Buyer completion payload/);
		      assert.match(confirmationRequestKitHtml, /Copy-ready completion reply/);
		      assert.match(confirmationRequestKitHtml, /Open email draft/);
		      assert.match(confirmationRequestKitHtml, /Save this stakeholder update/);
		      assert.match(confirmationRequestKitHtml, /name="action" value="save_progress"/);
		      assert.match(confirmationRequestKitHtml, /name="baselineFirstTouchMinutes" type="number"/);
		      assert.match(confirmationRequestKitHtml, /name="baselineMeetingRate" type="number"/);
		      assert.match(confirmationRequestKitHtml, /name="baselineOpportunityRate" type="number"/);
		      assert.match(confirmationRequestKitHtml, /name="baselineWinRate" type="number"/);
		      assert.match(confirmationRequestKitHtml, /name="baselineSalesCycleDays" type="number"/);
		      assert.match(confirmationRequestKitHtml, /name="baselineNotes"/);
		      assert.match(confirmationRequestKitHtml, /Save website \/ implementation update/);
		      assert.match(confirmationRequestKitHtml, /Save CRM \/ RevOps update/);
		      assert.match(confirmationRequestKitHtml, /Save routing update/);
		      assert.match(confirmationRequestKitHtml, /Save proof-recipient update/);
		      assert.match(confirmationRequestKitHtml, /stores partial buyer-confirmation progress only/i);
		      assert.match(confirmationRequestKitHtml, /Loading it does not send email, create a beta client, mutate buyer state, transmit CRM data, run paid enrichment, expose protected CRM\/operator links, or claim live proof/i);
		      assert.doesNotMatch(confirmationRequestKitHtml, /\/crm\//);
		      assert.doesNotMatch(confirmationRequestKitHtml, /(?:href|action)=["'][^"']*\/admin(?:[/?#]|["'])/);
	      assert.doesNotMatch(confirmationRequestKitHtml, /\/api\/v1/);
	      const confirmationRequestKit = await json(`${confirmationRequestKitPath}?format=json`);
	      assert.equal(confirmationRequestKit.type, "deal_threads.public_buyer_confirmation_request_kit.v1");
	      assert.ok(["stakeholder_input_needed", "ready_to_submit", "ready_for_confirmation_submit"].includes(confirmationRequestKit.status));
		      assert.ok(confirmationRequestKit.stakeholder_asks?.some((ask) => ask.key === "website_owner"));
	      assert.ok(confirmationRequestKit.stakeholder_asks?.some((ask) => ask.key === "crm_owner"));
	      assert.ok(confirmationRequestKit.stakeholder_asks?.some((ask) => ask.key === "routing_owner"));
		      assert.ok(confirmationRequestKit.stakeholder_asks?.some((ask) => ask.key === "proof_recipients"));
		      assert.match(confirmationRequestKit.champion_reply_template || "", /Target contact\/demo page URL:/);
		      assert.equal(confirmationRequestKit.completion_payload?.type, "deal_threads.public_buyer_confirmation_completion_payload.v1");
		      assert.equal(confirmationRequestKit.completion_payload?.summary?.stakeholder_asks_needed, confirmationRequestKit.summary?.stakeholder_asks_needed);
		      assert.equal(confirmationRequestKit.completion_payload?.summary?.paid_lookups_recommended_now, 0);
		      assert.match(confirmationRequestKit.completion_payload?.completion_reply?.body || "", /Proof report recipients:/);
		      assert.equal(confirmationRequestKit.completion_payload?.safety?.exposes_operator_actions, false);
		      assert.ok(confirmationRequestKit.stakeholder_asks?.every((ask) => ask.mailto_url?.startsWith("mailto:")));
		      assert.ok(confirmationRequestKit.stakeholder_asks?.every((ask) => Array.isArray(ask.recipients)));
		      const websiteAsk = confirmationRequestKit.stakeholder_asks.find((ask) => ask.key === "website_owner");
		      assert.equal(websiteAsk.partial_save_form?.action_value, "save_progress");
		      assert.ok(websiteAsk.partial_save_form?.fields?.some((field) => field.name === "targetPageUrl" && field.type === "url"));
		      assert.equal(websiteAsk.partial_save_form?.safety?.creates_beta_client_on_submit, false);
		      const proofAsk = confirmationRequestKit.stakeholder_asks.find((ask) => ask.key === "proof_recipients");
		      assert.deepEqual(
		        proofAsk.partial_save_form?.fields?.map((field) => field.name),
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
		      assert.ok(proofAsk.partial_save_form?.fields?.some((field) => field.name === "baselineNotes" && field.type === "textarea"));
		      assert.equal(confirmationRequestKit.partial_save?.action_value, "save_progress");
		      assert.equal(confirmationRequestKit.partial_save?.safety?.sends_external_email_on_submit, false);
		      assert.equal(confirmationRequestKit.partial_save?.safety?.transmits_crm_data_on_submit, false);
		      assert.equal(confirmationRequestKit.partial_save?.safety?.paid_provider_lookup_on_submit, false);
		      assert.equal(confirmationRequestKit.safety?.mutates_buyer_state_on_get, false);
	      assert.equal(confirmationRequestKit.safety?.sends_external_email_on_get, false);
      assert.equal(confirmationRequestKit.safety?.creates_beta_client_on_get, false);
      assert.equal(confirmationRequestKit.safety?.exposes_crm_profiles, false);
      assert.equal(confirmationRequestKit.safety?.exposes_operator_actions, false);
      assert.equal(confirmationRequestKit.safety?.exposes_tenant_exports, false);
      assert.equal(confirmationRequestKit.safety?.transmits_external_data_on_get, false);
      assert.equal(confirmationRequestKit.safety?.paid_provider_lookup_by_default, false);
      assert.equal(confirmationRequestKit.safety?.live_proof_claimed, false);
      assert.equal(JSON.stringify(confirmationRequestKit).includes("/crm/"), false);
      assert.equal(JSON.stringify(confirmationRequestKit).includes("/api/v1/"), false);
      const confirmationRequestKitMarkdown = await request(`${confirmationRequestKitPath}?format=markdown`);
      assert.equal(confirmationRequestKitMarkdown.status, 200);
	      const confirmationRequestKitMarkdownText = await confirmationRequestKitMarkdown.text();
	      assert.match(confirmationRequestKitMarkdownText, /# Deal Threads Buyer Confirmation Request Kit/);
	      assert.match(confirmationRequestKitMarkdownText, /## Champion Reply Template/);
	      assert.match(confirmationRequestKitMarkdownText, /## Buyer Completion Payload/);
	      assert.match(confirmationRequestKitMarkdownText, /Partial save available: yes/);
	      assert.match(confirmationRequestKitMarkdownText, /## Stakeholder Asks/);
	      assert.match(confirmationRequestKitMarkdownText, /Mailto draft: mailto:/);
      assert.match(confirmationRequestKitMarkdownText, /GET mutates buyer state: no/);
      assert.doesNotMatch(confirmationRequestKitMarkdownText, /\/crm\//);
      assert.doesNotMatch(confirmationRequestKitMarkdownText, /\/api\/v1/);
      const pilotAcceptancePath = new URL(closePacket.public_links.pilot_acceptance).pathname;
      const pilotAcceptancePage = await request(pilotAcceptancePath);
      assert.equal(pilotAcceptancePage.status, 200);
      const pilotAcceptanceHtml = await pilotAcceptancePage.text();
      assert.match(pilotAcceptanceHtml, /Deal Threads pilot acceptance/);
      assert.match(pilotAcceptanceHtml, /Payment data/);
      assert.match(pilotAcceptanceHtml, /Not sent/);
      assert.match(pilotAcceptanceHtml, /Loading it does not send email, create a beta client, transmit CRM data, run paid enrichment, charge a card, or claim live proof/i);
      assert.doesNotMatch(pilotAcceptanceHtml, /\/crm\//);
      assert.doesNotMatch(pilotAcceptanceHtml, /\/admin/);
      assert.doesNotMatch(pilotAcceptanceHtml, /\/api\/v1/);
      const pilotAcceptance = await json(`${pilotAcceptancePath}?format=json`);
      assert.equal(pilotAcceptance.type, "deal_threads.public_pilot_acceptance.v1");
      assert.equal(pilotAcceptance.summary?.transmits_payment_data, false);
      assert.equal(pilotAcceptance.summary?.paid_lookups_recommended_now, 0);
      assert.equal(pilotAcceptance.safety?.mutates_buyer_state_on_get, false);
      assert.equal(pilotAcceptance.safety?.mutates_buyer_state_on_post, true);
      assert.equal(pilotAcceptance.safety?.sends_external_email_on_post, false);
      assert.equal(pilotAcceptance.safety?.creates_beta_client_on_post, false);
      assert.equal(pilotAcceptance.safety?.transmits_payment_data, false);
      assert.equal(pilotAcceptance.safety?.paid_provider_lookup_by_default, false);
      assert.equal(JSON.stringify(pilotAcceptance).includes("/crm/"), false);
      assert.equal(JSON.stringify(pilotAcceptance).includes("/admin"), false);
      assert.equal(JSON.stringify(pilotAcceptance).includes("/api/v1/"), false);
      const pilotAcceptanceMarkdown = await request(`${pilotAcceptancePath}?format=markdown`);
      assert.equal(pilotAcceptanceMarkdown.status, 200);
      const pilotAcceptanceMarkdownText = await pilotAcceptanceMarkdown.text();
      assert.match(pilotAcceptanceMarkdownText, /# Deal Threads Pilot Acceptance/);
      assert.match(pilotAcceptanceMarkdownText, /Transmits payment data: no/);
      assert.doesNotMatch(pilotAcceptanceMarkdownText, /\/crm\//);
      assert.doesNotMatch(pilotAcceptanceMarkdownText, /\/api\/v1/);
      const protectedPilotAcceptance = await json(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/pilot-acceptance`, { auth: true });
      assert.equal(protectedPilotAcceptance.type, "deal_threads.public_pilot_acceptance.v1");
      assert.equal(protectedPilotAcceptance.summary?.transmits_payment_data, false);
      assert.equal(protectedPilotAcceptance.safety?.mutates_buyer_state_on_get, false);
      assert.equal(protectedPilotAcceptance.safety?.mutates_buyer_state_on_post, true);
      assert.equal(protectedPilotAcceptance.safety?.transmits_payment_data, false);
      const protectedPilotAcceptanceMarkdown = await request(`/api/v1/activation/prospects/${activation.prospects[0].lead_id}/pilot-acceptance?format=markdown`, { auth: true });
      assert.equal(protectedPilotAcceptanceMarkdown.status, 200);
      assert.match(await protectedPilotAcceptanceMarkdown.text(), /# Deal Threads Pilot Acceptance/);
      assert.equal(closePacket.recommended_beta_client?.name, activation.prospects[0].recommended_client_name);
    }

    return {
      status: activation.status,
      status_label: activation.status_label,
      summary: activation.summary,
      selected_client_id: activation.selected_client?.id || null,
      prospects: activation.prospects?.length || 0,
      follow_up_queue: followUps.queue?.length || 0,
      activation_runbook_ready: Boolean(activationRunbook),
      close_packet_ready: Boolean(closePacket),
      confirmation_nudge_ready: Boolean(confirmationNudge),
      demo_scenario: activation.demo_scenario,
      live_proof_gate: activation.live_proof_gate
    };
  });

  await check("first beta launch handoff path", async () => {
    const launchPage = await request("/launch", { auth: true });
    assert.equal(launchPage.status, 200);
    const html = await launchPage.text();
    assert.match(html, /First beta launch/);
    assert.match(html, /Launch steps/);
    assert.match(html, /Send launch packet|Review packet|Create beta client|No real client selected/);
    assert.match(html, /Run source check|Create beta client|No real client selected/);
    assert.match(html, /Create first test lead|Create beta client|No real client selected/);

	    const launch = await json("/api/v1/launch/first-beta", { auth: true });
	    const drillPage = await request("/launch/first-beta-drill", { auth: true });
	    assert.equal(drillPage.status, 200);
	    const drillHtml = await drillPage.text();
	    assert.match(drillHtml, /First beta launch drill/);
	    assert.match(drillHtml, /Read-only rehearsal/);
	    assert.match(drillHtml, /Operator POSTs shown here are previews only/);
	    assert.match(drillHtml, /Code builds before beta/);
	    assert.match(drillHtml, /Drill sequence/);
	    const drill = await json("/api/v1/launch/first-beta-drill", { auth: true });
	    assert.equal(drill.type, "deal_threads.first_beta_launch_drill.v1");
	    assert.equal(drill.summary.required_code_builds_before_first_beta, 0);
	    assert.equal(drill.summary.paid_lookups_recommended_now, 0);
	    assert.equal(drill.safety?.read_only_get, true);
	    assert.equal(drill.safety?.sends_external_email_on_get, false);
	    assert.equal(drill.safety?.marks_buyer_confirmation_complete_on_get, false);
	    assert.equal(drill.safety?.creates_beta_client_on_get, false);
	    assert.equal(drill.safety?.transmits_external_crm_on_get, false);
	    assert.equal(drill.safety?.paid_provider_lookup_by_default, false);
	    assert.equal(drill.safety?.live_proof_claimed, false);
	    assert.equal(drill.safety?.operator_posts_are_previews_only, true);
	    assert.ok(drill.steps?.some((step) => ["send_close_packet", "send_confirmation_nudge"].includes(step.key)));
	    if (drill.selected_candidate?.recommended_packet_kind === "confirmation_nudge") {
	      assert.equal(drill.first_open_step?.key, "send_confirmation_nudge");
	      assert.match(drill.first_open_step?.label || "", /confirmation nudge/i);
	    }
	    assert.ok(drill.steps?.some((step) => step.key === "capture_buyer_confirmation"));
	    assert.ok(drill.steps?.some((step) => step.key === "verify_client_domain_install"));
	    assert.ok(drill.steps?.some((step) => step.key === "rerun_live_proof_gate"));
	    const drillMarkdown = await request("/api/v1/launch/first-beta-drill?format=markdown", { auth: true });
	    assert.equal(drillMarkdown.status, 200);
	    const drillMarkdownText = await drillMarkdown.text();
	    assert.match(drillMarkdownText, /# Deal Threads First Beta Launch Drill/);
	    assert.match(drillMarkdownText, /Required code builds before first beta: 0/);
	    assert.match(drillMarkdownText, /Operator POSTs are previews only: yes/);
	    const executionPage = await request("/launch/first-beta-execution", { auth: true });
	    assert.equal(executionPage.status, 200);
	    const executionHtml = await executionPage.text();
	    assert.match(executionHtml, /First beta execution packet/);
	    assert.match(executionHtml, /Current buyer action/);
	    assert.match(executionHtml, /Copy-ready buyer follow-up|No buyer follow-up copy is available yet/);
	    assert.match(executionHtml, /GET is read-only/);
	    assert.match(executionHtml, /Execution sequence/);
	    assert.match(executionHtml, /Open manual email draft|Kick off beta install/);
	    assert.match(executionHtml, /Providerless enrichment cost firewall/);
	    assert.match(executionHtml, /Open enrichment control/);
	    const execution = await json("/api/v1/launch/first-beta-execution", { auth: true });
	    assert.equal(execution.type, "deal_threads.first_beta_execution_packet.v1");
	    assert.equal(execution.summary.required_code_builds_before_first_beta, 0);
	    assert.equal(execution.summary.paid_lookups_recommended_now, 0);
	    if (drill.first_open_step?.key === "send_confirmation_nudge") {
	      assert.equal(execution.summary.first_open_step, "send_confirmation_nudge");
	      assert.match(execution.summary.first_open_step_label || "", /confirmation nudge/i);
	    }
	    if (execution.copy_blocks?.buyer_follow_up) {
	      assert.match(execution.copy_blocks.buyer_follow_up.mailto_url || "", /^mailto:/);
	      assert.match(execution.copy_blocks.buyer_follow_up.manual_sent_api_url || "", /\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\//);
	      assert.ok(execution.operator_post_previews?.some((preview) => preview.key === "mark_manual_follow_up_sent"));
	    }
	    if (execution.active_buyer?.manual_sent_action) {
	      assert.equal(execution.active_buyer.manual_sent_action.sends_from_server, false);
	      assert.equal(execution.active_buyer.manual_sent_action.mutates_state, true);
	    }
	    assert.equal(execution.providerless_enrichment?.summary?.recommended_paid_lookups_now, 0);
	    assert.equal(execution.providerless_enrichment?.paid_firewall?.allowed_by_default, false);
	    assert.equal(execution.providerless_enrichment?.paid_firewall?.manual_approval_required, true);
	    assert.ok(execution.providerless_enrichment?.internal_source_stack?.includes("Visitor-declared buying context from the chat"));
	    assert.ok(execution.providerless_enrichment?.internal_source_stack?.includes("Public-site role and contact cues from team, about, contact, and leadership pages"));
	    assert.ok(execution.providerless_enrichment?.stages?.some((stage) => stage.key === "paid_provider_firewall"));
	    assert.ok(execution.providerless_enrichment?.quality_gates?.some((gate) => gate.label === "Paid-provider spend"));
	    assert.match(execution.source_packets?.providerless_build_plan || "", /\/api\/v1\/enrichment\/build-plan$/);
	    assert.equal(execution.safety?.read_only_get, true);
	    assert.equal(execution.safety?.sends_external_email_on_get, false);
	    assert.equal(execution.safety?.marks_buyer_confirmation_complete_on_get, false);
	    assert.equal(execution.safety?.creates_beta_client_on_get, false);
	    assert.equal(execution.safety?.transmits_external_crm_on_get, false);
	    assert.equal(execution.safety?.paid_provider_lookup_by_default, false);
	    assert.equal(execution.safety?.live_proof_claimed, false);
	    assert.equal(execution.safety?.operator_posts_are_previews_only, true);
	    assert.ok(execution.sequence?.some((step) => step.key === "collect_buyer_confirmation"));
	    assert.ok(execution.sequence?.some((step) => step.key === "apply_reviewed_confirmation"));
	    assert.ok(execution.sequence?.some((step) => step.key === "first_real_profile"));
	    assert.ok(execution.sequence?.some((step) => step.key === "crm_handoff_proof"));
	    assert.ok(execution.sequence?.some((step) => step.key === "live_proof_review"));
	    const executionMarkdown = await request("/api/v1/launch/first-beta-execution?format=markdown", { auth: true });
	    assert.equal(executionMarkdown.status, 200);
	    const executionMarkdownText = await executionMarkdown.text();
	    assert.match(executionMarkdownText, /# Deal Threads First Beta Execution Packet/);
	    assert.match(executionMarkdownText, /Required code builds before first beta: 0/);
	    assert.match(executionMarkdownText, /Paid lookups recommended now: 0/);
	    assert.match(executionMarkdownText, /Operator POSTs are previews only: yes/);
	    assert.match(executionMarkdownText, /Manual email draft: mailto:|Kick off beta install/i);
	    assert.match(executionMarkdownText, /Manual sent POST: .*\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/|Kick off beta install/i);
	    assert.match(executionMarkdownText, /Providerless Enrichment Cost Firewall/);
	    assert.match(executionMarkdownText, /Recommended paid lookups now: 0/);
	    assert.match(executionMarkdownText, /Paid lookup allowed by default: no/);

	    const nextActionPage = await request("/launch/next-action", { auth: true });
	    assert.equal(nextActionPage.status, 200);
		    const nextActionHtml = await nextActionPage.text();
		    assert.match(nextActionHtml, /First beta next action/);
		    assert.match(nextActionHtml, /The shortest path from the current buyer or install action to the next proof gate/);
		    assert.match(nextActionHtml, /GET is read-only/);
		    assert.match(nextActionHtml, /Open manual email draft|Kick off beta install|Active install proof/);
		    assert.match(nextActionHtml, /Manual sent POST|Kick off beta install|Install workbench/);
		    assert.match(nextActionHtml, /Buyer-safe links|Install public links/);
		    assert.match(nextActionHtml, /Proof focus/);
	    const nextAction = await json("/api/v1/launch/next-action", { auth: true });
	    assert.equal(nextAction.type, "deal_threads.first_beta_next_action.v1");
	    assert.equal(nextAction.summary.required_code_builds_before_first_beta, 0);
	    assert.equal(nextAction.summary.paid_lookups_recommended_now, 0);
	    assert.equal(nextAction.safety?.read_only_get, true);
	    assert.equal(nextAction.safety?.sends_external_email_on_get, false);
	    assert.equal(nextAction.safety?.marks_buyer_confirmation_complete_on_get, false);
	    assert.equal(nextAction.safety?.creates_beta_client_on_get, false);
	    assert.equal(nextAction.safety?.transmits_external_crm_on_get, false);
	    assert.equal(nextAction.safety?.paid_provider_lookup_by_default, false);
	    assert.equal(nextAction.safety?.live_proof_claimed, false);
	    assert.equal(nextAction.safety?.manual_record_requires_post, true);
		    if (nextAction.current_follow_up) {
		      if (nextAction.current_follow_up.packet_kind === "kickoff") {
		        assert.match(nextAction.current_follow_up.send_action?.api_url || "", /\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/kickoff$/);
		        assert.match(nextAction.current_follow_up.send_action?.html_action || "", /\/activation\/prospects\/lead_[a-f0-9-]+\/kickoff$/);
	      } else {
	        assert.match(nextAction.current_follow_up.mailto_url || "", /^mailto:/);
	        assert.equal(nextAction.current_follow_up.manual_sent_action?.sends_from_server, false);
	        assert.equal(nextAction.current_follow_up.manual_sent_action?.mutates_state, true);
	        assert.equal(nextAction.summary?.post_send_plan_ready, true);
	        assert.equal(nextAction.post_send_plan?.status, "ready_after_manual_send");
	        assert.match(nextAction.post_send_plan?.watch_room || "", /\/launch\/confirmation-watch$/);
	        assert.match(nextAction.post_send_plan?.reply_parser || "", /\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-reply$/);
	        assert.equal(nextAction.post_send_plan?.safety?.read_only_get, true);
	        assert.equal(nextAction.post_send_plan?.safety?.sends_external_email_on_get, false);
	        assert.equal(nextAction.post_send_plan?.safety?.creates_beta_client_on_get, false);
	        assert.equal(nextAction.post_send_plan?.safety?.paid_provider_lookup_by_default, false);
	      }
	    }
	    if (nextAction.copy_block) {
	      assert.match(nextAction.copy_block.manual_sent_api_url || "", /\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\//);
	    }
	    if (nextAction.current_follow_up?.packet_kind === "confirmation_nudge") {
	      assert.equal(nextAction.quick_reply_template?.enabled, true);
	      assert.match(nextAction.quick_reply_template?.body || "", /Quick reply fallback:/);
	      assert.match(nextAction.quick_reply_template?.protected_reply_preview_url || "", /\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-reply$/);
	      assert.equal(nextAction.copy_block?.quick_reply_template?.apply_requires_operator_post, true);
	      assert.match(nextActionHtml, /Quick reply fallback/);
	    }
		    if (nextAction.current_install_action) {
		      assert.equal(nextAction.status, "install_proof_ready");
		      assert.equal(nextAction.summary.packet_kind, "install_proof");
		      assert.equal(nextAction.summary.manual_sent_action_ready, false);
		      assert.equal(nextAction.current_follow_up, null);
		      assert.equal(nextAction.copy_block, null);
		      assert.doesNotMatch(nextActionHtml, /close-workflow|Mark manual draft sent/);
		      assert.ok(nextAction.current_install_action.protected_links?.install_workbench);
		      assert.ok(nextAction.operator_steps?.some((step) => step.key === "run_install_action"));
		      assert.ok(nextAction.operator_steps?.some((step) => step.key === "watch_client_domain_install"));
		      assert.ok(["install_handoff", "client_domain_install", "first_real_profile", "crm_handoff", "rep_feedback", "live_proof_gate"].includes(nextAction.proof_focus?.key));
		    } else {
		      assert.ok(nextAction.operator_steps?.some((step) => step.key === "record_manual_send"));
		      assert.ok(nextAction.operator_steps?.some((step) => step.key === "watch_buyer_confirmation"));
		      assert.ok(nextAction.proof_focus?.key === "buyer_confirmation");
		    }
		    const nextActionMarkdown = await request("/api/v1/launch/next-action?format=markdown", { auth: true });
		    assert.equal(nextActionMarkdown.status, 200);
		    const nextActionMarkdownText = await nextActionMarkdown.text();
		    assert.match(nextActionMarkdownText, /# Deal Threads First Beta Next Action/);
		    assert.match(nextActionMarkdownText, /Manual sent POST:|Kick off beta install|Active Install Proof/i);
		    if (nextAction.current_follow_up?.packet_kind === "kickoff" || nextAction.current_install_action) {
		      assert.match(nextActionMarkdownText, /Manual record requires POST: no|Manual record requires POST: yes|Kick off beta install|Active Install Proof/i);
		    } else {
		      assert.match(nextActionHtml, /Post-send plan/);
		      assert.match(nextActionHtml, /Watch confirmation/);
		      assert.match(nextActionHtml, /Parse buyer reply/);
		      assert.match(nextActionHtml, /Acceptance criteria/);
		      assert.match(nextActionMarkdownText, /Post-Send Plan/);
		      assert.match(nextActionMarkdownText, /After Send Actions/);
		      assert.match(nextActionMarkdownText, /Manual record requires POST: yes/);
		    }

	    const confirmationCommandPage = await request("/launch/confirmation-command", { auth: true });
	    assert.equal(confirmationCommandPage.status, 200);
	    const confirmationCommandHtml = await confirmationCommandPage.text();
	    assert.match(confirmationCommandHtml, /Launch confirmation command center/);
	    assert.match(confirmationCommandHtml, /One operator room for buyer follow-up, manual delivery records, reply parsing, confirmation capture, and beta kickoff/);
	    assert.match(confirmationCommandHtml, /GET is read-only/);
	    assert.match(confirmationCommandHtml, /Reply parser/);
	    assert.match(confirmationCommandHtml, /Providerless enrichment firewall/);
	    assert.match(confirmationCommandHtml, /Open manual email draft|Kick off beta install|Install proof action|No active buyer follow-up/i);
	    const confirmationCommand = await json("/api/v1/launch/confirmation-command", { auth: true });
	    assert.equal(confirmationCommand.type, "deal_threads.launch_confirmation_command_center.v1");
	    assert.equal(confirmationCommand.summary.required_code_builds_before_first_beta, 0);
	    assert.equal(confirmationCommand.summary.paid_lookups_recommended_now, 0);
	    assert.equal(confirmationCommand.providerless_enrichment?.paid_firewall?.allowed_by_default, false);
	    assert.equal(confirmationCommand.providerless_enrichment?.paid_firewall?.manual_approval_required, true);
	    assert.equal(confirmationCommand.providerless_enrichment?.paid_firewall?.recommended_paid_lookups_now, 0);
	    assert.equal(confirmationCommand.safety?.read_only_get, true);
	    assert.equal(confirmationCommand.safety?.sends_external_email_on_get, false);
	    assert.equal(confirmationCommand.safety?.marks_manual_send_on_get, false);
	    assert.equal(confirmationCommand.safety?.marks_buyer_confirmation_complete_on_get, false);
	    assert.equal(confirmationCommand.safety?.creates_beta_client_on_get, false);
	    assert.equal(confirmationCommand.safety?.transmits_external_crm_on_get, false);
	    assert.equal(confirmationCommand.safety?.paid_provider_lookup_by_default, false);
	    assert.equal(confirmationCommand.safety?.live_proof_claimed, false);
	    assert.equal(confirmationCommand.safety?.confirmation_apply_requires_post, true);
	    assert.equal(confirmationCommand.safety?.kickoff_requires_post, true);
	    assert.ok(confirmationCommand.confirmation_runway?.some((step) => step.key === "parse_reply_if_needed"));
	    if (confirmationCommand.current_follow_up) {
	      if (confirmationCommand.current_follow_up.packet_kind === "kickoff") {
	        assert.equal(confirmationCommand.status, "ready_for_kickoff");
	        assert.equal(confirmationCommand.actions.manual_sent, null);
	        assert.match(confirmationCommand.actions.kickoff?.url || "", /\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/kickoff$/);
	      } else {
	        assert.match(confirmationCommand.copy_block?.mailto_url || "", /^mailto:/);
	        assert.equal(confirmationCommand.current_action?.primary_surface_label, "Manual email draft");
	        assert.equal(confirmationCommand.current_action?.primary_surface_method, "MAILTO");
	        assert.equal(confirmationCommand.current_action?.method, "MAILTO");
	        assert.equal(confirmationCommand.current_action?.operator_post_method, "POST");
	        assert.equal(confirmationCommand.current_action?.manual_record_method, "POST");
	        assert.equal(confirmationCommand.actions.manual_sent?.sends_from_server, false);
	        assert.equal(confirmationCommand.actions.manual_sent?.mutates_state, true);
	        assert.match(confirmationCommandHtml, /Manual email draft/);
	        assert.match(confirmationCommandHtml, /Primary method/);
	        assert.match(confirmationCommandHtml, /MAILTO/);
	        assert.match(confirmationCommandHtml, /Operator POST/);
	      }
	    }
	    if (confirmationCommand.current_follow_up?.packet_kind === "confirmation_nudge") {
	      assert.equal(confirmationCommand.quick_reply_template?.enabled, true);
	      assert.match(confirmationCommand.quick_reply_template?.body || "", /Quick reply fallback:/);
	      assert.match(confirmationCommand.quick_reply_template?.protected_reply_preview_url || "", /\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-reply$/);
	      assert.match(confirmationCommandHtml, /Quick reply fallback/);
	    }
	    if (confirmationCommand.current_install_action) {
	      assert.equal(confirmationCommand.status, "install_proof_active");
	      assert.equal(confirmationCommand.summary.active_mode, "install_proof");
	      assert.equal(confirmationCommand.current_follow_up, null);
	      assert.equal(confirmationCommand.copy_block, null);
	      assert.equal(confirmationCommand.actions.manual_sent, null);
	    }
	    const confirmationCommandMarkdown = await request("/api/v1/launch/confirmation-command?format=markdown", { auth: true });
	    assert.equal(confirmationCommandMarkdown.status, 200);
	    const confirmationCommandMarkdownText = await confirmationCommandMarkdown.text();
	    assert.match(confirmationCommandMarkdownText, /# Deal Threads Launch Confirmation Command Center/);
	    if (confirmationCommand.current_follow_up && confirmationCommand.current_follow_up.packet_kind !== "kickoff") {
	      assert.match(confirmationCommandMarkdownText, /Primary surface label: Manual email draft/);
	      assert.match(confirmationCommandMarkdownText, /Primary surface method: MAILTO/);
	      assert.match(confirmationCommandMarkdownText, /Operator POST method: POST/);
	    }
	    assert.match(confirmationCommandMarkdownText, /Providerless Enrichment Firewall/);
	    assert.match(confirmationCommandMarkdownText, /Paid lookup allowed by default: no/);
	    assert.match(confirmationCommandMarkdownText, /Confirmation apply requires POST: yes/);

	    const confirmationWatchPage = await request("/launch/confirmation-watch", { auth: true });
	    assert.equal(confirmationWatchPage.status, 200);
	    const confirmationWatchHtml = await confirmationWatchPage.text();
	    assert.match(confirmationWatchHtml, /Launch confirmation watchroom/);
	    assert.match(confirmationWatchHtml, /Buyer-confirmation SLA room/);
	    assert.match(confirmationWatchHtml, /GET is read-only/);
	    assert.match(confirmationWatchHtml, /Current focus/);
	    assert.match(confirmationWatchHtml, /Confirmation queue/);
	    assert.match(confirmationWatchHtml, /Providerless posture/);
	    const confirmationWatch = await json("/api/v1/launch/confirmation-watch", { auth: true });
	    assert.equal(confirmationWatch.type, "deal_threads.launch_confirmation_watchroom.v1");
	    assert.equal(confirmationWatch.summary.required_code_builds_before_first_beta, 0);
	    assert.equal(confirmationWatch.summary.paid_lookups_recommended_now, 0);
	    assert.equal(confirmationWatch.providerless_enrichment_posture?.paid_lookup_allowed_by_default, false);
	    assert.equal(confirmationWatch.providerless_enrichment_posture?.manual_approval_required, true);
	    assert.equal(confirmationWatch.providerless_enrichment_posture?.recommended_paid_lookups_now, 0);
	    assert.equal(confirmationWatch.safety?.read_only_get, true);
	    assert.equal(confirmationWatch.safety?.sends_external_email_on_get, false);
	    assert.equal(confirmationWatch.safety?.marks_manual_send_on_get, false);
	    assert.equal(confirmationWatch.safety?.marks_buyer_confirmation_complete_on_get, false);
	    assert.equal(confirmationWatch.safety?.creates_beta_client_on_get, false);
	    assert.equal(confirmationWatch.safety?.transmits_external_crm_on_get, false);
	    assert.equal(confirmationWatch.safety?.paid_provider_lookup_by_default, false);
	    assert.equal(confirmationWatch.safety?.live_proof_claimed, false);
	    assert.equal(confirmationWatch.safety?.operator_posts_are_previews_only, true);
	    assert.equal(confirmationWatch.safety?.manual_record_requires_post, true);
	    assert.ok(confirmationWatch.current_focus?.next_action);
	    assert.ok(confirmationWatch.current_focus?.primary_surface_label);
	    assert.ok(confirmationWatch.current_focus?.primary_surface_method);
	    assert.ok(confirmationWatch.current_focus?.primary_surface_url);
	    if (confirmationWatch.current_focus?.primary_surface_method === "MAILTO") {
	      assert.equal(confirmationWatch.current_focus.primary_surface_label, "Manual email draft");
	      assert.match(confirmationWatch.current_focus.primary_surface_url, /^mailto:/);
	      assert.equal(confirmationWatch.current_focus.operator_post_method, "POST");
	    }
	    if (confirmationWatch.queue?.length) {
	      const watchQueueItem = confirmationWatch.queue[0];
	      assert.ok(watchQueueItem.protected_links?.command_center?.includes("/launch/confirmation-command"));
	      assert.ok(watchQueueItem.protected_links?.confirmation_workbench?.includes("/activation/prospects/"));
	      assert.ok(watchQueueItem.primary_surface?.label);
	      assert.ok(watchQueueItem.primary_surface?.method);
	      if (watchQueueItem.primary_surface?.method === "MAILTO") {
	        assert.equal(watchQueueItem.primary_surface.label, "Manual email draft");
	        assert.match(watchQueueItem.primary_surface.url, /^mailto:/);
	        assert.equal(watchQueueItem.primary_surface.operator_post_method, "POST");
	        assert.equal(watchQueueItem.action?.method, "MAILTO");
	      }
	    }
	    const confirmationWatchMarkdown = await request("/api/v1/launch/confirmation-watch?format=markdown", { auth: true });
	    assert.equal(confirmationWatchMarkdown.status, 200);
	    const confirmationWatchMarkdownText = await confirmationWatchMarkdown.text();
	    assert.match(confirmationWatchMarkdownText, /# Deal Threads Launch Confirmation Watchroom/);
	    assert.match(confirmationWatchMarkdownText, /Primary surface method:/);
	    assert.match(confirmationWatchMarkdownText, /Operator POST method:/);
	    if (confirmationWatch.current_focus?.primary_surface_method === "MAILTO") {
	      assert.match(confirmationWatchHtml, /Manual email draft/);
	      assert.match(confirmationWatchHtml, /Primary method/);
	      assert.match(confirmationWatchHtml, /MAILTO/);
	      assert.match(confirmationWatchHtml, /Operator POST/);
	      assert.match(confirmationWatchMarkdownText, /Primary surface: Manual email draft/);
	      assert.match(confirmationWatchMarkdownText, /Primary surface method: MAILTO/);
	      assert.match(confirmationWatchMarkdownText, /Operator POST method: POST/);
	    }
	    assert.match(confirmationWatchMarkdownText, /Read-only GET: yes/);
	    assert.match(confirmationWatchMarkdownText, /Paid lookup default: no/);
	    assert.match(confirmationWatchMarkdownText, /Manual record requires POST: yes/);

	    const intakeTriagePage = await request("/activation/intake-triage", { auth: true });
	    assert.equal(intakeTriagePage.status, 200);
	    const intakeTriageHtml = await intakeTriagePage.text();
	    assert.match(intakeTriageHtml, /Activation intake triage/);
	    assert.match(intakeTriageHtml, /Candidate queue/);
	    assert.match(intakeTriageHtml, /Providerless posture/);
	    assert.match(intakeTriageHtml, /no email sends, buyer-state mutation, beta-client creation, buyer-confirmation completion, CRM transmission, paid enrichment, or live-proof claim runs here/i);
	    const intakeTriage = await json("/api/v1/activation/intake-triage", { auth: true });
	    assert.equal(intakeTriage.type, "deal_threads.activation_intake_triage.v1");
	    assert.equal(typeof intakeTriage.summary.public_intake_submissions, "number");
	    assert.equal(typeof intakeTriage.summary.qualified_activation_prospects, "number");
	    assert.equal(typeof intakeTriage.summary.first_five_ready_candidates, "number");
	    assert.equal(intakeTriage.summary.required_code_builds_before_first_beta, 0);
	    assert.equal(intakeTriage.summary.paid_lookups_recommended_now, 0);
	    assert.equal(intakeTriage.safety?.read_only_get, true);
	    assert.equal(intakeTriage.safety?.sends_external_email_on_get, false);
	    assert.equal(intakeTriage.safety?.marks_buyer_confirmation_complete_on_get, false);
	    assert.equal(intakeTriage.safety?.creates_beta_client_on_get, false);
	    assert.equal(intakeTriage.safety?.transmits_external_crm_on_get, false);
	    assert.equal(intakeTriage.safety?.runs_paid_enrichment_on_get, false);
	    assert.equal(intakeTriage.safety?.live_proof_claimed, false);
	    if (intakeTriage.items?.length) {
	      const triageItem = intakeTriage.items[0];
	      assert.match(triageItem.lead_id, /^lead_[a-f0-9-]+$/);
	      assert.equal(typeof triageItem.first_five_fit?.score, "number");
	      assert.equal(triageItem.paid_lookups_recommended_now, 0);
	      assert.ok(triageItem.protected_links?.crm_profile);
	      if (triageItem.action_packet) {
	        assert.equal(triageItem.action_packet.safety?.sends_external_email_on_get, false);
	        assert.equal(triageItem.action_packet.safety?.paid_provider_lookup_by_default, false);
	      }
	    }
	    const intakeTriageMarkdown = await request("/api/v1/activation/intake-triage?format=markdown", { auth: true });
	    assert.equal(intakeTriageMarkdown.status, 200);
	    const intakeTriageMarkdownText = await intakeTriageMarkdown.text();
	    assert.match(intakeTriageMarkdownText, /# Deal Threads Activation Intake Triage/);
	    assert.match(intakeTriageMarkdownText, /Paid lookups recommended now: 0/);
	    assert.match(intakeTriageMarkdownText, /Read-only GET: yes/);
	    assert.match(intakeTriageMarkdownText, /Runs paid enrichment on GET: no/);

	    const firstFiveBoardPage = await request("/launch/first-five-board", { auth: true });
	    assert.equal(firstFiveBoardPage.status, 200);
	    const firstFiveBoardHtml = await firstFiveBoardPage.text();
	    assert.match(firstFiveBoardHtml, /First-five beta board/);
	    assert.match(firstFiveBoardHtml, /Providerless launch guardrail/);
	    assert.match(firstFiveBoardHtml, /Slot 1/);
	    assert.match(firstFiveBoardHtml, /No email, CRM transmission, buyer-state mutation, beta-client creation, bulk send, live-proof claim, or paid enrichment runs on GET/i);
	    const firstFiveBoard = await json("/api/v1/launch/first-five-board", { auth: true });
	    assert.equal(firstFiveBoard.type, "deal_threads.first_five_beta_board.v1");
	    assert.equal(firstFiveBoard.summary.target_client_count, firstFiveBoard.slots?.length || 0);
	    assert.equal(firstFiveBoard.summary.paid_lookups_recommended_now, 0);
	    assert.equal(firstFiveBoard.providerless_guardrail?.paid_lookup_allowed_by_default, false);
	    assert.equal(firstFiveBoard.providerless_guardrail?.manual_approval_required, true);
	    assert.equal(firstFiveBoard.providerless_guardrail?.recommended_paid_lookups_now, 0);
	    assert.equal(firstFiveBoard.safety?.read_only_get, true);
	    assert.equal(firstFiveBoard.safety?.sends_external_email_on_get, false);
	    assert.equal(firstFiveBoard.safety?.marks_buyer_confirmation_complete_on_get, false);
	    assert.equal(firstFiveBoard.safety?.creates_beta_client_on_get, false);
	    assert.equal(firstFiveBoard.safety?.transmits_external_crm_on_get, false);
	    assert.equal(firstFiveBoard.safety?.paid_provider_lookup_by_default, false);
	    assert.equal(firstFiveBoard.safety?.bulk_send_on_get, false);
	    assert.equal(firstFiveBoard.safety?.live_proof_claimed, false);
	    assert.ok(firstFiveBoard.slots?.every((slot) => typeof slot.position === "number" && slot.status && slot.next_action));
	    assert.ok(firstFiveBoard.slots?.some((slot) => ["activation_prospect", "real_beta_client", "target_account", "empty_slot"].includes(slot.kind)));
	    const firstFiveActivationSlot = firstFiveBoard.slots?.find((slot) => slot.kind === "activation_prospect");
	    if (firstFiveActivationSlot) {
	      assert.equal(firstFiveBoard.first_open_slot?.kind, "activation_prospect");
	      assert.ok(firstFiveBoard.first_open_slot?.action_kit, "First open slot should expose the activation action kit");
	      assert.equal(firstFiveBoard.first_open_slot.action_kit.packet_kind, firstFiveActivationSlot.action_kit?.packet_kind);
	      assert.match(firstFiveBoard.first_open_slot.action_kit.manual_handoff?.url || "", /^mailto:/);
	      assert.equal(firstFiveBoard.first_open_slot.action_kit.manual_handoff?.sends_from_server, false);
	      assert.equal(firstFiveBoard.first_open_slot.action_kit.send_action?.method, "POST");
	      assert.ok(firstFiveActivationSlot.action_kit, "Activation slot should expose a first-five action kit");
	      assert.match(firstFiveActivationSlot.action_kit.manual_handoff?.url || "", /^mailto:/);
	      assert.equal(firstFiveActivationSlot.action_kit.manual_handoff?.sends_from_server, false);
	      assert.equal(firstFiveActivationSlot.action_kit.send_action?.method, "POST");
	      if (firstFiveActivationSlot.action_kit.packet_kind === "kickoff") {
	        assert.match(firstFiveActivationSlot.action_kit.send_action?.api_url || "", /\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/kickoff$/);
	        assert.equal(firstFiveActivationSlot.action_kit.manual_sent_action, null);
	        assert.equal(firstFiveActivationSlot.action_kit.safety?.manual_record_requires_post, false);
	        assert.equal(firstFiveActivationSlot.action_kit.safety?.send_action_requires_post, true);
	      } else {
	        assert.equal(firstFiveActivationSlot.action_kit.manual_sent_action?.method, "POST");
	        assert.equal(firstFiveActivationSlot.action_kit.manual_sent_action?.sends_from_server, false);
	        assert.equal(firstFiveActivationSlot.action_kit.safety?.manual_record_requires_post, true);
	      }
	      assert.equal(firstFiveActivationSlot.action_kit.safety?.sends_external_email_on_get, false);
	      assert.equal(firstFiveActivationSlot.action_kit.safety?.paid_provider_lookup_by_default, false);
	      assert.match(firstFiveActivationSlot.action_kit.protected_links?.reply_preview || "", /\/activation\/prospects\/.+\/confirmation-reply$/);
	    }
	    const firstFiveBoardMarkdown = await request("/api/v1/launch/first-five-board?format=markdown", { auth: true });
	    assert.equal(firstFiveBoardMarkdown.status, 200);
	    const firstFiveBoardMarkdownText = await firstFiveBoardMarkdown.text();
	    assert.match(firstFiveBoardMarkdownText, /# Deal Threads First-Five Beta Board/);
	    assert.match(firstFiveBoardMarkdownText, /Providerless Guardrail/);
	    assert.match(firstFiveBoardMarkdownText, /Paid lookups recommended now: 0/);
	    assert.match(firstFiveBoardMarkdownText, /GET sends external email: no/);
	    if (firstFiveActivationSlot) {
	      assert.match(firstFiveBoardMarkdownText, /First open action kit packet:/);
	      assert.match(firstFiveBoardMarkdownText, /First open mailto draft: mailto:/);
	      assert.match(firstFiveBoardMarkdownText, /First open send POST:/);
	      assert.match(firstFiveBoardMarkdownText, /Action kit packet:/);
	      assert.match(firstFiveBoardMarkdownText, /Mailto draft: mailto:/);
	      assert.match(firstFiveBoardMarkdownText, /Manual sent POST:/);
	      if (firstFiveActivationSlot.action_kit?.packet_kind === "kickoff") {
	        assert.match(firstFiveBoardMarkdownText, /Manual record requires POST: no/);
	      } else {
	        assert.match(firstFiveBoardMarkdownText, /Manual record requires POST: yes/);
	      }
	    }
	    if (!launch.selected_client?.id) {
	      assert.ok(launch.next_actions?.length, "Empty first-beta launch state should provide next actions");
	      assert.ok(launch.steps?.length, "Empty first-beta launch state should still return launch steps");
	      return {
	        status: launch.status,
	        selected_client_id: null,
	        next_actions: launch.next_actions,
	        beta_client_required: true,
	        first_beta_drill: drill.summary,
	        first_beta_execution: execution.summary,
	        first_five_beta_board: firstFiveBoard.summary
	      };
	    }
	    assert.ok(["ready", "needs_attention", "blocked"].includes(launch.status));
	    assert.ok(launch.selected_client?.id, "Expected a selected beta client");
	    assert.ok(launch.selected_client?.domain, "Expected selected beta client domain");
	    if (launch.status === "blocked") {
	      assert.ok(launch.steps?.some((step) => step.status === "blocker"), "Blocked first beta launch state should expose blockers");
	      assert.ok(launch.next_actions?.length, "Blocked first beta launch state should expose next actions");
	      assert.equal(launch.wizard?.ready_for_live_beta, false, "Blocked selected beta client should not be live-beta ready");
	    } else {
	      assert.equal(launch.steps?.some((step) => step.status === "blocker"), false, "First beta launch steps should not have blockers");
	      assert.equal(launch.wizard?.ready_for_live_beta, true, "Selected beta client should be live-beta ready");
	    }

	    const installQueuePage = await request("/launch/install-queue", { auth: true });
	    assert.equal(installQueuePage.status, 200);
	    const installQueueHtml = await installQueuePage.text();
	    assert.match(installQueueHtml, /Install follow-up queue/);
	    assert.match(installQueueHtml, /Proof preflight/);
	    assert.match(installQueueHtml, /no email sends, buyer-state mutation, beta-client creation, CRM transmission, live-proof claims, or paid enrichment runs/i);
	    const installQueue = await json("/api/v1/launch/install-queue", { auth: true });
	    assert.equal(installQueue.type, "deal_threads.launch_install_queue.v1");
	    assert.equal(installQueue.safety?.mutates_buyer_state_on_get, false);
	    assert.equal(installQueue.safety?.sends_external_email_on_get, false);
	    assert.equal(installQueue.safety?.creates_beta_client_on_get, false);
	    assert.equal(installQueue.safety?.transmits_external_crm_on_get, false);
	    assert.equal(installQueue.summary.real_beta_clients, installQueue.queue?.length || 0);
	    assert.equal(typeof installQueue.summary.demo_clients_excluded, "number");
	    const proofQueueItem = installQueue.queue?.[0];
	    const firstProfilePath = proofQueueItem ? `/launch/first-profile?client=${proofQueueItem.beta_client_id}` : "/launch/first-profile";
	    const firstProfileApiPath = proofQueueItem ? `/api/v1/launch/first-profile?client=${proofQueueItem.beta_client_id}` : "/api/v1/launch/first-profile";
	    const firstProfileMarkdownPath = proofQueueItem ? `/api/v1/launch/first-profile?format=markdown&client=${proofQueueItem.beta_client_id}` : "/api/v1/launch/first-profile?format=markdown";
	    const firstProfilePage = await request(firstProfilePath, { auth: true });
	    assert.equal(firstProfilePage.status, 200);
	    const firstProfileHtml = await firstProfilePage.text();
	    assert.match(firstProfileHtml, /First profile capture/);
	    assert.match(firstProfileHtml, /Focused proof room/);
	    assert.match(firstProfileHtml, /GET is read-only: no profile creation/);
	    assert.match(firstProfileHtml, /Current action/);
	    assert.match(firstProfileHtml, /Capture checklist/);
	    assert.match(firstProfileHtml, /Proof unlocks/);
	    const firstProfile = await json(firstProfileApiPath, { auth: true });
	    assert.equal(firstProfile.type, "deal_threads.launch_first_profile_capture.v1");
	    assert.equal(firstProfile.summary.required_code_builds_before_first_beta, 0);
	    assert.equal(firstProfile.summary.paid_lookups_recommended_now, 0);
	    assert.equal(firstProfile.safety?.read_only_get, true);
	    assert.equal(firstProfile.safety?.creates_profile_on_get, false);
	    assert.equal(firstProfile.safety?.mutates_buyer_state_on_get, false);
	    assert.equal(firstProfile.safety?.sends_external_email_on_get, false);
	    assert.equal(firstProfile.safety?.creates_beta_client_on_get, false);
	    assert.equal(firstProfile.safety?.transmits_external_crm_on_get, false);
	    assert.equal(firstProfile.safety?.paid_provider_lookup_by_default, false);
	    assert.equal(firstProfile.safety?.live_proof_claimed, false);
	    assert.equal(firstProfile.safety?.test_lead_creation_requires_post, true);
	    assert.ok(firstProfile.current_action?.key);
	    assert.ok(firstProfile.capture_checklist?.length);
	    assert.ok(firstProfile.proof_unlocks?.some((item) => item.key === "first_real_profile"));
	    if (proofQueueItem) {
	      assert.equal(firstProfile.summary.selected_beta_client_id, proofQueueItem.beta_client_id);
	      assert.equal(firstProfile.summary.client_domain_config_loads, proofQueueItem.install_activity.client_page_config_loads);
	      assert.equal(firstProfile.summary.beta_profiles, proofQueueItem.lead_count);
	      assert.equal(firstProfile.actions.create_test_lead?.method, "POST");
	      assert.match(firstProfile.actions.create_test_lead?.html_action || "", new RegExp(`/launch/${proofQueueItem.beta_client_id}/test-lead$`));
	      assert.equal(firstProfile.actions.create_test_lead?.preview_only_on_get, true);
	      assert.equal(firstProfile.actions.create_test_lead?.creates_profile, true);
	    } else {
	      assert.equal(firstProfile.status, "needs_real_beta_client");
	      assert.equal(firstProfile.actions.create_test_lead, null);
	    }
	    const firstProfileMarkdown = await request(firstProfileMarkdownPath, { auth: true });
	    assert.equal(firstProfileMarkdown.status, 200);
	    const firstProfileMarkdownText = await firstProfileMarkdown.text();
	    assert.match(firstProfileMarkdownText, /# Deal Threads First Profile Capture Room/);
	    assert.match(firstProfileMarkdownText, /Read-only GET: yes/);
	    assert.match(firstProfileMarkdownText, /GET creates profile: no/);
	    assert.match(firstProfileMarkdownText, /Test lead creation requires POST: yes/);
	    const profileHandoffPath = proofQueueItem ? `/launch/profile-handoff?client=${proofQueueItem.beta_client_id}` : "/launch/profile-handoff";
	    const profileHandoffApiPath = proofQueueItem ? `/api/v1/launch/profile-handoff?client=${proofQueueItem.beta_client_id}` : "/api/v1/launch/profile-handoff";
	    const profileHandoffMarkdownPath = proofQueueItem ? `/api/v1/launch/profile-handoff?format=markdown&client=${proofQueueItem.beta_client_id}` : "/api/v1/launch/profile-handoff?format=markdown";
	    const profileHandoffPage = await request(profileHandoffPath, { auth: true });
	    assert.equal(profileHandoffPage.status, 200);
	    const profileHandoffHtml = await profileHandoffPage.text();
	    assert.match(profileHandoffHtml, /Profile handoff bridge/);
	    assert.match(profileHandoffHtml, /GET is read-only: no profile creation/);
	    assert.match(profileHandoffHtml, /Current action/);
	    assert.match(profileHandoffHtml, /Handoff checklist/);
	    assert.match(profileHandoffHtml, /CRM handoff/);
	    assert.match(profileHandoffHtml, /Rep handoff/);
	    const profileHandoff = await json(profileHandoffApiPath, { auth: true });
	    assert.equal(profileHandoff.type, "deal_threads.launch_profile_handoff_bridge.v1");
	    assert.equal(profileHandoff.summary.required_code_builds_before_first_beta, 0);
	    assert.equal(profileHandoff.summary.paid_lookups_recommended_now, 0);
	    assert.equal(profileHandoff.safety?.read_only_get, true);
	    assert.equal(profileHandoff.safety?.creates_profile_on_get, false);
	    assert.equal(profileHandoff.safety?.sends_external_email_on_get, false);
	    assert.equal(profileHandoff.safety?.sends_rep_alert_on_get, false);
	    assert.equal(profileHandoff.safety?.queues_crm_delivery_on_get, false);
	    assert.equal(profileHandoff.safety?.transmits_external_crm_on_get, false);
	    assert.equal(profileHandoff.safety?.updates_rep_feedback_on_get, false);
	    assert.equal(profileHandoff.safety?.paid_provider_lookup_by_default, false);
	    assert.equal(profileHandoff.safety?.live_proof_claimed, false);
	    assert.equal(profileHandoff.safety?.crm_delivery_requires_post, true);
	    assert.equal(profileHandoff.safety?.rep_alert_requires_post, true);
	    assert.equal(profileHandoff.safety?.rep_feedback_requires_post, true);
	    assert.ok(profileHandoff.current_action?.key);
	    assert.ok(profileHandoff.handoff_checklist?.some((item) => item.key === "crm_handoff_proof"));
	    assert.ok(profileHandoff.handoff_checklist?.some((item) => item.key === "rep_feedback"));
	    if (proofQueueItem) {
	      assert.equal(profileHandoff.summary.selected_beta_client_id, proofQueueItem.beta_client_id);
	      assert.equal(profileHandoff.summary.beta_profiles, proofQueueItem.lead_count);
	      if (proofQueueItem.lead_count) {
	        assert.ok(profileHandoff.selected_profile?.id);
	        assert.equal(profileHandoff.actions.crm_delivery?.method, "POST");
	        assert.equal(profileHandoff.actions.rep_alert?.method, "POST");
	        assert.equal(profileHandoff.actions.protected_rep_feedback?.method, "POST");
	        assert.match(profileHandoff.links.public_rep_handoff || "", /\/handoff\/inst_[a-f0-9]+\/lead_/);
	      } else {
	        assert.equal(profileHandoff.status, "first_profile_needed");
	        assert.equal(profileHandoff.actions.crm_delivery, null);
	      }
	    } else {
	      assert.equal(profileHandoff.status, "needs_real_beta_client");
	    }
	    const profileHandoffMarkdown = await request(profileHandoffMarkdownPath, { auth: true });
	    assert.equal(profileHandoffMarkdown.status, 200);
	    const profileHandoffMarkdownText = await profileHandoffMarkdown.text();
	    assert.match(profileHandoffMarkdownText, /# Deal Threads Profile Handoff Bridge/);
	    assert.match(profileHandoffMarkdownText, /Read-only GET: yes/);
	    assert.match(profileHandoffMarkdownText, /GET queues CRM delivery: no/);
	    assert.match(profileHandoffMarkdownText, /CRM delivery requires POST: yes/);
	    const repFeedbackCommandPage = await request("/launch/rep-feedback", { auth: true });
	    assert.equal(repFeedbackCommandPage.status, 200);
	    const repFeedbackCommandHtml = await repFeedbackCommandPage.text();
	    assert.match(repFeedbackCommandHtml, /Rep feedback command room/);
	    assert.match(repFeedbackCommandHtml, /Copy-ready rep ask/);
	    assert.match(repFeedbackCommandHtml, /Public feedback rooms/);
	    assert.match(repFeedbackCommandHtml, /GET is read-only/);
	    const repFeedbackCommand = await json("/api/v1/launch/rep-feedback", { auth: true });
	    assert.equal(repFeedbackCommand.type, "deal_threads.launch_rep_feedback_command.v1");
	    assert.ok(["needs_real_beta_client", "waiting_for_profiles", "feedback_needed", "feedback_captured_with_gaps", "feedback_clear"].includes(repFeedbackCommand.status));
	    assert.equal(repFeedbackCommand.summary.paid_lookups_recommended_now, 0);
	    assert.equal(repFeedbackCommand.safety?.read_only_get, true);
	    assert.equal(repFeedbackCommand.safety?.sends_external_email_on_get, false);
	    assert.equal(repFeedbackCommand.safety?.creates_profile_on_get, false);
	    assert.equal(repFeedbackCommand.safety?.creates_beta_client_on_get, false);
	    assert.equal(repFeedbackCommand.safety?.queues_crm_delivery_on_get, false);
	    assert.equal(repFeedbackCommand.safety?.transmits_external_crm_on_get, false);
	    assert.equal(repFeedbackCommand.safety?.updates_rep_feedback_on_get, false);
	    assert.equal(repFeedbackCommand.safety?.paid_provider_lookup_by_default, false);
	    assert.equal(repFeedbackCommand.safety?.live_proof_claimed, false);
	    if (proofQueueItem) {
	      assert.ok(repFeedbackCommand.clients.some((client) => client.beta_client_id === proofQueueItem.beta_client_id));
	    }
	    const repFeedbackCommandMarkdown = await request("/api/v1/launch/rep-feedback?format=markdown", { auth: true });
	    assert.equal(repFeedbackCommandMarkdown.status, 200);
	    const repFeedbackCommandMarkdownText = await repFeedbackCommandMarkdown.text();
	    assert.match(repFeedbackCommandMarkdownText, /# Deal Threads Rep Feedback Command/);
	    assert.match(repFeedbackCommandMarkdownText, /Copy-Ready Rep Ask/);
	    assert.match(repFeedbackCommandMarkdownText, /GET updates rep feedback: no/);
	    if (proofQueueItem) {
	      assert.ok(proofQueueItem.proof_preflight, "Expected install queue item proof preflight");
	      assert.equal(typeof proofQueueItem.proof_preflight.ready_for_first_proof_packet, "boolean");
	      assert.equal(typeof proofQueueItem.proof_preflight.ready_for_live_proof_claim, "boolean");
	      assert.ok(["blocked", "proof_ready_with_warnings", "proof_ready"].includes(proofQueueItem.proof_preflight.status));
	      assert.ok(proofQueueItem.proof_preflight.checks.some((check) => check.key === "first_beta_profile"));
	      assert.ok(proofQueueItem.proof_preflight.market_gate_effect.some((effect) => effect.key === "live_proof_gate"));
	      assert.equal(proofQueueItem.proof_preflight.summary.beta_profiles, proofQueueItem.lead_count);
	      assert.ok(proofQueueItem.protected_links?.install_workbench, "Expected install workbench link");
	      const workbenchPath = new URL(proofQueueItem.protected_links.install_workbench).pathname;
	      const workbenchPage = await request(workbenchPath, { auth: true });
	      assert.equal(workbenchPage.status, 200);
	      const workbenchHtml = await workbenchPage.text();
		      assert.match(workbenchHtml, /Install proof workbench/);
		      assert.match(workbenchHtml, /Buyer-safe copy blocks/);
		      assert.match(workbenchHtml, /Open email draft/);
		      assert.match(workbenchHtml, /Mark manual install note sent/);
		      assert.match(workbenchHtml, /No email, CRM delivery, buyer-state mutation, beta-client creation, live-proof claim, or paid enrichment runs on GET/i);
		      const workbench = await json(`/api/v1/beta-clients/${proofQueueItem.beta_client_id}/install-workbench`, { auth: true });
		      assert.equal(workbench.type, "deal_threads.beta_client_install_workbench.v1");
		      assert.equal(workbench.beta_client_id, proofQueueItem.beta_client_id);
		      assert.equal(workbench.summary.mailto_drafts, Object.keys(workbench.copy_blocks || {}).length);
		      assert.equal(typeof workbench.summary.manual_sent_records, "number");
		      assert.equal(workbench.summary.paid_lookups_recommended_now, 0);
		      assert.equal(workbench.safety.sends_external_email_on_get, false);
		      assert.equal(workbench.safety.transmits_external_crm_on_get, false);
		      assert.equal(workbench.safety.manual_record_requires_post, true);
		      assert.ok(workbench.copy_blocks?.implementation_owner_note?.body?.includes("Script tag:"));
		      assert.match(workbench.copy_blocks?.implementation_owner_note?.mailto_url || "", /^mailto:/);
		      assert.match(workbench.copy_blocks?.implementation_owner_note?.manual_sent_action?.api_url || "", new RegExp(`/api/v1/beta-clients/${proofQueueItem.beta_client_id}/install-workbench/implementation_owner_note/sent$`));
		      assert.equal(workbench.copy_blocks?.implementation_owner_note?.manual_sent_action?.sends_from_server, false);
		      assert.equal(workbench.copy_blocks?.implementation_owner_note?.manual_sent_action?.preview_only_on_get, true);
		      assert.ok(workbench.proof_preflight?.checks?.some((check) => check.key === "first_beta_profile"));
		      const workbenchMarkdown = await request(`/api/v1/beta-clients/${proofQueueItem.beta_client_id}/install-workbench?format=markdown`, { auth: true });
		      assert.equal(workbenchMarkdown.status, 200);
		      const workbenchMarkdownText = await workbenchMarkdown.text();
		      assert.match(workbenchMarkdownText, /# Deal Threads Install Proof Workbench/);
		      assert.match(workbenchMarkdownText, /Mailto draft: mailto:/);
		      assert.match(workbenchMarkdownText, /Manual sent POST: .*\/api\/v1\/beta-clients\/beta_[a-f0-9-]+\/install-workbench\/implementation_owner_note\/sent/);
		      assert.match(workbenchMarkdownText, /GET sends external email: no/);
		      assert.match(workbenchMarkdownText, /Paid lookup by default: no/);
		      assert.match(workbenchMarkdownText, /Manual record requires POST: yes/);
		    }
	    const installQueueMarkdown = await request("/api/v1/launch/install-queue?format=markdown", { auth: true });
	    assert.equal(installQueueMarkdown.status, 200);
	    const installQueueMarkdownText = await installQueueMarkdown.text();
	    assert.match(installQueueMarkdownText, /# Deal Threads Install Follow-Up Queue/);
	    if (proofQueueItem) assert.match(installQueueMarkdownText, /Proof preflight:/);

		    const proofCapturePage = await request("/launch/proof-capture", { auth: true });
		    assert.equal(proofCapturePage.status, 200);
		    const proofCaptureHtml = await proofCapturePage.text();
		    assert.match(proofCaptureHtml, /Proof capture runbook/);
		    assert.match(proofCaptureHtml, /Proof sequence/);
		    assert.match(proofCaptureHtml, /GET is read-only/);
		    assert.doesNotMatch(proofCaptureHtml, /<form/);
		    const proofCapture = await json("/api/v1/launch/proof-capture", { auth: true });
		    assert.equal(proofCapture.type, "deal_threads.launch_proof_capture_runbook.v1");
		    assert.equal(proofCapture.safety?.read_only_get, true);
		    assert.equal(proofCapture.safety?.creates_beta_client_on_get, false);
		    assert.equal(proofCapture.safety?.transmits_external_crm_on_get, false);
		    assert.equal(proofCapture.safety?.paid_provider_lookup_by_default, false);
		    assert.equal(proofCapture.safety?.live_proof_claimed, false);
		    assert.ok(proofCapture.phases?.some((phase) => phase.key === "first_real_profile"));
		    assert.ok(proofCapture.phases?.some((phase) => phase.key === "crm_handoff"));
		    assert.ok(proofCapture.phases?.some((phase) => phase.key === "rep_feedback"));
		    assert.ok(proofCapture.phases?.some((phase) => phase.key === "live_proof_gate"));
		    if (proofQueueItem) {
		      assert.equal(proofCapture.selected_beta_client?.id, proofQueueItem.beta_client_id);
		      assert.ok(["client_domain_install", "first_real_profile", "crm_handoff", "rep_feedback", "first_proof_packet", "live_proof_gate"].includes(proofCapture.current_phase?.key));
		    } else {
		      assert.equal(proofCapture.status, "needs_real_beta_client");
		      assert.ok(proofCapture.phases?.some((phase) => phase.key === "buyer_confirmation"));
		    }
		    const proofCaptureMarkdown = await request("/api/v1/launch/proof-capture?format=markdown", { auth: true });
		    assert.equal(proofCaptureMarkdown.status, 200);
		    const proofCaptureMarkdownText = await proofCaptureMarkdown.text();
		    assert.match(proofCaptureMarkdownText, /# Deal Threads Proof Capture Runbook/);
		    assert.match(proofCaptureMarkdownText, /Read-only GET: yes/);
		    assert.match(proofCaptureMarkdownText, /Paid lookup by default: no/);

		    const proofPacketPage = await request("/launch/proof-packet", { auth: true });
		    assert.equal(proofPacketPage.status, 200);
		    const proofPacketHtml = await proofPacketPage.text();
		    assert.match(proofPacketHtml, /First proof packet workbench/);
		    assert.match(proofPacketHtml, /Evidence gate/);
		    assert.match(proofPacketHtml, /Buyer-safe packet preview/);
		    assert.match(proofPacketHtml, /GET is read-only/);
		    const proofPacket = await json("/api/v1/launch/proof-packet", { auth: true });
		    assert.equal(proofPacket.type, "deal_threads.launch_first_proof_packet_workbench.v1");
		    assert.equal(proofPacket.safety?.read_only_get, true);
		    assert.equal(proofPacket.safety?.queues_report_delivery_on_get, false);
		    assert.equal(proofPacket.safety?.marks_report_sent_on_get, false);
		    assert.equal(proofPacket.safety?.sends_external_email_on_get, false);
		    assert.equal(proofPacket.safety?.transmits_external_crm_on_get, false);
		    assert.equal(proofPacket.safety?.paid_provider_lookup_by_default, false);
		    assert.equal(proofPacket.safety?.queue_requires_post, true);
		    assert.equal(proofPacket.safety?.manual_sent_record_requires_post, true);
		    assert.ok(["needs_real_beta_client", "proof_evidence_blocked", "ready_to_queue_first_proof_packet", "proof_packet_queued", "first_proof_packet_sent", "proof_packet_failed"].includes(proofPacket.status));
		    assert.ok(proofPacket.evidence?.items?.some((item) => item.key === "first_beta_profile"));
		    assert.equal(proofPacket.summary.paid_lookups_recommended_now, 0);
		    if (proofQueueItem) {
		      assert.equal(proofPacket.selected_beta_client?.id, proofQueueItem.beta_client_id);
		      assert.match(proofPacket.links?.operator_room || "", /\/launch\/proof-packet/);
		    } else {
		      assert.equal(proofPacket.status, "needs_real_beta_client");
		    }
		    const proofPacketMarkdown = await request("/api/v1/launch/proof-packet?format=markdown", { auth: true });
		    assert.equal(proofPacketMarkdown.status, 200);
		    const proofPacketMarkdownText = await proofPacketMarkdown.text();
		    assert.match(proofPacketMarkdownText, /# Deal Threads First Proof Packet Workbench/);
		    assert.match(proofPacketMarkdownText, /Read-only GET: yes/);
		    assert.match(proofPacketMarkdownText, /GET queues report delivery: no/);
		    assert.match(proofPacketMarkdownText, /Paid lookup by default: no/);

		    const opsPage = await request("/launch/ops", { auth: true });
		    assert.equal(opsPage.status, 200);
		    const opsHtml = await opsPage.text();
		    assert.match(opsHtml, /Launch operations/);
		    assert.match(opsHtml, /Today's focus/);
		    assert.match(opsHtml, /Market gate/);
		    assert.match(opsHtml, /No email, CRM transmission, buyer-state mutation, beta-client creation, live-proof claim, or paid enrichment runs on GET/i);
		    const ops = await json("/api/v1/launch/ops", { auth: true });
	    assert.equal(ops.type, "deal_threads.launch_ops.v1");
	    assert.equal(ops.safety?.mutates_buyer_state_on_get, false);
	    assert.equal(ops.safety?.sends_external_email_on_get, false);
	    assert.equal(ops.safety?.creates_beta_client_on_get, false);
	    assert.equal(ops.safety?.transmits_external_crm_on_get, false);
	    assert.equal(typeof ops.summary.real_beta_clients, "number");
	    assert.equal(typeof ops.summary.qualified_activation_prospects, "number");
	    assert.ok(ops.stages?.some((stage) => stage.key === "activation_follow_up"));
	    assert.ok(ops.stages?.some((stage) => stage.key === "install"));
		    const opsMarkdown = await request("/api/v1/launch/ops?format=markdown", { auth: true });
		    assert.equal(opsMarkdown.status, 200);
		    assert.match(await opsMarkdown.text(), /# Deal Threads Launch Operations/);

		    const marketPage = await request("/launch/market-ready", { auth: true });
		    assert.equal(marketPage.status, 200);
		    const marketHtml = await marketPage.text();
		    assert.match(marketHtml, /Market launch readiness/);
		    assert.match(marketHtml, /Conservative operator gate/);
		    assert.match(marketHtml, /Founder timeline answer/);
		    assert.match(marketHtml, /Core build is ready for the first beta/i);
		    assert.match(marketHtml, /How much is left\?/);
		    assert.match(marketHtml, /Code builds before beta/);
		    assert.match(marketHtml, /Launch clearance plan/);
		    assert.match(marketHtml, /Can start now/);
		    assert.match(marketHtml, /Waiting on/);
		    assert.match(marketHtml, /Buyer reply apply preflight/);
		    assert.match(marketHtml, /Reply apply required fields/);
		    assert.match(marketHtml, /Do not build yet/);
		    assert.match(marketHtml, /Remaining proof steps/);
		    assert.match(marketHtml, /Gate checklist/);
		    assert.match(marketHtml, /No email, CRM transmission, buyer-state mutation, beta-client creation, live-proof claim, or paid enrichment runs on GET/i);
		    const market = await json("/api/v1/launch/market-ready", { auth: true });
		    assert.equal(market.type, "deal_threads.market_launch_readiness.v1");
		    assert.equal(typeof market.market_ready, "boolean");
		    assert.equal(typeof market.summary.blocker, "number");
		    assert.equal(typeof market.summary.warning, "number");
		    assert.ok(market.gates?.some((gate) => gate.key === "buyer_launch_assets"));
		    assert.ok(market.gates?.some((gate) => gate.key === "client_domain_install"));
		    assert.ok(market.gates?.some((gate) => gate.key === "live_proof_gate"));
		    assert.equal(market.readiness_estimate?.counts?.required_code_builds_before_first_beta, 0);
		    assert.equal(market.readiness_estimate?.counts?.paid_enrichment_lookups_needed_now, 0);
		    assert.ok(market.readiness_estimate?.required_real_world_steps?.length >= 1);
		    assert.ok(market.readiness_estimate?.optional_scale_builds?.some((item) => item.key === "paid_enrichment_provider"));
		    assert.match(market.founder_timeline?.short_answer, /Core build is ready for the first beta/i);
		    assert.match(market.founder_timeline?.software_left, /0 required code builds/i);
		    assert.equal(market.founder_timeline?.market_ready?.required_real_world_steps, market.readiness_estimate?.counts?.required_real_world_steps);
		    assert.equal(market.founder_timeline?.safety?.read_only_get, true);
		    assert.equal(market.founder_timeline?.safety?.paid_provider_lookup_by_default, false);
		    assert.equal(market.launch_clearance_plan?.engineering_status?.required_code_builds_before_first_beta, 0);
		    assert.equal(market.launch_clearance_plan?.engineering_status?.paid_enrichment_lookups_needed_now, 0);
		    assert.ok(Array.isArray(market.launch_clearance_plan?.can_start_now));
		    assert.ok(Array.isArray(market.launch_clearance_plan?.waiting_on));
		    assert.ok(market.launch_clearance_plan?.workstreams?.some((item) => item.key === "buyer_confirmation"));
		    assert.ok(market.launch_clearance_plan?.workstreams?.some((item) => item.key === "live_proof_gate"));
		    assert.ok(market.launch_clearance_plan?.do_not_do_yet?.some((item) => item.key === "paid_enrichment_provider"));
		    assert.equal(market.launch_clearance_plan?.safety?.read_only_get, true);
		    assert.equal(market.launch_clearance_plan?.safety?.live_proof_claimed, false);
		    assert.equal(market.blocker_clearance_map?.type, "deal_threads.market_blocker_clearance_map.v1");
		    assert.equal(market.launch_clearance_plan?.blocker_clearance_map?.summary?.blockers, market.summary.blocker);
		    assert.equal(market.blocker_clearance_map?.summary?.warnings, market.summary.warning);
		    assert.equal(market.blocker_clearance_map?.summary?.paid_lookups_recommended_now, 0);
		    assert.ok(Array.isArray(market.blocker_clearance_map?.items));
		    assert.ok(Array.isArray(market.blocker_clearance_map?.ordered_clearance_path));
		    assert.equal(market.blocker_clearance_map?.safety?.read_only_get, true);
		    assert.equal(market.blocker_clearance_map?.safety?.sends_external_email_on_get, false);
		    assert.equal(market.blocker_clearance_map?.safety?.live_proof_claimed, false);
		    if (market.summary.blocker || market.summary.warning) {
		      assert.ok(market.blocker_clearance_map.items.length >= 1);
		      assert.ok(market.blocker_clearance_map.current_focus?.key);
		      assert.ok(market.blocker_clearance_map.current_focus?.owner);
		      assert.ok(market.blocker_clearance_map.current_focus?.primary_surface_url);
		      assert.ok(market.blocker_clearance_map.items.some((item) => item.key === "client_domain_install" || item.key === "buyer_confirmation"));
		      assert.match(marketHtml, /Blocker clearance map/);
		      assert.match(marketHtml, /First hard blocker/);
		    }
		    const clearanceAction = market.launch_clearance_plan?.current_action || null;
		    if (clearanceAction) {
		      assert.equal(market.launch_clearance_plan?.action_bundle?.key, clearanceAction.key);
		      assert.equal(clearanceAction.safety?.read_only_get, true);
		      assert.equal(clearanceAction.safety?.sends_external_email_on_get, false);
		      assert.equal(clearanceAction.safety?.creates_beta_client_on_get, false);
		      assert.equal(clearanceAction.safety?.transmits_external_crm_on_get, false);
		      assert.equal(clearanceAction.safety?.paid_provider_lookup_by_default, false);
		      assert.equal(clearanceAction.safety?.live_proof_claimed, false);
		      if (["close_packet", "confirmation_nudge"].includes(clearanceAction.packet_kind)) {
		        assert.equal(clearanceAction.primary_surface_label, "Manual email draft");
		        assert.equal(clearanceAction.primary_surface_method, "MAILTO");
		        assert.match(clearanceAction.primary_surface_url, /^mailto:/);
		        assert.equal(clearanceAction.operator_post_method, "POST");
		        assert.match(clearanceAction.operator_post_url, /\/api\/v1\/activation\/prospects\/.+\/(close-packet|confirmation-nudge)\/send$/);
		        assert.equal(clearanceAction.manual_record_method, "POST");
		        assert.match(clearanceAction.manual_record_url, /\/api\/v1\/activation\/prospects\/.+\/(close-workflow|confirmation-nudge\/sent)$/);
		        assert.ok(Array.isArray(clearanceAction.missing_confirmation_details));
		        assert.equal(clearanceAction.buyer_completion_context?.missing_count, clearanceAction.missing_confirmation_details.length);
		        assert.equal(typeof clearanceAction.buyer_completion_context?.status_room, "string");
		        assert.equal(typeof clearanceAction.buyer_completion_context?.request_kit, "string");
		        assert.equal(clearanceAction.post_send_plan?.status, "ready_after_manual_send");
		        assert.ok(Array.isArray(clearanceAction.post_send_plan?.after_send_actions));
		        assert.ok(Array.isArray(clearanceAction.post_send_plan?.acceptance_criteria));
		        assert.match(clearanceAction.post_send_plan?.watch_room || "", /\/launch\/confirmation-watch$/);
		        assert.match(clearanceAction.post_send_plan?.reply_parser || "", /\/activation\/prospects\/.+\/confirmation-reply$/);
		        assert.equal(clearanceAction.buyer_completion_context?.paid_enrichment_needed_now, 0);
		        assert.equal(clearanceAction.buyer_completion_payload?.type, "deal_threads.market_buyer_confirmation_completion_payload.v1");
		        assert.equal(clearanceAction.buyer_completion_payload?.summary?.missing_required_details, clearanceAction.missing_confirmation_details.length);
		        assert.equal(clearanceAction.buyer_completion_payload?.summary?.partial_save_available, true);
		        assert.equal(clearanceAction.buyer_completion_payload?.summary?.paid_lookups_recommended_now, 0);
		        assert.match(clearanceAction.buyer_completion_payload?.completion_reply?.body || "", /Target contact\/demo page URL:/);
		        assert.equal(clearanceAction.buyer_completion_payload?.safety?.sends_external_email_on_get, false);
		        assert.equal(clearanceAction.buyer_completion_payload?.safety?.creates_beta_client_on_get, false);
		        assert.equal(clearanceAction.buyer_completion_payload?.safety?.runs_paid_enrichment_on_get, false);
		        assert.equal(clearanceAction.reply_apply_preflight?.type, "deal_threads.market_buyer_reply_apply_preflight.v1");
		        assert.ok(["waiting_for_buyer_reply", "waiting_for_confirmation", "verified_for_kickoff", "apply_receipt_blocked"].includes(clearanceAction.reply_apply_preflight?.status));
		        assert.equal(clearanceAction.reply_apply_preflight?.summary?.paid_lookups_recommended_now, 0);
		        assert.ok(clearanceAction.reply_apply_preflight?.required_apply_fields?.includes("replyEvidenceReceiptJson"));
		        assert.ok(clearanceAction.reply_apply_preflight?.checks?.some((item) => item.key === "reply_parser_available"));
		        assert.equal(clearanceAction.reply_apply_preflight?.safety?.apply_requires_post, true);
		        assert.equal(clearanceAction.reply_apply_preflight?.safety?.paid_provider_lookup_by_default, false);
		        assert.equal(clearanceAction.stakeholder_chase_map?.type, "deal_threads.market_buyer_confirmation_chase_map.v1");
		        assert.equal(clearanceAction.stakeholder_chase_map?.summary?.missing_required_details, clearanceAction.missing_confirmation_details.length);
		        assert.ok(clearanceAction.stakeholder_chase_map?.summary?.stakeholder_asks_needed >= 0);
		        assert.equal(clearanceAction.stakeholder_chase_map?.summary?.paid_lookups_recommended_now, 0);
		        assert.ok(Array.isArray(clearanceAction.stakeholder_chase_map?.blocking_details));
		        assert.ok(Array.isArray(clearanceAction.stakeholder_chase_map?.stakeholder_asks));
		        assert.ok(clearanceAction.stakeholder_chase_map.stakeholder_asks.some((item) => item.key === "website_owner"));
		        assert.equal(clearanceAction.stakeholder_chase_map?.safety?.sends_external_email_on_get, false);
		        assert.equal(clearanceAction.dispatch_commitment_checklist?.type, "deal_threads.market_dispatch_commitment_checklist.v1");
		        assert.ok(["ready_to_send_then_record", "sent_recorded", "ready_to_send_recording_warning"].includes(clearanceAction.dispatch_commitment_checklist?.status));
		        assert.equal(clearanceAction.dispatch_commitment_checklist?.ready_to_send, true);
		        assert.equal(clearanceAction.dispatch_commitment_checklist?.summary?.manual_record_ready, true);
		        assert.equal(clearanceAction.dispatch_commitment_checklist?.summary?.paid_lookups_recommended_now, 0);
		        assert.ok(Array.isArray(clearanceAction.dispatch_commitment_checklist?.checks));
		        assert.ok(clearanceAction.dispatch_commitment_checklist.checks.some((item) => item.key === "actual_send_recorded"));
		        assert.ok(clearanceAction.dispatch_commitment_checklist.evidence_required.some((item) => item.key === "mailbox_sent_timestamp" && item.required));
		        assert.equal(clearanceAction.dispatch_commitment_checklist?.safety?.no_sent_record_without_mailbox_send, true);
		        const manualRecorderHtmlPattern = clearanceAction.packet_kind === "close_packet"
		          ? /\/activation\/prospects\/lead_[a-f0-9-]+\/close-workflow$/
		          : /\/activation\/prospects\/lead_[a-f0-9-]+\/mark-confirmation-nudge-sent$/;
		        const manualRecorderApiPattern = clearanceAction.packet_kind === "close_packet"
		          ? /\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/close-workflow$/
		          : /\/api\/v1\/activation\/prospects\/lead_[a-f0-9-]+\/confirmation-nudge\/sent$/;
		        const manualRecorderRecipientField = clearanceAction.packet_kind === "close_packet" ? "sentTo" : "recipients";
		        assert.equal(clearanceAction.manual_send_evidence_recorder?.type, "deal_threads.market_manual_send_evidence_recorder.v1");
		        assert.ok(["ready_after_mailbox_send", "sent_recorded"].includes(clearanceAction.manual_send_evidence_recorder?.status));
		        assert.equal(clearanceAction.manual_send_evidence_recorder?.ready_to_record_after_mailbox_send, !clearanceAction.manual_send_evidence_recorder?.actual_send_recorded);
		        assert.equal(clearanceAction.manual_send_evidence_recorder?.form?.method, "POST");
		        assert.match(clearanceAction.manual_send_evidence_recorder?.form?.html_action || "", manualRecorderHtmlPattern);
		        assert.match(clearanceAction.manual_send_evidence_recorder?.form?.api_url || "", manualRecorderApiPattern);
		        assert.equal(clearanceAction.manual_send_evidence_recorder?.form?.sends_from_server, false);
		        assert.equal(clearanceAction.manual_send_evidence_recorder?.payload_preview?.returnTo, "/launch/market-ready");
		        assert.ok(clearanceAction.manual_send_evidence_recorder?.fields?.some((item) => item.name === "mailboxSentAt" && item.required));
		        assert.ok(clearanceAction.manual_send_evidence_recorder?.fields?.some((item) => item.name === "senderMailbox" && item.required));
		        assert.ok(clearanceAction.manual_send_evidence_recorder?.fields?.some((item) => item.name === manualRecorderRecipientField && item.required));
		        assert.ok(clearanceAction.manual_send_evidence_recorder?.fields?.some((item) => item.name === "subjectSnapshot" && item.required));
		        assert.ok(clearanceAction.manual_send_evidence_recorder?.fields?.some((item) => item.name === "messageId" && !item.required));
		        assert.ok(clearanceAction.manual_send_evidence_recorder?.fields?.some((item) => item.name === "note" && item.required));
		        assert.equal(clearanceAction.manual_send_evidence_recorder?.safety?.requires_actual_mailbox_send_first, true);
		        assert.equal(clearanceAction.manual_send_evidence_recorder?.safety?.sends_from_server_on_post, false);
		        assert.equal(clearanceAction.manual_send_evidence_recorder?.safety?.no_sent_record_without_mailbox_send, true);
		        assert.equal(market.blocker_clearance_map?.current_focus?.current_action?.key, clearanceAction.key);
		        assert.equal(market.blocker_clearance_map?.current_focus?.operator_post_method, clearanceAction.operator_post_method);
		        assert.equal(market.blocker_clearance_map?.current_focus?.paid_lookup_required, false);
		        assert.equal(clearanceAction.dispatch_preflight?.type, "deal_threads.market_action_dispatch_preflight.v1");
		        assert.equal(clearanceAction.dispatch_preflight?.send_ready, true);
		        assert.equal(clearanceAction.dispatch_preflight?.summary?.blocker, 0);
		        assert.equal(clearanceAction.dispatch_preflight?.summary?.paid_lookups_recommended_now, 0);
		        assert.equal(clearanceAction.dispatch_preflight?.external_send_mode, "manual_mailto");
		        assert.ok(Array.isArray(clearanceAction.dispatch_preflight?.checks));
		        assert.ok(Array.isArray(clearanceAction.dispatch_preflight?.link_inventory));
		        assert.ok(clearanceAction.dispatch_preflight.checks.some((item) => item.key === "operator_send_post_ready" && item.status === "pass"));
		        assert.ok(clearanceAction.dispatch_preflight.link_inventory.some((item) => item.key === "confirmation_form" && item.status === "pass"));
		        assert.equal(clearanceAction.dispatch_preflight?.safety?.read_only_get, true);
		        assert.equal(clearanceAction.dispatch_preflight?.safety?.sends_external_email_on_get, false);
		        assert.equal(clearanceAction.manual_dispatch_packet?.type, "deal_threads.market_manual_dispatch_packet.v1");
		        assert.equal(clearanceAction.manual_dispatch_packet?.copy_ready, true);
		        assert.ok(clearanceAction.manual_dispatch_packet?.recipients?.length >= 1);
		        assert.equal(typeof clearanceAction.manual_dispatch_packet?.subject, "string");
		        assert.equal(typeof clearanceAction.manual_dispatch_packet?.body, "string");
		        assert.ok(clearanceAction.manual_dispatch_packet.body.length > 100);
		        assert.match(clearanceAction.manual_dispatch_packet?.mailto_url || "", /^mailto:/);
		        assert.equal(clearanceAction.manual_dispatch_packet?.recording?.method, "POST");
		        assert.equal(clearanceAction.manual_dispatch_packet?.safety?.manual_record_requires_actual_send_first, true);
		        assert.equal(clearanceAction.manual_dispatch_packet?.copy_safety_audit?.type, "deal_threads.market_dispatch_copy_safety_audit.v1");
		        assert.equal(clearanceAction.manual_dispatch_packet?.copy_safety_audit?.safe_to_forward, true);
		        assert.equal(clearanceAction.manual_dispatch_packet?.copy_safety_audit?.summary?.protected_link_leaks, 0);
		        assert.equal(clearanceAction.manual_dispatch_packet?.copy_safety_audit?.summary?.premature_claim_flags, 0);
		        assert.equal(clearanceAction.manual_dispatch_packet?.copy_safety_audit?.summary?.paid_lookups_recommended_now, 0);
		        assert.ok(clearanceAction.manual_dispatch_packet?.copy_safety_audit?.summary?.body_links >= 1);
		        assert.ok(clearanceAction.manual_dispatch_packet.copy_safety_audit.checks.some((item) => item.key === "body_links_buyer_safe" && item.status === "pass"));
		        assert.equal(clearanceAction.safety?.manual_record_requires_post, true);
		        assert.equal(clearanceAction.safety?.primary_surface_sends_from_server, false);
		        assert.match(marketHtml, /Current clearance action/);
		        assert.match(marketHtml, /Manual email draft/);
		        assert.match(marketHtml, /Operator POST/);
		        assert.match(marketHtml, /Manual sent POST/);
		        assert.match(marketHtml, /Missing details/);
		        assert.match(marketHtml, /Buyer completion payload/);
		        assert.match(marketHtml, /Buyer completion reply/);
		        assert.match(marketHtml, /Stakeholder chase map/);
		        assert.match(marketHtml, /Stakeholder chase asks/);
		        assert.match(marketHtml, /Stakeholder chase sequence/);
		        assert.match(marketHtml, /Dispatch commitment checklist/);
		        assert.match(marketHtml, /Dispatch evidence required/);
		        assert.match(marketHtml, /Mailbox sent timestamp/);
		        assert.match(marketHtml, /Manual send evidence recorder/);
		        assert.match(marketHtml, /Record manual nudge sent/);
		        assert.match(marketHtml, /Mailbox sent timestamp/);
		        assert.match(marketHtml, /Sender mailbox or sending system/);
		        assert.match(marketHtml, /Mailbox send evidence note/);
		        assert.match(marketHtml, /After send/);
		        assert.match(marketHtml, /Acceptance criteria/);
		        assert.match(marketHtml, /Dispatch preflight/);
		        assert.match(marketHtml, /Dispatch links/);
		        assert.match(marketHtml, /Manual dispatch packet/);
		        assert.match(marketHtml, /Copy safety audit/);
		        assert.match(marketHtml, /Copy link audit/);
		      }
		      if (clearanceAction.packet_kind === "kickoff") {
		        assert.equal(clearanceAction.primary_surface_method, "POST");
		        assert.equal(clearanceAction.operator_post_method, "POST");
		        assert.equal(clearanceAction.safety?.send_action_requires_post, true);
		        assert.equal(clearanceAction.kickoff_install_handoff_preflight?.type, "deal_threads.market_kickoff_install_handoff_preflight.v1");
		        assert.ok(["ready_to_kickoff", "already_converted", "blocked"].includes(clearanceAction.kickoff_install_handoff_preflight?.status));
		        assert.equal(clearanceAction.kickoff_install_handoff_preflight?.summary?.paid_lookups_recommended_now, 0);
		        assert.equal(clearanceAction.kickoff_install_handoff_preflight?.kickoff_surface?.method, "POST");
		        assert.match(clearanceAction.kickoff_install_handoff_preflight?.kickoff_surface?.api_url || "", /\/api\/v1\/activation\/prospects\/.+\/kickoff$/);
		        assert.ok(clearanceAction.kickoff_install_handoff_preflight?.required_post_fields?.includes("launchRecipients"));
		        assert.ok(clearanceAction.kickoff_install_handoff_preflight?.checks?.some((item) => item.key === "buyer_confirmation"));
		        assert.ok(clearanceAction.kickoff_install_handoff_preflight?.evidence_required?.some((item) => item.key === "launch_packet_delivery" && item.required));
		        assert.ok(clearanceAction.kickoff_install_handoff_preflight?.evidence_required?.some((item) => item.key === "tokenized_install_handoff" && item.required));
		        assert.ok(clearanceAction.kickoff_install_handoff_preflight?.post_result_expected_keys?.includes("proof_transition"));
		        assert.equal(clearanceAction.kickoff_install_handoff_preflight?.safety?.kickoff_requires_post, true);
		        assert.equal(clearanceAction.kickoff_install_handoff_preflight?.safety?.operator_post_may_create_beta_client, true);
		        assert.equal(clearanceAction.kickoff_install_handoff_preflight?.safety?.operator_post_may_send_or_dry_run_install_handoff, true);
		        assert.equal(clearanceAction.kickoff_install_handoff_preflight?.safety?.operator_post_claims_market_ready, false);
			        assert.equal(clearanceAction.kickoff_preflight?.type, clearanceAction.kickoff_install_handoff_preflight.type);
			        assert.equal(clearanceAction.install_handoff_evidence_contract?.length, clearanceAction.kickoff_install_handoff_preflight.evidence_required.length);
			        assert.match(marketHtml, /Kickoff install handoff preflight/);
			        assert.match(marketHtml, /Kickoff required fields/);
			        assert.match(marketHtml, /Kickoff evidence required/);
			        assert.match(marketHtml, /Kickoff POST result keys/);
			      }
			      if (clearanceAction.packet_kind === "install_proof" || market.launch_clearance_plan?.current_stage === "client_domain_install") {
			        const clientDomainInstallPreflight = clearanceAction.client_domain_install_preflight;
			        assert.equal(clearanceAction.primary_surface_method, "GET");
			        assert.match(clearanceAction.primary_surface_url || "", /\/launch\/install-queue/);
			        assert.equal(clearanceAction.proof_focus, "client_domain_install");
			        assert.equal(clearanceAction.safety?.read_only_get, true);
			        assert.equal(clearanceAction.safety?.hosted_load_does_not_clear_live_install, true);
			        assert.equal(clientDomainInstallPreflight?.type, "deal_threads.market_client_domain_install_preflight.v1");
			        assert.equal(clientDomainInstallPreflight?.summary?.paid_lookups_recommended_now, 0);
			        assert.equal(clientDomainInstallPreflight?.safety?.read_only_get, true);
			        assert.equal(clientDomainInstallPreflight?.safety?.source_check_requires_post, true);
			        assert.equal(clientDomainInstallPreflight?.safety?.hosted_load_does_not_clear_live_install, true);
			        assert.equal(clientDomainInstallPreflight?.safety?.client_domain_load_requires_buyer_page, true);
			        assert.ok(clientDomainInstallPreflight?.checks?.some((item) => item.key === "client_domain_config_load"));
			        assert.ok(clientDomainInstallPreflight?.checks?.some((item) => item.key === "hosted_loads_do_not_count" && item.status === "pass"));
			        assert.ok(clientDomainInstallPreflight?.evidence_required?.some((item) => item.key === "client_domain_config_load" && item.required));
			        assert.ok(clientDomainInstallPreflight?.evidence_required?.some((item) => item.key === "source_check_result" && !item.required));
			        assert.equal(clientDomainInstallPreflight?.surfaces?.source_check?.method, "POST");
			        assert.equal(clearanceAction.install_proof_preflight?.type, clientDomainInstallPreflight.type);
			        assert.equal(clearanceAction.install_proof_evidence_contract?.length, clientDomainInstallPreflight.evidence_required.length);
			        assert.match(marketHtml, /Client-domain install preflight/);
			        assert.match(marketHtml, /Client-domain install evidence/);
			        assert.match(marketHtml, /Client-domain install sequence/);
			        assert.match(marketHtml, /Client-domain install links/);
			      }
			      if (clearanceAction.packet_kind === "first_profile" || market.launch_clearance_plan?.current_stage === "first_profile_capture") {
			        const firstProfilePreflight = clearanceAction.first_profile_capture_preflight;
			        assert.equal(clearanceAction.primary_surface_method, "GET");
			        assert.match(clearanceAction.primary_surface_url || "", /\/launch\/first-profile/);
			        assert.equal(clearanceAction.operator_post_method, "POST");
			        assert.match(clearanceAction.operator_post_url || "", /\/launch\/beta_[a-f0-9-]+\/test-lead$/);
			        assert.equal(clearanceAction.proof_focus, "first_real_profile");
			        assert.equal(clearanceAction.safety?.read_only_get, true);
			        assert.equal(clearanceAction.safety?.creates_profile_on_get, false);
			        assert.equal(clearanceAction.safety?.test_lead_creation_requires_post, true);
			        assert.equal(firstProfilePreflight?.type, "deal_threads.market_first_profile_capture_preflight.v1");
			        assert.equal(firstProfilePreflight?.summary?.paid_lookups_recommended_now, 0);
			        assert.equal(firstProfilePreflight?.safety?.read_only_get, true);
			        assert.equal(firstProfilePreflight?.safety?.creates_profile_on_get, false);
			        assert.equal(firstProfilePreflight?.safety?.test_lead_creation_requires_post, true);
			        assert.ok(firstProfilePreflight?.required_post_fields?.includes("message"));
			        assert.equal(firstProfilePreflight?.create_profile_surface?.method, "POST");
			        assert.equal(firstProfilePreflight?.create_profile_surface?.creates_profile, true);
			        assert.equal(firstProfilePreflight?.create_profile_surface?.preview_only_on_get, true);
			        assert.ok(firstProfilePreflight?.checks?.some((item) => item.key === "client_domain_config_load"));
			        assert.ok(firstProfilePreflight?.checks?.some((item) => item.key === "first_beta_profile"));
			        assert.ok(firstProfilePreflight?.checks?.some((item) => item.key === "explicit_profile_post_required" && item.status === "pass"));
			        assert.ok(firstProfilePreflight?.evidence_required?.some((item) => item.key === "first_beta_profile" && item.required));
			        assert.ok(firstProfilePreflight?.evidence_required?.some((item) => item.key === "crm_handoff_after_profile" && !item.required));
			        assert.equal(clearanceAction.first_profile_preflight?.type, firstProfilePreflight.type);
			        assert.equal(clearanceAction.first_profile_evidence_contract?.length, firstProfilePreflight.evidence_required.length);
			        assert.match(marketHtml, /First profile capture preflight/);
			        assert.match(marketHtml, /First profile required fields/);
			        assert.match(marketHtml, /First profile evidence/);
			        assert.match(marketHtml, /First profile POST preview/);
			        assert.match(marketHtml, /First profile payload preview/);
			      }
			      if (clearanceAction.packet_kind === "crm_handoff" || clearanceAction.crm_handoff_preflight) {
			        const crmHandoffPreflight = clearanceAction.crm_handoff_preflight;
			        assert.equal(clearanceAction.primary_surface_method, "GET");
			        assert.match(clearanceAction.primary_surface_url || "", /\/launch\/profile-handoff/);
			        assert.equal(clearanceAction.operator_post_method, "POST");
			        assert.match(clearanceAction.operator_post_url || "", /\/crm\/lead_[a-f0-9-]+\/crm-delivery\/send$/);
			        assert.match(clearanceAction.operator_post_api_url || "", /\/api\/v1\/leads\/lead_[a-f0-9-]+\/crm-delivery\/send$/);
			        assert.equal(clearanceAction.proof_focus, "crm_handoff");
			        assert.equal(clearanceAction.safety?.read_only_get, true);
			        assert.equal(clearanceAction.safety?.queues_crm_delivery_on_get, false);
			        assert.equal(clearanceAction.safety?.transmits_external_crm_on_get, false);
			        assert.equal(clearanceAction.safety?.crm_delivery_requires_post, true);
			        assert.equal(crmHandoffPreflight?.type, "deal_threads.market_crm_handoff_preflight.v1");
			        assert.equal(crmHandoffPreflight?.summary?.paid_lookups_recommended_now, 0);
			        assert.equal(crmHandoffPreflight?.safety?.read_only_get, true);
			        assert.equal(crmHandoffPreflight?.safety?.queues_crm_delivery_on_get, false);
			        assert.equal(crmHandoffPreflight?.safety?.transmits_external_crm_on_get, false);
			        assert.equal(crmHandoffPreflight?.safety?.crm_delivery_requires_post, true);
			        assert.equal(crmHandoffPreflight?.crm_delivery_surface?.method, "POST");
			        assert.equal(crmHandoffPreflight?.crm_delivery_surface?.preview_only_on_get, true);
			        assert.ok(crmHandoffPreflight?.checks?.some((item) => item.key === "first_beta_profile"));
			        assert.ok(crmHandoffPreflight?.checks?.some((item) => item.key === "crm_handoff_sent"));
			        assert.ok(crmHandoffPreflight?.checks?.some((item) => item.key === "crm_delivery_post_surface"));
			        assert.ok(crmHandoffPreflight?.evidence_required?.some((item) => item.key === "explicit_crm_delivery_post" && item.required));
			        assert.ok(crmHandoffPreflight?.evidence_required?.some((item) => item.key === "crm_handoff_sent" && item.required));
			        assert.ok(crmHandoffPreflight?.evidence_required?.some((item) => item.key === "rep_feedback_after_handoff" && !item.required));
			        assert.equal(clearanceAction.profile_handoff_preflight?.type, crmHandoffPreflight.type);
			        assert.equal(clearanceAction.crm_handoff_evidence_contract?.length, crmHandoffPreflight.evidence_required.length);
			        assert.match(marketHtml, /CRM handoff preflight/);
			        assert.match(marketHtml, /CRM handoff evidence/);
			        assert.match(marketHtml, /CRM handoff POST preview/);
			        assert.match(marketHtml, /CRM handoff payload preview/);
			      }
			      if (clearanceAction.packet_kind === "rep_feedback" || clearanceAction.rep_feedback_preflight) {
			        const repFeedbackPreflight = clearanceAction.rep_feedback_preflight;
			        assert.equal(clearanceAction.primary_surface_method, "GET");
			        assert.match(clearanceAction.primary_surface_url || "", /\/launch\/rep-feedback/);
			        assert.equal(clearanceAction.operator_post_method, "POST");
			        assert.match(clearanceAction.operator_post_url || "", /\/crm\/lead_[a-f0-9-]+\/rep-feedback$/);
			        assert.match(clearanceAction.operator_post_api_url || "", /\/api\/v1\/leads\/lead_[a-f0-9-]+\/rep-feedback$/);
			        assert.equal(clearanceAction.proof_focus, "rep_feedback");
			        assert.equal(clearanceAction.safety?.read_only_get, true);
			        assert.equal(clearanceAction.safety?.updates_rep_feedback_on_get, false);
			        assert.equal(clearanceAction.safety?.protected_feedback_requires_post, true);
			        assert.equal(repFeedbackPreflight?.type, "deal_threads.market_rep_feedback_preflight.v1");
			        assert.equal(repFeedbackPreflight?.summary?.paid_lookups_recommended_now, 0);
			        assert.equal(repFeedbackPreflight?.summary?.crm_handoff_sent, true);
			        assert.equal(repFeedbackPreflight?.safety?.read_only_get, true);
			        assert.equal(repFeedbackPreflight?.safety?.updates_rep_feedback_on_get, false);
			        assert.equal(repFeedbackPreflight?.safety?.protected_feedback_requires_post, true);
			        assert.equal(repFeedbackPreflight?.safety?.feedback_submission_requires_external_rep_or_post, true);
			        assert.equal(repFeedbackPreflight?.protected_feedback_surface?.method, "POST");
			        assert.equal(repFeedbackPreflight?.protected_feedback_surface?.preview_only_on_get, true);
			        assert.ok(repFeedbackPreflight?.copy_block?.mailto_url?.startsWith("mailto:"));
			        assert.ok(repFeedbackPreflight?.checks?.some((item) => item.key === "crm_handoff_sent" && item.status === "pass"));
			        assert.ok(repFeedbackPreflight?.checks?.some((item) => item.key === "rep_feedback_review"));
			        assert.ok(repFeedbackPreflight?.evidence_required?.some((item) => item.key === "tokenized_feedback_room" && item.required));
			        assert.ok(repFeedbackPreflight?.evidence_required?.some((item) => item.key === "rep_feedback_review" && item.required));
			        assert.ok(repFeedbackPreflight?.evidence_required?.some((item) => item.key === "proof_packet_after_feedback" && !item.required));
			        assert.equal(clearanceAction.rep_feedback_evidence_contract?.length, repFeedbackPreflight.evidence_required.length);
			        assert.match(marketHtml, /Rep feedback preflight/);
			        assert.match(marketHtml, /Rep feedback evidence/);
			        assert.match(marketHtml, /Rep feedback ask preview/);
			        assert.match(marketHtml, /Rep feedback POST preview/);
			        assert.match(marketHtml, /Rep feedback links/);
			      }
			      if (clearanceAction.packet_kind === "proof_packet") {
			        const proofPacketPreflight = clearanceAction.proof_packet_preflight || clearanceAction.first_proof_packet_preflight;
			        assert.equal(clearanceAction.primary_surface_method, "GET");
			        assert.match(clearanceAction.primary_surface_url || "", /\/launch\/proof-packet/);
			        assert.equal(clearanceAction.proof_focus, "live_proof_gate");
			        assert.equal(clearanceAction.safety?.read_only_get, true);
			        assert.equal(clearanceAction.safety?.queues_report_delivery_on_get, false);
			        assert.equal(clearanceAction.safety?.marks_report_sent_on_get, false);
			        assert.equal(clearanceAction.safety?.queue_requires_post, true);
			        assert.equal(clearanceAction.safety?.manual_sent_record_requires_post, true);
			        assert.equal(proofPacketPreflight?.type, "deal_threads.market_first_proof_packet_preflight.v1");
			        assert.equal(proofPacketPreflight?.summary?.paid_lookups_recommended_now, 0);
			        assert.equal(proofPacketPreflight?.safety?.read_only_get, true);
			        assert.equal(proofPacketPreflight?.safety?.queues_report_delivery_on_get, false);
			        assert.equal(proofPacketPreflight?.safety?.marks_report_sent_on_get, false);
			        assert.equal(proofPacketPreflight?.safety?.queue_requires_post, true);
			        assert.equal(proofPacketPreflight?.safety?.manual_sent_record_requires_post, true);
			        assert.equal(proofPacketPreflight?.queue_surface?.method, "POST");
			        assert.equal(proofPacketPreflight?.queue_surface?.preview_only_on_get, true);
			        assert.equal(proofPacketPreflight?.queue_surface?.sends_from_server, false);
			        assert.ok(proofPacketPreflight?.manual_email?.mailto_url?.startsWith("mailto:"));
			        assert.ok(proofPacketPreflight?.checks?.some((item) => item.key === "explicit_queue_post"));
			        assert.ok(proofPacketPreflight?.checks?.some((item) => item.key === "first_proof_packet_sent"));
			        assert.ok(proofPacketPreflight?.evidence_required?.some((item) => item.key === "explicit_queue_post" && item.required));
			        assert.ok(proofPacketPreflight?.evidence_required?.some((item) => item.key === "manual_sent_record"));
			        assert.ok(proofPacketPreflight?.evidence_required?.some((item) => item.key === "live_proof_after_packet" && !item.required));
			        assert.equal(clearanceAction.first_proof_packet_preflight?.type || proofPacketPreflight.type, proofPacketPreflight.type);
			        assert.equal(clearanceAction.proof_packet_evidence_contract?.length, proofPacketPreflight.evidence_required.length);
			        assert.match(marketHtml, /First proof packet preflight/);
			        assert.match(marketHtml, /First proof packet evidence/);
			        assert.match(marketHtml, /First proof packet queue preview/);
			        assert.match(marketHtml, /First proof packet email preview/);
			        assert.match(marketHtml, /First proof packet links/);
			      }
			      if (clearanceAction.packet_kind === "live_proof_clearance" || clearanceAction.live_proof_clearance_preflight || clearanceAction.live_proof_gate_preflight) {
			        const liveProofPreflight = clearanceAction.live_proof_clearance_preflight || clearanceAction.live_proof_gate_preflight;
			        assert.equal(clearanceAction.primary_surface_method, "GET");
			        assert.match(clearanceAction.primary_surface_url || "", /\/api\/v1\/proof\/live-gate/);
			        assert.equal(clearanceAction.proof_focus, "live_proof_gate");
			        assert.equal(clearanceAction.safety?.read_only_get, true);
			        assert.equal(clearanceAction.safety?.claims_market_ready_on_get, false);
			        assert.equal(clearanceAction.safety?.live_proof_claimed, false);
			        assert.equal(clearanceAction.safety?.requires_zero_blockers_for_market_claim, true);
			        assert.equal(clearanceAction.operator_post_method, null);
			        assert.equal(liveProofPreflight?.type, "deal_threads.market_live_proof_clearance_preflight.v1");
			        assert.ok(["internal_beta_only", "launch_with_disclosures", "market_claims_allowed"].includes(liveProofPreflight?.claim_scope));
			        assert.equal(liveProofPreflight?.summary?.proof_packet_sent, true);
			        assert.equal(liveProofPreflight?.summary?.paid_lookups_recommended_now, 0);
			        assert.equal(liveProofPreflight?.safety?.read_only_get, true);
			        assert.equal(liveProofPreflight?.safety?.claims_market_ready_on_get, false);
			        assert.equal(liveProofPreflight?.safety?.live_proof_claimed, false);
			        assert.equal(liveProofPreflight?.safety?.requires_zero_blockers_for_market_claim, true);
			        assert.ok(liveProofPreflight?.checks?.some((item) => item.key === "live_proof_gate_recheck"));
			        assert.ok(liveProofPreflight?.checks?.some((item) => item.key === "claim_scope_lock"));
			        assert.ok(liveProofPreflight?.evidence_required?.some((item) => item.key === "first_proof_packet_sent" && item.required));
			        assert.ok(liveProofPreflight?.evidence_required?.some((item) => item.key === "zero_live_proof_blockers" && item.required));
			        assert.ok(liveProofPreflight?.evidence_required?.some((item) => item.key === "market_kit_claim_scope" && item.required));
			        assert.equal(clearanceAction.live_proof_gate_preflight?.type || liveProofPreflight.type, liveProofPreflight.type);
			        assert.equal(clearanceAction.live_proof_evidence_contract?.length, liveProofPreflight.evidence_required.length);
			        assert.match(marketHtml, /Live proof clearance preflight/);
			        assert.match(marketHtml, /Live proof clearance evidence/);
			        assert.match(marketHtml, /Live proof claim scope/);
			        assert.match(marketHtml, /Live proof clearance links/);
			      }
			    }
		    assert.equal(market.safety?.mutates_buyer_state_on_get, false);
		    assert.equal(market.safety?.sends_external_email_on_get, false);
		    assert.equal(market.safety?.creates_beta_client_on_get, false);
		    assert.equal(market.safety?.transmits_external_crm_on_get, false);
		    assert.equal(market.safety?.paid_provider_lookup_by_default, false);
		    assert.equal(market.safety?.live_proof_claimed, false);
		    assert.equal(market.market_ready, market.summary.blocker === 0 && market.status === "market_ready");
		    const marketMarkdown = await request("/api/v1/launch/market-ready?format=markdown", { auth: true });
		    assert.equal(marketMarkdown.status, 200);
		    const marketMarkdownText = await marketMarkdown.text();
		    assert.match(marketMarkdownText, /# Deal Threads Market Launch Readiness/);
		    assert.match(marketMarkdownText, /Market ready:/);
		    assert.match(marketMarkdownText, /## Founder Timeline Answer/);
		    assert.match(marketMarkdownText, /Core build is ready for the first beta/i);
		    assert.match(marketMarkdownText, /Software left: 0 required code builds/i);
		    assert.match(marketMarkdownText, /## Readiness Estimate/);
		    assert.match(marketMarkdownText, /## Launch Clearance Plan/);
		    assert.match(marketMarkdownText, /### Blocker Clearance Map/);
		    assert.match(marketMarkdownText, /Paid lookups recommended now: 0/);
		    if (clearanceAction) {
		      assert.match(marketMarkdownText, /### Current Clearance Action/);
		      assert.match(marketMarkdownText, /Current action:/);
		      assert.match(marketMarkdownText, /Primary method:/);
		      assert.match(marketMarkdownText, /Operator POST method:/);
		      if (["close_packet", "confirmation_nudge"].includes(clearanceAction.packet_kind)) {
		        assert.match(marketMarkdownText, /Missing confirmation details:/);
		        assert.match(marketMarkdownText, /Buyer completion payload:/);
		        assert.match(marketMarkdownText, /#### Buyer Completion Payload/);
		        assert.match(marketMarkdownText, /Buyer reply apply preflight:/);
		        assert.match(marketMarkdownText, /Buyer reply apply requires POST: yes/);
		        assert.match(marketMarkdownText, /#### Buyer Reply Apply Preflight/);
		        assert.match(marketMarkdownText, /Required apply field: replyEvidenceReceiptJson/);
		        assert.match(marketMarkdownText, /Stakeholder chase map:/);
		        assert.match(marketMarkdownText, /Stakeholder asks needed:/);
		        assert.match(marketMarkdownText, /#### Stakeholder Chase Map/);
		        assert.match(marketMarkdownText, /#### Stakeholder Chase Asks/);
		        assert.match(marketMarkdownText, /Dispatch commitment:/);
		        assert.match(marketMarkdownText, /Dispatch commitment ready to send: yes/);
		        assert.match(marketMarkdownText, /#### Dispatch Commitment Checklist/);
		        assert.match(marketMarkdownText, /#### Dispatch Evidence Required/);
		        assert.match(marketMarkdownText, /Mailbox sent timestamp/);
		        assert.match(marketMarkdownText, /Manual send evidence recorder:/);
		        assert.match(marketMarkdownText, /Manual send evidence form method: POST/);
		        assert.match(marketMarkdownText, /Manual send evidence sends from server: no/);
		        assert.match(marketMarkdownText, /#### Manual Send Evidence Recorder/);
		        assert.match(marketMarkdownText, /Field mailboxSentAt/);
		        assert.match(marketMarkdownText, /Field senderMailbox/);
		        assert.match(marketMarkdownText, /Field subjectSnapshot/);
		        assert.match(marketMarkdownText, /Post-send plan:/);
		        assert.match(marketMarkdownText, /#### After Send Actions/);
		        assert.match(marketMarkdownText, /#### Acceptance Criteria/);
		        assert.match(marketMarkdownText, /Dispatch preflight:/);
		        assert.match(marketMarkdownText, /#### Dispatch Preflight Checks/);
		        assert.match(marketMarkdownText, /Dispatch paid lookups recommended now: 0/);
		        assert.match(marketMarkdownText, /Manual dispatch packet:/);
		        assert.match(marketMarkdownText, /#### Manual Dispatch Packet/);
		        assert.match(marketMarkdownText, /Record requires actual send first: yes/);
		        assert.match(marketMarkdownText, /Copy safety audit:/);
		        assert.match(marketMarkdownText, /Copy safe to forward: yes/);
		        assert.match(marketMarkdownText, /Protected link leaks: 0/);
		        assert.match(marketMarkdownText, /#### Copy Safety Audit/);
		        assert.match(marketMarkdownText, /#### Copy Link Audit/);
		      }
		      if (clearanceAction.packet_kind === "kickoff") {
		        assert.match(marketMarkdownText, /Kickoff install handoff preflight:/);
		        assert.match(marketMarkdownText, /Kickoff POST creates beta client: yes/);
		        assert.match(marketMarkdownText, /Kickoff POST sends install handoff: yes/);
		        assert.match(marketMarkdownText, /Kickoff paid lookups recommended now: 0/);
			        assert.match(marketMarkdownText, /#### Kickoff Install Handoff Preflight/);
			        assert.match(marketMarkdownText, /Required kickoff field: launchRecipients/);
			        assert.match(marketMarkdownText, /Evidence launch_packet_delivery: required/);
			        assert.match(marketMarkdownText, /Expected POST result key: proof_transition/);
			      }
			      if (clearanceAction.packet_kind === "install_proof" || market.launch_clearance_plan?.current_stage === "client_domain_install") {
			        assert.match(marketMarkdownText, /Client-domain install preflight:/);
			        assert.match(marketMarkdownText, /Client-domain paid lookups recommended now: 0/);
			        assert.match(marketMarkdownText, /#### Client-Domain Install Preflight/);
			        assert.match(marketMarkdownText, /#### Client-Domain Install Evidence/);
			        assert.match(marketMarkdownText, /Evidence client_domain_config_load: required/);
			        assert.match(marketMarkdownText, /Evidence source_check_result: recommended/);
			        assert.match(marketMarkdownText, /#### Client-Domain Install Sequence/);
			        assert.match(marketMarkdownText, /#### Client-Domain Install Links/);
			      }
			      if (clearanceAction.packet_kind === "first_profile" || market.launch_clearance_plan?.current_stage === "first_profile_capture") {
			        assert.match(marketMarkdownText, /First profile capture preflight:/);
			        assert.match(marketMarkdownText, /First profile POST requires review: yes/);
			        assert.match(marketMarkdownText, /First profile paid lookups recommended now: 0/);
			        assert.match(marketMarkdownText, /#### First Profile Capture Preflight/);
			        assert.match(marketMarkdownText, /Required first-profile field: message/);
			        assert.match(marketMarkdownText, /#### First Profile Evidence/);
			        assert.match(marketMarkdownText, /Evidence first_beta_profile: required/);
			        assert.match(marketMarkdownText, /Evidence crm_handoff_after_profile: recommended/);
			        assert.match(marketMarkdownText, /#### First Profile POST Preview/);
			        assert.match(marketMarkdownText, /Creates profile: yes/);
			        assert.match(marketMarkdownText, /Preview only on GET: yes/);
			        assert.match(marketMarkdownText, /#### First Profile Sequence/);
			        assert.match(marketMarkdownText, /#### First Profile Links/);
			      }
			      if (clearanceAction.packet_kind === "crm_handoff" || clearanceAction.crm_handoff_preflight) {
			        assert.match(marketMarkdownText, /CRM handoff preflight:/);
			        assert.match(marketMarkdownText, /CRM delivery requires POST: yes/);
			        assert.match(marketMarkdownText, /CRM handoff paid lookups recommended now: 0/);
			        assert.match(marketMarkdownText, /#### CRM Handoff Preflight/);
			        assert.match(marketMarkdownText, /Evidence explicit_crm_delivery_post: required/);
			        assert.match(marketMarkdownText, /Evidence crm_handoff_sent: required/);
			        assert.match(marketMarkdownText, /Evidence rep_feedback_after_handoff: recommended/);
			        assert.match(marketMarkdownText, /#### CRM Handoff POST Preview/);
			        assert.match(marketMarkdownText, /Transmits external CRM on POST:/);
			        assert.match(marketMarkdownText, /Preview only on GET: yes/);
			        assert.match(marketMarkdownText, /#### CRM Handoff Sequence/);
			        assert.match(marketMarkdownText, /#### CRM Handoff Links/);
			      }
			      if (clearanceAction.packet_kind === "rep_feedback" || clearanceAction.rep_feedback_preflight) {
			        assert.match(marketMarkdownText, /Rep feedback preflight:/);
			        assert.match(marketMarkdownText, /Rep feedback ready to request: yes/);
			        assert.match(marketMarkdownText, /Rep feedback CRM handoff sent: yes/);
			        assert.match(marketMarkdownText, /Rep feedback protected POST requires review: yes/);
			        assert.match(marketMarkdownText, /Rep feedback paid lookups recommended now: 0/);
			        assert.match(marketMarkdownText, /#### Rep Feedback Preflight/);
			        assert.match(marketMarkdownText, /Evidence tokenized_feedback_room: required/);
			        assert.match(marketMarkdownText, /Evidence rep_feedback_review: required/);
			        assert.match(marketMarkdownText, /Evidence proof_packet_after_feedback: recommended/);
			        assert.match(marketMarkdownText, /#### Rep Feedback Ask Preview/);
			        assert.match(marketMarkdownText, /#### Rep Feedback POST Preview/);
			        assert.match(marketMarkdownText, /Updates feedback: yes/);
			        assert.match(marketMarkdownText, /Preview only on GET: yes/);
			        assert.match(marketMarkdownText, /#### Rep Feedback Sequence/);
			        assert.match(marketMarkdownText, /#### Rep Feedback Links/);
			      }
			      if (clearanceAction.packet_kind === "proof_packet") {
			        assert.match(marketMarkdownText, /First proof packet preflight:/);
			        assert.match(marketMarkdownText, /First proof packet queue requires POST: yes/);
			        assert.match(marketMarkdownText, /First proof packet manual sent requires POST: yes/);
			        assert.match(marketMarkdownText, /First proof packet paid lookups recommended now: 0/);
			        assert.match(marketMarkdownText, /#### First Proof Packet Preflight/);
			        assert.match(marketMarkdownText, /Evidence explicit_queue_post: required/);
			        assert.match(marketMarkdownText, /Evidence manual_sent_record:/);
			        assert.match(marketMarkdownText, /Evidence live_proof_after_packet: recommended/);
			        assert.match(marketMarkdownText, /#### First Proof Packet Queue Preview/);
			        assert.match(marketMarkdownText, /Sends from server: no/);
			        assert.match(marketMarkdownText, /Preview only on GET: yes/);
			        assert.match(marketMarkdownText, /#### First Proof Packet Manual Sent Preview/);
			        assert.match(marketMarkdownText, /#### First Proof Packet Email Preview/);
			        assert.match(marketMarkdownText, /#### First Proof Packet Sequence/);
			        assert.match(marketMarkdownText, /#### First Proof Packet Links/);
			      }
			      if (clearanceAction.packet_kind === "live_proof_clearance" || clearanceAction.live_proof_clearance_preflight || clearanceAction.live_proof_gate_preflight) {
			        assert.match(marketMarkdownText, /Live proof clearance preflight:/);
			        assert.match(marketMarkdownText, /Live proof requires zero blockers: yes/);
			        assert.match(marketMarkdownText, /Live proof GET claims market ready: no/);
			        assert.match(marketMarkdownText, /Live proof GET claims live proof: no/);
			        assert.match(marketMarkdownText, /#### Live Proof Clearance Preflight/);
			        assert.match(marketMarkdownText, /Evidence first_proof_packet_sent: required/);
			        assert.match(marketMarkdownText, /Evidence zero_live_proof_blockers: required/);
			        assert.match(marketMarkdownText, /Evidence market_kit_claim_scope: required/);
			        assert.match(marketMarkdownText, /#### Live Proof Clearance Evidence/);
			        assert.match(marketMarkdownText, /#### Live Proof Claim Scope/);
			        assert.match(marketMarkdownText, /#### Live Proof Clearance Sequence/);
			        assert.match(marketMarkdownText, /#### Live Proof Clearance Links/);
			      }
			    }
		    assert.match(marketMarkdownText, /### Can Start Now/);
		    assert.match(marketMarkdownText, /### Do Not Build Yet/);
		    assert.match(marketMarkdownText, /Required code builds before first beta: 0/);
		    assert.match(marketMarkdownText, /GET sends external email: no/);

		    const marketKitPage = await request("/launch/market-kit", { auth: true });
		    assert.equal(marketKitPage.status, 200);
		    const marketKitHtml = await marketKitPage.text();
		    assert.match(marketKitHtml, /Market launch kit/);
		    assert.match(marketKitHtml, /Launch-safe claims/);
		    assert.match(marketKitHtml, /Claim scope review/);
		    assert.match(marketKitHtml, /Claim scope evidence/);
		    assert.match(marketKitHtml, /Approved claims/);
		    assert.match(marketKitHtml, /Claims needing disclosure/);
		    assert.match(marketKitHtml, /Do not claim/);
		    assert.match(marketKitHtml, /Copy blocks/);
		    assert.match(marketKitHtml, /No email, CRM transmission, buyer-state mutation, beta-client creation, live-proof claim, or paid enrichment runs on GET/i);
		    const marketKit = await json("/api/v1/launch/market-kit", { auth: true });
		    assert.equal(marketKit.type, "deal_threads.market_launch_kit.v1");
		    assert.ok(["internal_beta_only", "launch_with_disclosures", "launch_ready"].includes(marketKit.status));
		    assert.equal(typeof marketKit.proof_scope, "string");
		    assert.equal(typeof marketKit.disclosure_required, "boolean");
		    assert.equal(marketKit.claim_scope_review?.type, "deal_threads.market_launch_kit_claim_scope_review.v1");
		    assert.ok(["internal_beta_only", "launch_with_disclosures", "market_claims_allowed"].includes(marketKit.claim_scope_review?.claim_scope));
		    assert.equal(marketKit.launch_posture.claim_scope, marketKit.claim_scope_review.claim_scope);
		    assert.equal(marketKit.claim_scope_review?.safety?.claims_market_ready_on_get, false);
		    assert.equal(marketKit.claim_scope_review?.safety?.live_proof_claimed, false);
		    assert.equal(marketKit.claim_scope_review?.safety?.requires_zero_blockers_for_market_claim, true);
		    assert.ok(marketKit.claim_scope_review?.evidence_required?.some((item) => item.key === "market_kit_claim_scope" && item.required));
		    assert.equal(marketKit.launch_posture.required_code_builds_before_first_beta, 0);
		    assert.equal(marketKit.launch_posture.paid_enrichment_lookups_needed_now, 0);
		    assert.ok(marketKit.approved_claims?.some((claim) => claim.key === "providerless_default"));
		    assert.ok(marketKit.disclosure_claims?.some((claim) => claim.key === "early_proof_scope"));
		    assert.ok(marketKit.prohibited_claims?.some((claim) => /guaranteed conversion-rate/i.test(claim)));
		    assert.ok(marketKit.copy_blocks?.some((block) => block.key === "website_hero"));
		    assert.ok(marketKit.disclosure_checklist?.some((item) => item.key === "claim_scope_lock"));
		    assert.ok(marketKit.disclosure_checklist?.some((item) => item.key === "no_guaranteed_lift"));
		    assert.equal(marketKit.safety?.mutates_buyer_state_on_get, false);
		    assert.equal(marketKit.safety?.sends_external_email_on_get, false);
		    assert.equal(marketKit.safety?.creates_beta_client_on_get, false);
		    assert.equal(marketKit.safety?.transmits_external_crm_on_get, false);
		    assert.equal(marketKit.safety?.paid_provider_lookup_by_default, false);
		    assert.equal(marketKit.safety?.live_proof_claimed, false);
		    assert.equal(marketKit.safety?.external_claims_require_review, true);
		    const marketKitMarkdown = await request("/api/v1/launch/market-kit?format=markdown", { auth: true });
		    assert.equal(marketKitMarkdown.status, 200);
		    const marketKitMarkdownText = await marketKitMarkdown.text();
		    assert.match(marketKitMarkdownText, /# Deal Threads Market Launch Kit/);
		    assert.match(marketKitMarkdownText, /## Claim Scope Review/);
		    assert.match(marketKitMarkdownText, /GET claims market ready: no/);
		    assert.match(marketKitMarkdownText, /Evidence market_kit_claim_scope: required/);
		    assert.match(marketKitMarkdownText, /## Approved Claims/);
		    assert.match(marketKitMarkdownText, /## Prohibited Claims/);
		    assert.match(marketKitMarkdownText, /External claims require review: yes/);

			    const phases = Object.fromEntries((launch.wizard?.phases || []).map((phase) => [phase.key, phase]));
	    if (launch.status === "blocked") {
	      for (const key of ["setup", "launch_packet"]) {
	        assert.equal(phases[key]?.status, "pass", `${key} phase should pass for a kicked-off client`);
	      }
	      assert.ok(["pass", "blocker"].includes(phases.verify_install?.status), "verify_install phase should either pass with client-domain proof or expose the remaining install blocker");
	      if (phases.verify_install?.status === "pass") {
	        assert.ok(
	          proofQueueItem?.proof_preflight?.checks?.some((check) => check.key === "client_domain_config_load" && check.status === "pass"),
	          "verify_install pass should be backed by client-domain config proof"
	        );
	      }
	      for (const key of ["test_lead", "crm_handoff"]) {
	        assert.ok(["blocker", "warning"].includes(phases[key]?.status), `${key} phase should expose the remaining proof gap`);
	      }
	    } else {
	      for (const key of ["setup", "launch_packet", "verify_install", "test_lead", "crm_handoff"]) {
	        assert.equal(phases[key]?.status, "pass", `${key} phase should pass`);
	      }
	    }

    const clientId = launch.selected_client.id;
	    const packet = await json(`/api/v1/beta-clients/${clientId}/launch-packet`, { auth: true });
	    assert.equal(packet.beta_client?.id, clientId);
		    assert.match(packet.install_snippet, new RegExp(`data-beta-client-id="${clientId}"`));
		    const packetWidgetMatch = packet.install_snippet.match(/data-widget-id="([^"]+)"/);
		    assert.ok(packetWidgetMatch, "Launch packet snippet should include a widget ID");
		    runtimeWidgetId = packetWidgetMatch[1];
		    assert.match(packet.public_install_url, /\/install\/inst_[a-f0-9]+$/);
		    assert.match(packet.public_test_install_url, /\/install\/inst_[a-f0-9]+\/test$/);
		    assert.match(packet.public_install_status_url, /\/install\/inst_[a-f0-9]+\/status$/);
		    assert.match(packet.public_feedback_url, /\/feedback\/inst_[a-f0-9]+$/);
		    assert.match(packet.public_crm_export_url, /\/handoff\/inst_[a-f0-9]+\/crm-export\.csv$/);
		    assert.match(packet.public_crm_export_markdown_url, /\/handoff\/inst_[a-f0-9]+\/crm-export\.md$/);
		    assert.match(packet.public_beta_proof_url, /\/handoff\/inst_[a-f0-9]+\/proof\?days=\d+$/);
		    assert.match(packet.email_body, /No paid enrichment provider calls unless manually approved later/);
		    assert.match(packet.email_body, /Client install handoff page/);
		    assert.match(packet.email_body, /Hosted widget load test/);
		    assert.match(packet.email_body, /Public install status/);
		    assert.match(packet.email_body, /Rep feedback room/);
		    assert.match(packet.email_body, /Manual CRM export CSV/);
		    assert.match(packet.email_body, /Buyer-safe beta proof report/);
		    assert.match(packet.email_body, /Domain authorization/);
		    assert.equal(packet.domain_authorization?.status, "authorized");
		    assert.equal(packet.domain_authorization?.global_allowlist_contains_client_domain, true);
		    assert.equal(packet.domain_authorization?.beta_client_match_required, true);
		    assert.ok(packet.acceptance_checks?.length >= 5);
		    assert.match(packet.test_install_url || "", /\/install\/inst_[a-f0-9]+\/test$/);
		    assert.ok(packet.internal_test_install_url?.includes(`/launch/test-install?client=${clientId}`));
		    assert.ok(packet.config_check_url?.includes(`betaClientId=${clientId}`));

	    const publicInstallPath = new URL(packet.public_install_url).pathname;
	    const publicInstall = await request(publicInstallPath);
	    assert.equal(publicInstall.status, 200);
	    const publicInstallHtml = await publicInstall.text();
	    assert.match(publicInstallHtml, /Deal Threads install handoff/);
		    assert.match(publicInstallHtml, new RegExp(`data-beta-client-id=&quot;${clientId}&quot;`));
			    assert.match(publicInstallHtml, /No paid enrichment provider calls by default/);
			    assert.match(publicInstallHtml, /Rep feedback room/);
			    assert.match(publicInstallHtml, /Manual CRM export/);
			    assert.match(publicInstallHtml, /Beta proof report/);
			    assert.match(publicInstallHtml, /Hosted widget load test/);
			    assert.match(publicInstallHtml, /Public install status/);
			    assert.match(publicInstallHtml, /Submit tested URL/);
			    assert.match(publicInstallHtml, /Source check/);
			    assert.match(publicInstallHtml, /the client's own page still needs the source check or a real config load/);
			    assert.doesNotMatch(publicInstallHtml, /\/crm\//);
			    assert.doesNotMatch(publicInstallHtml, /Operator config/);

			    const publicHostedTestPath = new URL(packet.public_test_install_url).pathname;
			    const publicHostedTest = await request(publicHostedTestPath);
			    assert.equal(publicHostedTest.status, 200);
			    const publicHostedTestHtml = await publicHostedTest.text();
			    assert.match(publicHostedTestHtml, /Deal Threads hosted widget load test/);
			    assert.match(publicHostedTestHtml, /Public install status/);
			    assert.match(publicHostedTestHtml, new RegExp(`data-beta-client-id="${clientId}"`));
			    assert.match(publicHostedTestHtml, new RegExp(`data-widget-id="${runtimeWidgetId}"`));
			    assert.doesNotMatch(publicHostedTestHtml, /\/crm\//);
			    assert.doesNotMatch(publicHostedTestHtml, /Operator config/);

			    const publicInstallStatusPath = new URL(packet.public_install_status_url).pathname;
			    const publicInstallStatus = await request(publicInstallStatusPath);
			    assert.equal(publicInstallStatus.status, 200);
			    const publicInstallStatusJson = await parseJson(publicInstallStatus);
			    assert.equal(publicInstallStatusJson.public_safety?.exposes_crm_profiles, false);
			    assert.equal(publicInstallStatusJson.public_safety?.exposes_operator_actions, false);
			    assert.equal(publicInstallStatusJson.links?.hosted_widget_load_test, packet.public_test_install_url);
			    assert.equal(publicInstallStatusJson.links?.manual_crm_export, packet.public_crm_export_url);
			    assert.equal(publicInstallStatusJson.links?.beta_proof_report, packet.public_beta_proof_url);
			    assert.ok(Number.isFinite(publicInstallStatusJson.install_activity?.config_loads));
			    assert.ok(Number.isFinite(publicInstallStatusJson.install_activity?.hosted_config_loads));
			    assert.ok(Number.isFinite(publicInstallStatusJson.install_activity?.client_page_config_loads));
			    assert.ok(publicInstallStatusJson.steps?.some((step) => step.key === "client_domain_config_load"));
			    assert.ok(Number.isFinite(publicInstallStatusJson.buyer_profiles?.count));
			    assert.equal(JSON.stringify(publicInstallStatusJson).includes("/crm/"), false);

		    const clientDetail = await json(`/api/v1/beta-clients/${clientId}`, { auth: true });
		    assert.ok(["not_checked", "passed", "failed", "blocked"].includes(clientDetail.install_handoff?.verification?.status));
		    assert.equal(clientDetail.domain_authorization?.status, "authorized");
		    assert.equal(clientDetail.domain_authorization?.beta_client_match_required, true);

		    const packetMarkdown = await request(`/api/v1/beta-clients/${clientId}/launch-packet?format=markdown`, { auth: true });
	    assert.equal(packetMarkdown.status, 200);
	    const markdown = await packetMarkdown.text();
	    assert.match(markdown, /## Install Snippet/);
	    assert.match(markdown, /## Verification Links/);
	    assert.match(markdown, /Client install handoff page/);
	    assert.match(markdown, /Rep feedback room/);
	    assert.match(markdown, /Manual CRM export CSV/);
	    assert.match(markdown, /Buyer-safe beta proof report/);
	    assert.match(markdown, /Runtime policy/);
	    assert.match(markdown, /No paid enrichment provider calls unless manually approved later/);

	    const publicFeedbackPath = new URL(packet.public_feedback_url).pathname;
	    const publicFeedback = await request(publicFeedbackPath);
	    assert.equal(publicFeedback.status, 200);
	    const publicFeedbackHtml = await publicFeedback.text();
	    assert.match(publicFeedbackHtml, /Deal Threads rep feedback room/);
	    assert.match(publicFeedbackHtml, /Score profile usefulness/);
	    assert.match(publicFeedbackHtml, /Download manual CRM CSV/);
	    assert.match(publicFeedbackHtml, /Open beta proof report/);
	    assert.doesNotMatch(publicFeedbackHtml, /\/crm\//);
	    assert.doesNotMatch(publicFeedbackHtml, /Operator config/);

	    const publicCrmExportPath = new URL(packet.public_crm_export_url).pathname;
	    const publicCrmExport = await request(publicCrmExportPath);
	    assert.equal(publicCrmExport.status, 200);
	    const publicCrmExportCsv = await publicCrmExport.text();
	    assert.match(publicCrmExportCsv, /"deal_threads_reference","created_at","contact_name"/);
	    assert.match(publicCrmExportCsv, /public_handoff_url/);
	    assert.doesNotMatch(publicCrmExportCsv, /\/crm\//);
	    assert.doesNotMatch(publicCrmExportCsv, /\/api\/v1\//);

	    const publicCrmExportMarkdownPath = new URL(packet.public_crm_export_markdown_url).pathname;
	    const publicCrmExportMarkdown = await request(publicCrmExportMarkdownPath);
	    assert.equal(publicCrmExportMarkdown.status, 200);
	    const publicCrmExportMarkdownText = await publicCrmExportMarkdown.text();
	    assert.match(publicCrmExportMarkdownText, /# Manual CRM Export/);
	    assert.match(publicCrmExportMarkdownText, /does not trigger live CRM sync/);
	    assert.doesNotMatch(publicCrmExportMarkdownText, /\/crm\//);
	    assert.doesNotMatch(publicCrmExportMarkdownText, /\/api\/v1\//);

	    const publicProofPath = new URL(packet.public_beta_proof_url).pathname + new URL(packet.public_beta_proof_url).search;
	    const publicProof = await request(publicProofPath);
	    assert.equal(publicProof.status, 200);
	    const publicProofHtml = await publicProof.text();
	    assert.match(publicProofHtml, /Buyer-safe beta proof report/);
	    assert.match(publicProofHtml, /Providerless enrichment/);
	    assert.doesNotMatch(publicProofHtml, /\/crm\//);
	    assert.doesNotMatch(publicProofHtml, /\/api\/v1\//);

	    const publicProofJson = await request(`${publicProofPath}&format=json`);
	    assert.equal(publicProofJson.status, 200);
	    const publicProofPayload = await parseJson(publicProofJson);
	    assert.equal(publicProofPayload.type, "deal_threads.public_beta_proof_report");
	    assert.equal(publicProofPayload.public_safety?.includes_lead_ids, false);
	    assert.equal(JSON.stringify(publicProofPayload).includes("/crm/"), false);
	    assert.equal(JSON.stringify(publicProofPayload).includes("/api/v1/"), false);

	    const publicHandoffMatch = publicFeedbackHtml.match(/href="(\/handoff\/inst_[a-f0-9]+\/lead_[a-f0-9-]+)"/);
	    let publicRepHandoffPacket = false;
	    if (publicHandoffMatch) {
	      const publicHandoff = await request(publicHandoffMatch[1]);
	      assert.equal(publicHandoff.status, 200);
	      const publicHandoffHtml = await publicHandoff.text();
	      assert.match(publicHandoffHtml, /Rep handoff packet/);
	      assert.match(publicHandoffHtml, /Call plan/);
	      assert.match(publicHandoffHtml, /Providerless signals/);
	      assert.doesNotMatch(publicHandoffHtml, /\/crm\//);
	      assert.doesNotMatch(publicHandoffHtml, /\/api\/v1\//);
	      assert.doesNotMatch(publicHandoffHtml, /Operator config/);

	      const publicHandoffMarkdown = await request(`${publicHandoffMatch[1]}?format=markdown`);
	      assert.equal(publicHandoffMarkdown.status, 200);
	      const publicHandoffMarkdownText = await publicHandoffMarkdown.text();
	      assert.match(publicHandoffMarkdownText, /# Public Rep Handoff Packet/);
	      assert.match(publicHandoffMarkdownText, /## Copy Blocks/);
	      assert.doesNotMatch(publicHandoffMarkdownText, /\/crm\//);
	      assert.doesNotMatch(publicHandoffMarkdownText, /\/api\/v1\//);
	      publicRepHandoffPacket = true;
	    }

    const pageUrl = encodeURIComponent(launch.selected_client.website_url || `https://${launch.selected_client.domain}`);
    const origin = new URL(launch.selected_client.website_url || `https://${launch.selected_client.domain}`).origin;
    const configRes = await request(`/api/v1/widgets/${runtimeWidgetId}/config?betaClientId=${clientId}&pageUrl=${pageUrl}`, {
      headers: { origin }
    });
    assert.equal(configRes.status, 200);
    const config = await parseJson(configRes);
    assert.equal(config.widgetId, runtimeWidgetId);
    assert.equal(config.betaClientId, clientId);
    assert.ok(config.conversation?.launcherText);

    const clientDetailAfterConfig = await json(`/api/v1/beta-clients/${clientId}`, { auth: true });
    assert.ok(
      Number(clientDetailAfterConfig.install_activity?.client_page_config_loads || 0) > 0,
      "Client-domain config proof should be captured after a config request from the selected client's origin"
    );
    assert.ok(
      Number(clientDetailAfterConfig.install_activity?.hosted_config_loads || 0) >= 0,
      "Hosted/test config load counter should be present"
    );
    assert.equal(
      clientDetailAfterConfig.readiness?.checks?.some((check) => check.key === "widget_install" && check.status === "pass"),
      true,
      "Widget install readiness should pass only after client-domain config proof"
    );

    return {
      status: launch.status,
		      beta_client_id: clientId,
		      beta_client_name: launch.selected_client.name,
			      public_install_handoff: true,
			      hosted_widget_load_test: true,
			      public_install_status: true,
			      public_rep_handoff_packet: publicRepHandoffPacket,
			      manual_crm_export: true,
			      public_beta_proof_report: true,
			      install_source_check: clientDetail.install_handoff?.verification?.status,
		      wizard_completion: launch.wizard.completion,
      packet_acceptance_checks: packet.acceptance_checks.length,
      launcher_text: config.conversation.launcherText,
      client_page_config_loads: clientDetailAfterConfig.install_activity.client_page_config_loads,
      hosted_config_loads: clientDetailAfterConfig.install_activity.hosted_config_loads
    };
  });

  await check("widget origin allowlist accepts production origin", async () => {
    const pageUrl = encodeURIComponent(`${baseUrl}/`);
    const res = await request(`/api/v1/widgets/${runtimeWidgetId}/config?pageUrl=${pageUrl}`, {
      headers: { origin: baseUrl }
    });
    assert.equal(res.status, 200);
    const config = await parseJson(res);
    runtimeWidgetId = config.widgetId || runtimeWidgetId;
    assert.equal(config.widgetId, runtimeWidgetId);
    assert.ok(config.conversation?.launcherText);
    return {
      widget_id: config.widgetId,
      version: config.version,
      launcher_text: config.conversation.launcherText
    };
  });

  await check("widget origin allowlist blocks unapproved origin", async () => {
    const res = await request("/api/v1/widget-sessions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://evil.test"
      },
      body: {
        tenantId: "ten_deal_threads_demo",
        widgetId: runtimeWidgetId,
        pageUrl: `${baseUrl}/`
      }
    });
    assert.equal(res.status, 403);
    const payload = await parseJson(res);
    assert.equal(payload.error, "origin_not_allowed");
    return { status: res.status, error: payload.error };
  });

  await check("invalid widget JSON returns client error", async () => {
    const res = await request("/api/v1/widget-sessions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: baseUrl
      },
      rawBody: "{"
    });
    assert.equal(res.status, 400);
    const payload = await parseJson(res);
    assert.equal(payload.error, "invalid_json");
    return { status: res.status, error: payload.error };
  });

  await check("fallback form requires consent", async () => {
    const res = await request("/api/v1/fallback-submissions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: baseUrl
      },
      body: {
        name: "Consent Gate Test",
        email: "consent-gate@example.test",
        company: "Consent Gate",
        message: "Testing fallback consent gate before launch.",
        pageUrl: `${baseUrl}/`
      }
    });
    assert.equal(res.status, 400);
    const payload = await parseJson(res);
    assert.equal(payload.error, "consent_required");
    return { status: res.status, error: payload.error };
  });

  const failed = checks.filter((item) => item.status !== "pass");
  const summary = {
    generated_at: new Date().toISOString(),
    base_url: baseUrl,
    expected_store_mode: expectedStoreMode,
    status: failed.length ? "failed" : "passed",
    pass: checks.length - failed.length,
    fail: failed.length,
    checks
  };

  const jsonPath = path.join(artifactsDir, "launch-readiness-summary.json");
  const markdownPath = path.join(artifactsDir, "launch-readiness-summary.md");
  await writeFile(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(markdownPath, launchMarkdown(summary));

  if (failed.length) {
    console.error(`Launch readiness failed: ${failed.length}/${checks.length} checks failed.`);
    for (const item of failed) console.error(`- ${item.name}: ${item.error}`);
    console.error(`Artifacts: ${jsonPath}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Launch readiness passed: ${summary.pass}/${checks.length} checks.`);
  console.log(`Artifacts written to ${artifactsDir}`);
  console.log(`- ${jsonPath}`);
  console.log(`- ${markdownPath}`);

  if (healthRes.result?.hardening) {
    console.log(`Hardening: ${healthRes.result.hardening.status} (${healthRes.result.hardening.score}/100)`);
  }
}

async function check(name, fn) {
  const started = Date.now();
  try {
    const result = await fn();
    const record = {
      name,
      status: "pass",
      duration_ms: Date.now() - started,
      result
    };
    checks.push(record);
    return record;
  } catch (error) {
    const record = {
      name,
      status: "fail",
      duration_ms: Date.now() - started,
      error: error.message
    };
    checks.push(record);
    return record;
  }
}

async function json(pathname, options = {}) {
  const res = await request(pathname, options);
  assert.equal(res.status, 200);
  return parseJson(res);
}

async function request(pathname, options = {}) {
  const url = new URL(pathname, baseUrl);
  const headers = { ...(options.headers || {}) };
  if (options.auth) headers.authorization = authHeader;
  let body = options.rawBody;
  if (options.body !== undefined) {
    headers["content-type"] ||= "application/json";
    body = JSON.stringify(options.body);
  }
  return fetch(url, {
    method: options.method || "GET",
    headers,
    body
  });
}

async function parseJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON from ${res.url}, got: ${text.slice(0, 200)}`);
  }
}

function assertHeader(headers, key, expected) {
  assert.equal(headers.get(key), expected, `${key} should be ${expected}`);
}

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

function launchMarkdown(summary) {
  const lines = [
    "# Deal Threads Launch Readiness",
    "",
    `Generated: ${summary.generated_at}`,
    `Base URL: ${summary.base_url}`,
    `Status: ${summary.status}`,
    `Checks: ${summary.pass} pass, ${summary.fail} fail`,
    "",
    "## Checks",
    "",
    ...summary.checks.map((item) => {
      const suffix = item.error ? ` - ${item.error}` : "";
      return `- [${item.status}] ${item.name}${suffix}`;
    }),
    ""
  ];
  return `${lines.join("\n")}\n`;
}

await main();
