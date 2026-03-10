require("dotenv").config();
const uploadToIPFS = require("./services/ipfsUpload");

async function main() {
    try {
        const cid = await uploadToIPFS("testfile.txt");
        console.log("File uploaded successfully!");
        console.log("IPFS CID:", cid);
        console.log("Access file at:");
        console.log(`https://gateway.pinata.cloud/ipfs/${cid}`);
    } catch (error) {
        console.error("Upload failed:", error.message);
    }
}

main();