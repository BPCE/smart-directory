// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ISmartToken721 {

    function get_registrant_address() external view returns(address);

    function get_smart_directory() external view returns(address);

    function get_max_token() external view returns(uint256);

    function version() external view returns(string memory);

    function get_parent1() external view returns(address);

    function get_parent2() external view returns(address);

    function get_type() external pure returns(string memory);

    function mint(address to) external;

    function transfer(address from, address to, uint256 tokenId) external;

}
