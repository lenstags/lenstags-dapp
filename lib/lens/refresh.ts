import { apolloClient } from "./graphql/apollo-client";
import { RefreshDocument, RefreshRequest } from "./graphql/generated";

const refreshAuth = async (request: RefreshRequest) => {
  const result = await apolloClient.mutate({
    mutation: RefreshDocument,
    variables: {
      request,
    },
  });

  return result.data!.refresh;
};

export const refresh = async (refreshToken: string) => {
  const refreshResult = await refreshAuth({
    refreshToken,
  });

  return refreshResult;
};
