import { DEFAULT_CHAIN_ID } from '@lib/config';
import useDisconnector from './useDisconnector';
import useHandleSetup from './useHandleSetup';
import { useState } from 'react';
import { useSwitchNetwork } from 'wagmi';
import { validateWhitelist } from 'utils/helpers';

const useCheckWhitelist = (lensProfile: any) => {
  const [isVisibleWL, setIsVisibleWL] = useState<boolean>(false);
  const { handleDisconnect } = useDisconnector();
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
        handleDisconnect();
      }
    });
  };

  return {
    checkWhitelist,
    showWelcome,
    showReject,
    welcomeReady,
    isVisibleWL,
    setIsVisibleWL,
    setShowWelcome,
    handleSetup
  };
};

export default useCheckWhitelist;
