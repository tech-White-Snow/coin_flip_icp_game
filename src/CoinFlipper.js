import { Component } from "react"
import Coin from "./Coin"

import { ethers } from 'ethers'

import coinFlipContractAbi from './contracts/coinFlipContract.json'
const contractAddress = '0x55C3F268e63B933588D9ED4340f622e88444D5b9'
import tokenContractAbi from './contracts/tokenContract.json'
const tokenContractAddress = '0xbdcfd7cC5D905a83e2DD764A0a9D575EB47D8e26';

class CoinFlipper extends Component {

  constructor(props) {
    super(props);

    this.state = { heads: 0, tails: 0, face: "head", isConnected: 0, curAccount: null, betAmount: 1, betWinState: 1 };
    this.coinFaces = ["head", "tail"];

    this.flip = this.flip.bind(this);
    this.changeBetAmount = this.changeBetAmount.bind(this);

    this.checkWalletIsConnected();
  }

  render() {
    const { heads, tails, isConnected, curAccount } = this.state;

    return (
      <div className="CoinFlipper">
        {
          isConnected === 0 ?
            <button onClick={this.connectWallet}>
              Connect Wallet
            </button>
          : <p>Your wallet is already connected. The wallet address is : {curAccount} </p>
        }
        <div className="CoinFlipper-coin">
          <Coin face={this.state.face} />
        </div>
        { 
          isConnected !== 0 ?
            <div className="coinflip-tools">
              <button className="CoinFlipper-btn" onClick={this.flip}>
                Flip the coin
              </button>
              <select name="bet amount" onChange={this.changeBetAmount}>
                  <option value="">--Please choose bet amount--</option>
                  <option value="bet1">1</option>
                  <option value="bet2">2</option>
                  <option value="bet5">5</option>
                  <option value="bet10">10</option>
              </select>
              <select name="bet amount" onChange={this.changeWinningState}>
                  <option value="">--Please choose winning state--</option>
                  <option value="bet_head">head</option>
                  <option value="bet_tail">tail</option>
              </select>
            </div>
          : null
        }
      </div>
    );
  }

  flip = async() => {
    // Interact with Smart Contract for Betting
    console.log("Waiting on Betting deposit transaction ...");
    const { ethereum } = window;
    if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const icpContract = new ethers.Contract(tokenContractAddress, tokenContractAbi, signer);
        await icpContract.approve(contractAddress, this.state.betAmount);

        const lotteryContract = new ethers.Contract(contractAddress,coinFlipContractAbi, signer);
//      await lotteryContract.setTokenaddress(tokenContractAddress);
        await lotteryContract.deposit(this.state.betAmount, this.state.betWinState).then(txn => txn.wait(1));

        // After confirming transaction
        console.log('Successfully bet finished!');
        // Get Result
        const rand = await lotteryContract.getresult(this.state.curAccount);

        if (rand == this.state.betWinState)
          alert('Congratulations! You won!');
        else alert('Sorry, You lost!');

        this.setState((curState) => ({
          face: this.coinFaces[rand],
          heads: curState.heads + (rand === 0 ? 1 : 0),
          tails: curState.tails + (rand === 0 ? 0 : 1)
        }));

    }  else {
        alert('Wallet not connected!');
    }
  }

  checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Wallet not connected!");
      return;
    } else {
        // Check wallet and get accounts
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length !== 0) {
            console.log("Found an authorized account: ", accounts[0]);
        } else {
          console.log("No authorized account found.");
        }
    }
  }

  connectWallet = async() => {
    console.log('Connecting wallet...');
    const { ethereum } = window;
    if (!ethereum) {
        alert("Please install Metamask!");
    }
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Found an account! Address:", accounts[0]);
        this.setState((curState) => ({
          isConnected: 1,
          curAccount: accounts[0]
        }));
    } catch (err) {
        console.log(err);
    }
  }

  changeBetAmount = (e) => {
    console.log('Bet amount has changed');
    var val = e.target.value.substr(3)-'0';
    this.setState((curState) => ({
      betAmount: val
    }));
  }

  changeWinningState = (e) => {
    console.log('Bet winning state has changed');
    this.setState((curState) => ({
      betWinState: (e.target.value=='bet_head')?0:1
    }));
  }
}

export default CoinFlipper;
