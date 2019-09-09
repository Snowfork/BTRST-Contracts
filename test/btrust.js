const BTRUST = artifacts.require('BTRUST');

const foundationInitialAddress = '0xa83adc3B94802a9132101c7Bd8ac3A93604e2fA8'

contract('BTRUST', accounts => {
  it('should put 10000 BTRUST in the initial foundation account', () =>
  BTRUST.deployed()
      .then(instance => instance.balanceOf.call(foundationInitialAddress))
      .then(balance => {
        assert.equal(
          balance.valueOf().toString(),
          '10000',
          '10000 was not in the first account'
        );
      }));
});
