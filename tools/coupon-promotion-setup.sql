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
  issued_for_order_id uuid not null unique references public.orders(id) on delete restrict,
  redeemed_order_id uuid unique references public.orders(id) on delete set null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 days'),
  redeemed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coupons drop constraint if exists coupons_amount_usd_check;
alter table public.coupons add constraint coupons_amount_usd_check
check (amount_usd = 10.00);

alter table public.coupons drop constraint if exists coupons_status_check;
alter table public.coupons add constraint coupons_status_check
check (status in ('active', 'reserved', 'redeemed', 'expired', 'revoked'));

alter table public.orders
  add column if not exists coupon_id uuid references public.coupons(id) on delete set null,
  add column if not exists coupon_code text,
  add column if not exists discount_usd numeric(12,2) not null default 0,
  add column if not exists has_price_on_request boolean not null default false;

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
  p_coupon_code text,
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
  v_coupon public.coupons%rowtype;
  v_coupon_code text := nullif(upper(trim(coalesce(p_coupon_code, ''))), '');
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

  if v_coupon_code is not null then
    if v_subtotal < 100 then
      raise exception 'A coupon can only be used when the product subtotal before coupon is at least USD 100.';
    end if;

    select *
    into v_coupon
    from public.coupons
    where user_id = v_user_id
      and upper(code) = v_coupon_code
      and status = 'active'
      and expires_at > now()
    for update;

    if not found then
      raise exception 'This coupon is invalid, expired, reserved or already used.';
    end if;
  end if;

  insert into public.orders (
    user_id,
    status,
    subtotal_usd,
    discount_usd,
    coupon_id,
    coupon_code,
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
    case when v_coupon.id is null then 0 else v_coupon.amount_usd end,
    v_coupon.id,
    case when v_coupon.id is null then null else v_coupon.code end,
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

  if v_coupon.id is not null then
    update public.coupons
    set status = 'reserved',
        redeemed_order_id = v_order_id,
        redeemed_at = null,
        updated_at = now()
    where id = v_coupon.id;
  end if;

  return v_order_id;
end;
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
begin
  if new.status = 'paid' and old.status is distinct from new.status then
    if new.coupon_id is not null then
      update public.coupons
      set status = 'redeemed',
          redeemed_at = coalesce(redeemed_at, now()),
          updated_at = now()
      where id = new.coupon_id
        and redeemed_order_id = new.id
        and status = 'reserved';
    end if;

    -- Eligibility always uses the product subtotal before coupon. Therefore
    -- a USD 100 order that pays USD 90 after a coupon earns a new coupon.
    if new.subtotal_usd >= 100 then
      insert into public.coupons (
        code,
        user_id,
        amount_usd,
        status,
        issued_for_order_id,
        issued_at,
        expires_at
      )
      values (
        public.generate_coupon_code(),
        new.user_id,
        10.00,
        'active',
        new.id,
        now(),
        now() + interval '60 days'
      )
      on conflict (issued_for_order_id) do nothing;
    end if;
  end if;

  if new.status = 'cancelled' and old.status is distinct from new.status then
    if new.coupon_id is not null then
      update public.coupons
      set status = case when expires_at > now() then 'active' else 'expired' end,
          redeemed_order_id = null,
          redeemed_at = null,
          updated_at = now()
      where id = new.coupon_id
        and redeemed_order_id = new.id
        and status in ('reserved', 'redeemed');
    end if;

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

comment on table public.coupons is
'USD 10 repeat-order coupons. One coupon is issued after payment confirmation for each order with a pre-coupon product subtotal of at least USD 100.';
comment on column public.orders.subtotal_usd is
'Product subtotal before coupon and freight. This value controls the USD 100 minimum order and repeat-coupon eligibility.';
comment on column public.orders.discount_usd is
'Coupon amount deducted from the order after minimum-order eligibility is checked.';
