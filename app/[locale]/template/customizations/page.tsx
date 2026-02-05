'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { useTranslations } from 'next-intl';

//GraphQL
import { useLazyQuery } from '@apollo/client/react';
import { CustomizableTemplatesDocument, CustomizableTemplatesQuery } from '@/generated/graphql';

// Components
import PageHeader from '@/components/PageHeader';
import CustomizedTemplateListItem from '@/components/CustomizedTemplateListItem';
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import ErrorMessages from '@/components/ErrorMessages';

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';
import { useFormatDate } from '@/hooks/useFormatDate';

// Utils and other
import { toSentenceCase } from '@/utils/general';
import { logECS, routePath } from '@/utils/index';
import {
  TemplateSearchResultInterface,
  TemplateItemProps,
  PaginatedTemplateSearchResultsInterface
} from '@/app/types';
import styles from './templateCustomizations.module.scss';

// # of templates displayed per section type
const LIMIT = 5;


const TemplateListCustomizationsPage: React.FC = () => {
  const formatDate = useFormatDate();
  const { scrollToTop } = useScrollToTop();

  const errorRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchButtonClicked, setSearchButtonClicked] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [totalCount, setTotalCount] = useState<number | null>(0);
  const [searchResults, setSearchResults] = useState<TemplateItemProps[]>([]);
  const [isSearchFetch, setIsSearchFetch] = useState(false);
  const [firstNewIndex, setFirstNewIndex] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Add separate state for search pagination
  const [searchNextCursor, setSearchNextCursor] = useState<string | null>(null);
  const [searchTotalCount, setSearchTotalCount] = useState<number | null>(0);


  const [templates, setTemplates] = useState<(TemplateItemProps)[]>([]);

  // For translations
  const t = useTranslations('OrganizationTemplates');
  const Customizable = useTranslations('CustomizableTemplates');
  const Global = useTranslations('Global');
  const SelectTemplate = useTranslations('TemplateSelectTemplatePage');

  // Set URLs
  const TEMPLATE_CREATE_URL = routePath('template.create');

  // Lazy query for organization templates
  const [fetchCustomizableTemplates, { data: customizableTemplatesData, loading, error: queryError }] = useLazyQuery<CustomizableTemplatesQuery>(CustomizableTemplatesDocument);

  // zero out search and filters
  const resetSearch = async () => {
    setSearchTerm('');
    setSearchButtonClicked(false);
    setSearchTotalCount(null);
    setSearchResults([]);
    setSearchNextCursor(null); // Reset search cursor
    setIsSearchFetch(false);

    //Reset templates
    setTemplates([]);
    setNextCursor(null); // Reset cursor
    setTotalCount(0);
    await fetchCustomizableTemplates({
      variables: {
        paginationOptions: {
          limit: LIMIT,
        },
      },
    });
    scrollToTop(topRef);
  }

  // Handle search input
  const handleSearchInput = async (term: string) => {
    setSearchTerm(term);
    if (term === '') {
      await resetSearch();
      return;
    }
    setErrors([]);
  };

  // Run search for search term
  const handleSearch = async () => {

    if (!searchTerm.trim()) {
      return;
    }

    setSearchButtonClicked(true);
    setErrors([]);
    setIsSearchFetch(true);
    setIsSearching(true); // Used to disable search button
    setSearchResults([]); // Clear previous search results
    setSearchNextCursor(null); // Reset search cursor

    await fetchCustomizableTemplates({
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: LIMIT,
        },
        term: searchTerm.toLowerCase(),
      },
    });
  }

  // Handler for search "Load more"
  const handleSearchLoadMore = async () => {
    if (!searchNextCursor) return;
    setFirstNewIndex(searchResults.length);
    await fetchCustomizableTemplates({
      variables: {
        paginationOptions: {
          type: "CURSOR",
          cursor: searchNextCursor,
          limit: LIMIT,
        },
        term: searchTerm.toLowerCase(),
      },
    });
  };


  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setFirstNewIndex(templates.length);
    await fetchCustomizableTemplates({
      variables: {
        paginationOptions: {
          type: "CURSOR",
          cursor: nextCursor,
          limit: LIMIT,
        },
      },
    });
  };

  useEffect(() => {
    // Need this to set list of projects back to original, full list after filtering
    if (searchTerm === '') {
      setSearchButtonClicked(false);
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

  // Scroll to the next set of items when user clicks "Load more"
  useEffect(() => {
    if (firstNewIndex !== null) {
      const timeoutId = setTimeout(() => {
        const element = document.querySelector(`[data-index="${firstNewIndex}"]`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
        setFirstNewIndex(null); // reset after scroll
      }, 150); // allow time for DOM update

      return () => clearTimeout(timeoutId);
    }
  }, [templates, searchResults, firstNewIndex]);

  useEffect(() => {
    if (!customizableTemplatesData || !customizableTemplatesData.customizableTemplates) return;
    // Transform templates into format expected by TemplateSelectListItem component
    const processTemplates = async (templates: PaginatedTemplateSearchResultsInterface | null) => {
      const items = templates?.items ?? [];

      const transformedTemplates = await Promise.all(
        items.map(async (template: TemplateSearchResultInterface | null) => {
          const statusForTemplate = template?.isDirty && template?.latestPublishDate
            ? Customizable('templateStatus.hasChanged')
            : !template?.latestPublishDate
              ? Customizable('templateStatus.notCustomized')
              : t('status.published');
          return {
            id: template?.id,
            title: template?.name || "",
            link: routePath('template.customize', { templateId: Number(template?.id) }),
            funder: template?.ownerDisplayName,
            lastUpdated: (template?.modified) ? formatDate(template?.modified) : null,
            lastRevisedBy: template?.modifiedByName,
            publishStatus: statusForTemplate,
            publishDate: (template?.latestPublishDate) ? formatDate(template?.latestPublishDate) : null,
            defaultExpanded: false,
            latestPublishVisibility: toSentenceCase(template?.latestPublishVisibility ? template?.latestPublishVisibility?.toString() : '')
          }
        }));

      if (isSearchFetch) {
        // Handle search results - backend returns only new items for cursor pagination
        if (searchResults.length === 0) {
          // First search request - set all results
          setSearchResults(transformedTemplates);
        } else {
          // Subsequent search requests - append new items
          setSearchResults(prev => [...prev, ...transformedTemplates]);
        }
        setSearchNextCursor(customizableTemplatesData?.customizableTemplates?.nextCursor ?? null);
        setSearchTotalCount(customizableTemplatesData?.customizableTemplates?.totalCount ?? null);
        setIsSearching(false); // Re-enable search button
      } else {
        // Handle regular pagination - backend returns only new items for cursor pagination
        if (items.length === 0) {
          // First load - set all results
          setTemplates(transformedTemplates);
        } else {
          // Subsequent loads - append new items (backend sends only new items)
          setTemplates(prev => [...prev, ...transformedTemplates]);
        }

        setNextCursor(customizableTemplatesData?.customizableTemplates?.nextCursor ?? null);
        setTotalCount(customizableTemplatesData?.customizableTemplates?.totalCount ?? null);
      }
    }

    processTemplates({
      ...customizableTemplatesData.customizableTemplates,
      items: (customizableTemplatesData.customizableTemplates.items ?? []).filter((item): item is TemplateSearchResultInterface => item !== null),
    });

  }, [customizableTemplatesData, isSearchFetch]);

  // Load templates when page loads
  useEffect(() => {
    fetchCustomizableTemplates({
      variables: {
        paginationOptions: {
          limit: LIMIT,
        },
      },
    });
  }, []);


  useEffect(() => {
    // Log query errors and avoid duplicates
    if (queryError && !errors.includes(queryError.message)) {
      setErrors(prev => [...prev, queryError.message]);

      logECS('error', 'fetchTemplates', {
        errors: queryError,
        url: { path: routePath('template.index') }
      });
    }
  }, [queryError]);

  return (
    <>
      <PageHeader
        title={Customizable('title')}
        description={Customizable('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('template.index')}>{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            <Breadcrumb>{Customizable('title')}</Breadcrumb>
          </Breadcrumbs>
        }
      />
      <ErrorMessages errors={errors} ref={errorRef} />

      <LayoutContainer>
        <ContentContainer>
          <div className="searchSection" role="search" ref={topRef}>
            <SearchField>
              <Label>{t('searchLabel')}</Label>
              <Input value={searchTerm} onChange={e => handleSearchInput(e.target.value)} />
              <Button
                onPress={() => {
                  handleSearch();
                }}
                isDisabled={isSearching}
              >
                {Global('buttons.search')}
              </Button>
              <FieldError />
              <Text slot="description" className="help">
                {t('searchHelpText')}
              </Text>
            </SearchField>
          </div >

          {loading && <p>{Global('messaging.loading')}</p>}

          {isSearchFetch && (
            <Button onPress={resetSearch} className={`${styles.searchMatchText} link`}> {Global('links.clearFilter')}</Button>
          )}
          {isSearchFetch && searchResults.length > 0 ? (
            <div className={`${styles.templateCards} template-list`} role="list" aria-label={t('templateList')}>
              {searchResults.map((template, index) => (
                <div
                  key={`${template.id}-${index}`}
                  role="listitem"
                  data-index={index}
                >
                  <CustomizedTemplateListItem
                    item={template} />
                </div>
              ))}

              {searchNextCursor && (
                <div className={styles.loadBtnContainer}>
                  <Button
                    type="button"
                    data-testid="search-load-more-btn"
                    onPress={handleSearchLoadMore}
                    aria-label={SelectTemplate('loadMoreSearchResults')}
                  >
                    {Global('buttons.loadMore')}
                  </Button>
                  <div>
                    {Global('messaging.numDisplaying', { num: searchResults.length, total: searchTotalCount || '' })}
                  </div>
                  <Button onPress={resetSearch} className={`${styles.searchMatchText} link`}> {Global('links.clearFilter')}</Button>

                </div>
              )}
            </div>
          ) : (
            <>
              <div className='template-list' role="list" aria-label={t('templateList')}>
                {searchTerm && searchButtonClicked ? (
                  <p>{Global('messaging.noItemsFound')}</p>
                ) : (
                  <>
                    {templates.map((template, index) => (
                      <div
                        key={`${template.id}-${index}`}
                        data-index={index}
                      >
                        <CustomizedTemplateListItem
                          item={template} />
                      </div>
                    ))}
                    {nextCursor && (
                      <div className={styles.loadBtnContainer}>
                        <Button
                          type="button"
                          data-testid="load-more-btn"
                          onPress={handleLoadMore}
                          aria-label={SelectTemplate('loadMoreTemplates')}
                        >
                          {Global('buttons.loadMore')}
                        </Button>
                        <div className={styles.remainingText}>
                          {Global('messaging.numDisplaying', { num: templates.length, total: totalCount || '' })}
                        </div>
                        {isSearchFetch && (
                          <Button onPress={resetSearch} className={`${styles.searchMatchText} link`}> {Global('links.clearFilter')}</Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

        </ContentContainer>
      </LayoutContainer >
    </>
  );
}

export default TemplateListCustomizationsPage;