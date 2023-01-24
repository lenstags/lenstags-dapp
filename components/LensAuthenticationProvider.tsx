import '@rainbow-me/rainbowkit/styles.css';

import jwt from 'jsonwebtoken';
import { createContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider
} from '@rainbow-me/rainbowkit';
import { generateChallenge, authenticate } from '@lib/lens/login';
import { setAuthenticationToken } from '@lib/lens/graphql/apollo-client';
import { getDefaultProfile } from '@lib/lens/default-profile';
import {
  deleteLensLocalStorage,
  getFromLocalStorage,
  LensLocalStorage,
  setLensLocalStorage
} from '@lib/lens/localStorage';
import { refresh } from '@lib/lens/refresh';

type Profile = {
  handle: string;
  name: string;
  pictureUrl: string | null;
  id: string;
  canUseRelay: boolean | undefined;
  bio: string;
};

export const ProfileContext = createContext<Profile | null>(null);

export default function LensAuthenticationProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const [profile, setProfile] = useState<Profile | null>(null);

  const clearProfile = () => {
    setAuthenticationToken(null);
    setAuthenticationStatus('unauthenticated');
    setProfile(null);
    deleteLensLocalStorage();
  };

  const setAuthenticated = (lensStore: LensLocalStorage) => {
    setAuthenticationToken(lensStore.accessToken);
    setAuthenticationStatus('authenticated');
    console.log('lensStore: ', lensStore);

    setProfile({
      handle: lensStore.handle,
      pictureUrl: lensStore.pictureUrl,
      name: lensStore.name,
      canUseRelay: lensStore.canUseRelay,
      id: lensStore.id,
      bio: lensStore.bio
    });
  };

  useEffect(() => {
    const lensStore = getFromLocalStorage();
    if (!lensStore) {
      clearProfile();
      return;
    }

    // Validate JWT tokens dates
    try {
      const decodedAccess = jwt.decode(lensStore.accessToken, { json: true });
      const decodedRefresh = jwt.decode(lensStore.refreshToken, { json: true });

      // @ts-ignore
      if (Date.now() >= decodedRefresh.exp * 1000) {
        clearProfile();
        return;
      }

      // @ts-ignore
      if (Date.now() >= decodedAccess.exp * 1000) {
        refresh(lensStore.refreshToken)
          .then((newToken: any) => {
            const newLensStore = {
              ...lensStore,
              accessToken: newToken.accessToken,
              refreshToken: newToken.refreshToken
            };
            setLensLocalStorage(newLensStore);
            setAuthenticated(newLensStore);
          })
          .catch(() => clearProfile());
        return;
      }
    } catch (err) {
      clearProfile;
      return;
    }

    setAuthenticated(lensStore);
  }, [address]);

  const [authenticationStatus, setAuthenticationStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('unauthenticated');

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const challenge = await generateChallenge({
        address
      });

      return challenge.text;
    },

    createMessage: ({ nonce }) => {
      return nonce;
    },

    getMessageBody: ({ message }) => {
      return message as string;
    },

    verify: async ({ message, signature }) => {
      if (!address) {
        return false;
      }

      const authenticatedResult = await authenticate({ address, signature });
      const profile = await getDefaultProfile(address);

      if (!profile) {
        return false;
      }

      // @ts-ignore
      const pictureUrl = profile?.picture?.original?.url;

      const lensStore: LensLocalStorage = {
        accessToken: authenticatedResult.accessToken,
        refreshToken: authenticatedResult.refreshToken,
        handle: profile.handle,
        name: profile.name as string,
        pictureUrl,
        canUseRelay: profile.dispatcher?.canUseRelay,
        id: profile.id as string,
        bio: profile.bio as string
      };
      setLensLocalStorage(lensStore);
      setAuthenticated(lensStore);

      return Boolean(true);
    },

    signOut: async () => {
      deleteLensLocalStorage();
      setAuthenticationToken(null);
    }
  });

  return (
    <RainbowKitAuthenticationProvider
      adapter={authenticationAdapter}
      status={authenticationStatus}
    >
      <ProfileContext.Provider value={profile}>
        {children}
      </ProfileContext.Provider>
    </RainbowKitAuthenticationProvider>
  );
}
