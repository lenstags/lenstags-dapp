import {
  CustomFiltersTypes,
  ExplorePublicationRequest,
  ExplorePublicationsDocument,
  PublicationSortCriteria,
  PublicationTypes
} from './graphql/generated';

import { LENSTAGS_SOURCE } from '@lib/config';
import { apolloClient } from './graphql/apollo-client';
import { Filter, SortingValuesType } from '@components/SortFilterControls';
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
  sortingValues: SortingValuesType;
  filterValue: Filter;
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(today.getDate() - 30);

  if (filter?.filterValue !== 'ALL' || filter?.sortingValues.date !== 'all') {
    reqQuery.limit = 50;
  }

  // TODO REMOVE TAG PRIVATEPUB
  if (filter?.tags) {
    reqQuery.metadata = {
      locale: filter.locale,
      tags: { oneOf: filter.tags }
      // contentWarning: {
      //   includeOneOf: [
      //     PublicationContentWarning.Nsfw,
      //     PublicationContentWarning.Sensitive,
      //     PublicationContentWarning.Spoiler
      //   ]
      // }
    };
  }

  reqQuery.sortCriteria =
    filter?.sortingValues.sort ?? PublicationSortCriteria.Latest;
  if (isExplore) {
    if (!profileId) {
      throw 'Missing my profileId';
    }

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
  const resultObject = result.data?.explorePublications;
  const publications = resultObject.items;
  let filteredItems = [];
  let sortedItems = [];
  let newResultObject = {};
  let isFiltered = false;

  switch (filter?.filterValue) {
    case 'LISTS':
      filteredItems = publications.filter(
        (publication: any) =>
          publication.metadata.attributes[0].value === 'list'
      );
      isFiltered = true;
      break;
    case 'POSTS':
      filteredItems = publications.filter(
        (publication: any) =>
          publication.metadata.attributes[0].value === 'post'
      );
      isFiltered = true;
      break;
    default:
      filteredItems = publications;
  }

  switch (filter?.sortingValues.date) {
    case 'today':
      sortedItems = filteredItems.filter((publication: any) => {
        const date = new Date(publication.createdAt);
        date.setHours(0, 0, 0, 0);
        return date >= today;
      });
      newResultObject = {
        ...resultObject,
        items: sortedItems
      };
      isFiltered = true;
      break;
    case 'lastWeek':
      sortedItems = filteredItems.filter((publication: any) => {
        const date = new Date(publication.createdAt);
        date.setHours(0, 0, 0, 0);
        return date >= lastWeek;
      });
      newResultObject = {
        ...resultObject,
        items: sortedItems
      };
      isFiltered = true;
      break;
    case 'lastMonth':
      sortedItems = filteredItems.filter((publication: any) => {
        const date = new Date(publication.createdAt);
        date.setHours(0, 0, 0, 0);
        return date >= lastMonth;
      });
      newResultObject = {
        ...resultObject,
        items: sortedItems
      };
      isFiltered = true;
      break;
    default:
      newResultObject = {
        ...resultObject,
        items: filteredItems
      };
  }

  if (isFiltered) {
    newResultObject = {
      ...newResultObject,
      pageInfo: {
        next: null
      }
    };
  }

  return newResultObject as typeof resultObject;
};
