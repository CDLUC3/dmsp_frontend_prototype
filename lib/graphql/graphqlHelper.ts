import { onError } from "@apollo/client/link/error";
import { Observable } from "@apollo/client";
import logECS from "@/utils/clientLogger";
import { RetryLink } from "@apollo/client/link/retry";
import { createAuthLink } from "@/utils/authLink";
import { navigateTo } from "@/utils/navigation";
import { fetchCsrfToken, refreshAuthTokens } from "@/utils/authHelper";

interface CustomError extends Error {
  customInfo?: { errorMessage: string }
}

export const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    const unauthenticated = graphQLErrors.find(
      ({ extensions }) => extensions?.code === 'UNAUTHENTICATED'
    );

    if (unauthenticated) {
      return new Observable(observer => {
        (async () => {
          try {
            const result = await refreshAuthTokens();

            // Check if we should redirect due to failed refresh
            if (result?.shouldRedirect) {
              observer.error(new Error('Authentication failed - redirecting to login'));
              navigateTo(result.redirectTo);
            } else if (result?.response) {
              // Token refresh succeeded, retry the operation
              forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              });
            } else {
              // Unexpected result
              logECS('error', 'Token refresh failed with unexpected result', { errorCode: 'UNAUTHENTICATED', result });
              observer.error(new Error('Token refresh failed'));
              navigateTo('/login');
            }
          } catch (error) {
            logECS('error', 'Token refresh failed', { error });
            observer.error(error);
            navigateTo('/login')
          }
        })();
      });
    }

    // FORBIDDEN
    const forbidden = graphQLErrors.find(
      ({ extensions }) => extensions?.code === 'FORBIDDEN'
    );
    if (forbidden) {
      return new Observable(observer => {
        (async () => {
          try {
            const response = await fetchCsrfToken();
            if (response) {
              forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer)
              });
            } else {
              logECS('error', 'Token refresh failed with no result', { errorCode: 'FORBIDDEN' });
              navigateTo('/login');
            }
          } catch (error) {
            logECS('error', 'Fetching csrf token failed', { error });
            navigateTo('/login');
          }
        })();
      });
    }

    // INTERNAL SERVER ERROR
    graphQLErrors.forEach(({ message, extensions }) => {
      if (extensions?.code === 'INTERNAL_SERVER_ERROR') {
        logECS('error', `[GraphQL Error]: INTERNAL_SERVER_ERROR - ${message}`, {
          errorCode: 'INTERNAL_SERVER_ERROR'
        });
        navigateTo('/500-error');
      } else {
        logECS('error', `[GraphQL Error]: ${message}`, {
          errorCode: 'GRAPHQL'
        });
      }
    });
  }

  if (networkError) {
    logECS('error', `[GraphQL Network Error]: ${networkError.message}`, { errorCode: 'NETWORK_ERROR' });
    const customNetworkError = networkError as CustomError;
    customNetworkError.customInfo = { errorMessage: 'There was a problem' };
    operation.setContext({ networkError: customNetworkError });
  }
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

