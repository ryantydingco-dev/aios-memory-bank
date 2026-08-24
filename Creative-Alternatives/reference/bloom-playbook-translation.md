# Bloom → Creative Alternatives Playbook Translation

> Source: Open Residency Ep. 035 — Greg Lavecchia, "How Bloom Hit $180M Bootstrapped" (PDF, Aug 2026).
> Bloom: DTC CPG (greens powder → energy drinks), $180M bootstrapped, on pace for $500M. 85%+ of marketing spend on influencer, <5% on Meta, no agencies ever.
> This doc translates each Bloom strategy to CA's B2B custom-printing reality. Prioritized at the bottom.

## The 9 Bloom strategies (as stated)

1. **Copy the Boiler Room** — In-house influencer program run like a Wall Street sales floor. Scouters (interns who look like the customer) → Influencer Relationship Managers → Director. 15–25 people, no agency, 15B+ views over 7 years. Pure outreach volume.
2. **Hire Your Avatar** — 96-person team is ~94% women who look like the Bloom customer; the office is a living focus group. VPN'd devices rotate U.S. regions so scouts see what the algorithm serves the real national customer, not the LA bubble.
3. **Price Influencer off CPM, Not Celebrity** — Target CPM = (your Meta CPM) ÷ 2. Adjusted CPM = target × % of audience matching your avatar. Micro (5K–50K) is the core tier. Best months: CPMs under $2.
4. **Kill the Creative Brief** — One instruction: "use it the way you naturally would and tell your audience why." No scripts, no affiliate/coupon codes. Attribution = video spikes matched against Amazon search lifts. Built for top-of-funnel reach, not last-click.
5. **Four Cultural Interventions** — Moved fast on COVID (protein-for-baking), TikTok's rise, GLP-1 palate shifts, and TikTok Shop while legacy brands (Coke, Red Bull, Pepsi) sat out. TikTok and TikTok Shop are two separate strategies.
6. **'Restock' Is the Most Powerful Word** — Validity marketing: attach proof statements everywhere. "Restocked 3x," "#1 on Amazon," screenshots of retailer sell-through emails, "we beat [competitor] at [retailer] launch week." One restock email+SMS = $1.36M day. Payoffs: consumer trust, inbound retailer calls, investor interest, talent recruitment.
7. **Enter Saturated Categories** — Never spend on education; ride categories where billions were already spent teaching the customer. Expansion ladder rule: never go wider until you've hit the ceiling of the current category. Community demand + market size = timing signal.
8. **Reverse-Engineer Retail Buyers** — Find which Instagram accounts the Target buyer follows → sign those influencers → buyer sees you everywhere → buyer calls YOU. Negotiate from leverage, never cold-pitch. Once inside retail, distribution becomes the moat.
9. **Build in Public** — Founders post the uncomfortable real stuff (milestones, bad days, the cleaned-bathrooms origin story). Events planned backwards from content output: fewer/bigger, open to public, everything free, key influencers invited, B-roll usable for 2–3 years.

## Translation to CA

### Tier 1 — run now

