'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
  Link,
} from "react-aria-components";

//GraphQL
import { useQuery } from '@apollo/client/react';
import {
  ProjectCollaborator,
  ProjectCollaboratorAccessLevel,
  ProjectCollaboratorsDocument
} from '@/generated/graphql';

import {
  removeProjectCollaboratorAction,
  resendInviteToProjectCollaboratorAction,
  updateProjectCollaboratorAction
} from './actions';

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutContainer,
} from "@/components/Container";
import ErrorMessages from '@/components/ErrorMessages';
import Loading from '@/components/Loading';

// Utils and other
import { routePath } from '@/utils/routes';
import { extractErrors } from '@/utils/errorHandler';
import { useToast } from '@/context/ToastContext';

import RevokeCollaboratorModal from './RevokeCollaboratorModal';
import AccessLevelRadioGroup from './AccessLevelRadioGroup';
import styles from './ProjectsProjectCollaboration.module.scss';

const ProjectsProjectCollaboration = () => {
  // Get projectId param
  const params = useParams();
  const router = useRouter();
  const projectId = String(params.projectId);

  const toastState = useToast(); // Access the toast state from context

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Localization
  const Global = useTranslations('Global');
  const t = useTranslations('ProjectsProjectCollaboration');

  const [projectCollaborators, setProjectCollaborators] = useState<ProjectCollaborator[]>([]);
  const [hasAccess, setHasAccess] = useState<ProjectCollaborator[]>([]);
  const [invitesPending, setInvitesPending] = useState<ProjectCollaborator[]>([]); // collaborators who haven't accepted yet
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // State for remove project member modal
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [deleteModalFor, setDeleteModalFor] = useState<number | null>(null);

  // Added for accessibility
  const [announcement, setAnnouncement] = useState('');

  // Get project collaborators
  const { data, loading, error: queryError } = useQuery(ProjectCollaboratorsDocument,
    {
      variables: { projectId: Number(projectId) },
      skip: (!projectId), // prevents the query from running when no projectId
      fetchPolicy: 'network-only', // always fetch from network
      notifyOnNetworkStatusChange: true
    }
  );

  // Call Server Action updateProjectCollaborator to update access level
  const updateAccessLevel = async (accessLevel: string, id: number) => {
    // Don't need a try-catch block here, as the error is handled in the action
    const response = await updateProjectCollaboratorAction({
      projectCollaboratorId: Number(id),
      accessLevel: accessLevel.toUpperCase()
    })

    if (response?.redirect) {
      router.push(response.redirect);
    }

    return {
      success: response.success,
      errors: response.errors,
      data: response.data
    }
  }

  const handleRadioChange = async (accessLevel: string, id: number | undefined, collaboratorName: string) => {
    setErrorMessages([]); // Clear previous errors

    if (!id) return;
    // Find previous access level
    const prevCollaborator = projectCollaborators.find(collab => collab.id === id);
    const previousAccessLevel = prevCollaborator?.accessLevel;

    // Optimistically update the UI
    setProjectCollaborators(prev =>
      prev.map(collab =>
        collab.id === id
          ? { ...collab, accessLevel: accessLevel.toUpperCase() as ProjectCollaboratorAccessLevel }
          : collab
      )
    );

    const result = await updateAccessLevel(accessLevel, id);

    if (!result.success) {
      if (result.errors && result.errors.length > 0) {
        setErrorMessages(result.errors);
      } else {
        setErrorMessages([Global('messaging.somethingWentWrong')]);
      }
      // revert optimistic update if mutation fails
      setProjectCollaborators(prev => prev.map(collab =>
        collab.id === id ? { ...collab, accessLevel: previousAccessLevel } : collab
      ));
    } else {
      if (result?.data?.errors &&
        Object.values(result.data.errors).some(val => val != null && val !== '')
      ) {
        // Convert nulls to undefined before passing to extractErrors
        const normalizedErrors = Object.fromEntries(
          Object.entries(result?.data?.errors ?? {}).map(([key, value]) => [key, value ?? undefined])
        );
        // This will flatten field-level errors into an array of strings, since we have no form fields here
        // and want to display any errors at the top of the page
        const errs = extractErrors(normalizedErrors);
        setErrorMessages(errs);
      } else {
        // Since sited users can see the change real time as they select a different access level, we don't need a toast message here.
        // However, we do want to announce the change for screen reader users
        const message = t('messages.success.updatedAccess', { name: collaboratorName, accessLevel: accessLevel.toLowerCase() });
        setAnnouncement(message);
      }
    }
  }

  // Call Server Action removeProjectCollaborator to remove/revoke access
  const removeProjectCollaborator = async (projectCollaboratorId: number) => {
    // Don't need a try-catch block here, as the error is handled in the action
    const response = await removeProjectCollaboratorAction({
      projectCollaboratorId: Number(projectCollaboratorId),
    })

    if (response.redirect) {
      router.push(response.redirect);
    }

    return {
      success: response.success,
      errors: response.errors,
      data: response.data,
    }
  }

  // Delete project collaborator
  const handleRevoke = async (projectCollaboratorId: number, collaboratorName: string) => {

    setIsDeleting(true);
    setErrorMessages([]); // Clear previous errors

    if (!projectCollaboratorId) {
      setIsDeleting(false);
      return;
    }

    // Find previous access level
    const originalCollaborators = [...projectCollaborators];


    // Optimistically update the UI
    setProjectCollaborators(prev =>
      prev.filter(collab => collab.id !== projectCollaboratorId)
    );

    const result = await removeProjectCollaborator(projectCollaboratorId);

    if (!result.success) {
      setIsDeleting(false);

      if (result.errors && result.errors.length > 0) {
        setErrorMessages(result.errors);
      } else {
        setErrorMessages([Global('messaging.somethingWentWrong')]);
      }
      // revert optimistic update if mutation fails
      setProjectCollaborators(originalCollaborators);
    } else {
      if (result?.data?.errors &&
        Object.values(result.data.errors).some(val => val != null && val !== '')
      ) {
        // Convert nulls to undefined before passing to extractErrors
        const normalizedErrors = Object.fromEntries(
          Object.entries(result?.data?.errors ?? {}).map(([key, value]) => [key, value ?? undefined])
        );
        // This will flatten field-level errors into an array of strings, since we have no form fields here
        // and want to display any errors at the top of the page
        const errs = extractErrors(normalizedErrors);
        setErrorMessages(errs);
      } else {
        //Successfully updated
        setIsDeleting(false);
        setDeleteModalFor(null);
        const successMessage = t('messages.success.revokedAccess', { name: collaboratorName });
        toastState.add(successMessage, { type: 'success', timeout: 3000 });
      }
      setIsDeleting(false);
    }
  }

  // Use Server Action to resend invite to project collaborator
  const resendInviteToProjectCollaborator = async (projectCollaboratorId: number) => {
    // Don't need a try-catch block here, as the error is handled in the server action
    const response = await resendInviteToProjectCollaboratorAction({
      projectCollaboratorId: Number(projectCollaboratorId),
    });

    if (response.redirect) {
      router.push(response.redirect);
    }

    return {
      success: response.success,
      errors: response.errors,
      data: response.data,
    };
  }

  // Resend invite
  const handleResend = async (projectCollaboratorId: number, collaboratorName: string) => {
    setIsResending(true);
    setErrorMessages([]);// Clear previous errors

    if (!projectCollaboratorId) {
      setIsResending(false);
      return;
    }

    const result = await resendInviteToProjectCollaborator(projectCollaboratorId)

    if (!result.success) {
      setIsResending(false);

      if (result.errors && result.errors.length > 0) {
        setErrorMessages(result.errors);
      } else {
        setErrorMessages([Global('messaging.somethingWentWrong')]);
      }
    } else {
      if (result?.data?.errors &&
        Object.values(result.data.errors).some(val => val != null && val !== '')
      ) {
        // Convert nulls to undefined before passing to extractErrors
        const normalizedErrors = Object.fromEntries(
          Object.entries(result?.data?.errors ?? {}).map(([key, value]) => [key, value ?? undefined])
        );

        // This will flatten field-level errors into an array of strings, since we have no form fields here
        // and want to display any errors at the top of the page
        const errs = extractErrors(normalizedErrors);
        setErrorMessages(errs);
      } else {
        // No field-level errors, operation succeeded
        setIsDeleting(false);
        setDeleteModalFor(null);
        const successMessage = t('messages.success.resentInvite', { name: collaboratorName });
        toastState.add(successMessage, { type: 'success', timeout: 3000 });
      }
      setIsResending(false);
    }
  }

  useEffect(() => {
    if (data && data.projectCollaborators) {
      // Filter out nulls and invites pending (user is null when invite not accepted)
      setProjectCollaborators(
        data.projectCollaborators.filter(
          (c): c is ProjectCollaborator => c !== null
        )
      );

      // Filter collaborators who HAVE accepted invite already
      setHasAccess(
        data.projectCollaborators.filter((c): c is ProjectCollaborator => c?.user !== null)
      );

      // Filter collaborators who haven't accepted yet
      setInvitesPending(
        data.projectCollaborators.filter((c): c is ProjectCollaborator => !c?.user)
      );
    } else {
      setProjectCollaborators([]);
    }
  }, [data]);

  useEffect(() => {
    if (projectCollaborators) {
      // Filter collaborators who HAVE accepted invite already
      setHasAccess(
        projectCollaborators.filter((c): c is ProjectCollaborator => c?.user !== null)
      );

      // Filter collaborators who haven't accepted yet
      setInvitesPending(
        projectCollaborators.filter((c): c is ProjectCollaborator => !c?.user)
      );
    }
  }, [projectCollaborators]);

  useEffect(() => {
    if (queryError) {
      setErrorMessages(queryError.message ? [queryError.message] : [])
    }
  }, [queryError])

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <PageHeader
        title={t('title')}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb>{t('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
          </>
        }
        className="page-project-members"
      />

      <ErrorMessages errors={errorMessages} ref={errorRef} />

      <LayoutContainer>
        <ContentContainer className="layout-content-container-full">
          <p>
            {t('description')}
          </p>
          <p>
            <Link href={routePath('projects.collaboration.invite', { projectId })}
              className={"react-aria-Button react-aria-Button--secondary"}>{t('links.inviteAPerson')}</Link>
          </p>

          {/* Current access section */}
          <section className={styles.section}
            aria-labelledby="current-access-heading">
            <h2 id="current-access-heading"
              className={styles.sectionTitle}>{t('headings.hasAccess')}</h2>
            <div className={styles.membersList} role="list">
              {hasAccess.length > 0 && hasAccess.map((collaborator) => {
                const collaboratorName = `${collaborator?.user?.givenName} ${collaborator?.user?.surName}`;
                const collaboratorAccessLevel = (collaborator?.accessLevel || 'edit').toLowerCase();
                return (
                  <div
                    key={collaborator.id}
                    data-id={collaborator.id}
                    className={styles.membersListItem}
                    role="listitem"
                    aria-label={`Project member: ${collaboratorName}`}
                  >
                    <div className={styles.memberInfo}>
                      <h3 className={styles.memberName}>{collaboratorName}</h3>
                      <p className={styles.memberEmail}>{collaborator?.user?.email}</p>
                    </div>

                    <AccessLevelRadioGroup
                      value={collaboratorAccessLevel}
                      onChange={value => handleRadioChange(value, Number(collaborator?.id), collaboratorName)}
                      collaboratorName={collaboratorName}
                    />

                    <RevokeCollaboratorModal
                      collaboratorId={Number(collaborator.id)}
                      collaboratorName={collaboratorName}
                      isOpen={deleteModalFor === collaborator.id}
                      isDeleting={isDeleting}
                      onOpenChange={open => setDeleteModalFor(open ? Number(collaborator.id) : null)}
                      onRevoke={handleRevoke}
                      onCancel={() => setDeleteModalFor(null)}
                    />
                  </div>
                )
              })}
            </div>
          </section>

          {/* Not accepted invite yet */}
          <section className={styles.section}
            aria-labelledby="not-accepted-heading">
            <h2 id="not-accepted-heading" className={styles.sectionTitle}>{t('headings.pendingInvites')}</h2>
            <div className={styles.membersList} role="list">
              {invitesPending && invitesPending.map((pending) => {
                const pendingName = pending?.user?.givenName || pending?.user?.surName ? `${pending?.user?.givenName} ${pending?.user?.surName}` : null;
                const pendingAccessLevel = (pending?.accessLevel || 'edit').toLowerCase();
                return (
                  <div
                    key={pending.id}
                    className={styles.membersListItem}
                    role="listitem"
                    aria-label={`Pending invite: ${pendingName}`}
                  >
                    <div className={styles.memberInfo}>
                      <h3 className={styles.memberName}>{pendingName ? pendingName : pending.email}</h3>
                      <p className={styles.memberEmail}>{pendingName ? pending.email : null}</p>
                      <p className={styles.memberRole}>{pending.created}</p>
                    </div>
                    <AccessLevelRadioGroup
                      value={pendingAccessLevel}
                      onChange={value => handleRadioChange(value, Number(pending?.id), pendingName ?? pending.email)}
                      collaboratorName={pendingName ?? pending.email}
                    />
                    <div className={styles.memberActions}>
                      <DialogTrigger
                        isOpen={deleteModalFor === pending.id}
                        onOpenChange={open => setDeleteModalFor(open ? Number(pending.id) : null)}
                      >
                        <Button
                          className="secondary"
                          aria-label={t('deleteInviteFor', { name: pendingName ?? pending.email })}
                          isDisabled={isDeleting}
                        >
                          {t('buttons.deleteInvite')}
                        </Button>
                        <ModalOverlay className={`${styles.modalOverride} react-aria-ModalOverlay`}>
                          <Modal>
                            <Dialog>
                              {({ close }) => (
                                <>
                                  <h3>{t('headings.removeCollaborator')}</h3>
                                  <p>{t('removeCollaborator')}</p>
                                  <div className="button-container">
                                    <Button
                                      className="secondary"
                                      aria-label={t('cancelRemoval', { name: pendingName ?? pending.email })}
                                      autoFocus
                                      onPress={() => {
                                        setDeleteModalFor(null);
                                        close();
                                      }}>
                                      {Global('buttons.cancel')}
                                    </Button>
                                    <Button
                                      className="primary"
                                      aria-label={t('deleteCollaborator', { name: pendingName ?? pending.email })}
                                      onPress={() => {
                                        handleRevoke(Number(pending.id), pendingName ?? pending.email);
                                        close();
                                      }}
                                    >
                                      {t('buttons.deleteInvite')}
                                    </Button>
                                  </div>
                                </>
                              )}
                            </Dialog>
                          </Modal>
                        </ModalOverlay>
                      </DialogTrigger>
                      <Button
                        className="secondary"
                        type="button"
                        onPress={() => handleResend(Number(pending?.id), pendingName ?? pending.email)}
                        aria-label={t('resendInviteFor', { name: pendingName ?? pending.email })}
                        isDisabled={isResending}
                      >
                        {t('buttons.resend')}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </ContentContainer>
      </LayoutContainer>
      <div aria-live="polite" aria-atomic="true" className="hidden-accessibly">
        {announcement}
      </div>
    </>
  );
};

export default ProjectsProjectCollaboration;
