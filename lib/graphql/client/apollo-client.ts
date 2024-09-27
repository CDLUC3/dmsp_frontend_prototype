import { ApolloClient, InMemoryCache, from } from "@apollo/client";
import { errorLink, authLink, retryLink, httpLink } from "../graphqlHelper";

export const createApolloClient = () => {
    return new ApolloClient({
        link: from([errorLink, authLink, retryLink, httpLink]),
        cache: new InMemoryCache(),
    });
}





