"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";

const UpdatePasswordPage: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Update Password"
        description="Change your account password and security settings"
        showBackButton={true}
        className="page-template-list"
      />
      <div>
        <div>
          <h2>Password Update Form</h2>
          <p>This page will contain the password update form.</p>
          <p>Current route: /account/update-password</p>
        </div>
      </div>
    </>
  );
};

export default UpdatePasswordPage;
