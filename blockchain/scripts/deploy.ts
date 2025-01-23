import { ethers } from "hardhat";

async function main() {
    const Campaign = await ethers.getContractFactory("Campaign");

    const campaign = await Campaign.deploy();

    console.log("Campaign contract deployed to:", campaign.target);
}

main().catch((error) => {
    console.error("Error deploying the contract:", error);
    process.exitCode = 1;
});
