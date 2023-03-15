import {
  PublicationTypes,
  PublicationsDocument,
  PublicationsQueryRequest
} from '@lib/lens/graphql/generated';

import { apolloClient } from '@lib/lens/graphql/apollo-client';

const getPublicationsRequest = async (request: PublicationsQueryRequest) => {
  const result = await apolloClient.query({
    query: PublicationsDocument,
    variables: {
      request
    }
  });
  console.log('RRR ', result);
  return result.data.publications;
};

export const getPostComments = async (profileId: string, postId: string) => {
  if (!profileId) {
    throw new Error('Must define PROFILE_ID in the .env to run this');
  }
  console.log(postId);
  const result = await getPublicationsRequest({
    profileId: '0x4b87',
    publicationTypes: [PublicationTypes.Comment]
    // commentsOf: postId
    // publicationIds: ['0x4b87-0x69'] // FIXME test later if it doesnt work

    // [PublicationTypes.Post, PublicationTypes.Comment, PublicationTypes.Mirror],
  });
  console.log('post comments: ', result.items);

  return result;
};
