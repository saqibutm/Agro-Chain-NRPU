# Installation Guide — AgroChain (Developer Setup)

For production rollout see the [Deployment Guide](./Deployment_Guide.md). This guide gets a
developer running locally.

## 1. Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Expo CLI | via `npx expo` |
| Go | 1.15+ (chaincode only) |
| Docker + Compose | for a local Fabric network |
| Android Studio / Xcode | optional, for native runs |

## 2. Clone & install (mobile app)

```bash
git clone <repo-url> agrochain && cd agrochain
npm install
# Ensure native modules match Expo SDK 50:
npx expo install @react-native-async-storage/async-storage \
  @react-native-community/netinfo expo-location expo-camera expo-constants
```

## 3. Configure backend URL

Edit `Services/config.js` indirectly via `app.json`:
```jsonc
// app.json
"extra": { "apiBaseUrl": "http://localhost:8081", "defaultUsername": "appUser" }
```
- iOS simulator / web: `localhost`
- Android emulator: `10.0.2.2`
- Physical device: your machine's LAN IP (e.g. `http://192.168.1.10:8081`)

## 4. Run the app

```bash
npx expo start          # press a (Android), i (iOS), w (web)
```

## 5. Backend gateway (local)

```bash
cd org
npm install
# requires connection-org1.json from your Fabric network
node enrollAdminOrg1.js
node serverOrg1.js      # http://localhost:8081
```

## 6. Local Fabric network

A running Fabric network is required for live data. Use the standard Fabric v2 flow
(see Deployment Guide §2–3). Network bootstrap scripts are **To Be Completed by Project Team**.
Without the network, the app still launches and shows sample/placeholder data.

## 7. Verify

```bash
curl http://localhost:8081/           # {"response":"Test Pass!..."}
```
Sign in with a CA‑enrolled username/password; the dashboard should load.

## 8. Common issues

See the [Troubleshooting Guide](./Troubleshooting_Guide.md).
