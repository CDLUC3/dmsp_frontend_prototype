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
  TemplateSearchResult,
  useAddTemplateMutation,
  useTemplatesLazyQuery,
  usePublishedTemplatesLazyQuery,
  VersionedTemplateSearchResult,
} from '@/generated/graphql';

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';
// Other
import logECS from '@/utils/clientLogger';
import {
  TemplateItemProps,
  TemplateSearchResultInterface,
  PaginatedTemplateSearchResultsInterface,
} from '@/app/types';
import { toSentenceCase } from '@/utils/general';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useToast } from '@/context/ToastContext';

// # of templates displayed
const LIMIT = 5;

type TemplateType = 'published' | 'myTemplates';

interface FetchTemplateByTypeParams {
  templateType: TemplateType;
  page?: number;
  searchTerm?: string;
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

  const [publishedTemplates, setPublishedTemplates] = useState<TemplateItemProps[]>([]);
  const [myTemplates, setMyTemplates] = useState<TemplateItemProps[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);


  // Separate pagination states
  const [publishedPagination, setPublishedPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const [myTemplatesPagination, setMyTemplatesPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });


  //Localization keys
  const SelectTemplate = useTranslations('TemplateSelectTemplatePage');
  const Global = useTranslations('Global');

  // Separate lazy queries for published sections
  const [fetchPublishedTemplates, { data: publishedTemplatesData, loading: orgLoading }] = usePublishedTemplatesLazyQuery();
  const [fetchMyTemplates, { data: myTemplatesData, loading: myTemplatesLoading }] = useTemplatesLazyQuery();

  // GraphQL mutation for adding the new template
  const [addTemplateMutation] = useAddTemplateMutation({
    notifyOnNetworkStatusChange: true,
  });

  const clearErrors = () => {
    setErrors([]);
  }

