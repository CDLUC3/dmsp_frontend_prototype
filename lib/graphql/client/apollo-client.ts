import { ApolloClient, createHttpLink, InMemoryCache, from } from "@apollo/client";
import { onError } from '@apollo/client/link/error';
import { createAuthLink } from '@/utils/authLink';

const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT
});

const authLink = createAuthLink();

export const createApolloClient = () => {
    return new ApolloClient({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT,
        cache: new InMemoryCache(),
    });
};

