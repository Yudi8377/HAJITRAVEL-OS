-- HAJITRAVEL OS governance: enforce maker/checker/approver separation
-- for enterprise control-plane mutations.
alter table procurement.purchase_requests
  add column if not exists checked_by uuid,
  add column if not exists checked_at timestamptz;

alter table grc.controls
  add column if not exists created_by uuid,
  add column if not exists checked_by uuid,
  add column if not exists approved_by uuid,
  add column if not exists checked_at timestamptz,
  add column if not exists approved_at timestamptz;

alter table regulatory.obligations
  add column if not exists created_by uuid,
  add column if not exists checked_by uuid,
  add column if not exists approved_by uuid,
  add column if not exists checked_at timestamptz,
  add column if not exists approved_at timestamptz;

alter table integration.endpoint_registry
  add column if not exists created_by uuid,
  add column if not exists checked_by uuid,
  add column if not exists approved_by uuid,
  add column if not exists checked_at timestamptz,
  add column if not exists approved_at timestamptz;

create or replace function authz.enforce_enterprise_sod()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  action_code text := tg_argv[0];
  maker uuid;
  checker uuid;
  approver uuid;
  old_maker uuid;
  old_checker uuid;
  old_approver uuid;
  new_status text := to_jsonb(new)->>tg_argv[1];
  old_status text := case when tg_op = 'UPDATE' then to_jsonb(old)->>tg_argv[1] else null end;
begin
  if tg_op = 'INSERT' then
    if to_jsonb(new)->>tg_argv[2] is null then
      new := jsonb_populate_record(new, jsonb_build_object(tg_argv[2], auth.uid()));
    end if;
  else
    old_maker := (to_jsonb(old)->>tg_argv[2])::uuid;
    old_checker := (to_jsonb(old)->>tg_argv[3])::uuid;
    old_approver := (to_jsonb(old)->>tg_argv[4])::uuid;
    if (to_jsonb(new)->>tg_argv[2])::uuid is distinct from old_maker then
      raise exception 'WORKFLOW_MAKER_IMMUTABLE';
    end if;
    if old_checker is not null and (to_jsonb(new)->>tg_argv[3])::uuid is distinct from old_checker then
      raise exception 'WORKFLOW_CHECKER_IMMUTABLE';
    end if;
    if old_approver is not null and (to_jsonb(new)->>tg_argv[4])::uuid is distinct from old_approver then
      raise exception 'WORKFLOW_APPROVER_IMMUTABLE';
    end if;
  end if;

  maker := (to_jsonb(new)->>tg_argv[2])::uuid;
  checker := (to_jsonb(new)->>tg_argv[3])::uuid;
  approver := (to_jsonb(new)->>tg_argv[4])::uuid;

  if maker is null then raise exception 'WORKFLOW_MAKER_REQUIRED'; end if;
  if checker is not null then
    if checker = maker then raise exception 'SOD_CHECKER_MUST_DIFFER'; end if;
    if checker <> auth.uid() and (tg_op='INSERT' or old_checker is null) then
      raise exception 'WORKFLOW_CHECKER_MUST_BE_CURRENT_USER';
    end if;
  end if;
  if approver is not null then
    if approver = maker or (checker is not null and approver = checker) then
      raise exception 'SOD_APPROVER_MUST_DIFFER';
    end if;
    if approver <> auth.uid() and (tg_op='INSERT' or old_approver is null) then
      raise exception 'WORKFLOW_APPROVER_MUST_BE_CURRENT_USER';
    end if;
  end if;

  if new_status is distinct from old_status then
    if action_code = 'procurement.request.update' and new_status in ('SUBMITTED','APPROVED') and checker is null then
      raise exception 'WORKFLOW_CHECKER_REQUIRED';
    end if;
    if new_status in ('APPROVED','PASS','CLOSED','COMPLIANT','ACTIVE','RETIRED') then
      if checker is null then raise exception 'WORKFLOW_CHECKER_REQUIRED'; end if;
      if approver is null then raise exception 'WORKFLOW_APPROVER_REQUIRED'; end if;
      if approver = maker or approver = checker then raise exception 'SOD_APPROVER_MUST_DIFFER'; end if;
    end if;
    if checker is not null and checker <> maker and to_jsonb(new)->>tg_argv[5] is null then
      new := jsonb_populate_record(new, jsonb_build_object(tg_argv[5], now()));
    end if;
    if approver is not null and approver <> maker and approver <> checker and to_jsonb(new)->>tg_argv[6] is null then
      new := jsonb_populate_record(new, jsonb_build_object(tg_argv[6], now()));
    end if;
  end if;
  return new;
end
$function$;

drop trigger if exists trg_procurement_sod on procurement.purchase_requests;
create trigger trg_procurement_sod before insert or update on procurement.purchase_requests
for each row execute function authz.enforce_enterprise_sod('procurement.request.update','status','requested_by','checked_by','approved_by','checked_at','approved_at');

drop trigger if exists trg_grc_sod on grc.controls;
create trigger trg_grc_sod before insert or update on grc.controls
for each row execute function authz.enforce_enterprise_sod('grc.control.update','status','created_by','checked_by','approved_by','checked_at','approved_at');

drop trigger if exists trg_regulatory_sod on regulatory.obligations;
create trigger trg_regulatory_sod before insert or update on regulatory.obligations
for each row execute function authz.enforce_enterprise_sod('regulatory.obligation.update','status','created_by','checked_by','approved_by','checked_at','approved_at');

drop trigger if exists trg_integration_sod on integration.endpoint_registry;
create trigger trg_integration_sod before insert or update on integration.endpoint_registry
for each row execute function authz.enforce_enterprise_sod('integration.endpoint.manage','status','created_by','checked_by','approved_by','checked_at','approved_at');

revoke execute on function authz.enforce_enterprise_sod() from public;
revoke execute on function authz.enforce_enterprise_sod() from anon;
revoke execute on function authz.enforce_enterprise_sod() from authenticated;
grant execute on function authz.enforce_enterprise_sod() to postgres;
