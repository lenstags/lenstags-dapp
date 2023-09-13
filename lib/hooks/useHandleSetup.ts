import { ATTRIBUTES_LIST_KEY } from '@lib/config';
import { createDefaultList } from '@lib/lens/load-lists';
import { enable } from '@lib/lens/enable-dispatcher';
import { findKeyAttributeInProfile } from 'utils/helpers';
import { queryProfile } from '@lib/lens/dispatcher';
import { useSnackbar } from 'material-ui-snackbar-provider';
import { useState } from 'react';

const useHandleSetup = (
  lensProfile: any,
  showReject?: any,
  setShowReject?: any
) => {
  const [showWelcome, setShowWelcome] = useState(false);
  // const [showReject, setShowReject] = useState(false);

  const [welcomeReady, setWelcomeReady] = useState(false);
  const snackbar = useSnackbar();

  const handleSetup = async () => {
    // await ensureCorrectChain();

    // if (!lensProfile) {
    //   return;
    // }

    const profileResult = await queryProfile({ profileId: lensProfile!.id });
    const listAttributeObject = findKeyAttributeInProfile(
      profileResult,
      ATTRIBUTES_LIST_KEY
    );
    console.log('aca profileResult ', profileResult);

    const hasLists =
      listAttributeObject && JSON.parse(listAttributeObject.value).length > 0;

    const dispatcherEnabled = profileResult
      ? profileResult.dispatcher?.canUseRelay || false
      : false;

    if (!dispatcherEnabled || !hasLists) {
      console.log('>>>   enabledRelayer: ', dispatcherEnabled);

      setShowWelcome(true);
      try {
        if (profileResult && !dispatcherEnabled) {
          snackbar.showMessage('🟦 Enabling Tx Dispatcher...');
          const res = await enable(profileResult.id);
          console.log('RRR ', res);
          if (!res) {
            setShowReject(true);
            return;
          }
          snackbar.showMessage('🟦 Dispatcher enabled successfully.');
        }

        if (!hasLists) {
          snackbar.showMessage('🟦 Creating default list...');
          await createDefaultList(profileResult);
          snackbar.showMessage('💚 LFGrow ⚜️!');
        }
        setWelcomeReady(true);
      } catch (err: any) {
        if (err.code === 'ACTION_REJECTED') {
          console.log('Si');
          setShowReject(true);
        } else {
          console.log('Unknown error!: ', err.code);
        }
      }
    }
  };

  // useEffect(() => {
  //   if (lensProfile) {
  //     console.log('de mas? holiii');
  //     handleSetup();
  //   }
  // }, [lensProfile]);

  return {
    showWelcome,
    showReject,
    welcomeReady,
    setShowReject,
    setShowWelcome,
    setWelcomeReady,
    handleSetup
  };
};

export default useHandleSetup;
