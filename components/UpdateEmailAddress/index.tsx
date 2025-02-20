import React, {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {Button, Form,} from "react-aria-components";
import {ApolloError} from "@apollo/client";

// Graphql mutations
import {
  MeDocument,
  useAddUserEmailMutation,
  UserEmailErrors,
  useRemoveUserEmailMutation,
  useSetPrimaryUserEmailMutation
} from '@/generated/graphql';

// Components
import EmailAddressRow from '@/components/EmailAddressRow';
import FormInput from '@/components/Form/FormInput';
import ErrorMessages from '@/components/ErrorMessages';
//Interfaces
import {EmailInterface} from '@/app/types';
// Utils and other
import logECS from '@/utils/clientLogger';
import styles from './updateEmailAddress.module.scss';
import {useToast} from '@/context/ToastContext';

const GET_USER = MeDocument;

export interface UpdateEmailAddressProps {
  emailAddresses: EmailInterface[];
}

const UpdateEmailAddress: React.FC<UpdateEmailAddressProps> = ({
  emailAddresses,
}) => {
  const t = useTranslations('UserProfile');
  const toastState = useToast(); // Access the toast state from context
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [errors, setErrors] = useState<UserEmailErrors>({});
  const [addAliasValue, setAddAliasValue] = useState<string>('');

  // Initialize graphql mutations for component
  const [setPrimaryUserEmailMutation] = useSetPrimaryUserEmailMutation();
  const [addUserEmailMutation, { error: addUserEmailError }] = useAddUserEmailMutation();
  const [removeUserEmailMutation, { error: deleteEmailError }] = useRemoveUserEmailMutation();

  const clearErrors = () => {
    setErrors({});
  }

  // Set given email as isPrimary
  const makePrimaryEmail = async (primaryEmail: string) => {
    try {
      const response = await setPrimaryUserEmailMutation({
        variables: {
          email: primaryEmail
        },
        refetchQueries: [
          {
            query: GET_USER,
          },
        ],
      })

      const emailData = response?.data?.setPrimaryUserEmail?.[0];
      if (emailData?.errors && Object.keys(emailData.errors).length > 0) {
        // Use the nullish coalescing operator to ensure `setErrors` receives a `string[]`
        setErrors(emailData.errors ?? {});
        return;
      }
      clearErrors();
    } catch (err) {
      /* We need to call this mutation again when there is an error and
      refetch the user query in order for the page to reload with updated info. I tried just
      calling 'refetch()' for the user query, but that didn't work. */
      if (err instanceof ApolloError) {
        await setPrimaryUserEmailMutation({
          variables: {
            email: primaryEmail
          },
          refetchQueries: [
            {
              query: GET_USER,
            },
          ],
        });
      } else {
        // Display other errors
        setErrors(prevErrors => ({ ...prevErrors, general: 'Error when setting primary email' }));
        logECS('error', 'makePrimaryEmail', {
          error: err,
          url: { path: '/account/profile' }
        });
      }
    }
  }


  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = t('messages.emailAddressUpdateSuccess');
    toastState.add(successMessage, { type: 'success', priority: 1, timeout: 10000 });
  }
  // Adding new email alias
  const handleAddingAlias = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await addUserEmailMutation({
        variables: {
          email: addAliasValue,
          isPrimary: false
        },
        refetchQueries: [
          {
            query: GET_USER,
          },
        ],
      });

      const emailData = response?.data?.addUserEmail;
      if (emailData?.errors && Object.keys(emailData.errors).length > 0) {
        // Use the nullish coalescing operator to ensure `setErrors` receives a `string[]`
        setErrors(emailData.errors ?? {});
        return;
      }
      clearErrors();
      // Clear the add alias input field
      setAddAliasValue('');
      showSuccessToast();
    } catch (err) {
      if (err instanceof ApolloError) {
        /* We need to call this mutation again when there is an error and
refetch the user query in order for the page to reload with updated info. I tried just
calling 'refetch()' for the user query, but that didn't work. */
        await addUserEmailMutation({
          variables: {
            email: addAliasValue,
            isPrimary: false
          },
          refetchQueries: [
            {
              query: GET_USER,
            },
          ],
        });
        // Clear the add alias input field
        setAddAliasValue('');
      } else {
        // Display other errors
        setErrors(prevErrors => ({ ...prevErrors, general: 'Error when adding new email' }));
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
        refetchQueries: [
          {
            query: GET_USER,
          },
        ],
      })

      const emailData = response?.data?.removeUserEmail;
      if (emailData?.errors && Object.keys(emailData.errors).length > 0) {
        setErrors(emailData.errors ?? {});
        return;
      }
      clearErrors();
    } catch (err) {
      if (err instanceof ApolloError) {
        /* We need to call this mutation again when there is an error and
refetch the user query in order for the page to reload with updated info. I tried just
calling 'refetch()' for the user query, but that didn't work. */
        await removeUserEmailMutation({
          variables: {
            email: emailToDelete
          },
          refetchQueries: [
            {
              query: GET_USER,
            },
          ],
        })
      } else {
        // Display other errors
        setErrors(prevErrors => ({ ...prevErrors, general: 'Error when deleting email' }));
        logECS('error', 'deleteEmail', {
          error: err,
          url: { path: '/account/profile' }
        });
      }
    };
  }

  const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Clear errors
    clearErrors();
    setAddAliasValue(value);
  }

  /*Reset errors when email addresses change so that
  errors don't continue to display on page*/
  useEffect(() => {
    setErrors({});
  }, [emailAddresses])

  return (
    <div ref={errorRef}>
      <h2 className={styles.title}>{t('emailAndAuth')}</h2>
      <div className="sectionContainer">
        <div className="sectionContent">
          <div className={styles.subSection}>
            <ErrorMessages errors={errors.general ? [errors.general] : []} ref={errorRef} />
            <h3>{t('headingPrimaryEmail')}</h3>
            <p>{t('primaryEmailDesc')}</p>

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
            <h4>{t('headingSSO')}</h4>
            <p>{t('SSODesc')}</p>
            <h4>{t('headingNotifications')}</h4>
            <p>        {t.rich('notificationsDesc', {
              manage: (chunks) => <Link href="">{chunks}</Link>
            })}</p>
          </div>
          <div className={styles.subSection}>
            <hr />
            <h3>{t('headingAliasEmailAddr')}</h3>
            <p>{t('aliasEmailDesc')}</p>

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
                  type="text"
                  label={t('headingAddAliasEmail')}
                  className={`${styles.addAliasTextField} react - aria - TextField`}
                  isInvalid={errors?.email ? true : false}
                  errorMessage={errors?.email ?? ''}
                  helpMessage={t('helpTextForAddAlias')}
                  onChange={handleAliasChange}
                  value={addAliasValue}
                />
                <Button type="submit">{t('btnAdd')}</Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateEmailAddress;
