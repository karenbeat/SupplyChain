// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// PASSO 1.1 - Importação do Oráculo Chainlink
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title Staking Profissional - Residência TIC 29
 * @notice Implementação com SafeERC20, ReentrancyGuard e Oráculo Chainlink.
 *@author Karen Beatrice
 */
contract Staking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    // PASSO 1.2 - Variável do Preço
    AggregatorV3Interface internal immutable priceFeed;

    uint256 public rewardRate = 100; 
    
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public lastUpdate;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    // PASSO 1.3 - Constructor atualizado com Price Feed
    constructor(address _tokenAddress, address _priceFeed) Ownable(msg.sender) {
        require(_tokenAddress != address(0), "Endereco invalido");
        require(_priceFeed != address(0), "PriceFeed invalido");

        token = IERC20(_tokenAddress);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    modifier updateReward(address user) {
        rewards[user] = earned(user);
        lastUpdate[user] = block.timestamp;
        _;
    }

    // PASSO 1.4 - Função para buscar preço real do ETH via Chainlink
    function getETHPrice() public view returns (uint256) {
        (
            /* uint80 roundID */,
            int price,
            /* uint startedAt */,
            /* uint updatedAt */,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();
        require(price > 0, "Preco invalido do Oraculo");
        return uint256(price);
    }

    /**
     * @dev Cálculo de ganhos integrando o preço do Oráculo (PASSO 1.5)
     */
    function earned(address user) public view returns (uint256) {
        if (stakedBalance[user] == 0) return rewards[user];
        
        uint256 timeElapsed = block.timestamp - lastUpdate[user];
        uint256 price = getETHPrice(); 

        // Cálculo: (Saldo * Tempo * Taxa * Preço) / Normalização Decimal
        uint256 calculatedReward = rewards[user] + 
            ((stakedBalance[user] * timeElapsed * rewardRate * price) / 1e26);
        
        // Proteção contra inflação: a recompensa não pode exceder o saldo disponível no contrato
        // (Excluindo o que é principal dos usuários)
        uint256 totalContractBalance = token.balanceOf(address(this));
        uint256 contractRewardBudget = totalContractBalance > stakedBalance[user] ? 
                                       totalContractBalance - stakedBalance[user] : 0;

        return calculatedReward > contractRewardBudget ? contractRewardBudget : calculatedReward;
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Valor invalido");
        
        stakedBalance[msg.sender] += amount;
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(stakedBalance[msg.sender] >= amount, "Saldo insuficiente");
        
        stakedBalance[msg.sender] -= amount;
        token.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            token.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /**
     * @notice Permite ao admin ajustar a taxa (Máximo 1000 para segurança).
     */
    function setRewardRate(uint256 newRate) external onlyOwner {
        require(newRate < 1000, "Taxa abusiva");
        rewardRate = newRate;
    }
}
