# Recency Remediation Report — 2026-05-31

Applied the recency guardrail (`recency_guardrail.py`) to existing Oloxa lead CSVs. Datable signals that cannot be timestamped are down-ranked and capped at LOW confidence; no dates were fabricated. Bailey Moore is corrected with sourced dates (NACFB award Sep 2025; 10-yr anniversary 2025 from 2015 incorporation, Companies House 09250316).

## Oloxa_Daily_Top_20_Initial.csv

- Rows: **20** · confidence changed: **18** · next-action changed: **6**
- Recency tiers: `UNDATED` 6, `FRESH` 5, `RECENT` 4, `N/A` 3, `AGING` 2

| # | Lead | Signal | Score | Conf | Action | Tier | Date source | Flag |
|---|------|--------|-------|------|--------|------|-------------|------|
| 1 | George Settle | CLOSING | 47 | HIGH | READY_FOR_LINKEDIN | `FRESH` | 1 month ago |  |
| 2 | Don O'Henly | HIRING | 45→31 | HIGH→**LOW** | READY_FOR_LINKEDIN | `RECENT` | 2 months ago |  |
| 3 | Matt Wood | PAIN | 45 | HIGH | READY_FOR_LINKEDIN | `N/A` | — |  |
| 4 | Jimmy Chan | CLOSING | 44→18 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | Jan 2025 | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 5 | Bailey Moore | CLOSING | 44→18 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | 5 months ago | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 6 | Shahbaz khan | VOLUME | 43→17 | HIGH→**LOW** | READY_FOR_EMAIL→**NEEDS_RESEARCH** | `UNDATED` | last 3 months | PRIMARY SIGNAL UNDATED (VOLUME): the opener anchor has no date — treat as stale … |
| 7 | Mariam Menebhi | CLOSING | 43 | HIGH→**MEDIUM** | READY_FOR_LINKEDIN | `FRESH` | 1 month ago |  |
| 8 | Linzi Crellin | VOLUME | 42 | HIGH→**MEDIUM** | READY_FOR_EMAIL | `FRESH` | 2 weeks ago |  |
| 9 | Alfie Hall | CLOSING | 42 | HIGH→**MEDIUM** | READY_FOR_LINKEDIN | `FRESH` | 3 weeks ago |  |
| 10 | Chris Solinski | HIRING | 42→29 | HIGH→**LOW** | READY_FOR_LINKEDIN | `RECENT` | 2 months ago |  |
| 11 | Grant McIntyre | CLOSING | 41→16 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | 2026 | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 12 | Robert Meunier | CLOSING | 41→29 | HIGH→**LOW** | READY_FOR_LINKEDIN | `RECENT` | last 6 weeks |  |
| 13 | Michael Bucaro | CLOSING | 41 | HIGH→**MEDIUM** | READY_FOR_LINKEDIN | `FRESH` | 1 week ago |  |
| 14 | Justin Bunch | HIRING | 41→16 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | last 4 months | PRIMARY SIGNAL UNDATED (HIRING): the opener anchor has no date — treat as stale … |
| 15 | Lisa Eagle | CLOSING | 40→16 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | 7 months ago | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 16 | Matthew Beal | CLOSING | 40→16 | HIGH→**LOW** | READY_FOR_LINKEDIN | `AGING` | last 7 months | AGING CLOSING: freshest dated proof 'last 7 months' (AGING) — soften any 'this w… |
| 17 | Dillon Freeman, CFA | PAIN | 40 | HIGH→**MEDIUM** | READY_FOR_LINKEDIN | `N/A` | — |  |
| 18 | Jeff Singleton | PAIN | 40 | HIGH→**MEDIUM** | READY_FOR_LINKEDIN | `N/A` | — |  |
| 19 | Chaston Montgomery, MBA | CLOSING | 39→27 | HIGH→**LOW** | READY_FOR_LINKEDIN | `RECENT` | last 60 days |  |
| 20 | Jody Hill | HIRING | 39→16 | HIGH→**LOW** | READY_FOR_LINKEDIN | `AGING` | 2026 | AGING HIRING: freshest dated proof '2026' (AGING) — soften any 'this week' frami… |

## Oloxa_Daily_Top_20_Monday.csv

- Rows: **20** · confidence changed: **20** · next-action changed: **20**
- Recency tiers: `UNDATED` 20

| # | Lead | Signal | Score | Conf | Action | Tier | Date source | Flag |
|---|------|--------|-------|------|--------|------|-------------|------|
| 1 | Mario Haughton | CLOSING | 65→26 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | 2015 | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 2 | Ollie Furniss | HIRING | 65→26 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (HIRING): the opener anchor has no date — treat as stale … |
| 3 | Vanessa Spires | CLOSING | 65→26 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 4 | Alex Desborough | CLOSING | 65→26 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 5 | Lucy Ratcliffe | CLOSING | 64→26 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 6 | Alessandro Cappuccio | CLOSING | 64→26 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 7 | Ethan Wood | CLOSING | 64→26 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 8 | Wesley Bellato | CLOSING | 63→25 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 9 | Nurul Amin | CLOSING | 62→25 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 10 | George Francis | CLOSING | 62→25 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 11 | Andrew Shaw | CLOSING | 62→25 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 12 | Antony Johnson | CLOSING | 62→25 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 13 | Olly Mullings | CLOSING | 62→25 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 14 | Craig ONeil | CLOSING | 60→24 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 15 | Jonathan Gras | CLOSING | 60→24 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 16 | Sarah Irons | CLOSING | 60→24 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 17 | Edrony Joseph | CLOSING | 59→24 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 18 | Theresa Chieng | CLOSING | 59→24 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 19 | Ryan Leopold | CLOSING | 59→24 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
| 20 | Noah Borden | CLOSING | 58→23 | HIGH→**LOW** | READY_FOR_LINKEDIN→**NEEDS_RESEARCH** | `UNDATED` | — | PRIMARY SIGNAL UNDATED (CLOSING): the opener anchor has no date — treat as stale… |
