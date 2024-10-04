'use client'

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import logECS from '@/utils/clientLogger';

interface AuthData {
  id: string;
  token: string;
}

const ORCIDTest: React.FC = () => {
  const router = useRouter();

  const saveAuthData = (id: string, token: string) => {
    const data: AuthData = { id, token };
    localStorage.setItem('connectionData', JSON.stringify(data));
    logECS('info', 'Token stored successfully', {
      url: { path: '/users/auth/orcid/callback' }
    });
    router.push('/account/connections');
  }

  // Get auth code from orcid
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