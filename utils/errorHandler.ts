'use client'

import logECS from '@/utils/clientLogger';
import { fetchCsrfToken, refreshAuthTokens } from "@/utils/authHelper";

type RetryRequestType = (csrfToken: string | null) => Promise<Response>;

interface CustomRouter {
  push: (url: string) => void;
}

async function safeJsonParse(response: Response) {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to parse JSON response");
  }
}


export const handleErrors = async (
  response: Response,
  retryRequest: RetryRequestType,
  setErrors: React.Dispatch<React.SetStateAction<string[]>>,
  router: CustomRouter,
  path: string

) => {

  try {
    const { message } = await safeJsonParse(response);

    switch (response.status) {
      case 400:
        if (message) {
          setErrors(prevErrors => [...prevErrors, message]);
        } else {
          setErrors(['An unexpected error occurred. Please try again.']);
        }
      case 401:
        if (message) {
          logECS('error', message, {
            url: { path: path }
          });

          try {
            // Attempt to get new auth tokens
            const response = await refreshAuthTokens();

            if (response) {
              router.push("/");
            } else {
              router.push('/login')
            }
          } catch (err) {
            router.push('/login');
          }
        }
        break;

      case 403:
        if (message === 'Invalid CSRF token') {
          logECS('error', message, {
            url: { path: path }
          });

          try {
            // Attempt to get a new CSRF token
            const response = await fetchCsrfToken();
            if (response) {
              const csrfToken = response?.headers.get('X-CSRF-TOKEN');
              if (csrfToken) {
                // Retry request
                const newResponse = await retryRequest(csrfToken);
                if (newResponse.ok) {
                  router.push("/");
                } else {
                  const errorMessage = await newResponse.json();
                  setErrors(prevErrors => [...prevErrors, errorMessage]);
                }
              }
            }
          } catch (err) {
            throw new Error(`Error fetching new CSRF - ${err}`);
          }
        } else {
          setErrors(prevErrors => [...prevErrors, message]);
        }
        break;

      case 500:
        logECS('error', 'Internal server error', {
          url: { path: '/apollo-signin' }
        });
        router.push('/500-error');
        break;
    }
  } catch (error) {
    logECS('error', 'Error processing errors', {
      url: { path: path }
    });
    setErrors(['An unexpected error occurred. Please try again.']);
  }
};