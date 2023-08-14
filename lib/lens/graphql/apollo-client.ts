import {
  ApolloClient,
  ApolloLink,
  DefaultOptions,
  HttpLink,
  InMemoryCache,
  from
} from '@apollo/client/core';

import { LENS_API } from '@lib/config';
import { getFromLocalStorage } from '../localStorage';
import { onError } from '@apollo/client/link/error';

let authenticationToken: string | null = null;

export const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore'
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all'
  }
};

export const setAuthenticationToken = (token: string | null) => {
  authenticationToken = token;
};

export const getAuthenticationToken = () => {
  if (authenticationToken) {
    return authenticationToken;
  }
  const localStorageProfile = getFromLocalStorage();
  return localStorageProfile?.accessToken;
};

const httpLink = new HttpLink({
  uri: LENS_API,
  fetch
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  try {
    if (graphQLErrors) {
      console.log('DETECTION: ', graphQLErrors);
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    }

    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  } catch (err) {
    console.log('Err ', err);
  }
});

const authLink = new ApolloLink((operation, forward) => {
  const token = getAuthenticationToken();

  operation.setContext({
    headers: {
      'x-access-token': token ? `Bearer ${token}` : ''
    }
  });

  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: defaultOptions
});
