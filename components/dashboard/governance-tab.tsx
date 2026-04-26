"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Vote, Plus, ThumbsUp, ThumbsDown, Loader2, Clock, 
  CheckCircle2, XCircle, RefreshCw, Scale, Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWeb3 } from "@/contexts/web3-context";
import { useToast } from "@/hooks/use-toast";
import { formatUnits } from "ethers";

export function GovernanceTab() {
  const { 
    account, tokenBalance, criarProposta, votar, 
    finalizarVotacao, getProposalCount, getProposta, 
    verificarSeVotou, verResultado 
  } = useWeb3();
  const { toast } = useToast();

  const [propostas, setPropostas] = useState<any[]>([]);
  const [descricao, setDescricao] = useState("");
  const [duracao, setDuracao] = useState("7");
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadPropostas = useCallback(async () => {
  if (!account) return;
  setIsLoading(true);
  try {
    const count = await getProposalCount();
    const list = [];
    for (let i = 0; i < count; i++) {
      const p = await getProposta(i);
      const jaVotou = await verificarSeVotou(i, account);
      const resultado = await verResultado(i);
      
      // Correção: Extraindo os campos pelo nome em vez de usar ...p
      list.push({ 
        id: i, 
        descricao: p.descricao,
        votosSim: p.votosSim,
        votosNao: p.votosNao,
        fimVotacao: p.fimVotacao,
        ativa: p.ativa,
        executada: p.executada,
        jaVotou, 
        resultado 
      });
    }
    setPropostas(list.reverse());
  } catch (e) { 
    console.error("Erro ao carregar propostas:", e); 
  } finally {
    setIsLoading(false);
  }
}, [account, getProposalCount, getProposta, verificarSeVotou, verResultado]);

  const handleCreate = async () => {
    if (!descricao.trim()) return;
    try {
      setActionId(-1);
      await criarProposta(descricao, parseInt(duracao));
      toast({ title: "Sucesso", description: "Proposta criada na blockchain!" });
      setDescricao("");
      loadPropostas();
    } catch (e: any) { 
      toast({ title: "Erro", description: e.reason || "Erro na transação", variant: "destructive" }); 
    } finally { 
      setActionId(null); 
    }
  };

  const handleVote = async (id: number, v: boolean) => {
    try {
      setActionId(id);
      await votar(id, v);
      toast({ title: "Voto registrado!", description: "Sua participação foi contabilizada." });
      loadPropostas();
    } catch (e: any) { 
      toast({ title: "Erro", description: e.reason || "Erro ao votar", variant: "destructive" }); 
    } finally { 
      setActionId(null); 
    }
  };

  const handleFinalize = async (id: number) => {
    try {
      setActionId(id);
      await finalizarVotacao(id);
      toast({ title: "Encerrada!", description: "Votação finalizada com sucesso." });
      loadPropostas();
    } catch (e: any) {
      toast({ title: "Erro", description: e.reason || "Erro ao finalizar", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  // Funções auxiliares de UI 
 const getVotePercentage = (sim: any, nao: any) => {
  try {
    // 1. Forçamos tudo a ser BigInt com segurança, mesmo que venha como string ou undefined
    const simBig = BigInt(sim || 0);
    const naoBig = BigInt(nao || 0);
    const total = simBig + naoBig;

    // 2. Usamos o sufixo 'n' que é o padrão nativo do JS moderno
    if (total === 0n) return 50; 

    // 3. Matemática de BigInt: multiplica por 100n antes de dividir
    const porcentagem = (simBig * 100n) / total;

    // 4. Converte o resultado final com segurança para o React desenhar a barra
    return Number(porcentagem);
  } catch (error) {
    console.error("Erro ao calcular porcentagem:", error);
    return 50; // Retorno de fallback para não quebrar a tela
  }
};

  const getStatusBadge = (p: any) => {
    if (!p.ativa) {
      const approved = p.votosSim > p.votosNao;
      return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${approved ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"}`}>
          {approved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {p.resultado || (approved ? "Aprovada" : "Rejeitada")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-700">
        <Clock className="h-3 w-3" /> Em Votação
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header - Estilo Antigo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Vote className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Governança</h2>
            <p className="text-muted-foreground">Decida o futuro do protocolo com seus tokens RWT</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadPropostas} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>

      {/* Voting Power Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-4">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Seu Poder de Voto</p>
              <p className="text-2xl font-bold">{parseFloat(tokenBalance).toFixed(2)} RWT</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nova Proposta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Nova Proposta</CardTitle>
          <CardDescription>Apenas administradores podem criar propostas oficiais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Descreva a melhoria detalhadamente..." 
            value={descricao} 
            onChange={e => setDescricao(e.target.value)} 
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Duração (dias)</label>
              <Input type="number" value={duracao} onChange={e => setDuracao(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreate} disabled={actionId === -1 || !account}>
                {actionId === -1 && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar Proposta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Propostas com Barra de Progresso */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" /> Atividade de Governança
        </h3>
        
        {propostas.map(p => {
          const percentage = getVotePercentage(p.votosSim, p.votosNao);
          const isExpired = Number(p.fimVotacao) < Math.floor(Date.now() / 1000);

          return (
            <Card key={p.id} className={!p.ativa ? "opacity-80" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">Proposta #{p.id}</CardTitle>
                    <CardDescription className="mt-1">{p.descricao}</CardDescription>
                  </div>
                  {getStatusBadge(p)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-green-600">SIM: {formatUnits(p.votosSim, 18)}</span>
                    <span className="text-red-600">NÃO: {formatUnits(p.votosNao, 18)}</span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-red-100 dark:bg-red-900/30">
                    <div 
                      className="absolute inset-y-0 left-0 bg-green-500 transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {p.ativa && !p.jaVotou && !isExpired && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700" 
                      onClick={() => handleVote(p.id, true)} 
                      disabled={actionId !== null}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" /> Sim
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1" 
                      onClick={() => handleVote(p.id, false)} 
                      disabled={actionId !== null}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" /> Não
                    </Button>
                  </div>
                )}

                {p.ativa && isExpired && (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleFinalize(p.id)}
                    disabled={actionId === p.id}
                  >
                    {actionId === p.id ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Finalizar Votação
                  </Button>
                )}

                {p.jaVotou && p.ativa && (
                  <p className="text-center text-xs text-muted-foreground italic">Seu voto já foi registrado.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
