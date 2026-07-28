import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const PROVIDERS = new Set(["smartlead", "salesfinity", "sendr", "calcom"]);

export function integrationStatus(env = process.env) {
  return {
    smartlead: providerStatus("smartlead", env.SMARTLEAD_WEBHOOK_SECRET, {
      api_key_configured: Boolean(env.SMARTLEAD_API_KEY),
      authentication: "HMAC SHA-256 (X-Smartlead-Signature)"
    }),
    salesfinity: providerStatus("salesfinity", env.SALESFINITY_WEBHOOK_SECRET, {
      api_key_configured: Boolean(env.SALESFINITY_API_KEY),
      authentication: "shared webhook secret"
    }),
    sendr: providerStatus("sendr", env.SENDR_WEBHOOK_SECRET, {
      api_key_configured: Boolean(env.SENDR_API_KEY || env.SENDER_AI_API_KEY),
      authentication: "shared webhook secret"
    }),
    calcom: providerStatus("calcom", env.CALCOM_WEBHOOK_SECRET, {
      api_key_configured: Boolean(env.CALCOM_API_KEY || env.CAL_API_KEY),
      authentication: "HMAC SHA-256 (X-Cal-Signature-256)"
    })
  };
}

export function verifyIntegrationWebhook(provider, { headers = {}, rawBody = "", secret = "", querySecret = "" } = {}) {
  if (!PROVIDERS.has(provider)) return failure(404, "unknown_integration");
  if (!secret) return failure(503, `${provider}_webhook_secret_not_configured`);

  if (provider === "smartlead" || provider === "calcom") {
    const supplied = header(headers, provider === "smartlead" ? "x-smartlead-signature" : "x-cal-signature-256");
    const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
    const expected = provider === "smartlead" ? `sha256=${digest}` : digest;
    const hmacValid = constantTimeEqual(expected, supplied);
    const signedUrlValid = provider === "smartlead" && constantTimeEqual(secret, clean(querySecret));
    return hmacValid || signedUrlValid
      ? { ok: true, method: hmacValid ? "hmac_sha256" : "signed_receiver_url" }
      : failure(401, "invalid_webhook_signature");
  }

  const supplied =
    bearerToken(header(headers, "authorization"))
    || header(headers, "x-webhook-secret")
    || header(headers, `x-${provider}-webhook-secret`)
    || clean(querySecret);
  return constantTimeEqual(secret, supplied)
    ? { ok: true, method: "shared_secret" }
    : failure(401, "invalid_webhook_secret");
}

export function normalizeIntegrationEvent(provider, payload = {}, context = {}) {
  if (!PROVIDERS.has(provider)) throw invalidEvent("unsupported provider");
  const eventId = clean(
    context.requestId
    || payload.event_id
    || payload.eventId
    || payload.id
    || payload._id
    || payload.uid
    || payload.bookingId
    || payload.payload?.uid
  ) || hashEvent(provider, payload);

  if (provider === "smartlead") return normalizeSmartLead(payload, eventId);
  if (provider === "salesfinity") return normalizeSalesfinity(payload, eventId);
  if (provider === "sendr") return normalizeSendr(payload, eventId);
  return normalizeCalCom(payload, eventId);
}

