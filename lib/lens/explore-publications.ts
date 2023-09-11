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

export const explore = async (filter?: IExplorePublications) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(today.getDate() - 30);

  // TODO REMOVE TAG PRIVATEPUB
  if (filter?.tags) {
    reqQuery.metadata = {
      locale: filter.locale,
      tags: { oneOf: filter.tags }
    };
  }

  reqQuery.sortCriteria = filter?.sortingValues.sort!;

  const result = await explorePublications(reqQuery);
  const resultObject = result.data?.explorePublications;
  const publications = resultObject.items;
  let filteredItems = [];
  let sortedItems = [];
  let newResultObject = {};

  switch (filter?.filterValue) {
    case 'LISTS':
      filteredItems = publications.filter(
        (publication: any) =>
          publication.metadata.attributes[0].value === 'list'
      );
      break;
    case 'POSTS':
      filteredItems = publications.filter(
        (publication: any) =>
          publication.metadata.attributes[0].value === 'post'
      );
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
      break;
    default:
      newResultObject = {
        ...resultObject,
        items: filteredItems
      };
  }

  return newResultObject as typeof resultObject;
};
