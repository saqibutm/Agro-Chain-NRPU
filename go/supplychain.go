package main

import (
    "crypto/sha256"
    "encoding/json"
    "fmt"
    "strings" // Add this line
    "time"
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
    "github.com/hyperledger/fabric-chaincode-go/pkg/cid"
)

type SmartContract struct {
    contractapi.Contract
}

// GenerateTransactionID creates a deterministic hash based on transaction details
func GenerateTransactionID(productID, senderID, receiverID, transactionDate string, quantity int) string {
    input := fmt.Sprintf("%s-%s-%s-%s-%d", productID, senderID, receiverID, transactionDate, quantity)
    hash := sha256.Sum256([]byte(input))
    return fmt.Sprintf("%x", hash)
}

type Entity struct {
    ID         string `json:"id"`
    Name       string `json:"name"`
    Email      string `json:"email"`
    EntityType string `json:"entityType"` // Distinguish between Farmers, Mills, etc.
    LicenseID  string `json:"licenseID"`  // Direct link to the entity's license
}

type License struct {
    LicenseID    string `json:"licenseID"`
    EntityID     string `json:"entityID"` // Link to the entity
    LicenseNumber string `json:"licenseNumber"`
    IssuedDate    string `json:"issuedDate"` // YYYY-MM-DD format
    ExpiryDate    string `json:"expiryDate"` // YYYY-MM-DD format
    Status        string `json:"status"`     // e.g., "Active", "Expired", "Revoked"
    LicenseType   string `json:"licenseType"`// e.g., "Farmer", "Mill"
}

// WheatCert describes basic details required for wheat supply chain management
type WheatCert struct {
    Variety         string  `json:"variety"`
    QualityFactor   string  `json:"qualityFactor"`
    ProteinContent  int     `json:"proteinContent"`
    WheatCertHolder string  `json:"wheatCertHolder"`
    Weight          int     `json:"weight"`
    Buyer           string  `json:"buyer"`
    Date            string  `json:"dateOfIssueWheatCert"`
}

// WheatBatch represents a harvested batch of wheat.
type WheatBatch struct {
    DocType         string `json:"docType"` // Ensure this field exists and is set to "WheatBatch" when creating a new batch
    Variety         string `json:"variety"`
    Quantity        int    `json:"quantity"`
    FarmerID        string `json:"farmerID"`
    HarvestDate     string `json:"harvestDate"`
    WheatBatchID    string `json:"wheatBatchID"`
    CurrentHolder   string `json:"currentHolder"`
    QRCode          string `json:"qrCode"` // a unique identifier or URL linked to the QR code
    WheatCertHolder string `json:"wheatCertHolder"`
    DateReceived    string `json:"date"` // Consider a more descriptive name, like DateReceived
    Status          string `json:"status"`
    FlourType       string `json:"wheatCertFlourType"` // This might better fit as simply "FlourType"
    FarmLatitude    float64    `json:"farmLatitude"`  // farm-of-origin GPS
    FarmLongitude   float64    `json:"farmLongitude"`
    CustodyHistory  []GeoPoint `json:"custodyHistory"` // geotagged custody trail
}

// GeoPoint is one geotagged event in a batch's custody trail.
type GeoPoint struct {
    Label     string  `json:"label"`     // e.g. "Harvested", "Transferred to <id>"
    HolderID  string  `json:"holderID"`
    Latitude  float64 `json:"latitude"`
    Longitude float64 `json:"longitude"`
    Timestamp string  `json:"timestamp"`
}

// txTime returns the (deterministic) transaction timestamp as RFC3339.
func txTime(ctx contractapi.TransactionContextInterface) string {
    ts, err := ctx.GetStub().GetTxTimestamp()
    if err != nil || ts == nil {
        return ""
    }
    return time.Unix(ts.Seconds, int64(ts.Nanos)).UTC().Format(time.RFC3339)
}

// WheatOwnership represents the current ownership of the wheat batch.
/*type WheatOwnership struct {
    WheatBatchID    string `json:"wheatBatchID"`
    CurrentHolder   string `json:"currentHolder"` // Middleman or Punjab's ID
    PurchaseDate    string `json:"purchaseDate"`
}*/

type Product struct {
    DocType         string `json:"docType"` // Add this field
    ProductID       string `json:"productID"`
    WheatBatchID    string `json:"wheatBatchID"`
    ProductionDate  string `json:"productionDate"`
    ExpiryDate      string `json:"expiryDate"`
    QRCode          string `json:"qrCode"`
    ProductName     string `json:"productName"`
    ProductType     string `json:"productType"`
}

