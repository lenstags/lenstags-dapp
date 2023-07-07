import { APP_NAME, PUBLICATION_METADATA_VERSION } from '@lib/config';
import { BigNumber, utils } from 'ethers/lib/ethers';
import {
  IbuiltPost,
  MetadataAttribute,
  PublicationMainFocus
} from '@lib/lens/interfaces/publication';

import { Metadata } from './interfaces/publication';
import { MetadataDisplayType } from './interfaces/generic';
import { Profile } from './graphql/generated';
import { broadcastRequest } from './broadcast';
import { builtinModules } from 'module';
import { commentGasless } from './comment-gasless';
import { createPostGasless } from './post-gasless';
import { freeCollect } from './collect';
import { getAddressFromSigner } from './ethers.service';
import { getLastComment } from './get-publications';
import { getPublication } from './get-publication';
import { pollUntilIndexed } from './graphql/has-transaction-been-indexed';
import { signCreatePostTypedData } from './publication-post';
import { uploadIpfs } from './ipfs';
import { v4 as uuidv4 } from 'uuid';

export const pollAndIndexPost = async (
  txHash: string,
  profileId: string,
  prefix: string
) => {
  console.log(`${prefix}: poll until indexed`);
  const indexedResult = await pollUntilIndexed(txHash);

  console.log(`${prefix}: profile has been indexed`);

  const logs = indexedResult.txReceipt!.logs;

  console.log(`${prefix}: logs`, logs);

  const topicId = utils.id(
    'PostCreated(uint256,uint256,string,address,bytes,address,bytes,uint256)'
  );
  console.log('topicid we care about', topicId);

  const profileCreatedLog = logs.find((l: any) => l.topics[0] === topicId);
  console.log(`${prefix}: created log`, profileCreatedLog);

  let profileCreatedEventLog = profileCreatedLog!.topics;
  console.log(`${prefix}: created event logs`, profileCreatedEventLog);

  const publicationId = utils.defaultAbiCoder.decode(
    ['uint256'],
    profileCreatedEventLog[2]
  )[0];

  const contractPublicationId = BigNumber.from(publicationId).toHexString();
  const internalPublicationId = profileId + '-' + contractPublicationId;

  console.log(`${prefix}: contract publication id`, contractPublicationId);
  console.log(`${prefix}: internal publication id`, internalPublicationId);
  return internalPublicationId;
};

export const DEFAULT_METADATA_ATTRIBUTES = [
  {
    traitType: 'string',
    value: 'post',
    key: 'publicationType' // ex default_key
  }
];

