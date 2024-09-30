import { fromPromise } from "@apollo/client/link/utils";
import { onError } from "@apollo/client/link/error";
import { redirect } from "next/navigation";
import logECS from "@/utils/clientLogger";
import { fetchCsrfToken } from "@/utils/authHelper";
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
        case 'UNAUTHORIZED':
          logECS('error', `[GraphQL Error]:  - ${message}`, {
            errorCode: 'UNAUTHORIZED'
          });

          redirect('/login');
          break;
        case 'FORBIDDEN':
          logECS('error', `[GraphQL Error]: FORBIDDEN - ${message}`, {
            errorCode: 'FORBIDDEN'
          });

          return fromPromise(
            fetchCsrfToken()
              .then((response) => {
                if (response) {
                  if (message === 'ok') {
                    // Retry the operation after fetching a new csrf token
                    return forward(operation);
                  }
                } else {
                  logECS('error', 'Forbidden - Error fetching CSRF token', {
                    source: 'apollo-client'
                  });
                  //Redirect to dashboard
                  redirect('/');
                }
              })
              .catch(error => {
                logECS('error', 'Fetching csrf token failed', { error });
                // Optionally redirect to login or show error
                return null; // Stop the retry if token refresh fails
              })
          );
        case 'INTERNAL_SERVER_ERROR':
          logECS('error', `[GraphQL Error]: INTERNAL_SERVER_ERROR - ${message}`, {
            errorCode: 'INTERNAL_SERVER_ERROR'
          });
          redirect('/500-error');
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