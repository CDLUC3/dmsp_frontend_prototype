'use client'

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';
interface AuthData {
  id: string;
  token: string;
}

const ORCID_AUTH_URL = 'https://orcid.org/oauth/token';

// This is the return uri page used by ORCiD's 3-legged OAuth
// per instructions provided here: https://info.orcid.org/documentation/api-tutorials/api-tutorial-get-and-authenticated-orcid-id/
const ORCIDCallbackContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code'); // obtained for query param 'code' in url

  const saveAuthData = (id: string, token: string) => {
    /* TODO: Once there is an API endpoint to update the db table with this third party access token,
we will need to call that endpoint to save the auth data. For now, we are using localStorage for testing
*/
    const data: AuthData = { id, token };
    localStorage.setItem('connectionDataorcid', JSON.stringify(data));
    logECS('info', 'Token stored successfully', {
      url: { path: '/users/auth/orcid/callback' },
    });
  };

  // Send the auth code from orcid in the body of the request to get the access token

  const exchangeAuthCode = async (code: string) => {
    const data = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_ORCID_CLIENT_ID as string,
      client_secret: process.env.NEXT_PUBLIC_ORCID_CLIENT_SECRET as string,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.NEXT_PUBLIC_ORCID_DEV_CALLBACK as string,
    });

    try {
      // Exchange the auth code from the query param for the access token

      const result = await fetch(ORCID_AUTH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      });

      if (!result.ok) {
        throw new Error('Something went wrong');
      }

      const response = await result.json();
      //Store the orcid id and access token from the response
      if (response.access_token) {
        saveAuthData(response.orcid, response.access_token);
      }
    } catch (err) {
      logECS('error', 'Something went wrong getting tokens', {
        url: { path: '/users/auth/orcid/callback' },
      });
      router.push('/account/connections');
    }
  };

  // Get auth code from orcid on page load

  useEffect(() => {
    if (code) {
      exchangeAuthCode(code);
    } else {
      router.push('/account/connections');
    }
  }, [code]);

  return <p>ORCID redirect complete.</p>;
};

// Use Suspense to wrap the entire component that uses useSearchParams
const ORCIDCallback: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ORCIDCallbackContent />
    </Suspense>
  );
};

export default ORCIDCallback;