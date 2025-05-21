// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// simple ERC20 for test purposes

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestTokenERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}

//
