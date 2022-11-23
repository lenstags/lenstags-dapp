import { LENSTAGS_SOURCE } from "./constants";
import { apolloClient } from "./graphql/apollo-client";
import {
  CustomFiltersTypes,
  ExplorePublicationRequest,
  ExplorePublicationsDocument,
  PublicationSortCriteria,
  PublicationTypes,
} from "./graphql/generated";

const explorePublications = (request: ExplorePublicationRequest) => {
  return apolloClient.query({
    query: ExplorePublicationsDocument,
    variables: {
      request,
    },
  });
};

export interface IExplorePublications {
  tags?: string[];
}

export const explore = async (filter?: IExplorePublications) => {
  const reqQuery: ExplorePublicationRequest = {
    sortCriteria: PublicationSortCriteria.Latest,
    sources: [LENSTAGS_SOURCE],
    publicationTypes: [PublicationTypes.Post],
    customFilters: [CustomFiltersTypes.Gardeners],
  };

  console.log(filter?.tags);
  if (filter?.tags) {
    reqQuery.metadata = {
      tags: { oneOf: filter.tags },
    };
  }

  const result = await explorePublications(reqQuery);

  return result.data.explorePublications;
};
