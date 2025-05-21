const TestERC20 = artifacts.require("TestERC20");

module.exports = async function (deployer) {
  // Define deployment parameters
  const tokenName = "Test Token";
  const tokenSymbol = "TST";
  const initialSupply = web3.utils.toWei("1000000", "ether"); // 1 million tokens with 18 decimals

  // Deploy the TestERC20 contract
  console.log("Deploying TestERC20...");
  await deployer.deploy(TestERC20, tokenName, tokenSymbol, initialSupply);

  // Get the deployed contract instance
  const testERC20 = await TestERC20.deployed();

  // Log deployment details
  console.log(`TestERC20 deployed to: ${testERC20.address}`);
  console.log(`Token Name: ${tokenName}`);
  console.log(`Token Symbol: ${tokenSymbol}`);
  console.log(`Initial Supply: ${web3.utils.fromWei(initialSupply, "ether")} ${tokenSymbol}`);
};
