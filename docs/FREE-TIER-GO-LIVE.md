# HAJI TRAVEL OS — Rp0 Go-Live Path

## Selected runtime

Render Free Web Service is the current zero-cost deployment target.

Why:
- supports Docker web services;
- supports Next.js/server-side applications;
- provides a public \`onrender.com\` URL;
- free web services include managed TLS;
- free plan has 750 instance hours/month and spins down after 15 minutes of inactivity.

This is suitable for staging/public testing, not a guaranteed always-on production SLA.

## Required account action

Create a Render account and connect the GitHub repository:

\`Yudi8377/HAJITRAVEL-OS\`

No VPS, SSH key, or domain is required for the first public deployment.

## Blueprint

The repository contains \`render.yaml\` with:
- Docker runtime
- Free plan
- \`/api/health\` health check
- automatic deploy from \`main\`
- two required Supabase environment variables marked as secrets

Set these values in Render:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\`

Never add Supabase service-role credentials to this deployment.

## Expected public URL

Render will provide a URL similar to:

\`https://hajitravel-os.onrender.com\`

The exact hostname is assigned by Render.

## Verification gate

Go-live evidence must include:
1. Render deployment status = live
2. \`/api/health\` returns HTTP 200
3. public home page loads
4. login page loads
5. protected admin route remains protected
6. Supabase runtime connection works
7. no production claim is made before these checks pass

## Important free-tier limitation

A Free Web Service can sleep after 15 minutes without traffic and may take about one minute to wake. This is acceptable for the Rp0 public testing stage.

The Supabase staging project remains the database/auth backend until a separate production database is intentionally provisioned.