function normalizeSmartLead(payload, eventId) {
  const type = upper(payload.event_type || payload.eventType || payload.type);
  const lead = payload.lead_data || payload.lead || {};
  const contact = {
    email: email(payload.to_email || payload.lead_email || payload.to || lead.email),
    name: clean(payload.to_name || payload.lead_name || lead.name || [lead.first_name, lead.last_name].filter(Boolean).join(" ")),
    linkedin_url: clean(lead.linkedin_profile || lead.linkedin_url)
  };
  const account = accountFields(
    lead.company_name || payload.company_name || payload.campaign_name,
    lead.company_url || lead.website || payload.company_url
  );
  const occurredAt =
    payload.time_replied
    || payload.time_opened
    || payload.time_clicked
    || payload.time_sent
    || payload.created_at
    || payload.createdAt;

  if (["EMAIL_REPLY", "UNTRACKED_REPLIES", "LEAD_CATEGORY_UPDATED"].includes(type)) {
    const reply = clean(
      payload.preview_text
      || payload.reply_body
      || payload.lastReply?.email_body
      || [...array(payload.history)].reverse().find((item) => upper(item.type) === "REPLY")?.email_body
    );
    const category = clean(payload.category || lead.category?.name);
    if (!reply && !category) return ignored(providerEvent("smartlead", eventId, type), "reply_body_missing");
    return event("smartlead", eventId, type, contact, account, [{
      kind: "reply",
      event_id: eventId,
      text: stripHtml(reply || categoryToReply(category)),
      channel: "email",
      received_at: occurredAt
    }]);
  }

  if (type === "LEAD_UNSUBSCRIBED") {
    return event("smartlead", eventId, type, contact, account, [{
      kind: "reply",
      event_id: eventId,
      text: "unsubscribe",
      channel: "email",
      received_at: occurredAt
    }]);
  }

  if (["EMAIL_OPEN", "EMAIL_LINK_CLICK"].includes(type)) {
    return event("smartlead", eventId, type, contact, account, [{
      kind: "signal",
      event_id: eventId,
      signal_type: "engagement",
      source: "smartlead",
      summary: type === "EMAIL_LINK_CLICK"
        ? `Clicked campaign link${payload.campaign_name ? ` in ${payload.campaign_name}` : ""}`
        : `Opened campaign email${payload.campaign_name ? ` in ${payload.campaign_name}` : ""}`,
      strength: type === "EMAIL_LINK_CLICK" ? 0.85 : 0.55,
      occurred_at: occurredAt,
      source_url: array(payload.link_clicked)[0]
    }]);
  }

  return ignored(providerEvent("smartlead", eventId, type), "event_not_revenue_relevant");
}

function normalizeSalesfinity(payload, eventId) {
  const type = upper(payload.event || payload.event_type || payload.eventType || payload.type || "CALL_LOGGED");
  const data = payload.data || payload.payload || payload;
  const contactData = data.contact || data.person || {};
  const disposition = clean(
    data.disposition?.name
    || data.disposition_name
    || data.call_classification
    || data.classification
    || data.outcome
  );
  const contact = {
    email: email(data.email || contactData.email),
    name: clean(data.contact_name || data.name || contactData.name || [contactData.first_name, contactData.last_name].filter(Boolean).join(" ")),
    linkedin_url: clean(data.linkedin_url || contactData.linkedin_url || contactData.linkedin)
  };
  const company = data.company || contactData.company || {};
  const account = accountFields(
    data.company_name || company.name || "Salesfinity prospect",
    data.company_domain || company.domain || company.website
  );
  const occurredAt = data.occurred_at || data.created_at || data.createdAt || payload.createdAt;
  const notes = clean(data.notes || data.note || data.call_notes || data.summary);
  const meetingSet = /meeting\s*(?:set|booked|scheduled)|appointment\s*(?:set|booked)|demo\s*(?:set|booked)/i.test(disposition || "");
  const optOut = /do not call|do not contact|opt.?out|wrong number/i.test(disposition || "");
  const callback = /callback|call back|follow.?up|interested|connected/i.test(disposition || "");

  if (meetingSet) {
    return event("salesfinity", eventId, type, contact, account, [{
      kind: "meeting",
      event_id: eventId,
      meeting_id: clean(data.call_id || data.id || eventId),
      starts_at: data.meeting_at || data.scheduled_at || data.callback_at,
      booking_url: data.booking_url || data.meeting_url,
      need: notes || disposition,
      timeline: data.timeline || (data.meeting_at ? "Meeting scheduled" : null),
      authority: data.authority || contactData.title,
      attendees: [contact.name].filter(Boolean)
    }]);
  }

  if (optOut) {
    return event("salesfinity", eventId, type, contact, account, [{
      kind: "reply",
      event_id: eventId,
      text: "do not contact",
      channel: "phone",
      received_at: occurredAt
    }]);
  }

  if (callback || type === "CALL_LOGGED") {
    return event("salesfinity", eventId, type, contact, account, [{
      kind: "signal",
      event_id: eventId,
      signal_type: callback ? "inbound" : "engagement",
      source: "salesfinity",
      summary: [disposition || "Call logged", notes].filter(Boolean).join(": "),
      strength: callback ? 0.9 : 0.5,
      occurred_at: occurredAt
    }]);
  }

  return ignored(providerEvent("salesfinity", eventId, type), "event_not_revenue_relevant");
}

