const RewardsPool = artifacts.require("RewardsPool")
const Token = artifacts.require("SimpleToken")

const chai = require("./setupchai.js")
const BN = web3.utils.BN
const expect = chai.expect

require("dotenv").config({path: "../.env"})

contract("RewardsPool Test", async(accounts) => {
    const [deployerAccount, participant, participant2, nonparticipant] = accounts

    it("should have all tokens in my deployerAccount", async () => {
        let instance = await Token.deployed()
        return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN('10000000000000000000000'))
    })

    it("participants should be able to deposit ETH", async () => {
        let instance = await RewardsPool.deployed()
        await instance.deposit({from: participant, value: web3.utils.toWei("1", "wei")})
        await instance.deposit({from: participant2, value: web3.utils.toWei("300", "wei")})
        expect(instance.deposit({from: participant, value: web3.utils.toWei("1", "wei")})).to.be.fulfilled
        expect(instance.deposit({from: participant2, value: web3.utils.toWei("300", "wei")})).to.be.fulfilled
        let currentBalance = await web3.eth.getBalance(instance.address)
        return expect(currentBalance).to.be.a.bignumber.equal(new BN("301"))
    })

    it("non participant account should have zero balance, rewards", async () => {
        let RewardsPoolInstance = await RewardsPool.deployed()
        let reward = await RewardsPoolInstance.participantReward(nonparticipant)
        let deposit = await RewardsPoolInstance.participantDeposit(nonparticipant)
        expect(reward).to.be.a.bignumber.equal(new BN("0"))
        return expect(deposit).to.be.a.bignumber.equal(new BN("0"))
    })

    it("should calculate ratio correctly amongst participants", async () => {
        let RewardsPoolInstance = await RewardsPool.deployed()
        let participantRatio = await RewardsPoolInstance.currentRatio(participant)
        let participantRatio2 = await RewardsPoolInstance.currentRatio(participant2)
        expect(participantRatio).to.be.a.bignumber.equal("3322259136212624")
        return expect(participantRatio2).to.be.a.bignumber.equal("996677740863787375")
    })

    it("should distribute new rewards correctly amongst participants", async () => {
        let tokenInstance = await Token.deployed()
        let RewardsPoolInstance = await RewardsPool.deployed()
        let tokenValue = new BN("200000000000000000000")
        await tokenInstance.increaseAllowance(RewardsPoolInstance.address, tokenValue, {from: deployerAccount})
        await RewardsPoolInstance.addRewards(tokenValue, {from: deployerAccount})
        let reward = await RewardsPoolInstance.participantReward(participant)
        let reward2 = await RewardsPoolInstance.participantReward(participant2)
        expect(reward).to.be.a.bignumber.equal(new BN("664451827242524800"))
        return expect(reward2).to.be.a.bignumber.equal(new BN("199335548172757475000"))
    })

    it("participants should be able to withdraw rewards", async () => {
        let tokenInstance = await Token.deployed()
        let RewardsPoolInstance = await RewardsPool.deployed() 
        await RewardsPoolInstance.withdraw({from: participant})
        await RewardsPoolInstance.withdraw({from: participant2})
        let participantBalance = await tokenInstance.balanceOf(participant) 
        let participantBalance2 = await tokenInstance.balanceOf(participant2)
        expect(participantBalance).to.be.a.bignumber.equal(new BN("664451827242524800"))
        return expect(participantBalance2).to.be.a.bignumber.equal(new BN("199335548172757475000"))
    })

    
})