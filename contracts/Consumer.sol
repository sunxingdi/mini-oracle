// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MiniOracle.sol";

contract Consumer is MiniOracleInterface {

    uint public price;
    uint public recentRequestId;

    function dataFeedBack(uint _requestId, uint _price) override external {
        // what ever you like to do with the data;
        require(recentRequestId == _requestId);
        // require(msg.sender == oracleContract);
        price = _price;
    }

    function updatePrice(address _oracleContractAddr, string calldata _currencyPair) payable external {
        uint requestId = MiniOracle(_oracleContractAddr).getData{value: msg.value}(_currencyPair);
        recentRequestId = requestId;
    }
}