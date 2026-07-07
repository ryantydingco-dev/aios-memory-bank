# Creator Teardown - Auto Research Outbound Experiment Engine

Video: https://www.youtube.com/watch?v=qw0xdTtzK1w

## Why This Matters For Ryan / Oloxa
This video is directly relevant to Oloxa and Ryan's long-term AI GTM Engine. The core idea is not "AI writes better emails." The real idea is a closed-loop outbound experimentation system:

1. Give AI deep context about the company, offer, ICP, proof, and CTA.
2. Build a large TAM/account universe with rich data points up front.
3. Generate campaign experiments from the intersection of ICP context + account data.
4. Load approved campaigns into Smartlead/Instantly.
5. Pull performance data weekly.
6. Learn from positive/negative replies.
7. Suggest the next round of experiments.
8. Keep the CTA locked and require human approval before sending.

This is basically the exact shape of the Oloxa GTM brain Ryan has been trying to build.

## Claimed Result
The creator claims an enterprise customer doubled reply rates:
- Automatic campaigns: 20.71 replies per 1,000
- Other campaigns: 10.71 replies per 1,000
- Result held week over week, according to the video

This is directionally useful but should not be blindly trusted without seeing list quality, offer quality, deliverability, sample size, and reply quality. Still, the underlying system design is strong.

## The Actual Workflow

### 1. Context First
The system starts by deeply understanding the company:
- website
- offer
- ICP
- case studies
- value proposition
- problem statement
- dream outbound campaigns
- voice memo/context dump from founder

Important quote/idea: without really good context, none of this matters.

Ryan application:
Oloxa needs a canonical context pack:
- ICP markdown
- proof/case-study markdown
- problem statement markdown
- value proposition markdown
- objection/response markdown
- locked CTA markdown
- forbidden claims markdown

### 2. Build The TAM Up Front
The creator says one early mistake was letting Claude make game-time decisions about which accounts to find. That produced poor coverage and tiny sample sizes.

Better approach:
Build the entire TAM/account universe with as many useful data points as possible first, then let Claude design experiments from the data.

Ryan application:
For Oloxa, do not let AI randomly search "commercial brokers" each day. Build/maintain a larger account universe by market:
- US commercial finance brokers
- debt advisors
- SBA lenders/brokers
- equipment finance brokers
- factoring/AR finance firms
- commercial insurance brokers later if adjacent

Enrich each account with signals:
- website/docs/process language
- borrower/document checklist mentions
- transaction/closing activity
- hiring/admin ops signals
- market specialization
- LinkedIn activity
- lender/submission language
- CRM/tech stack clues
- company size
- geography
- contact paths

### 3. The List Is The Message
The creator emphasizes campaign ideas come from the data. Example from the video: if a B2B SaaS company has a demo button, pricing structure, enterprise plan, sales leader but no reps, etc., those data points define the outbound angle.

Ryan application:
For Oloxa, the message should emerge from account facts:
- If company advertises fast approvals -> angle: borrower docs slow the promise down.
- If company has many transaction/news pages -> angle: package volume/admin drag.
- If company is hiring processors/admins -> angle: automate doc chasing before hiring.
- If company has borrower checklist PDFs -> angle: Oloxa turns checklist chaos into lender-ready packages.
- If company serves complex commercial deals -> angle: fewer missing-doc loops.

### 4. Experiment Engine
After context + TAM exist, Claude/Codex proposes campaigns:
- segment
- hypothesis
- target accounts
- contact types
- copy suggestion
- expected pain
- locked CTA

Human approves before sending.

### 5. Smartlead / Instantly Execution
The creator loads campaigns into Smartlead/Instantly, but keeps human approval in the free/open-source version. Their internal version may send automatically, but he does not recommend promising that.

Ryan application:
Oloxa already uses Smartlead/HubSpot. The right path is:
- AI proposes next campaign batch
- Ryan/Sway approve
- Smartlead sends
- HubSpot tracks task/reply/status
- weekly learning loop updates the GTM brain

### 6. Weekly Learning Loop
The creator recommends a weekly scheduled run:
- pull past performance
- analyze positive/negative replies
- suggest next tests
- approve copy
- upload next batch
- track who has/hasn't been contacted

This is the real compounding system.

## What To Steal For Oloxa

### Build An Oloxa Auto-Research Repo / Folder
Suggested structure:
```text
Oloxa Auto Research/
  context/
    ICP.md
    Offer.md
    Proof.md
    Problem Statement.md
    Value Proposition.md
    Locked CTA.md
    Forbidden Claims.md
    Objections.md
  data/
    account_universe.csv
    contacts.csv
    campaign_history.csv
    reply_history.csv
  experiments/
    proposed/
    approved/
    completed/
  reports/
    weekly_learning_reports/
```

### Locked CTA
The video stresses locking the CTA so the AI does not drift into bad offers.

For Oloxa, possible locked CTA:
```text
Worth a quick look at how this would work on one of your borrower doc packages?
```

Or:
```text
Open to seeing a 2-minute example of how Oloxa turns messy borrower docs into a lender-ready package?
```

### Weekly Experiment Prompt
```text
Build a workflow that reviews Oloxa campaign history, reply history, lead/account data, and current ICP context. Identify which account segments and pain angles are producing positive replies. Propose 3 new outbound experiments for next week, each with target segment, data filter, pain hypothesis, copy angle, locked CTA, sample contacts, and risks. Have another agent challenge each experiment and keep only the strongest ones.
```

## Honest Serviceability Verdict
This is extremely serviceable for Oloxa.

But the value is not in copying the repo blindly. The value is in the operating principle:

```text
Context pack + enriched TAM + experiment generator + performance feedback loop
```

Oloxa already has pieces of this. The missing piece is turning them into a strict weekly operating loop rather than scattered lead research.

## Risks / Traps
- Optimizing for reply rate instead of qualified meetings.
- Letting AI invent segments from weak sample sizes.
- Running experiments before the TAM data is good.
- Changing CTA too often.
- Letting AI write generic copy without Ryan/Sway human judgment.
- Overbuilding automation before manual campaign hypotheses work.

## Best Next Move
For Oloxa, build the first version manually:
1. Create/clean the context pack.
2. Create one enriched account universe CSV.
3. Define 3 data-driven campaign hypotheses.
4. Send small batches.
5. Pull reply/meeting data weekly.
6. Let Claude propose next experiments.

Do not automate sending until the learning loop is proven.

## One-Line Lesson
The next edge in outbound is not AI-written emails. It is an AI-run experimentation loop that combines deep company context, rich account data, locked CTAs, and weekly performance learning.
