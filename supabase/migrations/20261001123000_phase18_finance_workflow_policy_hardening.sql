-- Phase 18 finance workflow policy hardening.
-- Applied to production separately and kept here as the canonical migration artifact.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'finance'
      and tablename = 'invoices'
      and policyname = 'finance_invoice_insert'
  ) then
    create policy "finance_invoice_insert"
      on finance.invoices
      for insert to authenticated
      with check (
        organization_id = authz.current_organization_id()
        and authz.is_active_member(organization_id)
        and authz.has_org_capability(organization_id, 'finance.create')
      );
  end if;
end $$;

drop policy if exists "finance_payment_insert" on finance.payments;

create policy "finance_payment_insert"
  on finance.payments
  for insert to authenticated
  with check (
    authz.workflow_start_allowed('finance.create', organization_id, maker_user_id)
    and checker_user_id is not null
    and checker_user_id <> maker_user_id
    and exists (
      select 1
      from organization.organization_memberships m
      join organization.role_capabilities rc on rc.role_id = m.role_id
      join organization.capabilities c on c.id = rc.capability_id
      where m.organization_id = organization_id
        and m.user_id = checker_user_id
        and m.status = 'ACTIVE'
        and c.code = 'finance.check'
        and c.active = true
    )
  );
