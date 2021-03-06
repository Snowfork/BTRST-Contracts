const web3  = require('web3')
// Helpers to format eth and token to full decimals wei and like wei 
// use only if Token decimals = 18 or adjust for other value
const etherFormat = (n) => {
    return new web3.utils.BN(
      web3.utils.toWei(n.toString(), 'ether')
    )
  }
  
// Same as ether if decimals = 18
const tokenFormat = (n) => etherFormat(n)

// tokenFormat to work with hardhat, ethers.js
const tokenFormatMain = (num) => {
  return '0x' + (num*Math.pow(10, 18)).toString(16)
}

// O address
const ZERO_ADDRESS  = '0x0000000000000000000000000000000000000000'
const EVM_REVERT    = 'VM Exception while processing transaction: revert'

module.exports = {
    etherFormat,
    tokenFormat,
    ZERO_ADDRESS,
    EVM_REVERT,
    tokenFormatMain
}
