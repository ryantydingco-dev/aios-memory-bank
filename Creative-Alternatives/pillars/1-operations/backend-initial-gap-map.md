# Backend Initial Gap Map — Creative Alternatives

> Drafted from current workspace evidence. This is not the final audit. It is the starting map for what to validate during the first backend walkthrough.

## Status definitions

- **Evidence-supported**: current workspace data/docs already show this is a real issue.
- **Likely gap**: high-probability based on current docs, but needs confirmation from a real order walkthrough.
- **Unknown**: important system area with insufficient evidence.

## Gap summary

| Gap ID | Gap | Status | Evidence | Risk | First validation step | Likely first fix |
|---|---|---|---|---|---|---|
| G-001 | QuickBooks data is not yet flowing into the local ops database | Evidence-supported | `data/data.db` only has SmartLead tables; ops docs say QuickBooks MCP/read-only rollout still pending | Reporting and automations require manual exports | Confirm QuickBooks MCP auth/permissions | Build read-only QB collectors after export-assisted v1 |
| G-002 | AR follow-up and payment visibility are cash bottlenecks | Evidence-supported | AR export analysis: about $671k owed, $378k past due, $63k 90+; 8-hour reconciliation pain documented | Cash drag, manual time, relationship risk | Export fresh AR aging + invoice/payment month | AR worklist + reconciliation exception report |
| G-003 | Item/job margin visibility is incomplete | Evidence-supported | QuickBooks product export analysis shows COGS = $0 on product lines | Pricing and customer/product profitability are unclear | Ask where costs are tracked outside QB | Add vendor cost/job margin fields to open-order tracker |
| G-004 | Operations workflow map is not filled in | Evidence-supported | `ops-discovery.md` still mostly `[CONFIRM]` | Cannot safely automate or scale volume | Run one-order backend walkthrough | Fill workflow map and gap register |
| G-005 | Purchase-order/printer workflow is under-mapped | Evidence-supported | Current docs list suppliers/vendors but do not show PO creation, confirmation, art handoff, or invoice matching process | Late jobs, wrong art, untracked costs | Walk one printer/decorator order end to end | PO/printer tracker with confirmation flags |
| G-006 | No proven single order/job ID across systems | Likely gap | Required order record field is `[CONFIRM]`; docs imply email/QB/vendor/proof fragmentation | Status confusion and hard reconciliation | Check 5 orders for shared ID across email, QB, PO, proof, shipping | Create internal `CA-YYYY-####` job ID convention |
| G-007 | Email may be the hidden operational system | Likely gap | Audit docs explicitly ask about email/search/retyping; Kenny's AOL and scattered manual workflows mentioned in context | Information buried in threads; fragile handoffs | Identify active inboxes and labels; trace one order thread | Shared order intake/status convention |
| G-008 | Spreadsheets may be shadow systems | Likely gap | Import README expects Kenny's spreadsheets; ops checklist still unknown | Conflicting truth, formula risk, knowledge dependency | Inventory all weekly spreadsheets | Spreadsheet inventory + keep/clean/replace decision |
| G-009 | Proof approval may not be tied to order/PO status | Likely gap | Current workflow map has proof/approval as a blank step; proof is known to be a key speed differentiator | Wrong proof, stalled approval, late production | Trace where approved proof lives for one order | Proof status field + approval evidence link |
| G-010 | Reorder timing is not systematized | Evidence-supported | QuickBooks analysis found 118 reorder-due accounts; docs say warm engine depends on QB list | Missed repeat revenue | Confirm seasonality and owner for top 25 reorder-due accounts | Weekly reorder-due worklist |
| G-011 | Vendor invoice matching to customer jobs is unknown | Unknown | Supplier expense data exists, but job-level matching is not documented | Margin blindness and payment errors | Ask who checks vendor invoice against customer order | Add vendor invoice match field to PO tracker |
| G-012 | Shipping/tracking visibility is unknown | Unknown | Shipping/delivery workflow is blank in ops discovery | Customer status friction and delayed invoicing | Trace tracking for one shipped order | Tracking field in open-order tracker |

## Highest-leverage investigation order

1. **One printer/decorator order walkthrough**
   - Validates G-004 through G-009, G-011, and G-012 in one sitting.

2. **Fresh AR + reconciliation export**
   - Validates current state of G-002 and gives immediate cash/time target.

3. **Spreadsheet inventory**
   - Validates G-008 and exposes shadow systems.

4. **Vendor master pass**
   - Validates G-005 and G-011 across top vendors.

## First operating hypothesis

CA probably does not need a big new backend platform first. It needs a **thin operating layer** that sits across the existing systems:

- one internal job ID
- one open-order tracker
- one PO/printer tracker
- one AR/reconciliation worklist
- one gap register

Once that layer is used for a few weeks, the highest-repeat loops can become automations.

## What would prove this gap map wrong

- QuickBooks already has complete estimates, POs, projects, bills, proof links, vendor cost matching, and order status.
- There is already a trusted open-order tracker that Kenny and Maclaine use daily.
- Vendor confirmations, proofs, tracking, invoices, and payments already share one job/order ID.
- Product/job margin is already tracked outside QuickBooks and used consistently.

If any of those are true, update this map before building.

