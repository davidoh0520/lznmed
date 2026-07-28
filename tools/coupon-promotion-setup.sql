-- LZN MEDICAL minimum-order and repeat-coupon promotion.
-- Run once in Supabase > SQL Editor after supabase-setup.sql and
-- supabase-admin-setup.sql. The script is safe to run more than once.

create extension if not exists pgcrypto;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_usd numeric(12,2) not null default 10.00,
  status text not null default 'active',
  issued_for_order_id uuid not null references public.orders(id) on delete restrict,
  issued_sequence integer not null default 1,
  redeemed_order_id uuid references public.orders(id) on delete set null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 days'),
  redeemed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coupons
  add column if not exists issued_sequence integer not null default 1;
alter table public.coupons drop constraint if exists coupons_issued_for_order_id_key;
alter table public.coupons drop constraint if exists coupons_redeemed_order_id_key;
create unique index if not exists coupons_issued_order_sequence_uidx
  on public.coupons(issued_for_order_id, issued_sequence);
create index if not exists coupons_redeemed_order_idx
  on public.coupons(redeemed_order_id);

alter table public.coupons drop constraint if exists coupons_amount_usd_check;
alter table public.coupons add constraint coupons_amount_usd_check
check (amount_usd = 10.00);

alter table public.coupons drop constraint if exists coupons_status_check;
alter table public.coupons add constraint coupons_status_check
check (status in ('active', 'reserved', 'redeemed', 'expired', 'revoked'));

alter table public.orders
  add column if not exists coupon_id uuid references public.coupons(id) on delete set null,
  add column if not exists coupon_code text,
  add column if not exists coupon_codes text[] not null default '{}'::text[],
  add column if not exists discount_usd numeric(12,2) not null default 0,
  add column if not exists has_price_on_request boolean not null default false;

update public.orders
set coupon_codes = array[coupon_code]
where coupon_code is not null
  and cardinality(coupon_codes) = 0;

alter table public.orders drop constraint if exists orders_discount_usd_check;
alter table public.orders add constraint orders_discount_usd_check
check (discount_usd >= 0 and discount_usd <= subtotal_usd);

create index if not exists coupons_user_status_expires_idx
  on public.coupons(user_id, status, expires_at);

alter table public.coupons enable row level security;

drop policy if exists "coupons_select_own" on public.coupons;
create policy "coupons_select_own" on public.coupons
for select using (auth.uid() = user_id);

drop policy if exists "coupons_admin_select" on public.coupons;
create policy "coupons_admin_select" on public.coupons
for select using (public.is_admin());

create or replace function public.generate_coupon_code()
returns text
language sql
volatile
set search_path = public
as $$
  select 'LZN10-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

revoke all on function public.generate_coupon_code() from public;

create or replace function public.recalculate_order_total()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.subtotal_usd := round(greatest(coalesce(new.subtotal_usd, 0), 0), 2);
  new.discount_usd := round(greatest(coalesce(new.discount_usd, 0), 0), 2);
  if new.discount_usd > new.subtotal_usd then
    raise exception 'Coupon discount cannot exceed the product subtotal.';
  end if;
  new.total_usd := round(
    new.subtotal_usd - new.discount_usd + greatest(coalesce(new.freight_usd, 0), 0),
    2
  );
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists recalculate_order_total on public.orders;
drop trigger if exists recalculate_order_total_insert on public.orders;
drop trigger if exists recalculate_order_total_update on public.orders;
create trigger recalculate_order_total_insert
before insert on public.orders
for each row execute function public.recalculate_order_total();
create trigger recalculate_order_total_update
before update of subtotal_usd, discount_usd, freight_usd on public.orders
for each row execute function public.recalculate_order_total();

create or replace function public.enforce_order_minimum()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status not in ('quote_requested', 'quoted', 'cancelled')
     and new.subtotal_usd < 100 then
    raise exception 'The product subtotal before coupon must be at least USD 100 before the order can proceed.';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_order_minimum on public.orders;
drop trigger if exists enforce_order_minimum_insert on public.orders;
drop trigger if exists enforce_order_minimum_update on public.orders;
create trigger enforce_order_minimum_insert
before insert on public.orders
for each row execute function public.enforce_order_minimum();
create trigger enforce_order_minimum_update
before update of status, subtotal_usd on public.orders
for each row execute function public.enforce_order_minimum();

