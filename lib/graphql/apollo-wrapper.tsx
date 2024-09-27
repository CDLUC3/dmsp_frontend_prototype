"use client"

import { createHttpLink } from "@apollo/client";
import { errorLink, authLink, retryLink } from "@/lib/graphql/graphqlHelper";

//From https://github.com/apollographql/apollo-client-nextjs
import {
    ApolloLink,
} from "@apollo/client";

import {
    ApolloNextAppProvider,
} from "@apollo/experimental-nextjs-app-support/ssr";

import {
    ApolloClient,
    InMemoryCache
} from "@apollo/experimental-nextjs-app-support";

function makeClient() {
    const httpLink = createHttpLink({
        uri: `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/graphql`
    });


    // use the `ApolloClient` from "@apollo/experimental-nextjs-app-support"
    return new ApolloClient({
        // use the `InMemoryCache` from "@apollo/experimental-nextjs-app-support"
        cache: new InMemoryCache(),
        link: ApolloLink.from([
            errorLink,
            authLink,
            retryLink,
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