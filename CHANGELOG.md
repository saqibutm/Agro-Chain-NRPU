# Changelog

All notable changes to **AgroChain** are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-06-07

First public release: farm-to-consumer blockchain traceability for wheat and sugarcane
in Pakistan.

### Added

**Traceability & blockchain**
- Hyperledger Fabric chaincode (`go/supplychain.go`) for entities, licenses, wheat batches,
  products, product movements, quality reports, and consumer scans.
- Wheat batch lifecycle: create, transfer custody, receive, process, query.
- Consumer scan/issue recording on-chain (`RecordConsumerScan`, `QueryConsumerScans`).

**Offline-first sync**
- Persistent write-queue (`Services/SyncQueue.js`) with AsyncStorage.
- Connectivity-aware `SyncContext` that auto-flushes the queue on reconnect.
- `SyncStatusBar` banner (offline / pending / syncing) across capture screens.

**Urdu language support**
- Full i18n (`i18n/`) with English + Urdu dictionaries (key parity enforced).
- Language toggle in Settings with persistence and RTL priming.

**Fraud detection**
- Rule engine (`Services/fraudDetection.js`): weight variance, extraction ratio,
  duplicate QR, transit duration, and quality-failure/low-grade checks.
- `FraudAlerts` screen merging live quality-report alerts with rule-based ones, severity-sorted.

**Consumer trust layer**
- `ProductJourney` screen: "Verified on Blockchain" badge, quality panel, farm origin,
  farm-to-shelf timeline, and offline-aware issue reporting.
- QR scanner navigates to the product journey on scan.

**Quality reports**
- Lab-only `RecordQualityTest` + `QueryQualityReportsBySubject` + `QueryAllQualityReports`.
- `LabDashboard` screen to record tests (grade, result, moisture/protein/gluten, contamination).
- Quality grades feed Home KPIs (pass rate, quality flags) and fraud alerts.

**Card-based KPI dashboard**
- `Home` rebuilt with live KPIs from chaincode, pull-to-refresh, and offline placeholders.
- Tappable "Quality Flags" KPI navigates to Fraud Alerts.

**GPS tracking**
- `WheatBatch` gains farm-origin coordinates and a geotagged `CustodyHistory` trail.
- `CreateWheatBatch` / `SendWheatBatch` accept and record GPS.
- Device GPS capture (`expo-location`) on harvest; `MapScreen` renders the custody route
  (markers + polyline); "View Route on Map" in the product journey.

**Backend gateway (`org/serverOrg1.js`)**
- REST endpoints for all create/query/transfer/quality/consumer operations.

### Changed
- App renamed to **AgroChain**; package ID set to `com.agrochain.app`.
- Camera and Location permissions declared in `app.json` (iOS + Android) with plugins.

### Fixed
- CA enrollment scripts now use the correct MSP (`FarmerOrg1MSP`) and a consistent CA
  reference (`ca.farmerorg1.supplychain.com`) — previously the invalid `OrgMSP` caused
  all transactions to fail MSP validation.
- Consumer "Report Issue" is now backed end-to-end (was calling a non-existent endpoint).

### Deployment notes
- Install native deps: `npx expo install @react-native-async-storage/async-storage @react-native-community/netinfo expo-location`.
- Redeploy chaincode with a bumped sequence (new functions + changed `CreateWheatBatch`/`SendWheatBatch` signatures).

---

## [Unreleased]

### Changed
- **Backend replaced:** the Hyperledger Fabric chaincode/gateway described in the 1.0.0
  entry above has been replaced with a Supabase (Postgres) backend — see
  `supabase/schema.sql` and `Services/api.js`. Traceability records are no longer stored
  on a blockchain; see `PRIVACY.md` §4 for the current record-integrity model.
- **Sign-in is now mobile-number-only** — no email or free-form username. Users sign in
  or sign up with an 11-digit mobile number starting with 0 (`Screens/Account/SingIn.js`,
  `SignUp.js`); internally this maps to a synthetic email address for Supabase Auth.
- Writes now stamp `created_by`/`reported_by` with the authenticated user's ID
  (`Services/api.js`), giving every record an audit trail.

### Added
- **Sign Up screen** (`Screens/Account/SignUp.js`) — new users can create an account
  directly from the Sign In screen.
- **About page** (`Screens/About.js`) with an academic **Project Acknowledgment** card:
  HEC + UAF logo placeholders, project title, NRPU Project No. 15516, host institution,
  and HEC/NRPU funding statement. Linked from Settings; bilingual (EN/UR) titles.
- WhatsApp added as a second Settings → Contact Us option, alongside email.

_Planned: payment/settlement integration, voice input for low-literacy users, web regulator dashboard._
