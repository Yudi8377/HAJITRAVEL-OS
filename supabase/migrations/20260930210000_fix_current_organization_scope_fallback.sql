-- Fix organization scope resolution for RLS when the JWT has not yet received organization_id in app_metadata.
-- The application resolves the active membership server-side; RLS must use the same
-- organization scope without requiring a token refresh on first login.

create or replace function authz.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = pg_catalog, authz, organization
as $function$
with jwt_org as (
  select case
    when (select auth.uid()) is null then null::uuid
    when coalesce((select auth.jwt()->'app_metadata'->>'organization_id'),'') = '' then null::uuid
    else (select auth.jwt()->'app_metadata'->>'organization_id')::uuid
  end as organization_id
),
active_memberships as (
  select m.organization_id
  from organization.organization_memberships m
  where m.user_id = (select auth.uid())
    and m.status = 'ACTIVE'
)
select coalesce(
  (select organization_id from jwt_org),
  case when (select count(*) from active_memberships) = 1
       then (select organization_id from active_memberships limit 1)
       else null::uuid
  end
)
$function$;
