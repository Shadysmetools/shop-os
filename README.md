# Shop OS

**نظام محلك في مكان واحد** (Your shop's system, in one place)

Shop OS is a multi-tenant SaaS for small shops, distributors and wholesalers in Egypt and MENA with 1 to 20 staff. It replaces paper, Excel and WhatsApp with one simple system for:

- Inventory (products, barcodes, stock movements, low-stock alerts)
- Quick sales, quotations, orders, invoices and Arabic receipts
- Customers and suppliers (balances, who owes what)
- Purchasing (purchase orders, receiving goods)
- Reports and an owner dashboard
- An **AI assistant on Telegram**. The owner asks "what sold today?" or "مين عليه فلوس؟" and gets an answer from his own shop's data.

It works in Arabic (RTL) and English from day 1. The default currency is EGP and each shop can change it.

## Who it is for

Shop owners who pay a monthly subscription. Typical customers: a mobile accessories shop, a cosmetics shop, a stationery shop, a spare-parts shop and a small food distributor. See the personas in [the product vision](docs/prd/00-product-vision.md#3-target-customers).

| Plan | Price | Users | Products | AI assistant |
|---|---|---|---|---|
| Free | 0 EGP | 1 | 100 | No |
| Basic | 299 EGP / month | 3 | Unlimited | No |
| Pro | 699 EGP / month | 10 | Unlimited | Yes, plus daily Telegram summary |

Yearly plans get 2 months free.

## Docs

| Doc | What is inside |
|---|---|
| [Product vision (master PRD)](docs/prd/00-product-vision.md) | Problem, customers, competitors, pricing, go-to-market, metrics, release plan |
| [Requirements and scenarios](docs/requirements-and-scenarios.md) | Accounts and tools you need, plus end-to-end shop stories you can use as an e2e test plan |
| [SO-M0 Foundation](docs/prd/00b-foundation.md) | Repo, CI, environments, branch flow |
| [SO-M1 Accounts and Shops](docs/prd/01-accounts-and-shops.md) | Sign up, shops, staff, roles, RLS |
| [SO-M2 Products and Inventory](docs/prd/02-products-and-inventory.md) | Catalog, stock ledger, low stock, CSV import |
| [SO-M3 Customers and Suppliers](docs/prd/03-customers-and-suppliers.md) | Contacts, balances, notes |
| [SO-M4 Sales and Invoices](docs/prd/04-sales-and-invoices.md) | Quick sale, quotes, orders, invoices, payments, returns |
| [SO-M5 Purchasing](docs/prd/05-purchasing.md) | Purchase orders, receiving, cost updates |
| [SO-M6 Reports and Dashboard](docs/prd/06-reports-and-dashboard.md) | Owner dashboard, reports, exports |
| [SO-M7 AI Assistant](docs/prd/07-ai-assistant.md) | Telegram bot, tools, daily summary, guardrails, evals |
| [SO-M8 Launch and Sell](docs/prd/08-launch-and-sell.md) | Plans, billing, landing page, pilot, demo day |
| [ADR 0001 Tech stack](docs/adr/0001-tech-stack.md) | Why Next.js + TypeScript + Supabase |
| [ADR 0002 Multi-tenancy with RLS](docs/adr/0002-multi-tenancy-rls.md) | How one shop never sees another shop's data |
| [ADR 0003 AI assistant architecture](docs/adr/0003-ai-assistant-architecture.md) | Telegram webhook, Claude, read-only tools, audit log |
| [ADR 0004 Design patterns](docs/adr/0004-design-patterns.md) | Repository, Strategy, Observer, Adapter, Factory |
| [Skills map](docs/skills-map.md) | Where each Week 1 topic is used in Shop OS |
| [Contributing](CONTRIBUTING.md) | Branches, commits, PRs, stand-up, Definition of Done |

## Milestones

| Milestone | Goal | Story IDs |
|---|---|---|
| SO-M0 Foundation | Repo, CI, dev/staging/prod, Supabase + Vercel, ADRs, CLAUDE.md | FND-1 to FND-6 |
| SO-M1 Accounts and Shops | Sign up creates a shop, invite staff, roles, RLS, settings | ACC-1 to ACC-7 |
| SO-M2 Products and Inventory | Catalog, barcode, stock ledger, low stock, CSV import | INV-1 to INV-8 |
| SO-M3 Customers and Suppliers | Contacts, balances, search, notes | CON-1 to CON-6 |
| SO-M4 Sales and Invoices | Quick sale, quote to invoice, payments, PDF, approvals, returns | SAL-1 to SAL-10 |
| SO-M5 Purchasing | POs, receiving, supplier balances, cost updates | PUR-1 to PUR-6 |
| SO-M6 Reports and Dashboard | Owner dashboard, rep view, exports | REP-1 to REP-6 |
| SO-M7 AI Assistant | Telegram link, Q&A tools, daily summary, alerts, evals | AI-1 to AI-8 |
| SO-M8 Launch and Sell | Plans, Paymob, landing page, onboarding, pilot, demo day | LCH-1 to LCH-9 |

## How to run

> Placeholder. This section is filled in during SO-M0 (ticket FND-2).

It will look roughly like this:

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase keys
supabase start               # local Postgres in Docker
pnpm dev                     # http://localhost:3000
pnpm test                    # Vitest
pnpm e2e                     # Playwright
```

## How to work

1. Pick the top ticket in **Todo** on the project board and move it to **In Progress**.
2. Create a branch for that ticket only: `feat/<issue>-short-slug` (for example `feat/12-product-list`).
3. Write the code and the tests. Commit small, with conventional commit messages.
4. Open a pull request. Put `Closes #<issue>` in the description so the ticket closes on merge.
5. Wait for CI to be green (lint, typecheck, unit tests, e2e, build) and check the Vercel preview link.
6. Move the ticket to **In Review** and ask for a review. Fix the comments.
7. After merge, the ticket moves to **Done**.

Board columns: **Todo → In Progress → In Review → Done**. Details in [CONTRIBUTING.md](CONTRIBUTING.md).
