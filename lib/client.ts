import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";

export const { getClient } = registerApolloClient(() => {
    return new ApolloClient({
        cache: new InMemoryCache(),
        link: new HttpLink({
            // https://studio.apollographql.com/public/spacex-l4uc6p/
            uri: "http://localhost:3000/",
            //fetchOptions: { cache: 'no-store' } // I had to set cache to 'no-store' unfortunately. If I didn't, the cache for this
            //would not be in sync with the client-side caches
        }),
    });
});