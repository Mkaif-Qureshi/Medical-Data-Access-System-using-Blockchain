// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalDataAccess {
    
    struct Dataset {
        string name;
        string url;
        uint256 price;
    }
    
    mapping(uint256 => Dataset) public datasets;
    mapping(address => mapping(uint256 => uint256)) public accessExpiry; // Stores access expiry time for each dataset per user
    
    event AccessGranted(address indexed user, uint256 indexed datasetId, uint256 expiryTime);
    
    constructor() {
        datasets[1] = Dataset("Cardiology Patient Data", "https://example.com/datasets/cardiology_data.csv", 0.05 ether);
        datasets[2] = Dataset("Neurology Research Papers", "https://example.com/datasets/neurology_research_papers.zip", 0.08 ether);
        datasets[3] = Dataset("Oncology MRI Scans", "https://example.com/datasets/oncology_mri_scans.zip", 0.1 ether);
    }

    // Request access to a specific dataset
    function requestAccess(uint256 datasetId) public payable {
        require(msg.value >= datasets[datasetId].price, "Insufficient payment for dataset");

        uint256 expiryTime = block.timestamp + 1 days; // 1 day access validity
        accessExpiry[msg.sender][datasetId] = expiryTime;
        
        emit AccessGranted(msg.sender, datasetId, expiryTime);
    }

    // Check if a user has valid access to a dataset
    function hasAccess(uint256 datasetId) public view returns (bool) {
        return block.timestamp < accessExpiry[msg.sender][datasetId];
    }

    // Get dataset metadata
    function getMetadata(uint256 datasetId) public view returns (string memory, string memory, uint256) {
        Dataset memory dataset = datasets[datasetId];
        return (dataset.name, dataset.url, dataset.price);
    }
}
