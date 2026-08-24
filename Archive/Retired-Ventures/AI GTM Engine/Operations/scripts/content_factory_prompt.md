Produce ONE week (7 days, Mon-Sun) of LinkedIn posts for Oloxa, then return STRICT JSON only (no prose, no markdown fences).

Oloxa = turns messy borrower docs into lender-ready packages for commercial finance brokers. North Star = warm conversations with commercial finance brokers / debt advisors.

RYAN VOICE + RULES (obey strictly):
- POV: commercial finance teams lose capacity before lender submission because borrower docs arrive messy/incomplete/hard to chase. Future = cleaner intake, faster lender-ready packages, brokers on deals not document coordination.
- Tone: practical, curious, learning-in-public, lightly funny, NOT guru, NOT SaaS-bro, NOT AI-hype. Ryan is HONEST he is building/studying the workflow, not a finance veteran.
- Sell outcomes, never "AI" as the headline. Never invent proof; mark hypotheses as hypotheses. Allowed proof points (use at most one, only if it fits): 7+ hrs saved per deal, 97% doc classification accuracy, 0 follow-up emails.
- One idea per post. One soft CTA or none. Short 1-2 line paragraphs. Under 220 words. No AI tells (no "dive in", "game-changer", "unlock/elevate", em-dash overuse, hashtag spam, emoji bullets).
- Approved soft CTAs: "Curious if other commercial finance teams see the same doc-intake bottleneck before lender submission." / "If you're a broker, where does the file usually slow down: borrower follow-up, missing docs, lender checklists, or internal handoff?" / "I'm documenting how we're building this GTM system in real time."

PILLAR ROTATION (weight broker-buyer pillars 1,3,5 over meta pillars 2,4):
Mon=Pillar 1 (broker workflow education), Tue=Pillar 3 (building Oloxa in public), Wed=Pillar 2 (signal-based GTM), Thu=Pillar 1, Fri=Pillar 5 (proof/lessons), Sat=Pillar 4 (practical AI systems), Sun=Pillar 3.

Each post must clear the Content Grader: hook (line 1 stops the scroll), clarity (one idea), specificity (a real workflow/example), ryan_voice, usefulness, trust (no overclaiming), cta (one soft or none). Aim 8.5+/10.

Return EXACTLY this JSON shape:
{"week_of":"<this week's Monday YYYY-MM-DD>","count":7,"avg_score":<number>,"posts":[
  {"day":"Mon","pillar":"Pillar 1 — Broker Workflow Education","audience":"...","topic":"...",
   "overall":<number>,"scores":{"hook":n,"clarity":n,"specificity":n,"ryan_voice":n,"usefulness":n,"trust":n,"cta":n},
   "ai_tells_found":[...],"changes_made":[...],
   "post":{"hook":"...","body":"...","cta":"...","full_post":"...","word_count":n,"short_form_script":"...","comment_targets":["...","...","..."]}}
  , ... 7 posts total
]}
Output the JSON object and nothing else.
