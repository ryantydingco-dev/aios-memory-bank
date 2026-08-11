# Revenue operations implementation checklist

## Prepared locally now

- [x] Consolidated source-of-truth hierarchy and safety rules.
- [x] QuickBooks customer/order data dictionary.
- [x] Customer and order import/cleaning templates with synthetic examples only.
- [x] Four-segment framework: recent, seasonal/reorder, high-value, lapsed.
- [x] Draft 90-day Mailchimp calendar.
- [x] Four Mailchimp-ready draft templates.
- [x] Outcome-based offers for HR/People, event/marketing, recruiting, local offices, and
  trade-show exhibitors.
- [x] New-customer signal, qualification, outreach, and handoff rules.
- [x] One local workbook for pipeline, actions, campaign attribution, and dashboard.
- [x] Read-only local validator and daily/weekly view generator.
- [x] Automated unit tests and workbook formula/visual checks.

## Ryan/Kenny/Maclaine decisions required

- [ ] Confirm which system is the active pipeline entry point: local tracker as a temporary
  master, or HubSpot with a defined export/sync into the local view.
- [ ] Approve account owners and sensitive/high-value account handling rules.
- [ ] Approve the high-value threshold after seeing the spend distribution; or approve a
  human-only key-account list.
- [ ] Confirm stage probabilities or accept them as planning defaults.
- [ ] Approve offer capability: kitting, warehousing, multi-address shipping,
  personalization, packaging, sustainable alternatives, managed programs.
- [ ] Approve pricing/minimum/margin/rush/storage/shipping rules for each package.
- [ ] Approve every public proof point and customer story; remove unverified stories.
- [ ] Decide Ryan attribution/compensation rules for reactivation, reorders, stores, and
  multi-touch opportunities.

## QuickBooks data access required later

- [ ] Approve local storage location and retention for exports containing customer data.
- [ ] Export a fresh Customer Contact List with stable customer IDs.
- [ ] Export order/invoice detail with customer ID, transaction ID, dates, line
  descriptions/categories, quantities, and revenue.
- [ ] Export estimates/quotes if they are part of the real flow.
- [ ] Confirm whether order date, invoice date, or delivery date should drive recency.
- [ ] Map parent customers/jobs and duplicate entities with Maclaine.
- [ ] Reconcile pre-2025 historical ledger order dates for lapsed/seasonal analysis.
- [ ] Confirm current-year QuickBooks freshness and resolve QBO/ledger conflicts.
- [ ] Do not import real data until the above data contract is approved.

## Consent/privacy review required later

- [ ] Identify the legal/operational basis for marketing to each legacy contact.
- [ ] Obtain the current Mailchimp suppression/unsubscribe list, if one exists.
- [ ] Set `unknown` by default when evidence is absent.
- [ ] Approve the minimum fields allowed in Mailchimp; exclude revenue, A/R, and internal
  notes.
- [ ] Confirm physical-address, sender identity, preference center, and privacy language.
- [ ] Define retention/deletion for exported customer and campaign files.
- [ ] Approve who can view identifiable customer data and what can appear on camera.

## Mailchimp connection required later

- [ ] Ryan authorizes connection and audience selection.
- [ ] Map audience fields and configure merge-field fallbacks.
- [ ] Import a **25-contact permissioned pilot only**.
- [ ] Confirm suppression count, duplicates, and recipient preview.
- [ ] Build templates in Mailchimp and test plain text, mobile, links, footer, preference,
  and unsubscribe.
- [ ] Send internal tests only after approval.
- [ ] Human approves final subject, body, audience, schedule, and sender before each send.
- [ ] No automation or recurring journey is enabled in the pilot.

## Outbound sending required later

- [ ] Verify each public signal and source URL.
- [ ] Check against existing customers, active opportunities, exclusions, and the contact
  ledger.
- [ ] Approve list source, data handling, sender, domain/inbox, cadence, and copy.
- [ ] Produce any promised mockup/brief before the corresponding message.
- [ ] Human sends/starts the approved batch.
- [ ] Same-business-day reply owner is staffed.
- [ ] Every reply is pulled from automation and logged.

## Exact first inputs needed

Bring these to a 45-minute approval/data session:

1. **Pipeline decision:** “HubSpot-first” or “local tracker-first for the pilot,” plus who
   enters/updates each field.
2. **QuickBooks sample schema:** a redacted 10-row customer export and 20-row
   order/invoice-detail export with stable IDs and headers.
3. **Consent evidence:** current Mailchimp audience/suppression export or a written answer
   that no reviewed permission source exists yet.
4. **Account judgment:** 10 high-value/sensitive accounts with owner and
   `contact / do not contact / personal outreach only`.
5. **Timing judgment:** 10 known seasonal/reorder accounts with the real event/order month
   and how early CA should start.
6. **Capability decision:** yes/no/conditional for kitting, warehousing, multi-address
   shipping, personalization, packaging, sustainable alternatives, and managed stores.
7. **Pilot approval:** one 25-contact segment, one template, one owner, one staffed reply
   day. No send occurs in this session unless separately authorized.

## Activation sequence

1. Approve decisions and data contract.
2. Load redacted sample data locally and validate mappings.
3. Review segments with Maclaine/Kenny.
4. Review permission and suppressions.
5. Populate the tracker and reconcile existing HubSpot deals.
6. Build one Mailchimp pilot as a draft and run internal tests.
7. Approve recipient snapshot and send separately.
8. Run one week of daily/weekly cadence.
9. Reconcile any quote/order to QuickBooks.
10. Scale only if the workflow is reliable and outcomes are measured.
