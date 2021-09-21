// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/**
* @title EthPool Contract
* @author alexponce.eth
* @notice A contract that allows user to farm SimpleToken rewards based on contributions to the pool
 */
contract EthPool is Ownable {

    // SimpleToken interface
    IERC20 private _token;

    // Participants that have contributed
    address[] participants;
    
    // Current total tokens added to the contract as rewards
    uint256 totalRewards;

    // Participant flag and index in participants
    struct Participant {
        bool isParticipant;
        uint256 participantIndex;
    }
    
    // address to Participant information
    mapping(address => Participant) participant;

    // funds participant will receive when they withdraw
    mapping(address => uint256) public participantDeposit;

    // rewards participant will receive when they withdraw
    mapping(address => uint256) public participantReward;

    // EthPool SimpleToken
    constructor (IERC20 token) {
        _token = token;        
    }

    // EthPool Events
    event DepositAdded(address indexed _to, uint256 _deposit);
    event RewardAdded(address indexed _to, uint256 _reward);
    event ParticipantAdded(address indexed _participating);
    event ParticipantRemoved(address indexed _removed);


    /**
    * @notice EthPool method to deposit funds to the pool
    */
    function deposit() public payable {
        addParticipant(msg.sender);
        participantDeposit[msg.sender] += msg.value;
        emit DepositAdded(msg.sender, msg.value);
    }

    /**
    * @notice EthPool method to withdraw participant funds and rewards
    */
    function withdraw() public {
        uint userDeposit = participantDeposit[msg.sender];
        participantDeposit[msg.sender] = 0;
        payable(msg.sender).transfer(userDeposit);
        uint userReward = participantReward[msg.sender];
        participantReward[msg.sender] = 0;
        bool sentReward = _token.transfer(msg.sender, userReward);
        require(sentReward, "Failed to send participant token reward");
        removeParticipant(msg.sender);
    }

    /**
    * @notice EthPool method to add SimpleToken rewards to the pool
    * @param _rewards to be added to EthPool Contract
    */
    function addRewards(uint256 _rewards) external payable onlyOwner{
        address from = msg.sender;
        (bool poolRewards) = _token.transferFrom(from, address(this), _rewards);
        require(poolRewards, "Failed to add rewards to pool");
        totalRewards += _rewards;
        uint numofParticipants = participants.length;
        for (uint i = 0; i < numofParticipants; i++) {
            address _participant = participants[i];
            uint256 _ratio = calculateRatio(participantDeposit[_participant], address(this).balance);
            uint256 _participantrewards = calculateRewards(_rewards, _ratio);
            participantReward[_participant] += _participantrewards;
            emit RewardAdded(_participant, _participantrewards);
        }
    }
    
    /**
    * @notice EthPool method to track participating address in the pool
    * @param _addr of participant to be added if not participating
    */
    function addParticipant(address _addr) internal {
        if (participant[_addr].isParticipant) {
            return;
        } else {
            uint index = participants.length;
            participant[_addr].participantIndex = index;
            participants.push(_addr);
            participant[_addr].isParticipant = true;
            emit ParticipantAdded(_addr);
        }
    }

    /**
    * @notice EthPool method to remove participant from pool
    * @param _addr of participant to be removed if participating
    */
    function removeParticipant(address _addr) internal {
        if (!participant[_addr].isParticipant) {
            return;
        } else {
            participant[_addr].isParticipant = false;
            uint index = participant[_addr].participantIndex;
            uint lastIndex = participants.length - 1;
            address lastKey = participants[lastIndex];
            participant[lastKey].participantIndex = index;
            delete participant[_addr].participantIndex;
            participants.pop();
            emit ParticipantRemoved(_addr);
        }
    }

    /**
    * @notice EthPool method to calculate percentage of funds in pool
    * @param _deposit funds to be calculated
    * @param _totalDeposit current total funds in the pool
    */
    function calculateRatio(uint256 _deposit, uint256 _totalDeposit) internal view returns(uint256 ratio) {
        ratio = (_deposit * 100) / _totalDeposit;
    }

    /**
    * @notice EthPool method to calculate rewards based on percentage
    * @param _rewards total rewards to be distributed
    * @param _ratio percentage of total rewards to be calculated
    */
    function calculateRewards(uint256 _rewards, uint256 _ratio) internal view returns(uint256 participantRewards) {
        participantRewards = (_rewards * _ratio) / 100;
    }
}