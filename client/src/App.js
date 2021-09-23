import React, { Component } from "react";
import SimpleToken from "./contracts/SimpleToken.json";
import EthPool from "./contracts/EthPool.json";
import detectEthereumProvider from '@metamask/detect-provider';
import "./App.css";
var Web3 = require("web3");

class App extends Component {
  state = { loaded: false, withdrawAddress:"0x123", userTokens: 0};

  constructor(props) {
    super(props)
    this.state = {value: ''}
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const provider = detectEthereumProvider
      if (provider) {
        try {
          this.accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        } catch (error) {
          if (error.code === 4001) {
            console.log('Please connect to MetaMask!')
          } else {
            console.error(error)
          }
        }
      }
      this.web3 = await new Web3(window.ethereum);

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      this.tokenInstance = new this.web3.eth.Contract(
        SimpleToken.abi,
        SimpleToken.networks[this.networkId] &&
        SimpleToken.networks[this.networkId].address,
      );
      this.ethPoolInstance = new this.web3.eth.Contract(
        EthPool.abi,
        EthPool.networks[this.networkId] &&
        EthPool.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded: true, tokenAddress: SimpleToken.networks[this.networkId].address}, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  updateUserTokens = async () => {
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call()
    this.setState({userTokens: userTokens})
  }

  handleChange(event) {
    this.setState({value: event.target.value})
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.value)
    event.preventDefault()
  }

  handleDeposit = async () => {
    await this.ethPoolInstance.methods.deposit().send({from: this.accounts[0], value: 1})
  }

  handleRewards = async () => {
    let rewards = 200
    await this.ethPoolInstance.methods.addRewards(rewards).send({from: this.accounts[0]})
  }

  handleAwards = async () => {
    await this.tokenInstance.methods.increaseAllowance(EthPool.networks[this.networkId].address, 200).send({from: this.accounts[0]})
  }

  handleWithdraw = async () => {
    await this.ethPoolInstance.methods.withdraw().send({from: this.accounts[0]})
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Stake ETH for Rewards Now!</h1>
        <p>Stake your ETH today!</p>
        <p>
         You currently have: {this.state.userTokens} Simple Tokens
        </p>
        <p>
        <button type="button" onClick={this.handleDeposit} >Deposit Eth</button>
        </p>
        <p>
        <button type="button" onClick={this.handleWithdraw} >Withdraw Rewards and Eth</button> 
        </p>
        <p>
        <button type="button" onClick={this.handleRewards} >Owner Only: Add Rewards</button>
        </p>
        <p>
        <button type="button" onClick={this.handleAwards} >Owner Only: Increase Allowance</button> 
        </p>
        
       
      </div>
    );
  }
}

export default App;
