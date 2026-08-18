# Content Ideation Machine — Supabase design (2026-08-16)

> Goal: stop inventing content from a blank page. Every idea gets harvested from signals the business already produces, scored, and queued — so the 1-hr content block starts with "pick from the top 5," never "what should I make?"
> NOTE: the referenced YouTube video (N34zz1-RSGw) couldn't be accessed from the build session — this design is grounded in our own stack. If the video's method differs, paste the transcript and reconcile.
> Monk Mode fit: ONE Wednesday build block for v1. The machine feeds the existing 3 formats (Sprint Log / Teardown / Post-Mortem) — it does not add formats, platforms, or hours.

## Why Supabase
Postgres (one queryable warehouse for every signal source) + pgvector (dedupe/similarity so the same idea isn't queued five times) + scheduled edge functions (harvest without launchd babysitting) + row-level security (Mickey gets access without getting everything). Free tier is enough for v1.

## The core insight
CA's daily operations already generate the best content raw material in the niche:
buyer replies (real objections + real buying language), mockups made, orders shipped,
weird vendor moments, DM conversations, reactivation wins, X-claim scout findings,
daily AI-brief items. Today those die in inboxes and session logs. The machine's job
is capture → score → queue.

## Schema (v1 — five tables, nothing clever)

```sql
-- where a signal came from
create table sources (
  id serial primary key,
  name text unique not null,        -- 'reply-watcher','dm-convo','order-shipped','x-claim-scout','ai-brief','manual'
  weight numeric default 1.0        -- source credibility multiplier for scoring
);

-- raw harvested material, append-only
create table signals (
  id bigint generated always as identity primary key,
  source_id int references sources(id),
  captured_at timestamptz default now(),
  content text not null,            -- the quote/objection/event, verbatim
  context jsonb,                    -- {campaign, icp, deal, url, ...}
  embedding vector(1536),           -- for dedupe + clustering
  used boolean default false
);

-- the ideation pipeline
create table ideas (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  title text not null,              -- working hook, one line
  format text check (format in ('sprint-log','teardown','post-mortem','linkedin-post','short')),
  icp text,                         -- which buyer this serves
  signal_ids bigint[],              -- receipts: which signals birthed it
  score numeric,                    -- computed, see scoring
  status text default 'seed'        -- seed → approved → scripted → recorded → published → measured
    check (status in ('seed','approved','scripted','recorded','published','measured','killed')),
  published_url text,
  notes text
);

-- hooks are first-class: one idea, many hooks, B.E.N.S.-checked
create table hooks (
  id bigint generated always as identity primary key,
  idea_id bigint references ideas(id),
  hook text not null,
  bens jsonb,                       -- {big:bool, easy:bool, new:bool, safe:bool}
  chosen boolean default false
);

-- close the loop: what actually worked
create table performance (
  idea_id bigint references ideas(id) primary key,
  platform text,
  views int, likes int, comments int, dms_generated int,
  leads_attributed int,             -- the only number that matters
  measured_at timestamptz
);
```

## Harvest jobs (scheduled edge functions, or v0 = manual paste)
1. **reply-harvest** — reply-watcher output → every objection, question, and yes-reason becomes a signal. (Buyer language is the #1 ideation source — Hormozi and every content operator agree.)
2. **ops-harvest** — daily: orders shipped, mockups made, POs flagged → "proof-of-work" signals for Sprint Logs.
3. **scout-merge** — X-claim-scout ledger rows → Teardown candidates (already built, just point it here).
4. **brief-merge** — daily AI-brief items tagged content-worthy → Teardown/commentary candidates.
5. **dm-harvest** — Ryan/Mickey paste notable DM exchanges weekly (manual; never automate reading DMs).

## Scoring (computed on ideas, 0–10)
`score = 2·pain (does it name a real buyer pain from signals?) + 2·proof (do we have receipts — numbers, screenshots, orders?) + 2·icp_fit (serves law-firm/exhibitor/camp/HR buyer?) + 1.5·novelty (embedding distance from published ideas) + 1.5·speed (can it be made in one content hour?) + 1·source_weight`.
Anything scoring <6 stays seed. The weekly queue = top 5 by score with ≥1 receipt.

## The weekly loop (fits existing rhythm, adds ~0 time)
- **Daily, passive:** harvest jobs write signals. Nobody looks at them.
- **Sunday recap (+10 min):** run the queue query → approve 5 ideas for the week → Mickey drafts hooks Mon (3 hooks/idea, B.E.N.S.-checked via the bens-intro-writer skill).
- **Daily content hour:** pick the top approved idea, make it, status → published.
- **Friday:** fill `performance` for anything ≥3 days old; `leads_attributed` comes from "how'd you find us?" + DM mentions. Score weights get adjusted monthly by what actually generated leads — the machine learns what CA's audience buys from, not what it likes.

## Mickey's access
Supabase RLS: Mickey gets insert on signals/hooks, select on ideas — not the QBO-adjacent context fields. DM harvesting stays manual on his side too.

## Build plan (ONE Wednesday block)
1. (20 min) Supabase project + run schema + seed sources.
2. (40 min) v0 harvest = a single `harvest.py` in the AIOS repo that reads reply-watcher output + a manual-paste inbox file → inserts signals w/ embeddings.
3. (30 min) queue query + a saved Supabase view (`weekly_queue`) Ryan and Mickey can both open.
4. (30 min) backfill: paste the 12 pre-written episodes + claim ledger as first ideas/signals so week 1 starts full.
5. STOP. Edge-function automation, dashboards, and anything prettier waits until the loop has run 2 real weeks.

## Kill criteria
If after 3 weeks the queue isn't being pulled from during content hours, the machine is shelf-ware — kill it and go back to the pre-written episode list. The measure is content SHIPPED from the queue, not signals collected.
