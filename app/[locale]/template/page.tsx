'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { useTemplatesQuery, } from '@/generated/graphql';

// Components
import PageHeader from '@/components/PageHeader';
import TemplateListItem from '@/components/TemplateListItem';
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import ErrorMessages from '@/components/ErrorMessages';

import logECS from '@/utils/clientLogger';
import { TemplateInterface, TemplateItemProps, } from '@/app/types';

const TemplateListPage: React.FC = () => {
  const formatter = useFormatter();
  const [errors, setErrors] = useState<string[]>([]);
  const [templates, setTemplates] = useState<(TemplateItemProps)[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<(TemplateItemProps)[] | null>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const errorRef = useRef<HTMLDivElement | null>(null);

  // For translations
  const t = useTranslations('OrganizationTemplates');

  // Make graphql request for templates under the user's affiliation
  const { data = {}, loading, error: queryError } = useTemplatesQuery({
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
    const filteredList = templates.filter(item =>
      item.title.toLowerCase().includes(term.toLowerCase())
    );
    if (filteredList.length >= 1) {
      setSearchTerm(term);
      setFilteredTemplates(filteredList);
    } else {
      //If there are no matching results, then display an error
      const errorMessage = t('noItemsFoundError', { term })
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

  useEffect(() => {
    if (queryError) {
      if (queryError instanceof ApolloError) {
        setErrors(prevErrors => [...prevErrors, queryError.message]);
        logECS('error', 'queryError', {
          error: queryError,
          url: { path: '/template' }
        });
      } else {
        // Safely access queryError.message
        setErrors(prev => [...prev, t('somethingWentWrong')]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryError]);


  useEffect(() => {
    // Transform templates into format expected by TemplateListItem component
    if (data && data?.myTemplates) {
      const fetchAllTemplates = async (templates: (TemplateInterface | null)[]) => {
        const transformedTemplates = await Promise.all(
          templates.map(async (template: TemplateInterface | null) => {
            return {
              title: template?.name || "",
              link: `/template/${template?.id}`,
              content: template?.description || template?.modified ? (
                <div>
                  <p>{template?.description}</p>
                  <p>Last updated: {(template?.modified) ? formatDate(template?.modified) : null}</p>
                </div>
              ) : null, // Set to null if no description or last modified data
              funder: template?.owner?.name || template?.name,
              lastUpdated: (template?.modified) ? formatDate(template?.modified) : null,
              publishStatus: (template?.isDirty) ? 'Published' : 'Unpublished',
              defaultExpanded: false
            }
          }));

        setTemplates(transformedTemplates);
      }
      fetchAllTemplates(data?.myTemplates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      setFilteredTemplates(null);
    }
  }, [searchTerm])

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
      <ErrorMessages errors={errors} ref={errorRef} />

      {loading && <p>{t('loading')}</p>}
      <LayoutContainer>
        <ContentContainer>
          <div className="Filters">
            <SearchField
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
