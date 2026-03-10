const fs = require('fs');
const solc = require('solc');
const { ethers } = require('ethers');

require("dotenv").config();

async function main() {
    console.log("Compiling contract...");
    const contractPath = 'contracts/EvidenceLocker.sol';
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'EvidenceLocker.sol': {
                content: source,
            },
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            evmVersion: 'paris', // Important for Ganache compatibility (avoid PUSH0)
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        output.errors.forEach((err) => {
            console.error(err.formattedMessage);
        });
        if (output.errors.some(e => e.severity === 'error')) {
            process.exit(1);
        }
    }

    const contractFile = output.contracts['EvidenceLocker.sol']['EvidenceLocker'];
    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;

    console.log("Contract compiled successfully.");

    // Connect to local node
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Deploying contract with account:", await signer.getAddress());

    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy();

    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("Contract deployed at:", contractAddress);

    // Save address and ABI to frontend/backend if needed
    // For now, just logging it.

    // Save to a file for backend to read
    const deploymentInfo = {
        address: contractAddress,
        abi: abi
    };
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to deployment-info.json");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
