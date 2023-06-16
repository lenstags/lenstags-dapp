import { ProxyActionStatusDocument } from './graphql/generated';
import { apolloClient } from './graphql/apollo-client';

export const proxyActionStatusRequest = async (proxyActionId: string) => {
  const result = await apolloClient.query({
    query: ProxyActionStatusDocument,
    variables: {
      proxyActionId
    }
  });

  return result.data.proxyActionStatus;
};
