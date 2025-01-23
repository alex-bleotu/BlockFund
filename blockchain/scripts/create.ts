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

    const goal = ethers.parseEther("10");
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const metadataCID = "QmExampleCID";

    console.log(new Date(deadline * 1000), deadline * 1000);

    console.log("Creating a new campaign...");

    try {
        const tx = await campaignContract.createCampaign(
            goal,
            deadline,
            metadataCID
        );
        console.log("Transaction sent:", tx.hash);

        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        const campaignCount = await campaignContract.getCampaignCount();
        console.log("Total campaigns:", campaignCount.toString());

        if (campaignCount >= 1) {
            const campaign = await campaignContract.getCampaign(1);
            console.log("Campaign Details:", campaign);

            const parsedCampaign = {
                id: campaign[0].toString(),
                creator: campaign[1],
                goal: ethers.formatEther(campaign[2]),
                deadline: new Date(Number(campaign[3]) * 1000).toISOString(),
                totalFunded: ethers.formatEther(campaign[4]),
                metadataCID: campaign[5],
                status: campaign[6].toString(),
            };
            console.log("Parsed Campaign Details:", parsedCampaign);
        } else {
            console.error("No campaigns exist yet.");
        }
    } catch (error) {
        console.error("Error interacting with the contract:", error);
    }
}

main().catch((error) => {
    console.error("Error running the script:", error);
    process.exit(1);
});
