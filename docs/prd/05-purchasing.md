# PRD 05: SO-M5 Purchasing

| Field | Value |
|---|---|
| Milestone | `SO-M5 Purchasing` |
| Story prefix | PUR |
| Depends on | SO-M2, SO-M3 |

## Goal

The shop buys stock in an organised way. Mona orders from her cosmetics supplier, receives the boxes (sometimes only part of them), and stock goes up. The supplier balance shows what she owes, and product costs stay correct so profit reports tell the truth.

## Words you need

| Word | Meaning |
|---|---|
| Purchase order (PO) | A list of what we asked a supplier to send, at what cost. It does not change stock. |
| Goods receipt | What really arrived on one delivery. This is what changes stock. |
| Supplier bill | What we owe the supplier for a receipt. |
| Partial receipt | Only part of the PO arrived. The rest is still expected. |
| Weighted average cost | New cost = (old qty × old cost + new qty × new cost) / (old qty + new qty). |

## Business rules

- A PO never changes stock. Only a goods receipt does.
- You cannot receive more than ordered on a line (extras go through a stock adjustment).
- PO status flow: Draft → Sent → Partially received → Received. Draft or Sent can go to Cancelled.
- Only owners and managers create POs and receive goods. Cashiers can view.

## User stories

| ID | Story |
|---|---|
| PUR-1 | As an owner or manager, I want to create a purchase order (PO) for a supplier with products, quantities and costs, so that I have a record of what I ordered. |
| PUR-2 | As an owner, I want to create a PO from the low-stock list with suggested quantities, so that reordering takes one minute. |
| PUR-3 | As a manager, I want to receive goods against a PO, fully or partly, so that stock goes up by what really arrived. |
| PUR-4 | As an owner, I want receiving to create a supplier bill and update the supplier balance, so that I know what I owe. |
| PUR-5 | As an owner, I want to record payments to suppliers, so that the balance goes down. |
| PUR-6 | As an owner, I want product cost to update when new stock arrives at a different price (weighted average), so that profit is correct. |

## Acceptance criteria

**PUR-1**
- Given supplier "Nile Cosmetics", When I create a PO with 2 lines and save, Then the PO is "Draft" with number `PO-2026-00001`.
- Given a PO is "Sent", When I try to edit quantities, Then I can, until the first receipt. After a receipt, lines are locked.
- Given the contact is a customer only, When I pick it as supplier, Then it does not appear in the supplier picker.

**PUR-2**
- Given 3 products are low, When I click "Create PO" on the low-stock page and pick a supplier, Then a draft PO opens with those 3 products and quantity = (min stock × 2) − available, at the last cost.

**PUR-3**
- Given a PO for 100 units, When I receive 60, Then on hand goes up by 60 (movement reason "purchase"), and the PO shows "Partially received 60 / 100".
- Given the rest arrives, When I receive 40, Then the PO status is "Received".
- Given 40 are left, When I try to receive 50, Then I see "You can receive at most 40."

**PUR-4**
- Given I receive 60 units at 25 EGP, When the receipt is saved, Then a bill of 1,500 EGP is created and the supplier balance shows we owe 1,500 EGP.

**PUR-5**
- Given we owe the supplier 1,500 EGP, When I record a payment of 1,000 EGP by bank transfer, Then the balance shows we owe 500 EGP.

**PUR-6**
- Given product X has 10 units at cost 20, When 10 units arrive at cost 30, Then the new cost is 25.
- Given on hand is 0, When units arrive at cost 30, Then the new cost is 30.

## Data model

| Table | Key columns | Notes |
|---|---|---|
| `purchase_orders` | `id`, `shop_id`, `number`, `supplier_id` (contacts), `status` (`draft`/`sent`/`partially_received`/`received`/`cancelled`), `expected_date`, `total`, `created_by`, `created_at` | |
| `purchase_lines` | `id`, `shop_id`, `po_id`, `product_id`, `qty_ordered`, `qty_received`, `unit_cost` | |
| `goods_receipts` | `id`, `shop_id`, `po_id`, `received_by`, `received_at`, `note` | One per delivery. |
| `goods_receipt_lines` | `id`, `shop_id`, `receipt_id`, `po_line_id`, `product_id`, `qty`, `unit_cost` | Each line creates one stock movement. |
| `supplier_bills` | `id`, `shop_id`, `supplier_id`, `receipt_id`, `number`, `total`, `paid_total`, `due_date` | Adds a ledger entry in `contact_ledger`. |
| `products.cost_price` | from SO-M2 | Updated by weighted average on receipt. |

## Screens

| Screen | Description |
|---|---|
| Purchase orders list | Number, supplier, date, status, total, received %. Filter by status and supplier. |
| PO editor | Supplier, expected date, lines with product search, quantity and cost. Buttons: Save, Mark sent, Share PDF on WhatsApp, Cancel. |
| Receive goods | Opens from a PO. Each line shows ordered, already received, and an input "receiving now" (prefilled with the rest). Cost can be edited per line. |
| Supplier balance | The contact detail page from SO-M3, with tabs "Bills" and "Payments". |

## Edge cases

- Supplier sends a different cost than on the PO. Use the cost entered at receipt, not the PO cost.
- Receiving for a cancelled PO. Block it.
- Cancelling a PO that is partly received. Allowed. Only the remaining quantity is cancelled.
- Supplier sends extra free units. v1: receive up to ordered quantity only, and use a stock adjustment for the free ones.
- Weighted average when on hand is negative (should not happen because of the SO-M2 rule). Treat as 0.

## Out of scope

- Supplier price lists and automatic reorder.
- Landed costs (shipping, customs added to cost).
- Purchase returns to the supplier (use a stock adjustment plus a manual ledger entry in v1).

## Skills you'll use

| Week 1 doc | How |
|---|---|
| 05 PRD | Procure-to-pay flow from the ERP PRD |
| 11 backend basics | Transactions, foreign keys |
| 12 design patterns | Observer: `stock.changed` from receipts closes low-stock alerts |
| 15 QA testing | Unit tests for weighted average, e2e for partial receiving |
| 02b worktrees | Work on receiving and supplier payments in parallel worktrees |

## Hints

1. Reuse `apply_stock_movement()` from SO-M2 for every receipt line, with reason `purchase` and `ref_type = 'goods_receipt'`. Do not write a second way to change stock.
2. Write the weighted average as a pure function `newCost(onHand, oldCost, qtyIn, costIn)` with unit tests for 0 on hand, decimal quantities and large numbers. Then call the same rule inside the receive transaction.
3. Store `qty_received` on the PO line but compute PO status from the lines (all received → received; some → partially received). Do not let status and quantities disagree.
4. Reuse the document number Factory from SO-M4 with prefix `PO`. One counter per shop per type.
5. When the receipt saves, the `stock.changed` event fires. Your low-stock listener from SO-M2 should resolve the alert by itself. Write a test that proves it.
