# Rewards Pool
## Description

Rewards Pool provides a service where people can deposit ETH and they will receive rewards in the form of ERC20 tokens. Users are be able to take out their deposits along with their portion of ERC20 rewards at any time. New ERC20 rewards are deposited manually into the pool by the contract owner using a contract function.

#### FAQ

- Users who deposit funds to the RewardsPool contract are referred to as `participants`
- Only the RewardsPool owner can add rewards.
- Rewards are the minted ERC20 token SimpleToken contract.
- Added rewards go to the pool of users, not to individual users.
- Users should be able to withdraw their deposits along with their share of rewards.
- Share of rewards is determined by the total of participant deposited funds relative to the total amount of deposited funds at the time of rewards added.
- The total of deposited funds rolls over after rewards are added and allocated to each participant. If **A** deposits 100 then rewards are added, **A** still has deposited 100 total until **A** withdraws from participating.
- Any participant is considered participating as long as they have deposited funds to the pooled funds and have not withdrawn. They are allowed to rejoin at any time.
#### Example:

> Let say we have user **A** and **B** and team **T**.
>
> **A** deposits 100, and **B** deposits 300 for a total of 400 in the pool. Now **A** has 25% of the pool and **B** has 75%. When rewards 200 ERC20 token rewards are added, **A** should be able to withdraw 150 and **B** 450.
>
> What if the following happens? **A** deposits, rewards are added, **then** **B** deposits, **A** withdraws and finally **B** withdraws?
> **A** should get their deposit + all the rewards.
> **B** should only get their deposit because rewards were sent to the pool before they participated.

#### Steps to Test:
1. Install Truffle
```
npm install -g truffle
```
2. Run Truffle Test Suite
```
truffle test
```

### Interact with the contract
1. Via Script:
  ```
  truffle exec script.js --network=ropsten_infura
  ```
2. Via React Frontend:
   - Built using react truffle box, deployment instructions in client/README.md
   - Click on deposit button to deposit one wei to the contract
   - Adding rewards is restricted to owner, increasing allowance and adding rewards will not work

### Create a subgraph
- Subgraph repo - https://github.com/Aragar199/pool
- Subgraph link - https://thegraph.com/legacy-explorer/subgraph/aragar199/pool

