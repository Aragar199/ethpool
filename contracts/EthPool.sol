// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EthPool is Ownable {
    
    IERC20 private _token;

    struct funds {
      address participant;
      uint256 currentDeposit;
      uint256 totalRewards;
      uint256 ratio;
    }
    
    mapping (address => uint256) balances;
    
    event Deposit(address indexed sender, uint256 amount);
    
    event RewardsAdded(uint256 amount);
    
    /**
     * @dev Constructor sets token that can be received
     */
    constructor (IERC20 token) {
        _token = token;
    }
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw() public {
        uint256 userBalance = balances[msg.sender];
        require(balances[msg.sender] > 0, "Balance is 0, nothing to withdraw");
        balances[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: userBalance}("");
        require(sent, "Failed to send user balance back to the user");
    }
    
    function addRewards(uint256 _amount) public onlyOwner {
        address from = msg.sender;
        _token.transferFrom(from, address(this), _amount);
        emit RewardsAdded(_amount);
    }
    
    
    
    
    
    
}