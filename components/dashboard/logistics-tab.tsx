"use client";

import { useState } from "react";
import {
  Truck,
  Search,
  MapPin,
  History,
  Loader2,
  Package,
  ArrowRight,
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

interface ProductData {
  tokenId: number;
  nome: string;
  historico: string[];
}

export function LogisticsTab() {
  const { account, verHistorico, verNomeProduto, atualizarStatus } = useWeb3();
  const { toast } = useToast();

  const [searchTokenId, setSearchTokenId] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [updateTokenId, setUpdateTokenId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);

  const handleSearch = async () => {
    if (!searchTokenId.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o ID do produto.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const tokenId = parseInt(searchTokenId);
      const nome = await verNomeProduto(tokenId);
      const historico = await verHistorico(tokenId);

      setProductData({
        tokenId,
        nome,
        historico: [...historico],
      });

      toast({
        title: "Produto Encontrado",
        description: `Histórico do produto #${tokenId} carregado.`,
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Produto não encontrado ou erro na rede.",
        variant: "destructive",
      });
      setProductData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!updateTokenId.trim() || !newStatus.trim()) {
      toast({
        title: "Erro",
        description: "Preencha o ID do produto e o novo status.",
        variant: "destructive",
      });
      return;
    }

    if (!account) {
      toast({
        title: "Erro",
        description: "Conecte sua carteira primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const tokenId = parseInt(updateTokenId);
      await atualizarStatus(tokenId, newStatus);

      toast({
        title: "Status Atualizado!",
        description: `Nova etapa registrada para o produto #${tokenId}.`,
      });

      // Se estiver visualizando o mesmo produto, atualiza a lista automaticamente
      if (productData && productData.tokenId === tokenId) {
        const historico = await verHistorico(tokenId);
        setProductData({
          ...productData,
          historico: [...historico],
        });
      }

      setNewStatus("");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro na Transação",
        description: err.reason || "Certifique-se de que você é o dono deste NFT.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
          <Truck className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Logística & Rastreabilidade</h2>
          <p className="text-muted-foreground text-sm">
            Acompanhe a jornada imutável dos produtos na blockchain.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Consultar Produto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5" />
              Consultar Histórico
            </CardTitle>
            <CardDescription>
              Veja todas as etapas registradas para um ID específico.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="ID do NFT (ex: 1)"
                value={searchTokenId}
                onChange={(e) => setSearchTokenId(e.target.value)}
                disabled={isSearching}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atualizar Status */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <MapPin className="h-5 w-5" />
              Registrar Nova Etapa
            </CardTitle>
            <CardDescription>
              Apenas o detentor atual pode gravar informações.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="ID do NFT"
              value={updateTokenId}
              onChange={(e) => setUpdateTokenId(e.target.value)}
              disabled={isUpdating}
            />
            <Input
              placeholder="Status: 'Em trânsito', 'Entregue em Curitiba'..."
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={isUpdating}
            />
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || !account}
              className="w-full"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              Confirmar na Blockchain
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Exibição do Histórico em Timeline */}
      {productData && (
        <Card className="bg-muted/30">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  {productData.nome}
                </CardTitle>
                <CardDescription>Token ID: #{productData.tokenId}</CardDescription>
              </div>
              <div className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                Imutável
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4 ml-4 border-l-2 border-primary/20 pl-6">
              {productData.historico.length > 0 ? (
                productData.historico.map((status, index) => (
                  <div key={index} className="relative">
                    {/* Indicador de Bolinha na Timeline */}
                    <div className={`absolute -left-[33px] mt-1.5 h-4 w-4 rounded-full border-2 border-background 
                      ${index === productData.historico.length - 1 ? "bg-primary" : "bg-muted-foreground/30"}`} 
                    />
                    
                    <div className="flex flex-col">
                      <p className={`font-semibold ${index === productData.historico.length - 1 ? "text-primary text-lg" : "text-foreground/70"}`}>
                        {status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registro #{index + 1}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic">Nenhum histórico encontrado para este produto.</p>
              )}
            </div>

            {/* Sumário da Jornada */}
            <div className="mt-8 flex items-center justify-between rounded-lg bg-background p-4 border border-border">
              <div className="text-sm">
                <p className="font-bold">Total de Movimentações</p>
                <p className="text-muted-foreground">{productData.historico.length} checkpoints</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <span>ORIGEM</span>
                <ArrowRight className="h-3 w-3" />
                <span>DESTINO ATUAL</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nota de Segurança */}
      <div className="rounded-lg bg-amber-500/10 p-4 border border-amber-500/20">
        <h4 className="text-sm font-bold text-amber-600 flex items-center gap-2 mb-1">
          <History className="h-4 w-4" /> Importante
        </h4>
        <p className="text-xs text-amber-700 leading-relaxed">
          Os dados acima são buscados diretamente do contrato <strong>ProductNFT</strong>. Uma vez registrados, 
          estes status não podem ser apagados ou editados por ninguém, garantindo a total transparência para o consumidor final.
        </p>
      </div>
    </div>
  );
}
