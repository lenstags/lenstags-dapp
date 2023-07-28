import { apolloClient } from './graphql/apollo-client';
import {
    FollowersDocument,
    FollowersRequest,
    FollowersQuery
} from './graphql/generated';


const followersRequest = async (request: FollowersRequest) => {
    const result = await apolloClient.query({
        query: FollowersDocument,
        variables: {
            request,
        },
    });

    return result.data.followers;
};

export const followers = async (profileId: string) => {
    if (!profileId) {
        throw new Error('Must define PROFILE_ID in the .env to run this');
    }

    const result: FollowersQuery['followers'] = await followersRequest({ profileId });

    return result;
};