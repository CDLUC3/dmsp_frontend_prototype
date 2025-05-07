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
import { filterTemplates } from '@/utils/filterTemplates';
import TemplateList from '@/components/TemplateList';
import ErrorMessages from '@/components/ErrorMessages';

//GraphQL
import {
  useAddTemplateMutation,
  useMyVersionedTemplatesQuery,
  usePublishedTemplatesQuery
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
import {useFormatDate} from '@/hooks/useFormatDate';
import {useToast} from '@/context/ToastContext';


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
  const [templates, setTemplates] = useState<TemplateItemProps[]>([]);
  const [publicTemplatesList, setPublicTemplatesList] = useState<TemplateItemProps[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateItemProps[] | null>([]);
  const [filteredPublicTemplates, setFilteredPublicTemplates] = useState<TemplateItemProps[] | null>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchButtonClicked, setSearchButtonClicked] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState({
    publicTemplatesList: 3,
    templates: 3,
    filteredTemplates: 3,
    filteredPublicTemplates: 3,
  });

  //Localization keys
  const SelectTemplate = useTranslations('TemplateSelectTemplatePage');
  const Global = useTranslations('Global');

  // Make graphql request for versionedTemplates under the user's affiliation
  const { data = {}, loading, error: queryError } = useMyVersionedTemplatesQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
  });


  // Make graphql request for all public versionedTemplates
  const { data: publishedTemplatesData, loading: publishedTemplatesLoading, error: publishedTemplatesError } = usePublishedTemplatesQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
  });

  // GraphQL mutation for adding the new template
  const [addTemplateMutation] = useAddTemplateMutation({
    notifyOnNetworkStatusChange: true,
  });

  const clearErrors = () => {
    setErrors([]);
  }

  /*When user selects a pre-existing template, we will create the new template using a copy
  of the pre-existing template*/
  const onSelect = async (versionedTemplateId: number) => {
    let newTemplateId;
    //Add the new template
    try {
      const response = await addTemplateMutation({
        variables: {
          name: templateName,
          copyFromTemplateId: versionedTemplateId
        },
      });
      if (response?.data) {
        const responseData = response?.data?.addTemplate;
        //Set errors using the errors prop returned from the request
        if (responseData && responseData.errors) {
          // Extract error messages and convert them to an array of strings
          const errorMessages = Object.values(responseData.errors).filter((error) => error) as string[];
          setErrors(errorMessages);
        }
        clearErrors();

        // Get templateId of new template so we know where to redirect
        newTemplateId = response?.data?.addTemplate?.id;
      }
    } catch (err) {
      logECS('error', 'handleClick', {
        error: err,
        url: { path: '/template/create' }
      });
    }

    // Redirect to the newly created template
    if (newTemplateId) {
      router.push(`/template/${newTemplateId}`)
    }
  }

  // Transform data into more easier to use properties
  const transformTemplates = async (
    templates: PaginatedMyVersionedTemplatesInterface | PaginatedVersionedTemplateSearchResultsInterface | null
  ) => {
    const items = templates?.items || [];
    const transformedTemplates = await Promise.all(
      items.map(async (template: MyVersionedTemplatesInterface | null) => ({
        id: template?.id,
        template: {
          id: template?.template?.id ? template?.template.id : null
        },
        title: template?.name || "",
        description: template?.description || "",
        link: `/template/${template?.template?.id ? template?.template.id : ''}`,
        content: template?.description || template?.modified ? (
          <div>
            <p>{template?.description}</p>
            <p>
              {Global('lastUpdated')}: {template?.modified ? formatDate(template?.modified) : null}
            </p>
          </div>
        ) : null, // Set to null if no description or last modified data
        funder: template?.template?.owner?.name || template?.name,
        lastUpdated: template?.modified ? formatDate(template?.modified) : null,
        lastRevisedBy: template?.modifiedById || null,
        publishStatus: template?.versionType,
        hasAdditionalGuidance: false,
        defaultExpanded: false,
        visibility: template?.visibility,
      }))
    );
    return transformedTemplates;
  };

  type VisibleCountKeys = keyof typeof visibleCount;

  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  // Filter results when a user enters a search term and clicks "Search" button
  const handleFiltering = (term: string) => {
    setErrors([]);
    setSearchButtonClicked(true);
    // Search title, funder and description fields for terms
    const filteredList = filterTemplates(templates, term);
    const filteredPublicTemplatesList = filterTemplates(publicTemplatesList, term);

    if (filteredList.length || filteredPublicTemplatesList.length) {
      setSearchTerm(term);
      setFilteredTemplates(filteredList.length > 0 ? filteredList : null);
      setFilteredPublicTemplates(filteredPublicTemplatesList.length > 0 ? filteredPublicTemplatesList : null);
    } else {
      //If there are no matching results, then display an error
      setErrors(prev => [...prev, SelectTemplate('messages.noItemsFound')]);
    }
  }

  // When user clicks the 'Load more' button, display 3 more by default
  const handleLoadMore = (listKey: VisibleCountKeys) => {
    setVisibleCount((prevCounts) => ({
      ...prevCounts,
      [listKey]: prevCounts[listKey] + 3, // Increase the visible count for the specific list
    }));

    setTimeout(() => {
      if (nextSectionRef.current) {
        nextSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  // zero out search and filters
  const resetSearch = () => {
    setSearchTerm('');
    setFilteredTemplates(null);
    setFilteredPublicTemplates(null);
    scrollToTop(topRef);
  }

  useEffect(() => {
    // Transform templates into format expected by TemplateListItem component
    const processTemplates = async () => {
      if (data && data?.myVersionedTemplates) {
        const templates = { items: data?.myVersionedTemplates ?? [] };
        const transformedTemplates = await transformTemplates(templates as PaginatedMyVersionedTemplatesInterface);
        setTemplates(transformedTemplates);
      }
      if (publishedTemplatesData && publishedTemplatesData?.publishedTemplates) {
        const templates = publishedTemplatesData?.publishedTemplates ?? { items: [] };
        const publicTemplates = await transformTemplates(templates as PaginatedVersionedTemplateSearchResultsInterface);
        const transformedPublicTemplates = publicTemplates.filter(template => template.visibility === 'PUBLIC');
        setPublicTemplatesList(transformedPublicTemplates);
      }
    }

    processTemplates();

  }, [data, publishedTemplatesData]);

  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      resetSearch();
      setSearchButtonClicked(false);
    }
  }, [searchTerm])

  useEffect(() => {
    // If the template name entered on step 1 is missing from the page, we redirect back to step 1 with a toast message
    if (!templateName) {
      toastState.add(SelectTemplate('messages.missingTemplateName'), { type: 'error' })
      router.push('/template/create?step1');
    }
  }, [templateName])

  if (loading || publishedTemplatesLoading) {
    return <div>{Global('messaging.loading')}...</div>;
  }
  if (queryError || publishedTemplatesError) {
    return <div>{SelectTemplate('messages.loadingError')}</div>;
  }

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

            <div className="Filters" role="search" ref={topRef}>
              <SearchField aria-label="Template search">
                <Label>{Global('labels.searchByKeyword')}</Label>
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
                  {Global('buttons.search')}
                </Button>
                <FieldError />
                <Text slot="description" className="help" id="search-help">
                  {Global('helpText.searchHelpText')}
                </Text>
              </SearchField>
            </div>

            <section className="mb-8" aria-labelledby="previously-created">
              <h2 id="previously-created">
                {SelectTemplate('headings.previouslyCreatedTemplates')}
              </h2>
              <div className="template-list" role="list" aria-label="Your templates">
                {(filteredTemplates && filteredTemplates.length > 0) ? (
                  <>
                    {
                      <TemplateList
                        templates={filteredTemplates}
                        visibleCountKey='filteredTemplates'
                        onSelect={onSelect}
                        visibleCount={visibleCount}
                        handleLoadMore={handleLoadMore}
                        resetSearch={resetSearch}
                      />
                    }

                  </>) : (
                  <>
                    {/**If the user is searching, and there were no results from the search
                   * then display the message 'no results found
                   */}
                    {(searchTerm.length > 0 && searchButtonClicked) ? (
                      <>
                        {SelectTemplate('messages.noItemsFound')}
                      </>
                    ) : (
                      <TemplateList
                        templates={templates}
                        visibleCountKey='templates'
                        onSelect={onSelect}
                        visibleCount={visibleCount}
                        handleLoadMore={handleLoadMore}
                        resetSearch={resetSearch}
                      />
                    )

                    }
                  </>
                )
                }
              </div>
            </section>

            {(publicTemplatesList && publicTemplatesList.length > 0) && (
              <section className="mb-8" aria-labelledby="public-templates">
                <h2 id="public-templates">
                  {SelectTemplate('headings.publicTemplates')}
                </h2>
                <div className="template-list" role="list" aria-label="Public templates">
                  {filteredPublicTemplates && filteredPublicTemplates.length > 0 ? (
                    <>
                      {
                        <TemplateList
                          templates={filteredPublicTemplates}
                          visibleCountKey='filteredPublicTemplates'
                          onSelect={onSelect}
                          visibleCount={visibleCount}
                          handleLoadMore={handleLoadMore}
                          resetSearch={resetSearch}
                        />
                      }
                    </>
                  ) : (
                    <>
                      {/**If the user is searching, and there were no results from the search
                   * then display the message 'no results found
                   */}
                      {(searchTerm.length > 0 && searchButtonClicked) ? (
                        <>
                          {SelectTemplate('messages.noItemsFound')}
                        </>
                      ) : (
                        <TemplateList
                          templates={publicTemplatesList}
                          visibleCountKey='publicTemplatesList'
                          onSelect={onSelect}
                          visibleCount={visibleCount}
                          handleLoadMore={handleLoadMore}
                          resetSearch={resetSearch}
                        />
                      )
                      }
                    </>
                  )
                  }

                </div>
              </section>
            )}

          </>
        </ContentContainer>
      </LayoutContainer >
    </>
  );
}

export default TemplateSelectTemplatePage;