// QualityReport captures lab test results for a wheat batch or flour product.
type QualityReport struct {
    DocType         string  `json:"docType"`         // "QualityReport"
    ReportID        string  `json:"reportID"`
    SubjectID       string  `json:"subjectID"`       // wheatBatchID or productID being tested
    LabID           string  `json:"labID"`
    TestedBy        string  `json:"testedBy"`
    TestDate        string  `json:"testDate"`
    MoistureContent float64 `json:"moistureContent"`
    ProteinContent  float64 `json:"proteinContent"`
    GlutenContent   float64 `json:"glutenContent"`
    Pesticides      bool    `json:"pesticidesDetected"`
    Aflatoxin       bool    `json:"aflatoxinDetected"`
    Result          string  `json:"result"`          // "Pass","Fail","Conditional"
    Grade           string  `json:"grade"`           // "A","B","C"
    CertificateHash string  `json:"certificateHash"` // off-chain (IPFS) document hash
}

type ProductMovement struct {
    DocType             string `json:"docType"` // Add this field
    TransactionID       string `json:"transactionID"`
    ProductID           string `json:"productID"`
    SenderID            string `json:"senderID"`
    ReceiverID          string `json:"receiverID"`
    QuantityTransferred int    `json:"quantityTransferred"`
    TransactionDate     string `json:"transactionDate"`
}

func (s *SmartContract) CreateProduct(ctx contractapi.TransactionContextInterface, productID string, wheatBatchID string, productionDate string, expiryDate string, qrCode string, productName string, productType string) error {
    // Get client identity
    var err error // Declare err at the beginning

    clientID, err := cid.New(ctx.GetStub())
    if err != nil {
        return fmt.Errorf("failed to get client identity: %v", err)
    }

    mspID, err := clientID.GetMSPID() // Correctly assign to already declared variables
    if err != nil {
        return fmt.Errorf("failed to get MSP ID: %v", err)
    }
    if mspID != "MillOrg4MSP" {
        return fmt.Errorf("unauthorized: only a Mill organization can create wheat products")
    }
    
    // Fetch the wheat batch from the ledger using wheatBatchID
    wheatBatchJSON, err := ctx.GetStub().GetState(wheatBatchID)
    if err != nil || wheatBatchJSON == nil {
        return fmt.Errorf("failed to find wheat batch: %v", err)
    }

    // Check if the product already exists
    productJSON, err := ctx.GetStub().GetState(productID)
    if err != nil {
        return fmt.Errorf("failed to read from world state: %v", err)
    }
    if productJSON != nil {
        return fmt.Errorf("the product %s already exists", productID)
    }

    // Create a product instance
    product := Product{
        DocType:        "Product", // Set this field
        ProductID:      productID,
        WheatBatchID:   wheatBatchID,
        ProductionDate: productionDate,
        ExpiryDate:     expiryDate,
        QRCode:         qrCode,
        ProductName:    productName,
        ProductType:    productType,
    }

    // Marshal the product to JSON
    productJSON, err = json.Marshal(product)
    if err != nil {
        return err
    }

    // Store the product in the ledger
    return ctx.GetStub().PutState(productID, productJSON)
}


// RecordProductMovement records the movement of a product from sender to receiver
func (s *SmartContract) RecordProductMovement(ctx contractapi.TransactionContextInterface, productID, senderID, receiverID string, quantity int, transactionDate string) error {
    // Generate a deterministic transactionID
    transactionID := GenerateTransactionID(productID, senderID, receiverID, transactionDate, quantity)
    
    // Check if the product exists
    productJSON, err := ctx.GetStub().GetState(productID)
    if err != nil {
	return fmt.Errorf("failed to get product %s from the ledger: %v", productID, err)
    }
    if productJSON == nil {
	return fmt.Errorf("product %s does not exist", productID)
    }
    // Check if the sender entity exists
    senderEntityJSON, err := ctx.GetStub().GetState(senderID) // Assuming entity IDs are stored as keys
    if err != nil {
        return fmt.Errorf("failed to get sender entity %s from the ledger: %v", senderID, err)
    }
    if senderEntityJSON == nil {
        return fmt.Errorf("sender entity %s does not exist", senderID)
    }
    // Check if the receiver entity exists
    receiverEntityJSON, err := ctx.GetStub().GetState(receiverID) // Assuming entity IDs are stored as keys
    if err != nil {
        return fmt.Errorf("failed to get receiver entity %s from the ledger: %v", receiverID, err)
    }
    if receiverEntityJSON == nil {
        return fmt.Errorf("receiver entity %s does not exist", receiverID)
    }
    // Create a ProductMovement instance
    movement := ProductMovement{
        DocType:           "ProductMovement", // Set this field
        TransactionID:     transactionID,
        ProductID:         productID,
        SenderID:          senderID,
        ReceiverID:        receiverID,
        QuantityTransferred: quantity,
        TransactionDate:   transactionDate,
    }

    movementJSON, err := json.Marshal(movement)
    if err != nil {
        return fmt.Errorf("failed to marshal product movement: %v", err)
    }

    // Use TransactionID as the key for storing the movement
    return ctx.GetStub().PutState(transactionID, movementJSON)
}

