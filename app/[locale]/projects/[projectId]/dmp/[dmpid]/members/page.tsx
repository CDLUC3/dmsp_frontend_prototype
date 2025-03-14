'use client';

import React from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  Link
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import {OrcidIcon} from '@/components/Icons/orcid/';
import styles from './ProjectsProjectPlanAdjustMembers.module.scss';

interface Member {
  id: string;
  name: string;
  affiliation: string;
  orcid: string;
  role: string;
  isSelectedForThisProject: boolean;
}

const ProjectsProjectPlanAdjustMembers = () => {
  const members: Member[] = [
    {
      id: 'member-001',
      name: 'Frederick Cook',
      affiliation: 'University of California',
      orcid: '0000-0001-2603-5427',
      role: 'Primary Investigator',
      isSelectedForThisProject: true,
    },
    {
      id: 'member-002',
      name: 'Jennifer Frost',
      affiliation: 'University of Arctic Studies',
      orcid: '0000-0007-7803-0427',
      role: 'Data curator',
      isSelectedForThisProject: false,
    },
    {
      id: 'member-003',
      name: 'Christina Snowden',
      affiliation: 'University of California',
      orcid: '0000-0007-7803-0417',
      role: 'Data curator',
      isSelectedForThisProject: true,
    }
  ];



  // eslint-disable-next-line no-unused-vars
  const handleEdit = (memberId: string): void => {
    // Handle editing member
    window.location.href = '/projects/proj_2425/members/edit?memberid=' + memberId;
  };

  return (
    <>
      <PageHeader
        title="Members for this plan"
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


      <LayoutWithPanel>
        <ContentContainer className="layout-content-container-full">
          <p>
            Select the relevant members for this plan only - they will remain as
            members of your project.
          </p>
          <p>
            <Link href='projects/proj_2425/members'
              className={"text-base underline"}>Update project
              members</Link> (new window)
          </p>
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
                  <div>
                    <Checkbox
                      value={member.id}
                      aria-label={`Select ${member.name} for this plan`}
                      isSelected={member.isSelectedForThisProject}
                    >
                      <div className="checkbox">
                        <svg viewBox="0 0 18 18" aria-hidden="true">
                          <polyline points="1 9 7 14 15 4" />
                        </svg>
                      </div>
                    </Checkbox>

                  </div>
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
                      onPress={() => handleEdit(member.id)}
                      className="button-link"
                      aria-label={`Change role`}
                    >
                      Change role
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </ContentContainer>
        <SidebarPanel />
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectPlanAdjustMembers;
