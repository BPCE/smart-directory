// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17.0;

// specific versions accepted by remix
//import "@openzeppelin/contracts@4.4.0/utils/math/SafeMath.sol";
//import "@openzeppelin/contracts@4.4.0/token/ERC721/ERC721.sol";
//import "@openzeppelin/contracts@4.4.0/utils/Counters.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// documentation here: https://docs.openzeppelin.com/contracts/4.x/api/token/erc721
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";



contract DirectoryToken721 is ERC721 {

	string private constant VERSION = "DT721_1.0";

    address _parent1;
    address _parent2;
    address _smart_directory;
    address _registrant_address;
    string _base_uri;
    uint256 _max_token;

	Counters.Counter        nextToken; // id of the next token to be minted

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
		_max_token = _max_token;
        _base_uri = _base_uri;
        _registrant_address = _registrant_address;
        _smart_directory = _smart_directory;
        _parent2 = _parent2;
        _parent1 = _parent1;
    }


    function _baseURI() internal view virtual override returns (string memory)   {
        return _base_uri;
    }
}