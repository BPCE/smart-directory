//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

// specific versions accepted by remix
//import "@openzeppelin/contracts@4.4.0/utils/math/SafeMath.sol";
//import "@openzeppelin/contracts@4.4.0/token/ERC721/ERC721.sol";
//import "@openzeppelin/contracts@4.4.0/utils/Counters.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// documentation here: https://docs.openzeppelin.com/contracts/4.x/api/token/erc721

library SmartDirectoryLib {

    string private constant VERSION = "SDL 1.0";

    using Counters for Counters.Counter;

    //DATA STRUCTURES

    enum ActivationCode {
        pending,  // SmartDirectory is not activated : no functions available
        active,   // SmartDirectory is activated : all functions available
        closed    // SmartDirectory is closed : no transactions or updates allowed
    }

    enum MintCode {
        parentsAuthorized,  // Only addresses registered by parents can create references
        selfDeclaration     // Any addresses can create references
    }

    struct ReferenceStatus {
        string status;
        uint256 timeStamp;
    }

    struct Reference {
        address registrantAddress;
        address referenceAddress;
        string projectId;
        string referenceType;
        string referenceVersion;
        ReferenceStatus [] referenceStatus;
    }

    struct SmartDirectoryStorage {
        address[2] parents;
        string contractVersion;
        uint8 contractType;
        string contractUri;
        ActivationCode activationCode;
        MintCode mintCode;
        address [] registrants;
        mapping (address => string) registrantUris;
        address [] references;
        mapping (address => Reference) referenceData;
    }

    //EVENTS

    event SmartDirectoryCreated (
        address indexed parentAddress1,
        address indexed parentAddress2,
        string indexed contractUri
    );

    event SmartDirectoryActivationUpdate (
        address indexed from,
        ActivationCode activationCode
    );

    event NewReference (
        address indexed registrant,
        address indexed referenceAddress,
        string indexed projectId
    );

    event ReferenceStatusUpdate (
        address indexed registrant,
        address indexed referenceAddress,
        string indexed status
    );

    event NewRegistrant (
        address indexed registrant
    );

    event NewRegistrantUri (
        address indexed registrant,
        string indexed registrantUri
    );

    //CONSTRUCTOR

    function init (SmartDirectoryStorage storage self,
        address _parent1,
        address _parent2,
        string memory _contractVersion,
        uint8 _contractType,
        string memory _contractUri,
        uint8 _mintCode) public {

        require(_mintCode < 2, "invalid mintCode value");

        self.parents[0] = _parent1;
        self.parents[1] = _parent2;
        self.contractVersion =string.concat(_contractVersion, VERSION);
        self.contractType = _contractType;
        self.contractUri = _contractUri;

        self.activationCode = ActivationCode.pending;
        self.mintCode = MintCode(_mintCode);
        emit SmartDirectoryCreated(_parent1, _parent2, _contractUri);
    }


    //REFERENCE MANAGEMENT

        //SETTERS

    //smartDirectoryReferenceEoaCreate
    function createReference (SmartDirectoryStorage storage self, address _referenceAddress, string memory _projectId,
        string memory _referenceType, string memory _referenceVersion, string memory _status)
    public returns (bool) {

        if (getSmartDirectoryMintCode(self) == MintCode.parentsAuthorized) {

            require (isDeclaredRegistrant(self, msg.sender));
            addReference(self, _referenceAddress, _projectId, _referenceType,
                _referenceVersion, _status);

        } else if (getSmartDirectoryMintCode(self) == MintCode.selfDeclaration) {

            if (!isDeclaredRegistrant(self, msg.sender)) {

                addReference(self, _referenceAddress, _projectId,
                    _referenceType, _referenceVersion, _status);
                self.registrants.push(msg.sender);
                emit NewRegistrant(msg.sender);

            } else if (isDeclaredRegistrant(self, msg.sender)) {

                addReference(self, _referenceAddress, _projectId,
                    _referenceType, _referenceVersion, _status);

            }
        }

        return true;

    }

    function addReference (SmartDirectoryStorage storage self, address _referenceAddress, string memory _projectId,
        string memory _referenceType, string memory _referenceVersion, string memory _status)
    internal {

        require (_referenceAddress != address(0x0), "Invalid reference address");
        require (!isDeclaredReference(self, _referenceAddress), "reference already registered");

        Reference storage ref = self.referenceData[_referenceAddress];

        ref.registrantAddress = msg.sender;
        ref.referenceAddress = _referenceAddress;
        ref.projectId = _projectId;
        ref.referenceType = _referenceType;
        ref.referenceVersion = _referenceVersion;
        ref.referenceStatus.push(ReferenceStatus(_status, block.timestamp));

        self.references.push(_referenceAddress);
        emit NewReference(msg.sender, _referenceAddress, _projectId);

    }

    //smartDirectoryReferenceStatusEoaUpdate
    function updateReferenceStatus (SmartDirectoryStorage storage self, address _referenceAddress,
        string memory _status) public {

        require (isDeclaredReference(self,_referenceAddress), "undeclared contract");
        require (isDeclaredRegistrant(self, msg.sender), "undeclared registrant");

        self.referenceData[_referenceAddress].referenceStatus.push(ReferenceStatus(_status,
            block.timestamp));

        emit ReferenceStatusUpdate(msg.sender, _referenceAddress, _status);

    }

        //GETTERS

    //smartDirectoryReferenceGet
    function getReference (SmartDirectoryStorage storage self, address _referenceAddress) public view returns(
        address registrantAddress,
        address referenceAddress,
        string memory projectId,
        string memory referenceType,
        string memory referenceVersion,
        string memory status,
        uint256 timeStamp) {

        Reference storage ref = self.referenceData[_referenceAddress];

        (string memory latestStatus, uint256 latestTimeStamp) = getReferenceLastStatus(ref.referenceStatus);

        return (
            ref.registrantAddress,
            ref.referenceAddress,
            ref.projectId,
            ref.referenceType,
            ref.referenceVersion,
            latestStatus,
            latestTimeStamp
        );
    }

    //smartDirectoryReferenceStatusGet
    function getReferenceStatus (SmartDirectoryStorage storage self, address _referenceAddress, uint256 _index)
    public view returns(string memory status, uint256 timeStamps) {

        require(_index < self.referenceData[_referenceAddress].referenceStatus.length, "index out of range");

        Reference storage ref = self.referenceData[_referenceAddress];

        return(ref.referenceStatus[_index].status, ref.referenceStatus[_index].timeStamp);
    }

    function getReferenceLastStatus (ReferenceStatus[] storage statuses) public view
    returns(string memory status, uint256 timeStamp) {

        if (statuses.length > 0) {
            ReferenceStatus storage lastStatus = statuses[statuses.length - 1];
            return (lastStatus.status, lastStatus.timeStamp);
        } else {
            return ("null",0);
        }
    }

    function getReferenceLastStatusIndex (SmartDirectoryStorage storage self, address _referenceAddress) public view
    returns(uint256) {
        return self.referenceData[_referenceAddress].referenceStatus.length-1;
    }

    //smartDirectoryReferencesListsGet
    function getReferencesLists (SmartDirectoryStorage storage self, address _registrantAddress) public view
    returns(address[] memory referenceAddresses, string[] memory projectIDs) {

        uint256 count = getRegistrantReferencesCount(self, _registrantAddress);
        address[] memory references = new address[](count);
        string[] memory projectIds = new string[](count);

        uint256 index = 0;
        for (uint256 i = 0; i < self.references.length; i++) {
            if(self.referenceData[self.references[i]].registrantAddress == _registrantAddress) {
                references[index] = self.references[i];
                projectIds[index] = self.referenceData[self.references[i]].projectId;
                index++;
            }
        }

        return (references, projectIds);
    }

    //REGISTRANTS MANAGEMENT

        //SETTERS

    //smartDirectoryRegistrantEoaCreate (smartDirectoryAddress, registrant_address)
    function createRegistrant (SmartDirectoryStorage storage self, address _registrantAddress) public returns (bool) {

        require(getSmartDirectoryMintCode(self) == MintCode.parentsAuthorized, "SmartDirectory must be in parentsAuthorized mode");
        require(isParent(self, msg.sender), "unauthorized access: only parent may call this function");

        self.registrants.push(_registrantAddress);
        emit NewRegistrant(_registrantAddress);
        return true;

    }

    //smartDirectoryRegistrantUriEoaWrite
    function updateRegistrantUri (SmartDirectoryStorage storage self, string memory _registrantUri) public
    returns(bool) {

        require (isDeclaredRegistrant(self, msg.sender), "unknown registrant");

        self.registrantUris[msg.sender] = _registrantUri;
        emit NewRegistrantUri(msg.sender, _registrantUri);

        return true;

    }

        //GETTERS

    //smartDirectoryRegistrantUriGet
    function getRegistrantUri (SmartDirectoryStorage storage self, address _registrantAddress) public view
    returns(string memory) {
        return self.registrantUris[_registrantAddress];
    }

    //smartDirectoryReferencesCount
    function getRegistrantReferencesCount (SmartDirectoryStorage storage self, address _registrantAddress) public view
    returns (uint256) {

        uint256 count = 0;
        for (uint256 i = 0; i < self.references.length; i++) {
            if(self.referenceData[self.references[i]].registrantAddress == _registrantAddress) {
                count++;
            }
        }
        return count;
    }

    //smartDirectoryRegistrantIndexGet
    function getRegistrantIndex (SmartDirectoryStorage storage self, uint256 _registrantIndex) public view
    returns(address registrantAddress, string memory registrantUri) {

        require(_registrantIndex < self.registrants.length, "Index out of bounds");

        address searchedAddress = self.registrants[_registrantIndex];
        string memory searchedUri = getRegistrantUri(self,searchedAddress);

        return (searchedAddress, searchedUri);
    }

    //smartDirectoryRegistrantLastIndexGet
    function getRegistrantLastIndex (SmartDirectoryStorage storage self) public view returns(uint256) {
        return self.registrants.length-1;
    }

    //SMART DIRECTORY UTILITY FUNCTIONS

    function version() public pure returns(string memory) {
        return VERSION;
    }

    function isParent(SmartDirectoryStorage storage self, address _from) internal view returns (bool) {
        return _from == self.parents[0] || _from == self.parents[1];
    }

    function isDeclaredRegistrant (SmartDirectoryStorage storage self, address _registrantAddress) internal view
    returns(bool) {

        for (uint256 i = 0; i < self.registrants.length; i++) {
            if (self.registrants[i] == _registrantAddress) {
                return true;
            }
        }
        return false;
    }

    function isDeclaredReference (SmartDirectoryStorage storage self, address _referenceAddress) internal view
    returns(bool) {

        for (uint256 i = 0; i < self.references.length; i++) {
            if (self.references[i] == _referenceAddress) {
                return true;
            }
        }
        return false;
    }

    function getSmartDirectoryContractVersion(SmartDirectoryStorage storage self) public view returns(string memory) {
        return self.contractVersion;
    }

    function getSmartDirectoryParent1(SmartDirectoryStorage storage self) public view returns(address) {
        return self.parents[0];
    }

    function getSmartDirectoryParent2(SmartDirectoryStorage storage self) public view returns(address) {
        return self.parents[1];
    }

    function getSmartDirectoryContractType(SmartDirectoryStorage storage self) public view returns(uint8) {
        return self.contractType;
    }

    function getSmartDirectoryActivationCode(SmartDirectoryStorage storage self) public view returns(ActivationCode) {
        return self.activationCode;
    }

    function getSmartDirectoryContractUri(SmartDirectoryStorage storage self) public view returns(string memory) {
        return self.contractUri;
    }

    function getSmartDirectoryMintCode(SmartDirectoryStorage storage self) public view returns(MintCode) {
        return self.mintCode;
    }

    //smartDirectoryActivationCodeEoaUpdate
    function setSmartDirectoryActivationCode(SmartDirectoryStorage storage self, ActivationCode _activationCode)
    public returns(bool) {

        require(isParent(self, msg.sender), "unauthorized access: only parent may call this function");
        require(self.activationCode == ActivationCode.pending || self.activationCode == ActivationCode.active,
            "SmartDirectory activation cannot be modified");
        require(_activationCode == ActivationCode.active || _activationCode == ActivationCode.closed,
            "invalid activation value");

        self.activationCode = _activationCode;

        emit SmartDirectoryActivationUpdate(msg.sender, _activationCode);

        return true;
    }

}