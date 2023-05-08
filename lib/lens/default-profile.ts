import { apolloClient } from './graphql/apollo-client';
import {
  DefaultProfileDocument,
  DefaultProfileRequest
} from './graphql/generated';

const getDefaultProfileRequest = async (request: DefaultProfileRequest) => {
  const result = await apolloClient.query({
    query: DefaultProfileDocument,
    variables: {
      request
    }
  });
  console.log('defaultProfile ', result);
  return result.data.defaultProfile;
};

export const getDefaultProfile = async (address: string) => {
  const result = await getDefaultProfileRequest({ ethereumAddress: address });

  return result;
};
