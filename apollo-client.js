// ./apollo-client.js

import { ApolloClient, InMemoryCache } from "@apollo/client";

const createApolloClient = () => {
  return new ApolloClient({
    uri: "https://graphql.dmphub.uc3dev.cdlib.net/",
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;