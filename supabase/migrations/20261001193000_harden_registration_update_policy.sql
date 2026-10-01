-- HAJITRAVEL OS governance hardening: remove tautological registration UPDATE check.
-- Maker immutability is enforced by authz.enforce_registration_workflow().
drop policy if exists registration_update on jamaah.registrations;

create policy registration_update on jamaah.registrations
for update to authenticated
using (
  organization_id = authz.current_organization_id()
  and authz.is_active_member(organization_id)
  and authz.has_org_capability(organization_id,'registration.update')
)
with check (
  organization_id = authz.current_organization_id()
  and authz.is_active_member(organization_id)
  and authz.has_org_capability(organization_id,'registration.update')
);
