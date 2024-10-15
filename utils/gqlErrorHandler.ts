'use client'

import { GraphQLFormattedError } from 'graphql';
import logECS from "@/utils/clientLogger";
import { fetchCsrfToken, refreshAuthTokens } from "@/utils/authHelper";
import { ApolloQueryResult } from '@apollo/client';

type ServerError = Error & {
  response: Response;
  result: Record<string, unknown>;
  statusCode: number;
}

type ServerParseError = Error & {
  response: Response;
  statusCode: number;
  bodyText: string;
}

type CustomRouter = {
  push: (url: string) => void;
}

type NetworkError = Error | ServerError | ServerParseError;
type RefetchFunction<TData, TVariables> = (variables?: Partial<TVariables>) => Promise<ApolloQueryResult<TData>>;

type CustomError = {
  message: string;
  errorCode?: string;
};

export async function handleGraphQLErrors<TData, TVariables>(
  graphQLErrors: readonly GraphQLFormattedError[],
  setErrors: React.Dispatch<React.SetStateAction<string[]>>,
  refetch: RefetchFunction<TData, TVariables>,
  router: CustomRouter
): Promise<CustomError[]> {
  const customErrors: CustomError[] = [];

  if (graphQLErrors) {
    for (const { message, extensions } of graphQLErrors) {
      switch (extensions?.code) {
        case 'UNAUTHENTICATED':
          // Attempt to refresh the auth tokens
          try {
            const result = await refreshAuthTokens();
            if (result) {
              await refetch();
            } else {
              // If refresh fails, log the error and add to the errorResponses
              logECS('error', 'Token refresh failed with no result', { errorCode: 'UNAUTHENTICATED' });
              router.push('/login');
            }
          } catch (error) {
            // If refresh throws an error, handle it
            logECS('error', 'Token refresh failed', { error });
            router.push('/login');
          }
          break;

        case 'FORBIDDEN':
          logECS('error', `[GraphQL Error]: FORBIDDEN - ${message}`, { errorCode: 'FORBIDDEN' });
          try {
            const response = await fetchCsrfToken();
            if (!response) {
              logECS('error', 'Forbidden - Error fetching CSRF token', { source: 'apollo-client' });
              router.push('/login');
            }
          } catch (error) {
            logECS('error', 'Fetching csrf token failed', { error });
            router.push('/login')
          }
          break;

        default:
          logECS('error', `[GraphQL Error]: ${message}`, { errorCode: 'GRAPHQL' });
          setErrors(prevErrors => [...prevErrors, message]);
          break;
      }
    }
  }

  return customErrors;
}

export function handleNetworkError(networkError: NetworkError | null, setErrors: React.Dispatch<React.SetStateAction<string[]>>): CustomError[] {
  const networkErrors: CustomError[] = [];

  if (networkError) {
    setErrors(prevErrors => [...prevErrors, networkError.message]);
  }

  return networkErrors;
}


export async function handleApolloErrors<TData, TVariables>(
  graphQLErrors: readonly GraphQLFormattedError[] | undefined,
  networkError: NetworkError | null,
  setErrors: React.Dispatch<React.SetStateAction<string[]>>,
  refetch: RefetchFunction<TData, TVariables>,
  router: CustomRouter
): Promise<void> {
  await handleGraphQLErrors(graphQLErrors || [], setErrors, refetch, router);
  handleNetworkError(networkError, setErrors);
}