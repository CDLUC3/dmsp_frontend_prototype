import { ApolloClient, InMemoryCache } from "@apollo/client";

export const createApolloClient = () => {
    return new ApolloClient({
        uri: `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/graphql`,
        cache: new InMemoryCache(),
    });
};

