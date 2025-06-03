'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Label,
  Link,
  Radio,
  RadioGroup,
  Text,
} from "react-aria-components";

import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import { routePath } from '@/utils/routes';

const ProjectsProjectPlanAdjustFunding = () => {
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect or show success message
    router.push(routePath('projects.dmp.show', { projectId: 'proj_2425', dmpId: 'xxx' }))
  }


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
          </>
        }
        className="page-project-fundings"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <Form onSubmit={handleSubmit}>
            <RadioGroup>
              <Label>
                Select funding for this plan
              </Label>
              <Text slot="description" className="help">
                This funding list comes from the funding list attached to the project.
              </Text>
              <Radio value="2525252525">
                National Science Foundation (NSF)
              </Radio>
              <Radio value="new">
                National Science Foundation - AAA (NSF-AA)
              </Radio>
            </RadioGroup>

            <p>
              <strong>
                Note: Changing the funder may require a template change. Only
                change if you are sure.
              </strong>
            </p>

            <Button
              type="submit"
            >
              Save
            </Button>
          </Form>


          <h2 className="heading-3 mt-8">
            Adding a funding source?
          </h2>
          <p>
            If you want to add new funding information, you can add funding at the
            project level. This project can have multiple funding sources, whereas each
            plan can only have a single source of funding as we match it to the required
            template.
          </p>
          <a href={"/projects/proj_2425/funding/"} >
            Add a new funding source
          </a>


        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectPlanAdjustFunding;
