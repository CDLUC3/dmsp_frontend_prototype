"use client"

import {
    ApolloLink,
    HttpLink,
} from "@apollo/client";
import {
    ApolloNextAppProvider,
    NextSSRInMemoryCache,
    SSRMultipartLink,
    NextSSRApolloClient,
} from "@apollo/experimental-nextjs-app-support/ssr";
import { createAuthLink } from '@/utils/authLink';

function makeClient() {
    const httpLink = new HttpLink({
        uri: `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/graphql`,
        fetchOptions: 'cache-first'
    });

    const authLink = createAuthLink();

    return new NextSSRApolloClient({
        cache: new NextSSRInMemoryCache(),
        link:
            typeof window === "undefined"
                ? ApolloLink.from([
                    new SSRMultipartLink({
                        stripDefer: true,
                    }),
                    httpLink,
                ])
                : ApolloLink.from([
                    authLink,
                    httpLink,
                ]),
    });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient} >
            {children}
        </ApolloNextAppProvider>
    );
}