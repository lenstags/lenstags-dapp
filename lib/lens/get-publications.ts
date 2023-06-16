import {
  PublicationTypes,
  PublicationsDocument,
  PublicationsQueryRequest
} from '@lib/lens/graphql/generated';

import { APP_NAME } from '@lib/config';
import { apolloClient } from '@lib/lens/graphql/apollo-client';

const getPublicationsRequest = async (request: PublicationsQueryRequest) => {
  const result = await apolloClient.query({
    query: PublicationsDocument,
    variables: {
      request
    }
  });
  return result.data.publications;
};

export const getLastComment = async (postId: string) => {
  const result = await getPublicationsRequest({
    commentsOf: postId
  });
  // const p = await getPublication(postId);
  // console.log(p);
  // const result = await getPublicationsRequest({
  //   // profileId: '0x4b87',
  //   publicationTypes: [PublicationTypes.Comment],
  //   commentsOf: '0x4b87-0x0130'
  //   // publicationIds: [postId] // ['0x4b87-0x69'] // FIXME test later if it doesnt work
  //   // [PublicationTypes.Post, PublicationTypes.Comment, PublicationTypes.Mirror],
  // });

  // console.log(
  //   'post comments de ',
  //   postId,
  //   ': ',
  //   result.items.filter((i) => i.__typename === 'Comment')
  // );

  // console.log('resulttt: ', result, result.items.length);
  return result.items.length > 0 ? result.items[0] : null;
};

export const getComments = async (postId: string) => {
  const result = await getPublicationsRequest({
    commentsOf: postId,
    sources: [APP_NAME]
  });
  // const p = await getPublication(postId);
  // console.log(p);
  // const result = await getPublicationsRequest({
  //   // profileId: '0x4b87',
  //   publicationTypes: [PublicationTypes.Comment],
  //   commentsOf: '0x4b87-0x0130'
  //   // publicationIds: [postId] // ['0x4b87-0x69'] // FIXME test later if it doesnt work
  //   // [PublicationTypes.Post, PublicationTypes.Comment, PublicationTypes.Mirror],
  // });

  // console.log(
  //   'post comments de ',
  //   postId,
  //   ': ',
  //   result.items.filter((i) => i.__typename === 'Comment')
  // );

  // console.log('resulttt: ', result, result.items.length);
  return result.items;
};

export const getPublications = async (
  publicationTypes: PublicationTypes[],
  profileId?: string,
  collectedBy?: string
) => {
  const req = {
    sources: [APP_NAME],
    publicationTypes,
    profileId,
    collectedBy
  };
  const result = await getPublicationsRequest(req);
  return result;
};

export const getPostsCommentsxxxx = async (postIds: string[]) => {
  const result = await getPublicationsRequest({
    commentsOf: postIds
  });

  // const p = await getPublication(postId);
  // console.log(p);
  // const result = await getPublicationsRequest({
  //   // profileId: '0x4b87',
  //   publicationTypes: [PublicationTypes.Comment],
  //   commentsOf: '0x4b87-0x0130'
  //   // publicationIds: [postId] // ['0x4b87-0x69'] // FIXME test later if it doesnt work
  //   // [PublicationTypes.Post, PublicationTypes.Comment, PublicationTypes.Mirror],
  // });

  console.log('resultazo ', result);
  console.log(
    'post comments de ',
    postIds,
    ': ',
    result.items.filter((i) => i.__typename === 'Comment')
  );

  return result;
};

// export const getPostsComments = async (postIds: string[]) => {
//   const result = await getPublicationsRequest({
//     // commentsOf: postIds,
//     publicationIds: postIds
//     // publicationTypes: [PublicationTypes.Comment]
//   });

//   // const p = await getPublication(postId);
//   // console.log(p);
//   // const result = await getPublicationsRequest({
//   //   // profileId: '0x4b87',
//   //   publicationTypes: [PublicationTypes.Comment],
//   //   commentsOf: '0x4b87-0x0130'
//   //   // publicationIds: [postId] // ['0x4b87-0x69'] // FIXME test later if it doesnt work
//   //   // [PublicationTypes.Post, PublicationTypes.Comment, PublicationTypes.Mirror],
//   // });

//   // console.log('resultazo ', result);
//   console.log(
//     'post comments de ',
//     postIds,
//     ': ',
//     result.items.filter((i) => i.__typename === 'Comment')
//   );

//   return result;
// };
