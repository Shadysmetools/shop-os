// Shop OS board CLI, for you and your Claude agents (like a Trello/ClickUp API).
// It uses your own GitHub login through the gh CLI. One-time setup:
//   gh auth login            (then)   gh auth refresh -s project
// Usage:
//   node scripts/board.mjs list [status]               e.g. list "In Progress"
//   node scripts/board.mjs show T-FND-1
//   node scripts/board.mjs move T-FND-1 "In Progress"  (Todo | In Progress | In Review | Done)
//   node scripts/board.mjs comment T-FND-1 "Pushed the CI workflow, PR #12"
import { execFileSync } from "node:child_process";

const OWNER = "Shadysmetools", REPO = "Shadysmetools/shop-os", PROJECT = "8";
const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", maxBuffer: 1 << 26 }).trim();
const json = (...a) => JSON.parse(gh(...a));

const items = () => json("project", "item-list", PROJECT, "--owner", OWNER, "--limit", "500", "--format", "json").items;
const find = id => {
  const it = items().find(i => i.content?.title?.startsWith(`[${id}]`));
  if (!it) throw new Error(`No ticket ${id} on the board`);
  return it;
};

const [cmd, id, ...rest] = process.argv.slice(2);
switch (cmd) {
  case "list": {
    for (const i of items().filter(i => !id || i.status === id)) {
      console.log(`${(i.status || "-").padEnd(12)} #${i.content.number}  ${i.content.title}`);
    }
    break;
  }
  case "show": {
    const it = find(id);
    console.log(`${it.status} · ${it.content.url}\n`);
    console.log(gh("issue", "view", String(it.content.number), "-R", REPO));
    break;
  }
  case "move": {
    const status = rest.join(" ");
    const it = find(id);
    const proj = json("project", "view", PROJECT, "--owner", OWNER, "--format", "json");
    const field = json("project", "field-list", PROJECT, "--owner", OWNER, "--format", "json")
      .fields.find(f => f.name === "Status");
    const opt = field.options.find(o => o.name.toLowerCase() === status.toLowerCase());
    if (!opt) throw new Error(`Status must be one of: ${field.options.map(o => o.name).join(", ")}`);
    gh("project", "item-edit", "--project-id", proj.id, "--id", it.id,
      "--field-id", field.id, "--single-select-option-id", opt.id);
    console.log(`${id} → ${opt.name}`);
    break;
  }
  case "comment": {
    const it = find(id);
    console.log(gh("issue", "comment", String(it.content.number), "-R", REPO, "--body", rest.join(" ")));
    break;
  }
  default:
    console.log("commands: list [status] | show <T-ID> | move <T-ID> <status> | comment <T-ID> <text>");
}
