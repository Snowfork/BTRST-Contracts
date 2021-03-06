const configBTRUST     = require('../../btrust-config.js')
const BTRUST     = artifacts.require('BTRUST')
const {etherFormat, tokenFormat, ZERO_ADDRESS} = require('../../helpers.js')

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe('BTRUST', function() {

  let accounts,bTrust, result
  // get initial Contract constructor parameters; and foundationInitialAddress(deployer) from config
  const {initialSupplyBTRUST, name, symbol,decimals, networks: {ropsten:{foundationInitialAddress}}}  = configBTRUST  

  before(async function() {
    accounts = await web3.eth.getAccounts()
    const [deployer, account1, account2] = accounts
    bTrust = await BTRUST.new(foundationInitialAddress, tokenFormat(initialSupplyBTRUST))
  });

  describe("Deployment", function() {
    it('tracks the name', async () => {
        result = await bTrust.name()
        assert.equal(result, name)
    })    
    it('tracks the symbol', async ()  => {
        result = await bTrust.symbol()
        assert.equal(result, symbol)
    })   
    it('tracks the decimals', async ()  => {
        result = await bTrust.decimals()
        assert.equal(result.toString(), decimals.toString())
    })    
    it('tracks the initial total supply', async ()  => {
        result = await bTrust.totalSupply()
        assert.equal(result.toString(),tokenFormat(initialSupplyBTRUST).toString())
    })   
    it('assigns the total supply to the deployer', async ()  => {   
        result = await bTrust.balanceOf(foundationInitialAddress)
        assert.equal(result.toString(),tokenFormat(initialSupplyBTRUST).toString())
     })
    /*
    it('tracks the owner', async () => {
        result = await token.owner() 
        assert.equal(result, foundationInitialAddress)
    })
    */
  });
});

