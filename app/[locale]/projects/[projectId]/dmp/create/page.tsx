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
  // eslint-disable-next-line no-unused-vars
  const handleSelect = async (versionedTemplateId: number): Promise<void> => {
    window.location.href = `/projects/proj_2425new/dmp/${versionedTemplateId}`;
  };



  const funderTemplates = [
    {
      id: 1,
      template: {
        id: 101
      },
      funder: 'National Science Foundation (nsf.gov)',
      title: 'Arctic Data Center: NSF Polar Programs',
      description: 'Template for NSF Polar Programs data management plans.',
      lastRevisedBy: 21, // use to be name
      lastUpdated: '04-01-2024',
      hasAdditionalGuidance: true
    },
    {
      id: 2,
      template: {
        id: 101
      },
      funder: 'National Science Foundation (nsf.gov)',
      title: 'NSF Polar Expeditions',
      description: 'Specialized template for NSF polar expedition data management.',
      lastRevisedBy: 45,
      lastUpdated: '04-01-2024',
      hasAdditionalGuidance: false,
      publishStatus: 'Unpublished'
    },
    {
      id: 3,
      template: {
        id: 101
      },
      funder: 'National Science Foundation (nsf.gov)',
      title: 'NSF: McMurdo Station (Antarctic)',
      description: 'Template specifically designed for McMurdo Station research projects.',
      lastRevisedBy: 454,
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
                  onSelect={handleSelect}
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