func (s *SmartContract) QueryProductMovements(ctx contractapi.TransactionContextInterface, productID string) ([]*ProductMovement, error) {
    queryString := fmt.Sprintf(`{"selector":{"docType":"ProductMovement","productID":"%s"}}`, productID)

    resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var movements []*ProductMovement
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var movement ProductMovement
        err = json.Unmarshal(queryResponse.Value, &movement)
        if err != nil {
            return nil, err
        }

        movements = append(movements, &movement)
    }

    return movements, nil
}

// CreateEntity stores a new entity on the ledger. This function should be called
// before issuing a license to the entity. The LicenseID will be added to the entity
// in a separate step, after the license has been created.
func (s *SmartContract) CreateEntity(ctx contractapi.TransactionContextInterface, id string, name string, mail string, entityType string) error {
    // Check if the entity already exists in the ledger
    exists, err := ctx.GetStub().GetState(id)
    if err != nil {
        return fmt.Errorf("failed to read from world state: %v", err)
    }
    if exists != nil {
        return fmt.Errorf("entity '%s' already exists", id)
    }

    // Create a new entity object. Note that LicenseID is not set at this stage.
    entity := Entity{
        ID:         id,
        Name:       name,
        Email:      mail,
        EntityType: entityType,
        // LicenseID is intentionally left blank and should be updated after a license is issued.
    }

    // Marshal the entity object to JSON
    entityJSON, err := json.Marshal(entity)
    if err != nil {
        return err
    }

    // Store the entity in the ledger
    return ctx.GetStub().PutState(id, entityJSON)
}

func (s *SmartContract) QueryEntityByName(ctx contractapi.TransactionContextInterface, name string) ([]Entity, error) {
    queryString := fmt.Sprintf(`{"selector":{"name":"%s"}}`, name)

    resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var entities []Entity
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var entity Entity
        err = json.Unmarshal(queryResponse.Value, &entity)
        if err != nil {
            return nil, err
        }

        entities = append(entities, entity)
    }

    return entities, nil
}

// StoreLicense creates a new license and links it to an entity.
func (s *SmartContract) StoreLicense(ctx contractapi.TransactionContextInterface, licenseID string, entityID string, licenseNumber string, issuedDate string, expiryDate string, status string, licenseType string) error {
    // Check if the license already exists
    exists, err := s.LicenseExists(ctx, licenseID)
    if err != nil {
        return err
    }
    if exists {
        return fmt.Errorf("the license with ID %s already exists", licenseID)
    }

    // Fetch the entity to check if it's a farmer
    entityJSON, err := ctx.GetStub().GetState(entityID)
    if err != nil || entityJSON == nil {
        return fmt.Errorf("failed to fetch entity: %s", entityID)
    }

    var entity Entity
    err = json.Unmarshal(entityJSON, &entity)
    if err != nil {
        return err
    }

    // Ensure the entity is of type "Farmer"
    if entity.EntityType != "Farmer" {
        return fmt.Errorf("licenses can only be issued to entities of type 'Farmer', entity type: %s", entity.EntityType)
    }

    // Proceed to create the license if the entity is a farmer
    license := License{
        LicenseID:     licenseID,
        EntityID:      entityID,
        LicenseNumber: licenseNumber,
        IssuedDate:    issuedDate,
        ExpiryDate:    expiryDate,
        Status:        status,
        LicenseType:   licenseType,
    }

    licenseJSON, err := json.Marshal(license)
    if err != nil {
        return err
    }

    // Save the license to the ledger
    err = ctx.GetStub().PutState(licenseID, licenseJSON)
    if err != nil {
        return err
    }

    // Update the entity with the LicenseID
    entity.LicenseID = licenseID
    updatedEntityJSON, err := json.Marshal(entity)
    if err != nil {
        return err
    }

    // Save the updated entity back to the ledger
    return ctx.GetStub().PutState(entityID, updatedEntityJSON)
}

