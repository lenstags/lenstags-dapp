import { apolloClient } from './graphql/apollo-client';
import {
  ExploreProfilesDocument,
  ExploreProfilesRequest,
  ProfileSortCriteria
} from './graphql/generated';

// sort out types by generating them!
const exploreProfiles = async (request: ExploreProfilesRequest) => {
  const result = await apolloClient.query({
    query: ExploreProfilesDocument,
    variables: {
      request
    }
  });

  return result.data.exploreProfiles;
};

// CreatedOn = 'CREATED_ON',
// LatestCreated = 'LATEST_CREATED',
// MostCollects = 'MOST_COLLECTS',
// MostComments = 'MOST_COMMENTS',
// MostFollowers = 'MOST_FOLLOWERS',
// MostMirrors = 'MOST_MIRRORS',
// MostPosts = 'MOST_POSTS',
// MostPublication = 'MOST_PUBLICATION'

export const getExploreProfiles = async (myProfileId?: string) => {
  const result = await exploreProfiles({
    sortCriteria: ProfileSortCriteria.MostFollowers
  });
  console.log('rrrr ', result);
  let filteredResult;
  if (myProfileId) {
    filteredResult = result.items.filter((p) => p.isFollowedByMe === false);
  } else {
    filteredResult = result.items;
  }

  return filteredResult;
};
