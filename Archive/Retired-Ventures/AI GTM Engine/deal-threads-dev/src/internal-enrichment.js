import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const DEFAULT_TIMEOUT_MS = Number(process.env.INTERNAL_ENRICHMENT_TIMEOUT_MS || 3500);
const SIGNAL_PAGE_LIMIT = Number(process.env.INTERNAL_ENRICHMENT_SIGNAL_PAGE_LIMIT || 2);
const MAX_REDIRECTS = Number(process.env.INTERNAL_ENRICHMENT_MAX_REDIRECTS || 3);
const ALLOW_PRIVATE_HOSTS = process.env.INTERNAL_ENRICHMENT_ALLOW_PRIVATE_HOSTS === "true";
const ALLOW_TEST_HOSTS = process.env.NODE_ENV !== "production" && process.env.INTERNAL_ENRICHMENT_ALLOW_TEST_HOSTS !== "false";

const signalLinkPriorities = [
  { category: "about", patterns: [/\/about\b/i, /\/company\b/i, /\/team\b/i] },
  { category: "careers", patterns: [/\/careers\b/i, /\/jobs\b/i, /\/hiring\b/i] },
  { category: "integrations", patterns: [/\/integrations\b/i, /\/partners\b/i, /\/apps\b/i] },
  { category: "customers", patterns: [/\/customers\b/i, /\/case-stud/i, /\/stories\b/i] },
  { category: "pricing", patterns: [/\/pricing\b/i, /\/plans\b/i] },
  { category: "security", patterns: [/\/security\b/i, /\/trust\b/i, /\/compliance\b/i] },
  { category: "news", patterns: [/\/news\b/i, /\/press\b/i, /\/media\b/i, /\/blog\b/i, /\/resources\b/i] }
];

