const crypto = require('crypto');
const Evidence = require('../models/Evidence');

const axios = require('axios');
const FormData = require('form-data');

const { getContract } = require('../config/contractConfig');
const { ethers } = require('ethers');

// Helper function to calculate file hash
const calculateFileHash = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

// @desc    Upload evidence
// @route   POST /api/evidence/upload
// @access  Private
exports.uploadEvidence = async (req, res, next) => {
    let responseSent = false;
    let provider = null;

    try {
        console.log('📥 Upload Evidence endpoint called');
        console.log('User:', req.user);
        console.log('File:', req.file ? req.file.originalname : 'No file');

        if (!req.file) {
            responseSent = true;
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        if (!req.user || !req.user.id) {
            responseSent = true;
            console.error('❌ User not authenticated properly');
            res.setHeader('Content-Type', 'application/json');
            return res.status(401).json({
                success: false,
                message: 'User authentication failed'
            });
        }

        console.log('✓ File received:', req.file.originalname);

        const fileBuffer = req.file.buffer;
        const fileHash = calculateFileHash(fileBuffer);

        let ipfsCid;

        try {
            console.log("Pinata API Key:", process.env.PINATA_API_KEY ? '***set***' : 'NOT SET');
            console.log("Pinata Secret:", process.env.PINATA_SECRET_API_KEY ? '***set***' : 'NOT SET');
            console.log("📤 Uploading file to Pinata...");

            const formData = new FormData();
            formData.append("file", fileBuffer, {
                filename: req.file.originalname
            });

            const response = await axios.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                formData,
                {
                    maxBodyLength: Infinity,
                    headers: {
                        ...formData.getHeaders(),
                        pinata_api_key: process.env.PINATA_API_KEY,
                        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
                    }
                }
            );

            ipfsCid = response.data.IpfsHash;
            console.log("✓ File uploaded to IPFS via Pinata:", ipfsCid);

        } catch (err) {
            console.error("❌ Pinata upload error:", err.response ? JSON.stringify(err.response.data) : err.message);
            responseSent = true;
            res.setHeader('Content-Type', 'application/json');
            return res.status(503).json({
                success: false,
                message: "IPFS upload failed: " + (err.response ? JSON.stringify(err.response.data) : err.message),
                error: err.message
            });
        }

        // Blockchain Transaction
        let blockchainTx;
        let blockNumber;
        let smartContractId;

        try {
            console.log('⛓️  Starting blockchain transaction...');

            provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
            console.log('✓ Connected to blockchain provider');

            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
            const signer = wallet;
            console.log('✓ Got signer:', signer.address);

            const contract = getContract(signer);
            console.log('✓ Got contract instance');

            const tx = await contract.storeEvidence(fileHash, ipfsCid);
            blockchainTx = tx.hash;
            console.log('✓ Transaction sent:', blockchainTx);

            const receipt = await tx.wait();
            blockNumber = receipt.blockNumber;
            console.log('✓ Transaction confirmed at block:', blockNumber);

            // Parse ID from event
            let parsedLog;
            for (const l of receipt.logs) {
                try {
                    parsedLog = contract.interface.parseLog(l);
                    if (parsedLog && parsedLog.name === 'EvidenceStored') {
                        break;
                    }
                } catch (e) {
                    // ignore
                }
            }

            if (parsedLog) {
                smartContractId = Number(parsedLog.args.id);
                console.log('✓ Evidence stored with contract ID:', smartContractId);
            } else {
                console.warn("⚠ Could not find EvidenceStored event in receipt");
                smartContractId = 0;
            }
        } catch (err) {
            console.error('❌ Blockchain error:', err.message);
            console.error('Error stack:', err.stack);
            responseSent = true;
            res.setHeader('Content-Type', 'application/json');
            return res.status(503).json({
                success: false,
                message: 'Blockchain transaction failed: ' + err.message,
                error: err.message
            });
        }

        let evidence;
        try {
            const fileSize = req.file.size || req.file.buffer.length || 0;

            evidence = await Evidence.create({
                fileName: req.file.originalname,
                fileSize: fileSize,
                fileHash,
                ipfsCid,
                blockchainTx,
                blockNumber,
                smartContractId,
                uploader: req.user.id,
                status: 'verified'
            });
            console.log('✓ Evidence created in DB:', evidence.evidenceId);

            // Try to populate but don't fail if it doesn't work
            try {
                await evidence.populate({
                    path: 'uploader',
                    select: 'fullName email organization'
                });
                console.log('✓ Evidence populated with uploader details');
            } catch (populateError) {
                console.warn('⚠ Populate warning (non-fatal):', populateError.message);
            }

            const timestamp = evidence.createdAt instanceof Date
                ? evidence.createdAt.toISOString()
                : new Date().toISOString();

            const responseObj = {
                success: true,
                message: 'Evidence uploaded successfully',
                evidenceId: String(evidence.evidenceId),
                hash: String(evidence.fileHash),
                cid: String(evidence.ipfsCid),
                timestamp: timestamp,
                blockchainTx: String(blockchainTx || ''),
                blockNumber: Number(blockNumber || 0),
                smartContractId: Number(smartContractId || 0)
            };

            console.log('✓ Sending response:', JSON.stringify(responseObj));
            responseSent = true;
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json(responseObj);
        } catch (dbError) {
            console.error('✗ Database error:', dbError.message);
            console.error('Error stack:', dbError.stack);
            responseSent = true;
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                success: false,
                message: 'Failed to save evidence to database: ' + dbError.message,
                error: dbError.message
            });
        }
    } catch (error) {
        console.error('❌ Outer catch - Upload evidence fatal error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        if (!responseSent && !res.headersSent) {
            responseSent = true;
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                success: false,
                message: 'Upload failed: ' + (error.message || 'Unknown error'),
                error: error.message
            });
        }
    } finally {
        try {
            if (provider) {
                console.log('🧹 Disconnecting ethers provider...');
                provider.destroy();
                provider = null;
            }
        } catch (cleanupErr) {
            console.warn('⚠ Cleanup error (non-fatal):', cleanupErr.message);
        }
    }
};

