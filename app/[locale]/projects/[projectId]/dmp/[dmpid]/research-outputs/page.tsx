'use client';

import React from 'react';
import { Breadcrumb, Breadcrumbs, Button, Link } from "react-aria-components";
import { useRouter } from 'next/navigation';

import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
} from "@/components/Container";
import { routePath } from '@/utils/routes';

import styles from './ProjectsProjectPlanAdjustResearchOutputs.module.scss';

interface ResearchOutput {
  id: string;
  title: string; // Proposed output title
  personalInfoIncluded: boolean; // Indicates if personal information exists
  sensitiveDataIncluded: boolean; // Indicates if sensitive data exists
  repository: string; // Repository name
  type: string; // Output type
}

const ProjectsProjectPlanAdjustResearchOutputs = () => {
  const router = useRouter();

  const researchOutputs: ResearchOutput[] = [
    {
      id: 'output-001',
      title: 'Climate Change Impact on Polar Ecosystems',
      personalInfoIncluded: true,
      sensitiveDataIncluded: false,
      repository: 'Arctic Research Repository',
      type: 'Journal Article'
    },
    {
      id: 'output-002',
      title: 'Data Framework for Ecosystem Studies',
      personalInfoIncluded: false,
      sensitiveDataIncluded: true,
      repository: 'National Data Repository',
      type: 'Data Set'
    },
    {
      id: 'output-003',
      title: 'Biodiversity Changes in the Arctic',
      personalInfoIncluded: true,
      sensitiveDataIncluded: true,
      repository: 'University Repository',
      type: 'Conference Paper'
    }
  ];

  const handleEditOutput = (outputId: string): void => {
    console.log(`Editing research output: ${outputId}`);
    // Handle editing the research output
    router.push(routePath('projects.dmp.research-outputs.edit', { projectId: 'proj_2425', dmpId: 'xxx' }))
  };

  const handleDeleteOutput = (outputId: string): void => {
    // Handle deleting the research output
    // Add delete logic here or redirect if required
    console.log(`Deleted research output: ${outputId}`);
  };

  return (
    <>
      <PageHeader
        title="Research Outputs"
        description="Manage and document the outputs of your research project."
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
              onPress={() => router.push(routePath('projects.dmp.research-outputs.edit', { projectId: 'proj_2425', dmpId: 'xxx' }))}
              className="secondary"
              aria-label="Add new research output"
            >
              Add Research Output
            </Button>
          </>
        }
        className="page-project-research-outputs"
      />
      <LayoutWithPanel>
        <ContentContainer className="layout-content-container-full">
          <section
            aria-label="Research outputs list"
            role="region"
          >
            <div className={styles.outputsList} role="list">
              {researchOutputs.map((output) => (
                <div
                  key={output.id}
                  className={styles.outputsListItem}
                  role="listitem"
                  aria-label={`Research output: ${output.title}`}
                >
                  <div className={styles.outputInfo}>
                    <h2>
                      {output.title}
                    </h2>
                    <p className={styles.metadata}>
                      Personal Information
                      Included? {output.personalInfoIncluded ? 'Yes' : 'No'}
                      <br />
                      Sensitive Data
                      Included? {output.sensitiveDataIncluded ? 'Yes' : 'No'}
                    </p>


                  </div>

                  <div className={styles.repository}>
                    Repository:<br />{output.repository}
                  </div>


                  <div className={styles.outputType}>
                    Type:<br />{output.type}
                  </div>

                  <div className={styles.outputActions}>
                    <Button
                      onPress={() => handleEditOutput(output.id)}
                      className="primary"
                      aria-label={`Edit research output: ${output.title}`}
                    >
                      Edit
                    </Button>
                    <Button
                      onPress={() => handleDeleteOutput(output.id)}
                      className="secondary"
                      aria-label={`Delete research output: ${output.title}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ContentContainer>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectPlanAdjustResearchOutputs;
