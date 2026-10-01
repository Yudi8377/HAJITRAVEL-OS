-- Phase 17: organization-scope public itinerary management.
alter table public.travel_itineraries add column if not exists organization_id uuid;
update public.travel_itineraries ti set organization_id = p.organization_id from operations.packages p where p.id = ti.package_id and ti.organization_id is null;
alter table public.travel_itineraries alter column organization_id set not null;
alter table public.travel_itineraries enable row level security;
revoke all on public.travel_itineraries from authenticated;
grant select, insert, update on public.travel_itineraries to authenticated;
drop policy if exists "public_itinerary_select" on public.travel_itineraries;
create policy "public_itinerary_select" on public.travel_itineraries for select to anon using (
  is_published = true and exists (
    select 1 from operations.packages p where p.id=travel_itineraries.package_id
    and p.status='PUBLISHED'
    and (p.effective_from is null or p.effective_from<=current_date)
    and (p.effective_to is null or p.effective_to>=current_date)
  )
);
drop policy if exists "itinerary_select" on public.travel_itineraries;
create policy "itinerary_select" on public.travel_itineraries for select to authenticated
using (organization_id=authz.current_organization_id() and authz.has_org_capability(organization_id,'package.read'));
drop policy if exists "itinerary_insert" on public.travel_itineraries;
create policy "itinerary_insert" on public.travel_itineraries for insert to authenticated
with check (organization_id=authz.current_organization_id() and authz.has_org_capability(organization_id,'package.update'));
drop policy if exists "itinerary_update" on public.travel_itineraries;
create policy "itinerary_update" on public.travel_itineraries for update to authenticated
using (organization_id=authz.current_organization_id() and authz.has_org_capability(organization_id,'package.update'))
with check (organization_id=authz.current_organization_id() and authz.has_org_capability(organization_id,'package.update'));
