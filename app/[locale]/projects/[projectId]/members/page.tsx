'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Button, Link} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import {OrcidIcon} from '@/components/Icons/orcid/';
import styles from './ProjectsProjectMembers.module.scss';

interface Member {
  id: string;
  name: string;
  affiliation: string;
  orcid: string;
  role: string;
  isPrimaryInvestigator: boolean;
}

const ProjectsProjectMembers = () => {
  const members: Member[] = [
    {
      id: 'member-001',
      name: 'Frederick Cook',
      affiliation: 'University of California',
      orcid: '0000-0001-2603-5427',
      role: 'Primary Investigator',
      isPrimaryInvestigator: true
    },
    {
      id: 'member-002',
      name: 'Jennifer Frost',
      affiliation: 'University of Arctic Studies',
      orcid: '0000-0007-7803-0427',
      role: 'Data curator',
      isPrimaryInvestigator: false
    },
    {
      id: 'member-003',
      name: 'Christina Snowden',
      affiliation: 'University of California',
      orcid: '0000-0007-7803-0417',
      role: 'Data curator',
      isPrimaryInvestigator: false
    }
  ];

  const handleAddCollaborator = (): void => {
    // Handle adding new collaborator
    window.location.href = '/projects/proj_2425/members/search';
  };

  const handleEdit = (memberId: string): void => {
    // Handle editing member
    window.location.href = '/projects/proj_2425/members/edit';
  };

  const handleAccessUpdate = (memberId: string): void => {
    // Handle access update
    window.location.href = '/projects/proj_2425/members/edit';
  };

  const handleShare = (): void => {
    // Handle share
    window.location.href = '/projects/proj_2425/share';
  };

  return (
    <>
      <PageHeader
        title="Project Members"
        description="Define contributors & team members and their role in this project."
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Button
              onPress={handleAddCollaborator}
              className="secondary"
              aria-label="Add collaborators"
            >
              Add collaborators
            </Button>
          </>
        }
        className="page-project-members"
      />
      <LayoutWithPanel>
        <ContentContainer className="layout-content-container-full">
          <section
            aria-label="Project members list"
            role="region"
          >
            <div className={styles.membersList}>
              {members.map((member) => (
                <div
                  key={member.id}
                  className={styles.membersListItem}
                  role="listitem"
                  aria-label={`Project member: ${member.name}`}
                >
                  <div className={styles.memberInfo}>
                    <h3>
                      {member.name}
                    </h3>
                    <p className={styles.affiliation}>{member.affiliation}</p>
                    <p className={styles.orcid}>
                      <span aria-hidden="true">
                        <OrcidIcon icon="orcid" classes={styles.orcidLogo} />
                      </span>
                      <a
                        href={`https://orcid.org/${member.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`ORCID profile for ${member.name}`}
                      >
                        {member.orcid}
                      </a>
                    </p>
                  </div>
                  <div className={styles.memberRole}>
                    <p className={styles.role}>{member.role}</p>
                  </div>
                  <div className={styles.memberActions}>
                    <Button
                      onPress={() => handleAccessUpdate(member.id)}
                      className="secondary"
                      aria-label={`${member.isPrimaryInvestigator ? 'Update' : 'Share'} access for ${member.name}`}
                    >
                      {member.isPrimaryInvestigator ? 'Update Access' : 'Share Access'}
                    </Button>
                    <Button
                      onPress={() => handleEdit(member.id)}
                      className="primary"
                      aria-label={`Edit ${member.name}'s details`}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="collaborators-heading"
            className={styles.collaboratorAccess}
          >
            <h2 id="collaborators-heading">Allow collaborators edit or comment access?</h2>
            <p>You can invite people to access, edit or comment on plans by using the share button</p>
            <Button
              onPress={handleShare}
              className="secondary"
              aria-label="Share with people"
            >
              Share with people
            </Button>
          </section>
        </ContentContainer>
        <SidebarPanel />
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectMembers;
