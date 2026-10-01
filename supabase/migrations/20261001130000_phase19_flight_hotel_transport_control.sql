-- Phase 19: Flight / Hotel / Transport control hardening
-- Organization scope is inherited through operations.departures.

alter table operations.flights enable row level security;
alter table operations.hotels enable row level security;
alter table operations.transports enable row level security;

drop policy if exists flights_insert on operations.flights;
drop policy if exists flights_update on operations.flights;
drop policy if exists flights_delete on operations.flights;
drop policy if exists hotels_insert on operations.hotels;
drop policy if exists hotels_update on operations.hotels;
drop policy if exists hotels_delete on operations.hotels;
drop policy if exists transports_insert on operations.transports;
drop policy if exists transports_update on operations.transports;
drop policy if exists transports_delete on operations.transports;

create policy flights_insert on operations.flights
  for insert to authenticated
  with check (
    exists (
      select 1 from operations.departures d
      where d.id = flights.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.create')
    )
  );

create policy flights_update on operations.flights
  for update to authenticated
  using (
    exists (
      select 1 from operations.departures d
      where d.id = flights.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.update')
    )
  )
  with check (
    exists (
      select 1 from operations.departures d
      where d.id = flights.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.update')
    )
  );

create policy flights_delete on operations.flights
  for delete to authenticated
  using (
    exists (
      select 1 from operations.departures d
      where d.id = flights.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.update')
    )
  );

create policy hotels_insert on operations.hotels
  for insert to authenticated
  with check (
    exists (
      select 1 from operations.departures d
      where d.id = hotels.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.create')
    )
  );

create policy hotels_update on operations.hotels
  for update to authenticated
  using (
    exists (
      select 1 from operations.departures d
      where d.id = hotels.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.update')
    )
  )
  with check (
    exists (
      select 1 from operations.departures d
      where d.id = hotels.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.update')
    )
  );

create policy hotels_delete on operations.hotels
  for delete to authenticated
  using (
    exists (
      select 1 from operations.departures d
      where d.id = hotels.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.update')
    )
  );

create policy transports_insert on operations.transports
  for insert to authenticated
  with check (
    exists (
      select 1 from operations.departures d
      where d.id = transports.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.create')
    )
  );

create policy transports_update on operations.transports
  for update to authenticated
  using (
    exists (
      select 1 from operations.departures d
      where d.id = transports.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.update')
    )
  )
  with check (
    exists (
      select 1 from operations.departures d
      where d.id = transports.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.update')
    )
  );

create policy transports_delete on operations.transports
  for delete to authenticated
  using (
    exists (
      select 1 from operations.departures d
      where d.id = transports.departure_id
        and d.organization_id = authz.current_organization_id()
        and authz.has_org_capability(d.organization_id, 'departure.update')
    )
  );
