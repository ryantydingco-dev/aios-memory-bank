export const meta = {
  name: 'dt-teardown-engine',
  description: 'Turn a form URL (or a generic form archetype) into a full Dead Form Teardown: before/after buyer profile, Loom script, carousel, DM follow-up, install path, qualification verdict, and a publishable proof post',
  whenToUse: 'Run on (a) a real prospect form URL someone sent ["inbound" mode] to produce the teardown deliverable + sales asset, or (b) generic form archetypes ["proof" mode] to manufacture anonymized before/after proof content.',
  phases: [
    { title: 'Capture', detail: 'fetch the form / load the archetype fields' },
    { title: 'Research', detail: 'company context, ICP fit, deal-size + CRM hints (carries capture forward)' },
    { title: 'Teardown', detail: 'build + write the 7-part teardown deliverable' },
    { title: 'Package', detail: 'grade + produce the publishable anonymized proof post' },
  ],
}

const ROOT = '/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine'
const BLUEPRINT = `${ROOT}/Inbound/Deal Threads Inbound Machine Blueprint.md`
const WEEK1 = `${ROOT}/Inbound/Deal Threads Week 1 Execution Pack.md`
const PERSONA = `${ROOT}/Product/Deal Threads User Persona System.md`
const SALESKIT = `${ROOT}/DealThreads Sales Kit.md`
const FIELDMAP = `${ROOT}/Product/Deal Threads Lead Profile Schema and HubSpot Field Map.md`
const OUT = `${ROOT}/Inbound/Outputs/Teardowns`

// normalize args — the Workflow runtime may deliver args as a JSON string, not an object
const IN = (typeof args === 'string') ? (() => { try { return JSON.parse(args) } catch (e) { return {} } })() : (args || {})
const weekOf = IN.weekOf || 'this-week'
// targets: [{ company, formUrl?, archetype?, crm?, dealSize?, notes?, mode? }]
const targets = (Array.isArray(IN.targets) && IN.targets.length)
  ? IN.targets
  : [
      { company: 'Archetype — B2B SaaS "Request a Demo" form', archetype: 'b2b-saas-demo', mode: 'proof' },
      { company: 'Archetype — B2B agency "Contact Us" form', archetype: 'agency-contact', mode: 'proof' },
      { company: 'Archetype — Dev-tool "Talk to Sales" form', archetype: 'devtool-talk-to-sales', mode: 'proof' },
    ]

const HONESTY = `HONESTY RULES (non-negotiable): only state form fields you actually verified by fetching the page, or — in proof/archetype mode — clearly frame them as a TYPICAL field set for that archetype, not a claim about a specific company. Never invent a company's real form contents. If a fetch fails or the form is JS-rendered/ungettable, say so and fall back to documented typical fields, labelled "unverified — typical pattern". Mark every inferred fact as inferred. Unknown stays unknown.`

