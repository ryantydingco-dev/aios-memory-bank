# LEAD411 Mobile Enrichment — Progress Log

Method: Free DOM scan of each company's employee list. Unlock (1 credit) ONLY when a
mobile is available for the named decision-maker or another owner/exec-level contact.
"owner_mobile_source" records WHO the mobile belongs to + LEAD411.

Confidence rubric:
- high  = exact named decision-maker (CSV) matched, mobile unlocked
- medium = different owner/co-owner/president/founder/CEO at same company, mobile unlocked
- low   = non-owner exec (VP/GM/etc.) mobile used as fallback
- (blank) = no mobile available in LEAD411

| # | company | csv_decision_maker | result | owner_mobile | source | confidence |
|---|---------|--------------------|--------|--------------|--------|------------|
| 1 | Access Analytical, Inc. | Ashley Amick (Owner) | owner NOT in LEAD411; only 1 contact, no phone | | | |
| 2 | BUILD ON YOUR LAND LLC | Jared Oswalt (Co-Owner) | Jared=CEO no mobile; Tim Rawlings Co-Owner HAS mobile | 912-674-1695 | LEAD411 — Tim Rawlings, Co-Owner | medium |
| 3 | Top to Bottom Cleaning & Handyman | Natalie Ray (Company Owner) | owner listed, no mobile available | | | |
| 4 | Tryon Title Agency, LLC | John Young (Co-Owner) | EXACT match; mobile unlocked (843 = SC) | 843-616-2728 | LEAD411 — John Young, Co-Owner | high |
| 5 | Simply Southern Homebuilder | Lisa Cornelius (President/Owner) | EXACT match; mobile unlocked (co. line=CSV phone) | 843-368-4164 | LEAD411 — Lisa Cornelius, President/Owner | high |
| 6 | PMI Charlotte Metro | Samantha Smart (Owner & Co-Founder) | NOT in LEAD411 (no co. by name/domain pmicharlottemetro.com; person absent) | | | |
| 7 | Magnolia Custom Homes LLC | Susan Walter (President/Co-Owner) | owner NO mobile; only non-owner mobiles avail (Jonathan Walter-Superintendent, Kenneth Walter-Constr Mgr) — skipped per owner-only rule | | | |
| 8 | LIT Technology Solutions (=Lexington IT Solutions) | Scott Toombs (Business Owner) | EXACT match; mobile unlocked (610 area code per LEAD411) | 610-732-8427 | LEAD411 — Scott Toombs, Business Owner | high |
| 9 | Wooley Family Dentistry | Ted Wooley (Owner) | owner listed, no mobile available | | | |
| 10 | Fairfield Family Dentistry | Neil Wrenn (Dentist and Owner) | owner listed (drwrenn.com), no mobile available | | | |
| 11 | Tallento Corp | Daniel Martins (Company Owner / CEO) | EXACT match; mobile unlocked (203=CT HQ) | 203-252-7000 | LEAD411 — Daniel Martins, Owner/CEO | high |
| 12 | Synergy Spray Foam & HVAC | Todd Bolton (General Manager/Owner) | EXACT match; mobile unlocked (803=SC) | 803-239-8314 | LEAD411 — Todd Bolton, GM/Owner | high |
| 13 | Senior Care Solutions and Services | Noel Desmarteau (Co-Owner/VP Ops) | Noel NO mobile; Ashley DesMarteau (CEO, family/owner-level) HAS mobile | 864-247-0234 | LEAD411 — Ashley DesMarteau, CEO | medium |
| 14 | FARRAR® (Farrar Scientific, Trane subsidiary) | Sylvain Riendeau (Co-Owner) | DM not in LEAD411 list; only non-owner staff have mobiles — skipped per owner-only rule | | | |

---

