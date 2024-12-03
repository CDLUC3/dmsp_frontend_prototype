'use client';

import React, { useEffect, useState } from 'react';
import { createApolloClient } from '@/lib/graphql/client/apollo-client';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Input,
  Label,
  Link,
  SearchField,
  Text
} from "react-aria-components";
import { useFormatter } from 'next-intl';

//GraphQL
import {
  useTemplatesQuery,
  VersionedTemplate,
  TemplateVersionsDocument,
  TemplateVersionsQuery,
  TemplateVersionsQueryVariables
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import TemplateListItem from "@/components/TemplateListItem";

import {
  TemplateItemProps,
  TemplateInterface,

} from '@/app/types';


const TemplateListPage: React.FC = () => {
  const formatter = useFormatter();
  const client = createApolloClient();
  const [errors, setErrors] = useState<string[]>([]);
  const [templates, setTemplates] = useState<(TemplateItemProps)[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<(TemplateItemProps)[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data = {}, loading, error, refetch } = useTemplatesQuery();

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  }

  const handleFiltering = () => {
    const filteredList = templates.filter(item => item.title.includes(searchTerm));
    setFilteredTemplates(filteredList);
  }

  const fetchLatestVersion = async (templateId: number) => {
    try {
      const { data } = await client.query<TemplateVersionsQuery, TemplateVersionsQueryVariables>({
        query: TemplateVersionsDocument,
        variables: { templateId },
      });

      // Get record with latest modification, and return its versionType
      if (!data?.templateVersions || data?.templateVersions.length === 0) return null;
      const latestVersion = data.templateVersions.reduce<VersionedTemplate | null>(
        (latest, current) => {
          // If current is null, return latest
          if (!current) return latest;

          // If latest is null, return current
          if (!latest) return current as VersionedTemplate;

          const latestModified = latest.modified ? new Date(Number(latest.modified)).getTime() : 0;
          const currentModified = current.modified ? new Date(Number(current.modified)).getTime() : 0;

          return currentModified > latestModified
            ? current as VersionedTemplate
            : latest;
        },
        null // initial value as null
      );

      return latestVersion;
    } catch (error) {
      console.error('Error fetching template versions:', error);
      return null;
    }
  };

  const formatDate = (date: string) => {
    const formattedDate = formatter.dateTime(new Date(Number(date)), {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    // Replace slashes with hyphens
    return formattedDate.replace(/\//g, '-');
  }

  useEffect(() => {
    // Automatically refetch if there's an error
    if (error) {
      console.error('Error fetching templates:', error.message);
      refetch();
    }
  }, [error, refetch]);


  useEffect(() => {
    if (data && data?.templates) {
      const fetchAllTemplates = async (templates: (TemplateInterface | null)[]) => {
        const transformedTemplates = await Promise.all(
          templates.map(async (template: any) => {
            const latestVersion = await fetchLatestVersion(Number(template?.id));
            return {
              title: template?.name || "",
              link: `/template/${template?.id}`,
              content: template?.description || template?.modified ? (
                <div>
                  <p>{template?.description}</p>
                  <p>Last updated: {latestVersion?.modified ? formatDate(latestVersion?.modified) : null}</p>
                </div>
              ) : null, // Set to null if no description or last modified data
              funder: template?.owner?.name || template?.name,
              lastUpdated: (template?.modified) ? formatDate(template?.modified) : null,
              publishStatus: latestVersion?.versionType ? latestVersion?.versionType : 'DRAFT',
              defaultExpanded: false
            }
          }));

        setTemplates(transformedTemplates);
      }
      fetchAllTemplates(data?.templates);
    }
  }, [data]);

  return (
    <>
      <PageHeader
        title="Organization Templates"
        description="Manager or create DMSP templates, once published researchers will be able to select your template."
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Organization Templates</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Link href="/template/create"
              className={"button-link button--primary"}>Create
              Template</Link>
          </>
        }
        className="page-template-list"
      />

      <div className="Filters">
        <SearchField>
          <Label>Search by keyword</Label>
          <Input onChange={e => handleSearchInput(e)} />
          <Button onPress={handleFiltering}>Search</Button>
          <FieldError />
          <Text slot="description" className="help">
            Search by research organization, field station or lab, template description, etc.
          </Text>
        </SearchField>
      </div>

      {filteredTemplates.length > 0 ? (
        <div className="template-list" aria-label="Template list" role="list">
          {
            filteredTemplates.map((template, index) => (
              <TemplateListItem
                key={index}
                item={template} />
            ))
          }
        </div>
      ) : (
        <div className="template-list" aria-label="Template list" role="list">
          {
            templates.map((template, index) => (
              <TemplateListItem
                key={index}
                item={template} />
            ))
          }
        </div>
      )}

    </>
  );
}

export default TemplateListPage;