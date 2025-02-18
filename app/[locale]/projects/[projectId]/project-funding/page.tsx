'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Label,
  Link,
  Radio,
  RadioGroup,
  Text
} from "react-aria-components";

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container"
import { RadioGroupComponent } from '@/components/Form';

const ProjectsCreateProjectFunding = () => {

  const [hasFunding, setHasFunding] = useState("yes");

  // localization keys
  const Global = useTranslations('Global');
  const ProjectFunding = useTranslations('ProjectsCreateProjectFunding');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasFunding === 'yes') {
      window.location.href = '/projects/create-project/funding-search';
    } else {
      window.location.href = '/projects/proj_2425new';
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
        title="Do you already have funding for this project?"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
          </>
        }
        className="page-project-create-project-funding"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <Form onSubmit={handleSubmit}>

            <RadioGroupComponent
              name="has_funding"
              value={hasFunding}
              description="  if yes, we will try to search for the project and pull in associated
                information for you to review and edit."
              onChange={setHasFunding}
              radioGroupLabel={radioData.radioGroupLabel}
              radioButtonData={radioData.radioButtonData}
            />

            <Button
              type="submit"
              className=""
            >
              Continue
            </Button>

          </Form>

        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>







    </>
  );
};
export default ProjectsCreateProjectFunding;