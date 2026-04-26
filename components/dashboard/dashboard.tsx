"use client";

import { useState } from "react";
import {
  Factory,
  Truck,
  Vault,
  Vote,
  Wallet,
  LogOut,
  Loader2,
  Menu,
  X,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeb3 } from "@/contexts/web3-context";
import { FactoryTab } from "./factory-tab";
import { LogisticsTab } from "./logistics-tab";
import { StakingTab } from "./staking-tab";
import { GovernanceTab } from "./governance-tab";

export function Dashboard() {
  const {
    account,
    chainId,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  } = useWeb3();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (id: number | null) => {
    switch (id) {
      case 1:
        return "Ethereum Mainnet";
      case 11155111:
        return "Sepolia";
      case 31337:
        return "Hardhat Localhost";
      case 1337:
        return "Localhost";
      default:
        return id ? `Chain ${id}` : "Desconhecida";
    }
  };

  const isLocalNetwork = chainId === 31337 || chainId === 1337;
  const isSepolia = chainId === 11155111;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Factory className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold">Supply Chain Protocol</h1>
                <p className="text-xs text-muted-foreground">
                  {"Rastreabilidade descentralizada"}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {account && (
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isLocalNetwork
                        ? "bg-amber-500"
                        : isSepolia
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  />
                  <span className="text-muted-foreground">
                    {getNetworkName(chainId)}
                  </span>
                </div>
              )}

              {account ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">
                      {formatAddress(account)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="mr-2 h-4 w-4" />
                  )}
                  Conectar MetaMask
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="border-t py-4 md:hidden space-y-4">
              {account && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        isLocalNetwork
                          ? "bg-amber-500"
                          : isSepolia
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    />
                    <span className="text-muted-foreground">
                      {getNetworkName(chainId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">
                      {formatAddress(account)}
                    </span>
                  </div>
                </div>
              )}

              {account ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    disconnectWallet();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Desconectar
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    connectWallet();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="mr-2 h-4 w-4" />
                  )}
                  Conectar MetaMask
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {!account ? (
          // Not Connected State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <Wallet className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{"Conecte sua Carteira"}</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {"Para interagir com o protocolo de Supply Chain, conecte sua MetaMask. Certifique-se de estar na rede Sepolia."}
            </p>
            <Button size="lg" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-5 w-5" />
              )}
              Conectar MetaMask
            </Button>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-4 mt-12 w-full max-w-4xl">
              <div className="rounded-lg border p-4 text-left">
                <Factory className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold">{"Fábrica"}</h3>
                <p className="text-sm text-muted-foreground">
                  {"Crie produtos como NFTs únicos"}
                </p>
              </div>
              <div className="rounded-lg border p-4 text-left">
                <Truck className="h-8 w-8 text-chart-2 mb-2" />
                <h3 className="font-semibold">{"Logística"}</h3>
                <p className="text-sm text-muted-foreground">
                  {"Rastreie a jornada do produto"}
                </p>
              </div>
              <div className="rounded-lg border p-4 text-left">
                <Vault className="h-8 w-8 text-chart-4 mb-2" />
                <h3 className="font-semibold">{"Finanças"}</h3>
                <p className="text-sm text-muted-foreground">
                  {"Stake de tokens e recompensas"}
                </p>
              </div>
              <div className="rounded-lg border p-4 text-left">
                <Vote className="h-8 w-8 text-chart-1 mb-2" />
                <h3 className="font-semibold">{"Governança"}</h3>
                <p className="text-sm text-muted-foreground">
                  {"Vote em decisões do protocolo"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Connected State - Dashboard Tabs
          <Tabs defaultValue="factory" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="factory" className="gap-2">
                <Factory className="h-4 w-4" />
                <span className="hidden sm:inline">{"Fábrica"}</span>
              </TabsTrigger>
              <TabsTrigger value="logistics" className="gap-2">
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">{"Logística"}</span>
              </TabsTrigger>
              <TabsTrigger value="staking" className="gap-2">
                <Vault className="h-4 w-4" />
                <span className="hidden sm:inline">{"Finanças"}</span>
              </TabsTrigger>
              <TabsTrigger value="governance" className="gap-2">
                <Vote className="h-4 w-4" />
                <span className="hidden sm:inline">{"Governança"}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="factory">
              <FactoryTab />
            </TabsContent>

            <TabsContent value="logistics">
              <LogisticsTab />
            </TabsContent>

            <TabsContent value="staking">
              <StakingTab />
            </TabsContent>

            <TabsContent value="governance">
              <GovernanceTab />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Supply Chain Protocol - Desenvolvido por Karen Beatrice
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://sepolia.etherscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Etherscan
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://docs.chain.link/data-feeds/price-feeds"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Chainlink
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