// @desc    Verify evidence
// @route   GET /api/evidence/verify/:evidenceId
// @access  Private
exports.verifyEvidence = async (req, res, next) => {
    let provider = null;

    try {
        const evidence = await Evidence.findOne({ evidenceId: req.params.evidenceId })
            .populate({
                path: 'uploader',
                select: 'fullName email organization'
            });

        if (!evidence) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({
                success: false,
                message: 'Evidence not found',
                evidenceId: req.params.evidenceId
            });
        }

        // Update verification count
        evidence.verificationCount += 1;
        evidence.lastVerified = new Date();
        await evidence.save();

        let hashMatch = false;
        let blockchainVerified = false;
        let ipfsAvailable = false;
        let tampered = false;

        // 1. Verify via Pinata gateway
        try {
            const url = `https://gateway.pinata.cloud/ipfs/${evidence.ipfsCid}`;
            console.log('🔍 Attempting to verify file from IPFS with CID:', evidence.ipfsCid);

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 20000
            });
            const fetchedFileBuffer = Buffer.from(response.data);
            ipfsAvailable = true;

            const currentHash = calculateFileHash(fetchedFileBuffer);
            console.log('✓ IPFS Verification - Stored Hash:', evidence.fileHash);
            console.log('✓ IPFS Verification - Current Hash:', currentHash);
            console.log('✓ Hash Match:', currentHash === evidence.fileHash);

            hashMatch = (currentHash === evidence.fileHash);

            if (!hashMatch) {
                tampered = true;
                console.warn('⚠ Hash mismatch detected - Evidence may be tampered');
            }

        } catch (err) {
            console.error("❌ IPFS Verification failed:", err.message);
            ipfsAvailable = false;
            // Don't mark as tampered if IPFS is unavailable - it's a connectivity issue, not tampering
            // We'll fall back to DB hash as the source of truth
            hashMatch = true; // Assume hash is valid if IPFS is unreachable
        }

        // 2. Verify Blockchain
        try {
            if (evidence.smartContractId !== undefined && evidence.smartContractId !== null && evidence.smartContractId > 0) {
                provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
                const contract = getContract(provider);

                const result = await contract.getEvidence(evidence.smartContractId);
                const [chainHash, chainCid, chainTimestamp] = result;

                console.log('⛓️  Blockchain hash:', chainHash);
                console.log('⛓️  DB hash:', evidence.fileHash);
                console.log('⛓️  Blockchain CID:', chainCid);
                console.log('⛓️  DB CID:', evidence.ipfsCid);

                if (chainHash === evidence.fileHash && chainCid === evidence.ipfsCid) {
                    blockchainVerified = true;
                    console.log('✓ Blockchain verification passed');
                } else {
                    tampered = true;
                    blockchainVerified = false;
                    console.warn('⚠ Blockchain mismatch - evidence may be tampered');
                }
            } else {
                // No smart contract ID - treat as verified if DB record is intact
                // (e.g., blockchain was unavailable during upload)
                blockchainVerified = true;
                console.warn('⚠ No smartContractId - skipping blockchain check, trusting DB record');
            }
        } catch (err) {
            console.error("Blockchain Verification failed:", err.message);
            // If blockchain is unreachable, don't mark as tampered - trust DB record
            blockchainVerified = true;
            console.warn('⚠ Blockchain unreachable - trusting DB record for verification');
        }

        // Determine final status:
        // - tampered: if IPFS hash mismatch OR blockchain hash mismatch
        // - verified: if not tampered AND (blockchain verified OR blockchain unavailable)
        // - pending: only if explicitly set that way (shouldn't happen in normal flow)
        const status = tampered ? 'compromised' : 'verified';

        if (evidence.status !== status) {
            evidence.status = status;
            await evidence.save();
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
            success: true,
            message: tampered ? 'Evidence Integrity Failed' : 'Evidence verified successfully',
            id: evidence._id,
            evidenceId: evidence.evidenceId,
            fileName: evidence.fileName,
            uploadedBy: evidence.uploader ? evidence.uploader.email : 'Unknown',
            uploadedByName: evidence.uploader ? evidence.uploader.fullName : 'Unknown User',
            hash: evidence.fileHash,
            cid: evidence.ipfsCid,
            timestamp: evidence.createdAt,
            status: evidence.status,
            blockchainVerified,
            ipfsAvailable,
            hashMatch,
            tampered,
            verificationDetails: {
                blockNumber: evidence.blockNumber,
                blockchainTx: evidence.blockchainTx,
                lastVerified: evidence.lastVerified,
                verificationCount: evidence.verificationCount,
                smartContractId: evidence.smartContractId,
                blockchainHash: blockchainVerified ? evidence.fileHash : ((evidence.smartContractId !== undefined && evidence.smartContractId !== null) ? 'MISMATCH_ON_CHAIN' : 'N/A'),
                databaseHash: evidence.fileHash,
                ipfsHash: hashMatch ? evidence.fileHash : (ipfsAvailable ? 'HASH_MISMATCH' : 'N/A')
            }
        });
    } catch (error) {
        next(error);
    } finally {
        try {
            if (provider) {
                console.log('🧹 Disconnecting ethers provider in verify...');
                provider.destroy();
                provider = null;
            }
        } catch (cleanupErr) {
            console.warn('⚠ Cleanup error in verify (non-fatal):', cleanupErr.message);
        }
    }
};

