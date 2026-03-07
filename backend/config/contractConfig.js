const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load deployment info
// Note: In production, you might want to load this from environment variables or a build artifact
const deploymentInfoPath = path.join(__dirname, '../blockchain/deployment-info.json');
let deploymentInfo;

try {
    deploymentInfo = require(deploymentInfoPath);
} catch (error) {
    console.warn("Deployment info not found. Blockchain features may not work.");
    deploymentInfo = { address: "", abi: [] };
}

const getContract = (providerOrSigner) => {
    if (!deploymentInfo.address) {
        throw new Error("Contract address not found");
    }
    return new ethers.Contract(deploymentInfo.address, deploymentInfo.abi, providerOrSigner);
};

module.exports = {
    address: deploymentInfo.address,
    abi: deploymentInfo.abi,
    getContract
};
