var smartDirectoryLib = artifacts.require("./SmartDirectoryLib.sol");
var smartDirectory    = artifacts.require("./SmartDirectory.sol");

module.exports = function(deployer) {
    deployer.deploy(smartDirectoryLib);
	deployer.link(smartDirectoryLib, smartDirectory);
	return deployer.deploy(smartDirectory,
			"0xe3f1413e071332840db2735f809cf3240c4a4255",
			"0x8a5f2f59a281751965C90d3AEbB4Ba853e1E64bb",
			"https://BPCE.fr",
			1 
        );
};
