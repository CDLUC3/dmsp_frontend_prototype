import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Form,
} from "react-aria-components";

// Graphql mutations
import { useSetPrimaryUserEmailMutation, useAddUserEmailMutation, useRemoveUserEmailMutation } from '@/generated/graphql';

// Components
import ContentContainer from '@/components/ContentContainer';
import EmailAddressRow from '@/components/EmailAddressRow';
import FormInput from '../Form/FormInput';
//Interfaces
import { EmailInterface } from '@/app/types';
// Utils and other
import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import logECS from '@/utils/clientLogger';
import styles from './updateEmailAddress.module.scss';

export interface UpdateEmailAddressProps {
  emailAddresses: EmailInterface[];
  setEmailAddresses: Dispatch<SetStateAction<EmailInterface[]>>;
}


const UpdateEmailAddress: React.FC<UpdateEmailAddressProps> = ({
  emailAddresses,
  setEmailAddresses,
}) => {
  let setToPrimaryEmail = '';
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [addAliasValue, setAddAliasValue] = useState<string>('');
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
    } catch (err) {
      await handleApolloErrors(
        setPrimaryUserEmailError?.graphQLErrors,
        setPrimaryUserEmailError?.networkError ?? null,
        setErrors,
        () => setPrimaryUserEmailMutation({
          variables: {
            email: primaryEmail
          },
        }),
        router
      );
      logECS('error', 'makePrimaryEmail', {
        error: err,
        url: { path: '/account/profile' }
      });
    }
  }

  // To add new emails with isPrimary set to false
  const handleAddingAlias = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    try {
      const response = await addUserEmailMutation({
        variables: {
          email: addAliasValue,
          isPrimary: false
        }
      });

      const emailData = response?.data?.addUserEmail;
      if (emailData?.errors && emailData.errors.length > 0) {
        // Use the nullish coalescing operator to ensure `setErrors` receives a `string[]`
        setErrors(emailData.errors ?? []);
        return;
      }

      // Create a new Email object matching your interface
      const newAlias: EmailInterface = {
        email: addAliasValue,
        isPrimary: false,     // Usually false for a new alias
        isConfirmed: false,   // Usually false for a new alias
        id: null              // Optional, can be null
      };


      setEmailAddresses((prevEmails: EmailInterface[]) => [...prevEmails, newAlias]);
      form.reset();
    } catch (err) {
      await handleApolloErrors(
        addUserEmailError?.graphQLErrors,
        addUserEmailError?.networkError ?? null,
        setErrors,
        () => addUserEmailMutation({
          variables: {
            email: addAliasValue,
            isPrimary: false
          }
        }),
        router
      );
      logECS('error', 'handleAddingAlias', {
        error: err,
        url: { path: '/account/profile' }
      });
    }
  }

  // Function to delete an email
  const deleteEmail = async (emailToDelete: string) => {
    // Save a backup of the current state in case we need to revert
    const backupEmailList = [...emailAddresses];

    // Optimistically update local state when user deletes email
    const updatedEmailList = emailAddresses.filter((email) => email.email !== emailToDelete);
    setEmailAddresses(updatedEmailList);
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

    } catch (err) {
      // If the deletion fails, roll back the optimistic update
      setEmailAddresses(backupEmailList);
      await handleApolloErrors(
        deleteEmailError?.graphQLErrors,
        deleteEmailError?.networkError ?? null,
        setErrors,
        () => removeUserEmailMutation({
          variables: {
            email: emailToDelete
          }
        }),
        router
      );
      logECS('error', 'deleteEmail', {
        error: err,
        url: { path: '/account/profile' }
      });
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
              <FormInput
                name="addAlias"
                type="email"
                label="Add alias email address"
                className={`${styles.addAliasTextField} react-aria-TextField`}
                helpMessage="You will be sent an email to confirm this addition."
                onChange={e => setAddAliasValue(e.target.value)}
              />
              <Button type="submit">Add</Button>
            </div>
          </Form>
        </div>
      </ContentContainer>
    </div>
  )
}

export default UpdateEmailAddress;