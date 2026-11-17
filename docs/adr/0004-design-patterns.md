# ADR 0004: Design patterns we use (and where)

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-17 |
| Related | Week 1 doc 12 (design patterns basics) |

## Context

Design patterns are named solutions to common problems. Used well, they make code easy to change. Used everywhere, they make simple code hard to read. This ADR lists the few patterns Shop OS uses, where, and why. If a pattern is not on this list, ask before adding it.

## Decision

| Pattern | Plain meaning | Where in Shop OS | Milestone |
|---|---|---|---|
| **Repository** | One place that talks to the database for a thing. The rest of the code calls `productsRepo.findBySku()` instead of writing queries everywhere. | `ProductsRepository`, `ContactsRepository`, `SalesRepository`, `ReportsRepository`. The AI tools reuse `ReportsRepository`. | M1 to M6 |
| **Strategy** | Several ways to do one job, behind one interface, picked at run time. | `DiscountPolicy` (over 20% needs owner, D1), `PricingRule` (line totals, tax), `PaymentMethod` (cash, card, credit, split), `PlanLimits` (Free, Basic, Pro), model choice for AI (Haiku or Sonnet). | M4, M7, M8 |
| **Observer / domain events** | When something happens, publish an event. Listeners react. The code that sells does not need to know about Telegram. | `stock.changed` → low-stock alert listener (M2) → Telegram push listener (M7). `invoice.paid` → dashboard cache. `subscription.changed` → limits. | M2, M5, M7, M8 |
| **Adapter** | Wrap an outside service in our own interface so the app never depends on its details. | `PaymentProvider` with `PaymobAdapter` and `FakePaymentProvider` for tests. `ChatChannel` with `TelegramAdapter` (WhatsApp later). `LLMClient` wrapping the Anthropic SDK. | M7, M8 |
| **Factory** | One function that builds the right object so callers do not need `if/else` everywhere. | `createDocumentNumber(shop, type)` for `INV-`, `QUO-`, `ORD-`, `PO-` numbers. `createPaymentProvider(env)` returns Paymob or Fake. `createSalesDocument(type)` sets defaults per quotation, order or invoice. | M4, M5, M8 |
| **State machine** (small) | A list of allowed status changes. | Order and PO status (`draft → confirmed → invoiced`). Any other jump is rejected. | M4, M5 |

## Examples (shape only, not final code)

```ts
// Strategy
interface DiscountPolicy {
  check(line: SaleLine, user: Member): "ok" | "needs_approval";
}

// Adapter
interface PaymentProvider {
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
  verifyWebhook(req: Request): Promise<boolean>;
  parseEvent(body: unknown): PaymentEvent;
}
```

## Rules

1. Start without a pattern. Add one when you have the second case (the second payment provider, the second discount rule) or when testing needs a fake.
2. Patterns live in plain TypeScript in `lib/`. No framework or class hierarchy needed. Interfaces plus functions are enough.
3. Domain events in v1 are in-process (a simple `emit`/`on` module) plus database rows where a listener must not be lost (alerts, notifications). No message broker yet.
4. Each pattern use has a unit test that swaps in a fake (fake provider, fake channel, fake clock).

## Consequences

- Payments and chat channels can change provider without touching sales or reports.
- Business rules (discount, plan limits) are in one place each, easy to test and to explain to a customer.
- Cost: a few more files. Mitigation: the "second case" rule above.
