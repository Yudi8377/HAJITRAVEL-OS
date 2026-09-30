# HAJI TRAVEL OS v1.0

Secure Hajj & Umrah travel operating system.

## Repository state

The production candidate is being reconciled into this repository.

## Architecture

- Next.js 16
- React 19
- TypeScript
- Supabase SSR
- Organization-scoped RBAC / capabilities
- PostgreSQL RLS
- Admin control center
- Public website
- Production health endpoint
- Docker and GitHub Actions CI

## Go-Live gate

Production is NOT yet declared live. Required evidence: TypeScript verification PASS; production build PASS; authenticated cross-organization E2E PASS; hosting deployment; production health endpoint returns HTTP 200; production smoke test; human approval.

Never commit Supabase service-role credentials. Use publishable credentials only in the application layer.
