import { expect } from "chai";
import { parseEther } from "ethers";
import { ethers } from "hardhat";

describe("Campaign Contract", function () {
    let Campaign: any;
    let campaign: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async function () {
        await ethers.provider.send("hardhat_reset", []);

        // Get the contract factory and signers
        [owner, addr1, addr2] = await ethers.getSigners();
        Campaign = await ethers.getContractFactory("Campaign");
        campaign = await Campaign.deploy();
    });

    it("Should create a new campaign", async function () {
        const goal = ethers.parseEther("10");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        const tx = await campaign
            .connect(owner)
            .createCampaign(goal, deadline, metadataCID);
        const receipt = await tx.wait();

        // Access the event from receipt.logs
        const eventLog = receipt.logs[0];
        const eventArgs = eventLog.args;

        // Validate event arguments
        expect(eventArgs[0]).to.equal(1n);
        expect(eventArgs[1]).to.equal(await owner.getAddress());
        expect(eventArgs[2]).to.equal(goal);
        expect(eventArgs[3]).to.equal(BigInt(deadline));
        expect(eventArgs[4]).to.equal(metadataCID);
    });

    it("Should allow contributions and update totalFunded", async function () {
        const goal = parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        // Create a campaign
        await campaign.createCampaign(goal, deadline, metadataCID);

        // Contribute 2 ETH from addr1
        const contribution1 = parseEther("2");
        await campaign.connect(addr1).contribute(1, { value: contribution1 });

        const campaignData = await campaign.getCampaign(1);
        expect(campaignData.totalFunded).to.equal(contribution1);

        // Contribute 1 ETH from addr2
        const contribution2 = parseEther("1");
        await campaign.connect(addr2).contribute(1, { value: contribution2 });

        const updatedData = await campaign.getCampaign(1);
        expect(updatedData.totalFunded).to.equal(parseEther("3")); // 2 + 1
    });

    it("Should mark the campaign as SUCCESSFUL when the goal is reached", async function () {
        const goal = parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        // Create a campaign
        await campaign.createCampaign(goal, deadline, metadataCID);

        // Contribute 5 ETH
        await campaign.connect(addr1).contribute(1, { value: parseEther("5") });

        const campaignData = await campaign.getCampaign(1);
        expect(campaignData.status).to.equal(1); // SUCCESSFUL
    });

    it("Should allow the creator to withdraw funds after the campaign is successful", async function () {
        const goal = parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        // Create a campaign
        await campaign.createCampaign(goal, deadline, metadataCID);
        await campaign.connect(addr1).contribute(1, { value: parseEther("5") });

        const initialBalance = await ethers.provider.getBalance(owner.address);

        // Withdraw funds
        const tx = await campaign.withdraw(1);
        const receipt = await tx.wait();

        // Safely calculate gas cost
        const effectiveGasPrice = receipt.effectiveGasPrice || receipt.gasPrice;
        const gasUsed =
            BigInt(receipt.gasUsed || 0) * BigInt(effectiveGasPrice || 0);
        const finalBalance = await ethers.provider.getBalance(owner.address);

        // Expect the balance difference (minus gas costs) to equal the withdrawal amount
        expect(finalBalance - initialBalance + gasUsed).to.equal(
            parseEther("5")
        );
    });

    it("Should allow refunds if the campaign fails", async function () {
        const goal = parseEther("10");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        // Create a campaign
        await campaign.createCampaign(goal, deadline, metadataCID);
        await campaign.connect(addr1).contribute(1, { value: parseEther("2") });
        await ethers.provider.send("evm_increaseTime", [3601]);
        await ethers.provider.send("evm_mine", []);

        // Refund addr1
        const initialBalance = await ethers.provider.getBalance(addr1.address);

        // Perform the refund transaction
        const tx = await campaign.connect(addr1).claimRefund(1);
        const receipt = await tx.wait();

        // Safely calculate gas cost
        const effectiveGasPrice = receipt.effectiveGasPrice || receipt.gasPrice;
        const gasUsed =
            BigInt(receipt.gasUsed || 0) * BigInt(effectiveGasPrice || 0);

        const finalBalance = await ethers.provider.getBalance(addr1.address);

        // Expect the balance difference (accounting for gas) to equal the refunded amount
        expect(finalBalance - initialBalance + gasUsed).to.equal(
            parseEther("2")
        );
    });

    it("Should not allow non-creators to withdraw funds", async function () {
        const goal = parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        // Create a campaign
        await campaign.createCampaign(goal, deadline, metadataCID);

        // Contribute 5 ETH
        await campaign.connect(addr1).contribute(1, { value: parseEther("5") });

        // Attempt withdrawal from addr1 (not the creator)
        await expect(campaign.connect(addr1).withdraw(1)).to.be.revertedWith(
            "Only creator can withdraw"
        );
    });

    it("Should not allow contributions after the deadline", async function () {
        const goal = parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const metadataCID = "QmExampleCID";

        // Create a campaign
        await campaign.createCampaign(goal, deadline, metadataCID);

        // Fast forward time to after the deadline
        await ethers.provider.send("evm_increaseTime", [3601]);
        await ethers.provider.send("evm_mine", []);

        // Attempt to contribute after deadline
        await expect(
            campaign.connect(addr1).contribute(1, { value: parseEther("1") })
        ).to.be.revertedWith("Campaign has ended");
    });
});
