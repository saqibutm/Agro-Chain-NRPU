# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately to the project team at:

- **Email:** *<add security contact email — To Be Completed by Project Team>*

Include, where possible:
- A description of the vulnerability and its impact
- Steps to reproduce / proof of concept
- Affected component (chaincode, gateway, mobile app) and version/commit

We aim to acknowledge reports within a reasonable time and will coordinate a fix and
disclosure timeline with you.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x (current) | ✅ |
| < 1.0 | ❌ |

## Security Practices in This Repository

- **Secrets are never committed.** Wallets, private keys, certificates, connection profiles,
  `.env` files, and service‑account keys are excluded via `.gitignore`.
- **Credentials are configured via environment variables** (see `org/.env.example`); no
  passwords are hardcoded in source.
- **Transport security:** terminate TLS at a reverse proxy in front of the gateway; Fabric
  nodes communicate over TLS.
- **Authorization:** enforced at both channel/MSP policy level and within chaincode by
  MSP/role checks.

See [`docs/Security_Overview.md`](./docs/Security_Overview.md) for the full security model
and the hardening backlog.

## Handling Leaked Secrets

If a secret is ever committed:
1. Rotate/revoke it immediately (e.g., re‑enroll CA identities, revoke certificates).
2. Remove it from history (e.g., `git filter-repo`) and force‑push.
3. Update affected deployments.