// LicenseExists checks if a license exists in the ledger.
func (s *SmartContract) LicenseExists(ctx contractapi.TransactionContextInterface, licenseID string) (bool, error) {
    licenseJSON, err := ctx.GetStub().GetState(licenseID)
    if err != nil {
        return false, err
    }
    return licenseJSON != nil, nil
}


func (s *SmartContract) VerifyLicense(ctx contractapi.TransactionContextInterface, licenseID string, verifierEntityID string) (bool, error) {
    licenseJSON, err := ctx.GetStub().GetState(licenseID)
    if err != nil || licenseJSON == nil {
        return false, fmt.Errorf("license not found: %s", licenseID)
    }

    var license License
    err = json.Unmarshal(licenseJSON, &license)
    if err != nil {
        return false, err
    }

    if license.Status != "Active" || license.LicenseType != "Farmer" {
        return false, fmt.Errorf("either license is not active or not a Farmer's license")
    }

    verifierEntityJSON, err := ctx.GetStub().GetState(verifierEntityID)
    if err != nil || verifierEntityJSON == nil {
        return false, fmt.Errorf("verifier entity not found: %s", verifierEntityID)
    }

    var verifierEntity Entity
    err = json.Unmarshal(verifierEntityJSON, &verifierEntity)
    if err != nil {
        return false, err
    }

    if verifierEntity.EntityType != "Punjab" {
        return false, fmt.Errorf("only entities from Punjab Food Department are allowed to verify licenses")
    }

    return true, nil
}


// QueryAllEntities returns all entities in the ledger
func (s *SmartContract) QueryAllEntities(ctx contractapi.TransactionContextInterface) ([]Entity, error) {
    // Adjusted query selector to filter for documents with an 'entityType' field
    queryString := `{"selector":{"entityType":{"$exists":true}}}`

    resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var entities []Entity
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var entity Entity
        err = json.Unmarshal(queryResponse.Value, &entity)
        if err != nil {
            return nil, err
        }

        entities = append(entities, entity)
    }

    return entities, nil
}

// Adjusted to include a check for Punjab Food Department authorization
func (s *SmartContract) SendWheatBatch(ctx contractapi.TransactionContextInterface, wheatBatchID string, senderEntityID string, newHolderID string, latitude float64, longitude float64) error {
    // Fetch the wheat batch from the ledger using wheatBatchID
    wheatBatchJSON, err := ctx.GetStub().GetState(wheatBatchID)
    if err != nil {
        return fmt.Errorf("failed to read wheat batch from world state: %v", err)
    }
    if wheatBatchJSON == nil {
        return fmt.Errorf("wheat batch %s does not exist", wheatBatchID)
    }

    var wheatBatch WheatBatch
    err = json.Unmarshal(wheatBatchJSON, &wheatBatch)
    if err != nil {
        return err
    }
    
    // Fetch the current holder's entity details from the ledger
    currentHolderBytes, err := ctx.GetStub().GetState(wheatBatch.CurrentHolder)
    if err != nil || currentHolderBytes == nil {
        return fmt.Errorf("failed to get current holder entity: %v", err)
    }
    
    var currentHolder Entity
    err = json.Unmarshal(currentHolderBytes, &currentHolder)
    if err != nil {
        return fmt.Errorf("failed to unmarshal current holder entity: %v", err)
    }
    
    // Retrieve the MSP ID of the client making the request
    clientMSPID, err := cid.GetMSPID(ctx.GetStub())
    if err != nil {
        return fmt.Errorf("failed to get MSP ID: %v", err)
    }
    
    // Convert both strings to lowercase to make the check case-insensitive
    clientMSPIDLower := strings.ToLower(clientMSPID)
    entityTypeLower := strings.ToLower(currentHolder.EntityType)

    // Check if clientMSPID contains the entityType
    if !strings.Contains(clientMSPIDLower, entityTypeLower) {
       return fmt.Errorf("unauthorized: only entities of type %s which own the batch can transfer the wheat batch", currentHolder.Name)
    }

    // Verify the sender is the current holder of the wheat batch
    if wheatBatch.CurrentHolder != senderEntityID {
        return fmt.Errorf("sender entity %s is not the current holder of wheat batch %s", senderEntityID, wheatBatchID)
    }

    // Verify the receiver entity exists
    receiverEntityJSON, err := ctx.GetStub().GetState(newHolderID)
    if err != nil {
        return fmt.Errorf("failed to read receiver entity from world state: %v", err)
    }
    if receiverEntityJSON == nil {
        return fmt.Errorf("receiver entity %s does not exist", newHolderID)
    }

    // Update the wheat batch's current holder to the new holder
    wheatBatch.CurrentHolder = newHolderID

    // Append a geotagged custody point for this transfer.
    wheatBatch.CustodyHistory = append(wheatBatch.CustodyHistory, GeoPoint{
        Label:     fmt.Sprintf("Transferred to %s", newHolderID),
        HolderID:  newHolderID,
        Latitude:  latitude,
        Longitude: longitude,
        Timestamp: txTime(ctx),
    })

    // Marshal the updated wheat batch back to JSON
    updatedWheatBatchJSON, err := json.Marshal(wheatBatch)
    if err != nil {
        return fmt.Errorf("failed to marshal updated wheat batch: %v", err)
    }
    
    // After successfully updating the wheat batch in the ledger
    ctx.GetStub().SetEvent("WheatBatchTransferred", []byte(wheatBatchID))
    
    fmt.Printf("Wheat batch %s transferred from %s to %s\n", wheatBatchID, senderEntityID, newHolderID)

    // Write the updated wheat batch back to the ledger
    return ctx.GetStub().PutState(wheatBatchID, updatedWheatBatchJSON)
}

