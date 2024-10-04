'use client'

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import logECS from '@/utils/clientLogger';

interface AuthData {
  id: string;
  token: string;
}
const ORCID_AUTH_URL = "https://orcid.org/oauth/token";

const ORCIDCallback: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const saveAuthData = (id: string, token: string) => {
    const data: AuthData = { id, token };
    localStorage.setItem('connectionData', JSON.stringify(data));
    logECS('info', 'Token stored successfully', {
      url: { path: '/users/auth/orcid/callback' }
    });
  }

  const exchangeAuthCode = async (code: string) => {
    const data = new URLSearchParams({
      'client_id': process.env.NEXT_PUBLIC_ORCID_CLIENT_ID as string,
      'client_secret': process.env.NEXT_PUBLIC_ORCID_CLIENT_SECRET as string,
      'grant_type': 'authorization_code',
      'code': code,
      'redirect_uri': process.env.NEXT_PUBLIC_ORCID_DEV_CALLBACK as string
    });

    try {
      // Exchange the auth code from the query param for the access token
      const result = await fetch(ORCID_AUTH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data
      })

      const response = await result.json();
      if (!response.ok) {
        logECS('error', 'Something went wrong getting tokens', {
          url: { path: '/users/auth/orcid/callback' }
        });
        throw new Error('Something went wrong')
      }

      //Store the token from the response
      if (response.access_token) {
        /*TBD: Wil eventually need to POST this info to the backend to be stored in
        a db table along with user id and external service name, like orcid*/
        saveAuthData(response.orcid, response.access_token);
      }
    } catch (err) {
      logECS('error', `Something went wrong getting tokens ${err}`, {
        url: { path: '/users/auth/orcid/callback' }
      });
      router.push('/account/connections');
    }
  }

  // Get auth code from orcid
  useEffect(() => {
    if (code) {
      exchangeAuthCode(code);
    } else {
      router.push('/account/connections');
    }
  }, [])
  return (
    <h1>ORCID Redirect URI</h1>
  )

}

export default ORCIDCallback;