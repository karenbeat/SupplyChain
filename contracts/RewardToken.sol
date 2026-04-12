// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardToken - Token de Recompensa (ERC-20)
 * @dev Implementação para a Etapa 2 do protocolo descentralizado[cite: 31].
  * @author Karen Beatrice
 */
contract RewardToken is ERC20, Ownable {

    constructor() 
        ERC20("RewardToken", "RWT") 
        Ownable(msg.sender) 
    {
        // Cunhagem inicial para o administrador do protocolo
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    /**
     * @notice Distribui recompensas (Mint).
     * @dev Restrito ao proprietário conforme Controle de Acesso.
     */
    function reward(address to, uint amount) public onlyOwner {
        _mint(to, amount);
    }
}
