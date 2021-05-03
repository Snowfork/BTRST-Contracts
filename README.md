# BTRUST Token

## Summary

This is the git repository for the BTRUST token. It contains a openzeppelin-based ERC20 token and truffle deployment and configuration for testing and deployment to various networks.

The token is currently deployed on Ropsten at: **0xb8d9ba701728d2ebda3042f0183efc4d4982f6d8**

## Disclaimer

This codebase, including all smart contract components, have not been professionally audited and are not intended for use in a production environment. As such, users should NOT trust the system to securely hold mainnet funds without their own research.

Having said that, the contracts are based on well known, audited openzeppelin ERC20 token libraries and so are likely to have the same security as them.

## Requirements

Node, NPM, Hardhat

## Usage

### Installation

Clone the repo, then:

```bash
npm install
```

### Create secrets file

A sample secrets file is provided, make a copy of it and replace with your project secrets. 

```bash
cp './secrets-example.js' './secrets.js'
```

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

The project deploys to Ropsten via Infura. A secrets-example.js file is included. Copy this file into secrets.js, replacing the infuraProjectID with your Infura project ID and the deployerMnemonicRopsten with the private mnemonic that the Ropsten deployer account comes from. Make sure this account has enough test Ethereum to deploy, then:

```bash
npx hardhat run --network ropsten deploy --reset
```

## Sample proposals

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

Create above proposal by running following script
```bash
HARDHAT_NETWORK=ropsten PRIVATE_KEY=your-key node ./createNewProposal.js ./proposal.json
```