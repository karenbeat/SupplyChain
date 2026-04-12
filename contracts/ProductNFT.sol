// SPDX-License-Identifier: MIT
// Versão do compilador seguindo os requisitos da Etapa 3 do enunciado [cite: 39]
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProductNFT - Sistema de Rastreabilidade em Blockchain
 * @author Karen Beatrice
 * @notice Este contrato gerencia a criação e o rastreamento de produtos via NFTs (ERC-721).
 * @dev Implementa OpenZeppelin para segurança e padrões da indústria[cite: 31].
 */
contract ProductNFT is ERC721, Ownable {

    // Contador para IDs únicos de tokens (NFTs)
    uint public nextTokenId;

    /**
     * @dev Estrutura para armazenar os dados do produto.
     * Inclui o nome e um array dinâmico para o histórico imutável.
     */
    struct Produto {
        string nome;
        string[] historico;
    }

    // Mapeamento que vincula o ID do NFT aos dados do produto
    mapping(uint => Produto) public produtos;

    // Eventos para indexação em indexadores como The Graph ou Logs de Frontend [cite: 52]
    event ProdutoCriado(uint tokenId, string nome);
    event StatusAtualizado(uint tokenId, string novoStatus);

    /**
     * @notice Construtor que define o nome e o símbolo do token da Supply Chain.
     * @dev Passa o msg.sender para o construtor do Ownable para definir o administrador.
     */
    constructor() ERC721("SupplyChainProduct", "SCP") Ownable(msg.sender) {}

    /**
     * @notice Cria um novo produto (Mint de NFT).
     * @param _nome Nome do produto a ser rastreado.
     * @dev Apenas o administrador (fabricante) pode iniciar o processo.
     */
    function criarProduto(string memory _nome) public onlyOwner {
        uint tokenId = nextTokenId;

        // Mint seguro que verifica se o receptor aceita tokens ERC721
        _safeMint(msg.sender, tokenId);

        // Inicialização dos dados do produto
        produtos[tokenId].nome = _nome;
        produtos[tokenId].historico.push("Criado pelo fabricante");

        nextTokenId++;

        emit ProdutoCriado(tokenId, _nome);
    }

    /**
     * @notice Adiciona um novo evento ou localização ao histórico do produto.
     * @param tokenId ID do produto a ser atualizado.
     * @param novoStatus Descrição da nova etapa (ex: "Em transporte", "Recebido no Centro de Distribuicao").
     */
    function atualizarStatus(uint tokenId, string memory novoStatus) public {
        // Verificação de existência do produto (Segurança) [cite: 34]
        require(_ownerOf(tokenId) != address(0), "Produto nao existe");
        
        /** * RECOMENDAÇÃO DE SEGURANÇA: 
         * Para rastreabilidade real, apenas o dono atual do NFT deve atualizar o status.
         */
        require(ownerOf(tokenId) == msg.sender, "Apenas o detentor atual pode atualizar o status");

        produtos[tokenId].historico.push(novoStatus);

        emit StatusAtualizado(tokenId, novoStatus);
    }

    /**
     * @notice Retorna todo o histórico de um produto específico.
     * @param tokenId ID do produto.
     * @return Array de strings contendo a jornada do produto.
     */
    function verHistorico(uint tokenId) public view returns (string[] memory) {
        require(_ownerOf(tokenId) != address(0), "Produto nao existe");
        return produtos[tokenId].historico;
    }

    /**
     * @notice Retorna o nome original do produto.
     * @param tokenId ID do produto.
     */
    function verNomeProduto(uint tokenId) public view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Produto nao existe");
        return produtos[tokenId].nome;
    }
}
