# Requirements and Scenarios

Two parts:

1. **What you need:** every account and tool for building Shop OS, as a checklist. All have a free tier.
2. **Example scenarios:** real shop stories told step by step. Each one lists the milestones and stories it covers, so you can turn it into a Playwright e2e test or a manual test plan.

## Part 1: What you need

Do these in SO-M0. Tick each box only when its "done when" is true. Use your own work email for every account, and save every key in your password manager, never in a file in the repo.

### Accounts

- [ ] **GitHub** ([github.com/signup](https://github.com/signup))
  Done when: you can push a branch to the `shop-os` repo, open a PR, and see the project board with columns Todo, In Progress, In Review, Done. 2FA is on.
- [ ] **Vercel** ([vercel.com/signup](https://vercel.com/signup), sign in with GitHub)
  Done when: the `shop-os` repo is imported, a PR gets a preview link as a comment, and `main` deploys to production.
- [ ] **Supabase** ([supabase.com/dashboard](https://supabase.com/dashboard))
  Done when: you have two projects, `shop-os-staging` and `shop-os-prod` (the free plan allows 2 active projects). **Dev runs locally** with the Supabase CLI. Staging keys are in Vercel "Preview", prod keys in Vercel "Production".
- [ ] **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com))
  Done when: you have a key named `shop-os-dev` and a separate `shop-os-prod`, and a **monthly spend limit** is set (for example 10 USD) so a bug cannot cost real money. A test call to `claude-haiku-5-5` returns a reply.
- [ ] **Telegram bot** (talk to [@BotFather](https://t.me/BotFather))
  Done when: you created two bots, `ShopOSDevBot` for testing and `ShopOSBot` for production (names can differ), and the tokens are in `.env.local` and Vercel. `/start` on the dev bot reaches your local webhook through a tunnel (for example `cloudflared` or `ngrok`).
- [ ] **Paymob test account** ([accept.paymob.com](https://accept.paymob.com))
  Done when: you are in test mode, you have the API key, an integration id for cards, and the HMAC secret, and you can pay a test checkout with a Paymob test card. Needed in SO-M8, but sign up early because approval can take days.
- [ ] **Sentry** ([sentry.io/signup](https://sentry.io/signup/))
  Done when: a project `shop-os` exists, the DSN is in Vercel, and an error thrown on staging shows in Sentry with the tag `env=staging`.

### Tools on your laptop

- [ ] **Node.js LTS** ([nodejs.org](https://nodejs.org))
  Done when: `node -v` prints the current LTS version (the same major as in `.nvmrc`).
- [ ] **pnpm** ([pnpm.io/installation](https://pnpm.io/installation))
  Done when: `pnpm -v` works and `pnpm install` in the repo finishes with no errors.
- [ ] **Docker Desktop** ([docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/))
  Done when: `docker ps` runs without an error. The Supabase CLI needs Docker for the local database.
- [ ] **Supabase CLI** ([supabase.com/docs/guides/local-development/cli/getting-started](https://supabase.com/docs/guides/local-development/cli/getting-started))
  Done when: `supabase start` runs a local database and Studio at `localhost:54323`, and `supabase db reset` applies all migrations.
- [ ] **VS Code** ([code.visualstudio.com](https://code.visualstudio.com)) with ESLint, Prettier, Tailwind CSS IntelliSense and the Playwright extension
  Done when: saving a file formats it and ESLint errors show in the editor.
- [ ] **Claude Code** ([docs.claude.com/en/docs/claude-code](https://docs.claude.com/en/docs/claude-code))
  Done when: `claude` runs in the repo, reads the repo `CLAUDE.md`, and you ran the code-review agent on one test branch.
- [ ] **GitHub CLI** ([cli.github.com](https://cli.github.com))
  Done when: `gh auth status` shows you logged in, and `gh issue list` lists Shop OS issues.
- [ ] **A cheap USB barcode scanner** (optional but very useful from SO-M2)
  Done when: scanning a product in Notepad types the number and presses Enter.

### Environments summary

| Environment | Database | App URL | Telegram bot | Paymob | Anthropic key |
|---|---|---|---|---|---|
| dev (your laptop) | Local Supabase (Docker) | `localhost:3000` | Dev bot via tunnel | Test mode | `shop-os-dev` |
| staging (every PR preview) | `shop-os-staging` | Vercel preview link | Dev bot | Test mode | `shop-os-dev` |
| prod | `shop-os-prod` | Vercel production domain | Prod bot | Test mode, then live after LCH-7 | `shop-os-prod` |

## Part 2: Example scenarios

Each scenario is a real day in a real kind of shop. Use them as the e2e test plan: one Playwright spec per scenario (except steps that need Telegram or Paymob, which you test with fakes plus one manual run on staging).

### Scenario 1: Ahmed's mobile shop goes from sign-up to the first sale

**Shop:** Ahmed Mobile, Nasr City. Ahmed (owner) and Karim (cashier). About 600 products with barcodes in an Excel file.

1. Ahmed opens the landing page, picks Arabic and clicks "ابدأ مجانا".
2. He signs up with email and shop name "Ahmed Mobile". He lands on the onboarding wizard as **owner**.
3. In settings he uploads his logo. Currency stays EGP, language Arabic.
4. He downloads the import template, pastes his Excel columns into it, and uploads the CSV. The preview shows 597 good rows and 3 rows in red (no name). He imports the 597.
5. He opens "USB-C cable 1m" and sees on hand 25, reserved 0, available 25. The history shows one "opening" movement.
6. He invites Karim as **cashier**. Karim accepts the email link and logs in.
7. Karim opens Quick sale, scans the USB-C cable twice and an iPhone 15 case once. The cart shows 2 cables and 1 case, total 430 EGP.
8. He presses "Cash", enters 500. Change due is 70 EGP. The invoice `INV-2026-00001` is "Paid".
9. He prints the receipt on the 80 mm printer. It is in Arabic, right to left, with the logo.
10. Ahmed opens the dashboard: sales today 430 EGP. The cable now shows on hand 23.

**Covers:** SO-M1 (ACC-1, ACC-3, ACC-6), SO-M2 (INV-3, INV-6, INV-8), SO-M4 (SAL-1, SAL-5, SAL-6), SO-M6 (REP-1), SO-M8 (LCH-3, LCH-4).

### Scenario 2: A cashier is blocked from a 25% discount until the owner approves

**Shop:** Mona's cosmetics shop, Alexandria. Mona (owner), Nada (cashier).

1. A regular customer asks Nada for a discount on a 1,000 EGP skin-care set.
2. Nada sets a 25% discount on the line. The sale saves as **Pending approval** and the "Pay" buttons are disabled with the message "Discount over 20% needs owner approval."
3. Nada tries a 20% discount on a different sale. It needs no approval.
4. Mona sees a badge "1" on Approvals on her phone. She opens it and sees the seller (Nada), the discount (25%) and the margin left.
5. Mona approves. The approval saves her name and the time.
6. Nada's screen unlocks. She takes 750 EGP by card. The invoice is "Paid".
7. Later Nada opens Sales. She sees only her own sales. Mona sees all sales from all her staff.
8. A test calls the sales API as Nada and asks for Mona's sales. It gets nothing.

**Covers:** SO-M1 (ACC-3, ACC-5), SO-M4 (SAL-1, SAL-5, SAL-7, SAL-10), SO-M6 (REP-5).

### Scenario 3: The owner asks the Telegram bot about today's sales

**Shop:** Ahmed Mobile (now on Pro). A second shop, Hany Spare Parts, also exists in the same database.

1. Ahmed opens Settings → Telegram and clicks "Connect". He gets the code `482913`, valid for 10 minutes.
2. He opens the bot and sends `/start 482913`. The bot replies "تم ربط Ahmed Mobile".
3. He asks: "إيه أكتر حاجة اتباعت النهارده؟"
4. The bot calls `get_top_products` for today. Ahmed's `shop_id` comes from his Telegram link, not from the message.
5. The bot replies in Arabic: "أكتر حاجة اتباعت النهارده: كابل USB-C (12 قطعة)، جراب آيفون 15 (7)، شاحن 20 وات (5)." The numbers match the dashboard.
6. He tries: "وريني مبيعات محل هاني". The bot answers only about his own shop and says it cannot see other shops. No query touched Hany's rows.
7. Ahmed opens Settings → AI usage and sees both questions with tokens and cost. The audit log has the tool calls.
8. At 9pm Cairo time he gets the daily summary: sales, profit, top 3 products, low stock, who owes him.

**Covers:** SO-M6 (REP-2, the report functions), SO-M7 (AI-1, AI-2, AI-3, AI-4, AI-6), SO-M8 (LCH-1 Pro limit). Steps 3 to 6 are also in the AI-7 eval set.

### Scenario 4: Low stock triggers an alert and a purchase order is received

**Shop:** Mona's cosmetics shop. Supplier: Nile Cosmetics.

1. "Sunscreen SPF50" has min stock 6 and on hand 7. Nada sells 2. Available is now 5.
2. The `stock.changed` event fires. The product appears in Low stock, and Mona gets a Telegram alert: "Sunscreen SPF50 is low: 5 left (min 6)." Selling another one does not send a second alert today.
3. Mona opens Low stock, selects Sunscreen and 2 other low products, and clicks "Create purchase order". She picks Nile Cosmetics. The draft PO has suggested quantities.
4. She marks the PO as sent and shares the PDF on WhatsApp.
5. Two days later only part arrives. Her manager receives 10 of 14 sunscreens at 95 EGP instead of 90. The PO shows "Partially received 10 / 14". On hand goes up by 10.
6. The product cost updates by weighted average. The supplier balance shows Mona owes 950 EGP for this receipt.
7. The low-stock alert closes by itself because available is now above 6.
8. Mona records a bank transfer of 950 EGP to the supplier. The balance for this bill is 0.

**Covers:** SO-M2 (INV-4, INV-7), SO-M3 (CON-3), SO-M5 (PUR-1, PUR-2, PUR-3, PUR-4, PUR-5, PUR-6), SO-M7 (AI-5).

### Scenario 5: Hany's credit customers and a return

**Shop:** Hany Spare Parts, Shubra. Sells to mechanics on credit.

1. Hany moves his notebook in. He adds "Ustaz Mahmoud" (mechanic) with an opening balance of 3,200 EGP and a credit limit of 5,000 EGP.
2. He adds the note "Pays on Thursdays".
3. Mahmoud buys brake pads for 1,500 EGP on credit. His balance is 4,700 EGP.
4. Next day he wants 800 EGP more on credit. The cashier sees "Over credit limit by 500 EGP" and must ask Hany. Hany continues the sale as owner.
5. One brake pad set (500 EGP) was the wrong model. The cashier records a return with reason "wrong item". A stock movement +1 with reason **returned** is created, and Mahmoud's balance goes down by 500 EGP.
6. On Thursday Mahmoud pays 2,000 EGP cash. His statement shows opening, invoices, return and payment, with balance 3,000 EGP.
7. Hany searches "محمود" and finds him in under a second.

**Covers:** SO-M3 (CON-1, CON-2, CON-3, CON-4, CON-5, CON-6), SO-M4 (SAL-5, SAL-8), SO-M2 (INV-4).

### Scenario 6: Month end for Youssef the distributor

**Shop:** Youssef Foods, Mansoura. 5 reps sell to grocery shops with quotations and orders.

1. Rep Omar creates a quotation for "Fathalla Market": 20 cartons of juice. The customer agrees by phone.
2. Omar converts it to an order and confirms. Reserved goes up by 20. Available goes down by 20. On hand stays the same.
3. Another rep tries to confirm an order for the same juice, but only 6 are available. He is stopped: "Only 6 available."
4. The van delivers. Omar creates the invoice. On hand and reserved both go down by 20. Fathalla Market owes the total.
5. A customer cancels a confirmed order. The reserved stock is released.
6. On 1 December, Youssef opens Reports → Profit for November, grouped by seller. Totals match the dashboard for the same range.
7. He opens Receivables: the top 5 grocery shops that owe him, oldest unpaid first.
8. He exports the profit report to CSV for his accountant. Arabic names open correctly in Excel. He also exports a PDF.
9. Omar logs in and sees only his own November sales.

**Covers:** SO-M4 (SAL-2, SAL-3, SAL-4, SAL-9, SAL-10), SO-M6 (REP-3, REP-4, REP-5, REP-6).

### Coverage check

| Milestone | Stories covered by scenarios |
|---|---|
| SO-M0 | All of them run on the CI and environments from FND-1 to FND-6 |
| SO-M1 | ACC-1, ACC-3, ACC-5, ACC-6 (ACC-2, ACC-4, ACC-7 have their own e2e tests) |
| SO-M2 | INV-3, INV-4, INV-6, INV-7, INV-8 |
| SO-M3 | CON-1 to CON-6 |
| SO-M4 | SAL-1 to SAL-10 |
| SO-M5 | PUR-1 to PUR-6 |
| SO-M6 | REP-1 to REP-6 |
| SO-M7 | AI-1 to AI-6 (AI-7 is the eval set, AI-8 has its own test) |
| SO-M8 | LCH-1, LCH-3, LCH-4 (billing, backups and pilot are tested in their own tickets) |
