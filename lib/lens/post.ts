import { gql } from '@apollo/client/core';
import { BigNumber, utils } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { apolloClient } from './graphql/apollo-client';
import { authenticate } from './login';
import {
  getAddressFromSigner,
  signedTypeData,
  splitSignature
} from './ethers.service';
import { pollUntilIndexed } from './graphql/has-transaction-been-indexed';
import { Metadata } from './interfaces/publication';
import { uploadIpfs } from './ipfs';
import { lensHub } from './lens-hub';
import { signCreatePostTypedData } from './publication-post';
import { PublicationMainFocus } from './interfaces/publication';
import { broadcastRequest } from './broadcast';

export interface postData {
  title?: string;
  name?: string;
  abstract?: string;
  content: string;
  link?: string;
  cover?: string;
  tags?: string[];
  // image?: Buffer[]
}

export const createPost = async (profileId: string, post: postData) => {
  if (!profileId) {
    throw new Error('Must define profileId');
  }

  const address = await getAddressFromSigner();
  console.log('create post: address', address);

  const ipfsResult = await uploadIpfs<Metadata>({
    metadata_id: uuidv4(),
    // TODO: image: post.image,
    imageMimeType: null,
    content: post.content,
    name: post.title || '',
    external_url: null,
    // TODO: coverPicture: post.cover,
    tags: post.tags,
    // TODO: createdOn: new Date().toISOString(),
    attributes: [
      {
        traitType: 'string',
        value: 'post'
      }
    ],
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
    version: '2.0.0',
    appId: 'lenstags'
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
      freeCollectModule: { followerOnly: true }
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

  console.log('create post via broadcast: broadcastResult', broadcastResult);
  return { txHash: broadcastResult.txHash, txId: broadcastResult.txId };

  // TODO: VERIFY THIS return profileId + '-' + BigNumber.from(publicationId).toHexString();
};
