// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17.0;

// specific versions accepted by remix
//import "@openzeppelin/contracts@4.4.0/utils/math/SafeMath.sol";
//import "@openzeppelin/contracts@4.4.0/token/ERC721/ERC721.sol";
//import "@openzeppelin/contracts@4.4.0/utils/Counters.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// documentation here: https://docs.openzeppelin.com/contracts/4.x/api/token/erc721

import {ISmartDirectory} from "./ISmartDirectory.sol";
import {ISmartToken721} from "./ISmartToken721.sol";

contract SmartToken721 is ERC721, ISmartToken721 {

	string private constant VERSION = "DT721_1.01";
    string private constant TYPE = "Smart721";

    address parent1;
    address parent2;
    address smart_directory;
    address registrant_address;
    string base_uri;
    uint256 max_token;

	Counters.Counter nextToken; // id of the next token to be minted

    //	USING DIRECTIVES
    using Counters for Counters.Counter;

    // CONSTRUCTOR
    constructor(
        string memory _name,
		string memory _symbol,
		address _parent1,
		address _parent2,
		address _smart_directory,
		address _registrant_address,
        string memory _base_uri,
        uint256 _max_token
        )  ERC721(_name, _symbol) {		

            init(
                    _parent1,
                    _parent2,
                    _smart_directory,
                    _registrant_address,
                    _base_uri,
                    _max_token
                );
    }


    function init(
                            address _parent1,
		                    address _parent2,
		                    address _smart_directory,
		                    address _registrant_address,
                            string memory _base_uri,
                            uint256 _max_token) internal {
		nextToken.increment(); // token_ids start at 1
		max_token = _max_token;
        base_uri = _base_uri;
        registrant_address = _registrant_address;
        smart_directory = _smart_directory;
        parent2 = _parent2;
        parent1 = _parent1;
    }

    //MODIFIERS
    modifier activeRegistrant() {
        require (ISmartDirectory(smart_directory).isValidRegistrant(msg.sender),
            "unknown or disabled registrant");
        _;
    }

//  GETTERS

    function _baseURI() internal view virtual override returns (string memory)   {
        return base_uri;
    }

    function get_registrant_address() public view virtual returns(address) {
		return registrant_address;
	}

    function get_smart_directory() public view virtual returns(address) {
		return smart_directory;
	}

    function get_max_token() public view virtual returns(uint256) {
		return max_token;
	}

    function version() public view virtual returns(string memory) {
		return VERSION;
	}

	function get_parent1() public view returns(address) {
		return parent1;
	}

	function get_parent2() public view returns(address) {
		return parent2;
	}

    function get_type() public view returns(string memory) {
        return TYPE;
    }

}
