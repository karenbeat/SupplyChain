"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { BrowserProvider, Contract, formatUnits, parseUnits, isAddress } from "ethers";
import {
  DAO_ABI,
  PRODUCT_NFT_ABI,
  REWARD_TOKEN_ABI,
  STAKING_ABI,
} from "@/lib/contracts";

const CONTRACT_ADDRESSES = {
  REWARD_TOKEN: "0x4955797e04EfA7f5D3Bc6b23D2e6E8c5895C21f1",
  PRODUCT_NFT: "0x239FB20Fe96C74E7855895844EC5feE96a1BEA32",
  STAKING: "0x660fE31e534F34c98b8dB09D447Bf3874e2d68BA",
  DAO: "0xc90dA8Dc92A1BA40Cf9013D5007b04f0F8374788",
} as const;

interface Web3State {
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  tokenBalance: string;
  stakedBalance: string;
  stakedBalance: string;
  ethPrice: string;
}

interface Web3ContextType extends Web3State {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  formatAddress: (addr: string | null) => string;
  criarProduto: (nome: string) => Promise<any>;
  atualizarStatus: (tokenId: number, novoStatus: string) => Promise<any>;
  verHistorico: (tokenId: number) => Promise<string[]>;
  verNomeProduto: (tokenId: number) => Promise<string>;
  getNextTokenId: () => Promise<number>;
  stake: (amount: string) => Promise<any>;
  withdraw: (amount: string) => Promise<any>;
  claimReward: () => Promise<any>;
  approveToken: (amount: string) => Promise<any>;
  refreshStakingData: () => Promise<void>;
  criarProposta: (descricao: string, duracaoEmDias: number) => Promise<any>;
  votar: (id: number, voto: boolean) => Promise<any>;
  getProposalCount: () => Promise<number>;
  getProposta: (id: number) => Promise<any>;
  verResultado: (id: number) => Promise<string>;
  verificarSeVotou: (id: number, address: string) => Promise<boolean>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Web3State>({
    account: null, chainId: null, isConnecting: false, error: null,
    tokenBalance: "0", stakedBalance: "0", stakedBalance: "0", ethPrice: "0",
  });

  const getProvider = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      return new BrowserProvider(window.ethereum);
    }
    throw new Error("MetaMask não encontrada");
  }, []);

  const getSigner = async () => (await getProvider()).getSigner();

const formatAddress = (addr: string | null) => {
  if (!addr) return "";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};


// ✅ FUNÇÃO COMPLETA E FECHADA
const refreshUserData = useCallback(async (address: string) => {
  if (!address || !isAddress(address)) return;

  const prov = await getProvider();

  try {
    const tokenContract = new Contract(CONTRACT_ADDRESSES.REWARD_TOKEN, REWARD_TOKEN_ABI, prov);
    const stakingContract = new Contract(CONTRACT_ADDRESSES.STAKING, STAKING_ABI, prov);

    const bal = await tokenContract.balanceOf(address).catch(() => 0n);
    const sBal = await stakingContract.stakedBalance(address).catch(() => 0n);
    const earned = await stakingContract.earned(address).catch(() => 0n);
let price = 0n;

try {
  price = await stakingContract.getETHPrice();
} catch {
  price = 2500n * 10n ** 8n; // fallback
}
    setState(prev => ({
  ...prev,
  account: address, // ✅ ADICIONE ISSO
  tokenBalance: formatUnits(bal, 18),
  stakedBalance: formatUnits(sBal, 18),
  earnedRewards: Number(formatUnits(earned, 18)).toFixed(4),
  ethPrice: formatUnits(price, 8),
}));

  } catch (e) {
    console.error(e);
  }
}, [getProvider]);


// ✅ useEffect DEPOIS da função
useEffect(() => {
  if (!state.account) return;

  const interval = setInterval(() => {
    refreshUserData(state.account!);
  }, 5000);

  return () => clearInterval(interval);
}, [state.account, refreshUserData]);


// ✅ connectWallet FORA da função
const connectWallet = useCallback(async () => {
  if (!window.ethereum) return;

  try {
    const provider = await getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);

    if (!accounts || accounts.length === 0) return;

    const network = await provider.getNetwork();

   setState(prev => ({
  ...prev,
  account: accounts[0],
  chainId: Number(network.chainId),
}));

await refreshUserData(accounts[0]);

  } catch (err) {
    console.error(err);
  }
}, [getProvider, refreshUserData]);

  const disconnectWallet = () => setState({ 
    account: null, chainId: null, isConnecting: false, error: null, 
    tokenBalance: "0", stakedBalance: "0", stakedBalance: "0", ethPrice: "0" 
  });

  // --- LOGICA DE STAKING ---

// ---------------- STAKING ----------------
// ---------------- STAKING ----------------

const approveToken = async (amount: string) => {
  const signer = await getSigner();

  const contract = new Contract(
    CONTRACT_ADDRESSES.REWARD_TOKEN,
    REWARD_TOKEN_ABI,
    signer
  );

  const tx = await contract.approve(
    CONTRACT_ADDRESSES.STAKING,
    parseUnits(amount, 18)
  );

  await tx.wait();

  if (state.account) await refreshUserData(state.account);
};


