# Skills map: Week 1 topics in Shop OS

In Week 1 you read 20 docs (plus 02b). This table shows where each one is used in Shop OS, so you know what to re-read before a ticket. Every ticket names the docs it uses.

| # | Week 1 topic | Where you use it in Shop OS | Milestone | Ticket area |
|---|---|---|---|---|
| 01 | Roadmap | Milestone order, release plan, launch plan | M0, M8 | Planning, LCH-8 pilot |
| 02 | Git for beginners | Branch per ticket, small commits, rebase on `main` | All | Every ticket |
| 02b | Git worktrees | One worktree per ticket when you work on two at once (for example receiving and supplier payments) | M0, M5 | FND-5, PUR-3 / PUR-5 |
| 03 | GitHub and its gates | Branch protection, required checks, reviews, `Closes #N` | M0, M8 | FND-3, FND-5, LCH-7 |
| 04 | CI/CD | GitHub Actions (lint, typecheck, Vitest, Playwright, build), Vercel preview and prod deploys, eval job in CI | M0, M7, M8 | FND-3, FND-4, AI-7 |
| 05 | PRD (ERP) | Reading stories and Given/When/Then. Stock, sales and purchasing rules and decisions D1 to D4 came from it | M1 to M5 | ACC, INV-4, SAL-3, SAL-7, PUR-3 |
| 06 | Personal agent PRD | Agent with tools, guardrails and memory for the Telegram assistant | M7 | AI-2, AI-3 |
| 07 | Video playlist | Recording the Arabic demo video for Facebook and WhatsApp groups, demo day | M8 | LCH-3, LCH-9 |
| 08 | Claude setup and digital employees | Repo CLAUDE.md, code-review and qa agents | M0, all | FND-6, every PR |
| 09 | GitHub CLI and platforms | `gh issue`, `gh pr`, project board, labels like `customer-request` | M0, M8 | FND-5, LCH-8 |
| 10 | Tech vocabulary | Tenant, RLS, ledger, SKU, receivable, KPI, webhook, idempotency | All | ACC-5, INV-4, CON-3, REP-1 |
| 11 | Backend basics | Auth, SQL views and functions, transactions, row locks, indexes, idempotency keys | M1 to M6 | ACC-1, INV-4, SAL-3, PUR-3, REP-4 |
| 12 | Design patterns | Repository, Strategy, Observer, Adapter, Factory (ADR 0004) | M2 to M8 | INV-7, SAL-7, PUR-6, AI-5, LCH-2 |
| 13 | DevOps basics | Environments, secrets, webhooks, cron jobs, backups, slow query logs | M0, M6, M7, M8 | FND-4, REP-4, AI-4, LCH-5 |
| 14 | Platform engineering | Health endpoint, restore runbook, monitoring, one way to deploy | M0, M8 | FND-6, LCH-5, LCH-6 |
| 15 | QA testing | Unit tests (pricing, phone, weighted average), cross-tenant tests, e2e quick sale, AI evals, launch regression | All | ACC-5, SAL-1, PUR-6, AI-7, LCH-7 |
| 16 | AI engineering | Tool use, prompts, eval set, token cost, model choice | M4, M7 | SAL-6, AI-2, AI-6, AI-7 |
| 17 | Claude power setup | Agents, skills and hooks for writing tests and evals | M0, M7 | FND-6, AI-7 |
| 18 | Knowcap architecture | How Knowcap does Supabase multi-tenancy and its AI pipeline | M1, M7 | ACC-5, AI-3 |
| 19 | Open source and GitHub links | Picking libraries (Papa Parse, react-pdf, Recharts), checking licenses | M2, M4, M6, M8 | INV-8, SAL-6, REP-6, LCH-7 |
| 20 | Free platforms | Vercel, Supabase, Sentry free tiers and their limits | M0, M1, M8 | FND-4, FND-6, ACC-6, LCH-6 |
