// SPDX-License-Identifier: MIT
// documentation here: https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20Metadata

pragma solidity ^0.8.17;

import "./SmartTokenIERC20A.sol";

interface SmartTokenIERC20AMetadata is SmartTokenIERC20A {

    function get_name() external view returns (string memory);

    function get_symbol() external view returns (string memory);

    function get_decimals() external view returns (uint8);
}
