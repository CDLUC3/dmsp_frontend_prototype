import { ApolloClient, InMemoryCache, from, createHttpLink } from "@apollo/client";
import { errorLink, authLink, retryLink } from "../graphqlHelper";

export const createApolloClient = () => {
    const httpLink = createHttpLink({
        uri: `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/graphql`
    });
    return new ApolloClient({
        link: from([errorLink, authLink, retryLink, httpLink]),
        cache: new InMemoryCache(),
    });
}





