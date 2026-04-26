"use client";

import { useState, useEffect } from "react";
import {
  Vault,
  TrendingUp,
  Loader2,
  RefreshCw,
  Gift,
  ArrowDownToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWeb3 } from "@/contexts/web3-context";
import { useToast } from "@/hooks/use-toast";

export function StakingTab() {
  const {
    account,
    tokenBalance,
    stakedBalance,
    earnedRewards,
    ethPrice,
    stake,
    withdraw,
    claimReward,
    approveToken,
    refreshStakingData,
  } = useWeb3();

  const { toast } = useToast();

  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  // Atualização automática a cada 30s
  useEffect(() => {
    if (account) {
      const interval = setInterval(() => refreshStakingData(), 30000);
      return () => clearInterval(interval);
    }
  }, [account, refreshStakingData]);

  // Função de formatação robusta para evitar os números "estranhos"
  const formatDisplay = (value: string, decimals: number = 2) => {
    const num = parseFloat(value || "0");
    if (isNaN(num)) return "0.00";
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const handleAction = async (actionName: string, fn: () => Promise<any>, successMsg: string) => {
    setLoading(prev => ({ ...prev, [actionName]: true }));
    try {
      await fn();
      toast({ title: "Sucesso!", description: successMsg });
      if (actionName === "stake") setStakeAmount("");
      if (actionName === "withdraw") setWithdrawAmount("");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro na transação",
        description: err.reason || err.message || "A transação foi revertida.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [actionName]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Vault className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Finanças</h2>
            <p className="text-muted-foreground">Gestão de Staking e Recompensas RWT</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refreshStakingData} disabled={loading.refresh}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading.refresh ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* DASHBOARD DE STATS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase font-semibold">Carteira</p>
            <p className="text-2xl font-bold">{formatDisplay(tokenBalance)} RWT</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase font-semibold">Em Staking</p>
            <p className="text-2xl font-bold text-blue-600">{formatDisplay(stakedBalance)} RWT</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase font-semibold">Recompensas</p>
            <p className="text-2xl font-bold text-green-600">{formatDisplay(earnedRewards, 4)} RWT</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase font-semibold">Preço ETH</p>
            <p className="text-2xl font-bold">${formatDisplay(ethPrice)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CARD DE DEPÓSITO */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5"/> Depositar</CardTitle>
            <CardDescription>Aumente seu stake para ganhar mais recompensas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Quantidade para depositar"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={loading.approve || !stakeAmount}
                onClick={() => handleAction("approve", () => approveToken(stakeAmount), "Tokens aprovados com sucesso!")}
              >
                {loading.approve ? <Loader2 className="animate-spin h-4 w-4" /> : "1. Aprovar"}
              </Button>
              <Button
                className="flex-1"
                disabled={loading.stake || !stakeAmount}
                onClick={() => handleAction("stake", () => stake(stakeAmount), "Stake realizado com sucesso!")}
              >
                {loading.stake ? <Loader2 className="animate-spin h-4 w-4" /> : "2. Depositar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CARD DE SAQUE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowDownToLine className="h-5 w-5"/> Sacar</CardTitle>
            <CardDescription>Retire seus tokens do contrato de staking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Quantidade para sacar"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <Button
              variant="secondary"
              className="w-full"
              disabled={loading.withdraw || !withdrawAmount}
              onClick={() => handleAction("withdraw", () => withdraw(withdrawAmount), "Saque realizado com sucesso!")}
            >
              {loading.withdraw ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirmar Saque"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* CARD DE RECOMPENSAS (CLAIM) */}
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Gift className="h-5 w-5" /> Recompensas Acumuladas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-3xl font-extrabold text-green-600">
            {formatDisplay(earnedRewards, 6)} <span className="text-sm font-normal text-muted-foreground">RWT</span>
          </div>
          <Button 
            size="lg"
            className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
            disabled={loading.claim || parseFloat(earnedRewards) <= 0}
            onClick={() => handleAction("claim", () => claimReward(), "Recompensas enviadas para sua carteira!")}
          >
            {loading.claim ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            Resgatar Recompensas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
