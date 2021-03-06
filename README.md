# BTRUST Token

## Summary

This is the git repository for the BTRUST token. It contains a openzeppelin-based ERC20 token and truffle deployment and configuration for testing and deployment to various networks.

The token is currently deployed on Ropsten at: **0xb8d9ba701728d2ebda3042f0183efc4d4982f6d8**

## Disclaimer

This codebase, including all smart contract components, have not been professionally audited and are not intended for use in a production environment. As such, users should NOT trust the system to securely hold mainnet funds without their own research.

Having said that, the contracts are based on well known, audited openzeppelin ERC20 token libraries and so are likely to have the same security as them.

## Requirements

Node, NPM, Truffle 5+

## Usage

### Installation

Clone the repo, then:

```bash
npm install
```

Can use truffle or hardhat, hardhat is recommended

### Start a Local Instance 

#### Ganache option
```bash
ganache-cli
```

#### hardhat option
```bash
npx hardhat node
```

### Running Tests with hardhat option

```bash
npx hardhat test
```

### Running Tests with truffle option

```bash
truffle test
```

### Deployment with hardhat option

#### Local

```bash
npx hardhat run --network localhost scripts/deploy.js
```

#### Other network

```bash
npx hardhat run --network <your-network> scripts/deploy.js
```

### Deployment with truffle option

#### Local

```bash
truffle migrate --network development
```

#### Other network

```bash
truffle migrate --network <network>
```

#### Ropsten

The project deploys to Ropsten via Infura. A secrets-example.js file is included. Copy this file into secrets.js, replacing the infuraProjectID with your Infura project ID and the deployerMnemonicRopsten with the private mnemonic that the Ropsten deployer account comes from. Make sure this account has enough test Ethereum to deploy, then:

#### hardhat 
```bash
npx hardhat run --network ropstein scripts/deploy.js
```
