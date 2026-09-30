create or replace function organization.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, organization
as $$
declare
  v_org_id uuid;
  v_role_id uuid;
begin
  select id into v_role_id
  from organization.roles
  where code = 'OWNER' and active = true
  limit 1;

  if v_role_id is null then
    raise exception 'OWNER role is not configured';
  end if;

  insert into organization.organizations (legal_name, trade_name, business_model, status)
  values ('HAJITRAVEL OS', 'HAJITRAVEL', array['HAJI','UMRAH']::text[], 'ACTIVE')
  returning id into v_org_id;

  insert into organization.organization_memberships (organization_id, user_id, role_id, status)
  values (v_org_id, new.id, v_role_id, 'ACTIVE');

  return new;
end;
$$;

revoke all on function organization.handle_new_user() from public;
revoke all on function organization.handle_new_user() from anon;
revoke all on function organization.handle_new_user() from authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function organization.handle_new_user();