import '@rainbow-me/rainbowkit/styles.css';

import { ProfileQuery } from '@lib/lens/graphql/generated';
import {
  LensLocalStorage,
  deleteLensLocalStorage,
  getFromLocalStorage,
  setLensLocalStorage
} from '@lib/lens/localStorage';
import { authenticate, generateChallenge } from '@lib/lens/login';
import {
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter
} from '@rainbow-me/rainbowkit';
import { createContext, useEffect, useState } from 'react';

import { ATTRIBUTES_LIST_KEY } from '@lib/config';
import { getDefaultProfile } from '@lib/lens/default-profile';
import { queryProfile } from '@lib/lens/dispatcher';
import { getProfiles } from '@lib/lens/get-profiles';
import { setAuthenticationToken } from '@lib/lens/graphql/apollo-client';
import { MetadataDisplayType } from '@lib/lens/interfaces/generic';
import { AttributeData } from '@lib/lens/interfaces/profile-metadata';
import { refresh } from '@lib/lens/refresh';
import jwt from 'jsonwebtoken';
import React from 'react';
import { useAccount } from 'wagmi';

export const ProfileContext = createContext<{
  profile: ProfileQuery['profile'] | null;
  authenticationStatus: string;
}>({
  profile: null,
  authenticationStatus: 'unauthenticated'
});

