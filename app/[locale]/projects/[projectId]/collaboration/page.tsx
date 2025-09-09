'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  Dialog,
  DialogTrigger,
  Label,
  Link,
  Modal,
  ModalOverlay,
  Radio
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
import { RadioGroupComponent } from '@/components/Form';
import { ModalOverlayComponent } from '@/components/ModalOverlayComponent';

import { routePath } from '@/utils/routes';
import { extractErrors } from '@/utils/errorHandler';
import styles from './ProjectsProjectCollaboration.module.scss';
import { useTranslations } from "next-intl";

// Interface for member data
interface Member {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  orcid?: string;
  role: string;
  accessType: 'edit' | 'comment';
  status: 'active' | 'notAccepted' | 'revoked';
  inviteSentDate?: string;
  accessRevokedDate?: string;
}

const ProjectsProjectCollaboration = () => {
  // Get projectId param
  const params = useParams();
  const router = useRouter();
  const projectId = String(params.projectId);
  const Global = useTranslations('Global');

  const [projectCollaborators, setProjectCollaborators] = useState<ProjectCollaborator[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  // State for remove project member modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get project collaborators
  const { data, loading, error: queryError } = useProjectCollaboratorsQuery(
    {
      variables: { projectId: Number(projectId) },
      skip: (!projectId), // prevents the query from running when no projectId
      fetchPolicy: 'network-only', // always fetch from network
      notifyOnNetworkStatusChange: true
    }
  );

  // Members with current access
  const activeMembers: Member[] = [
    {
      id: 'member-001',
      name: 'Frederick Cook',
      email: 'f.cook@github.ac.uk',
      affiliation: 'University of California',
      orcid: '0000-0001-2603-5427',
      role: 'Project collaborator',
      accessType: 'edit',
      status: 'active',
    },
    {
      id: 'member-002',
      name: 'Jennifer Frost',
      email: 'jennifer.frost@ucam.edu',
      affiliation: 'University of Arctic Studies',
      role: 'Invite not yet accepted',
      accessType: 'edit',
      status: 'active',
    },
    {
      id: 'member-003',
      name: 'Angela Snow',
      email: 'a.snow@northernhelm.edu',
      affiliation: 'University of California',
      role: 'Project collaborator',
      accessType: 'edit',
      status: 'active',
    },
    {
      id: 'member-004',
      name: 'UC Support Team',
      email: 'support@arctic.edu',
      affiliation: 'External',
      role: '',
      accessType: 'edit',
      status: 'active',
    },
  ];

  // Members who haven't accepted invites
  const pendingMembers: Member[] = [
    {
      id: 'member-005',
      name: 'Vinjalmur Stefansson',
      email: 'vinjalmur.s@arctic.edu',
      affiliation: 'Invite sent April 1 2024',
      role: '',
      accessType: 'edit',
      status: 'notAccepted',
      inviteSentDate: 'April 1 2024',
    },
    {
      id: 'member-006',
      name: 'Oscar Wisting',
      email: 'o.wisting@arctic.edu',
      affiliation: '',
      role: 'Invite sent March 1 2024',
      accessType: 'edit',
      status: 'notAccepted',
      inviteSentDate: 'March 1 2024',
    },
  ];

  // Members who no longer have access
  const revokedMembers: Member[] = [
    {
      id: 'member-007',
      name: 'Janet Snowden',
      email: 'janet.snowden@arctic.edu',
      affiliation: '',
      role: 'Access revoked July 9 2024',
      accessType: 'edit',
      status: 'revoked',
      accessRevokedDate: 'July 9 2024',
    },
  ];

  // Call Server Action updateProjectCollaborator to update access level
  const updateAccessLevel = async (accessLevel: string, id: number) => {
    // Don't need a try-catch block here, as the error is handled in the action
    const response = await updateProjectCollaboratorAction({
      projectCollaboratorId: Number(id),
      accessLevel: accessLevel.toUpperCase()
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

  const handleRadioChange = async (accessLevel: string, id: number | undefined) => {

    if (!id) return;
    // Find previous access level
    const prevCollaborator = projectCollaborators.find(collab => collab.id === id);
    const previousAccessLevel = prevCollaborator?.accessLevel;
    if (previousAccessLevel?.toLowerCase() === accessLevel.toLowerCase()) {
      // No change in access level
      return;
    }

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
        }
      }
    }
  }

  const handleDeleteInvite = (memberId: string): void => {
    // Handle deleting invite
    console.log(`Deleting invite for member: ${memberId}`);
  };

  const handleResend = (memberId: string): void => {
    // Handle resending invite
    console.log(`Resending invite for member: ${memberId}`);
  };

  useEffect(() => {
    if (data && data.projectCollaborators) {
      // Filter out nulls
      setProjectCollaborators(
        data.projectCollaborators.filter((c): c is ProjectCollaborator => c !== null)
      );
    } else {
      setProjectCollaborators([]);
    }
  }, [data]);

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
        title="Invite people and manage access"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>

          </Breadcrumbs>
        }
        actions={
          <>
          </>
        }
        className="page-project-members"
      />

      <LayoutContainer>
        <ContentContainer className="layout-content-container-full">
          <p>
            When you invite a person, we&#39;ll send an email to this person
            inviting them to view your plan.
          </p>
          <p>
            <Link href={routePath('projects.collaboration.invite', { projectId })}
              className={"react-aria-Button react-aria-Button--secondary"}>Invite
              a person</Link>
          </p>

          {/* Current access section */}
          <section className={styles.section}
            aria-labelledby="current-access-heading">
            <h2 id="current-access-heading"
              className={styles.sectionTitle}>These people currently have
              access to this plan</h2>
            <div className={styles.membersList} role="list">
              {projectCollaborators && projectCollaborators.map((collaborator) => {
                const collaboratorName = `${collaborator?.user?.givenName} ${collaborator?.user?.surName}`;
                const collaboratorAccessLevel = (collaborator?.accessLevel || 'edit').toLowerCase();
                return (
                  <div
                    key={collaborator.id}
                    className={styles.membersListItem}
                    role="listitem"
                    aria-label={`Project member: ${collaboratorName}`}
                  >
                    <div className={styles.memberInfo}>
                      <h3 className={styles.memberName}>{collaboratorName}</h3>
                      <p className={styles.memberEmail}>{collaborator?.user?.email}</p>
                    </div>
                    <div className={styles.accessOptions}>

                      <RadioGroupComponent
                        name="accessLevel"
                        value={collaboratorAccessLevel}
                        radioGroupLabel=""
                        onChange={value => handleRadioChange(value, Number(collaborator?.id))}
                      >
                        <div>
                          <Radio value="edit" aria-label={`Can edit plan for ${collaboratorName}`}>Can edit plan</Radio>
                        </div>
                        <div>
                          <Radio value="comment" aria-label={`Comment only for ${collaboratorName}`}>Comment only</Radio>
                        </div>
                        <div>
                          <Radio value="own" aria-label={`Own plan for ${collaboratorName}`}>Own</Radio>
                        </div>
                      </RadioGroupComponent>
                    </div>
                    <div className={styles.memberActions}>
                      <DialogTrigger isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                        <Button
                          className="secondary"
                          aria-label={`Revoke access for ${collaboratorName}`}
                          isDisabled={isDeleting}
                        >
                          {isDeleting ? "is Deleting..." : "Revoke"}
                        </Button>
                        <ModalOverlay>
                          <Modal>
                            <Dialog>
                              {({ close }) => (
                                <>
                                  <h3>Remove project collaborator</h3>
                                  <p>Removing this member means they will no longer be able to collaborate on this plan.</p>
                                  <div className={styles.deleteConfirmButtons}>
                                    <Button
                                      className="secondary"
                                      aria-label="Cancel removal of project collaborator"
                                      autoFocus
                                      onPress={close}>
                                      {Global('buttons.cancel')}
                                    </Button>
                                    <Button
                                      className="primary"
                                      onPress={() => {
                                        handleRevoke(Number(collaborator.id));
                                        close();
                                      }}
                                    >
                                      {Global('buttons.delete')}
                                    </Button>
                                  </div>
                                </>
                              )}
                            </Dialog>
                          </Modal>
                        </ModalOverlay>
                      </DialogTrigger>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Not accepted section */}
          <section className={styles.section}
            aria-labelledby="not-accepted-heading">
            <h2 id="not-accepted-heading" className={styles.sectionTitle}>
              These people have not accepted
              invite yet</h2>
            <div className={styles.membersList} role="list">
              {pendingMembers.map((member) => (
                <div
                  key={member.id}
                  className={styles.membersListItem}
                  role="listitem"
                  aria-label={`Pending invite: ${member.name}`}
                >
                  <div className={styles.memberInfo}>
                    <h3 className={styles.memberName}>{member.name}</h3>
                    <p className={styles.memberEmail}>{member.email}</p>
                    <p className={styles.memberRole}>{member.inviteSentDate}</p>
                  </div>
                  <div className={styles.accessOptions}>
                    <CheckboxGroup
                      aria-label={`Access options for ${member.name}`}>
                      <Label className="hidden-accessibly">{`Access options for ${member.name}`}</Label>
                      <Checkbox
                        value={`${member.id}-edit`}
                        aria-label={`Can edit plan for ${member.name}`}
                        isSelected={member.accessType === 'edit'}
                      >
                        <div className="checkbox">
                          <svg viewBox="0 0 18 18" aria-hidden="true">
                            <polyline points="1 9 7 14 15 4" />
                          </svg>
                        </div>
                        <span>Can edit plan</span>
                      </Checkbox>

                      <Checkbox
                        value={`${member.id}-comment`}
                        aria-label={`Comment only for ${member.name}`}
                        isSelected={member.accessType === 'comment'}
                      >
                        <div className="checkbox">
                          <svg viewBox="0 0 18 18" aria-hidden="true">
                            <polyline points="1 9 7 14 15 4" />
                          </svg>
                        </div>
                        <span>Comment only</span>
                      </Checkbox>
                    </CheckboxGroup>
                  </div>
                  <div className={styles.memberActions}>
                    <Button
                      onPress={() => handleDeleteInvite(member.id)}
                      className="react-aria-Button react-aria-Button--secondary"
                      aria-label={`Delete invite for ${member.name}`}
                    >
                      Delete invite
                    </Button>
                    <Button
                      onPress={() => handleResend(member.id)}
                      className="button-link"
                      aria-label={`Resend invite for ${member.name}`}
                    >
                      Resend
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* No longer have access section */}
          <section className={styles.section}
            aria-labelledby="no-longer-access-heading">
            <h2 id="no-longer-access-heading" className={styles.sectionTitle}>No
              longer have access</h2>
            <div className={styles.membersList} role="list">
              {revokedMembers.map((member) => (
                <div
                  key={member.id}
                  className={styles.membersListItem}
                  role="listitem"
                  aria-label={`Revoked access: ${member.name}`}
                >
                  <div className={styles.memberInfo}>
                    <h3 className={styles.memberName}>{member.name}</h3>
                    <p className={styles.memberEmail}>{member.email}</p>
                    <p className={styles.accessRevoked}>{member.role}</p>
                  </div>
                  <div className={styles.accessOptions}>
                    <CheckboxGroup
                      aria-label={`Access options for ${member.name}`}>
                      <Label className="hidden-accessibly">{`Accepted options for ${member.name}`}</Label>
                      <Checkbox
                        value={`${member.id}-edit`}
                        aria-label={`Can edit plan for ${member.name}`}
                        isSelected={member.accessType === 'edit'}
                      >
                        <div className="checkbox">
                          <svg viewBox="0 0 18 18" aria-hidden="true">
                            <polyline points="1 9 7 14 15 4" />
                          </svg>
                        </div>
                        <span>Can edit plan</span>
                      </Checkbox>
                      <Checkbox
                        value={`${member.id}-comment`}
                        aria-label={`Comment only for ${member.name}`}
                        isSelected={member.accessType === 'comment'}
                      >
                        <div className="checkbox">
                          <svg viewBox="0 0 18 18" aria-hidden="true">
                            <polyline points="1 9 7 14 15 4" />
                          </svg>
                        </div>
                        <span>Comment only</span>
                      </Checkbox>
                    </CheckboxGroup>
                  </div>
                  <div className={styles.memberActions}>
                    <Button
                      onPress={() => handleResend(member.id)}
                      className="button-link"
                      aria-label={`Resend invite for ${member.name}`}
                    >
                      Resend
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectCollaboration;
