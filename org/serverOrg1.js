'use strict'

const { registerEnroll } = require('./registerEnrollClientUserOrg1')
const express = require('express')
const bodyParser = require('body-parser')
const { Gateway, Wallets } = require('fabric-network')
const FabricCAServices = require('fabric-ca-client')
const path = require('path')
const fs = require('fs')

// ── Configuration via environment variables (see org/.env.example) ──
try { require('dotenv').config() } catch (_) { /* dotenv optional */ }

const CONFIG = {
    PORT: process.env.PORT || 8081,
    HOST: process.env.HOST || 'localhost',
    CONNECTION_PROFILE: process.env.CONNECTION_PROFILE || 'connection-org1.json',
    CA_NAME: process.env.CA_NAME || 'ca.farmerorg1.supplychain.com',
    ORG_MSP_ID: process.env.ORG_MSP_ID || 'FarmerOrg1MSP',
    WALLET_PATH: process.env.WALLET_PATH || path.join(process.cwd(), 'walletOrg1'),
    CHANNEL: process.env.CHANNEL_NAME || 'supplychain-channel',
    CHAINCODE: process.env.CHAINCODE_NAME || 'supplychain',
}

const app = express()
app.use(bodyParser.json())

// Authenticate a user against the Fabric CA by enrolling with their
// enrollmentID (username) + enrollmentSecret (password). A successful enroll
// proves the credentials are valid; the resulting X.509 identity is cached in
// the wallet for subsequent transactions.
app.post('/api/login', async function (req, res) {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' })
        }

        const ccpPath = path.resolve(__dirname, CONFIG.CONNECTION_PROFILE)
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf-8'))
        const caInfo = ccp.certificateAuthorities[CONFIG.CA_NAME]
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caInfo.tlsCACerts.pem, verify: false }, caInfo.caName)

        const wallet = await Wallets.newFileSystemWallet(CONFIG.WALLET_PATH)

        // Verify credentials against the CA.
        const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: password })

        // Cache/refresh the identity in the wallet.
        await wallet.put(username, {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: CONFIG.ORG_MSP_ID,
            type: 'X.509',
        })

        return res.status(200).json({ success: true, username })
    } catch (error) {
        console.error(`Login failed: ${error}`)
        return res.status(401).json({ success: false, message: 'Invalid username or password' })
    }
})

app.get('/', async function (req, res) {
    res.status(200).json({ response: "Test Pass!..."})
})

app.post('/api/registerenrolluserorg1/', async function (req, res) {

    try {
        let err = await registerEnroll(req.body.username)
        if (err) {
            throw new Error(err)
        }

        res.status(201).json({ 
                status : "pass",
                message : `Successfully registered and enrolled user ${req.body.username.toUpperCase()} and imported it into the wallet`
            })
    } catch (error) {
        res.status(501).json({
        status : "fail",
        message : error.message
    })
    }
})

async function connectToNetwork(username) {
  const ccpPath = path.resolve(__dirname, CONFIG.CONNECTION_PROFILE);
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf-8'));

  const wallet = await Wallets.newFileSystemWallet(CONFIG.WALLET_PATH);
  console.log(`Wallet path: ${CONFIG.WALLET_PATH}`);

  const identity = await wallet.get(username);
  if (!identity) {
    console.error(`An identity for the user ${username} does not exist in the wallet`);
    throw new Error(`An identity for the user ${username} does not exist in the wallet`);
  }

  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: username,
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork(CONFIG.CHANNEL);
  const contract = network.getContract(CONFIG.CHAINCODE);
  return { gateway, contract };
}

