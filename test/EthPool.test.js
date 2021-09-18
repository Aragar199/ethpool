const EthPool = artifacts.require("EthPool")
const Token = artifacts.require("SimpleToken")

const chai = require("./setupchai.js")
const BN = web3.utils.BN
const expect = chai.expect

require("dotenv").config({path: "../.env"})

contract("EthPool Test", async(accounts) => {
    const [deployerAccount, participant, anotherAccount] = accounts

    it("should have all tokens in my deployerAccount", async () => {
        let instance = await Token.deployed()
        return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN('10000000000000000000000'))
    })

    it("deployerAccount should be able to add tokens", async () => {
        let tokenInstance = await Token.deployed()
        let ethPoolInstance = await EthPool.deployed()
        let tokenValue = new BN(5)
        // await ethPoolInstance.deposit({from: participant, value: web3.utils.toWei("1", "wei")})
        // await ethPoolInstance.deposit({from: anotherAccount, value: web3.utils.toWei("3", "wei")})
        let tokensAllowed = await tokenInstance.increaseAllowance(ethPoolInstance.address, tokenValue, {from: deployerAccount})
        await ethPoolInstance.addRewards(tokenValue, {from: deployerAccount})
        return expect(tokenInstance.balanceOf(ethPoolInstance.address)).to.eventually.be.a.bignumber.equal(tokenValue)
    })

    it("participant should be able to deposit ETH", async () => {
        let instance = await EthPool.deployed()
        await instance.deposit({from: participant, value: web3.utils.toWei("1", "wei")})
        expect(instance.deposit({from: participant, value: web3.utils.toWei("1", "wei")})).to.be.fulfilled
        let currentBalance = await web3.eth.getBalance(instance.address)
        return expect(currentBalance).to.equal('1')
    })

    
})