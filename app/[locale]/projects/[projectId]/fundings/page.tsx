'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { routePath } from '@/utils/routes';

import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Link,
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import styles from './ProjectsProjectFunding.module.scss';

import {
  useProjectFundersQuery,
} from '@/generated/graphql';

const ProjectsProjectFunding = () => {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const {
    data: funders,
    loading: fundersLoading,
  } = useProjectFundersQuery({
    variables: {
      projectId: Number(projectId),
    }
  });

  const handleAddFunding = () => {
    const NEXT_URL = routePath('projects.funder.search', {
      projectId: projectId,
    });
    router.push(NEXT_URL);
  };

  const handleEditFunder = () => {
    const NEXT_URL = routePath('projects.funder.edit', {
      projectId: projectId,
    });
    router.push(NEXT_URL);
  };

  return (
    <>
      <PageHeader
        title="Project Funding"
        description="Manage funding sources for your project"
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
              onPress={handleAddFunding}
              className="secondary"
              aria-label="Add funding"
            >
              Add a funding source
            </Button>
          </>
        }
        className="page-project-fundings"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <section aria-label="Current fundings">
            {funders?.projectFunders && funders.projectFunders.map((funder, index) => (
              <div
                key={index}
                className={styles.funderResultsList}
              >
                <div
                  className={styles.funderResultsListItem}
                  role="group"
                  aria-label="{funder.affiliation.displayName}"
                >
                  <p className="funder-name">{funder.affiliation.displayName}</p>
                  <Button
                    onPress={(funder) => handleEditFunder(funder)}
                    className="secondary"
                    aria-label={`Edit ${funder.affiliation.displayName} details`}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )
            )}
          </section>
        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectFunding;
