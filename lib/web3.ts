"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESSES,
  DAO_ABI,
  PRODUCT_NFT_ABI,
  REWARD_TOKEN_ABI,
  STAKING_ABI,
} from "./contracts";

interface Web3ContextType {
  account: string | null;
  error: string | null;
  loading: boolean;
  // Funções de Contrato
  criarProduto: (nome: string) => Promise<any>;
  getNextTokenId: () => Promise<number>;
  stake: (amount: string) => Promise<any>;
  connectWallet: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper para instanciar contratos com Signer (Escrita)
  const getContractWithSigner = useCallback(async (address: string, abi: any) => {
    if (!window.ethereum) throw new Error("MetaMask não encontrada");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(address, abi, signer);
  }, []);

  // Helper para instanciar contratos com Provider (Leitura - mais rápido)
  const getContractRead = useCallback(async (address: string, abi: any) => {
    if (!window.ethereum) throw new Error("MetaMask não encontrada");
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(address, abi, provider);
  }, []);

  // --- FUNÇÕES REAIS DA BLOCKCHAIN ---

  const connectWallet = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts);
    } catch (err) {
      console.error("Erro ao conectar:", err);
    }
  };

  const criarProduto = async (nome: string) => {
    const nftContract = await getContractWithSigner(CONTRACT_ADDRESSES.PRODUCT_NFT, PRODUCT_NFT_ABI);
    // Chamada real
    const tx = await nftContract.criarProduto(nome);
    console.log("Transação enviada:", tx.hash);
    
    // Aguarda confirmação (Crucial para integração real)
    const receipt = await tx.wait();
    return receipt;
  };

  const getNextTokenId = async () => {
    const nftContract = await getContractRead(CONTRACT_ADDRESSES.PRODUCT_NFT, PRODUCT_NFT_ABI);
    // Supondo que seu contrato use um contador público chamado _nextTokenId ou similar
    // Se for OpenZeppelin 5.0, geralmente é via totalSupply ou variável de estado
    try {
      const id = await nftContract.nextTokenId(); 
      return Number(id);
    } catch {
      return 0;
    }
  };

  const stake = async (amount: string) => {
    const tokenContract = await getContractWithSigner(CONTRACT_ADDRESSES.REWARD_TOKEN, REWARD_TOKEN_ABI);
    const stakingContract = await getContractWithSigner(CONTRACT_ADDRESSES.STAKING, STAKING_ABI);
    
    const parsedAmount = ethers.parseEther(amount);

    // 1. APPROVE (Obrigatório para ERC-20 Staking)
    console.log("Solicitando aprovação do token...");
    const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.STAKING, parsedAmount);
    await approveTx.wait();

    // 2. STAKE
    console.log("Executando stake...");
    const stakeTx = await stakingContract.stake(parsedAmount);
    return await stakeTx.wait();
  };

  // Monitorar mudança de conta no MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: any) => {
        setAccount(accounts || null);
      });
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, error, loading, criarProduto, getNextTokenId, stake, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 deve ser usado dentro de um Web3Provider");
  return context;
};
