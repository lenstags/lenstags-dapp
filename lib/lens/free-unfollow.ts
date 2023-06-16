import { getAddressFromSigner, signedTypeData } from './ethers.service';

import { broadcastRequest } from './shared-broadcast';
import { createUnfollowTypedData } from './unfollow';
import { pollUntilIndexed } from '@lib/lens/graphql/has-transaction-been-indexed';

export const freeUnfollow = async (profileId: string) => {
  const address = getAddressFromSigner();
  console.log('follow with broadcast: address', address);

  const result = await createUnfollowTypedData({
    profile: profileId
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
  }

  console.log('follow with broadcast: poll until indexed');
  const indexedResult = await pollUntilIndexed(broadcastResult.txHash);

  console.log('follow with broadcast: has been indexed', result);

  const logs = indexedResult!.txReceipt!.logs;

  console.log('follow with broadcast: logs', logs);
};
