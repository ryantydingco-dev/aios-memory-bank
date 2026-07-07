export const meta = {
  name: 'dt-teardown-prospecting',
  description: 'Outbound→inbound bridge + volume engine: take an AI Ark account list, find each company\'s form, quick dead-form score, then draft a personalized "I made you a free teardown" hook (DM + email). Ranks by fit × form-weakness.',
  whenToUse: 'Feed an AI Ark export (accounts with company + domain). Produces a ranked teardown-hook queue. This is how you scale form-URL asks without waiting for inbound. Ryan/Sway send manually (LinkedIn) or via Smartlead (email) after verifying sender.',
  phases: [
    { title: 'FindForm', detail: 'locate + read each company\'s demo/contact form' },
    { title: 'Score', detail: 'dead-form score + ICP fit + deal-size hint' },
    { title: 'Hook', detail: 'personalized teardown-offer DM + email' },
    { title: 'Rank', detail: 'rank by fit × weakness, write the queue' },
  ],
}

const ROOT = '/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine'
const BLUEPRINT = `${ROOT}/Inbound/Deal Threads Inbound Machine Blueprint.md`
const WEEK1 = `${ROOT}/Inbound/Deal Threads Week 1 Execution Pack.md`
const AUDIT = `${ROOT}/Conversion/Deal Threads Dead Form Audit Lead Magnet.md`
const SALESKIT = `${ROOT}/DealThreads Sales Kit.md`
const LEADSCORE = `${ROOT}/DealThreads Lead Scoring.md`
const OUT = `${ROOT}/Inbound/Outputs/Prospecting`

// normalize args — the Workflow runtime may deliver args as a JSON string, not an object
const IN = (typeof args === 'string') ? (() => { try { return JSON.parse(args) } catch (e) { return {} } })() : (args || {})
const weekOf = IN.weekOf || 'this-week'
// accounts: [{ company, domain, owner?, title?, linkedin?, email?, notes? }] — typically an AI Ark export
const accounts = Array.isArray(IN.accounts) ? IN.accounts : []

const HONESTY = `HONESTY RULES: only cite a form weakness you actually verified by fetching the company's form/page. If you cannot fetch it, set formStatus="not-found" and write a softer hook that asks for the form URL instead of asserting a specific weakness. Never fabricate a company's form contents or a fake compliment. No invented stats.`

if (!accounts.length) {
  log('No accounts supplied. Pass args.accounts (an AI Ark export: company + domain + optional owner/title/linkedin/email). Nothing to prospect.')
  return { error: 'no accounts supplied', expected: 'args.accounts = [{company, domain, owner?, title?, linkedin?, email?}]' }
}

const FINDFORM_SCHEMA = {
  type: 'object',
  properties: {
    company: { type: 'string' },
    domain: { type: 'string' },
    formUrl: { type: 'string' },
    formStatus: { type: 'string', enum: ['found', 'partial', 'not-found'] },
    fieldsCaptured: { type: 'array', items: { type: 'string' } },
    cta: { type: 'string' },
  },
  required: ['company', 'domain', 'formStatus', 'fieldsCaptured', 'cta'],
}

const SCORE_SCHEMA = {
  type: 'object',
  properties: {
    company: { type: 'string' },
    domain: { type: 'string' },
    formUrl: { type: 'string' },
    formStatus: { type: 'string' },
    fieldsCaptured: { type: 'array', items: { type: 'string' } },
    deadFormScore: { type: 'number', description: '0-10: how much sales homework the form creates (10 = worst / most homework / best opportunity)' },
    icpFit: { type: 'string', enum: ['high', 'medium', 'low'] },
    icpReason: { type: 'string' },
    dealSizeHint: { type: 'string' },
    biggestWeakness: { type: 'string', description: 'the one missing-context gap to lead the hook with' },
  },
  required: ['company', 'domain', 'deadFormScore', 'icpFit', 'icpReason', 'biggestWeakness', 'formStatus'],
}

const HOOK_SCHEMA = {
  type: 'object',
  properties: {
    company: { type: 'string' },
    domain: { type: 'string' },
    owner: { type: 'string' },
    deadFormScore: { type: 'number' },
    icpFit: { type: 'string' },
    biggestWeakness: { type: 'string' },
    teaser: { type: 'string', description: 'one-line hook' },
    dmDraft: { type: 'string', description: 'LinkedIn DM offering the free teardown, referencing the specific weakness' },
    emailDraft: { type: 'string', description: 'cold email variant, subject + body' },
    suggestedChannel: { type: 'string', enum: ['linkedin', 'email'] },
  },
  required: ['company', 'domain', 'deadFormScore', 'icpFit', 'biggestWeakness', 'teaser', 'dmDraft', 'emailDraft', 'suggestedChannel'],
}

log(`Teardown Prospecting — ${accounts.length} account(s) from AI Ark.`)

