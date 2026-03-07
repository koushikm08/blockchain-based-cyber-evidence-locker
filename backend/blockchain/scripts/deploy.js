const hre = require("hardhat");

async function main() {
    const EvidenceLocker = await hre.ethers.getContractFactory("EvidenceLocker");
    const contract = await EvidenceLocker.deploy();
    await contract.waitForDeployment();
    console.log("Contract deployed at:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
