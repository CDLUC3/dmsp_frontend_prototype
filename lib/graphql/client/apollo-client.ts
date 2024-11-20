import { ApolloClient, InMemoryCache, from, createHttpLink } from "@apollo/client";
import { authLink, retryLink } from "../graphqlHelper";

export const createApolloClient = () => {
    const httpLink = createHttpLink({
        uri: `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/graphql`
    });
    return new ApolloClient({
        link: from([authLink, retryLink, httpLink]),
        cache: new InMemoryCache(),
    });
}





