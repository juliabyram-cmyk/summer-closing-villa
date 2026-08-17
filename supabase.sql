create table if not exists public.responses (
  participant_name text primary key,
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.responses enable row level security;

-- Prototype policy. Tighten before public launch if desired.
create policy "allow anonymous read responses"
on public.responses for select
to anon
using (true);

create policy "allow anonymous insert responses"
on public.responses for insert
to anon
with check (true);

create policy "allow anonymous update responses"
on public.responses for update
to anon
using (true)
with check (true);
