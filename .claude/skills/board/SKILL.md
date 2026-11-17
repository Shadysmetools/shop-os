---
name: board
description: Read and update the Shop OS ticket board (GitHub Project 8). Use when the user or a task says "move the ticket", "update the board", "what's next", "which tickets are in progress", "comment on T-XXX", or when starting, finishing or getting blocked on a ticket.
---

# Shop OS board

The board is GitHub Project 8 (https://github.com/users/Shadysmetools/projects/8). Tickets are issues in `Shadysmetools/shop-os`, titled `[T-AREA-n] ...` (for example `[T-FND-1]`). Columns: **Todo → In Progress → In Review → Done**.

Use the CLI in this repo. It runs with Khaled's own GitHub login, so every change shows his name:

```bash
node scripts/board.mjs list "In Progress"        # or: list   (all tickets)
node scripts/board.mjs show T-FND-1              # ticket body, acceptance criteria, hint
node scripts/board.mjs move T-FND-1 "In Progress"
node scripts/board.mjs comment T-FND-1 "What changed, the PR link, what's left"
```

## Rules
- Moving a ticket to **In Progress**: only one or two at a time. Make the branch `feat/<issue-number>-<slug>`.
- Moving to **In Review**: only after the PR is open, CI is green, and the PR body says `Closes #<issue-number>`. Comment the PR link on the ticket.
- **Done**: only the mentor merges, and merging closes the issue. Never move a ticket to Done yourself.
- When blocked, comment on the ticket with what you tried and what you need, then tell Khaled.
- Never edit the acceptance criteria. If they look wrong, comment and ask.
- If `gh` says the token is missing the `project` scope, run `gh auth refresh -s project`.
