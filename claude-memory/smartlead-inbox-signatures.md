---
name: smartlead-inbox-signatures
description: SmartLead appends account-level signatures to every send regardless of campaign — keep all inboxes blank; sign in body copy only.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: cbf53fda-bea5-4c9e-8e31-ab33ed6001b8
  modified: 2026-07-27T14:22:08.946Z
---

SmartLead has a per-email-account `signature` field that is appended to **every** send from that inbox, independent of campaign or sequence copy. On 2026-07-27 the 29 Dealthreads inboxes (vantageoutbound{link,connectivity,reachout,expand,engagepro,network}.com) were carrying a Creative Alternatives signature block, so Dealthreads cold emails went out branded as CA. All 29 cleared to blank; all 279 accounts in the workspace now have empty signatures.

**Why:** Ryan runs two unrelated businesses out of one SmartLead workspace ([[dealthreads-outbound-engine]] and [[creative-alternatives-aios]]). An account-level signature is invisible in the sequence editor, so cross-brand leakage is silent — nothing in the campaign copy looks wrong.

**How to apply:** This is now automated — `aios-starter-kit/scripts/smartlead_guard.py`, daily 7:05am via `com.aios.smartlead-guard`, runs `--fix --all` so a stray signature self-heals and Telegram fires only on YELLOW/RED. It also catches inbox/campaign brand mixing and foreign brand names in sequence copy. **Before launching any client campaign, run `smartlead_guard.py --campaign <id>`** — exit 2 means do not launch.

Brand registry: `aios-starter-kit/config/smartlead_brands.json`. Every sending domain must be listed under exactly one brand. **When provisioning inboxes for a new client, add their brand block BEFORE attaching inboxes to a campaign** — otherwise the guard only warns YELLOW on the unknown domain instead of catching a real mix.

API gotchas: `limit` maxes at 500; SmartLead's edge 403s the default urllib User-Agent (send one) and 403s bursts (throttle ~0.5s); the smartlead MCP `update_email_account` tool has no signature param, so patch via `POST /api/v1/email-accounts/{id}` with `{"signature":""}`.
