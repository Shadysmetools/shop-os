# PRD 00: Shop OS Product Vision (master PRD)

| Field | Value |
|---|---|
| Product | Shop OS ("نظام محلك في مكان واحد") |
| Builder | Khaled (intern, full-stack) |
| Owner | Mentor team |
| Status | v1.0 |
| Date | 2026-11-17 |
| Type | Real commercial SaaS. Real shops will use it and pay for it. |

## 1. What is Shop OS?

Shop OS is a simple system that runs a small shop. Think of it as one shared notebook for the whole shop, plus a smart assistant on the owner's phone.

When the cashier sells a phone case, the stock goes down. When the owner buys from a supplier, the stock goes up and the supplier balance changes. At 9pm the owner gets a Telegram message: "Today you sold 14,250 EGP, profit 3,100 EGP, 3 products are low on stock."

It is **multi-tenant**. That means one app serves many shops. Each shop is a **tenant**, and a shop can never see another shop's data.

## 2. The problem

Small shops in Egypt run on paper, Excel and WhatsApp. This costs them money every day.

| Problem | What happens today | Cost to the shop |
|---|---|---|
| Unknown stock | The owner "thinks" there are 20 chargers. There are 4. | Lost sales, or money stuck in dead stock |
| No sales record | Sales go in a paper notebook or nowhere | The owner cannot tell what sells or what profit he made |
| Credit chaos | "Write it on my account" is remembered, not recorded | Customers forget to pay. Money is lost. |
| Staff trust | The owner cannot see what a cashier did when he was away | Theft and big unapproved discounts |
| No reports | Month end means hours with a calculator | Bad decisions about what to buy |
| Owner is never off | He must be in the shop to know what is happening | Stress, no time to grow |

## 3. Target customers

Shops with 1 to 20 staff, in Egypt first, then MENA. The person who pays is the **owner**.

| Persona | Business | Today | What makes them pay |
|---|---|---|---|
| **Ahmed, 32** | Mobile accessories shop in Nasr City, 2 cashiers, 600 products with barcodes | Paper notebook and memory. Stock count once a year. | Barcode quick sale, low-stock alerts, knowing his real profit |
| **Mona, 41** | Cosmetics and skin-care shop near a pharmacy in Alexandria, 3 staff | Excel file on one laptop, WhatsApp with suppliers | Expiry and stock control, staff cannot give big discounts without her |
| **Hany, 50** | Car spare-parts shop in Shubra, sells to mechanics on credit | A thick credit notebook ("الدفتر") | Customer balances, who owes what, reminders |
| **Youssef, 37** | Small food distributor in Mansoura, 5 sales reps, 1 van | Excel plus WhatsApp orders from 80 grocery shops | Orders to invoices, reps see only their own sales, daily summary on Telegram |

A stationery shop near a school (busy in September) is a fifth common case. It looks like Ahmed's shop.

## 4. Competitors

We must be honest. Other tools exist. We win on a narrow, clear spot: **simple, Arabic first, cheap, with an AI assistant on Telegram**.

| | Shop OS | Odoo | Daftra | Zoho Inventory | Excel / paper |
|---|---|---|---|---|---|
| Price for a 3-user shop | 299 EGP / month | High (per user, plus a partner to set it up) | Medium | Medium, priced in USD | Free |
| Time to first sale | Under 15 minutes | Days to weeks | About an hour | About an hour | Instant |
| Arabic RTL quality | Built for it from day 1 | Good | Good | Weak | Whatever you write |
| Barcode quick sale | Yes | Yes (POS module) | Yes | Limited | No |
| Credit and balances | Yes | Yes | Yes | Yes | Manual, error-prone |
| AI assistant on Telegram | Yes (Pro) | No | No | No | No |
| Depth (accounting, HR, manufacturing) | Shallow on purpose | Very deep | Deep accounting | Medium | None |
| Needs a consultant | No | Usually yes | No | No | No |

**Where they beat us:** Odoo and Daftra have full accounting and tax features. Daftra has years of trust in Egypt. Zoho has a big brand. We will not try to match them on depth.

**Where we beat them:** speed to start, price, Arabic UX, and the assistant. The owner does not open a dashboard. He just asks on Telegram.

## 5. Value proposition

> "Know your stock, your sales and who owes you money, from your phone, in Arabic, in 15 minutes, for less than the cost of one lost sale a week."

Three promises we must keep:

1. **Start in 15 minutes.** Sign up, import products from Excel, make the first sale.
2. **Never lose a sale or a debt.** Every sale, payment and credit is recorded.
3. **Ask, don't search.** The owner asks the Telegram bot and gets an answer from his own data.

## 6. Business model and pricing

Monthly subscription, paid by the shop owner. Prices are a proposal. We validate them with pilot shops in SO-M8.

| Plan | Price | Users | Products | AI assistant | Daily Telegram summary |
|---|---|---|---|---|---|
| Free | 0 | 1 | 100 | No | No |
| Basic | 299 EGP / month | 3 | Unlimited | No | No |
| Pro | 699 EGP / month | 10 | Unlimited | Yes | Yes |

