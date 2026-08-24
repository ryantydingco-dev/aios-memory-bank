# Proof-Statement Bank — CA's Validity Marketing Arsenal

> Bloom play #6 ("'Restock' is the most powerful word"): attach proof statements to the brand at every opportunity.
> Source strategy: `reference/bloom-playbook-translation.md`. Every statement below is tagged VERIFIED (safe to use anywhere),
> SITE-CLAIM (on creativealternatives.com but conflicts with or isn't in our data), or [PULL] (needs one query in a CA
> workspace session with `data/data.db`).
> Rule (operator's code): **nothing unverified goes into outbound.** Use VERIFIED now; upgrade with [PULL] stats when run.

## ⚠️ Source-of-truth conflict — resolve before using order counts

- Site says **"75,000+ orders · 2,700+ customers."** Kenny's ledger says **25,662 lifetime orders** (1999–2026).
- Possible explanation: site counts items/pieces or includes pre-1999 history; ledger counts invoices. `[ASK KENNY]`
- Until resolved: use **"25,000+ orders"** (ledger-safe) or **"tens of thousands of orders"** in anything we write. Don't repeat 75,000 in new copy.
- "2,700+ customers" is consistent with the ledger (2,700+ lifetime names) → safe.

## Tier 1 — VERIFIED, use today

**Longevity / scale**
- "Family-run since 1999 — 27 years printing for the same community." ✅
- "2,700+ organizations served · 25,000+ orders delivered." ✅ (ledger)
- "$32M+ of custom gear produced over 27 years." ✅ (ledger — external-safe version: "tens of millions in gear")
- "550+ organizations ordered from us last year alone." ✅ (559 active customers, 2025 ledger)

**Repeat-order proof (the B2B "restock")**
- "7 of our 15 biggest customers are summer camps — and they come back every season." ✅ (2025 top-15)
- "111 of our customers came to us because another customer sent them." ✅ (CUSTOMERS sheet: 111 'through another account')
- "The squash world brought us 117 customers by word of mouth." ✅ (CUSTOMERS sheet) — use in squash outbound only
- "US Squash, the Yale Club of NY, Crestwood, Driftwood Day Camp — names that reorder year after year." ✅ (2025 top customers; get Kenny's OK before naming customers in public copy `[ASK KENNY]`)

**Speed (the brand promise)**
- "Digital proof in 24–48 hours — see your logo on the product before you commit." ✅ (site + confirmed process)
- "~2-week production once you approve." ✅
- "We invoice once you're satisfied." ✅ (confirmed model; deposits for some first-timers)

**Resilience (investor/recruit/press flavor — for build-in-public content, not customer emails)**
- "Margins held ~32% for 27 straight years — through 2008, COVID, and a doubling of the business." ✅ (ledger)
- "Zero outside marketing for 25 years; the business doubled 2023→2024 on word-of-mouth alone." ✅

## Tier 2 — [PULL] one query each in a CA session (data.db → sales_ledger)

These are the strongest statements Bloom-style ("restocked 3x" energy). Run in the CA workspace where data.db exists:

```sql
-- Longest consecutive-year customer streaks ("15 seasons straight")
WITH years AS (
  SELECT customer, CAST(strftime('%Y', date) AS INT) AS yr
  FROM sales_ledger GROUP BY customer, yr
)
SELECT customer, COUNT(*) AS total_years, MIN(yr) AS first, MAX(yr) AS last
FROM years GROUP BY customer
HAVING total_years >= 10 ORDER BY total_years DESC LIMIT 25;
```

```sql
-- Camp-season concentration ("we produce for N camps every spring — slots are real")
SELECT strftime('%m', date) AS month, COUNT(DISTINCT customer) AS customers, SUM(retail) AS sales
FROM sales_ledger WHERE date >= '2024-01-01'
GROUP BY month ORDER BY month;
```

Statements these unlock (fill in the numbers):
- "{{Customer}} has ordered from us {{N}} seasons straight." ← the single best line in any reactivation email to that customer
- "{{N}} camps trust us with their gear every single summer."
- "Our spring production calendar filled by {{month}} last year." ← the honest scarcity line; verify with the seasonality query + Kenny before use
- "Customers who started with us in {{year}} are still ordering today."

## Tier 3 — earned proof to capture as it happens (the Bloom screenshot playbook)

- Screenshot every reorder email from a long-time camp → post (with permission) on LinkedIn/IG: "14th season printing for {{camp}}."
- Photo of the production floor during camp-season peak → "spring slots are real" proof.
- Kenny's handwritten/AOL-era ledger next to the new dashboard → build-in-public gold (pillar 4).
- Every ≥10.1%-reply campaign result → public proof for the YouTube series AND partner outreach.

## Where these get injected

1. **Reactivation emails** — 1 proof line max per email (see `reactivation/validity-email-variants.md`), always specific to the recipient's segment.
2. **Cold outbound (SmartLead)** — swap generic credibility lines in live sequences for a VERIFIED statement. Test via the outbound-copy loop: proof-line variant vs. current control.
3. **Site page copy** (pillar 3) — hero + private-club/corporate pages get the longevity + repeat-proof lines.
4. **LinkedIn / build-in-public** (pillar 4) — Tier 3 earned proof, one post per milestone.
5. **Partner outreach** — resilience stats (margin stability, doubling) are the partner-facing proof.
