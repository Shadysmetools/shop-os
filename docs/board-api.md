# Board API

The Shop OS ticket board is a small ClickUp-style board on the dashboard: https://khaled-quest.vercel.app/#board. People use the web page; agents (Claude Code, scripts, bots) use this HTTP API. `scripts/board.mjs` wraps it.

- **Base URL:** `https://khaled-quest.vercel.app/api/board`
- **Auth:** `Authorization: Bearer $BOARD_KEY` (or `?k=$BOARD_KEY`). No key or a wrong key returns `401`.
- **Body:** JSON. Every response is JSON; errors look like `{"error": "..."}`.

There are three kinds of key. Each one has a role:

| Role | Who | Can do |
| --- | --- | --- |
| `khaled` | Khaled's personal dashboard key | everything except Done and delete |
| `agent` | the board agent key (`SHOP_OS_BOARD_KEY`) | everything except Done and delete |
| `mentor` | the mentor's key | everything, including Done, delete and seed |

```bash
export BOARD_KEY=...   # your key; never commit it, never paste it in an issue or PR
B=https://khaled-quest.vercel.app/api/board
```

## Statuses

In order: `To do`, `In progress`, `Blocked`, `In review`, `Done`. Status names are case-insensitive in requests.

## Task fields

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `T-FND-1`; new tasks get `T-NEW-<n>` |
| `title` | string | up to 200 characters |
| `body` | markdown | goal, user story, acceptance criteria, checklist (`- [ ]`), 💡 Hint |
| `milestone` | string | one of the milestone titles, e.g. `SO-M0 Foundation` |
| `status` | string | see above |
| `priority` | string | `urgent`, `high`, `medium` or `low` |
| `size` | string | `S`, `M` or `L` |
| `labels` | string[] | e.g. `area:devops`, `skill:git` |
| `assignee` | string | default `Khaled` |
| `due` | `YYYY-MM-DD` | defaults to the milestone's due date |
| `gh` | number | the GitHub issue in `Shadysmetools/shop-os` (use it in `Closes #<gh>`) |
| `order` | number | position inside its column (lower is higher up) |
| `comments` | number | comment count (read-only) |
| `createdAt`, `updatedAt` | ms timestamp | |
| `updatedBy` | string | who changed it last |

## Read

```bash
# All tasks, milestones (with due dates), statuses and your role
curl -s -H "Authorization: Bearer $BOARD_KEY" $B
# -> {"tasks":[...], "milestones":[{"title","description","due"}], "statuses":[...], "role":"agent"}

# One task with its comments (oldest first)
curl -s -H "Authorization: Bearer $BOARD_KEY" "$B?id=T-FND-1"
# -> {"task":{...}, "comments":[{"at","by","role","text"}], "role":"agent"}
```

## Write

Every write is a `POST` with an `op`. It returns `{"ok": true, "task": {...}}`.

### move

```bash
curl -s -X POST $B -H "Authorization: Bearer $BOARD_KEY" -H "content-type: application/json" \
  -d '{"op":"move","id":"T-FND-1","status":"In progress"}'
```

`order` is optional. Without it, the task goes to the bottom of the new column. Moving to `Done` without the mentor key returns `403`.

### update

```bash
curl -s -X POST $B -H "Authorization: Bearer $BOARD_KEY" -H "content-type: application/json" \
  -d '{"op":"update","id":"T-FND-1","fields":{"priority":"urgent","due":"2026-11-22"}}'
```

The editable fields are `title`, `body`, `priority`, `size`, `labels`, `assignee`, `due` and `milestone`. Change the status with `move`, not here.

### comment

```bash
curl -s -X POST $B -H "Authorization: Bearer $BOARD_KEY" -H "content-type: application/json" \
  -d '{"op":"comment","id":"T-FND-1","text":"Opened PR #12, CI green, waiting for review","by":"Claude"}'
```

`by` is optional and only used with the agent key. The comment shows as `Claude (agent)`.

### create

```bash
curl -s -X POST $B -H "Authorization: Bearer $BOARD_KEY" -H "content-type: application/json" \
  -d '{"op":"create","title":"Fix invoice rounding","milestone":"SO-M4 Sales and Invoices","priority":"high","body":"**Goal:** ...\n\n- [ ] test first"}'
```

A new task starts in `To do`, assigned to Khaled, due on its milestone's date. You can also pass `size` and `labels`.

### delete (mentor only)

```bash
curl -s -X POST $B -H "Authorization: Bearer $MENTOR_KEY" -H "content-type: application/json" \
  -d '{"op":"delete","id":"T-NEW-3"}'
```

## Rules

1. **Only the mentor sets `Done`.** The mentor does it after merging the PR. Anyone else gets `403` with a message. Do not retry.
2. **Only the mentor deletes** tasks.
3. **In progress:** keep it to one or two tasks at a time.
4. **Blocked:** add a comment saying what you tried and what you need.
5. **In review:** only once a PR exists with `Closes #<gh>` and CI is green. Comment the PR link.
6. Every status change posts one line to the Telegram **Shop OS** topic. Comments and edits do not post. So move a task once, not back and forth.
7. Every write is logged to the mentor's activity view with your role.

## Status codes

| Code | Meaning |
| --- | --- |
| `200` | ok |
| `400` | bad input (unknown op, unknown status or milestone, bad date) |
| `401` | missing or wrong key |
| `403` | the rule forbids it (Done or delete without the mentor key) |
| `404` | no task with that id |
