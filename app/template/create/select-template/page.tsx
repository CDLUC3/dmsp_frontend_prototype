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
import TemplateListItem from "@/components/TemplateListItem";

const TemplateSelectTemplatePage: React.FC = () => {

  const templates = [
    {
      title: 'Arctic Data Center: NSF Polar Programs',
      link: '/template/tpl_2525235',
      content: (
        <div>
          <p>National Science Foundation (nsf.gov)</p>
          <p>Last updated: 04-01-2024</p>
          {/* Add more content here */}
        </div>
      ),
      defaultExpanded: false
    },
    {
      title: 'NSF Polar Expeditions',
      link: '/template/tpl_Ad525',
      content: (
        <div>
          <p>National Science Foundation (nsf.gov)</p>
          <p>Last updated: 04-01-2024</p>
          <p>Status: Unpublished</p>
        </div>
      ),
      defaultExpanded: false
    },
    {
      title: 'NSF: McMurdo Station (Antarctic)',
      link: '/template/tpl_Ad525',
      content: (
        <div>
          <p>National Science Foundation (nsf.gov)</p>
          <p>Last updated: 09-21-2024</p>
        </div>
      ),
      defaultExpanded: false
    }
  ];



  return (
    <>

      <PageHeader
        title="Select a template"
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

      <div className="Filters">
        <SearchField>
          <Label>Search by keyword</Label>
          <Input />
          <Button>Search</Button>
          <FieldError />
          <Text slot="description" className="help">
            Search by research organization, field station or lab, template description, etc.
          </Text>
        </SearchField>
      </div>



      <div className="template-list"  role="list">
        {templates.map((template, index) => (
          <TemplateListItem key={index} item={template}/>
        ))}
      </div>


    </>
  );
}

export default TemplateSelectTemplatePage;
