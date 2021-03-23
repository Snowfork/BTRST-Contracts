pragma solidity ^0.6.7;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract DecisionModel is AccessControl {

    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    uint8 public marketplaceFee;

    event MarketplaceFeeChanged(uint8 oldFee, uint8 newFee);

    constructor(address governor_) public {
        _setupRole(GOVERNOR_ROLE, governor_);
        marketplaceFee = 1; // set default marketplace fee
    }

    function setMarketplaceFee(uint8 fee) public {
        require(hasRole(GOVERNOR_ROLE, msg.sender), "DecisionModel::setMarketplaceFee ACCESS FORBIDDEN");
        require(fee < 100, "DecisionModel::setMarketplaceFee fee must be less than 100");
        
        uint8 oldFee;
        oldFee = marketplaceFee;
        marketplaceFee = fee;
        emit MarketplaceFeeChanged(oldFee, marketplaceFee);
    }
}