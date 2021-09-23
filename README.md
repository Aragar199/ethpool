# ethpool
#### Summary

ETHPool provides a service where people can deposit ETH and they will receive weekly rewards. Users must be able to take out their deposits along with their portion of rewards at any time. New rewards are deposited manually into the pool by the ETHPool team each week using a contract function.

#### Requirements

- Only the team can deposit rewards.
- Deposited rewards go to the pool of users, not to individual users.
- Users should be able to withdraw their deposits along with their share of rewards considering the time when they deposited.

Example:

> Let say we have user **A** and **B** and team **T**.
>
> **A** deposits 100, and **B** deposits 300 for a total of 400 in the pool. Now **A** has 25% of the pool and **B** has 75%. When **T** deposits 200 rewards, **A** should be able to withdraw 150 and **B** 450.
>
> What if the following happens? **A** deposits then **T** deposits then **B** deposits then **A** withdraws and finally **B** withdraws.
> **A** should get their deposit + all the rewards.
> **B** should only get their deposit because rewards were sent to the pool before they participated.

### Deploy your contract
Contract is deployed using truffle / infura to ropsten test net.

### Verify the contract in Etherscan
- https://ropsten.etherscan.io/address/0x23Ac0564B72b5429dC6CF13F5bb3e8A278b3A844

### Interact with the contract
- Built using react truffle box, deployment instructions in client/README.md
- Click on deposit button to deposit one wei to the contract
- Adding rewards is restricted to owner, increasing allowance and adding rewards will not work

### Create a subgraph
- Subgraph repo - https://github.com/Aragar199/pool
- Subgraph link - https://thegraph.com/legacy-explorer/subgraph/aragar199/pool

