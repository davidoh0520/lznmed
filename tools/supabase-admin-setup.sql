-- LZN MEDICAL storefront admin setup
-- Run this file once in Supabase > SQL Editor.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists buyer_type text not null default 'company';
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists whatsapp text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists state_province text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists address_line_1 text;
alter table public.profiles add column if not exists address_line_2 text;
alter table public.profiles add column if not exists postal_code text;
alter table public.profiles add column if not exists tax_id text;
alter table public.profiles add column if not exists preferred_courier text;
alter table public.profiles add column if not exists courier_account_no text;
alter table public.profiles add column if not exists cart_reminder_opt_in boolean not null default false;
alter table public.orders add column if not exists invoice_no text;
alter table public.orders add column if not exists buyer_type text;
alter table public.orders add column if not exists company_name text;
alter table public.orders add column if not exists tracking_no text;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists admin_note text;
alter table public.orders add column if not exists payment_submitted_at timestamptz;
alter table public.orders add column if not exists payment_reference text;
alter table public.orders add column if not exists payment_note text;
alter table public.orders add column if not exists pi_file_path text;
alter table public.orders add column if not exists pi_filename text;
alter table public.orders add column if not exists pi_created_at timestamptz;
alter table public.orders add column if not exists pi_emailed_at timestamptz;
alter table public.orders add column if not exists pi_confirmed_at timestamptz;
alter table public.orders add column if not exists ci_file_path text;
alter table public.orders add column if not exists ci_filename text;
alter table public.orders add column if not exists ci_created_at timestamptz;
alter table public.orders add column if not exists ci_emailed_at timestamptz;
alter table public.orders add column if not exists shipped_emailed_at timestamptz;
alter table public.orders add column if not exists delivered_emailed_at timestamptz;
alter table public.orders add column if not exists shipment_packages jsonb not null default '[]'::jsonb;

alter table public.orders drop constraint if exists orders_shipment_packages_array_check;
alter table public.orders add constraint orders_shipment_packages_array_check
check (jsonb_typeof(shipment_packages) = 'array');

-- Keep historical business records when an administrator removes a member login.
-- The member's auth account, profile and cart are deleted; their past orders remain.
alter table public.orders alter column user_id drop not null;
alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.orders add constraint orders_user_id_fkey
foreign key (user_id) references auth.users(id) on delete set null;

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do update set public = false;

drop policy if exists "invoice_files_admin_select" on storage.objects;
create policy "invoice_files_admin_select" on storage.objects
for select using (bucket_id = 'invoices' and public.is_admin());

