-- LZN MEDICAL product logistics management
-- Run once in Supabase > SQL Editor.
-- Product and shipping dimensions are stored separately from storefront catalog data.

create table if not exists public.product_logistics (
  model text primary key,
  product_name text,
  store_section text not null default 'Devices',
  unit_weight_kg numeric(10,3),
  product_length_cm numeric(10,2),
  product_width_cm numeric(10,2),
  product_height_cm numeric(10,2),
  package_weight_kg numeric(10,3),
  package_length_cm numeric(10,2),
  package_width_cm numeric(10,2),
  package_height_cm numeric(10,2),
  units_per_carton integer,
  carton_weight_kg numeric(10,3),
  carton_length_cm numeric(10,2),
  carton_width_cm numeric(10,2),
  carton_height_cm numeric(10,2),
  notes text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_logistics_model_present check (length(trim(model)) > 0),
  constraint product_logistics_store_section_check
    check (store_section in ('Devices','Tools','Frames','Lenses','Other')),
  constraint product_logistics_positive_values check (
    coalesce(unit_weight_kg, 0) >= 0
    and coalesce(product_length_cm, 0) >= 0
    and coalesce(product_width_cm, 0) >= 0
    and coalesce(product_height_cm, 0) >= 0
    and coalesce(package_weight_kg, 0) >= 0
    and coalesce(package_length_cm, 0) >= 0
    and coalesce(package_width_cm, 0) >= 0
    and coalesce(package_height_cm, 0) >= 0
    and coalesce(units_per_carton, 0) >= 0
    and coalesce(carton_weight_kg, 0) >= 0
    and coalesce(carton_length_cm, 0) >= 0
    and coalesce(carton_width_cm, 0) >= 0
    and coalesce(carton_height_cm, 0) >= 0
  )
);

alter table public.product_logistics enable row level security;

drop policy if exists "product_logistics_admin_select" on public.product_logistics;
create policy "product_logistics_admin_select" on public.product_logistics
for select using (public.is_admin());

drop policy if exists "product_logistics_admin_insert" on public.product_logistics;
create policy "product_logistics_admin_insert" on public.product_logistics
for insert with check (public.is_admin());

drop policy if exists "product_logistics_admin_update" on public.product_logistics;
create policy "product_logistics_admin_update" on public.product_logistics
for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_logistics_admin_delete" on public.product_logistics;
create policy "product_logistics_admin_delete" on public.product_logistics
for delete using (public.is_admin());

grant select, insert, update, delete on public.product_logistics to authenticated;

create or replace function public.set_product_logistics_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.model = upper(trim(new.model));
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists product_logistics_updated_at on public.product_logistics;
create trigger product_logistics_updated_at
before insert or update on public.product_logistics
for each row execute function public.set_product_logistics_updated_at();

-- Initial LED vision-chart data from the Liangyou 2024 brochure.
-- Re-running this setup does not overwrite later administrator edits.
insert into public.product_logistics (
  model, product_name, store_section,
  product_length_cm, product_width_cm, product_height_cm,
  package_weight_kg, package_length_cm, package_width_cm, package_height_cm,
  units_per_carton, carton_weight_kg,
  carton_length_cm, carton_width_cm, carton_height_cm, notes
)
values
  ('LY-21C','Slim LED Vision Chart','Devices',90,30,null,2.4,101,9,35,5,13.2,104,39,46,'Liangyou 2024 brochure; 5 m test distance'),
  ('LY-22C','Multi-function LED Vision Chart','Devices',82,42,null,3.3,95,9,50,5,17.8,100,42,55,'Liangyou 2024 brochure; 5 m test distance'),
  ('LY-23C','Compact LED Vision Chart','Devices',60,30,null,1.7,69,7.5,36,5,9.4,72,38,40,'Liangyou 2024 brochure; 2.5 m or 3 m test distance'),
  ('LY-21D','Interchangeable LED Vision Chart Set','Devices',90,26,null,2.4,102,35,9,5,12.7,104,39,46,'Liangyou 2024 brochure; includes two replaceable charts; 5 m'),
  ('LY-23D','Compact Interchangeable LED Vision Chart Set','Devices',60,26,null,1.3,74,35,7,5,8.9,72,38,40,'Liangyou 2024 brochure; includes two replaceable charts; 2.5 m or 3 m'),
  ('LY-21E','Deep-frame LED Vision Chart','Devices',90,26,4,3.3,104,35,12,5,13.2,106,63,37,'Liangyou 2024 brochure; 4 cm frame depth; 5 m'),
  ('LY-23E','Compact Deep-frame LED Vision Chart','Devices',60,26,4,1.3,75,35,12,5,9.7,76,63,37,'Liangyou 2024 brochure; 4 cm frame depth; 2.5 m or 3 m')
on conflict (model) do nothing;

