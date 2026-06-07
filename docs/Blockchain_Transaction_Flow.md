# Blockchain Transaction Flow — AgroChain

## 1. Generic Fabric transaction lifecycle

```mermaid
sequenceDiagram
    participant App as Mobile App
    participant GW as Gateway (fabric-network)
    participant E as Endorsing Peer(s)
    participant O as Orderer (Raft)
    participant L as Ledger + CouchDB
    App->>GW: REST call (action + payload)
    GW->>E: Proposal (submitTransaction)
    E->>E: Simulate chaincode, produce R/W set + endorsement
    E-->>GW: Endorsed response
    GW->>O: Submit endorsed tx
    O->>O: Order into block
    O-->>L: Deliver block to peers
    L->>L: Validate (VSCC/MVCC), commit
    L-->>GW: Commit event
    GW-->>App: Result
```

- **submitTransaction** → write path (endorse → order → commit).
- **evaluateTransaction** → read path (query a peer; no ordering).

## 2. End‑to‑end traceability flow (wheat example)

```mermaid
sequenceDiagram
    autonumber
    participant Farmer
    participant Lab
    participant Mill
    participant Dist as Distributor
    participant Retail as Retailer
    participant Consumer
    Farmer->>Chaincode: CreateWheatBatch (GPS geotag)
    Lab->>Chaincode: RecordQualityTest (batch)
    Farmer->>Chaincode: SendWheatBatch → Collection/Transport (geotag)
    Mill->>Chaincode: ReceiveWheatBatch / ProcessWheatBatch
    Mill->>Chaincode: CreateProduct (flour) + RecordQualityTest
    Mill->>Chaincode: RecordProductMovement → Distributor
    Dist->>Chaincode: RecordProductMovement → Retailer
    Consumer->>Chaincode: RecordConsumerScan (QR verify / issue)
```

## 3. Custody & geotag trail

`CreateWheatBatch` seeds `CustodyHistory` with a `Harvested` GeoPoint; each `SendWheatBatch`
appends a geotagged `Transferred to <id>` point (timestamp from the tx). The mobile
`ProductJourney` reads this to render the map route.

```mermaid
flowchart LR
    H[Harvested\nlat,lng,ts] --> T1[Transfer → Collection] --> T2[Transfer → Warehouse] --> T3[Transfer → Mill]
```

## 4. State transitions (WheatBatch)

```mermaid
stateDiagram-v2
    [*] --> Active: CreateWheatBatch
    Active --> Active: SendWheatBatch (holder changes)
    Active --> Processed: ProcessWheatBatch (MillOrg4MSP)
    Processed --> [*]
```

## 5. Determinism notes

- Transaction IDs for product movements are SHA‑256 of
  `productID-senderID-receiverID-date-quantity` (idempotent).
- Timestamps use `GetTxTimestamp()` (deterministic across endorsers) — **never**
  `time.Now()` inside chaincode.
