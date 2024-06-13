"use client";

import {
    ApolloClient,
    ApolloLink,
    HttpLink,
} from "@apollo/client";
import {
    ApolloNextAppProvider,
    NextSSRInMemoryCache,
    SSRMultipartLink,
    NextSSRApolloClient,
} from "@apollo/experimental-nextjs-app-support/ssr";

function makeClient() {
    const httpLink = new HttpLink({
        uri: `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/graphql`,
        fetchOptions: 'cache-first'
    });

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
                : httpLink,
    });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient} >
            {children}
        </ApolloNextAppProvider>
    );
}