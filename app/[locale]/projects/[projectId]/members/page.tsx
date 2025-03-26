'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Breadcrumb, Breadcrumbs, Button, Link } from "react-aria-components";

import { useProjectContributorsQuery, useProjectCollaboratorsQuery } from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer, } from "@/components/Container";
import { OrcidIcon } from '@/components/Icons/orcid/';
import ErrorMessages from '@/components/ErrorMessages';

import { DmpIcon } from '@/components/Icons';
import styles from './ProjectsProjectMembers.module.scss';

interface ProjectContributorsInterface {
  id: number | null;
  fullName: string;
  userId: number | null;
  affiliation: string;
  accessLevel: string | null;
  orcid: string;
  role: string;
}

const ProjectsProjectMembers = () => {
  const router = useRouter();
  // To scroll to error message
  const errorRef = useRef<HTMLDivElement | null>(null);
  // Get projectId param
  const params = useParams();
  const { projectId } = params; // From route /projects/:projectId

  // Localization keys
  const ProjectMembers = useTranslations('ProjectsProjectMembers');
  const Global = useTranslations('Global');

  const [projectContributors, setProjectContributors] = useState<ProjectContributorsInterface[]>();
  const [errors, setErrors] = useState<string[]>([]);

  // Get project contributors using projectid
  const { data, loading, error: projectContributorError } = useProjectContributorsQuery(
    {
      variables: { projectId: Number(projectId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Get project contributors using projectid
  const { data: projectCollaboratorsData, loading: projectCollaboratorsLoading, error: projectCollaboratorsError } = useProjectCollaboratorsQuery(
    {
      variables: { projectId: Number(projectId) },
      notifyOnNetworkStatusChange: true
    }
  );

  const isLoading = loading || projectCollaboratorsLoading;
  const isError = projectContributorError || projectCollaboratorsError;

  const handleAddContributors = (): void => {
    // Handle adding new collaborator
    router.push(`/projects/${projectId}/members/search`);
  };

  const handleEdit = (memberId: number | null): void => {

    // Handle editing member
    router.push(`/projects/${projectId}/members/${memberId?.toString()}/edit`);
  };

  const handleShare = (): void => {
    // Handle share
    router.push(`/projects/${projectId}/share`);
  };

  const getAccessLevel = (userId: number | null): string | null => {
    if (userId) {
      const collaborator = projectCollaboratorsData?.projectCollaborators?.find((collaborator) => collaborator?.user?.id === userId);

      // Return the access level if a match is found, otherwise return null or a default value
      return collaborator?.accessLevel?.toLowerCase() ?? null;
    }
    return null;
  };

  useEffect(() => {
    // When data from backend changes, set project contributors data in state
    if (data && data.projectContributors) {
      const projectContributorData = data.projectContributors.map((contributor) => ({
        id: contributor?.id ?? null,
        fullName: `${contributor?.givenName} ${contributor?.surName}`,
        affiliation: contributor?.affiliation?.displayName ?? '',
        userId: contributor?.userId ?? null,
        orcid: contributor?.orcid ?? '',
        accessLevel: getAccessLevel(contributor?.userId ?? null),
        role: (contributor?.contributorRoles && contributor.contributorRoles.length > 0) ? contributor?.contributorRoles?.map((role) => role.label).join(', ') : '',
      }))
      setProjectContributors(projectContributorData);
    }
  }, [data]);

  useEffect(() => {
    if (projectContributorError) {
      const errorMsg = ProjectMembers('messages.errors.errorGettingContributors');
      setErrors(prev => [...prev, errorMsg]);
    }
    /*eslint-disable react-hooks/exhaustive-deps*/

  }, [projectContributorError])

  if (isLoading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  if (isError) {
    return <div>{Global('messaging.error')}</div>;
  }


  return (
    <>
      <PageHeader
        title={ProjectMembers('title')}
        description={ProjectMembers('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/projects/${projectId}`}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb>{ProjectMembers('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Button
              onPress={handleAddContributors}
              className="secondary"
            >
              {ProjectMembers('buttons.addContributors')}
            </Button>
          </>
        }
        className="page-project-members"
      />
      <ErrorMessages errors={errors} ref={errorRef} />
      <LayoutContainer>
        <ContentContainer className="layout-content-container-full">
          <section
            aria-label="Project members list"
            role="region"
          >
            {(!projectContributors || projectContributors?.length === 0) ? (
              <p>{ProjectMembers('messages.noContributors')}</p>
            ) : (
              <div className={styles.membersList} role="list">
                {projectContributors.map((member) => (
                  <div
                    key={member.id}
                    className={styles.membersListItem}
                    role="listitem"
                    aria-label={`Project member: ${member.fullName}`}
                  >
                    <div className={styles.memberInfo}>
                      <h2 className={styles.memberNameHeading}>
                        {member.fullName}
                      </h2>
                      <p className={styles.affiliation}>{member.affiliation}</p>
                      <p className={styles.orcid}>
                        <span aria-hidden="true">
                          <OrcidIcon icon="orcid" classes={styles.orcidLogo} />
                        </span>
                        <a
                          href={`https://orcid.org/${member.orcid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`ORCID profile for ${member.fullName}`}
                        >
                          {member.orcid}
                        </a>
                      </p>
                      {member.accessLevel && (<p>
                        <span className={styles.accessLevelWrapper}>
                          <DmpIcon icon="folder-supervised" /> Project {member.accessLevel} permission
                        </span>
                      </p>
                      )}

                    </div>
                    <div className={styles.memberRole}>
                      <p className={styles.role}>{member.role}</p>
                    </div>
                    <div className={styles.memberActions}>
                      <Button
                        onPress={() => handleEdit(member.id)}
                        className="primary"
                        aria-label={`Edit ${member.fullName}'s details`}
                      >
                        {Global('buttons.edit')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            aria-labelledby="collaborators-heading"
            className={styles.collaboratorAccess}
          >
            <h2 id="collaborators-heading">{ProjectMembers('headings.h2AllowCollaborators')}</h2>
            <p>
              {ProjectMembers.rich('para.para1AllowCollaborators', {
                shareWithPeople: (chunks) => <Link href={`/projects/${projectId}/share`}>{chunks}</Link>
              })}
            </p>
            <Button
              onPress={handleShare}
              className="secondary"
              aria-label={ProjectMembers('buttons.shareWithPeople')}
            >
              {ProjectMembers('buttons.shareWithPeople')}
            </Button>
          </section>
        </ContentContainer>
      </LayoutContainer >
    </>
  );
};

export default ProjectsProjectMembers;