create or replace function public.place_order(
  p_payment_method text,
  p_destination_country text,
  p_company_name text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_shipping_address text,
  p_postal_code text,
  p_courier text,
  p_courier_account_no text,
  p_customer_note text,
  p_coupon_codes text[],
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric(12,2);
  v_has_price_on_request boolean;
  v_coupon_codes text[] := array(
    select distinct upper(trim(value))
    from unnest(coalesce(p_coupon_codes, '{}'::text[])) as value
    where nullif(trim(value), '') is not null
  );
  v_coupon_ids uuid[] := '{}'::uuid[];
  v_coupon_count integer := 0;
  v_coupon_limit integer := 0;
  v_coupon_discount numeric(12,2) := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  select
    round(coalesce(sum(
      greatest(0, coalesce(nullif(item ->> 'unitPriceUsd', '')::numeric, 0))
      * greatest(1, coalesce(nullif(item ->> 'quantity', '')::integer, 1))
    ), 0), 2),
    coalesce(bool_or(coalesce(nullif(item ->> 'priceOnRequest', '')::boolean, false)), false)
  into v_subtotal, v_has_price_on_request
  from jsonb_array_elements(p_items) as item;

  if v_subtotal < 100 and not v_has_price_on_request then
    raise exception 'Minimum order is USD 100 before coupons, excluding freight.';
  end if;

  v_coupon_count := cardinality(v_coupon_codes);
  v_coupon_limit := floor(v_subtotal / 100)::integer;

  if v_coupon_count > v_coupon_limit then
    raise exception 'You can use at most one coupon for each USD 100 of product subtotal.';
  end if;

  if v_coupon_count > 0 then
    select
      coalesce(array_agg(eligible.id order by eligible.expires_at, eligible.code), '{}'::uuid[]),
      coalesce(sum(eligible.amount_usd), 0)
    into v_coupon_ids, v_coupon_discount
    from (
      select id, code, amount_usd, expires_at
      from public.coupons
      where user_id = v_user_id
        and upper(code) = any(v_coupon_codes)
        and status = 'active'
        and expires_at > now()
      order by expires_at, code
      for update
    ) as eligible;

    if cardinality(v_coupon_ids) <> v_coupon_count then
      raise exception 'One or more coupons are invalid, expired, reserved or already used.';
    end if;
  end if;

  insert into public.orders (
    user_id,
    status,
    subtotal_usd,
    discount_usd,
    coupon_id,
    coupon_code,
    coupon_codes,
    has_price_on_request,
    payment_method,
    destination_country,
    buyer_type,
    company_name,
    contact_name,
    contact_email,
    contact_phone,
    shipping_address,
    postal_code,
    courier,
    courier_account_no,
    customer_note
  )
  values (
    v_user_id,
    'quote_requested',
    v_subtotal,
    v_coupon_discount,
    v_coupon_ids[1],
    v_coupon_codes[1],
    v_coupon_codes,
    v_has_price_on_request,
    case
      when p_payment_method = 'payoneer_card_paypal' then 'payoneer_card_paypal'
      else 'company_bank_transfer'
    end,
    nullif(trim(p_destination_country), ''),
    'company',
    nullif(trim(p_company_name), ''),
    nullif(trim(p_contact_name), ''),
    nullif(trim(p_contact_email), ''),
    nullif(trim(p_contact_phone), ''),
    nullif(trim(p_shipping_address), ''),
    nullif(trim(p_postal_code), ''),
    nullif(trim(p_courier), ''),
    nullif(trim(p_courier_account_no), ''),
    nullif(trim(p_customer_note), '')
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id,
    model,
    product_name,
    unit_price_usd,
    quantity
  )
  select
    v_order_id,
    left(coalesce(nullif(item ->> 'model', ''), 'Product'), 300),
    left(coalesce(nullif(item ->> 'productName', ''), nullif(item ->> 'model', ''), 'Product'), 500),
    greatest(0, coalesce(nullif(item ->> 'unitPriceUsd', '')::numeric, 0)),
    greatest(1, coalesce(nullif(item ->> 'quantity', '')::integer, 1))
  from jsonb_array_elements(p_items) as item;

  if cardinality(v_coupon_ids) > 0 then
    update public.coupons
    set status = 'reserved',
        redeemed_order_id = v_order_id,
        redeemed_at = null,
        updated_at = now()
    where id = any(v_coupon_ids);
  end if;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(
  text, text, text, text, text, text, text, text, text, text, text, text[], jsonb
) from public;
grant execute on function public.place_order(
  text, text, text, text, text, text, text, text, text, text, text, text[], jsonb
) to authenticated;

-- Backward-compatible wrapper for visitors with the previous cached checkout.
create or replace function public.place_order(
  p_payment_method text,
  p_destination_country text,
  p_company_name text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_shipping_address text,
  p_postal_code text,
  p_courier text,
  p_courier_account_no text,
  p_customer_note text,
  p_coupon_code text,
  p_items jsonb
)
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$
  select public.place_order(
    p_payment_method,
    p_destination_country,
    p_company_name,
    p_contact_name,
    p_contact_email,
    p_contact_phone,
    p_shipping_address,
    p_postal_code,
    p_courier,
    p_courier_account_no,
    p_customer_note,
    case
      when nullif(trim(coalesce(p_coupon_code, '')), '') is null then '{}'::text[]
      else array[p_coupon_code]
    end,
    p_items
  );
$$;

revoke all on function public.place_order(
  text, text, text, text, text, text, text, text, text, text, text, text, jsonb
) from public;
grant execute on function public.place_order(
  text, text, text, text, text, text, text, text, text, text, text, text, jsonb
) to authenticated;

-- Orders must be created through place_order() so the USD 100 minimum and
-- coupon reservation are enforced in one transaction.
drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "order_items_insert_own" on public.order_items;

create or replace function public.handle_order_coupon_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sequence integer;
  v_coupon_count integer;
begin
  if new.status = 'paid' and old.status is distinct from new.status then
    update public.coupons
    set status = 'redeemed',
        redeemed_at = coalesce(redeemed_at, now()),
        updated_at = now()
    where redeemed_order_id = new.id
      and status = 'reserved';

    -- One USD 10 coupon is earned for every complete USD 100 of product subtotal.
    v_coupon_count := floor(new.subtotal_usd / 100)::integer;
    if v_coupon_count > 0 then
      for v_sequence in 1..v_coupon_count loop
        insert into public.coupons (
          code,
          user_id,
          amount_usd,
          status,
          issued_for_order_id,
          issued_sequence,
          issued_at,
          expires_at
        )
        values (
          public.generate_coupon_code(),
          new.user_id,
          10.00,
          'active',
          new.id,
          v_sequence,
          now(),
          now() + interval '60 days'
        )
        on conflict (issued_for_order_id, issued_sequence) do nothing;
      end loop;
    end if;
  end if;

  if new.status = 'cancelled' and old.status is distinct from new.status then
    update public.coupons
    set status = case when expires_at > now() then 'active' else 'expired' end,
        redeemed_order_id = null,
        redeemed_at = null,
        updated_at = now()
    where redeemed_order_id = new.id
      and status in ('reserved', 'redeemed');

    update public.coupons
    set status = 'revoked',
        revoked_at = now(),
        updated_at = now()
    where issued_for_order_id = new.id
      and status = 'active';
  end if;

  return new;
end;
$$;

drop trigger if exists handle_order_coupon_lifecycle on public.orders;
create trigger handle_order_coupon_lifecycle
after update of status on public.orders
for each row execute function public.handle_order_coupon_lifecycle();

-- Recover every coupon earned while checkout used the pre-migration fallback,
-- and top up orders that received only one coupon under the previous rule.
insert into public.coupons (
  code,
  user_id,
  amount_usd,
  status,
  issued_for_order_id,
  issued_sequence,
  issued_at,
  expires_at
)
select
  public.generate_coupon_code(),
  orders.user_id,
  10.00,
  'active',
  orders.id,
  sequence.number,
  now(),
  now() + interval '60 days'
from public.orders
cross join lateral generate_series(1, floor(orders.subtotal_usd / 100)::integer) as sequence(number)
where orders.status = 'paid'
  and orders.user_id is not null
  and orders.subtotal_usd >= 100
  and (
    orders.customer_note like '%[USD 10 NEXT-ORDER COUPON ELIGIBLE]%'
    or exists (
      select 1
      from public.coupons existing
      where existing.issued_for_order_id = orders.id
    )
  )
on conflict (issued_for_order_id, issued_sequence) do nothing;

comment on table public.coupons is
'USD 10 repeat-order coupons. One coupon is issued after payment confirmation for every complete USD 100 of pre-coupon product subtotal.';
comment on column public.orders.subtotal_usd is
'Product subtotal before coupon and freight. This value controls the USD 100 minimum order and repeat-coupon eligibility.';
comment on column public.orders.discount_usd is
'Coupon amount deducted after minimum-order eligibility is checked. One coupon may be used for every complete USD 100 of product subtotal.';
