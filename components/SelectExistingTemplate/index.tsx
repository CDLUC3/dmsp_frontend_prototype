'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import TemplateList from '@/components/TemplateList';
import ErrorMessages from '@/components/ErrorMessages';
import Pagination from '@/components/Pagination';

//GraphQL
import {
  PublishedTemplateSearchResults,
  useAddTemplateMutation,
  usePublishedTemplatesLazyQuery,
  VersionedTemplateSearchResult
} from '@/generated/graphql';

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';
// Other
import logECS from '@/utils/clientLogger';
import {
  MyVersionedTemplatesInterface,
  TemplateItemProps,
  PaginatedMyVersionedTemplatesInterface,
  PaginatedVersionedTemplateSearchResultsInterface
} from '@/app/types';
import { toSentenceCase } from '@/utils/general';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useToast } from '@/context/ToastContext';

// # of templates displayed
const LIMIT = 5;

type TemplateType = 'org' | 'bestPractice';

interface FetchTemplateByTypeParams {
  sectionType: TemplateType;
  page?: number;
  searchTerm?: string;
}


interface TemplateListInterface {
  id: number | null;
  name: string;
  description: string;
  latestPublishVisibility: string | null;
  isDirty: boolean | null;
  latestPublishedVersion: number | null;
  latestPublishDate: string | null;
  ownerId: number | null;
  ownerDisplayName: string | null;
  modified: string | null;
  modifiedById: number | null;
  modifiedByName: string | null;
  bestPractice: boolean | null;
}

