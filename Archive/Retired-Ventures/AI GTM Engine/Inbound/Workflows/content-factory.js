export const meta = {
  name: 'dt-inbound-content-factory',
  description: 'Generate a week of graded, on-voice DealThreads dead-form LinkedIn posts + short-form scripts + comment targets + the weekly newsletter',
  whenToUse: 'Run weekly (e.g. Sunday) to produce the 5 weekday posts + The Buyer Profile Brief newsletter for the dead-form inbound machine. Human reviews/edits, then posts manually.',
  phases: [
    { title: 'Draft', detail: 'one LinkedIn post per pillar/day in Ryan voice' },
    { title: 'Grade', detail: 'score vs Content Grader, rewrite to 8.5+, strip AI tells' },
    { title: 'Assemble', detail: 'newsletter + write the week calendar file' },
  ],
}

// ---- canonical source-of-truth docs (agents read these at runtime) ----
const ROOT = '/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine'
const BLUEPRINT = `${ROOT}/Inbound/Deal Threads Inbound Machine Blueprint.md`
const WEEK1 = `${ROOT}/Inbound/Deal Threads Week 1 Execution Pack.md`
const GRADER = `${ROOT}/Inbound/Content Grader.md`
const PERSONA = `${ROOT}/Product/Deal Threads User Persona System.md`
const COMMAND = `${ROOT}/00 - Deal Threads Inbound Command Center.md`
const OUT = `${ROOT}/Inbound/Outputs`

// normalize args — the Workflow runtime may deliver args as a JSON string, not an object
const IN = (typeof args === 'string') ? (() => { try { return JSON.parse(args) } catch (e) { return {} } })() : (args || {})
// weekOf must be passed in (scripts cannot call Date.now()); default label otherwise
const weekOf = IN.weekOf || 'this-week'
const extraTheme = IN.theme ? String(IN.theme) : ''

// The blueprint's weekly publishing rhythm, mapped to the 5 content pillars.
const DAYS = [
  { day: 'Monday', slot: 'Problem', pillar: 'Dead Form Diagnosis', ctaStyle: 'soft awareness CTA or none; optionally offer the Dead Form Audit in a comment' },
  { day: 'Tuesday', slot: 'Framework', pillar: 'Buyer Profile Education', ctaStyle: 'offer the buyer-profile checklist / Dead Form Audit' },
  { day: 'Wednesday', slot: 'Teardown / Proof', pillar: 'Teardown Proof (raw form vs buyer profile, before/after)', ctaStyle: 'direct: "send me your form URL and I will show what it captures vs what sales still researches"' },
  { day: 'Thursday', slot: 'Trust', pillar: 'Implementation Trust (CRM, accuracy, unknown-safe, install)', ctaStyle: 'soft; optional technical walkthrough offer' },
  { day: 'Friday', slot: 'Invitation', pillar: 'Founder-Led Build Notes + weekly teardown invitation', ctaStyle: 'invite: "I am doing 5 free Dead Form Teardowns next week — send your form URL"' },
]

const VOICE = `Ryan's voice: casual, useful, lightly funny, non-guru. Short paragraphs. One clear idea. Real example/workflow/screenshot beats abstraction. No throat-clearing, no corporate/guru language, no fake results, no "AI magic" hype. Lead with the dead-form wedge language: dead form, buyer profile, form fill vs buyer profile, rep-ready, before the callback, sales homework. Avoid leading with chatbot / AI SDR / visitor ID / generic enrichment. Honesty rule: never invent proof or results; mark hypotheses as hypotheses. Keep each post under 220 words.`

const POST_SCHEMA = {
  type: 'object',
  properties: {
    day: { type: 'string' },
    pillar: { type: 'string' },
    hook: { type: 'string', description: 'the first 1-2 lines, the scroll-stopper' },
    post: { type: 'string', description: 'full LinkedIn post, under 220 words' },
    cta: { type: 'string', description: 'the single soft CTA used, or "none"' },
    shortFormScript: { type: 'string', description: '20-40s short-form video / Loom script of the same idea' },
    commentTargets: { type: 'array', items: { type: 'string' }, description: '4-6 specific kinds of ICP posts to go comment on that day' },
  },
  required: ['day', 'pillar', 'hook', 'post', 'cta', 'shortFormScript', 'commentTargets'],
}

const GRADED_SCHEMA = {
  type: 'object',
  properties: {
    day: { type: 'string' },
    pillar: { type: 'string' },
    hook: { type: 'string' },
    finalPost: { type: 'string', description: 'the rewritten, humanized post scoring 8.5+, under 220 words' },
    grade: { type: 'number', description: 'overall 1-10 after rewrite' },
    scores: {
      type: 'object',
      properties: {
        hook: { type: 'number' }, clarity: { type: 'number' }, specificity: { type: 'number' },
        voice: { type: 'number' }, usefulness: { type: 'number' }, trust: { type: 'number' }, cta: { type: 'number' },
      },
      required: ['hook', 'clarity', 'specificity', 'voice', 'usefulness', 'trust', 'cta'],
    },
    cta: { type: 'string' },
    shortFormScript: { type: 'string' },
    commentTargets: { type: 'array', items: { type: 'string' } },
    aiTellsRemoved: { type: 'array', items: { type: 'string' }, description: 'AI tells / clichés that were stripped' },
  },
  required: ['day', 'pillar', 'hook', 'finalPost', 'grade', 'scores', 'cta', 'shortFormScript', 'commentTargets'],
}

