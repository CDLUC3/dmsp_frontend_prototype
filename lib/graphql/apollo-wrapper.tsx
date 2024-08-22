"use client"
//From https://github.com/apollographql/apollo-client-nextjs
import {
    ApolloLink,
    HttpLink,
} from "@apollo/client";

import {
    ApolloNextAppProvider,
} from "@apollo/experimental-nextjs-app-support/ssr";

import {
    ApolloClient,
    InMemoryCache
} from "@apollo/experimental-nextjs-app-support";
import { createAuthLink } from '@/utils/authLink';

function makeClient() {
    const httpLink = new HttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT,
        fetchOptions: 'cache-first'
    });

    const authLink = createAuthLink();

    // use the `ApolloClient` from "@apollo/experimental-nextjs-app-support"
    return new ApolloClient({
        // use the `InMemoryCache` from "@apollo/experimental-nextjs-app-support"
        cache: new InMemoryCache(),
        link: ApolloLink.from([
            authLink,
            httpLink,
        ]),
    });
}

//To create a component to wrap the app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient} >
            {children}
        </ApolloNextAppProvider>
    );
}