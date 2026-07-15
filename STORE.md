# AgroChain — Google Play Store Listing Checklist

Everything needed to publish **AgroChain** (`com.agrochain.app`) on the Google Play Store.

---

## 1. Pre-requisites

- [ ] Google Play Console developer account ($25 one-time) — https://play.google.com/console
- [x] App built as an **AAB**: release keystore generated at repo root (`release.keystore`,
      gitignored) with credentials in `keystore.properties` (gitignored — **back both of these
      up somewhere safe, e.g. a password manager; losing the keystore means you can't sign
      future updates the same way, though Play App Signing lets you request a reset if you're
      enrolled in it**). `android/app/build.gradle` reads them automatically. Build with:
      `npx expo prebuild --platform android` (non-destructive — omit `--clean`, which would
      wipe `android/app/build.gradle`'s signing block; re-add it from this file if you ever do
      run `--clean`) then `cd android && ./gradlew bundleRelease` — output at
      `android/app/build/outputs/bundle/release/app-release.aab`
- [x] App icon 512×512 (PNG, no alpha): `store/icon-512.png`
- [x] Feature graphic 1024×500 (PNG/JPG): `store/feature-graphic.png`
- [ ] At least 2 phone screenshots (see §6 — existing set is stale, needs recapture)
- [x] Privacy policy URL hosted publicly: https://saqibutm.github.io/Agro-Chain-NRPU/privacy.html
- [ ] **⚠️ `targetSdkVersion` is 34 (Android 14), tied to Expo SDK 50's defaults.** As of this
      writing, Play requires new apps/updates to target API 35+ (API 36 becomes mandatory
      31 Aug 2026) — a fresh submission at API 34 is very likely to be rejected or blocked
      outright. Bumping this isn't a one-line change: it means either the `expo-build-properties`
      plugin to force-compile against a newer SDK on top of Expo SDK 50 (untested combination —
      RN 0.73's native modules were built/verified against API 34; API 35 also changes default
      UI behavior like edge-to-edge display and predictive back gestures) or a full Expo SDK
      upgrade (50 → 52+, which also touches the already-submitted iOS build's dependency tree).
      **Needs a decision and real device/emulator testing before submitting — not done here.**

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

> Farm-to-consumer traceability for wheat & sugar. Scan. Verify. Trust.

(69 chars)

---

## 4. Full description (max 4000 chars)

> **AgroChain** brings complete farm-to-consumer traceability to Pakistan's wheat and sugarcane supply chains.
>
> Every stage — from a farmer's harvest, through collection centers, transporters, warehouses, mills, distributors, and retailers — is recorded in a secure, role-based traceability database with a full audit trail. Consumers simply scan the QR code on a bag of flour or sugar to see the product's entire journey, quality test results, and farm of origin on a map.
>
> **For supply chain participants**
> • Sign in with just a mobile number — no email required
> • Farmers register batches in maund with automatic GPS geotagging; a printable/shareable QR
>   label is generated per batch and refreshed with current status at every step
> • Mill operators can register multiple mill locations and send lab samples for testing
> • Transfer custody securely; every handover is geotagged and time-stamped
> • Record laboratory quality tests — moisture/protein/gluten for wheat, Brix/Pol/Purity for
>   sugarcane, plus contamination checks — labs only
> • Live dashboard with KPIs: batches created, in transit, delivered, quality pass-rate
> • Built-in fraud detection: weight-variance, extraction-ratio, duplicate-QR and quality-failure alerts
>
> **For consumers**
> • Scan any AgroChain QR code — no account needed
> • See the full farm-to-shelf timeline and GPS route on a map
> • View verified quality and safety results
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
| **Camera** | No (used live for QR scanning, not stored) | No | App functionality (QR scanning) | Camera frames are not collected/stored |
| **Photos** | Yes (optional) | No | App functionality (profile picture) | Only if the user chooses to set a profile picture in Settings |
| Personal info (name, user ID) | Yes | No | Account management | Mobile number and entity/farmer/mill IDs entered by user |
| App activity (in-app actions) | Yes | No | App functionality | Supply-chain transactions (batches, transfers, quality tests) |

- **Encryption in transit:** Yes (HTTPS to the Supabase backend).
- **Data deletion:** In-app, self-service — Settings → Delete Account. Anonymizes (doesn't
  delete) the user's supply-chain records to preserve the audit trail for other participants;
  see the Privacy Policy §8 for details.
- **Camera permission justification:** "Used to scan product QR codes for supply-chain verification." (matches `app.json`)
- **Location permission justification:** "Used to geotag farm harvests and custody transfers." (matches `app.json`)

> ⚠️ If you add analytics/crash SDKs later (e.g. Sentry, Firebase), update this form.

---

## 6. Screenshots (Play Console → Store listing → Graphics)

Requirements: PNG/JPG, 16:9 or 9:16, each side 320–3840 px. Minimum **2**, recommended **4–8**.

`store/screenshots/en/` and `store/screenshots/ur/` hold a set from **6 June 2026** — predates
almost every feature added since (maund entry, crop-type selector, mill locations, sample
sending, sugarcane quality fields, About page, account deletion). Recapture natively before
submitting:
1. **Farmer dashboard** — KPI cards (batches, in transit, pass rate, quality flags)
2. **New Batch** — crop-type selector (wheat/sugarcane), maund quantity entry, GPS capture
3. **QR Scanner** — scanning a product
4. **Product Journey** — verified badge + farm-to-shelf timeline
5. **Map** — GPS custody route with markers and polyline
6. **Lab Dashboard** — pending sample inbox + commodity-appropriate quality fields
7. **Fraud Alerts** — severity-coded alert list
8. **Settings** — English/Urdu language toggle (shows localization)

How to capture: boot an AVD (`emulator -avd Pixel_8_Pro`), install a release or debug build,
navigate each screen, and `adb exec-out screencap -p > shot.png` (both platform SDK tools live
under the Android SDK's `emulator/` and `platform-tools/` directories).

---

## 7. Privacy policy (required)

Hosted at **https://saqibutm.github.io/Agro-Chain-NRPU/privacy.html** (source: `privacy.html`
at the repo root, published via GitHub Pages). Covers what data is collected and why, that
camera is used only for live QR scanning and frames aren't stored, the secure role-based
database model, in-app self-service account deletion, and contact details.

Add the URL in **Play Console → App content → Privacy policy** and in the store listing. A
support contact is also required in **Play Console → Store presence → Store settings** — use
**https://saqibutm.github.io/Agro-Chain-NRPU/support.html** (same GitHub Pages site) or
`saqibutm@outlook.com`.

---

## 8. Content rating

Complete the **App content → Content rating** questionnaire. AgroChain has no objectionable content → expected rating: **Everyone / PEGI 3**.

---

## 9. Release flow

1. **App content** section: complete Privacy policy, Data safety, Content rating, Target audience (adults), Ads (declare "No ads" unless you add them), Government app (declare if applicable).
2. **Production → Create new release**.
3. Upload the `.aab` from `./gradlew bundleRelease` (see §1).
4. Add **release notes** (see §10).
5. Set up **Internal testing** track first → test → then promote to **Production**.
6. Submit for review (first review can take a few days).

For subsequent releases: bump `version` and `android.versionCode` in `app.json`, rebuild
(`npx expo prebuild --platform android && cd android && ./gradlew bundleRelease` — **no
`--clean`**, which would wipe the hand-edited signing block in `android/app/build.gradle`;
see §1), and upload the new AAB.

---

## 10. Release notes (v1.0.0)

> First release of AgroChain.
> • Farm-to-consumer traceability for wheat & sugarcane
> • Farmers weigh in maund (mills weigh in kg downstream); a printable/shareable QR label is
>   generated per batch and refreshed with current status at every step
> • Mill operators can register multiple mill locations and send lab samples for testing
> • Lab quality tests use crop-appropriate metrics — moisture/protein/gluten for wheat,
>   Brix/Pol/Purity for sugarcane
> • QR scanning with full product journey and GPS route map
> • Quality reports, fraud alerts, and live KPI dashboard
> • Offline-first capture with automatic sync
> • English and Urdu support
> • Sign in or create an account with just a mobile number — no email required
> • Optional profile picture; delete your account at any time from Settings

---

## 11. Quick reference — config already set

| Setting | Where | Value |
|---------|-------|-------|
| App name | `app.json` → `expo.name` | AgroChain |
| Package ID | `app.json` → `android.package` | com.agrochain.app |
| Version name | `app.json` → `expo.version` | 1.0.0 |
| Version code | `app.json` → `android.versionCode` | bump manually each release |
| Camera permission + reason | `app.json` | ✓ |
| Location permission + reason | `app.json` | ✓ |
| Release signing | `android/app/build.gradle` → `signingConfigs.release` | ✓ (reads `/keystore.properties`) |
| Credentials gitignored | `.gitignore` (`release.keystore`, `keystore.properties`, `/android/`) | ✓ |
| `SYSTEM_ALERT_WINDOW` permission | `app.json` → `android.blockedPermissions` | ✓ stripped (unused, was pulled in by Expo's base template) |
| `allowBackup` | `plugins/withAndroidDisableBackup.js` | ✓ disabled (offline sync queue/cache aren't Keystore-encrypted like the session token) |
| ProGuard/code shrinking | `android/app/build.gradle` → `enableProguardInReleaseBuilds` | off by default — release AAB is unminified. Not a Play Store requirement, but larger app size / no obfuscation; enabling it needs real-device testing first (RN release builds can crash if `proguard-rules.pro` misses a reflection-based native module) |
| `READ/WRITE_EXTERNAL_STORAGE` permissions | pulled in by `expo-image-picker` | expected (profile picture feature) — make sure the Data Safety form's declared permissions match this, not just `app.json`'s explicit list |
