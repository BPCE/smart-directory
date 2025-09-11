// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


interface ISmartDirectoryERC {


    // DATA STRUCTURES

    enum ActivationCode {
        pending,  // SmartDirectory is not activated: no functions available
        active,   // SmartDirectory is activated: all functions available
        closed    // SmartDirectory is closed: no transactions or updates allowed
    }

// NOTE: constructor has one argument: _contractURI
function getContractUri() external view returns(string memory);

function setActivationCode(ActivationCode _activationCode) external;

function getActivationCode() external view returns(ActivationCode);



//REGISTRANT MANAGEMENT
//CREATION + UPDATE

    function createRegistrant (address _registrantAddress) external;

    function disableRegistrant (address _registrantAddress) external;

    function updateRegistrantUri(string memory _registrantUri) external returns (bool);


//VALIDITY CHECK
    function isValidRegistrant (address _registrantAddress) external view returns(bool);


//REFERENCE MANAGEMENT

//CREATION + UPDATE
    function createReference (address _referenceAddress, 
                        string memory referenceDescription, 
                        string memory _referenceType,
                        string memory _referenceVersion, 
                        string memory _status) external returns (bool);

    function updateReferenceStatus(address _referenceAddress, string memory _status) external;

//REFERENCE GETTERS

    function getReferenceStatus(address _referenceAddress) external view 
                                returns (string memory status, uint256 timeStamp);

    function getReference(address _referenceAddress) external view returns (
        address registrantAddress,
        address referenceAddress,
        string memory referenceDescription,
        string memory referenceType,
        string memory referenceVersion,
        string memory status,
        uint256 timeStamp);


    function getReferenceStatusAtIndex(address _referenceAddress, uint256 _index) external view returns
    (string memory status, uint256 timeStamp);

    function getReferenceLastStatusIndex (address _referenceAddress) external view returns(uint256 lastStatusIndex);

    function getReferencesLists(address _registrantAddress) external view returns (address[] memory referenceAddresses,
        string[] memory projectIds);

    

        //GETTERS

    function getRegistrantUri(address _registrantAddress) external view returns (string memory);

    function getDisabledRegistrants() external view returns (address[] memory disabledRegistrantsList);

//SMART DIRECTORY UTILITY FUNCTIONS

    function version() external pure returns (string memory);



}
