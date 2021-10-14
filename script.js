const RewardsPool = artifacts.require("contracts/RewardsPool")
const contractAddress = '0x23Ac0564B72b5429dC6CF13F5bb3e8A278b3A844'

module.exports = async (callback) => {
    const res = await web3.eth.getBalance(contractAddress)
    const balance = res.toString()
    //callback(`The contract balance is ${balance}`)


    const networkId = await web3.eth.net.getId()
    const instance = new web3.eth.Contract(RewardsPool.abi,
        RewardsPool.networks[networkId] && RewardsPool.networks[networkId].address)
    const [deployeraccount, firstaccount, secondaccount] = await web3.eth.getAccounts()
    console.log(await instance.methods.participantDeposit(deployerAccount).call())
    callback(`The contract balance is ${balance}`)
} 