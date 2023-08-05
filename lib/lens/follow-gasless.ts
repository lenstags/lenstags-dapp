import {
  ProxyActionDocument,
  ProxyActionRequest,
  ProxyActionStatusTypes
} from './graphql/generated';
import {
  getAddressFromSigner,
  signedTypeData,
  splitSignature
} from './ethers.service';

import { apolloClient } from './graphql/apollo-client';
import { broadcastRequest } from './broadcast';
import { createFollowTypedData } from '../lens/follow';
import { lensHub } from './lens-hub';
import { pollUntilIndexed } from '@lib/lens/graphql/has-transaction-been-indexed';
import { proxyActionStatusRequest } from '@lib/lens/proxy-action-status';
import { sleep } from '../../utils/helpers';

const proxyActionFreeFollowRequest = async (request: ProxyActionRequest) => {
  const result = await apolloClient.query({
    query: ProxyActionDocument,
    variables: {
      request
    }
  });

  return result.data.proxyAction;
};

export const proxyActionFreeFollow = async (profileId: string) => {
  const address = getAddressFromSigner();
  console.log('proxy action free follow: address', address);

  const result = await proxyActionFreeFollowRequest({
    follow: {
      freeFollow: {
        profileId
      }
    }
  });
  console.log('proxy action free follow: result', result);
  return result;

  // while (true) {
  //   const statusResult = await proxyActionStatusRequest(result);
  //   console.log('proxy action free follow: status', statusResult);
  //   if (statusResult.__typename === 'ProxyActionStatusResult') {
  //     if (statusResult.status === ProxyActionStatusTypes.Complete) {
  //       console.log('proxy action free follow: complete', statusResult);
  //       break;
  //     }
  //   }
  //   if (statusResult.__typename === 'ProxyActionError') {
  //     console.log('proxy action free follow: failed', statusResult);
  //     break;
  //   }
  //   await sleep(1000);
  // }
};

// deprecated
export const followGaslessSignOnly = async (profileId: string) => {
  const address = getAddressFromSigner();
  console.log('follow with broadcast: address', address);

  const result = await createFollowTypedData({
    follow: [
      {
        profile: profileId
      }
    ]
  });
  console.log('follow with broadcast: result', result);

  const typedData = result.typedData;
  console.log('follow with broadcast: typedData', typedData);

  const signature = await signedTypeData(
    typedData.domain,
    typedData.types as any,
    typedData.value
  );
  console.log('follow with broadcast: signature', signature);

  const broadcastResult = await broadcastRequest({
    id: result.id,
    signature
  });
  console.log('follow with broadcast: broadcastResult', broadcastResult);
  if (broadcastResult.__typename !== 'RelayerResult') {
    console.error('follow with broadcast: failed', broadcastResult);
    throw new Error('follow with broadcast: failed');
    // return false;
  }

  console.log('follow with broadcast: poll until indexed');
  const indexedResult = await pollUntilIndexed(broadcastResult.txHash);

  console.log('follow with broadcast: has been indexed', result);

  const logs = indexedResult!.txReceipt!.logs;

  console.log('follow with broadcast: logs', logs);
  return true;
};

export const followwithgas = async (profileId: string) => {
  const address = await getAddressFromSigner();
  console.log('follow: address', address);

  const result = await createFollowTypedData({
    follow: [
      {
        profile: profileId
      }
    ]
  });
  console.log('follow: result', result);

  const typedData = result.typedData;
  console.log('follow: typedData', typedData);

  const signature = await signedTypeData(
    typedData.domain,
    typedData.types as any,
    typedData.value
  );
  console.log('follow: signature', signature);

  if (!signature) {
    return;
  }
  const { v, r, s } = splitSignature(signature);

  const tx = await lensHub.followWithSig({
    follower: getAddressFromSigner(),
    profileIds: typedData.value.profileIds,
    datas: typedData.value.datas,
    sig: {
      v,
      r,
      s,
      deadline: typedData.value.deadline
    }
  });
  console.log('follow: tx hash', tx.hash);
  return tx.hash;
};
