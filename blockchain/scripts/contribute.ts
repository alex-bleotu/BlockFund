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

    const campaignId = 2;
    const contributionAmount = ethers.parseEther("10");

    try {
        const campaignCount = await campaignContract.getCampaignCount();
        if (campaignId > campaignCount) {
            console.error(`Campaign with ID ${campaignId} does not exist.`);
            return;
        }

        console.log(
            `Contributing ${ethers.formatEther(
                contributionAmount
            )} ETH to campaign ${campaignId}...`
        );

        const tx = await campaignContract.contribute(campaignId, {
            value: contributionAmount,
        });
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        const updatedCampaign = await campaignContract.getCampaign(campaignId);
        console.log("Updated Campaign Details:", updatedCampaign);

        const parsedCampaign = {
            id: updatedCampaign[0].toString(),
            creator: updatedCampaign[1],
            goal: ethers.formatEther(updatedCampaign[2]),
            deadline: new Date(Number(updatedCampaign[3]) * 1000).toISOString(),
            totalFunded: ethers.formatEther(updatedCampaign[4]),
            metadataCID: updatedCampaign[5],
            status: updatedCampaign[6].toString(),
        };
        console.log("Parsed Updated Campaign Details:", parsedCampaign);
    } catch (error) {
        console.error("Error contributing to the campaign:", error);
    }
}

main().catch((error) => {
    console.error("Error running the script:", error);
    process.exit(1);
});
