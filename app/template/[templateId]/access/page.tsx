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


  return (
    <div>
      <PageHeader
        title={template.name}
        description={`by ${template.author} - Version: ${template.version} - Published: ${template.publishedDate}`}
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
          <h2>
            Feedback and Access
          </h2>
          {/* Intro text */}
          <div>
            <p>This template is accessible to everyone at NSF with full view and
              edit permissions. It can also be shared with people outside your
              organization.</p>
          </div>

          {/* Organization section */}
          <div>
            <div className={`${styles.headerWithIcon} mt-0`}>
              <span aria-hidden={true} role="presentation"
                    className="material-symbols-outlined">domain</span>
              <h3>Within Organization</h3>
            </div>
            <div>
              <p>Everyone at NSF can view and edit</p>
              <p>4 administrators can manage access</p>
            </div>
          </div>

          {/* External access section */}
          <div>
            <div className={styles.headerWithIcon}>
              <span aria-hidden={true} role="presentation"
                    className="material-symbols-outlined">person_add</span>
              <h3>External People</h3>
            </div>
            <div>
              <p>Share this template with people outside NSF</p>
              <div className={styles.externalPeopleList}>
                {/* TODO: Extract to component when plan builder pages are created for easy re-use */}
                {externalPeople.length > 0 ? (
                  <ul className={styles.peopleList}>
                    {externalPeople.map((person) => (
                      <li key={person.id} className={styles.personItem}>
                        <div className={styles.personInfo}>
                          <div
                            className={styles.personName}>{person.fullName}</div>
                          <div
                            className={styles.personEmail}>{person.email}</div>
                        </div>
                        <Button
                          onPress={() => handleRevokeAccess(person.id)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyState}>
                    No external people have been added yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* New Share Form */}
          <div className={styles.shareForm}>
            <Form>
              <h3>Share with someone outside your organization</h3>
              <p>
                Enter their email address. If they do not already have a
                DMP Tool account they will be prompted to create one.
              </p>

              <TextField>
                <Label>Email</Label>
                <Input
                  type="email"
                />
              </TextField>
              <Button type="submit" className="react-aria-Button mt-0">
                Invite
              </Button>
            </Form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TemplateAccessPage;
