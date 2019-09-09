pragma solidity >=0.5.8 <0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract BTRUST is ERC20, ERC20Detailed {

    address foundationInitialAddress = 0xa83adc3B94802a9132101c7Bd8ac3A93604e2fA8;
    uint256 initialSupply = 10000;

    constructor() ERC20Detailed("BTRUST", "BTRUST", 18) public {
        _mint(foundationInitialAddress, initialSupply);
    }
}