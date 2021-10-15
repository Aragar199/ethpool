var SimpleToken = artifacts.require("./SimpleToken.sol")
var RewardsPool = artifacts.require("./RewardsPool.sol")

module.exports = async function(deployer) {
  const addr = await web3.eth.getAccounts()
  const token = await deployer.deploy(SimpleToken)
  await deployer.deploy(RewardsPool, token.address)
}
