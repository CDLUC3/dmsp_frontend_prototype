'use client'

import React, { useEffect, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  ListBoxItem,
  Text,
} from "react-aria-components";

// GraphQL queries and mutations
import {
  useMeQuery,
  useUpdateUserProfileMutation,
  AffiliationsDocument,
  useLanguagesQuery
} from '@/generated/graphql';

// Components
import PageHeader from '@/components/PageHeader';
import UpdateEmailAddress from '@/components/UpdateEmailAddress';
import TypeAheadWithOther from '@/components/Form/TypeAheadWithOther';
import { FormSelect } from '@/components/Form/FormSelect';
import FormInput from '@/components/Form/FormInput';
import {
  LayoutWithPanel,
  ContentContainer,
  SidebarPanel,
} from '@/components/Container';

// Interfaces
import {
  EmailInterface,
  LanguageInterface,
  ProfileDataInterface,
  FormErrorsInterface
} from '@/app/types';

// Utils and other
import logECS from '@/utils/clientLogger';
import { refreshAuthTokens } from "@/utils/authHelper";
import styles from './profile.module.scss';

const ProfilePage: React.FC = () => {
  const t = useTranslations('UserProfile');
  const pathname = usePathname();
  const currentLocale = useLocale();
  const router = useRouter();
  const [otherField, setOtherField] = useState(false);
  // We need to save the original data for when users cancel their form updates
  const [originalData, setOriginalData] = useState<ProfileDataInterface>();
  const [formData, setFormData] = useState<ProfileDataInterface>({
    firstName: '',
    lastName: '',
    affiliationName: '',
    affiliationId: '',
    otherAffiliationName: '',
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
    otherAffiliationName: ''
  });
  const [emailAddresses, setEmailAddresses] = useState<EmailInterface[]>([]);
  const [languages, setLanguages] = useState<LanguageInterface[]>([]);

  const switchLanguage = (newLocale: string) => {
    if (newLocale !== currentLocale) {
      const newPath = `/${newLocale}${pathname}`;
      router.push(newPath);
    }
  };

  // Initialize user profile mutation
  const [updateUserProfileMutation, { loading: updateUserProfileLoading }] = useUpdateUserProfileMutation();

  // Run queries
  const { data: languageData } = useLanguagesQuery();
  const { data, loading: queryLoading, error: queryError, refetch } = useMeQuery();

  // Client-side validation of fields
  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'firstName':
        if (!value || value.length <= 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'lastName':
        if (!value || value.length <= 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'affiliationName':
        if (!value || value.length <= 2) {
          error = 'Institution name cannot be blank and must be at least 2 characters long';
        }
        break;
      case 'otherAffiliationName':
        // We only want to validate this field if the user specifically selected this 'Other' option
        if (formData['affiliationName'] === 'Other(organization not listed)') {
          if (!value || value.length <= 2) {
            error = 'Institution name cannot be blank and must be at least 2 characters long';
          }
          break;
        }
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
          otherAffiliationName: formData.otherAffiliationName,
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
        // Refresh token to include preferred language in token
        await refreshAuthTokens();
        // Update pathname to match the selected language so user can see page in selected language
        switchLanguage(formData.languageId, currentLocale, pathname, router);
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        //
        setIsEditing(false);
      } else {
        // Handle other types of errors
        setErrors(prevErrors => [...prevErrors, 'Error when updating profile']);
      }
    }
  };

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
      otherAffiliationName: ''
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
      otherAffiliationName: ''
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

  /* This function is called by the child component, UpdateEmailAddress 
  when affiliation/institution is changed */
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
  }, [languageData]);

  useEffect(() => {
    const updateFormData = async () => {
      if (data && data.me && languageData) {
        // Get local languages that are not null (for Type guard)
        const loadedLanguages = (languageData.languages || []).filter((language) => language !== null);

        // Find the selected language or fallback
        const selectedLanguage = loadedLanguages.find((lang) => lang.id === data?.me?.languageId) || {
          id: '',
          name: '',
          isDefault: false,
        };

        // Set user email list from data
        if (data.me.emails) {
          const validEmails = data.me.emails
            .filter((email): email is NonNullable<typeof email> => email !== null)
            .map((email) => ({
              id: email.id ?? undefined,
              email: email.email,
              isPrimary: email.isPrimary,
              isConfirmed: email.isConfirmed,
            }));
          setEmailAddresses(validEmails);
        } else {
          setEmailAddresses([]);
        }

        // Update originalData and formData
        const newOriginalData = {
          firstName: data.me.givenName ?? '',
          lastName: data.me.surName ?? '',
          affiliationName: data.me.affiliation?.name ?? '',
          affiliationId: data.me.affiliation?.uri ?? '',
          otherAffiliationName: '',
          languageId: data.me.languageId,
          languageName: selectedLanguage.name,
        };

        setOriginalData(newOriginalData);

        setFormData((prev) => ({
          ...prev,
          ...newOriginalData,
        }));
      }
    };

    updateFormData();
  }, [data, languageData]);

  // Update form data
  const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    clearActiveFieldError(name);
    setFormData({ ...formData, [name]: value });
  }

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  // Handle any changes to form field values
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdate(e);
  };

  // Handle errors from loading of user data
  useEffect(() => {
    if (queryError) {
      refetch();
    }
  }, [queryError]);

  // Show loading message on first page load when getting user
  const loading = queryLoading;
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title={t('headingUpdateProfile')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{t('breadcrumbHome')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/account/profile">{t('headingUpdateProfile')}</Link></Breadcrumb>
          </Breadcrumbs>
        }
        className="page-template-list"
      />
      <div className={styles.main}>
        <div className={styles.mainContent}>
          <LayoutWithPanel>
            <ContentContainer className={styles.layoutContentContainer}>
              <h2>{t('yourProfile')}</h2>
              <div className="sectionContainer">
                <div className={`sectionContent ${styles.section}`}>
                  <Form onSubmit={handleProfileSubmit}>
                    {errors && errors.length > 0 &&
                      <div className="error" role="alert" aria-live="assertive">
                        {errors.map((error, index) => (
                          <p key={index}>{error}</p>
                        ))}
                      </div>
                    }
                    <div className="form-row two-item-row">
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
                          <div className="field-label">{t('firstName')}</div>
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
                          <div className="field-label">{t('lastName')}</div>
                          <p>{formData.lastName}</p>
                        </Text>
                      )}

                    </div>

                    <div className="form-row one-item-row">
                      {isEditing ? (
                        <>
                          <TypeAheadWithOther
                            label="Institution"
                            fieldName="institution"
                            graphqlQuery={AffiliationsDocument}
                            setOtherField={setOtherField}
                            required={true}
                            error={fieldErrors.affiliationName}
                            helpText={t('helpTextSearchForInstitution')}
                            updateFormData={updateAffiliationFormData}
                            value={formData.affiliationName}
                          />
                          {otherField && (
                            <div className="form-row one-item-row">
                              <FormInput
                                name="otherAffiliationName"
                                type="text"
                                label="Other institution"
                                placeholder={formData.otherAffiliationName}
                                value={formData.otherAffiliationName}
                                onChange={handleInputChange}
                                isInvalid={!!fieldErrors['otherAffiliationName']}
                                errorMessage={fieldErrors['otherAffiliationName']}
                              />

                            </div>
                          )}
                        </>
                      ) : (
                        <Text slot="institution" className={styles.readOnlyField}>
                          <div className="field-label">{t('institution')}</div>
                          <p>{formData.affiliationName}</p>
                        </Text>
                      )}
                    </div>

                    <div className="form-row one-item-row">
                      {isEditing ? (
                        <FormSelect
                          label="Language"
                          isRequired
                          name="institution"
                          items={languages}
                          errorMessage="A selection is required"
                          helpMessage={t('helpTextSelectYourLanguage')}
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
                          <div className="field-label">{t('language')}</div>
                          <p>{formData.languageName}</p>
                        </Text>
                      )}
                    </div>
                    {isEditing ? (
                      <div className={styles.btnContainer}>
                        <Button className="secondary" onPress={cancelEdit}>{t('btnCancel')}</Button>
                        <Button type="submit" isDisabled={updateUserProfileLoading} className={styles.btn}>{updateUserProfileLoading ? t('btnUpdating') : t('btnUpdate')}</Button>
                      </div>
                    ) : (
                      <div className={styles.btnContainer}>
                        <Button type="submit" onPress={handleEdit} className={styles.btn}>{t('btnEdit')}</Button>
                      </div>
                    )}
                  </Form>
                </div>
              </div>

              <UpdateEmailAddress
                emailAddresses={emailAddresses}
              />
            </ContentContainer>
            <SidebarPanel className={styles.layoutSidebarPanel}>
              <h2>{t('headingRelatedActions')}</h2>
              <ul className={styles.relatedItems}>
                <li><Link href="/account/update-password">{t('linkUpdatePassword')}</Link></li>
                <li><Link href="/account/connections">{t('linkUpdateConnections')}</Link></li>
                <li><Link href="/account/notifications">{t('linkManageNotifications')}</Link></li>
              </ul>
            </SidebarPanel>
          </LayoutWithPanel>
        </div>
      </div >
    </>
  )
}

export default ProfilePage;