const techPatterns = [
  { value: "HubSpot", category: "CRM / Marketing", patterns: [/hubspot/i, /hs-scripts/i, /hsforms/i] },
  { value: "Salesforce", category: "CRM", patterns: [/salesforce/i, /force\.com/i, /pardot/i] },
  { value: "Marketo", category: "Marketing automation", patterns: [/marketo/i, /munchkin\.js/i] },
  { value: "Segment", category: "Analytics", patterns: [/segment\.com/i, /analytics\.js/i] },
  { value: "Google Analytics", category: "Analytics", patterns: [/googletagmanager/i, /google-analytics/i, /gtag\(/i] },
  { value: "Intercom", category: "Chat", patterns: [/intercom/i] },
  { value: "Drift", category: "Chat", patterns: [/drift\.com/i, /driftt/i] },
  { value: "Qualified", category: "Chat / routing", patterns: [/qualified\.com/i] },
  { value: "Chili Piper", category: "Scheduling / routing", patterns: [/chilipiper/i] },
  { value: "Clearbit", category: "Enrichment", patterns: [/clearbit/i] },
  { value: "Apollo", category: "Sales intelligence", patterns: [/apollo\.io/i] },
  { value: "React", category: "Frontend", patterns: [/react/i, /__REACT_DEVTOOLS/i] },
  { value: "Next.js", category: "Frontend", patterns: [/_next\/static/i, /next-head-count/i, /next\.js/i] },
  { value: "Webflow", category: "CMS", patterns: [/webflow/i] },
  { value: "WordPress", category: "CMS", patterns: [/wp-content/i, /wordpress/i] }
];

const conversionToolPatterns = [
  { value: "HubSpot Forms", category: "marketing_automation_form", patterns: [/js\.hsforms\.net/i, /hsforms/i, /hbspt\.forms/i], confidence: 0.82 },
  { value: "Marketo Forms", category: "marketing_automation_form", patterns: [/mktoForm/i, /marketo/i, /munchkin\.js/i], confidence: 0.78 },
  { value: "Pardot / Salesforce forms", category: "marketing_automation_form", patterns: [/pardot/i, /go\.pardot\.com/i, /force\.com\/servlet/i], confidence: 0.76 },
  { value: "Calendly", category: "scheduler", patterns: [/calendly\.com/i, /assets\.calendly\.com/i], confidence: 0.78 },
  { value: "Chili Piper", category: "scheduler", patterns: [/chilipiper/i], confidence: 0.8 },
  { value: "Typeform", category: "plain_form", patterns: [/typeform\.com/i, /data-tf-/i], confidence: 0.72 },
  { value: "Intercom", category: "chat", patterns: [/intercom/i], confidence: 0.74 },
  { value: "Drift", category: "chat", patterns: [/drift\.com/i, /driftt/i], confidence: 0.74 },
  { value: "Qualified", category: "chat", patterns: [/qualified\.com/i], confidence: 0.78 }
];

const conversionCtaPatterns = [
  { label: "Book a demo", category: "demo_cta", pattern: /\b(?:book|schedule|request|get)\s+(?:a\s+)?demo\b/i, confidence: 0.74 },
  { label: "Contact sales", category: "demo_cta", pattern: /\b(?:contact|talk to|speak with)\s+sales\b/i, confidence: 0.72 },
  { label: "Get a quote", category: "demo_cta", pattern: /\b(?:get|request)\s+(?:a\s+)?quote\b/i, confidence: 0.68 },
  { label: "Start trial", category: "demo_cta", pattern: /\b(?:start|try|get started)\s+(?:a\s+)?(?:free\s+)?trial\b/i, confidence: 0.62 }
];

const conversionSurfaceLabels = {
  marketing_automation_form: "Marketing automation form",
  scheduler: "Scheduler",
  chat: "Chat widget",
  plain_form: "Website form",
  demo_cta: "Demo CTA",
  unknown: "Unknown"
};

const conversionSurfacePriority = {
  marketing_automation_form: 90,
  scheduler: 80,
  chat: 70,
  plain_form: 60,
  demo_cta: 50,
  unknown: 0
};

export function internalEnrichmentMode() {
  return process.env.ENRICHMENT_MODE || "internal";
}

export async function enrichCompanyInternally(profile) {
  const domain = profile.company.domain;
  const website = profile.company.website || (domain ? `https://${domain}` : null);

  if (!website) {
    return fallbackEnrichment(profile, "No company website or domain available");
  }

  try {
    const fetched = await fetchWebsite(website);
    const html = fetched.html;
    const metadata = extractMetadata(html, fetched.finalUrl);
    const techStack = detectTechStack(html, fetched.headers);
    const socialLinks = extractSocialLinks(html);
    const siteLinks = extractSignalLinks(html, fetched.finalUrl);
    const inspectedPages = await fetchSignalPages(siteLinks.slice(0, SIGNAL_PAGE_LIMIT));
    const firmographics = extractFirmographics({ profile, html, metadata, finalUrl: fetched.finalUrl, inspectedPages });
    const publicBuyerRoles = extractPublicBuyerRoles({ html, metadata, finalUrl: fetched.finalUrl, inspectedPages });
    const hiringSignals = extractHiringSignals({ html, finalUrl: fetched.finalUrl, inspectedPages });
    const conversionSurface = extractConversionSurface({ html, finalUrl: fetched.finalUrl, inspectedPages, techStack });
    const signals = extractBusinessSignals({ html, siteLinks, inspectedPages, extraSignals: [...hiringSignals, ...conversionSurfaceSignals(conversionSurface)] });
    const fundingEvents = extractFundingEvents({ html, metadata, inspectedPages });
    const buyerProfile = buildBuyerProfile({
      profile,
      metadata,
      techStack,
      signals,
      inspectedPages,
      fundingEvents,
      firmographics,
      publicBuyerRoles,
      conversionSurface
    });
    const researchEvidence = buildInternalResearchEvidence({
      profile,
      metadata,
      finalUrl: fetched.finalUrl,
      firmographics,
      techStack,
      signals,
      fundingEvents,
      publicBuyerRoles,
      conversionSurface
    });
    const confidence = calculateConfidence({
      metadata,
      techStack,
      profile,
      signals,
      inspectedPages,
      fundingEvents,
      buyerProfile,
      firmographics,
      publicBuyerRoles,
      researchEvidence,
      conversionSurface
    });
    const companySize = profile.company.size_hint || firmographics.company_size?.value || "unknown";

    return {
      status: "completed",
      completed_at: new Date().toISOString(),
      provider: "internal_website_enrichment",
      confidence,
      company_size: {
        value: companySize,
        source: profile.company.size_hint ? "visitor" : firmographics.company_size?.source || "internal_website_enrichment",
        confidence: profile.company.size_hint ? 0.9 : firmographics.company_size?.confidence || 0.25
      },
      industry: {
        value: inferIndustry(profile, metadata, techStack),
        source: "internal_website_enrichment",
        confidence: metadata.description || metadata.title ? 0.55 : 0.25
      },
      tech_stack: mergeTechStacks(profile.qualification.sales_stack, techStack),
      funding_events: fundingEvents,
      decision_makers: buyerProfile.buying_committee,
      buyer_profile: buyerProfile,
      conversion_surface: conversionSurface,
      signals,
      research_evidence: researchEvidence,
      website: {
        final_url: fetched.finalUrl,
        title: metadata.title,
        description: metadata.description,
        canonical: metadata.canonical,
        social_links: socialLinks,
        signal_links: siteLinks.slice(0, 8),
        inspected_pages: inspectedPages
      },
      cost: internalCost(inspectedPages.length),
      notes: [
        "Internal enrichment uses public website metadata, same-domain signal pages, script detection, first-party role and hiring signals, and visitor-provided context.",
        "It does not buy person-level databases or expose paid enrichment costs."
      ]
    };
  } catch (error) {
    return fallbackEnrichment(profile, error.message);
  }
}

function fallbackEnrichment(profile, reason) {
  const techStack = mergeTechStacks(profile.qualification.sales_stack, []);
  const buyerProfile = buildBuyerProfile({ profile, metadata: {}, techStack, signals: [], inspectedPages: [], fundingEvents: [] });

  return {
    status: "fallback",
    completed_at: new Date().toISOString(),
    provider: "internal_website_enrichment",
    confidence: profile.company.size_hint ? 0.5 : 0.25,
    company_size: {
      value: profile.company.size_hint || "unknown",
      source: profile.company.size_hint ? "visitor" : "internal_website_enrichment",
      confidence: profile.company.size_hint ? 0.9 : 0.2
    },
    industry: {
      value: profile.company.industry_hint || inferIndustry(profile, {}, []),
      source: profile.company.industry_hint ? "visitor" : "internal_website_enrichment",
      confidence: profile.company.industry_hint ? 0.75 : 0.3
    },
    tech_stack: techStack,
      funding_events: [],
      decision_makers: buyerProfile.buying_committee,
      buyer_profile: buyerProfile,
      conversion_surface: emptyConversionSurface(),
      signals: [],
      research_evidence: [],
      website: {
      final_url: profile.company.website || null,
      title: null,
      description: null,
      canonical: null,
      social_links: [],
      signal_links: [],
      inspected_pages: []
    },
    cost: internalCost(0),
    notes: [`Internal website enrichment fallback: ${reason}`]
  };
}

async function fetchWebsite(website) {
  const candidates = [website];
  if (String(website || "").startsWith("https://")) candidates.push(String(website).replace(/^https:\/\//, "http://"));
  let lastError = null;

  for (const candidate of candidates) {
    try {
      return await fetchWebsiteCandidate(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Website fetch failed");
}

async function fetchWebsiteCandidate(website) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  let requestUrl = website;

  try {
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      const safeUrl = await assertSafeFetchUrl(requestUrl);
      const response = await fetch(safeUrl.href, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": "DealThreadsBot/0.1 (+https://dealthreads.local/dev)"
        }
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) throw new Error(`Website redirect returned ${response.status} without a location`);
        requestUrl = new URL(location, safeUrl).href;
        continue;
      }

      if (!response.ok) throw new Error(`Website returned ${response.status}`);

      return {
        finalUrl: response.url || safeUrl.href,
        headers: Object.fromEntries(response.headers.entries()),
        html: await response.text()
      };
    }

    throw new Error(`Website redirected more than ${MAX_REDIRECTS} time${MAX_REDIRECTS === 1 ? "" : "s"}`);
  } finally {
    clearTimeout(timeout);
  }
}

async function assertSafeFetchUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Website URL is invalid");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Website URL must use http or https");
  }
  if (parsed.username || parsed.password) {
    throw new Error("Website URL credentials are not allowed");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname.length > 253) throw new Error("Website host is invalid");
  if (isBlockedHostname(hostname)) throw new Error(`Website host ${hostname} is blocked for providerless enrichment`);
  if (ALLOW_PRIVATE_HOSTS) return parsed;
  if (ALLOW_TEST_HOSTS && /\.test$/.test(hostname)) return parsed;

  const literalIpVersion = isIP(hostname);
  const addresses = literalIpVersion ? [{ address: hostname, family: literalIpVersion }] : await lookup(hostname, { all: true, verbatim: false });
  if (!addresses.length) throw new Error(`Website host ${hostname} did not resolve`);

  for (const address of addresses) {
    if (isBlockedIp(address.address)) {
      throw new Error(`Website host ${hostname} resolved to a blocked network`);
    }
  }

  return parsed;
}

function isBlockedHostname(hostname) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0" ||
    hostname === "0.0.0.0" ||
    hostname === "::" ||
    hostname === "[::]" ||
    hostname === "::1" ||
    hostname === "[::1]"
  );
}

function isBlockedIp(address) {
  const version = isIP(address);
  if (!version) return true;
  if (version === 4) return isBlockedIpv4(address);
  return isBlockedIpv6(address);
}

function isBlockedIpv4(address) {
  const parts = address.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

function isBlockedIpv6(address) {
  const normalized = address.toLowerCase();
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("::ffff:")) return isBlockedIpv4(normalized.replace("::ffff:", ""));
  return normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80") || normalized.startsWith("ff");
}

function extractMetadata(html, finalUrl) {
  return {
    title: decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null),
    description: decodeHtml(
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
        html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
        null
    ),
    canonical:
      html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      finalUrl ||
      null
  };
}

function detectTechStack(html, headers = {}) {
  const haystack = `${html}\n${JSON.stringify(headers)}`;
  const detected = [];

  for (const tech of techPatterns) {
    if (tech.patterns.some((pattern) => pattern.test(haystack))) {
      detected.push({
        value: tech.value,
        category: tech.category,
        source: "internal_website_enrichment",
        confidence: 0.72
      });
    }
  }

  return dedupeByValue(detected);
}

