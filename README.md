# BTRUST Token

## Summary

This is the git repository for the BTRUST token. It contains a openzeppelin-based ERC20 token and truffle deployment and configuration for testing and deployment to various networks.

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

### Running Tests

```bash
truffle test
```

### Deployment

#### Local

```bash
truffle migrate --network development
```

#### Ropsten

The project deploys to Ropsten via Infura. A secrets-example.js file is included. Copy this file into secrets.js, replacing the infuraProjectID with your Infura project ID and the deployerMnemonicRopsten with the private mnemonic that the Ropsten deployer account comes from. Make sure this account has enough test Ethereum to deploy, then:

```bash
truffle migrate --network ropsten
```

The token is currently deployed at: **0x34c7d0a921f679138be68dd3e3e51f9dab2fdadd**
