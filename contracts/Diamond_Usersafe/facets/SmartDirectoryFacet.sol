//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "../../SmartDirectory.sol";

contract SmartDirectoryFacet {

	string private constant VERSION = "SDF 1.0";

	function createReference(
		address contractAddress,
		address referenceAddress,
		string calldata projectId,
		string calldata referenceType,
		string calldata referenceVersion,
		string calldata status) external {

		SmartDirectory folder = SmartDirectory(contractAddress);

		folder.createReference(
			referenceAddress,
			projectId,
			referenceType,
			referenceVersion,
			status);
	}

	function updateReferenceStatus(address contractAddress, address referenceAddress, string calldata status) public {
		SmartDirectory folder = SmartDirectory(contractAddress);

		folder.updateReferenceStatus(referenceAddress, status);
	}
}
