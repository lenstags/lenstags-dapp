import { BigNumber, utils } from 'ethers';
import {
  CreatePostTypedDataDocument,
  CreatePublicPostRequest
} from './graphql/generated';

import { apolloClient } from './graphql/apollo-client';
import { signedTypeData } from './ethers.service';

export const createPostTypedData = async (request: CreatePublicPostRequest) => {
  const result = await apolloClient.mutate({
    mutation: CreatePostTypedDataDocument,
    variables: {
      request
    }
  });

  return result.data!.createPostTypedData;
};

export const signCreatePostTypedData = async (
  request: CreatePublicPostRequest
) => {
  const result = await createPostTypedData(request);
  console.log('create post: createPostTypedData', result);

  const typedData = result.typedData;
  console.log('create post: typedData', typedData);

  const signature = await signedTypeData(
    typedData.domain,
    typedData.types as any,
    typedData.value
  );
  console.log('create post: signature', signature);

  return { result, signature };
};
