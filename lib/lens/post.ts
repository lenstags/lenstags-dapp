import { APP_NAME, PUBLICATION_METADATA_VERSION } from '@lib/config';
import {
  PublicationMainFocus,
  IbuiltPost
} from '@lib/lens/interfaces/publication';

import { Metadata } from './interfaces/publication';
import { broadcastRequest } from './broadcast';
import { getAddressFromSigner } from './ethers.service';
import { signCreatePostTypedData } from './publication-post';
import { uploadIpfs } from './ipfs';
import { v4 as uuidv4 } from 'uuid';
import { createPostGasless } from './post-gasless';
import { freeCollect } from './collect';

export const DEFAULT_METADATA_ATTRIBUTES = [
  {
    traitType: 'string',
    value: 'post',
    key: 'default_key'
  }
];

export const createPost = async (profileId: string, builtPost: IbuiltPost) => {
  if (!profileId) {
    throw new Error('Must define profileId');
  }

  // TODO CHECK THIS
  // const address = await getAddressFromSigner();
  // console.log('creating post: address', address);

  const ipfsResult = await uploadIpfs<Metadata>({
    metadata_id: uuidv4(),
    // TODO: image: post.image,
    imageMimeType: null,
    content: builtPost.content,
    name: builtPost.title || '',
    external_url: builtPost.external_url, // the list is editabl here
    // TODO: coverPicture: post.cover,
    tags: builtPost.tags,
    // TODO: createdOn: new Date().toISOString(),
    // attributes: [
    //   {
    //     traitType: 'string',
    //     value: 'post'
    //     // key: 'default'
    //   }
    // ],
    attributes: DEFAULT_METADATA_ATTRIBUTES,
    locale: 'en-us',
    mainContentFocus: PublicationMainFocus.TEXT_ONLY,
    animation_url: '',
    media: [
      // {
      //   item: 'https://scx2.b-cdn.net/gfx/news/hires/2018/lion.jpg',
      //   // item: 'https://assets-global.website-files.com/5c38aa850637d1e7198ea850/5f4e173f16b537984687e39e_AAVE%20ARTICLE%20website%20main%201600x800.png',
      //   type: 'image/jpeg',
      // },
    ],
    // TODO: METADATA VERSION UNIFICATION
    version: PUBLICATION_METADATA_VERSION,
    appId: APP_NAME.toLocaleLowerCase()
  });
  console.log('create post: ipfs result', ipfsResult);

  // hard coded to make the code example clear
  const createPostRequest = {
    profileId,
    contentURI: 'ipfs://' + ipfsResult.path,
    collectModule: {
      // TODO IN THE MIDDLE FUTURE
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
      // freeCollectModule: { followerOnly: true }
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

  console.log(
    'ACA 0 create post via broadcast: broadcastResult',
    broadcastResult
  );

  // FIXME This won't work because the logs are empty as for now

  // const publicationId = utils.defaultAbiCoder.decode(
  //   ['uint256'],
  //   profileCreatedEventLog[2]
  // )[0];

  // const internalPubId =
  //   profileId + '-' + BigNumber.from(publicationId).toHexString();

  // const pubId = BigNumber.from(publicationId).toHexString();

  // return { txHash: broadcastResult.txHash, txId: broadcastResult.txId };
  const postResult = {
    txHash: broadcastResult.txHash,
    txId: broadcastResult.txId,
    internalPubId: '',
    pubId: ''
  };
  return postResult;
  // TODO: VERIFY THIS return profileId + '-' + BigNumber.from(publicationId).toHexString();
};

export const createPostManager = async (
  lensProfile: any,
  builtPost: IbuiltPost,
  selfCollect: boolean
) => {
  // TODO test with no dispatcher
  const result = lensProfile?.dispatcher?.canUseRelay
    ? await createPostGasless(lensProfile?.id, builtPost)
    : await createPost(lensProfile?.id, builtPost);

  if (selfCollect) {
    console.log(' Collecting post, minting... ');
    await freeCollect(result.internalPubId);
    console.log('Collecting post finished.');
  }

  return result;
};

export const addPostIdtoListId = async (postId: string, listId: string) => {
  // get the list id
};
