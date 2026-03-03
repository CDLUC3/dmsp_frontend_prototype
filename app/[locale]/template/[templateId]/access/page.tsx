'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
} from 'react-aria-components';

// GraphQL
import {
  TemplateCollaboratorsDocument,
  AddTemplateCollaboratorDocument,
  RemoveTemplateCollaboratorDocument,
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import FormInput from '@/components/Form/FormInput';
import ConfirmModal from '@/components/Modal/ConfirmModal';
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import ErrorMessages from '@/components/ErrorMessages';

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
  const { data: templateCollaboratorData, loading, error: templateQueryErrors } = useQuery(TemplateCollaboratorsDocument, {
    variables: { templateId: Number(templateId) },
    notifyOnNetworkStatusChange: true
  });

  // Initialize graphql mutations for component
  const [addTemplateCollaboratorlMutation] = useMutation(AddTemplateCollaboratorDocument);
  const [removeTemplateCollaboratorMutation] = useMutation(RemoveTemplateCollaboratorDocument, {
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
        addToast(successMessage, { type: 'success' });
      }
    } catch (err) {
      setErrorMessages(prevErrors => [...prevErrors, AccessPage('messages.errors.errorRemovingEmail')]);
      logECS('error', 'handleRevokeAccess', {
        error: err,
        url: { path: '/template/[templateId]/access' }
      });
    }
  }, [templateId, removeTemplateCollaboratorMutation, AccessPage, addToast]);


  // Add new collaborator email
  const handleAddingEmail = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    clearErrors();

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
      if (emailData?.errors && Object.values(emailData?.errors).filter((err) => err && err !== 'TemplateCollaboratorErrors').length > 0) {
        setErrorMessages([emailData?.errors.general || AccessPage('messages.errors.errorAddingCollaborator')]);
      }
      setAddCollaboratorEmail('');

      // Show success message
      const successMessage = AccessPage('messages.success.emailInviteSent');
      addToast(successMessage, { type: 'success' });
    } catch (err) {
      setErrorMessages(prevErrors => [...prevErrors, AccessPage('messages.errors.errorAddingCollaborator')]);
      setAddCollaboratorEmail('');
      logECS('error', 'handleAddingEmail', {
        error: err,
        url: { path: '/template/[templateId]/access' }
      });
    }
  }, [templateId, addCollaboratorEmail, addTemplateCollaboratorlMutation, AccessPage, addToast]);


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

  /* Handles rendering list of existing members*/
  const renderExternalPeople = useMemo(() => {
    if (loading) {
      return <div>{Global('messaging.loading')}...</div>;
    }

    if (templateQueryErrors) {
      return <div>{AccessPage('messages.errors.errorLoadingCollaborators')}</div>;
    }

    const collaborators = templateCollaboratorData?.template?.collaborators;

    if (collaborators?.length === 0) {
      return <p className={styles.emptyState} role="status">{AccessPage('messages.info.noCollaborators')}</p>;
    }

    return (
      <ul className={styles.peopleList} role="list">
        {collaborators?.map((person) => (
          <li key={person.id ?? person.email} className={styles.personItem}>
            <div className={styles.personInfo}>
              <div className={styles.personName}>{person.user?.givenName} {person.user?.surName}</div>
              <div className={styles.personEmail} aria-label={`Email: ${person.email}`}>
                {person.email}
              </div>
            </div>
            <ConfirmModal
              title={AccessPage('headings.confirmRemoval')}
              email={person.email}
              onConfirm={handleRevokeAccess}
            />
          </li>
        ))}
      </ul>
    );
  }, [loading, templateQueryErrors, templateCollaboratorData, handleRevokeAccess, AccessPage, Global]);

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
        admins
      });
    }
  }, [templateCollaboratorData]);

  return (
    <div>
      <PageHeader
        title={AccessPage('title')}
        description={AccessPage('intro', { orgName: organization?.name ?? '' })}
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
              <ErrorMessages errors={errorMessages} ref={errorRef} />
              <section className="sectionContainer"
                aria-labelledby="org-access-heading">
                <div className={`sectionHeader  mt-0`}>
                  <h3 id="org-access-heading">{AccessPage('headings.h3OrgAccess')}</h3>
                </div>
                <div className="sectionContent">
                  <p>{AccessPage('paragraphs.orgAccessPara1', { name: organization?.name ?? '' })}</p>
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
                        data-testid="email-input"
                        value={addCollaboratorEmail}
                        onChange={handleEmailChange}
                        isRequired={true}
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
