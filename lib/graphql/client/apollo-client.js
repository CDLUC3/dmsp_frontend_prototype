import { ApolloClient, InMemoryCache } from "@apollo/client";

const createApolloClient = () => {
    return new ApolloClient({
        uri: process.env.GRAPHQL_ENDPOINT,
        cache: new InMemoryCache(),
    });
};

export default createApolloClient;