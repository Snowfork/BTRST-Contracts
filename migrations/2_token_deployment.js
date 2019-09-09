const BTRUST = artifacts.require("BTRUST");
const config = require('../btrust-config');

const BN = web3.utils.BN;
const decimalsBN = new BN(config.decimals);
const multiplier = new BN(10).pow(decimalsBN);
const initialSupplyBN = new BN(config.initialSupplyBTRUST).mul(multiplier)

module.exports = function(deployer, network) {
  foundationInitialAddress = config.networks[network].foundationInitialAddress;
  initialSupply = initialSupplyBN.toString();
  deployer.deploy(BTRUST, foundationInitialAddress, initialSupply);
};