function normalizeSendr(payload, eventId) {
  const type = upper(payload.event || payload.event_type || payload.eventType || payload.type);
  const data = payload.data || payload.payload || payload;
  const lead = data.lead || data.contact || data.recipient || {};
  const attributes = data.attributes || {};
  const contact = {
    email: email(data.email || data.recipient_email || lead.email || attributes.email || attributes.contact_email),
    name: clean(data.name || data.recipient_name || lead.name || attributes.name || attributes.contact_name),
    linkedin_url: clean(data.linkedin_url || lead.linkedin_url || attributes.linkedin_url)
  };
  const account = accountFields(
    data.company_name || lead.company || data.page_name || attributes.company_name || attributes.company || "Sendr prospect",
    data.company_domain || lead.domain || data.website || attributes.company_domain || attributes.website
  );
  const occurredAt = data.occurred_at || data.viewed_at || data.clicked_at || data.completed_at || data.created_at;
  const isView = /VIEW|OPEN|WATCH|PLAY|CLICK|COMPLETE/.test(type);
  if (!isView) return ignored(providerEvent("sendr", eventId, type), "event_not_revenue_relevant");
  const hot = /COMPLETE|CTA|BOOK|CLICK/.test(type);
  return event("sendr", eventId, type, contact, account, [{
    kind: "signal",
    event_id: eventId,
    signal_type: hot ? "inbound" : "engagement",
    source: "sendr",
    summary: clean(data.summary) || `Sendr proof asset ${type.toLowerCase().replaceAll("_", " ")}`,
    strength: hot ? 0.95 : 0.72,
    occurred_at: occurredAt,
    source_url: data.page_url || data.pageUrl || data.url || data.asset_url
  }]);
}

function normalizeCalCom(payload, eventId) {
  const type = upper(payload.triggerEvent || payload.trigger_event || payload.event || payload.type);
  const data = payload.payload || payload.data || payload;
  const attendee = array(data.attendees)[0] || data.attendee || {};
  const contact = {
    email: email(attendee.email || data.email),
    name: clean(attendee.name || data.name),
    linkedin_url: null
  };
  const account = accountFields(
    fieldResponse(data, ["company", "company_name"]) || domainFromEmail(contact.email) || "Cal.com booking",
    fieldResponse(data, ["website", "company_website"]) || domainFromEmail(contact.email)
  );
  const occurredAt = payload.createdAt || data.createdAt || data.startTime || data.start;
  if (["BOOKING_CREATED", "BOOKING_RESCHEDULED"].includes(type)) {
    return event("calcom", eventId, type, contact, account, [{
      kind: "meeting",
      event_id: eventId,
      meeting_id: clean(data.uid || data.id || data.bookingId || eventId),
      starts_at: data.startTime || data.start,
      booking_url: data.videoCallUrl || data.meetingUrl || data.location,
      need: clean(data.additionalNotes || data.description || fieldResponse(data, ["need", "business_need", "what_would_you_like_to_discuss"])),
      authority: clean(fieldResponse(data, ["authority", "role", "job_title"])),
      timeline: "Meeting scheduled",
      budget: clean(fieldResponse(data, ["budget", "budget_status"])),
      attendees: array(data.attendees).map((item) => clean(item.name || item.email)).filter(Boolean)
    }]);
  }
  if (type === "BOOKING_CANCELLED") {
    return event("calcom", eventId, type, contact, account, [{
      kind: "signal",
      event_id: eventId,
      signal_type: "other",
      source: "calcom",
      summary: `Meeting cancelled${data.cancellationReason ? `: ${data.cancellationReason}` : ""}`,
      strength: 0.9,
      occurred_at: occurredAt
    }]);
  }
  return ignored(providerEvent("calcom", eventId, type), "event_not_revenue_relevant");
}

