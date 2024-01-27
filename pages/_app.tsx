import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import React, { useState } from 'react';
import { RainbowKitAuthenticationProvider, getDefaultWallets, RainbowKitProvider, Chain, AuthenticationStatus } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet, optimism, zora } from 'wagmi/chains';
import authenticationAdapter from "./authenticationAdapter"

const Ten: Chain = {
  id: 443,
  name: 'Ten',
  network: 'ten',
  iconUrl: 'https://avatars.githubusercontent.com/u/93997495?s=200&v=4',
  iconBackground: '#ffffff',
  nativeCurrency: {
    decimals: 18,
    name: 'Ten',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://testnet.ten.xyz/v1/?token='] },
    default: { http: ['https://testnet.ten.xyz/v1/?token='] },
  },
  blockExplorers: {
    default: { name: 'TenScan', url: 'https://tenscan.io/' },
  },
  testnet: true,
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [ mainnet,
    optimism,
    zora,
    Ten
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  const [authenticationStatus, setAuthenticationStatus] = useState<AuthenticationStatus>('unauthenticated');
  return (
    <WagmiConfig config={wagmiConfig}>
            <RainbowKitAuthenticationProvider
        adapter={authenticationAdapter}
        status={authenticationStatus}
      >
          <RainbowKitProvider chains={chains}>
            <Component {...pageProps} />
          </RainbowKitProvider>
          </RainbowKitAuthenticationProvider>
    </WagmiConfig>
  );
}

export default MyApp;