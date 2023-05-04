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
  return getAddressFromSigner()
    .then((address) => {
      console.log('delete publication: address', address);
    })
    .then(() => deletePublicationRequest({ publicationId }))
    .then(() => true)
    .catch((err) => {
      console.log("Error removing post: ", err)
      return false
     });
};
