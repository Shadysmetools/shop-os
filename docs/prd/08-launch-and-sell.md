# PRD 08: SO-M8 Launch and Sell

| Field | Value |
|---|---|
| Milestone | `SO-M8 Launch and Sell` |
| Story prefix | LCH |
| Depends on | SO-M1 to SO-M7 |

## Goal

Turn a working app into a business. A shop owner finds Shop OS on the landing page, signs up, gets value in 15 minutes with sample data, and pays for a plan. Behind the scenes we have backups, error tracking and a security review. Khaled runs a pilot with 3 real shops, learns from them, and presents the product on demo day.

## User stories

| ID | Story |
|---|---|
| LCH-1 | As the business, we want plans (Free, Basic, Pro) with limits on users, products and AI, so that growing shops upgrade. |
| LCH-2 | As an owner, I want to pay for Basic or Pro, monthly or yearly, by card or wallet through Paymob, so that I can upgrade myself. |
| LCH-3 | As a visitor, I want a landing page in Arabic and English with features, pricing and a sign-up button, so that I understand Shop OS in 30 seconds. |
| LCH-4 | As a new owner, I want an onboarding wizard (shop type, import products or load sample data, invite staff, first sale), so that I get value in 15 minutes. |
| LCH-5 | As the business, we want daily backups and a tested restore, so that a shop never loses its data. |
| LCH-6 | As the team, we want Sentry on client, server and the bot, with alerts, so that we see errors before customers call. |
| LCH-7 | As the business, we want a security review (RLS, secrets, auth, AI prompt injection) before launch, so that we can promise shops their data is safe. |
| LCH-8 | As the team, we want a pilot with 3 real shops and a weekly feedback loop, so that we build what they need. |
| LCH-9 | As Khaled, I want to give a demo day presentation with live demo, metrics and lessons, so that I show the product and what I learned. |

## Acceptance criteria

**LCH-1**
- Given a Free shop has 100 products, When the owner adds the 101st, Then he sees "Free plan allows 100 products. Upgrade to Basic." and the product is not created.
- Given a Basic shop has 3 users, When the owner invites a 4th, Then the invite is blocked with an upgrade prompt.
- Given a Pro shop downgrades to Basic with 5 users, When the downgrade applies, Then existing users stay but no new invites are allowed until under the limit.

**LCH-2**
- Given I choose Pro monthly, When I pay with a Paymob test card, Then my shop's plan becomes Pro and I see a receipt in Billing.
- Given Paymob sends the same success webhook twice, When we process it, Then the subscription is extended only once.
- Given a payment fails, When I return to Shop OS, Then I stay on my old plan and see "Payment failed. Try again."
- Given a subscription period ends with no renewal, When 3 grace days pass, Then the shop moves to Free (data is kept, limits apply).

**LCH-3**
- Given I open the landing page on a phone, When it loads, Then Lighthouse performance and accessibility are 90 or more.
- Given I switch to English, Then all text, prices and screenshots are in English.

**LCH-4**
- Given I choose "Load sample data", When the wizard finishes, Then my shop has 30 products, 5 customers, 2 suppliers and 10 sales, all marked as sample, and a "Delete sample data" button.
- Given a new owner, When we measure time from sign-up to first sale in the pilot, Then the median is under 15 minutes.

**LCH-5**
- Given the backup job ran, When I follow the restore runbook on a staging project, Then all tables are restored and row counts match.

**LCH-6**
- Given the webhook throws, When I open Sentry, Then I see the error with `shop_id` tag and no personal data (no phone numbers, no message text).

**LCH-7**
- Given the security checklist, When the review is done, Then every item is "pass" or has an issue filed, and no "high" issue is open.

**LCH-8**
- Given 3 pilot shops, When each week ends, Then each shop has a feedback note in its GitHub issue and new requests are labeled `customer-request`.

**LCH-9**
- Given demo day, When Khaled presents, Then he shows a live sale, a Telegram question, the dashboard, real pilot metrics (activation, weekly active shops) and 3 lessons learned in 15 minutes.

