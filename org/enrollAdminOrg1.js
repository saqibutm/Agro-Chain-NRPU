'use strict'

const FabricCAServices = require('fabric-ca-client')
const { Wallets } = require('fabric-network')
const fs = require('fs')
const path = require('path')

// ── Configuration via environment variables (see org/.env.example) ──
// Never hardcode credentials. Load .env if dotenv is available.
try { require('dotenv').config() } catch (_) { /* dotenv optional */ }

const CONNECTION_PROFILE = process.env.CONNECTION_PROFILE || 'connection-org1.json'
const CA_NAME = process.env.CA_NAME || 'ca.farmerorg1.supplychain.com'
const ORG_MSP_ID = process.env.ORG_MSP_ID || 'FarmerOrg1MSP'
const WALLET_PATH = process.env.WALLET_PATH || path.join(process.cwd(), 'walletOrg1')
const ADMIN_ID = process.env.CA_ADMIN_ID || 'admin'
const ADMIN_SECRET = process.env.CA_ADMIN_SECRET

async function main() {
    try {
        if (!ADMIN_SECRET) {
            console.error('ERROR: CA_ADMIN_SECRET is not set. Configure it in org/.env (see org/.env.example).')
            process.exit(1)
        }

        // Load the network connection profile.
        const ccpPath = path.resolve(__dirname, CONNECTION_PROFILE)
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf-8'))

        // Create a CA client.
        const caInfo = ccp.certificateAuthorities[CA_NAME]
        const caTLSCACerts = caInfo.tlsCACerts.pem
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)

        // File-system wallet.
        const wallet = await Wallets.newFileSystemWallet(WALLET_PATH)
        console.log(`Wallet path: ${WALLET_PATH}`)

        if (await wallet.get(ADMIN_ID)) {
            console.log(`An identity for the admin user "${ADMIN_ID}" already exists in the wallet`)
            return
        }

        // Enroll the admin and import the identity.
        const enrollment = await ca.enroll({ enrollmentID: ADMIN_ID, enrollmentSecret: ADMIN_SECRET })
        await wallet.put(ADMIN_ID, {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: ORG_MSP_ID,
            type: 'X.509',
        })
        console.log(`Successfully enrolled admin user "${ADMIN_ID}" and imported it into the wallet`)
    } catch (error) {
        console.error(`Failed to enroll admin user: ${error}`)
        process.exit(1)
    }
}

main()
