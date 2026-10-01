-- HAJITRAVEL OS integrated enterprise control plane
-- Idempotent source-of-truth migration for the cross-domain foundation.
create schema if not exists health;
create schema if not exists procurement;
create schema if not exists supplier;
create schema if not exists hr;
create schema if not exists grc;
create schema if not exists regulatory;
create schema if not exists ai;
create schema if not exists bi;
create schema if not exists integration;

create table if not exists health.signals (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id) on delete cascade,
 registration_id uuid references jamaah.registrations(id) on delete set null, signal_type text not null,
 severity text not null default 'LOW' check(severity in ('LOW','MEDIUM','HIGH','CRITICAL')),
 status text not null default 'OPEN' check(status in ('OPEN','REVIEWED','ESCALATED','RESOLVED','CLOSED')),
 observed_at timestamptz not null default now(), summary text not null, source text, reviewed_by uuid, reviewed_at timestamptz,
 created_by uuid not null default auth.uid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists supplier.suppliers (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id) on delete cascade,
 supplier_code text not null, legal_name text not null, category text not null,
 status text not null default 'ACTIVE' check(status in ('DRAFT','ACTIVE','SUSPENDED','INACTIVE')),
 contact_name text, contact_phone text, contact_email text, country_code text,
 risk_level text not null default 'LOW' check(risk_level in ('LOW','MEDIUM','HIGH','CRITICAL')),
 notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,supplier_code));

create table if not exists procurement.purchase_requests (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id) on delete cascade,
 request_no text not null, supplier_id uuid references supplier.suppliers(id) on delete set null,
 departure_id uuid references operations.departures(id) on delete set null, category text not null, description text not null,
 amount numeric(18,2) not null default 0 check(amount>=0), currency text not null default 'IDR',
 status text not null default 'DRAFT' check(status in ('DRAFT','SUBMITTED','APPROVED','REJECTED','ORDERED','RECEIVED','CANCELLED')),
 requested_by uuid not null default auth.uid(), approved_by uuid, requested_at timestamptz not null default now(), approved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,request_no));

create table if not exists hr.staff (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id) on delete cascade,
 employee_no text not null, full_name text not null, role_title text, department text,
 status text not null default 'ACTIVE' check(status in ('ACTIVE','ON_LEAVE','INACTIVE')),
 phone text, email text, emergency_contact text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,employee_no));

create table if not exists grc.controls (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id) on delete cascade,
 control_code text not null, domain text not null, title text not null,
 control_type text not null default 'PREVENTIVE' check(control_type in ('PREVENTIVE','DETECTIVE','CORRECTIVE')),
 status text not null default 'OPEN' check(status in ('OPEN','TESTING','PASS','FAIL','EXCEPTION','CLOSED')),
 owner_user_id uuid, due_at timestamptz, evidence_uri text, notes text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,control_code));

create table if not exists regulatory.obligations (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id) on delete cascade,
 obligation_code text not null, jurisdiction text not null, source_name text not null, title text not null,
 effective_from date, effective_to date,
 status text not null default 'MONITORING' check(status in ('DRAFT','MONITORING','ACTION_REQUIRED','COMPLIANT','EXPIRED')),
 impact_summary text, source_uri text, last_reviewed_at timestamptz, owner_user_id uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,obligation_code));

create table if not exists ai.agent_runs (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id) on delete cascade,
 agent_code text not null, task_type text not null,
 status text not null default 'QUEUED' check(status in ('QUEUED','RUNNING','COMPLETED','FAILED','BLOCKED','REVIEW_REQUIRED')),
 input_ref text, output_summary text, confidence numeric(5,4) check(confidence is null or (confidence between 0 and 1)),
 policy_gate text not null default 'HUMAN_REVIEW' check(policy_gate in ('AUTO_ALLOWED','HUMAN_REVIEW','BLOCKED')),
 provenance text, human_approved_by uuid, started_at timestamptz, completed_at timestamptz,
 created_by uuid not null default auth.uid(), created_at timestamptz not null default now());

create table if not exists bi.metric_snapshots (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id) on delete cascade,
 metric_code text not null, metric_name text not null, metric_value numeric(18,4), metric_unit text,
 period_start timestamptz, period_end timestamptz, source_domain text not null,
 quality_status text not null default 'VALID' check(quality_status in ('VALID','STALE','INCOMPLETE','INVALID')),
 captured_at timestamptz not null default now());

create table if not exists integration.endpoint_registry (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id) on delete cascade,
 endpoint_code text not null, provider_name text not null, purpose text not null,
 status text not null default 'PLANNED' check(status in ('PLANNED','ACTIVE','PAUSED','RETIRED')),
 direction text not null default 'BIDIRECTIONAL' check(direction in ('INBOUND','OUTBOUND','BIDIRECTIONAL')),
 last_sync_at timestamptz, last_status text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,endpoint_code));

create table if not exists operations.enterprise_control_items (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references organization.organizations(id) on delete cascade,
 domain text not null, source_table text, source_id uuid,
 priority text not null default 'MEDIUM' check(priority in ('LOW','MEDIUM','HIGH','CRITICAL')),
 state text not null default 'OPEN' check(state in ('OPEN','IN_PROGRESS','BLOCKED','RESOLVED','CLOSED')),
 title text not null, detail text, due_at timestamptz, owner_user_id uuid, evidence_uri text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());

