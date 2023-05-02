import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { polygon, polygonMumbai } from '@wagmi/core/chains';

import { APP_NAME } from '@lib/config';
import type { AppProps } from 'next/app';
import { AppProvider } from 'context/AppContext';
import LensAuthenticationProvider from 'components/LensAuthenticationProvider';
import { SnackbarProvider } from 'material-ui-snackbar-provider';
import TagsFilterProvider from 'components/TagsFilterProvider';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains(
  [polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: APP_NAME,
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
      <SnackbarProvider SnackbarProps={{ autoHideDuration: 3000 }}>
        <LensAuthenticationProvider>
          <AppProvider>
            <RainbowKitProvider chains={chains}>
              <TagsFilterProvider>
                <Component {...pageProps} />
              </TagsFilterProvider>
            </RainbowKitProvider>
          </AppProvider>
        </LensAuthenticationProvider>
      </SnackbarProvider>
    </WagmiConfig>
  );
}

export default MyApp;
