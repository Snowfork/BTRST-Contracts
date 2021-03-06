const BTRUST = artifacts.require('BTRUST')
const config = require('../btrust-config')
const {tokenFormat} = require('../helpers.js')

module.exports = async (deployer, network) => {

  // get initial Contract constructor parameters; and foundationInitialAddress(deployer) from config
  const {initialSupplyBTRUST, networks: {ropsten:{foundationInitialAddress}}}  = config  

  await deployer.deploy(BTRUST, foundationInitialAddress, tokenFormat(initialSupplyBTRUST))

};