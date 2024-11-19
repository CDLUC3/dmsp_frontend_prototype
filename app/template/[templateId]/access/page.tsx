'use client';

import React from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Input,
  Label,
  Link,
  TextField,
} from 'react-aria-components';
import PageHeader from "@/components/PageHeader";
import styles from './TemplateAccessPage.module.scss';

interface ExternalPerson {
  id: string;
  fullName: string;
  email: string;
}

const externalPeople: ExternalPerson[] = [
  {
    id: '1',
    fullName: 'Frederick Cook',
    email: 'Fred.Cook@cam.ac.uk'
  },
  {
    id: '2',
    fullName: 'Robert Peary',
    email: 'peary.robert@psu.edu'
  }
];

interface Template {
  id: string;
  name: string;
  author: string;
  version: string;
  publishedDate: string;

}

const template: Template = {
  id: 'tpl_abcdef123456',
  name: 'Arctic Data Center: NSF Polar Programs',
  author: 'National Science Foundation (nsf.gov)',
  version: '6.2',
  publishedDate: 'Jan 1, 2024',
};

const TemplateAccessPage: React.FC = () => {
  const handleRevokeAccess = (id: string) => {
    console.log('Revoking access for:', id);
    alert(`Revoking access for: ${id}`);
    // Implementation for removing access
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle invitation logic
  };


  return (
    <div>
      <PageHeader
        title={"Manage Access"}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Templates</Link></Breadcrumb>
            <Breadcrumb>{template.name}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-template-overview"
      />

      <div className="template-editor-container">
        <div className="main-content">

          <p>
            This template is accessible to everyone at NSF with full view and
            edit permissions. It can also be shared with people outside your
            organization.
          </p>
          <section aria-labelledby="org-access-heading">
            <div className={`${styles.AccessSectionHeader} mt-0`}>
              <h3 id="org-access-heading">Within Organization</h3>
            </div>
            <div>
              <p>Everyone at NSF can view and edit</p>
              <p>4 administrators can manage access</p>
            </div>
          </section>

          <section aria-labelledby="external-access-heading">
            <div className={styles.AccessSectionHeader}>
              <h3 id="external-access-heading">External People</h3>
            </div>
            <div>
              <p>Share this template with people outside NSF</p>
              <div className={styles.externalPeopleList}>
                {externalPeople.length > 0 ? (
                  <ul className={styles.peopleList} role="list">
                    {externalPeople.map((person) => (
                      <li key={person.id} className={styles.personItem}>
                        <div className={styles.personInfo}>
                          <div
                            className={styles.personName}>{person.fullName}</div>
                          <div className={styles.personEmail}
                               aria-label={`Email: ${person.email}`}>
                            {person.email}
                          </div>
                        </div>
                        <Button
                          onPress={() => handleRevokeAccess(person.id)}
                          aria-label={`Remove access for ${person.fullName}`}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyState} role="status">
                    No external people have been added yet
                  </div>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="share-form-heading"
                   className={styles.shareForm}>
            <Form onSubmit={handleSubmit}>
              <h3 id="share-form-heading">Share with someone outside your
                organization</h3>
              <p>
                Enter their email address. If they do not already have a
                DMP Tool account they will be prompted to create one.
              </p>

              <TextField>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={""}

                  required
                  aria-required="true"
                  aria-describedby="email-hint"
                />
              </TextField>
              <Button
                type="submit"
                className="react-aria-Button mt-0"
              >
                Invite
              </Button>
            </Form>
          </section>


        </div>
      </div>
    </div>
  );
}

export default TemplateAccessPage;
