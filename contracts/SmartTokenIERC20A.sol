// SPDX-License-Identifier: MIT
// documentation here: https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20

pragma solidity ^0.8.17;

interface SmartTokenIERC20A {

    function get_totalSupply() external view returns (int256);

    function balanceOf(address account) external view returns (int256);

    function transfer(address to, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}
