import {
  SearchProfilesDocument,
  SearchRequestTypes,
  SearchQueryRequest
} from './generated';

import { apolloClient } from './apollo-client';

const searchProfiles = (request: SearchQueryRequest) => {
  return apolloClient.query({
    query: SearchProfilesDocument,
    variables: {
      request
    }
  });
};

export const reqSearchQuery: SearchQueryRequest = {
  query: '',
  type: SearchRequestTypes.Profile,
  limit: 10
};

export const search = async (input: string) => {
  reqSearchQuery.query = input;

  const result = await searchProfiles(reqSearchQuery);
  return result.data.search;
};
