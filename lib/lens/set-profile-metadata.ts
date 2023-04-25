import {
  CreatePublicSetProfileMetadataUriRequest,
  CreateSetProfileMetadataTypedDataDocument
} from '@lib/lens/graphql/generated';
// import { login } from '../authentication/login';
// import { explicitStart, PROFILE_ID } from '../config';
import {
  getAddressFromSigner,
  signedTypeData,
  splitSignature
} from '@lib/lens/ethers.service';

import { ProfileMetadata } from '@lib/lens/interfaces/profile-metadata';
import { apolloClient } from '@lib/lens/graphql/apollo-client';
// import { lensPeriphery } from '../lens-hub';
import { getLensPeriphery } from '@lib/lens/lens-hub';
import { pollUntilIndexed } from '@lib/lens/graphql/has-transaction-been-indexed';
import { uploadIpfs } from '@lib/lens/ipfs';
import { v4 as uuidv4 } from 'uuid';

export const createSetProfileMetadataTypedData = async (
  request: CreatePublicSetProfileMetadataUriRequest
) => {
  const result = await apolloClient.mutate({
    mutation: CreateSetProfileMetadataTypedDataDocument,
    variables: {
      request
    }
  });

  return result.data!.createSetProfileMetadataTypedData;
};

export const signCreateSetProfileMetadataTypedData = async (
  request: CreatePublicSetProfileMetadataUriRequest
) => {
  const result = await createSetProfileMetadataTypedData(request);
  console.log('create profile metadata: ', result);

  const typedData = result.typedData;
  console.log('create profile metadata: typedData', typedData);

  const signature = await signedTypeData(
    typedData.domain,
    typedData.types as any,
    typedData.value
  );
  console.log('create profile metadata: signature', signature);

  return { result, signature };
};

// const setProfileMetadata = async () => {
//   const profileId = PROFILE_ID;
//   if (!profileId) {
//     throw new Error('Must define PROFILE_ID in the .env to run this');
//   }

//   const address = getAddressFromSigner();
//   console.log('create profile metadata: address', address);

//   //   await login(address);

//   const ipfsResult = await uploadIpfs<ProfileMetadata>({
//     name: 'LensProtocol.eth',
//     bio: 'A permissionless, composable, & decentralized social graph that makes building a Web3 social platform easy.',
//     cover_picture:
//       'https://pbs.twimg.com/profile_banners/1478109975406858245/1645016027/1500x500',
//     attributes: [
//       {
//         traitType: 'string',
//         value: 'yes this is custom',
//         key: 'custom_field'
//       }
//     ],
//     version: '2.0.0',
//     metadata_id: uuidv4()
//   });
//   console.log('create profile metadata: ipfs result', ipfsResult);

//   // hard coded to make the code example clear
//   const createProfileMetadataRequest = {
//     profileId,
//     metadata: `ipfs://${ipfsResult.path}`
//   };

//   const signedResult = await signCreateSetProfileMetadataTypedData(
//     createProfileMetadataRequest
//   );
//   console.log('create comment: signedResult', signedResult);

//   const typedData = signedResult.result.typedData;

//   const { v, r, s } = splitSignature(signedResult.signature);

//   const tx = await getLensPeriphery().setProfileMetadataURIWithSig({
//     profileId: createProfileMetadataRequest.profileId,
//     metadata: createProfileMetadataRequest.metadata,
//     sig: {
//       v,
//       r,
//       s,
//       deadline: typedData.value.deadline
//     }
//   });
//   console.log('create profile metadata: tx hash', tx.hash);

//   console.log('create profile metadata: poll until indexed');
//   throw 'aca';
//   const indexedResult = await pollUntilIndexed({ txHash: tx.hash });

//   console.log('create profile metadata: profile has been indexed');

//   const logs = indexedResult.txReceipt!.logs;

//   console.log('create profile metadata: logs', logs);
// };
