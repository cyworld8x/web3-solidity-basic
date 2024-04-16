// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.25;

contract Escrow {
    address payable public buyer;
    address payable public seller;
    address public arbiter;
    uint public amount;
    bool public isFunded;
    bool public isCompleted;

    constructor(address payable _buyer, address payable _seller, address _arbiter) {
        buyer = _buyer;
        seller = _seller;
        arbiter = _arbiter;
        isFunded = false;
        isCompleted = false;
    }

    function fund() public payable {
        require(msg.sender == buyer, "Only the buyer can fund the escrow.");
        require(!isFunded, "Escrow is already funded.");
        require(msg.value > 0, "Funding amount must be greater than zero.");

        amount = msg.value;
        isFunded = true;
    }

    function releaseFunds() public {
        require(msg.sender == buyer || msg.sender == seller, "Only the buyer or seller can release funds.");
        require(isFunded, "Escrow is not funded.");
        require(!isCompleted, "Escrow is already completed.");

        isCompleted = true;
        if (msg.sender == buyer) {
            seller.transfer(amount);
        } else {
            buyer.transfer(amount);
        }
    }

    function refundBuyer() public {
        require(msg.sender == seller || msg.sender == arbiter, "Only the seller or arbiter can refund the buyer.");
        require(isFunded, "Escrow is not funded.");
        require(!isCompleted, "Escrow is already completed.");

        isCompleted = true;
        buyer.transfer(amount);
    }
}