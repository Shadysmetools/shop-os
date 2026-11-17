# PRD 02: SO-M2 Products and Inventory

| Field | Value |
|---|---|
| Milestone | `SO-M2 Products and Inventory` |
| Story prefix | INV |
| Depends on | SO-M1 |

## Goal

The shop knows what it sells and exactly how much it has. Ahmed can import his 600 products from Excel in a few minutes, scan a barcode to find a product, and trust the stock number because every change is recorded.

## Words you need

| Word | Meaning |
|---|---|
| SKU | The shop's own product code, for example `CASE-IP15-BLK`. |
| Barcode | The number printed under the bars (EAN-13 etc). A scanner types it like a keyboard. |
| Unit | How the product is counted: piece, box, kg, liter. |
| Stock movement | One line that says "this product changed by +10 or -2, for this reason". |
| On hand | Physical quantity on the shelf. Sum of all movements. |
| Reserved | Quantity promised to confirmed orders but not yet delivered (D3, used in SO-M4). |
| Available | On hand − reserved. What you can still sell. |

## User stories

| ID | Story |
|---|---|
| INV-1 | As an owner or manager, I want to add and edit products (name AR/EN, SKU, barcode, category, unit, cost, price, min stock), so that I can sell and buy them. |
| INV-2 | As an owner, I want categories, so that I can group products (chargers, cases, cables). |
| INV-3 | As any user, I want to search products by name, SKU or barcode scan, so that I find a product in one second. |
| INV-4 | As the business, we want every stock change to be a movement in an insert-only ledger, so that every number can be explained. |
| INV-5 | As a manager, I want to make a stock adjustment with a reason (count, damaged, lost, opening, returned), so that the system matches the shelf. |
| INV-6 | As an owner, I want to see each product's on hand, reserved and available quantity and its movement history. |
| INV-7 | As an owner, I want a low-stock list and an in-app alert when a product drops to its minimum, so that I reorder in time. |
| INV-8 | As an owner, I want to import products and opening stock from a CSV / Excel export, so that I do not type 600 products. |

## Acceptance criteria

**INV-1**
- Given I add product "iPhone 15 case black" with SKU `CASE-IP15-BLK`, When I save, Then it appears in the product list.
- Given SKU `CASE-IP15-BLK` exists in my shop, When I add another product with the same SKU, Then I see "SKU already used".
- Given shop B has SKU `CASE-IP15-BLK`, When I add it in shop A, Then it is allowed (unique per shop, not global).
- Given the price is lower than the cost, When I save, Then I see a warning (not a block).

**INV-3**
- Given the search box is focused, When the scanner types `6291041500213` and Enter, Then the matching product opens.
- Given I type "شاحن", When results load, Then every product whose Arabic or English name contains it is listed.

**INV-4**
- Given any feature changes stock, When I look in `stock_movements`, Then there is exactly one new row for each product changed, with user, reason and reference.
- Given a user tries to update or delete a row in `stock_movements`, When the query runs, Then it is refused by the database.

**INV-5**
- Given on hand is 10, When I adjust by -3 with reason "damaged", Then on hand is 7 and history shows date, user, -3, "damaged".
- Given on hand is 2, When I adjust by -5, Then I see "Stock cannot go below zero" and nothing changes.

**INV-7**
- Given product "USB-C cable" has min stock 5 and on hand 6, When 1 is sold, Then it appears in the low-stock list and an alert is created.
- Given the product is already in alert, When another unit is sold, Then no duplicate alert is created.

**INV-8**
- Given a CSV with 600 valid rows, When I import, Then 600 products are created with opening stock movements, in under 30 seconds.
- Given 3 rows have no name, When I preview the import, Then I see those 3 rows in red with the reason, and I can import the other rows.
- Given the CSV is in Arabic and saved by Excel, When I upload it, Then Arabic names show correctly (UTF-8 with BOM).

## Data model

