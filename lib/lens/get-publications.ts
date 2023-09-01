import {
  FeedEventItemType,
  FeedRequest,
  PaginatedFeedResult,
  ProfileFeedDocument,
  PublicationMetadataFilters,
  PublicationTypes,
  PublicationsDocument,
  PublicationsQueryRequest,
  TimelineDocument,
  TimelineQuery,
  TimelineRequest,
  TimelineType
} from '@lib/lens/graphql/generated';

import { APP_NAME } from '@lib/config';
import { apolloClient } from '@lib/lens/graphql/apollo-client';
import { followGaslessSignOnly } from './follow-gasless';
import { followers } from './followers';

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

export const getLastCommentList = async (postId: string) => {
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
  return result.items.length > 0
    ? { list: postId, items: result.items[0] }
    : null;
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

const getFeed = async (request: FeedRequest) => {
  const result = await apolloClient.query({
    query: ProfileFeedDocument,
    variables: {
      request
    }
  });
  return result.data.feed;
};

export const getPublicationsFollowing = async (
  // publicationTypes: PublicationTypes[],
  profileId: string,
  metadata?: PublicationMetadataFilters | null
) => {
  // get my follows

  const req: FeedRequest = {
    metadata,
    profileId,
    sources: [APP_NAME],
    feedEventItemTypes: [FeedEventItemType.Post]
  };
  const res = await getFeed(req);
  const newRes: PaginatedFeedResult = {
    items: res.items.map((r: any) => r.root),
    pageInfo: res.pageInfo,
    __typename: res.__typename
  };

  return newRes;

  // const res = await following(address);
  // const arrayFollowing = res.items.map((r) => r.profile.id);
  // console.log('---my following: ', arrayFollowing);
  // const req: PublicationsQueryRequest = {
  //   // customFilters
  //   metadata,
  //   profileIds: arrayFollowing,
  //   publicationTypes,
  //   sources: [APP_NAME]
  // };
  // const result = await getPublicationsRequest(req);
  // return result;
};
