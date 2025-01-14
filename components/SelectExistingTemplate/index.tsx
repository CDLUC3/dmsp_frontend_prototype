'use client';

import React, { useEffect, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
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

//Components
import PageHeader from "@/components/PageHeader";
import TemplateSelectListItem from "@/components/TemplateSelectListItem";
import {
  ContentContainer,
  LayoutContainer,
} from '@/components/Container';

//GraphQL
import { useTemplatesQuery, } from '@/generated/graphql';

import { TemplateInterface, TemplateItemProps, } from '@/app/types';

const TemplateSelectTemplatePage: React.FC = () => {
  const [templates, setTemplates] = useState<(TemplateItemProps)[]>([]);
  const [publicTemplatesList, setPublicTemplatesList] = useState<(TemplateItemProps)[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<(TemplateItemProps)[] | null>([]);
  const [filteredPublicTemplates, setFilteredPublicTemplates] = useState<(TemplateItemProps)[] | null>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const formatter = useFormatter();
  // Make graphql request for templates under the user's affiliation
  const { data = {}, loading, error: queryError, refetch } = useTemplatesQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
  });
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
  // const publicTemplates = [
  //   {
  //     funder: 'DMP Tool',
  //     title: 'General Research DMP',
  //     description: 'A general-purpose data management plan template suitable for various research projects.',
  //     lastRevisedBy: 'John Smith',
  //     lastUpdated: '03-15-2024',
  //     hasAdditionalGuidance: false
  //   },
  //   {
  //     funder: 'DMP Tool',
  //     title: 'Humanities Research DMP',
  //     description: 'Template designed for humanities research data management.',
  //     lastRevisedBy: 'Mary Johnson',
  //     lastUpdated: '03-28-2024',
  //     hasAdditionalGuidance: false
  //   },
  //   {
  //     funder: 'DMP Tool',
  //     title: 'Social Sciences DMP',
  //     description: 'Specialized template for social sciences research data management.',
  //     lastRevisedBy: 'David Wilson',
  //     lastUpdated: '04-01-2024',
  //     hasAdditionalGuidance: false
  //   }
  // ];

  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  // Filter results when a user enters a search term and clicks "Search" button
  const handleFiltering = (term: string) => {
    setErrors([]);
    // Search title, funder and description fields for terms
    const filteredList = templates.filter(item =>
      [item.title, item.funder, item.description]
        .some(field => field?.toLowerCase().includes(term.toLowerCase()))
    );

    const filteredPublicTemplatesList = publicTemplatesList.filter(item =>
      [item.title, item.funder, item.description]
        .some(field => field?.toLowerCase().includes(term.toLowerCase()))
    );

    if (filteredList.length >= 1 || filteredPublicTemplatesList.length >= 1) {
      setSearchTerm(term);
      setFilteredTemplates(filteredList.length > 0 ? filteredList : null);
      setFilteredPublicTemplates(filteredPublicTemplatesList.length > 0 ? filteredPublicTemplates : null);
    } else {
      //If there are no matching results, then display an error
      const errorMessage = "No items found"
      setErrors(prev => [...prev, errorMessage]);
    }
  }


  // Format date using next-intl date formatter
  const formatDate = (date: string) => {
    const formattedDate = formatter.dateTime(new Date(Number(date)), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    // Replace slashes with hyphens
    return formattedDate.replace(/\//g, '-');
  }

  const handleSelect = () => {
    console.log("Selected")
  }

  useEffect(() => {
    // Transform templates into format expected by TemplateListItem component
    if (data && data?.templates) {
      const fetchAllTemplates = async (templates: (TemplateInterface | null)[]) => {
        const transformedTemplates = await Promise.all(
          templates.map(async (template: TemplateInterface | null) => {
            return {
              title: template?.name || "",
              description: template?.description || "",
              link: `/template/${template?.id}`,
              content: template?.description || template?.modified ? (
                <div>
                  <p>{template?.description}</p>
                  <p>Last updated: {(template?.modified) ? formatDate(template?.modified) : null}</p>
                </div>
              ) : null, // Set to null if no description or last modified data
              funder: template?.owner?.name || template?.name,
              lastUpdated: (template?.modified) ? formatDate(template?.modified) : null,
              lastRevisedBy: template?.modifiedById ? template.modifiedById : null,
              publishStatus: (template?.isDirty) ? 'Published' : 'Unpublished',
              hasAdditionalGuidance: false,
              defaultExpanded: false,
              visibility: template?.visibility
            }
          }));

        setTemplates(transformedTemplates);
        const publicTemplates = transformedTemplates.filter(template => {
          return template.visibility !== 'PRIVATE'
        });
        setPublicTemplatesList(publicTemplates);
      }
      fetchAllTemplates(data?.templates);
    }
  }, [data]);

  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      setFilteredTemplates(null);
      setFilteredPublicTemplates(null);
    }
  }, [searchTerm])

  console.log("FILTERED PUBLIC TEMPLATES", filteredPublicTemplates);
  return (
    <>

      <PageHeader
        title="Select an existing template"
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Template</Link></Breadcrumb>
            <Breadcrumb><Link href="/template/create?step=1">Create a template</Link></Breadcrumb>
            <Breadcrumb>Select an existing template</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <></>
        }
        className="page-template-list"
      />

      <LayoutContainer>
        <ContentContainer>
          <>
            <div className="Filters" role="search">
              <SearchField aria-label="Template search">
                <Label>Search by keyword</Label>
                <Input
                  aria-describedby="search-help"
                  value={searchTerm}
                  onChange={e => handleSearchInput(e.target.value)} />
                <Button
                  onPress={() => {
                    // Call your filtering function without changing the input value
                    handleFiltering(searchTerm);
                  }}
                >
                  Search
                </Button>
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
                {filteredTemplates && filteredTemplates.length > 0 ? (
                  <div className="template-list" aria-label="Template list" role="list">
                    {
                      filteredTemplates.map((template, index) => (
                        <TemplateSelectListItem
                          key={index}
                          item={template}
                          onSelect={handleSelect}
                        />
                      ))
                    }
                  </div>
                ) : (
                  <div className="template-list" aria-label="Template list" role="list">
                    {
                      templates.map((template, index) => (
                        <TemplateSelectListItem
                          key={index}
                          item={template}
                          onSelect={handleSelect}
                        />
                      ))
                    }
                  </div>
                )
                }
                {/* {templates.map((template, index) => (
            <TemplateSelectListItem
              key={index}
              item={template}
              onSelect={handleSelect}
            />
          ))} */}
              </div>
            </section>

            {(publicTemplatesList && publicTemplatesList.length > 0) && (
              <section className="mb-8" aria-labelledby="public-templates">
                <h2 id="public-templates">
                  Use one of the public templates
                </h2>
                <div className="template-list"
                  role="list"
                  aria-label="Public templates">
                  {filteredPublicTemplates && filteredPublicTemplates.length > 0 ? (
                    <div className="template-list" aria-label="Template list" role="list">
                      {
                        filteredPublicTemplates.map((template, index) => (
                          <TemplateSelectListItem
                            key={index}
                            item={template}
                            onSelect={handleSelect}
                          />
                        ))
                      }
                    </div>
                  ) : (
                    <div className="template-list" aria-label="Template list" role="list">
                      {
                        publicTemplatesList.map((template, index) => (
                          <TemplateSelectListItem
                            key={index}
                            item={template}
                            onSelect={handleSelect}
                          />
                        ))
                      }
                    </div>
                  )
                  }

                </div>
              </section>
            )}

          </>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
}

export default TemplateSelectTemplatePage;
