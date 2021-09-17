const Token = artifacts.require("SimpleToken")
const chai = require("./setupchai.js")
const BN = web3.utils.BN
const expect = chai.expect

require("dotenv").config({path: "../.env"})

contract("Simple Token Test", async (accounts) => {
    const [deployerAccount, recipient, anotherAccount] = accounts

    beforeEach(async () => {
        this.myToken = await Token.new()
    })

    it("all tokens should be in my account", async () => {
        let instance = this.myToken
        let totalSupply = await instance.totalSupply()
        return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
    })

    it("is possible to send tokens between accounts", async () => {
        const sendTokens = 1
        let instance = this.myToken
        let totalSupply = await instance.totalSupply()
        expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
        await instance.transfer(recipient, sendTokens)
        expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled
        expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)))
        return expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens))
    })

    it("is not possible to send more tokens than available in total", async () => {
        let instance = this.myToken
        let balanceOfDeployer = await instance.balanceOf(deployerAccount)
        expect(instance.transfer(recipient, new BN(balanceOfDeployer))).to.eventually.be.rejected
        return expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(balanceOfDeployer)
    })
})