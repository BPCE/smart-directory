//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

// specific versions accepted by remix
//import "@openzeppelin/contracts@4.4.0/utils/math/SafeMath.sol";
//import "@openzeppelin/contracts@4.4.0/token/ERC721/ERC721.sol";
//import "@openzeppelin/contracts@4.4.0/utils/Counters.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// documentation here: https://docs.openzeppelin.com/contracts/4.x/api/token/erc721

library SmartDirectoryLib {

    string private constant VERSION = "SDL 1.15";

    //DATA STRUCTURES

    enum ActivationCode {
        pending,  // SmartDirectory is not activated : no functions available
        active,   // SmartDirectory is activated : all functions available
        closed    // SmartDirectory is closed : no transactions or updates allowed
    }

    enum AdminCode {
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

    struct Registrant {
        string Uri;
        uint256 index;
    }

    struct SmartDirectoryStorage {
        address[2] parents;
        string contractUri;
        ActivationCode activationCode;
        AdminCode adminCode;
        address [] registrants;
        mapping (address => Registrant) registrantData;
        address [] references;
        mapping (address => Reference) referenceData;
    }

    //EVENTS

    event SmartDirectoryCreated (
        address indexed parentAddress1,
        address indexed parentAddress2,
        string indexed contractUri
    );

    event SmartDirectoryActivationUpdated (
        address indexed from,
        ActivationCode activationCode
    );

    event ReferenceCreated (
        address indexed registrant,
        address indexed referenceAddress,
        string projectId
    );

    event ReferenceStatusUpdated (
        address indexed registrant,
        address indexed referenceAddress,
        string indexed status
    );

    event RegistrantCreated (
        address indexed registrant
    );

    event RegistrantUriUpdated (
        address indexed registrant,
        string indexed registrantUri
    );

    event RegistrantDisabled (
        address indexed registrant
    );

    //CONSTRUCTOR

    function init (SmartDirectoryStorage storage self,
        address _parent1,
        address _parent2,
        string memory _contractUri,
        uint8 _adminCode) public {

        require(_adminCode < 2, "adminCode value too large");

        self.parents[0] = _parent1;
        self.parents[1] = _parent2;
        self.contractUri = _contractUri;

        self.activationCode = ActivationCode.pending;
        self.adminCode = AdminCode(_adminCode);
        self.registrants.push(address(0)); // list of addresses start at 1
        self.references.push(address(0)); // list of references start at 1
        emit SmartDirectoryCreated(_parent1, _parent2, _contractUri);
    }

    //MODIFIERS
    modifier onlyActive(SmartDirectoryStorage storage self) {
        require(self.activationCode == ActivationCode.active, "SmartDirectory has not been activated");
        _;
    }

  // VALIDITY CHECKS

    function isParent(SmartDirectoryStorage storage self, address _from) internal view returns (bool) {
        return _from == self.parents[0] || _from == self.parents[1];
    }

    function isValidRegistrant (SmartDirectoryStorage storage self, address _registrantAddress) 
                    internal view returns(bool) {
        return self.registrantData[_registrantAddress].index != 0;
    }

    function isDeclaredReference (SmartDirectoryStorage storage self, address _referenceAddress)
                    internal view returns(bool) {
        return self.referenceData[_referenceAddress].registrantAddress   != address(0);
    }

    //REFERENCE MANAGEMENT

    //SETTERS

    function addReference (SmartDirectoryStorage storage self, address _referenceAddress, string memory _projectId,
        string memory _referenceType, string memory _referenceVersion, string memory _status) internal onlyActive(self)
    {

        require (_referenceAddress != address(0x0), "reference must not be address 0");
        require (!isDeclaredReference(self, _referenceAddress), "reference already known");

        Reference storage ref = self.referenceData[_referenceAddress];

        ref.registrantAddress = msg.sender;
        ref.referenceAddress = _referenceAddress;
        ref.projectId = _projectId;
        ref.referenceType = _referenceType;
        ref.referenceVersion = _referenceVersion;
        ref.referenceStatus.push(ReferenceStatus("", block.timestamp)); // index 0 is not used
        ref.referenceStatus.push(ReferenceStatus(_status, block.timestamp));

        self.references.push(_referenceAddress);
        emit ReferenceCreated(msg.sender, _referenceAddress, _projectId);

    }

    //smartDirectoryReferenceEoaCreate
    function createReference (SmartDirectoryStorage storage self, address _referenceAddress, string memory _projectId,
        string memory _referenceType, string memory _referenceVersion, string memory _status)
    public returns (bool) {

        if (getAdminCode(self) == AdminCode.parentsAuthorized) {

            require (isValidRegistrant(self, msg.sender), "unknown or disabled registrant");
            addReference(self, _referenceAddress, _projectId, _referenceType,
                _referenceVersion, _status);

        } else if (getAdminCode(self) == AdminCode.selfDeclaration) {

            if (!isValidRegistrant(self, msg.sender)) {
                addReference(self, _referenceAddress, _projectId,
                    _referenceType, _referenceVersion, _status);

                Registrant memory registrant;
                registrant.index = self.registrants.length;

                self.registrants.push(msg.sender);
                self.registrantData[msg.sender] = registrant;
                emit RegistrantCreated(msg.sender);

            } else if (isValidRegistrant(self, msg.sender)) {
                addReference(self, _referenceAddress, _projectId,
                    _referenceType, _referenceVersion, _status);
            }
        }
        return true;
    }

    //smartDirectoryReferenceStatusEoaUpdate
    function updateReferenceStatus (SmartDirectoryStorage storage self, address _referenceAddress,
        string memory _status) public onlyActive(self) {

        require (isValidRegistrant(self, msg.sender), "unknown or disabled registrant");
        require (isDeclaredReference(self,_referenceAddress), "unknown reference");

        self.referenceData[_referenceAddress].referenceStatus.push(ReferenceStatus(_status,
            block.timestamp));

        emit ReferenceStatusUpdated(msg.sender, _referenceAddress, _status);

    }

        //GETTERS

    //smartDirectoryReferenceGet
    function getReference (SmartDirectoryStorage storage self, address _referenceAddress) public view returns(
        address registrantAddress,
        uint256 registrantIndex,
        address referenceAddress,
        string memory projectId,
        string memory referenceType,
        string memory referenceVersion,
        string memory status,
        uint256 timeStamp) {

        Reference storage ref = self.referenceData[_referenceAddress];

        require(ref.referenceAddress != address(0), "unknown reference");

        uint256 index = getRegistrantIndex(self,ref.registrantAddress);
        (string memory latestStatus, uint256 latestTimeStamp) = getReferenceLastStatus(ref.referenceStatus);

        return (
            ref.registrantAddress,
            index,
            ref.referenceAddress,
            ref.projectId,
            ref.referenceType,
            ref.referenceVersion,
            latestStatus,
            latestTimeStamp
        );
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

    //smartDirectoryReferenceStatusGet
    function getReferenceStatus(SmartDirectoryStorage storage self, address _referenceAddress) public view returns
        (string memory status, uint256 timeStamp) {

        require(isDeclaredReference(self, _referenceAddress), "unknown reference");
        uint256 index = self.referenceData[_referenceAddress].referenceStatus.length -1;

        Reference storage ref = self.referenceData[_referenceAddress];

        return(ref.referenceStatus[index].status, ref.referenceStatus[index].timeStamp);
    }

    //smartDirectoryReferenceStatusAtIndexGet
    function getReferenceStatusAtIndex (SmartDirectoryStorage storage self, address _referenceAddress, uint256 _index)
    public view returns(string memory status, uint256 timeStamp) {

        require(_index < self.referenceData[_referenceAddress].referenceStatus.length, "index too large");
        require(_index > 0, "index 0 is not used");

        Reference storage ref = self.referenceData[_referenceAddress];

        return(ref.referenceStatus[_index].status, ref.referenceStatus[_index].timeStamp);
    }

    function getReferenceLastStatusIndex (SmartDirectoryStorage storage self, address _referenceAddress) public view
    returns(uint256) {
        require(isValidRegistrant(self,self.referenceData[_referenceAddress].registrantAddress),
            "unknown reference");
        return self.referenceData[_referenceAddress].referenceStatus.length-1;
    }

    //smartDirectoryReferencesListsGet
    function getReferencesLists (SmartDirectoryStorage storage self, address _registrantAddress) public view
    returns(address[] memory referenceAddresses, string[] memory projectIDs) {

        uint256 count = getRegistrantReferencesCount(self, _registrantAddress);
        address[] memory references = new address[](count);
        string[] memory projectIds = new string[](count);

        uint256 index = 0;
        for (uint256 i = 1; i < self.references.length; i++) {
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

    function createRegistrantInternal(SmartDirectoryStorage storage self, address _registrantAddress) private {
        Registrant memory registrant;
        registrant.index = self.registrants.length;

        self.registrants.push(_registrantAddress);
        self.registrantData[_registrantAddress] = registrant;
        emit RegistrantCreated(_registrantAddress);
    }

    //smartDirectoryRegistrantEoaCreate
    function createRegistrant (SmartDirectoryStorage storage self, address _registrantAddress) public onlyActive(self) {

        //SmartDirectory must be in parentsAuthorized mode
        require (getAdminCode(self) == AdminCode.parentsAuthorized, "in selfDeclaration mode, just create a reference, registrant will be create from msg.sender");
        require(isParent(self, msg.sender), "unauthorized access: only one of the parents may create a registrant");
        require(self.registrantData[_registrantAddress].index == 0, "registrant already known");

        createRegistrantInternal(self, _registrantAddress);
    }

    //smartDirectoryRegistrantEoaDisable
    function disableRegistrant (SmartDirectoryStorage storage self, address _registrantAddress) public onlyActive(self)
    {

        uint256 registrantIndex = getRegistrantIndex(self,_registrantAddress);

        require(registrantIndex <= self.registrants.length, "Index too large");
        require(registrantIndex > 0 , "Index must be greater than 0");
        require(getAdminCode(self) == AdminCode.parentsAuthorized, "SmartDirectory must be in parentsAuthorized mode");
        require(isParent(self, msg.sender), "unauthorized access: only parent may call this function");
        require(isValidRegistrant(self, _registrantAddress),"registrant not known");

        self.registrantData[_registrantAddress].index = 0;

        emit RegistrantDisabled(_registrantAddress);
    }

    //smartDirectoryRegistrantUriEoaWrite
    function updateRegistrantUri (SmartDirectoryStorage storage self, string memory _registrantUri) public
    onlyActive(self) returns(bool) {

        require (isValidRegistrant(self, msg.sender), "unknown registrant");

        self.registrantData[msg.sender].Uri = _registrantUri;
        emit RegistrantUriUpdated(msg.sender, _registrantUri);

        return true;
    }

        //GETTERS

    //smartDirectoryDisabledRegistrantsListGet
    function getDisabledRegistrants(SmartDirectoryStorage storage self) public view returns
        (address[] memory) {

        uint256 disabledCount = 0;
        for (uint256 i = 1; i < self.registrants.length; i++) {
            if (self.registrantData[self.registrants[i]].index == 0) {
                disabledCount++;
            }
        }

        address[] memory disabledRegistrants = new address[](disabledCount);
        uint256 index = 0;

        for (uint256 i = 1; i < self.registrants.length; i++) {
            if (self.registrantData[self.registrants[i]].index == 0) {
                disabledRegistrants[index] = self.registrants[i];
                index++;
            }
        }

        return disabledRegistrants;
    }

    //smartDirectoryRegistrantAtIndexGet
    function getRegistrantAtIndex (SmartDirectoryStorage storage self, uint256 _registrantIndex) public view
    returns(address registrantAddress, string memory registrantUri) {

        require(_registrantIndex < self.registrants.length, "Index too large");
        require(_registrantIndex > 0, "Index 0 is not used, list starts at 1");

        address searchedAddress = self.registrants[_registrantIndex];
        string memory searchedUri = getRegistrantUri(self,searchedAddress);

        return (searchedAddress, searchedUri);
    }

    function getRegistrantIndex (SmartDirectoryStorage storage self, address _registrantAddress) internal view
    returns(uint256) {
        return self.registrantData[_registrantAddress].index;
    }

    //smartDirectoryRegistrantUriGet
    function getRegistrantUri (SmartDirectoryStorage storage self, address _registrantAddress) public view
    returns(string memory) {
        require (self.registrantData[_registrantAddress].index > 0, "unknown registrant");
        return self.registrantData[_registrantAddress].Uri;
    }

    //smartDirectoryReferencesCount
    // TODO add a list in registrantData ?
    function getRegistrantReferencesCount (SmartDirectoryStorage storage self, address _registrantAddress) public view
    returns (uint256) {

        uint256 count = 0;
        for (uint256 i = 1; i < self.references.length; i++) {
            if(self.referenceData[self.references[i]].registrantAddress == _registrantAddress) {
                count++;
            }
        }
        return count;
    }

    //smartDirectoryRegistrantLastIndexGet
    function getRegistrantLastIndex (SmartDirectoryStorage storage self) public view returns(uint256) {
        return self.registrants.length-1;
    }

    //SMART DIRECTORY UTILITY FUNCTIONS

    function version() public pure returns(string memory) {
        return VERSION;
    }

    function getParent1(SmartDirectoryStorage storage self) public view returns(address) {
        return self.parents[0];
    }

    function getParent2(SmartDirectoryStorage storage self) public view returns(address) {
        return self.parents[1];
    }

    function getContractUri(SmartDirectoryStorage storage self) public view returns(string memory) {
        return self.contractUri;
    }

    function getAdminCode(SmartDirectoryStorage storage self) public view returns(AdminCode) {
        return self.adminCode;
    }

    function getActivationCode(SmartDirectoryStorage storage self) public view returns(ActivationCode) {
        return self.activationCode;
    }

    //smartDirectoryActivationCodeEoaUpdate
    function setActivationCode(SmartDirectoryStorage storage self, ActivationCode _activationCode)
    external {

        require(isParent(self, msg.sender), "unauthorized access: only a parent may call this function");
        require(self.activationCode == ActivationCode.pending || self.activationCode == ActivationCode.active,
            "SmartDirectory activation code cannot be modified");
        require(_activationCode == ActivationCode.active || _activationCode == ActivationCode.closed,
            "invalid activation value");

        self.activationCode = _activationCode;

        emit SmartDirectoryActivationUpdated(msg.sender, _activationCode);

    }

}
