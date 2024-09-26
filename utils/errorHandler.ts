'use client'

import logECS from '@/utils/clientLogger';
import { fetchCsrfToken } from "@/utils/authHelper";

type RetryRequestType = (csrfToken: string | null) => Promise<Response>;

interface CustomRouter {
  push: (url: string) => void;
}
export const handleErrors = async (
  response: Response,
  retryRequest: RetryRequestType,
  setErrors: React.Dispatch<React.SetStateAction<string[]>>,
  router: CustomRouter

) => {
  const { message } = await response.json();

  switch (response.status) {
    case 200:
      router.push('/'); // Redirect to home page
      break;

    case 400:
    case 401:
      if (message) {
        setErrors(prevErrors => [...prevErrors, message]);
      }
      break;

    case 403:
      if (message === 'Invalid CSRF token') {
        logECS('error', message, {
          url: { path: '/apollo-signin' }
        });

        try {
          // Attempt to get a new CSRF token
          const response = await fetchCsrfToken();
          if (response) {
            const csrfToken = response.headers.get('X-CSRF-TOKEN');
            if (csrfToken) {
              // Retry login
              const newResponse = await retryRequest(csrfToken);
              if (newResponse.ok) {
                router.push('/');
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

    default:
      setErrors(['An unexpected error occurred. Please try again.']);
  }
};