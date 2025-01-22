'use client';

import React from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Input,
  Label,
  Link,
  SearchField,
  Text,
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import TemplateSelectListItem from "@/components/TemplateSelectListItem";

const TemplateSelectTemplatePage: React.FC = () => {

  // NSF Templates
  const nsfTemplates = [
    {
      funder: 'National Science Foundation (nsf.gov)',
      title: 'Arctic Data Center: NSF Polar Programs',
      description: 'Template for NSF Polar Programs data management plans.',
      lastRevisedBy: 'Sue Jones',
      lastUpdated: '04-01-2024',
      hasAdditionalGuidance: true
    },
    {
      funder: 'National Science Foundation (nsf.gov)',
      title: 'NSF Polar Expeditions',
      description: 'Specialized template for NSF polar expedition data management.',
      lastRevisedBy: 'Sue Jones',
      lastUpdated: '04-01-2024',
      hasAdditionalGuidance: false,
      publishStatus: 'Unpublished'
    },
    {
      funder: 'National Science Foundation (nsf.gov)',
      title: 'NSF: McMurdo Station (Antarctic)',
      description: 'Template specifically designed for McMurdo Station research projects.',
      lastRevisedBy: 'Sue Jones',
      lastUpdated: '09-21-2024',
      hasAdditionalGuidance: false
    }
  ];

  // Public DMP Templates
  const publicTemplates = [
    {
      funder: 'DMP Tool',
      title: 'General Research DMP',
      description: 'A general-purpose data management plan template suitable for various research projects.',
      lastRevisedBy: 'John Smith',
      lastUpdated: '03-15-2024',
      hasAdditionalGuidance: false
    },
    {
      funder: 'DMP Tool',
      title: 'Humanities Research DMP',
      description: 'Template designed for humanities research data management.',
      lastRevisedBy: 'Mary Johnson',
      lastUpdated: '03-28-2024',
      hasAdditionalGuidance: false
    },
    {
      funder: 'DMP Tool',
      title: 'Social Sciences DMP',
      description: 'Specialized template for social sciences research data management.',
      lastRevisedBy: 'David Wilson',
      lastUpdated: '04-01-2024',
      hasAdditionalGuidance: false
    }
  ];

  return (
    <>

      <PageHeader
        title="Select an existing template"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Templates</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <></>
        }
        className="page-template-list"
      />

      <div className="Filters" role="search">
        <SearchField aria-label="Template search">
          <Label>Search by keyword</Label>
          <Input aria-describedby="search-help" />
          <Button>Search</Button>
          <FieldError />
          <Text slot="description" className="help" id="search-help">
            Search by research organization, field station or lab, template
            description, etc.
          </Text>
        </SearchField>
      </div>

      <section className="mb-8" aria-labelledby="previously-created">
        <h2 id="previously-created">
          Use one of your previously created templates
        </h2>
        <div className="template-list" role="list" aria-label="Your templates">
          {nsfTemplates.map((template, index) => (
            <TemplateSelectListItem key={index}
              item={template}></TemplateSelectListItem>
          ))}
        </div>
      </section>

      <section className="mb-8" aria-labelledby="public-templates">
        <h2 id="public-templates">
          Use one of the public templates
        </h2>
        <div className="template-list"
          role="list"
          aria-label="Public templates">
          {publicTemplates.map((template, index) => (
            <TemplateSelectListItem key={index}
              item={template}></TemplateSelectListItem>
          ))}
        </div>
      </section>

    </>
  );
}

export default TemplateSelectTemplatePage;