**A. Validity marketing (from #6) — the biggest steal.**
CA's proof inventory: 27 years family-run · 2,700+ customers · 75,000+ orders · camps reordering every season · 24–48hr proofs · US Squash, Yale Club, Crestwood as named accounts.
- B2B "restock" = **repeat-order proof**: "Crestwood has reordered 15 seasons straight." "7 of our top 15 customers are camps that come back every year."
- B2B "sellout" = **capacity scarcity**: "Spring camp-season production slots filled by March last year — reserve yours." Legit because production capacity is real.
- Actions: proof statement in every outbound template + reactivation email; a pre-season "slots are filling" blast to the dormant list (CA's version of the $1.36M restock email); post repeat-order milestones on LinkedIn (payoff mirrors Bloom's: customer trust + inbound + talent).
- Plugs directly into: reactivation loop, outbound-copy loop, pillar 3 page copy.

**B. Surround the buyer (from #8).**
Bloom signed the influencers the Target buyer follows. CA's buyers (camp directors, athletic directors, club managers) are a small findable world.
- Map where they congregate: ACA + Tri-State Camp Conference, camp-director FB groups, US Squash events/newsletters, trusted vendors/consultants in the camp world.
- Be visible in exactly those rooms (sponsor, speak, post, get referenced) so the buyer has seen CA everywhere *before* the cold email lands — or calls first.
- `ca-list-engine` builds the target list; this adds the air-cover layer on top of outbound.
- Bloom's moat note applies: every new vertical inherits CA's existing production + vendor relationships automatically.

**C. Boiler-room volume, in-house (from #1).**
The lesson is systematized volume with zero agencies — which is already pillar 2's thesis (Summer Camps: 10.1% reply). Industrialize it: dedicated list-building (scouting) → relationship ownership (Maclaine/Ryan) → relentless cadence → no outside marketing hires. The PDF is validation to go harder, not a new play.

### Tier 2 — strategic frames

**D. Expansion ladder (from #7).**
Saturated category = asset; nobody needs education on custom apparel. Bloom's rule mapped to verticals: don't open a new vertical until the current one's ceiling is hit. Camps + squash stay the base (Kenny, 7/12 interview). Timing signal for the next vertical (private clubs, pickleball/fencing, PTAs) = community demand + market size, not boredom. Selection criteria mirror Bloom's: large market, aesthetically underserved, barriers that favor CA (speed, in-house art, vendor relationships), overlap with existing infrastructure.

**E. Build in public (from #9) = pillar 4.**
Additions worth stealing: (1) post the uncomfortable real stuff — AOL email + paper workflows becoming AI systems IS the Bloom origin-story analog; (2) plan every event/customer visit backwards from content output — one filmed camp delivery day = years of B-roll for outbound, site, YouTube; (3) fewer, bigger moments over many small ones.

**F. Team as focus group (from #2).**
Maclaine as warm sender ≈ hire-your-avatar. Extension: treat top accounts (Crestwood, Driftwood, US Squash) as the standing focus group — what they ask for in January is what to pitch the whole vertical in February. Log requests as product/vertical signals.

### Tier 3 — discipline only, don't copy mechanics

- **#3 CPM math:** consumer-scale. Keep only the discipline: price any sponsorship (squash tournament, conference booth) against *qualified buyers reached*, never prestige.
- **#4 Kill the brief:** translate to testimonials — give customers product/photos and let them speak naturally; no scripted quotes. No coupon-code attribution; judge by inquiry lift.
- **#5 Speed of culture:** CA's version is seasonal timing (camp buying windows, back-to-school) + being early on channels buyers actually adopt (e.g., AI search/SEO for "custom camp apparel"), not TikTok Shop.

## Implementation artifacts (built 2026-08-20)

| Play | Artifact | Status |
|---|---|---|
| A. Validity marketing | `pillars/2-customer-acquisition/proof-statement-bank.md` | ✅ Tier 1 statements verified & usable now; Tier 2 needs one data.db session ([PULL] SQL included) |
| A. Restock/scarcity emails | `pillars/2-customer-acquisition/reactivation/validity-email-variants.md` | ✅ 3 drafts in Maclaine's voice, wired to reactivation loop guardrails; Variant B blocked on streak query |
| B. Surround the buyer | `pillars/2-customer-acquisition/surround-the-buyer-map.md` | ✅ Tri-State 2027 verified (Mar 9–11, booth apps open, hall sells out); free moves listed first |

**Blockers surfaced:**
- ⚠️ Site "75,000+ orders" vs ledger 25,662 — `[ASK KENNY]` before using order counts in new copy (proof bank uses ledger-safe numbers).
- Variant B (streak email — the strongest play) needs the streak SQL run in a CA workspace session where `data/data.db` exists.
- Tri-State booth decision has a real deadline: halls sell out; get the prospectus by Sept–Oct 2026.
- Scarcity claims must be confirmed true with Kenny before any send (guardrail: honest numbers only).
