import logECS from '@/utils/clientLogger';
import dotenv from 'dotenv'

//Load environment variables from .env.local
dotenv.config({ path: './.env.local' });// 


export class AuthError extends Error {
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

    logECS(
      'error',
      statusMsg,
      { source: source },
    );
  }
}


export const refreshAuthTokens = async (cookies?: string) => {
  try {
    // Get CSRF token first
    const crsfFetchResponse = await fetchCsrfToken();
    if (crsfFetchResponse) {
      const csrfToken = crsfFetchResponse.headers.get('X-CSRF-TOKEN');
      if (csrfToken) {
        try {
          // Refresh auth tokens
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          };

          // Conditionally add the Cookie header if cookies are provided
          if (cookies) {
            headers['Cookie'] = cookies;
          }

          //Refresh auth tokens
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-refresh`, {
            method: 'POST',
            credentials: 'include',// This is needed or else the frontend can't access the csrf token in the header
            headers
          });

          if (!response.ok) {
            if (response.status === 401) {
              // Handle unauthorized access for server
              return { shouldRedirect: true, redirectTo: '/login' };
            }
            throw new AuthError({
              status: response.status,
              message: "Error in response from refreshing auth tokens",
              source: 'refreshAuthTokens',
            });
          }

          if (response) {
            const message = await response.json();
            return { response, message };
          }
        } catch (err) {
          throw new AuthError({
            status: null,
            message: `Error refreshing auth tokens ${err}`,
            source: 'refreshAuthTokens',
          });
        }

      } else {
        throw new AuthError({
          status: 403,
          message: 'Forbidden. No csrf token',
          source: 'refreshAuthTokens'
        });
      }
    }

  } catch (err) {
    logECS('error', `Error refreshing auth token: ${err}`, {
      source: 'refreshAuthTokens'
    });
    throw new Error('Error refreshing auth token');
  }
};


//Function to fetch CSRF token from the backend
export const fetchCsrfToken = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-csrf`, {
      credentials: 'include',// This is needed or else the frontend can't access the csrf token in the header
    });
    return response;
  } catch (err) {
    logECS('error', `Error getting csrf token from backend: ${err}`, {
      source: 'CsrfProvider'
    });
    return null;
  }
};