app.post('/api/createWheatBatch', async (req, res) => {
  try {
    const { username, entityID, wheatBatchID, variety, quantity, harvestDate, qrCode, latitude, longitude } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const { gateway, contract } = await connectToNetwork(username);

    await contract.submitTransaction(
      'CreateWheatBatch',
      entityID, wheatBatchID, variety, quantity.toString(), harvestDate, qrCode,
      (latitude ?? 0).toString(), (longitude ?? 0).toString()
    );

    console.log('Wheat batch has been created successfully');

    res.json({ success: true, message: 'Wheat batch created successfully.' });

    gateway.disconnect();
  } catch (error) {
    console.error(`Failed to create wheat batch: ${error}`);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

app.get('/api/queryWheatBatch', async (req, res) => {
  try {
    const { username, wheatBatchID } = req.query;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    if (!wheatBatchID) {
      return res.status(400).json({ success: false, message: "WheatBatchID is required" });
    }

    const { gateway, contract } = await connectToNetwork(username);

    const wheatBatchResult = await contract.evaluateTransaction('QueryWheatBatch', wheatBatchID);
    const wheatBatch = JSON.parse(wheatBatchResult.toString());

    res.json({ success: true, message: 'Wheat batch queried successfully.', wheatBatch });

    gateway.disconnect();
  } catch (error) {
    console.error(`Failed to query wheat batch: ${error}`);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

app.post('/api/sendWheatBatch', async (req, res) => {
    try {
        const { username, wheatBatchID, senderEntityID, newHolderID, latitude, longitude } = req.body;

        // Assuming you have a function `connectToNetwork` that sets up the connection and returns the contract
        const { gateway, contract } = await connectToNetwork(username);

        // Submit the transaction to the ledger
        await contract.submitTransaction(
            'SendWheatBatch',
            wheatBatchID, senderEntityID, newHolderID,
            (latitude ?? 0).toString(), (longitude ?? 0).toString()
        );

        // Disconnect from the gateway
        gateway.disconnect();

        // Respond to the client
        res.json({ success: true, message: `Wheat batch ${wheatBatchID} transferred from ${senderEntityID} to ${newHolderID}` });
    } catch (error) {
        console.error(`Failed to send wheat batch: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});


app.get('/api/queryAllWheatBatches', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const { gateway, contract } = await connectToNetwork(username);
    const result = await contract.evaluateTransaction('QueryAllWheatBatches');
    const batches = JSON.parse(result.toString() || '[]');

    res.json({ success: true, batches });
    gateway.disconnect();
  } catch (error) {
    console.error(`Failed to query wheat batches: ${error}`);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

app.get('/api/queryAllProducts', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const { gateway, contract } = await connectToNetwork(username);
    const result = await contract.evaluateTransaction('QueryAllProducts');
    const products = JSON.parse(result.toString() || '[]');

    res.json({ success: true, products });
    gateway.disconnect();
  } catch (error) {
    console.error(`Failed to query products: ${error}`);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

app.post('/api/recordQualityTest', async (req, res) => {
  try {
    const {
      username, reportID, subjectID, labID, testedBy, testDate,
      moisture, protein, gluten, pesticides, aflatoxin, result, grade, certHash
    } = req.body;

    if (!username || !reportID || !subjectID) {
      return res.status(400).json({ success: false, message: "username, reportID and subjectID are required" });
    }

    const { gateway, contract } = await connectToNetwork(username);
    await contract.submitTransaction(
      'RecordQualityTest',
      reportID, subjectID, labID || '', testedBy || '', testDate || '',
      (moisture ?? 0).toString(), (protein ?? 0).toString(), (gluten ?? 0).toString(),
      (pesticides ? 'true' : 'false'), (aflatoxin ? 'true' : 'false'),
      result || 'Pass', grade || '', certHash || ''
    );

    res.json({ success: true, message: 'Quality report recorded.' });
    gateway.disconnect();
  } catch (error) {
    console.error(`Failed to record quality test: ${error}`);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

app.get('/api/queryQualityReports', async (req, res) => {
  try {
    const { username, subjectID } = req.query;
    if (!username || !subjectID) {
      return res.status(400).json({ success: false, message: "username and subjectID are required" });
    }

    const { gateway, contract } = await connectToNetwork(username);
    const result = await contract.evaluateTransaction('QueryQualityReportsBySubject', subjectID);
    const reports = JSON.parse(result.toString() || '[]');

    res.json({ success: true, reports });
    gateway.disconnect();
  } catch (error) {
    console.error(`Failed to query quality reports: ${error}`);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

app.post('/api/reportConsumerIssue', async (req, res) => {
  try {
    const { username, productID, district, issueFlag, issueDesc } = req.body;
    if (!username || !productID) {
      return res.status(400).json({ success: false, message: "username and productID are required" });
    }

    const { gateway, contract } = await connectToNetwork(username);
    await contract.submitTransaction(
      'RecordConsumerScan',
      productID, district || '', (issueFlag ? 'true' : 'false'), issueDesc || ''
    );

    res.json({ success: true, message: 'Consumer scan recorded.' });
    gateway.disconnect();
  } catch (error) {
    console.error(`Failed to record consumer scan: ${error}`);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

app.get('/api/queryAllQualityReports', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const { gateway, contract } = await connectToNetwork(username);
    const result = await contract.evaluateTransaction('QueryAllQualityReports');
    const reports = JSON.parse(result.toString() || '[]');

    res.json({ success: true, reports });
    gateway.disconnect();
  } catch (error) {
    console.error(`Failed to query all quality reports: ${error}`);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

app.get('/api/queryProduct', async (req, res) => {
  try {
    const { username, productID } = req.query;
    if (!username || !productID) {
      return res.status(400).json({ success: false, message: "username and productID are required" });
    }

    const { gateway, contract } = await connectToNetwork(username);
    const result = await contract.evaluateTransaction('QueryProduct', productID);
    const product = JSON.parse(result.toString());

    res.json({ success: true, product });
    gateway.disconnect();
  } catch (error) {
    console.error(`Failed to query product: ${error}`);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

app.get('/api/queryProductMovements', async (req, res) => {
  try {
    const { username, productID } = req.query;
    if (!username || !productID) {
      return res.status(400).json({ success: false, message: "username and productID are required" });
    }

    const { gateway, contract } = await connectToNetwork(username);
    const result = await contract.evaluateTransaction('QueryProductMovements', productID);
    const movements = JSON.parse(result.toString() || '[]');

    res.json({ success: true, movements });
    gateway.disconnect();
  } catch (error) {
    console.error(`Failed to query product movements: ${error}`);
    res.status(500).json({ success: false, message: error.toString() });
  }
});

app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log(`AgroChain gateway listening on http://${CONFIG.HOST}:${CONFIG.PORT}`)
})
