"use client";

import { useState } from "react";
import { Factory, Package, Plus, Loader2, CheckCircle2 } from "lucide-react";
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

export function FactoryTab() {
  const { account, criarProduto, getNextTokenId } = useWeb3();
  const { toast } = useToast();

  const [productName, setProductName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState<number | null>(null);

  const handleCreateProduct = async () => {
    if (!productName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o nome do produto.",
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

    setIsCreating(true);
    try {
      // Executa a transação
      await criarProduto(productName);
      
      // Busca o ID real gerado (Lógica da versão atual para precisão)
      const currentId = await getNextTokenId();
      const confirmedId = Number(currentId) - 1; 
      
      setLastCreatedId(confirmedId);
      
      toast({
        title: "Produto Criado!",
        description: `NFT #${confirmedId} - "${productName}" foi registrado com sucesso.`,
      });
      setProductName("");
    } catch (err: any) {
      console.error("Erro na Factory:", err);
      const errorMessage = err?.reason || err?.message || "Erro ao criar produto";
      
      toast({
        title: "Erro na Transação",
        description: errorMessage.includes("Ownable") 
          ? "Apenas o administrador (Dono do Contrato) pode criar produtos."
          : "Falha ao processar transação na blockchain.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Estética Versão Antiga */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Factory className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fábrica</h2>
          <p className="text-muted-foreground">
            Mint de novos produtos como NFTs (ERC-721)
          </p>
        </div>
      </div>

      {/* Create Product Card - Estética Versão Antiga */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Criar Novo Produto
          </CardTitle>
          <CardDescription>
            Registre um novo produto na blockchain. Apenas o administrador do
            contrato pode realizar esta operação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Nome do produto (ex: Lote de Café Premium)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={isCreating}
              className="flex-1"
            />
            <Button onClick={handleCreateProduct} disabled={isCreating || !account}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar NFT
                </>
              )}
            </Button>
          </div>

          {!account && (
            <p className="text-sm text-muted-foreground">
              Conecte sua carteira para criar produtos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Success Feedback - Estética Versão Antiga */}
      {lastCreatedId !== null && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                Último Produto Criado
              </p>
              <p className="text-sm text-muted-foreground">
                Token ID: #{lastCreatedId} - Transação confirmada na blockchain
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Cards - Estética Versão Antiga */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              1. Insira o nome do produto que será rastreado na cadeia de
              suprimentos.
            </p>
            <p>
              2. Clique em &quot;Criar NFT&quot; para registrar o produto como um token
              único (ERC-721).
            </p>
            <p>
              3. O NFT será associado à sua carteira e poderá ser transferido
              para outros participantes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Rastreabilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Cada produto criado recebe um histórico inicial &quot;Criado pelo
              fabricante&quot;.
            </p>
            <p>
              Na aba Logística, você pode adicionar novas etapas ao histórico do
              produto.
            </p>
            <p>
              O histórico é imutável e auditável por qualquer pessoa na
              blockchain.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
