'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  Text
} from "react-aria-components";
import { useUserQuery } from '@/generated/graphql';
import { AffiliationsDocument } from '@/generated/graphql';

import PageWrapper from '@/components/PageWrapper';
import ContentContainer from '@/components/ContentContainer';
import EmailAddressRow from '@/components/EmailAddressRow';
import TypeAheadWithOther from '@/components/TypeAheadWithOther';
import BackButton from '@/components/BackButton';
import RightSidebar from '@/components/RightSidebar';

import { handleApolloErrors } from "@/utils/gqlErrorHandler";
import styles from './profile.module.scss';

interface ProfileDataInterface {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  notInList: boolean;
  otherInstitution: string;
  language: string;
}
const ProfilePage: React.FC = () => {
  const [otherField, setOtherField] = useState(false);
  const [formData, setFormData] = useState<ProfileDataInterface>({
    firstName: '',
    lastName: '',
    email: '',
    institution: '',
    notInList: false,
    otherInstitution: '',
    language: ''
  })
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const { data, loading, error, refetch } = useUserQuery();

  useEffect(() => {
    if (data && data.me) {
      setFormData({
        ...formData,
        firstName: data.me.givenName ?? '',
        lastName: data.me.surName ?? '',
        email: data.me.email ?? '',
        institution: data.me.affiliation?.name ?? ''
      })
    }
  }, [data])

  // UseEffect to handle async error handling
  useEffect(() => {
    if (error) {
      const handleErrors = async () => {
        await handleApolloErrors(
          error.graphQLErrors,
          error.networkError,
          setErrors,
          refetch
        );
      };

      handleErrors();
    }
  }, [error, refetch]); // Runs when 'error' changes

  const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    setIsEditing(false);
  }

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <PageWrapper title={'Your profile'}>
      <BackButton />
      <div className={styles.mainContent}>
        <div className={styles.leftContent}>
          <div className={styles.section}>
            <h1 className={styles.title}>Your Profile</h1>
            <ContentContainer>
              <Form>
                {errors && errors.length > 0 &&
                  <div className="error">
                    {errors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                }
                <div className={styles.twoItemRow}>
                  <TextField
                    name="firstName"
                    type="text"
                    isRequired
                  >
                    <Label>First name</Label>
                    {isEditing ? (
                      <Input placeholder={formData.firstName} onChange={e => handleUpdate(e)} />
                    ) : (
                      <p>{formData.firstName}</p>
                    )}
                    <FieldError />
                  </TextField>

                  <TextField
                    name="lastName"
                    type="text"
                  >
                    <Label>Last name</Label>
                    {isEditing ? (
                      <Input placeholder={formData.lastName} onChange={e => handleUpdate(e)} />
                    ) : (
                      <p>{formData.lastName}</p>
                    )}

                    <FieldError />
                  </TextField>
                </div>
                <div className={styles.oneItemRow}>
                  {isEditing ? (
                    <>
                      <TypeAheadWithOther
                        label="Institution"
                        fieldName="institution"
                        placeholder={formData.institution}
                        graphqlQuery={AffiliationsDocument}
                        setOtherField={setOtherField}
                      />
                      {otherField && (
                        <TextField>
                          <Label>Other institution</Label>
                          <Input placeholder="Enter custom institution name" onChange={e => handleUpdate(e)} />
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
                      <p>{formData.institution}</p>
                      <FieldError />
                    </TextField>
                  )}
                </div>

                <div className={styles.oneItemRow}>
                  <TextField
                    name="language"
                    type="text"
                    isRequired
                  >
                    <Label>Language</Label>
                    {isEditing ? (
                      <Input placeholder="CDL(UC)" />
                    ) : (
                      <p>{formData.language}</p>
                    )}

                    <FieldError />
                  </TextField>
                </div>
                {isEditing ? (
                  <Button type="submit" onPress={handleSave}>Update</Button>
                ) : (
                  <Button type="submit" onPress={toggleEdit}>Edit</Button>
                )}
              </Form>
            </ContentContainer>
          </div>
          <div className={styles.section}>
            <h2 className={styles.title}>Email and Authentication</h2>
            <ContentContainer>
              <h3>Primary email address</h3>
              <p>This email will be used for your account login. It can also be used for password resets.</p>
              <EmailAddressRow email={formData.email} isAlias={false} />

              <h4>Single sign on activated</h4>
              <p>This email address is managed by cdl.edu and connected to the institution.</p>
              <h4>Receives notifications</h4>
              <p>This email address will be used for DMP notifications. <Link href="">Manage your notifications</Link>.</p>

              <hr />
              <h3>Alias email addresses</h3>
              <p>Alias email addresses may be used to help others find you, for example if they&lsquo;d like to share a DMP with you.</p>
              <EmailAddressRow email="alias1@test.com" isAlias={true} />
              <EmailAddressRow email="alias2@test.com" isAlias={true} />
              <hr />
              <Form>
                <div className={styles.addContainer}>
                  <TextField
                    name="add-alias"
                    type="text"
                  >
                    <Label>Add alias email address</Label>
                    <Input />
                    <Text slot="description" className={styles.helpText}>You will be sent ane mail to confirm this addition.</Text>
                    <FieldError />

                  </TextField>
                  <Button type="submit">Add</Button>
                </div>
              </Form>
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
      </div>
    </PageWrapper>
  )
}

export default ProfilePage;