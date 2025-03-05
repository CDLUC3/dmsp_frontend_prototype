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
import TemplateSelectListItem from "@/components/TemplateSelectListItem";
import ErrorMessages from '@/components/ErrorMessages';
import {
  CheckboxGroupComponent,
} from '@/components/Form';

//GraphQL
import {
  usePublishedTemplatesQuery,
  useProjectFundersQuery,
} from '@/generated/graphql';

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';

// Other
import { TemplateItemProps } from '@/app/types';
import { useFormatDate } from '@/hooks/useFormatDate';


interface ProjectFundersInterface {
  name: string
  uri: string;
}

interface BestPracticeTemplatesInterface {
  bestPractice: boolean;
  name: string;
  uri: string;
}

export interface PublicTemplatesInterface {
  bestPractice?: boolean | null;
  id?: number | null;
  name: string;
  description?: string | null;
  modified?: string | null;
  modifiedById?: number | null;
  visibility: string;
  owner?: {
    displayName?: string; // Make displayName optional
    name?: string; // Make name optional
    searchName?: string; // Make searchName optional
    uri?: string | null;
  } | null;
}
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
  const [projectFunderTemplates, setProjectFunderTemplates] = useState<TemplateItemProps[]>([]);
  const [publicTemplatesList, setPublicTemplatesList] = useState<TemplateItemProps[]>([]);
  const [filteredPublicTemplates, setFilteredPublicTemplates] = useState<TemplateItemProps[] | null>([]);
  const [funders, setFunders] = useState<ProjectFundersInterface[]>([]);
  const [bestPracticeTemplates, setBestPracticeTemplates] = useState<TemplateItemProps[]>([]);
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

  // Get all the funders for the project
  const { data: projectFunders, loading: projectFundersLoading, error: projectFundersError } = useProjectFundersQuery({
    variables: {
      projectId: Number(projectId)
    }
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
  const transformTemplates = async (templates: (PublicTemplatesInterface | null)[]) => {
    const transformedTemplates = await Promise.all(
      templates.map(async (template: PublicTemplatesInterface | null) => ({
        id: template?.id,
        title: template?.name || "",
        description: template?.description || "",
        link: `/template/${template?.id ? template.id : ''}`,
        content: template?.description || template?.modified ? (
          <div>
            <p>{template?.description}</p>
            <p>
              {Global('lastUpdated')}: {template?.modified ? formatDate(template?.modified) : null}
            </p>
          </div>
        ) : null, // Set to null if no description or last modified data
        funder: template?.owner?.displayName || "",
        funderUri: template?.owner?.uri || "",
        lastUpdated: template?.modified ? formatDate(template?.modified) : null,
        lastRevisedBy: template?.modifiedById || null,
        hasAdditionalGuidance: false,
        defaultExpanded: false,
        visibility: template?.visibility,
        bestPractices: template?.bestPractice || false,
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
    console.log("***VALUE", value);
    let filteredList;
    if (value.length > 0) {
      setSelectedFunders(value);
      if (funders.length > 0) {
        // Filter just the project funder templates when checkbox is checked
        filteredList = projectFunderTemplates.filter(template =>
          template.funder && value.includes(template.funder)
        );
        setFilteredPublicTemplates(filteredList);
      } else {
        // Filter just the project funder templates when checkbox is checked
        filteredList = bestPracticeTemplates.filter(template => template.bestPractices);
        setFilteredPublicTemplates(filteredList);
      }

    } else {
      setSelectedFunders([])
      setFilteredPublicTemplates(null);
    }
  };

  // Filter results when a user enters a search term and clicks "Search" button
  const handleFiltering = (term: string) => {
    setErrors([]);
    setSearchButtonClicked(true);
    // Search title, funder and description fields for terms
    // const filteredList = filterTemplates(projectFunderTemplates, term);
    const filteredPublicTemplatesList = filterTemplates(publicTemplatesList, term);

    if (filteredPublicTemplatesList.length) {
      setSearchTerm(term);
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

  const sortTemplatesByProjectFunders = (templates: TemplateItemProps[]) => {
    let sortedTemplates: TemplateItemProps[] = [];
    // If there are no funders, then sort template by bestPractice instead of funder
    if (funders.length === 0) {
      sortedTemplates = templates.sort((a, b) => {
        return a.bestPractices === b.bestPractices ? 0 : a.bestPractices ? -1 : 1;
      });
    } else {
      sortedTemplates = templates.sort((a, b) => {
        const aIsFunderTemplate = funders.some(funder => funder.name === a?.funder);
        const bIsFunderTemplate = funders.some(funder => funder.name === b?.funder);
        return aIsFunderTemplate === bIsFunderTemplate ? 0 : aIsFunderTemplate ? -1 : 1;
      });
    }
    return sortedTemplates;
  }

  // zero out search and filters
  const resetSearch = () => {
    setSearchTerm('');
    setFilteredPublicTemplates(null);
    setSelectedFunders([]);
    scrollToTop(topRef);
  }

  /*When user selects a pre-existing template, we will create the new template using a copy
  of the pre-existing template*/
  const onSelect = async (versionedTemplateId: number) => {
    console.log(versionedTemplateId);

  }

  useEffect(() => {
    // Transform templates into format expected by TemplateListItem component
    const processTemplates = async () => {
      if (publishedTemplatesData && publishedTemplatesData?.publishedTemplates) {
        const publicTemplates = await transformTemplates(publishedTemplatesData.publishedTemplates);
        const transformedPublicTemplates = publicTemplates.filter(template => template.visibility === 'PUBLIC');
        // Sort the templates so that project funder templates come first
        const sortedPublicTemplates = sortTemplatesByProjectFunders(transformedPublicTemplates);
        console.log("***SORTED PUBLIC TEMPLATES***", sortedPublicTemplates);
        setPublicTemplatesList(sortedPublicTemplates);
      }

      // Transform project funders and save in funders state
      if (projectFunders && projectFunders?.projectFunders) {
        const funders = projectFunders.projectFunders
          .map(funder => {
            return {
              name: funder?.affiliation?.displayName ?? null,
              uri: funder?.affiliation?.uri ?? null
            }
          })
          .filter((funder): funder is { name: string; uri: string } => funder.name !== null); // Filter out null values and ensure type
        if (funders) {
          setFunders(funders);
        }
      }

      // Find all templates that contain the project funders and set in projectFunderTemplates state
      const matchingTemplates = publishedTemplatesData?.publishedTemplates?.filter(template =>
        funders.some(funder => funder.uri === template?.owner?.uri)
      );
      if (matchingTemplates) {
        const transformedProjectFunderTemplates = await transformTemplates(matchingTemplates);
        setProjectFunderTemplates(transformedProjectFunderTemplates);
      }
    }
    processTemplates();
  }, [publishedTemplatesData, projectFunders]);

  useEffect(() => {
    /* Set selectedFunders on initial load since we want all project funder checkboxes to be checked */
    const funderNames = funders.map(funder => funder.name);
    handleCheckboxChange(funderNames);
  }, [funders])

  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      resetSearch();
      setSearchButtonClicked(false);
    }
  }, [searchTerm])

  //Query errors
  useEffect(() => {
    if (publishedTemplatesError) {
      setErrors(prev => [...prev, publishedTemplatesError.message]);
    }
    if (projectFundersError) {
      setErrors(prev => [...prev, projectFundersError.message]);
    }
  }, [publishedTemplatesError, projectFundersError]);


  useEffect(() => {
    if (funders.length === 0) {
      const bestPracticeTemplates = publicTemplatesList
        .filter(template => template.bestPractices)
      // .map(template => ({
      //   bestPractice: template.bestPractices ?? false,
      //   name: template.title,
      //   uri: template.funderUri ?? ''
      // }));

      setBestPracticeTemplates(bestPracticeTemplates);

    }
  }, [publicTemplatesList])

  useEffect(() => {
    /* Set best practice as checkboxes and have them be checked */
    const bestPracticeArray = bestPracticeTemplates.map(bp => bp.title);
    handleCheckboxChange(bestPracticeArray);
  }, [bestPracticeTemplates])

  if (publishedTemplatesLoading || projectFundersLoading) {
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

            {funders.length > 0 ? (
              <CheckboxGroupComponent
                name="funders"
                value={selectedFunders}
                onChange={handleCheckboxChange}
                checkboxGroupLabel="Filter by funder"
                checkboxGroupDescription="Select if you want to only see templates by your funder."
                checkboxData={funders.map(funder => ({
                  label: funder.name,
                  value: funder.name,
                }))}
              />
            ) : (

              <CheckboxGroupComponent
                name="bestPractices"
                value={['bestpractice']}
                onChange={handleCheckboxChange}
                checkboxGroupLabel="Filter by best practice"
                checkboxGroupDescription="Select if you want to only see best practice templates"
                checkboxData={bestPracticeTemplates.map(bp => ({
                  label: "DMP best practice",
                  value: "bestpractice"
                }))}
              />

            )}

          </div>

          {/**List of public templates */}
          {(publicTemplatesList && publicTemplatesList.length > 0) && (
            <section className="mb-8" aria-labelledby="public-templates">
              <div className="template-list" role="list" aria-label="Public templates">
                {/**if user is searching on a specific term */}
                {filteredPublicTemplates && filteredPublicTemplates.length > 0 ? (
                  <>
                    {selectedFunders.length > 0 ? (
                      filteredPublicTemplates.map((template, index) => {
                        return (
                          <div key={index}>
                            <TemplateSelectListItem
                              item={template}
                              onSelect={onSelect}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <TemplateList
                        templates={filteredPublicTemplates}
                        visibleCountKey='filteredPublicTemplates'
                        onSelect={onSelect}
                        visibleCount={visibleCount}
                        handleLoadMore={handleLoadMore}
                        resetSearch={resetSearch}
                      />
                    )

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
          )}

        </ContentContainer>
      </LayoutContainer >


    </>
  );
}

export default PlanCreate;
