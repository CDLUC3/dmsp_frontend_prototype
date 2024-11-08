import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Form,
} from "react-aria-components";
import { ApolloQueryResult, ApolloError } from "@apollo/client";

// Graphql mutations
import { useSetPrimaryUserEmailMutation, useAddUserEmailMutation, useRemoveUserEmailMutation } from '@/generated/graphql';
import { MeQuery } from '@/generated/graphql';
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
  refetch: () => () => Promise<ApolloQueryResult<MeQuery>>;
}

const UpdateEmailAddress: React.FC<UpdateEmailAddressProps> = ({
  emailAddresses,
  setEmailAddresses,
  refetch
}) => {
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [addAliasValue, setAddAliasValue] = useState<string>('');

  // Initialize graphql mutations for component
  const [setPrimaryUserEmailMutation] = useSetPrimaryUserEmailMutation();
  const [addUserEmailMutation, { error: addUserEmailError }] = useAddUserEmailMutation();
  const [removeUserEmailMutation, { error: deleteEmailError }] = useRemoveUserEmailMutation();

  // Set given email as isPrimary
  const makePrimaryEmail = async (primaryEmail: string) => {
    setErrors([]);
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
      if (err instanceof ApolloError) {
        await handleApolloErrors(
          err?.graphQLErrors,
          err?.networkError ?? null,
          setErrors,
          () => {
            return setPrimaryUserEmailMutation({
              variables: {
                email: primaryEmail
              },
            });
          },
          router
        );
      } else {
        // Display other errors
        setErrors(prevErrors => [...prevErrors, 'Error when setting primary email']);
        logECS('error', 'makePrimaryEmail', {
          error: err,
          url: { path: '/account/profile' }
        });
      }
    }
  }

  // Adding new email alias
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

      // Create a new Email object
      const newAlias: EmailInterface = {
        email: addAliasValue,
        isPrimary: false,
        isConfirmed: false,
        id: null
      };

      setEmailAddresses((prevEmails: EmailInterface[]) => [...prevEmails, newAlias]);
      form.reset();
    } catch (err) {
      if (err instanceof ApolloError) {
        await handleApolloErrors(
          err?.graphQLErrors,
          err?.networkError ?? null,
          setErrors,
          () => addUserEmailMutation({
            variables: {
              email: addAliasValue,
              isPrimary: false
            }
          }),
          router
        );
        //Refetch updated email list so that page is re-rendered with new email list
        refetch();
        // Clear form field
        form.reset();
      } else {
        // Display other errors
        setErrors(prevErrors => [...prevErrors, 'Error when setting primary email']);
        logECS('error', 'handleAddingAlias', {
          error: err,
          url: { path: '/account/profile' }
        });
      }
    }
  }

  // Delete provided email
  const deleteEmail = async (emailToDelete: string) => {
    try {
      const response = await removeUserEmailMutation({
        variables: {
          email: emailToDelete
        },
      })

      const emailData = response?.data?.removeUserEmail;
      if (emailData?.errors && emailData.errors.length > 0) {
        setErrors(emailData.errors ?? []);
        return;
      }

      //Refetch updated email list so that page is re-rendered with new email list
      refetch();
    } catch (err) {
      if (err instanceof ApolloError) {
        await handleApolloErrors(
          err?.graphQLErrors,
          err?.networkError ?? null,
          setErrors,
          () => removeUserEmailMutation({
            variables: {
              email: emailToDelete
            }
          }),
          router
        );
        //Refetch updated email list so that page is re-rendered with new email list
        refetch();
      } else {
        // Display other errors
        setErrors(prevErrors => [...prevErrors, 'Error when setting primary email']);
        logECS('error', 'deleteEmail', {
          error: err,
          url: { path: '/account/profile' }
        });
      }
    };
  }

  // If page-level errors, scroll them into view
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [errors]);

  /*Reset errors when email addresses change so that 
  errors don't continue to display on page*/
  useEffect(() => {
    setErrors([]);
  }, [emailAddresses])

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