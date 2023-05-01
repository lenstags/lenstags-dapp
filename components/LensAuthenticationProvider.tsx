import '@rainbow-me/rainbowkit/styles.css';

import {
  LensLocalStorage,
  deleteLensLocalStorage,
  getFromLocalStorage,
  setLensLocalStorage
} from '@lib/lens/localStorage';
import { Profile, ProfileQuery } from '@lib/lens/graphql/generated';
import {
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter
} from '@rainbow-me/rainbowkit';
import { authenticate, generateChallenge } from '@lib/lens/login';
import { createContext, useEffect, useState } from 'react';

import { ATTRIBUTES_LIST_KEY } from '@lib/config';
import { AttributeData } from '@lib/lens/interfaces/profile-metadata';
import { MetadataDisplayType } from '@lib/lens/interfaces/generic';
import { getDefaultProfile } from '@lib/lens/default-profile';
import jwt from 'jsonwebtoken';
import { queryProfile } from '@lib/lens/dispatcher';
import { refresh } from '@lib/lens/refresh';
import { setAuthenticationToken } from '@lib/lens/graphql/apollo-client';
import { useAccount } from 'wagmi';

export const ProfileContext = createContext<ProfileQuery['profile'] | null>(
  null
);

export default function LensAuthenticationProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const [profile, setProfile] = useState<ProfileQuery['profile'] | null>(null);
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
    const attt = lensStore.profile.attributes;

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
    // TODO LOGGING
    // console.log('--p2 ', p);
    // console.log('--profile ', profile);

    // console.log('🔴 setProfile: ', p);
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
      const pro = await getDefaultProfile(address); // TODO Check when defaultProfilen't

      if (!pro) {
        throw `Cannot find default profile for ${address} `;
      }

      // profileQuery > profile
      const profil: ProfileQuery['profile'] = await queryProfile({
        profileId: pro.id
      });

      if (!profil) {
        return false;
      }

      // @ts-ignore
      const pictureUrl = profil?.picture?.original?.url;
      let coverUrl;

      if (profil?.coverPicture?.__typename === 'MediaSet') {
        coverUrl = profil?.coverPicture.original.url;
      }
      if (profil?.coverPicture?.__typename === 'NftImage') {
        coverUrl = profil?.coverPicture.uri as string;
      }

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

      profil.attributes = attributesFixed;

      // TODO LOGGING
      // console.log(
      //   'TOKENS DE LA APP ',
      //   authenticatedResult.accessToken,
      //   authenticatedResult.refreshToken
      // );
      const lensStore: LensLocalStorage = {
        accessToken: authenticatedResult.accessToken,
        refreshToken: authenticatedResult.refreshToken,
        profile: profil
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
