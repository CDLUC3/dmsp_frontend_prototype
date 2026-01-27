import { ApolloClient } from '@apollo/client';

let apolloClient: ApolloClient | null = null;

export const setApolloClient = (client: ApolloClient) => {
  apolloClient = client;
};

export const getApolloClient = () => apolloClient;