function extractSocialLinks(html) {
  const links = Array.from(html.matchAll(/href=["']([^"']+)["']/gi)).map((match) => match[1]);
  return Array.from(
    new Set(
      links.filter((link) =>
        /linkedin\.com\/company|twitter\.com|x\.com\/|youtube\.com|facebook\.com|github\.com/i.test(link)
      )
    )
  ).slice(0, 10);
}

function extractSignalLinks(html, finalUrl) {
  let base;
  try {
    base = new URL(finalUrl);
  } catch {
    return [];
  }

  const links = Array.from(html.matchAll(/href=["']([^"']+)["']/gi))
    .map((match) => normalizeInternalLink(match[1], base))
    .filter(Boolean)
    .filter((url) => url.hostname === base.hostname)
    .map((url) => ({
      url: stripHash(url.href),
      path: url.pathname.toLowerCase(),
      category: classifySignalPath(url.pathname)
    }))
    .filter((link) => link.category);

  const unique = new Map();
  for (const link of links) unique.set(link.url, link);

  return [...unique.values()].sort((a, b) => signalRank(a.category) - signalRank(b.category));
}

async function fetchSignalPages(links) {
  const pages = [];
  for (const link of links) {
    try {
      const fetched = await fetchWebsite(link.url);
      const metadata = extractMetadata(fetched.html, fetched.finalUrl);
      const excerpt = plainText(fetched.html).slice(0, 4000);
      pages.push({
        url: fetched.finalUrl,
        category: link.category,
        title: metadata.title,
        description: metadata.description,
        excerpt,
        signals: extractPageSignals(`${metadata.title || ""} ${metadata.description || ""} ${excerpt}`, {
          sourceUrl: fetched.finalUrl,
          sourceLabel: `${link.category} page`
        })
      });
    } catch (error) {
      pages.push({
        url: link.url,
        category: link.category,
        title: null,
        description: null,
        signals: [],
        error: error.message
      });
    }
  }
  return pages;
}

function extractBusinessSignals({ html, siteLinks, inspectedPages, extraSignals = [] }) {
  const rootSignals = extractPageSignals(html);
  const pageSignals = inspectedPages.flatMap((page) => page.signals || []);
  const linkSignals = siteLinks.map((link) => signalFromLink(link)).filter(Boolean);
  return dedupeSignals([...linkSignals, ...rootSignals, ...pageSignals, ...extraSignals]).slice(0, 16);
}

function extractConversionSurface({ html = "", finalUrl = null, inspectedPages = [], techStack = [] }) {
  const pages = [
    {
      url: finalUrl,
      label: "Public website",
      text: plainText(html)
    },
    ...inspectedPages.map((page) => ({
      url: page.url || null,
      label: page.category ? `${page.category} page` : "Public website page",
      text: [page.category, page.title, page.description, page.excerpt].filter(Boolean).join(" ")
    }))
  ];
  const tools = dedupeConversionItems(extractConversionTools({ html, finalUrl, techStack }));
  const forms = dedupeConversionItems(extractConversionForms(html, finalUrl));
  const ctas = dedupeConversionItems([
    ...extractConversionAnchors(html, finalUrl),
    ...pages.flatMap((page) => extractConversionTextCtas(page))
  ]).slice(0, 8);
  const primarySurface = pickPrimaryConversionSurface({ tools, forms, ctas });

  if (primarySurface === "unknown") return emptyConversionSurface();

  const primaryLabel = conversionSurfaceLabels[primarySurface] || conversionSurfaceLabels.unknown;
  const firstEvidence = tools[0] || forms[0] || ctas[0] || {};
  const summary = conversionSurfaceSummary({ primaryLabel, tools, forms, ctas });

  return {
    status: "detected",
    primary_surface: primarySurface,
    primary_label: primaryLabel,
    summary,
    ctas,
    forms,
    tools,
    source_url: firstEvidence.source_url || finalUrl || null,
    source_label: firstEvidence.source_label || "Public website",
    confidence: Math.max(0.55, ...[...tools, ...forms, ...ctas].map((item) => Number(item.confidence || 0))),
    replacement_angle: conversionReplacementAngle(primarySurface)
  };
}

function emptyConversionSurface() {
  return {
    status: "not_detected",
    primary_surface: "unknown",
    primary_label: conversionSurfaceLabels.unknown,
    summary: "No public conversion form, scheduler, chat widget, or demo CTA was detected during the providerless crawl.",
    ctas: [],
    forms: [],
    tools: [],
    source_url: null,
    source_label: null,
    confidence: 0,
    replacement_angle: "Ask the buyer which contact, demo, or routing path should be replaced by the AI chat widget before installation."
  };
}

function extractConversionTools({ html = "", finalUrl = null, techStack = [] }) {
  const stackText = techStack.map((item) => `${item.value || ""} ${item.category || ""}`).join(" ");
  const haystack = `${html}\n${stackText}`;
  return conversionToolPatterns
    .filter((tool) => tool.patterns.some((pattern) => pattern.test(haystack)))
    .map((tool) => conversionItem(tool.value, tool.category, tool.confidence, {
      source_url: finalUrl,
      source_label: "Public website markup",
      evidence: `Detected ${tool.value} from public website markup or script signals.`
    }));
}

function extractConversionForms(html = "", finalUrl = null) {
  const forms = [];

  for (const match of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)) {
    const attrs = match[1] || "";
    const body = match[2] || "";
    const action = htmlAttribute(attrs, "action");
    const normalizedAction = normalizeAnyUrl(action, finalUrl);
    const fieldNames = Array.from(body.matchAll(/\b(?:name|id|placeholder)=["']([^"']+)["']/gi))
      .map((fieldMatch) => fieldMatch[1])
      .filter(Boolean);
    const text = plainText(body);
    const haystack = `${attrs} ${action || ""} ${fieldNames.join(" ")} ${text}`.toLowerCase();
    const capturesLeadFields = /\b(email|e-mail|name|company|phone|job title|message|budget|timeline)\b/i.test(haystack);
    const conversionIntent = /\b(contact|demo|sales|quote|lead|request|book|schedule|get started)\b/i.test(haystack);
    if (!capturesLeadFields && !conversionIntent) continue;
    const category = /demo|book|schedule/i.test(haystack) ? "plain_form" : "plain_form";
    const label = /demo|book|schedule/i.test(haystack) ? "Demo request form" : /contact|sales/i.test(haystack) ? "Contact sales form" : "Website lead form";
    forms.push(
      conversionItem(label, category, capturesLeadFields && conversionIntent ? 0.78 : 0.64, {
        source_url: normalizedAction || finalUrl,
        source_label: "Public website form",
        evidence: truncateEvidence(text || fieldNames.join(", ") || action || "Lead capture form markup")
      })
    );
  }

  return forms;
}

function extractConversionAnchors(html = "", finalUrl = null) {
  const anchors = [];

  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = match[1] || "";
    const label = plainText(match[2] || "");
    const href = htmlAttribute(attrs, "href");
    const url = normalizeAnyUrl(href, finalUrl);
    const cta = matchConversionCta(`${label} ${href || ""}`);
    if (!cta) continue;
    anchors.push(
      conversionItem(label || cta.label, cta.category, cta.confidence, {
        source_url: url || finalUrl,
        source_label: "Public website CTA",
        evidence: truncateEvidence(`${label || cta.label}${url ? ` -> ${url}` : ""}`)
      })
    );
  }

  return anchors;
}

