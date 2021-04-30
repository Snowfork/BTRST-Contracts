const btrustConfig = require('../btrust.config.js');
const {networks: { ropsten: { timelockPeriod, quorumVotes, proposalThreshold, votingPeriod } }}  = btrustConfig

module.exports = async ({
  getNamedAccounts,
  deployments,
}) => {
  const {deploy} = deployments;
  const {deployer, foundationInitialAddress} = await getNamedAccounts();
  const nonce = await web3.eth.getTransactionCount(deployer)
  const governorAlphaAddress = ethers.utils.getContractAddress({ from: deployer, nonce: nonce+2 });

  // PLEASE DON'T CHANGE ORDER OF DEPLOYMNET"

  console.log("----------------------------------------------------");
  console.log('Deploying BTRUST');
  const btrust = await deploy('BTRUST', {
      from: deployer,
      args: [foundationInitialAddress],
  });
  console.log("BTRUST deployed to: ", btrust.address);


  console.log("----------------------------------------------------");
  const timelock = await deploy('Timelock', {
      from: deployer,
      args: [governorAlphaAddress, timelockPeriod]
  });
  console.log("Timelock deployed to: ", timelock.address);


  console.log("----------------------------------------------------");
  console.log('Deploying GovernorAlpha');
  console.log(quorumVotes);
  const governorAlpha = await deploy('GovernorAlpha', {
      from: deployer,
      args: [timelock.address, btrust.address, foundationInitialAddress, web3.utils.toWei(quorumVotes), web3.utils.toWei(proposalThreshold), votingPeriod],
  });
  console.log("GovernorAlpha deployed to: ", governorAlpha.address);
  if (governorAlpha.address !== governorAlphaAddress) {
    throw `Please check the deployment order, governorAlpha address should be ${governorAlphaAddress} but is ${governorAlpha.address}`
  }


  console.log("----------------------------------------------------");
  console.log('Deploying GovernanceDecisions');
  const governanceDecisions = await deploy('GovernanceDecisions',{
    from: deployer,
    args: [timelock.address]
  });
  console.log("GovernanceDecisions deployed to: ", governanceDecisions.address);
};
