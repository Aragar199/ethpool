// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EthPool is Ownable {

    IERC20 private _token;

    uint256 currentSession = block.number;

    struct Session {
        address[] participants;
        uint256 sessionDepositTotal;
        mapping(address => uint256) sessionDeposit;
        mapping(address => uint256) sessionIndex;
        mapping(address => bool) isParticipating;
    }
    
    mapping (address => uint256) balances;
    mapping (address => uint256) rewards;
    mapping (uint256 => Session) session;

    constructor (IERC20 token) {
        _token = token;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        addParticipant(msg.sender);
        updateSessionDeposits(msg.sender, msg.value);
    }

    function withdraw() public {
        uint256 userBalance = balances[msg.sender];
        balances[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: userBalance}("");
        require(sent, "Failed to send user balance back to the user");
        uint256 userReward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        bool sentReward = _token.transfer(msg.sender, userReward);
        require(sentReward, "Failed to send user rewards to the user");
    }

    function addRewards(uint256 _amount) external onlyOwner {
        address from = msg.sender;
        _token.transferFrom(from, address(this), _amount);
        currentSession += block.number;
    }

    function addParticipant(address _addr) internal {
        if (session[currentSession].isParticipating[msg.sender]) {
        } else {
            session[currentSession].sessionIndex[_addr] = session[currentSession].participants.length;
            session[currentSession].participants.push(_addr);
            session[currentSession].isParticipating[msg.sender] = true;
        }
    }

    function removeParticipant(address _addr) internal {
        if (!session[currentSession].isParticipating[_addr]) {
            return;
        } else {
            delete session[currentSession].isParticipating[_addr];
            delete session[currentSession].sessionDeposit[_addr];
            uint index = session[currentSession].sessionIndex[_addr];
            uint lastIndex = session[currentSession].participants.length - 1;
            address lastKey = session[currentSession].participants[lastIndex];

            session[currentSession].sessionIndex[lastKey] = index;
            delete session[currentSession].sessionIndex[_addr];
            session[currentSession].participants.pop();
        }
    }

    function updateSessionDeposits(address _addr, uint256 _amount) internal {
        session[currentSession].sessionDepositTotal += _amount;
        session[currentSession].sessionDeposit[_addr] += _amount;
    }
    function calculateRatio(uint256 _deposit, uint256 _totalDeposit) internal view returns(uint256 ratio) {
        ratio = (_deposit * 100) / _totalDeposit;
    }

    function calculateRewards(uint256 _rewards, uint256 _ratio) internal view returns(uint256 participantRewards) {
        participantRewards = (_rewards * _ratio) / 100;
    }

}