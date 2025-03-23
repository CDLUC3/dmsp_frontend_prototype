import { cookies } from 'next/headers';
import logger from '@/utils/logger';

// Error types that match Apollo error codes
type GraphQLErrorCode = 'UNAUTHENTICATED' | 'FORBIDDEN' | 'INTERNAL_SERVER_ERROR' | string;

interface GraphQLError {
  message: string;
  extensions?: {
    code?: GraphQLErrorCode;
  };
}
export class ServerAuthError extends Error {
  status: number | null;

  constructor({
    status,
    message,
    source,
  }: {
    status: number | null;
    message: string;
    source: string;
  }) {
    let statusMsg: string;
    if (status) {
      statusMsg = `[${status}] ${message}`;
    } else {
      statusMsg = `${message}`;
    }
    super(statusMsg);

    this.status = status;
    this.message = message;

    logger.error(`${statusMsg} - ${source}`);
  }
}

// Server-side refresh auth tokens
export const serverRefreshAuthTokens = async () => {
  try {
    // Get CSRF token first
    const csrfResponse = await serverFetchCsrfToken();
    if (!csrfResponse || !csrfResponse.ok) {
      return null;
    }

    const csrfToken = csrfResponse.headers.get('X-CSRF-TOKEN');
    if (!csrfToken) {
      throw new ServerAuthError({
        status: 403,
        message: 'Forbidden. No CSRF token',
        source: 'serverRefreshAuthTokens'
      });
    }

    // Refresh auth tokens
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        // Get existing cookies to include in request
        'Cookie': cookies().toString()
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { redirectTo: '/login' };
      }
      throw new ServerAuthError({
        status: response.status,
        message: "Error in response from refreshing auth tokens",
        source: 'serverRefreshAuthTokens',
      });
    }

    if (response) {
      const message = await response.json();
      return { response, message };
    }

    return null;
  } catch (err) {
    logger.error('Error refreshing auth token', err);
    return null;
  }
};

// Server-side fetch CSRF token
export const serverFetchCsrfToken = async () => {
  try {
    const cookieHeader = cookies().toString();
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-csrf`, {
      headers: {
        'Cookie': cookieHeader
      },
      credentials: 'include',
    });
    return response;
  } catch (err) {
    logger.error('Error getting CSRF token', err);
    return null;
  }
};

// Function to execute GraphQL queries with error handling
export async function executeGraphQLQuery<T>(
  queryString: string,
  variables?: Record<string, any>,
  options?: {
    skipErrorHandling?: boolean;
    additionalHeaders?: Record<string, string>;
  }
): Promise<{ data?: T; errors?: string[] } | { redirect: string }> {
  // Get all cookies from the server component
  const cookieStore = cookies();
  const cookieString = cookieStore.toString(); // Convert cookies to a string format for the request

  // Headers for the GraphQL request
  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookieString, // Attach all cookies
    ...(options?.additionalHeaders || {}),
  };

  try {
    // Make the GraphQL request
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/graphql`, {
      method: 'POST',
      headers,
      credentials: 'include', // Ensure cookies are sent with the request
      body: JSON.stringify({ query: queryString, variables }),
    });

    const result = await response.json();

    // Handle GraphQL errors if they exist and error handling isn't skipped
    if (result.errors && !options?.skipErrorHandling) {
      for (const { message, extensions } of result.errors) {
        const errorCode = extensions?.code;
        switch (errorCode) {
          case 'UNAUTHENTICATED':
            try {
              const refreshResult = await serverRefreshAuthTokens();
              if (refreshResult) {
                logger.error('Token refresh failed with no result', { error: 'UNAUTHENTICATED' });
              }
            } catch (error) {
              logger.error('Token refresh failed', { error });
              return { redirect: '/login' };
            }
            break;

          case 'FORBIDDEN':
            try {
              await serverFetchCsrfToken();
            } catch (error) {
              logger.error('Fetching CSRF token failed', { error });
              return { redirect: '/login' };
            }
            break;

          case 'INTERNAL_SERVER_ERROR':
            logger.error(`[GraphQL Error]: INTERNAL_SERVER_ERROR - ${message}`, { error: 'INTERNAL_SERVER_ERROR' });
            return { redirect: '/500-error' };
            break;

          default:
            logger.error(`[GraphQL Error]: ${message}`, { error: 'GRAPHQL_ERROR' });
            return { errors: [message] };
        }
      }
    }

    return { data: result.data, errors: result.errors?.map((e: GraphQLError) => e.message) };
  } catch (networkError) {
    logger.error(`[GraphQL Network Error]: ${networkError}`, { error: 'NETWORK_ERROR' });
    return { errors: ['There was a problem connecting to the server. Please try again.'] };
  }
}