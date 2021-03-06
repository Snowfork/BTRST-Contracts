const configBTRUST      = require('../btrust-config')
const configGovernance  = require('../governor-config')
const {tokenFormatMain} = require('../helpers.js')

// get initial Contract constructor parameters; and foundationInitialAddress(deployer) from config
const {initialSupplyBTRUST, networks: {ropsten:{foundationInitialAddress}}}  = configBTRUST
const {name} = configGovernance

async function main() {
    
    // We get the BTRUST contract to deploy
    const BTRUST = await ethers.getContractFactory("BTRUST");
    const bTrust = await BTRUST.deploy(foundationInitialAddress, tokenFormatMain(initialSupplyBTRUST));  
    console.log("BTRUST deployed to:", bTrust.address);

    // We get the Governance contract to deploy (appoint foundation as the guardian)
    const Governance = await ethers.getContractFactory("Governance");
    const governor   = await Governance.deploy(name, bTrust.address, foundationInitialAddress,);  
    console.log("Governance deployed to:", governor.address);

  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });