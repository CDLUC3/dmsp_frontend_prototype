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
import { ReadFieldFunction } from "@apollo/client/cache/core/types/common";
import { PaginableFeed } from "@/app/types";

function makeClient() {
    const httpLink = createHttpLink({
        uri: `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/graphql`
    });

    // use the `ApolloClient` from "@apollo/experimental-nextjs-app-support"
    const client = new ApolloClient({
        cache: new InMemoryCache({
            typePolicies: {
                Query: {
                    fields: {
                        // Pagination handling for queries that return a "feed"
                        myTemplates: {
                            // There are no args for this query aside from limit and cursor. And because
                            // this is run client side, there is no need to define KeyArgs.
                            keyArgs: false,
                            merge(existing = {}, incoming, { readField }) {
                                return mergePaginableFeeds(existing, incoming, readField, 'id');
                            }
                        },

                        myProjects: {
                            keyArgs: false,
                            merge(existing = {}, incoming, { readField }) {
                                return mergePaginableFeeds(existing, incoming, readField, 'id');
                            }
                        },

                        TopLevelResearchDomains: {
                            keyArgs: false,
                            merge(existing = {}, incoming, { readField }) {
                                return mergePaginableFeeds(existing, incoming, readField, 'id');
                            }
                        },

                        publishedTemplates: {
                            keyArgs: false,
                            merge(existing = {}, incoming, { readField }) {
                                return mergePaginableFeeds(existing, incoming, readField, 'id');
                            }
                        },
                    },
                },
            },
        }),
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

// Merges the incoming search results with the existing ones
function mergePaginableFeeds(
    existing: PaginableFeed,
    incoming: PaginableFeed,
    readField: ReadFieldFunction,
    fieldName = 'id'
): PaginableFeed {
    const existingFeed = existing.feed ?? [];
    const incomingFeed = incoming.feed ?? [];

    // Use a map to keep track of the merged items
    const mergedFeedMap = new Map();

    // Add existing items to the map
    existingFeed.forEach(item => {
        const templateId = readField(fieldName, item);
        if (templateId) mergedFeedMap.set(templateId, item);
    });

    // Add incoming items to the map, overwriting existing ones if necessary
    incomingFeed.forEach(item => {
        const templateId = readField(fieldName, item);
        if (templateId) mergedFeedMap.set(templateId, item);
    });

    // Return the new cursor, totalCount and the merged feed
    return {
        ...incoming,
        feed: Array.from(mergedFeedMap.values()),
    };
}


function offsetFromCursor(items: any[], cursor: number | string | null, readField: ReadFieldFunction) {
    // Search from the back of the list because the cursor we're
    // looking for is typically the ID of the last item.
    for (let i = items.length - 1; i >= 0; --i) {
      const item = items[i];
      // Using readField works for both non-normalized objects
      // (returning item.id) and normalized references (returning
      // the id field from the referenced entity object), so it's
      // a good idea to use readField when you're not sure what
      // kind of elements you're dealing with.
      if (readField("id", item) === cursor) {
        // Add one because the cursor identifies the item just
        // before the first item in the page we care about.
        return i + 1;
      }
    }
    // Report that the cursor could not be found.
    return -1;
}