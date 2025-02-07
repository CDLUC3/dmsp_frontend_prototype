import { onError } from "@apollo/client/link/error";
import { Observable } from "@apollo/client";
import logECS from "@/utils/clientLogger";
import { RetryLink } from "@apollo/client/link/retry";
import { createAuthLink } from "@/utils/authLink";
import { fetchCsrfToken, refreshAuthTokens } from "@/utils/authHelper";
import { getApolloClient } from './apolloClient';

interface CustomError extends Error {
  customInfo?: { errorMessage: string }
}

export const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  return new Observable((observer) => {
    const handleGraphQLErrors = async () => {
      if (graphQLErrors) {
        for (const { message, extensions } of graphQLErrors) {
          switch (extensions?.code) {
            case 'UNAUTHENTICATED':
              try {
                const result = await refreshAuthTokens();
                if (result) {
                  const client = getApolloClient();
                  if (client) {
                    await client.resetStore();
                  }

                  forward(operation).subscribe({
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer)
                  });
                  return;
                } else {
                  logECS('error', 'Token refresh failed with no result', { errorCode: 'UNAUTHENTICATED' });
                  window.location.href = '/login';
                }
              } catch (error) {
                logECS('error', 'Token refresh failed', { error });
                window.location.href = '/login';
              }
              break;

            case 'FORBIDDEN':
              try {
                const response = await fetchCsrfToken();
                if (response) {
                  forward(operation).subscribe({
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer)
                  });
                  return;
                } else {
                  logECS('error', 'Token refresh failed with no result', { errorCode: 'FORBIDDEN' });
                  window.location.href = '/login';
                }
              } catch (error) {
                logECS('error', 'Fetching csrf token failed', { error });
                window.location.href = '/login';
              }
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
        }
      }
    };

    handleGraphQLErrors();

    if (networkError) {
      logECS('error', `[GraphQL Network Error]: ${networkError.message}`, { errorCode: 'NETWORK_ERROR' });
      const customNetworkError = networkError as CustomError;
      customNetworkError.customInfo = { errorMessage: 'There was a problem' };
      operation.setContext({ networkError: customNetworkError });
    }

    forward(operation).subscribe({
      next: observer.next.bind(observer),
      error: observer.error.bind(observer),
      complete: observer.complete.bind(observer)
    });
  });
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
