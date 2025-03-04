'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
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
import {
  CheckboxGroupComponent,
} from '@/components/Form';

//GraphQL
import {
  useMyVersionedTemplatesQuery,
  usePublishedTemplatesQuery
} from '@/generated/graphql';

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';

// Other
import { MyVersionedTemplatesInterface, TemplateItemProps } from '@/app/types';
import { useFormatDate } from '@/hooks/useFormatDate';


const PlanCreate: React.FC = () => {
  const formatDate = useFormatDate();
  //const router = useRouter();
  // Get projectId param
  const params = useParams();
  const { projectId } = params; // From route /projects/:projectId
  //For scrolling to the next section when user clicks "Load more"
  const nextSectionRef = useRef<HTMLDivElement>(null);
  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const { scrollToTop } = useScrollToTop();

  // State
  const [templates, setTemplates] = useState<TemplateItemProps[]>([]);
  const [publicTemplatesList, setPublicTemplatesList] = useState<TemplateItemProps[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateItemProps[] | null>([]);
  const [filteredPublicTemplates, setFilteredPublicTemplates] = useState<TemplateItemProps[] | null>([]);
  const [uniqueFunders, setUniqueFunders] = useState<string[]>([]);
  const [selectedFunders, setSelectedFunders] = useState<string[]>([]); // For checkbox selections
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

  const filterTemplates = (
    templates: TemplateItemProps[],
    term: string
  ): TemplateItemProps[] =>
    templates.filter(template =>
      [template.title, template.funder, template.description].some(field =>
        field?.toLowerCase().includes(term.toLowerCase())
      )
    );

  // const clearErrors = () => {
  //   setErrors([]);
  // }

  // Transform data into more easier to use properties
  const transformTemplates = async (templates: (MyVersionedTemplatesInterface | null)[]) => {
    const transformedTemplates = await Promise.all(
      templates.map(async (template: MyVersionedTemplatesInterface | null) => ({
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
        funder: template?.template?.owner?.displayName || "",
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

  const handleCheckboxChange = (value: string[]) => {
    setSelectedFunders(value);
    const filteredList = templates.filter(template =>
      template.funder && value.includes(template.funder)
    );
    setFilteredTemplates(filteredList);
    setFilteredPublicTemplates(null);
  };

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
    setSelectedFunders([]);
    scrollToTop(topRef);
  }

  /*When user selects a pre-existing template, we will create the new template using a copy
  of the pre-existing template*/
  const onSelect = async (versionedTemplateId: number) => {
    console.log(versionedTemplateId);
    //Save Plan using existing template
    try {
      //Call mutation
      // const response = await AddTemplateToPlan mutation

      // if (response?.data) {
      //   const responseData = response?.data?.addTemplate;
      //   //Set errors using the errors prop returned from the request
      //   if (responseData && responseData.errors) {
      //     // Extract error messages and convert them to an array of strings
      //     const errorMessages = Object.values(responseData.errors).filter((error) => error) as string[];
      //     setErrors(errorMessages);
      //   }
      //   clearErrors();

      //   // Get templateId of new template so we know where to redirect
      //   newTemplateId = response?.data?.addTemplate?.id;
      // }
      //router.push(`/projects/${projectId}/dmp/${versionedTemplateId}`);
    } catch (err) {
      // logECS('error', 'handleClick', {
      //   error: err,
      //   url: { path: '/template/create' }
      // });
    }
  }


  useEffect(() => {
    // Transform templates into format expected by TemplateListItem component
    const processTemplates = async () => {
      if (data && data?.myVersionedTemplates) {
        const transformedTemplates = await transformTemplates(data.myVersionedTemplates);
        setTemplates(transformedTemplates);
        const funders = Array.from(
          new Set(transformedTemplates
            .map(template => template.funder)
            .filter(funder => funder.length > 2)
          ));

        setUniqueFunders(funders);
      }
      if (publishedTemplatesData && publishedTemplatesData?.publishedTemplates) {
        const publicTemplates = await transformTemplates(publishedTemplatesData.publishedTemplates);
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
    if (queryError) {
      setErrors(prev => [...prev, queryError.message]);
    }
    if (publishedTemplatesError) {
      setErrors(prev => [...prev, publishedTemplatesError.message]);
    }
  }, [queryError, publishedTemplatesError]);

  if (loading || publishedTemplatesLoading) {
    return <div>{Global('messaging.loading')}...</div>;
  }


  return (
    <>
      <PageHeader
        title="Plan: Select a DMP template"
        description="Select a template to use when creating your DMP."
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/projects/${projectId}`}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb>Plan: Select a DMP template</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <></>
        }
        className="page-template-list"
      />
      <ErrorMessages errors={errors} ref={errorRef} />
      <LayoutContainer>
        <ContentContainer className={"layout-content-container-full"}>
          <div className="searchSection" role="search">
            <SearchField aria-label="Template search">
              <Label>Search by keyword</Label>
              <Text slot="description" className="help">
                Search by research organization, field station or lab, template
                description, etc.
              </Text>
              <Input
                aria-describedby="search-help"
                value={searchTerm}
                onChange={e => handleSearchInput(e.target.value)}
              />
              <Button
                onPress={() => {
                  // Call your filtering function without changing the input value
                  handleFiltering(searchTerm);
                }}
              >Search</Button>
              <FieldError />
            </SearchField>

            <CheckboxGroupComponent
              name="funders"
              value={selectedFunders}
              onChange={handleCheckboxChange}
              checkboxGroupLabel="Filter by funder"
              checkboxGroupDescription="Select if you want to only see templates by your funder."
              checkboxData={uniqueFunders.map(funder => ({
                label: funder,
                value: funder,
              }))}
            />
          </div>

          {/**List of templates under the user's funder/affiliation */}
          <section className="mb-8" aria-labelledby="previously-created">
            <h2 id="previously-created">
              {uniqueFunders.map((funder) => (
                <span key={funder}>
                  {funder}
                </span>
              ))}
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

          {/**List of public templates */}
          {(publicTemplatesList && publicTemplatesList.length > 0 && selectedFunders.length === 0) && (
            <section className="mb-8" aria-labelledby="public-templates">
              <h2 id="public-templates">
                Other public templates
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

        </ContentContainer>
      </LayoutContainer >


    </>
  );
}

export default PlanCreate;
