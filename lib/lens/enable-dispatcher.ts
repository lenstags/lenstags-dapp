import {
  CreateSetDispatcherTypedDataDocument,
  ProfileDocument,
  ProfileQuery,
  SetDispatcherRequest,
  SingleProfileQueryRequest
} from '@lib/lens/graphql/generated';
import {
  getAddressFromSigner,
  signedTypeData,
  splitSignature
} from './ethers.service';

import { apolloClient } from '@lib/lens/graphql/apollo-client';
// import { gql } from 'graphql-tag';
import { gql } from '@apollo/client/core';
import { lensHub } from '@lib/lens/lens-hub';

const CREATE_SET_DISPATCHER_TYPED_DATA = gql`
  mutation CreateSetDispatcherTypedData(
    $options: TypedDataOptions
    $request: SetDispatcherRequest!
  ) {
    createSetDispatcherTypedData(options: $options, request: $request) {
      id
      expiresAt
      typedData {
        types {
          SetDispatcherWithSig {
            name
            type
            __typename
          }
          __typename
        }
        domain {
          name
          chainId
          version
          verifyingContract
          __typename
        }
        value {
          nonce
          deadline
          profileId
          dispatcher
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export const enableDispatcherWithTypedData = async (request: {
  profileId: string;
  enable: boolean;
}) => {
  const result = await apolloClient.mutate({
    mutation: CREATE_SET_DISPATCHER_TYPED_DATA,
    variables: {
      request
    }
  });

  return result.data!.createSetDispatcherTypedData;
};

export const enableDispatcherWithTypedDataold = async (
  request: SetDispatcherRequest
) => {
  const result = await apolloClient.mutate({
    mutation: CreateSetDispatcherTypedDataDocument,
    variables: {
      request
    }
  });
  return result.data!.createSetDispatcherTypedData;
};

export const enableDispatcher = async (profileId: string) => {
  try {
    if (!profileId) {
      throw new Error('Must define PROFILE_ID in the .env to run this');
    }

    const address = await getAddressFromSigner();
    console.log('DDD set dispatcher: address', address);
    console.log('== READY TO SET THE DISPATCHER', address);
    const result = await enableDispatcherWithTypedData({
      profileId,
      enable: true
      // leave it blank if you want to use the lens API dispatcher!
      // dispatcher: '0xEEA0C1f5ab0159dba749Dc0BAee462E5e293daaF',
    });
    console.log('DDDD set dispatcher: enableDispatcherWithTypedData', result);
    console.log('== DISPATCHER FINISHED', result);

    const typedData = result.typedData;
    console.log('set dispatcher: typedData', typedData);

    const signature = await signedTypeData(
      typedData.domain,
      typedData.types as any,
      typedData.value
    );
    console.log('set dispatcher: signature', signature);

    if (!signature) {
      throw new Error('Error splitting signature');
    }
    const { v, r, s } = splitSignature(signature);

    const tx = await lensHub.setDispatcherWithSig({
      profileId: typedData.value.profileId,
      dispatcher: typedData.value.dispatcher,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline
      }
    });
    console.log('set dispatcher: tx hash', tx.hash);
    return true;
  } catch (err) {
    console.log('err dispatcher ', err);
    return false;
  }
};

// TODO: move to its own file
export async function queryProfile(
  request: SingleProfileQueryRequest
): Promise<ProfileQuery['profile']> {
  const result = await apolloClient.query({
    query: ProfileDocument,
    variables: {
      request
    }
  });
  return result.data!.profile;
}
