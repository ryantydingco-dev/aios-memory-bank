export const meta = {
  name: 'dt-inbound-weekly-review',
  description: 'Weekly learning loop for the dead-form inbound machine: pull activity vs targets, find what drove form URLs, recommend next week\'s theme + adjustments, capture buyer language. Never invents outcomes.',
  whenToUse: 'Run Friday/Sunday after a week of execution. Reads the scoreboard + the week\'s generated Outputs. Best once real activity is logged — before that it reports the gaps honestly.',
  phases: [
    { title: 'Facts', detail: 'deterministic activity vs weekly targets' },
    { title: 'Synthesize', detail: 'what worked, objections, buyer language, next theme' },
    { title: 'Write', detail: 'write the weekly review file' },
  ],
}

const ROOT = '/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine'
const BLUEPRINT = `${ROOT}/Inbound/Deal Threads Inbound Machine Blueprint.md`
const COMMAND = `${ROOT}/00 - Deal Threads Inbound Command Center.md`
const SCOREBOARD = `${ROOT}/Experiments/Deal Threads Inbound Scoreboard.md`
const OUT = `${ROOT}/Inbound/Outputs`

// normalize args — the Workflow runtime may deliver args as a JSON string, not an object
const IN = (typeof args === 'string') ? (() => { try { return JSON.parse(args) } catch (e) { return {} } })() : (args || {})
const weekOf = IN.weekOf || 'this-week'
const scoreboardPath = IN.scoreboardPath || SCOREBOARD
const activity = IN.activity ? IN.activity : null // optional {posts, comments, dms, audits, formUrls, teardowns, calls}

const FACTS_SCHEMA = {
  type: 'object',
  properties: {
    weekOf: { type: 'string' },
    targets: { type: 'object', description: 'the weekly scorecard targets from the Command Center', additionalProperties: true },
    actuals: { type: 'object', description: 'what actually happened (from scoreboard/activity), or "unknown" per metric', additionalProperties: true },
    gaps: { type: 'array', items: { type: 'string' }, description: 'metrics below target or unknown' },
    outputsThisWeek: { type: 'array', items: { type: 'string' }, description: 'generated assets found in the Outputs folder' },
    hasRealOutcomes: { type: 'boolean', description: 'true only if real form URLs / calls were logged' },
  },
  required: ['weekOf', 'targets', 'actuals', 'gaps', 'hasRealOutcomes'],
}

const SYNTH_SCHEMA = {
  type: 'object',
  properties: {
    whatWorked: { type: 'array', items: { type: 'string' } },
    whatDidnt: { type: 'array', items: { type: 'string' } },
    bestPillar: { type: 'string' },
    bestCta: { type: 'string' },
    strongestObjection: { type: 'string' },
    buyerLanguage: { type: 'array', items: { type: 'string' }, description: 'real buyer phrases to add to copy — only if observed, else empty' },
    nextWeekTheme: { type: 'string' },
    adjustments: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    honestyNote: { type: 'string', description: 'if outcomes are not yet logged, say so plainly' },
  },
  required: ['whatWorked', 'whatDidnt', 'nextWeekTheme', 'adjustments', 'honestyNote'],
}

phase('Facts')
const facts = await agent(
  `Pull deterministic facts for the DealThreads inbound weekly review. Do NOT invent numbers.\n\n` +
  `READ (Read tool):\n- ${COMMAND} ("This Week's Goal" + the weekly scorecard targets)\n- ${scoreboardPath} (actuals, if logged)\n- ${BLUEPRINT} (Section 11 weekly scorecard)\n` +
  `Also list the files in "${OUT}" (use Glob/Bash ls) that belong to ${weekOf} — content calendars, teardowns, queues — as the week's produced assets.\n\n` +
  (activity ? `Caller also supplied activity (treat as authoritative actuals): ${JSON.stringify(activity)}\n\n` : '') +
  `Compare targets vs actuals. For any metric with no logged data, set it to "unknown" (do NOT guess). Set hasRealOutcomes=true ONLY if real form URLs submitted or calls booked were actually logged.`,
  { label: 'pull-facts', phase: 'Facts', schema: FACTS_SCHEMA }
)

phase('Synthesize')
const synth = await agent(
  `Synthesize the week and recommend next week. Be honest — if there are no real outcomes yet, say the learning is provisional.\n\n` +
  `READ: ${BLUEPRINT} (Section 11 "Weekly Review Questions").\n\n` +
  `FACTS (JSON): ${JSON.stringify(facts)}\n\n` +
  `Answer the blueprint's weekly review questions where data exists. Identify the best-performing pillar/CTA ONLY if engagement data supports it (else say "insufficient data"). Capture real buyer language only if observed. Recommend next week's single theme + 1-3 concrete adjustments. If outcomes are not yet logged, the honestyNote must say the loop is running on activity only, not results.`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA }
)

phase('Write')
const WRITE_SCHEMA = { type: 'object', properties: { outputPath: { type: 'string' } }, required: ['outputPath'] }
const written = await agent(
  `Write the DealThreads weekly inbound review to disk (Write tool).\n\n` +
  `FILE: "${OUT}/Weekly Inbound Review - ${weekOf}.md"\n\n` +
  `FACTS (JSON): ${JSON.stringify(facts)}\nSYNTHESIS (JSON): ${JSON.stringify(synth)}\n\n` +
  `Structure:\n# DealThreads Weekly Inbound Review — ${weekOf}\n(line: generated by dt-inbound-weekly-review · ${facts && facts.hasRealOutcomes ? 'real outcomes' : 'activity-only — outcomes not yet logged'})\n` +
  `## Scorecard — a table of Metric | Target | Actual | Status (✅/⚠️/unknown).\n` +
  `## What worked / What didn't — bullets.\n` +
  `## Answers to the weekly review questions — best post, best CTA, strongest persona, repeated objection, most convincing teardown moment, repurposable proof, buyer language to add.\n` +
  `## Next week — the theme + 1-3 adjustments.\n` +
  `## Honesty note — ${synth && synth.honestyNote ? 'include it' : 'state data limitations'}.\n` +
  `Return the outputPath.`,
  { label: 'write-review', phase: 'Write', schema: WRITE_SCHEMA }
)

log(`Wrote ${written && written.outputPath}`)
return { weekOf, hasRealOutcomes: facts && facts.hasRealOutcomes, nextWeekTheme: synth && synth.nextWeekTheme, adjustments: synth && synth.adjustments, outputPath: written && written.outputPath }
