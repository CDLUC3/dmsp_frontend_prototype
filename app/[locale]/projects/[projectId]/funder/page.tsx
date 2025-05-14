'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { Breadcrumb, Breadcrumbs, Button, Link, } from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import { routePath } from '@/utils/routes';
import styles from './ProjectsProjectFunding.module.scss';

const ProjectsProjectFunding = () => {
  const router = useRouter();

  const handleAddFunder = () => {
    router.push(routePath('projects.funder.search', { projectId: 'proj_2425' }))
  };

  const handleEditFunder = () => {
    // Navigate to edit page or open modal
    router.push(routePath('projects.funder.edit', { projectId: 'proj_2425' }))
  };

  return (
    <>
      <PageHeader
        title="Project Funders"
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
              onPress={handleAddFunder}
              className="secondary"
              aria-label="Add a funder"
            >
              Add a funder
            </Button>
          </>
        }
        className="page-project-funders"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <section aria-label="Current funders">
            <div className={styles.funderResultsList}>
              <div
                className={styles.funderResultsListItem}
                role="group"
                aria-label="Current funder"
              >
                <p className="funder-name">National Science Foundation (NSF)</p>
                <Button
                  onPress={handleEditFunder}
                  className="secondary"
                  aria-label="Edit National Science Foundation details"
                >
                  Edit
                </Button>
              </div>
            </div>


          </section>
        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectFunding;
