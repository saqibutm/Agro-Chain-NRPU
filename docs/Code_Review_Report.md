# Code Review Report — AgroChain

Reviewer perspective: Senior Hyperledger Fabric Architect + Android Developer.
Scope: `go/`, `org/`, `Services/`, `Screens/`, `Navigation/`, `i18n/`, config.

## 1. Summary

AgroChain is a coherent, well‑layered prototype: a Go chaincode with MSP/role enforcement,
a Node/Express gateway, and a React Native app with offline‑first sync, i18n, GPS, fraud
detection, KPIs, quality reports, and a consumer trust layer. Architecture and separation of
concerns are good. The main gaps are production hardening (secrets, TLS, validation, logging,
tests) and network‑bootstrap automation.

## 2. Strengths

- Clear three‑tier separation; React contexts for Auth/Sync/i18n are clean.
- Chaincode enforces authorization in addition to channel policies (defense in depth).
- Deterministic IDs/timestamps in chaincode (no `time.Now()`); proper `GetTxTimestamp()`.
- CouchDB indexes provided for all rich queries.
- Offline‑first queue with auto‑flush; graceful degradation to sample data.
- Env‑driven backend URL and CA‑backed auth (recently added).
- Full EN/UR localization with key parity.

## 3. Findings & recommendations

### Security
| Sev | Finding | Location | Recommendation |
|-----|---------|----------|----------------|
| High | Hardcoded `admin/adminpw` | `org/enrollAdminOrg1.js` | Read from env/secret manager; rotate; never default |
| High | No TLS on gateway (`:8081` plain HTTP) | `org/serverOrg1.js` | Terminate TLS at reverse proxy; enforce HTTPS |
| Med | `verify:false` for CA TLS | enroll scripts | Use real CA TLS roots in prod |
| Med | No input validation/sanitization | gateway endpoints | Validate/whitelist all params; reject unknown fields |
| Med | No rate limiting / CORS / security headers | gateway | Add `helmet`, CORS allowlist, rate limiter |
| Med | Commercial data in public state | chaincode | Move to Private Data Collections |
| Med | Password reset is UI‑only | `Screens/Account/*` | Implement secure backend reset + OTP |

### Error handling
| Sev | Finding | Recommendation |
|-----|---------|----------------|
| Med | Gateway returns `error.toString()`/`error.message` to clients | Return sanitized messages; log details server‑side; avoid leaking internals |
| Low | Some screens swallow errors silently (keep sample data) | Acceptable UX, but surface a subtle "offline/stale" indicator (sync bar already helps) |
| Low | Inconsistent status codes (`501` used for failures) | Standardize: `4xx` client, `5xx` server |

### Logging
| Sev | Finding | Recommendation |
|-----|---------|----------------|
| Low | `console.log/error` only; logs PII‑adjacent fields | Structured logger (pino/winston), log levels, redact secrets, centralize |
| Low | No request correlation IDs | Add request IDs for traceability |

### Configuration management
| Sev | Finding | Recommendation |
|-----|---------|----------------|
| Good | App URL now env‑driven via `expo.extra` | Keep; add staging profile |
| Med | Gateway config (port, CA name, MSP) hardcoded | Move to env vars / config file |
| Good | Secrets git‑ignored | Maintain; add `.env.example` |

### Maintainability
| Sev | Finding | Recommendation |
|-----|---------|----------------|
| Med | No automated tests (chaincode/app/gateway) | Add Go `contractapi` unit tests, Jest/RTL for app, supertest for gateway |
| Med | Only Org1 gateway implemented | Generalize gateway to parameterize org/MSP/CA |
| Low | Mixed naming (`SingIn.js`) | Optional rename; keep import consistency |
| Low | No CI pipeline | Add GitHub Actions: lint, test, build |
| Low | Chaincode is a single large file | Split by domain (entity/batch/product/quality) |

### Android specifics
| Sev | Finding | Recommendation |
|-----|---------|----------------|
| Good | Permissions + plugins declared | — |
| Med | Data queries use a single fallback identity when logged out | Now wired to auth user; keep fallback only for public consumer flow |
| Low | No crash/analytics (keep Data Safety honest) | If added, update `DATA_SAFETY.md` |

## 4. Hardcoded credentials / secrets scan

| Item | Status |
|------|--------|
| `admin/adminpw` in `enrollAdminOrg1.js` | **Present — fix (High)** |
| MSP `FarmerOrg1MSP`, CA host strings | Hardcoded (move to config) |
| `connection-org1.json`, wallet, service‑account keys | Git‑ignored ✓ |
| API keys/tokens in source | None found ✓ |

## 5. Suggested priority order

1. Secrets/env for CA admin + gateway config (High)
2. TLS + reverse proxy + input validation + rate limiting (High/Med)
3. Automated tests + CI (Med)
4. Private Data Collections for commercial data (Med)
5. Structured logging + monitoring (Low/Med)

## 6. Repository quality score

**7.0 / 10** — Strong architecture, feature completeness, and documentation; loses points
for missing tests/CI, production hardening (secrets/TLS/validation/logging), single‑org
gateway, and absent network‑bootstrap automation. Closing the High/Med items would move this
to ~8.5–9.
