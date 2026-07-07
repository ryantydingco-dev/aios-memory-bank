import assert from "node:assert/strict";
import test from "node:test";

import { enrichCompanyInternally } from "../src/internal-enrichment.js";

test("internal enrichment extracts providerless public-site buyer evidence", async () => {
  const originalFetch = globalThis.fetch;
  const pages = new Map([
    [
      "https://launchstack.test/",
      `<!doctype html>
      <html>
        <head>
          <title>LaunchStack - B2B revenue platform</title>
          <meta name="description" content="LaunchStack helps mid-market B2B revenue teams route demo requests faster from HubSpot and Salesforce.">
          <script src="https://js.hs-scripts.com/12345.js"></script>
          <script src="https://js.hsforms.net/forms/embed/v2.js"></script>
        </head>
        <body>
          <a href="https://calendly.com/launchstack/demo">Book a demo</a>
          <a href="/careers">Careers</a>
          <a href="/team">Team</a>
          <a href="/security">Security</a>
          <form action="/demo-request">
            <input name="email" placeholder="Work email">
            <input name="company" placeholder="Company">
            <textarea name="message">Tell us about your demo request</textarea>
            <button>Request demo</button>
          </form>
          We are a 160 employee SaaS company. We recently raised $18M in Series B funding from growth investors.
        </body>
      </html>`
    ],
    [
      "https://launchstack.test/security",
      `<!doctype html><title>Security</title><body>SOC 2, SSO, and GDPR controls for enterprise customers.</body>`
    ],
    [
      "https://launchstack.test/careers",
      `<!doctype html><title>Careers</title><body>Join our team. 8 open roles across sales operations and engineering.</body>`
    ],
    [
      "https://launchstack.test/team",
      `<!doctype html><title>Leadership team</title><body>Mira Stone, VP Revenue Operations, owns revenue operations and CRM handoff quality. Contact mira@launchstack.test for routing ownership.</body>`
    ]
  ]);

  globalThis.fetch = async (url) => {
    const normalized = String(url).endsWith("/") ? String(url) : `${url}/`;
    const html = pages.get(String(url)) || pages.get(normalized);
    assert.ok(html, `unexpected fetch: ${url}`);
    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html",
        "x-powered-by": "Next.js"
      }
    });
  };

  try {
    const enrichment = await enrichCompanyInternally({
      company: {
        name: "LaunchStack",
        domain: "launchstack.test",
        website: "https://launchstack.test",
        size_hint: null,
        industry_hint: null
      },
      qualification: {
        business_need: "Demo requests are going cold while reps research manually.",
        pain_point: "Slow lead response",
        product_interest: "AI lead enrichment",
        integration_need: "HubSpot routing",
        crm: "hubspot",
        sales_stack: [],
        timeline: "this_quarter",
        budget_status: "likely",
        budget_range: "30k_60k"
      },
      visitor: {
        authority_signal: "decision_owner"
      }
    });

    assert.equal(enrichment.status, "completed");
    assert.equal(enrichment.provider, "internal_website_enrichment");
    assert.equal(enrichment.cost.paid_provider_used, false);
    assert.equal(enrichment.cost.estimated_usd, 0);
    assert.equal(enrichment.company_size.value, "160 employees");
    assert.equal(enrichment.company_size.source, "internal_website_enrichment");
    assert.ok(enrichment.tech_stack.some((item) => item.value === "HubSpot"));
    assert.ok(enrichment.tech_stack.some((item) => item.value === "Next.js"));
    assert.ok(enrichment.funding_events.some((event) => event.round === "Series B" && event.amount === "$18M"));
    assert.equal(enrichment.conversion_surface.status, "detected");
    assert.equal(enrichment.conversion_surface.primary_surface, "marketing_automation_form");
    assert.ok(enrichment.conversion_surface.tools.some((item) => item.value === "HubSpot Forms"));
    assert.ok(enrichment.conversion_surface.ctas.some((item) => item.value === "Book a demo"));
    assert.match(enrichment.conversion_surface.replacement_angle, /AI chat widget/i);
    assert.ok(enrichment.signals.some((item) => item.value === "Active hiring: 8 open roles" && item.category === "growth"));
    assert.ok(enrichment.signals.some((item) => item.category === "conversion_surface"));
    const sourcedRevOps = enrichment.decision_makers.find((item) => item.source === "public_site_signal" && item.role === "RevOps leader");
    assert.ok(sourcedRevOps);
    assert.equal(sourcedRevOps.name, "Mira Stone");
    assert.equal(sourcedRevOps.email, "mira@launchstack.test");
    assert.match(sourcedRevOps.title, /Revenue Operations/i);
    assert.ok(enrichment.buyer_profile.icp_fit.score >= 75);
    assert.ok(enrichment.research_evidence.some((item) => item.category === "company_size" && item.value === "160 employees"));
    assert.ok(enrichment.research_evidence.some((item) => item.category === "conversion_surface" && item.value === "Marketing automation form"));
    assert.ok(enrichment.research_evidence.some((item) => item.category === "buying_committee" && item.value.includes("Mira Stone") && item.note.includes("mira@launchstack.test")));
    assert.ok(enrichment.research_evidence.some((item) => item.category === "funding" && item.value.includes("Series B")));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("internal enrichment blocks private network fetch targets", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("fetch should not be called for a blocked private target");
  };

  try {
    const enrichment = await enrichCompanyInternally({
      company: {
        name: "Private Target",
        domain: "127.0.0.1",
        website: "http://127.0.0.1/admin",
        size_hint: null,
        industry_hint: null
      },
      qualification: {
        business_need: "Need a safer providerless enrichment preflight.",
        pain_point: "Security review",
        product_interest: "AI lead enrichment",
        integration_need: "HubSpot routing",
        crm: "hubspot",
        sales_stack: [],
        timeline: "this_quarter",
        budget_status: "building_case",
        budget_range: "30k_60k"
      },
      visitor: {
        authority_signal: "influencer"
      }
    });

    assert.equal(fetchCalled, false);
    assert.equal(enrichment.status, "fallback");
    assert.equal(enrichment.provider, "internal_website_enrichment");
    assert.equal(enrichment.cost.paid_provider_used, false);
    assert.match(enrichment.notes.join(" "), /blocked/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