create or replace function public.confirm_proforma_invoice(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.orders
  set pi_confirmed_at = coalesce(pi_confirmed_at, now()), updated_at = now()
  where id = p_order_id and user_id = auth.uid()
    and pi_created_at is not null
    and status in ('quoted', 'payment_pending');
  if not found then raise exception 'This Proforma Invoice is not ready for confirmation.'; end if;
end;
$$;
revoke all on function public.confirm_proforma_invoice(uuid) from public;
grant execute on function public.confirm_proforma_invoice(uuid) to authenticated;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
check (status in ('quote_requested','quoted','payment_pending','payment_submitted','paid','processing','shipped','cancelled'));

create or replace function public.submit_payment_notice(
  p_order_id uuid,
  p_reference text default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set status = 'payment_submitted',
      payment_submitted_at = now(),
      payment_reference = nullif(trim(p_reference), ''),
      payment_note = nullif(trim(p_note), ''),
      updated_at = now()
  where id = p_order_id
    and user_id = auth.uid()
    and status in ('quoted', 'payment_pending');

  if not found then
    raise exception 'This order is not ready for a payment notice.';
  end if;
end;
$$;

revoke all on function public.submit_payment_notice(uuid, text, text) from public;
grant execute on function public.submit_payment_notice(uuid, text, text) to authenticated;

alter table public.profiles drop constraint if exists profiles_preferred_courier_check;
alter table public.profiles add constraint profiles_preferred_courier_check
check (preferred_courier is null or preferred_courier in ('DHL','FedEx','UPS','EMS','SF Express','Other'));

alter table public.profiles drop constraint if exists profiles_buyer_type_check;
update public.profiles set buyer_type = 'company' where buyer_type <> 'company';
alter table public.profiles add constraint profiles_buyer_type_check
check (buyer_type = 'company');

alter table public.orders drop constraint if exists orders_buyer_type_check;
update public.orders set buyer_type = 'company' where buyer_type = 'individual';
alter table public.orders add constraint orders_buyer_type_check
check (buyer_type is null or buyer_type = 'company');

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  registration jsonb;
begin
  registration := coalesce(new.raw_user_meta_data -> 'registration_profile', '{}'::jsonb);
  insert into public.profiles (
    id, full_name, email, company_name, buyer_type, phone, whatsapp, country,
    state_province, city, address_line_1, address_line_2, postal_code, tax_id,
    preferred_courier, courier_account_no, cart_reminder_opt_in
  ) values (
    new.id,
    coalesce(nullif(registration ->> 'full_name', ''), new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(nullif(registration ->> 'company_name', ''), nullif(new.raw_user_meta_data ->> 'company_name', '')),
    'company',
    nullif(registration ->> 'phone', ''),
    nullif(registration ->> 'whatsapp', ''),
    nullif(registration ->> 'country', ''),
    nullif(registration ->> 'state_province', ''),
    nullif(registration ->> 'city', ''),
    nullif(registration ->> 'address_line_1', ''),
    nullif(registration ->> 'address_line_2', ''),
    nullif(registration ->> 'postal_code', ''),
    nullif(registration ->> 'tax_id', ''),
    nullif(registration ->> 'preferred_courier', ''),
    nullif(registration ->> 'courier_account_no', ''),
    coalesce((registration ->> 'cart_reminder_opt_in')::boolean, false)
  )
  on conflict (id) do update set
    email = excluded.email,
    buyer_type = 'company',
    company_name = coalesce(excluded.company_name, public.profiles.company_name),
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone),
    whatsapp = coalesce(excluded.whatsapp, public.profiles.whatsapp),
    country = coalesce(excluded.country, public.profiles.country),
    state_province = coalesce(excluded.state_province, public.profiles.state_province),
    city = coalesce(excluded.city, public.profiles.city),
    address_line_1 = coalesce(excluded.address_line_1, public.profiles.address_line_1),
    address_line_2 = coalesce(excluded.address_line_2, public.profiles.address_line_2),
    postal_code = coalesce(excluded.postal_code, public.profiles.postal_code),
    tax_id = coalesce(excluded.tax_id, public.profiles.tax_id),
    preferred_courier = coalesce(excluded.preferred_courier, public.profiles.preferred_courier),
    courier_account_no = coalesce(excluded.courier_account_no, public.profiles.courier_account_no),
    cart_reminder_opt_in = excluded.cart_reminder_opt_in;
  insert into public.carts (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self" on public.admin_users
for select using (user_id = auth.uid());

drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles
for select using (public.is_admin());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_admin_select" on public.orders;
create policy "orders_admin_select" on public.orders
for select using (public.is_admin());

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order_items_admin_select" on public.order_items;
create policy "order_items_admin_select" on public.order_items
for select using (public.is_admin());

drop policy if exists "order_items_admin_update" on public.order_items;
create policy "order_items_admin_update" on public.order_items
for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.admin_update_order_items(
  p_order_id uuid,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  item_id uuid;
  item_quantity integer;
  item_price numeric(12,2);
  updated_order public.orders;
begin
  if not public.is_admin() then
    raise exception 'Administrator access required.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one order item is required.';
  end if;

  for item in select value from jsonb_array_elements(p_items)
  loop
    item_id := (item ->> 'id')::uuid;
    item_quantity := (item ->> 'quantity')::integer;
    item_price := round((item ->> 'unit_price_usd')::numeric, 2);
    if item_quantity < 1 or item_price < 0 then
      raise exception 'Invalid quantity or selling price.';
    end if;
    update public.order_items
    set quantity = item_quantity,
        unit_price_usd = item_price
    where id = item_id and order_id = p_order_id;
    if not found then
      raise exception 'Order item % was not found.', item_id;
    end if;
  end loop;

  update public.orders
  set subtotal_usd = coalesce((
        select sum(line_total_usd)
        from public.order_items
        where order_id = p_order_id
      ), 0),
      total_usd = greatest(0, coalesce((
        select sum(line_total_usd)
        from public.order_items
        where order_id = p_order_id
      ), 0) - coalesce(discount_usd, 0) + coalesce(freight_usd, 0)),
      updated_at = now()
  where id = p_order_id
  returning * into updated_order;

  if updated_order.id is null then
    raise exception 'Order was not found.';
  end if;
  return updated_order;
end;
$$;

revoke all on function public.admin_update_order_items(uuid, jsonb) from public;
grant execute on function public.admin_update_order_items(uuid, jsonb) to authenticated;

-- Replace the email below with the email account you use to sign in to the storefront.
-- Then remove the two leading dashes and run this statement once:
-- insert into public.admin_users (user_id)
-- select id from auth.users where lower(email) = lower('YOUR-ADMIN-EMAIL@example.com')
-- on conflict (user_id) do nothing;

-- Existing installations should also run supabase-product-logistics-setup.sql
-- to enable the Product logistics admin tab and automatic freight estimates.

