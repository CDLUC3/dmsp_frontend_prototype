'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';

interface AuthData {
  id: string;
  token: string;
}

/*This is a test redirect uri that enables us to test the UI changing when a user toggles
between connecting and disconnecting orcid*/
const ORCIDTest: React.FC = () => {
  const router = useRouter();

  const saveAuthData = (id: string, token: string) => {
    /* TODO: Once there is an API endpoint to update the db table with this third party access token,
we will need to call that endpoint to save the auth data. For now, we are using localStorage for testing
*/
    const data: AuthData = { id, token };
    localStorage.setItem('connectionDataorcidtest', JSON.stringify(data));
    logECS('info', 'Token stored successfully', {
      url: { path: '/users/auth/orcid/callback' }
    });
    router.push('/account/connections');
  }

  // Set fake orcid id and access token in local storage for testing
  useEffect(() => {
    const token = 'f5af9f51-07e6-4332-8f1a-c0c11c1e3728';
    const id = '0000-0001-2345-6789'
    saveAuthData(id, token);
  }, [])
  return (
    <h1>ORCID Test Redirect URI</h1>
  )

}

export default ORCIDTest;