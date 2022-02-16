// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

/*
    frontrun prevent
*/
contract GasPriceController {
    event SetMaxGasPrice(uint256 maxGasPrice);

    modifier onlyValidGasPrice() {
        require(
            tx.gasprice <= _maxGasPrice,
            "GasPriceController: gasPrice too high"
        );
        _;
    }

    uint256 public constant MIN_GASPRICE = 5 gwei;

    uint256 private _maxGasPrice = MIN_GASPRICE;

    function _setMaxGasPrice(uint256 maxGasPrice_) internal {
        require(maxGasPrice_ >= MIN_GASPRICE, "GasPriceController: too low");
        _maxGasPrice = maxGasPrice_;
        emit SetMaxGasPrice(maxGasPrice_);
    }

    function maxGasPrice() external view returns (uint256) {
        return _maxGasPrice;
    }
}
