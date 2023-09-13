import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import { APP_NAME, DEFAULT_CHAIN_ID, envConfig } from '@lib/config';
import {
  RainbowKitProvider,
  getDefaultWallets,
  lightTheme
} from '@rainbow-me/rainbowkit';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';

import { ApolloProvider } from '@apollo/client';
import type { AppProps } from 'next/app';
import { AppProvider } from 'context/AppContext';
import { ExploreProvider } from 'context/ExploreContext';
import LensAuthenticationProvider from 'components/LensAuthenticationProvider';
import { SnackbarProvider } from 'material-ui-snackbar-provider';
import TagsFilterProvider from 'components/TagsFilterProvider';
import { apolloClient } from '@lib/lens/graphql/apollo-client';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [DEFAULT_CHAIN_ID === 80001 ? polygonMumbai : polygon],
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
                theme={lightTheme({
                  accentColor: 'black',
                  accentColorForeground: 'white',
                  borderRadius: 'small',
                  fontStack: 'system',
                  overlayBlur: 'small'
                })}
                chains={chains}
                initialChain={DEFAULT_CHAIN_ID}
              >
                <ExploreProvider>
                  <TagsFilterProvider>
                    <Component {...pageProps} />
                  </TagsFilterProvider>
                </ExploreProvider>
              </RainbowKitProvider>
            </AppProvider>
          </ApolloProvider>
        </LensAuthenticationProvider>
      </SnackbarProvider>
    </WagmiConfig>
  );
}

export default MyApp;
