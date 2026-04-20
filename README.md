# 📦 Supply Chain Protocol — Web3 Traceability & Governance

[cite_start]Este repositório contém o MVP de um protocolo descentralizado para rastreabilidade de cadeias de suprimentos[cite: 55]. [cite_start]O projeto utiliza a tecnologia blockchain para garantir transparência, imutabilidade e segurança no registro de eventos logísticos, integrando NFTs, Staking e Governança Descentralizada (DAO)[cite: 56, 57].

## 🚀 Visão Geral

[cite_start]O sistema gerencia o ciclo de vida de produtos através de contratos inteligentes modulares, permitindo que fabricantes, transportadoras e consumidores interajam de forma auditável[cite: 57, 59].

### Componentes Principais:
* [cite_start]**NFT de Produtos (ERC-721):** Cada item é um ativo único que armazena sua jornada imutável na blockchain[cite: 100, 101].
* [cite_start]**Protocolo de Staking:** Mecanismo de incentivo econômico que recompensa agentes logísticos pelo compromisso com o sistema[cite: 108].
* [cite_start]**Governança (DAO):** Permite que os participantes tomem decisões sobre o protocolo com base no seu saldo em staking[cite: 129, 134].
* [cite_start]**Oráculos (Chainlink):** Integração com dados externos para ajuste dinâmico de recompensas com base no preço do ETH[cite: 137, 138].

## 🛠️ Arquitetura Técnica

[cite_start]O projeto adota uma estrutura modular para garantir a separação de responsabilidades[cite: 59, 93].

* [cite_start]**Smart Contracts:** Desenvolvidos em Solidity utilizando padrões OpenZeppelin para segurança[cite: 87, 92].
* [cite_start]**Frontend:** Aplicação Web desenvolvida com **React** e **Next.js**[cite: 92, 141].
* [cite_start]**Integração Web3:** Utilização da biblioteca **ethers.js** para comunicação com a rede Sepolia via MetaMask[cite: 141].
* [cite_start]**Análise Estática:** Auditoria de segurança realizada via **Slither**.

## 📑 Funcionalidades do Frontend

[cite_start]A interface foi projetada para oferecer uma experiência fluida, com atualizações de estado em tempo real[cite: 146, 152].

* [cite_start]**Fábrica:** Interface para fabricantes realizarem o *mint* de novos produtos[cite: 62].
* [cite_start]**Logística:** Registro de etapas e consulta de histórico de rastreabilidade[cite: 63, 69].
* [cite_start]**Finanças:** Dashboard de Staking com cálculo dinâmico de recompensas e resgate (*claim*)[cite: 110, 120].
* [cite_start]**Governança:** Painel para criação e votação de propostas da DAO[cite: 130].

## 🔧 Configuração e Instalação

### Pré-requisitos:
* Node.js (v18+)
* MetaMask instalada no navegador
* Tokens de teste na rede **Sepolia**

### Instalação:
1. Clone o repositório:
   ```bash
   git clone [https://github.com/karenbeat/SupplyChain.git](https://github.com/karenbeat/SupplyChain.git)