do $$ declare t text; begin foreach t in array array['health.signals','supplier.suppliers','procurement.purchase_requests','hr.staff','grc.controls','regulatory.obligations','ai.agent_runs','bi.metric_snapshots','integration.endpoint_registry','operations.enterprise_control_items'] loop execute format('alter table %s enable row level security',t); end loop; end $$;

grant usage on schema health,supplier,procurement,hr,grc,regulatory,ai,bi,integration to authenticated;
grant select,insert,update on health.signals,supplier.suppliers,procurement.purchase_requests,hr.staff,grc.controls,regulatory.obligations,ai.agent_runs,bi.metric_snapshots,integration.endpoint_registry,operations.enterprise_control_items to authenticated;

drop policy if exists health_signal_select on health.signals;
create policy health_signal_select on health.signals for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'health.read'));
drop policy if exists health_signal_insert on health.signals;
create policy health_signal_insert on health.signals for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'health.create') and created_by=auth.uid());
drop policy if exists health_signal_update on health.signals;
create policy health_signal_update on health.signals for update to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'health.update')) with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'health.update'));

drop policy if exists supplier_select on supplier.suppliers;
create policy supplier_select on supplier.suppliers for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'supplier.read'));
drop policy if exists supplier_insert on supplier.suppliers;
create policy supplier_insert on supplier.suppliers for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'supplier.create'));
drop policy if exists supplier_update on supplier.suppliers;
create policy supplier_update on supplier.suppliers for update to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'supplier.update')) with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'supplier.update'));

drop policy if exists procurement_select on procurement.purchase_requests;
create policy procurement_select on procurement.purchase_requests for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'procurement.read'));
drop policy if exists procurement_insert on procurement.purchase_requests;
create policy procurement_insert on procurement.purchase_requests for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'procurement.create') and requested_by=auth.uid());
drop policy if exists procurement_update on procurement.purchase_requests;
create policy procurement_update on procurement.purchase_requests for update to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'procurement.update')) with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'procurement.update'));

drop policy if exists hr_select on hr.staff;
create policy hr_select on hr.staff for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'hr.read'));
drop policy if exists hr_insert on hr.staff;
create policy hr_insert on hr.staff for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'hr.create'));
drop policy if exists hr_update on hr.staff;
create policy hr_update on hr.staff for update to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'hr.update')) with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'hr.update'));

drop policy if exists grc_select on grc.controls;
create policy grc_select on grc.controls for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'grc.read'));
drop policy if exists grc_insert on grc.controls;
create policy grc_insert on grc.controls for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'grc.create'));
drop policy if exists grc_update on grc.controls;
create policy grc_update on grc.controls for update to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'grc.update')) with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'grc.update'));

drop policy if exists regulatory_select on regulatory.obligations;
create policy regulatory_select on regulatory.obligations for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'regulatory.read'));
drop policy if exists regulatory_insert on regulatory.obligations;
create policy regulatory_insert on regulatory.obligations for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'regulatory.create'));
drop policy if exists regulatory_update on regulatory.obligations;
create policy regulatory_update on regulatory.obligations for update to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'regulatory.update')) with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'regulatory.update'));

drop policy if exists ai_select on ai.agent_runs;
create policy ai_select on ai.agent_runs for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'ai.read'));
drop policy if exists ai_insert on ai.agent_runs;
create policy ai_insert on ai.agent_runs for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'ai.run') and created_by=auth.uid());
drop policy if exists ai_update on ai.agent_runs;
create policy ai_update on ai.agent_runs for update to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'ai.review')) with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'ai.review'));

drop policy if exists bi_select on bi.metric_snapshots;
create policy bi_select on bi.metric_snapshots for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'bi.read'));
drop policy if exists bi_insert on bi.metric_snapshots;
create policy bi_insert on bi.metric_snapshots for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'bi.write'));

drop policy if exists integration_select on integration.endpoint_registry;
create policy integration_select on integration.endpoint_registry for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'integration.read'));
drop policy if exists integration_insert on integration.endpoint_registry;
create policy integration_insert on integration.endpoint_registry for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'integration.manage'));
drop policy if exists integration_update on integration.endpoint_registry;
create policy integration_update on integration.endpoint_registry for update to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'integration.manage')) with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'integration.manage'));

drop policy if exists enterprise_control_select on operations.enterprise_control_items;
create policy enterprise_control_select on operations.enterprise_control_items for select to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'reports.read'));
drop policy if exists enterprise_control_insert on operations.enterprise_control_items;
create policy enterprise_control_insert on operations.enterprise_control_items for insert to authenticated with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'reports.read'));
drop policy if exists enterprise_control_update on operations.enterprise_control_items;
create policy enterprise_control_update on operations.enterprise_control_items for update to authenticated using(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'reports.read')) with check(organization_id=authz.current_organization_id() and authz.is_active_member(organization_id) and authz.has_org_capability(organization_id,'reports.read'));
