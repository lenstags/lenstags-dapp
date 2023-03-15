import { apolloClient } from '@lib/lens/graphql/apollo-client';
import {
  ProxyActionDocument,
  ProxyActionRequest,
  ProxyActionStatusTypes,
  ProxyActionStatusDocument
} from '@lib/lens/graphql/generated';
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
  const result = await apolloClient.query({
    query: ProxyActionDocument,
    variables: {
      request
    }
  });
  console.log('WWWWWWWW proxyActionFreeCollectRequest result: ', result);

  return result.data.proxyAction as string;
};

export const freeCollect = async (postId: string) => {
  const result = await proxyActionFreeCollectRequest({
    collect: {
      freeCollect: {
        publicationId: postId
      }
    }
  });
  console.log(' 💌💌💌 proxy action free collect: result', result);

  while (true) {
    const statusResult = await proxyActionStatusRequest(result);
    console.log(' 💌💌💌 proxy action free collect: status', statusResult);
    if (statusResult.__typename === 'ProxyActionStatusResult') {
      if (statusResult.status === ProxyActionStatusTypes.Complete) {
        console.log(
          ' 💌💌💌 proxy action free collect: complete',
          statusResult
        );
        break;
      }
    }
    if (statusResult.__typename === 'ProxyActionError') {
      console.log(' 💌💌💌 proxy action free collect: failed', statusResult);
      break;
    }
    await sleep(1000);
  }

  return result;
};
