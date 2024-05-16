import { ApolloClient, createHttpLink, InMemoryCache, from } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
    uri: "http://localhost:4000/"
});

interface CustomError extends Error {
    customInfo?: Record<string, any>;
}

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions, locations, path }) => {
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
        link: from([errorLink, httpLink]),
        cache: new InMemoryCache(),
    });
});