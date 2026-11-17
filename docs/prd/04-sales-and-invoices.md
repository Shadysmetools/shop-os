# PRD 04: SO-M4 Sales and Invoices

| Field | Value |
|---|---|
| Milestone | `SO-M4 Sales and Invoices` |
| Story prefix | SAL |
| Depends on | SO-M2, SO-M3 |

## Goal

This is the milestone that makes Shop OS worth paying for. A cashier sells in seconds with a barcode scanner and prints an Arabic receipt. A distributor's rep turns a quotation into an order and an invoice without retyping. Stock, customer balances and the owner's numbers update by themselves. After this milestone, the **first pilot shop** goes live.

## Two ways to sell

| Flow | Who uses it | Steps |
|---|---|---|
| Quick sale (POS) | Ahmed's cashier, walk-in customer | Scan, scan, pay, receipt. One screen. Creates a paid invoice directly. |
| Document flow | Youssef's reps, B2B customers | Quotation → Order (confirm reserves stock) → Invoice (delivers stock) → Payment |

## User stories

| ID | Story |
|---|---|
| SAL-1 | As a cashier, I want a quick sale screen where I scan barcodes, change quantities and take payment, so that a customer is served in under 30 seconds. |
| SAL-2 | As a rep, I want to create a quotation for a customer with lines, prices and discounts, so that the customer can approve it. |
| SAL-3 | As a rep, I want to convert a quotation to an order with one click, and confirming the order reserves stock (D3), so that I never promise the same unit twice. |
| SAL-4 | As a rep, I want to turn a confirmed order into an invoice, which delivers the stock, so that the customer is billed for what they got. |
| SAL-5 | As a cashier, I want to take payment by cash, card or credit (on account), including split payment, so that every way customers pay is recorded. |
| SAL-6 | As a cashier, I want to print or share a receipt and download an Arabic invoice PDF with the shop logo, so that the customer has proof. |
| SAL-7 | As an owner, I want any discount over 20% to put the sale in "Pending approval" until I approve it (D1), so that staff cannot give away my margin. |
| SAL-8 | As a cashier, I want to record a return against an invoice with a reason, which adds stock back as "returned" (D2) and refunds or credits the customer. |
| SAL-9 | As an owner, I want to cancel a draft or confirmed order, which releases the reserved stock. |
| SAL-10 | As a cashier, I want to see only my own sales, and the owner sees everyone's (D4). |

## Acceptance criteria

**SAL-1**
- Given the quick sale screen is open, When I scan the same barcode twice, Then one line shows quantity 2.
- Given available stock is 1, When I try to add quantity 2, Then I see "Only 1 available" and quantity stays 1.
- Given I press "Pay cash" with 500 EGP for a 430 EGP total, When I confirm, Then change due shows 70 EGP, the invoice is "Paid", and stock drops by the sold quantities.

**SAL-2 / SAL-3**
- Given a quotation with 10 units of product X, When I click "Convert to order" and "Confirm", Then the order status is "Confirmed", reserved for X goes up by 10, and available goes down by 10. On hand does not change.
- Given available for X is 6, When I confirm an order for 10, Then I am stopped: "Only 6 available for X."

**SAL-4**
- Given a confirmed order for 10 units, When I create the invoice, Then on hand goes down by 10, reserved goes down by 10, the order shows "Invoiced", and the customer ledger gets +total.

**SAL-5**
- Given a 1,000 EGP invoice, When I pay 600 cash and 400 on credit, Then the invoice is "Partially paid" and the customer balance increases by 400.
- Given a walk-in customer (no contact), When I choose "credit", Then I must pick or create a contact first.

**SAL-6**
- Given a paid invoice in an Arabic shop, When I download the PDF, Then it shows the logo, shop name, Arabic text right to left, invoice number, lines, totals and "شكرا لزيارتكم".
- Given an 80 mm thermal printer, When I click "Print receipt", Then the receipt fits the paper width.

**SAL-7**
- Given I am a cashier, When I set a 25% discount on a line, Then the sale is saved as "Pending approval" and I cannot take payment.
- Given a sale is pending, When the owner opens "Approvals" and clicks "Approve", Then the cashier sees it unlocked and can take payment. Approver and time are saved.
- Given a 20% discount exactly, When I save, Then no approval is needed.
- Given I am the owner, When I give 25% myself, Then it is approved at once and logged.

**SAL-8**
- Given an invoice sold 3 units, When I return 1 with reason "faulty", Then a stock movement +1 with reason "returned" is created and a credit note of the line price is issued.
- Given 3 units were sold, When I try to return 4, Then I see "You can return at most 3."

