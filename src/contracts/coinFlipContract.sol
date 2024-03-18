// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface ICoinFlip{
    function setTokenaddress(address tokenaddress) external;
    function withdraw() external;
    function deposit(uint256 amount, uint256 state) external;
}
contract CoinFlip is ICoinFlip {

    address private owner;  // the owner of the token
    address constant private taxAddr = 0x91DC21404B1B0E7b05433591Ff93690DE10952F0;
    
    // constructor will only be invoked during contract 
    // deployment time
    constructor() {
        owner = msg.sender;    // address of the token owner
    }

    mapping (address => uint256) public _result;    
    uint256 randNonce = 0;
    address private _tokenaddress = 0x81AC61474AB4ba504380F09692d7fA755183Dcb5;
    
    function setTokenaddress(address tokenaddress) external{
        require(msg.sender == owner, "You are not owner");
        _tokenaddress = tokenaddress;
    }

    function deposit(uint256 amount, uint256 state) external {
        amount = amount *(10**18);
        IERC20(_tokenaddress).transferFrom(msg.sender, address(this), amount);        
        _result[msg.sender] = randomnumber();
        if (_result[msg.sender] == state) {
           IERC20(_tokenaddress).approve(address(this), amount*2);
           rewardToken(msg.sender, amount*2);
        }
    }

    function getresult(address player) public view returns(uint256) {
        return _result[player];
    }

    function randomnumber() internal view returns (uint256) {
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % 2;
    }

    function rewardToken(address to, uint256 amount) internal {
        IERC20(_tokenaddress).transferFrom(address(this), to, (amount*95/100));
        IERC20(_tokenaddress).transferFrom(address(this), taxAddr, (amount*5/100));
    }

    function withdraw() external{
        require(msg.sender == owner, "You are not owner");
        IERC20(_tokenaddress).transfer(owner, IERC20(_tokenaddress).balanceOf(address(this)));
    }
}