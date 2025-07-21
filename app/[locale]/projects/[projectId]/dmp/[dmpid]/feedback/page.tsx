'use client';

import React from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  Label,
  Link
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutContainer,
} from "@/components/Container";
import styles from './ProjectsProjectPlanFeedback.module.scss';

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

const ProjectsProjectPlanFeedback = () => {
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

  const handleRevoke = (memberId: string): void => {
    // Handle revoking access
    console.log(`Revoking access for member: ${memberId}`);
  };

  const handleDeleteInvite = (memberId: string): void => {
    // Handle deleting invite
    console.log(`Deleting invite for member: ${memberId}`);
  };

  const handleResend = (memberId: string): void => {
    // Handle resending invite
    console.log(`Resending invite for member: ${memberId}`);
  };

  return (
    <>
      <PageHeader
        title="Invite people and manage access"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
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
            <Link href='/projects/proj_2425/dmp/xxx/feedback/invite'
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
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className={styles.membersListItem}
                  role="listitem"
                  aria-label={`Project member: ${member.name}`}
                >
                  <div className={styles.memberInfo}>
                    <h3 className={styles.memberName}>{member.name}</h3>
                    <p className={styles.memberEmail}>{member.email}</p>
                    <p className={styles.memberRole}>{member.role}</p>
                  </div>
                  <div className={styles.accessOptions}>

                    <CheckboxGroup
                      aria-label={`Access options for ${member.name}`}
                    >
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
                      onPress={() => handleRevoke(member.id)}
                      className="button-link"
                      aria-label={`Revoke access for ${member.name}`}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
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

export default ProjectsProjectPlanFeedback;
