// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProtocolDAO - Governança Descentralizada
 * @author Karen Beatrice
 * @notice Sistema de votação ponderado pelo saldo de RewardTokens (RWT).
 */
contract ProtocolDAO is Ownable, ReentrancyGuard {

    // Interface para verificar o saldo de tokens dos votantes
    IERC20 public immutable governanceToken;

    struct Proposta {
        string descricao;
        uint256 votosSim;
        uint256 votosNao;
        uint256 fimVotacao;
        bool ativa;
        bool executada;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposta) public propostas;
    mapping(uint256 => mapping(address => bool)) public votou;

    event PropostaCriada(uint256 id, string descricao, uint256 prazo);
    event VotoRegistrado(uint256 id, address usuario, uint256 peso, bool voto);
    event PropostaEncerrada(uint256 id, bool aprovada);

    /**
     * @param _token Endereço do seu RewardToken (RWT)
     */
    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Token invalido");
        governanceToken = IERC20(_token);
    }

    /**
     * @notice Cria uma proposta. 
     * @dev No MVP, mantemos onlyOwner para controle, mas o peso do voto é da comunidade.
     */
    function criarProposta(string memory descricao, uint256 duracaoEmDias) public onlyOwner {
        uint256 id = proposalCount;
        propostas[id] = Proposta({
            descricao: descricao,
            votosSim: 0,
            votosNao: 0,
            fimVotacao: block.timestamp + (duracaoEmDias * 1 days),
            ativa: true,
            executada: false
        });

        emit PropostaCriada(id, descricao, propostas[id].fimVotacao);
        proposalCount++;
    }

    /**
     * @notice Votação ponderada pelo saldo de tokens (Governance Power).
     * @dev Proteção contra Reentrância e Verificação de Prazo.
     */
    function votar(uint256 id, bool voto) public nonReentrant {
        Proposta storage p = propostas[id];
        
        require(p.ativa, "Votacao encerrada");
        require(block.timestamp < p.fimVotacao, "Prazo expirado");
        require(!votou[id][msg.sender], "Usuario ja participou desta votacao");

        // O peso do voto é o saldo de tokens do usuário (Evita ataques Sybil)
        uint256 peso = governanceToken.balanceOf(msg.sender);
        require(peso > 0, "Necessario possuir tokens RWT para votar");

        votou[id][msg.sender] = true;

        if (voto) {
            p.votosSim += peso;
        } else {
            p.votosNao += peso;
        }

        emit VotoRegistrado(id, msg.sender, peso, voto);
    }

    /**
     * @notice Encerra a proposta e define o resultado.
     */
    function finalizarVotacao(uint256 id) public onlyOwner {
        Proposta storage p = propostas[id];
        require(p.ativa, "Ja finalizada");
        
        p.ativa = false;
        bool aprovada = p.votosSim > p.votosNao;
        
        emit PropostaEncerrada(id, aprovada);
    }

    function verResultado(uint256 id) public view returns (string memory) {
        Proposta memory p = propostas[id];
        if (p.ativa) return "Em votacao";
        return p.votosSim > p.votosNao ? "Aprovada" : "Rejeitada";
    }
}