func (s *SmartContract) ReceiveWheatBatch(ctx contractapi.TransactionContextInterface, wheatBatchID string, receiverEntityID string, dateReceived string) error {
    // Get client identity
    var err error // Declare err at the beginning
    var mspID string // Declare mspID at the beginning if it's used across multiple assignments

    clientID, err := cid.New(ctx.GetStub())
    if err != nil {
        return fmt.Errorf("failed to get client identity: %v", err)
    }

    mspID, err = clientID.GetMSPID() // Correctly assign to already declared variables
    if err != nil {
        return fmt.Errorf("failed to get MSP ID: %v", err)
    }

    // Fetch the wheat batch from the ledger using wheatBatchID
    wheatBatchJSON, err := ctx.GetStub().GetState(wheatBatchID)
    if err != nil || wheatBatchJSON == nil {
        return fmt.Errorf("failed to find wheat batch: %v", err)
    }

    var wheatBatch WheatBatch
    err = json.Unmarshal(wheatBatchJSON, &wheatBatch)
    if err != nil {
        return fmt.Errorf("failed to unmarshal wheat batch: %v", err)
    }
    
    if wheatBatch.CurrentHolder != receiverEntityID {
        return fmt.Errorf("receiver entity %s is not the current holder of wheat batch %s", receiverEntityID, wheatBatchID)
    }

    // Update the wheat batch's certification holder and date received
    wheatBatch.WheatCertHolder = mspID // Using MSP ID as the holder identifier
    wheatBatch.DateReceived = dateReceived

    // Marshal the updated wheat batch back to JSON
    updatedWheatBatchJSON, err := json.Marshal(wheatBatch)
    if err != nil {
        return fmt.Errorf("failed to marshal updated wheat batch: %v", err)
    }

    // Write the updated wheat batch back to the ledger
    return ctx.GetStub().PutState(wheatBatchID, updatedWheatBatchJSON)
}