## Data model

| Table | Key columns | Notes |
|---|---|---|
| `plans` | `code` (`free`/`basic`/`pro`), `price_monthly`, `price_yearly`, `max_users`, `max_products`, `ai_enabled` | Seeded. Global, not per shop. Read only for users. |
| `subscriptions` | `id`, `shop_id`, `plan_code`, `interval` (`month`/`year`), `status` (`active`/`past_due`/`cancelled`), `current_period_end`, `provider` (`paymob`/`manual`) | |
| `payment_events` | `id`, `shop_id`, `provider`, `provider_event_id` (unique), `type`, `amount`, `raw` (jsonb), `processed_at` | Unique id makes webhooks idempotent. |
| `shops.is_sample_data` flags | `is_sample` column on products, contacts, sales_documents | So sample data can be deleted cleanly. |
| `feedback` | `id`, `shop_id`, `user_id`, `message`, `page`, `created_at` | In-app "Send feedback" button. |

## Screens

| Screen | Description |
|---|---|
| Landing page | Hero with the Arabic tagline and a phone screenshot of the Telegram bot. 3 benefits, how it works in 3 steps, pricing table, FAQ, sign-up button. Arabic first. |
| Pricing / Billing | Current plan, usage (users, products, AI questions), upgrade buttons, monthly/yearly toggle, invoices list. |
| Onboarding wizard | 4 steps: shop type, products (import CSV / sample data / skip), invite staff, make a first sale. Progress bar. Can be resumed. |
| Upgrade prompt | Dialog shown when a limit is hit, with the plan that fixes it. |
| Feedback button | Small button in the menu. Text box. Sends to `feedback` and a Telegram message to the team. |

## Edge cases

- Paymob webhook arrives before the user returns to the success page. The page must read the subscription from the database, not trust the URL.
- A shop pays yearly then upgrades mid-year. v1: upgrade starts a new period; refund difference manually.
- Backup contains other shops' data. Backups are for us only, never sent to shops. Shops use CSV export.
- Pilot shop asks for a big custom feature. Write it down, check it against non-goals, do not promise a date.

## Out of scope

- Coupons, referral tracking in code (handle referrals manually for the first 10 shops).
- Automatic VAT invoices for our own subscriptions (manual for now).
- Other payment providers (Fawry, Stripe) until Paymob is live. The Adapter makes this easy later.

## Skills you'll use

| Week 1 doc | How |
|---|---|
| 01 roadmap | Launch plan |
| 03 GitHub gates, 04 CI/CD | Release to production with all checks |
| 07 videos | Recording the demo video for Facebook groups |
| 09 GitHub CLI and platforms | Labels and issues for customer requests |
| 12 design patterns | Adapter for Paymob, Strategy for plan limits |
| 13 DevOps, 14 platform engineering | Backups, restore runbook, monitoring |
| 15 QA testing | Full regression before launch |
| 19 open source | Choosing libraries and checking licenses |
| 20 free platforms | Sentry, Vercel, Supabase limits |

## Hints

1. Put all limits in one place: `canDo(shop, action)` that reads the shop's plan from `plans`. Call it in server actions and in RLS-protected database functions. Never only in the UI.
2. Wrap Paymob behind a `PaymentProvider` interface (`createCheckout`, `verifyWebhook`, `parseEvent`). The app only talks to the interface. In tests, use a `FakePaymentProvider`.
3. Verify every Paymob webhook with its HMAC before trusting it, and insert into `payment_events` with the provider's unique id first. If the insert fails as a duplicate, stop.
4. Write the restore runbook as a Markdown file and actually run it once on staging. A backup you never restored is not a backup.
5. Set Sentry `beforeSend` to strip phone numbers and Telegram message text. Tag every event with `shop_id` and `env`.
6. For the pilot, make a simple Google Sheet or GitHub project per shop: date, what they used, what broke, what they asked for. Review it every Sunday before planning the week.
