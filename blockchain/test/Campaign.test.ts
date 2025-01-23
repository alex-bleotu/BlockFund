import { expect } from "chai";
import { ethers } from "hardhat";

describe("Campaign Contract", function () {
    let Campaign: any;
    let campaign: any;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async function () {
        await ethers.provider.send("hardhat_reset", []);
        [owner, addr1, addr2] = await ethers.getSigners();
        Campaign = await ethers.getContractFactory("Campaign");
        campaign = await Campaign.deploy();
    });

    it("Should create a new campaign", async function () {
        const goal = ethers.parseEther("10");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign
            .connect(owner)
            .createCampaign(goal, deadline, metadataCID);

        const campaignData = await campaign.getCampaign(1);
        expect(campaignData.id).to.equal(1n);
        expect(campaignData.creator).to.equal(owner.address);
        expect(campaignData.goal).to.equal(goal);
        expect(campaignData.deadline).to.equal(BigInt(deadline));
        expect(campaignData.metadataCID).to.equal(metadataCID);
    });

    it("Should not allow the creator to fund their own campaign", async function () {
        const goal = ethers.parseEther("10");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign
            .connect(owner)
            .createCampaign(goal, deadline, metadataCID);

        await expect(
            campaign
                .connect(owner)
                .contribute(1, { value: ethers.parseEther("5") })
        ).to.be.revertedWith("Creator cannot fund their own campaign");
    });

    it("Should allow contributions", async function () {
        const goal = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign.createCampaign(goal, deadline, metadataCID);

        const contribution1 = ethers.parseEther("2");
        await campaign.connect(addr1).contribute(1, { value: contribution1 });

        const campaignData = await campaign.getCampaign(1);
        expect(campaignData.totalFunded).to.equal(contribution1);

        const contribution2 = ethers.parseEther("1");
        await campaign.connect(addr2).contribute(1, { value: contribution2 });

        const updatedData = await campaign.getCampaign(1);
        expect(updatedData.totalFunded).to.equal(ethers.parseEther("3"));
    });

    it("Should ensure totalContributions is equal to totalFunded", async function () {
        const goal = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign.createCampaign(goal, deadline, metadataCID);

        const contribution1 = ethers.parseEther("2");
        const contribution2 = ethers.parseEther("3");

        await campaign.connect(addr1).contribute(1, { value: contribution1 });
        await campaign.connect(addr2).contribute(1, { value: contribution2 });

        const campaignData = await campaign.getCampaign(1);
        const totalFunded = campaignData.totalFunded;

        const contributionFromAddr1 = await campaign.contributions(
            1,
            addr1.address
        );
        const contributionFromAddr2 = await campaign.contributions(
            1,
            addr2.address
        );
        const totalContributions =
            contributionFromAddr1 + contributionFromAddr2;

        expect(totalContributions).to.equal(totalFunded);
    });

    it("Should retain totalContributions after withdrawal", async function () {
        const goal = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign.createCampaign(goal, deadline, metadataCID);
        await campaign
            .connect(addr1)
            .contribute(1, { value: ethers.parseEther("2") });
        await campaign
            .connect(addr2)
            .contribute(1, { value: ethers.parseEther("3") });

        await campaign.connect(owner).closeCampaign(1);

        const totalContributionsBefore = (await campaign.getCampaign(1))
            .totalContributions;

        await campaign.connect(owner).withdraw(1);

        const totalContributionsAfter = (await campaign.getCampaign(1))
            .totalContributions;
        expect(totalContributionsBefore).to.equal(totalContributionsAfter);
    });

    it("Should mark the campaign as SUCCESSFUL when the goal is reached", async function () {
        const goal = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign.createCampaign(goal, deadline, metadataCID);

        await campaign
            .connect(addr1)
            .contribute(1, { value: ethers.parseEther("5") });

        const campaignData = await campaign.getCampaign(1);
        expect(campaignData.status).to.equal(1);
    });

    it("Should allow the creator to withdraw funds after the campaign is successful", async function () {
        const goal = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign.createCampaign(goal, deadline, metadataCID);
        await campaign
            .connect(addr1)
            .contribute(1, { value: ethers.parseEther("5") });

        const initialBalance = await ethers.provider.getBalance(owner.address);

        const tx = await campaign.connect(owner).withdraw(1);
        const receipt = await tx.wait();

        const effectiveGasPrice = receipt.effectiveGasPrice || receipt.gasPrice;
        const gasUsed =
            BigInt(receipt.gasUsed || 0) * BigInt(effectiveGasPrice || 0);
        const finalBalance = await ethers.provider.getBalance(owner.address);

        expect(finalBalance - initialBalance + gasUsed).to.equal(
            ethers.parseEther("5")
        );
    });

    it("Should allow the creator to close the campaign explicitly", async function () {
        const goal = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign.createCampaign(goal, deadline, metadataCID);

        await expect(campaign.connect(owner).closeCampaign(1))
            .to.emit(campaign, "CampaignClosed")
            .withArgs(1, owner.address);

        const campaignData = await campaign.getCampaign(1);
        expect(campaignData.status).to.equal(2);
    });

    it("Should allow the creator to withdraw funds after closing the campaign explicitly", async function () {
        const goal = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign.createCampaign(goal, deadline, metadataCID);
        await campaign
            .connect(addr1)
            .contribute(1, { value: ethers.parseEther("5") });

        await campaign.connect(owner).closeCampaign(1);

        const initialBalance = await ethers.provider.getBalance(owner.address);

        const tx = await campaign.connect(owner).withdraw(1);
        const receipt = await tx.wait();

        const effectiveGasPrice = receipt.effectiveGasPrice || receipt.gasPrice;
        const gasUsed =
            BigInt(receipt.gasUsed || 0) * BigInt(effectiveGasPrice || 0);
        const finalBalance = await ethers.provider.getBalance(owner.address);

        expect(finalBalance - initialBalance + gasUsed).to.equal(
            ethers.parseEther("5")
        );
    });

    it("Should allow the creator to update the campaign", async function () {
        const goal = ethers.parseEther("10");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign
            .connect(owner)
            .createCampaign(goal, deadline, metadataCID);

        const newGoal = ethers.parseEther("15");
        const newDeadline = Math.floor(Date.now() / 1000) + 7200;
        const newMetadataCID = "QmUpdatedExampleCID";

        await expect(
            campaign
                .connect(owner)
                .updateCampaign(1, newGoal, newDeadline, newMetadataCID)
        )
            .to.emit(campaign, "CampaignUpdated")
            .withArgs(1, newGoal, newDeadline, newMetadataCID);

        const updatedCampaign = await campaign.getCampaign(1);
        expect(updatedCampaign.goal).to.equal(newGoal);
        expect(updatedCampaign.deadline).to.equal(BigInt(newDeadline));
        expect(updatedCampaign.metadataCID).to.equal(newMetadataCID);
    });

    it("Should not allow non-creators to update the campaign", async function () {
        const goal = ethers.parseEther("10");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign
            .connect(owner)
            .createCampaign(goal, deadline, metadataCID);

        const newGoal = ethers.parseEther("15");
        const newDeadline = Math.floor(Date.now() / 1000) + 7200;
        const newMetadataCID = "QmUpdatedExampleCID";

        await expect(
            campaign
                .connect(addr1)
                .updateCampaign(1, newGoal, newDeadline, newMetadataCID)
        ).to.be.revertedWith("Only creator can update the campaign");
    });

    it("Should not allow non-creators to withdraw funds", async function () {
        const goal = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign.createCampaign(goal, deadline, metadataCID);

        await campaign
            .connect(addr1)
            .contribute(1, { value: ethers.parseEther("5") });

        await expect(campaign.connect(addr1).withdraw(1)).to.be.revertedWith(
            "Only creator can withdraw"
        );
    });

    it("Should not allow contributions after the deadline", async function () {
        const goal = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign.createCampaign(goal, deadline, metadataCID);

        await ethers.provider.send("evm_increaseTime", [3601]);
        await ethers.provider.send("evm_mine", []);

        await expect(
            campaign
                .connect(addr1)
                .contribute(1, { value: ethers.parseEther("1") })
        ).to.be.revertedWith("Campaign has ended");
    });

    it("Should not allow non-creators to close a campaign", async function () {
        const goal = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const metadataCID = "QmExampleCID";

        await campaign.createCampaign(goal, deadline, metadataCID);

        await expect(
            campaign.connect(addr1).closeCampaign(1)
        ).to.be.revertedWith("Only creator can close");
    });
});
