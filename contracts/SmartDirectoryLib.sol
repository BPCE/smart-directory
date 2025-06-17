//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library SmartDirectoryLib {

    string private constant VERSION = "SDL 1.17";

    // DATA STRUCTURES

    enum ActivationCode {
        pending,  // SmartDirectory is not activated: no functions available
        active,   // SmartDirectory is activated: all functions available
        closed    // SmartDirectory is closed: no transactions or updates allowed
    }

    enum AdminCode {
        parentsAuthorized,  // Only addresses registered by parents can create references
        selfDeclaration     // Any addresses can create references
    }

    struct ReferenceStatus {
        string status;
        uint256 timeStamp;
    }

    /// @dev Structure packing to optimize memory space and gas costs.
    struct Reference {
        uint96 latestStatusIndex;
        address registrantAddress;
        address referenceAddress;
        string projectId;
        string referenceType;
        string referenceVersion;
        mapping(uint256 => ReferenceStatus) statusHistory;
    }

    struct Registrant {
        string uri;
        uint256 index;
        address[] references;
    }

    /// @dev Structure packing to optimize memory space and gas costs.
    /// Replaced parents[2] array with individual parent1 and parent2 fields.
    struct SmartDirectoryStorage {
        ActivationCode activationCode;
        AdminCode adminCode;
        address parent1;
        address parent2;
        string contractUri;
        address[] registrants;
        mapping(address => Registrant) registrantData;
        mapping(address => Reference) referenceData;
    }

    // EVENTS

    event SmartDirectoryCreated(
        address indexed parentAddress1,
        address indexed parentAddress2,
        uint256 timeStamp
    );

    event SmartDirectoryActivationUpdated(
        address indexed from,
        ActivationCode activationCode,
        uint256 timeStamp
    );

    event ReferenceCreated(
        address indexed registrant,
        address indexed referenceAddress,
        uint256 timeStamp
    );

    event ReferenceStatusUpdated(
        address indexed registrant,
        address indexed referenceAddress,
        uint256 timeStamp
    );

    event RegistrantCreated(
        address indexed registrant,
        address createdBy,
        uint256 timeStamp
    );

    event RegistrantUriUpdated(
        address indexed registrant,
        string indexed registrantUri,
        uint256 timeStamp
    );

    event RegistrantDisabled(
        address indexed registrant,
        uint256 timeStamp
    );

    // CONSTRUCTOR

    function init(
        SmartDirectoryStorage storage self,
        address _parent1,
        address _parent2,
        string memory _contractUri,
        uint8 _adminCode
    ) public {
        require(_adminCode < 2, "adminCode value too large");
        require(_parent1 != address(0), "Parent1 must not be address 0");
        require(_parent2 != address(0), "Parent2 must not be address 0");
        require(_parent1 != _parent2, "Parent1 and Parent2 must be different addresses");

        self.parent1 = _parent1;
        self.parent2 = _parent2;
        self.contractUri = _contractUri;
        self.activationCode = ActivationCode.pending;
        self.adminCode = AdminCode(_adminCode);
        self.registrants.push(address(0)); // list of addresses start at 1

        emit SmartDirectoryCreated(_parent1, _parent2, block.timestamp);
    }

    // MODIFIERS

    modifier onlyActive(SmartDirectoryStorage storage self) {
        require(self.activationCode == ActivationCode.active, "SmartDirectory is not active");
        _;
    }

    modifier onlyParent(SmartDirectoryStorage storage self) {
        require(
            msg.sender == self.parent1 || msg.sender == self.parent2,
            "unauthorized access: only a parent may call this function"
        );
        _;
    }

    modifier onlyParentAndActive(SmartDirectoryStorage storage self) {
        require(
            msg.sender == self.parent1 || msg.sender == self.parent2,
            "unauthorized access: only a parent may call this function"
        );
        require(
            self.activationCode == ActivationCode.active, "SmartDirectory is not active");
        _;
    }

    // VALIDITY CHECKS

    function isValidRegistrant(
        SmartDirectoryStorage storage self,
        address _registrantAddress
    ) public view returns (bool) {
        return self.registrantData[_registrantAddress].index != 0;
    }

    function isDeclaredReference(
        SmartDirectoryStorage storage self,
        address _referenceAddress
    ) internal view returns (bool) {
        return self.referenceData[_referenceAddress].registrantAddress != address(0);
    }

    // REFERENCE MANAGEMENT

        //SETTERS

    function createReferenceInternal(
        SmartDirectoryStorage storage self,
        address _referenceAddress,
        string memory _projectId,
        string memory _referenceType,
        string memory _referenceVersion,
        string memory _status
    ) internal onlyActive(self) {
        require(_referenceAddress != address(0x0), "reference must not be address 0");
        require(!isDeclaredReference(self, _referenceAddress), "reference already known");

        Reference storage ref = self.referenceData[_referenceAddress];

        ref.registrantAddress = msg.sender;
        ref.referenceAddress = _referenceAddress;
        ref.projectId = _projectId;
        ref.referenceType = _referenceType;
        ref.referenceVersion = _referenceVersion;

        uint96 currentIndex = ref.latestStatusIndex + 1;
        ref.statusHistory[currentIndex] = ReferenceStatus(_status, block.timestamp);
        ref.latestStatusIndex = currentIndex;

        self.registrantData[msg.sender].references.push(_referenceAddress);

        emit ReferenceCreated(msg.sender, _referenceAddress, block.timestamp);
    }

    function createReference(
        SmartDirectoryStorage storage self,
        address _referenceAddress,
        string memory _projectId,
        string memory _referenceType,
        string memory _referenceVersion,
        string memory _status
    ) public returns (bool) {
        if (self.adminCode == AdminCode.parentsAuthorized) {
            require(isValidRegistrant(self, msg.sender), "unknown or disabled registrant");
            createReferenceInternal(
                self,
                _referenceAddress,
                _projectId,
                _referenceType,
                _referenceVersion,
                _status
            );
        } else if (self.adminCode == AdminCode.selfDeclaration) {
            if (!isValidRegistrant(self, msg.sender)) {
                createRegistrantInternal(self, msg.sender);
                createReferenceInternal(
                    self,
                    _referenceAddress,
                    _projectId,
                    _referenceType,
                    _referenceVersion,
                    _status
                );
            } else if (isValidRegistrant(self, msg.sender)) {
                createReferenceInternal(
                    self,
                    _referenceAddress,
                    _projectId,
                    _referenceType,
                    _referenceVersion,
                    _status
                );
            }
        }
        return true;
    }

    /// @dev Modified function to restrict status updates to either the reference creator or parent addresses.
    function updateReferenceStatus(
        SmartDirectoryStorage storage self,
        address _referenceAddress,
        string memory _newStatus
    ) public onlyActive(self) {
        require(isValidRegistrant(self, msg.sender), "unknown or disabled registrant");
        require(isDeclaredReference(self, _referenceAddress), "unknown reference");

        Reference storage ref = self.referenceData[_referenceAddress];

        require(
            msg.sender == ref.registrantAddress ||
            msg.sender == self.parent1 ||
            msg.sender == self.parent2,
            "Unauthorized access: only reference owner or parents can call this function"
        );

        uint96 newIndex = ref.latestStatusIndex + 1;
        ref.statusHistory[newIndex] = ReferenceStatus(_newStatus, block.timestamp);
        ref.latestStatusIndex = newIndex;

        emit ReferenceStatusUpdated(msg.sender, _referenceAddress, block.timestamp);
    }

    // GETTERS

    function getReference(
        SmartDirectoryStorage storage self,
        address _referenceAddress
    ) public view returns (
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

        uint256 index = self.registrantData[ref.registrantAddress].index;

        uint256 latestIndex = ref.latestStatusIndex;
        ReferenceStatus storage latestStatus = ref.statusHistory[latestIndex];

        return (
            ref.registrantAddress,
            index,
            ref.referenceAddress,
            ref.projectId,
            ref.referenceType,
            ref.referenceVersion,
            latestStatus.status,
            latestStatus.timeStamp
        );
    }

    function getReferenceStatus(
        SmartDirectoryStorage storage self,
        address _referenceAddress
    ) public view returns
        (string memory status, uint256 timeStamp) {

        Reference storage ref = self.referenceData[_referenceAddress];

        require(isDeclaredReference(self, _referenceAddress), "unknown reference");

        uint256 latestIndex = ref.latestStatusIndex;
        require(latestIndex > 0, "No status found for this reference");

        ReferenceStatus storage latestStatus = ref.statusHistory[latestIndex];

        return(latestStatus.status, latestStatus.timeStamp);
    }

    function getReferenceStatusAtIndex(
        SmartDirectoryStorage storage self,
        address _referenceAddress,
        uint256 _index
    ) public view returns
        (string memory status, uint256 timeStamp) {

        Reference storage ref = self.referenceData[_referenceAddress];
        ReferenceStatus storage statusAtIndex = ref.statusHistory[_index];
        require(isDeclaredReference(self, _referenceAddress), "unknown reference");
        require(_index <= ref.latestStatusIndex, "index too large");
        require(_index > 0, "index 0 is not used");

        return(statusAtIndex.status, statusAtIndex.timeStamp);
    }

    function getReferenceLastStatusIndex(
        SmartDirectoryStorage storage self,
        address _referenceAddress
    ) public view returns(uint256) {

        Reference storage ref = self.referenceData[_referenceAddress];

        require(isValidRegistrant(self,self.referenceData[_referenceAddress].registrantAddress),
            "unknown reference");

        return ref.latestStatusIndex;
    }

    function getReferencesLists(
        SmartDirectoryStorage storage self,
        address _registrantAddress
    ) public view returns(address[] memory referenceAddressesList, string[] memory projectIDsList) {

        require(isValidRegistrant(self, _registrantAddress), "Unknown or disabled registrant");

        address[] storage references = self.registrantData[_registrantAddress].references;
        uint256 count = references.length;

        address[] memory referenceAddressesResult = new address[](count);
        string[] memory projectIDsResult = new string[](count);

        for (uint256 i = 0; i < count; i++) {
            address referenceAddress = references[i];

            require(
                self.referenceData[referenceAddress].registrantAddress == _registrantAddress,
                "Reference does not belong to the given registrant"
            );

            referenceAddressesResult[i] = referenceAddress;
            projectIDsResult[i] = self.referenceData[referenceAddress].projectId;
        }

        return (referenceAddressesResult, projectIDsResult);
    }

    // REGISTRANT MANAGEMENT

        //SETTERS

    function createRegistrantInternal(SmartDirectoryStorage storage self, address _registrantAddress) private {

        Registrant memory registrant = Registrant("", 0, new address[](0));
        registrant.index = self.registrants.length;

        self.registrants.push(_registrantAddress);
        self.registrantData[_registrantAddress] = registrant;
        emit RegistrantCreated(_registrantAddress, msg.sender,block.timestamp);
    }

    function createRegistrant(
        SmartDirectoryStorage storage self,
        address _registrantAddress
    ) public onlyParentAndActive(self) {

        require(
            self.adminCode == AdminCode.parentsAuthorized,
            "in selfDeclaration mode, just create a reference, registrant will be create from msg.sender");
        require(self.registrantData[_registrantAddress].index == 0, "registrant already known");

        createRegistrantInternal(self, _registrantAddress);
    }

    function disableRegistrant(
        SmartDirectoryStorage storage self,
        address _registrantAddress
    ) public onlyParentAndActive(self) {

        uint256 registrantIndex = getRegistrantIndex(self,_registrantAddress);

        require(registrantIndex <= self.registrants.length, "Index too large");
        //require(registrantIndex > 0, "Registrant not found or disabled");
        require(self.adminCode == AdminCode.parentsAuthorized, "SmartDirectory must be in parentsAuthorized mode");
        require(isValidRegistrant(self, _registrantAddress), "Registrant not found or disabled");

        self.registrantData[_registrantAddress].index = 0;
        emit RegistrantDisabled(_registrantAddress, block.timestamp);
    }

    function updateRegistrantUri(
        SmartDirectoryStorage storage self,
        string memory _registrantUri
    ) public onlyActive(self) returns(bool) {

        require(isValidRegistrant(self, msg.sender), "unknown registrant");

        self.registrantData[msg.sender].uri = _registrantUri;
        emit RegistrantUriUpdated(msg.sender, _registrantUri, block.timestamp);

        return true;
    }

        // GETTERS

    /// @dev Returns the list of disabled registrant addresses.
    /// Note: If a registrant is disabled and then re-created, they may appear multiple times in the list.
    /// Front-end implementation should handle duplicate address filtering.
    function getDisabledRegistrants(SmartDirectoryStorage storage self) public view returns (address[] memory) {

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

    function getRegistrantAtIndex(
        SmartDirectoryStorage storage self,
        uint256 _registrantIndex
    ) public view returns(address registrantAddress, string memory registrantUri) {

        require(_registrantIndex < self.registrants.length, "Index too large");
        require(_registrantIndex > 0, "Index 0 is not used, list starts at 1");

        address searchedAddress = self.registrants[_registrantIndex];
        string memory searchedUri = getRegistrantUri(self,searchedAddress);

        return (searchedAddress, searchedUri);
    }

    function getRegistrantIndex(
        SmartDirectoryStorage storage self,
        address _registrantAddress
    ) internal view returns(uint256) {

        return self.registrantData[_registrantAddress].index;
    }

    function getRegistrantUri(
        SmartDirectoryStorage storage self,
        address _registrantAddress
    ) public view returns(string memory) {

        require (self.registrantData[_registrantAddress].index > 0, "unknown registrant");

        return self.registrantData[_registrantAddress].uri;
    }

    function getRegistrantReferencesCount(
        SmartDirectoryStorage storage self,
        address _registrantAddress
    ) public view returns (uint256) {
        return self.registrantData[_registrantAddress].references.length;
    }

    function getRegistrantLastIndex(SmartDirectoryStorage storage self) public view returns(uint256) {
        return self.registrants.length-1;
    }

    //SMART DIRECTORY UTILITY FUNCTIONS

    function version() public pure returns(string memory) {
        return VERSION;
    }

    function getParent1(SmartDirectoryStorage storage self) public view returns (address) {
        return self.parent1;
    }

    function getParent2(SmartDirectoryStorage storage self) public view returns (address) {
        return self.parent2;
    }

    function getContractUri(SmartDirectoryStorage storage self) public view returns (string memory) {
        return self.contractUri;
    }

    function getAdminCode(SmartDirectoryStorage storage self) public view returns (AdminCode) {
        return self.adminCode;
    }

    function getActivationCode(SmartDirectoryStorage storage self) public view returns (ActivationCode) {
        return self.activationCode;
    }

    function setActivationCode(
        SmartDirectoryStorage storage self,
        ActivationCode _activationCode
    ) external onlyParent(self) {

        require(self.activationCode == ActivationCode.pending || self.activationCode == ActivationCode.active,
            "SmartDirectory activation code cannot be modified");
        require(_activationCode == ActivationCode.active || _activationCode == ActivationCode.closed,
            "invalid activation value");

        self.activationCode = _activationCode;
        emit SmartDirectoryActivationUpdated(msg.sender, _activationCode, block.timestamp);
    }

}
