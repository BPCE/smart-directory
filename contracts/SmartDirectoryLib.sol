//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

library SmartDirectoryLib {

    string private constant VERSION = "SmartDirectory 1.0";

    //DATA STRUCTURES

    struct ReferenceStatus {
        uint8 status;
        uint256 timeStamp;
    }

    struct Reference {
        address registrantAddress;
        address referenceAddress;
        string projectID;
        bytes32 referenceHash;
        string referenceType;
        string referenceVersion;
        ReferenceStatus [] referenceStatus;
    }

    struct SmartDirectoryStorage {
        address [] registrants;
        mapping (address => string) registrantUris;
        address [] references;
        mapping (address => Reference) referenceData;
    }

    //EVENTS

    event SmartDirectoryInitialized (
        address indexed parent1
    );

    event NewRegistrant (
        address indexed registrant,
        string registrantUri
    );

    event NewReference (
        address indexed registrant,
        address indexed reference,
        string indexed projectID
    );
    /*
    //CONSTRUCTOR

    function init(SmartDirectoryStorage storage self, address _parent) {
        parentAddress = _parent;
        emit SmartDirectoryInitialized();
    }
    */
    //SMART DIRECTORY FUNCTIONS

    //smartDirectoryReferenceEoaCreate
    function addReference (SmartDirectoryStorage storage self, address _referenceAddress, string _projectID,
        string _referenceType, string _referenceVersion, uint8 _status, string _registrantUri) public returns (bool) {

        require (_referenceAddress != address(0x0), "address null");
        require (!isDeclaredReference(_referenceAddress), "already registered");
        require (!isDeclaredRegistrant(msg.sender), "already registered");


        Reference storage ref = self.referenceData[_referenceAddress];
        ref.registrantAddress = msg.sender;
        ref.referenceAddress = _referenceAddress;
        ref.projectID = _projectID;
        ref.referenceType = _referenceType;
        ref.referenceVersion = _referenceVersion;
        ref.referenceStatus.push(ReferenceStatus(_status, block.timestamp));

        self.references.push(_referenceAddress);

        self.registrants.push(msg.sender);
        self.registrantUris[msg.sender] = _registrantUri;

        emit NewReference(msg.sender, _referenceAddress, _projectID);
        emit NewRegistrant(msg.sender, _registrantUri);
        return true;
    }

    //smartDirectoryReferenceStatusEoaUpdate
    function updateReferenceStatus (SmartDirectoryStorage storage self, address _referenceAddress,
        uint8 _status) public returns (bool) {

        require (isDeclaredReference(_referenceAddress), "undeclared contract");

        self.referenceData[_referenceAddress].referenceStatus.push(ReferenceStatus(_status, block.timestamp));

        return true;
    }

    //smartDirectoryRegistrantUriEoaWrite
    function updateRegistrantUri (SmartDirectoryStorage storage self, string _registrantUri) public returns (bool) {

        require (isDeclaredRegistrant(msg.sender), "unknown registrant");

        self.registrantUris[msg.sender] = _registrantUri;

        return true;
    }

    //SMART DIRECTORY ADMINISTRATION FUNCTIONS

    function version() public pure override returns(string memory) {
        return VERSION;
    }

    function isDeclaredRegistrant (SmartDirectoryStorage storage self) internal view returns (bool){
        for (uint256 i = 0; i < self.registrants.length; i++) {
            if (self.registrants[i] == msg.sender) {
                return true;
            }
        }
        return false;
    }

    function isDeclaredReference (SmartDirectoryStorage storage self, address _referenceAddress) internal view returns (bool){
        for (uint256 i = 0; i < self.references.length; i++) {
            if (self.references[i] == _referenceAddress) {
                return true;
            }
        }
        return false;
    }

    function generateReferenceHash (SmartDirectoryStorage storage self, address _referenceAddress, string _projectId) internal returns(bytes32) {
        return keccak256(abi.encodePacked(-_referenceAddress, -_projectId));
    }

    //SMART DIRECTORY GETTERS

    //smartDirectoryReferenceGet
    function getReference (SmartDirectoryStorage storage self, address _referenceAddress) public view returns(address memory referenceAddress,
        string memory projectID) {
        return;
    }

    //smartDirectoryReferencesCount
    function getRegistrantReferencesCount (SmartDirectoryStorage storage self, address _registrantAddress) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < self.references.length; i++) {
            if(self.referenceData[self.references[i]].registrantAddress == _registrantAddress) {
                count++;
            }
        }
        return count;
    }

    //smartDirectoryReferenceStatusGet
    function getReferenceStatus (address _referenceAddress, uint256 _statusIndex) public view returns (uint256) {
        return;
    }

    //smartDirectoryReferencesListsGet
    function getReferencesLists (address _registrantAddress) public view returns (
        address[] memory referenceAddress,
        string[] memory projectID
    ) {
        return;
    }

    //smartDirectoryRegistrantIndexGet
    function getRegistrantIndex () external view returns(uint8) {
        return;
    }

    //smartDirectoryRegistrantLastIndexGet
    function getRegistrantLastIndex (SmartDirectoryStorage storage self) external view returns(uint256) {
        return self.registrants.length-1;
    }

    //smartDirectoryRegistrantUriGet
    function getRegistrantUri (SmartDirectoryStorage storage self, address _registrantAddress) external view returns(string memory) {
        return self.registrantUris[_registrantAddress];
    }

}