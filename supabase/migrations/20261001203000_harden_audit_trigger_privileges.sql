-- HAJITRAVEL OS governance hardening: trigger-only audit functions must not be
-- directly executable by application roles.
revoke execute on function audit.audit_registration_mutation() from public;
revoke execute on function audit.audit_registration_mutation() from anon;
revoke execute on function audit.audit_registration_mutation() from authenticated;
grant execute on function audit.audit_registration_mutation() to postgres;
