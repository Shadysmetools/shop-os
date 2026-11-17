# PRD 06: SO-M6 Reports and Dashboard

| Field | Value |
|---|---|
| Milestone | `SO-M6 Reports and Dashboard` |
| Story prefix | REP |
| Depends on | SO-M4, SO-M5 |

## Goal

The owner opens one screen and knows how the shop is doing: today's sales, profit, what sells, what is running out, and who owes him money. At month end he exports a report instead of spending an evening with a calculator. Staff see only their own numbers (D4).

The same SQL queries built here become the AI assistant's tools in SO-M7. Build them clean.

## Words you need

| Word | Meaning |
|---|---|
| KPI | Key Performance Indicator. A number the owner watches, like sales today. |
| Sales (net) | Invoiced revenue minus returns, after discounts. |
| Gross profit | Sales minus the cost of the goods sold (using the cost saved on each sale line). |
| Margin % | Gross profit / sales × 100. |
| Average ticket | Sales / number of invoices. |
| Receivables | Total money customers owe the shop. |

## Business rules

- Only invoices count as sales. Quotations, orders, pending and cancelled documents never count.
- Days are counted in the shop's timezone (Africa/Cairo by default).
- Owners and managers see all sellers. Cashiers and reps see only their own (D4).
- Every number on the dashboard must equal the same number in the matching report.

## User stories

| ID | Story |
|---|---|
| REP-1 | As an owner, I want a dashboard with today's sales, gross profit, number of invoices and average ticket, compared with yesterday, so that I see the day at a glance. |
| REP-2 | As an owner, I want to see top products (by quantity and by profit) for a date range, so that I know what to buy more of. |
| REP-3 | As an owner, I want low stock and receivables (who owes me, oldest first) on the dashboard, so that I act on money and stock. |
| REP-4 | As an owner, I want a sales report and a profit report for any date range, by day, product, category or seller, so that I can review the month. |
| REP-5 | As a cashier or rep, I want to see only my own sales and totals (D4), so that I track my work without seeing others. |
| REP-6 | As an owner, I want to export any report to CSV and PDF, so that I can share it with my accountant. |

## Acceptance criteria

**REP-1**
- Given today there are 3 paid invoices of 100, 200 and 300 EGP with cost 60, 120, 150, When I open the dashboard, Then sales = 600, profit = 270, invoices = 3, average = 200.
- Given a return of 100 EGP today, When the dashboard loads, Then sales show 500 (net of returns).
- Given the shop timezone is Africa/Cairo, When a sale is made at 11:30pm Cairo time, Then it counts as today in Cairo, not tomorrow in UTC.

**REP-2**
- Given a date range of last 7 days, When I open Top products, Then I see the top 10 by quantity and a toggle to sort by profit.

**REP-3**
- Given 4 customers have balance > 0, When I open the dashboard, Then the receivables card shows the total and the top 5 debtors with days since their oldest unpaid invoice.

**REP-4**
- Given I pick 1 to 30 November grouped by category, When the report runs, Then each category shows sales, cost, profit and margin %, and the totals equal the dashboard totals for the same range.

**REP-5**
- Given I am cashier Sara, When I open Reports, Then I see "My sales" only, and requesting another seller's data returns nothing.

**REP-6**
- Given a profit report on screen, When I click "Export CSV", Then the file opens in Excel with Arabic text readable and the same numbers.
- Given I click "Export PDF", Then the PDF has the shop name, date range and the same table.

## Data model

No new business tables. Reports read existing tables through SQL views or functions.

| Object | Type | Columns / output |
|---|---|---|
| `v_sales_lines_net` | View | `shop_id`, `date` (Cairo), `document_id`, `product_id`, `category_id`, `seller_id`, `qty`, `revenue`, `cost`, `profit` (returns as negative rows) |
| `report_sales_summary(from, to, group_by)` | Function | rows of `key`, `sales`, `cost`, `profit`, `margin_pct`, `invoices` |
| `report_top_products(from, to, sort, limit)` | Function | `product_id`, `name`, `qty`, `sales`, `profit` |
| `report_receivables(limit)` | Function | `contact_id`, `name`, `balance`, `oldest_unpaid_days` |
| `report_low_stock()` | Function | `product_id`, `name`, `available`, `min_stock` |

Every view and function filters by `shop_id = current_shop_id()` and, for cashiers, by `seller_id = auth.uid()`.

## Screens

| Screen | Description |
|---|---|
| Dashboard (owner) | 4 KPI cards (sales, profit, invoices, average ticket) with % vs yesterday. Sales chart for the last 14 days. Cards: Top 5 products, Low stock, Receivables. Each card links to the full report. Mobile first. |
| My dashboard (staff) | My sales today, my invoices, my last 10 sales. |
| Reports | Left: report picker (Sales, Profit, Top products, Receivables, Stock value). Top: date range presets (Today, Yesterday, This week, This month, Last month, Custom) and group by. Table plus Export buttons. |

## Edge cases

- A shop with no sales yet. Show friendly empty states with a link to the quick sale screen.
- Products sold before cost was set (cost 0). Profit looks too high. Show a warning "5 products have no cost".
- Very large ranges (1 year, 50,000 lines). The report must return in under 2 seconds. Add indexes on (`shop_id`, `created_at`).
- Pending approval and cancelled documents. Never count them as sales.
- Currency is not EGP. Every number uses the shop currency format.

## Out of scope

- Custom report builder.
- Scheduled email reports (the daily Telegram summary in SO-M7 covers this).
- Accounting reports (profit and loss statement, balance sheet).

## Skills you'll use

| Week 1 doc | How |
|---|---|
| 10 vocabulary | KPI, gross profit, margin, receivables |
| 11 backend basics | SQL group by, views, functions, indexes |
| 12 design patterns | Repository: one `ReportsRepository` used by the dashboard, the exports and the AI tools |
| 15 QA testing | Fixture data with known totals, tests that the dashboard equals the report |
| 13 DevOps | Watch slow queries in Supabase logs |

## Hints

1. Build a seed script that creates one shop with known sales (you calculate the expected totals on paper first). Every report test asserts against those exact numbers.
2. Convert timestamps to the shop's day with `(created_at at time zone 'Africa/Cairo')::date`. Store the timezone on `shops` so other countries work later.
3. Profit uses the `unit_cost` snapshot saved on the sales line in SO-M4, not today's product cost. Otherwise last month's profit changes every time you buy stock.
4. Put each report in a Postgres function and call it with `supabase.rpc()`. In SO-M7 the AI tools call the same functions. One source of truth for every number.
5. For CSV, add a UTF-8 BOM (`﻿`) at the start of the file, or Excel will show Arabic as garbage. Reuse the PDF setup from SO-M4.
6. Use a simple chart library such as Recharts. Check the chart in RTL; you may need to flip the x-axis so time still reads correctly.
