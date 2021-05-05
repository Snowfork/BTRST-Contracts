const network = process.env.HARDHAT_NETWORK
const hre = require("hardhat");
const ethers = hre.ethers;
const GovernorAlpha = require(`../deployments/${network}/GovernorAlpha.json`)
const proposalID = process.argv[2]

async function main() {
  const provider = ethers.providers.getDefaultProvider(network);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(GovernorAlpha.address, GovernorAlpha.abi, wallet);

  const tx = await contract.cancel(proposalID)
  console.log("Transaction hash: ", tx.hash)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
