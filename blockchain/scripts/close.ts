import { ethers } from "ethers";
import CampaignArtifact from "../artifacts/contracts/Campaign.sol/Campaign.json";

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const wallet = new ethers.Wallet(
        "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
        provider
    );

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const campaignContract = new ethers.Contract(
        contractAddress,
        CampaignArtifact.abi,
        wallet
    );

    try {
        const campaignId = 1;

        console.log(`Closing campaign with ID: ${campaignId}...`);

        const tx = await campaignContract.closeCampaign(campaignId);
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log(
            `Campaign with ID ${campaignId} closed successfully in block:`,
            receipt.blockNumber
        );
    } catch (error) {
        console.error("Error closing the campaign:", error);
    }
}

main().catch((error) => {
    console.error("Error running the script:", error);
    process.exit(1);
});