export default function LensAuthenticationProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const [profile, setProfile] = useState<ProfileQuery['profile'] | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const clearProfile = () => {
    setAuthenticationToken(null);
    setAuthenticationStatus('unauthenticated');
    setProfile(null);
    deleteLensLocalStorage();
  };

  const setAuthenticated = (lensStore: LensLocalStorage) => {
    setAuthenticationToken(lensStore.accessToken);
    setAuthenticationStatus('authenticated');
    const attLocation: AttributeData = {
      displayType: MetadataDisplayType.string,
      value:
        lensStore?.profile?.attributes?.find(
          (attribute) => attribute.key === 'location'
        )?.value || '',
      key: 'location'
    };

    const attTwitter: AttributeData = {
      displayType: MetadataDisplayType.string,
      value:
        lensStore?.profile?.attributes?.find(
          (attribute) => attribute.key === 'twitter'
        )?.value || '',
      key: 'twitter'
    };

    const attWebsite: AttributeData = {
      displayType: MetadataDisplayType.string,
      value:
        lensStore?.profile?.attributes?.find(
          (attribute) => attribute.key === 'website'
        )?.value || '',
      key: 'website'
    };

    // BUG: CHECK
    const attLists: AttributeData = {
      displayType: MetadataDisplayType.string,
      value:
        lensStore?.profile?.attributes?.find(
          (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
        )?.value || '',
      key: ATTRIBUTES_LIST_KEY
    };

    // TODO logging FIXME
    // console.log('attLists-- ', attLists);

    const p: ProfileQuery['profile'] = lensStore.profile;

    // @ts-ignore
    // const attt = lensStore.profile.attributes;

    // TODO LOGGING
    // console.log('pp 1: ', lensStore.profile);
    // console.log('pp 2: ', p);
    // console.log('pp 3: ', attt);

    // // @ts-ignore
    // console.log('pp 4: ', lensStore.profile.attributes);
    // console.log('pp 5: ', p?.attributes);
    // console.log(
    //   '>>************************************************************'
    // );

    if (p && lensStore?.profile?.attributes) {
      const attributes = [attLocation, attTwitter, attWebsite];
      if (
        lensStore.profile.attributes.find((a) => a.key === ATTRIBUTES_LIST_KEY)
      ) {
        attributes.push(attLists);
      }
      p.attributes = attributes;
    }

    setProfile(p);
  };

  useEffect(() => {
    const lensStore = getFromLocalStorage();
    if (!lensStore) {
      clearProfile();
      setIsTokenValid(false);
      return;
    }

    // Validate JWT tokens dates
    try {
      const decodedAccess = jwt.decode(lensStore.accessToken, { json: true });
      const decodedRefresh = jwt.decode(lensStore.refreshToken, { json: true });

      // @ts-ignore
      if (Date.now() >= decodedRefresh.exp * 1000) {
        clearProfile();
        setIsTokenValid(false);
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
            setIsTokenValid(true);
          })
          .catch(() => {
            clearProfile();
            setIsTokenValid(false);
          });
        return;
      }
    } catch (err) {
      clearProfile;
      setIsTokenValid(false);
      return;
    }

    setAuthenticated(lensStore);
    setIsTokenValid(true);

    // console.log('🔴 setAuthenticated ', lensStore);
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
      let pro = await getDefaultProfile(address);

      if (!pro) {
        const profiles = await getProfiles(address);
        if (!profiles || profiles.items.length === 0) {
          console.log('No profile, ask for a handler! ');

          return Boolean(false);
        }
        console.log('No default profile, taking first');
        pro = profiles.items[0];
      }

      // profileQuery > profile
      const profil: ProfileQuery['profile'] = await queryProfile({
        profileId: pro.id
      });

      if (!profil) {
        console.log('shouldnt be here');
        return false; // Promise.reject('Unknown error getting profile');
      }

      // @ts-ignore
      // let coverUrl;
      // if (profil?.coverPicture?.__typename === 'MediaSet') {
      //   coverUrl = profil?.coverPicture.original.url;
      // }
      // if (profil?.coverPicture?.__typename === 'NftImage') {
      //   coverUrl = profil?.coverPicture.uri as string;
      // }

      // FIXME Attributes type fixes
      const attLocation: AttributeData = {
        displayType: MetadataDisplayType.string,
        // traitType: 'sss',
        // value: (profile.attributes as any)['location'].value,
        value:
          profil?.attributes?.find((attribute) => attribute.key === 'location')
            ?.value || '',
        key: 'location'
      };

      const attTwitter: AttributeData = {
        displayType: MetadataDisplayType.string,
        // traitType: 'sss',
        // value: (profile.attributes as any)['twitter'].value,
        // value: profile.attributes?.entries. ['twitter'].value,
        value:
          profil?.attributes?.find((attribute) => attribute.key === 'twitter')
            ?.value || '',
        key: 'twitter'
      };

      const attWebsite: AttributeData = {
        displayType: MetadataDisplayType.string,
        // traitType: 'sss',
        // value: (profile.attributes as any)['website'].value,
        value:
          profil?.attributes?.find((attribute) => attribute.key === 'website')
            ?.value || '',
        key: 'website'
      };

      const attLists: AttributeData = {
        displayType: MetadataDisplayType.string,
        // traitType: 'string',
        // value: JSON.stringify(favIDsArray), // TODO CAN IT BE NON-STRINGIFIED?

        value:
          profil?.attributes?.find(
            (attribute) => attribute.key === ATTRIBUTES_LIST_KEY
          )?.value || '',

        key: ATTRIBUTES_LIST_KEY // TODO: USE ATTRIBUTES_LIST_KEY ONCE IN PROD
      };

      // TODO LOGGING
      // console.log('>>>>>> PROFILE ATTRIBUTES ', profil.attributes);

      // TODO: LENSTORE OBJECT IS INCOMPLETE!

      const attributesFixed: AttributeData[] = [
        attLocation,
        attWebsite,
        attTwitter,
        attLists
      ];

      // Suscribe to channel for notifications

      profil.attributes = attributesFixed;
      const lensStore: LensLocalStorage = {
        accessToken: authenticatedResult.accessToken,
        refreshToken: authenticatedResult.refreshToken,
        profile: profil,
        optIn: false
      };

      console.log('🔴 lensStore ', lensStore);

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
      <ProfileContext.Provider value={{ profile, authenticationStatus }}>
        {/* {children} */}
        {React.Children.map(children, (child) => {
          return React.cloneElement(child as React.ReactElement, {
            isTokenValid
          });
        })}
      </ProfileContext.Provider>
    </RainbowKitAuthenticationProvider>
  );
}
