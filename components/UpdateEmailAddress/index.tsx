import React, { useEffect, useRef, useState } from 'react';
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
import { useRouter } from 'next/navigation';
import { useSetPrimaryUserEmailMutation } from '@/generated/graphql';
import { useAddUserEmailMutation } from '@/generated/graphql';
import { useRemoveUserEmailMutation } from '@/generated/graphql';
import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import ContentContainer from '@/components/ContentContainer';
import EmailAddressRow from '@/components/EmailAddressRow';

import styles from './updateEmailAddress.module.scss';

interface Email {
  id?: number | null;
  email: string;
  isPrimary: boolean;
  isConfirmed: boolean;
}

interface UpdateEmailAddressProps {
  emailAddresses: Email[];
  setEmailAddresses: Function;
}

const UpdateEmailAddress: React.FC<UpdateEmailAddressProps> = ({
  emailAddresses,
  setEmailAddresses,
}) => {
  let setToPrimaryEmail = '';
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [setPrimaryUserEmailMutation, { loading: setPrimaryUserEmailLoading, error: setPrimaryUserEmailError }] = useSetPrimaryUserEmailMutation();
  const [addUserEmailMutation, { loading: addUserEmailLoading, error: addUserEmailError }] = useAddUserEmailMutation();
  const [removeUserEmailMutation, { loading: deleteEmailLoading, error: deleteEmailError }] = useRemoveUserEmailMutation();


  const makePrimaryEmail = async (primaryEmail: string) => {
    setErrors([]);
    setToPrimaryEmail = primaryEmail;
    try {
      const response = await setPrimaryUserEmailMutation({
        variables: {
          email: primaryEmail
        }
      })
      const emailData = response?.data?.setPrimaryUserEmail?.[0];
      if (emailData?.errors && emailData.errors.length > 0) {
        // Use the nullish coalescing operator to ensure `setErrors` receives a `string[]`
        setErrors(emailData.errors ?? []);
        return;
      }
    } catch (error) {
      console.error("Failed to make primary email:", error);
    }
  }

  // To add new emails with isPrimary set to false
  const handleAddingAlias = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const newAliasValue = (form.elements.namedItem('addAlias') as HTMLInputElement).value;

    // Create a new Email object matching your interface
    const newAlias: Email = {
      email: newAliasValue,
      isPrimary: false,     // Usually false for a new alias
      isConfirmed: false,   // Usually false for a new alias
      id: null              // Optional, can be null
    };

    try {
      const response = await addUserEmailMutation({
        variables: {
          email: newAliasValue,
          isPrimary: false
        }
      });

      const emailData = response?.data?.addUserEmail;
      if (emailData?.errors && emailData.errors.length > 0) {
        // Use the nullish coalescing operator to ensure `setErrors` receives a `string[]`
        setErrors(emailData.errors ?? []);
        return;
      }
      setEmailAddresses((prevEmails) => [...prevEmails, newAlias]);
      form.reset();
    } catch (error) {
      console.error("Failed to add email:", error);
    }
  }

  // Function to delete an email
  const deleteEmail = async (emailToDelete: string) => {
    // Save a backup of the current state in case we need to revert
    const backupEmailList = [...emailAddresses];

    // Optimistically update local state
    const updatedEmailList = emailAddresses.filter((email) => email.email !== emailToDelete);
    setEmailAddresses(updatedEmailList)
    try {
      const response = await removeUserEmailMutation({
        variables: {
          email: emailToDelete
        }
      })

      const emailData = response?.data?.removeUserEmail;
      if (emailData?.errors && emailData.errors.length > 0) {
        // Use the nullish coalescing operator to ensure `setErrors` receives a `string[]`
        setErrors(emailData.errors ?? []);
        return;
      }

    } catch (error) {
      // If the deletion fails, roll back the optimistic update
      setEmailAddresses(backupEmailList);
      console.error("Error updating profile:", error);
    }
  };

  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [errors]);

  // Reset errors when email addresses change so that error doesn't continue to display on page
  useEffect(() => {
    setErrors([]);
  }, [emailAddresses])

  // Handle errors from graphql request
  useEffect(() => {
    const handleErrors = async () => {
      //Remove null and undefined errors
      const errors = [setPrimaryUserEmailError].filter(Boolean);

      for (const error of errors) {
        await handleApolloErrors(
          error?.graphQLErrors,
          error?.networkError ?? null,
          setErrors,
          () => setPrimaryUserEmailMutation({ variables: { email: setToPrimaryEmail } }),
          router
        );
      }
    };

    if (setPrimaryUserEmailError) {
      handleErrors();
    }
  }, [setPrimaryUserEmailError]);

  return (
    <div className={styles.section} ref={errorRef}>
      <h2 className={styles.title}>Email and Authentication</h2>
      <ContentContainer>
        <div className={styles.subSection}>
          {errors && errors.length > 0 &&
            <div className="error">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          }
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