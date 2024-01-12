// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface MiniOracleInterface {
    function dataFeedBack(uint _requestId, uint _price) external;
}

contract MiniOracle {
    uint currentRequestId;
    mapping(uint => address) requests;

    event RequestNotify(uint indexed _requestId, string indexed _currencyPair);
    event DataFeedDone(uint _requestId, address _userContractAddr);

    function getData(string calldata currencyPair) external payable returns (uint) {
        require(msg.value >= 1, "insuffient ether");
        currentRequestId++;
        requests[currentRequestId] = msg.sender;
        emit RequestNotify(currentRequestId, currencyPair);
        return currentRequestId;
    }

    function withdraw() external {
        payable(msg.sender).transfer(address(this).balance);
    }

    function feedData(uint _requestId, uint _price) external {
        address userContractAddr = requests[_requestId];
        MiniOracleInterface userContract = MiniOracleInterface(userContractAddr);
        userContract.dataFeedBack(_requestId, _price);
        emit DataFeedDone(_requestId, userContractAddr);
    }
}