pragma solidity >=0.5.8 <0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract BTRUST is ERC20, ERC20Detailed {

    constructor(address foundationInitialAddress, uint256 initialSupply) ERC20Detailed("BTRUST", "BTRUST", 18) public {
        _mint(foundationInitialAddress, initialSupply);
    }
}