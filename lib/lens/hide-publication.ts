import {
  HidePublicationDocument,
  HidePublicationRequest
} from './graphql/generated';

import { apolloClient } from '@lib/lens/graphql/apollo-client';
import { getAddressFromSigner } from './ethers.service';

const deletePublicationRequest = async (request: HidePublicationRequest) => {
  const result = await apolloClient.mutate({
    mutation: HidePublicationDocument,
    variables: {
      request
    }
  });

  return result.data!.hidePublication;
};

export const hidePublication = async (publicationId: string) => {
  const address = getAddressFromSigner();
  console.log('delete publication: address', address);

  await deletePublicationRequest({ publicationId });

  console.log('delete publication: success');
};