const results = await pipeline(
  accounts,
  // Stage 1 — FIND FORM
  (a) => agent(
    `Find and read the demo/contact/"talk to sales" form for this company.\n\n` +
    `ACCOUNT: ${JSON.stringify(a)}\n\n` +
    `Use WebFetch/WebSearch: try ${a.domain ? a.domain : 'the company site'} + /demo, /request-a-demo, /contact, /contact-sales, /get-started. Read the ACTUAL visible form fields and the submit CTA. ${HONESTY}\n` +
    `Return the form URL, status, fields, and CTA.`,
    { label: `form:${String(a.company || a.domain).slice(0, 40)}`, phase: 'FindForm', schema: FINDFORM_SCHEMA }
  ),
  // Stage 2 — SCORE
  (f, a) => agent(
    `Score this form for the dead-form opportunity and ICP fit.\n\n` +
    `READ (Read tool): ${AUDIT} (the Dead Form Audit scorecard) and ${LEADSCORE} (ICP/fit).\n\n` +
    `FORM (JSON): ${JSON.stringify(f)}\nACCOUNT: ${JSON.stringify(a)}\n\n` +
    `Give deadFormScore 0-10 (10 = the form creates the most sales homework = best teardown opportunity), ICP fit (B2B, real form, higher-value deals, founder/RevOps/sales buyer, CRM likely), a deal-size hint, and the single biggest missing-context weakness to lead a hook with. ${HONESTY}`,
    { label: `score:${String(a.company || a.domain).slice(0, 40)}`, phase: 'Score', schema: SCORE_SCHEMA }
  ),
  // Stage 3 — HOOK
  (s, a) => agent(
    `Draft a personalized "I made you a free Dead Form Teardown" outreach.\n\n` +
    `READ for offer + DM/email voice (Read tool): ${WEEK1} (DM library) and ${SALESKIT} and ${BLUEPRINT} (positioning, soft CTAs).\n\n` +
    `SCORED ACCOUNT (JSON): ${JSON.stringify(s)}\nCONTACT: owner=${a.owner || '?'} title=${a.title || '?'} linkedin=${a.linkedin || '?'} email=${a.email || '?'}\n\n` +
    `Write: (1) a one-line teaser, (2) a LinkedIn DM (warm, specific to the biggest weakness, offering the free teardown, asking nothing but a yes — no link, no pitch), (3) a cold email variant (subject + body, same offer, slightly more context). If formStatus="not-found", make the hook ask for the form URL instead of asserting a weakness. Suggest the better channel based on whether we have linkedin vs email. Keep it human and non-guru. ${HONESTY}`,
    { label: `hook:${String(a.company || a.domain).slice(0, 40)}`, phase: 'Hook', schema: HOOK_SCHEMA }
  ),
)

const clean = results.filter(Boolean)
// rank by ICP fit weight × dead-form score (form weakness = opportunity)
const fitW = { high: 3, medium: 2, low: 1 }
clean.sort((x, y) => ((fitW[y.icpFit] || 1) * (y.deadFormScore || 0)) - ((fitW[x.icpFit] || 1) * (x.deadFormScore || 0)))
const highValue = clean.filter((r) => r.icpFit === 'high' && (r.deadFormScore || 0) >= 6).length
log(`Scored+drafted ${clean.length}. High-value (high fit × weak form): ${highValue}.`)

phase('Rank')
const RANK_SCHEMA = { type: 'object', properties: { outputPath: { type: 'string' }, count: { type: 'number' } }, required: ['outputPath', 'count'] }
const ranked = await agent(
  `Write the ranked DealThreads teardown-prospect queue to disk (Write tool).\n\n` +
  `FILE: "${OUT}/Teardown Prospect Queue - ${weekOf}.md"\n\n` +
  `RANKED ACCOUNTS (already sorted best-first, JSON): ${JSON.stringify(clean)}\n\n` +
  `Structure:\n# DealThreads Teardown Prospect Queue — ${weekOf}\n(line: ${clean.length} accounts, ranked by ICP fit × form-weakness. Send manually / via Smartlead after verifying sender. Human-in-the-loop.)\n` +
  `## How to work this queue (3 lines: start top, send the suggested channel, log replies in the outcome tracker, push form-URL replies into the Teardown Engine).\n` +
  `Then a markdown table: Rank | Company | Owner | ICP fit | DeadFormScore | Biggest weakness | Channel.\n` +
  `Then for each account a section: ### <rank>. <company> (<icpFit> · score <n>) with the teaser, the DM draft in a fenced block, and the email draft in a fenced block.\n` +
  `Return outputPath and count.`,
  { label: 'write-queue', phase: 'Rank', schema: RANK_SCHEMA }
)

log(`Wrote ${ranked && ranked.outputPath}`)
return {
  weekOf,
  accountsProcessed: clean.length,
  highValue,
  top: clean.slice(0, 5).map((r) => ({ company: r.company, icpFit: r.icpFit, deadFormScore: r.deadFormScore, weakness: r.biggestWeakness, channel: r.suggestedChannel })),
  outputPath: ranked && ranked.outputPath,
}
