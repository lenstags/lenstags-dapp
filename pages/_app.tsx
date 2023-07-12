import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';

import { APP_NAME } from '@lib/config';
import { ApolloProvider } from '@apollo/client';
import type { AppProps } from 'next/app';
import { AppProvider } from 'context/AppContext';
import LensAuthenticationProvider from 'components/LensAuthenticationProvider';
import { SnackbarProvider } from 'material-ui-snackbar-provider';
import TagsFilterProvider from 'components/TagsFilterProvider';
import { apolloClient } from '@lib/lens/graphql/apollo-client';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: APP_NAME,
  projectId: 'f2ffc4207fed16f1809cee500fbceb8f',
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
              <RainbowKitProvider chains={chains}>
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
