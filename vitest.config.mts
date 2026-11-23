import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

// Database tests read the local Supabase URL and keys from .env.local.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// `pnpm test` runs unit tests only. `pnpm test:db` (vitest --mode db) runs
// *.db.test.ts files, which need the local database (`pnpm db:start`).
const dbTests = ["src/**/*.db.test.ts"];

export default defineConfig(({ mode }) => ({
  resolve: {
    // Same "@/..." import alias as tsconfig.json, so tests can import app code.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test:
    mode === "db"
      ? { include: dbTests }
      : {
          include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
          exclude: [...configDefaults.exclude, ...dbTests],
        },
}));
