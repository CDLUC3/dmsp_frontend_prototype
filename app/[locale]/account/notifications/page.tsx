'use client'

import React from 'react';
import PageHeader from '@/components/PageHeader';

const NotificationsPage: React.FC = () => {


  return (
    <>
      <PageHeader
        title="Notifications"
        description="Configure your notification preferences and email settings"
        showBackButton={true}
        className="page-template-list"
      />
      <div >
        <div>
          <h2>Notification Preferences</h2>
          <p>This page will contain the notification preferences form.</p>
          <p>Current route: /account/notifications</p>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
