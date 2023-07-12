import {
  APP_NAME,
  IPFS_PROXY_URL,
  PUBLICATION_METADATA_VERSION
} from '@lib/config';
import { BigNumber, utils } from 'ethers';
import {
  CreatePostViaDispatcherDocument,
  CreatePublicPostRequest,
  PublicationReportingSpamSubreason
} from './graphql/generated';
import {
  IbuiltPost,
  Metadata,
  PublicationMainFocus
} from './interfaces/publication';
import { uploadImageIpfs, uploadIpfs } from './ipfs';

import { DEFAULT_METADATA_ATTRIBUTES } from './post';
import { apolloClient } from './graphql/apollo-client';
import { broadcastRequest } from './broadcast';
import { getAddressFromSigner } from './ethers.service';
import { pollUntilIndexed } from './graphql/has-transaction-been-indexed';
import { queryProfile } from './dispatcher';
import { signCreatePostTypedData } from './publication-post';
import { v4 as uuidv4 } from 'uuid';

const createPostViaDispatcherRequest = async (
  request: CreatePublicPostRequest
) => {
  const result = await apolloClient.mutate({
    mutation: CreatePostViaDispatcherDocument,
    variables: {
      request
    }
  });

  return result.data!.createPostViaDispatcher;
};

const post = async (createPostRequest: CreatePublicPostRequest) => {
  const profileResult = await queryProfile({
    profileId: createPostRequest.profileId
  });

  if (!profileResult) {
    throw new Error('Could not find profile');
  }

  // this means it they have not setup the dispatcher, if its a no you must use broadcast
  if (profileResult.dispatcher?.canUseRelay) {
    const dispatcherResult = await createPostViaDispatcherRequest(
      createPostRequest
    );
    // console.log(
    //   'create post via dispatcher: createPostViaDispatcherRequest',
    //   dispatcherResult
    // );

    if (dispatcherResult.__typename !== 'RelayerResult') {
      console.error('create post via dispatcher: failed', dispatcherResult);
      throw new Error('create post via dispatcher: failed');
    }

    return { txHash: dispatcherResult.txHash, txId: dispatcherResult.txId };
  } else {
    const signedResult = await signCreatePostTypedData(createPostRequest);
    console.log('create post via broadcast: signedResult', signedResult);

    const broadcastResult = await broadcastRequest({
      id: signedResult.result.id,
      signature: signedResult.signature
    });

    if (broadcastResult.__typename !== 'RelayerResult') {
      console.error('create post via broadcast: failed', broadcastResult);
      throw new Error('create post via broadcast: failed');
    }

    console.log('create post via broadcast: broadcastResult', broadcastResult);
    return { txHash: broadcastResult.txHash, txId: broadcastResult.txId };
  }
};

export const createPostGasless = async (
  profileId: string,
  builtPost: IbuiltPost,
  waitForIndexer: boolean = false // TBD
) => {
  // console.log('createpostgasless waitForIndexer:', waitForIndexer);
  if (!profileId) {
    throw new Error('No profileId defined');
  }
  // console.log('🟩🟩 🟩🟩 🟩🟩 CREANDO POST GASLESS ', builtPost);
  const address = await getAddressFromSigner();

  let mediaResult = [];
  if (builtPost.image) {
    const imageIpfsResult = await uploadImageIpfs(builtPost.image);
    mediaResult.push({
      item: `${IPFS_PROXY_URL}${imageIpfsResult.path}`,
      type: 'image/jpeg'
    });
  }

  // console.log('create post: address', address);
  // console.log('🟩🟩 🟩🟩 🟩🟩 OLD ATTRIBUTES ', builtPost.attributes);

  const otherAttributes = [
    // PORQUE NO ESTA EN EL BUILTPOST ORIGINAL???
    {
      traitType: 'string',
      key: 'userLink',
      value: builtPost.link || '' //FIXME
    },
    {
      traitType: 'string',
      key: 'customData',
      value: builtPost.originalPostId || ''
    }
  ];
  const na = builtPost.attributes.concat(otherAttributes);
  // console.log('🟩🟩 🟩🟩 🟩🟩 FULL ATTRIBUTES', na);

  const ipfsResult = await uploadIpfs<Metadata>({
    metadata_id: uuidv4(),
    name: builtPost.name || '', //the title
    description: builtPost.abstract, //the resume
    content: builtPost.content, //the details
    imageMimeType: builtPost.imageMimeType,
    external_url: builtPost.external_url,
    tags: builtPost.tags,
    // TODO: createdOn: new Date().toISOString(),
    attributes: na || DEFAULT_METADATA_ATTRIBUTES,
    locale: builtPost.locale || 'en-us',
    mainContentFocus: builtPost.image
      ? PublicationMainFocus.IMAGE
      : PublicationMainFocus.TEXT_ONLY,
    animation_url: '',
    media: mediaResult,
    version: PUBLICATION_METADATA_VERSION,
    appId: APP_NAME.toLocaleLowerCase()
  });

  // console.log('create post: ipfs result', ipfsResult);

  const createPostRequest = {
    profileId,
    contentURI: `ipfs://${ipfsResult.path}`,
    collectModule: {
      // feeCollectModule: {
      //   amount: {
      //     currency: currencies.enabledModuleCurrencies.map(
      //       (c: any) => c.address
      //     )[0],
      //     value: '0.000001',
      //   },
      //   recipient: address,
      //   referralFee: 10.5,
      // },
      // revertCollectModule: true,
      freeCollectModule: { followerOnly: false }
      // limitedFeeCollectModule: {
      //   amount: {
      //     currency: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      //     value: '2',
      //   },
      //   collectLimit: '20000',
      //   recipient: '0x3A5bd1E37b099aE3386D13947b6a90d97675e5e3',
      //   referralFee: 0,
      // },
    },
    referenceModule: {
      followerOnlyReferenceModule: false
    }
  };

  const result = await post(createPostRequest);
  console.log('create post gasless', result);

  console.log('77create post: poll until indexed');
  const indexedResult = await pollUntilIndexed(result.txHash);

  console.log('Indexing finished.', result);

  const logs = indexedResult.txReceipt!.logs;
  const topicId = utils.id(
    'PostCreated(uint256,uint256,string,address,bytes,address,bytes,uint256)'
  );
  // console.log('topicid we care about', topicId);

  const profileCreatedLog = logs.find((l: any) => l.topics[0] === topicId);
  // console.log('create post: created log', profileCreatedLog);

  let profileCreatedEventLog = profileCreatedLog!.topics;
  // console.log('create post: created event logs', profileCreatedEventLog);

  const publicationId = utils.defaultAbiCoder.decode(
    ['uint256'],
    profileCreatedEventLog[2]
  )[0];

  const internalPubId =
    profileId + '-' + BigNumber.from(publicationId).toHexString();

  const pubId = BigNumber.from(publicationId).toHexString();

  const postResult = {
    txHash: result.txHash,
    txId: result.txId,
    internalPubId,
    pubId
  };
  console.log('postresult en post-gasless', postResult);
  return postResult;
};
