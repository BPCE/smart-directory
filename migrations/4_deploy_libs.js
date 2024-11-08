//
// if libs are not deployed you may get the error:
// "Contract does not have fallback nor receive functions"
// when calling a contract using these libs
// 
const fs = require('fs');
var SmartDirectoryLib = artifacts.require("./SmartDirectoryLib.sol");


function writeTextFile(afilename, output)
{
  fs.writeFile(afilename, output, err => {
	  if (err) {
	    console.error(err);
	  }});
}

module.exports = function(deployer) {
    deployer.deploy(SmartDirectoryLib);

    //writeTextFile("LibNftFolder.address", LibNftFolder.address);
    //writeTextFile("LibQaxhFolder.address", LibQaxhFolder.address);
    //writeTextFile("LibQaxhParameters.address", LibQaxhParameters.address);
};
