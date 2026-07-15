# AgroChain — Apple App Store Listing Checklist

Everything needed to publish **AgroChain** (`com.agrochain.app`) on the Apple App Store.

---

## 1. Pre-requisites

- [ ] Apple Developer Program ($99/year) — https://developer.apple.com/programs
- [ ] App Store Connect app entry created with Bundle ID `com.agrochain.app`
- [ ] Xcode signed into your Apple Developer account (Settings → Accounts), with automatic
      signing enabled on the AgroChain target so it can generate the Distribution
      certificate and App Store provisioning profile
- [ ] iOS archive built via Xcode (`Product → Archive`) or `xcodebuild archive`
- [ ] Tested on a real device via TestFlight before submitting

---

## 2. App identity

| Field | Value |
|-------|-------|
| App name | **AgroChain** |
| Bundle ID | `com.agrochain.app` (permanent) |
| Primary language | English (US) — add Urdu (Pakistan) as secondary |
| Category | Business (primary) / Food & Drink (secondary) |
| Price | Free |
| Content rights | Confirm you own all content |

---

## 3. Short description (30 chars max — shown in search)

> Farm-to-consumer traceability

---

## 3a. Promotional text (170 chars max)

Shown above the description on the product page — the one field Apple lets you update
anytime without submitting a new build for review.

> Scan any batch to see its full farm-to-consumer journey — GPS-tracked, mill-verified,
> and lab-tested at every step. Now with maund-based entry for farmers.

(155 chars). Swap the "Now with..." clause for whatever's newest when something else
ships — that's the point of this field.

---

## 4. Full description (4000 chars max — same as Play Store)

> [paste full description from STORE.md §4]

---

## 5. Keywords (100 chars, comma-separated)

> agriculture,supply chain,wheat,sugar,Pakistan,traceability,food safety,QR,farm to table

---

## 6. Screenshots required

### iPhone 6.9" — `store/screenshots/ios-6.9/` (1320×2868)
All 8 English screenshots generated. Upload in order 01–08.

### iPad 13" — `store/screenshots/ios-ipad/` (2064×2752)
1 English screenshot generated (Farmer Dashboard), captured natively on an iPad Pro
13-inch (M4) simulator. **Required** because `supportsTablet: true`. Apple renamed this
size class from "12.9-inch" — the old 2048×2732 captures were rejected by App Store
Connect; add more screenshots the same way if a fuller set is wanted later.

### Urdu (Pakistan) localization
- iPhone 6.9": `store/screenshots/ios-6.9-ur/` — 8 screenshots available
- iPad 12.9": `store/screenshots/ios-ipad-ur/` — 8 screenshots available, **still at the
  old 2048×2732 size** — will need the same 13-inch recapture if Urdu screenshots are
  submitted

---

## 7. App icon

`store/ios-icon-1024.png` — 1024×1024 PNG, no alpha ✓

---

## 8. App Review information (critical — Apple rejects without this)

The app signs in with a mobile number (11 digits, starting with 0), not an email or
username — there is no email field anywhere in the sign-in/sign-up flow.

In App Store Connect → App Review Information:

| Field | Value |
|-------|-------|
| Demo mobile number | `03000000001` (role: farmer) — or any of the 5 test accounts below |
| Demo password | `qwe@123` |
| Notes | "Sign in with the mobile number and password above, or tap 'Don't have an account? Sign Up' to create a new account with any 11-digit number starting with 0. All supply-chain screens (batch registration, transfers, quality tests, QR scanning, fraud alerts, mill locations, mill-to-lab sample transfers) work against a live backend — no demo/offline mode is used for this build. Camera (QR scan, profile picture) and GPS features require device permissions. Account deletion is in Settings → Delete Account." |

Other test accounts (same password `qwe@123`), useful if the reviewer wants to see a
different role's dashboard: `03000000002` (mill), `03000000003` (lab), `03000000004`
(regulator), `03000000005` (consumer).

---

## 9. App content declarations (App Store Connect → App Information)

