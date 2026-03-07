async function main() {
  const EvidenceLocker = await ethers.getContractFactory("EvidenceLocker");
  const contract = await EvidenceLocker.deploy();
  await contract.waitForDeployment();
  console.log("Contract deployed at:", await contract.getAddress());
}

main();
