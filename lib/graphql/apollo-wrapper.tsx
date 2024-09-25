"use client"

import { refreshAuthTokens, fetchCsrfToken } from "@/utils/authHelper";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { redirect } from "next/navigation";
import logECS from "@/utils/clientLogger";
import { fromPromise } from "@apollo/client/link/utils";


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

interface CustomError extends Error {
    customInfo?: { errorMessage: string }
}


function makeClient() {
    const httpLink = new HttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT,
        fetchOptions: 'cache-first'
    });

    const authLink = createAuthLink();

    const retryLink = new RetryLink({
        attempts: {
            max: 3, // Maximum number of retry attempts
            retryIf: (error) => {
                // Retry on network errors
                return !!error.networkError;
            }
        },
        delay: {
            initial: 1000, // Initial delay in milliseconds
            max: 5000, // Maximum delay in milliseconds
            jitter: true // Add random jitter to the delay to help spread out retry attempts and avoid potential overloading of backend system
        }
    });

    const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, extensions }) => {
                //Check for specific error codes
                switch (extensions?.code) {
                    case 'UNAUTHORIZED':
                        logECS('error', `[GraphQL Error]:  - ${message}`, {
                            errorCode: 'UNAUTHORIZED'
                        });

                        return fromPromise(
                            refreshAuthTokens()
                                .then(({ response, message }) => {
                                    if (response) {
                                        if (message === 'ok') {
                                            // Retry the operation after refreshing the token
                                            return forward(operation);
                                        }
                                    } else {
                                        logECS('error', 'UNAUTHORIZED - Error refreshing auth tokens', {
                                            source: 'apollo-client'
                                        });
                                        redirect('/login');
                                    }


                                })
                                .catch(error => {
                                    logECS('error', 'Token refresh failed', { error });
                                })
                        );
                    case 'FORBIDDEN':
                        logECS('error', `[GraphQL Error]: FORBIDDEN - ${message}`, {
                            errorCode: 'FORBIDDEN'
                        });

                        return fromPromise(
                            fetchCsrfToken()
                                .then((response) => {
                                    if (response) {
                                        if (message === 'ok') {
                                            // Retry the operation after fetching a new csrf token
                                            return forward(operation);
                                        }
                                    } else {
                                        logECS('error', 'Forbidden - Error fetching CSRF token', {
                                            source: 'apollo-client'
                                        });
                                        //Redirect to dashboard
                                        redirect('/');
                                    }


                                })
                                .catch(error => {
                                    logECS('error', 'Fetching csrf token failed', { error });
                                    // Optionally redirect to login or show error
                                    return null; // Stop the retry if token refresh fails
                                })
                        );
                    case 'INTERNAL_SERVER_ERROR':
                        logECS('error', `[GraphQL Error]: INTERNAL_SERVER_ERROR - ${message}`, {
                            errorCode: 'INTERNAL_SERVER_ERROR'
                        });
                        redirect('/500-error');
                    default:
                        logECS('error', `[GraphQL Error]: ${message}`, {
                            errorCode: 'GRAPHQL'
                        });
                        break;
                }
            })
        }

        if (networkError) {
            logECS('error', `[GraphQL Error Network Error]: ${networkError.message}`, {
                errorCode: 'NETWORK_ERROR'
            });
            const customNetworkError = networkError as CustomError;

            customNetworkError.customInfo = { errorMessage: 'There was a problem ' };
            operation.setContext({ networkError: customNetworkError });
        }

        return forward(operation); // Forward the operation by default
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