-- Other device and workshop products whose unit/carton packing data was
-- already captured from the same brochure. These are also preserved on re-run.
insert into public.product_logistics (
  model, product_name, store_section,
  package_weight_kg, package_length_cm, package_width_cm, package_height_cm,
  units_per_carton, carton_weight_kg,
  carton_length_cm, carton_width_cm, carton_height_cm, notes
)
values
  ('LY-T-27AT','Digital PD Meter','Devices',1,28,20,10,10,11,43,29,52,'Liangyou 2024 brochure; PD Measurement'),
  ('LY-T-27AC','Digital PD Meter','Devices',1,28,20,10,10,11,43,29,52,'Liangyou 2024 brochure; PD Measurement'),
  ('LY-T-27A','Digital PD Meter','Devices',1,28,20,10,10,11,43,29,52,'Liangyou 2024 brochure; PD Measurement'),
  ('LY-9F','PD & Height Gauge','Devices',0.3,23,10.5,5,null,null,null,null,null,'Liangyou 2024 brochure; PD Measurement'),
  ('LY-18','Digital PD Ruler','Devices',0.26,22,12,6,null,null,null,null,null,'Liangyou 2024 brochure; PD Measurement'),
  ('LY-1800AM','Multi-function Lens Groover','Devices',3,28,24,22,6,19,74,30,47,'Liangyou 2024 brochure; Grooving & Beveling'),
  ('LY-5 SERIES','Configurable Manual Hand Edger','Devices',4.1,35,23,23,4,17.4,48,38,49,'Liangyou 2024 brochure; Hand Edgers & Polishers'),
  ('LY-900','Automatic Polisher','Devices',5.8,34,28,32,2,12.4,58,37,34,'Liangyou 2024 brochure; Hand Edgers & Polishers'),
  ('LY-900CH','Manual Polisher','Devices',3.5,31,21,24,6,22,63,35,50,'Liangyou 2024 brochure; Hand Edgers & Polishers'),
  ('LY-988AT','Drilling & Notching Machine','Devices',3.6,26,24,36,6,23,82,49,39,'Liangyou 2024 brochure; Drilling & Notching'),
  ('LY-988A','Drilling & Notching Machine','Devices',3.6,26,24,36,6,23,82,49,39,'Liangyou 2024 brochure; Drilling & Notching'),
  ('LY-988B','Drilling & Notching Machine','Devices',3.6,26,24,36,6,23,82,49,39,'Liangyou 2024 brochure; Drilling & Notching'),
  ('LY-988C','Drilling & Notching Machine','Devices',3.6,26,24,36,6,23,82,49,39,'Liangyou 2024 brochure; Drilling & Notching'),
  ('LY-998A','Lens Drilling Machine','Devices',3.6,26,24,36,6,23,82,49,39,'Liangyou 2024 brochure; Drilling & Notching'),
  ('LY-2GH','Lens Centering Device','Devices',3,29,22,30,6,19,68,32,65,'Liangyou 2024 brochure; Centering Equipment'),
  ('LY-2A','Lens Centering Device','Devices',3,29,22,30,6,19,68,32,65,'Liangyou 2024 brochure; Centering Equipment'),
  ('LY-2B','Lens Centering Device','Devices',3,29,22,30,6,19,68,32,65,'Liangyou 2024 brochure; Centering Equipment'),
  ('LY-2D','Lens Centering Device','Devices',3,29,22,30,6,19,68,32,65,'Liangyou 2024 brochure; Centering Equipment'),
  ('LY-6AG','Frame Heater','Devices',1.3,22.5,21.5,20,12,16.8,67,48,43,'Liangyou 2024 brochure; Frame Heaters'),
  ('LY-6C','Frame Heater','Devices',0.45,14,14,21,24,12.1,58,44,45.5,'Liangyou 2024 brochure; Frame Heaters'),
  ('UV818WL','UV Transmission Tester','Devices',0.55,26,14,11,20,12,74,29,46,'Liangyou 2024 brochure; Lens Testing Instruments'),
  ('UV818-2','UV Transmission Tester','Devices',0.73,26,14,11,20,15.5,74,29,46,'Liangyou 2024 brochure; Lens Testing Instruments'),
  ('LY-15T','Progressive Lens Tester','Devices',1,20,16,27,10,11.5,84,42,31,'Liangyou 2024 brochure; Lens Testing Instruments'),
  ('PR888','Multi-function Lens Tester','Devices',1.8,28,16,11,5,9.6,73,32,32,'Liangyou 2024 brochure; Lens Testing Instruments'),
  ('GB-120T','Ultrasonic Cleaner','Devices',2.6,25,25,32,6,16,76,53,35,'Liangyou 2024 brochure; Ultrasonic Cleaners'),
  ('GB-113T','Ultrasonic Cleaner','Devices',2.3,25,24,28,6,15,75,52,30,'Liangyou 2024 brochure; Ultrasonic Cleaners'),
  ('GB-008','Ultrasonic Cleaner','Devices',1.2,23,17,18,12,16.2,47,35,56,'Liangyou 2024 brochure; Ultrasonic Cleaners')
