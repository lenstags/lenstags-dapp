import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import { APP_NAME, DEFAULT_CHAIN_ID, envConfig } from '@lib/config';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';

import { ApolloProvider } from '@apollo/client';
import type { AppProps } from 'next/app';
import { AppProvider } from 'context/AppContext';
import LensAuthenticationProvider from 'components/LensAuthenticationProvider';
import { SnackbarProvider } from 'material-ui-snackbar-provider';
import TagsFilterProvider from 'components/TagsFilterProvider';
import { apolloClient } from '@lib/lens/graphql/apollo-client';
import { publicProvider } from 'wagmi/providers/public';

// mainnet
// const { chains, publicClient } = configureChains([polygon], [publicProvider()]);

// testnet
const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: APP_NAME,
  projectId: envConfig.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <SnackbarProvider SnackbarProps={{ autoHideDuration: 3000 }}>
        <LensAuthenticationProvider>
          <ApolloProvider client={apolloClient}>
            <AppProvider>
              <RainbowKitProvider
                chains={chains}
                initialChain={DEFAULT_CHAIN_ID}
              >
                <TagsFilterProvider>
                  <Component {...pageProps} />
                </TagsFilterProvider>
              </RainbowKitProvider>
            </AppProvider>
          </ApolloProvider>
        </LensAuthenticationProvider>
      </SnackbarProvider>
    </WagmiConfig>
  );
}

export default MyApp;
