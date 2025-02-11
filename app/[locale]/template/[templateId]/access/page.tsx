'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApolloError } from "@apollo/client";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  DialogTrigger,
  Form,
  Link,
  Modal,
  ModalOverlay
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
import { useToast } from '@/context/ToastContext';
import { isValidEmail } from '@/utils/validation';
import styles from './TemplateAccessPage.module.scss';

const GET_COLLABORATORS = TemplateCollaboratorsDocument;

const TemplateAccessPage: React.FC = () => {
  // Get templateId param
  const params = useParams();
  const { templateId } = params; // From route /template/:templateId
  const t = useTranslations('UserProfile');
  const toastState = useToast(); // Access the toast state from context

  // Errors returned from request
  const [errors, setErrors] = useState<string[]>([]);
  const [addCollaboratorEmail, setAddCollaboratorEmail] = useState<string>('');

  // localization keys
  const Global = useTranslations('Global');

  // Run template query to get template name
  const { data: templateCollaboratorData, loading, error: templateQueryErrors } = useTemplateCollaboratorsQuery(
    {
      variables: { templateId: Number(templateId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Initialize graphql mutations for component
  const [addTemplateCollaboratorlMutation, { error: addCollaboratorError }] = useAddTemplateCollaboratorMutation();
  const [removeTemplateCollaboratorMutation, { error: removeCollaboratorError }] = useRemoveTemplateCollaboratorMutation({
    notifyOnNetworkStatusChange: true,
  });
  const clearErrors = () => {
    setErrors([]);
  }

  // Show Email Invite Success Message
  const showSuccessEmailInviteToast = () => {
    const successMessage = "Email invitation sent successfully";
    toastState.add(successMessage, { type: 'success', priority: 1 });
  }

  // Show Email Revoked Success Message
  const showSuccessEmailRevokedToast = () => {
    const successMessage = "Email successfully revoked";
    toastState.add(successMessage, { type: 'success', priority: 1 });
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Clear errors
    clearErrors();
    setAddCollaboratorEmail(value);
  }

  // Revoke collaborator access for provided email
  const handleRevokeAccess = async (emailToRevoke: string) => {
    try {
      const response = await removeTemplateCollaboratorMutation({
        variables: {
          templateId: Number(templateId),
          email: emailToRevoke,
        },
        refetchQueries: [
          {
            query: GET_COLLABORATORS,
            variables: { templateId: Number(templateId) }
          },
        ],
      });

      if (response?.data?.removeTemplateCollaborator) {
        clearErrors();
        showSuccessEmailRevokedToast();
      }
    } catch (err) {
      if (err instanceof ApolloError) {
        setErrors(prevErrors => [...prevErrors, err.message]);
      } else {
        setErrors(prevErrors => [...prevErrors, 'Error when deleting email']);
        logECS('error', 'handleRevokeAccess', {
          error: err,
          url: { path: '/template/[templateId]/access' }
        });
      }
    }
  };

  // Add new collaborator email
  const handleAddingEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await addTemplateCollaboratorlMutation({
        variables: {
          email: addCollaboratorEmail,
          templateId: Number(templateId)
        },
        refetchQueries: [
          {
            query: GET_COLLABORATORS,
            variables: { templateId: Number(templateId) }
          },
        ],
      });

      const emailData = response?.data?.addTemplateCollaborator;
      if (emailData?.errors && emailData.errors.length > 0) {
        setErrors(emailData.errors ?? []);
        return;
      }
      clearErrors();
      setAddCollaboratorEmail('');
      showSuccessEmailInviteToast();
    } catch (err) {
      if (err instanceof ApolloError) {
        setErrors(prevErrors => [...prevErrors, err.message]);
        setAddCollaboratorEmail('');
      } else {
        setErrors(prevErrors => [...prevErrors, 'Error when adding new email']);
        logECS('error', 'handleAddingEmail', {
          error: err,
          url: { path: '/template/[templateId]/access' }
        });
      }
    }
  }

  /* Handles rendering list of existing contributors*/
  const renderExternalPeople = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (templateQueryErrors) {
      return <div>Error loading collaborators</div>;
    }

    const collaborators = templateCollaboratorData?.template?.collaborators ?? [];

    if (collaborators.length === 0) {
      return <div className={styles.emptyState} role="status">No external people have been added yet</div>;
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
  };

  return (
    <div>
      <PageHeader
        title="Manage Access"
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            {templateCollaboratorData?.template && (
              <Breadcrumb><Link
                href={`/template/${templateId}`}>{templateCollaboratorData?.template?.name ?? 'Template'}</Link></Breadcrumb>
            )}
            <Breadcrumb>Manage access</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-template-overview"
      />

      <LayoutContainer>
        <ContentContainer>
          <div className="template-editor-container">
            <div className="main-content">

              <p>
                This template is accessible to everyone at NSF with full view and
                edit permissions. It can also be shared with people outside your
                organization.
              </p>
              <section className="sectionContainer"
                aria-labelledby="org-access-heading">
                <div className={`sectionHeader  mt-0`}>
                  <h3 id="org-access-heading">Within Organization</h3>
                </div>
                <div className="sectionContent">
                  <p>Everyone at NSF can view and edit</p>
                  <p>4 administrators can manage access</p>
                </div>
              </section>

              <section className="sectionContainer"
                aria-labelledby="external-access-heading">
                <div className="sectionHeader">
                  <h3 id="external-access-heading">External People</h3>
                </div>
                <div className="sectionContent">
                  <p>Share this template with people outside NSF</p>
                  <div className={styles.externalPeopleList}>
                    {renderExternalPeople()}
                  </div>
                </div>
              </section>

              <section aria-labelledby="share-form-heading"
                className={styles.shareForm}>
                <div className="sectionContent">
                  <h3 id="share-form-heading" className="mb-4">Share with someone
                    outside your
                    organization</h3>
                  <p>
                    Enter their email address. If they do not already have a
                    DMP Tool account they will be prompted to create one.
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
                        label="Email"
                        isInvalid={!isValidEmail(addCollaboratorEmail) && addCollaboratorEmail !== ''}
                        errorMessage="Please enter a valid email address"
                      />
                      <Button type="submit" className="react-aria-Button mt-0">Invite</Button>
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
