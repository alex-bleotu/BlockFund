// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title Campaign
 * @notice A simple crowdfunding contract for multiple campaigns using native ETH.
 */
contract Campaign {
    /**
     * @dev Possible statuses for each campaign.
     */
    enum CampaignStatus {
        ACTIVE,
        SUCCESSFUL,
        FAILED
    }

    /**
     * @dev Data structure representing a single campaign.
     */
    struct CampaignData {
        uint256 id;               // Unique campaign ID (auto-increment)
        address payable creator;  // Address of the campaign creator
        uint256 goal;             // Funding goal (in wei)
        uint256 deadline;         // Timestamp (in seconds) when campaign ends
        uint256 totalFunded;      // Total ETH contributed so far
        string metadataCID;       // IPFS hash or other reference to off-chain metadata
        CampaignStatus status;    // Current status of the campaign
    }

    // Auto-incrementing ID for each new campaign
    uint256 private campaignCount;

    // Store each campaign's data by ID
    mapping(uint256 => CampaignData) public campaigns;

    // Track how much each address has contributed to each campaign: campaignId -> contributor -> amount
    mapping(uint256 => mapping(address => uint256)) public contributions;

    // -------------------------
    //         EVENTS
    // -------------------------
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 goal,
        uint256 deadline,
        string metadataCID
    );

    event ContributionMade(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );

    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount
    );

    event Refunded(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );

    /**
     * @notice Create a new campaign that accepts ETH.
     * @param _goal The funding goal in wei.
     * @param _deadline The unix timestamp after which the campaign ends.
     * @param _metadataCID IPFS CID (or any reference) for campaign details (title, images, etc.).
     */
    function createCampaign(
        uint256 _goal,
        uint256 _deadline,
        string calldata _metadataCID
    ) external {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_goal > 0, "Goal must be greater than 0");

        campaignCount += 1;

        campaigns[campaignCount] = CampaignData({
            id: campaignCount,
            creator: payable(msg.sender),
            goal: _goal,
            deadline: _deadline,
            totalFunded: 0,
            metadataCID: _metadataCID,
            status: CampaignStatus.ACTIVE
        });

        emit CampaignCreated(campaignCount, msg.sender, _goal, _deadline, _metadataCID);
    }

    /**
     * @notice Contribute ETH to a specific campaign (must send ETH with this call).
     * @param _campaignId The ID of the campaign to fund.
     */
    function contribute(uint256 _campaignId) external payable {
        CampaignData storage campaignData = campaigns[_campaignId];

        require(campaignData.status == CampaignStatus.ACTIVE, "Campaign not active");
        require(block.timestamp < campaignData.deadline, "Campaign has ended");
        require(msg.value > 0, "No ETH sent");

        // Increase the total funded
        campaignData.totalFunded += msg.value;

        // Record contributor's amount
        contributions[_campaignId][msg.sender] += msg.value;

        emit ContributionMade(_campaignId, msg.sender, msg.value);

        // If the goal is reached or exceeded, update status
        if (campaignData.totalFunded >= campaignData.goal) {
            campaignData.status = CampaignStatus.SUCCESSFUL;
        }
    }

    /**
     * @notice Withdraw funds if the campaign has succeeded (goal met).
     *         Only the campaign creator can call this.
     * @param _campaignId The ID of the campaign.
     */
    function withdraw(uint256 _campaignId) external {
        CampaignData storage campaignData = campaigns[_campaignId];

        require(msg.sender == campaignData.creator, "Only creator can withdraw");

        // Must either be marked successful already or logically successful
        // (deadline passed + totalFunded >= goal).
        bool isLogicallySuccessful = 
            (block.timestamp >= campaignData.deadline && campaignData.totalFunded >= campaignData.goal);
        require(
            campaignData.status == CampaignStatus.SUCCESSFUL || isLogicallySuccessful,
            "Campaign not successful yet"
        );

        // Update state before transferring to avoid re-entrancy
        uint256 amount = campaignData.totalFunded;
        campaignData.totalFunded = 0;
        campaignData.status = CampaignStatus.SUCCESSFUL;

        // Transfer ETH to the creator
        (bool success, ) = campaignData.creator.call{value: amount}("");
        require(success, "Withdraw transfer failed");

        emit FundsWithdrawn(_campaignId, msg.sender, amount);
    }

    /**
     * @notice Claim a refund if the campaign has failed (goal not reached by deadline).
     * @param _campaignId The ID of the campaign.
     */
    function claimRefund(uint256 _campaignId) external {
        CampaignData storage campaignData = campaigns[_campaignId];

        // Check if campaign is logically failed (deadline passed, totalFunded < goal)
        bool isLogicallyFailed =
            (block.timestamp >= campaignData.deadline && campaignData.totalFunded < campaignData.goal);
        require(
            campaignData.status == CampaignStatus.FAILED || isLogicallyFailed,
            "Campaign not failed yet"
        );

        // If not explicitly failed, mark it so
        if (campaignData.status != CampaignStatus.FAILED) {
            campaignData.status = CampaignStatus.FAILED;
        }

        // Find how much the sender contributed
        uint256 contributed = contributions[_campaignId][msg.sender];
        require(contributed > 0, "No contributions to refund");

        // Reset contributor's balance and reduce total funded
        contributions[_campaignId][msg.sender] = 0;
        campaignData.totalFunded -= contributed;

        // Transfer ETH back to contributor
        (bool success, ) = msg.sender.call{value: contributed}("");
        require(success, "Refund transfer failed");

        emit Refunded(_campaignId, msg.sender, contributed);
    }

    /**
     * @notice Retrieve information about a campaign.
     * @param _campaignId The ID of the campaign.
     */
    function getCampaign(uint256 _campaignId)
        external
        view
        returns (
            uint256 id,
            address creator,
            uint256 goal,
            uint256 deadline,
            uint256 totalFunded,
            string memory metadataCID,
            CampaignStatus status
        )
    {
        CampaignData storage campaignData = campaigns[_campaignId];
        return (
            campaignData.id,
            campaignData.creator,
            campaignData.goal,
            campaignData.deadline,
            campaignData.totalFunded,
            campaignData.metadataCID,
            campaignData.status
        );
    }
}
