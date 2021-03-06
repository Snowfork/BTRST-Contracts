// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BTRUST is ERC20 {

    constructor(address foundationInitialAddress, uint256 initialSupply) ERC20("BTRUST", "BTRUST") {
        _mint(foundationInitialAddress, initialSupply);
    }
}

