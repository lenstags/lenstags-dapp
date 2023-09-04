import { useDisconnect, useSwitchNetwork } from 'wagmi';

import { DEFAULT_CHAIN_ID } from '@lib/config';
import { deleteLensLocalStorage } from '@lib/lens/localStorage';
import useHandleSetup from './useHandleSetup';
import { useState } from 'react';
import { validateWhitelist } from 'utils/helpers';

const useCheckWhitelist = (lensProfile: any) => {
  const { disconnect } = useDisconnect();
  const [isVisibleWL, setIsVisibleWL] = useState<boolean>(false);
  const { showWelcome, setShowWelcome, showReject, welcomeReady, handleSetup } =
    useHandleSetup(lensProfile);

  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork({
      chainId: DEFAULT_CHAIN_ID,
      onError(error) {
        console.log('Error', error);
      },
      onSuccess(data) {
        console.log('Success', data);
      }
    });

  const checkWhitelist = async (address: string, chainId: number) => {
    await validateWhitelist(address).then((isInWL) => {
      if (isInWL) {
        setIsVisibleWL(false);
        if (chainId !== DEFAULT_CHAIN_ID) {
          switchNetwork?.(DEFAULT_CHAIN_ID);
        }
        handleSetup();
      } else {
        setIsVisibleWL(true);
        deleteLensLocalStorage();
        disconnect();
      }
    });
  };

  return {
    checkWhitelist,
    showWelcome,
    showReject,
    welcomeReady,
    isVisibleWL,
    setShowWelcome,
    handleSetup
  };
};

export default useCheckWhitelist;
