// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Campaign {
    enum CampaignStatus { ACTIVE, SUCCESSFUL, CLOSED }

    struct CampaignData {
        uint256 id;
        address payable creator;
        uint256 goal;
        uint256 deadline;
        uint256 totalFunded;
        uint256 totalContributions;
        string metadataCID;
        CampaignStatus status;
    }

    uint256 private campaignCount;
    mapping(uint256 => CampaignData) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => uint256) public campaignFees;
    address public feeReceiver;

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
    event CampaignClosed(
        uint256 indexed campaignId,
        address indexed creator
    );
    event CampaignUpdated(
        uint256 indexed campaignId,
        uint256 newGoal,
        uint256 newDeadline,
        string newMetadataCID
    );
    event FeesCollected(
        uint256 indexed campaignId,
        uint256 amount
    );

    constructor() {
        feeReceiver = msg.sender;
    }

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
            totalContributions: 0,
            metadataCID: _metadataCID,
            status: CampaignStatus.ACTIVE
        });

        emit CampaignCreated(campaignCount, msg.sender, _goal, _deadline, _metadataCID);
    }

    function contribute(uint256 _campaignId) external payable {
        CampaignData storage campaignData = campaigns[_campaignId];
        require(campaignData.status != CampaignStatus.CLOSED, "Campaign is closed");
        require(block.timestamp < campaignData.deadline, "Campaign has ended");
        require(msg.value > 0, "No ETH sent");
        require(msg.sender != campaignData.creator, "Creator cannot fund their own campaign");

        campaignData.totalFunded += msg.value;
        contributions[_campaignId][msg.sender] += msg.value;
        emit ContributionMade(_campaignId, msg.sender, msg.value);

        if (campaignData.totalFunded >= campaignData.goal) {
            campaignData.status = CampaignStatus.SUCCESSFUL;
        }
    }

    function closeCampaign(uint256 _campaignId) external {
        CampaignData storage campaignData = campaigns[_campaignId];
        require(msg.sender == campaignData.creator, "Only creator can close");
        require(
            campaignData.status == CampaignStatus.ACTIVE ||
            campaignData.status == CampaignStatus.SUCCESSFUL,
            "Campaign cannot be closed"
        );

        campaignData.status = CampaignStatus.CLOSED;
        emit CampaignClosed(_campaignId, msg.sender);
    }

    function withdraw(uint256 _campaignId) external {
        CampaignData storage campaignData = campaigns[_campaignId];
        require(msg.sender == campaignData.creator, "Only creator can withdraw");
        require(
            campaignData.status == CampaignStatus.CLOSED ||
            campaignData.status == CampaignStatus.SUCCESSFUL,
            "Campaign must be closed or successful"
        );
        require(campaignData.totalFunded > 0, "No funds available to withdraw");

        uint256 total = campaignData.totalFunded;
        uint256 payout = (total * 80) / 100;
        uint256 leftover = total - payout;

        campaignData.status = CampaignStatus.CLOSED;
        campaignData.totalFunded = 0;
        campaignFees[_campaignId] = leftover;

        (bool success, ) = campaignData.creator.call{value: payout}("");
        require(success, "Withdraw transfer failed");

        emit FundsWithdrawn(_campaignId, msg.sender, payout);
    }

    function collectFees(uint256 _campaignId) external {
        uint256 fee = campaignFees[_campaignId];
        require(fee > 0, "No fees to collect");
        campaignFees[_campaignId] = 0;
        (bool success, ) = feeReceiver.call{value: fee}("");
        require(success, "Fee transfer failed");

        emit FeesCollected(_campaignId, fee);
    }

    function getCampaign(uint256 _campaignId)
        external
        view
        returns (
            uint256 id,
            address creator,
            uint256 goal,
            uint256 deadline,
            uint256 totalFunded,
            uint256 totalContributions,
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
            campaignData.totalContributions,
            campaignData.metadataCID,
            campaignData.status
        );
    }

    function updateCampaign(
        uint256 _campaignId,
        uint256 _newGoal,
        uint256 _newDeadline,
        string calldata _newMetadataCID
    ) external {
        CampaignData storage campaignData = campaigns[_campaignId];
        require(msg.sender == campaignData.creator, "Only creator can update the campaign");
        require(campaignData.status == CampaignStatus.ACTIVE, "Campaign is not active");
        require(_newDeadline > block.timestamp, "New deadline must be in the future");
        require(_newGoal > campaignData.totalFunded, "New goal must be greater than total funded");

        campaignData.goal = _newGoal;
        campaignData.deadline = _newDeadline;
        campaignData.metadataCID = _newMetadataCID;
        emit CampaignUpdated(_campaignId, _newGoal, _newDeadline, _newMetadataCID);
    }

    function getCampaignCount() public view returns (uint256) {
        return campaignCount;
    }
}
