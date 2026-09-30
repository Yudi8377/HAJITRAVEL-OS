# HAJI TRAVEL OS — Release Evidence Snapshot

Snapshot date: 2026-09-30
Repository: Yudi8377/HAJITRAVEL-OS
Main commit: e2ed37761ed61eab804bd8b8f14f559caea54c0f
Supabase staging ref: gwjknstrhaxvlyadvlje

## Verified in this snapshot

### Application / CI
- GitHub Actions CI Run #55 completed successfully after the organization edit route syntax fix.
- CI pipeline runs TypeScript typecheck and Next.js production build.
- docs/PRODUCTION-GATE.md remains authoritative for release status.

### Supabase staging
- Project status: ACTIVE_HEALTHY.
- Database version: PostgreSQL 17.6.1.171.
- Applied migrations:
  - 20260930052606 — phase11_complete_application_domain
  - 20260930052628 — phase15_runtime_authorization
  - 20260930052646 — phase15_fk_indexes
- Domain/control tables checked: 32.
- Tables with RLS enabled: 32/32.
- RLS policies counted: 39.
- Security Advisor: 0 findings.
- Unauthenticated fail-closed checks:
  - current organization: NULL
  - synthetic active membership: FALSE
  - synthetic capability: FALSE

### Performance advisor
The performance advisor currently reports 39 INFO-level unused-index notices. The staging database is intentionally empty, so these indexes have not accumulated usage statistics. They are retained because they correspond to foreign-key, organization-scope, relationship, and audit access paths; they are not treated as release blockers.

## Remaining release gates

1. Authenticated cross-organization E2E using real staging users and memberships.
2. Hosting target connection and deployment.
3. Production environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
4. Production /api/health returns HTTP 200.
5. Production smoke test across login, organization scope, dashboard, jamaah, packages, finance, compliance, and audit.
6. Human approval for production release.

## Release status

BLOCKED / NOT LIVE

No authenticated E2E result is claimed until real authenticated evidence exists. No production-live declaration is made while the gates above remain open.