on conflict (model) do nothing;

-- PD-adjustable trial frames from page 53 of the Liangyou 2024 brochure.
insert into public.product_logistics (
  model, product_name, store_section,
  package_weight_kg, package_length_cm, package_width_cm, package_height_cm,
  units_per_carton, carton_weight_kg,
  carton_length_cm, carton_width_cm, carton_height_cm, notes
)
values
  ('TF-B','Adjustable Trial Frame','Devices',0.12,19,10,5.5,50,6.9,50,41,30,'Liangyou 2024 brochure page 53; continuously adjustable PD 48-80 mm'),
  ('TF-BT','Adjustable Trial Frame','Devices',0.15,16.5,9,5.5,50,7.9,47,36,30,'Liangyou 2024 brochure page 53; continuously adjustable PD 54-70 mm'),
  ('TF-S','Adjustable Trial Frame','Devices',0.15,18.5,10.5,6,25,4.5,53,33,22,'Liangyou 2024 brochure page 53; continuously adjustable PD 50-80 mm')
on conflict (model) do nothing;

-- LCD vision testers from page 30 of the Liangyou 2024 brochure.
insert into public.product_logistics (
  model, product_name, store_section,
  package_weight_kg, package_length_cm, package_width_cm, package_height_cm, notes
)
values
  ('LY-185','18.5-inch LCD Vision Tester','Devices',4.6,52,12,41,'Liangyou 2024 brochure page 30; screen size 18.5 inches; price on request'),
  ('LY-215','21.5-inch LCD Vision Tester','Devices',5.3,60,13,45,'Liangyou 2024 brochure page 30; screen size 21.5 inches; price on request'),
  ('LY-230','23-inch LCD Vision Tester','Devices',5.6,68,12,45,'Liangyou 2024 brochure page 30; screen size 23 inches; price on request'),
  ('LY-230(3D)','23-inch 3D LCD Vision Tester','Devices',5.6,68,12,45,'Liangyou 2024 brochure page 30; screen size 23 inches; price on request'),
  ('LY-220A','21.5-inch All-in-one LCD Vision Tester','Devices',6.5,58.5,18,50,'Liangyou 2024 brochure page 30; screen size 21.5 inches; price on request'),
  ('LY-215A(3D)','21.5-inch 3D LCD Vision Tester','Devices',5.2,60.5,15,46,'Liangyou 2024 brochure page 30; polarized accessories; price on request')
on conflict (model) do nothing;

-- Small combined ophthalmic table from page 18 of the Liangyou 2024 brochure.
insert into public.product_logistics (
  model, product_name, store_section,
  product_length_cm, product_width_cm, product_height_cm,
  package_weight_kg, package_length_cm, package_width_cm, package_height_cm, notes
)
values
  ('LY-180A','Small Combined Ophthalmic Table','Devices',90,60,71,62,99,59,43,'Liangyou 2024 brochure page 18; table 95 x 52 cm; drawer 54.5 x 32 cm; vertical travel 20 cm; light 20 W; price on request')
on conflict (model) do nothing;

-- Phoropter support arms from page 63 of the Liangyou 2024 brochure.
insert into public.product_logistics (
  model, product_name, store_section, package_weight_kg, notes
)
values
  ('PA-1','Counter-mounted Phoropter Arm with Light','Devices',20,'Liangyou 2024 brochure page 63; up/down angle +/-30 degrees; rotation 90 degrees; price on request'),
  ('PA-2','Wall-mounted Phoropter Arm','Devices',14,'Liangyou 2024 brochure page 63; up/down angle +/-30 degrees; rotation 180 degrees; price on request')
on conflict (model) do nothing;

-- Compact progressive trial lens set.
insert into public.product_logistics (
  model, product_name, store_section,
  package_weight_kg, package_length_cm, package_width_cm, package_height_cm, notes
)
values
  ('JS-22','22-Piece Progressive Trial Lens Set','Devices',0.9,22,18,9,'Liangyou brochure; 22 metal-rim lenses in an aluminium case; price on request')
on conflict (model) do nothing;

-- Multi-pot lens dyeing machines.
insert into public.product_logistics (
  model, product_name, store_section,
  package_weight_kg, package_length_cm, package_width_cm, package_height_cm,
  units_per_carton, carton_weight_kg,
  carton_length_cm, carton_width_cm, carton_height_cm, notes
)
values
  ('DM-2','2-Pot Lens Dyeing Machine','Devices',2.4,33,17,21,4,10.5,43,38,50,'Liangyou brochure; 2 pots; price on request'),
  ('DM-4','4-Pot Lens Dyeing Machine','Devices',5,39,37,22,2,10.9,43,38,50,'Liangyou brochure; 4 pots with mechanical timer; price on request'),
  ('DM-6','6-Pot Lens Dyeing Machine','Devices',6.4,51,37,22,2,15.1,55,47,40,'Liangyou brochure; 6 pots with mechanical timer; price on request')
on conflict (model) do nothing;
