import { onError } from "@apollo/client/link/error";
import logECS from "@/utils/clientLogger";
import { RetryLink } from "@apollo/client/link/retry";
import { createAuthLink } from "@/utils/authLink";

interface CustomError extends Error {
  customInfo?: { errorMessage: string }
}

export const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      //Check for specific error codes
      switch (extensions?.code) {
        case 'UNAUTHENTICATED':
          logECS('error', `[GraphQL Error]:  - ${message}`, {
            errorCode: 'UNAUTHENTICATED'
          });
          break;

        case 'FORBIDDEN':
          logECS('error', `[GraphQL Error]: FORBIDDEN - ${message}`, {
            errorCode: 'FORBIDDEN'
          });
          break;
        case 'INTERNAL_SERVER_ERROR':
          logECS('error', `[GraphQL Error]: INTERNAL_SERVER_ERROR - ${message}`, {
            errorCode: 'INTERNAL_SERVER_ERROR'
          });
          window.location.href = '/500-error';
          break;
        default:
          logECS('error', `[GraphQL Error]: ${message}`, {
            errorCode: 'GRAPHQL'
          });
          break;
      }
    })
  }

  if (networkError) {
    logECS('error', `[GraphQL Error Network Error]: ${networkError.message}`, {
      errorCode: 'NETWORK_ERROR'
    });
    const customNetworkError = networkError as CustomError;

    customNetworkError.customInfo = { errorMessage: 'There was a problem ' };
    operation.setContext({ networkError: customNetworkError });
  }

  return forward(operation); // Forward the operation by default
});

export const authLink = createAuthLink();

export const retryLink = new RetryLink({
  attempts: {
    max: 3, // Maximum number of retry attempts
    retryIf: (error) => {
      // Retry on network errors
      return !!error.networkError;
    }
  },
  delay: {
    initial: 1000, // Initial delay in milliseconds
    max: 5000, // Maximum delay in milliseconds
    jitter: true // Add random jitter to the delay to help spread out retry attempts and avoid potential overloading of backend system
  }
});