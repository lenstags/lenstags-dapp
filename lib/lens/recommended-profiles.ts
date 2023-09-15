import { RecommendedProfilesDocument } from './graphql/generated';
import { apolloClient } from './graphql/apollo-client';
import { shuffleArray } from 'utils/helpers';

const getRecommendedProfilesRequest = async () => {
  const result = await apolloClient.query({
    query: RecommendedProfilesDocument,
    variables: {
      options: {
        // disableML: true,
        shuffle: true // this does not work!
      }
    }
  });

  return result.data.recommendedProfiles;
};

export const recommendedProfiles = async () => {
  // const address = getAddressFromSigner();

  // only showing one example to query but you can see from request
  // above you can query many
  const result = await getRecommendedProfilesRequest();
  const randomizedArray = shuffleArray(result);
  const firstFiveElements = randomizedArray.slice(0, 5);

  return firstFiveElements;
};
