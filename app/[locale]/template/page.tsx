'use client';

import React, {useEffect, useRef, useState} from 'react';
import {ApolloClient, ApolloError} from "@apollo/client";
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
import {useFormatter, useTranslations} from 'next-intl';

//GraphQL
import {useTemplatesQuery,} from '@/generated/graphql';

// Components
import PageHeader from '@/components/PageHeader';
import TemplateListItem from '@/components/TemplateListItem';
import {ContentContainer, LayoutContainer,} from '@/components/Container';
import ErrorMessages from '@/components/ErrorMessages';
import LoadMoreButton from '@/components/LoadMoreButton';

// Hooks
import {useScrollToTop} from '@/hooks/scrollToTop';

import logECS from '@/utils/clientLogger';
import {TemplateSearchResultInterface, TemplateItemProps,} from '@/app/types';
import styles from './orgTemplates.module.scss';

const TemplateListPage: React.FC = () => {
  const PAGINATION_LIMIT = 3;

  const formatter = useFormatter();
  const { scrollToTop } = useScrollToTop();

  const errorRef = useRef<HTMLDivElement | null>(null);
  const nextSectionRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [templates, setTemplates] = useState<(TemplateItemProps)[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<(TemplateItemProps)[] | null>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [visibleCount, setVisibleCount] = useState({
    templates: PAGINATION_LIMIT,
    filteredTemplates: PAGINATION_LIMIT,
  });


  // For translations
  const t = useTranslations('OrganizationTemplates');
  const Global = useTranslations('Global');
  const SelectTemplate = useTranslations('TemplateSelectTemplatePage');

  // Make graphql request for templates under the user's affiliation
  const { data = {}, loading, fetchMore, updateQuery, error: queryError } = useTemplatesQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
    variables: {
      term: searchTerm,
      limit: PAGINATION_LIMIT,
    },
  });

  // zero out search and filters
  const resetSearch = () => {
    setSearchTerm('');
    setFilteredTemplates(null);
    setVisibleCount({
      templates: 3,
      filteredTemplates: 3,
    });
    // Refetch the original data
    handleLoadMore('templates');
    scrollToTop(topRef);
  }


  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  // Extract text content because sometimes `content` can be a JSX Element
  const extractTextFromJSX = (element: React.ReactNode): string => {
    if (typeof element === 'string') {
      return element;
    }
    if (React.isValidElement(element)) {
      const children = element.props.children;
      if (Array.isArray(children)) {
        return children.map(extractTextFromJSX).join(' ');
      }
      return extractTextFromJSX(children);
    }
    return '';
  }

  // Find title, funder, content and publishStatus fields that include search term
  const handleFiltering = (term: string) => {
    setErrors([]);
    const lowerCaseTerm = term.toLowerCase();
    const filteredList = templates.filter(item => {
      const contentText = extractTextFromJSX(item.content);
      return [item.title,
        contentText,
      item.funder,
      item.publishStatus
      ]
        .filter(Boolean)
        .some(field => field?.toLowerCase().includes(lowerCaseTerm));
    });

    if (filteredList.length >= 1) {
      setSearchTerm(term);
      setFilteredTemplates(filteredList);
    } else {
      //If there are no matching results, then display an error
      const errorMessage = t('noItemsFoundError', { term })
      setErrors(prev => [...prev, errorMessage]);
    }
  }

  type VisibleCountKeys = keyof typeof visibleCount;

  // WHen the user clicks the 'Search' button, reload the data with the new search term
  const handleNewQuery = (listKey: VisibleCountKeys) => {
    setTemplates([]);

console.log('search term', searchTerm);

    updateQuery((prev) => ({
      ...prev,
      myTemplates: {
        ...prev.myTemplates,
        term: searchTerm,
        cursor: null,
        limit: PAGINATION_LIMIT,
      },
    }));

    setVisibleCount(prev => ({
      ...prev,
      [listKey]: PAGINATION_LIMIT,
    }));
  };

  // When user clicks the 'Load more' button, display 3 more by default
  const handleLoadMore = (listKey: VisibleCountKeys) => {
    fetchMore({
      variables: {
        term: searchTerm,
        cursor: data.myTemplates?.cursor,
        limit: PAGINATION_LIMIT,
      },
    });

    setVisibleCount(prev => ({
      ...prev,
      [listKey]: prev[listKey] + PAGINATION_LIMIT,
    }));
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
    if (data?.myTemplates) {
      const feed = Array.isArray(data.myTemplates?.feed) ? data.myTemplates.feed : [];

      const fetchAllTemplates = async (feed: (TemplateSearchResultInterface | null)[]) => {
        const transformedTemplates = await Promise.all(
          feed.map(async (template: TemplateSearchResultInterface | null) => ({
            id: template?.id || Math.random(), // Ensure 'id' is included
            title: template?.name || "",
            link: `/template/${template?.id}`,
            content:
              template?.description || template?.modified ? (
                <div>
                  <p>{template?.description}</p>
                  <p>
                    Last updated: {template?.modified ? formatDate(template.modified) : null}
                  </p>
                </div>
              ) : null,
            funder: template?.ownerDisplayName,
            lastUpdated: template?.modified ? formatDate(template.modified) : null,
            publishStatus: template?.isDirty ? "Published" : "Unpublished",
            defaultExpanded: false,
          }))
        );

        // Need to concatenate the new templates with the existing ones here to get React to re-render
        setTemplates(prevTemplates => [...prevTemplates, ...transformedTemplates]);
      };

      fetchAllTemplates(feed);
    }
  }, [data]);


  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      setFilteredTemplates(null);
    }
  }, [searchTerm])

  // TODO: Implement shared loading
  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{t('breadcrumbHome')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{t('title')}</Link></Breadcrumb>
            <Breadcrumb>{t('title')}</Breadcrumb>
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

      <LayoutContainer>
        <ContentContainer>
          <div className="Filters" ref={topRef}>
            <SearchField
              onClear={() => { setFilteredTemplates(null) }}
            >
              <Label>{t('searchLabel')}</Label>
              <Input value={searchTerm} onChange={e => handleSearchInput(e.target.value)} />
              <Button
                onPress={() => {
                  // Call your filtering function without changing the input value
                  // handleFiltering(searchTerm);
                  handleNewQuery('templates');
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

          <div className="template-list" aria-label="Template list" role="list">
            {
              templates.slice(0, visibleCount['templates']).map((template, index) => {
                const isFirstInNextSection = index === visibleCount['templates'] - 3;
                return (
                  <div ref={isFirstInNextSection ? nextSectionRef : null} key={index}>
                    <TemplateListItem
                      key={index}
                      item={template} />
                  </div>
                )

              })
            }
            <LoadMoreButton
              paginableFeed={data?.myTemplates || undefined}
              pageSize={PAGINATION_LIMIT}
              onPress={() => {
                handleLoadMore('templates');
              }}/>
          </div>

        </ContentContainer>
      </LayoutContainer>
    </>
  );
}

export default TemplateListPage;
