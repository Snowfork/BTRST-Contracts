// SPDX-License-Identifier: MIT
pragma solidity 0.7.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./BTRUST.sol";

contract Governance {

    /// @notice The name of this contract
    string public name;

    /// @notice The address of the Governor Guardian
    address public guardian;

    /// @notice The address of the BTRUST Token
    BTRUST public bTrust;

    constructor(string memory _name, address _bTrust, address _guardian) {
        name   = _name;
        bTrust = BTRUST(_bTrust);
        guardian = _guardian;
    }
}



