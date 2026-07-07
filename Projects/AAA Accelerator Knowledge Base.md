# AAA Accelerator Knowledge Base

## What it is

Ryan authorized capturing the **AAA Accelerator** course content (Liam Ottley’s AI Automation Agency program) into a local knowledge base using his logged-in Chrome session. This is treated as an owned/member-access learning resource Ryan is allowed to access, not public scraping.

## 2026-06-30 capture session

A Claude Code session began working through the AAA Accelerator platform from a logged-in browser tab at `hub.aaaaccelerator.com`.

Important implementation detail from the session prompt:

- Unlike many course platforms, this platform reportedly exposes **lesson transcripts** and **downloadable PDFs/resources**.
- Therefore the local KB should capture the substance of the teaching, not just titles or page outlines.

## 2026-07-01 final-gap capture work

Claude sessions continued work in `/Users/ryantydingco/Documents/AIOS/aaa-accelerator` with an emphasis on closing the last remaining capture gaps rather than starting a new scrape.

Files/context surfaced in the scan:

- `MANIFEST.md` — the course KB manifest / source-of-truth index.
- `new-consulting-course.md` — Consulting Course notes, including Nick Rocco context and section-level course material.
- `resources/aios-ai-operating-systems/` — authorized PDFs/resources that need to be represented in the KB/manifest.

Important workflow constraint repeated in the prompts: execute directly with browser/Bash/Write tools and verify file writes by re-reading them. Do **not** attempt to launch another agent; prior attempts reportedly produced no useful output.

Next verification pass should answer: which modules are fully captured, which PDFs/resources are incorporated, and whether the manifest accurately reflects complete vs missing items.

## Desired local KB shape

Future agents should verify and build a structured course archive with:

1. Course/module index.
2. Lesson pages with title, URL, module/course, and status.
3. Transcript capture or concise transcript-derived lesson notes.
4. Downloaded PDFs/resources stored in a predictable resources folder.
5. A manifest of captured vs missing lessons/resources.
6. A short “how Ryan should use this” guide that maps the material to his Creative Alternatives / AIOS / outbound work.

## Guardrails

- Do not dump raw browser noise or massive raw transcripts into the AIOS Memory Bank.
- Keep Memory Bank notes curated; store bulky course artifacts in the actual local knowledge-base folder.
- Do not capture or persist credentials, session cookies, or private account details.
- Preserve source URLs and capture dates so future agents can refresh missing pieces.

## Open loops

- Confirm the local destination folder for the AAA Accelerator KB.
- Verify whether all modules/lessons were indexed.
- Verify whether transcripts and PDFs were actually captured, not merely discovered.
- Produce a clean manifest and usage guide.
