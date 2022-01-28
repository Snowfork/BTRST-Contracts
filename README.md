# BTRST Token

## Summary

This is the git repository for the BTRST token. It contains a openzeppelin-based ERC20 token and truffle deployment and configuration for testing and deployment to various networks.

Deploying BTRST with: { deployer: 0x9A7C6d6f6317C17c6aFb4F5D18B3e2F8E02F655F, foundationInitialAddress: 0x9A7C6d6f6317C17c6aFb4F5D18B3e2F8E02F655F }}
Fake BTRST deployed to: **0x8B32c3D92dF144A2b6B242E51573b1EF55C7ccBD**

Timelock deployed to: **0x46b7a85029F28D2f1561c4D83782ef6B4f6d7278**

GovernorAlpha deployed to: **0xCD2794981bAC5180f326F96EFBBc664af1617C88**

GovernanceDecisions deployed to: **0x5b465d0Ee22508eD5a70FB0873c2cC1dD4d664aa**

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

## Ref

- https://docs.openzeppelin.com/contracts/4.x/governance
- https://github.com/compound-finance/compound-protocol/tree/master/contracts/Governance
- https://compound.finance/docs/governance
- https://docs.google.com/document/d/1Jn_-sgSac73nVHmOFZ16FjTjQH8pZAlO/edit#heading=h.97tbi9kujppy