const stake = async (amount: string) => {
  const signer = await getSigner();

  const token = new Contract(
    CONTRACT_ADDRESSES.REWARD_TOKEN,
    REWARD_TOKEN_ABI,
    signer
  );

  const staking = new Contract(
    CONTRACT_ADDRESSES.STAKING,
    STAKING_ABI,
    signer
  );

  const parsed = parseUnits(amount, 18);
  const user = await signer.getAddress();

  // 🔥 CORREÇÃO NECESSÁRIA (não inventado, só proteção)
  const allowance = await token.allowance(user, CONTRACT_ADDRESSES.STAKING);

  if (allowance < parsed) {
    const txApprove = await token.approve(
      CONTRACT_ADDRESSES.STAKING,
      parsed
    );
    await txApprove.wait();
  }

  const tx = await staking.stake(parsed);
  await tx.wait();

  if (state.account) await refreshUserData(state.account);
};


const withdraw = async (amount: string) => {
  const signer = await getSigner();

  const contract = new Contract(
    CONTRACT_ADDRESSES.STAKING,
    STAKING_ABI,
    signer
  );

  const parsed = parseUnits(amount, 18);

  // 🔥 CORREÇÃO NECESSÁRIA (evita revert)
  const user = await signer.getAddress();
  const staked = await contract.stakedBalance(user);

  if (staked < parsed) {
    throw new Error("Saldo insuficiente em staking");
  }

  const tx = await contract.withdraw(parsed);
  await tx.wait();

  if (state.account) await refreshUserData(state.account);
};


const claimReward = async () => {
  const signer = await getSigner();

  const contract = new Contract(
    CONTRACT_ADDRESSES.STAKING,
    STAKING_ABI,
    signer
  );

  const tx = await contract.claimReward();
  await tx.wait();

  if (state.account) await refreshUserData(state.account);
};

  // --- LOGICA DAO ---

  const getProposalCount = async () => {
    const prov = await getProvider();
    const dao = new Contract(CONTRACT_ADDRESSES.DAO, DAO_ABI, prov);
    return Number(await dao.proposalCount().catch(() => 0n));
  };

  const getProposta = async (id: number) => {
    const prov = await getProvider();
    const dao = new Contract(CONTRACT_ADDRESSES.DAO, DAO_ABI, prov);
    return await dao.propostas(id);
  };

  const verResultado = async (id: number) => {
    const prov = await getProvider();
    const dao = new Contract(CONTRACT_ADDRESSES.DAO, DAO_ABI, prov);
    return await dao.verResultado(id).catch(() => "Pendente");
  };

  const verificarSeVotou = async (id: number, addr: string) => {
    const prov = await getProvider();
    const dao = new Contract(CONTRACT_ADDRESSES.DAO, DAO_ABI, prov);
    return await dao.votou(id, addr).catch(() => false);
  };

  const criarProposta = async (desc: string, dias: number) => {
    const signer = await getSigner();
    const dao = new Contract(CONTRACT_ADDRESSES.DAO, DAO_ABI, signer);
    return await (await dao.criarProposta(desc, dias * 86400)).wait();
  };

  const votar = async (id: number, voto: boolean) => {
    const signer = await getSigner();
    const dao = new Contract(CONTRACT_ADDRESSES.DAO, DAO_ABI, signer);
    return await (await dao.votar(id, voto)).wait();
  };

  // --- LOGICA NFT ---

  const criarProduto = async (nome: string) => {
    const signer = await getSigner();
    const contract = new Contract(CONTRACT_ADDRESSES.PRODUCT_NFT, PRODUCT_NFT_ABI, signer);
    return await (await contract.criarProduto(nome)).wait();
  };

  const atualizarStatus = async (id: number, s: string) => {
    const signer = await getSigner();
    const contract = new Contract(CONTRACT_ADDRESSES.PRODUCT_NFT, PRODUCT_NFT_ABI, signer);
    return await (await contract.atualizarStatus(id, s)).wait();
  };

  const verHistorico = async (id: number) => {
    const prov = await getProvider();
    const contract = new Contract(CONTRACT_ADDRESSES.PRODUCT_NFT, PRODUCT_NFT_ABI, prov);
    return await contract.verHistorico(id);
  };

  const verNomeProduto = async (id: number) => {
    const prov = await getProvider();
    const contract = new Contract(CONTRACT_ADDRESSES.PRODUCT_NFT, PRODUCT_NFT_ABI, prov);
    return await contract.verNomeProduto(id);
  };

  const getNextTokenId = async () => {
    const prov = await getProvider();
    const contract = new Contract(CONTRACT_ADDRESSES.PRODUCT_NFT, PRODUCT_NFT_ABI, prov);
    return Number(await contract.nextTokenId().catch(() => 0n));
  };

  return (
    <Web3Context.Provider value={{
      ...state, connectWallet, disconnectWallet, formatAddress,
      criarProduto, atualizarStatus, verHistorico, verNomeProduto, getNextTokenId,
      stake, withdraw, claimReward, approveToken, refreshStakingData: async () => {
        if (state.account) await refreshUserData(state.account);
      },
      getProposalCount, getProposta, verResultado, verificarSeVotou, criarProposta, votar
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 deve ser usado dentro de um Web3Provider");
  return context;
};