---
name: board
description: Read and update the Shop OS ticket board (the 🗂 Board on Khaled's dashboard, a ClickUp-style board with an API). Use when the user or a task says "move the ticket", "update the board", "what's next", "which tickets are in progress", "comment on T-XXX", "add a task", or when starting, finishing or getting blocked on a ticket.
---

# Shop OS board

The board lives at https://khaled-quest.vercel.app/#board. Tickets have IDs like `T-FND-1`; each one also has a GitHub issue (`gh`) in `Shadysmetools/shop-os` for the PR to close. Columns: **To do → In progress → Blocked → In review → Done**.

Use the CLI in this repo. It needs the board key in `SHOP_OS_BOARD_KEY` (ask the mentor; never commit it or print it). Set `SHOP_OS_AGENT_NAME` (for example `Claude`) so your comments show who wrote them.

```bash
node scripts/board.mjs list "In progress"        # or: list   (all tickets)
node scripts/board.mjs show T-FND-1              # body, acceptance criteria, hint, comments, GitHub issue
node scripts/board.mjs move T-FND-1 "In progress"
node scripts/board.mjs comment T-FND-1 "What changed, the PR link, what's left"
node scripts/board.mjs create "Fix the invoice rounding bug" "SO-M4 Sales and Invoices" high < body.md
```

The raw HTTP API (curl examples, every op, the rules) is in `docs/board-api.md`.

## Rules
- Before starting a ticket, `show` it and read the acceptance criteria and the 💡 Hint section.
- Moving a ticket to **In progress**: only one or two at a time. Make the branch `feat/<gh-issue-number>-<slug>`.
- **Blocked**: move it there and comment what you tried and what you need, then tell Khaled.
- Moving to **In review**: only after the PR is open, CI is green, and the PR body says `Closes #<gh-issue-number>`. Comment the PR link on the ticket.
- **Done**: only the mentor moves tickets to Done (after merging). The API returns 403 if you try. Never retry it.
- Never rewrite the acceptance criteria. If they look wrong, comment and ask.
- Every status change posts one line in the Telegram Shop OS topic, so don't move tickets back and forth for no reason.