function event(provider, eventId, type, contact, account, actions) {
  return {
    provider,
    event_id: `${provider}:${eventId}`,
    provider_event_type: type || "UNKNOWN",
    contact,
    account,
    actions: actions.map((action, index) => ({
      ...action,
      event_id: `${provider}:${action.event_id || eventId}${index ? `:${index + 1}` : ""}`
    })),
    ignored: false
  };
}

function ignored(base, reason) {
  return { ...base, actions: [], ignored: true, reason };
}

function providerEvent(provider, eventId, type) {
  return { provider, event_id: `${provider}:${eventId}`, provider_event_type: type || "UNKNOWN" };
}

function providerStatus(provider, secret, extra) {
  return {
    provider,
    webhook_path: `/webhooks/v1/${provider}`,
    webhook_secret_configured: Boolean(secret),
    ingest_ready: Boolean(secret),
    ...extra
  };
}

function accountFields(name, website) {
  return {
    name: clean(name) || domain(website) || null,
    domain: domain(website)
  };
}

function fieldResponse(data, names) {
  const fields = data.responses || data.bookingFieldsResponses || data.metadata || {};
  for (const name of names) {
    const direct = fields[name];
    if (direct !== undefined) return typeof direct === "object" ? direct.value : direct;
    const match = array(fields).find((field) => names.includes(field.identifier || field.name || field.label));
    if (match) return match.value || match.response;
  }
  return null;
}

function categoryToReply(category) {
  if (/interested|positive|meeting/i.test(category || "")) return "Interested, let's schedule a meeting";
  if (/not interested|negative/i.test(category || "")) return "Not interested";
  if (/unsubscribe|do not contact/i.test(category || "")) return "unsubscribe";
  return category || "Reply received";
}

function stripHtml(value) {
  return clean(String(value || "").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " "));
}

function hashEvent(provider, payload) {
  return createHash("sha256").update(`${provider}:${stableJson(payload)}`).digest("hex").slice(0, 32);
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function constantTimeEqual(expected, supplied) {
  if (!expected || !supplied) return false;
  const left = Buffer.from(String(expected));
  const right = Buffer.from(String(supplied));
  return left.length === right.length && timingSafeEqual(left, right);
}

function header(headers, key) {
  const value = headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];
  return Array.isArray(value) ? value[0] : clean(value);
}

function bearerToken(value) {
  const match = String(value || "").match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function domain(value) {
  const raw = clean(value);
  if (!raw) return null;
  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function domainFromEmail(value) {
  return email(value)?.split("@")[1] || null;
}

function email(value) {
  const result = clean(value)?.toLowerCase();
  return result && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result) ? result : null;
}

function upper(value) {
  return clean(value)?.toUpperCase().replace(/[\s-]+/g, "_") || "";
}

function clean(value) {
  if (value === null || value === undefined) return null;
  const result = String(value).trim();
  return result || null;
}

function array(value) {
  return Array.isArray(value) ? value : [];
}

function failure(status, error) {
  return { ok: false, status, error };
}

function invalidEvent(message) {
  const error = new Error(message);
  error.status = 400;
  error.code = "invalid_integration_event";
  return error;
}
