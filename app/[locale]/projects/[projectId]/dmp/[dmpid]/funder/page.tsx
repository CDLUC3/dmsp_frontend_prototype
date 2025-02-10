'use client';

import React from 'react';
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

const ProjectsProjectPlanAdjustFunding = () => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Funder details updated');
    // Redirect or show success message
    window.location.href = '/projects/proj_2425/dmp/xxx';
  }


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
          </>
        }
        className="page-project-funders"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <Form onSubmit={handleSubmit}>
            <RadioGroup>
              <Label>
                Select a funder for this plan
              </Label>
              <Text slot="description" className="help">
                These funders come from the funders attached to the project.
              </Text>
              <Radio value="2525252525">
                National Science Foundation (NSF)
              </Radio>
              <Radio value="new">
                National Science Foundation - AAA (NSF-AA)
              </Radio>
            </RadioGroup>


            <Button
              type="submit"
            >
              Save
            </Button>
          </Form>


        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectPlanAdjustFunding;
