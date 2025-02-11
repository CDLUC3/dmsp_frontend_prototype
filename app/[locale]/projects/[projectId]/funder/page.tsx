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
  const handleAddFunder = () => {
    window.location.href = '/projects/proj_2425/funder/search';
  };

  const handleEditFunder = () => {
    // Navigate to edit page or open modal
    window.location.href = '/projects/proj_2425/funder/edit';
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
