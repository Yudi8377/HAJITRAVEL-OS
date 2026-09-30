# HAJI TRAVEL OS — Self-Hosted Go-Live

## Runtime contract

- Node.js 22
- Docker / Docker Compose
- Next.js standalone runtime
- Supabase for database, Auth, RLS and Storage
- HTTPS reverse proxy in front of port 3000

## Required runtime variables

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Do not place Supabase service-role credentials in the application container.

## Deployment

1. Copy `.env.production.example` to `.env.production`.
2. Populate only the two required public Supabase variables.
3. Run `docker compose up -d --build`.
4. Verify `/api/health` returns HTTP 200.
5. Verify HTTPS access.
6. Verify login and authenticated admin access.
7. Verify organization isolation and RLS against the staging database before production cutover.

## Reverse proxy

Expose the application through HTTPS and proxy to 127.0.0.1:3000. Do not expose the application container directly on a public interface.

## Rollback

Keep the previous image available until the new release passes health, authentication, authorization and smoke tests. If any gate fails, restore the previous image and restart the service.
