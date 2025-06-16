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

import { useProjectFundingsQuery } from '@/generated/graphql';


const ProjectsProjectFunding = () => {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const {data: funders} = useProjectFundingsQuery({
    variables: {
      projectId: Number(projectId),
    }
  });

  const handleAddFunding = () => {
    router.push(routePath('projects.fundings.search', {
      projectId: projectId as string,
    }));
  };

  const handleEditFunding = () => {
    router.push(routePath('projects.fundings.edit', {
      projectId: projectId as string,
      projectFundingId: 'projFund_6902', // TODO:: Correct funder ID
    }));
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
            {funders?.projectFundings && funders.projectFundings.map((funder, index) => (
              <div
                key={index}
                className={styles.fundingResultsList}
              >
                <div
                  className={styles.fundingResultsListItem}
                  role="group"
                  aria-label="{funder?.affiliation?.displayName}"
                >
                  <p className="funder-name">{funder?.affiliation?.displayName}</p>
                  <Button
                    onPress={handleEditFunding}
                    className="secondary"
                    aria-label={`Edit ${funder?.affiliation?.displayName} details`}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </section>
        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectFunding;
