const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
    evidenceId: {
        type: String,
        unique: true
    },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileHash: { type: String, required: true },
    ipfsCid: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'verified', 'compromised'],
        default: 'pending'
    },
    blockchainTx: { type: String },
    blockNumber: { type: Number },
    smartContractId: { type: Number },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    verificationCount: { type: Number, default: 0 },
    lastVerified: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Generate evidence ID before saving
evidenceSchema.pre('save', async function (next) {
    if (!this.evidenceId) {
        const count = await mongoose.model('Evidence').countDocuments();
        const year = new Date().getFullYear();
        this.evidenceId = `EV-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Evidence', evidenceSchema);