const CAPTURE_SCHEMA = {
  type: 'object',
  properties: {
    company: { type: 'string' },
    mode: { type: 'string', enum: ['inbound', 'proof'] },
    formUrl: { type: 'string' },
    fetchStatus: { type: 'string', enum: ['fetched', 'partial', 'failed', 'archetype'] },
    fieldsCaptured: { type: 'array', items: { type: 'string' } },
    cta: { type: 'string' },
    frictionLevel: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['company', 'mode', 'fetchStatus', 'fieldsCaptured', 'cta', 'frictionLevel'],
}

// stage-2 carries the capture forward so stage 3 has the full picture
const RESEARCH_SCHEMA = {
  type: 'object',
  properties: {
    company: { type: 'string' },
    capture: CAPTURE_SCHEMA,
    companyContext: { type: 'string', description: 'size/industry/what they sell — verified vs inferred labelled' },
    icpFit: { type: 'string', enum: ['high', 'medium', 'low', 'unknown'] },
    icpReason: { type: 'string' },
    dealSizeHint: { type: 'string' },
    crmHint: { type: 'string' },
    trigger: { type: 'string', description: 'any recent buying trigger, or "none found"' },
  },
  required: ['company', 'capture', 'companyContext', 'icpFit', 'icpReason', 'dealSizeHint', 'crmHint', 'trigger'],
}

const TEARDOWN_SCHEMA = {
  type: 'object',
  properties: {
    company: { type: 'string' },
    teardownPath: { type: 'string' },
    qualification: { type: 'string', enum: ['high-fit', 'maybe', 'disqualified'] },
    qualificationReason: { type: 'string' },
    biggestGap: { type: 'string' },
    missingFields: { type: 'array', items: { type: 'string' } },
  },
  required: ['company', 'teardownPath', 'qualification', 'qualificationReason', 'biggestGap', 'missingFields'],
}

const PACKAGE_SCHEMA = {
  type: 'object',
  properties: {
    company: { type: 'string' },
    grade: { type: 'number' },
    proofPost: { type: 'string' },
    loomHook: { type: 'string' },
    // carried forward from the teardown stage so the manifest stays complete
    qualification: { type: 'string', enum: ['high-fit', 'maybe', 'disqualified'] },
    biggestGap: { type: 'string' },
    teardownPath: { type: 'string' },
  },
  required: ['company', 'grade', 'proofPost', 'loomHook', 'qualification', 'teardownPath'],
}

log(`Teardown Engine — ${targets.length} target(s). Modes: ${targets.map((t) => t.mode || 'inbound').join(', ')}.`)

const results = await pipeline(
  targets,
  // Stage 1 — CAPTURE
  (t) => agent(
    `You are capturing what a B2B form actually asks for, for a Dead Form Teardown.\n\n` +
    `TARGET: ${JSON.stringify(t)}\n\n` +
    `If mode is "inbound" and a formUrl is present: use WebFetch on the formUrl (and the company's /demo, /contact, or /request-a-demo page) to read the ACTUAL visible form fields, the submit CTA, and any qualification questions. If JS-rendered/unreadable, set fetchStatus="failed" and use the typical field set, labelled unverified.\n` +
    `If mode is "proof"/archetype: set fetchStatus="archetype" and use a realistic TYPICAL field set for that archetype (e.g. b2b-saas-demo usually = first name, last name, work email, company, company-size dropdown, "how can we help?" box, submit "Request a demo"). Frame as a representative pattern, not a real company.\n\n` +
    `${HONESTY}\n\nReturn the captured fields, CTA, and a friction read (low/medium/high + one-line why).`,
    { label: `capture:${String(t.company).slice(0, 45)}`, phase: 'Capture', schema: CAPTURE_SCHEMA }
  ),
  // Stage 2 — RESEARCH (echoes capture under .capture)
  (cap, t) => agent(
    `You research the buyer context a rep must dig up AFTER this form is submitted. Then echo the capture forward.\n\n` +
    `CAPTURED FORM (echo this verbatim into the "capture" field of your output): ${JSON.stringify(cap)}\nTARGET META: ${JSON.stringify(t)}\n\n` +
    `If mode is "inbound" with a real company: use WebSearch for company size, industry, what they sell, likely deal value, and CRM/tech hints (careers pages mentioning HubSpot/Salesforce, etc.). Label verified vs inferred.\n` +
    `If "proof"/archetype: describe the typical buyer context for that archetype instead.\n\n` +
    `Judge ICP fit vs the DealThreads target (B2B, real demo/contact form, higher-value deals, founder/RevOps/demand-gen/sales buyer, CRM in place or close, manual post-submit research). ${HONESTY}`,
    { label: `research:${String(t.company).slice(0, 45)}`, phase: 'Research', schema: RESEARCH_SCHEMA }
  ),
  // Stage 3 — TEARDOWN (writes the deliverable file)
  (res, t) => agent(
    `You build a Dead Form Teardown deliverable and WRITE it to disk.\n\n` +
    `READ for the exact template + voice (Read tool):\n- ${WEEK1} ("15-Minute Teardown Template", "Loom Script", "Delivering A Teardown", DM library)\n- ${BLUEPRINT} ("Teardown Delivery Format" — the 7-part structure)\n- ${PERSONA} and ${FIELDMAP} for what a rep-ready buyer profile + HubSpot fields look like\n\n` +
    `INPUT (capture + research): ${JSON.stringify(res)}\nTARGET: ${JSON.stringify(t)}\n\n` +
    `Build the teardown following the 7-part structure exactly: (1) what the form captures now, (2) what sales still has to research, (3) the rep-ready buyer profile the CRM should receive, (4) the 3 questions I would ask differently, (5) the enrichment fields I would add behind the scenes, (6) the simplest install path, (7) the CTA ("Want this live on your form?"). ` +
    `Then add: a 60-90s Loom script, a before/after carousel (raw form vs buyer profile), a DM follow-up drafted from the Week 1 DM library, and a qualification verdict using the Form URL Qualification Checklist.\n\n` +
    `Use the Write tool to create exactly this file:\n  "${OUT}/${String(t.company || 'target').replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 50)} - Teardown ${weekOf}.md"\n` +
    `Title it; note mode (${t.mode || 'inbound'}); label anything inferred. ${HONESTY}\n\n` +
    `Return the teardownPath (exactly the path you wrote), qualification verdict, the single biggest gap, and the missing fields.`,
    { label: `teardown:${String(t.company).slice(0, 45)}`, phase: 'Teardown', schema: TEARDOWN_SCHEMA }
  ),
  // Stage 4 — PACKAGE (reads the file, grades, writes publishable proof post)
  (td, t) => agent(
    `You package a Dead Form Teardown into a publishable proof asset.\n\n` +
    `READ the teardown you are packaging (Read tool): ${td && td.teardownPath}\n` +
    `READ for proof style: ${BLUEPRINT} (Proof Engine) and ${WEEK1} (Wednesday teardown post).\n\n` +
    `1) Grade 1-10: would this teardown convince an ICP buyer their form is creating sales homework?\n` +
    `2) Write an anonymized, publishable LinkedIn proof post (Wednesday/teardown slot) showing before/after WITHOUT naming the company — raw form submission vs the buyer profile sales actually needs. End with the soft teardown CTA. Ryan voice, under 220 words.\n` +
    `3) Give the first-10-seconds Loom hook.\n` +
    `4) Carry forward verbatim from this input: qualification="${td && td.qualification}", biggestGap, teardownPath="${td && td.teardownPath}".`,
    { label: `package:${String(t.company).slice(0, 45)}`, phase: 'Package', schema: PACKAGE_SCHEMA }
  ),
)

const clean = results.filter(Boolean)
const highFit = clean.filter((r) => r && r.qualification === 'high-fit').length
log(`Teardowns complete: ${clean.length}. High-fit: ${highFit}.`)

return {
  weekOf,
  teardowns: clean.length,
  highFit,
  results: clean.map((r) => ({ company: r.company, qualification: r.qualification, grade: r.grade, biggestGap: r.biggestGap, path: r.teardownPath, proofPost: r.proofPost, loomHook: r.loomHook })),
}
