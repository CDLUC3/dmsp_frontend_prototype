'use client'

import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache
} from "@apollo/client";
import { authLink, errorLink, retryLink } from "@/lib/graphql/graphqlHelper";

export const createApolloClient = () => {
  const httpLink = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/graphql`
  });
  return new ApolloClient({
    link: from([errorLink, authLink, retryLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Tell Apollo to replace (not merge) the projectFundings array when refetching
            // This prevents cache warnings when items are added/removed
            projectFundings: {
              merge(_existing, incoming) {
                // Always replace with incoming data, never merge
                return incoming;
              }
            }
          }
        }
      }
    }),
  });
}
