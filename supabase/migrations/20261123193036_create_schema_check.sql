-- T-FND-3: a tiny table that proves migrations run, locally and in CI.
-- It is not a business table, so it has no shop_id. Remove it in SO-M1 (PRD 00b).

create table public.schema_check (
  id bigint generated always as identity primary key,
  note text not null,
  created_at timestamptz not null default now()
);

-- Supabase exposes every table in the public schema through its API.
-- RLS with no policies means the browser keys (anon, authenticated) can read
-- or write nothing here. Only the database owner and service_role can.
alter table public.schema_check enable row level security;
