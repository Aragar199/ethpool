const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config({path: require('find-config')('.env') });
const AccountIndex = 0;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      port: 8545,
      host: "127.0.0.1",
      network_id: "*"
    },
    ganache_local: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "http://127.0.0.1:7545", AccountIndex)
      },
      network_id: "*"
    },
    goerli_infura: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "https://goerli.infura.io/v3/0e97ebc98e8a43a38801de9860b76447", AccountIndex)
      },
      network_id: "5"
    },
    ropsten_infura: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "https://ropsten.infura.io/v3/0e97ebc98e8a43a38801de9860b76447", AccountIndex)
      },
      network_id: "3"
    }
  },
  compilers: {
    solc: {
      version: "^0.8.7"
    }
  }
};
