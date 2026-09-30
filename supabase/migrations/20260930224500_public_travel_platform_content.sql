-- HAJITRAVEL OS public travel platform layer
-- Content remains empty until operators publish real data.

create table if not exists public.travel_itineraries (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references operations.packages(id) on delete cascade,
  day_no integer not null check (day_no > 0),
  title text not null check (length(trim(title)) between 2 and 160),
  description text,
  location text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(package_id, day_no)
);

create index if not exists travel_itineraries_public_idx
  on public.travel_itineraries(package_id, is_published, sort_order, day_no);

alter table public.travel_itineraries enable row level security;
revoke all on table public.travel_itineraries from anon;
grant select on table public.travel_itineraries to anon;
drop policy if exists "public_itinerary_select" on public.travel_itineraries;
create policy "public_itinerary_select"
on public.travel_itineraries for select to anon
using (
  is_published = true
  and exists (
    select 1 from operations.packages p
    where p.id = travel_itineraries.package_id
      and p.status = 'PUBLISHED'
      and (p.effective_from is null or p.effective_from <= current_date)
      and (p.effective_to is null or p.effective_to >= current_date)
  )
);

create table if not exists public.travel_faq (
  id uuid primary key default gen_random_uuid(),
  question text not null check (length(trim(question)) between 5 and 240),
  answer text not null check (length(trim(answer)) between 5 and 4000),
  category text not null default 'GENERAL',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists travel_faq_public_idx
  on public.travel_faq(is_published, sort_order);

alter table public.travel_faq enable row level security;
revoke all on table public.travel_faq from anon;
grant select on table public.travel_faq to anon;
drop policy if exists "public_faq_select" on public.travel_faq;
create policy "public_faq_select"
on public.travel_faq for select to anon
using (is_published = true);

alter table public.travel_inquiries
  add column if not exists package_id uuid references operations.packages(id) on delete set null,
  add column if not exists departure_id uuid references operations.departures(id) on delete set null,
  add column if not exists intent text not null default 'CONSULTATION'
    check (intent in ('CONSULTATION','BOOKING_REQUEST')),
  add column if not exists party_size integer
    check (party_size is null or party_size between 1 and 999);

grant insert (name, phone, email, journey_type, preferred_period, message, consent, package_id, departure_id, intent, party_size)
  on public.travel_inquiries to anon;

drop policy if exists "public_inquiry_insert" on public.travel_inquiries;
create policy "public_inquiry_insert"
on public.travel_inquiries for insert to anon
with check (
  consent = true
  and length(trim(name)) between 2 and 120
  and length(trim(phone)) between 6 and 40
  and journey_type in ('UMRAH','HAJI_KHUSUS','PRIVATE','CONSULTATION')
  and intent in ('CONSULTATION','BOOKING_REQUEST')
  and (package_id is null or exists (
    select 1 from operations.packages p
    where p.id = travel_inquiries.package_id
      and p.status = 'PUBLISHED'
      and (p.effective_from is null or p.effective_from <= current_date)
      and (p.effective_to is null or p.effective_to >= current_date)
  ))
  and (departure_id is null or exists (
    select 1 from operations.departures d
    where d.id = travel_inquiries.departure_id
      and d.package_id = travel_inquiries.package_id
      and d.status in ('PLANNED','READY')
  ))
);
