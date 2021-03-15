const configBTRUST = require('../btrust-config')
const { initialSupplyBTRUST, networks: { ropsten:{ foundationInitialAddress } } } = configBTRUST


async function main() {

    const BN = web3.utils.BN;
    const decimalsBN = new BN(config.decimals);
    const multiplier = new BN(10).pow(decimalsBN);
    const initialSupplyBN = new BN(initialSupplyBTRUST).mul(multiplier)

    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const Token = await ethers.getContractFactory("BTRUST");
    const token = await Token.deploy(foundationInitialAddress, initialSupplyBN);

    console.log("Token address:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });