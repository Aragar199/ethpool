// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EthPool is Ownable {

    IERC20 private _token;

    uint256 public currentSession;
    uint256 totalRewards;

    address[] participantAddress;
    mapping (address => uint256) participantIndex;

    struct Session {
        address[] participants;
        uint256 sessionDepositTotal;
        uint256 sessionRewardsTotal;
        mapping(address => uint256) sessionDeposit;
        mapping(address => uint256) sessionIndex;
        mapping(address => bool) isParticipating;
    }
    
    mapping (address => uint256) public balances;
    mapping (address => uint256) public rewards;
    mapping (uint256 => Session) public session;

    constructor (IERC20 token) {
        _token = token;
    }

    event SuccessfulDeposit(address indexed depositer, uint256 amount);
    event RewardAdded(address indexed rewarded, uint256 amount);


    function deposit() public payable {
        emit SuccessfulDeposit(msg.sender, msg.value);
        balances[msg.sender] += msg.value;
        addParticipant(msg.sender);
        updateSessionDeposits(msg.sender, msg.value);
    }

    function withdraw() public {
        uint256 userBalance = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(userBalance);
        uint256 userReward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        bool sentReward = _token.transfer(msg.sender, userReward);
        require(sentReward, "Failed to send user rewards to the user");
        removeParticipant(msg.sender);
    }
    
    function currentBalance(address _addr) public view returns(uint256 balance) {
        return _addr.balance;
    }

    function addRewards(uint256 _rewards) external payable onlyOwner {
        address from = msg.sender;
        (bool sessionRewards) = _token.transferFrom(from, address(this), _rewards);
        require(sessionRewards, "Failed to add rewards to session");
        totalRewards += _rewards;
        uint256 numParticipants = session[currentSession].participants.length;
        
        for (uint i = 0; i < numParticipants; i++) {
            address _participant = session[currentSession].participants[0];
            uint256 _deposit = session[currentSession].sessionDeposit[_participant];
            uint256 _totalDeposit = session[currentSession].sessionDepositTotal;
            uint256 _ratio = calculateRatio(_deposit, _totalDeposit);
            uint256 _participantReward = calculateRewards(_rewards, _ratio);
            rewards[_participant] += _participantReward;
            emit RewardAdded(_participant, _participantReward);
            removeParticipant(_participant);
        }
        delete session[currentSession].participants;
        delete session[currentSession].sessionRewardsTotal; 
        delete session[currentSession].sessionDepositTotal;
        currentSession += block.number;
    }

    function startSession() internal {

    }

    function addParticipant(address _addr) internal {
        if (session[currentSession].isParticipating[msg.sender]) {
            return;
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

    function removeAddress(address _addr) internal {
        uint index = participantIndex[_addr];
        uint lastIndex = participantAddress.length - 1;
        address lastKey = participantAddress[lastIndex];
        participantIndex[lastKey] = index;
        delete participantIndex[_addr];
        participantAddress.pop();
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