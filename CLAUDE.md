# CLAUDE.md

Instructions for Claude Code in the Shop OS repo. Keep this file short. Update it when a command, folder or rule changes.

## What this is

Shop OS is a multi-tenant SaaS for small shops in Egypt and MENA: inventory, quick sales, invoices, customers, suppliers, purchasing, reports, and an AI assistant on Telegram. Arabic (RTL) and English from day 1. Read `README.md` and `docs/prd/` before building a feature.

## Stack

- Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, next-intl
- Supabase: Postgres, Auth, Storage, Row Level Security
- Vercel hosting (preview deploy per PR), GitHub Actions CI
- Vitest (unit), Playwright (e2e), Sentry (errors)
- Claude API + Telegram for the AI assistant
- Package manager: pnpm

Reasons are in `docs/adr/0001-tech-stack.md`.

## Commands

Use pnpm, never npm or yarn.

```bash
pnpm install          # install dependencies
pnpm dev              # run the app at http://localhost:3000
pnpm lint             # ESLint
pnpm typecheck        # next typegen (route types) + tsc --noEmit
pnpm test             # Vitest unit tests, run once
pnpm test:watch       # Vitest in watch mode
pnpm test:e2e         # Playwright e2e tests (set up in T-FND-5)
pnpm build            # production build
pnpm format           # Prettier on src/
pnpm dlx shadcn@latest add <component>   # add a shadcn/ui component
supabase start        # local Postgres + Studio in Docker (localhost:54323, from T-FND-3)
supabase db reset     # rebuild the local database from all migrations + seed
supabase migration new <name>   # create a new migration file
node scripts/board.mjs show T-FND-1   # read a ticket (needs SHOP_OS_BOARD_KEY)
```

## Folder map

```
src/app/              Next.js routes and pages (App Router). Keep them thin.
src/components/ui/    shadcn/ui components (generated, RTL-safe)
src/lib/              Plain TypeScript logic: repositories, pricing, patterns. Not in pages.
src/lib/pricing.ts    The only place for money math (from SO-M4)
src/**/*.test.ts      Vitest unit tests, next to the code they test
messages/ar.json      Arabic UI text (next-intl)
messages/en.json      English UI text
supabase/migrations/  Every database change, as SQL files (from T-FND-3)
docs/prd/             What to build, per milestone
docs/adr/             Why we decided things
scripts/board.mjs     Ticket board CLI
.claude/skills/       Claude skills for this repo (board)
```

## Hard rules

1. **Every business table has `shop_id uuid not null references shops(id)` and RLS enabled**, with policies that use `current_shop_id()`. Add the table to the cross-tenant test. See `docs/adr/0002-multi-tenancy-rls.md`.
2. **Never commit secrets.** No API keys, Supabase keys, Telegram tokens or Paymob keys in code, commits, logs or screenshots. Secrets live in `.env.local` (git-ignored), Vercel settings and GitHub Actions secrets. `.env.example` has names only, no values.
3. **No `service_role` key in browser code.** It skips RLS. Use it only in the reviewed server-side allow list (invite accept, Paymob webhook, Telegram webhook, cron jobs).
4. **Money is an integer in piastres** (12.50 EGP = 1250). All money math lives in `src/lib/pricing.ts`. Never compute totals in two places.
5. **Stock is an insert-only ledger.** Never update or delete a stock movement. Fix a mistake with a new opposite movement. On hand = `SUM(qty)`.
6. **Schema changes only through migrations** in `supabase/migrations/`. Never change the schema by clicking in the Supabase dashboard.
7. **RTL-safe styling.** Use logical Tailwind classes (`ms-4`, `pe-2`, `text-start`), never `ml-`, `pr-`, `text-left`. Every UI string goes in both `messages/ar.json` and `messages/en.json`.
8. **Build only what the ticket asks.** If it is not in the ticket or PRD, do not add it.

## How we work

- One ticket = one branch = one PR. Branch names: `feat/<issue>-slug`, `fix/<issue>-slug`, `docs/<issue>-slug`, `chore/<issue>-slug`.
- Conventional commits: `feat(sales): reserve stock on order confirm`.
- PRs stay small (under about 400 lines), say `Closes #<issue>`, and need green CI.
- CI (`.github/workflows/ci.yml`) runs `pnpm lint`, `format:check`, `typecheck`, `test` and `build` on Node from `.nvmrc`. Run them locally before pushing.
- Write tests first for business rules. Never commit to `main`.
- Khaled must be able to explain every line. Explain what you write; do not hide changes.
- Only the mentor moves a ticket to Done. Details in `CONTRIBUTING.md`.
