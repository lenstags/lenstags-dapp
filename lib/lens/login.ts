import { apolloClient } from './graphql/apollo-client';
import {
  AuthenticateDocument,
  ChallengeDocument,
  ChallengeRequest,
  SignedAuthChallenge
} from './graphql/generated';
import { getAddressFromSigner, signText } from './ethers.service';

export const generateChallenge = async (request: ChallengeRequest) => {
  const result = await apolloClient.query({
    query: ChallengeDocument,
    variables: {
      request
    }
  });

  return result.data.challenge;
};

export const authenticate = async (request: SignedAuthChallenge) => {
  const result = await apolloClient.mutate({
    mutation: AuthenticateDocument,
    variables: {
      request
    }
  });

  return result.data!.authenticate;
};

let authenticationToken: string | null = null;
export let setAuthenticationToken = (token: string) => {
  authenticationToken = token;
  console.log('setAuthenticationToken: token', token);
};

export let getAuthenticationToken = () => {
  return authenticationToken;
};

export const login = async (address = getAddressFromSigner()) => {
  if (getAuthenticationToken()) {
    console.log('login: already logged in');
    return;
  }

  console.log('login: address', address);

  // we request a challenge from the server
  const challengeResponse = await generateChallenge({ address });

  // sign the text with the wallet
  const signature = await signText(challengeResponse.text);

  const authenticatedResult = await authenticate({ address, signature });
  console.log('login: result', authenticatedResult);
  setAuthenticationToken(authenticatedResult.accessToken);

  return authenticatedResult;
};
