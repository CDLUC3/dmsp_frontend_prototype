'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApolloError } from "@apollo/client";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
} from 'react-aria-components';

// Graphql mutations
import {
  TemplateCollaboratorsDocument,
  useTemplateCollaboratorsQuery,
  useAddTemplateCollaboratorMutation,
  useRemoveTemplateCollaboratorMutation
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import FormInput from '@/components/Form/FormInput';
import ConfirmModal from '@/components/Modal/ConfirmModal';
import {
  LayoutContainer,
  ContentContainer,
} from '@/components/Container';

//Utils and other
import logECS from '@/utils/clientLogger';
import { isValidEmail } from '@/utils/validation';
import { scrollToTop } from '@/utils/general';
import { useToast } from '@/context/ToastContext';
import styles from './TemplateAccessPage.module.scss';

const GET_COLLABORATORS = TemplateCollaboratorsDocument;

interface OrganizationInterface {
  name: string;
  admins: {
    email: string | null;
    givenName?: string | null;
    surName?: string | null;
  }[]
}
const TemplateAccessPage: React.FC = () => {
  // Get templateId param
  const params = useParams();
  const { templateId } = params; // From route /template/:templateId
  const { add: addToast } = useToast();

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Errors returned from request
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [addCollaboratorEmail, setAddCollaboratorEmail] = useState<string>('');
  const [organization, setOrganization] = useState<OrganizationInterface>();


  // localization keys
  const Global = useTranslations('Global');
  const AccessPage = useTranslations('TemplateAccessPage');

  // Run template query to get template name
  const { data: templateCollaboratorData, loading, error: templateQueryErrors } = useTemplateCollaboratorsQuery(
    {
      variables: { templateId: Number(templateId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Initialize graphql mutations for component
  const [addTemplateCollaboratorlMutation] = useAddTemplateCollaboratorMutation();
  const [removeTemplateCollaboratorMutation] = useRemoveTemplateCollaboratorMutation({
    notifyOnNetworkStatusChange: true,
  });
  const clearErrors = () => {
    setErrorMessages([]);
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Clear errors
    clearErrors();
    setAddCollaboratorEmail(value);
  }

  // Revoke collaborator access for provided email
  const handleRevokeAccess = useCallback(async (emailToRevoke: string) => {
    try {
      const response = await removeTemplateCollaboratorMutation({
        variables: { templateId: Number(templateId), email: emailToRevoke },
        refetchQueries: [{ query: GET_COLLABORATORS, variables: { templateId: Number(templateId) } }],
      });

      if (response?.data?.removeTemplateCollaborator) {
        clearErrors();
        // Show Email Revoked Success message
        const successMessage = AccessPage('messages.success.emailSuccessfullyRevoked');
        addToast(successMessage, { type: 'success', priority: 1 });
      }
    } catch (err) {
      if (err instanceof ApolloError) {
        setErrorMessages(prevErrors => [...prevErrors, err.message]);
      } else {
        setErrorMessages(prevErrors => [...prevErrors, AccessPage('messages.errors.errorRemovingEmail')]);
        logECS('error', 'handleRevokeAccess', {
          error: err,
          url: { path: '/template/[templateId]/access' }
        });
      }
    }
  }, [templateId, removeTemplateCollaboratorMutation]);


  // Add new collaborator email
  const handleAddingEmail = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await addTemplateCollaboratorlMutation({
        variables: {
          email: addCollaboratorEmail,
          templateId: Number(templateId)
        },
        // Need to refetch to display updated data on page
        refetchQueries: [
          {
            query: GET_COLLABORATORS,
            variables: { templateId: Number(templateId) }
          },
        ],
      });

      const emailData = response?.data?.addTemplateCollaborator;
      if (emailData?.errors?.length) {
        return setErrorMessages(emailData.errors);
      }

      clearErrors();
      setAddCollaboratorEmail('');

      // Show success message
      const successMessage = AccessPage('messages.success.emailInviteSent');
      addToast(successMessage, { type: 'success', priority: 1 });
    } catch (err) {
      if (err instanceof ApolloError) {
        setErrorMessages(prevErrors => [...prevErrors, err.message]);
        setAddCollaboratorEmail('');
      } else {
        setErrorMessages(prevErrors => [...prevErrors, AccessPage('messages.errors.errorAddingCollaborator')]);
        logECS('error', 'handleAddingEmail', {
          error: err,
          url: { path: '/template/[templateId]/access' }
        });
      }
    }
  }, [templateId, addCollaboratorEmail, addTemplateCollaboratorlMutation]);


  // Render the organization list of admins
  const renderOrgAdmins = useMemo(() => {
    if (!organization) {
      return null;
    }
    return (
      <ul className={styles.peopleList} role="list">
        {organization.admins.map((admin) => (
          <li key={admin.email} className={styles.personItem}>
            <div className={styles.personInfo}>
              <div className={styles.personName}>{admin.givenName} {admin.surName}</div>
              <div className={styles.personEmail} aria-label={`Email: ${admin.email}`}>
                {admin.email}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }, [organization]);

  /* Handles rendering list of existing contributors*/
  const renderExternalPeople = useMemo(() => {
    if (loading) {
      return <div>{Global('messaging.loading')}...</div>;
    }

    if (templateQueryErrors) {
      return <div>{AccessPage('messages.errors.errorLoadingCollaborators')}</div>;
    }

    const collaborators = templateCollaboratorData?.template?.collaborators ?? [];

    if (collaborators.length === 0) {
      return <div className={styles.emptyState} role="status">{AccessPage('messages.info.noCollaborators')}</div>;
    }

    return (
      <ul className={styles.peopleList} role="list">
        {collaborators.map((person) => (
          <li key={person.id ?? person.email} className={styles.personItem}>
            <div className={styles.personInfo}>
              <div className={styles.personName}>{person.user?.givenName} {person.user?.surName}</div>
              <div className={styles.personEmail} aria-label={`Email: ${person.email}`}>
                {person.email}
              </div>
            </div>
            <ConfirmModal
              email={person.email}
              onConfirm={handleRevokeAccess}
            />
          </li>
        ))}
      </ul>
    );
  }, [loading, templateQueryErrors, templateCollaboratorData, handleRevokeAccess]);

  // If errors when submitting publish form, scroll them into view
  useEffect(() => {
    if (errorMessages.length > 0) {
      scrollToTop(errorRef);
    }
  }, [errorMessages]);

  // Set organization section info
  useEffect(() => {
    if (templateCollaboratorData?.template) {
      const admins = templateCollaboratorData.template.admins?.map(admin => ({
        email: admin.email as string | null,
        givenName: admin.givenName ?? null,
        surName: admin.surName ?? null,
      })) ?? [];

      setOrganization({
        name: templateCollaboratorData.template.owner?.name ?? '',
        admins: admins
      });
    }
  }, [templateCollaboratorData]);

  return (
    <div>
      <PageHeader
        title={AccessPage('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href={`/template/${templateId}`}>{templateCollaboratorData?.template?.name ?? 'Template'}</Link>
            </Breadcrumb>
            <Breadcrumb>{AccessPage('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-template-overview"
      />

      <LayoutContainer>
        <ContentContainer>
          <div className="template-editor-container" ref={errorRef}>
            <div className="main-content">
              {errorMessages && errorMessages.length > 0 &&
                <div className="error" role="alert" aria-live="assertive">
                  {errorMessages.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              }
              <p>
                {AccessPage('intro')}
              </p>
              <section className="sectionContainer"
                aria-labelledby="org-access-heading">
                <div className={`sectionHeader  mt-0`}>
                  <h3 id="org-access-heading">{AccessPage('headings.h3OrgAccess')}</h3>
                </div>
                <div className="sectionContent">
                  <p>{AccessPage('paragraphs.orgAccessPara1', { name: organization?.name })}</p>
                  <p>{AccessPage('paragraphs.orgAccessPara2', { count: organization?.admins?.length ?? '' })}</p>
                  {renderOrgAdmins}
                </div>
              </section>

              <section className="sectionContainer"
                aria-labelledby="external-access-heading">
                <div className="sectionHeader">
                  <h3 id="external-access-heading">{AccessPage('headings.externalPeople')}</h3>
                </div>
                <div className="sectionContent">
                  <p>{AccessPage('paragraphs.externalPara1')}</p>
                  <div className={styles.externalPeopleList}>
                    {renderExternalPeople}
                  </div>
                </div>
              </section>

              <section aria-labelledby="share-form-heading"
                className={styles.shareForm}>
                <div className="sectionContent">
                  <h3 id="share-form-heading" className="mb-4">{AccessPage('headings.share')}</h3>
                  <p>
                    {AccessPage('paragraphs.sharePara1')}
                  </p>

                  <Form onSubmit={e => handleAddingEmail(e)}>
                    <div className={styles.addContainer}>
                      <FormInput
                        name="email"
                        type="text"
                        value={addCollaboratorEmail}
                        onChange={handleEmailChange}
                        isRequired={true}
                        aria-required="true"
                        label={AccessPage('labels.email')}
                        isInvalid={!isValidEmail(addCollaboratorEmail) && addCollaboratorEmail !== ''}
                        errorMessage="Please enter a valid email address"
                      />
                      <Button type="submit" className="react-aria-Button mt-0">{AccessPage('buttons.invite')}</Button>
                    </div>
                  </Form>
                </div>
              </section>
            </div>
          </div>
        </ContentContainer>
      </LayoutContainer>
    </div >
  );
}

export default TemplateAccessPage;
