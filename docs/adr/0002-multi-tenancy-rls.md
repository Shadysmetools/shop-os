# ADR 0002: Multi-tenancy with shop_id and Row Level Security

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-17 |
| Milestone | SO-M1 Accounts and Shops |

## Context

Shop OS serves many shops from one app and one database. Each shop is a **tenant**. Ahmed's mobile shop must never see Mona's cosmetics shop, not its sales, not its customers, not even its product count.

A data leak between shops would end the business. Trust is our product.

There are three common ways to separate tenants:

| Option | How | Fit for us |
|---|---|---|
| Database per tenant | Each shop gets its own database | Strong, but costly and hard to migrate 100 databases. No. |
| Schema per tenant | Each shop gets its own Postgres schema | Medium. Migrations get complex. No. |
| **Shared tables + `shop_id` + RLS** | All shops in the same tables, every row has `shop_id`, the database filters | Cheap, simple, strong if done right. **Yes.** |

## Decision

1. **Every business table has `shop_id uuid not null references shops(id)`.** No exceptions. Lookup tables that are global (like `plans`) are read-only for users.
2. **RLS is enabled on every table that has `shop_id`.** A table without RLS fails CI.
3. **One helper decides the current shop:** a Postgres function `current_shop_id()` that returns the user's active shop, after checking they are a member in `shop_members`.
4. **Policies use the helper:**
   - Select: `using (shop_id = current_shop_id())`
   - Insert / update: `with check (shop_id = current_shop_id())`
   - Role rules use a second helper `has_role(array['owner','manager'])`.
   - Cashier rules (D4): sales policies add `and (has_role(array['owner','manager']) or created_by = auth.uid())`.
5. **The `service_role` key is server only** and used in a short, named list of places (invite accept, Paymob webhook, Telegram webhook, cron jobs). Every such place sets the shop explicitly and is reviewed.
6. **Automated cross-tenant tests run in CI.** For every table with `shop_id`, a test logs in as a user of shop A and checks it cannot read, insert, update or delete shop B rows.
7. **Storage** uses paths that start with `<shop_id>/`, with storage policies that check the first folder.

## Example

```sql
create or replace function current_shop_id() returns uuid
language sql stable security definer as $$
  select p.last_shop_id
  from profiles p
  join shop_members m on m.shop_id = p.last_shop_id and m.user_id = p.user_id
  where p.user_id = auth.uid()
$$;

alter table products enable row level security;

create policy products_select on products
  for select using (shop_id = current_shop_id());
```

This is a starting point, not final code. Write tests before you trust it.

## Consequences

**Good**
- Even if app code forgets a `where shop_id = ...`, the database still filters.
- One schema and one set of migrations for all shops.
- Cheap: one Supabase project serves hundreds of shops.

**Bad, and how we live with it**
- RLS adds a little cost to each query. Mitigation: index `shop_id` (usually as the first column of composite indexes).
- RLS bugs are silent (you just see fewer rows). Mitigation: the cross-tenant test suite, and a CI check that lists tables without RLS.
- Code that uses `service_role` skips RLS. Mitigation: a short allow list, a lint rule or grep in CI that flags new uses, and review.
- A noisy shop can slow others. Fine at our size. Revisit at 500+ shops.

## Rules for reviewers

A PR that adds a table must show: the `shop_id` column, `enable row level security`, the policies, and the table appearing in the cross-tenant test output.
