-- Persistent account carts, cart reminder consent and 30-day retention.
-- Safe to run more than once in the Supabase SQL editor.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists cart_reminder_opt_in boolean not null default false,
  add column if not exists cart_reminder_unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists cart_reminder_opt_in_at timestamptz,
  add column if not exists cart_reminder_opt_out_at timestamptz;

alter table public.carts
  add column if not exists reminder_days_sent integer[] not null default '{}',
  add column if not exists reminder_deleted_at timestamptz;

alter table public.cart_items
  add column if not exists item_key text,
  add column if not exists source_store text not null default 'Tools',
  add column if not exists image_url text,
  add column if not exists item_data jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

update public.cart_items
set item_key = concat_ws('|', source_store, model)
where item_key is null or item_key = '';

alter table public.cart_items alter column item_key set not null;
alter table public.cart_items drop constraint if exists cart_items_cart_id_model_key;
create unique index if not exists cart_items_cart_id_item_key_key
  on public.cart_items(cart_id, item_key);

create or replace function public.replace_my_cart(p_items jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_cart_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Cart items must be a JSON array';
  end if;

  insert into public.carts (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  select id into v_cart_id
  from public.carts
  where user_id = v_user_id
  for update;

  delete from public.cart_items where cart_id = v_cart_id;

  insert into public.cart_items (
    cart_id, item_key, source_store, model, product_name,
    unit_price_usd, quantity, image_url, item_data, updated_at
  )
  select
    v_cart_id,
    left(coalesce(nullif(item ->> 'itemKey', ''), gen_random_uuid()::text), 500),
    left(coalesce(nullif(item ->> 'sourceStore', ''), 'Tools'), 80),
    left(coalesce(nullif(item ->> 'model', ''), 'Product'), 300),
    left(coalesce(nullif(item ->> 'productName', ''), nullif(item ->> 'model', ''), 'Product'), 500),
    greatest(0, coalesce((item ->> 'unitPriceUsd')::numeric, 0)),
    greatest(1, coalesce((item ->> 'quantity')::integer, 1)),
    nullif(item ->> 'imageUrl', ''),
    coalesce(item -> 'itemData', '{}'::jsonb),
    now()
  from jsonb_array_elements(p_items) as item;

  update public.carts
  set updated_at = now(),
      reminder_days_sent = '{}',
      reminder_deleted_at = null
  where id = v_cart_id;

  return v_cart_id;
end;
$$;

revoke all on function public.replace_my_cart(jsonb) from public;
grant execute on function public.replace_my_cart(jsonb) to authenticated;

create or replace function public.expire_abandoned_cart(
  p_cart_id uuid,
  p_expected_updated_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.carts
    where id = p_cart_id
      and updated_at = p_expected_updated_at
      and updated_at <= now() - interval '30 days'
      and reminder_deleted_at is null
  ) then
    return false;
  end if;

  delete from public.cart_items where cart_id = p_cart_id;
  update public.carts
  set reminder_deleted_at = now()
  where id = p_cart_id and updated_at = p_expected_updated_at;
  return true;
end;
$$;

revoke all on function public.expire_abandoned_cart(uuid, timestamptz) from public;
grant execute on function public.expire_abandoned_cart(uuid, timestamptz) to service_role;

create or replace function public.track_cart_reminder_consent()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.cart_reminder_opt_in then
      new.cart_reminder_opt_in_at = now();
      new.cart_reminder_opt_out_at = null;
    else
      new.cart_reminder_opt_out_at = now();
    end if;
  elsif new.cart_reminder_opt_in is distinct from old.cart_reminder_opt_in then
    if new.cart_reminder_opt_in then
      new.cart_reminder_opt_in_at = now();
      new.cart_reminder_opt_out_at = null;
    else
      new.cart_reminder_opt_out_at = now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists track_cart_reminder_consent on public.profiles;
create trigger track_cart_reminder_consent
before insert or update of cart_reminder_opt_in on public.profiles
for each row execute function public.track_cart_reminder_consent();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, full_name, email, company_name, buyer_type, cart_reminder_opt_in
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'company_name', ''),
    'company',
    coalesce((new.raw_user_meta_data ->> 'cart_reminder_opt_in')::boolean, false)
  )
  on conflict (id) do update
  set email = excluded.email,
      buyer_type = 'company';

  insert into public.carts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Create the scheduled job after deploying the cart-reminders Edge Function and
-- storing project_url and service_role_key in Supabase Vault. See
-- CART-REMINDER-AUTOMATION.md for the one-time commands.
