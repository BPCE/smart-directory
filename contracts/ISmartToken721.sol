// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ISmartToken721 {

    function get_registrant_address() external returns(address);

    function get_smart_directory() external returns(address);

    function get_max_token() external returns(uint256);

    function version() external returns(string memory);

    function get_parent1() external returns(address);

    function get_parent2() external returns(address);

    function get_type() external returns(string memory);
}
