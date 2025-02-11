'use client';

import React from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  FieldError,
  Input,
  Label,
  Link,
  SearchField,
  Text,
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import TemplateSelectListItem from "@/components/TemplateSelectListItem";
import {ContentContainer, LayoutWithPanel} from "@/components/Container";

const PlanCreate: React.FC = () => {
  const handleSelect = (template: Template) => {

    window.location.href = '/projects/proj_2425new/dmp/222';
  };


  // NSF Templates
  type Template = {
    funder: string;
    title: string;
    description: string;
    lastRevisedBy: string;
    lastUpdated: string;
    hasAdditionalGuidance: boolean;
    publishStatus?: string;
  };

  const funderTemplates = [
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
  const uniqueFunders = Array.from(
    new Set(funderTemplates.map(template => template.funder))
  );


  return (
    <>

      <PageHeader
        title="Plan: Select a DMP template"
        description="Select a template to use when creating your DMP."
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
      <LayoutWithPanel>
        <ContentContainer className={"layout-content-container-full"}>
          <div className="searchSection" role="search">
            <SearchField aria-label="Template search">
              <Label>Search by keyword</Label>
              <Text slot="description" className="help">
                Search by research organization, field station or lab, template
                description, etc.
              </Text>
              <Input aria-describedby="search-help"/>
              <Button>Search</Button>
              <FieldError/>
            </SearchField>

            <CheckboxGroup>
              <Label>Filter by funder</Label>
              <Text slot="description" className="help">
                Select if you want to only see templates by your funder.
              </Text>
              {uniqueFunders.map((funder) => (
                <Checkbox key={funder} value={funder}>
                  <div className="checkbox">
                    <svg viewBox="0 0 18 18" aria-hidden="true">
                      <polyline points="1 9 7 14 15 4"/>
                    </svg>
                  </div>
                  {funder}
                </Checkbox>
              ))}

            </CheckboxGroup>

          </div>

          <section className="mb-8" aria-labelledby="previously-created">
            <h2 id="previously-created">
              Showing XX templates out of a total of XX
            </h2>
            <div className="template-list" role="list"
                 aria-label="Your templates">
              {funderTemplates.map((template, index) => (
                <TemplateSelectListItem
                  key={index}
                  item={template}
                  onSelect={() => handleSelect(template)}
                ></TemplateSelectListItem>
              ))}
            </div>
          </section>

        </ContentContainer>
      </LayoutWithPanel>


    </>
  );
}

export default PlanCreate;
