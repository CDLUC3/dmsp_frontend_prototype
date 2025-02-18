'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
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
  LayoutWithPanel,
} from "@/components/Container"
import { RadioGroupComponent } from '@/components/Form';

const ProjectsCreateProjectFunding = () => {
  const router = useRouter();
  const [hasFunding, setHasFunding] = useState("yes");

  // localization keys
  const Global = useTranslations('Global');
  const ProjectFunding = useTranslations('ProjectsCreateProjectFunding');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasFunding === 'yes') {
      router.push('/projects/create-project/funding-search');
    } else {
      router.push('/projects/proj_2425new');
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
      <LayoutWithPanel>
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
      </LayoutWithPanel>
    </>
  );
};
export default ProjectsCreateProjectFunding;