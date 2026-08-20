# CA list engine

GrowthEngineX list-expander process, pointed at Creative Alternatives.

Video: https://www.youtube.com/watch?v=aq5r3_CMh-s
Skill: `Creative-Alternatives/.cursor/skills/ca-list-engine/SKILL.md`
Failure modes: `docs/failure-modes/list-engine.md`

## Why this exists

Company databases scrape self-reported industries. A school that wants a spirit-wear
store is not an industry. Start from companies that already paid us (or inbound that
asked), pull the messy universe those seeds live in, let a cheap judge throw out junk,
confirm on the live homepage.

## Live command

```bash
cd pillars/2-customer-acquisition/outbound/list-engine
python3 scripts/run_lane.py --lane schools --cap 40
# agent fills output/schools/<run>/candidates.csv
python3 scripts/run_lane.py --lane schools --cap 40 --candidates output/schools/<run>/candidates.csv
```

`--cap 40` is the screen-share ceiling. Say that. Full TAM needs AI Ark / Prospeo later.

## v1 does not

Reveal emails. Upload SmartLead. Touch Harbor Haven or Camp Arcadia.
