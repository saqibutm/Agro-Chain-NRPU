# Project Overview — AgroChain

> **AgroChain – A Wheat and Sugar Traceability Solution using IoT and Blockchain**
> NRPU Project No. **15516** · Funded by the **Higher Education Commission (HEC), Pakistan**
> Host: **University of Agriculture Faisalabad (UAF)**, Pakistan

## 1. Purpose

AgroChain provides **farm‑to‑consumer traceability** for Pakistan's wheat and sugarcane
supply chains using a permissioned blockchain (Hyperledger Fabric). Every stage — from a
farmer's harvest, through collection/procurement centers, transporters, warehouses, mills,
distributors, and retailers — is recorded on an immutable ledger. Consumers scan a QR code
on a bag of flour or sugar to view the product's complete journey, quality test results,
and farm of origin.

## 2. Problem statement

Pakistan's staple‑food supply chains suffer from limited transparency, weight/quality
manipulation, adulteration, and weak regulatory visibility. Consumers cannot verify the
origin or safety of flour and sugar. AgroChain addresses this with tamper‑evident,
shared‑ledger traceability and a consumer verification layer.

## 3. Objectives

1. Record every custody and processing event on an immutable ledger.
2. Enforce role‑based authorization (farmer, mill, lab, regulator, …) at the smart‑contract level.
3. Provide a mobile app for participants (data capture) and consumers (QR verification).
4. Geotag harvests and transfers for spatial traceability.
5. Surface quality‑assurance and fraud‑detection signals to regulators.
6. Operate in low‑connectivity rural environments (offline‑first) and in Urdu + English.

## 4. Scope (as implemented in this repository)

| Area | Status |
|------|--------|
| Hyperledger Fabric chaincode (Go) | Implemented (`go/supplychain.go`) |
| Node.js/Express gateway (Org1) | Implemented (`org/serverOrg1.js`) |
| React Native (Expo) mobile app | Implemented (`Screens/`, `Navigation/`) |
| CouchDB rich‑query indexes | Implemented (`go/META-INF/...`) |
| Channel/org config | Implemented (`configtx/configtx.yaml`) |
| Offline‑first sync, i18n, GPS, fraud, KPIs, consumer trust, quality reports | Implemented |
| Network bootstrap scripts (cryptogen/compose) | **To Be Completed by Project Team** |

## 5. Key features

- Farm‑to‑shelf traceability with on‑chain custody history
- Consumer QR verification (product journey, quality, GPS route map)
- Lab quality reports (moisture, protein, gluten, contamination)
- Fraud/anomaly detection (weight variance, extraction ratio, duplicate QR, quality failure)
- Live KPI dashboard
- Offline‑first capture with auto‑sync
- Bilingual UI (English + اردو)
- GPS geotagging of harvests and transfers

## 6. Stakeholders

| Role | Interest |
|------|----------|
| Farmers | Register batches, prove provenance, receive fair attribution |
| Collection/Procurement centers, Transporters, Warehouses | Custody handovers |
| Flour/Sugar mills | Processing + product creation |
| Distributors, Retailers | Downstream custody |
| Accredited labs | Quality certification |
| Regulators (e.g., Punjab Food Authority / PASSCO) | Oversight, fraud, recalls |
| Consumers | Authenticity & safety verification |

## 7. Document map

See [`docs/`](./) for the full documentation set: System Architecture, Hyperledger Fabric
Architecture, Transaction Flow, Chaincode, Android App, API, Database, Deployment,
Installation, User Manual, Administrator Manual, Security Overview, Troubleshooting, and
the `docs/reports/` research deliverables.
