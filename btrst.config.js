module.exports = {
  networks: {
    ropsten: {
      quorumVotes: "100000",
      proposalThreshold: "0",
      votingPeriod: "17280",
      timelockPeriod: 7 * 24 * 60 * 60,
    },
    mainnet: {
      quorumVotes: "100000",
      proposalThreshold: "0",
      votingPeriod: "17280",
      timelockPeriod: 7 * 24 * 60 * 60,
    },
  },
};
