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

import { useUserQuery } from '@/generated/graphql';
import { AffiliationsDocument } from '@/generated/graphql';
import { useLanguagesQuery } from '@/generated/graphql';

import PageWrapper from '@/components/PageWrapper';
import ContentContainer from '@/components/ContentContainer';
import EmailAddressRow from '@/components/EmailAddressRow';
import TypeAheadWithOther from '@/components/TypeAheadWithOther';
import BackButton from '@/components/BackButton';
import RightSidebar from '@/components/RightSidebar';

import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import styles from './profile.module.scss';

// Mock initial data for emails
const initialEmails = [
  { email: 'email1@test.com', isPrimary: false },
  { email: 'email2@test.com', isPrimary: true },
  { email: 'email3@test.com', isPrimary: false }
];

interface ProfileDataInterface {
  firstName: string;
  lastName: string;
  email: string;
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
    email: '',
    affiliationName: '',
    affiliationId: '',
    otherInstitution: '',
    languageId: '',
    languageName: ''
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

  //Mock emails
  const [emails, setEmails] = useState(initialEmails);

  // Fetch user data
  const { data, loading: queryLoading, error: queryError, refetch } = useUserQuery();

  // Fetch languages
  const { data: languageData, loading: languageLoading, error: languageError } = useLanguagesQuery();

  const languages = (languageData?.languages || []).filter((language) => language !== null);

  // Initialize mutation
  const [updateUserProfileMutation, { loading: mutationLoading, error: mutationError }] = useUpdateUserProfileMutation();

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
        }, // Send the profile data in the mutation variables
        // Update the cache or refetch
        update: (cache, { data: mutationData }) => {
          if (mutationData?.updateUserProfile) {
            cache.modify({
              fields: {
                user(existingUserData = {}) {
                  // Merge the existing user data with the updated profile data
                  return { ...existingUserData, ...mutationData.updateUserProfile };
                },
              },
            });
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

  // Function to update an email's "isPrimary" status
  const makePrimary = (emailToMakePrimary: string) => {
    const updatedEmails = emails.map((email) =>
      email.email === emailToMakePrimary
        ? { ...email, isPrimary: true }
        : { ...email, isPrimary: false }
    );
    setEmails(updatedEmails); // Update state with new email list
  };

  // Function to delete an email
  const deleteEmail = (emailToDelete: string) => {
    const updatedEmail = emails.filter((email) => email.email !== emailToDelete);
    setEmails(updatedEmail);
  };

  const handleAddingAlias = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newAlias = e.currentTarget.elements['addAlias'].value;
    setEmails([...emails, { email: newAlias, isPrimary: false }]);
    form.reset();
  }

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
      setOriginalData({
        firstName: data.me.givenName ?? '',
        lastName: data.me.surName ?? '',
        email: data.me.email ?? '',
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
        email: data.me.email ?? '',
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
    <PageWrapper title={'Your profile'}>
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
                    <TextField
                      name="firstName"
                      type="text"
                      className={!!fieldErrors['firstName'] ? styles.fieldError : ''}
                      isInvalid={!!fieldErrors['firstName']}
                    >
                      <Label>First name</Label>
                      {isEditing ? (
                        <>
                          <Input
                            name="firstName"
                            placeholder={formData.firstName}
                            onChange={handleInputChange}
                            value={formData.firstName}
                          />
                          <FieldError className={`${styles.errorMessage} react-aria-FieldError`}>{fieldErrors['firstName']}</FieldError>
                        </>
                      ) : (
                        <p>{formData.firstName}</p>
                      )}
                    </TextField>

                    <TextField
                      name="lastName"
                      type="text"
                      className={!!fieldErrors['lastName'] ? styles.fieldError : ''}
                      isInvalid={!!fieldErrors['lastName']}
                    >
                      <Label>Last name</Label>
                      {isEditing ? (
                        <>
                          <Input
                            name="lastName"
                            placeholder={formData.lastName}
                            onChange={handleInputChange}
                            value={formData.lastName}
                          />
                          <FieldError className={`${styles.errorMessage} react-aria-FieldError`}>{fieldErrors['lastName']}</FieldError>
                        </>
                      ) : (
                        <p>{formData.lastName}</p>
                      )}
                    </TextField>
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
                      <TextField
                        name="institution"
                        type="text"
                        isRequired
                      >
                        <Label>Institution</Label>
                        <p>{formData.affiliationName}</p>
                        <FieldError />
                      </TextField>
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
                      <>
                        <TextField
                          name="language"
                          type="text"
                        >
                          <Label>Language</Label>
                          <p>{formData.languageName}</p>
                          <FieldError />
                        </TextField>
                      </>
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
          <div className={styles.section}>
            <h2 className={styles.title}>Email and Authentication</h2>
            <ContentContainer>
              <div className={styles.subSection}>
                <h3>Primary email address</h3>
                <p>This email will be used for your account login. It can also be used for password resets.</p>

                {/* Render the primary email */}
                {emails.filter(emailObj => emailObj.isPrimary).map((emailObj) => (
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

                {emails.filter(emailObj => !emailObj.isPrimary).map((emailObj) => (
                  <EmailAddressRow
                    key={emailObj.email}
                    email={emailObj.email}
                    isAlias={true}
                    deleteEmail={deleteEmail}
                    makePrimary={makePrimary}
                  />
                ))}
                <hr />
                <Form onSubmit={handleAddingAlias}>
                  <div className={styles.addContainer}>
                    <TextField
                      name="add-alias"
                      type="email"
                      isRequired
                    >
                      <Label>Add alias email address</Label>
                      <FieldError>
                        {({ validationDetails }) => (
                          validationDetails.valueMissing ? 'Please enter an email address.' : ''
                        )}
                      </FieldError>
                      <Input id="addAlias" name="addAlias" />
                      <Text slot="description" className={styles.helpText}>You will be sent an email to confirm this addition.</Text>
                    </TextField>
                    <Button type="submit">Add</Button>
                  </div>
                </Form>
              </div>
            </ContentContainer>
          </div>
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