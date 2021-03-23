require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-truffle5");
require("hardhat-deploy");

const secrets = require('./secrets');

module.exports = {
  solidity: "0.5.16",
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${secrets.infuraProjectID}`,
      gas: 5500000,
      accounts: [`0x${secrets.deployerPrivateKey}`],
      from: secrets.deployerAccount,
      live: true,
      tags: ["staging"]
    }
  },
  namedAccounts: {
    deployer: {
      default: 0, // default take the first account as deployer
    },
    foundationInitialAddress: {
      default: 0,
    }
  }
};
