# ADR 0001: Tech stack

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-17 |
| Milestone | SO-M0 Foundation |

## What is an ADR?

An Architecture Decision Record is a short note that says: what we decided, why, and what it costs us. When someone asks in 6 months "why didn't we use PHP?", the answer is here.

## Context

- Shop OS is a multi-tenant SaaS. Many shops share one database, and one shop must never see another (see ADR 0002).
- It needs Arabic RTL and English, a fast POS-style screen, PDFs, a Telegram webhook and Claude API calls.
- One developer (Khaled) builds it, with a mentor reviewing. Budget is close to zero until shops pay.
- Khaled knows **PHP + MySQL** from university. In Week 1 he used Vercel, Supabase, GitHub Actions and Claude Code.

## Decision

| Layer | Choice |
|---|---|
| App | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui, next-intl for Arabic/English |
| Database, auth, files | Supabase (Postgres, Auth, Storage, Row Level Security) |
| Hosting | Vercel, one preview deploy per pull request |
| CI | GitHub Actions: lint, typecheck, Vitest, Playwright, build |
| Errors | Sentry free tier |
| AI | Claude API: `claude-haiku-5-5` for chat, `claude-sonnet-5-5` for harder reports, with tool use |
| Payments | Paymob (test mode first, SO-M8) |
| Package manager | pnpm |

## Why TypeScript + Postgres and not PHP + MySQL?

PHP + MySQL is a fine stack. Many big products run on it. We chose differently for four concrete reasons:

1. **One language everywhere.** The UI, the server code, the Telegram webhook and the tests are all TypeScript. Types shared between the form and the database catch bugs before they run. With PHP you would write PHP on the server and still need JavaScript for a fast POS screen.
2. **Row Level Security.** Postgres can enforce "this user only sees rows where `shop_id` is their shop" inside the database. MySQL has no built-in RLS. For a multi-tenant SaaS, this is the single strongest safety net (ADR 0002).
3. **Free tiers you already used.** Supabase gives Postgres, auth, file storage and backups. Vercel gives preview deploys per PR. Both were in Week 1 (doc 20). A PHP setup needs a server you manage yourself.
4. **The AI and ecosystem.** The Anthropic SDK, next-intl, react-pdf, Playwright and shadcn/ui are first class in TypeScript.

**Your SQL knowledge transfers directly.** `SELECT`, `JOIN`, `GROUP BY`, indexes, foreign keys and transactions work the same in Postgres. A few differences to learn:

| MySQL habit | Postgres way |
|---|---|
| `AUTO_INCREMENT` | `uuid default gen_random_uuid()` or `generated always as identity` |
| `LIMIT 10, 20` | `LIMIT 20 OFFSET 10` |
| Backticks around names | Double quotes (and best to avoid needing them) |
| `DATETIME` | `timestamptz` (always with time zone) |
| `IFNULL` | `COALESCE` |
| No RLS | `alter table ... enable row level security` + policies |

## Consequences

**Good**
- Fast start, almost zero cost until real revenue.
- Strong tenant isolation in the database.
- Preview links make reviews and pilot demos easy.

**Bad, and how we live with it**
- Khaled must learn TypeScript and React well. Mitigation: start with simple server components, add client code only where needed (quick sale screen).
- Vendor lock-in to Supabase and Vercel. Mitigation: Supabase is plain Postgres. Migrations are SQL files. We can move to any Postgres host.
- Free tier limits (Supabase pauses inactive free projects, row and storage limits). Mitigation: upgrade the prod project to a paid tier once the first shops pay. Watch usage monthly.
- Serverless functions have time limits. Mitigation: keep webhooks fast. Long jobs go to a cron or a queue later.

## Alternatives considered

| Option | Why not |
|---|---|
| Laravel + MySQL | Good framework, but no RLS, needs a managed server, and two languages for UI and backend. |
| Odoo modules | Heavy, Python + XML, and our customers find Odoo too complex. That is the gap we fill. |
| Firebase | NoSQL makes reports (group by, joins) painful. Reports are core for us. |
| Separate React SPA + Express API | More moving parts for one developer. Next.js server actions cover our needs. |
