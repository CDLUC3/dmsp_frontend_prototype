'use client'

import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache
} from "@apollo/client";
import {authLink, errorLink, retryLink} from "@/lib/graphql/graphqlHelper";

export const createApolloClient = () => {
    const httpLink = createHttpLink({
        uri: `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/graphql`
    });
    return new ApolloClient({
        link: from([errorLink, authLink, retryLink, httpLink]),
        cache: new InMemoryCache(),
    });
}





