import "../styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import LensAuthenticationProvider from "components/LensAuth/LensAuthenticationProvider";
import TagsFilterProvider from "components/TagsFilter/TagsFilterProvider";

const { chains, provider } = configureChains(
  [chain.polygon, chain.polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
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
