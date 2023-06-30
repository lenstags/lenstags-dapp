import {
  CustomFiltersTypes,
  ExplorePublicationRequest,
  ExplorePublicationsDocument,
  PublicationSortCriteria,
  PublicationTypes
} from './graphql/generated';

import { LENSTAGS_SOURCE } from '@lib/config';
import { apolloClient } from './graphql/apollo-client';

const explorePublications = (request: ExplorePublicationRequest) => {
  return apolloClient.query({
    query: ExplorePublicationsDocument,
    variables: {
      request
    }
  });
};

export interface IExplorePublications {
  locale: string;
  tags?: string[];
}

export const reqQuery: ExplorePublicationRequest = {
  sortCriteria: PublicationSortCriteria.Latest,
  noRandomize: true,
  sources: [LENSTAGS_SOURCE],
  limit: 50,
  publicationTypes: [PublicationTypes.Post],
  customFilters: [CustomFiltersTypes.Gardeners]
};

export const explore = async (filter?: IExplorePublications) => {
  // TODO REMOVE TAG PRIVATEPUB
  if (filter?.tags) {
    reqQuery.metadata = {
      locale: filter.locale,
      tags: { oneOf: filter.tags }
    };
  }

  const result = await explorePublications(reqQuery);
  return result.data.explorePublications;
};