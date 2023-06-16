import {
  CreateUnfollowTypedDataDocument,
  UnfollowRequest
} from './graphql/generated';
import {
  getAddressFromSigner,
  getSigner,
  signedTypeData,
  splitSignature
} from './ethers.service';

import { LENS_FOLLOW_NFT_ABI } from '../config';
import { apolloClient } from './graphql/apollo-client';
import { ethers } from 'ethers';

export const createUnfollowTypedData = async (request: UnfollowRequest) => {
  const result = await apolloClient.mutate({
    mutation: CreateUnfollowTypedDataDocument,
    variables: {
      request
    }
  });

  return result.data!.createUnfollowTypedData;
};

export const unfollow = async (profileId: string) => {
  const address = getAddressFromSigner();
  console.log('unfollow: address', address);

  const result = await createUnfollowTypedData({ profile: profileId });
  console.log('unfollow: result', result);

  const typedData = result.typedData;
  console.log('unfollow: typedData', typedData);

  const signature = await signedTypeData(
    typedData.domain,
    typedData.types as any,
    typedData.value
  );
  console.log('unfollow: signature', signature);
  if (!signature) {
    throw new Error('Error splitting signature');
  }
  const { v, r, s } = splitSignature(signature);

  // load up the follower nft contract
  const followNftContract = new ethers.Contract(
    typedData.domain.verifyingContract,
    LENS_FOLLOW_NFT_ABI,
    getSigner()
  );

  const sig = {
    v,
    r,
    s,
    deadline: typedData.value.deadline
  };

  // force the tx to send
  const tx = await followNftContract.burnWithSig(typedData.value.tokenId, sig);
  console.log('follow: tx hash', tx.hash);
};