function extractConversionTextCtas(page = {}) {
  const ctas = [];
  const text = plainText(page.text || "");

  for (const cta of conversionCtaPatterns) {
    const match = text.match(cta.pattern);
    if (!match) continue;
    ctas.push(
      conversionItem(cta.label, cta.category, Math.max(0.56, cta.confidence - 0.08), {
        source_url: page.url || null,
        source_label: page.label || "Public website",
        evidence: truncateEvidence(match[0])
      })
    );
  }

  return ctas;
}

function matchConversionCta(value) {
  return conversionCtaPatterns.find((cta) => cta.pattern.test(String(value || ""))) || null;
}

function conversionItem(value, category, confidence, extras = {}) {
  return {
    value,
    category,
    source: "internal_website_enrichment",
    confidence,
    ...extras
  };
}

function dedupeConversionItems(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.category}:${item.value}:${item.source_url || ""}`.toLowerCase();
    if (!item.value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pickPrimaryConversionSurface({ tools = [], forms = [], ctas = [] }) {
  const candidates = [
    ...tools.map((item) => normalizeConversionSurfaceCategory(item.category)),
    ...forms.map((item) => normalizeConversionSurfaceCategory(item.category)),
    ...ctas.map((item) => normalizeConversionSurfaceCategory(item.category))
  ];
  return candidates.sort((a, b) => (conversionSurfacePriority[b] || 0) - (conversionSurfacePriority[a] || 0))[0] || "unknown";
}

function normalizeConversionSurfaceCategory(category) {
  if (conversionSurfacePriority[category]) return category;
  if (category === "form") return "plain_form";
  return "unknown";
}

function conversionSurfaceSummary({ primaryLabel, tools = [], forms = [], ctas = [] }) {
  const parts = [`Detected ${primaryLabel.toLowerCase()} on the buyer website.`];
  if (tools.length) parts.push(`Tools: ${tools.map((item) => item.value).join(", ")}.`);
  if (forms.length) parts.push(`Forms: ${forms.map((item) => item.value).join(", ")}.`);
  if (ctas.length) parts.push(`CTAs: ${ctas.map((item) => item.value).slice(0, 4).join(", ")}.`);
  parts.push("Use Replede to capture intent, budget, timeline, and routing context before the rep handoff.");
  return parts.join(" ");
}

function conversionReplacementAngle(primarySurface) {
  if (primarySurface === "marketing_automation_form") {
    return "Replace the static marketing-automation form with the AI chat widget, then pass a structured buyer profile into the existing CRM or marketing automation workflow.";
  }
  if (primarySurface === "scheduler") {
    return "Keep the scheduler as the final booking step, but put the AI chat widget before it so reps receive qualification context before the meeting lands.";
  }
  if (primarySurface === "chat") {
    return "Use the AI chat widget to capture deeper intent and CRM-ready fields instead of routing a generic chat transcript to sales.";
  }
  if (primarySurface === "plain_form") {
    return "Replace or augment the detected website form with the AI chat widget so the rep receives a buyer profile rather than only name, email, and message fields.";
  }
  return "Attach the AI chat widget to the detected demo CTA so high-intent visitors generate a complete buyer profile before handoff.";
}

function conversionSurfaceSignals(surface = {}) {
  if (surface.status !== "detected") return [];
  return [
    signal(`${surface.primary_label || "Conversion surface"} detected`, "conversion_surface", Math.max(0.62, Number(surface.confidence || 0.7)), {
      source_url: surface.source_url,
      source_label: surface.source_label || "Public website",
      evidence: surface.summary
    })
  ];
}

function extractPageSignals(text, source = {}) {
  const haystack = String(text || "").toLowerCase();
  const signals = [];
  const extras = source.sourceUrl
    ? {
        source_url: source.sourceUrl,
        source_label: source.sourceLabel || "Public website",
        evidence: truncateEvidence(plainText(text))
      }
    : {};
  if (/book a demo|request a demo|contact sales|talk to sales/.test(haystack)) {
    signals.push(signal("Demo-led sales motion", "sales_motion", 0.7, extras));
  }
  if (/speed[-\s]?to[-\s]?lead|lead routing|inbound routing|demo request|response time|sales handoff|revops|revenue operations/.test(haystack)) {
    signals.push(signal("Revenue operations or lead handoff language", "revops_pain", 0.68, extras));
  }
  if (/b2b|mid[-\s]?market|go[-\s]?to[-\s]?market|pipeline|sales team|revenue team|account executive|sdr/.test(haystack)) {
    signals.push(signal("B2B revenue team language", "icp_fit", 0.64, extras));
  }
  if (/pricing|plans|quote|subscription/.test(haystack)) {
    signals.push(signal("Pricing or subscription language", "commercial", 0.62, extras));
  }
  if (/enterprise|sso|soc 2|soc2|security|compliance|gdpr|hipaa/.test(haystack)) {
    signals.push(signal("Enterprise readiness language", "enterprise_readiness", 0.64, extras));
  }
  if (/integrations|connects with|salesforce|hubspot|marketo|slack|zapier/.test(haystack)) {
    signals.push(signal("Integration ecosystem language", "integration_fit", 0.66, extras));
  }
  if (/customers|case studies|trusted by|reviews|testimonials/.test(haystack)) {
    signals.push(signal("Customer proof language", "market_proof", 0.6, extras));
  }
  if (/careers|open roles|we are hiring|join our team|job openings/.test(haystack)) {
    signals.push(signal("Hiring or growth language", "growth", 0.58, extras));
  }
  if (/series [a-f]|seed round|funding|funded|raised|backed by|venture capital|investors/.test(haystack)) {
    signals.push(signal("Funding or investor language", "growth_trigger", 0.6, extras));
  }
  return signals;
}

function signalFromLink(link) {
  const labels = {
    pricing: ["Pricing page found", "commercial", 0.68],
    customers: ["Customer proof page found", "market_proof", 0.66],
    integrations: ["Integrations page found", "integration_fit", 0.7],
    security: ["Security or trust page found", "enterprise_readiness", 0.64],
    careers: ["Careers page found", "growth", 0.56],
    about: ["Company/about page found", "company_context", 0.52]
  };
  const details = labels[link.category];
  if (!details) return null;
  return signal(details[0], details[1], details[2], { source_url: link.url, source_label: `${link.category} link` });
}

function signal(value, category, confidence, extras = {}) {
  return {
    value,
    category,
    source: "internal_website_enrichment",
    confidence,
    ...extras
  };
}

function extractFirmographics({ profile, html = "", metadata = {}, finalUrl = null, inspectedPages = [] }) {
  const pages = corpusPages({ html, metadata, finalUrl, inspectedPages });
  const explicitVisitorValue = profile.company.size_hint || profile.company.employee_range;
  if (explicitVisitorValue) {
    return {
      company_size: {
        value: explicitVisitorValue,
        source: "visitor",
        confidence: 0.9,
        source_url: null,
        evidence: "Visitor supplied company-size context."
      }
    };
  }

  for (const page of pages) {
    const size = extractCompanySizeFromText(page.text);
    if (size) {
      return {
        company_size: {
          value: size.value,
          source: "internal_website_enrichment",
          confidence: size.confidence,
          source_url: page.url,
          source_label: page.label,
          evidence: size.evidence
        }
      };
    }
  }

  return { company_size: null };
}

function extractCompanySizeFromText(text) {
  const normalized = plainText(text);
  const patterns = [
    /\b(?:team of|company of|organization of|we are|we're|our team of)\s+(?:a\s+)?(?:over\s+|more than\s+|about\s+|approximately\s+|around\s+)?([1-9][\d,]{1,5})\s*(\+)?\s*(?:employees?|people|team members|staff|person team|person)\b/i,
    /\b([1-9][\d,]{1,5})\s*(\+)?[-\s]?(?:person|employee|employees|people)(?:\s+\w+){0,4}\s+(?:company|team|organization)\b/i,
    /\b(?:employees|company size|team size)\s*[:\-]\s*([0-9,]+(?:\+)?(?:\s*[-–]\s*[0-9,]+)?(?:\s*(?:employees|people))?)\b/i,
    /\b((?:1-10|11-50|51-200|101-250|201-500|501-1000|1001-5000|5001-10000)\s+employees)\b/i
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match) continue;
    const rangeOrCount = match[1].replace(/\s+/g, " ").trim();
    const plus = match[2] ? "+" : "";
    const hasEmployeeWord = /employee|people/i.test(rangeOrCount);
    const value = hasEmployeeWord ? rangeOrCount : `${rangeOrCount}${plus} employees`;
    return {
      value,
      confidence: rangeOrCount.includes("-") || plus ? 0.72 : 0.68,
      evidence: truncateEvidence(match[0])
    };
  }

  return null;
}

function extractHiringSignals({ html = "", finalUrl = null, inspectedPages = [] }) {
  const pages = corpusPages({ html, metadata: {}, finalUrl, inspectedPages }).filter((page) =>
    /careers|jobs|hiring|join/i.test(`${page.label} ${page.url || ""} ${page.text}`)
  );
  const signals = [];

  for (const page of pages) {
    const text = plainText(page.text);
    const countMatch = text.match(/\b([1-9][0-9]{0,3})\s+(?:open\s+)?(?:roles|positions|jobs|job openings|openings)\b/i);
    if (countMatch) {
      signals.push(
        signal(`Active hiring: ${countMatch[1]} open roles`, "growth", 0.7, {
          source_url: page.url,
          source_label: page.label,
          evidence: truncateEvidence(countMatch[0])
        })
      );
      continue;
    }
    if (/\b(?:we are hiring|we're hiring|join our team|open roles|job openings)\b/i.test(text)) {
      signals.push(
        signal("Active hiring language found", "growth", 0.6, {
          source_url: page.url,
          source_label: page.label,
          evidence: truncateEvidence(text)
        })
      );
    }
  }

  return dedupeSignals(signals).slice(0, 4);
}

function extractPublicBuyerRoles({ html = "", metadata = {}, finalUrl = null, inspectedPages = [] }) {
  const rolePatterns = [
    {
      value: "RevOps leader",
      title: "VP Revenue Operations / Director RevOps",
      reason: "Owns lead routing quality, response SLAs, and sales process gaps.",
      pattern: /\b(?:vp|vice president|director|head|manager)\s+(?:of\s+)?(?:revenue operations|revops)\b|\brevenue operations\b/i,
      title_pattern: /\b(?:vp|vice president|director|head|manager)\s+(?:of\s+)?(?:revenue operations|revops)\b|\brevenue operations\b/i
    },
    {
      value: "Sales leader",
      title: "VP Sales / CRO",
      reason: "Owns conversion rate, rep productivity, and inbound pipeline outcomes.",
      pattern: /\b(?:chief revenue officer|cro|vp sales|vice president sales|head of sales|sales leader)\b/i,
      title_pattern: /\b(?:chief revenue officer|cro|vp sales|vice president sales|head of sales|sales leader)\b/i
    },
    {
      value: "CRM owner",
      title: "Sales Operations / CRM Admin",
      reason: "Owns CRM fields, routing rules, and integration acceptance.",
      pattern: /\b(?:sales operations|sales ops|crm admin|crm administrator|marketing operations|marketing ops)\b/i,
      title_pattern: /\b(?:sales operations|sales ops|crm admin|crm administrator|marketing operations|marketing ops)\b/i
    },
    {
      value: "Demand generation owner",
      title: "Demand Generation / Growth Marketing",
      reason: "Owns website conversion and demo-request quality.",
      pattern: /\b(?:demand generation|demand gen|growth marketing|revenue marketing)\b/i,
      title_pattern: /\b(?:demand generation|demand gen|growth marketing|revenue marketing)\b/i
    },
    {
      value: "Security stakeholder",
      title: "IT / Security reviewer",
      reason: "Script installation, data handling, and compliance review may need approval.",
      pattern: /\b(?:security|trust|compliance|it administrator|information security|infosec)\b/i,
      title_pattern: /\b(?:security|trust|compliance|it administrator|information security|infosec)\b/i
    }
  ];
  const roles = [];

  for (const page of corpusPages({ html, metadata, finalUrl, inspectedPages })) {
    const text = plainText(page.text || "");
    for (const role of rolePatterns) {
      const match = text.match(role.pattern);
      if (!match) continue;
      const contact = extractPublicRoleContact(text, match, role);
      roles.push(
        roleSignal(role.value, contact.title || role.title, role.reason, contact.name ? 0.82 : 0.76, {
          name: contact.name,
          email: contact.email,
          source: "public_site_signal",
          source_url: page.url,
          source_label: page.label,
          evidence: contact.evidence || truncateEvidence(match[0])
        })
      );
    }
  }

  return dedupeByValue(roles).slice(0, 5);
}

function extractPublicRoleContact(text = "", match = {}, role = {}) {
  const normalizedText = plainText(text);
  const index = Number.isInteger(match.index) ? match.index : normalizedText.toLowerCase().indexOf(String(match[0] || "").toLowerCase());
  const start = Math.max(0, index - 140);
  const end = Math.min(normalizedText.length, index + String(match[0] || "").length + 180);
  const context = normalizedText.slice(start, end).replace(/\s+/g, " ").trim();
  const title = extractPublicRoleTitle(context, match[0], role);
  const titleIndex = context.toLowerCase().indexOf(String(match[0] || "").toLowerCase());
  const beforeTitle = titleIndex >= 0 ? context.slice(0, titleIndex) : "";
  const afterTitle = titleIndex >= 0 ? context.slice(titleIndex + String(match[0] || "").length) : "";
  const beforeName = pickPublicPersonName([...beforeTitle.matchAll(publicPersonNamePattern())].map((item) => item[0]).reverse());
  const afterName = pickPublicPersonName([...afterTitle.slice(0, 90).matchAll(publicPersonNamePattern())].map((item) => item[0]));
  const emails = context.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return {
    name: beforeName || afterName || null,
    title,
    email: emails[0] || null,
    evidence: truncateEvidence(context)
  };
}

function extractPublicRoleTitle(context = "", matchedText = "", role = {}) {
  const titleMatch = context.match(role.title_pattern || role.pattern);
  const title = titleMatch?.[0] || matchedText || role.title || role.value;
  return title
    .replace(/\s+/g, " ")
    .replace(/\b(revenue operations)\b/i, "Revenue Operations")
    .replace(/\b(revops)\b/i, "RevOps")
    .trim();
}

function publicPersonNamePattern() {
  return /\b[A-Z][A-Za-z'’.-]+(?:\s+[A-Z][A-Za-z'’.-]+){1,3}\b/g;
}

function pickPublicPersonName(candidates = []) {
  for (const candidate of candidates) {
    const cleaned = cleanPublicPersonName(candidate);
    if (cleaned) return cleaned;
  }
  return null;
}

function cleanPublicPersonName(value = "") {
  const cleaned = String(value || "")
    .replace(/^(?:Meet|About|Our|Team|Leadership|Executive|Contact|Press)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || cleaned.length < 5) return null;
  if (!/\s/.test(cleaned)) return null;
  if (/@/.test(cleaned)) return null;
  if (/\b(?:Revenue|Operations|RevOps|Sales|Security|Marketing|Demand|Generation|Growth|Leader|Leadership|Company|Platform|Contact|Demo|Request)\b/i.test(cleaned)) return null;
  if (cleaned.split(/\s+/).length > 4) return null;
  return cleaned;
}

function buildInternalResearchEvidence({
  profile,
  metadata = {},
  finalUrl = null,
  firmographics = {},
  techStack = [],
  signals = [],
  fundingEvents = [],
  publicBuyerRoles = [],
  conversionSurface = emptyConversionSurface()
}) {
  const evidence = [];
  const sourceLabel = "Public website";

  if (metadata.description) {
    evidence.push(researchEvidence("icp_signal", metadata.description, finalUrl, sourceLabel, 0.62, "Website description captured by internal enrichment."));
  } else if (metadata.title) {
    evidence.push(researchEvidence("icp_signal", metadata.title, finalUrl, sourceLabel, 0.55, "Website title captured by internal enrichment."));
  }

  if (firmographics.company_size?.value && firmographics.company_size.source !== "visitor") {
    evidence.push(
      researchEvidence(
        "company_size",
        firmographics.company_size.value,
        firmographics.company_size.source_url || finalUrl,
        firmographics.company_size.source_label || sourceLabel,
        firmographics.company_size.confidence || 0.65,
        firmographics.company_size.evidence || "Company size inferred from public-site language."
      )
    );
  }

  for (const tech of techStack.filter((item) => item.source !== "visitor").slice(0, 5)) {
    evidence.push(
      researchEvidence(
        "tech_stack",
        tech.value,
        tech.source_url || finalUrl,
        tech.source_label || sourceLabel,
        tech.confidence || 0.65,
        `Detected ${tech.value} from website markup or public page language.`
      )
    );
  }

  for (const role of publicBuyerRoles.slice(0, 5)) {
    evidence.push(
      researchEvidence(
        "buying_committee",
        [role.name, role.title || role.value].filter(Boolean).join(" - "),
        role.source_url || finalUrl,
        role.source_label || sourceLabel,
        role.confidence || 0.7,
        [role.evidence || role.reason || "Buying role language found on public website.", role.email ? `Public email: ${role.email}` : null]
          .filter(Boolean)
          .join(" ")
      )
    );
  }

  if (conversionSurface.status === "detected") {
    evidence.push(
      researchEvidence(
        "conversion_surface",
        conversionSurface.primary_label || conversionSurface.summary,
        conversionSurface.source_url || finalUrl,
        conversionSurface.source_label || sourceLabel,
        conversionSurface.confidence || 0.68,
        conversionSurface.replacement_angle || conversionSurface.summary
      )
    );
  }

  for (const event of fundingEvents.slice(0, 3)) {
    evidence.push(
      researchEvidence(
        "funding",
        [event.amount, event.round].filter(Boolean).join(" ") || event.value,
        event.source_url || finalUrl,
        event.source_label || sourceLabel,
        event.confidence || 0.6,
        event.evidence || "Funding or investor language found on public website."
      )
    );
  }

  for (const item of signals.filter((entry) => ["growth", "growth_trigger", "enterprise_readiness", "integration_fit", "icp_fit"].includes(entry.category)).slice(0, 6)) {
    evidence.push(
      researchEvidence(
        item.category === "growth_trigger" ? "funding" : "icp_signal",
        item.value,
        item.source_url || finalUrl,
        item.source_label || sourceLabel,
        item.confidence || 0.6,
        item.evidence || "Public-site signal captured by internal enrichment."
      )
    );
  }

  if (profile.company.domain && !evidence.length) {
    evidence.push(researchEvidence("note", `Internal enrichment inspected ${profile.company.domain}`, finalUrl, sourceLabel, 0.5, "No paid enrichment provider was called."));
  }

  return dedupeResearchEvidence(evidence).slice(0, 12);
}

function researchEvidence(category, value, sourceUrl, sourceLabel, confidence, note) {
  return {
    category,
    value,
    source_url: sourceUrl || null,
    source_label: sourceLabel || null,
    confidence,
    reusable: true,
    note,
    created_by: "internal_website_enrichment",
    created_at: new Date().toISOString()
  };
}

function dedupeResearchEvidence(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.category}:${item.value}:${item.source_url || ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return Boolean(item.value);
  });
}

function extractFundingEvents({ html = "", metadata = {}, inspectedPages = [] }) {
  const text = plainText(
    [
      metadata.title,
      metadata.description,
      html,
      ...inspectedPages.flatMap((page) => [page.title, page.description])
    ]
      .filter(Boolean)
      .join(" ")
  );
  const events = [];
  const explicitFundingPattern =
    /(?:raised|raises|secured|announced|closed|landed)\s+(?:a\s+)?(?:\$?\s*([0-9][\d,.]*)\s*(k|m|million|b|billion)?\s+)?(?:in\s+)?((?:series\s+[a-f])|seed|pre-seed|funding|financing|investment|round)/gi;
  for (const match of text.matchAll(explicitFundingPattern)) {
    const round = normalizeFundingRound(match[3]);
    events.push({
      value: `${round || "Funding"} language found`,
      amount: normalizeFundingAmount(match[1], match[2]),
      round,
      date: null,
      source: "internal_website_enrichment",
      confidence: match[1] || round ? 0.64 : 0.54,
      evidence: truncateEvidence(match[0])
    });
  }

  const roundOnly = text.match(/\b(series\s+[a-f]|seed round|pre-seed round)\b/i)?.[0];
  if (!events.length && roundOnly) {
    events.push({
      value: `${normalizeFundingRound(roundOnly)} language found`,
      amount: null,
      round: normalizeFundingRound(roundOnly),
      date: null,
      source: "internal_website_enrichment",
      confidence: 0.55,
      evidence: truncateEvidence(roundOnly)
    });
  }

  return dedupeByValue(events).slice(0, 5);
}

function buildBuyerProfile({
  profile,
  metadata = {},
  techStack = [],
  signals = [],
  inspectedPages = [],
  fundingEvents = [],
  firmographics = {},
  publicBuyerRoles = [],
  conversionSurface = emptyConversionSurface()
}) {
  const context = buyerContextText({ profile, metadata, techStack, signals, inspectedPages, fundingEvents, firmographics, publicBuyerRoles, conversionSurface });
  const buyingTriggers = inferBuyingTriggers(profile, signals, fundingEvents, context);
  const buyingCommittee = inferBuyingCommittee(profile, techStack, signals, context, publicBuyerRoles);
  const icpFit = inferIcpFit(profile, metadata, techStack, signals, fundingEvents, context, firmographics);

  return {
    icp_fit: icpFit,
    buying_committee: buyingCommittee,
    buying_triggers: buyingTriggers,
    opening_angle: buildOpeningAngle(profile, buyingCommittee, buyingTriggers, icpFit)
  };
}

function buyerContextText({ profile, metadata, techStack, signals, inspectedPages, fundingEvents, firmographics = {}, publicBuyerRoles = [], conversionSurface = emptyConversionSurface() }) {
  return [
    profile.company.name,
    profile.company.domain,
    profile.company.industry_hint,
    profile.company.size_hint,
    profile.qualification.business_need,
    profile.qualification.pain_point,
    profile.qualification.product_interest,
    profile.qualification.integration_need,
    profile.qualification.crm,
    profile.qualification.timeline,
    profile.qualification.budget_status,
    profile.qualification.budget_range,
    profile.visitor.authority_signal,
    metadata.title,
    metadata.description,
    firmographics.company_size?.value,
    conversionSurface.status === "detected" ? conversionSurface.primary_label : null,
    conversionSurface.status === "detected" ? conversionSurface.summary : null,
    conversionSurface.status === "detected" ? conversionSurface.replacement_angle : null,
    ...(conversionSurface.tools || []).map((item) => item.value),
    ...(conversionSurface.forms || []).map((item) => item.value),
    ...(conversionSurface.ctas || []).map((item) => item.value),
    ...techStack.map((item) => item.value),
    ...signals.map((item) => `${item.value} ${item.category}`),
    ...publicBuyerRoles.map((item) => `${item.value} ${item.title || ""} ${item.evidence || ""}`),
    ...inspectedPages.flatMap((page) => [page.category, page.title, page.description]),
    ...fundingEvents.map((event) => `${event.value} ${event.round || ""} ${event.amount || ""}`)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferBuyingTriggers(profile, signals, fundingEvents, context) {
  const triggers = [];
  const need = String(profile.qualification.business_need || "").toLowerCase();

  if (/cold|slow|speed|response|follow[-\s]?up|handoff|route|routing/.test(`${need} ${context}`)) {
    triggers.push(buyerSignal("Speed-to-lead or sales handoff pain", "acute_pain", "visitor_context", 0.84));
  }
  if (/manual|research|google|enrichment|lead quality|profile|context/.test(`${need} ${context}`)) {
    triggers.push(buyerSignal("Manual lead research or missing context", "data_quality", "visitor_context", 0.8));
  }
  if (["this_week", "this_month", "this_quarter"].includes(profile.qualification.timeline)) {
    triggers.push(
      buyerSignal(`Active project timing: ${profile.qualification.timeline.replaceAll("_", " ")}`, "timing", "visitor_context", 0.82)
    );
  }
  if (["approved", "likely"].includes(profile.qualification.budget_status)) {
    triggers.push(buyerSignal(`Budget signal: ${profile.qualification.budget_status}`, "budget", "visitor_context", 0.78));
  } else if (profile.qualification.budget_status === "building_case") {
    triggers.push(buyerSignal("Business case is being built", "budget", "visitor_context", 0.68));
  }
  if (fundingEvents.length) {
    triggers.push(buyerSignal("Funding or investor language may indicate growth motion", "growth_trigger", "internal_website_enrichment", 0.66));
  }
  for (const signalItem of signals) {
    if (["growth", "growth_trigger", "enterprise_readiness", "integration_fit", "commercial"].includes(signalItem.category)) {
      triggers.push(buyerSignal(signalItem.value, signalItem.category, signalItem.source, Math.min(0.78, Number(signalItem.confidence || 0.6))));
    }
  }

  if (!triggers.length) {
    triggers.push(buyerSignal("Buyer requested a sales follow-up", "inbound_intent", "visitor_context", 0.58));
  }

  return dedupeSignals(triggers).slice(0, 8);
}

function inferBuyingCommittee(profile, techStack, signals, context, publicBuyerRoles = []) {
  const roles = [...publicBuyerRoles];
  const hasRevenuePain = /lead|demo|routing|handoff|sales|pipeline|revenue|revops|speed/.test(context);
  const hasCrmOrIntegration = profile.qualification.crm !== "unknown" || techStack.length || /crm|salesforce|hubspot|integration|marketo/.test(context);
  const hasBudget = ["approved", "likely", "building_case"].includes(profile.qualification.budget_status);
  const hasEnterprise = signals.some((item) => item.category === "enterprise_readiness") || /security|sso|soc 2|compliance|enterprise/.test(context);

  if (hasRevenuePain) {
    roles.push(roleSignal("RevOps leader", "VP Revenue Operations / Director RevOps", "Owns lead routing quality, response SLAs, and sales process gaps.", 0.78));
    roles.push(roleSignal("Sales leader", "VP Sales / CRO", "Owns conversion rate, rep productivity, and pipeline from inbound demand.", 0.72));
  }
  if (hasCrmOrIntegration) {
    roles.push(roleSignal("CRM owner", "Sales Operations / CRM Admin", "Owns CRM field mapping, routing rules, and integration acceptance.", 0.7));
  }
  if (hasBudget || profile.visitor.authority_signal === "decision_owner") {
    roles.push(roleSignal("Budget owner", "GTM leader / Revenue executive", "Likely needed to approve subscription spend and pilot success criteria.", 0.66));
  }
  if (hasEnterprise) {
    roles.push(roleSignal("Security stakeholder", "IT / Security reviewer", "Trust, compliance, and script installation may need approval.", 0.58));
  }

  if (!roles.length) {
    roles.push(roleSignal("Sales or marketing owner", "Demand generation / Sales operations lead", "Likely owner for website conversion and inbound follow-up.", 0.52));
  }

  // Without scraped firmographic evidence (no signals from the company's own site), these roles are
  // archetypes inferred from the visitor's stated pain — not identified stakeholders. Hedge the
  // confidence and relabel the source so a rep does not mistake them for real, sourced people.
  const committee = dedupeByValue(roles).slice(0, 5);
  if (!signals.length && !publicBuyerRoles.length) {
    for (const role of committee) {
      role.confidence = Math.min(Number(role.confidence) || 0, 0.45);
      role.source = "inferred_from_visitor_context";
      role.reason = `Inferred from visitor context; no firmographic source. ${role.reason}`;
    }
  }
  return committee;
}

function inferIcpFit(profile, metadata, techStack, signals, fundingEvents, context, firmographics = {}) {
  let score = 20;
  const reasons = [];

  if (profile.company.domain || profile.company.website) {
    score += 10;
    reasons.push("Company domain or website is known.");
  }
  if (profile.company.size_hint || firmographics.company_size?.value || /mid[-\s]?market|[1-9][0-9]{2,}\s*(person|employee|people)/.test(context)) {
    score += 16;
    reasons.push("Company size signal supports a mid-market sales motion.");
  }
  if (/b2b|saas|software|platform|crm|sales|revenue|pipeline/.test(context) || metadata.description) {
    score += 16;
    reasons.push("Industry and website language align with B2B revenue teams.");
  }
  if (/lead|demo|routing|handoff|enrichment|speed[-\s]?to[-\s]?lead|crm/.test(context)) {
    score += 18;
    reasons.push("Pain matches lead enrichment, routing, or CRM handoff.");
  }
  if (profile.qualification.crm !== "unknown" || techStack.length) {
    score += 10;
    reasons.push("CRM or sales-stack context is available for handoff.");
  }
  if (["this_week", "this_month", "this_quarter"].includes(profile.qualification.timeline)) {
    score += 8;
    reasons.push("Timeline indicates active buying motion.");
  }
  if (["approved", "likely"].includes(profile.qualification.budget_status)) {
    score += 8;
    reasons.push("Budget signal is positive.");
  }
  if (["decision_owner", "influencer"].includes(profile.visitor.authority_signal)) {
    score += 6;
    reasons.push("Visitor has decision authority or influence.");
  }
  if (signals.some((item) => ["integration_fit", "enterprise_readiness", "commercial"].includes(item.category)) || fundingEvents.length) {
    score += 4;
    reasons.push("Public-site signals suggest a mature buying or growth motion.");
  }

  const finalScore = Math.max(0, Math.min(100, score));
  return {
    score: finalScore,
    segment: finalScore >= 75 ? "strong_mid_market_b2b_fit" : finalScore >= 55 ? "potential_b2b_fit" : "needs_more_research",
    reasons: reasons.slice(0, 6)
  };
}

function buildOpeningAngle(profile, committee, triggers, icpFit) {
  const company = profile.company.name || profile.company.domain || "the account";
  const need = profile.qualification.business_need || "the inbound conversion problem";
  const role = committee[0]?.title || "the revenue owner";
  const trigger = triggers[0]?.value || "the website inquiry";
  const fit = icpFit.segment.replaceAll("_", " ");
  return `Open by tying ${company}'s stated need (${need}) to ${trigger}. Confirm whether ${role} owns the pilot decision, then use the ${fit} score to frame the next step.`;
}

