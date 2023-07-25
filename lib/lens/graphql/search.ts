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
  type: SearchRequestTypes.Profile
};

export const reqSearchPublicationsQuery: SearchQueryRequest = {
  query: '',
  type: SearchRequestTypes.Publication,
  sources: [LENSTAGS_SOURCE],
  customFilters: [CustomFiltersTypes.Gardeners]
};

export const search = async (input: string, limit: number) => {
  reqSearchProfilesQuery.query = input;
  reqSearchPublicationsQuery.query = input;
  reqSearchProfilesQuery.limit = limit;
  reqSearchPublicationsQuery.limit = limit;

  const profilesResult = await searchProfiles(reqSearchProfilesQuery);
  const publicationsResult = await searchPublications(
    reqSearchPublicationsQuery
  );

  return {
    profilesData: profilesResult.data.search,
    publicationsData: publicationsResult.data.search
  };
};
