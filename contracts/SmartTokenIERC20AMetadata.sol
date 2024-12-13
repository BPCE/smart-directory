// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ISmartTokenERC20A} from "./ISmartTokenERC20A.sol";

interface ISmartTokenERC20AMetadata is ISmartTokenERC20A {

    function get_name() external view returns (string memory);

    function get_symbol() external view returns (string memory);

    function get_decimals() external view returns (uint8);
}
