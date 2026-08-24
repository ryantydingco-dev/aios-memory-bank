import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  normalizeIntegrationEvent,
  verifyIntegrationWebhook
} from "../src/integration-events.js";

test("verifies SmartLead HMAC signatures without accepting altered bodies", () => {
  const rawBody = JSON.stringify({ event_type: "EMAIL_REPLY", to_email: "buyer@example.com" });
  const secret = "test-secret";
  const signature = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;

  assert.equal(verifyIntegrationWebhook("smartlead", {
    headers: { "x-smartlead-signature": signature },
    rawBody,
    secret
  }).ok, true);
  assert.equal(verifyIntegrationWebhook("smartlead", {
    headers: { "x-smartlead-signature": signature },
    rawBody: `${rawBody} `,
    secret
  }).ok, false);
  assert.equal(verifyIntegrationWebhook("smartlead", {
    rawBody,
    secret,
    querySecret: secret
  }).method, "signed_receiver_url");
});

test("verifies Cal.com HMAC signatures", () => {
  const rawBody = JSON.stringify({ triggerEvent: "BOOKING_CREATED", payload: { uid: "booking-1" } });
  const secret = "cal-secret";
  const signature = createHmac("sha256", secret).update(rawBody).digest("hex");
  assert.equal(verifyIntegrationWebhook("calcom", {
    headers: { "x-cal-signature-256": signature },
    rawBody,
    secret
  }).ok, true);
});

test("normalizes SmartLead replies and unsubscribe events", () => {
  const reply = normalizeIntegrationEvent("smartlead", {
    event_type: "EMAIL_REPLY",
    to_email: "Buyer@Example.com",
    to_name: "Buyer Name",
    preview_text: "Yes, let's schedule a call",
    campaign_name: "Founder Pipeline",
    time_replied: "2026-07-26T12:00:00Z"
  }, { requestId: "req-1" });
  assert.equal(reply.event_id, "smartlead:req-1");
  assert.equal(reply.contact.email, "buyer@example.com");
  assert.equal(reply.actions[0].kind, "reply");
  assert.match(reply.actions[0].text, /schedule/);

  const unsubscribe = normalizeIntegrationEvent("smartlead", {
    event_type: "LEAD_UNSUBSCRIBED",
    lead_email: "buyer@example.com"
  }, { requestId: "req-2" });
  assert.equal(unsubscribe.actions[0].text, "unsubscribe");
});

test("normalizes Salesfinity meeting dispositions and Sendr intent", () => {
  const call = normalizeIntegrationEvent("salesfinity", {
    event: "CALL_LOGGED",
    id: "call-1",
    data: {
      email: "buyer@example.com",
      contact_name: "Buyer",
      company_name: "Example",
      company_domain: "example.com",
      disposition: { name: "Answered - Meeting Set" },
      meeting_at: "2026-07-28T15:00:00Z",
      notes: "Needs more qualified demos"
    }
  });
  assert.equal(call.actions[0].kind, "meeting");
  assert.equal(call.actions[0].need, "Needs more qualified demos");

  const view = normalizeIntegrationEvent("sendr", {
    eventType: "engagement:button_click",
    event_id: "view-1",
    pageUrl: "https://sendr.io/p/example",
    attributes: {
      email: "buyer@example.com",
      company_name: "Example"
    }
  });
  assert.equal(view.actions[0].kind, "signal");
  assert.equal(view.actions[0].signal_type, "inbound");
});

test("normalizes Cal.com booking payloads", () => {
  const booking = normalizeIntegrationEvent("calcom", {
    triggerEvent: "BOOKING_CREATED",
    createdAt: "2026-07-26T12:00:00Z",
    payload: {
      uid: "booking-1",
      title: "Strategy Session",
      startTime: "2026-07-29T14:00:00Z",
      attendees: [{ name: "Buyer", email: "buyer@example.com" }],
      bookingFieldsResponses: {
        company: "Example Inc",
        need: "Build a predictable meeting engine",
        role: "Founder"
      }
    }
  });
  assert.equal(booking.actions[0].kind, "meeting");
  assert.equal(booking.actions[0].meeting_id, "booking-1");
  assert.equal(booking.actions[0].need, "Build a predictable meeting engine");
  assert.equal(booking.account.name, "Example Inc");
});
