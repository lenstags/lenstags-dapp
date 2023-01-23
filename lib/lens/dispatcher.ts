import { apolloClient } from '../lens/graphql/apollo-client';
import {
  getAddressFromSigner,
  signedTypeData,
  splitSignature
} from '../lens/ethers.service';
import {
  CreateSetDispatcherTypedDataDocument,
  SetDispatcherRequest,
  SingleProfileQueryRequest,
  ProfileDocument,
  Profile
} from './graphql/generated';
import { lensHub } from './lens-hub';

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

export const enable = async (profileId: any) => {

  if (!profileId) {
    throw new Error('Must define profileId');
  }

  const address = getAddressFromSigner();
  console.log('🤖 set dispatcher: address', address);

  //   await login(address);

  const result = await enableDispatcherWithTypedData({
    profileId
    // leave it blank if you want to use the lens API dispatcher!
    // dispatcher: '0xEEA0C1f5ab0159dba749Dc0BAee462E5e293daaF',
  });
  console.log('set dispatcher: enableDispatcherWithTypedData', result);

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

};

const disableDispatcherWithTypedData = async (
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

export const disable = async (profileId: any) => {

  if (!profileId) {
    throw new Error('Must define PROFILE_ID in the .env to run this');
  }

  const address = getAddressFromSigner();
  console.log('disable dispatcher: address', address);

  //   await login(address);

  const result = await disableDispatcherWithTypedData({
    profileId,
    enable: false
  });
  console.log('disable dispatcher: disableDispatcherWithTypedData', result);

  const typedData = result.typedData;
  console.log('disable dispatcher: typedData', typedData);

  const signature = await signedTypeData(
    typedData.domain,
    typedData.types as any,
    typedData.value
  );
  console.log('disable dispatcher: signature', signature);

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
  console.log('disable dispatcher: tx hash', tx.hash);

};

// TODO: move to its own file
export async function queryProfile(request: SingleProfileQueryRequest) {
  const result = await apolloClient.query({
    query: ProfileDocument,
    variables: {
      request
    }
  });
  return result.data!.profile;
}
