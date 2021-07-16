# Development
Setup the repo as in the README and you should be set for development.

## Start a Local Instance

```bash
npx hardhat node
```

## Running Tests

```bash
npx hardhat test
```

## Deployment
> **_NOTE:_**  Always deploy contracts from scratch using `--reset` flag.
### Local

```bash
npx hardhat deploy --network localhost --reset
```

### Other network

```bash
npx hardhat deploy --network <your-network> --reset
```

### Ropsten

The project deploys to Ropsten via Infura. Make sure you have configured your setup for deployment as described in the installation steps. Also make sure the configured account has enough test Ethereum to deploy, then:

```bash
npx hardhat deploy --network ropsten  --reset
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
