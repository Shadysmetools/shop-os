# Contributing to Shop OS

Real shops depend on this code. These rules keep it safe and keep your work easy to review.

## 1. Branches

One branch per ticket. Never commit to `main` directly (it is protected).

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<issue>-slug` | `feat/24-quick-sale-screen` |
| Bug fix | `fix/<issue>-slug` | `fix/31-receipt-rtl-totals` |
| Docs | `docs/<issue>-slug` | `docs/40-restore-runbook` |
| Chore (deps, CI) | `chore/<issue>-slug` | `chore/12-ci-cache` |

Start from the latest `main`:

```bash
git switch main && git pull
git switch -c feat/24-quick-sale-screen
```

Working on two tickets at once? Use a worktree (Week 1 doc 02b) instead of switching branches with uncommitted work.

## 2. Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<area>): <short summary in present tense>
```

| Type | When |
|---|---|
| `feat` | New behavior a user can see |
| `fix` | Bug fix |
| `test` | Tests only |
| `refactor` | Code change with no behavior change |
| `docs` | Docs only |
| `chore` | Tooling, deps, CI |

Examples: `feat(sales): reserve stock on order confirm`, `fix(inventory): block negative stock adjustment`, `test(rls): add cross-tenant test for contacts`.

Small commits. One idea per commit.

## 3. Pull requests

1. Open the PR early as a **draft** if you want feedback.
2. Fill in the PR template. Put `Closes #<issue>` in the description.
3. Keep PRs small: one ticket, ideally under 400 changed lines.
4. CI must be green: lint, typecheck, unit tests, e2e, build (and evals for AI code).
5. Check the Vercel preview link yourself before asking for review.
6. Move the ticket to **In Review** and request a reviewer.
7. Answer every review comment (fix it or explain). Do not resolve someone else's comment for them.
8. Squash and merge. Delete the branch.

Board columns: **Todo → In Progress → In Review → Done**.

## 4. Daily stand-up

Every working day before 11am, post in the Telegram group, topic **"Shop OS"**:

```
Yesterday: <what you finished, with PR links>
Today: <the ticket you are on>
Blocked: <anything stopping you, or "nothing">
```

If you are stuck for more than 1 hour, ask. Do not wait for the next stand-up.

## 5. Definition of Done

A ticket is done only when **all** of these are true:

- [ ] Every acceptance criterion in the ticket passes.
- [ ] Tests: unit tests for logic, and an e2e test for the main user path. New tables are in the cross-tenant test.
- [ ] New tables have `shop_id` and RLS policies.
- [ ] Works in Arabic (RTL) and English, and on a phone screen.
- [ ] CI is green.
- [ ] The PR has the Vercel **preview link** and a **screenshot** (or short video) of the change.
- [ ] Docs updated (PRD, ADR, README or CLAUDE.md) if behavior or setup changed.
- [ ] Reviewed and merged. Ticket in **Done**.

## 6. Using Claude Code on this repo

Claude Code is your pair programmer, not your replacement. You must understand and be able to explain every line you merge.

- **CLAUDE.md** at the repo root tells Claude the commands, folder layout and hard rules (every table has `shop_id` and RLS, money math only in `lib/pricing.ts`, no `service_role` in client code). Keep it updated when rules change.
- **Before you open a PR**, run the **code-review agent** on your diff. Fix what it finds, or write in the PR why you did not.
- **After the preview deploy**, run the **qa agent** against the preview link with the ticket's acceptance criteria.
- Ask Claude to **explain** code you do not understand. Ask it to write tests first, then code.
- Check what Claude writes against the PRD. If it invents a feature that is not in the ticket, remove it.
- **Never commit secrets.** No API keys, Supabase keys, Telegram bot token or Paymob keys in code, commits, screenshots or chat. Use `.env.local` and platform settings. Never paste secrets into a Claude prompt. If a secret leaks, tell your mentor and rotate it at once.

## 7. Reporting bugs and requests

- Bugs: open an issue with the **Bug** template.
- Features and customer requests: open an issue with the **Feature** template. Add the label `customer-request` if a shop asked for it, and the shop's name.
