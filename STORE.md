# AgroChain — Google Play Store Listing Checklist

Everything needed to publish **AgroChain** (`com.agrochain.app`) on the Google Play Store.

---

## 1. Pre-requisites

- [ ] Google Play Console developer account ($25 one-time) — https://play.google.com/console
- [ ] App built as an **AAB**: `eas build --platform android --profile production`
- [ ] App icon 512×512 (PNG, no alpha) for the store listing
- [ ] Feature graphic 1024×500 (PNG/JPG)
- [ ] At least 2 phone screenshots (see §6)
- [ ] Privacy policy URL hosted publicly (see §7)

---

## 2. App identity

| Field | Value |
|-------|-------|
| App name | **AgroChain** |
| Package / Application ID | `com.agrochain.app` (permanent — cannot change after publish) |
| Default language | English (United States) — add Urdu (Pakistan) as a second listing language |
| App or game | App |
| Free or paid | Free |
| Category | Business (alt: Food & Drink) |
| Tags | Supply chain, Agriculture, Traceability |

---

## 3. Short description (max 80 chars)

> Farm-to-consumer traceability for wheat & sugar on blockchain. Scan. Verify. Trust.

(78 chars)

---

## 4. Full description (max 4000 chars)

> **AgroChain** brings complete farm-to-consumer traceability to Pakistan's wheat and sugarcane supply chains, powered by Hyperledger Fabric blockchain.
>
> Every stage — from a farmer's harvest, through collection centers, transporters, warehouses, mills, distributors, and retailers — is recorded on an immutable ledger. Consumers simply scan the QR code on a bag of flour or sugar to see the product's entire journey, quality test results, and farm of origin on a map.
>
> **For supply chain participants**
> • Register wheat and sugarcane batches with one tap, with automatic GPS geotagging of the farm
> • Transfer custody securely; every handover is geotagged and time-stamped on the blockchain
> • Record laboratory quality tests (moisture, protein, gluten, contamination) — labs only
> • Live dashboard with KPIs: batches created, in transit, delivered, quality pass-rate
> • Built-in fraud detection: weight-variance, extraction-ratio, duplicate-QR and quality-failure alerts
>
> **For consumers**
> • Scan any AgroChain QR code — no account needed
> • See the full farm-to-shelf timeline and GPS route on a map
> • View blockchain-verified quality and safety results
> • Report a quality issue directly from the app
>
> **Designed for Pakistan**
> • Full Urdu language support (اردو) alongside English
> • Offline-first: capture harvests and transfers without internet; data syncs automatically when you reconnect
>
> AgroChain increases transparency, food safety, and consumer trust across the agricultural supply chain.

---

## 5. Data safety form (Play Console → App content → Data safety)

Declare the following based on what the app actually collects:

| Data type | Collected? | Shared? | Purpose | Notes |
|-----------|-----------|---------|---------|-------|
| **Location (approximate & precise)** | Yes | No | App functionality (geotag harvests/transfers) | Used only when recording a batch/transfer |
| **Photos / Camera** | No (camera used live, not stored) | No | App functionality (QR scanning) | Camera frames are not collected/stored |
| Personal info (name, user ID) | Yes (if auth enabled) | No | Account management | Farmer/entity IDs entered by user |
| App activity (in-app actions) | Yes | No | Analytics / app functionality | Supply-chain transactions |

- **Encryption in transit:** Yes (HTTPS to backend + TLS to Fabric peers).
- **Data deletion:** Provide a contact/method for users to request deletion.
- **Camera permission justification:** "Used to scan product QR codes for supply-chain verification." (matches `app.json`)
- **Location permission justification:** "Used to geotag farm harvests and custody transfers." (matches `app.json`)

> ⚠️ If you add analytics/crash SDKs later (e.g. Sentry, Firebase), update this form.

---

## 6. Screenshots (Play Console → Store listing → Graphics)

Requirements: PNG/JPG, 16:9 or 9:16, each side 320–3840 px. Minimum **2**, recommended **4–8**.

Suggested set (capture from the running app, both languages if possible):
1. **Home dashboard** — KPI cards (batches, in transit, pass rate, quality flags)
2. **Add Crop** — batch registration form with GPS capture
3. **QR Scanner** — scanning a product
4. **Product Journey** — verified badge + farm-to-shelf timeline
5. **Map** — GPS custody route with markers and polyline
6. **Fraud Alerts** — severity-coded alert list
7. **Settings** — English/Urdu language toggle (shows localization)

How to capture: run `eas build --profile preview` (APK) or `npx expo start` on a device/emulator, then take device screenshots.

---

## 7. Privacy policy (required)

A public URL is mandatory because the app requests Location and Camera permissions.
Host a page covering:
- What data is collected (location, entity IDs, supply-chain records) and why
- That camera is used only for live QR scanning and frames are not stored
- That data is written to a permissioned blockchain ledger
- How users contact you to request data deletion
- Contact email

Add the URL in **Play Console → App content → Privacy policy** and in the store listing.

---

## 8. Content rating

Complete the **App content → Content rating** questionnaire. AgroChain has no objectionable content → expected rating: **Everyone / PEGI 3**.

---

## 9. Release flow

1. **App content** section: complete Privacy policy, Data safety, Content rating, Target audience (adults), Ads (declare "No ads" unless you add them), Government app (declare if applicable).
2. **Production → Create new release** (Google requires the **first** AAB to be uploaded manually here, even if using `eas submit` later).
3. Upload the `.aab` from `eas build`.
4. Add **release notes** (see §10).
5. Set up **Internal testing** track first → test → then promote to **Production**.
6. Submit for review (first review can take a few days).

For subsequent releases: bump `version` in `app.json` (EAS auto-increments `versionCode`), rebuild, then `eas submit --platform android --profile production`.

---

## 10. Release notes (v1.0.0)

> First release of AgroChain.
> • Blockchain farm-to-consumer traceability for wheat & sugar
> • QR scanning with full product journey and GPS route map
> • Quality reports, fraud alerts, and live KPI dashboard
> • Offline-first capture with automatic sync
> • English and Urdu support

---

## 11. Quick reference — config already set

| Setting | Where | Value |
|---------|-------|-------|
| App name | `app.json` → `expo.name` | AgroChain |
| Package ID | `app.json` → `android.package` | com.agrochain.app |
| Version name | `app.json` → `expo.version` | 1.0.0 |
| Version code | managed remotely by EAS (`autoIncrement`) | auto |
| Camera permission + reason | `app.json` | ✓ |
| Location permission + reason | `app.json` | ✓ |
| Production AAB profile | `eas.json` → `build.production` | ✓ |
| Credentials gitignored | `.gitignore` | ✓ |
