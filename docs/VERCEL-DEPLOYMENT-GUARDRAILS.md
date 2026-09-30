# Vercel Deployment Guardrails — HAJI TRAVEL OS

Status: PRE-DEPLOYMENT CONTROL DOCUMENT
Date: 2026-09-30

## Objective

Prevent the recurring class of deployment failures previously encountered when deploying a Next.js + Supabase SSR application to a managed hosting platform.

The application must be deployed from the GitHub main branch only after CI is green.

## Mandatory environment variables

Set these variables in the hosting project before a production deployment:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

The values must point to the intended HAJITRAVEL Supabase project, not any Transmind project.

Never place a Supabase service_role / secret key in browser-visible or NEXT_PUBLIC_* variables.

Changing environment variables requires a new deployment before the running build can use the new values.

## Runtime pin

The repository pins Node to:

>=22 <23

CI and hosting should use Node 22 to eliminate runtime drift.

## Supabase SSR rules

HAJITRAVEL uses @supabase/ssr with cookie-based sessions.

The deployment must preserve:

- proxy.ts session refresh behavior
- server-side Supabase client using cookies()
- browser client using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- RLS as the database authorization boundary

Authenticated pages must not be statically cached.

## Health endpoint

GET /api/health is intentionally public so deployment monitors can reach it without an authenticated session.

Expected production response:

- HTTP 200
- status: "ok"
- supabaseConfigured: true
- Cache-Control: no-store

If credentials are missing, the endpoint returns HTTP 503 rather than falsely reporting healthy.

## Authentication and cache protection

Authenticated responses are marked private, no-store in the auth proxy.

This prevents a CDN/proxy from sharing a response that may contain refreshed authentication cookies between users.

The admin dashboard is explicitly dynamic and has revalidation disabled.

## Vercel deployment sequence

1. Connect the GitHub repository.
2. Select main.
3. Keep the framework as Next.js.
4. Do not add a custom build command unless the platform requires it.
5. Configure the two Supabase public variables for Production and Preview as appropriate.
6. Deploy only after the latest GitHub CI run is successful.
7. Check /api/health before testing login.
8. Test public website.
9. Test login.
10. Test authenticated /admin.
11. Test organization scope and RLS.
12. Only then consider production approval.

## Deployment protection warning

If the hosting platform's deployment-protection feature requires authentication on preview/deployment URLs, automated health checks against that URL may return 401/403 even when the application itself is healthy.

Do not use a protected preview URL as the production health target.

Use the intended production/custom-domain deployment for final health verification, and keep deployment protection rules separate from application authentication.

## Domain and callback discipline

Before enabling a production custom domain:

- establish the final HTTPS origin;
- configure Supabase Auth redirect URLs for that origin;
- test login from the final origin;
- do not use a temporary preview URL as the permanent authentication origin.

## Rollback rule

If any of these occurs:

- build failure;
- missing environment variable;
- /api/health not 200;
- login loop;
- unexpected 401/403;
- cross-organization data visible;
- RLS failure;
- authenticated page caching/session contamination;

stop the release and roll back to the last verified deployment. Do not weaken RLS or authentication to make deployment pass.

## Release gate

Vercel connection alone does not mean production is live.

Production status remains BLOCKED until:

- deployment succeeds;
- health endpoint is verified;
- authentication is verified;
- cross-organization E2E is verified;
- smoke test passes;
- human approval is recorded.