| Table | Key columns | Notes |
|---|---|---|
| `categories` | `id`, `shop_id`, `name`, `parent_id` (null in v1) | |
| `products` | `id`, `shop_id`, `name_ar`, `name_en`, `sku`, `barcode`, `category_id`, `unit`, `cost_price`, `sale_price`, `min_stock`, `is_active`, `created_at` | Unique (`shop_id`, `sku`) and (`shop_id`, `barcode`). Money as `numeric(12,2)`. |
| `locations` | `id`, `shop_id`, `name` | One default location per shop in v1. Ready for branches later. |
| `stock_movements` | `id`, `shop_id`, `product_id`, `location_id`, `qty` (signed), `reason` (`opening`/`sale`/`purchase`/`adjust_count`/`damaged`/`lost`/`returned`), `ref_type`, `ref_id`, `unit_cost`, `created_by`, `created_at` | Insert only. |
| `stock_levels` (view) | `shop_id`, `product_id`, `on_hand`, `reserved`, `available` | `on_hand = SUM(qty)`. `reserved` comes from SO-M4. |
| `stock_alerts` | `id`, `shop_id`, `product_id`, `level`, `created_at`, `resolved_at` | One open alert per product. |
| `import_jobs` | `id`, `shop_id`, `file_name`, `total_rows`, `ok_rows`, `error_rows`, `errors` (jsonb), `created_by` | |

## Screens

| Screen | Description |
|---|---|
| Products list | Table: image, name, SKU, category, price, available. Search box that accepts barcode scans. Filters: category, low stock only. |
| Product form | Name AR, name EN, SKU, barcode, category, unit, cost, price, min stock. Margin % shown live. |
| Product detail | Stock card (on hand, reserved, available) and movement history table. "Adjust stock" button. |
| Adjust stock dialog | Quantity (+ or -), reason select, note. |
| Low stock | List of products at or under minimum, with "Create purchase order" button (used in SO-M5). |
| Import | Step 1 upload, step 2 map columns, step 3 preview with errors, step 4 confirm. Downloadable template. |

## Edge cases

- Two cashiers sell the last unit at the same second. Only one sale may succeed. Check stock and insert the movement in one transaction with a row lock.
- A product with movements is deleted. Do not delete. Set `is_active = false`.
- A barcode scanner adds a trailing Enter or space. Trim input.
- Decimal quantities (2.5 kg). `qty` is `numeric`, not `integer`.
- Import file with 10,000 rows. Process in batches of 500 and show progress.

## Out of scope

- Product variants (size, color) as one parent product. Use separate products in v1.
- Multiple locations and transfers.
- Expiry dates and batch numbers (strong request from cosmetics shops; consider for v2).
- Product images beyond one per product.

## Skills you'll use

| Week 1 doc | How |
|---|---|
| 05 PRD | Stock rules came from the ERP PRD |
| 10 vocabulary | SKU, ledger, transaction, view |
| 11 backend basics | SQL views, transactions, indexes |
| 12 design patterns | Repository for products, Observer for low-stock events |
| 15 QA testing | Unit tests for the CSV parser, e2e for adjust stock |

## Hints

1. Write the stock movement ledger as insert-only: grant `insert` and `select`, never `update` or `delete`. Compute on hand with `SUM(qty)` in a view. A wrong movement is fixed with a new opposite movement.
2. Put the "stock never below zero" check in a Postgres function `apply_stock_movement(...)` that locks the product row (`select ... for update`), checks `on_hand + qty >= 0`, then inserts. Every feature calls this one function.
3. Add an index on `stock_movements (shop_id, product_id)`. When the table gets big, you can add a cached `on_hand` column later, but start with the plain `SUM`.
4. For the low-stock alert, raise a domain event `stock.changed` after each movement. A small listener checks `available <= min_stock` and opens an alert. SO-M7 will reuse the same event for Telegram pushes.
5. Parse CSV with a library such as Papa Parse. Validate each row with a Zod schema. Show errors before writing anything to the database.
6. Test with a cheap USB barcode scanner. It acts like a keyboard, so a normal input with an `onKeyDown` Enter handler is enough.
