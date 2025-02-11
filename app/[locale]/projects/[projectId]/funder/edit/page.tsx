'use client';

import {ContentContainer, LayoutWithPanel} from "@/components/Container";
import React from 'react';
import PageHeader from "@/components/PageHeader";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  TextField
} from "react-aria-components";

const ProjectsProjectFundingEdit = () => {
  const funderStatuses = [
    "Active",
    "Pending",
    "Completed",
    "Terminated"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Funder details updated');
    // Redirect or show success message
    window.location.href = '/en-US/projects/proj_2425/funder';
  }

  return (
    <>
      <PageHeader
        title="Edit Funder Details"
        description="Update funding source information"
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
          </Breadcrumbs>
        }
        className="page-funder-edit"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <Form onSubmit={handleSubmit}>
            <TextField name="funder_name" type="text" isRequired>
              <Label>Funder Name</Label>
              <Input/>
              <FieldError/>
            </TextField>

            <Select name="funder_status">
              <Label>Funder Status</Label>
              <Button>
                <SelectValue/>
                <span aria-hidden="true">▼</span>
              </Button>
              <Popover>
                <ListBox>
                  {funderStatuses.map((status) => (
                    <ListBoxItem key={status}>{status}</ListBoxItem>
                  ))}
                </ListBox>
              </Popover>
              <FieldError/>
            </Select>

            <TextField name="grant_number" type="text">
              <Label>Grant Number/URL</Label>
              <Input/>
              <FieldError/>
            </TextField>

            <TextField name="project_number" type="text">
              <Label>Project Number or ID</Label>
              <Input/>
              <FieldError/>
            </TextField>

            <TextField name="opportunity_number" type="text">
              <Label>Opportunity / Federal Award Number</Label>
              <Input/>
              <FieldError/>
            </TextField>

            <Button type="submit" className="submit-button">Save Changes</Button>
          </Form>
        </ContentContainer>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectFundingEdit;
