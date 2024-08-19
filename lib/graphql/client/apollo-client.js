import { ApolloClient, InMemoryCache } from "@apollo/client";

const createApolloClient = () => {
    return new ApolloClient({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT,
        cache: new InMemoryCache(),
    });
};

export default createApolloClient;