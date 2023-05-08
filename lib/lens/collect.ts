import {
  ProxyActionDocument,
  ProxyActionRequest,
  ProxyActionStatusDocument,
  ProxyActionStatusTypes
} from '@lib/lens/graphql/generated';

import { apolloClient } from '@lib/lens/graphql/apollo-client';
import { sleep } from '../helpers';

// import { proxyActionStatusRequest } from './proxy-action-status';
const proxyActionStatusRequest = async (proxyActionId: string) => {
  const result = await apolloClient.query({
    query: ProxyActionStatusDocument,
    variables: {
      proxyActionId
    }
  });

  return result.data.proxyActionStatus;
};

const proxyActionFreeCollectRequest = async (request: ProxyActionRequest) => {
  try {
    const result = await apolloClient.query({
      query: ProxyActionDocument,
      variables: {
        request
      }
    });

    return result; //.data.proxyAction as string;
  } catch (err) {
    console.log('Error! ', err);
    return err;
  }
};

export const freeCollect = async (postId: string) => {
  const result: any = await proxyActionFreeCollectRequest({
    collect: {
      freeCollect: {
        publicationId: postId
      }
    }
  });

  if (result.data) {
    while (true) {
      const statusResult = await proxyActionStatusRequest(
        result.data.proxyAction
      );
      console.log('Minting...', statusResult);
      if (statusResult.__typename === 'ProxyActionStatusResult') {
        if (statusResult.status === ProxyActionStatusTypes.Complete) {
          console.log('Minting complete.', statusResult);
          break;
        }
      }
      if (statusResult.__typename === 'ProxyActionError') {
        console.log('Minting failed! ', statusResult);
        return statusResult; // TODO verify
      }
      await sleep(1000);
    }

    // return result.data.proxyAction;
  }
  return result; //.errors;
};
