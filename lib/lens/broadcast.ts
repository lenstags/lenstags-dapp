import { BroadcastDocument, BroadcastRequest } from './graphql/generated';

import { apolloClient } from './graphql/apollo-client';

export const broadcastRequest = async (request: BroadcastRequest) => {
  const result = await apolloClient.mutate({
    mutation: BroadcastDocument,
    variables: {
      request
    }
  });

  return result.data!.broadcast;
};
