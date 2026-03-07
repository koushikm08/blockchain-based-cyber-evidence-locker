const crypto = require('crypto');
const Evidence = require('../models/Evidence');

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
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const fileBuffer = req.file.buffer;
        const fileHash = calculateFileHash(fileBuffer);

        // IPFS Upload
        let ipfsCid;
        try {
            const { create } = await import('ipfs-http-client');
            // Default to local node. In production, use env var.
            const ipfs = create({ url: process.env.IPFS_URL || 'http://127.0.0.1:5001' });
            const result = await ipfs.add(fileBuffer);
            ipfsCid = result.cid.toString();
        } catch (err) {
            console.error('IPFS upload failed:', err);
            // Fallback for demo/testing if IPFS is down, or return error
            // For now, return error to enforce "Active Usage" requirement
            return res.status(503).json({
                success: false,
                message: 'IPFS upload failed. Ensure IPFS daemon is running.'
            });
        }

        // Blockchain Transaction
        let blockchainTx;
        let blockNumber;
        let smartContractId;

        try {
            // Using a hardcoded private key from Ganache (account 0) for demo purposes
            // In production, use a secure signer management or User's wallet via Frontend (MetaMask)
            // But since this is a backend API, the Backend acts as the "Oracle" or "Service Account".
            // We'll use the first account from Ganache or a known key.
            // For simplicity, we'll try to use the provider's signer (if node has unlocked accounts).
            // Hardhat/Ganache node usually has unlocked accounts.
            const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const signer = await provider.getSigner(); // Gets the first account
            const contract = getContract(signer);

            const tx = await contract.storeEvidence(fileHash, ipfsCid);
            const receipt = await tx.wait();

            blockchainTx = receipt.hash;
            blockNumber = receipt.blockNumber;

            // Parse ID from event
            // Filter logs for EvidenceStored event
            // We need the interface to parse logs
            // The ABI is in the contract instance
            const eventTopic = contract.interface.getEvent('EvidenceStored');
            // Find the log that matches the topic
            const log = receipt.logs.find(l => l.fragment && l.fragment.name === 'EvidenceStored');

            // If ethers.js didn't parse it automatically (it does if ABI is correct):
            // Iterate logs and try parse
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
                smartContractId = Number(parsedLog.args.id); // Convert BigInt to Number (safe for small counts)
            } else {
                console.warn("Could not find EvidenceStored event in receipt");
                // fallback if event missing (should not happen with new contract)
                smartContractId = 0;
            }

        } catch (err) {
            console.error('Blockchain transaction failed:', err);
            return res.status(503).json({
                success: false,
                message: 'Blockchain transaction failed. Ensure local node is running.',
                error: err.message
            });
        }

        const evidence = await Evidence.create({
            fileName: req.file.originalname,
            fileSize: req.file.size,
            fileHash,
            ipfsCid,
            blockchainTx,
            blockNumber,
            smartContractId,
            uploader: req.user.id,
            status: 'verified'
        });

        await evidence.populate('uploader', 'fullName email organization');

        res.status(200).json({
            success: true,
            message: 'Evidence uploaded successfully',
            evidenceId: evidence.evidenceId,
            hash: evidence.fileHash,
            cid: evidence.ipfsCid,
            timestamp: evidence.createdAt,
            blockchainTx: evidence.blockchainTx,
            blockNumber: evidence.blockNumber,
            smartContractId: evidence.smartContractId
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify evidence
// @route   GET /api/evidence/verify/:evidenceId
// @access  Private
exports.verifyEvidence = async (req, res, next) => {
    try {
        const evidence = await Evidence.findOne({ evidenceId: req.params.evidenceId })
            .populate('uploader', 'fullName email organization');

        if (!evidence) {
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

        // 1. Verify IPFS and Hash
        let fetchedFileBuffer;
        try {
            const { create } = await import('ipfs-http-client');
            const ipfs = create({ url: process.env.IPFS_URL || 'http://127.0.0.1:5001' });

            // Cat file from IPFS
            // ipfs.cat returns an AsyncIterable
            const chunks = [];
            for await (const chunk of ipfs.cat(evidence.ipfsCid)) {
                chunks.push(chunk);
            }
            fetchedFileBuffer = Buffer.concat(chunks);
            ipfsAvailable = true;

            const currentHash = calculateFileHash(fetchedFileBuffer);
            hashMatch = (currentHash === evidence.fileHash);

            if (!hashMatch) {
                tampered = true;
            }

        } catch (err) {
            console.error("IPFS Verification failed:", err);
            ipfsAvailable = false;
        }

        // 2. Verify Blockchain
        try {
            if (evidence.smartContractId) {
                const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
                const contract = getContract(provider); // Read-only provider is enough

                // getEvidence(id) returns (hash, cid, timestamp)
                const result = await contract.getEvidence(evidence.smartContractId);
                const [chainHash, chainCid, chainTimestamp] = result;

                // Compare values
                if (chainHash === evidence.fileHash && chainCid === evidence.ipfsCid) {
                    blockchainVerified = true;
                } else {
                    tampered = true;
                    blockchainVerified = false; // Mismatch implies tampering
                }
            }
        } catch (err) {
            console.error("Blockchain Verification failed:", err);
            // If contract call fails, we assume unverified status for blockchain, but not necessarily tampered
        }

        const status = tampered ? 'compromised' : (hashMatch && blockchainVerified ? 'verified' : 'pending');

        // Update status in DB if changed
        if (evidence.status !== status) {
            evidence.status = status;
            await evidence.save();
        }

        res.status(200).json({
            success: true,
            message: tampered ? 'Evidence Integirty Failed' : 'Evidence verified successfully',
            evidenceId: evidence.evidenceId,
            fileName: evidence.fileName,
            uploadedBy: evidence.uploader.email,
            uploadedByName: evidence.uploader.fullName,
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
                smartContractId: evidence.smartContractId
            }
        });
    } catch (error) {
        next(error);
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

        const query = { uploader: req.user.id };

        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        const total = await Evidence.countDocuments(query);
        const evidence = await Evidence.find(query)
            .populate('uploader', 'fullName email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

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
                uploadedBy: ev.uploader.email
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
            .populate('uploader', 'fullName email organization');

        if (!evidence) {
            return res.status(404).json({
                success: false,
                message: 'Evidence not found'
            });
        }

        if (evidence.uploader._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this evidence'
            });
        }

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
