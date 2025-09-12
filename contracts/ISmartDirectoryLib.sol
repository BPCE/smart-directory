
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;



interface ISmartDirectoryLib {
    enum ActivationCode {
        pending,  // SmartDirectory is not activated: no functions available
        active,   // SmartDirectory is activated: all functions available
        closed    // SmartDirectory is closed: no transactions or updates allowed
    }

    
    enum AdminCode {
        parentsAuthorized,  // Only addresses registered by parents can create references
        selfDeclaration     // Any addresses can create references
    }

}