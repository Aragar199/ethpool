const EthPool = artifacts.require("EthPool")
const Token = artifacts.require("SimpleToken")

const chai = require("./setupchai.js")
const BN = web3.utils.BN
const expect = chai.expect

require("dotenv").config({path: "../.env"})

contract("EthPool Test", async(accounts) => {
    const [deployerAccount, participant, participant2, nonparticipant] = accounts

    it("should have all tokens in my deployerAccount", async () => {
        let instance = await Token.deployed()
        return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN('10000000000000000000000'))
    })

    it("deployerAccount should be able to add tokens", async () => {
        let tokenInstance = await Token.deployed()
        let ethPoolInstance = await EthPool.deployed()
        let tokenValue = new BN(5)
        await tokenInstance.increaseAllowance(ethPoolInstance.address, tokenValue, {from: deployerAccount})
        await ethPoolInstance.addRewards(tokenValue, {from: deployerAccount})
        return expect(tokenInstance.balanceOf(ethPoolInstance.address)).to.eventually.be.a.bignumber.equal(tokenValue)
    })

    it("participants should be able to deposit ETH", async () => {
        let instance = await EthPool.deployed()
        await instance.deposit({from: participant, value: web3.utils.toWei("1", "wei")})
        await instance.deposit({from: participant2, value: web3.utils.toWei("3", "wei")})
        expect(instance.deposit({from: participant, value: web3.utils.toWei("1", "wei")})).to.be.fulfilled
        expect(instance.deposit({from: participant2, value: web3.utils.toWei("3", "wei")})).to.be.fulfilled
        let currentBalance = await web3.eth.getBalance(instance.address)
        expect(currentBalance).to.be.a.bignumber.equal(new BN("4"))
    })

    it("non participant account should have zero balance, rewards", async () => {
        let ethPoolInstance = await EthPool.deployed()
        let reward = await ethPoolInstance.participantReward(nonparticipant)
        let deposit = await ethPoolInstance.participantDeposit(nonparticipant)
        expect(reward).to.be.a.bignumber.equal(new BN("0"))
        return expect(deposit).to.be.a.bignumber.equal(new BN("0"))
    })

    it("should calculate ratio correctly amongst participants", async () => {
        let ethPoolInstance = await EthPool.deployed()
        let participantRatio = await ethPoolInstance.currentRatio(participant)
        let participantRatio2 = await ethPoolInstance.currentRatio(participant2)
        expect(participantRatio).to.be.a.bignumber.equal("250000000000000000")
        return expect(participantRatio2).to.be.a.bignumber.equal("750000000000000000")
    })

    it("should distribute new rewards correctly amongst participants", async () => {
        let tokenInstance = await Token.deployed()
        let ethPoolInstance = await EthPool.deployed()
        let tokenValue = new BN("200")
        await tokenInstance.increaseAllowance(ethPoolInstance.address, tokenValue, {from: deployerAccount})
        await ethPoolInstance.addRewards(tokenValue, {from: deployerAccount})
        let reward = await ethPoolInstance.participantReward(participant)
        let reward2 = await ethPoolInstance.participantReward(participant2)
        expect(reward).to.be.a.bignumber.equal(new BN("50"))
        return expect(reward2).to.be.a.bignumber.equal(new BN("150"))
    })

    
})