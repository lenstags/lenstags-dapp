import {
  PublicationDocument,
  PublicationQueryRequest
} from '@lib/lens/graphql/generated';

import { apolloClient } from '@lib/lens/graphql/apollo-client';

const getPublicationRequest = async (request: PublicationQueryRequest) => {
  const result = await apolloClient.query({
    query: PublicationDocument,
    variables: {
      request
    }
  });

  return result.data.publication;
};

export const getPublication = async (publicationId: string) => {
  const result = await getPublicationRequest({ publicationId });
  return result;
};
