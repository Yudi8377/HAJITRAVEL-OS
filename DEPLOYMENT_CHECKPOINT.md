# HAJITRAVEL OS — Deployment Checkpoint

Deployment target: Cloudflare Workers.

The Cloudflare deployment workflow is configured to run on pushes to `main` and via manual dispatch. It performs dependency installation, vinext Cloudflare initialization, typecheck, Workers build, Wrangler deployment, and an HTTP smoke test against the production Worker URL.

This checkpoint commit exists to execute the current main branch through the Cloudflare deployment pipeline after the Phase 17B Risk Center integration.

Current application commit before this checkpoint: `0e9bced2141359c009cdad6678e323da71178923`.
