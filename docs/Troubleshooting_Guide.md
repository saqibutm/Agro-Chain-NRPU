# Troubleshooting Guide — AgroChain

## 1. Mobile app

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| App shows only sample/placeholder data | Backend unreachable | Verify `apiBaseUrl`; ensure gateway is running and reachable |
| "Network request failed" on login | Wrong host for platform | Use `10.0.2.2` (Android emulator) or LAN IP (device), not `localhost` |
| Login always fails | CA/user not enrolled, or bad creds | Enroll the user; check CA reachable; verify `connection-org1.json` |
| Camera/QR not working | Permission denied | Grant Camera permission; confirm `app.json` plugin/permission present |
| GPS not captured | Location denied | Grant Location permission; capture still degrades gracefully |
| Urdu layout not flipping fully | RTL needs reload | Toggle language, then reload the app |
| Build fails: missing module | Native deps not installed | `npx expo install async-storage netinfo expo-location expo-camera expo-constants` |
| Stuck on loader at launch | Session restore hang | Clear app storage; check AsyncStorage availability |

## 2. Gateway (`org/serverOrg1.js`)

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `Cannot find module connection-org1.json` | Profile missing | Place network's `connection-org1.json` in `org/` |
| `An identity for the user X does not exist` | Not enrolled | Run enroll/register; ensure wallet path correct |
| `MSP ... not defined` / endorsement denied | Wrong MSP on identity | Identities must be `FarmerOrg1MSP` (see fix history) |
| Timeouts on submit | Peers/orderer down | Check Fabric containers; `docker ps`; peer logs |
| CA TLS errors | Cert/roots mismatch | Provide correct CA TLS roots (avoid `verify:false` in prod) |

## 3. Fabric network

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Chaincode change has no effect | Sequence not bumped | Re‑run lifecycle with higher `--sequence` |
| Rich query slow / fails | Missing CouchDB index | Add index JSON under `go/META-INF/...`; redeploy |
| `version already exists` on submit | versionCode reuse (app) | EAS auto‑increments; bump `expo.version` |
| Peer cannot join channel | Wrong genesis/anchor config | Recheck `configtx.yaml`, channel artifacts |

## 4. Diagnostics

```bash
curl http://localhost:8081/                         # gateway health
docker ps                                            # fabric containers
docker logs <peer-container>                          # peer logs
peer lifecycle chaincode querycommitted --channelID supplychain-channel --name supplychain
```

## 5. Escalation

Collect: app logs, gateway console output, `docker logs` for peers/orderer, the failing
request/response, and the chaincode version/sequence. Attach to an issue for the project team.
