# AAA Consultant Path — The 3 Core Prompts (copy-paste ready)

Extracted 2026-07-22 from the course PDFs in this folder. Use in order: **1 → before the audit call, 2 → after the call, 3 → to build the deck.**

---

## 1. AI Senior Partner Prompt (pre-call prep)

Inputs: intake form responses + website text (3 primary pages).

```
*** ROLE ***
You are a Senior AI Consultant. I am a junior consultant preparing to conduct
a 60-minute "AI Audit" interview with a business owner.

*** GOAL ***
My goal for this call is to identify 3-5 bottlenecks in their workflow
that can be solved using off-the-shelf AI tools (like ChatGPT for writing,
Fireflies for transcription, Perplexity for research, Make for simple
automation, etc., but mainly just reworking existing systems to use AI and
slice time and costs).

I do NOT want to sell them complex custom code or automations. I want to find
manual, repetitive drudgery that I can fix easily by tweaking their current
workflows.

*** INPUTS ***
Here is the data from their Intake Form which explains what business they run
and some valuable insights on how they operate and where bottlenecks or pain
points may be:

[PASTE FORM RESPONSES HERE]

Here is the text from their Company Website for context on what they do:

[PASTE WEBSITE TEXT HERE]

*** YOUR TASK ***
Please analyze this data and provide a "Pre-Call Briefing" for me. Structure
it exactly like this:

PART 1: THE BUSINESS SNAPSHOT (Educate me)
Since I am new to this industry and a newbie to how businesses actually
operate, explain to me how this business likely operates in simple terms.
Based on the website and form:
- What is their primary business model? (How do they make money?)
- How do they likely acquire customers? (Ads, referrals, cold outreach?)
- What does their delivery process likely look like?
- What are the standard operational pains for a business in this specific
industry?
*Note: Be probabilistic, its okay to not be sure but you must not give
confidently wrong answers. Use phrases like "It appears that..." or
"Likely..."*

PART 2: INVESTIGATION ZONES (The Questions)
Based strictly on the bottlenecks or challenges they mentioned in the form,
give me 5 "Question Clusters" of 3-5 questions to explore on the call that
dive into problematic areas.
Do not give me generic questions like "What is your pain?". I already know
that.
Give me "Deep Dive" questions to get them talking about the specific friction
so I can get a good transcript filled with insights that will help me later
identify AI tools to fix things.

For example, if they mentioned "Writing Reports," give me questions like:
- "Walk me through the report writing process—are you staring at a blank page,
or collating data?"
- "Do you have a template you use?"
- "How long does one report take?"
```

---

## 2. Investigator Prompt (post-audit synthesis)

Inputs: intake form + website text + pre-call report + full audit transcript (no need to trim).

```
CONTEXT & GOAL
I am an AI Consultant conducting a "Lightweight Tools Audit" for a small-to-
medium business.
My goal is NOT to propose complex custom software or a 6-month digital
transformation.
My goal is to identify 3-5 "Low-Hanging Fruit" opportunities where off-the-
shelf AI tools (like ChatGPT Team, Fireflies, Perplexity, Midjourney, simple
Automations) can save them time immediately.

I have already conducted the audit interview. Now, I need you to synthesize
all the data I have collected to help me prepare my final report.

THE DATA SOURCES
I am pasting 4 inputs below:

1. THE INTAKE FORM (Initial data provided by client):
[PASTE TEXT HERE]

2. THE WEBSITE TEXT (Public description of business):
[PASTE TEXT HERE]

3. THE PRE-CALL REPORT (My initial hypothesis prior to the audit call):
[PASTE TEXT HERE]

4. THE AUDIT TRANSCRIPT (The actual conversation/truth):
[PASTE TEXT HERE]

YOUR TASK
Please analyze this data and output a briefing in two distinct parts.

PART 1: THE BUSINESS TRUTH
Synthesize the transcript and form data to explain how this business ACTUALLY
operates (which might differ from their website).
- The Revenue Engine: How do they actually make money?
- The Customer Journey: Briefly map the reality of how a lead becomes a
customer.
- The Team Structure: Who is actually doing the work?

PART 2: INVESTIGATION ZONES
Identify 5-10 specific areas where I should focus my research for AI tools.
For each zone, provide:
1. THE BOTTLENECK: What is the specific manual task slowing them down?
2. THE EVIDENCE: Quote the client directly from the transcript regarding the
pain.
3. THE MATH: Highlight the ROI potential (hours, team size, or costs
mentioned).
4. RESEARCH DIRECTION: Tell me what category of tools to investigate - not a
specific tool. (e.g., "Investigate AI Voice Agents" or "Research AI Knowledge
Base tools").

CONSTRAINTS
- Stick to "Off-the-Shelf" opportunities. No custom coding suggestions.
- Be specific with the data. If the transcript has a number, use it.
```

