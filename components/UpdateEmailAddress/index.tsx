import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  Text,
} from "react-aria-components";
import ContentContainer from '@/components/ContentContainer';
import EmailAddressRow from '@/components/EmailAddressRow';

import styles from './updateEmailAddress.module.scss';

interface Email {
  __typename?: "UserEmail";
  id?: number | null;
  email: string;
  isPrimary: boolean;
  isConfirmed: boolean;
}


interface UpdateEmailAddressProps {
  emailAddresses: Email[];
  deleteEmail: Function;
  handleAddingAlias: Function;
  makePrimaryEmail: Function;
}

const UpdateEmailAddress: React.FC<UpdateEmailAddressProps> = ({
  emailAddresses,
  deleteEmail,
  handleAddingAlias,
  makePrimaryEmail
}) => {

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Email and Authentication</h2>
      <ContentContainer>
        <div className={styles.subSection}>
          {/* {errors && errors.length > 0 &&
            <div className="error">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          } */}
          <h3>Primary email address</h3>
          <p>This email will be used for your account login. It can also be used for password resets.</p>

          {/* Render the primary email */}
          {emailAddresses.filter(emailObj => emailObj.isPrimary).map((emailObj) => (
            <EmailAddressRow
              key={emailObj.email}
              email={emailObj.email}
              isAlias={false}
              additionalClassName="primaryEmail"
              tooltip={true}
              toolTipMessage="Primary email cannot be deleted."
            />
          ))}
          <h4>Single sign on activated</h4>
          <p>This email address is managed by cdl.edu and connected to the institution.</p>
          <h4>Receives notifications</h4>
          <p>This email address will be used for DMP notifications. <Link href="">Manage your notifications</Link>.</p>
        </div>
        <div className={styles.subSection}>
          <hr />
          <h3>Alias email addresses</h3>
          <p>Alias email addresses may be used to help others find you, for example if they&lsquo;d like to share a DMP with you.</p>

          {emailAddresses.filter(emailObj => !emailObj.isPrimary).map((emailObj) => (
            <EmailAddressRow
              key={emailObj.email}
              email={emailObj.email}
              isAlias={true}
              deleteEmail={deleteEmail}
              makePrimaryEmail={makePrimaryEmail}
            />
          ))}
          <hr />
          <Form onSubmit={e => handleAddingAlias(e)}>
            <div className={styles.addContainer}>

              <TextField
                name="addAlias"
                type="email"
                className={`${styles.addAliasTextField} react-aria-TextField`}
                isRequired
              >
                <Label>Add alias email address</Label>
                <Input name="addAlias" />
                <FieldError>
                  {({ validationDetails }) => (
                    validationDetails.valueMissing ? 'Please enter an email address.' : ''
                  )}
                </FieldError>
                <Text slot="description" className={styles.helpText}>
                  You will be sent an email to confirm this addition.
                </Text>
              </TextField>
              <Button type="submit">Add</Button>
            </div>
          </Form>
        </div>
      </ContentContainer>
    </div>
  )
}

export default UpdateEmailAddress;