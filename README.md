# BTRUST Token

## Summary

This is the git repository for the BTRUST token. It contains a openzeppelin-based ERC20 token and truffle deployment and configuration for testing and deployment to various networks.

The token is currently deployed on Ropsten at: **0xf61E0C9d284508C284ba5d8a2eB2829581974E43**

## Disclaimer

This is still alpha software and is intended for use in a production environment. As such, users should NOT trust the system to securely hold high amounts of mainnet funds without their own research.

Having said that, the contracts are based on well known, audited openzeppelin ERC20 token libraries and Compound governance so are likely to have the same security as them.

This codebase has been professionally audited. The audit can be seen here: https://drive.google.com/file/d/1vFdxVaBy1CFS8sEa2l6P4uii-pOihbet/view

## Requirements

Node, NPM, Hardhat

**NOTE:** If you are not familiar with Hardhat or with interacting with Ethereum as a developer, we suggest doing this tutorial first: https://hardhat.org/tutorial/

## Installation

### Setup
Clone the repo, then:

```bash
npm install
```

### Create secrets file

A sample secrets file is provided, make a copy of it and replace with your project secrets and configuration.

```bash
cp './secrets-example.js' './secrets.js'
```

Modify it as follows:
 - infuraProjectID: This needs to be a project id for [Infura](https://infura.io/). You can get one by creating your own Infura account and project.
 - deployerPrivateKey: This needs to be the private key of the account you want to deploy from or create proposals from. It must have sufficient gas to pay for transactions,
 - deployerAccount: This needs to be the address of the same account as above

### Start a Local Instance

```bash
npx hardhat node
```

### Running Tests

```bash
npx hardhat test
```

## Usage

### Creating a new proposal
`sample-proposals` directory contains few examples of how to create proposals. Below is one such example of creating proposal.

Create a copy of the most relevant sample, modify the json as needed, and then create the proposal by running following script:
```bash
HARDHAT_NETWORK=ropsten PRIVATE_KEY=your-key node ./scripts/createNewProposal.js ../modified-proposal.json
```

When modifying the proposal, note that the description field is in Markdown, with the first line/heading being used as the title of the proposal and the remainder being used as the description, for example:``` #Add Foundation Member\nSample description ```

**NOTE:** Make sure you have configured your setup for deployment as described in the installation steps. Also make sure the private key for used has enough test Ethereum to make the transaction

### Cancelling a proposal
```bash
HARDHAT_NETWORK=ropsten PRIVATE_KEY=your-key node ./scripts/cancelProposal.js PROPOSAL_ID
```

## Deployment
> **_NOTE:_**  Always deploy contracts from scratch using `--reset` flag.
### Local

```bash
npx hardhat --network localhost deploy --reset
```

### Other network

```bash
npx hardhat run --network <your-network> deploy --reset
```

### Ropsten

The project deploys to Ropsten via Infura. Make sure you have configured your setup for deployment as described in the installation steps. Also make sure the configured account has enough test Ethereum to deploy, then:

```bash
npx hardhat run --network ropsten deploy --reset
```

### Mainnet

For mainnet, the process is similar to Ropsten, though config needs to be setup first.

1. Copy the ropsten config (here)[https://github.com/Snowfork/BTRUST-Contracts/blob/master/btrust.config.js#L3] into similar config as needed for mainnet, for example:
```
    networks: {
        ropsten: { ... },
        mainnet: {
            quorumVotes: '100000',
            proposalThreshold: '500',
            votingPeriod: '17280',
            timelockPeriod: 7 * 24 * 60 * 60
        }
```

2. Set the namedAccounts for mainnet (here)[https://github.com/Snowfork/BTRUST-Contracts/blob/master/hardhat.config.js#L29] based on which accounts you want to deploy from and to have as the initial foundation address, for example:
```
    deployer: {
      default: 0, // default take the first account as deployer
      1: '0xe...' // Chain ID 1 is for mainnet
    },
    foundationInitialAddress: {
      default: 0,
      1: '0xe...' // Chain ID 1 is for mainnet
    }
```

3. Then to deploy:

```bash
npx hardhat run --network mainnet deploy --reset
```

**Note:** (The initial foundation address is given ALL BTRUST tokens initially, and also has guardian control over Governance until they abdicate that role)