// Step 2 of the Create Template start pages
const TemplateSelectTemplatePage = ({ templateName }: { templateName: string }) => {
  const nextSectionRef = useRef<HTMLDivElement>(null);
  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const formatDate = useFormatDate();
  const router = useRouter();
  const toastState = useToast();
  const { scrollToTop } = useScrollToTop();

  // State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchButtonClicked, setSearchButtonClicked] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState({
    publicTemplatesList: 3,
    templates: 3,
    filteredTemplates: 3,
    filteredPublicTemplates: 3,
  });


  const [bestPracticeTemplates, setBestPracticeTemplates] = useState<TemplateItemProps[]>([]);
  const [orgTemplates, setOrgTemplates] = useState<TemplateItemProps[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);


  // Separate pagination states
  const [orgPagination, setOrgPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const [bestPracticePagination, setBestPracticePagination] = useState({
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });


  //Localization keys
  const SelectTemplate = useTranslations('TemplateSelectTemplatePage');
  const Global = useTranslations('Global');

  // Separate lazy queries for published sections
  const [fetchOrgTemplates, { data: orgTemplatesData, loading: orgLoading }] = usePublishedTemplatesLazyQuery();
  const [fetchBestPracticeTemplates, { data: bestPracticeData, loading: bestPracticeLoading }] = usePublishedTemplatesLazyQuery();

  // GraphQL mutation for adding the new template
  const [addTemplateMutation] = useAddTemplateMutation({
    notifyOnNetworkStatusChange: true,
  });

  const clearErrors = () => {
    setErrors([]);
  }

  const fetchTemplatesByType = async ({
    sectionType,
    page = 1,
    searchTerm = ''
  }: FetchTemplateByTypeParams) => {
    if (sectionType === 'org') {
      let offsetLimit = 0;
      if (page) {
        setOrgPagination(prev => ({ ...prev, currentPage: page }));
        offsetLimit = (page - 1) * LIMIT;
      }
      await fetchOrgTemplates({
        variables: {
          paginationOptions: {
            offset: offsetLimit,
            limit: LIMIT,
            type: "OFFSET",
            sortDir: "DESC",
            bestPractice: false
          },
          term: searchTerm,
        }
      });
    } else {
      let offsetLimit = 0;
      if (page) {
        setBestPracticePagination(prev => ({ ...prev, currentPage: page }));
        offsetLimit = (page - 1) * LIMIT;
      }
      await fetchBestPracticeTemplates({
        variables: {
          paginationOptions: {
            offset: offsetLimit,
            limit: LIMIT,
            type: "OFFSET",
            sortDir: "DESC",
            bestPractice: true
          },
          term: searchTerm,
        }
      });
    }
  };

  // Handle page click for org sections
  const handleOrgPageClick = async (page: number) => {
    await fetchTemplatesByType({ sectionType: 'org', page, searchTerm });
  };
  // Handle page click for best practice sections
  const handleBestPracticePageClick = async (page: number) => {
    await fetchTemplatesByType({ sectionType: 'bestPractice', page, searchTerm });
  };

  // zero out search and filters
  const resetSearch = () => {
    setSearchTerm('');
    scrollToTop(topRef);
  }


  // Handle input changes
  const handleInputChange = (value: string) => {
    // Update search term immediately for UI responsiveness
    setSearchTerm(value);
    if (value === '') {
      //reset search
      resetSearch();
    }
  };

  // Handle search input
  const handleSearchInput = async (term: string) => {
    setSearchTerm(term);
    clearErrors();

    // Reset both paginations to first page
    setOrgPagination(prev => ({ ...prev, currentPage: 1 }));
    setBestPracticePagination(prev => ({ ...prev, currentPage: 1 }));

    // Fetch both types with search term
    await Promise.all([
      fetchTemplatesByType({ sectionType: 'org', page: 1, searchTerm: term }),
      fetchTemplatesByType({ sectionType: 'bestPractice', page: 1, searchTerm: term })
    ]);
  };

  // When user selects a pre-existing template, we will create the new template
  // using a copy of the pre-existing template
  const onSelect = async (versionedTemplateId: number) => {
    addTemplateMutation({
      variables: {
        name: templateName,
        copyFromTemplateId: versionedTemplateId,
      },
    }).then(response => {
      if (response?.data) {
        const responseData = response?.data?.addTemplate;
        if (responseData && responseData.errors) {
          const errorMessages = Object.values(responseData.errors)
            .filter((error) => error) as string[];
          setErrors(errorMessages);
        }
        clearErrors();

        const newTemplateId = response?.data?.addTemplate?.id;
        if (newTemplateId) {
          router.push(`/template/${newTemplateId}`)
        }
      }
    }).catch(err => {
      logECS('error', 'handleClick', {
        error: err,
        url: { path: '/template/create' }
      });
    });
  }

  async function handleStartNew() {
    addTemplateMutation({
      variables: { name: templateName },
    }).then(response => {
      if (response?.data) {
        const responseData = response?.data?.addTemplate;
        if (responseData && responseData.errors) {
          const errorMessages = Object.values(responseData.errors)
            .filter((error) => error) as string[];
          setErrors(errorMessages);
        }
        clearErrors();

        const newTemplateId = response?.data?.addTemplate?.id;
        if (newTemplateId) {
          router.push(`/template/${newTemplateId}`)
        }
      }
    }).catch(err => {
      logECS('error', 'handleStartNew', {
        error: err,
        url: { path: '/template/create' }
      });
    });
  }

  // Transform data into more easier to use properties
  const transformTemplates = async (
    templates: PublishedTemplateSearchResults | null
  ): Promise<{ orgTemplates: TemplateItemProps[]; bestPracticeTemplates: TemplateItemProps[] }> => {

    const publishedTemplates = templates?.items?.filter(template => template !== null && template !== undefined) || [];

    if (publishedTemplates.length === 0) {
      return { orgTemplates: [], bestPracticeTemplates: [] };
    }
    const transformedTemplates = await Promise.all(
      publishedTemplates.map(async (template: VersionedTemplateSearchResult | null) => ({
        id: template?.id,
        template: {
          id: template?.templateId ? template?.templateId : null
        },
        title: template?.name || "",
        description: template?.description || "",
        link: `/template/${template?.templateId ? template?.templateId : ''}`,
        content: template?.description || template?.modified ? (
          <div>
            <p>{template?.description}</p>
            <p>
              {Global('lastUpdated')}: {template?.modified ? formatDate(template?.modified) : null}
            </p>
          </div>
        ) : null, // Set to null if no description or last modified data
        funder: template?.ownerDisplayName || template?.name,
        lastUpdated: template?.modified ? formatDate(template?.modified) : null,
        lastRevisedBy: template?.modifiedByName || null,
        publishStatus: Global('published'),// These are all published templates
        hasAdditionalGuidance: false,
        defaultExpanded: false,
        visibility: template?.visibility ? toSentenceCase(template.visibility) : '',
        bestPractices: template?.bestPractice || false,
      }))
    );

    const orgTemplates = transformedTemplates.filter((template: TemplateItemProps) => template?.bestPractices === false);
    const bestPracticeTemplates = transformedTemplates.filter((template: TemplateItemProps) => template?.bestPractices === true);

    // Remove duplicates between org and best practice sections
    const filteredBestPractice = bestPracticeTemplates.filter(
      (item: TemplateItemProps) => !orgTemplates.some((org: TemplateItemProps) => org.title === item.title)
    );

    return { orgTemplates, bestPracticeTemplates: filteredBestPractice };
  };

  // Process organization templates when orgTemplatesData changes
  useEffect(() => {
    const processOrgTemplates = async () => {
      if (orgTemplatesData?.publishedTemplates?.items) {
        const transformedTemplates = await transformTemplates(
          orgTemplatesData.publishedTemplates
        );
        // Filter to only org sections (non-best practice)
        const orgTemplates = transformedTemplates.orgTemplates;
        setOrgTemplates(orgTemplates);

        // Update org-specific pagination
        const totalCount = orgTemplatesData?.publishedTemplates?.totalCount ?? 0;
        const totalPages = Math.ceil(totalCount / LIMIT);
        setOrgPagination({
          currentPage: orgPagination.currentPage, // Keep current page
          totalPages,
          hasNextPage: orgTemplatesData?.publishedTemplates?.hasNextPage ?? false,
          hasPreviousPage: orgTemplatesData?.publishedTemplates?.hasPreviousPage ?? false
        });
      } else {
        setOrgTemplates([]);
      }
    };
    processOrgTemplates();
  }, [orgTemplatesData]);

  // Process best practice templates when bestPracticeData changes
  useEffect(() => {
    const processBestPracticeTemplates = async () => {
      if (bestPracticeData?.publishedTemplates?.items) {
        const transformedTemplates = await transformTemplates(bestPracticeData.publishedTemplates);

        // Filter to only best practice sections
        const bpTemplates = transformedTemplates.bestPracticeTemplates.filter(template => template?.bestPractices === true);
        setBestPracticeTemplates(bpTemplates);

        // Update best practice-specific pagination
        const totalCount = bestPracticeData?.publishedTemplates?.totalCount ?? 0;
        const totalPages = Math.ceil(totalCount / LIMIT);
        setBestPracticePagination({
          currentPage: bestPracticePagination.currentPage,
          totalPages,
          hasNextPage: bestPracticeData?.publishedTemplates?.hasNextPage ?? false,
          hasPreviousPage: bestPracticeData?.publishedTemplates?.hasPreviousPage ?? false
        });
      } else {
        setBestPracticeTemplates([]);
      }
    };
    processBestPracticeTemplates();
  }, [bestPracticeData]);

  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      resetSearch();
      setSearchButtonClicked(false);
    }
  }, [searchTerm])

  useEffect(() => {
    const load = async () => {
      await fetchTemplatesByType({ sectionType: 'org', page: 1 });
      await fetchTemplatesByType({ sectionType: 'bestPractice', page: 1 });
      setInitialLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <PageHeader
        title={SelectTemplate('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template/create?step=1">{Global('breadcrumbs.createTemplate')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.selectExistingTemplate')}</Breadcrumb>
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
            <ErrorMessages errors={errors} ref={errorRef} />
            <div className="searchSection" role="search" ref={topRef}>
              <SearchField aria-label="Template search">
                <Label>{Global('labels.searchByKeyword')}</Label>
                <Input
                  aria-describedby="search-help"
                  value={searchTerm}
                  onChange={e => handleInputChange(e.target.value)} />
                <Button
                  onPress={() => {
                    // Call your filtering function without changing the input value
                    handleSearchInput(searchTerm);
                  }}
                >
                  {Global('buttons.search')}
                </Button>
                <FieldError />
                <Text slot="description" className="help" id="search-help">
                  {Global('helpText.searchHelpText')}
                </Text>
              </SearchField>
            </div>


            {/*Organization Sections */}
            <div>
              {orgTemplates.length > 0 && (
                <h2 id="previously-created">
                  {SelectTemplate('headings.previouslyCreatedTemplates')}
                </h2>
              )}

              <div className="template-list" role="list" aria-label="Your templates">
                {orgLoading ? (
                  <p>{Global('messaging.loading')}</p>
                ) : orgTemplates.length > 0 ? (

                  <section className="mb-8" aria-labelledby="previously-created">
                    {
                      <TemplateList
                        templates={orgTemplates}
                        onSelect={onSelect}
                      />
                    }
                  </section>
                ) : (
                  <p>{Global('messaging.noItemsFound')}</p>
                )}
              </div>
              {orgTemplates.length > 0 && (
                <Pagination
                  currentPage={orgPagination.currentPage}
                  totalPages={orgPagination.totalPages}
                  hasPreviousPage={orgPagination.hasPreviousPage}
                  hasNextPage={orgPagination.hasNextPage}
                  handlePageClick={handleOrgPageClick}
                />
              )}
            </div>


            {/*Best Practice templates */}
            <div>
              {bestPracticeTemplates.length > 0 && (

                <h2 id="public-templates">
                  {SelectTemplate('headings.publicTemplates')}
                </h2>
              )}

              <div className="template-list" role="list" aria-label="Best practice templates">
                {bestPracticeLoading ? (
                  <p>{Global('messaging.loading')}</p>
                ) : bestPracticeTemplates.length > 0 ? (


                  <section className="mb-8" aria-labelledby="best-practice-templates">

                    {
                      <TemplateList
                        templates={bestPracticeTemplates}
                        onSelect={onSelect}
                      />
                    }

                  </section>
                ) : (
                  <p>{Global('messaging.noItemsFound')}</p>
                )}
              </div>
              {bestPracticeTemplates.length > 0 && (
                <Pagination
                  currentPage={bestPracticePagination.currentPage}
                  totalPages={bestPracticePagination.totalPages}
                  hasPreviousPage={bestPracticePagination.hasPreviousPage}
                  hasNextPage={bestPracticePagination.hasNextPage}
                  handlePageClick={handleBestPracticePageClick}
                />
              )}
            </div>

            <section className="mb-8" aria-labelledby="create-new">
              <h2 id="create-new">
                {SelectTemplate('headings.createNew')}
              </h2>
              <Button
                className="tertiary"
                onPress={handleStartNew}
                data-testid="startNewButton"
              >
                {SelectTemplate('buttons.startNew')}
              </Button>
            </section>

          </>
        </ContentContainer >
      </LayoutContainer >
    </>
  );
}

export default TemplateSelectTemplatePage;
