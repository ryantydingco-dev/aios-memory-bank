const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const leadExtractionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["visitor", "company", "qualification", "routing", "meta"],
  properties: {
    visitor: {
      type: "object",
      additionalProperties: false,
      required: ["name", "email", "phone", "role", "seniority", "authority_signal"],
      properties: {
        name: { type: ["string", "null"] },
        email: { type: ["string", "null"] },
        phone: { type: ["string", "null"] },
        role: { type: ["string", "null"] },
        seniority: { type: "string", enum: ["executive", "vp", "director", "manager", "individual_contributor", "founder", "consultant", "unknown"] },
        authority_signal: { type: "string", enum: ["decision_owner", "influencer", "researcher", "consultant", "unknown"] }
      }
    },
    company: {
      type: "object",
      additionalProperties: false,
      required: ["name", "domain", "website", "industry_hint", "size_hint"],
      properties: {
        name: { type: ["string", "null"] },
        domain: { type: ["string", "null"] },
        website: { type: ["string", "null"] },
        industry_hint: { type: ["string", "null"] },
        size_hint: { type: ["string", "null"] }
      }
    },
    qualification: {
      type: "object",
      additionalProperties: false,
      required: [
        "business_need",
        "pain_point",
        "product_interest",
        "timeline",
        "budget_status",
        "budget_range",
        "buying_stage",
        "crm",
        "sales_stack",
        "integration_need"
      ],
      properties: {
        business_need: { type: ["string", "null"] },
        pain_point: { type: ["string", "null"] },
        product_interest: { type: ["string", "null"] },
        timeline: { type: "string", enum: ["this_week", "this_month", "this_quarter", "later_this_year", "researching", "unknown"] },
        budget_status: { type: "string", enum: ["approved", "likely", "building_case", "none", "unknown"] },
        budget_range: { type: "string", enum: ["under_10k", "10k_30k", "30k_60k", "60k_plus", "unknown"] },
        buying_stage: { type: "string", enum: ["active_project", "vendor_evaluation", "education", "support", "partner", "unknown"] },
        crm: { type: "string", enum: ["hubspot", "salesforce", "pipedrive", "other", "unknown"] },
        sales_stack: { type: "array", items: { type: "string" } },
        integration_need: { type: ["string", "null"] }
      }
    },
    routing: {
      type: "object",
      additionalProperties: false,
      required: ["priority_hint", "route_type", "recommended_next_action"],
      properties: {
        priority_hint: { type: "string", enum: ["high", "medium", "low", "manual_review"] },
        route_type: { type: "string", enum: ["sales", "support", "customer_success", "partnerships", "nurture", "manual_review"] },
        recommended_next_action: { type: "string" }
      }
    },
    meta: {
      type: "object",
      additionalProperties: false,
      required: ["confidence", "missing_required_fields", "needs_human_review", "reasoning_summary"],
      properties: {
        confidence: { type: "number" },
        missing_required_fields: { type: "array", items: { type: "string" } },
        needs_human_review: { type: "boolean" },
        reasoning_summary: { type: ["string", "null"] }
      }
    }
  }
};

export function llmExtractionMode() {
  return process.env.OPENAI_API_KEY ? "openai" : "heuristic";
}

export function llmExtractionSettings() {
  const apiKeyConfigured = Boolean(process.env.OPENAI_API_KEY);
  return {
    mode: llmExtractionMode(),
    api_key_configured: apiKeyConfigured,
    live_request_available: apiKeyConfigured,
    base_url: OPENAI_BASE_URL,
    model: OPENAI_MODEL,
    fallback_mode: "heuristic"
  };
}

export async function extractLeadFieldsWithLlm({ currentProfile, messages, latestMessage }) {
  if (!process.env.OPENAI_API_KEY) return null;

  const response = await fetch(`${OPENAI_BASE_URL}/v1/responses`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "Extract B2B lead qualification fields from a Deal Threads sales-intake chat. Return only facts supported by the conversation. Use null or unknown when unsure. Do not invent enrichment facts."
        },
        {
          role: "user",
          content: JSON.stringify({
            currentProfile,
            latestMessage,
            transcript: messages.map((message) => ({
              sender: message.sender,
              body: message.body
            }))
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "deal_threads_lead_extraction",
          strict: true,
          schema: leadExtractionSchema
        }
      }
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || payload.message || `OpenAI extraction failed with ${response.status}`);
  }

  const outputText = payload.output_text || payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
  if (!outputText) throw new Error("OpenAI extraction returned no output_text");
  return JSON.parse(outputText);
}

export function mergeExtractedProfile(target, extracted) {
  if (!extracted) return target;
  const heuristicConfidence = confidenceNumber(target.meta?.confidence, 0.5);
  const llmConfidence = confidenceNumber(extracted.meta?.confidence, 0);
  const mergeOptions = {
    targetConfidence: heuristicConfidence,
    sourceConfidence: llmConfidence
  };

  mergeObject(target.visitor, extracted.visitor, mergeOptions);
  mergeObject(target.company, extracted.company, mergeOptions);
  mergeObject(target.qualification, extracted.qualification, mergeOptions);
  mergeObject(target.routing, extracted.routing, mergeOptions);
  mergeObject(target.meta, extracted.meta, mergeOptions);
  return target;
}

const CONFIDENT_EMPTY_OVERRIDE_FIELDS = new Set([
  "authority_signal",
  "seniority",
  "timeline",
  "budget_status",
  "budget_range",
  "buying_stage",
  "crm"
]);

function confidenceNumber(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(1, number));
}

function isBlankExtractionValue(value) {
  return value === null || value === undefined || value === "" || value === "unknown";
}

function shouldPreferSource(options = {}) {
  const sourceConfidence = confidenceNumber(options.sourceConfidence, 0);
  const targetConfidence = confidenceNumber(options.targetConfidence, 0.5);
  return sourceConfidence > targetConfidence;
}

function mergeObject(target, source, options = {}) {
  for (const [key, value] of Object.entries(source || {})) {
    if (key === "needs_human_review") {
      target[key] = Boolean(target[key]) || Boolean(value);
      continue;
    }

    if (Array.isArray(value)) {
      target[key] = Array.from(new Set([...(target[key] || []), ...value].filter(Boolean)));
      continue;
    }

    const sourceBlank = isBlankExtractionValue(value);
    const targetBlank = isBlankExtractionValue(target[key]);

    if (sourceBlank) {
      if (!targetBlank && CONFIDENT_EMPTY_OVERRIDE_FIELDS.has(key) && confidenceNumber(options.sourceConfidence, 0) >= 0.85 && shouldPreferSource(options)) {
        target[key] = value === null ? null : "unknown";
      }
      continue;
    }

    if (targetBlank || shouldPreferSource(options)) {
      target[key] = value;
    }
  }
}
