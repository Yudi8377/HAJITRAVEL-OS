-- HAJITRAVEL OS governance hardening: business-action authorization must resolve
-- capability against the caller's current organization, never against auth.uid().
create or replace function authz.can_execute_business_action(p_action_code text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, authz, organization, public
as $function$
  select exists (
    select 1
    from authz.business_actions a
    where a.code = p_action_code
      and a.active = true
      and authz.is_active_member(auth.uid())
      and authz.has_org_capability(authz.current_organization_id(), a.capability_code)
  );
$function$;