| Field | Answer |
|-------|--------|
| Contains ads | No |
| Made for kids | No |
| Age rating | 4+ (complete IARC questionnaire) |
| Privacy policy URL | Your hosted `privacy.html` URL |

---

## 10. Privacy — App Privacy (App Store Connect → App Privacy)

| Data type | Collected | Linked to user | Used for tracking |
|-----------|-----------|----------------|-------------------|
| Precise location | Yes | Yes | No |
| Coarse location | Yes | Yes | No |
| Name / User ID | Yes | Yes | No |
| Product interaction | Yes | Yes | No |
| Photos | Yes (optional profile picture only) | Yes | No |
| Camera (QR scan) | No (live scan only, not stored) | — | — |
| Crash data | No | — | — |
| Third-party advertising | No | — | — |

Select "No" for "Does your app use data for tracking?". Photos: only collected if the
user chooses to set a profile picture in Settings (camera or library) — see
`DATA_SAFETY.md` §Part B item 5 and `PRIVACY.md` §2.d.

**Account deletion (Guideline 5.1.1(v)):** the app supports in-app account creation, so
it must also support in-app account deletion — it does: Settings → Delete Account. This
calls the `delete-account` Supabase Edge Function, which removes the auth user and
profile, and anonymizes (not deletes) any supply-chain records they created, preserving
the audit trail for other participants. Mention this in the App Review notes (§8) so the
reviewer knows where to find it if they check.

---

## 11. Release notes (v1.0.0)

> First release of AgroChain.
> • Farm-to-consumer traceability for wheat & sugarcane
> • Farmers weigh in maund (mills weigh in kg downstream); a printable/shareable QR
>   label is generated per batch and refreshed with current status at every step
> • Mill operators can register multiple mill locations and send lab samples
>   (capped at 1kg) for testing, with a pending-samples inbox for the lab
> • Lab quality tests now use crop-appropriate metrics — moisture/protein/gluten
>   for wheat, Brix/Pol/Purity for sugarcane — detected automatically from the
>   batch or sample being tested
> • QR scanning with full product journey and GPS route map
> • Quality reports, fraud alerts (including live weight-variance checks), and a
>   live KPI dashboard
> • Offline-first capture with automatic sync
> • English and Urdu support
> • Sign in or create an account with just a mobile number — no email required
> • Optional profile picture; delete your account at any time from Settings

---

## 12. Release flow

1. `npx expo prebuild --platform ios --clean` — (re)generate the native `ios/` project from `app.json`
2. Open `ios/AgroChain.xcworkspace` in Xcode, select **Any iOS Device**, then **Product → Archive**
3. In the Organizer, **Distribute App → App Store Connect → Upload** (this builds and uploads
   the `.ipa` in one step; a Distribution certificate + provisioning profile are generated
   automatically the first time if automatic signing is enabled)
4. Open App Store Connect → TestFlight → add internal testers → test
5. App Store Connect → Prepare for Submission → fill all sections above
6. Submit for Review (first review: 1–3 business days)

For subsequent releases: bump `version` (and `ios.buildNumber`) in `app.json`, then repeat
steps 1–3.

---

## 13. Quick reference — config already set

| Setting | Where | Value |
|---------|-------|-------|
| Bundle ID | `app.json` → `ios.bundleIdentifier` | com.agrochain.app |
| Version | `app.json` → `expo.version` | 1.0.0 |
| Build number | `app.json` → `ios.buildNumber` | bump manually each release |
| Camera permission | `app.json` → `ios.infoPlist` | ✓ |
| Photo library permission | `expo-image-picker` plugin config | ✓ |
| Location permission | `app.json` → `ios.infoPlist` | ✓ |
| Always-location / microphone stripped | `plugins/withStripUnusedIosPermissions.js` | ✓ |
| Tablet support | `app.json` → `ios.supportsTablet` | true |
| iOS build/signing | Xcode (`ios/AgroChain.xcworkspace`), automatic signing | ✓ |
