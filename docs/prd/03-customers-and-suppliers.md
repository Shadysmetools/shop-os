# PRD 03: SO-M3 Customers and Suppliers

| Field | Value |
|---|---|
| Milestone | `SO-M3 Customers and Suppliers` |
| Story prefix | CON |
| Depends on | SO-M1 |

## Goal

Replace the credit notebook ("الدفتر"). Hany, the spare-parts owner, sells to 40 mechanics on credit. Today he flips pages to find who owes what. After this milestone, he types two letters of a name and sees the balance, the history and his notes.

## Words you need

| Word | Meaning |
|---|---|
| Contact | Anyone the shop deals with: a customer, a supplier, or both. |
| Balance | Money owed. For a customer: what they owe us. For a supplier: what we owe them. |
| Receivable | Money customers owe us. |
| Payable | Money we owe suppliers. |
| Ledger | A list of entries (+ or -). The balance is the sum. Same idea as stock movements. |

## Business rules

- Name and phone are required. Phone is stored in one normal format (`01XXXXXXXXX` for Egypt).
- A balance is never typed. It is the sum of ledger entries (opening, invoices, payments, returns, bills).
- Positive balance means the contact owes the shop. Negative means the shop owes the contact.
- Contacts with history are archived, never deleted.
- Everyone can view contacts. Only owners and managers can record opening balances and set credit limits.

## User stories

| ID | Story |
|---|---|
| CON-1 | As any user, I want to add a contact with name, phone, type (customer / supplier / both), and optional email, address and tax number, so that I can sell to or buy from them. |
| CON-2 | As any user, I want to search contacts by name or phone, so that I find them in one second at the counter. |
| CON-3 | As an owner, I want to see each contact's balance and a statement of every entry, so that I know who owes what and why. |
| CON-4 | As an owner or manager, I want to record an opening balance and a manual payment received or paid, so that I can move my notebook into Shop OS. |
| CON-5 | As any user, I want to add notes to a contact, so that I remember things like "pays on Thursdays". |
| CON-6 | As an owner, I want to set a credit limit per customer, so that staff are warned before selling more on credit. |

## Acceptance criteria

**CON-1**
- Given I add "Ustaz Mahmoud" with phone `01001234567`, When I save, Then he appears in the contacts list as a customer.
- Given a contact with phone `01001234567` exists, When I add another with the same phone, Then I see "Possible duplicate: Ustaz Mahmoud" and can still save or open the existing one.
- Given I enter phone `+20 100 123 4567`, When I save, Then it is stored as `01001234567` (normalized).

**CON-2**
- Given I type "محم" or "0100", When results load, Then matching contacts appear within 300 ms for a shop with 2,000 contacts.

**CON-3**
- Given a customer bought 1,500 EGP on credit and paid 1,000 EGP, When I open his page, Then the balance shows 500 EGP and the statement lists both entries with date and reference.
- Given I click "Customers who owe", When the list loads, Then it shows only customers with balance > 0, sorted from highest.

**CON-4**
- Given I enter an opening balance of 3,200 EGP for a customer, When I save, Then his balance is 3,200 EGP and the entry type is "opening".
- Given I record a payment of 500 EGP cash from that customer, When I save, Then his balance is 2,700 EGP.

**CON-5**
- Given I add the note "Pays on Thursdays", When another user opens the contact, Then they see it with my name and the date.

**CON-6**
- Given a customer has limit 5,000 EGP and balance 4,500 EGP, When a cashier tries a 1,000 EGP credit sale (SO-M4), Then a warning shows "Over credit limit by 500 EGP" and only an owner or manager can continue.

## Data model

| Table | Key columns | Notes |
|---|---|---|
| `contacts` | `id`, `shop_id`, `name`, `phone`, `email`, `type` (`customer`/`supplier`/`both`), `address`, `tax_number`, `credit_limit`, `is_active`, `created_at` | Index on (`shop_id`, `phone`). Trigram index on `name` for search. |
| `contact_ledger` | `id`, `shop_id`, `contact_id`, `amount` (signed), `entry_type` (`opening`/`invoice`/`payment`/`bill`/`supplier_payment`/`return`), `ref_type`, `ref_id`, `created_by`, `created_at` | Insert only. Positive = they owe us more. |
| `contact_balances` (view) | `shop_id`, `contact_id`, `balance` | `SUM(amount)`. |
| `contact_notes` | `id`, `shop_id`, `contact_id`, `body`, `created_by`, `created_at` | |
| `payments` | `id`, `shop_id`, `contact_id`, `direction` (`in`/`out`), `method` (`cash`/`card`/`wallet`/`bank`), `amount`, `note`, `created_by`, `created_at` | Also used by SO-M4 and SO-M5. |

## Screens

| Screen | Description |
|---|---|
| Contacts list | Tabs: All, Customers, Suppliers, Who owes me. Columns: name, phone, type, balance. Search box at the top. |
| Contact form | Name, phone, type, email, address, tax number, credit limit. |
| Contact detail | Header with name, phone (tap to call or WhatsApp), balance in big text. Tabs: Statement, Notes, Sales (empty until SO-M4), Purchases (empty until SO-M5). Buttons: "Record payment", "Opening balance". |
| Record payment dialog | Amount, method, date, note. |

## Edge cases

- A contact is both customer and supplier. Show one balance: positive means they owe us, negative means we owe them. Label it clearly.
- A contact with ledger entries is deleted. Archive instead (`is_active = false`).
- Phone numbers typed with Arabic-Indic digits (٠١٠٠). Convert to Latin digits before saving.
- A payment is entered by mistake. Fix with a reverse entry. Never edit the ledger row.

## Out of scope

- Automatic SMS or WhatsApp payment reminders (later; the Telegram bot can list debtors in SO-M7).
- Contact groups and price lists per customer.
- Importing contacts from CSV (nice to have; reuse the SO-M2 importer if there is time).

## Skills you'll use

| Week 1 doc | How |
|---|---|
| 05 PRD | Contacts module ideas from the ERP PRD |
| 10 vocabulary | Receivable, payable, ledger |
| 11 backend basics | Views, indexes, full text / trigram search |
| 12 design patterns | Repository for contacts, the same ledger pattern as stock |
| 15 QA testing | Unit tests for phone normalization, e2e for payment |

## Hints

1. Reuse the stock idea: the balance is a `SUM` over an insert-only `contact_ledger`. Do not store a `balance` column you have to keep in sync by hand.
2. Write one `normalizePhone()` function in `lib/` with unit tests for `+20`, `0020`, spaces, dashes and Arabic-Indic digits. Use it on save and on search.
3. For fast Arabic search, enable the `pg_trgm` extension and add a GIN trigram index on `name`. Then `name ilike '%محم%'` stays fast.
4. Make the sign rule explicit in one place (a comment at the top of the migration and a TypeScript constant). Mixing up "+ means they owe us" is the most common bug here.
5. Debounce the search input by about 250 ms so you do not send a query on every key press.
