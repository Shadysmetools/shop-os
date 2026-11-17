// Shop OS board CLI, for you and your Claude agents (like the ClickUp API).
// It talks to the board on the dashboard: https://khaled-quest.vercel.app/#board
// One-time setup: put your board key in an env var (never commit it):
//   export SHOP_OS_BOARD_KEY=...        (PowerShell: $env:SHOP_OS_BOARD_KEY="...")
// Usage:
//   node scripts/board.mjs list [status]               e.g. list "In progress"
//   node scripts/board.mjs show T-FND-1
//   node scripts/board.mjs move T-FND-1 "In progress"  (To do | In progress | Blocked | In review | Done*)
//   node scripts/board.mjs comment T-FND-1 "Pushed the CI workflow, PR #12"
//   node scripts/board.mjs create "Title" [milestone] [priority]   (body from stdin if piped)
// *Only the mentor can move a task to Done. Full API: docs/board-api.md
const BASE = process.env.SHOP_OS_BOARD_URL || "https://khaled-quest.vercel.app/api/board";
const KEY = process.env.SHOP_OS_BOARD_KEY;
const STATUSES = ["To do", "In progress", "Blocked", "In review", "Done"];

async function api(method, body, qs = "") {
  if (!KEY) throw new Error("Set SHOP_OS_BOARD_KEY first (ask the mentor for the key).");
  const r = await fetch(BASE + qs, { method,
    headers: { authorization: `Bearer ${KEY}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status}: ${j.error || r.statusText}`);
  return j;
}
const normId = id => { const s = String(id || "").toUpperCase(); return s.startsWith("T-") ? s : "T-" + s; };
const status = s => STATUSES.find(x => x.toLowerCase() === String(s || "").trim().toLowerCase());
async function stdin() {
  if (process.stdin.isTTY) return "";
  let s = ""; for await (const c of process.stdin) s += c; return s;
}

const [cmd, id, ...rest] = process.argv.slice(2);
try {
  switch (cmd) {
    case "list": {
      const want = [id, ...rest].filter(Boolean).join(" ");
      if (want && !status(want)) throw new Error(`Status must be one of: ${STATUSES.join(", ")}`);
      const { tasks } = await api("GET");
      for (const t of tasks.filter(t => !want || t.status === status(want))) {
        console.log(`${t.status.padEnd(12)} ${t.id.padEnd(10)} ${t.priority.padEnd(7)} ${t.size}  due ${t.due || "-"}  ${t.title}${t.comments ? `  (${t.comments} 💬)` : ""}`);
      }
      break;
    }
    case "show": {
      const { task: t, comments } = await api("GET", null, `?id=${encodeURIComponent(normId(id))}`);
      console.log(`${t.id} · ${t.title}`);
      console.log(`${t.status} · ${t.priority} · size ${t.size} · ${t.milestone} · due ${t.due || "-"} · ${t.assignee}`);
      if (t.gh) console.log(`GitHub issue #${t.gh}: https://github.com/Shadysmetools/shop-os/issues/${t.gh}`);
      if (t.labels?.length) console.log(`labels: ${t.labels.join(", ")}`);
      console.log(`\n${t.body || "(no description)"}\n`);
      console.log(`--- ${comments.length} comment(s)`);
      for (const c of comments) console.log(`[${new Date(c.at).toISOString().slice(0, 16).replace("T", " ")}] ${c.by}: ${c.text}`);
      break;
    }
    case "move": {
      const s = status(rest.join(" "));
      if (!s) throw new Error(`Status must be one of: ${STATUSES.join(", ")}`);
      const { task } = await api("POST", { op: "move", id: normId(id), status: s });
      console.log(`${task.id} → ${task.status}`);
      break;
    }
    case "comment": {
      const text = rest.join(" ") || await stdin();
      const { task } = await api("POST", { op: "comment", id: normId(id), text, by: process.env.SHOP_OS_AGENT_NAME });
      console.log(`Commented on ${task.id} (${task.comments} comment(s))`);
      break;
    }
    case "create": {
      const [milestone, priority] = rest;
      const { task } = await api("POST", { op: "create", title: id, milestone, priority, body: await stdin() });
      console.log(`Created ${task.id} in ${task.milestone} (${task.priority})`);
      break;
    }
    default:
      console.log('commands: list [status] | show <T-ID> | move <T-ID> <status> | comment <T-ID> <text> | create "<title>" [milestone] [priority]');
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
