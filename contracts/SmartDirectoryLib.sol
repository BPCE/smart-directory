//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

library SmartDirectoryLib {

    string private constant VERSION = "SDL 1.0";

    //DATA STRUCTURES

    enum ActivationCode {
        pending,  // SmartDirectory is not activated : no functions available
        active,   // SmartDirectory is activated : all functions available
        closed    // SmartDirectory is closed : no transactions or updates allowed
    }

    enum MintCode {
        restricted,  // Only parent addresses can create references
        open    // Any addresses can create references
    }

    struct ReferenceStatus {
        uint8 status;
        uint256 timeStamp;
    }

    struct Reference {
        address registrantAddress;
        address referenceAddress;
        string projectId;
        //bytes32 referenceHash;
        string referenceType;
        string referenceVersion;
        ReferenceStatus [] referenceStatus;
    }

    struct SmartDirectoryStorage {
        address[2] parents;
        uint8 contractVersion;
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
        uint8 status
    );

    event NewRegistrant (
        address indexed registrant,
        string registrantUri
    );

    //CONSTRUCTOR

    function init(SmartDirectoryStorage storage self,
        address _parent1,
        address _parent2,
        uint8 _contractVersion,
        uint8 _contractType,
        string memory _contractUri,
        uint8 _mintCode) public {

        require(_mintCode < 2, "invalid mintCode value");

        self.parents[0] = _parent1;
        self.parents[1] = _parent2;
        self.contractVersion = _contractVersion;
        self.contractType = _contractType;
        self.contractUri = _contractUri;

        self.activationCode = ActivationCode.pending;
        self.mintCode = MintCode(_mintCode);
        emit SmartDirectoryCreated(_parent1, _parent2, _contractUri);
    }

    //SMART DIRECTORY SETTERS

    //REFERENCES
    //smartDirectoryReferenceEoaCreate
    function addReference (SmartDirectoryStorage storage self, address _referenceAddress, string memory _projectId,
        string memory _referenceType, string memory _referenceVersion, uint8 _status, string memory _registrantUri)
    public returns (bool) {

        require (_referenceAddress != address(0x0), "address null");
        require (!isDeclaredReference(self, _referenceAddress), "already registered");
        require (!isDeclaredRegistrant(self, msg.sender), "already registered");


        Reference storage ref = self.referenceData[_referenceAddress];
        ref.registrantAddress = msg.sender;
        ref.referenceAddress = _referenceAddress;
        ref.projectId = _projectId;
        ref.referenceType = _referenceType;
        ref.referenceVersion = _referenceVersion;
        ref.referenceStatus.push(ReferenceStatus(_status, block.timestamp));

        self.references.push(_referenceAddress);

        self.registrants.push(msg.sender);
        self.registrantUris[msg.sender] = _registrantUri;

        emit NewReference(msg.sender, _referenceAddress, _projectId);
        emit NewRegistrant(msg.sender, _registrantUri);
        return true;
    }

    //smartDirectoryReferenceStatusEoaUpdate
    function updateReferenceStatus (SmartDirectoryStorage storage self, address _referenceAddress,
        uint8 _status) public returns (bool) {

        require (isDeclaredReference(self,_referenceAddress), "undeclared contract");
        require (isDeclaredRegistrant(self, msg.sender), "undeclared registrant");

        self.referenceData[_referenceAddress].referenceStatus.push(ReferenceStatus(_status,
            block.timestamp));

        emit ReferenceStatusUpdate(msg.sender, _referenceAddress, _status);
        return true;
    }

    //REGISTRANTS
    //smartDirectoryRegistrantUriEoaWrite
    function updateRegistrantUri (SmartDirectoryStorage storage self, string memory _registrantUri) public
    returns(bool) {

        require (isDeclaredRegistrant(self, msg.sender), "unknown registrant");

        self.registrantUris[msg.sender] = _registrantUri;

        return true;
    }

    //SMART DIRECTORY GETTERS

    //REFERENCES
    //smartDirectoryReferenceGet
    function getReference (SmartDirectoryStorage storage self, address _referenceAddress) public view returns(
        address registrantAddress,
        address referenceAddress,
        string memory projectId,
      //bytes32 memory referenceHash,
        string memory referenceType,
        string memory referenceVersion,
        uint8 status,
        uint256 timeStamp) {

        Reference storage ref = self.referenceData[_referenceAddress];

        (uint8 latestStatus, uint256 latestTimeStamp) = getReferenceLastStatus(ref.referenceStatus);

        return (
            ref.registrantAddress,
            ref.referenceAddress,
            ref.projectId,
          //ref.referenceHash,
            ref.referenceType,
            ref.referenceVersion,
            latestStatus,
            latestTimeStamp
        );
    }

    //smartDirectoryReferenceStatusGet
    function getReferenceStatus (SmartDirectoryStorage storage self, address _referenceAddress, uint256 _index)
    public view returns(uint8 status, uint256 timeStamps) {

        require(_index < self.referenceData[_referenceAddress].referenceStatus.length, "index out of range");

        Reference storage ref = self.referenceData[_referenceAddress];

        return(ref.referenceStatus[_index].status, ref.referenceStatus[_index].timeStamp);
    }

    //smartDirectoryReferencesListsGet
    function getReferencesLists (SmartDirectoryStorage storage self, address _registrantAddress) public view
    returns(address[] memory referenceAddress, string[] memory projectId) {

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

    //REGISTRANTS
    //smartDirectoryRegistrantUriGet
    function getRegistrantUri (SmartDirectoryStorage storage self, address _registrantAddress) external view
    returns(string memory) {
        return self.registrantUris[_registrantAddress];
    }

    //smartDirectoryRegistrantLastIndexGet
    function getRegistrantLastIndex (SmartDirectoryStorage storage self) external view returns(uint256) {
        return self.registrants.length-1;
    }

    //smartDirectoryRegistrantIndexGet
    function getRegistrantIndex (SmartDirectoryStorage storage self, address _registrantAddress) external view
    returns(uint256) {

        for (uint256 i = 0; i < self.references.length; i++) {
            if (self.registrants[i] == _registrantAddress) {
                return i;
            }
        }
        return type(uint256).max;
    }

    //SMART DIRECTORY INTERNAL FUNCTIONS
    function version() public pure returns(string memory) {
        return VERSION;
    }

    function isParent(SmartDirectoryStorage storage self, address _from) public view returns (bool) {
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

    /*function generateReferenceHash (SmartDirectoryStorage storage self, address _referenceAddress, string _projectId)
        internal returns(bytes32) {

        return keccak256(abi.encodePacked(_referenceAddress, -_projectId));
    }*/

    function getReferenceLastStatus (ReferenceStatus[] storage statuses) internal view
    returns(uint8 status, uint256 timeStamp) {

        if (statuses.length > 0) {
            ReferenceStatus storage lastStatus = statuses[statuses.length - 1];
            return (lastStatus.status, lastStatus.timeStamp);
        } else {
            return (0,0);
        }
    }

    //smartDirectoryActivationCodeEoaUpdate
    function setSmartDirectoryActivation(SmartDirectoryStorage storage self, ActivationCode _code) public {

        require(isParent(self, msg.sender), "unauthorized access: only parent may call this function");
        require(self.activationCode == ActivationCode.pending || self.activationCode == ActivationCode.active &&
        _code != ActivationCode.pending, "SmartDirectory activation cannot be modified");

        self.activationCode = _code;

        emit SmartDirectoryActivationUpdate(msg.sender, _code);
    }

    //smartDirectoryHeadersGet (smartDirectoryAddress)
    function getSmartDirectoryHeaders (SmartDirectoryStorage storage self) public view returns(
        address parent1,
        address parent2,
        uint8 contractVersion,
        uint8 contractType,
        string memory contractUri,
        ActivationCode activationCode,
        MintCode mintCode) {

        require(isParent(self, msg.sender), "unauthorized access: only parent may call this function");

        return(
            self.parents[0],
            self.parents[1],
            self.contractVersion,
            self.contractType,
            self.contractUri,
            self.activationCode,
            self.mintCode
        );
    }

}