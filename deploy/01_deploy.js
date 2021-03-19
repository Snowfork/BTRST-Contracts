module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
    getUnnamedAccounts,
  }) => {
    const {deploy} = deployments;
    const {deployer, foundationInitialAddress} = await getNamedAccounts();

    console.log(foundationInitialAddress)
  
    console.log("----------------------------------------------------")
    console.log('Deploying BTRUST');
    const btrust = await deploy('BTRUST', {
      from: deployer,
      args: [foundationInitialAddress],
    });
    console.log("BTRUST deployed to: ", btrust.address)

    console.log("----------------------------------------------------")
    console.log('Deploying Timelock');
    const timelock = await deploy('Timelock', {
      from: deployer,
      args: [foundationInitialAddress, 7 * 24 * 60 * 60],
    });
    console.log("Timelock deployed to: ", timelock.address)

    console.log("----------------------------------------------------")
    console.log('Deploying GovernorAlpha');
    const governorAlpha = await deploy('GovernorAlpha', {
      from: deployer,
      args: [timelock.address, btrust.address, foundationInitialAddress],
    });
    console.log("GovernorAlpha deployed to: ", governorAlpha.address)

  };