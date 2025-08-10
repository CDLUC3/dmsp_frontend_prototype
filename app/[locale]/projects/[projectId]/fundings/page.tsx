'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  LayoutContainer,
} from "@/components/Container";
import { useProjectFundingsQuery } from '@/generated/graphql';
import { useToast } from '@/context/ToastContext';

import styles from './ProjectsProjectFunding.module.scss';



const ProjectsProjectFunding = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = String(params.projectId); // From route /projects/:projectId
  const toastState = useToast(); // Access the toast state from context

  // Localization keys
  const t = useTranslations('ProjectsProjectFunding');
  const Global = useTranslations('Global');

  const { data: funders } = useProjectFundingsQuery({
    variables: {
      projectId: Number(projectId),
    },
    fetchPolicy: 'network-only'
  });

  console.log("Project Fundings", funders);

  const handleAddFunding = () => {
    router.push(routePath('projects.fundings.search', {
      projectId: projectId as string,
    }));
  };

  const handleEditFunding = (projectFundingId: string | number | null | undefined) => {
    if (projectFundingId) {
      router.push(routePath('projects.fundings.edit', {
        projectId,
        projectFundingId: String(projectFundingId)
      }))
    } else {
      const errorMsg = t('messages.errors.funderNumberNotFound');
      toastState.add(errorMsg, { type: 'error' });
    }
  }

  return (
    <>
      <PageHeader
        title="Project Funding"
        description="Manage funding sources for your project"
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index', { projectId })}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.projectFunding')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Button
              onPress={handleAddFunding}
              className="secondary"
              aria-label="Add funding"
            >
              {t('buttons.addFundingSource')}
            </Button>
          </>
        }
        className="page-project-fundings"
      />
      <LayoutContainer>
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
                    onPress={() => handleEditFunding(funder?.id)}
                    className="secondary"
                    aria-label={`Edit ${funder?.affiliation?.displayName} details`}
                  >
                    {Global('buttons.edit')}
                  </Button>
                </div>
              </div>
            ))}
          </section>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectFunding;
