import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import React, { useState, useEffect } from 'react';
import { RainbowKitAuthenticationProvider, getDefaultWallets, RainbowKitProvider, Chain, createAuthenticationAdapter, AuthenticationStatus } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createConfig, WagmiConfig, useAccount } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import axios from 'axios'; // make sure to install axios

function MyApp({ Component, pageProps }: AppProps) {
  
  const [token, setToken] = useState<string | null>(null);

  const [authenticationStatus, setAuthenticationStatus] = useState<AuthenticationStatus>('unauthenticated');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get('https://testnet.ten.xyz/v1/join/');
        console.log("API Response:", response); // Debugging log
        setToken(response.data); // Set the token directly from response.data
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    fetchToken();
  }, []);

  console.log("Token state:", token);  // Debugging log

  if (!token) {
    return <div>Loading...</div>;
  }

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
      public: { http: [`https://testnet.ten.xyz/v1/?token=${token}`] }, 
      default: { http: [`https://testnet.ten.xyz/v1/?token=${token}`] },
    },
    blockExplorers: {
      default: { name: 'TenScan', url: 'https://tenscan.io/' },
    },
    testnet: true,
  };  
  
  const { chains, publicClient, webSocketPublicClient } = configureChains(
    [Ten],
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

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const nonce = '0x' + token;
      return nonce;
    },
    createMessage: (nonce) => {
            // Use the nonce as the encryptionToken here
    return {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
        ],
        Authentication: [
          { name: "Encryption Token", type: "address" },
        ],
      },
      primaryType: "Authentication",
      domain: {
        name: "Ten",
        version: "1.0",
        chainId: 443, // Make sure TenChainID is defined or imported
      },
      message: {
        "Encryption Token": nonce,
      },
    }
    },
    getMessageBody: (message) => {
      return JSON.stringify(message.message);
    },
    verify: async ({ message, signature }) => {
      setAuthenticationStatus('authenticated'); // Use string literal
        console.log("Verification was successful with:", message, signature);
        return true;
/*
      const encryptionTokenObject = message.message["Encryption Token"];
      const address = encryptionTokenObject.address;
      console.log("Address:", address);
      const postData = {
        address: address, // replace with actual property name if different
        signature: signature
      };
    
      try {
        const response = await axios.post(`https://testnet.ten.xyz/v1/authenticate/?token=${token}`, postData);
        console.log("Authentication POST response:", response);
    
    if(response.status === 200) { 
            setAuthenticationStatus('authenticated');
    }
        return true;
      } catch (error) {
        console.error("Error in POST request for authentication:", error);
        // Handle error or failed authentication
        setAuthenticationStatus('unauthenticated');
        return false;
      }
    */    },    
    signOut: async () => {
      //setAuthenticationStatus('unauthenticated');
    },
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitAuthenticationProvider
        adapter={authenticationAdapter}
        status={authenticationStatus} // Pass the authentication status here
      >
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </RainbowKitAuthenticationProvider>
    </WagmiConfig>
  );
}

export default MyApp;
