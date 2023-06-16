import { DoesFollowDocument, DoesFollowRequest } from './graphql/generated';

import { apolloClient } from './graphql/apollo-client';

const doesFollowRequest = async (request: DoesFollowRequest) => {
  const result = await apolloClient.query({
    query: DoesFollowDocument,
    variables: {
      request
    }
  });

  return result.data.doesFollow;
};

export const doesFollow = async (
  profileId: string,
  followerAddress: string
) => {
  const followInfos = [
    {
      followerAddress,
      profileId
    }
  ];

  const result = await doesFollowRequest({ followInfos });

  return result[0];
};
