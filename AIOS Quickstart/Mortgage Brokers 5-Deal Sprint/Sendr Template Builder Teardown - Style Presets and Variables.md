# Sendr Template Builder Teardown - Style Presets and Variables

Source: https://www.youtube.com/watch?v=UHcfl3_ePu4
Created: 2026-06-03

## Big idea

This video explains how to build reusable Sendr templates: create a style preset, choose a pre-made template or start from scratch, and add variables that later map to lead-table columns.

For Ryan: if Sendr is used for AIOS Quickstart, the template should be a reusable "3 AIOS routines for {{company_name}}" page, not a custom build from scratch every time.

## What the video shows

1. Go to Templates.
2. Create a style preset:
   - brand info
   - logo
   - colors
   - font
   - calendar link
   - images/customer logos
3. Choose template creation method:
   - use style preset
   - select pre-made template
   - start from scratch
4. Use pre-made templates like:
   - meeting template
   - quick video template
   - event invite template
   - video product showcase
   - local meeting template
5. Add variables by clicking the sparkle icon in text fields.
6. Variables are not limited to the defaults. You can create as many as needed.
7. Keep variable names consistent. Do not create multiple versions of the same variable.

## Recommended AIOS Sendr template

Template name:

AIOS Quickstart - 3 Routines Plan

Core variables:

- first_name
- company_name
- title
- routine_1
- routine_2
- routine_3
- personalization_anchor
- segment
- sendr_page_url
- calendar_link

Page headline:

"3 approval-only AI routines I’d set up for {{company_name}}"

Subheadline:

"No sensitive borrower files needed for version one. No auto-sending. Just drafts, briefs, and follow-up queues your team approves."

Sections:

1. Why I picked these routines
   - uses personalization_anchor
2. Routine 1: {{routine_1}}
3. Routine 2: {{routine_2}}
4. Routine 3: {{routine_3}}
5. How the 7-day install works
6. CTA: Worth a 15-minute workflow audit?

## What this means for the stack

Sendr templates become reusable proof assets. The system should be:

- Hermes creates/scales the variable data.
- Sendr turns those variables into a personalized page.
- Smartlead sends the cold/warm emails.
- Salesfinity calls the people who reply/view/engage.

## Variable discipline

Use one naming convention only:

- first_name, not FirstName / first-name / firstname
- company_name, not company / Company / company-name
- routine_1, routine_2, routine_3
- personalization_anchor

This matters because Sendr table mapping gets messy if fields are inconsistent.

## Caution

Do not make the Sendr page too designed or too long. Mortgage brokers need clarity, not a startup landing page with 19 gradients and a CTA that says "unlock your future."

The page should make the offer feel specific and safe.

## One-line lesson

The Sendr template should be a reusable AIOS proof page powered by clean variables — not a custom design project for every lead.
