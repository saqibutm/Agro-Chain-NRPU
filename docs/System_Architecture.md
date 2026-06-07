# System Architecture Document — AgroChain

## 1. High‑level architecture

AgroChain is a three‑tier system: a **mobile client**, a **REST gateway**, and a
**Hyperledger Fabric network** with CouchDB state databases.

```mermaid
flowchart TB
    subgraph Client["📱 Mobile App (React Native / Expo)"]
      UI[Screens + Navigation]
      CTX[Contexts: Auth · Sync · i18n]
      SVC[Services: api · SyncQueue · location · fraudDetection]
      UI --> CTX --> SVC
    end

    subgraph Gateway["🌐 REST Gateway (Node.js / Express)"]
      API[/serverOrg1.js :8081/]
      WALLET[(File-system Wallet)]
      CA[fabric-ca-client]
      SDK[fabric-network Gateway]
    end

    subgraph Fabric["⛓️ Hyperledger Fabric Network"]
      direction TB
      ORD[(Raft Orderers)]
      P1[Peer · FarmerOrg1]
      P3[Peer · PunjabOrg3]
      P4[Peer · MillOrg4]
      P5[Peer · DealerOrg5]
      P6[Peer · RetailerOrg6]
      CC[[Chaincode: supplychain]]
      DB[(CouchDB world state)]
    end

    SVC -- HTTPS/JSON --> API
    API --> SDK --> P1
    API --> CA --> WALLET
    SDK -. submit/evaluate .-> CC
    P1 --- CC --- DB
    P1 & P3 & P4 & P5 & P6 --- ORD
```

## 2. Components

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Mobile client | React Native 0.73 / Expo SDK 50 | UI, offline queue, GPS/QR capture, i18n |
| Gateway | Node.js + Express + `fabric-network` + `fabric-ca-client` | Auth (CA enroll), REST→chaincode bridge, wallet |
| Smart contract | Go (`fabric-contract-api-go`) | Business rules, access control, ledger writes/queries |
| State DB | CouchDB | Rich JSON queries via indexes |
| Ordering | Raft (configtx) | Transaction ordering, block creation |
| Identity | Fabric CA + X.509 + MSP | Org/role identity and authorization |

## 3. Logical view (mobile app)

```mermaid
flowchart LR
    App[App.js] --> I18n[I18nProvider]
    I18n --> Auth[AuthProvider]
    Auth --> Sync[SyncProvider]
    Sync --> Nav[MainStack]
    Nav -->|no session| AuthFlow[SignIn · Forgot · Verify]
    Nav -->|session| AppFlow[BottomTab + screens]
    AppFlow --> Home & Tracking[SupplyChainTracking] & Settings & Journey[ProductJourney] & Lab[LabDashboard] & Fraud[FraudAlerts] & Map[MapScreen] & About
```

## 4. Data flow (write path, offline‑aware)

```mermaid
sequenceDiagram
    participant U as User
    participant S as Screen
    participant SC as SyncContext
    participant Q as SyncQueue (AsyncStorage)
    participant API as Gateway
    participant CC as Chaincode
    U->>S: Submit (e.g. Create Batch)
    S->>SC: submit(action, payload)
    alt Online
        SC->>API: POST /api/...
        API->>CC: submitTransaction(...)
        CC-->>API: ok
        API-->>SC: 200
    else Offline
        SC->>Q: enqueue(action, payload)
        Note over SC,Q: auto-flush on reconnect
    end
```

## 5. Deployment view

```mermaid
flowchart TB
    Store[Google Play] --> Phone[Android device]
    Phone -- HTTPS --> LB[Reverse proxy / TLS]
    LB --> GW[Gateway container]
    GW --> FabricNet[Fabric peers/orderers/CAs + CouchDB]
```

## 6. Non‑functional considerations

- **Availability:** multiple Raft orderers; peers per org (see Fabric Architecture doc).
- **Performance:** CouchDB indexes for all rich queries; client caching/placeholders.
- **Resilience:** offline‑first queue tolerates connectivity loss.
- **Security:** TLS in transit, MSP authorization, CA‑backed auth (see Security Overview).
- **Localization:** full EN/UR with RTL.

## 7. Known gaps / assumptions

- Only **Org1 (Farmer)** gateway server is implemented; peer gateways for other orgs are
  **To Be Completed by Project Team**.
- Network bootstrap (cryptogen, docker‑compose, channel creation) is referenced by
  `configtx/configtx.yaml` but the orchestration scripts are **To Be Completed**.
