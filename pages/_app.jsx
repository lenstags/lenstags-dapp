import "@rainbow-me/rainbowkit/styles.css"
import '../styles/globals.css'
//import type { AppProps } from 'next/app'
import { configureChains, createClient }  from "wagmi"
import {alchemyProvider} from "wagmi/providers/alchemy"
import {infuraProvider}  from "wagmi/providers/infura"
import {publicProvider} from "wagmi/providers/public"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiConfig } from "wagmi"


const polygonTestnet = {
  /** ID in number form */
  id: 80001,
  /** Human-readable name */
  name: 'Matic Testnet',
  /** Internal network name */
  network: 'Matictest',
  /** Currency used by chain */
  nativeCurrency: { name: 'Matic', symbol: 'Matic', decimals: 18 },
  /** Collection of RPC endpoints */
  rpcUrls: {
    infura:
      'https://rpc-mumbai.matic.today'
  },
  testnet: true
}

const {chains, provider} = configureChains(
    [polygonTestnet], [
        alchemyProvider({apiKey: process.env.NEXT_PUBLIC_alchemy_proivider_api_key}),
        infuraProvider({apiKey: process.env.NEXT_PUBLIC_infura_provider_api_key}),
        publicProvider()
    ]
)

const {connectors} = getDefaultWallets({
    appName: "LengsTags",
    chains,
})

const wagmiClient =createClient({
    autoConnect: true,
    connectors, 
    provider,
    
})

function MyApp({ Component, pageProps }) {
  
  
  
  return (<WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
              <Component {...pageProps} />
            </RainbowKitProvider>
          </WagmiConfig>)
  
}

export default MyApp

// : AppProps
