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

    const campaignId = 1;

    console.log(`Withdrawing funds from campaign ${campaignId}...`);

    const tx = await campaignContract.withdraw(campaignId);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    const updatedBalance = await provider.getBalance(wallet.address);
    console.log(
        "Updated Wallet Balance:",
        ethers.formatEther(updatedBalance),
        "ETH"
    );
}

main().catch((error) => {
    console.error("Error running the script:", error);
    process.exit(1);
});