  const fetchTemplatesByType = async ({
    templateType,
    page = 1,
    searchTerm = ''
  }: FetchTemplateByTypeParams) => {
    if (templateType === 'published') {
      let offsetLimit = 0;
      if (page) {
        setPublishedPagination(prev => ({ ...prev, currentPage: page }));
        offsetLimit = (page - 1) * LIMIT;
      }
      await fetchPublishedTemplates({
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
        setMyTemplatesPagination(prev => ({ ...prev, currentPage: page }));
        offsetLimit = (page - 1) * LIMIT;
      }
      await fetchMyTemplates({
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

  // Handle page click for published sections
  const handlePublicPageClick = async (page: number) => {
    await fetchTemplatesByType({ templateType: 'published', page, searchTerm });
  };
  // Handle page click for my templates sections
  const handleMyTemplatesPageClick = async (page: number) => {
    await fetchTemplatesByType({ templateType: 'myTemplates', page, searchTerm });
  };

  // zero out search and filters
  const resetSearch = () => {
    setSearchTerm('');
    handleSearchInput('');
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
    setPublishedPagination(prev => ({ ...prev, currentPage: 1 }));
    setMyTemplatesPagination(prev => ({ ...prev, currentPage: 1 }));

    // Fetch both types with search term
    await Promise.all([
      fetchTemplatesByType({ templateType: 'published', page: 1, searchTerm: term }),
      fetchTemplatesByType({ templateType: 'myTemplates', page: 1, searchTerm: term })
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

  // Transform published templates into easier to use properties
  const transformPublishedTemplates = async (
    templates: PublishedTemplateSearchResults | null
  ): Promise<{ publishedTemplates: TemplateItemProps[] }> => {

    const publishedTemplates = templates?.items?.filter(template => template !== null && template !== undefined) || [];

    if (publishedTemplates.length === 0) {
      return { publishedTemplates: [] };
    }
    const transformedTemplates = await Promise.all(
      publishedTemplates.map(async (template: VersionedTemplateSearchResult | null) => ({
        id: template?.id,
        template: {
          id: template?.id ? template?.id : null
        },
        title: template?.name || "",
        description: template?.description || "",
        link: `/template/${template?.id ? template?.id : ''}`,
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
        visibility: template?.visibility ? toSentenceCase(template.visibility) : 'Private',
      }))
    );

    return { publishedTemplates: transformedTemplates };
  };

  // Transform myTemplates into easier to use properties
  const transformMyTemplates = async (
    templates: PaginatedTemplateSearchResultsInterface | null
  ): Promise<{ myTemplates: TemplateItemProps[] }> => {

    const myTemplates = templates?.items?.filter(template => template !== null && template !== undefined) || [];

    if (myTemplates.length === 0) {
      return { myTemplates: [] };
    }
    const transformedTemplates = await Promise.all(
      myTemplates.map(async (template: TemplateSearchResultInterface | null) => ({
        id: template?.id,
        template: {
          id: template?.id ? template?.id : null
        },
        title: template?.name || "",
        description: template?.description || "",
        link: `/template/${template?.id ? template?.id : ''}`,
        funder: template?.ownerDisplayName || template?.name,
        lastUpdated: template?.modified ? formatDate(template?.modified) : null,
        lastRevisedBy: template?.modifiedByName || null,
        publishStatus: Global('published'),// These are all published templates
        hasAdditionalGuidance: false,
        defaultExpanded: false,
        visibility: template?.latestPublishVisibility ? toSentenceCase(template.latestPublishVisibility) : 'Private',
      }))
    );

    return { myTemplates: transformedTemplates };
  };

  // Process published templates when publishedTemplatesData changes
  useEffect(() => {
    const processPublishedTemplates = async () => {
      if (publishedTemplatesData?.publishedTemplates?.items) {
        const transformedTemplates = await transformPublishedTemplates(
          publishedTemplatesData.publishedTemplates
        );
        // Filter to only org sections (non-best practice)
        const publishedTemplates = transformedTemplates.publishedTemplates;

        console.log("*Published templates", publishedTemplates);
        setPublishedTemplates(publishedTemplates);

        // Update published template pagination
        const totalCount = publishedTemplatesData?.publishedTemplates?.totalCount ?? 0;
        const totalPages = Math.ceil(totalCount / LIMIT);
        setPublishedPagination({
          currentPage: publishedPagination.currentPage, // Keep current page
          totalPages,
          hasNextPage: publishedTemplatesData?.publishedTemplates?.hasNextPage ?? false,
          hasPreviousPage: publishedTemplatesData?.publishedTemplates?.hasPreviousPage ?? false
        });
      } else {
        setPublishedTemplates([]);
      }
    };
    processPublishedTemplates();
  }, [publishedTemplatesData]);

  // Process myTemplates when myTemplatesData changes
  useEffect(() => {
    const processMyTemplates = async () => {
      const safeMyTemplates = {
        ...myTemplatesData?.myTemplates,
        items: (myTemplatesData?.myTemplates?.items ?? []).filter((t): t is TemplateSearchResult => t !== null && t !== undefined),
      };

      if (myTemplatesData?.myTemplates?.items) {
        const transformedTemplates = await transformMyTemplates(safeMyTemplates);
        setMyTemplates(transformedTemplates.myTemplates);

        // Update best practice-specific pagination
        const totalCount = myTemplatesData?.myTemplates?.totalCount ?? 0;
        const totalPages = Math.ceil(totalCount / LIMIT);
        setMyTemplatesPagination({
          currentPage: myTemplatesPagination.currentPage,
          totalPages,
          hasNextPage: myTemplatesData?.myTemplates?.hasNextPage ?? false,
          hasPreviousPage: myTemplatesData?.myTemplates?.hasPreviousPage ?? false
        });
      } else {
        setMyTemplates([]);
      }
    };
    processMyTemplates();
  }, [myTemplatesData]);

  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      resetSearch();
      setSearchButtonClicked(false);
    }
  }, [searchTerm])

  useEffect(() => {
    const load = async () => {
      await fetchTemplatesByType({ templateType: 'published', page: 1 });
      await fetchTemplatesByType({ templateType: 'myTemplates', page: 1 });
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


            {/*My Previously Created Templates */}
            <div>
              {myTemplates.length > 0 && (
                <h2 id="previously-created">
                  {SelectTemplate('headings.previouslyCreatedTemplates')}
                </h2>
              )}

              <div className="template-list" role="list" aria-label="My previously created templates">
                {myTemplatesLoading ? (
                  <p>{Global('messaging.loading')}</p>
                ) : myTemplates.length > 0 ? (


                  <section className="mb-8" aria-labelledby="my-templates">

                    {
                      <TemplateList
                        templates={myTemplates}
                        onSelect={onSelect}
                      />
                    }

                  </section>
                ) : (
                  <p>{Global('messaging.noItemsFound')}</p>
                )}
              </div>
              {myTemplates.length > 0 && (
                <Pagination
                  currentPage={myTemplatesPagination.currentPage}
                  totalPages={myTemplatesPagination.totalPages}
                  hasPreviousPage={myTemplatesPagination.hasPreviousPage}
                  hasNextPage={myTemplatesPagination.hasNextPage}
                  handlePageClick={handleMyTemplatesPageClick}
                />
              )}
            </div>

            {/*Published Templates */}
            <div>
              {publishedTemplates.length > 0 && (
                <h2 id="published-templates">
                  {SelectTemplate('headings.publicTemplates')}
                </h2>
              )}

              <div className="template-list" role="list" aria-label="Your templates">
                {orgLoading ? (
                  <p>{Global('messaging.loading')}</p>
                ) : publishedTemplates.length > 0 ? (

                  <section className="mb-8" aria-labelledby="previously-created">
                    {
                      <TemplateList
                        templates={publishedTemplates}
                        onSelect={onSelect}
                      />
                    }
                  </section>
                ) : (
                  <p>{Global('messaging.noItemsFound')}</p>
                )}
              </div>
              {publishedTemplates.length > 0 && (
                <Pagination
                  currentPage={publishedPagination.currentPage}
                  totalPages={publishedPagination.totalPages}
                  hasPreviousPage={publishedPagination.hasPreviousPage}
                  hasNextPage={publishedPagination.hasNextPage}
                  handlePageClick={handlePublicPageClick}
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