## STATUS (paused 2026-05-31)
- Rows 1–14 processed. **7 mobiles found** (#2,4,5,8,11,12,13). ~8 of 50 reveal credits used.
- Output file: `Manual_Text_Call_Queue_Top_50_enriched.csv` (same folder). Rebuild script: `aios-starter-kit/scripts/enrich_top50_mobiles.py` (edit the `F` dict with new findings, re-run).
- Rows 15–50 = `pending` (not processed).

## CRITICAL operational caveat (why it paused)
LEAD411's search box ONLY accepts typed input when its Chrome window is the **front-most OS window**. While the user reads the Claude chat, that window is backgrounded and keystrokes silently don't register (input value stays empty, `document.visibilityState`='hidden'). To resume, the Chrome window must stay foreground for the whole burst.

## Working recipe (per company)
1. On a dashboard tab, click search box (~x832,y32), `cmd+a`, `Backspace`, type company name, wait 3s.
2. Read suggestions via JS (filter by CSV **domain** to disambiguate — several companies share names). Click the matching suggestion → opens company tab.
3. JS-extract employee rows: a contact has a mobile if its Direct Phone cell text matches `Mobile\s*Unlock To View`. Pick: exact decision-maker match > owner-level title (owner/co-owner/president/founder/CEO/chief exec/principal/partner) > skip. Do NOT unlock non-owner staff.
4. Unlock: click the target row's Mobile "Unlock To View" (`.unlock-to-view-btn`), scrollIntoView first for coords. Costs 1 credit.
5. Read revealed number: the **mobile** is the number after the `phone_iphone` icon; `high_quality` icon = company/direct line (ignore for mobile).
- Autocomplete component degrades after ~6 searches → reload dashboard to reset.
- Confidence: high = exact named DM; medium = different owner/co-owner/CEO at same co.; (blank) = none.

## Remaining to process (rank | company | decision-maker, title | domain to match)
15 W.O. Blackstone & Co. | Jeff Griffin, Owner/President | woblackstone.com
16 Phoenix Construction Group | Chris Nye, Owner/President | phxcg.com
17 RayWell Solar | Kasey Harwell, Co-Owner | raywellsolar.com
18 Mechanical Systems Technology | Scott Tripp, Owner | mst-hvac.com
19 Prescott Apothecary | Rachel Prescott, Owner | prescottapothecary.com
20 CONSTANTINE ENGINEERING ASSOC | Chris Constantine, Owner | theceateam.com / constantineengineering.com
21 Vigilant Restoration SE | Leigh Sancilio, Co-Owner | vigilant-se.com
22 PURE Compounding Rx | Forrest Westley, Owner | pure-compounding.com
23 LEL Critical | Lee Lancaster, President/Founder | lelcritical.com / wearelel.com
24 Bald Cypress Builders | Matthew Pocta, President/Co-Founder | baldcypressbuilders.com
25 Re-Builders, Inc. | Ray Floyd, Founder/President | rebuildersmyrtlebeach.com
26 Rowe Ventures Realty | Blake Sloan, Founder/President | roweventures.com / srgmail.com
27 Addison Homes | Todd Usher, Founder/President | addison-homes.com
28 Horizon Scientific | Laura Steiner, President | horizonscientific.com
29 Twin Services, Inc | Ed Fugatt, President | twinservicesinc.com / twinsi.com
30 FQS Bear Equipment | Shannon Troglauer, Co-VP Operations | fqs-inc.com
31 Briggs Plumbing Products | Nelda Diegel, VP Administration | briggsplumbing.com
32 Southern MEP Inc. | Derek Bindewald, VP Operations | southernmep.com
33 cs roofing | Richard Cox, President | csroofingcompany.com / csiinc.com
34 W. B. Guimarin & Co. | Scott Davis, VP of Service | wbguimarin.com
35 Plumbsquads | Christoph Peay, President | plumbsquads.com
36 Complete HVAC | Brian Tuten, VP of Operations | completersinc.com
37 Airmaster Fan Company | Greg Helbling, VP Sales/Marketing | airmasterfan.com
38 Tideland Utilities | Mark Dill, President | tidelandutilities.com
39 Liberty Mechanical Inc. | Dave Macias, VP Sales/BizDev | lmipro.com
40 American Fire Protection | Doug Greer, President | afirepro.com
41 David Gooding Inc. | George Gooding, Senior VP | goodingd.com
42 Arctic Air, Inc. | Valarie Ipad, President | arcticair.biz
43 Duraclean | Courtney Johnson, General Manager | duraclean.net
44 Tri State Life Safety & Electric | Christopher Nash, GM | tristatelifesafety.com
45 Summerville Cpw | Chris Kahler, GM | summervillecpw.com
46 STARR-IVA WATER & SEWER DISTRICT | Patrick Jackson, GM | siwater.net
47 Terry R. Lee Contracting | Chad Frederick, GM | terryleecontracting.com
48 South Island PSD | Papu Tafao, GM | southislandpsd.com
49 GRAY'S HEATING & AIR COND | Patrick Bensch, GM | graysinc.com
50 IVI Inc. | Jesse Kraina, GM | ivinc.com
(Note: #43–50 are GM-led — for these the GM IS the named decision-maker, so capturing the GM's mobile is on-target = high if exact match.)
