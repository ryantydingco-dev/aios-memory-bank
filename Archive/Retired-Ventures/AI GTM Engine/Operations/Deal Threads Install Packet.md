# Deal Threads Install Packet

Last updated: 2026-06-02  
Purpose: one-page client-facing explanation of what gets installed, what data moves, and what "working" means.

## Client-Facing Summary

Deal Threads adds an AI intake widget to approved pages on your website. The widget asks a short set of qualification questions, captures buyer intent, enriches business context behind the scenes, scores fit, and pushes a rep-ready buyer profile into your CRM before sales follows up.

It is installed with a single script tag and configured around your sales motion, CRM fields, routing rules, and consent language.

## What Gets Installed

Example script:

```html
<script async src="https://cdn.dealthreads.com/widget.js" data-widget-id="WIDGET_ID" data-tenant-id="TENANT_ID"></script>
```

Installation options:

- Directly in website template.
- Google Tag Manager.
- Webflow custom code.
- WordPress header/plugin.
- Developer-managed site deploy.

## What The Visitor Sees

- Launcher button.
- Short AI-guided qualification conversation.
- Consent disclosure.
- Confirmation message.
- Fallback form if the AI service is unavailable.

## What Deal Threads Captures

Visitor-provided:

- name.
- work email or phone.
- company.
- business need.
- role/authority.
- timeline.
- budget or buying stage.
- current CRM/tools, if relevant.

Automatically captured:

- page URL.
- referrer.
- UTM parameters.
- widget configuration version.
- consent timestamp.

Enriched when available:

- company size.
- industry.
- website/domain context.
- tech stack.
- funding/news/growth signals.
- ICP segment.

## What Goes Into CRM

Deal Threads can create or update:

- contact.
- company.
- optional deal.
- activity note.
- custom Deal Threads fields.

The rep sees:

- buyer intent summary.
- pain / business need.
- timeline.
- budget signal.
- authority signal.
- ICP score.
- priority.
- company context.
- recommended next action.
- unknowns to confirm.

## Data Safety Principles

- Unknown data stays unknown.
- Visitor-provided facts are separated from inferred/enriched facts.
- Low-confidence enrichment is marked for review.
- Deal Threads-owned fields are separated from customer-owned CRM fields.
- Protected CRM fields are not overwritten unless explicitly approved.
- CRM sync is idempotent.

## What We Need From You

Required:

- approved form/page URL.
- website install path or web owner.
- CRM admin contact.
- approved fields/routing rules.
- consent/privacy copy.
- sales owner for high-priority leads.

Recommended:

- current form submission baseline.
- example good lead.
- example poor-fit lead.
- current speed-to-lead estimate.
- existing lead routing rules.

## Timeline

Typical beta timeline:

| Step | Time |
| --- | --- |
| Intake completed | 10-15 minutes |
| Configuration call | 30-45 minutes |
| Widget/CRM setup | 1-3 days |
| Script install | same day once access exists |
| End-to-end QA | 30-60 minutes |
| First profile review | after first test/real submission |
| Weekly beta report | once per week |

## What "Working" Means

The beta is working when:

- widget loads on approved pages.
- visitor can complete the conversation.
- profile is created.
- CRM receives the profile.
- sales owner can read and act on the note.
- unknowns are clear.
- high-priority leads are routed or flagged.

## Removal / Rollback

Deal Threads can be removed by:

- removing the script tag.
- disabling the widget config.
- turning off CRM sync.
- disabling high-priority notifications.

CRM fields can remain for historical records or be hidden from views.

## Client Email

```text
Subject: Deal Threads install packet

Hey [Name],

Here is the lightweight install packet for Deal Threads.

The short version:
- one script tag on approved pages
- short buyer-intake conversation
- enrichment behind the scenes
- buyer profile pushed into CRM
- unknowns clearly marked
- weekly beta review

Once your intake form is complete, we can map the widget config, CRM fields, and first test profile.

- Ryan
```

