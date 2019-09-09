const BTRUST = artifacts.require('BTRUST');
const config = require('../btrust-config');

const BN = web3.utils.BN;
const decimalsBN = new BN(config.decimals);
const divisor = new BN(10).pow(decimalsBN)

contract('BTRUST', _ => {
  it(`should put ${config.initialSupplyBTRUST} BTRUST in the initial foundation account`, () =>
  BTRUST.deployed()
      .then(instance => instance.balanceOf.call(config.networks.development.foundationInitialAddress))
      .then(balance => {
        balanceBN = balance.valueOf();
        const balanceBTRUST = balanceBN.div(divisor)
        BTRUSTTokens = web3.utils.fromWei(balanceBN)
        assert.equal(
          balanceBTRUST,
          config.initialSupplyBTRUST,
          `${config.initialSupplyBTRUST} was not in the foundation account`
        );
      }));
});
