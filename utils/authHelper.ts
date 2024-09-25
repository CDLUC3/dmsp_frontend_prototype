
import logECS from '@/utils/clientLogger';

export const refreshAuthTokens = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-refresh`);
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-csrf`);
    return response;
  } catch (err) {
    logECS('error', `Error getting csrf token from backend: ${err}`, {
      source: 'CsrfProvider'
    });
    return null;
  }
};