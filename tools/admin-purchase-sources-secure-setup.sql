-- Private supplier-source storage for authenticated LZN administrators.
-- This schema contains no supplier URLs, source IDs, or purchase prices.

create table if not exists public.admin_purchase_sources (
  public_model text primary key,
  source_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_purchase_sources enable row level security;

drop policy if exists "admin_purchase_sources_admin_select"
  on public.admin_purchase_sources;
create policy "admin_purchase_sources_admin_select"
  on public.admin_purchase_sources
  for select
  using (public.is_admin());

drop policy if exists "admin_purchase_sources_admin_insert"
  on public.admin_purchase_sources;
create policy "admin_purchase_sources_admin_insert"
  on public.admin_purchase_sources
  for insert
  with check (public.is_admin());

drop policy if exists "admin_purchase_sources_admin_update"
  on public.admin_purchase_sources;
create policy "admin_purchase_sources_admin_update"
  on public.admin_purchase_sources
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin_purchase_sources_admin_delete"
  on public.admin_purchase_sources;
create policy "admin_purchase_sources_admin_delete"
  on public.admin_purchase_sources
  for delete
  using (public.is_admin());

revoke all on public.admin_purchase_sources from anon;
grant select, insert, update, delete
  on public.admin_purchase_sources
  to authenticated;
