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
import {
  ContentContainer,
  LayoutContainer,
} from '@/components/Container';
import { filterTemplates } from '@/components/SelectExistingTemplate/utils';
import TemplateList from '@/components/TemplateList';

//GraphQL
import {
  useAddTemplateMutation,
  usePublicVersionedTemplatesQuery,
  useUserAffiliationTemplatesQuery
} from '@/generated/graphql';

// Other
import logECS from '@/utils/clientLogger';
import { UserAffiliationTemplatesInterface, TemplateItemProps } from '@/app/types';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useToast } from '@/context/ToastContext';


const TemplateSelectTemplatePage = ({ templateName }: { templateName: string }) => {
  const nextSectionRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const formatDate = useFormatDate();
  const router = useRouter();
  const toastState = useToast();

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
  const { data = {}, loading, error: queryError } = useUserAffiliationTemplatesQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
  });


  // Make graphql request for all public versionedTemplates
  const { data: publicTemplatesData, loading: publicTemplatesLoading, error: publicTemplatesError } = usePublicVersionedTemplatesQuery({
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
        if (responseData && responseData.errors && responseData.errors.length > 0) {
          // Use the nullish coalescing operator to ensure `setErrors` receives a `string[]`
          setErrors(responseData.errors ?? []);
        }
        clearErrors();

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

  const transformTemplates = async (templates: (UserAffiliationTemplatesInterface | null)[]) => {
    const transformedTemplates = await Promise.all(
      templates.map(async (template: UserAffiliationTemplatesInterface | null) => ({
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

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
      topRef.current.focus();
    }
  }

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

  const resetSearch = () => {
    setSearchTerm('');
    setFilteredTemplates(null);
    setFilteredPublicTemplates(null);
    scrollToTop();
  }

  useEffect(() => {
    // Transform templates into format expected by TemplateListItem component
    const processTemplates = async () => {
      if (data && data?.userAffiliationTemplates) {
        const transformedTemplates = await transformTemplates(data.userAffiliationTemplates);
        setTemplates(transformedTemplates);
      }
      if (publicTemplatesData && publicTemplatesData?.publicVersionedTemplates) {
        const transformedPublicTemplates = await transformTemplates(publicTemplatesData.publicVersionedTemplates);
        setPublicTemplatesList(transformedPublicTemplates);
      }
    }

    processTemplates();

  }, [data, publicTemplatesData]);

  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      resetSearch();
      setSearchButtonClicked(false);
    }
  }, [searchTerm])

  useEffect(() => {
    if (!templateName) {
      toastState.add(SelectTemplate('messages.missingTemplateName'), { type: 'error' })
      router.push('/template/create?step1');
    }
  }, [templateName])

  if (loading || publicTemplatesLoading) {
    return <div>Loading...</div>;
  }
  if (queryError || publicTemplatesError) {
    return <div>Error loading templates. Please try again later.</div>;
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
            {errors && errors.length > 0 &&
              <div className="error">
                {errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            }
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