function roleSignal(role, title, reason, confidence, extras = {}) {
  return {
    value: role,
    name: null,
    email: null,
    title,
    role,
    category: "buying_committee",
    source: "internal_buyer_profile",
    confidence,
    reason,
    ...extras
  };
}

function buyerSignal(value, category, source, confidence) {
  return {
    value,
    category,
    source,
    confidence
  };
}

function normalizeFundingRound(value) {
  if (!value) return null;
  const text = String(value).trim().toLowerCase();
  if (text.includes("pre-seed")) return "Pre-seed";
  if (text.includes("seed")) return "Seed";
  const series = text.match(/series\s+([a-f])/i)?.[1];
  if (series) return `Series ${series.toUpperCase()}`;
  if (text.includes("financing")) return "Financing";
  if (text.includes("investment")) return "Investment";
  if (text.includes("funding")) return "Funding";
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeFundingAmount(amount, unit) {
  if (!amount) return null;
  const suffix = String(unit || "").toLowerCase();
  const normalized = String(amount).replace(/\s+/g, "");
  if (["m", "million"].includes(suffix)) return `$${normalized}M`;
  if (["b", "billion"].includes(suffix)) return `$${normalized}B`;
  if (suffix === "k") return `$${normalized}K`;
  return `$${normalized}`;
}

function truncateEvidence(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 160);
}

