create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  buyer_type text not null default 'company' check (buyer_type = 'company'),
  full_name text,
  company_name text,
  phone text,
  whatsapp text,
  country text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state_province text,
  postal_code text,
  company_registration_no text,
  tax_id text,
  preferred_courier text check (preferred_courier is null or preferred_courier in ('DHL','FedEx','UPS','EMS','SF Express','Other')),
  courier_account_no text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  model text not null,
  product_name text not null,
  unit_price_usd numeric(12,2) not null check (unit_price_usd >= 0),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(cart_id, model)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'quote_requested' check (status in ('quote_requested','quoted','payment_pending','paid','processing','shipped','cancelled')),
  currency text not null default 'USD',
  subtotal_usd numeric(12,2) not null default 0,
  freight_usd numeric(12,2),
  total_usd numeric(12,2),
  destination_country text,
  contact_name text,
  contact_email text,
  contact_phone text,
  buyer_type text check (buyer_type is null or buyer_type = 'company'),
  company_name text,
  shipping_address text,
  postal_code text,
  courier text,
  courier_account_no text,
  incoterm text not null default 'FOB China',
  payment_method text not null default 'Bank transfer',
  bank_fee_option text not null default 'OUR',
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  model text not null,
  product_name text not null,
  unit_price_usd numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  line_total_usd numeric(12,2) generated always as (unit_price_usd * quantity) stored
);

alter table public.profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "carts_own_all" on public.carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cart_items_own_all" on public.cart_items for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid())) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);
create policy "order_items_select_own" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_insert_own" on public.order_items for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, company_name, buyer_type)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email,
    nullif(new.raw_user_meta_data ->> 'company_name', ''), 'company');
  insert into public.carts (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
