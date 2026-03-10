const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const deployment = JSON.parse(
  fs.readFileSync("deployment-info.json", "utf8")
);

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  deployment.address,
  deployment.abi,
  wallet
);

async function storeEvidence(hash, cid) {
  const tx = await contract.storeEvidence(hash, cid);
  await tx.wait();
  return tx.hash;
}

module.exports = storeEvidence;