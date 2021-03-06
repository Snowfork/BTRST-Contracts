const { assert } = require('chai')
const { isTemplateTail, isFunctionDeclaration } = require('typescript')
const configBTRUST     = require('../../btrust-config.js')
const configGovernance = require('../../governor-config.js')
const BTRUST     = artifacts.require('BTRUST')
const Governance = artifacts.require('Governance')
const {tokenFormat, ZERO_ADDRESS} = require('../../helpers.js')

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe('Governance', function() {

  let accounts,bTrust, result
  // get initial Contract constructor parameters; and foundationInitialAddress(deployer) from config
  const {initialSupplyBTRUST, networks: {ropsten:{foundationInitialAddress}}}  = configBTRUST 
  const {name}  = configGovernance

  before(async function() {
    accounts = await web3.eth.getAccounts()
    const [deployer, account1, account2] = accounts
    bTrust    = await BTRUST.new(foundationInitialAddress, tokenFormat(initialSupplyBTRUST))
    governor = await Governance.new(name, bTrust.address, foundationInitialAddress)
  });

  describe('deployement', () => {
      it('has a correct name', async() => {
        result = await governor.name()
        assert.equal(result, name)
      })
      it('has correct BTRUST address', async () => {
          result = await governor.bTrust()
          assert.equal(result, bTrust.address)
      })
      it('has the correct guardian assigned', async () => {
          result = await governor.guardian()
          assert.equal(result, foundationInitialAddress)
      })
  })

})