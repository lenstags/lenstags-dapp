import {
  CreateCommentViaDispatcherDocument,
  CreatePublicCommentRequest
} from '@lib/lens/graphql/generated';
import {
  Metadata,
  PublicationMainFocus
} from '@lib/lens/interfaces/publication';
import { pollAndIndexComment, signCreateCommentTypedData } from './comment';

import { APP_NAME } from '@lib/config';
import { apolloClient } from '@lib/lens/graphql/apollo-client';
import { broadcastRequest } from './broadcast';
import { profile } from './get-profile';
import { uploadIpfs } from '@lib/lens/ipfs';
import { v4 as uuidv4 } from 'uuid';

const prefix = 'create comment gasless';

const createCommentViaDispatcherRequest = async (
  request: CreatePublicCommentRequest
) => {
  const result = await apolloClient.mutate({
    mutation: CreateCommentViaDispatcherDocument,
    variables: {
      request
    }
  });

  return result.data!.createCommentViaDispatcher;
};

export const commentGasless = async (
  profileId: string,
  publicationId: string,
  commentMetadata: Metadata
) => {
  const profileResult = await profile(profileId);
  if (!profileResult) {
    throw new Error('Could not find profile');
  }

  const ipfsResult = await uploadIpfs<Metadata>(
    //     {
    //     version: '2.0.0',
    //     mainContentFocus: PublicationMainFocus.TEXT_ONLY,
    //     metadata_id: uuidv4(),
    //     description: 'favlist',
    //     locale: 'en-US',
    //     content: 'favContent',
    //     external_url: null,
    //     image: null,
    //     imageMimeType: null,
    //     name: 'favName',
    //     attributes: [],
    //     tags: ['using_api_examples'],
    //     appId: APP_NAME
    //   }
    commentMetadata
  );
  console.log('create comment: ipfs result', ipfsResult);

  const createCommentRequest: CreatePublicCommentRequest = {
    profileId,
    publicationId,
    contentURI: `ipfs://${ipfsResult.path}`,

    collectModule: {
      // timedFeeCollectModule: {
      //   amount: {
      //     currency: currencies.enabledModuleCurrencies.map((c: any) => c.address)[0],
      //     value: '0.01',
      //   },
      //   recipient: address,
      //   referralFee: 10.5,
      // },
      revertCollectModule: true
    },
    // gated?: InputMaybe<GatedPublicationParamsInput> | undefined;
    referenceModule: {
      followerOnlyReferenceModule: false
    }
  };

  // this means it they have not setup the dispatcher, if its a no you must use broadcast
  if (profileResult.dispatcher?.canUseRelay) {
    const dispatcherResult = await createCommentViaDispatcherRequest(
      createCommentRequest
    );
    console.log(
      'create comment via dispatcher: createPostViaDispatcherRequest',
      dispatcherResult
    );

    if (dispatcherResult.__typename !== 'RelayerResult') {
      console.error('create comment via dispatcher: failed', dispatcherResult);
      throw new Error('create comment via dispatcher: failed');
    }

    return { txHash: dispatcherResult.txHash, txId: dispatcherResult.txId };
  } else {
    const signedResult = await signCreateCommentTypedData(createCommentRequest);
    console.log('create comment via broadcast: signedResult', signedResult);

    const broadcastResult = await broadcastRequest({
      id: signedResult.result.id,
      signature: signedResult.signature
    });

    if (broadcastResult.__typename !== 'RelayerResult') {
      console.error('create comment via broadcast: failed', broadcastResult);
      throw new Error('create comment via broadcast: failed');
    }

    console.log(
      'create comment via broadcast: broadcastResult',
      broadcastResult
    );
    return { txHash: broadcastResult.txHash, txId: broadcastResult.txId };
  }
};

// const createCommentGasless = async () => {
//   const profileId = PROFILE_ID;
//   if (!profileId) {
//     throw new Error('Must define PROFILE_ID in the .env to run this');
//   }

//   const address = getAddressFromSigner();
//   console.log('create comment: address', address);

//   await login(address);

//   const ipfsResult = await uploadIpfs<Metadata>({
//     version: '2.0.0',
//     mainContentFocus: PublicationMainFocus.TEXT_ONLY,
//     metadata_id: uuidv4(),
//     description: 'Description',
//     locale: 'en-US',
//     content: 'Content',
//     external_url: null,
//     image: null,
//     imageMimeType: null,
//     name: 'Name',
//     attributes: [],
//     tags: ['using_api_examples'],
//     appId: 'api_examples_github'
//   });
//   console.log('create comment: ipfs result', ipfsResult);

//   // hard coded to make the code example clear
//   const createCommentRequest = {
//     profileId,
//     // remember it has to be indexed and follow metadata standards to be traceable!
//     publicationId: `0x0f-0x01`,
//     contentURI: `ipfs://${ipfsResult.path}`,
//     collectModule: {
//       // timedFeeCollectModule: {
//       //   amount: {
//       //     currency: currencies.enabledModuleCurrencies.map((c: any) => c.address)[0],
//       //     value: '0.01',
//       //   },
//       //   recipient: address,
//       //   referralFee: 10.5,
//       // },
//       revertCollectModule: true
//     },
//     referenceModule: {
//       followerOnlyReferenceModule: false
//     }
//   };

//   const result = await commentGasless(createCommentRequest);
//   console.log('create comment gasless', result);

//   await pollAndIndexComment(result.txHash, profileId, prefix);
// };