function plainText(value) {
  return decodeHtml(String(value || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function normalizeInternalLink(href, base) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
    return null;
  }
  try {
    return new URL(href, base);
  } catch {
    return null;
  }
}

function normalizeAnyUrl(href, baseValue) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
    return null;
  }
  try {
    return new URL(href, baseValue || undefined).href;
  } catch {
    return null;
  }
}

function htmlAttribute(attrs, name) {
  const match = String(attrs || "").match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match?.[1] || null;
}

function stripHash(value) {
  const url = new URL(value);
  url.hash = "";
  return url.href;
}

function corpusPages({ html = "", metadata = {}, finalUrl = null, inspectedPages = [] }) {
  return [
    {
      url: finalUrl,
      label: "Public website",
      text: [metadata.title, metadata.description, plainText(html)].filter(Boolean).join(" ")
    },
    ...inspectedPages.map((page) => ({
      url: page.url || null,
      label: page.category ? `${page.category} page` : "Public website page",
      text: [page.category, page.title, page.description, page.excerpt].filter(Boolean).join(" ")
    }))
  ].filter((page) => page.text);
}

function classifySignalPath(pathname) {
  const path = pathname.toLowerCase();
  return signalLinkPriorities.find((item) => item.patterns.some((pattern) => pattern.test(path)))?.category || null;
}

