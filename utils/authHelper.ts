import logECS from '@/utils/clientLogger';


export class AuthError extends Error {
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
      {source: source},
    );
  }
}


export const refreshAuthTokens = async () => {
  // Get CSRF token first
  const crsfFetchResponse = await fetchCsrfToken();
  if (crsfFetchResponse) {
    const csrfToken = crsfFetchResponse.headers.get('X-CSRF-TOKEN');
    if (csrfToken) {
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
    } else {
      throw new AuthError({
        status: 403,
        message: 'Forbidden. No csrf token',
        source: 'refreshAuthTokens'
      });
    }
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
