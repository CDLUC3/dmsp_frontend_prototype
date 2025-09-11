'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Link,
} from "react-aria-components";

//GraphQL
import {
  ProjectCollaborator,
  ProjectCollaboratorAccessLevel,
  useProjectCollaboratorsQuery
} from '@/generated/graphql';

import {
  removeProjectCollaboratorAction,
  updateProjectCollaboratorAction
} from './actions';

import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutContainer,
} from "@/components/Container";
import ErrorMessages from '@/components/ErrorMessages';

import { routePath } from '@/utils/routes';
import { extractErrors } from '@/utils/errorHandler';

import RevokeCollaboratorModal from './RevokeCollaboratorModal';
import AccessLevelRadioGroup from './AccessLevelRadioGroup';
import styles from './ProjectsProjectCollaboration.module.scss';

const ProjectsProjectCollaboration = () => {
  // Get projectId param
  const params = useParams();
  const router = useRouter();
  const projectId = String(params.projectId);

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
  const [deleteModalFor, setDeleteModalFor] = useState<number | null>(null);

  // Get project collaborators
  const { data, loading, error: queryError } = useProjectCollaboratorsQuery(
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

  const handleRadioChange = async (accessLevel: string, id: number | undefined) => {
    if (!id) return;
    // Find previous access level
    const prevCollaborator = projectCollaborators.find(collab => collab.id === id);
    const previousAccessLevel = prevCollaborator?.accessLevel;

    setErrorMessages([]); // Clear previous errors

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
      const errors = result.errors;

      //Check if errors is an array or an object
      if (Array.isArray(errors)) {
        //Handle errors as an array
        setErrorMessages(errors);
      }

      // revert optimistic update if mutation fails
      setProjectCollaborators(prev => prev.map(collab =>
        collab.id === id ? { ...collab, accessLevel: previousAccessLevel } : collab
      ));
    } else {
      if (result?.data?.errors) {
        // Convert nulls to undefined before passing to extractErrors
        const normalizedErrors = Object.fromEntries(
          Object.entries(result?.data?.errors ?? {}).map(([key, value]) => [key, value ?? undefined])
        );

        const errs = extractErrors(normalizedErrors, ['general', 'accessLevel']);
        if (errs.length > 0) {
          setErrorMessages(errs);
        } else {
          //Successfully updated
        }
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
      data: response.data
    }
  }

  const handleRevoke = async (projectCollaboratorId: number) => {

    setIsDeleting(true);
    if (!projectCollaboratorId) return;


    // Find previous access level
    const originalCollaborators = [...projectCollaborators];

    setErrorMessages([]); // Clear previous errors

    // Optimistically update the UI
    setProjectCollaborators(prev =>
      prev.filter(collab => collab.id !== projectCollaboratorId)
    );

    const result = await removeProjectCollaborator(projectCollaboratorId);

    if (!result.success) {
      const errors = result.errors;

      //Check if errors is an array or an object
      if (Array.isArray(errors)) {
        //Handle errors as an array
        setErrorMessages(errors);
      }

      // revert optimistic update if mutation fails
      setProjectCollaborators(originalCollaborators);
    } else {
      if (result?.data?.errors) {
        // Convert nulls to undefined before passing to extractErrors
        const normalizedErrors = Object.fromEntries(
          Object.entries(result?.data?.errors ?? {}).map(([key, value]) => [key, value ?? undefined])
        );

        const errs = extractErrors(normalizedErrors, ['general', 'accessLevel']);
        if (errs.length > 0) {
          setErrorMessages(errs);
        } else {
          //Successfully updated
          setIsDeleting(false);
          setDeleteModalFor(null);
        }
      }
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
    return <div>{Global('messaging.loading')}...</div>;
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
                      onChange={value => handleRadioChange(value, Number(collaborator?.id))}
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
                      onChange={value => handleRadioChange(value, Number(pending?.id))}
                      collaboratorName={pendingName ?? pending.email}
                    />
                    <RevokeCollaboratorModal
                      collaboratorId={Number(pending.id)}
                      collaboratorName={pendingName ?? pending.email}
                      isOpen={deleteModalFor === pending.id}
                      isDeleting={isDeleting}
                      onOpenChange={open => setDeleteModalFor(open ? Number(pending.id) : null)}
                      onRevoke={handleRevoke}
                      onCancel={() => setDeleteModalFor(null)}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectCollaboration;