function signalRank(category) {
  const index = signalLinkPriorities.findIndex((item) => item.category === category);
  return index === -1 ? 99 : index;
}

function inferIndustry(profile, metadata = {}, techStack = []) {
  // Industry comes from website evidence (metadata/tech) + a visitor-stated industry hint only —
  // NOT from business_need prose, which fabricates an industry from a single keyword like "sales".
  const text = `${profile.company.industry_hint || ""} ${metadata.title || ""} ${
    metadata.description || ""
  } ${techStack.map((item) => item.value).join(" ")}`.toLowerCase();

  if (/fintech|bank|payment|lending|finance|wealth|accounting/.test(text)) return "Fintech";
  if (/health|clinic|patient|medical|care/.test(text)) return "Healthcare";
  if (/saas|software|platform|api|cloud|crm|sales/.test(text)) return "B2B SaaS";
  if (/agency|marketing|creative|advertising/.test(text)) return "Agency";
  if (/manufacturing|industrial|logistics|supply chain/.test(text)) return "Industrial";
  return profile.company.industry_hint || "unknown";
}

function mergeTechStacks(visitorStack = [], detectedStack = []) {
  return dedupeByValue([
    ...visitorStack.map((value) => ({
      value,
      category: value === "HubSpot" || value === "Salesforce" ? "CRM" : "Visitor-provided",
      source: "visitor",
      confidence: 0.95
    })),
    ...detectedStack
  ]);
}

