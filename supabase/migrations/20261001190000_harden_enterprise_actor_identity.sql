-- HAJITRAVEL OS governance hardening: freeze enterprise record actor identity.
create or replace function authz.freeze_actor_identity()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  actor_column text := tg_argv[0];
  actor_new uuid;
  actor_old uuid;
begin
  actor_new := (to_jsonb(new)->>actor_column)::uuid;
  if tg_op = 'INSERT' then
    if actor_new is null then
      actor_new := auth.uid();
      new := jsonb_populate_record(new, jsonb_build_object(actor_column, actor_new));
    end if;
    if actor_new is distinct from auth.uid() then
      raise exception 'WORKFLOW_ACTOR_MUST_BE_CURRENT_USER';
    end if;
  elsif tg_op = 'UPDATE' then
    actor_old := (to_jsonb(old)->>actor_column)::uuid;
    if actor_old is not null and actor_new is distinct from actor_old then
      raise exception 'WORKFLOW_ACTOR_IMMUTABLE';
    end if;
  end if;
  return new;
end
$function$;

drop trigger if exists trg_health_signal_actor on health.signals;
create trigger trg_health_signal_actor before insert or update on health.signals
for each row execute function authz.freeze_actor_identity('created_by');

drop trigger if exists trg_ai_agent_actor on ai.agent_runs;
create trigger trg_ai_agent_actor before insert or update on ai.agent_runs
for each row execute function authz.freeze_actor_identity('created_by');

drop trigger if exists trg_procurement_actor on procurement.purchase_requests;
create trigger trg_procurement_actor before insert or update on procurement.purchase_requests
for each row execute function authz.freeze_actor_identity('requested_by');
