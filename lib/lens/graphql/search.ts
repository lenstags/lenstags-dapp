import {
  CustomFiltersTypes,
  SearchProfilesDocument,
  SearchPublicationsDocument,
  SearchQueryRequest,
  SearchRequestTypes
} from './generated';

import { LENSTAGS_SOURCE } from '@lib/config';
import { apolloClient } from './apollo-client';

const searchProfiles = (request: SearchQueryRequest) => {
  return apolloClient.query({
    query: SearchProfilesDocument,
    variables: {
      request
    }
  });
};

const searchPublications = (request: SearchQueryRequest) => {
  return apolloClient.query({
    query: SearchPublicationsDocument,
    variables: {
      request
    }
  });
};

export const reqSearchProfilesQuery: SearchQueryRequest = {
  query: '',
  type: SearchRequestTypes.Profile,
  limit: 10
};

export const reqSearchPublicationsQuery: SearchQueryRequest = {
  query: '',
  type: SearchRequestTypes.Publication,
  limit: 10,
  sources: [LENSTAGS_SOURCE],
  customFilters: [CustomFiltersTypes.Gardeners]
};

export const search = async (input: string) => {
  reqSearchProfilesQuery.query = input;
  reqSearchPublicationsQuery.query = input;

  const profilesResult = await searchProfiles(reqSearchProfilesQuery);
  const publicationsResult = await searchPublications(
    reqSearchPublicationsQuery
  );

  return {
    profilesData: profilesResult.data.search,
    publicationsData: publicationsResult.data.search
  };
};