func (s *SmartContract) ProcessWheatBatch(ctx contractapi.TransactionContextInterface, wheatBatchID string, flourType string) error {
    // Get client identity
    var err error // Declare err at the beginning
    var mspID string // Declare mspID at the beginning if it's used across multiple assignments

    clientID, err := cid.New(ctx.GetStub())
    if err != nil {
        return fmt.Errorf("failed to get client identity: %v", err)
    }

    mspID, err = clientID.GetMSPID() // Correctly assign to already declared variables
    if err != nil {
        return fmt.Errorf("failed to get MSP ID: %v", err)
    }
    
    if mspID != "MillOrg4MSP" {
        return fmt.Errorf("unauthorized: only a Mill organization can process wheat batches")
    }


    wheatBatch, err := s.QueryWheatBatch(ctx, wheatBatchID)
    if err != nil {
        return err // query function already formats error
    }

    // Assuming we're adding simple processing logic; adapt as your application requires
    wheatBatch.Status = "Processed" // Status field to indicate it's processed
    wheatBatch.FlourType = flourType // Assuming you track this

    processedBatchJSON, err := json.Marshal(wheatBatch)
    if err != nil {
        return fmt.Errorf("failed to marshal processed wheat batch: %v", err)
    }

    return ctx.GetStub().PutState(wheatBatchID, processedBatchJSON)
}

    
// CreateWheatBatch issues a new wheat batch to the ledger
func (s *SmartContract) CreateWheatBatch(ctx contractapi.TransactionContextInterface, entityID string, wheatBatchID string, variety string, quantity int, harvestDate string, qrCode string, latitude float64, longitude float64) error {
    // Fetch the farmer entity from the ledger
    entityJSON, err := ctx.GetStub().GetState(entityID)
    if err != nil {
        return fmt.Errorf("failed to fetch entity: %s", entityID)
    }
    if entityJSON == nil {
        return fmt.Errorf("the entity ID %s does not exist", entityID)
    }

    var entity Entity
    err = json.Unmarshal(entityJSON, &entity)
    if err != nil {
        return fmt.Errorf("failed to unmarshal entity: %v", err)
    }
    // Check if the entity type is Farmer
    if entity.EntityType != "Farmer" {
        return fmt.Errorf("only farmers are allowed to create wheat batches, entity type: %s", entity.EntityType)
    }

    // Verify the farmer's license is active
    if entity.LicenseID == "" {
        return fmt.Errorf("farmer does not have a license associated")
    }

    licenseJSON, err := ctx.GetStub().GetState(entity.LicenseID)
    if err != nil || licenseJSON == nil {
        return fmt.Errorf("failed to fetch license: %s", entity.LicenseID)
    }

    var license License
    err = json.Unmarshal(licenseJSON, &license)
    if err != nil {
        return fmt.Errorf("failed to unmarshal license: %v", err)
    }

    if license.Status != "Active" {
        return fmt.Errorf("farmer's license is not active")
    }
    if quantity <= 0 {
        return fmt.Errorf("quantity must be positive, provided quantity: %d", quantity)
    }

    // Proceed with the existing logic to check if the wheat batch already exists and create it if not
    exists, err := ctx.GetStub().GetState(wheatBatchID)
    if err != nil {
        return fmt.Errorf("failed to read from world state: %v", err)
    }
    if exists != nil {
        return fmt.Errorf("the wheat batch %s already exists", wheatBatchID)
    }

    wheatBatch := WheatBatch{
        DocType:        "WheatBatch", // Set this field
        Variety:        variety,
        Quantity:       quantity,
        FarmerID:       entityID, // Assuming the entityID is the farmerID
        HarvestDate:    harvestDate,
        WheatBatchID:   wheatBatchID,
        CurrentHolder:  entityID, // Initially, the farmer holds the wheat batch
        QRCode:         qrCode,
        WheatCertHolder: "FarmerOrg1MSP",
        FarmLatitude:   latitude,
        FarmLongitude:  longitude,
        CustodyHistory: []GeoPoint{
            {
                Label:     "Harvested",
                HolderID:  entityID,
                Latitude:  latitude,
                Longitude: longitude,
                Timestamp: txTime(ctx),
            },
        },
    }

    wheatBatchJSON, err := json.Marshal(wheatBatch)
    if err != nil {
        return fmt.Errorf("failed to marshal wheat batch: %v", err)
    }

    return ctx.GetStub().PutState(wheatBatchID, wheatBatchJSON)
}

func (s *SmartContract) QueryAllWheatBatches(ctx contractapi.TransactionContextInterface) ([]*WheatBatch, error) {
    queryString := `{"selector":{"docType":"WheatBatch"}}`

    resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var batches []*WheatBatch
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var batch WheatBatch
        err = json.Unmarshal(queryResponse.Value, &batch)
        if err != nil {
            return nil, err
        }

        batches = append(batches, &batch)
    }

    return batches, nil
}


// Add methods to interact with these structs following the pattern
// from the earlier-ticket 'shipper' example.