function dedupeByValue(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function calculateConfidence({
  metadata,
  techStack,
  profile,
  signals = [],
  inspectedPages = [],
  fundingEvents = [],
  buyerProfile = null,
  firmographics = {},
  publicBuyerRoles = [],
  researchEvidence = [],
  conversionSurface = emptyConversionSurface()
}) {
  let confidence = 0.35;
  if (metadata.title) confidence += 0.14;
  if (metadata.description) confidence += 0.14;
  if (techStack.length) confidence += 0.16;
  if (profile.company.size_hint) confidence += 0.12;
  if (firmographics.company_size?.value) confidence += 0.08;
  if (profile.qualification.sales_stack.length) confidence += 0.09;
  if (signals.length) confidence += 0.08;
  if (inspectedPages.some((page) => !page.error)) confidence += 0.04;
  if (fundingEvents.length) confidence += 0.03;
  if (publicBuyerRoles.length) confidence += 0.05;
  if (researchEvidence.length) confidence += 0.03;
  if (conversionSurface.status === "detected") confidence += 0.04;
  if (buyerProfile?.buying_committee?.length) confidence += 0.03;
  if (buyerProfile?.buying_triggers?.length) confidence += 0.03;
  return Math.min(0.9, Number(confidence.toFixed(2)));
}

function dedupeSignals(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.category}:${item.value}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function internalCost(inspectedPageCount) {
  return {
    paid_provider_used: false,
    estimated_usd: 0,
    billable_requests: 0,
    internal_requests: 1 + inspectedPageCount,
    note: "No paid enrichment provider was called."
  };
}

function decodeHtml(value) {
  if (!value) return null;
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/\s+/g, " ")
    .trim();
}
