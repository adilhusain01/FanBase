"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { injectiveTestnet } from "viem/chains";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

const config = createConfig({
  chains: [injectiveTestnet], connectors: [injected()], transports: { [injectiveTestnet.id]: http() },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <WagmiProvider config={config}><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></WagmiProvider>;
}
