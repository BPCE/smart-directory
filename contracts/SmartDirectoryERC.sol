// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {SmartDirectoryLib} from "./SmartDirectoryLib.sol";
import {ISmartDirectory} from "./ISmartDirectory.sol";

contract SmartDirectory is ISmartDirectory {

    string private constant VERSION = "ERC 0.1";

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

    /// @dev Structure packing to optimize storage space and gas costs.
    struct Reference {
        uint96 latestStatusIndex;
        address registrantAddress;
        address referenceAddress;
        string projectId;
        string referenceType;
        string referenceVersion;
        string status;
    }

    struct Registrant {
        string uri;
        uint256 index;
        address[] references;
    }

    // contract DATA
    address owner;
    string URI;
    address[] registrants;
    mapping(address => Registrant) registrantData;
    mapping(address => Reference) referenceData;

    constructor (
        string memory _contractUri)  {
        owner = msg.sender;
        URI = _contractUri;
        activationCode = pending;
    }

    // MODIFIERS

    modifier onlyActive(SmartDirectoryStorage storage self) {
        require(activationCode == active, "SmartDirectory is not active");
        _;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner
            "unauthorized access: only the owner may call this function"
        );
        _;
    }

    function isValidRegistrant(
        address _registrantAddress
    ) public view returns (bool) {
        return registrantData[_registrantAddress].index != 0;
    }

    function isDeclaredReference(
        address _referenceAddress
    ) internal view returns (bool) {
        return referenceData[_referenceAddress].registrantAddress != address(0);
    }

//  SmartDirectory Management
    function getContractUri() public view returns (string memory) {
        return contractUri;
    }

    function getContractVersion() public view returns (string memory) {
        return VERSION;
    }

//  registrant Management
    function createRegistrant(address _registrantAddress) public {

       require(registrantData[_registrantAddress].index == 0, "registrant already known");

        Registrant memory registrant = Registrant("", 0, new address[](0));
        registrant.index = self.registrants.length;

        registrants.push(_registrantAddress);
        registrantData[_registrantAddress] = registrant;
        emit RegistrantCreated(_registrantAddress, msg.sender,block.timestamp);
    }

    function disableRegistrant(
        address _registrantAddress
    ) public onlyParentAndActive(self) {

        uint256 registrantIndex = getRegistrantIndex(self,_registrantAddress);
        require(registrantIndex <= self.registrants.length, "Inconsistent: index too large");
        require(isValidRegistrant(self, _registrantAddress), "Registrant not found or disabled");

        self.registrantData[_registrantAddress].index = 0;
        emit RegistrantDisabled(_registrantAddress, block.timestamp);
    }

    function updateRegistrantUri(
        string memory _registrantUri
    ) public onlyActive(self) {

        require(isValidRegistrant(self, msg.sender), "unknown registrant");

        registrantData[msg.sender].uri = _registrantUri;
        emit RegistrantUriUpdated(msg.sender, _registrantUri, block.timestamp);
    }

    function getRegistrantUri(
        address _registrantAddress
    ) public view returns(string memory) {

        require (registrantData[_registrantAddress].index > 0, "unknown registrant");

        return registrantData[_registrantAddress].uri;
    }

// Reference Management

    function createReference(
        address _referenceAddress,
        string memory _referenceDescription,
        string memory _referenceType,
        string memory _referenceVersion,
        string memory _status
    )  onlyActive(self) {
        require(_referenceAddress != address(0x0), "reference must not be address 0");
        require(!isDeclaredReference(_referenceAddress), "reference already known");

        Reference storage ref = referenceData[_referenceAddress];

        ref.registrantAddress = msg.sender;
        ref.referenceAddress = _referenceAddress;
        ref.projectId = _referenceDescription;
        ref.referenceType = _referenceType;
        ref.referenceVersion = _referenceVersion;

        uint96 currentIndex = ref.latestStatusIndex + 1;
        ref.status = _status;

        emit ReferenceCreated(msg.sender, _referenceAddress, block.timestamp);
    }

    function updateReferenceStatus(
        address _referenceAddress,
        string memory _newStatus
    ) public onlyActive(self) {
        require(isValidRegistrant(msg.sender), "unknown or disabled registrant");
        require(isDeclaredReference(_referenceAddress), "unknown reference");

        Reference storage ref = referenceData[_referenceAddress];

        require(
            msg.sender == ref.registrantAddress ||
            msg.sender == owner 
            "Unauthorized access: only reference owner or contract owner can call this function"
        );

        ref.status = _newStatus;

        emit ReferenceStatusUpdated(msg.sender, _referenceAddress, block.timestamp);
    }


    function getReference(
        address _referenceAddress
    ) public view returns (
        address registrantAddress,
        uint256 registrantIndex,
        address referenceAddress,
        string memory projectDescription,
        string memory referenceType,
        string memory referenceVersion,
        string memory status) {

        Reference storage ref = referenceData[_referenceAddress];

        require(ref.referenceAddress != address(0), "unknown reference");

        uint256 index = registrantData[ref.registrantAddress].index;


        return (
            ref.registrantAddress,
            ref.referenceAddress,
            ref.projectDescription,
            ref.referenceType,
            ref.referenceVersion,
            ref.status
        );
    }


    function getReferenceStatus(
        address _referenceAddress
    ) public view returns
        (string memory status) {

        Reference storage ref = referenceData[_referenceAddress];

        require(isDeclaredReference(self, _referenceAddress), "unknown reference");

        return (ref.status);
    }




}