'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { Breadcrumb, Breadcrumbs, Button, Link, } from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutContainer,
} from "@/components/Container";
import { routePath } from '@/utils/routes';
import styles from './ProjectsProjectFunding.module.scss';

const ProjectsProjectFunding = () => {
  const router = useRouter();

  const handleAddFunding = () => {
    router.push(routePath('projects.fundings.search', { projectId: 'proj_2425' }))
  };

  const handleEditFunding = () => {
    // Navigate to edit page or open modal
    router.push(routePath('projects.fundings.edit', { projectId: 'proj_2425', projectFundingId: 'projFund_6902' }))
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
      <LayoutContainer>
        <ContentContainer>
          <section aria-label="Current fundings">
            <div className={styles.fundingResultsList}>
              <div
                className={styles.fundingResultsListItem}
                role="group"
                aria-label="Current funding"
              >
                <p className="funding-name">National Science Foundation (NSF)</p>
                <Button
                  onPress={handleEditFunding}
                  className="secondary"
                  aria-label="Edit National Science Foundation details"
                >
                  Edit
                </Button>
              </div>
            </div>


          </section>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectFunding;