---

## 3. Report Builder Prompt (deck generation)

Inputs: all 4 above + your research notes on the 3 chosen tools. Output drops into Gamma/Canva.

```
CONTEXT & GOAL
I am an AI Consultant finalizing a "Lightweight AI Opportunities Report"
for a small-to-medium business. I have completed the audit, identified the
bottlenecks, and researched the specific "Off-the-Shelf" AI tools that will
solve their problems.

My goal is to create a 10-slide Presentation Deck that clearly explains:
1. The current pain/cost of their manual processes.
2. The specific AI tool that solves it (and how).
3. The estimated ROI (Time/Money saved).

THE DATA SOURCES
I am providing 5 distinct inputs below. Please analyze all of them before
writing.

1. THE INTAKE FORM (Initial data):
[PASTE INTAKE FORM RESPONSES HERE]

2. THE WEBSITE TEXT (Public description):
[PASTE WEBSITE TEXT HERE]

3. THE PRE-CALL REPORT (My initial hypothesis):
[PASTE PRE-CALL REPORT HERE]

4. THE AUDIT TRANSCRIPT (The actual conversation/truth):
[PASTE TRANSCRIPT HERE]

5. MY RESEARCH NOTES (The 3 specific tools I have selected):
[PASTE YOUR NOTES ON THE 3 TOOLS HERE - Include Name, Pricing, Features, how
it integrates into their workflows, expected time savings]

YOUR TASK
Write the content for the Presentation Deck. Tone: professional, concise,
persuasive. Structure exactly as follows:

SLIDE 1: TITLE CARD
- Title: AI Opportunities Report for [Company Name]
- Subtitle: Operational Efficiency Audit & Recommendations

SLIDE 2: EXECUTIVE SUMMARY
- Bulleted list of the 5-10 major bottlenecks identified
- "Current State" cost based on transcript numbers
- Number of AI opportunities identified

SLIDE 3: OPPORTUNITY #1 - [Tool Name] (THE PROBLEM)
- Headline: Current Bottleneck: [Name of Process]
- Description: The manual process they're doing now (quote evidence from
transcript)
- The Cost: 2-3 bullet points on time/money currently wasted

SLIDE 4: OPPORTUNITY #1 - [Tool Name] (THE SOLUTION)
- Headline: The AI Solution
- Tool: [Name of Tool]
- How it Works: Before workflow → new AI-driven workflow
- Impact: Estimated time saved per week

SLIDE 5: OPPORTUNITY #2 - [Tool Name] (THE PROBLEM)
- Headline: Current Bottleneck: [Name of Process]
- Description: The manual process (reference transcript evidence)
- The Cost: Time/money wasted

SLIDE 6: OPPORTUNITY #2 - [Tool Name] (THE SOLUTION)
- Headline: The AI Solution
- Tool: [Name of Tool]
- How it Works: Workflow transformation
- Impact: Weekly time savings

SLIDE 7: OPPORTUNITY #3 - [Tool Name] (THE PROBLEM)
- Headline: Current Bottleneck: [Name of Process]
- Description: The manual process (reference transcript evidence)
- The Cost: Time/money wasted

SLIDE 8: OPPORTUNITY #3 - [Tool Name] (THE SOLUTION)
- Headline: The AI Solution
- Tool: [Name of Tool]
- How it Works: Workflow transformation
- Impact: Weekly time savings

SLIDE 9: ROI SUMMARY
- Total Monthly Cost of New Tools: $[Amount]
- Total Monthly Hours Saved: [Amount]
- Estimated Annual Savings: $[Amount] (show the math)
- The "No-Brainer" Statement: one sentence summarizing the ROI

SLIDE 10: NEXT STEPS
- Summary and clear call to action to select tools for implementation

CONSTRAINTS
- Keep text concise for slides. Use bullet points.
- Use specific pricing/features from my Research Notes.
```

---

## Live links (not downloadable files)

- **Warm Outreach Tracker (Google Sheet):** https://docs.google.com/spreadsheets/d/1_Z52-VwU-V4wp5PKSmVuyCgLJv1Wzou__jiasaAwzHM/edit?usp=sharing
- **Intake Form template (Google Form):** https://forms.gle/HkumjnnXt6QKUC12A
- **Sample Calendly booking page:** https://calendly.com/aaa-accelerator/aaa-accelerator-alignment-email
- **Practice mock-client website:** https://apex-roof-restyle.lovable.app
- **Tool database:** https://theresanaiforthat.com
