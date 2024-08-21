import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { redirect } from 'next/navigation'
import { createAuthLink } from '@/utils/authLink';
import logECS from '@/utils/clientLogger';

const httpLink = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/graphql`
});

const authLink = createAuthLink();

const retryLink = new RetryLink({
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

interface CustomError extends Error {
    customInfo?: { errorMessage: string }
}

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
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
                    // Rediret to dashboard
                    redirect('/');
                    break;
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
});

export const createApolloClient = () => {
    return new ApolloClient({
        link: from([errorLink, authLink, retryLink, httpLink]),
        cache: new InMemoryCache(),
    });
};

