import assert from "node:assert/strict";
import test from "node:test";
import { checkHubSpotProperties } from "../src/hubspot.js";

test("HubSpot property readiness skips deal properties when deal scopes are missing", async () => {
  const originalToken = process.env.HUBSPOT_TOKEN;
  const originalFetch = globalThis.fetch;
  process.env.HUBSPOT_TOKEN = "pat-na1-test-token";

  try {
    globalThis.fetch = async (url, options = {}) => {
      const pathname = new URL(String(url)).pathname;
      if (!String(options.headers?.authorization || "").includes("pat-na1-test-token")) {
        return jsonResponse(401, { message: "missing auth" });
      }
      if (pathname.includes("/crm/v3/properties/deals/")) {
        return jsonResponse(403, {
          category: "MISSING_SCOPES",
          message: "requires one of [deals-read]"
        });
      }
      if (options.method === "POST") {
        return jsonResponse(201, {
          type: "string",
          fieldType: "text"
        });
      }
      return jsonResponse(404, {
        category: "OBJECT_NOT_FOUND",
        message: "No property exists."
      });
    };

    const check = await checkHubSpotProperties({ createMissing: false });
    assert.equal(check.mode, "live");
    assert.equal(check.summary.required, 26);
    assert.equal(check.summary.missing, 22);
    assert.equal(check.summary.inaccessible, 4);
    assert.equal(check.summary.failed, 0);
    assert.equal(check.summary.by_object_type.deals.inaccessible, 4);
    assert.equal(check.properties.filter((property) => property.status === "scope_missing").length, 4);
    assert.equal(check.properties.find((property) => property.objectType === "deals").action, "skipped_requires_scope");

    const setup = await checkHubSpotProperties({ createMissing: true });
    assert.equal(setup.summary.created, 22);
    assert.equal(setup.summary.inaccessible, 4);
    assert.equal(setup.summary.failed, 0);
    assert.equal(setup.summary.by_object_type.contacts.created, 15);
    assert.equal(setup.summary.by_object_type.companies.created, 7);
    assert.equal(setup.summary.by_object_type.deals.inaccessible, 4);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.HUBSPOT_TOKEN;
    else process.env.HUBSPOT_TOKEN = originalToken;
  }
});

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(body);
    }
  };
}
