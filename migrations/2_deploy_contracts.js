var SimpleToken = artifacts.require("./SimpleToken.sol")
var EthPool = artifacts.require("./EthPool.sol")

module.exports = async function(deployer) {
  let addr = await web3.eth.getAccounts()
  const token = await deployer.deploy(SimpleToken)
  await deployer.deploy(EthPool, token.address)
}
