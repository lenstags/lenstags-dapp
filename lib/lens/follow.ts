import {
  CreateFollowTypedDataDocument,
  FollowRequest
} from './graphql/generated';
import {
  getAddressFromSigner,
  signedTypeData,
  splitSignature
} from './ethers.service';

import { apolloClient } from './graphql/apollo-client';
import { lensHub } from './lens-hub';

export const createFollowTypedData = async (request: FollowRequest) => {
  const result = await apolloClient.mutate({
    mutation: CreateFollowTypedDataDocument,
    variables: {
      request
    }
  });

  return result.data!.createFollowTypedData;
};

export const follow = async (profileId: string = '0x11') => {
  const address = await getAddressFromSigner();
  console.log('follow: address', address);

  const result = await createFollowTypedData({
    follow: [
      {
        profile: profileId
      }
    ]
  });
  console.log('follow: result', result);

  const typedData = result.typedData;
  console.log('follow: typedData', typedData);

  const signature = await signedTypeData(
    typedData.domain,
    typedData.types as any,
    typedData.value
  );
  console.log('follow: signature', signature);

  if (!signature) {
    return;
  }
  const { v, r, s } = splitSignature(signature);

  const tx = await lensHub.followWithSig({
    follower: getAddressFromSigner(),
    profileIds: typedData.value.profileIds,
    datas: typedData.value.datas,
    sig: {
      v,
      r,
      s,
      deadline: typedData.value.deadline
    }
  });
  console.log('follow: tx hash', tx.hash);
  return tx.hash;
};
