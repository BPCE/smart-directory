// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./SmartTokenIERC20A.sol";
import "./SmartTokenIERC20AMetadata.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/* supplementary documentation specific to ERC20A
 *
 * ERC20A is an accounting token, A as in accounting this can be used to keep balances if for instance one receives
 * fiat money for the payment of an NFT, one can record the fiat payment using this token. This allows the receiving
 * party to have an accounting record linked to the sale on the blockchain.
 *
 * Using openzeppelin ERC20. Documentation here : https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20.
 */

contract SmartTokenERC20A is Context, SmartTokenIERC20A, SmartTokenIERC20AMetadata {

    string private constant VERSION = "DTERC20A_1.0";
    string private constant TYPE = "SmartERC20A";

    mapping(address => int256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    int256 private totalSupply;

    string private name;
    string private symbol;
    bool private allowNonZeroTotalBalance;
    address parent1;
    address parent2;
    address smart_directory;
    address registrant_address;

    constructor(    string memory _name,
                    string memory _symbol,
                    bool _allowNonZeroTotalBalance,
                    address _parent1,
                    address _parent2,
                    address _smart_directory,
                    address _registrant_address) {
        name = _name;
        symbol = _symbol;
        allowNonZeroTotalBalance = _allowNonZeroTotalBalance;
        registrant_address = _registrant_address;
        smart_directory = _smart_directory;
        parent1 = _parent1;
        parent2 = _parent2;
    }

    // GETTERS

    function get_name() public view virtual returns (string memory) {
        return name;
    }

    function get_symbol() public view virtual returns (string memory) {
        return symbol;
    }

    function get_decimals() public view virtual returns (uint8) {
        return 18;
    }

    function get_totalSupply() public view virtual returns (int256) {
        return totalSupply;
    }

    function version() public view virtual returns(string memory) {
        return VERSION;
    }

    function get_type()  public pure returns(string memory) {
        return TYPE;
    }

    function get_parent1() public view returns(address) {
        return parent1;
    }

    function get_parent2() public view returns(address) {
        return parent2;
    }

    function get_registrant_address() public view virtual returns(address) {
        return registrant_address;
    }

    function get_smart_directory() public view virtual returns(address) {
        return smart_directory;
    }

    // FUNCTIONS

    function balanceOf(address account) public view virtual override returns (int256) {
        return balances[account];
    }

    // Requirements: `to` cannot be the zero address & the caller must have a balance of at least `amount`.
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(amount < uint256(type(int256).max), "ERC20A: amount transfered too big");
        if (balances[to] > 0){
            require(uint256(balances[to]) + amount< uint256(type(int256).max), "ERC20A: amount transfered too big, destination account overflow");
        }
        if (balances[from] < 0){
            require(uint256(-balances[from]) + amount< uint256(type(int256).max), "ERC20A: amount transfered too big, source account underflow");
        }

        _beforeTokenTransfer(from, to, amount);

        int256 fromBalance = balances[from];
        // major difference with ERC20, here we allow negative balance
        // require(fromBalance >= amount, "ERC20: transfer amount exceeds balance")
        unchecked {
            balances[from] = fromBalance - int256(amount);
        }
        balances[to] += int256(amount);

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require (amount == 0 ||  allowNonZeroTotalBalance, "ERC20A has not been initialized to allow non zero balance");
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        totalSupply += int256(amount);
        balances[account] += int256(amount);
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require (allowNonZeroTotalBalance, "ERC20A has not been initialized to allow non zero balance");
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        int256 accountBalance = balances[account];
        unchecked {
            balances[account] = accountBalance - int256(amount);
        }
        totalSupply -= int256(amount);

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}
