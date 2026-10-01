create schema if not exists identity;

create table if not exists identity.digital_pilgrim_ids (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organization.organizations(id),
  registration_id uuid not null references jamaah.registrations(id),
  jamaah_id uuid not null references jamaah.profiles(id),
  digital_id_no text not null,
  qr_token text not null,
  qr_token_hash text not null,
  token_hint text not null,
  status text not null default 'ISSUED' check (status in ('ISSUED','SUSPENDED','REVOKED','EXPIRED')),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  issued_by uuid not null references auth.users(id),
  qr_enabled boolean not null default true,
  nfc_enabled boolean not null default false,
  ble_enabled boolean not null default false,
  consent_required boolean not null default true,
  consent_granted_at timestamptz,
  last_scanned_at timestamptz,
  scan_count integer not null default 0 check (scan_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, registration_id),
  unique (organization_id, digital_id_no),
  unique (qr_token_hash)
);

create index if not exists digital_pilgrim_ids_org_status_idx on identity.digital_pilgrim_ids (organization_id,status);
create index if not exists digital_pilgrim_ids_token_hash_idx on identity.digital_pilgrim_ids (qr_token_hash);
alter table identity.digital_pilgrim_ids enable row level security;

drop policy if exists digital_id_select on identity.digital_pilgrim_ids;
create policy digital_id_select on identity.digital_pilgrim_ids for select to authenticated
using (organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'digital_id.read'));

drop policy if exists digital_id_insert on identity.digital_pilgrim_ids;
create policy digital_id_insert on identity.digital_pilgrim_ids for insert to authenticated
with check (organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'digital_id.issue') and issued_by=auth.uid());

drop policy if exists digital_id_update on identity.digital_pilgrim_ids;
create policy digital_id_update on identity.digital_pilgrim_ids for update to authenticated
using (organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'digital_id.revoke'))
with check (organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'digital_id.revoke'));

grant select,insert,update on identity.digital_pilgrim_ids to authenticated;

insert into organization.capabilities(code,name,active) values
('digital_id.read','Digital Pilgrim ID - Read',true),
('digital_id.issue','Digital Pilgrim ID - Issue',true),
('digital_id.revoke','Digital Pilgrim ID - Revoke',true)
on conflict (code) do update set name=excluded.name,active=true;

insert into organization.role_capabilities(role_id,capability_id)
select r.id,c.id from organization.roles r cross join organization.capabilities c
where r.code='OWNER' and c.code in ('digital_id.read','digital_id.issue','digital_id.revoke')
on conflict do nothing;

insert into authz.business_actions(code,name,capability_code,entity_schema,entity_table,action_class,maker_required,checker_required,approver_required,active) values
('digital_id.issue','Issue Digital Pilgrim ID','digital_id.issue','identity','digital_pilgrim_ids','MUTATION',true,false,false,true),
('digital_id.revoke','Revoke Digital Pilgrim ID','digital_id.revoke','identity','digital_pilgrim_ids','MUTATION',true,false,false,true)
on conflict (code) do update set name=excluded.name,capability_code=excluded.capability_code,entity_schema=excluded.entity_schema,entity_table=excluded.entity_table,action_class=excluded.action_class,maker_required=excluded.maker_required,checker_required=excluded.checker_required,approver_required=excluded.approver_required,active=true;

create or replace function identity.touch_digital_id_scan(p_token_hash text)
returns boolean language plpgsql security invoker as $$
begin
 update identity.digital_pilgrim_ids
 set last_scanned_at=now(),scan_count=scan_count+1,updated_at=now()
 where qr_token_hash=p_token_hash
   and organization_id=authz.current_organization_id()
   and authz.is_active_member(organization_id)
   and authz.has_org_capability(organization_id,'digital_id.read')
   and status='ISSUED'
   and (expires_at is null or expires_at>now());
 return found;
end; $$;

revoke all on function identity.touch_digital_id_scan(text) from public;
grant execute on function identity.touch_digital_id_scan(text) to authenticated;
