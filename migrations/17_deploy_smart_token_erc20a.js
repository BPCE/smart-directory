var smartTokenERC20A    = artifacts.require("./SmartTokenERC20A.sol");

module.exports = function(deployer) {
	return deployer.deploy(smartTokenERC20A,
            "nameTestERC20A",
            "ERC20AT",
	    true,
	    "0xe3f1413e071332840db2735f809cf3240c4a4255",
	    "0x8a5f2f59a281751965C90d3AEbB4Ba853e1E64bb",
            "0x314b51087ce7d40182cf0671264fff0395a25a96",
            "0x88D65F27e269b4f92CE2Ccf124eAE8648635a67A"
        );
};
