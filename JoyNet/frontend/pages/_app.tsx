import { ChakraProvider } from '@chakra-ui/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';

// Components
import MainNav from '../components/navigation/MainNav';
import Footer from '../components/Footer';

function getLibrary(provider: any) {
  return new ethers.providers.Web3Provider(provider);
}

export default function App({ Component, pageProps }: AppProps) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState('');

  const handleWalletConnect = async (connection: any) => {
    if (connection.account) {
      setAccount(connection.account);
      setWalletConnected(true);
    }
  };

  const handleWalletDisconnect = async () => {
    setAccount('');
    setWalletConnected(false);
  };

  const getRpcConfig = () => {
    return {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337'),
      networkName: process.env.NEXT_PUBLIC_NETWORK_NAME || 'PermaNet'
    };
  };

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ChakraProvider>
        <MainNav
          walletConnected={walletConnected}
          account={account}
          onConnect={handleWalletConnect}
          onDisconnect={handleWalletDisconnect}
        />
        <Component
          {...pageProps}
          walletConnected={walletConnected}
          account={account}
          rpcConfig={getRpcConfig()}
        />
        <Footer />
      </ChakraProvider>
    </Web3ReactProvider>
  );
}