// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {SmartDirectoryLib} from "./SmartDirectoryLib.sol";
import {SmartDirectory} from "./SmartDirectory.sol";

interface ISmartDirectory {

    //VALIDITY CHECK
    function isValidRegistrant (address _registrantAddress) external view returns(bool);

    //REFERENCES MANAGEMENT

        //SETTERS

    function createReference (address _referenceAddress, string memory _projectId, string memory _referenceType,
        string memory _referenceVersion, string memory _status) external returns (bool);

    function updateReferenceStatus(address _referenceAddress, string memory _status) external;

        //GETTERS

    function getReference(address _referenceAddress) external view returns (
        address registrantAddress,
        uint256 registrantIndex,
        address referenceAddress,
        string memory projectId,
        string memory referenceType,
        string memory referenceVersion,
        string memory status,
        uint256 timeStamp);

    function getReferenceStatus(address _referenceAddress) external view returns (string memory status,
        uint256 timeStamp);

    function getReferenceStatusAtIndex(address _referenceAddress, uint256 _index) external view returns
    (string memory status, uint256 timeStamp);

    function getReferenceLastStatusIndex (address _referenceAddress) external view returns(uint256 lastStatusIndex);

    function getReferencesLists(address _registrantAddress) external view returns (address[] memory referenceAddresses,
        string[] memory projectIds);

    //REGISTRANTS MANAGEMENT

        //SETTERS

    function createRegistrant (address _registrantAddress) external;

    function disableRegistrant (address _registrantAddress) external;

    function updateRegistrantUri(string memory _registrantUri) external returns (bool);

        //GETTERS

    function getRegistrantUri(address _registrantAddress) external view returns (string memory);

    function getRegistrantAtIndex(uint256 _registrantIndex) external view returns (address registrantAddress,
        string memory registrantUri);

    function getRegistrantIndex(address _registrantAddress) external view returns(uint256);

    function getRegistrantLastIndex() external view returns (uint256);

    function getRegistrantReferencesCount(address _registrantAddress) external view returns (uint256);

    function getDisabledRegistrants() external view returns (address[] memory disabledRegistrantsList);

//SMART DIRECTORY UTILITY FUNCTIONS

    function version() external pure returns (string memory);

    function getParent1() external view returns(address);

    function getParent2() external view returns(address);

    function getContractType() external pure returns(uint8);

    function getContractUri() external view returns(string memory);

    function getAdminCode() external view returns(SmartDirectoryLib.AdminCode adminCode);

    function getActivationCode() external view returns(SmartDirectoryLib.ActivationCode);

    function setActivationCode(SmartDirectoryLib.ActivationCode _activationCode) external;

}
