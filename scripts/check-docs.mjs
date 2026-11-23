// Checks that the required repo docs exist and are not empty.
// Run: node scripts/check-docs.mjs  (exits with code 1 if anything is missing)
import { existsSync, readFileSync } from "node:fs";

const required = [
  "README.md",
  "CLAUDE.md",
  "docs/adr/0001-tech-stack.md",
  "docs/adr/0002-multi-tenancy-rls.md",
];

// ADRs must follow the template: Context, Decision, Consequences.
const adrSections = ["## Context", "## Decision", "## Consequences"];

const problems = [];

for (const file of required) {
  if (!existsSync(file)) {
    problems.push(`${file} is missing`);
    continue;
  }
  const text = readFileSync(file, "utf8");
  if (text.trim() === "") {
    problems.push(`${file} is empty`);
    continue;
  }
  if (file.startsWith("docs/adr/")) {
    for (const section of adrSections) {
      if (!text.includes(section)) problems.push(`${file} has no "${section}" section`);
    }
  }
}

if (problems.length > 0) {
  console.error("Docs check failed:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`Docs check passed (${required.length} files).`);