- Yearly plans get 2 months free (Basic 2,990 EGP / year, Pro 6,990 EGP / year).
- Payment via Paymob (cards and wallets). Test mode first.
- **Unit economics check:** a Pro shop asking 20 questions a day costs a few dollars a month in Claude Haiku tokens. That leaves a healthy margin at 699 EGP. We track the AI cost per shop in SO-M7.
- Free exists to remove fear. Limits push growing shops to Basic.

## 7. Go-to-market: the first 10 shops

Khaled sells the first shops himself. No ads budget. The goal is learning, not scale.

| Step | What Khaled does | Target |
|---|---|---|
| 1. Warm list | Write down 30 shops he or his family already know | 30 names |
| 2. Pilot offer | "3 months of Pro free. I set it up with you and import your products. In return, 20 minutes of feedback each week." | 3 pilot shops by SO-M8 |
| 3. Sit in the shop | Spend half a day watching how they sell. Write down every pain. | Notes in a GitHub issue per shop |
| 4. Groups | Post a short Arabic demo video in Facebook groups for shop owners and WhatsApp groups for traders in his area | 10 demo requests |
| 5. Referrals | Each happy pilot shop gets 1 free month per shop they refer that pays | 3 referred shops |
| 6. Convert | At the end of the pilot, offer Basic or Pro with a 30% discount for the first year | 10 paying shops |

Rules for selling: never promise a feature that is not on the roadmap. Write every request as a GitHub issue with the label `customer-request`.

## 8. Success metrics

| Metric | Definition | Target (3 months after launch) |
|---|---|---|
| Activation | Shop made its first sale within 7 days of sign-up | 60% of new shops |
| Weekly active shops | Shops with at least 5 sales recorded in the last 7 days | 15 |
| Paying shops | Shops on Basic or Pro with a successful payment this month | 10 |
| Monthly churn | Paying shops that cancelled this month / paying shops at month start | Under 5% |
| AI usage (Pro) | Pro shops that asked the bot at least 3 questions this week | 70% |
| Time to first sale | Median minutes from sign-up to first sale | Under 15 minutes |

We measure these with SQL queries over our own tables (no paid analytics tool).

## 9. Non-goals for v1

We will **not** build these in v1. Saying no keeps the product simple.

- Full accounting (general ledger, balance sheet) and tax filing (ETA e-invoice integration comes later).
- HR, payroll and leave (decision D5).
- Multiple warehouses or branches (one location per shop in v1).
- An online store for end customers.
- WhatsApp bot (Telegram first, WhatsApp later).
- Offline mode for the quick sale screen.
- Native mobile apps (the web app must work well on a phone).

## 10. Decisions already made

| ID | Decision |
|---|---|
| D1 | A discount over 20% puts the sale in **Pending approval**. Only the owner can approve. |
| D2 | A return is a stock adjustment with reason **"returned"**. |
| D3 | Confirming an order **reserves** stock. Available = on hand − reserved. |
| D4 | The owner sees everything. Cashiers and reps see only their own sales. |
| D5 | HR is out of scope for Shop OS v1. |

## 11. Risks

| Risk | Likelihood | What we do |
|---|---|---|
| Data leak between shops | Medium | RLS on every table, automated cross-tenant tests in CI (ADR 0002) |
| Shops do not trust a new product with their data | High | Pilot offer, daily backups, export to CSV any time |
| AI gives a wrong number | Medium | Read-only tools that run real SQL, an eval set of 30 questions, the bot shows where the number came from |
| AI costs grow | Low | Haiku by default, per-shop monthly token cap, AI only on Pro |
| Khaled builds too much | High | Strict non-goals, one ticket per PR, weekly review against this PRD |
| Shops stop using it after the pilot | Medium | Weekly feedback calls, track weekly active shops |
| Paymob integration delays | Medium | Manual bank transfer as a fallback for the first paying shops |

## 12. Release plan

| Milestone | What a shop can do after it | Release |
|---|---|---|
| SO-M0 Foundation | Nothing yet. The team can ship safely. | Internal |
| SO-M1 Accounts and Shops | Sign up, create a shop, invite staff | Internal |
| SO-M2 Products and Inventory | Import products, see stock, get low-stock alerts | Internal alpha |
| SO-M3 Customers and Suppliers | Keep an address book with balances | Internal alpha |
| SO-M4 Sales and Invoices | Sell with a barcode, print an Arabic receipt | **First pilot shop** |
| SO-M5 Purchasing | Buy from suppliers and receive stock | Pilot |
| SO-M6 Reports and Dashboard | See profit and receivables | Pilot |
| SO-M7 AI Assistant | Ask the Telegram bot, get a 9pm summary | Pilot (Pro) |
| SO-M8 Launch and Sell | Pay for a plan, self-onboard | **Public launch + demo day** |
