//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

contract SmartDirectory {

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
        address indexed parent1,
        address indexed parent2
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
    /*
    //smartDirectoryRegistrantEoaAdd
    function addRegistrant (SmartDirectoryStorage storage self, string _registrantUri) public returns (bool) {
        require (isDeclaredRegistrant(msg.sender) != true, "already registered");

        self.registrants.push = msg.sender;
        self.registrantUris[msg.sender] = _registrantUri;

        emit NewRegistrant(msg.sender, _registrantUri);
        return true;
    }
    */

    //smartDirectoryReferenceEoaCreate
    function addReference (SmartDirectoryStorage storage self, address _referenceAddress, string _projectID,
        string _referenceType, string _referenceVersion, uint8 _status, string _registrantUri) public returns (bool) {

        require (_referenceAddress != address(0x0), "address null");
        require (!isDeclaredReference(self, _referenceAddress), "already registered");
        require (!isDeclaredRegistrant(self, msg.sender), "already registered");

        self.referenceData[_referenceAddress].registrantAddress = msg.sender;
        self.referenceData[_referenceAddress].referenceAddress = _referenceAddress;
        self.referenceData[_referenceAddress].projectID = _projectID;
        self.referenceData[_referenceAddress].referenceType = _referenceType;
        self.referenceData[_referenceAddress].referenceVersion = _referenceVersion;
        self.referenceData[_referenceAddress].referenceStatus.status = _status;
        self.referenceData[_referenceAddress].referenceStatus.timeStamp = block.timestamp;

        self.registrants.push = msg.sender;
        self.registrantUris[msg.sender] = _registrantUri;

        emit NewReference(msg.sender, _referenceAddress, _projectID);
        emit NewRegistrant(msg.sender, _registrantUri);
        return true;
    }

    //smartDirectoryReferenceStatusEoaUpdate
    function updateReferenceStatus (SmartDirectoryStorage storage self, address _referenceAddress, string projectID,
        uint8 _status) public override returns (bool) {

        require (isDeclaredReference(_referenceAddress) != false , "undeclared contract");

        self.referenceData[_referenceAddress].referenceStatus.status = _status;
        self.referenceData[_referenceAddress].referenceStatus.timestamp = block.timestamp;

        return true;
    }

    //smartDirectoryRegistrantUriEoaWrite
    function updateRegistrantUri (SmartDirectoryStorage storage self, string _registrantUri) public override returns (bool) {

        require (isDeclaredRegistrant(msg.sender) != false, "unknown registrant");

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
        keccak256();
        return;
    }

    //SMART DIRECTORY GETTERS

    //smartDirectoryReferenceGet
    function getReference (SmartDirectoryStorage storage self, address _referenceAddress) public view returns(address memory referenceAddress,
        string memory projectID) {
        return;
    }

    //smartDirectoryReferencesCount
    function getReferencesCount (SmartDirectoryStorage storage self, address _registrantAddress) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < self.references.length; i++) {
            count++;
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
        return self.registrants.length;
    }

    //smartDirectoryRegistrantUriGet
    function getRegistrantUri (SmartDirectoryStorage storage self, address _registrantAddress) external view returns(string memory) {
        return self.registrants[_registrantAddress].registrantUri;
    }

}