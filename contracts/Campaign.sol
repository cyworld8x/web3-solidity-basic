// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.25;

// give a smart contract that allows a manager to create a campaign and contributors to contribute to the campaign.
// The manager can create requests to spend the funds and the contributors can approve the requests.
// If more than 50% of the contributors approve the request, 
// the manager can finalize the request and the funds will be sent to the vendor.

contract CampaignFactory {
    address[] public deployedCampaigns;
    uint public  deployedCampaignsCount;
    function createCampaign(uint _minimumContribution) public {
        Campaign c = new Campaign(_minimumContribution, msg.sender);
        deployedCampaigns.push(address(c));
    }

    function getdeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address payable vendor;
        bool completed;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    address public manager;
    uint256 public minimumContribution;
    mapping(address => bool) public contributors;
    mapping(uint => Request) public requests;
    uint256 public numberOfContributors;
    uint256 public numberOfRequests;

    modifier onlyManager() {
        require(msg.sender == manager, "Only the manager can call this function.");
        _;
    }

    constructor(uint256 _minimumContribution, address _manager) {
        manager = _manager;
        minimumContribution = _minimumContribution;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution, "Contribution amount is below the minimum requirement.");
        contributors[msg.sender] = true;
        numberOfContributors++;
    }

    function createRequest(string memory _description, uint256 _value, address payable _vendor) public onlyManager {
        Request storage r = requests[numberOfRequests++];
                r.description = _description;
                r.value = _value;
                r.vendor = _vendor;
                r.completed = false;
                r.approvalCount = 0;
    }

    function approveRequest(uint256 _index) public {
        require(contributors[msg.sender], "Only contributors can approve requests.");
        Request storage request = requests[_index];

        require(!request.approvals[msg.sender], "You have already approved this request.");
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint256 _index) public onlyManager {
        Request storage request = requests[_index];

        require(!request.completed, "Request has already been completed.");
        require(request.approvalCount > (numberOfContributors / 2), "Not enough approvals to finalize the request.");

        request.vendor.transfer(request.value);
        request.completed = true;
    }

     function getValueOfRequest(uint256 _index) public view returns (uint256) {
        return requests[_index].value;
    }
}