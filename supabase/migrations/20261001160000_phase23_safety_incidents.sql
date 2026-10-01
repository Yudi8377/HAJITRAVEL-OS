create schema if not exists safety;
create table if not exists safety.incidents(
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id),
 incident_no text not null, registration_id uuid references jamaah.registrations(id), departure_id uuid references operations.departures(id),
 digital_id_id uuid, incident_type text not null check(incident_type in('MEDICAL','MISSING_PILGRIM','SAFETY','TRANSPORT','DOCUMENT','SECURITY','OTHER')),
 severity text not null default 'MEDIUM' check(severity in('LOW','MEDIUM','HIGH','CRITICAL')),
 status text not null default 'OPEN' check(status in('OPEN','ACKNOWLEDGED','IN_PROGRESS','RESOLVED','CLOSED')),
 occurred_at timestamptz not null default now(), location_label text, summary text not null, details text,
 guardian_contacted boolean not null default false, emergency_services_contacted boolean not null default false,
 assigned_to uuid references auth.users(id), resolved_at timestamptz, closed_at timestamptz, evidence_uri text,
 reported_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,incident_no));
create index if not exists incidents_org_status_idx on safety.incidents(organization_id,status,severity);
alter table safety.incidents enable row level security;
create policy safety_incident_select on safety.incidents for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'safety.read'));
create policy safety_incident_insert on safety.incidents for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'safety.create') and reported_by=auth.uid());
create policy safety_incident_update on safety.incidents for update to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'safety.update')) with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'safety.update'));
grant select,insert,update on safety.incidents to authenticated;
insert into organization.capabilities(code,name,active) values('safety.read','Safety & Incident - Read',true),('safety.create','Safety & Incident - Create',true),('safety.update','Safety & Incident - Update',true) on conflict(code) do update set name=excluded.name,active=true;
insert into organization.role_capabilities(role_id,capability_id) select r.id,c.id from organization.roles r cross join organization.capabilities c where r.code='OWNER' and c.code in('safety.read','safety.create','safety.update') on conflict do nothing;
insert into authz.business_actions(code,name,capability_code,entity_schema,entity_table,action_class,maker_required,checker_required,approver_required,active) values('safety.incident.create','Create Safety Incident','safety.create','safety','incidents','MUTATION',true,false,false,true),('safety.incident.update','Update Safety Incident','safety.update','safety','incidents','MUTATION',true,false,false,true) on conflict(code) do update set name=excluded.name,capability_code=excluded.capability_code,entity_schema=excluded.entity_schema,entity_table=excluded.entity_table,action_class=excluded.action_class,maker_required=excluded.maker_required,active=true;