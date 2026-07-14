# AgroChain — Google Play Data Safety Form (Fillable Answers)

Copy these answers directly into **Play Console → App content → Data safety**.
The form has four parts: (A) overview, (B) data collection & sharing, (C) security
practices, (D) per-data-type details. Answers reflect what AgroChain actually does.

> Update this file whenever you add an SDK (analytics, crash reporting, ads) or a new
> data type — the Data safety form must always match real behavior.

---

## Part A — Data collection overview

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** |
| Do you provide a way for users to request that their data be deleted? | **Yes** (see note below) |

> Deletion note: account/operational data can be deleted on request via the contact
> email. Supply-chain event records (transfers, quality tests, issue reports) aren't
> self-service editable in the app to preserve the audit trail, but can be corrected or
> removed on request where legitimately required; where full deletion isn't appropriate
> we dissociate personal identifiers instead. State this in your privacy policy (already
> covered in `PRIVACY.md`).

---

## Part B — Data types

Mark **only** the following as collected. Everything else = **Not collected**.

### 1. Location → Approximate location
- Collected: **Yes** · Shared: **No**
- Processed ephemerally: **No**
- Required or optional: **Optional** (only when recording a batch/transfer)
- Purposes: **App functionality**

### 2. Location → Precise location
- Collected: **Yes** · Shared: **No**
- Processed ephemerally: **No**
- Required or optional: **Optional**
- Purposes: **App functionality** (geotag harvests and custody transfers)

### 3. Personal info → Name / User IDs
- Collected: **Yes** · Shared: **No**
- Required or optional: **Required** (for signed-in supply-chain participants)
- Purposes: **App functionality**, **Account management**
- Note: mobile number (used to sign in, no email required) and entity/farmer/mill IDs
  entered by the user.

### 4. App activity → Other in-app actions
- Collected: **Yes** · Shared: **No**
- Required or optional: **Required**
- Purposes: **App functionality** (supply-chain transactions in the traceability database)

### 5. Photos or videos → Photos
- Collected: **Yes** · Shared: **No**
- Required or optional: **Optional** (only if the user chooses to set a profile picture)
- Purposes: **App functionality**, **Account management**
- Note: a single profile picture the user picks from their library or takes with the
  camera, stored in the "avatars" bucket. QR-scan camera frames are still live-only and
  never collected or stored.

### Explicitly NOT collected
- Financial info · Health & fitness · Messages · Contacts · Calendar
- Videos · Audio · Files/Docs · Web browsing history
- **Device or other IDs / Advertising ID** — none used
- **No third-party advertising; no analytics SDK** (as of v1.0.0)

> ⚠️ If/when you add Firebase, Sentry, or any analytics: you will likely need to declare
> **Crash logs**, **Diagnostics**, and possibly **Device IDs**, and review "shared" answers.

---

## Part C — Security practices

| Question | Answer |
|----------|--------|
| Is data encrypted in transit? | **Yes** — HTTPS to the Supabase backend |
| Can users request data deletion? | **Yes** — via contact email; see the deletion note in Part A |
| Committed to Play Families Policy? | **No** (not a children's app) |
| Independent security review? | **No** (declare Yes only if you have one) |

---

## Part D — Per-data-type detail (purpose recap)

| Data type | Collected | Shared | Optional? | Purpose | Ephemeral |
|-----------|-----------|--------|-----------|---------|-----------|
| Approximate location | Yes | No | Optional | App functionality | No |
| Precise location | Yes | No | Optional | App functionality | No |
| Name / User IDs | Yes | No | Required | App functionality, Account management | No |
| In-app actions | Yes | No | Required | App functionality | No |
| Photos | Yes | No | Optional | App functionality, Account management | No |

---

## Permission justifications (must match `app.json`)

| Permission | Manifest string | Console justification |
|------------|-----------------|-----------------------|
| Camera | `NSCameraUsageDescription` / `CAMERA` | Scan product QR codes for supply-chain verification, and optionally take a profile picture |
| Photo library | `NSPhotoLibraryUsageDescription` / `READ_MEDIA_IMAGES` | Choose an existing photo as a profile picture |
| Location (fine/coarse) | `NSLocationWhenInUseUsageDescription` / `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` | Geotag farm harvests and custody transfers |

> Background location is **not** requested. Do not check any "background location" boxes.

---

## Quick verification before submitting

- [ ] Privacy policy URL added (hosted `privacy.html`) and matches these answers
- [ ] Camera/Location justifications match `app.json` wording
- [ ] No advertising/analytics declared (true for v1.0.0)
- [ ] "Background location" left unchecked
- [ ] Deletion contact email is live
