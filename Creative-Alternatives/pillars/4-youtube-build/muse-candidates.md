# Muse Candidates — Episode 1 (curated)

Real stats via vidIQ (`vidiq_outliers`) + Apify cross-check. Hunt method: Icahn filter
(long-form, ≥100k views, <100k subs, ≥5:1 views:subs) across "AI runs/transforms a real
business" + family-takeover lanes, then hand-curated for idea congruency to Episode 1
("I'm running my girlfriend's dad's $3M business with AI").

Reusable tooling: `scripts/vidiq_muse_hunt.py` (vidIQ outliers) + `scripts/vidiq.py` (vidIQ MCP CLI).

---

## ⭐ Top picks — pass Icahn AND match the idea

### 1. "How I'm Using AI to Run My Business — Every Contractor Needs to See This"
- **Chuck the Contractor** · 19,400 subs · **144,673 views** · **7:1** · 25 min
- https://youtube.com/watch?v=r3P1yMEXpuk
- **Why it's the best muse:** closest analog to our story. A contractor is exactly the kind of traditional, hands-on, relationship-run, non-techy business that Kenny's promo company is — getting modernized with AI, told first-person. The title is almost our title. Passes Icahn (small channel, big views) → the *idea* is proven to pull a hungry audience.

### 2. "I Hired 6 AI Employees to Scale My Business to $1 Million"
- **David Alex** · 22,400 subs · **217,177 views** · **10:1** · breakout 223 · 14 min
- https://youtube.com/watch?v=r7AORjSuOUA
- **Why:** first-person "AI runs my real business," with a big-number hook ($1M) and a concrete mechanic ("6 AI employees"). Strongest packaging pattern of the set — great model for a thumbnail/title with a dollar figure.

---

## Congruent alternates (softer ratio — use as packaging/structure references)

| Title | Channel | Subs | Views | Ratio | Len | Link |
|-------|---------|------|-------|-------|-----|------|
| This AI Runs My Business While I Sleep | All Thingz Real | 89,300 | 146,946 | 2:1 | 7m | [link](https://youtube.com/watch?v=PKfUx-QV9QA) |
| I Let AI Build My Business… Here's What I Learned | Hot Smart Rich | 34,200 | 126,596 | 4:1 | 90m | [link](https://youtube.com/watch?v=Y_RDX3KwojY) |
| How I Run A 0-Employee Marketing Agency With AI Tools | Marketing Against the Grain | 94,500 | 160,367 | 2:1 | 36m | [link](https://youtube.com/watch?v=9QbFg4kiNpY) |
| How I'd Start a 1-Person AI Business with Claude AI in 30 Days | Ritesh Verma | 59,000 | 240,681 | 4:1 | 13m | [link](https://youtube.com/watch?v=lY8shHNFp1M) |

> These don't all clear 5:1, but the *idea* is congruent — useful for studying titles, thumbnails, and intros, not for the Icahn lock.

---

## Recommendation

**Lock Muse #1 (Chuck the Contractor).** It's the tightest analog to Kenny's situation and the title is nearly ours already. Use #2 (David Alex) as the secondary for the big-number packaging pattern.

## Next step
Pick the muse → run the **Holy Trifecta** with it as the approved Icahn muse → real title, thumbnail, and intro for Episode 1. (Then optionally: pull the muse's transcript with `vidiq_video_transcript` to model its structure, and score our draft titles/thumbnails with `vidiq_score_title` / `vidiq_score_thumbnail`.)

> Packaging eyeball (Icahn filter #4) still pending — open the two top links and judge how beatable their thumbnails are. Weak packaging at these view counts = our opening.
