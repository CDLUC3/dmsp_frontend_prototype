'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
import PageHeader from '@/components/PageHeader';

const UpdatePasswordPage: React.FC = () => {
  const t = useTranslations('Account');

  return (
    <>
      <PageHeader
        title="Update Password"
        description="Change your account password and security settings"
        showBackButton={true}
        className="page-template-list"
      />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          padding: '2rem', 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h2>Password Update Form</h2>
          <p>This page will contain the password update form.</p>
          <p>Current route: /account/update-password</p>
        </div>
      </div>
    </>
  );
};

export default UpdatePasswordPage;
