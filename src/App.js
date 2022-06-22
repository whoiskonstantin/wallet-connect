import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import { chain, defaultChains, WagmiConfig, createClient } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import Dash from './Dash'

function App() {
  // Chains for connectors to support
  const chains = defaultChains
  const defaultChain = chain.mainnet

  // Set up connectors
  const wagmiClient = createClient({
    autoConnect: true,
    connectors({ chainId }) {
      const chain = chains.find(x => x.id === chainId) ?? defaultChain
      const rpcUrl = 'https://eth.connect.bloq.cloud/v1/broom-tuna-island'
      return [
        // new MetaMaskConnector({chains}),
        new InjectedConnector({
          chains,
          options: { shimDisconnect: true },
        }),
        new WalletConnectConnector({
          chains,
          options: {
            qrcode: true,
            // rpc: { [chain.id]: rpcUrl },
          },
        }),
        // new CoinbaseWalletConnector({
        //   chains,
        //   options: {
        //     appName: 'Atmos',
        //     chainId: chain.id,
        //     jsonRpcUrl: rpcUrl,
        //   },
        // }),
      ]
    },
  })
  return (
    <div className='App'>
      <WagmiConfig client={wagmiClient}>
        <Dash />
      </WagmiConfig>
    </div>
  )
}

export default App
