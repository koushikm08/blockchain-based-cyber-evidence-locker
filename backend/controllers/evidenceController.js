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
    let responseSent = false;
    let ipfs = null;
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

        // IPFS Upload
        let ipfsCid;
        try {
            console.log('📤 Starting IPFS upload...');
            let ipfsModule;
            try {
                ipfsModule = await import('ipfs-http-client');
            } catch (importErr) {
                console.error('Failed to import ipfs-http-client:', importErr.message);
                throw new Error('IPFS client library not available');
            }

            const { create } = ipfsModule;
            ipfs = create({ url: process.env.IPFS_URL || 'http://127.0.0.1:5001' });
            const result = await ipfs.add(fileBuffer);
            ipfsCid = result.cid.toString();

            console.log('✓ File uploaded to IPFS:', ipfsCid);

            // Add to MFS for visibility in IPFS Desktop
            try {
                await ipfs.files.mkdir('/evidence', { parents: true });

                const safeFileName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                const mfsPath = `/evidence/${Date.now()}_${safeFileName}`;

                try {
                    await ipfs.files.stat(mfsPath);
                    console.warn(`File already exists in MFS at ${mfsPath}`);
                } catch {
                    await ipfs.files.cp(`/ipfs/${ipfsCid}`, mfsPath);
                    console.log(`✓ File added to MFS at ${mfsPath}`);
                }
            } catch (mfsError) {
                console.warn('⚠ MFS operation failed (non-fatal):', mfsError.message);
            }
        } catch (err) {
            console.error('❌ IPFS upload error:', err.message);
            console.error('Error stack:', err.stack);
            responseSent = true;
            res.setHeader('Content-Type', 'application/json');
            return res.status(503).json({
                success: false,
                message: 'IPFS upload failed: ' + err.message,
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
            
            const signer = await provider.getSigner();
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

            // Use explicit values to avoid serialization issues
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
        
        // Only send response if not already sent
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
        // Cleanup resources
        try {
            // Close IPFS client if it exists
            if (ipfs) {
                console.log('🧹 Closing IPFS connection...');
                // IPFS HTTP client doesn't need explicit close, but we ensure it's not referenced
                ipfs = null;
            }
            
            // Disconnect provider if it exists
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
    let ipfs = null;
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

        // 1. Verify IPFS and Hash
        let fetchedFileBuffer;
        try {
            const { create } = await import('ipfs-http-client');
            ipfs = create({ url: process.env.IPFS_URL || 'http://127.0.0.1:5001' });

            console.log('🔍 Attempting to verify file from IPFS with CID:', evidence.ipfsCid);

            // Cat file from IPFS using raw CID
            // ipfs.cat returns an AsyncIterable
            const chunks = [];
            for await (const chunk of ipfs.cat(evidence.ipfsCid)) {
                chunks.push(chunk);
            }
            
            if (chunks.length === 0) {
                throw new Error('No data retrieved from IPFS - empty file');
            }
            
            fetchedFileBuffer = Buffer.concat(chunks);
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
            console.error("Error Details:", err);
            ipfsAvailable = false;
            // Don't mark as tampered if IPFS is unavailable - it's a connectivity issue, not tampering
        }

        // 2. Verify Blockchain
        try {
            if (evidence.smartContractId !== undefined && evidence.smartContractId !== null) {
                provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
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

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
            success: true,
            message: tampered ? 'Evidence Integirty Failed' : 'Evidence verified successfully',
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
                // Add explicit values for comparison
                blockchainHash: blockchainVerified ? evidence.fileHash : ((evidence.smartContractId !== undefined && evidence.smartContractId !== null) ? 'MISMATCH_ON_CHAIN' : 'N/A'),
                databaseHash: evidence.fileHash,
                ipfsHash: hashMatch ? evidence.fileHash : (ipfsAvailable ? 'HASH_MISMATCH' : 'N/A')
            }
        });
    } catch (error) {
        next(error);
    } finally {
        // Cleanup resources
        try {
            if (ipfs) {
                console.log('🧹 Closing IPFS connection in verify...');
                ipfs = null;
            }
            
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
    let ipfs = null;
    
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

        // Fetch from IPFS
        let fileBuffer;
        try {
            const { create } = await import('ipfs-http-client');
            ipfs = create({ url: process.env.IPFS_URL || 'http://127.0.0.1:5001' });

            console.log('📥 Downloading file from IPFS with CID:', evidence.ipfsCid);
            
            const chunks = [];
            for await (const chunk of ipfs.cat(evidence.ipfsCid)) {
                chunks.push(chunk);
            }
            
            if (chunks.length === 0) {
                throw new Error('No data retrieved from IPFS - empty file');
            }
            
            fileBuffer = Buffer.concat(chunks);
            console.log('✓ File downloaded successfully from IPFS, size:', fileBuffer.length, 'bytes');
        } catch (ipfsError) {
            console.error("❌ IPFS Download failed:", ipfsError.message);
            console.error("Error Details:", ipfsError);
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
    } finally {
        // Cleanup resources
        try {
            if (ipfs) {
                console.log('🧹 Closing IPFS connection in download...');
                ipfs = null;
            }
        } catch (cleanupErr) {
            console.warn('⚠ Cleanup error in download (non-fatal):', cleanupErr.message);
        }
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
        // This creates a mismatch between:
        // 1. The actual file content (IPFS) vs Database Record
        // 2. The immutable Blockchain Record vs Database Record
        const originalHash = evidence.fileHash;
        // Generate a random hash to simulate file modification
        evidence.fileHash = crypto.randomBytes(32).toString('hex');

        // We'll mark it as compromised immediately so the UI reflects it, 
        // though verification would also catch it.
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
