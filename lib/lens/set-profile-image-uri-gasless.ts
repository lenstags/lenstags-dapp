import {
  CreateSetProfileImageUriViaDispatcherDocument,
  UpdateProfileImageRequest
} from '@lib/lens/graphql/generated';

import { apolloClient } from '@lib/lens/graphql/apollo-client';
import { broadcastRequest } from './broadcast';
import { getAddressFromSigner } from '@lib/lens/ethers.service';
import { pollUntilIndexed } from './graphql/has-transaction-been-indexed';
import { signCreateSetProfileImageUriTypedData } from './set-profile-image-uri';

const createSetProfileUriViaDispatcherRequest = async (
  request: UpdateProfileImageRequest
) => {
  const result = await apolloClient.mutate({
    mutation: CreateSetProfileImageUriViaDispatcherDocument,
    variables: {
      request
    }
  });

  return result.data!.createSetProfileImageURIViaDispatcher;
};

const setProfileImage = async (
  createProfileImageRequest: UpdateProfileImageRequest,
  hasDispatcher: boolean
) => {
  // this means it they have not setup the dispatcher, if its a no you must use broadcast
  if (hasDispatcher) {
    const dispatcherResult = await createSetProfileUriViaDispatcherRequest(
      createProfileImageRequest
    );
    console.log(
      'set profile image url via dispatcher: createPostViaDispatcherRequest',
      dispatcherResult
    );

    if (dispatcherResult.__typename !== 'RelayerResult') {
      console.error(
        'set profile image url via dispatcher: failed',
        dispatcherResult
      );
      throw new Error('set profile image url via dispatcher: failed');
    }

    return { txHash: dispatcherResult.txHash, txId: dispatcherResult.txId };
  } else {
    const signedResult = await signCreateSetProfileImageUriTypedData(
      createProfileImageRequest
    );
    console.log(
      'set profile image url via broadcast: signedResult',
      signedResult
    );

    const broadcastResult = await broadcastRequest({
      id: signedResult.result.id,
      signature: signedResult.signature
    });

    if (broadcastResult?.__typename !== 'RelayerResult') {
      console.error(
        'set profile image url via broadcast: failed',
        broadcastResult
      );
      throw new Error('set profile image url via broadcast: failed');
    }

    console.log(
      'set profile image url via broadcast: broadcastResult',
      broadcastResult
    );
    return { txHash: broadcastResult.txHash, txId: broadcastResult.txId };
  }
};

export const setProfileImageUri = async (
  profileId: string,
  hasDispatcher: boolean,
  urlIPFS: string
) => {
  if (!profileId) {
    throw new Error('Must define PROFILE_ID');
  }

  const address = await getAddressFromSigner();
  console.log('set profile image uri: address', address);

  const setProfileImageUriRequest = {
    profileId,
    url: urlIPFS
  };

  const result = await setProfileImage(
    setProfileImageUriRequest,
    hasDispatcher
  );
  console.log('set profile image url gasless', result);
  console.log('set profile image url: poll until indexed');
  const indexedResult = await pollUntilIndexed(result.txHash);

  console.log('set profile image url: profile has been indexed', result);

  const logs = indexedResult.txReceipt!.logs;

  console.log('set profile image url: logs', logs);
};
