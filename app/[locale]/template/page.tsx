'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createApolloClient } from '@/lib/graphql/client/apollo-client';
import { ApolloError } from "@apollo/client";
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
} from 'react-aria-components';
import { useFormatter, useTranslations } from 'next-intl';

//GraphQL
import {
  useTemplatesQuery,
  VersionedTemplate,
  TemplateVersionsDocument,
  TemplateVersionsQuery,
  TemplateVersionsQueryVariables
} from '@/generated/graphql';

// Components
import PageHeader from '@/components/PageHeader';
import TemplateListItem from '@/components/TemplateListItem';
import {
  LayoutContainer,
  ContentContainer,
} from '@/components/Container';

import {
  TemplateItemProps,
  TemplateInterface,
} from '@/app/types';
import styles from './template.module.scss';

const TemplateListPage: React.FC = () => {
  const formatter = useFormatter();
  const client = createApolloClient();
  const [errors, setErrors] = useState<string[]>([]);
  const [templates, setTemplates] = useState<(TemplateItemProps)[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<(TemplateItemProps)[] | null>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const errorRef = useRef<HTMLDivElement | null>(null);
  // For translations
  const t = useTranslations('OrganizationTemplates');

  // Make graphql request for templates under the user's affiliation
  const { data = {}, loading, error: queryError, refetch } = useTemplatesQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
  });

  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  // Filter results when a user enters a search term and clicks "Search" button
  const handleFiltering = (term: string) => {
    setErrors([]);
    const filteredList = templates.filter(item => item.title.includes(term));
    if (filteredList.length >= 1) {
      setSearchTerm(term);
      setFilteredTemplates(filteredList);
    } else {
      //If there are no matching results, then display an error
      const errorMessage = t('noItemsFoundError', { term })
      setErrors(prev => [...prev, errorMessage]);
    }
  }

  const fetchTemplateVersions = async (templateId: number) => {
    try {
      const { data } = await client.query<TemplateVersionsQuery, TemplateVersionsQueryVariables>({
        query: TemplateVersionsDocument,
        variables: { templateId },
      });
      return data;
    } catch (err) {
      if (err instanceof ApolloError) {
        const { data } = await client.query<TemplateVersionsQuery, TemplateVersionsQueryVariables>({
          query: TemplateVersionsDocument,
          variables: { templateId },
        });
        return data;
      } else {
        console.error('Error fetching template versions:', err);
      }
    }
  }

  // Get all template versions in order to get latest one with its versionType
  const fetchLatestVersion = async (templateId: number) => {
    try {
      const data = await fetchTemplateVersions(templateId);
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

  useEffect(() => {
    if (queryError) {
      if (queryError instanceof ApolloError) {
        // Trigger a refetch on error so page re-renders for apollo errors
        refetch();
      } else {
        // Safely access queryError.message
        setErrors(prev => [...prev, t('somethingWentWrong')]);
      }
    }
  }, [queryError, refetch]);


  useEffect(() => {
    // Transform templates into format expected by TemplateListItem component
    if (data && data?.templates) {
      const fetchAllTemplates = async (templates: (TemplateInterface | null)[]) => {
        const transformedTemplates = await Promise.all(
          templates.map(async (template: TemplateInterface | null) => {
            const latestVersion = await fetchLatestVersion(Number(template?.id));
            return {
              title: template?.name || "",
              link: `/template/${template?.id}`,
              content: template?.description || template?.modified ? (
                <div>
                  <p>{template?.description}</p>
                  <p>Last updated: {(latestVersion?.modified) ? formatDate(latestVersion?.modified) : null}</p>
                </div>
              ) : null, // Set to null if no description or last modified data
              funder: template?.owner?.name || template?.name,
              lastUpdated: (template?.modified) ? formatDate(template?.modified) : null,
              publishStatus: (latestVersion?.versionType) ? latestVersion?.versionType : 'DRAFT',
              defaultExpanded: false
            }
          }));

        setTemplates(transformedTemplates);
      }
      fetchAllTemplates(data?.templates);
    }
  }, [data]);

  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      setFilteredTemplates(null);
    }
  }, [searchTerm])

  // If page-level errors, scroll them into view
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [errors]);

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{t('breadcrumbHome')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{t('title')}</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Link href="/template/create"
              className={"button-link button--primary"}>{t('actionCreate')}</Link>
          </>
        }
        className="page-template-list"
      />
      {errors && errors.length > 0 &&
        <div className="error" ref={errorRef}>
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      }

      {loading && <p>{t('loading')}</p>}
      <LayoutContainer>
        <ContentContainer>
          <div className="Filters">
            <SearchField
              className={`${styles.searchField} react-aria-SearchField`}
              onClear={() => { setFilteredTemplates(null) }}
            >
              <Label>{t('searchLabel')}</Label>
              <Input value={searchTerm} onChange={e => handleSearchInput(e.target.value)} />
              <Button
                onPress={() => {
                  // Call your filtering function without changing the input value
                  handleFiltering(searchTerm);
                }}
              >
                {t('actionSearch')}
              </Button>
              <FieldError />
              <Text slot="description" className="help">
                {t('searchHelpText')}
              </Text>
            </SearchField>

          </div >

          {filteredTemplates && filteredTemplates.length > 0 ? (
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
          )
          }
        </ContentContainer>
      </LayoutContainer>
    </>
  );
}

export default TemplateListPage;