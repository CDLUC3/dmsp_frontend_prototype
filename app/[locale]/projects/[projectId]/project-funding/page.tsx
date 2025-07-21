'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { routePath } from '@/utils/routes';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
} from "react-aria-components";

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutContainer,
} from "@/components/Container"
import { RadioGroupComponent } from '@/components/Form';

const ProjectsCreateProjectFunding = () => {
  const router = useRouter();
  const params = useParams();

  const { projectId } = params;
  const FUNDING_SEARCH_URL = routePath('projects.create.funding.search', {
    projectId: projectId as string,
  });
  const PROJECT_DETAIL_URL = routePath('projects.show', {
    projectId: projectId as string,
  });

  const [hasFunding, setHasFunding] = useState("yes");

  // localization keys
  const Global = useTranslations('Global');
  const ProjectFunding = useTranslations('ProjectsCreateProjectFunding');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasFunding === 'yes') {
      router.push(FUNDING_SEARCH_URL);
    } else {
      router.push(PROJECT_DETAIL_URL);
    }
  }

  const radioData = {
    radioGroupLabel: ProjectFunding('form.radioFundingLabel'),
    radioButtonData: [
      {
        value: 'yes',
        label: Global('form.yesLabel'),
      },
      {
        value: 'no',
        label: Global('form.noLabel'),
      }
    ]
  }

  return (
    <>
      <PageHeader
        title={ProjectFunding('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
          </Breadcrumbs>
        }
        className="page-project-create-project-funding"
      />
      <LayoutContainer>
        <ContentContainer>
          <Form onSubmit={handleSubmit}>

            <RadioGroupComponent
              name="has_funding"
              value={hasFunding}
              description={ProjectFunding('form.radioFundingDescription')}
              onChange={setHasFunding}
              radioGroupLabel={radioData.radioGroupLabel}
              radioButtonData={radioData.radioButtonData}
            />

            <Button
              type="submit"
              className=""
            >
              {Global('buttons.continue')}
            </Button>

          </Form>

        </ContentContainer>
      </LayoutContainer>
    </>
  );
};
export default ProjectsCreateProjectFunding;
