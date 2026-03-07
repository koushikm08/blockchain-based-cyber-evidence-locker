const express = require('express');
const multer = require('multer');
const {
    uploadEvidence,
    verifyEvidence,
    getEvidenceList,
    getEvidence,
    getStats,
    tamperEvidence,
    downloadEvidence
} = require('../controllers/evidenceController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024 // 5GB limit
    }
});

router.post('/upload', protect, checkRole('admin', 'investigator'), upload.single('file'), uploadEvidence);
router.get('/verify/:evidenceId', protect, checkRole('admin', 'investigator', 'law_enforcement'), verifyEvidence);
router.get('/list', protect, getEvidenceList);
router.get('/stats', protect, getStats);
router.get('/download/:id', protect, downloadEvidence);
router.post('/tamper/:id', protect, tamperEvidence);
router.get('/:id', protect, getEvidence);

module.exports = router;
