module.exports = {
  initialSupplyBTRUST: 1000000,
  name : 'BTRUST',
  symbol: 'BTRUST',
  decimals: 18,
  networks: {
    development: {
      foundationInitialAddress: process.env.FOUNDATION_ADDRESS || '0xc1638e6d00f2c4adc0ec8bd8d4108e1c00c53ae6'
    },
    ropsten: {
      foundationInitialAddress: '0x9138B7116dA971dD0Aad20882Fa236F255fbd396'
    }
  }
}