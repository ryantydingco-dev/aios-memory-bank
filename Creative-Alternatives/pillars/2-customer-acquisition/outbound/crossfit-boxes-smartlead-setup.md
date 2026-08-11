# CrossFit Boxes — SmartLead Setup Walkthrough

> **Purpose:** Get the CrossFit Boxes campaign live in SmartLead with both Maclaine + Ryan variants and the `personalization` custom variable.
> **Time:** ~15 minutes once the CSV is ready.

---

## Prerequisites

- [ ] Production CSV exists at `module-installs/lead-engine/data/dry_runs/crossfit_dry_run_2026-05-05.csv` (~500 rows)
- [ ] Maclaine inbox pool identified in SmartLead
- [ ] Ryan inbox pool identified in SmartLead

---

## Step 1 — Add the Custom Variable

SmartLead → Settings → Custom Fields → **Add Field**

- **Field name:** `personalization`
- **Type:** Text
- **Default value:** *(leave blank — script will populate)*

This variable maps to the `{{personalization}}` token in Email 1 of both variants.

---

## Step 2 — Create Campaign A (Maclaine)

**Campaign name:** `CrossFit Boxes — Variant A (Maclaine) — 2026-05`

### Settings tab
- Track opens: ON
- Track clicks: ON (no links in V1, but enabled for if we add later)
- Stop sending if reply: ON
- Time zone: ET (recipient-local would be better but ET keeps consistency with prior wins)
- Sending hours: Tue–Thu 9 AM – 4 PM ET (proven Summer Camps window)

### Sequence tab — paste these exactly

#### Email 1 (Day 0)
**Subject:** `free store for {{company_name}}`

```
Hi {{first_name}},

{{personalization}}

Do you guys currently sell any branded gear for your members?

We build free custom online stores for CrossFit boxes — we handle all the fulfillment, and your box earns a cut on every order with nothing to manage.

Just curious if it's something on your radar.

Maclaine
```

#### Email 2 (Day 4)
**Subject:** `free store for {{company_name}}`

```
Hi {{first_name}},

We set up free branded online stores for CrossFit boxes — fulfillment, shipping, everything handled on our end. Your box just earns a percentage on every order.

Are you guys doing anything with merch right now?

Maclaine
```

#### Email 3 (Day 9)
**Subject:** `{{company_name}} merch`

```
Hi {{first_name}},

Quick one — does {{company_name}} sell any gear to members?

We handle the whole thing for free for boxes like yours. Just wanted to see if it's even something you think about.

Maclaine
```

### Email Accounts tab
Attach **Maclaine inboxes only**. Use the same pool that ran Summer Camps (~30-40 emails/inbox/day, ramped).

### Schedule
- Send only Tue/Wed/Thu (highest reply days from Summer Camps data)
- Throttle: 30/day per inbox until day 5, then 40/day

---

## Step 3 — Create Campaign B (Ryan)

Duplicate Campaign A. Then change:

- **Campaign name:** `CrossFit Boxes — Variant B (Ryan) — 2026-05`
- **Sequence:** Replace all 3 emails with the Ryan variants from `crossfit-boxes-sequence-v1.md`
- **Email Accounts:** Attach Ryan inboxes only

---

## Step 4 — Split the CSV 50/50

The 500-lead CSV has a `variant` column (auto-assigned A or B by the dry-run script — TODO: verify, may need manual split).

**Option A — Use the variant column:**
1. Sort CSV by `variant` column
2. Filter for `A`, save as `crossfit_500_variant_A.csv`
3. Filter for `B`, save as `crossfit_500_variant_B.csv`

**Option B — Just split in half:**
1. Split CSV at row 250
2. Top half → Variant A (Maclaine)
3. Bottom half → Variant B (Ryan)

Both are fine since leads are pulled in arbitrary Apollo order. Option B is faster.

---

## Step 5 — Import Leads

For each campaign:
1. Leads tab → **Upload CSV**
2. Map columns:
   - `email` → Email
   - `first_name` → First Name
   - `last_name` → Last Name
   - `company_name` → Company
   - `personalization` → **personalization (custom field)**
   - `city`, `state`, `title` → standard fields
3. Click Upload

---

## Step 6 — Pre-Flight Checks (DO NOT SKIP)

Before activating, send a test email to your own address from each campaign:

1. SmartLead → Campaign → Send Test Email
2. Use a real lead row from the CSV so `{{personalization}}` actually populates
3. Verify in your inbox:
   - [ ] `{{first_name}}`, `{{company_name}}`, `{{personalization}}` all rendered correctly
   - [ ] Personalization line is on its own line, not jammed against the next paragraph
   - [ ] Email looks clean on mobile (most members will read on phone)
   - [ ] No double-spacing or weird line breaks
   - [ ] Reply-to address is correct

Repeat for Variant B.

---

## Step 7 — Activate

Once both campaigns pass pre-flight:

1. Variant A → **Status: Active** (Tue/Wed/Thu schedule)
2. Variant B → **Status: Active** (same schedule)

First sends go out next business Tue/Wed/Thu morning ET.

---

## Step 8 — Monitor (Daily for First Week)

Watch in `data/data.db` via the Daily Brief at 7 AM, or query directly:

```sql
SELECT campaign_name, sent_count, reply_count,
       ROUND(100.0 * reply_count / NULLIF(sent_count, 0), 2) as reply_rate
FROM smartlead_campaigns
WHERE campaign_name LIKE '%CrossFit%'
ORDER BY sent_count DESC;
```

**Go/no-go thresholds (after ~250 sends per variant):**
- Combined reply rate **< 3%** → diagnose (list, copy, or sender), do NOT scale
- **3-5%** → keep running, expand sample to 1,000 before deciding
- **5%+** → declare niche validated, queue BJJ + Climbing campaigns immediately
- One variant **2%+ ahead** of the other → lock that sender for Phase 2

Summer Camps benchmark for reference:
- 1,890 sent → 67 replies (10.1%) → 2 clients
- ~28 sends per reply, ~945 sends per client

---

## Optional: Automate Step 2-5 via MCP

The SmartLead MCP can create campaigns, attach inboxes, save sequences, and push leads programmatically. If you want me to handle Steps 2-5 automatically, say the word — I'll build the campaigns in DRAFT status, push the leads, and stop short of activation so you can do the pre-flight checks yourself.

Tools used:
- `mcp__smartlead__smartlead_create_campaign`
- `mcp__smartlead__smartlead_save_campaign_sequence`
- `mcp__smartlead__smartlead_add_email_account_to_campaign`
- `mcp__smartlead__smartlead_add_leads_to_campaign`
- `mcp__smartlead__smartlead_update_campaign_settings`
