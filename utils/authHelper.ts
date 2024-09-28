
import logECS from '@/utils/clientLogger';

export const refreshAuthTokens = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-refresh`, {
      credentials: 'include',// This is needed or else the frontend can't access the csrf token in the header
    });
    const message = await response.json();
    return { response, message };
  } catch (err) {
    logECS('error', `Error refreshing auth tokens: ${err}`, {
      source: 'AuthContext'
    });
    return {}
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