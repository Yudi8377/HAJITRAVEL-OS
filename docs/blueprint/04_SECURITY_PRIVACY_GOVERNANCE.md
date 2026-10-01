# Security, Privacy & Governance

Authorization layers: authentication → organization scope → branch scope → role → capability → record-level RLS → purpose/consent for sensitive data → server-side authorization for privileged actions.

Sensitive domains include location, health, identity documents and family delegation. Digital credentials use lifecycle ISSUED → ACTIVE → SUSPENDED → EXPIRED → REVOKED, with signing, revocation, secure storage and anti-replay controls where applicable.

Supabase baseline: RLS on exposed tables, organization-aware policies, no service-role/secret keys in clients, authorization not based on user-editable metadata, privileged functions secured, and verification/advisor checks after schema changes.
