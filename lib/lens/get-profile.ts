import {
  ProfileDocument,
  SingleProfileQueryRequest
} from '@lib/lens/graphql/generated';

import { apolloClient } from '@lib/lens/graphql/apollo-client';

const getProfileRequest = async (request: SingleProfileQueryRequest) => {
  const result = await apolloClient.query({
    query: ProfileDocument,
    variables: {
      request
    }
  });

  return result.data.profile;
};

export const profile = async (profileId: string) => {
  if (!profileId) {
    throw new Error('no profileId defined');
  }

  const request: SingleProfileQueryRequest = { profileId };

  const profile = await getProfileRequest(request);

  return profile;
};
