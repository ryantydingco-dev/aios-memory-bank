export const meta = {
  name: 'dt-engagement-engine',
  description: 'Build a daily LinkedIn comment queue for the dead-form POV: non-pitchy comments on ICP posts + DM openers for engagers. Human-in-the-loop — Ryan posts manually.',
  whenToUse: 'Run daily. Paste 5-15 ICP post snippets (from saved LinkedIn searches) as args.posts to get drafted comments; or run with no posts to get the day\'s comment-target search plan.',
  phases: [
    { title: 'Plan', detail: 'the day\'s comment-target search plan' },
    { title: 'Draft', detail: 'two non-pitchy comments + a DM opener per post' },
    { title: 'Queue', detail: 'write the comment queue file' },
  ],
}

const ROOT = '/Users/ryantydingco/Documents/AIOS-Memory-Bank/AI GTM Engine'
const BLUEPRINT = `${ROOT}/Inbound/Deal Threads Inbound Machine Blueprint.md`
const WEEK1 = `${ROOT}/Inbound/Deal Threads Week 1 Execution Pack.md`
const COMMENTSOP = `${ROOT}/Inbound/LinkedIn Comment Assist Workflow.md`
const COMMAND = `${ROOT}/00 - Deal Threads Inbound Command Center.md`
const OUT = `${ROOT}/Inbound/Outputs`

// normalize args — the Workflow runtime may deliver args as a JSON string, not an object
const IN = (typeof args === 'string') ? (() => { try { return JSON.parse(args) } catch (e) { return {} } })() : (args || {})
const dayLabel = IN.day || 'today'
// posts: [{ author, role, company, text, url }]
const posts = Array.isArray(IN.posts) ? IN.posts : []
const targetCount = IN.count || 12

const SAFETY = `SAFETY (from the LinkedIn Comment Assist Workflow): no auto-posting — Ryan posts manually. No identical repeated comments. No links unless asked. No product pitch in comments. Comments add a useful thought or a smart workflow question and sound human. Keep each under 50 words.`

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    searchTerms: { type: 'array', items: { type: 'string' } },
    targetAccountTypes: { type: 'array', items: { type: 'string' } },
    whatGoodLooksLike: { type: 'string' },
    dailyTarget: { type: 'string' },
  },
  required: ['searchTerms', 'targetAccountTypes', 'whatGoodLooksLike', 'dailyTarget'],
}

const COMMENT_SCHEMA = {
  type: 'object',
  properties: {
    author: { type: 'string' },
    postSummary: { type: 'string' },
    icpFit: { type: 'string', enum: ['high', 'medium', 'low'] },
    angle: { type: 'string', description: 'which comment type: handoff / lead-quality / CRM / speed-to-lead / trust' },
    comments: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2, description: 'two distinct non-pitchy options, each <50 words' },
    dmOpener: { type: 'string', description: 'soft DM opener if they engage back' },
  },
  required: ['author', 'postSummary', 'icpFit', 'angle', 'comments', 'dmOpener'],
}

phase('Plan')
const plan = await agent(
  `Produce today's LinkedIn comment-target search plan for the DealThreads dead-form inbound machine.\n` +
  `READ (Read tool): ${WEEK1} ("Comment Search Terms", "Comment Targets") and ${COMMAND} (Block 2: Comment).\n` +
  `Return: the LinkedIn search terms to hunt, the kinds of accounts/posts to target, what a good (non-pitchy, dead-form-POV) comment looks like, and today's volume target.`,
  { label: 'search-plan', phase: 'Plan', schema: PLAN_SCHEMA }
)

let drafted = []
if (posts.length) {
  log(`Drafting comments for ${posts.length} pasted ICP post(s).`)
  drafted = await pipeline(
    posts,
    (p) => agent(
      `Draft two LinkedIn comments for this ICP post, in the DealThreads dead-form POV.\n\n` +
      `READ for comment templates + voice (Read tool): ${WEEK1} ("Comment Templates") and ${COMMENTSOP}.\n\n` +
      `POST by ${p.author || 'unknown'} (${p.role || '?'} @ ${p.company || '?'}):\n"""${p.text || ''}"""\nURL: ${p.url || 'n/a'}\n\n` +
      `Write TWO distinct comment options that connect their post to the form handoff / buyer profile / lead context / CRM quality / speed-to-lead — only where it is genuinely relevant. If the post is a poor fit, say so in postSummary and keep comments generic-useful (no forced pitch). Also give a soft DM opener to use if they reply. ${SAFETY}`,
      { label: `comment:${String(p.author || 'post').slice(0, 40)}`, phase: 'Draft', schema: COMMENT_SCHEMA }
    )
  )
  drafted = drafted.filter(Boolean)
} else {
  log('No posts pasted — producing the search plan only. Paste args.posts to get drafted comments.')
}

phase('Queue')
const QUEUE_SCHEMA = { type: 'object', properties: { outputPath: { type: 'string' }, count: { type: 'number' } }, required: ['outputPath', 'count'] }
const queue = await agent(
  `Write the DealThreads daily comment queue to disk (Write tool).\n\n` +
  `FILE: "${OUT}/Comment Queue - ${dayLabel}.md"\n\n` +
  `SEARCH PLAN (JSON): ${JSON.stringify(plan)}\n\n` +
  `DRAFTED COMMENTS (JSON, may be empty): ${JSON.stringify(drafted)}\n\n` +
  `Structure:\n# DealThreads Comment Queue — ${dayLabel}\n(line: human-in-the-loop — review, edit, post manually. ${"Don't"} auto-post.)\n` +
  `## Search plan (where to hunt today) — list the search terms + target account types + what good looks like + volume target.\n` +
  `## Comment queue — for each drafted post: ### <author> (<icpFit> fit · <angle>), the post summary, the two comment options in a fenced block each labelled Option A / Option B, and the DM opener. If the queue is empty, write a note that no posts were pasted and how to add them.\n` +
  `## Safety guardrails — restate the no-auto-post / no-pitch / <50-word rules.\n` +
  `Return outputPath and the count of queued comments.`,
  { label: 'write-queue', phase: 'Queue', schema: QUEUE_SCHEMA }
)

log(`Wrote ${queue && queue.outputPath} (${(queue && queue.count) || 0} comments queued).`)
return { day: dayLabel, commentsQueued: drafted.length, searchTerms: plan && plan.searchTerms, outputPath: queue && queue.outputPath }
