const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Configuration
const BASE_URL = 'http://localhost:5002`${process.env.NEXT_PUBLIC_API_URL}/api';

// Colors for console
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);

// Helper to fetch
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
// Helper for FormData
const FormData = require('form-data');

async function test() {
    log("=== Starting End-to-End Test ===", colors.blue);

    // 1. Register Investigator
    log("\n1. Registering Investigator...", colors.yellow);
    const investigatorEmail = `inv_${Date.now()}@test.com`;
    const resReg = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: 'Sherlock Holmes',
            email: investigatorEmail,
            password: 'password123',
            confirmPassword: 'password123',
            organization: 'Scotland Yard',
            role: 'investigator'
        })
    });

    let dataReg;
    try {
        const text = await resReg.text();
        try {
            dataReg = JSON.parse(text);
        } catch (e) {
            log(`Registration JSON Parse Error. Status: ${resReg.status}. Body: ${text}`, colors.red);
            return;
        }
    } catch (e) {
        log(`Registration Response Error: ${e.message}`, colors.red);
        return;
    }

    if (!dataReg.success) {
        log(`Registration failed: ${dataReg.message}`, colors.red);
        return;
    }
    const token = dataReg.token;
    log(`Investigator registered. Token received.`, colors.green);

    // 2. Upload Evidence
    log("\n2. Uploading Evidence...", colors.yellow);
    // Create a dummy file
    const filePath = path.join(__dirname, 'test-evidence.txt');
    fs.writeFileSync(filePath, 'This is a piece of evidence. suspect: Moriarty.');

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const resUpload = await fetch(`${BASE_URL}/evidence/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            ...form.getHeaders()
        },
        body: form
    });

    // Clean up file
    fs.unlinkSync(filePath);

    const dataUpload = await resUpload.json();
    if (!dataUpload.success) {
        if (resUpload.status === 503) {
            log(`Upload failed (likely IPFS/Blockchain down): ${dataUpload.message}`, colors.red);
        } else {
            log(`Upload failed: ${dataUpload.message}`, colors.red);
        }
        return;
    }
    log(`Evidence uploaded! ID: ${dataUpload.evidenceId}`, colors.green);
    log(`CID: ${dataUpload.cid}`, colors.green);
    log(`Tx: ${dataUpload.blockchainTx}`, colors.green);
    log(`SC ID: ${dataUpload.smartContractId}`, colors.green);

    const evidenceId = dataUpload.evidenceId;

    // 3. Verify Evidence (Should be Valid)
    log(`\n3. Verifying Evidence ${evidenceId}...`, colors.yellow);
    const resVerify = await fetch(`${BASE_URL}/evidence/verify/${evidenceId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataVerify = await resVerify.json();
    if (!dataVerify.success) {
        log(`Verification failed request: ${dataVerify.message}`, colors.red);
        return;
    }

    if (dataVerify.hashMatch && dataVerify.blockchainVerified && !dataVerify.tampered) {
        log(`Verification Successful! Status: ${dataVerify.status}`, colors.green);
    } else {
        log(`Verification Issue: HashMatch=${dataVerify.hashMatch}, ChainVerified=${dataVerify.blockchainVerified}, Tampered=${dataVerify.tampered}`, colors.red);
    }

    // 4. Register Unauthorized User
    log("\n4. Registering Civilian (Unauthorized)...", colors.yellow);
    const civilianEmail = `civ_${Date.now()}@test.com`;
    const resCiv = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName: 'John Doe',
            email: civilianEmail,
            password: 'password123',
            confirmPassword: 'password123',
            organization: 'Public',
            role: 'public' // Invalid role for upload
        })
    });
    const dataCiv = await resCiv.json();
    const civToken = dataCiv.token;
    log(`Civilian registered.`, colors.green);

    // 5. Try Upload as Civilian
    log("\n5. Attempting Upload as Civilian...", colors.yellow);
    const form2 = new FormData();
    form2.append('file', Buffer.from('Unauthorized evidence'), 'bad.txt');

    const resFail = await fetch(`${BASE_URL}/evidence/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${civToken}`,
            ...form2.getHeaders()
        },
        body: form2
    });

    if (resFail.status === 403) {
        log("Upload blocked as expected (403).", colors.green);
    } else {
        log(`Unexpected status: ${resFail.status}`, colors.red);
    }

    log("\n=== Test Complete ===", colors.blue);
}

test().catch(console.error);
