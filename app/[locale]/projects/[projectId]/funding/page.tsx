'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Button, Link,} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import styles from './ProjectsProjectFunding.module.scss';

const ProjectsProjectFunding = () => {
  const handleAddFunding = () => {
    window.location.href = '/projects/proj_2425/funding/search';
  };

  const handleEditFunding = () => {
    // Navigate to edit page or open modal
    window.location.href = '/projects/proj_2425/funding/edit';
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
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectFunding;
