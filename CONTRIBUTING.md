# Contributing to AgroChain

Thank you for your interest in contributing to **AgroChain** (HEC NRPU Project No. 15516).

## Code of Conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating you agree
to uphold it.

## Ways to contribute

- Report bugs and request features via GitHub Issues.
- Improve documentation (`docs/`).
- Submit code via Pull Requests (chaincode, gateway, mobile app).

## Development setup

See the [Installation Guide](./docs/Installation_Guide.md). In short:

```bash
npm install          # mobile app
cd org && npm install   # gateway
```

## Branching & commits

- Branch from `main`: `feature/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- Write clear, present‑tense commit messages (e.g., "Add quality report query").
- Keep PRs focused and small where possible.

## Pull request checklist

- [ ] Code builds and runs locally (app: `npx expo start`; gateway: `node serverOrg1.js`).
- [ ] No secrets, keys, wallets, or credentials are committed (see `.gitignore`).
- [ ] New UI strings added to **both** English and Urdu in `i18n/translations.js`.
- [ ] New chaincode rich queries have matching CouchDB indexes under `go/META-INF/...`.
- [ ] Chaincode changes note the required lifecycle **sequence bump**.
- [ ] Documentation updated where relevant.
- [ ] (When test infrastructure exists) tests added/updated and passing.

## Coding guidelines

- **Mobile (JS/React Native):** functional components, hooks, existing `Abstracts/` and
  `Theme` patterns; keep screens responsive (Dimensions/FontSize).
- **Gateway (Node):** configuration via environment variables (see `org/.env.example`);
  never hardcode credentials.
- **Chaincode (Go):** deterministic logic only (no `time.Now()`; use `GetTxTimestamp()`);
  enforce access control by MSP/role.

## Security

Do not open public issues for vulnerabilities. Follow [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree your contributions are licensed under the repository
[LICENSE](./LICENSE).
