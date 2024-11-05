'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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

import { useRouter } from 'next/navigation';

import { useUpdateUserProfileMutation } from '@/generated/graphql';

import { MySelect } from '@/components/MySelect';

import { useMeQuery } from '@/generated/graphql';
import { AffiliationsDocument } from '@/generated/graphql';
import { useLanguagesQuery } from '@/generated/graphql';

import PageWrapper from '@/components/PageWrapper';
import ContentContainer from '@/components/ContentContainer';
import UpdateEmailAddress from '@/components/UpdateEmailAddress';
import TypeAheadWithOther from '@/components/TypeAheadWithOther';
import BackButton from '@/components/BackButton';
import RightSidebar from '@/components/RightSidebar';

import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import styles from './profile.module.scss';

interface Email {
  id?: number | null;
  email: string;
  isPrimary: boolean;
  isConfirmed: boolean;
}

interface ProfileDataInterface {
  firstName: string;
  lastName: string;
  affiliationName: string;
  affiliationId: string;
  otherInstitution: string;
  languageId: string;
  languageName: string;
}

interface FormErrors {
  firstName: string;
  lastName: string;
  affiliationName: string;
  affiliationId: string;
  languageId: string;
  languageName: string;
}

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
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({
    firstName: '',
    lastName: '',
    affiliationName: '',
    affiliationId: '',
    languageId: '',
    languageName: ''
  });

  const [emailAddresses, setEmailAddresses] = useState<Email[]>([]);

  // Fetch user data
  const { data, loading: queryLoading, error: queryError, refetch } = useMeQuery();

  // Fetch languages
  const { data: languageData, loading: languageLoading, error: languageError } = useLanguagesQuery();

  const languages = (languageData?.languages || []).filter((language) => language !== null);

  const [updateUserProfileMutation, { loading: updateUserProfileLoading, error: updateUserProfileError }] = useUpdateUserProfileMutation();

  // Update Profile function
  const updateProfile = async () => {
    try {
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

      if (response.data) {
        setIsEditing(false);
      }
      return response.data;

    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handle submit of Profile form
  const onProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid()) {
      // Do not submit data to backend
    } else {
      // Get form data as an object.
      // let data = Object.fromEntries(new FormData(e.currentTarget));

      // return data;
      const data = await updateProfile();
      console.log(data);
    }
  };

  const cancelEdit = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditing(false);
    setFieldErrors({
      firstName: '',
      lastName: '',
      affiliationId: '',
      affiliationName: '',
      languageId: '',
      languageName: ''
    });
  }

  // Check whether form is valid before submitting
  const isFormValid = (): boolean => {
    // Initialize a flag for form validity
    let isValid = true;

    // Iterate over formData to validate each field
    Object.keys(formData).forEach((key) => {
      const name = key as keyof ProfileDataInterface;
      const value = formData[name];

      // Call validateField to update errors for each field
      validateField(name, value);

      // If there is any error in fieldErrors, mark form as invalid
      if (fieldErrors[name as keyof FormErrors]) {
        isValid = false;
      }
    });
    return isValid;
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!/^[A-Za-z]+$/.test(value)) {
          error = `Please enter a valid ${name} (only letters allowed).`;
        }
        break;
      case 'institution':
        if (value.length < 2) {
          error = 'Institution name cannot be blank.';
        }
        break;
      case 'language':
        if (!/^[A-Za-z\s]+$/.test(value)) {
          error = 'Please enter a valid language (only letters and spaces allowed).';
        }
        break;
    }
    setFieldErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
  }

  const updateAffiliationFormData = async (id: string, value: string) => {
    return setFormData({
      ...formData,
      affiliationName: value,
      affiliationId: id
    })
  }

  useEffect(() => {
    //When data from backend changes, set formData and originalData
    if (data && data.me) {
      // Get name of selected language
      const language = languages.find(lang => lang.id === data?.me?.languageId) || {
        id: '',
        name: '',
        isDefault: false
      };

      // Set emails so we can pass to the UpdateEmailAddresses component
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

  useEffect(() => {
    console.log(formData);
  }, [formData])

  // Handle errors from graphql request
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

  // Handle errors from graphql request
  useEffect(() => {
    const handleErrors = async () => {
      //Remove null and undefined errors
      const errors = [queryError, languageError, updateUserProfileError].filter(Boolean);

      for (const error of errors) {
        await handleApolloErrors(
          error?.graphQLErrors,
          error?.networkError ?? null,
          setErrors,
          refetch,
          router
        );
      }
    };

    if (queryError || languageError || updateUserProfileError) {
      handleErrors();
    }
  }, [queryError, languageError, updateUserProfileError, refetch]);

  // Update form data
  const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  // Handle any changes to form field values
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleUpdate(e); // Your existing state update function
    if (e.target.value) {
      validateField(name, value);
    } else {
      // If no value, clear the specific field's error
      setFieldErrors(prevErrors => ({
        ...prevErrors,
        [name]: '' // Clear the error for the current field if that field is empty
      }));
    }

  };

  if (queryLoading) {
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
                <Form onSubmit={onProfileSubmit}>
                  {errors && errors.length > 0 &&
                    <div className="error">
                      {errors.map((error, index) => (
                        <p key={index}>{error}</p>
                      ))}
                    </div>
                  }
                  <div className={`${styles.twoItemRow} ${styles.formRow}`}>
                    {isEditing ? (
                      <>
                        <TextField
                          name="firstName"
                          type="text"
                          className={!!fieldErrors['firstName'] ? styles.fieldError : ''}
                          isInvalid={!!fieldErrors['firstName']}
                        >
                          <Label>First name</Label>
                          <Input
                            name="firstName"
                            placeholder={formData.firstName}
                            onChange={handleInputChange}
                            value={formData.firstName}
                          />
                          <FieldError className={`${styles.errorMessage} react-aria-FieldError`}>{fieldErrors['firstName']}</FieldError>
                        </TextField>

                      </>
                    ) : (
                      <Text slot="firstName" className={styles.readOnlyField}>
                        <div className={styles.fieldLabel}>First name</div>
                        <p>{formData.firstName}</p>
                      </Text>
                    )}


                    {isEditing ? (
                      <>
                        <TextField
                          name="lastName"
                          type="text"
                          className={!!fieldErrors['lastName'] ? styles.fieldError : ''}
                          isInvalid={!!fieldErrors['lastName']}
                        >
                          <Label>Last name</Label>
                          <Input
                            name="lastName"
                            placeholder={formData.lastName}
                            onChange={handleInputChange}
                            value={formData.lastName}
                          />
                          <FieldError className={`${styles.errorMessage} react-aria-FieldError`}>{fieldErrors['lastName']}</FieldError>
                        </TextField>
                      </>
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
                          placeholder={formData.affiliationName}
                          graphqlQuery={AffiliationsDocument}
                          setOtherField={setOtherField}
                          required={true}
                          error={fieldErrors.affiliationName}
                          updateAffiliationFormData={updateAffiliationFormData}
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
                      <MySelect
                        label="Language"
                        isRequired
                        name="institution"
                        items={languages}

                        errorMessage="A selection is required"
                        onSelectionChange={selected => setFormData({ ...formData, languageId: selected as string })}
                        selectedKey={formData.languageId.trim()}
                      >
                        {languages && languages.map((language) => {
                          return (
                            <ListBoxItem key={language.id}>{language.id}</ListBoxItem>
                          )

                        })}
                      </MySelect>
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
                      <Button type="submit" className={styles.btn}>Update</Button>
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