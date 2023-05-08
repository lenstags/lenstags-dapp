import { ATTRIBUTES_LIST_KEY, PROFILE_METADATA_VERSION } from '@lib/config';
import {
  AttributeData,
  ProfileMetadata
} from '@lib/lens/interfaces/profile-metadata';
import {
  CreatePublicSetProfileMetadataUriRequest,
  CreateSetProfileMetadataViaDispatcherDocument
} from '@lib/lens/graphql/generated';

import { MetadataDisplayType } from './interfaces/generic';
import { apolloClient } from '@lib/lens/graphql/apollo-client';
import { broadcastRequest } from '@lib/lens/broadcast';
import { pollUntilIndexed } from '@lib/lens/graphql/has-transaction-been-indexed';
import { queryProfile } from '@lib/lens/dispatcher';
import { signCreateSetProfileMetadataTypedData } from './set-profile-metadata';
import { uploadIpfs } from '@lib/lens/ipfs';

// import { getAddressFromSigner } from '@lib/lens/ethers.service';

const createSetProfileMetadataViaDispatcherRequest = async (
  profileRequest: CreatePublicSetProfileMetadataUriRequest
) => {
  // try {
  console.log('apolloClient ', apolloClient);
  const result = await apolloClient.mutate({
    mutation: CreateSetProfileMetadataViaDispatcherDocument,
    variables: {
      request: profileRequest
    }
  });
  return result.data!.createSetProfileMetadataViaDispatcher;
  // } catch (error) {
  //   console.log('EEEE RR ', error);
  // }
};

const setMetadata = async (
  createMetadataRequest: CreatePublicSetProfileMetadataUriRequest
) => {
  // tested but authn't
  // const address = getAddressFromSigner();
  // console.log('setMetadata: address', address);

  const profileResult = await queryProfile({
    profileId: createMetadataRequest.profileId
  });

  if (!profileResult) {
    throw new Error('Could not find profile');
  }

  // this means it they have not setup the dispatcher, if its a no you must use broadcast
  if (profileResult.dispatcher?.canUseRelay) {
    const dispatcherResult = await createSetProfileMetadataViaDispatcherRequest(
      createMetadataRequest
    );
    console.log(
      'create profile metadata via dispatcher: createPostViaDispatcherRequest',
      dispatcherResult
    );

    if (dispatcherResult.__typename !== 'RelayerResult') {
      console.error(
        'create profile metadata via dispatcher: failed',
        dispatcherResult
      );
      throw new Error('create profile metadata via dispatcher: failed');
    }

    return { txHash: dispatcherResult.txHash, txId: dispatcherResult.txId };
  } else {
    console.log('000 no relayer');
    const signedResult = await signCreateSetProfileMetadataTypedData(
      createMetadataRequest
    );
    console.log(
      'create profile metadata via broadcast: signedResult',
      signedResult
    );
    console.log('2//////////////////////////////////');

    const broadcastResult = await broadcastRequest({
      id: signedResult.result.id,
      signature: signedResult.signature
    });
    console.log('3//////////////////////////////////');

    if (broadcastResult.__typename !== 'RelayerResult') {
      console.error(
        'create profile metadata via broadcast: failed',
        broadcastResult
      );
      throw new Error('create profile metadata via broadcast: failed');
    }

    console.log(
      'create profile metadata via broadcast: broadcastResult',
      broadcastResult
    );
    return { txHash: broadcastResult.txHash, txId: broadcastResult.txId };
  }
};

export const updateProfileMetadata = async (
  profileId: string,
  profileMetadata: ProfileMetadata
) => {
  if (!profileId) {
    throw new Error('No profileId');
  }

  // const address = await getAddressFromSigner();
  // console.log('create profile: address', address);

  const ipfsResult = await uploadIpfs<ProfileMetadata>(profileMetadata);

  // console.log('create profile: ipfs result', ipfsResult);

  // hard coded to make the code example clear
  const createProfileMetadataRequest = {
    profileId,
    metadata: `ipfs://${ipfsResult.path}`
  };

  const result = await setMetadata(createProfileMetadataRequest);
  // console.log('update profile gasless', result);

  // console.log('<<<<< create profile metadata: poll until indexed');
  //   const indexedResult = await pollUntilIndexed(result.txId);
  const indexedResult = await pollUntilIndexed(result.txHash);

  console.log('Profile indexed.', result);
  const logs = indexedResult.txReceipt!.logs;
  return result;
};

// FIXME NOT IMPLEMENTED YET, UNCOMMENT AFTER FIX

// export const updateProfileAttributes = async (
//   listId: string,
//   profileId: string,
//   attributeKey: AttributeData,
//   attributeValue: any
// ) => {
//   const profileResult = await queryProfile({ profileId });
//   if (!profileResult) {
//     throw 'once again no profile result!';
//   }

//   const postIDsArray = [
//     { name: 'default', key: listId } // set on the first setup
//     // { name: 'anotherlist', key: '0x344' }
//   ];

//   // const newList =listId
//   // profileResult?.attributes?.find((attribute) => attribute.key === 'listId')?.value,

//   //   get previous objects
//   const attLists: AttributeData = {
//     displayType: MetadataDisplayType.string,
//     traitType: 'string',
//     value:
//       // profileValues.lists ||
//       // profileValues?.attributes?.find(
//       //   (attribute: AttributeData) => attribute.key === 'lists0'
//       // )?.value,
//       JSON.stringify(postIDsArray),
//     key: ATTRIBUTES_LIST_KEY
//   };

//   // find previous attribs!!!!!
//   // find previous

//   const profileMetadata: ProfileMetadata = {
//     version: PROFILE_METADATA_VERSION, // TODO: centralize this!
//     metadata_id: uuidv4(),
//     name: profileResult.name || undefined,
//     bio: profileResult.bio || 'empty bio',
//     cover_picture: 'https://picsum.photos/200/333',
//     profile_picture: 'https://picsum.photos/200/444',
//     attributes: [attLocation, attTwitter, attWebsite, attLists]
//   };

//   await updateProfileMetadata(profileId, profileMetadata);

//   console.log('SUCCESS agregado el default post al profile metadata 🟢🏆⚡︎✦');
// };
