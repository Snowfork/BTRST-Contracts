require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");

const secrets = require("./secrets");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.16",
      },
      {
        version: "0.6.7",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${secrets.infuraProjectID}`,
      gas: 5500000,
      accounts: [`0x${secrets.deployerPrivateKey}`],
      from: secrets.deployerAccount,
      live: true,
      gasPrice: 10000000000,
      tags: ["staging"],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${secrets.infuraProjectID}`,
      gas: "auto",
      accounts: [`0x${secrets.deployerPrivateKey}`],
      from: secrets.deployerAccount,
      live: true,
      gasPrice: "auto",
      tags: ["production"],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // default take the first account as deployer
    },
    foundationInitialAddress: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: secrets.etherScanApiKey,
  },
};
