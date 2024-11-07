'use client'

import React, { useEffect, useState } from 'react';
import { ApolloError } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  ListBoxItem,
  TextField,
  Text,
} from "react-aria-components";

// GraphQL queries and mutations
import { useMeQuery, useUpdateUserProfileMutation, AffiliationsDocument, useLanguagesQuery } from '@/generated/graphql';

// Components
import PageWrapper from '@/components/PageWrapper';
import ContentContainer from '@/components/ContentContainer';
import UpdateEmailAddress from '@/components/UpdateEmailAddress';
import TypeAheadWithOther from '@/components/TypeAheadWithOther';
import BackButton from '@/components/BackButton';
import RightSidebar from '@/components/RightSidebar';
import { FormSelect } from '@/components/Form/FormSelect';
import FormInput from '@/components/Form/FormInput';

// Interfaces
import { EmailInterface, LanguageInterface, ProfileDataInterface, FormErrorsInterface } from '@/app/types';
// Utils and other
import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import logECS from '@/utils/clientLogger';
import styles from './profile.module.scss';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [otherField, setOtherField] = useState(false);
  // We need to save the original data for when users cancel their form updates
  const [originalData, setOriginalData] = useState<ProfileDataInterface>();
  const [formData, setFormData] = useState<ProfileDataInterface>({
    firstName: '',
    lastName: '',
    affiliationName: '',
    affiliationId: '',
    otherInstitution: '',
    languageId: '',
    languageName: '',
  })
  const [isEditing, setIsEditing] = useState(false);
  // Errors returned from request
  const [errors, setErrors] = useState<string[]>([]);
  // Client-side validation field errors
  const [fieldErrors, setFieldErrors] = useState<FormErrorsInterface>({
    firstName: '',
    lastName: '',
    affiliationName: '',
    affiliationId: '',
    languageId: '',
    languageName: '',
    otherInstitution: ''
  });
  const [emailAddresses, setEmailAddresses] = useState<EmailInterface[]>([]);
  const [languages, setLanguages] = useState<LanguageInterface[]>([]);
  const [, forceRender] = useState(false);

  // Initialize user profile mutation
  const [updateUserProfileMutation, { loading: updateUserProfileLoading }] = useUpdateUserProfileMutation();

  // Run queries
  const { data: languageData, error: languageError, refetch: languageRefetch } = useLanguagesQuery();
  const { data, loading: queryLoading, error: queryError, refetch } = useMeQuery();

  // Client-side validation of fields
  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'firstName':
        if (!value || value.length <= 2) {
          error = `Please enter a valid name.`;
        }
        break;
      case 'lastName':
        if (!value || value.length <= 2) {
          error = `Please enter a valid name.`;
        }
        break;
      case 'affiliationName':
        if (!value || value.length <= 2) {
          error = 'Institution name cannot be blank.';
        }
        break;
    }
    setFieldErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
    return error;
  }

  const profileUpdateMutation = async () => {
    const response = await updateUserProfileMutation({
      variables: {
        input: {
          givenName: formData.firstName,
          surName: formData.lastName,
          affiliationId: formData.affiliationId,
          languageId: formData.languageId,
        }
      },
    });
    return response.data;
  }
  // Update Profile info
  const updateProfile = async () => {
    try {
      const response = await profileUpdateMutation();
      if (response) {
        setIsEditing(false);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        await handleApolloErrors(
          error.graphQLErrors,
          error.networkError,
          setErrors,
          () => {
            return updateUserProfileMutation({
              variables: {
                input: {
                  givenName: formData.firstName,
                  surName: formData.lastName,
                  affiliationId: formData.affiliationId,
                  languageId: formData.languageId,
                },
              },
            });
          },
          router
        );
        setIsEditing(false);
      } else {
        // Handle other types of errors
        setErrors(prevErrors => [...prevErrors, 'Error when updating profile']);
      }
    }
  };

  //Passed to UpdateEmailAddress which calls it after deleting email
  const handleRefetch = () => {
    return refetch();
  }

  // Handle form submit
  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    clearAllFieldErrors();

    if (isFormValid()) {
      // Update profile
      await updateProfile();
      setErrors([]); // Clear errors on successful submit
    }
  };

  const clearAllFieldErrors = () => {
    //Remove all field errors
    setFieldErrors({
      firstName: '',
      lastName: '',
      affiliationId: '',
      affiliationName: '',
      languageId: '',
      languageName: '',
      otherInstitution: ''
    });
  }

  // Clear any errors for the current active field
  const clearActiveFieldError = (name: string) => {
    // Clear error for active field
    setFieldErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  }

  const cancelEdit = () => {
    // Revert back to original data
    if (originalData) {
      setFormData(originalData);
    }

    //Hide form
    setIsEditing(false);

    //Remove all field errors
    clearAllFieldErrors();
  }

  // Check whether form is valid before submitting
  const isFormValid = (): boolean => {
    // Initialize a flag for form validity
    let isValid = true;
    let errors: FormErrorsInterface = {
      firstName: '',
      lastName: '',
      affiliationId: '',
      affiliationName: '',
      languageId: '',
      languageName: '',
      otherInstitution: ''
    };

    // Iterate over formData to validate each field
    Object.keys(formData).forEach((key) => {
      const name = key as keyof ProfileDataInterface;
      const value = formData[name];

      // Call validateField to update errors for each field
      const error = validateField(name, value);
      if (error) {
        isValid = false;
        errors[name] = error;
      }
    });
    setFieldErrors(errors);
    return isValid;
  };

  // This function is called by the child component, UpdateEmailAddress when affiliation/institution is changed
  const updateAffiliationFormData = async (id: string, value: string) => {
    clearActiveFieldError('affiliationName');
    return setFormData({
      ...formData,
      affiliationName: value,
      affiliationId: id
    })
  }

  useEffect(() => {
    const handleLanguageLoad = async () => {
      try {
        if (languageError) {
          await handleApolloErrors(
            languageError?.graphQLErrors,
            languageError?.networkError ?? null,
            setErrors,
            languageRefetch,
            router
          );
        }

        if (languageData) {
          const languages = (languageData?.languages || []).filter((language) => language !== null);
          setLanguages(languages);
        }
      } catch (err) {
        logECS('error', 'loading languages', {
          error: err,
          url: { path: '/account/profile' }
        });
        setErrors(prevErrors => [...prevErrors, 'Something went wrong. Please try again.']);
      }
    };

    handleLanguageLoad();
  }, [languageData, languageError, languageRefetch]);

  useEffect(() => {
    // This effect will run whenever the `refetch` function changes
    // This will force a re-render of the parent component
    forceRender((prev) => !prev);
  }, [refetch]);

  useEffect(() => {
    //When data from backend changes, set formData and originalData
    if (data && data.me) {
      // Get name of selected language
      const language = languages.find(lang => lang.id === data?.me?.languageId) || {
        id: '',
        name: '',
        isDefault: false
      };

      // Set email list so we can pass to the UpdateEmailAddresses component
      if (data?.me?.emails) {
        const validEmails = data.me.emails
          // Filter out nulls and map to Email type
          .filter((email): email is NonNullable<typeof email> => email !== null)
          .map(email => ({
            id: email.id ?? undefined,
            email: email.email,
            isPrimary: email.isPrimary,
            isConfirmed: email.isConfirmed
          }));

        setEmailAddresses(validEmails);
      } else {
        setEmailAddresses([]); // Reset to empty array if no emails data
      }

      setOriginalData({
        firstName: data.me.givenName ?? '',
        lastName: data.me.surName ?? '',
        affiliationName: data.me.affiliation?.name ?? '',
        affiliationId: data.me.affiliation?.uri ?? '',
        otherInstitution: '',
        languageId: data.me.languageId,
        languageName: language.name
      });

      setFormData({
        ...formData,
        firstName: data.me.givenName ?? '',
        lastName: data.me.surName ?? '',
        affiliationName: data.me.affiliation?.name ?? '',
        affiliationId: data.me.affiliation?.uri ?? '',
        languageId: data.me.languageId,
        languageName: language.name
      })
    }
  }, [data])


  // Update form data
  const handleUpdate = (name: string, value: string) => {
    clearActiveFieldError(name)
    setFormData({ ...formData, [name]: value });
  }

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  // Handle any changes to form field values
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleUpdate(name, value);
  };

  // Handle errors from loading of user data
  useEffect(() => {
    if (queryError) {
      const handleErrors = async () => {
        await handleApolloErrors(
          queryError.graphQLErrors,
          queryError.networkError,
          setErrors,
          refetch,
          router
        );
      };

      handleErrors();
    }
  }, [queryError, refetch]); // Runs when 'error' changes or 'refetch' happens

  // Show loading message on first page load when getting user
  const loading = queryLoading;
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageWrapper title={'Update profile'}>
      <BackButton />
      <div className={styles.main}>
        <div className={styles.mainContent}>
          <h1 className={styles.title}>Update profile</h1>
          <div className={styles.section}>
            <h2>Your Profile</h2>
            <ContentContainer>
              <div className={styles.subSection}>
                <Form onSubmit={handleProfileSubmit}>
                  {errors && errors.length > 0 &&
                    <div className="error" role="alert" aria-live="assertive">
                      {errors.map((error, index) => (
                        <p key={index}>{error}</p>
                      ))}
                    </div>
                  }
                  <div className={`${styles.twoItemRow} ${styles.formRow}`}>
                    {isEditing ? (
                      <FormInput
                        name="firstName"
                        type="text"
                        label="First name"
                        placeholder={formData.firstName}
                        value={formData.firstName}
                        onChange={handleInputChange}
                        isInvalid={!!fieldErrors['firstName']}
                        errorMessage={fieldErrors['firstName']}
                      />
                    ) : (
                      <Text slot="firstName" className={styles.readOnlyField}>
                        <div className={styles.fieldLabel}>First name</div>
                        <p>{formData.firstName}</p>
                      </Text>
                    )}

                    {isEditing ? (
                      <FormInput
                        name="lastName"
                        type="text"
                        label="Last name"
                        placeholder={formData.lastName}
                        value={formData.lastName}
                        onChange={handleInputChange}
                        isInvalid={!!fieldErrors['lastName']}
                        errorMessage={fieldErrors['lastName']}
                      />
                    ) : (
                      <Text slot="lastName" className={styles.readOnlyField}>
                        <div className={styles.fieldLabel}>Last name</div>
                        <p>{formData.lastName}</p>
                      </Text>
                    )}

                  </div>

                  <div className={`${styles.oneItemRow} ${styles.formRow}`}>
                    {isEditing ? (
                      <>
                        <TypeAheadWithOther
                          label="Institution"
                          fieldName="institution"
                          graphqlQuery={AffiliationsDocument}
                          setOtherField={setOtherField}
                          required={true}
                          error={fieldErrors.affiliationName}
                          updateFormData={updateAffiliationFormData}
                          value={formData.affiliationName}
                        />
                        {otherField && (
                          <TextField type="text" name="institution">
                            <Label>Other institution</Label>
                            <Input placeholder="Enter custom institution name" onChange={e => handleUpdate(e)} />
                            <FieldError />
                          </TextField>
                        )}
                      </>
                    ) : (
                      <Text slot="institution" className={styles.readOnlyField}>
                        <div className={styles.fieldLabel}>Institution</div>
                        <p>{formData.affiliationName}</p>
                      </Text>
                    )}
                  </div>

                  <div className={`${styles.oneItemRow} ${styles.formRow}`}>
                    {isEditing ? (
                      <FormSelect
                        label="Language"
                        isRequired
                        name="institution"
                        items={languages}
                        errorMessage="A selection is required"
                        helpMessage="Select your preferred language"
                        onSelectionChange={selected => setFormData({ ...formData, languageId: selected as string })}
                        selectedKey={formData.languageId.trim()}
                      >
                        {languages && languages.map((language) => {
                          return (
                            <ListBoxItem key={language.id}>{language.id}</ListBoxItem>
                          )

                        })}
                      </FormSelect>
                    ) : (
                      <Text slot="language" className={styles.readOnlyField}>
                        <div className={styles.fieldLabel}>Language</div>
                        <p>{formData.languageName}</p>
                      </Text>
                    )}
                  </div>
                  {isEditing ? (
                    <>
                      <Button className="secondary" onPress={cancelEdit}>Cancel</Button>
                      <Button type="submit" isDisabled={updateUserProfileLoading} className={styles.btn}>{updateUserProfileLoading ? 'Updating' : 'Update'}</Button>
                    </>
                  ) : (
                    <Button type="submit" onPress={handleEdit} className={styles.btn}>Edit</Button>
                  )}
                </Form>
              </div>
            </ContentContainer>
          </div>
          <UpdateEmailAddress
            emailAddresses={emailAddresses}
            setEmailAddresses={setEmailAddresses}
            refetch={handleRefetch}
          />
        </div>
        <div className={styles.rightSidebar}>
          <RightSidebar>
            <h2>Related actions</h2>
            <ul className={styles.relatedItems}>
              <li><Link href="/account/update-password">Update password</Link></li>
              <li><Link href="/account/connections">Update connections</Link></li>
              <li><Link href="/account/notifications">Manage notifications</Link></li>
            </ul>
          </RightSidebar>
        </div>
      </div >
    </PageWrapper >
  )
}

export default ProfilePage;
