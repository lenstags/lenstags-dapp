import {
  ApolloClient,
  ApolloLink,
  DefaultOptions,
  from,
  HttpLink,
  InMemoryCache
} from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { getFromLocalStorage } from '../localStorage';

const API_URL = 'https://api-mumbai.lens.dev';
let authenticationToken: string | null = null;

const defaultOptions: DefaultOptions = {
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
  uri: API_URL,
  fetch
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
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
