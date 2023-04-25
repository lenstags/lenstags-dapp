import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { polygon, polygonMumbai } from "@wagmi/core/chains";

import type { AppProps } from "next/app";
import LensAuthenticationProvider from "components/LensAuthenticationProvider";
import TagsFilterProvider from "components/TagsFilterProvider";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <LensAuthenticationProvider>
        <RainbowKitProvider chains={chains}>
          <TagsFilterProvider>
            <Component {...pageProps} />
          </TagsFilterProvider>
        </RainbowKitProvider>
      </LensAuthenticationProvider>
    </WagmiConfig>
  );
}

export default MyApp;