// QueryWheatBatch retrieves a specific wheat batch's details from the ledger using the batch ID
func (s *SmartContract) QueryWheatBatch(ctx contractapi.TransactionContextInterface, wheatBatchID string) (*WheatBatch, error) {
    wheatBatchJSON, err := ctx.GetStub().GetState(wheatBatchID)
    if err != nil {
        return nil, fmt.Errorf("failed to read from world state: %v", err)
    }
    if wheatBatchJSON == nil {
        return nil, fmt.Errorf("the wheat batch %s does not exist", wheatBatchID)
    }

    var wheatBatch WheatBatch
    err = json.Unmarshal(wheatBatchJSON, &wheatBatch)
    if err != nil {
        return nil, fmt.Errorf("failed to unmarshal wheat batch: %v", err)
    }

    return &wheatBatch, nil
}

// QueryProduct retrieves a specific product's details from the ledger using the product ID
func (s *SmartContract) QueryProduct(ctx contractapi.TransactionContextInterface, productID string) (*Product, error) {
    productJSON, err := ctx.GetStub().GetState(productID)
    if err != nil {
        return nil, fmt.Errorf("failed to read from world state: %v", err)
    }
    if productJSON == nil {
        return nil, fmt.Errorf("the product %s does not exist", productID)
    }

    var product Product
    err = json.Unmarshal(productJSON, &product)
    if err != nil {
        return nil, fmt.Errorf("failed to unmarshal product: %v", err)
    }

    return &product, nil
}

func (s *SmartContract) QueryAllProducts(ctx contractapi.TransactionContextInterface) ([]*Product, error) {
    // Adjusted query selector to filter for documents with a 'productType' field
    queryString := `{"selector":{"productType":{"$exists":true}}}`

    resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var products []*Product
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var product Product
        err = json.Unmarshal(queryResponse.Value, &product)
        if err != nil {
            return nil, err
        }

        products = append(products, &product)
    }

    return products, nil
}

func (s *SmartContract) AggregateProductQuantities(ctx contractapi.TransactionContextInterface, productID string) (map[string]int, error) {
    queryString := fmt.Sprintf(`{"selector":{"docType":"ProductMovement","productID":"%s"}}`, productID)
    resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
    if err != nil {
        return nil, fmt.Errorf("failed to get query result for product movements: %v", err)
    }
    defer resultsIterator.Close()

    // Map to hold the aggregated quantities for each entity
    entityQuantities := make(map[string]int)

    for resultsIterator.HasNext() {
        response, err := resultsIterator.Next()
        if err != nil {
            return nil, fmt.Errorf("failed to iterate over query results: %v", err)
        }

        var movement ProductMovement
        err = json.Unmarshal(response.Value, &movement)
        if err != nil {
            return nil, fmt.Errorf("failed to unmarshal product movement: %v", err)
        }

        // Assuming the senderID indicates outgoing and receiverID incoming quantities
        // Decrease quantity for sender
        if _, exists := entityQuantities[movement.SenderID]; exists {
            entityQuantities[movement.SenderID] -= movement.QuantityTransferred
        } else {
            entityQuantities[movement.SenderID] = -movement.QuantityTransferred
        }

        // Increase quantity for receiver
        entityQuantities[movement.ReceiverID] += movement.QuantityTransferred
    }

    return entityQuantities, nil
}

// RecordQualityTest stores a lab test report. Only accredited labs (LabOrg) may
// record results. The report is keyed by reportID and indexed by subjectID.
func (s *SmartContract) RecordQualityTest(ctx contractapi.TransactionContextInterface, reportID string, subjectID string, labID string, testedBy string, testDate string, moisture float64, protein float64, gluten float64, pesticides bool, aflatoxin bool, result string, grade string, certHash string) error {
    clientID, err := cid.New(ctx.GetStub())
    if err != nil {
        return fmt.Errorf("failed to get client identity: %v", err)
    }
    mspID, err := clientID.GetMSPID()
    if err != nil {
        return fmt.Errorf("failed to get MSP ID: %v", err)
    }
    // Only a lab organization may certify quality.
    if !strings.Contains(strings.ToLower(mspID), "lab") {
        return fmt.Errorf("unauthorized: only a Lab organization can record quality tests")
    }

    // The subject (batch or product) must exist.
    subjectJSON, err := ctx.GetStub().GetState(subjectID)
    if err != nil || subjectJSON == nil {
        return fmt.Errorf("subject %s does not exist", subjectID)
    }

    existing, err := ctx.GetStub().GetState(reportID)
    if err != nil {
        return fmt.Errorf("failed to read from world state: %v", err)
    }
    if existing != nil {
        return fmt.Errorf("quality report %s already exists", reportID)
    }

    report := QualityReport{
        DocType:         "QualityReport",
        ReportID:        reportID,
        SubjectID:       subjectID,
        LabID:           labID,
        TestedBy:        testedBy,
        TestDate:        testDate,
        MoistureContent: moisture,
        ProteinContent:  protein,
        GlutenContent:   gluten,
        Pesticides:      pesticides,
        Aflatoxin:       aflatoxin,
        Result:          result,
        Grade:           grade,
        CertificateHash: certHash,
    }

    reportJSON, err := json.Marshal(report)
    if err != nil {
        return err
    }
    return ctx.GetStub().PutState(reportID, reportJSON)
}

