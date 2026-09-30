# HAJI TRAVEL OS — Supabase Source of Truth

Status: STAGING VERIFIED / PRODUCTION BLOCKED

## Verified project

- Supabase project ref: `gwjknstrhaxvlyadvlje`
- Environment: HAJITRAVEL-OS-STAGING
- Database: PostgreSQL 17.6.1.171
- Region: ap-southeast-1

## Applied migrations verified from Supabase

| Version | Migration |
|---|---|
| 20260930052606 | phase11_complete_application_domain |
| 20260930052628 | phase15_runtime_authorization |
| 20260930052646 | phase15_fk_indexes |

These names and versions were read directly from the staging migration history on 2026-09-30.

## Runtime schema verification

The following domain schemas were queried directly:

- organization
- jamaah
- operations
- finance
- privacy
- incidents
- compliance
- audit

32 domain/control tables were present in these schemas and all 32 reported Row Level Security enabled.

The authorization/runtime schema was also verified through the database functions used by the Phase 15 security layer.

## Policy verification

The 32 verified tables have active RLS policies. Tables with multiple policies include:

- jamaah.profiles
- operations.departures
- operations.packages

The complete policy definitions remain the database source of truth and must not be reconstructed from memory.

## Security verification

Supabase Security Advisor was queried against the staging project and returned:

- security lints: 0

## Important source-control rule

The exact original SQL text of the three already-applied migrations was not exposed by the available Supabase MCP migration-list operation. Therefore this repository does **not** fabricate replacement migration SQL.

Do not create a new migration containing guessed historical SQL.

If exact migration SQL becomes available through Supabase CLI/db pull or another authoritative export, add it under `supabase/migrations/` and verify it against the staging schema before treating it as canonical source.

## Production gate

Authenticated cross-organization E2E remains pending because the staging project currently has no auth users and the available runtime tooling does not provide the required user provisioning path.

Production deployment remains blocked until:

1. authenticated cross-organization E2E is evidenced;
2. hosting is connected;
3. production environment variables are configured;
4. production `/api/health` returns HTTP 200;
5. application smoke test passes;
6. human release approval is recorded.

No service-role secret belongs in browser code, repository source, or `NEXT_PUBLIC_*` variables.
