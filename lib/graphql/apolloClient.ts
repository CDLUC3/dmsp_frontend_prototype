// Create a new file: apolloClient.ts
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

export const setApolloClient = (client: ApolloClient<NormalizedCacheObject>) => {
  apolloClient = client;
};

export const getApolloClient = () => apolloClient;