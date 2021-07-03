# Creating and cancelling proposals

## Creating a new proposal
`sample-proposals` directory contains few examples of how to create proposals. Below is one such example of creating proposal.

Create a copy of the most relevant sample, modify the json as needed, and then create the proposal by running following script:
```bash
HARDHAT_NETWORK=ropsten PRIVATE_KEY=your-key node ./scripts/createNewProposal.js ../modified-proposal.json
```

When modifying the proposal, note that the description field is in Markdown, with the first line/heading being used as the title of the proposal and the remainder being used as the description, for example:``` #Add Foundation Member\nSample description ```

**NOTE:** Make sure you have configured your setup for deployment as described in the installation steps. Also make sure the private key for used has enough test Ethereum to make the transaction

## Cancelling an existing proposal
```bash
HARDHAT_NETWORK=ropsten PRIVATE_KEY=your-key node ./scripts/cancelProposal.js PROPOSAL_ID
```
