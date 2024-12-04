/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations, * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't acci
dentally become public.
 *
 */

require('dotenv').config();
net=require('net');
Web3=require('web3');

const HDWalletProvider = require("@truffle/hdwallet-provider");
const { promisify } = require('util');
Web3.providers.IpcProvider.prototype.sendAsync = promisify(Web3.providers.IpcProvider.prototype.send)

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */
  plugins: [
        'truffle-contract-size',
	'truffle-flatten',
	 // usage: truffle run contract-size
	// 'truffle-plugin-blockscout-verify'
      ],
  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // match any network
      websockets: true,
      SkipDryRun: true,
      gas:10000000
    },
    goerli: {
        provider: () => {
          return new HDWalletProvider(process.env.MNEMONIC, process.env.RPC_GOERLI_PROVIDER)
      },
      SkipDryRun: true,
      gas:10000000
    },

    env: {
	    network_id: process.env.NETWORK_ID,
        provider: () => {
          return new HDWalletProvider(process.env.MNEMONIC, process.env.RPC_PROVIDER)
      },
      SkipDryRun: true,
      gas:10000000
    },
    xrpltest:{
	network_id: 1440002,
      	provider: () => {
          return new HDWalletProvider(process.env.MNEMONIC, process.env.RPC_XRPL_TEST_PROVIDER)
      	},
      	SkipDryRun: true,
      	gas:10000000,

    },
    fhe_dev: {
      network_id: 8543,
      networkCheckTimeout: 1200000,
      deploymentPollingInterval: 1000,
      provider: () => {
          return new HDWalletProvider(process.env.MNEMONIC, process.env.RPC_FHE_DEV_PROVIDER)
      },
      SkipDryRun: true,
      gas:10000000,
      // check here: https://gas-station.qaxh.io/testnet-phenix
      maxPriorityFeePerGas: 1500000000,
      maxFeePerGas: 1500000100 // must add twice the base fee
    },
    zamadev: {
      network_id: 9000,
      networkCheckTimeout: 1200000,
      deploymentPollingInterval: 1000,
      provider: () => {
          return new HDWalletProvider({
		  //mnemonic: {
			  //phrase: process.env.MNEMONIC
		  //},
          privateKeys:[process.env.QAXH_PVK],
          providerOrUrl: process.env.RPC_ZAMADEV_PROVIDER
        })
      },
      SkipDryRun: true,
      gas:10000000,
      maxPriorityFeePerGas: 1500000000,
      maxFeePerGas: 1500000100 // must add twice the base fee
    },
    amoy: {
      network_id: 80002,
      networkCheckTimeout: 1200000,
      timeoutBlocks: 2000,
      pollingInterval: 5000,
      deploymentPollingInterval: 5000,
      retryTimeout: 5000,
      provider: () => {
          return new HDWalletProvider({
		  //mnemonic: {
			  //phrase: process.env.MNEMONIC
		  //},
          privateKeys:[process.env.QAXH_PVK],
          providerOrUrl: 'https://rpc-amoy.polygon.technology/'
        })
      },
      SkipDryRun: true,
      //gas:10000000,
      //gasPrice: 35000000000,
      // check here: https://gas-station.qaxh.io/testnet-polygon
      maxPriorityFeePerGas: 25000000000,
      maxFeePerGas: 25000000030, // must add twice the base fee
      timeoutBlocks: 200,
    },
    mumbai_local_rpc: {
      network_id: 80001,
      networkCheckTimeout: 1200000,
      deploymentPollingInterval: 1000,
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, "http://localhost:8545")
      },
	    SkipDryRun: true,
      gas:10000000,
      maxPriorityFeePerGas: 1500000000,
      maxFeePerGas: 1500000100 // must add twice the base fee
    },
    mumbai_local: { // deploy through the local node, needs truffle@5.3.0
      network_id: 80001,
      deploymentPollingInterval: 1000,
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, new Web3.providers.IpcProvider("/var/lib/bor/bor.ipc",net));
      },
      SkipDryRun: true,
      gas:10000000,
      maxPriorityFeePerGas: 1500000000,
      maxFeePerGas: 1500000100 // must add twice the base fee
    },

    goerli_local: { // deploy through the local node, needs truffle@5.3.0
	    network_id: 5,
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, new Web3.providers.IpcProvider("/home/qaxh_admin/.ethereum/goerli/geth.ipc",net));
      },
      SkipDryRun: true,
      gas:10000000
    },
    // Another network with more advanced options...
    // advanced: {
    // port: 8777,             // Custom port
    // network_id: 1342,       // Custom network
    // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
    // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
    // from: <address>,        // Account to send txs from (default: accounts[0])
    // websockets: true        // Enable EventEmitter interface for web3 (default: false)
    // },

    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
    // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
    // network_id: 3,       // Ropsten's id
    // gas: 5500000,        // Ropsten has a lower block limit than mainnet
    // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },

    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // reporter: 'eth-gas-reporter'
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.8.17', // Fetch exact version from solc-bin (default: truffle's version)
      settings: {        // See the solidity docs for advice about optimization and evmVersion
	      optimizer: {
          enabled: true,
          runs: 200
        },
        remappings: ["fhevm=./fhevm"], // does not work
        // viaIR: true,
        debug: {
        revertStrings: 'debug',
            debugInfo: ['*']
        }
      //  evmVersion: "byzantium"
      }
    }
  },
  verify: {
    preamble: "Author: Qaxh.io team"
  }
}