// QueryQualityReportsBySubject returns all quality reports for a given batch/product.
func (s *SmartContract) QueryQualityReportsBySubject(ctx contractapi.TransactionContextInterface, subjectID string) ([]*QualityReport, error) {
    queryString := fmt.Sprintf(`{"selector":{"docType":"QualityReport","subjectID":"%s"}}`, subjectID)

    resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var reports []*QualityReport
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var report QualityReport
        err = json.Unmarshal(queryResponse.Value, &report)
        if err != nil {
            return nil, err
        }

        reports = append(reports, &report)
    }

    return reports, nil
}

// ConsumerScan records a consumer QR verification and any reported issue.
type ConsumerScan struct {
    DocType   string `json:"docType"`   // "ConsumerScan"
    ScanID    string `json:"scanID"`    // transaction ID
    ProductID string `json:"productID"`
    ScanTime  string `json:"scanTime"`
    District  string `json:"district"`
    IssueFlag bool   `json:"issueFlag"`
    IssueDesc string `json:"issueDesc"`
}

// RecordConsumerScan logs a consumer scan/issue. Open to any caller (consumers
// are not org members); keyed by the transaction ID so it is unique and
// deterministic, with the time taken from the transaction timestamp.
func (s *SmartContract) RecordConsumerScan(ctx contractapi.TransactionContextInterface, productID string, district string, issueFlag bool, issueDesc string) error {
    if productID == "" {
        return fmt.Errorf("productID is required")
    }

    scanID := ctx.GetStub().GetTxID()

    ts, err := ctx.GetStub().GetTxTimestamp()
    scanTime := ""
    if err == nil && ts != nil {
        scanTime = time.Unix(ts.Seconds, int64(ts.Nanos)).UTC().Format(time.RFC3339)
    }

    scan := ConsumerScan{
        DocType:   "ConsumerScan",
        ScanID:    scanID,
        ProductID: productID,
        ScanTime:  scanTime,
        District:  district,
        IssueFlag: issueFlag,
        IssueDesc: issueDesc,
    }

    scanJSON, err := json.Marshal(scan)
    if err != nil {
        return err
    }
    return ctx.GetStub().PutState("scan_"+scanID, scanJSON)
}

// QueryConsumerScans returns all consumer scans/issues for a product.
func (s *SmartContract) QueryConsumerScans(ctx contractapi.TransactionContextInterface, productID string) ([]*ConsumerScan, error) {
    queryString := fmt.Sprintf(`{"selector":{"docType":"ConsumerScan","productID":"%s"}}`, productID)

    resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var scans []*ConsumerScan
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }
        var scan ConsumerScan
        if err := json.Unmarshal(queryResponse.Value, &scan); err != nil {
            return nil, err
        }
        scans = append(scans, &scan)
    }
    return scans, nil
}

// QueryAllQualityReports returns every quality report on the ledger.
func (s *SmartContract) QueryAllQualityReports(ctx contractapi.TransactionContextInterface) ([]*QualityReport, error) {
    queryString := `{"selector":{"docType":"QualityReport"}}`

    resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var reports []*QualityReport
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var report QualityReport
        err = json.Unmarshal(queryResponse.Value, &report)
        if err != nil {
            return nil, err
        }

        reports = append(reports, &report)
    }

    return reports, nil
}

func main() {
    smartContract := new(SmartContract)  // create a new instance of SmartContract

    cc, err := contractapi.NewChaincode(smartContract)
    if err != nil {
        // error handling
        panic(err.Error())
    }

    if err := cc.Start(); err != nil {
        // error handling
        panic(err.Error())
    }
}