export const createPostPaid = async (
  profileId: string,
  builtPost: IbuiltPost,
  waitForIndexer: boolean = false
) => {
  if (!profileId) {
    throw new Error('Must define profileId');
  }

  console.log('TU NO DEBERIAS ESTAR ACA!!');
  const ipfsResult = await uploadIpfs<Metadata>({
    metadata_id: uuidv4(),
    image: builtPost.image,
    link: builtPost.link,
    imageMimeType: null,
    content: builtPost.content,
    name: builtPost.title || ' ',
    external_url: builtPost.external_url, // the list is editabl here
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
  // const postResult = {
  //   txHash: broadcastResult.txHash,
  //   txId: broadcastResult.txId,
  //   internalPubId: '',
  //   pubId: ''
  // };

  const postResult = await pollAndIndexPost(
    broadcastResult.txHash,
    profileId,
    'prefix'
  );
  console.log('resultado ', postResult);
  return postResult;
  // TODO: VERIFY THIS return profileId + '-' + BigNumber.from(publicationId).toHexString();
};

export const createPostManager = async (
  profileResult: any,
  builtPost: IbuiltPost,
  selfCollect: boolean
) => {
  // TODO test with no dispatcher
  const result = profileResult?.dispatcher?.canUseRelay
    ? await createPostGasless(profileResult.id, builtPost)
    : await createPostPaid(profileResult.id, builtPost);

  // if (selfCollect) {
  //   console.log(' Collecting post, minting... ');
  //   await freeCollect(result.internalPubId);
  //   console.log('Collecting post finished.');
  // }

  return result;
};

export const addPostIdtoListId = async (
  profileId: string,
  listId: string,
  postId: string
) => {
  //const commentList: string[] = []; // FIXME
  // console.log('profile> ', profileId);
  // console.log('listId> ', listId);
  // console.log('postId> ', postId);
  //   profile>  0x4b87
  //   post.ts?9c1d:175 listId>  0x4b87-0x0134
  //   post.ts?9c1d:176 postId>  0x4b87-0x0150

  const commentList = await getLastComment(listId); // all comments
  // @ts-ignore
  // console.log('commentList ', commentList?.metadata.tags);

  let arrPosts: any;
  // // @ts-ignore

  // commentList && arrPosts.push(commentList?.metadata.tags);
  // @ts-ignore
  if (commentList?.metadata.tags) {
    // @ts-ignore
    arrPosts = commentList?.metadata.tags;
    // console.log(
    //   'populate array con posts existentes',
    //   arrPosts,
    //   commentList?.metadata.tags
    // );
  }

  if (!arrPosts || !arrPosts.includes(postId)) {
    console.log('no previously collected, adding comment');

    if (!arrPosts) {
      arrPosts = [postId];
    } else {
      arrPosts.push(postId);
    }

    // updates the array and adds to a new comment
    // .push(postId);
    // console.log('arrPOSTS ', arrPosts);

    const attDate: MetadataAttribute = {
      value: new Date().getTime().toString(),
      displayType: MetadataDisplayType.date,
      key: 'date'
    };
    const attType: MetadataAttribute = {
      value: 'listLog', // FIXME
      displayType: MetadataDisplayType.string,
      key: 'commentType'
    };

    const commentMetadata: Metadata = {
      version: PUBLICATION_METADATA_VERSION,
      mainContentFocus: PublicationMainFocus.TEXT_ONLY,
      metadata_id: uuidv4(),
      name: 'Nata Social Content List™',
      description: 'you-are-the-owner',
      content: new Date().getTime().toString(),
      locale: 'en-US',
      // external_url: values.external_url,
      // image: values.image,
      // imageMimeType: values.imageMimeType,
      attributes: [attType, attDate],
      tags: arrPosts, // we will add here the post IDs
      appId: APP_NAME
    };

    //TODO: use with no gasless too
    const rrr = await commentGasless(profileId, listId, commentMetadata); /// this is the updated array!!!
    // console.log('comment add result:', rrr);

    // console.log(' Collecting post, minting... ');
    // await freeCollect(postId);
    // console.log('Collecting post finished.');
  } else {
    console.log('post already collected: ', postId, 'list: ', arrPosts);
    return false;
  }

  // FIXME return a better value
  // console.log('THIS IS ONLY FOR VERIFICATION: ');
  // const p = await getLastComment(listId);
  // console.log('Post (that in fact it is a list) with new comments: ', p);

  return true;

  // // TODO: get comments before!
  // const comments = await getPublication(listId);
  // console.log('LIST ID: ', listId);
  // console.log('PUBLICATION1 w comments?: ', comments);

  // await commentGasless(profileId, listId, commentMetadata);
  // const PUBLICATION2 = await getPublication(listId);
  // console.log('PUBLICATION2 with new comments: ', PUBLICATION2);

  // const p = await getPostComments(profileId, listId);
};

// export const cloneAndCollectPost = async (lensProfile: any, postId: string) => {
//   const post = await getPublication(postId);
//   if (!post) {
//     throw 'Unknown error when retrieving post data';
//   }

//   const constructedPost: IbuiltPost = {
//     attributes: DEFAULT_METADATA_ATTRIBUTES,
//     name: post.metadata.name || ' ',
//     abstract: post.metadata.description || ' ',
//     content: post.metadata.content || ' ',
//     // TODO: recover the link!!!
//     // link: link,
//     // TODO: RECOVER THIS TOO!!!
//     // cover: cover,
//     originalPostId: postId,

//     // TODO: discuss later the monetization for clones
//     // @ts-ignore
//     tags: post.metadata.tags || []
//     // TODO: GET FILTER ARRAY FROM THE UIwww
//     // title: title,
//     // todo: image?: Buffer[]
//   };

//   try {
//     const newPost = await createPostManager(lensProfile, constructedPost, true);
//     console.log('colecteado y clonado: ', newPost.internalPubId);
//     return newPost.internalPubId;
//   } catch (e) {
//     console.log('error en clonado: ', e);
//     return null;
//   }
// };
