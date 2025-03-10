"use client"

import {ApolloLink, createHttpLink} from "@apollo/client";
import {authLink, errorLink, retryLink} from "@/lib/graphql/graphqlHelper";

//From https://github.com/apollographql/apollo-client-nextjs
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";

import {setApolloClient} from './apolloClient';

function makeClient() {
    const httpLink = createHttpLink({
        uri: `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/graphql`
    });


    // use the `ApolloClient` from "@apollo/experimental-nextjs-app-support"
    const client = new ApolloClient({
        // use the `InMemoryCache` from "@apollo/experimental-nextjs-app-support"
        cache: new InMemoryCache(),
        link: ApolloLink.from([
            errorLink,
            authLink,
            retryLink,
            httpLink,
        ]),
    });

    setApolloClient(client);
    return client;
}

//To create a component to wrap the app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient} >
            {children}
        </ApolloNextAppProvider>
    );
}
