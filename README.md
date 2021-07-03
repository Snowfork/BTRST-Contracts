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

## Usage
There are some scripts to help with interacting with existing deployments of the contracts, for example creating and cancelling proposals [here](./docs/proposal-creation.md)

## Development and deployment
See [here](./docs/development-and-deployment.md) for further guidance on developing the contracts yourself locally or deploying new instances of them to an Ethereum network
