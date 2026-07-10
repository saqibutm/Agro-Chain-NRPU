# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately to the project team at:

- **Email:** saqibutm@outlook.com
- **WhatsApp:** +92 300 1750077

Include, where possible:
- A description of the vulnerability and its impact
- Steps to reproduce / proof of concept
- Affected component (Supabase backend/schema, mobile app) and version/commit

We aim to acknowledge reports within a reasonable time and will coordinate a fix and
disclosure timeline with you.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x (current) | ✅ |
| < 1.0 | ❌ |

## Security Practices in This Repository

- **Secrets are never committed.** `.env` files, service-role keys, and signing
  certificates/provisioning profiles are excluded via `.gitignore`. The mobile app only
  ships the Supabase **anon/publishable key**, which is safe for client-side use and is
  restricted by row-level security (RLS) — never the service-role key.
- **Transport security:** all traffic to the backend goes over HTTPS/TLS (Supabase).
- **Authentication:** Supabase Auth issues per-user JWTs; sign-in is by mobile number
  (mapped internally to a synthetic email address), no separate password store in the app.
- **Authorization:** enforced at the database level via Postgres row-level security (RLS)
  policies (see `supabase/schema.sql`) — public read, authenticated write, scoped by role
  where applicable.

See [`docs/Security_Overview.md`](./docs/Security_Overview.md) for the full security model
and the hardening backlog.

## Handling Leaked Secrets

If a secret is ever committed:
1. Rotate/revoke it immediately (e.g., reset the Supabase service-role key or API key,
   revoke signing certificates).
2. Remove it from history (e.g., `git filter-repo`) and force‑push.
3. Update affected deployments.
