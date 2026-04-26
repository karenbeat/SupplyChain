import { Web3Provider } from "@/contexts/web3-context";
import { Dashboard } from "@/components/dashboard/dashboard";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <Web3Provider>
      <Dashboard />
      <Toaster />
    </Web3Provider>
  );
}