log(`Content Factory — week of ${weekOf}. Drafting 5 posts across the 5 pillars.`)

const results = await pipeline(
  DAYS,
  // Stage 1 — DRAFT
  (d) => agent(
    `You are drafting one LinkedIn post for the DealThreads dead-form inbound machine.\n\n` +
    `READ for context and voice (use the Read tool):\n- ${BLUEPRINT}\n- ${WEEK1}\n- ${PERSONA}\n\n` +
    `TODAY: ${d.day} — "${d.slot}". Content pillar: ${d.pillar}. CTA style: ${d.ctaStyle}.\n` +
    (extraTheme ? `Weave in this week's theme where natural: ${extraTheme}.\n` : '') +
    `\n${VOICE}\n\n` +
    `Write ONE post that makes an ICP reader think one of: "our form probably does this too" / "sales really is researching too much after submit" / "a buyer profile would make our follow-up better" / "I want to see this on our site." ` +
    `Match the structure and rhythm of the example posts in the Week 1 pack but write a NEW post — do not copy them. Then write a 20-40s short-form script of the same idea, and list 4-6 specific kinds of ICP posts to comment on that day.`,
    { label: `draft:${d.day}`, phase: 'Draft', schema: POST_SCHEMA }
  ),
  // Stage 2 — GRADE + HUMANIZE
  (draft, d) => agent(
    `You are the DealThreads content editor. Grade and rewrite this draft.\n\n` +
    `READ the rubric (Read tool): ${GRADER}\n\n` +
    `DRAFT (${d.day} — ${d.pillar}):\n"""${draft && draft.post}"""\n\n` +
    `1) Score it 1-10 on each: Hook, Clarity, Specificity, Ryan Voice, Usefulness, Trust, CTA.\n` +
    `2) Rewrite it to score 8.5+ overall while staying under 220 words and keeping ${"Ryan's"} casual non-guru voice.\n` +
    `3) Strip AI tells: em-dash overuse, "in today's fast-paced", "unlock/leverage/elevate/delve/landscape", tri-colon listicles, fake balance ("it's not just X, it's Y"), hollow CTAs. List what you removed.\n` +
    `4) Keep exactly ONE soft CTA (or none) appropriate to the day. The CTA must match the dead-form offer (Dead Form Audit / send your form URL / free teardown) — never a generic "DM me" or "book a call".\n` +
    `Return the final humanized post and the scores.`,
    { label: `grade:${d.day}`, phase: 'Grade', schema: GRADED_SCHEMA }
  ),
)

const clean = results.filter(Boolean)
const avgGrade = clean.length ? Math.round((clean.reduce((s, r) => s + (r.grade || 0), 0) / clean.length) * 10) / 10 : 0
const below = clean.filter((r) => (r.grade || 0) < 8.5).map((r) => r.day)
log(`Drafted+graded ${clean.length}/5. Avg grade ${avgGrade}. ${below.length ? 'Below 8.5: ' + below.join(', ') : 'All >= 8.5.'}`)

phase('Assemble')
const ASSEMBLE_SCHEMA = {
  type: 'object',
  properties: {
    outputPath: { type: 'string' },
    newsletterSubject: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['outputPath', 'newsletterSubject', 'summary'],
}

const assembled = await agent(
  `You are assembling the DealThreads weekly content calendar and newsletter, then WRITING it to disk.\n\n` +
  `READ for newsletter format + voice (Read tool): ${WEEK1} (see "Friday Newsletter") and ${BLUEPRINT} (Channel 3: Email Newsletter — "The Buyer Profile Brief").\n\n` +
  `Here are the 5 graded posts for the week (JSON):\n${JSON.stringify(clean)}\n\n` +
  `Average grade: ${avgGrade}. Week label: ${weekOf}.\n\n` +
  `Do BOTH:\n` +
  `1) Write "The Buyer Profile Brief" newsletter for this week (subject + body), synthesizing the week's themes. One dead-form observation, one buyer-profile field to add, one before/after example, one practical fix, CTA to submit a form URL. Keep it tight and in Ryan voice.\n` +
  `2) Use the Write tool to create the file:\n   "${OUT}/Content Calendar - Week of ${weekOf}.md"\n` +
  `Structure the file as:\n` +
  `# DealThreads Inbound Content — Week of ${weekOf}\n` +
  `(line: generated by dt-inbound-content-factory · avg grade ${avgGrade} · review + post manually)\n` +
  `Then a "## How to use this week" 3-line note (post 1/day, 8.5+ bar met, comment on the listed targets, soft CTA only).\n` +
  `Then for EACH day a section: ## <Day> — <Pillar> (grade X/10), the final post in a fenced block, the short-form script in a fenced block, the comment targets as a list, and the CTA. Flag any post below 8.5 with "⚠️ below bar — edit before posting".\n` +
  `Then "## The Buyer Profile Brief (newsletter)" with subject + body in a fenced block.\n` +
  `Then "## This week's comment search terms" pulled from the Week 1 pack.\n` +
  `Return the outputPath you wrote, the newsletterSubject, and a one-line summary.`,
  { label: 'assemble', phase: 'Assemble', schema: ASSEMBLE_SCHEMA }
)

log(`Wrote ${assembled && assembled.outputPath}`)
return {
  weekOf,
  postsGenerated: clean.length,
  avgGrade,
  belowBar: below,
  newsletterSubject: assembled && assembled.newsletterSubject,
  outputPath: assembled && assembled.outputPath,
}
