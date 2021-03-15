require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-truffle5");

const secrets = require('./secrets');

module.exports = {
  solidity: "0.5.16",
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${secrets.infuraProjectID}`,
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      from: '0x9138b7116da971dd0aad20882fa236f255fbd396',
      accounts: {
        mnemonic: secrets.deployerMnemonicRopsten,
        path: "m/44'/1'/0'/0/",
        count: 1
      }
    },


    // development: {
    //   host: "127.0.0.1",     // Localhost (default: none)
    //   port: process.env.PORT || 9545,            // Standard Ethereum port (default: none)
    //   network_id: "*",       // Any network (default: none)
    // },
    // ropsten: {
    //   url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    //   accounts: [`0x${ROPSTEN_PRIVATE_KEY}`]
    // }
  }
};
