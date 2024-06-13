import { ApolloClient, createHttpLink, InMemoryCache, from } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { cookies } from 'next/headers';


const cookieStore = cookies();
const authToken = cookieStore.get('dmspt');

const httpLink = createHttpLink({
    uri: `${process.env.GRAPHQL_ENDPOINT}/graphql`
});

const authLink = setContext((_, { headers }) => {
    // get auth token from cookie
    const token = authToken?.value;
    //return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    }
})
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
        link: from([errorLink, authLink, httpLink]),
        cache: new InMemoryCache(),
    });
});
