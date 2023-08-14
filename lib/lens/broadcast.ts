import { BroadcastDocument, BroadcastRequest } from './graphql/generated';

import { apolloClient } from './graphql/apollo-client';

export const broadcastRequest = async (request: BroadcastRequest) => {
  try {
    const result = await apolloClient.mutate({
      mutation: BroadcastDocument,
      variables: {
        request
      }
    });
    console.log('Broadcast Result: ', result);
    return result.data!.broadcast;
  } catch (err) {
    console.log('Error during broadcast: ', err);
  }
};
