# BTRUST Token

## Summary

This is the git repository for the BTRUST token. It contains a openzeppelin-based ERC20 token and truffle deployment and configuration for testing and deployment to various networks.

The token is currently deployed on Ropsten at: **0x8ad553b014105b17ebb308a0f928bdf2c6355cf0**

## Disclaimer

This codebase, including all smart contract components, have not been professionally audited and are not intended for use in a production environment. As such, users should NOT trust the system to securely hold mainnet funds without their own research.

Having said that, the contracts are based on well known, audited openzeppelin ERC20 token libraries and so are likely to have the same security as them.

## Requirements

Node, NPM, Hardhat

**NOTE:** If you are not familiar with Hardhat or with interacting with Ethereum as a developer, we suggest doing this tutorial first: https://hardhat.org/tutorial/

## Usage

### Installation

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

### Deployment
> **_NOTE:_**  Always deploy contracts from scratch using `--reset` flag.
#### Local

```bash
npx hardhat --network localhost deploy --reset
```

#### Other network

```bash
npx hardhat run --network <your-network> deploy --reset
```

#### Ropsten

The project deploys to Ropsten via Infura. Make sure you have configured your setup for deployment as described in the installation steps. Also make sure the configured account has enough test Ethereum to deploy, then:

```bash
npx hardhat run --network ropsten deploy --reset
```

## Sample proposals

### Creating a new proposal
`sample-proposals` directory contains few examples of how to create proposals. Below is one such example of creating proposal.

#### **`proposal.json`**
```json
{
    "targets": ["0xf61E0C9d284508C284ba5d8a2eB2829581974E43"],
    "values": ["0"],
    "signatures": ["transfer(address,uint256)"],
    "parameters": {
        "types": ["address", "uint256"],
        "values": ["0xd22506fBCB0FC301459CA8aDDDBD82C2895D1Ccf", "20"]
    },
    "description": "sample description"
}
```

Create a copy of the sample, modify the json as needed, and then create the proposal by running following script:
```bash
HARDHAT_NETWORK=ropsten PRIVATE_KEY=your-key node ./scripts/createNewProposal.js ../modified-proposal.json
```

**NOTE:** Make sure you have configured your setup for deployment as described in the installation steps. Also make sure the private key for used has enough test Ethereum to make the transaction

### Cancelling a proposal
```bash
HARDHAT_NETWORK=ropsten PRIVATE_KEY=your-key node ./scripts/cancelProposal.js PROPOSAL_ID
```
