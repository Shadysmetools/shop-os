# PRD 01: SO-M1 Accounts and Shops

| Field | Value |
|---|---|
| Milestone | `SO-M1 Accounts and Shops` |
| Story prefix | ACC |
| Depends on | SO-M0 |

## Goal

A shop owner signs up and gets his own private shop in under 2 minutes. He invites his staff and gives each one a role. From this milestone on, every row of business data belongs to exactly one shop, and the database itself (RLS) stops one shop from seeing another.

This is the most important security milestone. If it is wrong, every later feature leaks data.

## Words you need

| Word | Meaning |
|---|---|
| Tenant | One customer of the SaaS. For us, one shop. |
| Member | A user who belongs to a shop, with a role. One user can belong to more than one shop. |
| RLS | Row Level Security. Postgres rules that filter rows per user, even if the app code forgets. |

## User stories

| ID | Story |
|---|---|
| ACC-1 | As a shop owner, I want to sign up with email (or Google) and name my shop, so that I get my own private space. |
| ACC-2 | As a user, I want to log in, log out and reset my password, so that my account is safe. |
| ACC-3 | As an owner, I want to invite staff by email with a role (manager or cashier), so that they can use the system. |
| ACC-4 | As an owner, I want to change a member's role or remove them, so that people who leave lose access at once. |
| ACC-5 | As the business, we want RLS on every shop table, so that no shop can ever read or change another shop's data. |
| ACC-6 | As an owner, I want shop settings (name, logo, currency, language, phone, address), so that receipts and the app look like my shop. |
| ACC-7 | As a user who belongs to two shops, I want to switch between them, so that I can work for both. |

## Roles

| Action | Owner | Manager | Cashier |
|---|---|---|---|
| Shop settings, billing | Yes | No | No |
| Invite and remove staff | Yes | No | No |
| Products, purchasing | Yes | Yes | View only |
| Sell | Yes | Yes | Yes |
| See all sales | Yes | Yes | Own only (D4) |
| Approve discount over 20% | Yes | No | No (D1) |

## Acceptance criteria

**ACC-1**
- Given I am a new visitor, When I sign up with email, password and shop name "Ahmed Mobile", Then a shop is created, I am its **owner**, and I land on the empty dashboard.
- Given an email that already has an account, When I sign up again, Then I see "This email already has an account. Log in instead."

**ACC-2**
- Given I click "Forgot password", When I enter my email, Then I get a reset email and can set a new password.
- Given I logged out, When I press the browser back button, Then I do not see shop data.

**ACC-3**
- Given I am the owner, When I invite `sara@x.com` as cashier, Then she gets an email link, and after she accepts, she appears in the members list as cashier.
- Given the invite is older than 7 days, When Sara opens the link, Then she sees "This invite expired. Ask the owner for a new one."
- Given I am a cashier, When I open the Staff page, Then I get a 403 page.

**ACC-4**
- Given Sara is a cashier, When the owner removes her, Then her next request to the shop returns no data.
- Given I am the only owner, When I try to change my own role, Then I am stopped: "A shop needs at least one owner."

**ACC-5**
- Given shop A and shop B each have products, When a user of shop A queries `products` directly with the Supabase client, Then only shop A rows return.
- Given a user of shop A, When they try to insert a row with shop B's `shop_id`, Then the insert is rejected.
- Given CI runs, When the cross-tenant test suite runs, Then it passes for every table that has `shop_id`.

**ACC-6**
- Given I set currency to "SAR" and language to Arabic, When I reload, Then prices show "ر.س" and the UI is RTL.
- Given I upload a 6 MB logo, When I save, Then I see "Logo must be under 2 MB."

**ACC-7**
- Given I belong to two shops, When I pick the other shop in the switcher, Then all pages show only that shop's data.

## Data model

| Table | Key columns | Notes |
|---|---|---|
| `shops` | `id`, `name`, `logo_url`, `currency` (default `EGP`), `language` (`ar`/`en`), `phone`, `address`, `plan` (default `free`), `created_at` | The tenant. `id` is the `shop_id` everywhere else. |
| `shop_members` | `id`, `shop_id`, `user_id` (auth.users), `role` (`owner`/`manager`/`cashier`), `created_at` | Unique on (`shop_id`, `user_id`). |
| `invites` | `id`, `shop_id`, `email`, `role`, `token_hash`, `expires_at`, `accepted_at`, `invited_by` | Store a hash of the token, never the token. |
| `profiles` | `user_id`, `full_name`, `phone`, `last_shop_id` | One per user. Not per shop. |

## Screens

| Screen | Description |
|---|---|
| Sign up | Email, password, full name, shop name. Google button. Language toggle at the top. |
| Log in / Forgot password | Standard forms. Clear Arabic error messages. |
| Staff | Table of members (name, email, role, joined). "Invite" button opens a dialog with email + role. Pending invites shown with "Resend" and "Cancel". |
| Accept invite | "Ahmed invited you to join Ahmed Mobile as cashier." Button: create account or log in, then join. |
| Shop settings | Form with name, logo upload, currency select, language select, phone, address. Owner only. |
| Shop switcher | Dropdown in the top bar, visible only if the user has 2 or more shops. |

## Edge cases

- Sign up succeeds but shop creation fails. Do both in one database function so you never get a user with no shop.
- The invited email already has an account. Join the shop on accept. Do not create a second user.
- An owner removes himself. Block it if he is the last owner.
- A removed member still has an open browser tab. RLS must block the next request, not only the UI.
- Logo upload with a wrong file type (PDF). Accept only PNG, JPG, WebP.

## Out of scope

- Custom roles and per-permission toggles.
- SSO, 2FA (later).
- Billing (SO-M8). The `plan` column exists but every shop is `free` now.

## Skills you'll use

| Week 1 doc | How |
|---|---|
| 05 PRD | Reading stories and acceptance criteria |
| 10 vocabulary | Tenant, auth, session, JWT |
| 11 backend basics | Auth, sessions, server actions, SQL |
| 12 design patterns | Repository for members and shops |
| 15 QA testing | Cross-tenant tests |
| 18 Knowcap architecture | How Knowcap does multi-tenancy with Supabase |
| 20 free platforms | Supabase Auth, Storage |

## Hints

1. Write a Postgres function `current_shop_id()` that reads the active shop for the logged-in user (for example from `profiles.last_shop_id`, checked against `shop_members`). Use it in every RLS policy: `using (shop_id = current_shop_id())`.
2. Add a second helper `has_role(text[])` so policies can say "owners and managers can update products" in one line.
3. Create the shop with a `security definer` function `create_shop(name)` that inserts the shop and the owner membership in one transaction. Call it right after sign up.
4. Write the cross-tenant test once as a loop: for each table with a `shop_id` column (read from `information_schema.columns`), log in as shop A and assert you cannot read or insert shop B rows. New tables get tested for free.
5. Never use the Supabase `service_role` key in browser code. It skips RLS. Keep it only in server code that really needs it, like accepting an invite.
6. Store logos in a Supabase Storage bucket with the path `<shop_id>/logo.png` and a storage policy that checks the first folder equals `current_shop_id()`.
