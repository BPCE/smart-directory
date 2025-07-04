// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {SmartDirectoryLib} from "./SmartDirectoryLib.sol";
import {ISmartDirectory} from "./ISmartDirectory.sol";

contract SmartDirectory is ISmartDirectory {

    string private constant VERSION = "SD 1.09";
    uint8 private constant TYPE = 42;

    using SmartDirectoryLib for SmartDirectoryLib.SmartDirectoryStorage;
    SmartDirectoryLib.SmartDirectoryStorage smartDirectoryStorage;

    //CONSTRUCTOR to initialize the SmartDirectory

    constructor (
        address _parent1,
        address _parent2,
        string memory _contractUri,
        uint8 _adminCode)  {

        smartDirectoryStorage.init(
            _parent1,
            _parent2,
            _contractUri,
            _adminCode);
    }

    //VALIDITY CHECK
    function isValidRegistrant (address _registrantAddress) public view returns(bool) {
        return smartDirectoryStorage.isValidRegistrant(_registrantAddress);
    }

    //MODIFIERS
    modifier activeRegistrant() {
        require (isValidRegistrant(msg.sender), "unknown or disabled registrant");
        _;
    }

    //REFERENCES MANAGEMENT

        //SETTERS

    //smartDirectoryReferenceEoaCreate
    function createReference (address _referenceAddress, string memory _projectId, string memory _referenceType,
        string memory _referenceVersion, string memory _status) public returns (bool) {

            return smartDirectoryStorage.createReference(
                _referenceAddress,
                _projectId,
                _referenceType,
                _referenceVersion,
                _status
            );

    }

    //smartDirectoryReferenceStatusEoaUpdate
    function updateReferenceStatus(address _referenceAddress, string memory _status) public {
        smartDirectoryStorage.updateReferenceStatus(_referenceAddress, _status);
    }

        //GETTERS

    //smartDirectoryReferenceGet
    function getReference(address _referenceAddress) public view returns (
        address registrantAddress,
        uint256 registrantIndex,
        address referenceAddress,
        string memory projectId,
        string memory referenceType,
        string memory referenceVersion,
        string memory status,
        uint256 timeStamp) {

        return smartDirectoryStorage.getReference(_referenceAddress);
    }

    //smartDirectoryReferenceStatusGet
    function getReferenceStatus(address _referenceAddress) public view returns (string memory status,
        uint256 timeStamp) {
        return smartDirectoryStorage.getReferenceStatus(_referenceAddress);
    }

    //smartDirectoryReferenceStatusAtIndexGet
    function getReferenceStatusAtIndex(address _referenceAddress, uint256 _index) public view returns
    (string memory status, uint256 timeStamp) {
        return smartDirectoryStorage.getReferenceStatusAtIndex(_referenceAddress, _index);
    }

    function getReferenceLastStatusIndex (address _referenceAddress) external view returns(uint256 lastStatusIndex) {
        return smartDirectoryStorage.getReferenceLastStatusIndex(_referenceAddress);
    }

    //smartDirectoryReferencesListsGet
    function getReferencesLists(address _registrantAddress) public view returns (address[] memory referenceAddresses,
        string[] memory projectIds) {
        return smartDirectoryStorage.getReferencesLists(_registrantAddress);
    }

    //REGISTRANTS MANAGEMENT

        //SETTERS

    //smartDirectoryRegistrantEoaCreate
    function createRegistrant (address _registrantAddress) public {
        smartDirectoryStorage.createRegistrant(_registrantAddress);
    }

    //smartDirectoryRegistrantEoaDelete
    function disableRegistrant (address _registrantAddress) public {
        smartDirectoryStorage.disableRegistrant(_registrantAddress);
    }

    //smartDirectoryRegistrantUriEoaWrite
    function updateRegistrantUri(string memory _registrantUri) public returns (bool) {
        return smartDirectoryStorage.updateRegistrantUri(_registrantUri);
    }

        //GETTERS

    //smartDirectoryRegistrantUriGet
    function getRegistrantUri(address _registrantAddress) public view returns (string memory) {
        return smartDirectoryStorage.getRegistrantUri(_registrantAddress);
    }

    //smartDirectoryRegistrantAtIndexGet
    function getRegistrantAtIndex(uint256 _registrantIndex) public view returns (address registrantAddress,
        string memory registrantUri) {

        return smartDirectoryStorage.getRegistrantAtIndex(_registrantIndex);
    }

    //smartDirectoryRegistrantIndexGet
    function getRegistrantIndex(address _registrantAddress) public view returns(uint256) {
        return smartDirectoryStorage.getRegistrantIndex(_registrantAddress);
    }

    //smartDirectoryRegistrantLastIndexGet
    function getRegistrantLastIndex() public view returns (uint256) {
        return smartDirectoryStorage.getRegistrantLastIndex();
    }

    //smartDirectoryReferencesCount
    function getRegistrantReferencesCount(address _registrantAddress) public view returns (uint256) {
        return smartDirectoryStorage.getRegistrantReferencesCount(_registrantAddress);
    }

    //smartDirectoryRegistrantsListGet
    function getDisabledRegistrants() public view returns (address[] memory disabledRegistrantsList) {
        return smartDirectoryStorage.getDisabledRegistrants();
    }

//SMART DIRECTORY UTILITY FUNCTIONS

    function version() public pure virtual returns (string memory) {
        return string.concat(VERSION,SmartDirectoryLib.version());
    }

    function getParent1() public view returns(address) {
        return smartDirectoryStorage.getParent1();
    }

    function getParent2() public view returns(address) {
        return smartDirectoryStorage.getParent2();
    }

    function getContractType() public pure returns(uint8) {
        return TYPE;
    }

    function getContractUri() public view returns(string memory) {
        return smartDirectoryStorage.getContractUri();
    }

    function getAdminCode() public view returns(SmartDirectoryLib.AdminCode adminCode) {
        return smartDirectoryStorage.getAdminCode();
    }

    function getActivationCode() public view returns(SmartDirectoryLib.ActivationCode) {
        return smartDirectoryStorage.getActivationCode();
    }

    //smartDirectoryActivationCodeEoaUpdate
    function setActivationCode(SmartDirectoryLib.ActivationCode _activationCode) public {
        smartDirectoryStorage.setActivationCode(_activationCode);
    }

}
