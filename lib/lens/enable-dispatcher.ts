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
import { lensHub } from '@lib/lens/lens-hub';

export const enableDispatcherWithTypedData = async (
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
