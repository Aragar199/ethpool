const ethpool = artifacts.require("contracts/EthPool")
const contractAddress = '0x23Ac0564B72b5429dC6CF13F5bb3e8A278b3A844'

module.exports = async (callback) => {
    const res = await web3.eth.getBalance(contractAddress)
    const balance = res.toString()
    callback(`The contract balance is ${balance}`)
} 