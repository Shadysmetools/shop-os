import { describe, expect, it } from "vitest";

// Needs the local database: run `pnpm db:start` first (`pnpm db:reset` for a clean one).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

async function readSchemaCheck(key: string) {
  const res = await fetch(`${url}/rest/v1/schema_check?select=note`, {
    headers: { apikey: key },
  });
  return { status: res.status, rows: (await res.json()) as { note: string }[] };
}

describe("schema_check table (migration + seed)", () => {
  it("has the env vars it needs", () => {
    expect(url, "copy .env.example to .env.local").toBeTruthy();
    expect(publishableKey).toBeTruthy();
    expect(secretKey).toBeTruthy();
  });

  it("was created by the migration and filled by seed.sql", async () => {
    const { status, rows } = await readSchemaCheck(secretKey!);
    expect(status).toBe(200);
    expect(rows).toContainEqual({ note: "seed loaded" });
  });

  it("is hidden from the browser key by RLS", async () => {
    const { status, rows } = await readSchemaCheck(publishableKey!);
    expect(status).toBe(200);
    expect(rows).toEqual([]);
  });
});
