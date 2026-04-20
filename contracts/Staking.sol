// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract Staking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    AggregatorV3Interface internal immutable priceFeed;

    uint256 public rewardRate = 100; 
    
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastUpdate;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _tokenAddress, address _priceFeed) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Endereco do token invalido");
        require(_priceFeed != address(0), "Endereco do oraculo invalido");
        token = IERC20(_tokenAddress);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    modifier updateReward(address user) {
        if (user != address(0)) {
            rewards[user] = earned(user);
            lastUpdate[user] = block.timestamp;
        }
        _;
    }

    // ✅ CÓDIGO LIMPO: Consulta oficial da Chainlink sem gambiarras
    function getETHPrice() public view returns (uint256) {
        (, int price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Preco invalido do Oraculo");
        return uint256(price);
    }

    function earned(address user) public view returns (uint256) {
        if (stakedBalance[user] == 0) return rewards[user];
        
        uint256 timeElapsed = block.timestamp - lastUpdate[user];
        uint256 price = getETHPrice();
        
        uint256 calculated = rewards[user] + ((stakedBalance[user] * timeElapsed * rewardRate * price) / 1e26);
        
        uint256 balance = token.balanceOf(address(this));
        uint256 limit = balance > stakedBalance[user] ? balance - stakedBalance[user] : 0;
        return calculated > limit ? limit : calculated;
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Valor invalido");
        stakedBalance[msg.sender] += amount;
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        uint256 userBalance = stakedBalance[msg.sender];
        uint256 amountToWithdraw = amount > userBalance ? userBalance : amount;
        
        require(amountToWithdraw > 0, "Saldo insuficiente");
        stakedBalance[msg.sender] -= amountToWithdraw;
        token.safeTransfer(msg.sender, amountToWithdraw);
        emit Withdrawn(msg.sender, amountToWithdraw);
    }

    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            token.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }
}s
