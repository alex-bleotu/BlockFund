import { ethers } from "ethers";
import CampaignArtifact from "../artifacts/contracts/Campaign.sol/Campaign.json";

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const wallet = new ethers.Wallet(
        "0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0",
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

        console.log(`Fetching details for campaign with ID: ${campaignId}...`);

        const campaign = await campaignContract.getCampaign(campaignId);

        const parsedCampaign = {
            id: campaign[0].toString(),
            creator: campaign[1],
            goal: ethers.formatEther(campaign[2]),
            deadline: new Date(Number(campaign[3]) * 1000).toISOString(),
            totalFunded: ethers.formatEther(campaign[4]),
            metadataCID: campaign[5],
            status: ["ACTIVE", "SUCCESSFUL", "CLOSED"][campaign[6]],
        };

        console.log("Campaign Details:", parsedCampaign);
    } catch (error) {
        console.error("Error fetching campaign details:", error);
    }
}

main().catch((error) => {
    console.error("Error running the script:", error);
    process.exit(1);
});
