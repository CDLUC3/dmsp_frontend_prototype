'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { routePath } from '@/utils/routes';
import { useProjectFundingsApiLazyQuery } from '@/generated/graphql';

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
  const [fundingsApiQuery] = useProjectFundingsApiLazyQuery({});

  const { projectId } = params;
  const PROJECT_SEARCH_URL = routePath('projects.create.projects.search', {
    projectId: projectId as string,
  });
  const PROJECT_EDIT_URL = routePath('projects.project.info', {
    projectId: projectId as string,
  });

  const [hasFunding, setHasFunding] = useState("yes");

  // localization keys
  const Global = useTranslations('Global');
  const ProjectFunding = useTranslations('ProjectsCreateProjectFunding');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    fundingsApiQuery({
      variables: {
        projectId: Number(projectId),
      }
    }).then(({data}) => {
      let nextUrl: string = PROJECT_EDIT_URL;

      // NOTE: In the previous step, we selected a funder. So when we get to
      // this point, we already have an affiliated funder. Using assertion here
      // to tell typescript we definltely have a value here.
      const fundings = data!.project!.fundings!;
      const funder = fundings[0]!.affiliation;
      if (funder!.apiTarget && hasFunding === 'yes') {
        nextUrl = PROJECT_SEARCH_URL;
      }
      router.push(nextUrl);
    });
  }

  const radioData = {
    radioGroupLabel: ProjectFunding('form.radioFundingLabel'),
    radioButtonData: [
      {
        value: 'yes',
        label: ProjectFunding('form.radioYesLabel'),
        description: ProjectFunding('form.radioYesDescription'),
      },
      {
        value: 'no',
        label: ProjectFunding('form.radioNoLabel'),
        description: ProjectFunding('form.radioNoDescription'),
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
