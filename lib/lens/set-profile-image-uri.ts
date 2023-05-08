import {
  CreateSetProfileImageUriTypedDataDocument,
  UpdateProfileImageRequest
} from '@lib/lens/graphql/generated';
import {
  getAddressFromSigner,
  signedTypeData,
  splitSignature
} from '@lib/lens/ethers.service';

import { apolloClient } from '@lib/lens/graphql/apollo-client';
import { lensHub } from '@lib/lens/lens-hub';

export const createSetProfileImageUriTypedData = async (
  request: UpdateProfileImageRequest
) => {
  const result = await apolloClient.mutate({
    mutation: CreateSetProfileImageUriTypedDataDocument,
    variables: {
      request
    }
  });

  return result.data!.createSetProfileImageURITypedData;
};

export const signCreateSetProfileImageUriTypedData = async (
  request: UpdateProfileImageRequest
) => {
  const result = await createSetProfileImageUriTypedData(request);
  console.log(
    'set profile image uri: createSetProfileImageUriTypedData',
    result
  );

  const typedData = result.typedData;
  console.log('set profile image uri: typedData', typedData);

  const signature = await signedTypeData(
    typedData.domain,
    typedData.types as any,
    typedData.value
  );
  console.log('set profile image uri: signature', signature);

  return { result, signature };
};

// deprecated
const setProfileImageUri = async (profileId: string, urlIPFS: string) => {
  if (!profileId) {
    throw new Error('Must define PROFILE_ID in the .env to run this');
  }

  const address = getAddressFromSigner();
  console.log('set profile image uri: address', address);

  // hard coded to make the code example clear
  const setProfileImageUriRequest = {
    profileId,
    url: urlIPFS
  };

  const signedResult = await signCreateSetProfileImageUriTypedData(
    setProfileImageUriRequest
  );
  console.log('set profile image uri: signedResult', signedResult);

  const typedData = signedResult.result.typedData;

  if (!signedResult.signature) {
    throw 'Invalid signatureee';
  }

  const { v, r, s } = splitSignature(signedResult.signature);

  const tx = await lensHub.setProfileImageURIWithSig({
    profileId: typedData.value.profileId,
    imageURI: typedData.value.imageURI,
    sig: {
      v,
      r,
      s,
      deadline: typedData.value.deadline
    }
  });
  console.log('set profile image uri: tx hash', tx.hash);
};
