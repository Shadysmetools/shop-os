# PRD 00b: SO-M0 Foundation

| Field | Value |
|---|---|
| Milestone | `SO-M0 Foundation` |
| Story prefix | FND |
| Depends on | Nothing. This is the first milestone. |

## Goal

Before we build features, we build the road. At the end of this milestone, any change Khaled makes goes through the same safe path: branch, pull request, CI checks, preview deploy, review, merge, deploy. Nothing reaches real shops without passing these gates.

There is no customer feature here. But real customers depend on it: a broken deploy at 1pm means a shop cannot sell at lunch time.

## User stories

| ID | Story |
|---|---|
| FND-1 | As the developer, I want a Next.js + TypeScript repo with Tailwind, shadcn/ui and next-intl (Arabic + English), so that every feature starts from the same base. |
| FND-2 | As the developer, I want to run the app and a local database with a few commands, so that I can work without touching production. |
| FND-3 | As the team, we want CI on every pull request (lint, typecheck, Vitest, Playwright, build), so that broken code cannot be merged. |
| FND-4 | As the team, we want three environments (dev, staging, prod) on Supabase and Vercel, so that we test before real shops see a change. |
| FND-5 | As the team, we want branch protection and a PR template, so that `main` only changes through reviewed pull requests. |
| FND-6 | As the developer, I want a CLAUDE.md, ADRs and Sentry set up, so that Claude Code, reviewers and future me understand the rules and see errors. |

## Acceptance criteria

**FND-1**
- Given a fresh clone, When I run `pnpm install && pnpm dev`, Then the home page opens at `localhost:3000`.
- Given I switch the language to Arabic, When the page renders, Then `<html dir="rtl" lang="ar">` is set and the text is Arabic.

**FND-2**
- Given Docker is running, When I run `supabase start` and `supabase db reset`, Then all migrations apply and seed data loads with no errors.
- Given the README "How to run" section, When a new person follows it, Then they reach a running app in under 30 minutes.

**FND-3**
- Given a PR with a TypeScript error, When CI runs, Then the typecheck job fails and the PR cannot be merged.
- Given a PR where all checks pass, When I open it on GitHub, Then I see green checks for lint, typecheck, unit, e2e and build.

**FND-4**
- Given a PR is opened, When Vercel builds it, Then a preview link is posted on the PR and it uses the staging database.
- Given a merge to `main`, When the deploy finishes, Then production uses the prod Supabase project and staging data is not visible.

**FND-5**
- Given I try to push directly to `main`, When the push runs, Then GitHub rejects it.
- Given a PR has no approving review, When I try to merge, Then the merge button is disabled.

**FND-6**
- Given the app throws an error in staging, When I open Sentry, Then I see the error with the environment tag `staging`.
- Given Claude Code opens the repo, When it reads CLAUDE.md, Then it finds the commands, the folder layout and the rule "every table has shop_id and RLS".

## Data model

Only one thing in this milestone: the migrations folder and the first migration.

| Table | Key columns | Notes |
|---|---|---|
| `schema_check` | `id`, `created_at` | A tiny table in migration 0001 to prove migrations run in CI. Remove it in SO-M1. |

Rule for every later business table: it has `shop_id uuid not null references shops(id)` and RLS enabled. This is written in CLAUDE.md now, before any business table exists.

## Screens

| Screen | Description |
|---|---|
| Home placeholder | Logo, the tagline "نظام محلك في مكان واحد", a language switch (AR / EN). Proves i18n and RTL work. |
| Health page `/api/health` | Returns JSON `{ status: "ok", env: "staging", commit: "abc123" }`. Used to check a deploy. |

## Edge cases

- A secret is accidentally committed. CI must fail (add a secret scanner such as gitleaks). Rotate the key right away.
- A migration works locally but fails in staging. CI runs `supabase db reset` on a clean database to catch this early.
- The Vercel preview points at production data by mistake. Check env vars per environment in the Vercel dashboard.
- Playwright is slow or flaky. Keep only 1 smoke test in M0. Add more per feature.

## Out of scope

- Any business feature (shops, products, sales).
- Custom domain (use the Vercel domain until SO-M8).
- Paid plans on any platform. Everything uses free tiers.

## Skills you'll use

| Week 1 doc | How |
|---|---|
| 01 roadmap | Milestones and order of work |
| 02 git, 02b worktrees | Branches, one worktree per ticket if you work on two at once |
| 03 GitHub gates | Branch protection, required checks, reviews |
| 04 CI/CD | The GitHub Actions workflow |
| 08 Claude setup, 17 Claude power setup | CLAUDE.md, agents for review and QA |
| 09 GitHub CLI | `gh pr create`, `gh issue list` |
| 13 DevOps, 14 platform engineering | Environments, secrets, health check |
| 15 QA testing | First Vitest and Playwright tests |
| 20 free platforms | Vercel, Supabase, Sentry free tiers |

## Hints

1. Start the CI workflow with one job that runs `pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Split it into parallel jobs only after it is green.
2. Use Supabase CLI migrations (`supabase migration new <name>`) from day 1. Never change the schema by clicking in the dashboard. If it is not in a migration file, it does not exist.
3. In CI, start Postgres with `supabase start` (it needs Docker, which GitHub runners have). Then `supabase db reset` runs every migration from zero on each PR.
4. Keep env vars in three places only: `.env.local` (your laptop, git-ignored), Vercel project settings (preview and prod), GitHub Actions secrets (CI). Commit a `.env.example` with names and no values.
5. Put next-intl messages in `messages/ar.json` and `messages/en.json`. Use Tailwind logical classes (`ms-4`, `pe-2`) instead of `ml-4`, `pr-2` so RTL works without extra code.
6. Write your first ADR (0001) before you write code. It is short. It forces you to say why, not only what.
