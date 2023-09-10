import {
  CustomFiltersTypes,
  ExplorePublicationRequest,
  ExplorePublicationsDocument,
  PublicationContentWarning,
  PublicationSortCriteria,
  PublicationTypes
} from './graphql/generated';

import { LENSTAGS_SOURCE } from '@lib/config';
import { apolloClient } from './graphql/apollo-client';
import { getPublicationsFollowing } from './get-publications';

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
  limit: 30,
  publicationTypes: [PublicationTypes.Post],
  customFilters: [CustomFiltersTypes.Gardeners]
};

export const explore = async (
  filter?: IExplorePublications,
  isExplore: boolean = false,
  profileId?: string
) => {
  // TODO REMOVE TAG PRIVATEPUB
  if (filter?.tags) {
    reqQuery.metadata = {
      locale: filter.locale,
      tags: { oneOf: filter.tags },
      contentWarning: {
        includeOneOf: [
          PublicationContentWarning.Nsfw,
          PublicationContentWarning.Sensitive,
          PublicationContentWarning.Sensitive
        ]
      }
    };
  }

  if (isExplore) {
    if (!profileId) {
      throw 'Missing my profileId';
    }
    console.log('---inicio ', new Date());
    // const ss = await getPublicationsFollowing(
    //   [PublicationTypes.Post],
    //   address,
    //   reqQuery.metadata
    // );

    const ss = await getPublicationsFollowing(profileId, reqQuery.metadata);

    console.log('fin ', ss);
    return ss;
  }

  const result = await explorePublications(reqQuery);
  return result.data?.explorePublications;
};
