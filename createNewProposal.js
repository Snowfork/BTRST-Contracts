const network = process.env.HARDHAT_NETWORK
const hre = require("hardhat");
const ethers = hre.ethers;
const GovernorAlpha = require(`./deployments/${network}/GovernorAlpha.json`)
const proposal = require(process.argv[2])

async function main() {

    const provider = ethers.providers.getDefaultProvider(network);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(GovernorAlpha.address, GovernorAlpha.abi, wallet);

    await contract.propose(proposal.targets, proposal.values, proposal.signatures, proposal.callDatas, proposal.description, {gasPrice: 20000000000, gasLimit: 7600000})
} 

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


  