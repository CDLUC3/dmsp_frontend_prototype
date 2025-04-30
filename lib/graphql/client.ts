import { ApolloClient, createHttpLink, InMemoryCache, from } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";
import { onError } from '@apollo/client/link/error';
import { createAuthLink } from '@/utils/authLink';


const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT
});

const authLink = createAuthLink();

interface CustomError extends Error {
    customInfo?: { customMessage: string }
}

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions }) => {
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
        })
    }

    if (networkError) {
        const customNetworkError = networkError as CustomError;

        customNetworkError.customInfo = { customMessage: 'There was a problem ' };
        operation.setContext({ networkError: customNetworkError });
    }
});


export const { getClient } = registerApolloClient(() => {
    return new ApolloClient({
        link: from([errorLink, authLink, httpLink]),
        cache: new InMemoryCache(),
    });
});