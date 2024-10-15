
import logECS from '@/utils/clientLogger';

export const refreshAuthTokens = async () => {
  try {
    // Get CSRF token first
    const crsfFetchResponse = await fetchCsrfToken();
    if (crsfFetchResponse) {
      const csrfToken = crsfFetchResponse.headers.get('X-CSRF-TOKEN');
      if (csrfToken) {
        try {
          //Refresh auth tokens
          const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-refresh`, {
            method: 'POST',
            credentials: 'include',// This is needed or else the frontend can't access the csrf token in the header
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': csrfToken || '',
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              window.location.href = '/login';
            }
            logECS('error', `Error in response from refreshing auth tokens - ${response.status}`, {
              source: 'refreshAuthTokens'
            });
            throw new Error(`Error in response from refreshing auth tokens - ${response.status}`);
          }

          if (response) {
            const message = await response.json();
            return { response, message };
          }
        } catch (err) {
          logECS('error', `Error refreshing auth tokens ${err}`, {
            source: 'refreshAuthTokens'
          });
          throw new Error('Error refreshing auth tokens');
        }

      } else {
        logECS('error', 'Forbidden. No csrf token', {
          source: 'refreshAuthTokens'
        });
        throw new Error('Forbidden. No csrf token');
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