**SAL-9**
- Given a confirmed order reserved 10 units, When I cancel it, Then reserved goes down by 10. An invoiced order cannot be cancelled; it needs a return.

**SAL-10**
- Given I am cashier Sara, When I open "Sales", Then I see only sales where `created_by` is me, also when I call the API directly.

## Data model

| Table | Key columns | Notes |
|---|---|---|
| `sales_documents` | `id`, `shop_id`, `type` (`quotation`/`order`/`invoice`/`credit_note`), `number`, `contact_id`, `status`, `source_id` (quote → order → invoice), `subtotal`, `discount_total`, `tax_total`, `total`, `paid_total`, `created_by`, `created_at` | One table, many types. `number` unique per shop and type, e.g. `INV-2026-00042`. |
| `sales_lines` | `id`, `shop_id`, `document_id`, `product_id`, `qty`, `unit_price`, `discount_pct`, `unit_cost` (snapshot), `line_total` | Cost snapshot makes profit reports correct later. |
| `stock_reservations` | `id`, `shop_id`, `order_id`, `product_id`, `qty`, `released_at` | Feeds `reserved` in the `stock_levels` view. |
| `approvals` | `id`, `shop_id`, `document_id`, `reason` (`discount_over_20`), `requested_by`, `status` (`pending`/`approved`/`rejected`), `decided_by`, `decided_at` | |
| `payments` | from SO-M3, plus `document_id` | |
| `doc_counters` | `shop_id`, `doc_type`, `year`, `last_number` | For gap-free numbers per shop. |

Statuses: Quotation (Draft, Sent, Converted, Expired). Order (Draft, Pending approval, Confirmed, Invoiced, Cancelled). Invoice (Unpaid, Partially paid, Paid, Returned).

## Screens

| Screen | Description |
|---|---|
| Quick sale | Left: big search/scan box and product tiles. Right: cart with lines, qty +/-, discount, total in big numbers, buttons Cash / Card / Credit / Split. Works on a tablet. Keyboard shortcuts (F2 search, F9 pay). |
| Sales list | Tabs: Quotations, Orders, Invoices, Returns. Filters by status, date, customer, seller. |
| Document editor | Customer, lines, discounts, notes. Buttons change with status: Send, Convert, Confirm, Invoice, Cancel. |
| Approvals | Owner only. List of pending sales with seller, discount and margin impact. Approve / Reject. Badge count in the menu. |
| Receipt / PDF preview | Print and "Share on WhatsApp" (link to the PDF). |
| Return dialog | Pick invoice, pick lines and quantities, reason, refund method (cash or credit to account). |

## Edge cases

- Network drops while paying. Use an idempotency key so retry does not create two invoices.
- Two reps confirm orders for the last 5 units at the same time. Only one succeeds (same lock as SO-M2).
- Price changes after a quotation is sent. The quotation keeps its prices.
- Rounding: 3 items at 33.333. Round each line to 2 decimals and sum lines.
- Owner rejects a pending discount. The sale returns to Draft with a message to the cashier.

## Out of scope

- Taxes beyond one optional VAT % per shop. ETA e-invoicing integration (later).
- Offline sales.
- Loyalty points and coupons.
- Payment terminals integration (card is recorded manually).

## Skills you'll use

| Week 1 doc | How |
|---|---|
| 05 PRD | Order-to-cash flow, decisions D1 to D4 |
| 11 backend basics | Transactions, row locks, idempotency |
| 12 design patterns | Strategy for discounts and payment methods, State for document status, Factory for document numbers |
| 15 QA testing | e2e for the full quick sale, unit tests for totals and discount rules |
| 16 AI engineering | Use Claude Code to scaffold the PDF template, then review it |

## Hints

1. Put all money math in one pure TypeScript module (`lib/pricing.ts`) with unit tests: line total, discount, tax, rounding. The UI and the server both import it. Never compute totals in two places.
2. Model the discount rule as a Strategy: `DiscountPolicy.check(line, user) → "ok" | "needs_approval"`. Today the rule is "over 20% needs owner". Later a shop may want 15%. Only one class changes.
3. Make "confirm order" and "create invoice" Postgres functions that run in one transaction: check available, insert reservations or movements, update status. If any step fails, nothing is saved.
4. Write the allowed status changes as a small table (`from → to`) in code and test it. Reject any jump not in the table, like Cancelled → Invoiced.
5. For Arabic PDFs use `@react-pdf/renderer` with an Arabic font (for example Cairo or Noto Naskh Arabic) registered, and set the direction to RTL. Test with long product names.
6. Generate document numbers with a counter row per shop locked with `select ... for update`. A Postgres sequence would be shared by all shops and leave gaps.
