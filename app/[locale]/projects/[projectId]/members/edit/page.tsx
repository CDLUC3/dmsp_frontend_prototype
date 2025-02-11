'use client';

import {ContentContainer, LayoutWithPanel} from "@/components/Container";
import React from 'react';
import PageHeader from "@/components/PageHeader";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  TextField
} from "react-aria-components";
import styles from './ProjectsProjectMembersEdit.module.scss';

const ProjectsProjectMembersEdit = () => {
  const projectRoles = [
    "Primary Investigator (PI)",
    "Project Administrator",
    "Data Curator",
    "Other"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Member details updated');
    window.location.href = '/projects/proj_2425/members';
  }

  const handleRemoveMember = () => {
    console.log('Member removed');
    // Add confirmation dialog and removal logic
  }

  return (
    <>
      <PageHeader
        title="Edit Member Details"
        description="Update collaborator information"
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
          </Breadcrumbs>
        }
        className="page-member-edit"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <Form onSubmit={handleSubmit} className={styles.editForm}>
            <div className={styles.formSection}>
              <TextField name="first_name" type="text" isRequired>
                <Label>First Name</Label>
                <Input/>
                <FieldError/>
              </TextField>

              <TextField name="last_name" type="text" isRequired>
                <Label>Last Name</Label>
                <Input/>
                <FieldError/>
              </TextField>

              <TextField name="affiliation" type="text" isRequired>
                <Label>Affiliation</Label>
                <Input/>
                <FieldError/>
              </TextField>

              <TextField name="email" type="email" isRequired>
                <Label>Email Address</Label>
                <Input/>
                <FieldError/>
              </TextField>

              <TextField name="orcid" type="text">
                <Label>ORCID ID</Label>
                <Input placeholder="0000-0000-0000-0000"/>
                <FieldError/>
              </TextField>

              <CheckboxGroup
                name="project_roles"
                className={styles.rolesGroup}
                aria-label="Project roles"
              >
                <Label>Project Role(s)</Label>
                  {projectRoles.map((role) => (
                    <Checkbox key={role} value={role}>
                      <div className="checkbox">
                        <svg viewBox="0 0 18 18" aria-hidden="true">
                          <polyline points="1 9 7 14 15 4"/>
                        </svg>
                      </div>
                      {role}
                    </Checkbox>
                  ))}
                <FieldError/>
              </CheckboxGroup>

              <Button type="submit" >Save Changes</Button>
            </div>
          </Form>

          <section className={styles.dangerZone} aria-labelledby="remove-section">
            <h2 id="remove-section">Remove Member</h2>
            <p>
              Removing this member means they will no longer be able to access this plan.
              This is not reversible.
            </p>
            <Button
              onPress={handleRemoveMember}
              className="secondary"
              aria-label="Remove member from project"
            >
              Remove Member
            </Button>
          </section>
        </ContentContainer>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectMembersEdit;
