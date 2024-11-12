// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./SmartDirectoryLib.sol";

contract SmartDirectory {

    string private constant VERSION = "SD 1.0";

    using SmartDirectoryLib for SmartDirectoryLib.SmartDirectoryStorage;
    SmartDirectoryLib.SmartDirectoryStorage private smartDirectoryStorage;

    //CONSTRUCTOR to initialize the SmartDirectory

    constructor(
        address _parent1,
        address _parent2,
        uint8 _contractVersion,
        uint8 _contractType,
        string memory _contractUri,
        uint8 _mintCode) {

        smartDirectoryStorage.init(
            _parent1,
            _parent2,
            _contractVersion,
            _contractType,
            _contractUri,
            _mintCode);
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
        address referenceAddress,
        string memory projectId,
        string memory referenceType,
        string memory referenceVersion,
        string memory status,
        uint256 timeStamp) {

        return smartDirectoryStorage.getReference(_referenceAddress);
    }

    ///smartDirectoryReferenceStatusGet
    function getReferenceStatus(address _referenceAddress, uint256 _index) public view returns (string memory status,
        uint256 timeStamps) {
        return smartDirectoryStorage.getReferenceStatus(_referenceAddress, _index);
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

    function createRegistrant (address _registrantAddress) public returns (bool) {
        return smartDirectoryStorage.createRegistrant(_registrantAddress);
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

    //smartDirectoryRegistrantIndexGet
    function getRegistrantIndex(address _registrantAddress) public view returns (uint256) {
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

    //SMART DIRECTORY UTILITY FUNCTIONS

    function version() public pure returns (string memory) {
        return SmartDirectoryLib.version();
    }

    function getMintCode(SmartDirectoryLib.SmartDirectoryStorage storage self) internal view returns(
        SmartDirectoryLib.MintCode mintCode) {

        return self.getMintCode();
    }

    //smartDirectoryActivationCodeEoaUpdate
    function setSmartDirectoryActivationCode(SmartDirectoryLib.ActivationCode _activationCode) public {
        smartDirectoryStorage.setSmartDirectoryActivationCode(_activationCode);
    }

    //smartDirectoryHeadersGet
    function getSmartDirectoryHeaders (SmartDirectoryLib.SmartDirectoryStorage storage self) internal view returns(
        address parent1,
        address parent2,
        uint8 contractVersion,
        uint8 contractType,
        string memory contractUri,
        SmartDirectoryLib.ActivationCode activationCode,
        SmartDirectoryLib.MintCode mintCode) {

        return self.getSmartDirectoryHeaders();
    }

}