import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  CombinedGraphQLErrors,
  ApolloLink
} from "@apollo/client";
import { registerApolloClient } from "@apollo/client-integration-nextjs";
import { ErrorLink } from '@apollo/client/link/error';
import { createAuthLink } from '@/utils/authLink';


const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT
});

const authLink = createAuthLink();

interface CustomError extends Error {
  customInfo?: { customMessage: string }
}

const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, extensions }) => {
      //Check for specific error codes
      switch (extensions?.code) {
        case 'UNAUTHORIZED':
          console.error('Unauthorized');
          break;
        case 'FORBIDDEN':
          console.error('Forbidden');
          break;
        case 'GRAPHQL_VALIDATION_FAILED':
          extensions.customInfo = { customMessage: "There was a problem. Please try again" };
          operation.setContext({ extensions })
          break;
        case 'INTERNAL_SERVER_ERROR':

          break;
        default:
          console.error(`[GraphQL Error]: ${message}`)
          break;
      }
    });
  } else {
    // Network error or other error types
    const customError = error as CustomError;
    customError.customInfo = { customMessage: 'There was a problem' };
    operation.setContext({ networkError: customError });
    console.error(`[Network error]:`, error);
  }
});


export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });
});
