import {
  ProfileQueryRequest,
  ProfilesDocument
} from '@lib/lens/graphql/generated';

import { apolloClient } from '@lib/lens/graphql/apollo-client';

const getProfilesRequest = async (request: ProfileQueryRequest) => {
  const result = await apolloClient.query({
    query: ProfilesDocument,
    variables: {
      request
    }
  });

  return result.data.profiles;
};

export const getProfiles = async (address: string) => {
  console.log('profiles: address', address);
  const profilesFromProfileIds = await getProfilesRequest({
    ownedBy: [address],
    limit: 10
  });

  console.log('profiles: result', profilesFromProfileIds);

  return profilesFromProfileIds;
};
