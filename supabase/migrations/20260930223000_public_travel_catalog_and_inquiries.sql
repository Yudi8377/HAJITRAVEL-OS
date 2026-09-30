-- HAJITRAVEL OS public travel catalog + inquiry intake
alter table operations.packages enable row level security;
alter table operations.departures enable row level security;

drop policy if exists "public_catalog_packages_select" on operations.packages;
create policy "public_catalog_packages_select" on operations.packages for select to anon
using (status='PUBLISHED' and (effective_from is null or effective_from<=current_date) and (effective_to is null or effective_to>=current_date));

drop policy if exists "public_catalog_departures_select" on operations.departures;
create policy "public_catalog_departures_select" on operations.departures for select to anon
using (status in ('PLANNED','READY') and exists (select 1 from operations.packages p where p.id=operations.departures.package_id and p.status='PUBLISHED' and (p.effective_from is null or p.effective_from<=current_date) and (p.effective_to is null or p.effective_to>=current_date)));

grant usage on schema operations to anon;
revoke all on table operations.packages from anon;
revoke all on table operations.departures from anon;
grant select (id, package_code, package_type, name, currency, effective_from, effective_to, status) on operations.packages to anon;
grant select (id, package_id, departure_code, departure_date, return_date, capacity, status) on operations.departures to anon;

create table if not exists public.travel_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  journey_type text not null check (journey_type in ('UMRAH','HAJI_KHUSUS','PRIVATE','CONSULTATION')),
  preferred_period text,
  message text,
  consent boolean not null default false,
  status text not null default 'NEW' check (status in ('NEW','CONTACTED','QUALIFIED','CLOSED','SPAM'))
);
alter table public.travel_inquiries enable row level security;
revoke all on table public.travel_inquiries from anon;
grant insert (name, phone, email, journey_type, preferred_period, message, consent) on public.travel_inquiries to anon;
drop policy if exists "public_inquiry_insert" on public.travel_inquiries;
create policy "public_inquiry_insert" on public.travel_inquiries for insert to anon
with check (consent=true and length(trim(name)) between 2 and 120 and length(trim(phone)) between 6 and 40 and journey_type in ('UMRAH','HAJI_KHUSUS','PRIVATE','CONSULTATION'));

revoke all on table public.travel_inquiries from authenticated;
grant select, update on public.travel_inquiries to authenticated;
drop policy if exists "authenticated_inquiry_select" on public.travel_inquiries;
create policy "authenticated_inquiry_select" on public.travel_inquiries for select to authenticated using (true);
drop policy if exists "authenticated_inquiry_update" on public.travel_inquiries;
create policy "authenticated_inquiry_update" on public.travel_inquiries for update to authenticated using (true) with check (true);