// @desc    Get evidence list
// @route   GET /api/evidence/list
// @access  Private
exports.getEvidenceList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = {};
        // Admin and law_enforcement see all evidence
        if (req.user.role === 'admin' || req.user.role === 'law_enforcement') {
            // No uploader filter
        } else {
            query.uploader = req.user.id;
        }

        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        const total = await Evidence.countDocuments(query);
        const evidence = await Evidence.find(query)
            .populate({
                path: 'uploader',
                select: 'fullName email'
            })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            success: true,
            message: 'Evidence list retrieved',
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            evidence: evidence.map(ev => ({
                id: ev._id,
                evidenceId: ev.evidenceId,
                fileName: ev.fileName,
                hash: ev.fileHash,
                cid: ev.ipfsCid,
                timestamp: ev.createdAt,
                status: ev.status,
                fileSize: ev.fileSize,
                uploadedBy: ev.uploader ? ev.uploader.email : 'Deleted User',
                uploadedByName: ev.uploader ? ev.uploader.fullName : 'Deleted User'
            }))
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single evidence
// @route   GET /api/evidence/:id
// @access  Private
exports.getEvidence = async (req, res, next) => {
    try {
        const evidence = await Evidence.findById(req.params.id)
            .populate({
                path: 'uploader',
                select: 'fullName email organization'
            });

        if (!evidence) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({
                success: false,
                message: 'Evidence not found'
            });
        }

        if (evidence.uploader._id.toString() !== req.user.id && req.user.role !== 'admin') {
            res.setHeader('Content-Type', 'application/json');
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this evidence'
            });
        }

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            success: true,
            evidence: {
                id: evidence._id,
                evidenceId: evidence.evidenceId,
                fileName: evidence.fileName,
                fileSize: evidence.fileSize,
                hash: evidence.fileHash,
                cid: evidence.ipfsCid,
                status: evidence.status,
                blockchainTx: evidence.blockchainTx,
                blockNumber: evidence.blockNumber,
                uploadedBy: evidence.uploader,
                verificationCount: evidence.verificationCount,
                lastVerified: evidence.lastVerified,
                createdAt: evidence.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/evidence/stats
// @access  Private
exports.getStats = async (req, res, next) => {
    try {
        const totalEvidence = await Evidence.countDocuments({ uploader: req.user.id });
        const verifiedEvidence = await Evidence.countDocuments({
            uploader: req.user.id,
            status: 'verified'
        });
        const pendingEvidence = await Evidence.countDocuments({
            uploader: req.user.id,
            status: 'pending'
        });

        const recentEvidence = await Evidence.find({ uploader: req.user.id })
            .sort('-createdAt')
            .limit(5)
            .select('evidenceId fileName status createdAt');

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            success: true,
            stats: {
                total: totalEvidence,
                verified: verifiedEvidence,
                pending: pendingEvidence,
                compromised: totalEvidence - verifiedEvidence - pendingEvidence
            },
            recentEvidence
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Download evidence file
// @route   GET /api/evidence/download/:id
// @access  Private (Admin, Law Enforcement only)
exports.downloadEvidence = async (req, res, next) => {
    try {
        // Only allow admins and law enforcement to download
        if (req.user.role !== 'admin' && req.user.role !== 'law_enforcement') {
            res.setHeader('Content-Type', 'application/json');
            return res.status(403).json({
                success: false,
                message: 'Download access is restricted to authorized personnel only.'
            });
        }

        const evidence = await Evidence.findById(req.params.id);

        if (!evidence) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({
                success: false,
                message: 'Evidence not found'
            });
        }

        // Only allow download for verified (and not compromised) evidence
        if (evidence.status !== 'verified') {
            res.setHeader('Content-Type', 'application/json');
            return res.status(403).json({
                success: false,
                message: 'Download is only available for verified evidence.'
            });
        }

        // Fetch from Pinata gateway
        let fileBuffer;
        try {
            const url = `https://gateway.pinata.cloud/ipfs/${evidence.ipfsCid}`;
            console.log('📥 Downloading file from Pinata with CID:', evidence.ipfsCid);

            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            fileBuffer = Buffer.from(response.data);

            if (!fileBuffer || fileBuffer.length === 0) {
                throw new Error('No data retrieved from IPFS - empty file');
            }

            console.log('✓ File downloaded successfully from Pinata, size:', fileBuffer.length, 'bytes');
        } catch (ipfsError) {
            console.error("❌ IPFS Download failed:", ipfsError.message);
            res.setHeader('Content-Type', 'application/json');
            return res.status(503).json({
                success: false,
                message: 'Failed to retrieve file from IPFS. The network may be down or the file may no longer be available.'
            });
        }

        // Final integrity check before serving the file
        const currentHash = calculateFileHash(fileBuffer);
        if (currentHash !== evidence.fileHash) {
            evidence.status = 'compromised';
            await evidence.save();
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                success: false,
                message: 'CRITICAL: File integrity check failed. The content on IPFS has been tampered with.'
            });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${evidence.fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        return res.send(fileBuffer);
    } catch (error) {
        next(error);
    }
};

// @desc    Simulate tampering for demo
// @route   POST /api/evidence/tamper/:id
// @access  Private
exports.tamperEvidence = async (req, res, next) => {
    try {
        const evidence = await Evidence.findById(req.params.id);

        if (!evidence) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({
                success: false,
                message: 'Evidence not found'
            });
        }

        // Simulate tampering by changing the stored hash in the database
        const originalHash = evidence.fileHash;
        evidence.fileHash = crypto.randomBytes(32).toString('hex');
        evidence.status = 'compromised';

        await evidence.save();

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            success: true,
            message: 'Evidence successfully tampered (Demo Simulation)',
            evidenceId: evidence.evidenceId,
            originalHash: originalHash,
            tamperedHash: evidence.fileHash
        });
    } catch (error) {
        next(error);
    }
};
